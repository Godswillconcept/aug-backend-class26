# Instructor Solutions: Node.js `url` Module

> These are reference solutions. Accept alternatives that use the WHATWG API, validate all required cases and produce equivalent results.

```js
const assert = require("node:assert/strict");
```

## Part A solutions

### Exercise 1

| Component | Value |
| --- | --- |
| Protocol | `https:` |
| Hostname | `learn.example.com` |
| Port | `8443` |
| Pathname | `/courses/node/events` |
| Query/search | `?level=beginner&mode=class` |
| Fragment/hash | `#exercise-4` |

The browser normally keeps the fragment; it is not included in the HTTP request.

### Exercise 2

- `example.com` is the hostname identifying the server.
- `/products` is the pathname identifying a resource within that origin.
- `?page=2` is the search/query portion carrying extra parameters.
- `href` is the complete serialized URL.

Each is one component of the complete structured address.

### Exercise 3

```js
const url = new URL(
  "https://shop.example.com:8080/products/laptops?brand=acer&page=2#reviews"
);

assert.equal(url.protocol, "https:");
assert.equal(url.host, "shop.example.com:8080");
assert.equal(url.hostname, "shop.example.com");
assert.equal(url.port, "8080");
assert.equal(url.origin, "https://shop.example.com:8080");
assert.equal(url.pathname, "/products/laptops");
assert.equal(url.search, "?brand=acer&page=2");
assert.equal(url.hash, "#reviews");
assert.equal(url.href,
  "https://shop.example.com:8080/products/laptops?brand=acer&page=2#reviews"
);
```

### Exercise 4

```text
localhost:3000
localhost
3000
```

`host` includes an explicit port; `hostname` does not.

### Exercise 5

```js
const http = new URL("http://example.com:80/a");
const https = new URL("https://example.com:443/a");
const custom = new URL("https://example.com:8443/a");

assert.equal(http.port, "");
assert.equal(http.href, "http://example.com/a");
assert.equal(https.port, "");
assert.equal(https.href, "https://example.com/a");
assert.equal(custom.port, "8443");
assert.equal(custom.href, "https://example.com:8443/a");
```

The serializer removes a port that equals the scheme’s default.

## Part B solutions

### Exercise 6

```js
const url = new URL("http://example.com");
url.protocol = "https:";
url.hostname = "api.example.com";
url.port = "8443";
url.pathname = "/v1/users";
url.searchParams.set("active", "true");
url.hash = "results";

assert.equal(
  url.href,
  "https://api.example.com:8443/v1/users?active=true#results"
);
```

### Exercise 7

```js
function buildProductUrl(productId, referralCode) {
  const url = new URL("https://shop.example.com/products/");

  // encodeURIComponent keeps a slash inside an ID from becoming a path separator.
  url.pathname += encodeURIComponent(String(productId));
  url.searchParams.set("ref", referralCode);
  return url;
}

const result = buildProductUrl("book/blue #1", "Ada & Co");
assert.equal(result.pathname, "/products/book%2Fblue%20%231");
assert.equal(result.searchParams.get("ref"), "Ada & Co");
```

Assigning an entire pathname does not encode `/` because slash is meaningful path syntax. Encoding one dynamic path segment first makes the intended boundary explicit. Do not pre-encode query values passed to `searchParams`.

### Exercise 8

```js
const base = "https://example.com/courses/node/lesson-1";

assert.equal(new URL("/about", base).href, "https://example.com/about");
assert.equal(
  new URL("lesson-2", base).href,
  "https://example.com/courses/node/lesson-2"
);
assert.equal(
  new URL("../javascript", base).href,
  "https://example.com/courses/javascript"
);
assert.equal(
  new URL("?page=2", base).href,
  "https://example.com/courses/node/lesson-1?page=2"
);
assert.equal(
  new URL("#quiz", base).href,
  "https://example.com/courses/node/lesson-1#quiz"
);
```

### Exercise 9

```js
assert.equal(
  new URL("lesson", "https://example.com/courses").href,
  "https://example.com/lesson"
);
assert.equal(
  new URL("lesson", "https://example.com/courses/").href,
  "https://example.com/courses/lesson"
);
```

The first base ends in a resource-like segment that is replaced. The second represents a directory-like path to which `lesson` is appended.

### Exercise 10

```js
function parseAbsoluteUrlWithCatch(input) {
  try {
    return new URL(input);
  } catch {
    return null;
  }
}

function parseAbsoluteUrl(input) {
  return URL.canParse(input) ? new URL(input) : null;
}

assert.equal(parseAbsoluteUrl("no"), null);
assert.equal(parseAbsoluteUrl("https://example.com").hostname, "example.com");
```

