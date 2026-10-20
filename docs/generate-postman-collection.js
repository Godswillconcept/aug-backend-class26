/**
 * Alusoft Training API - Postman Collection Generator
 * --------------------------------------------------
 * Assembles the declarative endpoint descriptions in ./postman/endpoints into:
 *
 *   1. docs/postman-collection.json  - a Postman Collection v2.1 file
 *   2. docs/API-REFERENCE.md          - a Markdown API reference
 *
 * Usage:
 *   node docs/generate-postman-collection.js
 *
 * The generator is deterministic - running it twice produces identical output.
 */

const fs = require("fs");
const path = require("path");

const { mkFolder, STATUS_TEXT } = require("./postman/builder");

const DOCS_DIR = __dirname;
const ENDPOINTS_DIR = path.join(DOCS_DIR, "postman", "endpoints");
const COLLECTION_OUT = path.join(DOCS_DIR, "postman-collection.json");
const MARKDOWN_OUT = path.join(DOCS_DIR, "API-REFERENCE.md");

/* ------------------------------------------------------------------ *
 * Folder layout of the generated collection
 * ------------------------------------------------------------------ */
const FOLDERS = [
  {
    file: "auth.data.js",
    name: "Auth",
    description:
      "Authentication, password reset and profile management. " +
      "Run **Login** first - it writes the JWT into the `token` collection variable.",
  },
  {
    file: "users.data.js",
    name: "Users",
    description: "Base user records (`users` table) - registration, listing and CRUD.",
  },
  {
    file: "students.data.js",
    name: "Students",
    description: "Student profiles (`students` table) linked to a user account.",
  },
  {
    file: "instructors.data.js",
    name: "Instructors",
    description:
      "Instructor profiles (`instructors` table) and instructor-course links.",
  },
  {
    file: "programs.data.js",
    name: "Programs",
    description: "Programs (`programs` table) and the program-course join table.",
  },
  {
    file: "courses.data.js",
    name: "Courses",
    description: "Courses (`courses` table) catalog.",
  },
  {
    file: "enrolments.data.js",
    name: "Enrolments",
    description: "Student enrolments into programs (`enrolments` table).",
  },
  {
    file: "payments.data.js",
    name: "Payments",
    description: "Payments recorded against enrolments (`payments` table).",
  },
];

const COLLECTION = {
  info: {
    name: "Alusoft Training API",
    description:
      "REST API for the Alusoft Training platform: users, students, instructors, " +
      "programs, courses, enrolments and payments.\n\n" +
      "**How to use**\n" +
      "1. Set the `baseUrl` collection variable to your server (default `http://localhost:3000`).\n" +
      "2. Call **Auth > Login** - the test script stores the JWT in the `token` variable, " +
      "which every authenticated request sends as `Authorization: Bearer {{token}}`.\n" +
      "3. Public routes are marked `noauth` and ignore the token.\n\n" +
      "**Roles** - `admin`, `instructor`, `student`. Private routes use the " +
      "`authorize(...)` middleware; a role mismatch returns `403`.\n\n" +
      "See `docs/API-REFERENCE.md` for the full reference including validation rules " +
      "and known implementation quirks.",
    schema:
      "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  auth: {
    type: "bearer",
    bearer: [{ key: "token", value: "{{token}}", type: "string" }],
  },
  variable: [
    { key: "baseUrl", value: "http://localhost:3000", type: "string" },
    { key: "token", value: "", type: "string" },
  ],
  event: [
    {
      listen: "prerequest",
      script: {
        type: "text/javascript",
        exec: [
          "// Fall back to the local dev server when the variable was cleared.",
          "if (!pm.collectionVariables.get('baseUrl')) {",
          "  pm.collectionVariables.set('baseUrl', 'http://localhost:3000');",
          "}",
        ],
      },
    },
  ],
};

/* ------------------------------------------------------------------ *
 * Load the endpoint modules
 * ------------------------------------------------------------------ */
function loadFolders() {
  return FOLDERS.map((f) => {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const items = require(path.join(ENDPOINTS_DIR, f.file));
    return { ...f, items };
  });
}

/* ------------------------------------------------------------------ *
 * Markdown helpers
 * ------------------------------------------------------------------ */
