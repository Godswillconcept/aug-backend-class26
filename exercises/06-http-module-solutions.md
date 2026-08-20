# Instructor Guide and Solutions: Node.js `http` Module

> Based on the [official Node.js HTTP documentation](https://nodejs.org/docs/latest/api/http.html), reviewed on 18 August 2026. Keep this guide separate during assessed exercises.

Unless otherwise shown:

```js
const http = require("node:http");
const assert = require("node:assert/strict");
const { URL } = require("node:url");
```

---

## Part A Solutions — From Frontend Browser to Backend Server

### Exercise 1 Solution

1. **Raw HTTP Request Line:**
   ```text
   POST /api/products?category=laptops&sort=price HTTP/1.1
   ```
2. **Request Target:**
   - Pathname: `/api/products`
   - Query String: `?category=laptops&sort=price`
3. **Headers & Payload:**
   - Headers: `Content-Type: application/json`, `Authorization: Bearer token123`, `Host: localhost:3000`
   - Payload (Body): `{"name":"MacBook Pro","price":2500}`
4. **Node.js `req` Object Property Values:**
   - `req.method`: `"POST"`
   - `req.url`: `"/api/products?category=laptops&sort=price"`
   - `req.headers["authorization"]`: `"Bearer token123"` (Node lowercases all header keys automatically).

### Exercise 2 Solution

1. **200 OK:** Successfully retrieving a list of products.
2. **201 Created:** Successfully creating a new user record.
3. **401 Unauthorized:** Missing authentication token/credentials.
4. **404 Not Found:** Requested resource ID does not exist.
5. **400 Bad Request:** Malformed payload or missing required validation fields.
6. **405 Method Not Allowed:** Target route exists, but the HTTP method (`DELETE`) is not supported.
7. **500 Internal Server Error:** Unexpected database or runtime error on the backend server.

### Exercise 3 Solution

1. **Protocol, Status, and Reason:**
   - Protocol version: `HTTP/1.1`
   - Status Code: `201`
   - Status Message: `Created`
2. **Response Headers:**
   - `Content-Type`: `application/json; charset=utf-8`
   - `Content-Length`: `48`
   - `Location`: `/api/items/42`
   - `Date`: `Tue, 18 Aug 2026 09:30:00 GMT`
3. **Importance of `Content-Type` and `Content-Length`:**
   - `Content-Type` informs the browser how to interpret the incoming byte stream (e.g. parse as JSON, render as HTML, or download as binary).
   - `Content-Length` tells the client exactly how many bytes to expect in the response body before closing the socket.

---

## Part B Solutions — Basic HTTP Server Setup & Request Inspection

### Exercise 4 Solution

```js
const http = require("node:http");

const PORT = 3000;

const server = http.createServer((req, res) => {
  const method = req.method;
  const url = req.url;
  const userAgent = req.headers["user-agent"] || "Unknown";

  console.log(`[${new Date().toISOString()}] ${method} ${url} - User-Agent: ${userAgent}`);

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Request logged successfully");
});

server.listen(PORT, () => {
  console.log(`Logger server running on http://localhost:${PORT}`);
});
```

### Exercise 5 Solution

```js
const http = require("node:http");
const { URL } = require("node:url");

const server = http.createServer((req, res) => {
  const baseURL = `http://${req.headers.host || "localhost:3000"}`;
  const parsedUrl = new URL(req.url, baseURL);
  const searchParams = parsedUrl.searchParams;

  const name = searchParams.get("name");
  const age = searchParams.get("age");

  if (!name) {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Query parameter 'name' is required" }));
  }

  const responseData = {
    greeting: `Hello, ${name}!`,
    age: age ? parseInt(age, 10) : null
  };

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(responseData));
});

server.listen(3000, () => {
  console.log("Greeting server listening on port 3000");
});
```

### Exercise 6 Solution

```js
const http = require("node:http");
const assert = require("node:assert/strict");

// 1. Verify HTTP methods
assert.ok(http.METHODS.includes("GET"));
assert.ok(http.METHODS.includes("POST"));
assert.ok(http.METHODS.includes("PUT"));
assert.ok(http.METHODS.includes("DELETE"));

// 2. Verify status code dictionaries
assert.equal(http.STATUS_CODES[200], "OK");
assert.equal(http.STATUS_CODES[404], "Not Found");
assert.equal(http.STATUS_CODES[500], "Internal Server Error");

console.log("All http module dictionary assertions passed successfully.");
```

---

## Part C Solutions — Formatted Responses & Routing

### Exercise 7 Solution

```js
const http = require("node:http");

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end("<h1>Hello HTML World</h1>");
  }

  if (req.method === "GET" && req.url === "/json") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify({ message: "Hello JSON World" }));
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("404 Page Not Found");
});

server.listen(3000, () => {
  console.log("Content-Type server running on port 3000");
});
```

### Exercise 8 Solution

```js
const http = require("node:http");

function sendJSON(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

const server = http.createServer((req, res) => {
  const { method, url } = req;

  if (method === "GET" && url === "/") {
    return sendJSON(res, 200, { page: "Home", status: "active" });
  }

  if (method === "GET" && url === "/about") {
    return sendJSON(res, 200, { page: "About Us", mission: "Teaching Backend JS" });
  }

  if (method === "GET" && url === "/api/health") {
    return sendJSON(res, 200, { status: "UP", timestamp: Date.now() });
  }

  sendJSON(res, 404, { error: "Route not found" });
});

server.listen(3000, () => console.log("Path router server active on port 3000"));
```

### Exercise 9 Solution

```js
const http = require("node:http");
const { URL } = require("node:url");

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname; // e.g. "/status/404"

  if (pathname.startsWith("/status/")) {
    const codeStr = pathname.split("/")[2];
    const statusCode = parseInt(codeStr, 10);

    if (isNaN(statusCode) || !http.STATUS_CODES[statusCode]) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: `Invalid status code: ${codeStr}` }));
    }

    const statusMessage = http.STATUS_CODES[statusCode];
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ statusCode, statusMessage }));
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Use path /status/:code" }));
});