## Part C solutions

### Exercise 11

```js
const url = new URL(
  "https://shop.example.com/products?brand=acer&page=2&inStock=true"
);

assert.equal(url.searchParams.get("brand"), "acer");
assert.equal(url.searchParams.get("page"), "2");
assert.equal(url.searchParams.get("inStock"), "true");
assert.equal(typeof url.searchParams.get("page"), "string");
assert.equal(typeof url.searchParams.get("inStock"), "string");
```

The URL format transports text. Application code must convert and validate semantic types.

### Exercise 12

```js
const params = new URLSearchParams("q=&page=2");
assert.equal(params.get("q"), "");
assert.equal(params.get("missing"), null);
assert.equal(params.has("q"), true);
assert.equal(params.has("missing"), false);
```

### Exercise 13

```js
const params = new URLSearchParams("tag=node&tag=backend&tag=events");
assert.equal(params.get("tag"), "node");
assert.deepEqual(params.getAll("tag"), ["node", "backend", "events"]);
```

### Exercise 14

```js
const params = new URLSearchParams("tag=node&tag=backend");
params.append("tag", "javascript");
assert.equal(params.toString(), "tag=node&tag=backend&tag=javascript");

params.set("tag", "api");
assert.equal(params.toString(), "tag=api");
```

`set()` removed all earlier `tag` pairs before storing the one replacement.

### Exercise 15

```js
function buildSearchUrl({ q, tags = [], page } = {}) {
  const url = new URL("https://example.com/search");
  url.searchParams.set("q", q ?? "");

  for (const tag of tags) {
    url.searchParams.append("tag", tag);
  }
  if (page !== undefined) {
    url.searchParams.set("page", String(page));
  }
  return url;
}

const url = buildSearchUrl({
  q: "Node & APIs",
  tags: ["back end", "events"],
  page: 2,
});

assert.equal(url.searchParams.get("q"), "Node & APIs");
assert.deepEqual(url.searchParams.getAll("tag"), ["back end", "events"]);
assert.equal(url.searchParams.get("page"), "2");
```

### Exercise 16

```js
function paramsToArrays(params) {
  const result = {};
  for (const [name, value] of params) {
    (result[name] ??= []).push(value);
  }
  return result;
}

assert.deepEqual(
  paramsToArrays(new URLSearchParams("name=Ada&skill=Node&skill=JavaScript")),
  { name: ["Ada"], skill: ["Node", "JavaScript"] }
);
```

### Exercise 17

```js
function readPage(params) {
  const values = params.getAll("page");
  if (values.length === 0) return 1;
  if (values.length !== 1 || !/^[1-9]\d*$/.test(values[0])) {
    throw new RangeError("page must be one positive integer");
  }
  const page = Number(values[0]);
  if (!Number.isSafeInteger(page)) {
    throw new RangeError("page is too large");
  }
  return page;
}

assert.equal(readPage(new URLSearchParams()), 1);
assert.equal(readPage(new URLSearchParams("page=12")), 12);
for (const query of ["page=0", "page=-1", "page=1.5", "page=2abc", "page=", "page=1&page=2"]) {
  assert.throws(() => readPage(new URLSearchParams(query)));
}
```

Checking only `parseInt()` would wrongly accept `2abc`; the full-string rule prevents that.

### Exercise 18

```js
const params = new URLSearchParams("z=9&a=1&m=5&a=2");
params.sort();
assert.equal(params.toString(), "a=1&a=2&m=5&z=9");
```

The sort is stable, so the two `a` values retain their relative order. Stable serialization can help form deterministic cache keys or signed request inputs.

## Part D solutions

### Exercise 19

```js
const request = { url: "/products?category=books&page=3" };
const url = new URL(request.url, "http://localhost:3000");

assert.equal(url.pathname, "/products");
assert.equal(url.searchParams.get("category"), "books");
assert.equal(url.searchParams.get("page"), "3");
```

The request target is relative because it lacks a protocol and host. `new URL()` requires a base for relative input.

### Exercise 20

