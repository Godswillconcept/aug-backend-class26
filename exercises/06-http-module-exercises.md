# Student Exercises: Node.js `http` Module

> Use the built-in `node:http` module as described in the [official Node.js HTTP documentation](https://nodejs.org/docs/latest/api/http.html) and [MDN HTTP documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP). Do not use Express or third-party web frameworks for these exercises.

## Instructions

- Use CommonJS (`require("node:http")`).
- Predict outputs and behavior before running your scripts.
- Leverage previous module knowledge: Module 01 (`path`), Module 02 (`fs`), Module 04 (`events`), Module 05 (`url`).
- Use Node’s built-in `node:assert/strict` module for automated assertions and verification tests where applicable.
- Make sure to handle status codes, headers (`Content-Type`), and stream events (`'data'`, `'end'`, `'error'`) properly.

---

## Part A — From Frontend Browser to Backend Server (Conceptual & Protocol)

### Exercise 1: Map Browser `fetch()` to HTTP Request Lines

Given the following frontend JavaScript code executing in a React or Vanilla JS client app:

```js
fetch("http://localhost:3000/api/products?category=laptops&sort=price", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer token123"
  },
  body: JSON.stringify({ name: "MacBook Pro", price: 2500 })
});
```

1. Write out the exact raw HTTP Request Line sent across the network.
2. List the request target (pathname + query string).
3. Identify the headers and payload.
4. On the Node.js backend inside `http.createServer((req, res) => ...)`, state what values `req.method`, `req.url`, and `req.headers["authorization"]` will contain.

### Exercise 2: HTTP Status Code Selection Scenario

For each of the following backend scenarios, select the most appropriate 3-digit HTTP status code and reason phrase:

1. A client successfully retrieves a list of products.
2. A client successfully submits a registration form, creating a new user record in the database.
3. A client attempts to request `/api/admin` without providing an authentication token.
4. A user requests `/products/999999`, but no product exists with that ID.
5. A client submits a POST request with invalid JSON or missing required fields (`name` is missing).
6. A client sends a `DELETE` request to an endpoint that only supports `GET` and `POST`.
7. An unexpected database connection error crashes the request listener handler.

### Exercise 3: Deconstruct Raw HTTP Response Message

Analyze this raw HTTP response transmitted by a Node.js server:

```text
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Content-Length: 48
Location: /api/items/42
Date: Tue, 18 Aug 2026 09:30:00 GMT

{"success":true,"id":42,"message":"Item created"}
```

1. Identify the HTTP protocol version, status code, and status message.
2. List all response header names and values.
3. Explain why `Content-Type` and `Content-Length` are crucial for the browser client receiving this message.

---

## Part B — Basic HTTP Server Setup & Request Inspection

### Exercise 4: Minimal Request Logging Server

Write a Node.js program `logger-server.js` that:
- Creates an HTTP server using `http.createServer()`.
- Listens on port `3000`.
- For every incoming request, logs: `[METHOD] [URL] - User-Agent: [USER_AGENT]` to the console.
- Responds with status `200 OK`, `Content-Type: text/plain`, and the body message `"Request logged successfully"`.

### Exercise 5: URL Parameter Extractor Server

Write a server that inspects incoming requests and parses query parameters using WHATWG `URL` (Module 05):
- Listen on port `3000`.
- Construct a `new URL(req.url, `http://${req.headers.host}`)`.
- Extract the `name` and `age` query parameters (e.g. `/greet?name=Ada&age=25`).
- If `name` is provided, respond with JSON: `{ greeting: "Hello, Ada!", age: 25 }`.
- If `name` is missing, respond with status `400 Bad Request` and JSON: `{ error: "Query parameter 'name' is required" }`.

### Exercise 6: Inspect Built-in Method & Status Dictionaries

Write a script using `node:assert/strict` that:
1. Verifies `http.METHODS` includes `"GET"`, `"POST"`, `"PUT"`, and `"DELETE"`.
2. Verifies `http.STATUS_CODES[200]` equals `"OK"`.
3. Verifies `http.STATUS_CODES[404]` equals `"Not Found"`.
4. Verifies `http.STATUS_CODES[500]` equals `"Internal Server Error"`.

---

## Part C — Formatted Responses & Routing

### Exercise 7: HTML vs JSON Content-Type Server

Create a server on port `3000` with two distinct content endpoints:
- When a user visits `GET /html`, set `Content-Type: text/html` and return `<h1>Hello HTML World</h1>`.
- When a user visits `GET /json`, set `Content-Type: application/json` and return `{ message: "Hello JSON World" }`.
- For any other path, return `404 Not Found` with `Content-Type: text/plain` and message `"404 Page Not Found"`.

### Exercise 8: Path-Based Router

Build a simple path router for a company website:
- `GET /` -> 200 OK, JSON `{ page: "Home", status: "active" }`
- `GET /about` -> 200 OK, JSON `{ page: "About Us", mission: "Teaching Backend JS" }`
- `GET /api/health` -> 200 OK, JSON `{ status: "UP", timestamp: Date.now() }`
- Any other route -> 404 Not Found, JSON `{ error: "Route not found" }`

### Exercise 9: Dynamic HTTP Status Dispatcher

Build a test helper server:
- Listen on port `3000`.
- Parse the request URL path `/status/:code` (e.g., `/status/201`, `/status/403`, `/status/500`).
- Read the 3-digit status code from the URL path.
- Look up the status message from `http.STATUS_CODES[code]`.
- Return a response with that status code and JSON body: `{ statusCode: code, statusMessage: message }`.
- If the status code is not a valid number or not recognized in `http.STATUS_CODES`, return `400 Bad Request`.

---

## Part D — Request Body Parsing & Mini REST API

### Exercise 10: Asynchronous JSON Request Body Parser

Write an asynchronous helper function `parseJsonBody(req)` that returns a Promise:
- Listens to `req.on("data", chunk)` and accumulates chunks into an array.
- On `req.on("end")`, concatenates the buffers into a UTF-8 string.
- Parses the string into a JavaScript object using `JSON.parse()`.
- Resolves with the object, or rejects with an Error if parsing fails or stream errors occur.

Test your function with a sample server receiving a POST request.

### Exercise 11: POST Endpoint with Validation (`/api/register`)

Create an HTTP server with a `POST /api/register` route:
- Parse the incoming JSON body.
- Validate that both `email` and `password` fields exist and are non-empty strings.
- If validation succeeds, respond with status `201 Created` and JSON: `{ success: true, message: "User registered", email }`.
- If validation fails, respond with status `400 Bad Request` and JSON: `{ success: false, error: "Email and password are required" }`.

### Exercise 12: In-Memory REST API for Products Store

Build a complete in-memory CRUD REST API for managing products (`/api/products`):
- Maintain an array `let products = [{ id: 1, name: "Mouse", price: 25 }]`.
- `GET /api/products` -> Returns all products (200 OK).
- `GET /api/products/:id` -> Returns single product by ID or 404 if not found.
- `POST /api/products` -> Validates `name` and `price`, appends new product with auto-increment ID, returns 201 Created.
- `DELETE /api/products/:id` -> Removes product by ID, returns 200 OK with deleted object or 404 if not found.
- Unsupported methods or paths -> 404 or 405.

---

## Part E — Integration & Advanced Server Concepts

### Exercise 13: Secure Static File Server with Path Traversal Protection

Combine Module 01 (`path`), Module 02 (`fs`), Module 05 (`url`), and Module 06 (`http`) to build a static file server:
- Serve files from a `./public` directory.
- Support file extensions `.html`, `.css`, `.js`, `.json`, and `.png` with correct `Content-Type` headers.
- Default `/` to `/index.html`.
- **Security requirement:** Check that the resolved file path starts with the absolute path of `./public`. If a client requests `/../../package.json`, return `403 Forbidden`.
- Return `404 Not Found` if the file does not exist.

### Exercise 14: CORS Preflight Handler for Frontend Apps

Write a server middleware/function `handleCors(req, res)` that:
- Sets `Access-Control-Allow-Origin: *`.
- Sets `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`.
- Sets `Access-Control-Allow-Headers: Content-Type, Authorization`.
- If `req.method === "OPTIONS"`, immediately sends status `204 No Content` and ends the response.

Test this function by making a simulated preflight `OPTIONS` request.

### Exercise 15: Graceful Shutdown Listener

Write an HTTP server program that:
- Listens on port `3000`.
- Listens for process signals `SIGINT` (Ctrl+C) and `SIGTERM`.
- When a signal is caught, calls `server.close()`, logs `"Server closed gracefully"`, and exits with code `0`.
- Demonstrates how active requests finish before the process terminates.
