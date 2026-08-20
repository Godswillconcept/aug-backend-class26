# Student Exercises: Node.js `url` Module

> Use the browser-compatible WHATWG `URL` API described in the [official Node.js URL documentation](https://nodejs.org/docs/latest/api/url.html). Do not use the deprecated legacy `url.parse()` API unless an exercise explicitly asks you to identify it.

## Instructions

- Use CommonJS unless an exercise requests an ES module.
- Predict each output before running the program.
- Prefer `new URL()` and `URLSearchParams` over manual splitting or concatenation.
- Remember that query values are strings and user input must be validated.
- Use Node’s built-in `node:assert/strict` module to verify coding answers.

---

## Part A — From the browser address bar

### Exercise 1: Label the address

For this URL, identify the protocol, hostname, port, pathname, query string and fragment:

```text
https://learn.example.com:8443/courses/node/events?level=beginner&mode=class#exercise-4
```

Also state which component is normally not sent to the HTTP server.

### Exercise 2: URL vocabulary

Explain why `example.com`, `/products`, `?page=2` and the complete URL are not interchangeable. Define hostname, pathname, search and `href`.

### Exercise 3: Parse a familiar URL

Construct a `URL` from:

```text
https://shop.example.com:8080/products/laptops?brand=acer&page=2#reviews
```

Assert the values of `protocol`, `host`, `hostname`, `port`, `origin`, `pathname`, `search`, `hash` and `href`.

### Exercise 4: `host` versus `hostname`

Predict and then verify:

```js
const url = new URL("http://localhost:3000/users");
console.log(url.host);
console.log(url.hostname);
console.log(url.port);
```

### Exercise 5: Default ports

Compare the serialized result and `port` property for:

```text
http://example.com:80/a
https://example.com:443/a
https://example.com:8443/a
```

Explain the result.

---

## Part B — Construction, mutation and resolution

### Exercise 6: Construct and modify

Begin with `http://example.com`. Change it through URL properties so the final address is:

```text
https://api.example.com:8443/v1/users?active=true#results
```

Do not replace `href` with the completed string.

### Exercise 7: Safe product URL builder

Write `buildProductUrl(productId, referralCode)` which returns a `URL` for:

```text
https://shop.example.com/products/PRODUCT_ID?ref=REFERRAL_CODE
```

Values may contain spaces, `&`, `#` or `/`. Ensure data is encoded in the intended component and decide how product IDs containing `/` should behave.

### Exercise 8: Relative references

Using the base `https://example.com/courses/node/lesson-1`, predict and verify the results of resolving:

- `/about`
- `lesson-2`
- `../javascript`
- `?page=2`
- `#quiz`

### Exercise 9: Trailing slash investigation

Explain why these produce different results:

```js
new URL("lesson", "https://example.com/courses");
new URL("lesson", "https://example.com/courses/");
```

### Exercise 10: Invalid input

Write `parseAbsoluteUrl(input)` that returns a `URL` when valid and `null` otherwise. Implement one version with `try...catch` and one with `URL.canParse()`.

---

## Part C — Query parameters

### Exercise 11: Read a product query

Given:

```text
https://shop.example.com/products?brand=acer&page=2&inStock=true
```

Read the three parameters. Assert their types and explain why `page` and `inStock` are not a number and boolean yet.

### Exercise 12: Missing versus empty

For `?q=&page=2`, compare `get("q")` with `get("missing")`. Write assertions that prove the difference.

### Exercise 13: Repeated parameters

For `?tag=node&tag=backend&tag=events`, demonstrate the difference between `get("tag")` and `getAll("tag")`.

### Exercise 14: `append()` versus `set()`

Start with `tag=node&tag=backend`. First append `javascript`, record the result, then set `tag` to `api` and record the result. Explain what was removed.

### Exercise 15: Build a search query

Write `buildSearchUrl({ q, tags, page })`. It should:

- use `https://example.com/search`;
- set `q`;
- append every tag under the repeated key `tag`;
- include `page` only when supplied;
- return a `URL` object.

Test with a search value containing `&` and a tag containing a space.

### Exercise 16: Iterate and transform

Turn `name=Ada&skill=Node&skill=JavaScript` into an object whose repeated fields become arrays:

```js
{ name: ["Ada"], skill: ["Node", "JavaScript"] }
```

### Exercise 17: Validate pagination

Write `readPage(searchParams)` with these rules:

- missing `page` defaults to `1`;
- it must contain a base-10 positive integer;
- reject `0`, negative numbers, decimals, `2abc`, empty strings and repeated `page` keys.

### Exercise 18: Sort parameters

Sort `z=9&a=1&m=5&a=2`. State what happens to repeated `a` values and give one practical reason to produce a stable parameter order.

---

## Part D — Backend use

### Exercise 19: Parse an incoming request target

Given `request.url === "/products?category=books&page=3"`, create a usable `URL` with the trusted base `http://localhost:3000`. Extract pathname, category and page.

Explain why `new URL(request.url)` alone fails.

### Exercise 20: Tiny HTTP router

Create a server with `node:http` that supports:

- `GET /` → `Welcome`;
- `GET /products?page=N` → `Products page N`;
- any other pathname → status 404 and `Not found`.

Parse the request target using `URL`. Reject an invalid page with status 400. Test it in a browser and stop the server afterward.

### Exercise 21: Path parameter versus query parameter

For `/users/42?include=posts`, extract `42` from the pathname and `posts` from the query. Explain why `URL` knows about the query parameter but not the application’s `/users/:id` route pattern.

### Exercise 22: Fragment boundary

A user visits:

```text
https://example.com/docs?lang=en#installation
```

What request target does the server normally receive? Why must a server not rely on the fragment for authentication or routing?

### Exercise 23: Outbound weather API

Write `buildWeatherUrl(city, units)` for `https://weather.example/api/current`. The city `Lagos Island` must be encoded correctly. Pass the resulting `URL` object directly to a mocked `fetch` function and verify it received a `URL`.

### Exercise 24: HTTP options

Convert `https://api.example.com:8443/v1/users?page=2` using `urlToHttpOptions()`. Inspect `protocol`, `hostname`, `port`, `path` and `href`.

---

## Part E — File URLs and compatibility

### Exercise 25: Path and file URL round trip

Convert `__filename` to a file URL with `pathToFileURL()`, then back with `fileURLToPath()`. Verify that the resolved original and returned path are equal.

### Exercise 26: Encoded file characters

Explain why `pathToFileURL()` is safer than constructing `new URL(path, "file:")` when a filename contains `#`, `%` or spaces. Demonstrate with a path named `report #1.txt`.

### Exercise 27: ES module directory

In an `.mjs` example, derive the current filename and directory from `import.meta.url` using `fileURLToPath()` and `dirname()`.

### Exercise 28: Legacy-code review

Review this code:

```js
const url = require("node:url");
const parsed = url.parse(input, true);
console.log(parsed.query.page);
```

Rewrite it with the WHATWG API. Explain the difference between deprecated `url.parse()` and modern static `URL.parse()`.

---

## Part F — Validation and security

### Exercise 29: Safe redirect

Write `getSafeRedirect(rawTarget)` for an application hosted at `https://app.example.com`. Accept same-origin destinations such as `/dashboard?tab=billing`, but reject:

- `https://evil.example/steal`;
- `//evil.example/steal`;
- a URL with a different protocol or port.

Return only pathname, search and hash after validation.

### Exercise 30: URL allow-list

Write `validateApiUrl(input)` that accepts only:

- HTTPS;
- hostname exactly `api.example.com` or a subdomain ending `.api.example.com`;
- no username or password;
- no non-default port;
- pathname beginning `/v1/`.

Return the parsed `URL` or throw a clear error. Test valid and invalid cases, including `evil-api.example.com` and `api.example.com.evil.test`.

---

## Pair project: Product catalogue request parser

Build `parseCatalogueRequest(requestTarget)` for a fictional shop.

Requirements:

1. The trusted base is `https://shop.example.com`.
2. Only the pathname `/products` is accepted.
3. Supported parameters are `q`, repeated `category`, `page`, `limit`, `sort` and `inStock`.
4. Reject every unknown parameter.
5. `q` defaults to an empty string and is trimmed.
6. `category` becomes an array.
7. `page` defaults to 1 and must be a positive integer.
8. `limit` defaults to 20 and must be an integer from 1 through 100.
9. `sort` must be `price`, `name` or `newest`; default to `newest`.
10. `inStock` accepts only `true` or `false` and becomes a boolean.
11. Reject repeated values for every parameter except `category`.
12. Return a frozen plain object containing the validated filters.

Example:

```js
parseCatalogueRequest(
  "/products?q=node&category=books&category=courses&page=2&limit=10&sort=price&inStock=true"
);

// {
//   q: "node",
//   categories: ["books", "courses"],
//   page: 2,
//   limit: 10,
//   sort: "price",
//   inStock: true
// }
```

Add at least eight tests, including malicious or malformed input.

---

## Suggested marking guide

| Area | Marks |
| --- | ---: |
| Correct URL anatomy and terminology | 10 |
| Construction, mutation and relative resolution | 15 |
| Query parameter handling and encoding | 25 |
| Backend request parsing | 15 |
| File URL conversions | 10 |
| Validation and security reasoning | 15 |
| Readable code and meaningful tests | 10 |
| **Total** | **100** |

## Exit ticket

Answer without running code:

1. What does `new URL()` return?
2. Which property contains hostname and port?
3. Does `searchParams.get()` return a number?
4. Which method reads every repeated value?
5. How does `set()` differ from `append()`?
6. Does a browser send `#fragment` to the HTTP server?
7. Why does an incoming `request.url` commonly need a base?
8. Which function converts a file URL to a filesystem path?
9. Does `URL.canParse()` prove that a URL is authorized?
10. Which API should new code avoid: `new URL()` or legacy `url.parse()`?