```js
const http = require("node:http");

function positiveInteger(value, fallback) {
  if (value === null) return fallback;
  if (!/^[1-9]\d*$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : null;
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, "http://localhost:3000");

  if (request.method === "GET" && url.pathname === "/") {
    response.end("Welcome");
    return;
  }

  if (request.method === "GET" && url.pathname === "/products") {
    const page = positiveInteger(url.searchParams.get("page"), 1);
    if (page === null) {
      response.statusCode = 400;
      response.end("Invalid page");
      return;
    }
    response.end(`Products page ${page}`);
    return;
  }

  response.statusCode = 404;
  response.end("Not found");
});

server.listen(3000, () => console.log("http://localhost:3000"));
```

Stop with Ctrl+C after testing.

### Exercise 21

```js
const url = new URL("/users/42?include=posts", "https://api.example.com");
const segments = url.pathname.split("/").filter(Boolean);

assert.equal(segments[0], "users");
assert.equal(segments[1], "42");
assert.equal(url.searchParams.get("include"), "posts");
```

The URL Standard defines the query format. `/users/:id` is an application/router convention, so `URL` exposes only the pathname string.

### Exercise 22

The typical request target is `/docs?lang=en`. Fragments are client-side document identifiers and are not transmitted in normal HTTP requests, so the server cannot observe or securely enforce them.

### Exercise 23

```js
function buildWeatherUrl(city, units = "metric") {
  const url = new URL("https://weather.example/api/current");
  url.searchParams.set("city", city);
  url.searchParams.set("units", units);
  return url;
}

async function mockFetch(input) {
  assert.ok(input instanceof URL);
  return { ok: true, requested: input.href };
}

const weather = buildWeatherUrl("Lagos Island", "metric");
assert.equal(weather.searchParams.get("city"), "Lagos Island");
assert.match((await mockFetch(weather)).requested, /city=Lagos\+Island/);
```

### Exercise 24

```js
const { urlToHttpOptions } = require("node:url");

const input = new URL("https://api.example.com:8443/v1/users?page=2");
const options = urlToHttpOptions(input);

assert.equal(options.protocol, "https:");
assert.equal(options.hostname, "api.example.com");
assert.equal(options.port, 8443);
assert.equal(options.path, "/v1/users?page=2");
assert.equal(options.href, input.href);
```

## Part E solutions

### Exercise 25

```js
const path = require("node:path");
const { pathToFileURL, fileURLToPath } = require("node:url");

const fileUrl = pathToFileURL(__filename);
const returnedPath = fileURLToPath(fileUrl);

assert.ok(fileUrl instanceof URL);
assert.equal(path.resolve(returnedPath), path.resolve(__filename));
```

### Exercise 26

```js
const path = require("node:path");
const { pathToFileURL, fileURLToPath } = require("node:url");

const filename = path.resolve("report #1.txt");
const url = pathToFileURL(filename);

assert.match(url.href, /report%20%231\.txt$/);
assert.equal(fileURLToPath(url), filename);
```

In URL syntax, `#` begins a fragment and `%` begins an escape. The conversion function encodes them as filename data and applies platform-specific path rules.

### Exercise 27

```js
// location.mjs
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const filename = fileURLToPath(import.meta.url);
const directory = dirname(filename);

console.log({ filename, directory });
```

### Exercise 28

```js
const parsed = new URL(input);
console.log(parsed.searchParams.get("page"));
```

Legacy `url.parse()` uses Node’s old non-standard parser and returns a legacy object. It is deprecated for new use and unsafe as the parser for untrusted input. Modern `URL.parse(input, base)` follows WHATWG rules and returns a `URL` object or `null`.

## Part F solutions

### Exercise 29

```js
function getSafeRedirect(rawTarget) {
  const base = new URL("https://app.example.com");
  const target = new URL(rawTarget, base);

  if (target.origin !== base.origin) {
    throw new Error("Redirect must stay on the application origin");
  }
  if (target.username || target.password) {
    throw new Error("Credentials are forbidden");
  }
  return `${target.pathname}${target.search}${target.hash}`;
}

assert.equal(
  getSafeRedirect("/dashboard?tab=billing#invoice"),
  "/dashboard?tab=billing#invoice"
);

for (const target of [
  "https://evil.example/steal",
  "//evil.example/steal",
  "http://app.example.com/dashboard",
  "https://app.example.com:8443/dashboard",
]) {
  assert.throws(() => getSafeRedirect(target));
}
```

### Exercise 30