function mdEscape(str) {
  return String(str).replace(/\|/g, "\\|");
}

function renderQueryTable(query) {
  if (!query || !query.length) return "";
  const rows = query
    .map(
      (q) =>
        `| \`${q.key}\` | ${mdEscape(q.value || "")} | ${mdEscape(
          q.description || "",
        )} |`,
    )
    .join("\n");
  return `\n**Query parameters**\n\n| Key | Example | Description |\n|---|---|---|\n${rows}\n`;
}

function renderBodyBlock(item) {
  const body = item.request.body;
  if (!body) return "";
  if (body.mode === "raw") {
    return `\n**Request body**\n\n\`\`\`json\n${body.raw}\n\`\`\`\n`;
  }
  if (body.mode === "formdata") {
    const rows = body.formdata
      .map(
        (f) =>
          `| \`${f.key}\` | ${f.type} | ${mdEscape(f.description || "")} |`,
      )
      .join("\n");
    return (
      `\n**Request body** (\`multipart/form-data\`)\n\n` +
      `| Field | Type | Description |\n|---|---|---|\n${rows}\n`
    );
  }
  return "";
}

function renderResponses(responses) {
  if (!responses || !responses.length) return "";
  const parts = responses.map((r) => {
    const head = `#### ${r.code} ${STATUS_TEXT[r.code] || ""}`.trim();
    return `${head}\n\n\`\`\`json\n${r.body}\n\`\`\`\n`;
  });
  return `\n**Responses**\n\n${parts.join("\n")}`;
}

function renderTests(item) {
  const ev = item.request.event;
  if (!ev || !ev.length) return "";
  const script = ev
    .map((e) => (e.script && e.script.exec ? e.script.exec : []))
    .flat()
    .join("\n");
  if (!script.trim()) return "";
  return `\n**Postman tests**\n\n\`\`\`javascript\n${script}\n\`\`\`\n`;
}

function accessLabel(item) {
  if (item.request.auth && item.request.auth.type === "noauth") {
    return "Public";
  }
  return "Bearer token";
}

/**
 * The endpoint descriptions start with a bold access label, e.g.
 * "**Private (admin only).**" or "**Public.**". Use it for the access
 * column of the quick reference table so the label matches the prose.
 */
function accessSummary(item) {
  const desc = String(item.request.description || "");
  const m = desc.match(/^\*\*([^*]+)\*\*/);
  if (m) {
    const label = m[1].trim().replace(/\.$/, "");
    if (/^effectively public/i.test(label)) return "Public (no auth applied)";
    if (/^public/i.test(label)) return "Public";
    if (/^private/i.test(label)) return label;
  }
  return accessLabel(item);
}

/** First sentence of the description, for the quick reference table. */
function shortSummary(item) {
  const desc = String(item.request.description || "").replace(/^\*\*[^*]+\*\*\s*/, "");
  const para = desc.split("\n\n")[0].trim();
  const sentence = para.split(/(?<=\.)\s+/)[0] || para;
  return sentence.replace(/\*\*/g, "").replace(/\|/g, "\\|");
}

/** Path parameters declared in the URL, for the Markdown detail view. */
function renderPathTable(item) {
  const vars = (item.request.url && item.request.url.variable) || [];
  if (!vars.length) return "";
  const rows = vars
    .map((v) => `| \`${v.key}\` | ${mdEscape(v.value || "")} | integer |`)
    .join("\n");
  return (
    `\n**Path parameters**\n\n| Key | Example | Type |\n|---|---|---|\n${rows}\n`
  );
}

/* ------------------------------------------------------------------ *
 * Quirks appendix content
 * ------------------------------------------------------------------ */
