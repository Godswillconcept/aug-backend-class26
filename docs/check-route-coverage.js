/**
 * Route coverage check.
 * Parses the Express route definitions in ../routes and verifies that every
 * registered route appears exactly once in the generated Postman collection.
 *
 * Usage:
 *   node docs/check-route-coverage.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ROUTES_DIR = path.join(ROOT, "routes");
const COLLECTION = path.join(__dirname, "postman-collection.json");

/** Mount prefix for each router, taken from app.js. */
const MOUNT = {
  "auth.route.js": "/api/auth",
  "user.route.js": "/api/users",
  "course.route.js": "/api/courses",
  "program.route.js": "/api/programs",
  "student.route.js": "/api/students",
  "instructor.route.js": "/api/instructors",
  "payment.route.js": "/api/payments",
  "enrolment.route.js": "/api/enrolments",
};

/**
 * Parse a route file.
 *
 * Returns one entry per registered route with the auth middleware that
 * applies to it. Two sources of auth are detected:
 *
 *   1. `authenticate` passed directly to the route handler
 *      e.g. `router.get("/:id", authenticate, controller.x)`
 *   2. `router.use(authenticate, ...)` - applies to every route registered
 *      *after* that line in the same file.
 *
 * `authorize(...)` is recorded separately because it does not imply that the
 * route is public; it only constrains the role.
 */
function parseRoutes(file) {
  const src = fs.readFileSync(path.join(ROUTES_DIR, file), "utf8");
  const prefix = MOUNT[file];
  const out = [];

  // Find every `router.<verb>(` / `router.use(` call and capture its full
  // argument list by matching balanced parentheses.
  const callRe = /router\.(get|post|put|delete|patch|use)\s*\(/g;
  let m = callRe.exec(src);
  while (m !== null) {
    const verb = m[1];
    const openIdx = m.index + m[0].length - 1;
    let depth = 0;
    let end = openIdx;
    for (; end < src.length; end++) {
      if (src[end] === "(") depth++;
      else if (src[end] === ")") {
        depth--;
        if (depth === 0) break;
      }
    }
    const args = src.slice(openIdx + 1, end);

    if (verb === "use") {
      // A `router.use(authenticate, ...)` guard applies to later routes.
      if (/\bauthenticate\b/.test(args)) {
        out.usesAuth = true;
      }
    } else {
      const pathMatch = args.match(/^\s*"([^"]*)"/);
      const sub = pathMatch && pathMatch[1] !== "/" ? pathMatch[1] : "";
      out.push({
        method: verb.toUpperCase(),
        path: `${prefix}${sub}`,
        file,
        authenticated:
          out.usesAuth === true || /\bauthenticate\b/.test(args),
        roles: (args.match(/authorize\s*\(([^)]*)\)/) || [, ""])[1]
          .split(",")
          .map((r) => r.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean),
      });
    }
    m = callRe.exec(src);
  }
  return out;
}

/** Normalise a collection path (`/api/users/:id`) for comparison. */
function normalise(p) {
  return p.replace(/\/+$/, "") || "/";
}

function collectCollectionPaths(collection) {
  const rows = [];
  const walk = (items, folder) => {
    for (const item of items || []) {
      if (item.item) {
        walk(item.item, item.name);
      } else {
        const raw = (item.request.url.raw || "")
          .replace("{{baseUrl}}", "")
          .split("?")[0];
        rows.push({
          method: item.request.method,
          path: normalise(raw),
          name: item.name,
          folder,
          auth:
            item.request.auth && item.request.auth.type === "noauth"
              ? "noauth"
              : "inherit",
        });
      }
    }
  };
  walk(collection.item, "");
  return rows;
}

/** Find a request item by name anywhere in the collection. */
function findItem(items, name) {
  for (const item of items || []) {
    if (item.item) {
      const found = findItem(item.item, name);
      if (found) return found;
    } else if (item.name === name) {
      return item;
    }
  }
  return null;
}

function main() {
  const collection = JSON.parse(fs.readFileSync(COLLECTION, "utf8"));
  const collectionRows = collectCollectionPaths(collection);

  const sourceRoutes = [];
  for (const file of Object.keys(MOUNT)) {
    sourceRoutes.push(...parseRoutes(file));
  }

  const problems = [];

  // 1. Every source route is documented exactly once.
  for (const route of sourceRoutes) {
    const matches = collectionRows.filter(
      (r) => r.method === route.method && r.path === normalise(route.path),
    );
    if (matches.length === 0) {
      problems.push(
        `MISSING  ${route.method} ${route.path}  (${route.file})`,
      );
    } else if (matches.length > 1) {
      problems.push(
        `DUPLICATE ${route.method} ${route.path} -> ` +
          matches.map((m) => `${m.folder}/${m.name}`).join(", "),
      );
    }
  }

  // 2. No documented route that does not exist in the source.
  for (const row of collectionRows) {
    const exists = sourceRoutes.some(
      (r) => r.method === row.method && r.path === row.path,
    );
    if (!exists) {
      problems.push(`EXTRA    ${row.method} ${row.path}  (${row.folder}/${row.name})`);
    }
  }

  // 3. The `noauth` marking must match the middleware actually registered.
  //    A route that has no `authenticate` guard must be `noauth`, and a
  //    route that does have one must not be.
  for (const route of sourceRoutes) {
    const match = collectionRows.find(
      (r) => r.method === route.method && r.path === normalise(route.path),
    );
    if (!match) continue;
    const isPublic = match.auth === "noauth";
    if (route.authenticated && isPublic) {
      problems.push(
        `AUTH     ${route.method} ${route.path} is marked noauth but the route ` +
          `runs \`authenticate\``,
      );
    }
    if (!route.authenticated && !isPublic) {
      problems.push(
        `AUTH     ${route.method} ${route.path} is not marked noauth but the ` +
          `route has no \`authenticate\` guard (it is public)`,
      );
    }
  }

  // 4. Collection sanity checks.
  if (!collection.info || !collection.info.name) {
    problems.push("Collection is missing info.name");
  }
  if (!collection.auth || collection.auth.type !== "bearer") {
    problems.push("Collection is missing the collection-level bearer auth");
  }
  const varKeys = (collection.variable || []).map((v) => v.key);
  for (const key of ["baseUrl", "token"]) {
    if (!varKeys.includes(key)) {
      problems.push(`Collection is missing the \`${key}\` variable`);
    }
  }

  // 5. Every item must have a description, a body and saved responses.
  for (const row of collectionRows) {
    const item = findItem(collection.item, row.name);
    if (!item) continue;
    if (!item.request.description || !item.request.description.trim()) {
      problems.push(`DESC     ${row.method} ${row.path} has no description`);
    }
    if (!Array.isArray(item.response) || item.response.length === 0) {
      problems.push(`RESP     ${row.method} ${row.path} has no saved responses`);
    }
  }

  console.log(`Source routes : ${sourceRoutes.length}`);
  console.log(`Documented    : ${collectionRows.length}`);
  console.log(
    `Public (noauth): ${collectionRows.filter((r) => r.auth === "noauth").length}`,
  );
  console.log("");

  if (problems.length) {
    console.log("PROBLEMS:");
    for (const p of problems) console.log(`  - ${p}`);
    process.exitCode = 1;
  } else {
    console.log("OK - every source route is documented exactly once.");
  }
}

if (require.main === module) {
  main();
}

module.exports = { parseRoutes, collectCollectionPaths, MOUNT };