```js
function validateApiUrl(input) {
  const url = new URL(input);

  if (url.protocol !== "https:") {
    throw new Error("Protocol must be HTTPS");
  }
  const allowedHost =
    url.hostname === "api.example.com" ||
    url.hostname.endsWith(".api.example.com");
  if (!allowedHost) {
    throw new Error("Hostname is not allowed");
  }
  if (url.username || url.password) {
    throw new Error("Credentials are forbidden");
  }
  if (url.port !== "") {
    throw new Error("A custom port is forbidden");
  }
  if (!url.pathname.startsWith("/v1/")) {
    throw new Error("Path must begin /v1/");
  }
  return url;
}

assert.equal(
  validateApiUrl("https://images.api.example.com/v1/items").hostname,
  "images.api.example.com"
);

for (const input of [
  "http://api.example.com/v1/items",
  "https://evil-api.example.com/v1/items",
  "https://api.example.com.evil.test/v1/items",
  "https://user:pass@api.example.com/v1/items",
  "https://api.example.com:8443/v1/items",
  "https://api.example.com/v2/items",
]) {
  assert.throws(() => validateApiUrl(input));
}
```

This validates a textual host allow-list. A general-purpose server-side fetcher would additionally need DNS/IP controls, redirect revalidation, timeouts and response limits to mitigate SSRF.

## Pair-project reference solution

```js
const ALLOWED_KEYS = new Set([
  "q",
  "category",
  "page",
  "limit",
  "sort",
  "inStock",
]);
const ALLOWED_SORTS = new Set(["price", "name", "newest"]);

function readSingle(params, name, fallback) {
  const values = params.getAll(name);
  if (values.length > 1) {
    throw new Error(`${name} must not be repeated`);
  }
  return values.length === 0 ? fallback : values[0];
}

function readInteger(params, name, fallback, minimum, maximum) {
  const raw = readSingle(params, name, String(fallback));
  if (!/^(0|[1-9]\d*)$/.test(raw)) {
    throw new Error(`${name} must be an integer`);
  }
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${name} must be from ${minimum} through ${maximum}`);
  }
  return value;
}

function parseCatalogueRequest(requestTarget) {
  const url = new URL(requestTarget, "https://shop.example.com");

  // Reject absolute/cross-origin input as well as the wrong route.
  if (url.origin !== "https://shop.example.com" || url.pathname !== "/products") {
    throw new Error("Only the /products route is accepted");
  }

  for (const key of url.searchParams.keys()) {
    if (!ALLOWED_KEYS.has(key)) {
      throw new Error(`Unknown parameter: ${key}`);
    }
  }

  const q = readSingle(url.searchParams, "q", "").trim();
  const categories = url.searchParams.getAll("category");
  const page = readInteger(url.searchParams, "page", 1, 1, Number.MAX_SAFE_INTEGER);
  const limit = readInteger(url.searchParams, "limit", 20, 1, 100);
  const sort = readSingle(url.searchParams, "sort", "newest");

  if (!ALLOWED_SORTS.has(sort)) {
    throw new Error("sort must be price, name or newest");
  }

  const rawInStock = readSingle(url.searchParams, "inStock", "false");
  if (rawInStock !== "true" && rawInStock !== "false") {
    throw new Error("inStock must be true or false");
  }

  return Object.freeze({
    q,
    categories: Object.freeze([...categories]),
    page,
    limit,
    sort,
    inStock: rawInStock === "true",
  });
}

const result = parseCatalogueRequest(
  "/products?q=node&category=books&category=courses&page=2&limit=10&sort=price&inStock=true"
);

assert.deepEqual(result, {
  q: "node",
  categories: ["books", "courses"],
  page: 2,
  limit: 10,
  sort: "price",
  inStock: true,
});
assert.equal(Object.isFrozen(result), true);
assert.equal(Object.isFrozen(result.categories), true);

assert.deepEqual(parseCatalogueRequest("/products"), {
  q: "",
  categories: [],
  page: 1,
  limit: 20,
  sort: "newest",
  inStock: false,
});

for (const badInput of [
  "/users",
  "https://evil.example/products",
  "/products?unknown=x",
  "/products?page=0",
  "/products?page=2abc",
  "/products?page=1&page=2",
  "/products?limit=101",
  "/products?sort=random",
  "/products?inStock=yes",
]) {
  assert.throws(() => parseCatalogueRequest(badInput), badInput);
}
```

## Exit-ticket answers

1. A mutable WHATWG `URL` object.
2. `host`.
3. No, it returns a string or `null`.
4. `getAll()`.
5. `set()` replaces all values for a key; `append()` adds another pair.
6. No, not in the normal HTTP request.
7. It is usually relative and lacks its own protocol and host.
8. `fileURLToPath()`.
9. No; it checks syntax, not permission, reachability or safety.
10. New code should avoid legacy `url.parse()` and use the WHATWG API.