const QUIRKS = [
  [
    "Validation errors return `500`",
    "Most controllers catch Sequelize errors and respond with " +
      '`500 {"message":"Internal Server error"}` instead of a `400` with a ' +
      "validation message. The only `400` responses come from hand-written " +
      "checks inside the controller.",
  ],
  [
    "Omitted update fields are cleared",
    "`PUT` handlers write every field on every request. Sending only one field " +
      "nulls out all the others instead of leaving them untouched.",
  ],
  [
    "`PUT /api/auth/me` returns a stale profile",
    "The response embeds a snapshot of the related `student` / `instructor` " +
      "profile taken before the update, so the nested object can disagree with " +
      "the updated user fields.",
  ],
  [
    "Instructor updates check role but not ownership",
    "`PUT /api/instructors/:id` accepts `admin` **and** `instructor`, but it does " +
      "not verify that the caller is the instructor being edited - any instructor " +
      "can update any other instructor.",
  ],
  [
    "`DELETE /api/programs/:id/courses` is public",
    "The route is registered without `authenticate` / `authorize`, so courses can " +
      "be detached from a program without a token.",
  ],
  [
    "`POST /api/payments` has no role guard",
    "The route only runs `authenticate`, so a `student` or `instructor` token can " +
      "create payments.",
  ],
  [
    "`DELETE` with a JSON body",
    "`DELETE /api/instructors/:id/courses` reads `courseIds` from the request " +
      "body, so Postman must be set to send a raw JSON body on a `DELETE`.",
  ],
  [
    "Course attachment needs an array",
    "`POST /api/programs/:id/courses` calls `.map()` on `coursesInfo` without a " +
      "type check, so a missing or non-array value throws and returns `500`.",
  ],
  [
    "Course creation returns `200`",
    "`POST /api/courses` responds with `200` (not `201`) and `is_active` is " +
      "required by the model.",
  ],
  [
    "Pagination keys differ between resources",
    "There are three different shapes. `/api/enrolments`, `/api/students` and " +
      "`/api/instructors` return `totalItems`, `totalPages`, `currentPage`, " +
      "`perPage`. `/api/payments`, `/api/programs` and `/api/courses` return " +
      "`total`, `page`, `limit`, `totalPages`. `/api/users` returns `total`, " +
      "`page`, `per_page`, `total_page` (snake_case).",
  ],
  [
    "Payment creation relies on the database",
    "`POST /api/payments` never checks that `enrolment_id` exists. A bad value " +
      "fails the foreign key and surfaces as a `500`.",
  ],
  [
    "Public user and student listing",
    "`GET /api/users`, `POST /api/users`, `GET /api/students` and " +
      "`GET /api/students/:id` are registered without any auth middleware.",
  ],
];

const AUTH_TABLE = [
  [
    "No `Authorization` header",
    "`401`",
    '`{"message":"Unauthorized, Authentication token not found"}`',
  ],
  ["Token expired", "`401`", '`{"message":"Authentication token expired"}`'],
  ["Token invalid", "`403`", '`{"message":"Invalid authentication token"}`'],
  [
    "User missing or `is_active = false`",
    "`401`",
    '`{"message":"Unauthorized, Invalid or inactive user"}`',
  ],
  [
    "Role not allowed by `authorize(...)`",
    "`403`",
    '`{"message":"Forbidden, You do not have permission to access this resource.Required [...]"}`',
  ],
];

/* ------------------------------------------------------------------ *
 * Markdown document
 * ------------------------------------------------------------------ */
