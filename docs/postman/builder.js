/**
 * Alusoft Training API - Postman Collection Builder
 * -------------------------------------------------
 * Small helpers that turn a declarative endpoint description into a
 * Postman Collection v2.1 item.
 *
 * The endpoint descriptions live in ./data.js and mirror the live Express
 * route definitions in routes/, controllers/ and middlewares/.
 */

const STATUS_TEXT = {
  200: "OK",
  201: "Created",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  409: "Conflict",
  500: "Internal Server Error",
};

const pretty = (o) => (typeof o === "string" ? o : JSON.stringify(o, null, 2));

/** Build a Postman url object from a path + query params. */
function buildUrl(p, query = []) {
  const qs = query.length
    ? "?" + query.map((q) => `${q.key}=${q.value}`).join("&")
    : "";
  const segments = p.split("/").filter(Boolean);
  const url = {
    raw: `{{baseUrl}}${p}${qs}`,
    host: ["{{baseUrl}}"],
    path: segments,
  };

  // Expose `:id`-style segments as Postman path variables so the
  // "Path Variables" tab is populated instead of showing a literal `:id`.
  const pathVars = segments
    .filter((s) => s.startsWith(":"))
    .map((s) => ({
      key: s.slice(1),
      value: s === ":id" ? "1" : "",
      description: "",
    }));
  if (pathVars.length) url.variable = pathVars;

  if (query.length) {
    url.query = query.map((q) => ({
      key: q.key,
      value: q.value,
      description: q.description || "",
      disabled: false,
    }));
  }
  return url;
}

/**
 * Create a Postman item (request + saved example responses).
 * auth: "bearer" (default, inherits the collection token) | "noauth" (public route)
 */
function mkItem(opts) {
  const {
    name,
    method,
    path: p,
    query = [],
    auth = "bearer",
    desc = "",
    body,
    form,
    tests,
    responses = [],
  } = opts;

  const request = {
    method,
    header: [{ key: "Accept", value: "application/json" }],
    url: buildUrl(p, query),
    description: desc,
  };

  if (auth === "noauth") request.auth = { type: "noauth" };

  if (form) {
    // multipart/form-data - Postman generates the boundary header itself.
    request.body = {
      mode: "formdata",
      formdata: form.map((f) => ({
        key: f.key,
        type: f.type || "text",
        value: f.value,
        description: f.description || "",
      })),
    };
  } else if (body !== undefined) {
    request.header.push({ key: "Content-Type", value: "application/json" });
    request.body = {
      mode: "raw",
      options: { raw: { language: "json" } },
      raw: pretty(body),
    };
  }

  if (tests) {
    const lines = Array.isArray(tests) ? tests : String(tests).split("\n");
    request.event = [
      {
        listen: "test",
        script: { type: "text/javascript", exec: lines },
      },
    ];
  }

  return {
    name,
    request,
    response: responses.map((r) => ({
      name: r.name,
      originalRequest: {
        method,
        header: request.header,
        url: buildUrl(p, query),
      },
      status: STATUS_TEXT[r.code] || "Unknown",
      code: r.code,
      header: [{ key: "Content-Type", value: "application/json" }],
      body: pretty(r.body),
      _postman_previewlanguage: "json",
    })),
  };
}

/** Folder helper. */
function mkFolder(name, description, items) {
  return { name, description, item: items };
}

module.exports = { mkItem, mkFolder, buildUrl, pretty, STATUS_TEXT };