server.listen(3000, () => console.log("Status dispatcher server running on port 3000"));
```

---

## Part D Solutions — Request Body Parsing & Mini REST API

### Exercise 10 Solution

```js
const http = require("node:http");

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const rawText = Buffer.concat(chunks).toString("utf-8");
      if (!rawText) return resolve({});
      try {
        resolve(JSON.parse(rawText));
      } catch (err) {
        reject(new Error("Invalid JSON format"));
      }
    });
    req.on("error", (err) => reject(err));
  });
}

// Verification test server
const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/echo") {
    try {
      const body = await parseJsonBody(req);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ received: body }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
});

server.listen(3000, () => console.log("Body parser test server listening..."));
```

### Exercise 11 Solution

```js
const http = require("node:http");

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const text = Buffer.concat(chunks).toString("utf-8");
      if (!text) return resolve({});
      try {
        resolve(JSON.parse(text));
      } catch (err) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", (err) => reject(err));
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/register") {
    try {
      const body = await parseJsonBody(req);
      const { email, password } = body;

      if (!email || typeof email !== "string" || !password || typeof password !== "string") {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({
          success: false,
          error: "Email and password are required strings"
        }));
      }

      res.writeHead(201, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({
        success: true,
        message: "User registered successfully",
        email
      }));
    } catch (error) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ success: false, error: "Malformed JSON payload" }));
    }
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Endpoint not found" }));
});

server.listen(3000, () => console.log("Registration API listening on port 3000"));
```

### Exercise 12 Solution

```js
const http = require("node:http");
const { URL } = require("node:url");

let products = [
  { id: 1, name: "Mouse", price: 25 },
  { id: 2, name: "Keyboard", price: 75 }
];
let nextId = 3;

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const text = Buffer.concat(chunks).toString("utf-8");
      if (!text) return resolve({});
      try { resolve(JSON.parse(text)); } catch (err) { reject(err); }
    });
    req.on("error", (err) => reject(err));
  });
}

function sendJSON(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // GET /api/products
  if (method === "GET" && pathname === "/api/products") {
    return sendJSON(res, 200, { success: true, data: products });
  }

  // GET /api/products/:id
  if (method === "GET" && pathname.startsWith("/api/products/")) {
    const id = parseInt(pathname.split("/")[3], 10);
    const product = products.find(p => p.id === id);
    if (!product) return sendJSON(res, 404, { success: false, error: "Product not found" });
    return sendJSON(res, 200, { success: true, data: product });
  }

  // POST /api/products
  if (method === "POST" && pathname === "/api/products") {
    try {
      const body = await parseJsonBody(req);
      if (!body.name || typeof body.price !== "number") {
        return sendJSON(res, 400, { success: false, error: "Name and numeric price are required" });
      }
      const newProduct = { id: nextId++, name: body.name, price: body.price };
      products.push(newProduct);
      return sendJSON(res, 201, { success: true, data: newProduct });
    } catch (err) {
      return sendJSON(res, 400, { success: false, error: "Invalid JSON" });
    }
  }

  // DELETE /api/products/:id
  if (method === "DELETE" && pathname.startsWith("/api/products/")) {
    const id = parseInt(pathname.split("/")[3], 10);
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return sendJSON(res, 404, { success: false, error: "Product not found" });
    const deleted = products.splice(index, 1)[0];
    return sendJSON(res, 200, { success: true, data: deleted });
  }

  sendJSON(res, 404, { success: false, error: "Route not found" });
});

server.listen(3000, () => console.log("Products REST API running at http://localhost:3000"));
```

---

## Part E Solutions — Integration & Advanced Server Concepts

### Exercise 13 Solution

```js
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");

const PUBLIC_DIR = path.resolve(__dirname, "public");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png"
};

const server = http.createServer(async (req, res) => {
  if (req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "text/plain" });
    return res.end("Method Not Allowed");
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let reqPath = parsedUrl.pathname;
  if (reqPath === "/") reqPath = "/index.html";

  // Prevent Path Traversal Attack
  const targetPath = path.normalize(path.join(PUBLIC_DIR, reqPath));
  if (!targetPath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    return res.end("403 Forbidden: Directory Traversal Blocked");
  }

  try {
    const stats = await fs.promises.stat(targetPath);
    if (!stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("404 Not Found");
    }

    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": stats.size
    });

    fs.createReadStream(targetPath).pipe(res);
  } catch (err) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 File Not Found");
  }
});

server.listen(3000, () => console.log("Secure static server listening on port 3000"));
```

### Exercise 14 Solution

```js
const http = require("node:http");

function applyCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

const server = http.createServer((req, res) => {
  applyCorsHeaders(res);

  // Handle CORS preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.writeHead(204); // 204 No Content
    return res.end();
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "CORS-enabled endpoint response" }));
});

server.listen(3000, () => console.log("CORS server listening on port 3000"));
```

### Exercise 15 Solution

```js
const http = require("node:http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Request processed");
});

server.listen(3000, () => {
  console.log("Server running. Press Ctrl+C to test graceful shutdown.");
});

function gracefulShutdown(signal) {
  console.log(`\nCaught ${signal}. Closing server gracefully...`);
  server.close(() => {
    console.log("HTTP Server closed. Cleaning resources and exiting.");
    process.exit(0);
  });
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
```
