# Node.js URL Module: From the Browser Address Bar to Backend Code

> Documentation basis: [official Node.js URL API](https://nodejs.org/docs/latest/api/url.html) and [MDN: What is a URL?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL), reviewed on 13 August 2026. This lesson teaches the browser-compatible WHATWG API. The old `url.parse()` API is covered only so students can recognize and replace legacy code.

## Lesson overview

Students already use URLs whenever they type an address, click a link, search, filter a shop, or copy a page link. The best teaching route is therefore:

1. begin with a real browser address;
2. label every visible component;
3. turn the string into a `URL` object;
4. read and safely change its properties;
5. work with query parameters through `URLSearchParams`;
6. connect the same model to an incoming Node.js request;
7. finish with validation, security, file URLs, and backend exercises.

By the end, students should be able to parse, construct, resolve, validate, modify and serialize URLs without manually splitting strings.

---

## 1. Begin with an address students recognize

Write this address on the board:

```text
https://shop.example.com:8443/products/laptops?brand=acer&sort=price#reviews
```

Break it apart:

```text
https://shop.example.com:8443/products/laptops?brand=acer&sort=price#reviews
\___/   \______________/ \__/\_______________/ \___________________/ \_____/
scheme       hostname     port      pathname             query         fragment
```

The WHATWG `URL` object calls these parts:

| Human description | `URL` property | Example value |
| --- | --- | --- |
| Complete address | `href` | Full URL string |
| Scheme | `protocol` | `https:` |
| Domain or IP address | `hostname` | `shop.example.com` |
| Network port | `port` | `8443` |
| Hostname plus port | `host` | `shop.example.com:8443` |
| Scheme plus host | `origin` | `https://shop.example.com:8443` |
| Resource location | `pathname` | `/products/laptops` |
| Query, including `?` | `search` | `?brand=acer&sort=price` |
| Parsed query helper | `searchParams` | A `URLSearchParams` object |
| Fragment, including `#` | `hash` | `#reviews` |

### A useful classroom analogy

Think of a URL as a delivery address:

- protocol: which delivery system to use;
- hostname: which building or server;
- port: which entrance/service on that server;
- pathname: which room or resource;
- query: extra instructions;
- hash: a position inside the returned document.

The analogy introduces the parts, but the actual syntax and rules are defined by the URL Standard.

---

## 2. URL, URI and domain are not synonyms

- A **URL** identifies a resource and tells software how or where to access it.
- A **URI** is the broader identifier concept. In ordinary web development, “URL” is usually the useful term.
- A **domain name** is only the hostname portion, such as `example.com`.
- An **origin** combines protocol, hostname and effective port.

Therefore, `https://example.com/products?id=4` is a URL; `example.com` alone is its domain/hostname, not the whole URL.

---

## 3. What the browser does with a URL

For an HTTP(S) address, a simplified sequence is:

1. The browser parses the address.
2. It uses DNS to translate the hostname to an IP address.
3. It connects using the protocol and port.
4. It sends an HTTP request containing a request target such as `/products?brand=acer`.
5. The server uses the pathname and query to decide what to do.
6. The browser receives and displays the response.
7. The browser uses the fragment, such as `#reviews`, locally to navigate within the document.

### Critical backend fact

The fragment is not normally sent in the HTTP request. A Node server cannot route or authorize a request based on a browser fragment.

```text
Browser address:
https://example.com/docs?page=2#installation

Typical server request target:
/docs?page=2

Not received by the server:
#installation
```

---

## 4. Why Node.js has `node:url`

A URL is structured data, not merely text. Manual operations such as these are fragile:

```js
const parts = address.split("?");
const query = parts[1].split("&");
```

They easily mishandle missing queries, fragments, duplicate keys, encoded characters, IPv6 addresses, credentials and relative references.

Node implements the browser-compatible WHATWG `URL` and `URLSearchParams` APIs. `URL` and `URLSearchParams` are globals in modern Node.js, but importing Node-specific utilities remains necessary for file-path conversion and related helpers.

```js
const {
  URL,
  URLSearchParams,
  fileURLToPath,
  pathToFileURL,
  urlToHttpOptions,
} = require("node:url");
```

Using `node:` makes it explicit that this is a built-in module.

---

## 5. Creating a `URL` object

### Absolute URL

```js
const address = new URL(
  "https://shop.example.com:8443/products?brand=acer#reviews"
);

console.log(address.hostname); // shop.example.com
console.log(address.pathname); // /products
```

An absolute URL supplies its own scheme and host.

### Relative reference plus base URL

```js
const product = new URL("../products/42?currency=NGN", "https://example.com/store/phones/");
console.log(product.href);
// https://example.com/store/products/42?currency=NGN
```

The second argument is the base used to resolve a relative reference. Resolution follows URL rules; it is not string concatenation.

### Trailing slash changes resolution

```js
console.log(new URL("lesson", "https://example.com/courses").href);
// https://example.com/lesson

console.log(new URL("lesson", "https://example.com/courses/").href);
// https://example.com/courses/lesson
```

Without the trailing slash, `courses` is treated like the current resource and is replaced. With it, `courses/` is treated as a directory-like path.

### Invalid input

`new URL()` throws a `TypeError` when the input cannot be parsed:

```js
try {
  new URL("not an absolute URL");
} catch (error) {
  console.log(error.code); // ERR_INVALID_URL in Node.js
}
```

---

## 6. Reading every important property

```js
const address = new URL(
  "https://ada:secret@shop.example.com:8443/products/laptop?brand=acer#reviews"
);

console.log(address.href);       // entire serialized URL
console.log(address.protocol);   // https:
console.log(address.username);   // ada
console.log(address.password);   // secret
console.log(address.host);       // shop.example.com:8443
console.log(address.hostname);   // shop.example.com
console.log(address.port);       // 8443
console.log(address.origin);     // https://shop.example.com:8443
console.log(address.pathname);   // /products/laptop
console.log(address.search);     // ?brand=acer
console.log(address.hash);       // #reviews
```

### `host` versus `hostname`

```js
const url = new URL("http://localhost:3000/users");
console.log(url.host);     // localhost:3000
console.log(url.hostname); // localhost
```

`host` includes the port when present. `hostname` never includes the port.

### Default ports disappear

```js
const url = new URL("https://example.com:443/path");
console.log(url.port); // ""
console.log(url.href); // https://example.com/path
```

Port 443 is the default for HTTPS, so serialization omits it. Similarly, HTTP defaults to port 80.

### `origin`

```js
const url = new URL("https://user:pass@example.com:8080/a?x=1#b");
console.log(url.origin); // https://example.com:8080
```

Origin does not contain credentials, pathname, query or fragment. Some schemes, including `file:`, produce the string origin `null`.

---

## 7. Changing URL properties

Most `URL` properties are getters and setters:

```js
const url = new URL("http://example.com/products");

url.protocol = "https:";
url.hostname = "api.example.com";
url.port = "8443";
url.pathname = "/v1/products/42";
url.hash = "details";

console.log(url.href);
// https://api.example.com:8443/v1/products/42#details
```

The setters normalize and encode values according to their component rules:

```js
const url = new URL("https://example.com");
url.pathname = "/class notes/week 1";
console.log(url.href);
// https://example.com/class%20notes/week%201
```

Avoid building URLs by interpolation when values may contain spaces, `&`, `#`, `?`, `/` or non-ASCII characters. Use properties and `searchParams`.

### Deleting a property is not the normal API

URL properties live as accessors on the prototype. `delete url.hash` does not clear the fragment. Assign an empty string:

```js
url.hash = "";
url.search = "";
```

---

## 8. Serializing a URL

```js
const url = new URL("https://example.com/a?x=1");

console.log(url.href);
console.log(url.toString());
console.log(url.toJSON());
console.log(String(url));
```

All four produce the serialized URL string. `toJSON()` makes a URL convenient inside `JSON.stringify()`:

```js
console.log(JSON.stringify({ next: url }));
// {"next":"https://example.com/a?x=1"}
```

---

## 9. Query strings and `URLSearchParams`

In this address:

```text
https://shop.example.com/products?brand=acer&page=2&inStock=true
```

the query string is:

```text
brand=acer&page=2&inStock=true
```

Query parameters are textual key-value pairs. Node does not automatically convert `"2"` to a number or `"true"` to a boolean.

```js
const url = new URL("https://shop.example.com/products?brand=acer&page=2");

console.log(url.search);                   // ?brand=acer&page=2
console.log(url.searchParams.get("brand")); // acer
console.log(typeof url.searchParams.get("page")); // string
```

### Reading values

```js
const params = new URLSearchParams("tag=node&tag=backend&page=2");

console.log(params.get("tag"));     // node: first value only
console.log(params.getAll("tag"));  // ["node", "backend"]
console.log(params.has("page"));    // true
console.log(params.has("missing")); // false
```

`get()` returns `null` when the key is absent. An existing empty value returns `""`:

```js
const params = new URLSearchParams("q=&page=2");
console.log(params.get("q"));       // ""
console.log(params.get("missing")); // null
```

### Adding, replacing and deleting

```js
const url = new URL("https://example.com/search");

url.searchParams.set("q", "node events");
url.searchParams.append("tag", "backend");
url.searchParams.append("tag", "javascript");
url.searchParams.delete("tag", "backend");

console.log(url.href);
// https://example.com/search?q=node+events&tag=javascript
```

- `set(name, value)` replaces all existing values for that name with one value.
- `append(name, value)` adds another pair, even if the name already exists.
- `delete(name)` removes all values for the name.
- Modern Node versions also support `delete(name, value)` and `has(name, value)`.

### Iterating

```js
const params = new URLSearchParams("brand=acer&page=2");

for (const [name, value] of params) {
  console.log(name, value);
}

console.log([...params.keys()]);
console.log([...params.values()]);
console.log([...params.entries()]);
params.forEach((value, name) => console.log(name, value));
```

### Sorting

```js
const params = new URLSearchParams("z=9&a=1&m=5");
params.sort();
console.log(params.toString()); // a=1&m=5&z=9
```

Sorting is useful when producing stable cache keys or signatures, but only do it when parameter order is not meaningful to the receiving system.

### Constructing `URLSearchParams`

```js
new URLSearchParams();
new URLSearchParams("q=node&page=1");
new URLSearchParams({ q: "node", page: "1" });
new URLSearchParams([["tag", "node"], ["tag", "backend"]]);
```

The object form cannot represent duplicate keys because an object has only one property per name. Use an iterable or repeated `append()` calls for duplicates.

### Values are strings

```js
const params = new URLSearchParams({ page: 2, active: true });
console.log(params.get("page"));   // "2"
console.log(params.get("active")); // "true"
```

Parse and validate at the application boundary:

```js
const rawPage = params.get("page");
const page = Number.parseInt(rawPage ?? "1", 10);

if (!Number.isInteger(page) || page < 1) {
  throw new RangeError("page must be a positive integer");
}
```

---

## 10. Encoding and decoding

URLs cannot contain every character literally in every component. Percent-encoding represents bytes with `%` followed by hexadecimal digits.

```text
space in a path -> %20
# as path data  -> %23
```

`URL` and `URLSearchParams` encode component values for you:

```js
const url = new URL("https://example.com");
url.pathname = "/notes/Node & APIs";
url.searchParams.set("q", "events & streams");

console.log(url.href);
// https://example.com/notes/Node%20&%20APIs?q=events+%26+streams
```

In form-style query serialization, a space is commonly represented by `+`. `URLSearchParams.get()` decodes it back to a space.

### Avoid double encoding

```js
const params = new URLSearchParams();
params.set("q", "node & js"); // pass the raw value
```

Do not usually call `encodeURIComponent()` before passing the value to `searchParams`; otherwise the `%` may itself be encoded.

### `decodeURIComponent()` is not a query parser

It does not split pairs, handle duplicate parameters, or apply all form-query rules. Prefer `URLSearchParams` for query strings.

---

## 11. Absolute versus relative URLs

These are absolute:

```text
https://example.com/products
file:///C:/class/notes.md
```

These are relative references:

```text
/products
products/42
../images/logo.png
?page=2
#reviews
```

Relative references need a base:

```js
const base = "https://example.com/courses/node/lesson-1";

console.log(new URL("/about", base).href);       // origin root
console.log(new URL("lesson-2", base).href);    // replaces lesson-1
console.log(new URL("../javascript", base).href);
console.log(new URL("?page=2", base).href);     // same pathname
console.log(new URL("#quiz", base).href);       // same page/query
```

Use `new URL(relative, base)`, not `base + relative`.

---

## 12. Validating URL syntax

### `URL.canParse()`

```js
console.log(URL.canParse("https://example.com")); // true
console.log(URL.canParse("/users", "https://api.example.com")); // true
console.log(URL.canParse("not a URL")); // false
```

It answers whether construction would succeed without throwing.

### `URL.parse()` in current Node.js

The modern static `URL.parse()` is not the old `url.parse()` function:

```js
const parsed = URL.parse("https://example.com/products");
console.log(parsed?.hostname); // example.com

console.log(URL.parse("not a URL")); // null
```

- `URL.parse()` is a modern WHATWG helper returning a `URL` or `null`.
- `url.parse()` is the deprecated legacy Node API returning a legacy object.

For projects supporting older Node releases, use `URL.canParse()` plus `new URL()`, or `try...catch`, after checking the project’s minimum Node version.

### Syntax validity is not permission

A URL being parseable does not mean it is safe, reachable or allowed. Application validation must also check protocol, hostname, port, credentials and business rules.

```js
function parsePublicHttpsUrl(input) {
  const url = new URL(input);

  if (url.protocol !== "https:") {
    throw new Error("Only HTTPS URLs are allowed");
  }
  if (url.username || url.password) {
    throw new Error("Credentials are not allowed");
  }
  if (!url.hostname.endsWith(".example.com") && url.hostname !== "example.com") {
    throw new Error("Hostname is not allowed");
  }
  return url;
}
```

Be careful with suffix checks: `hostname.endsWith("example.com")` incorrectly accepts `evil-example.com`. Require equality or the dot-prefixed subdomain suffix.

---

## 13. Incoming HTTP request URLs

In Node’s HTTP server, `request.url` is normally the request target, not a complete absolute URL:

```js
const http = require("node:http");

const server = http.createServer((request, response) => {
  console.log(request.url); // for example: /products?page=2

  const requestUrl = new URL(request.url, "http://localhost:3000");

  if (requestUrl.pathname === "/products") {
    const page = requestUrl.searchParams.get("page") ?? "1";
    response.end(`Products page ${page}`);
    return;
  }

  response.statusCode = 404;
  response.end("Not found");
});

server.listen(3000);
```

The base supplies the missing protocol and host. For route matching, a known application origin is usually safer than blindly trusting the incoming `Host` header.

### Query parameters are not route parameters

For `/users/42?include=posts`:

- `/users/42` is the pathname;
- `42` is a path/route parameter by application convention;
- `include=posts` is a query parameter.

The built-in URL API parses the pathname and query, but it does not automatically recognize Express-style patterns such as `/users/:id`.

```js
const segments = requestUrl.pathname.split("/").filter(Boolean);
// ["users", "42"]
```

Production applications commonly use a router library or framework for complex route matching.

---

## 14. Building outbound API URLs safely

```js
function buildWeatherUrl(city, unit = "metric") {
  const url = new URL("https://api.example.com/v1/weather");
  url.searchParams.set("city", city);
  url.searchParams.set("unit", unit);
  return url;
}

console.log(buildWeatherUrl("Lagos Island", "metric").href);
// https://api.example.com/v1/weather?city=Lagos+Island&unit=metric
```

This is clearer and safer than:

```js
const url = "https://api.example.com/v1/weather?city=" + city + "&unit=" + unit;
```

The `fetch()` API accepts a `URL` object directly:

```js
const response = await fetch(buildWeatherUrl("Lagos"));
```

---

## 15. File URLs are not file paths

Examples:

```text
URL:          file:///C:/class/notes.md
Windows path: C:\class\notes.md
POSIX path:   /home/ada/class/notes.md
```

Use the provided conversion functions.

### Path to file URL

```js
const { pathToFileURL } = require("node:url");

const fileUrl = pathToFileURL(__filename);
console.log(fileUrl.href);
```

`pathToFileURL()` resolves the path absolutely and correctly encodes characters such as `#`, `%` and spaces.

### File URL to path

```js
const { fileURLToPath } = require("node:url");

const filename = fileURLToPath("file:///C:/class/My%20Notes.md");
console.log(filename);
```

Do not treat `.pathname` as a portable filesystem path:

```js
// Fragile across platforms and encoded characters
const wrong = new URL("file:///C:/My%20Notes.md").pathname;

// Correct conversion
const right = fileURLToPath("file:///C:/My%20Notes.md");
```

### ES modules and `import.meta.url`

```js
// example.mjs
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const filename = fileURLToPath(import.meta.url);
const directory = dirname(filename);
```

Modern Node also provides `import.meta.filename` and `import.meta.dirname` in supported releases, but conversion remains important when code receives arbitrary file URLs or supports older runtimes.

Converting a file URL does not make it safe. Validate the resulting path before reading or writing files; decoded dot segments can participate in directory traversal.

---

## 16. Other useful `node:url` functions

### `urlToHttpOptions()`

Converts a WHATWG URL into an object suitable for `http.request()` or `https.request()`:

```js
const https = require("node:https");
const { urlToHttpOptions } = require("node:url");

const url = new URL("https://example.com:8443/products?page=2");
const options = urlToHttpOptions(url);

console.log(options.hostname); // example.com
console.log(options.port);     // 8443
console.log(options.path);     // /products?page=2

const request = https.request(options);
request.end();
```

### Internationalized domain names

```js
const { domainToASCII, domainToUnicode } = require("node:url");

console.log(domainToASCII("español.com"));
console.log(domainToUnicode("xn--espaol-zwa.com"));
```

DNS uses ASCII-compatible representations for internationalized names. `URL` also normalizes hostnames appropriately.

### `url.format(URL, options)`

Node’s module-level `format()` can serialize a WHATWG URL while optionally excluding authentication, the query, or the fragment, or displaying a Unicode hostname. For ordinary use, prefer `url.href` or `url.toString()`.

---

## 17. The legacy API

Old code may contain:

```js
const url = require("node:url");
const parsed = url.parse("https://example.com/products?page=2", true);
```

Teach students to write:

```js
const parsed = new URL("https://example.com/products?page=2");
console.log(parsed.searchParams.get("page"));
```

The legacy `url.parse()`, `url.resolve()` and string-input form of `url.format()` are deprecated in current Node documentation. The old parser is non-standard and should not be used with untrusted input. Do not confuse it with the modern static `URL.parse()`.

---

## 18. Security principles

### Treat every incoming URL value as untrusted

Parse, allow-list and validate it before use.

### Prevent open redirects

This is unsafe:

```js
response.writeHead(302, { Location: requestUrl.searchParams.get("next") });
```

An attacker may supply `?next=https://evil.example`. Prefer application-relative destinations or explicitly allowed origins.

```js
function safeRedirectTarget(rawTarget) {
  const base = new URL("https://app.example.com");
  const target = new URL(rawTarget, base);

  if (target.origin !== base.origin) {
    throw new Error("External redirects are forbidden");
  }
  return `${target.pathname}${target.search}${target.hash}`;
}
```

Watch for network-path references such as `//evil.example/path`; `new URL()` resolves them to a different host, which is why the origin check matters.

### Prevent SSRF

If the backend fetches a user-provided URL, an attacker may target loopback addresses, private networks, cloud metadata services or internal admin systems. Checking only that the scheme is HTTP is insufficient. Use strict allow-lists and account for DNS resolution and redirects.

### Do not put secrets in URLs

Queries may appear in browser history, logs, analytics, proxy records and copied links. Avoid passwords, access tokens and sensitive personal data in URLs.

### Do not trust the `Host` header automatically

It is client-controlled unless a trusted proxy/application layer validates it. This matters when constructing password-reset links, redirects or canonical URLs.

### Normalize before comparing

Hosts are case-insensitive and URLs may normalize default ports or dot segments. Parse first and compare structured properties; do not rely only on raw string prefixes.

---

## 19. Common mistakes

### Manually splitting a URL

Use `new URL()` and `searchParams`.

### Omitting the base for relative input

```js
new URL("/users"); // throws
new URL("/users", "https://api.example.com"); // works
```

### Confusing `host` and `hostname`

Remember: `host` may include the port.

### Expecting numeric query values

All query values are strings until explicitly converted and validated.

### Using `get()` for repeated values

Use `getAll()` for `?tag=node&tag=backend`.

### Concatenating user data into a query

Use `searchParams.set()` or `append()` so reserved characters are encoded.

### Treating `hash` as server input

The fragment stays on the client in normal HTTP navigation.

### Using `.pathname` as a filesystem path

Use `fileURLToPath()`.

### Assuming “parseable” means “safe”

Syntax validation is only the first layer.

---

## 20. API quick reference

| API/property | Purpose |
| --- | --- |
| `new URL(input, base?)` | Parse an absolute URL or resolve relative input |
| `URL.canParse(input, base?)` | Test whether input can be parsed |
| `URL.parse(input, base?)` | Return modern `URL` or `null` |
| `href` / `toString()` | Serialize the complete URL |
| `protocol` | Scheme including `:` |
| `username`, `password` | URL credentials |
| `host` | Hostname plus optional port |
| `hostname` | Hostname without port |
| `port` | Explicit non-default port |
| `origin` | Protocol plus host |
| `pathname` | Hierarchical resource path |
| `search` | Whole query including `?` |
| `searchParams` | Live query-parameter object |
| `hash` | Fragment including `#` |
| `URLSearchParams.get/getAll` | Read one/all values |
| `set/append/delete/has` | Modify or inspect parameters |
| `keys/values/entries/forEach` | Iterate parameters |
| `sort()` | Sort parameters by name |
| `pathToFileURL()` | Convert filesystem path to file URL |
| `fileURLToPath()` | Convert file URL to platform path |
| `urlToHttpOptions()` | Prepare URL data for HTTP request options |
| `domainToASCII/Unicode()` | Convert internationalized domains |

---

## 21. Suggested classroom delivery

### Session 1 — from address bar to object (90 minutes)

| Time | Activity |
| --- | --- |
| 0–12 min | Ask students to paste a familiar shopping/search URL and identify parts |
| 12–25 min | Draw protocol, host, port, pathname, query and fragment |
| 25–40 min | Parse the address with `new URL()` and inspect properties |
| 40–55 min | Change properties and observe serialization/encoding |
| 55–72 min | Teach `URLSearchParams`, repeated keys and type conversion |
| 72–82 min | Resolve relative references and demonstrate trailing-slash behavior |
| 82–90 min | Prediction quiz and recap |

### Session 2 — backend application (90 minutes)

| Time | Activity |
| --- | --- |
| 0–15 min | Rebuild a URL from memory and correct misconceptions |
| 15–32 min | Parse `request.url` inside a small HTTP server |
| 32–45 min | Build an outbound API URL without concatenation |
| 45–57 min | Validate protocol, hostname, port and redirect origin |
| 57–68 min | File URL/path conversion and ESM context |
| 68–78 min | Legacy API recognition and migration |
| 78–90 min | Pair exercise: product catalogue request parser |

### Suggested live demonstration

Ask students to predict every value before running:

```js
const url = new URL(
  "/products/laptops?brand=HP&brand=Dell&page=2#reviews",
  "https://shop.example.com"
);

console.log(url.origin);
console.log(url.pathname);
console.log(url.searchParams.get("brand"));
console.log(url.searchParams.getAll("brand"));
console.log(url.hash);

url.searchParams.set("page", "3");
url.searchParams.append("sort", "price");
console.log(url.href);
```

Then ask: “Which part would our HTTP server not receive?” Answer: the fragment.

---

## 22. Review questions

1. What is the difference between a hostname and a full URL?
2. Which URL property includes the port: `host` or `hostname`?
3. Why does `new URL("/users")` need a base?
4. What difference does a trailing slash on a base URL make?
5. Does the server normally receive the fragment?
6. What does `searchParams.get()` return for a missing key?
7. Why use `getAll()`?
8. Are query values automatically converted to numbers or booleans?
9. Why is manual query-string concatenation risky?
10. How do `append()` and `set()` differ?
11. What is the difference between `URL.parse()` and legacy `url.parse()`?
12. Why is `.pathname` not a safe substitute for `fileURLToPath()`?
13. Does successful parsing prove a URL is permitted or safe?
14. What security problem can an unchecked `next` parameter cause?
15. When should a backend reject a user-supplied outbound URL?

## Key takeaway

A URL is a structured address. Start from the browser address bar, then let `URL` parse and normalize that address, use `URLSearchParams` for its query, use a trusted base for relative request targets, and validate structured components before the backend redirects, fetches or opens anything.