function buildMarkdown(folders) {
  const out = [];

  out.push("# Alusoft Training API Reference");
  out.push("");
  out.push(
    "REST API for the Alusoft Training platform, generated from the live Express " +
      "route definitions in `routes/`, the controllers in `controllers/` and the " +
      "middleware in `middlewares/`.",
  );
  out.push("");
  out.push("## Table of Contents");
  out.push("");
  for (const f of folders) {
    out.push(`- [${f.name}](#${f.name.toLowerCase()})`);
  }
  out.push("");
  out.push("### Reference");
  out.push("");
  out.push("- [Endpoint Quick Reference](#endpoint-quick-reference)");
  out.push("- [Authentication](#authentication)");
  out.push("- [Known Implementation Quirks](#known-implementation-quirks)");
  out.push("");
  out.push("---");
  out.push("");

  /* Quick reference table ------------------------------------------- */
  out.push("## Endpoint Quick Reference");
  out.push("");
  out.push("| Method | Path | Access | Description |", "|---|---|---|---|");
  for (const f of folders) {
    for (const item of f.items) {
      const raw = item.request.url.raw.replace("{{baseUrl}}", "");
      const pathOnly = raw.split("?")[0];
      out.push(
        `| \`${item.request.method}\` | \`${pathOnly}\` | ` +
          `${accessSummary(item)} | ${shortSummary(item)} |`,
      );
    }
  }
  out.push("");

  /* Authentication guide -------------------------------------------- */
  out.push("---");
  out.push("");
  out.push("## Authentication");
  out.push("");
  out.push(
    "All private routes use a stateless JWT sent as `Authorization: Bearer <token>`.",
  );
  out.push("");
  out.push("| Situation | Status | Response |", "|---|---|---|");
  for (const row of AUTH_TABLE) {
    out.push(`| ${row[0]} | ${row[1]} | ${row[2]} |`);
  }
  out.push("");
  out.push(
    "Call `POST /api/auth/login` to obtain a token; the response body contains " +
      "`data.token`.",
  );
  out.push("");

  /* Per-folder detail ----------------------------------------------- */
  for (const f of folders) {
    out.push("---");
    out.push("");
    out.push(`## ${f.name}`);
    out.push("");
    out.push(f.description);
    out.push("");

    for (const item of f.items) {
      const raw = item.request.url.raw.replace("{{baseUrl}}", "");
      const pathOnly = raw.split("?")[0];
      out.push(`### ${item.request.method} ${pathOnly}`);
      out.push("");
      out.push(`**${item.name}** - ${accessSummary(item)}`);
      out.push("");

      const desc = String(item.request.description || "").trim();
      if (desc) {
        out.push(desc);
        out.push("");
      }

      out.push(renderPathTable(item));
      out.push(renderQueryTable(item.request.url.query));
      out.push(renderBodyBlock(item));
      out.push(renderResponses(item.response));
      out.push(renderTests(item));
    }
  }

  /* Quirk appendix -------------------------------------------------- */
  out.push("---");
  out.push("");
  out.push("## Known Implementation Quirks");
  out.push("");
  out.push(
    "These are behaviours of the current codebase that differ from what you " +
      "would expect from REST conventions. They are documented here so the " +
      "collection behaves predictably against the running server.",
  );
  out.push("");
  out.push("| Quirk | Explanation |", "|---|---|");
  for (const [q, e] of QUIRKS) {
    out.push(`| ${q} | ${mdEscape(e)} |`);
  }
  out.push("");

  out.push("---");
  out.push("");
  out.push(
    "Generated by `node docs/generate-postman-collection.js`. Import " +
      "`docs/postman-collection.json` into Postman to exercise the API.",
  );
  out.push("");

  return collapseBlankLines(out.join("\n"));
}

/**
 * Collapse runs of 3+ newlines into a single blank line.
 *
 * Fenced code blocks are skipped so that intentionally spaced JSON examples
 * keep their formatting.
 */
function collapseBlankLines(md) {
  const lines = md.split("\n");
  const out = [];
  let inFence = false;
  let blankRun = 0;

  for (const line of lines) {
    if (/^\s*```/.test(line)) inFence = !inFence;

    if (!inFence && line.trim() === "") {
      blankRun++;
      if (blankRun > 1) continue;
    } else {
      blankRun = 0;
    }
    out.push(line);
  }
  return out.join("\n");
}

/* ------------------------------------------------------------------ *
 * Write everything
 * ------------------------------------------------------------------ */
function main() {
  const folders = loadFolders();

  const collection = {
    ...COLLECTION,
    item: folders.map((f) => mkFolder(f.name, f.description, f.items)),
  };

  fs.writeFileSync(
    COLLECTION_OUT,
    JSON.stringify(collection, null, 2) + "\n",
    "utf8",
  );

  fs.writeFileSync(MARKDOWN_OUT, buildMarkdown(folders), "utf8");

  const total = folders.reduce((n, f) => n + f.items.length, 0);
  console.log(`Generated ${COLLECTION_OUT}`);
  console.log(`Generated ${MARKDOWN_OUT}`);
  console.log(`Folders: ${folders.length}, endpoints: ${total}`);
}

if (require.main === module) {
  main();
}

module.exports = { main, buildMarkdown, loadFolders, FOLDERS, QUIRKS };
