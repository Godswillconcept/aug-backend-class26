# Node.js HTTP Module: Bridging the Gap from Browser Frontend to Server-Side Backend

> Documentation basis: [official Node.js HTTP API](https://nodejs.org/docs/latest/api/http.html), [Node.js Stream API](https://nodejs.org/docs/latest/api/stream.html), and [MDN: HTTP Overview](https://developer.mozilla.org/en-US/docs/Web/HTTP), reviewed on 18 August 2026. This lesson covers the core `node:http` module, detailing how Node.js listens for incoming HTTP requests and constructs outgoing responses without relying on third-party frameworks.

## Lesson overview

Students transitioning from frontend development already possess strong intuition about HTTP: they type URLs into address bars, inspect requests in browser DevTools (Network tab), trigger `fetch('/api/users')`, and render JSON or HTML data in the DOM. 

The primary goal of this module is to **turn the telescope around**:
- On the **Frontend**, JavaScript acts as the **Client (Requester)** sending requests and waiting for responses.
- On the **Backend**, Node.js acts as the **Server (Listener)** intercepting requests, processing logic/data, and returning responses.

The optimal teaching progression for this module is:

1. **Bridge Frontend knowledge to Backend realities:** Connect `fetch()` and browser DevTools directly to Node.js server listeners.
2. **Deconstruct the HTTP Protocol:** Inspect raw Request Lines, Status Lines, Headers, and Payloads.
3. **Initialize the Server:** Explore `http.createServer()` and the `http.Server` instance.
4. **Master the Request Object (`req`):** Learn `http.IncomingMessage`, path/query parsing with `node:url`, and reading request body streams.
5. **Master the Response Object (`res`):** Learn `http.ServerResponse`, setting status codes, headers, CORS, and writing response bodies.
6. **Build a Vanilla REST API Router:** Route requests by method and path, parsing JSON payloads without Express.
7. **Serve Static Files:** Combine `node:path`, `node:fs`, `node:url`, and `node:http` to serve HTML, CSS, JS, and images.
8. **Security & Production Best Practices:** Prevent path traversal, handle stream errors, set CORS headers, and implement graceful shutdown.

---

## 1. The Frontend-to-Backend Bridge

### 1.1 Shift in Perspective: Client vs. Server

In client-side frontend apps (React, Vue, or Vanilla JS), developers write code that executes inside the user's browser. The browser initiates communication.

| Feature | Frontend (Client) | Backend (Server) |
| --- | --- | --- |
| **Execution Environment** | Browser JavaScript Engine (V8, JavaScriptCore, SpiderMonkey) | Node.js Runtime on a Server/Host Machine |
| **Primary Initiator** | User actions (clicks, form submits, page loads) | Incoming HTTP Requests across the network |
| **Main Network Tool** | `fetch()`, `XMLHttpRequest` | `http.createServer()`, `http.request()` |
| **Role in HTTP** | Sends **Request**, receives **Response** | Listens for **Request**, builds and returns **Response** |
| **Global Scope** | `window`, `document`, `navigator` | `global`, `process`, `Buffer` |

### 1.2 The Request-Response Lifecycle

Every web transaction consists of a strictly paired **Request** and **Response**:

```text
  +-----------------------+                        +-----------------------+
  |    Frontend Client    |                        |    Node.js Server     |
  |  (Browser / fetch())  |                        |   (node:http Module)  |
  +-----------------------+                        +-----------------------+
              |                                                |
              | ---------- HTTP Request (GET /api/users) ----> | (req: IncomingMessage)
              |                                                |   Executes logic,
              |                                                |   queries database,
              |                                                |   formats JSON/HTML
              |                                                |
              | <--------- HTTP Response (200 OK + JSON) ----- | (res: ServerResponse)
              v                                                v
```

### 1.3 Translating `fetch()` to `http.createServer()`

Consider a familiar frontend `fetch()` call:

```js
// Client-side JavaScript (Browser)
fetch("http://localhost:3000/api/products", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Laptop", price: 1200 })
})
  .then(res => res.json())
  .then(data => console.log("Server replied:", data));
```

When this `fetch()` runs, the browser packages the method, URL, headers, and body into a formatted TCP text stream and transmits it to port `3000`.

On the Node.js backend, a server written with `node:http` intercepts that exact packet:

```js
// Server-side Node.js
const http = require("node:http");

const server = http.createServer((req, res) => {
  // req: contains incoming HTTP method ("POST"), url ("/api/products"), headers, and body stream
  // res: object used to send back status code (e.g., 201), headers, and JSON body
});

server.listen(3000, () => console.log("Server listening on port 3000"));
```

---

## 2. Anatomy of the HTTP Protocol

HTTP (Hypertext Transfer Protocol) is a text-based, stateless application-layer protocol. Understanding the physical layout of HTTP messages makes Node.js backend handling completely intuitive.

### 2.1 Anatomy of an HTTP Request

When a client sends a request, the raw text transmitted over the wire looks like this:

```text
POST /api/products?category=electronics HTTP/1.1
Host: localhost:3000
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
Content-Type: application/json
Content-Length: 35
Accept: application/json

{"name":"Laptop","price":1200}
```

This raw HTTP message has three distinct sections:
1. **Request Line:** `[HTTP Method] [Request Target / Path + Query] [HTTP Version]`
2. **Request Headers:** Key-value metadata pairs (Host, User-Agent, Content-Type, Authorization, Cookies).
3. **Empty Line (`\r\n`):** Signals the end of headers and start of the body.
4. **Request Body (Payload):** Optional binary or text data (JSON, form data, file data).

### 2.2 Anatomy of an HTTP Response

When the Node.js server finishes processing, it transmits a response packet back:

```text
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Content-Length: 52
Date: Tue, 18 Aug 2026 09:30:00 GMT
Connection: close

{"success":true,"message":"Product created","id":101}
```

The response message structure mirrors the request:
1. **Status Line:** `[HTTP Version] [Status Code] [Reason Phrase]`
2. **Response Headers:** Metadata sent by the server (Content-Type, Content-Length, Set-Cookie, Access-Control-Allow-Origin).
3. **Empty Line (`\r\n`):** Header-body separator.
4. **Response Body:** The data returned to the client (JSON string, HTML markup, CSS stylesheet, image bytes).

### 2.3 HTTP Methods Overview

Node.js exposes all standard HTTP methods in `http.METHODS` array:

```js
const http = require("node:http");
console.log(http.METHODS);
// ['ACL', 'BIND', 'CHECKOUT', 'CONNECT', 'COPY', 'DELETE', 'GET', 'HEAD', 'POST', 'PUT', 'PATCH', ...]
```

The standard RESTful CRUD mapping used in modern backend development:

| HTTP Method | CRUD Operation | Purpose | Has Request Body? | Idempotent? |
| --- | --- | --- | --- | --- |
| `GET` | Read | Retrieve a resource or list of resources | No | Yes |
| `POST` | Create | Create a new resource | Yes | No |
| `PUT` | Update (Replace) | Completely replace an existing resource | Yes | Yes |
| `PATCH` | Update (Modify) | Partially update an existing resource | Yes | No |
| `DELETE` | Delete | Remove a resource | Optional (usually No) | Yes |
| `OPTIONS` | Preflight | Interrogate server capabilities / CORS permissions | No | Yes |

*Idempotent:* Making multiple identical requests yields the same server state as making a single request.

### 2.4 HTTP Status Codes Overview

Node.js provides a dictionary of standard HTTP status codes in `http.STATUS_CODES`:

```js
const http = require("node:http");
console.log(http.STATUS_CODES[200]); // "OK"
console.log(http.STATUS_CODES[404]); // "Not Found"
console.log(http.STATUS_CODES[500]); // "Internal Server Error"
```

Status codes are grouped into five numerical ranges:

| Category | Range | Meaning | Common Examples |
| --- | --- | --- | --- |
| **1xx Informational** | 100–199 | Request received, continuing process | `100 Continue`, `101 Switching Protocols` |
| **2xx Success** | 200–299 | Action successfully received & accepted | `200 OK`, `201 Created`, `204 No Content` |
| **3xx Redirection** | 300–399 | Further action needed to complete request | `301 Moved Permanently`, `302 Found`, `304 Not Modified` |
| **4xx Client Errors** | 400–499 | Request contains bad syntax or cannot be fulfilled | `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `405 Method Not Allowed` |
| **5xx Server Errors** | 500–599 | Server failed to fulfill an apparently valid request | `500 Internal Server Error`, `502 Bad Gateway`, `503 Service Unavailable` |

---

## 3. The `node:http` Module Core API

The built-in `node:http` module provides server creation capabilities, HTTP client capabilities, and standard header status definitions.

```js
const http = require("node:http");
```

> Official API Reference: [Node.js `http.createServer([options][, requestListener])`](https://nodejs.org/docs/latest/api/http.html#httpcreateserveroptions-requestlistener)

### 3.1 Creating and Running an HTTP Server

The fundamental entry point for any Node.js HTTP application is `http.createServer()`:

```js
const http = require("node:http");

const PORT = 3000;
const HOST = "localhost";

// Create server instance
const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] Incoming ${req.method} request to ${req.url}`);
  
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Hello from Node.js HTTP Server!");
});

// Start listening for connections
server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});
```

### 3.2 Understanding `http.Server` Events

`http.createServer()` returns an instance of [`http.Server`](https://nodejs.org/docs/latest/api/http.html#class-httpserver), which extends [`net.Server`](https://nodejs.org/docs/latest/api/net.html#class-netserver) and Node's `EventEmitter` (covered in Module 04).

Passing a callback to `http.createServer(requestListener)` is shorthand for registering an event listener for the `'request'` event:

```js
const server = http.createServer();

// Equivalent explicit event subscription:
server.on("request", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end("<h1>Event-based Server Response</h1>");
});

server.on("listening", () => {
  console.log("Server is ready and accepting requests.");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use by another application.`);
  } else {
    console.error("Server error:", err);
  }
});

server.listen(PORT);
```

---

## 4. Deconstructing the Request Object (`req` / `http.IncomingMessage`)

When a client sends an HTTP request, Node.js wraps the incoming TCP packet into an instance of [`http.IncomingMessage`](https://nodejs.org/docs/latest/api/http.html#class-httpincomingmessage), typically named `req`.

`req` inherits from `stream.Readable` (Node.js Streams API).

### 4.1 Key Properties of `req`

| Property | Type | Description | Example |
| --- | --- | --- | --- |
| `req.url` | `string` | The request target string (pathname + search query) | `"/products?sort=price"` |
| `req.method` | `string` | The HTTP method in uppercase | `"GET"`, `"POST"`, `"DELETE"` |
| `req.headers` | `object` | Plain JavaScript object with lowercase header keys | `{ "content-type": "application/json", "host": "localhost:3000" }` |
| `req.httpVersion` | `string` | HTTP protocol version string | `"1.1"` |
| `req.socket` | `net.Socket` | Underlying TCP net socket object | `req.socket.remoteAddress` |

### 4.2 Parsing `req.url` using Module 05 (`node:url`)

`req.url` only contains the path and search query (e.g. `/products/laptops?brand=acer`), not the full URL with protocol and host. 

To safely inspect pathnames and query parameters, construct a WHATWG `URL` object using the incoming `Host` header as the base URL:

```js
const http = require("node:http");
const { URL } = require("node:url");

const server = http.createServer((req, res) => {
  // Construct full WHATWG URL object
  const baseURL = `http://${req.headers.host || "localhost:3000"}`;
  const parsedUrl = new URL(req.url, baseURL);

  const pathname = parsedUrl.pathname; // e.g. "/products/laptops"
  const searchParams = parsedUrl.searchParams; // URLSearchParams instance

  const brand = searchParams.get("brand"); // "acer"
  const page = parseInt(searchParams.get("page") || "1", 10);

  console.log({ pathname, brand, page });

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ pathname, brand, page }));
});
```

### 4.3 Reading Request Body Streams

Because `req` is a **Readable Stream**, request bodies do not arrive instantaneously in a single lump. Large payloads (JSON, file uploads, form submissions) arrive asynchronously in chunks.

To capture the body, listen for the `'data'` and `'end'` stream events (from Module 04 `events` and Node Streams):

```js
const http = require("node:http");

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/users") {
    const chunks = [];

    // Collect data chunks as they arrive
    req.on("data", (chunk) => {
      chunks.push(chunk);
    });

    // Emitted when all data chunks have arrived
    req.on("end", () => {
      try {
        // Concatenate binary buffers and convert to UTF-8 string
        const rawBody = Buffer.concat(chunks).toString("utf-8");
        const body = JSON.parse(rawBody); // Parse string into JavaScript object

        console.log("Received user data:", body);

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, user: body }));
      } catch (error) {
        // Handle invalid JSON syntax safely
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: "Invalid JSON body payload" }));
      }
    });

    req.on("error", (err) => {
      console.error("Request stream error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Stream error occurred" }));
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Endpoint Not Found");
  }
});
```

### 4.4 Utility Helper: Reusable Body Parser

Instead of writing `req.on("data")` repeatedly, create a reusable asynchronous helper function using Promises:

```js
function parseRequestBody(req) {
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
```

---

## 5. Constructing the Response Object (`res` / `http.ServerResponse`)

The second argument passed to the request listener is an instance of [`http.ServerResponse`](https://nodejs.org/docs/latest/api/http.html#class-httpserverresponse), typically named `res`.

`res` inherits from `stream.Writable`. It allows backend developers to incrementally write response headers, set status codes, and transmit payload data back to the client.

### 5.1 Setting Status Codes and Status Messages

```js
// Setting status code directly
res.statusCode = 201; // 201 Created
res.statusMessage = "Resource Created Successfully"; // Optional custom message
```

### 5.2 Setting Headers (`res.setHeader` vs. `res.writeHead`)

There are two primary methods for writing response headers in Node.js:

#### Option A: `res.setHeader(name, value)`
Individual header setters. Can be called multiple times before `res.write()` or `res.end()` is invoked. Headers are buffered internally until the first chunk of data is flushed.

```js
res.statusCode = 200;
res.setHeader("Content-Type", "application/json; charset=utf-8");
res.setHeader("X-Powered-By", "Node.js Core HTTP Module");
res.setHeader("Cache-Control", "no-store");
```

#### Option B: `res.writeHead(statusCode[, statusMessage][, headers])`
Flushes the status code and all headers immediately to the network socket. No further `res.setHeader()` calls can be made after `writeHead()` is executed.

```js
res.writeHead(201, {
  "Content-Type": "application/json",
  "Location": "/api/users/102"
});
```

> **Warning:** Calling `setHeader()` after `writeHead()` or after sending data will throw an `ERR_HTTP_HEADERS_SENT` error!

### 5.3 Writing the Body and Ending the Response

- `res.write(chunk)`: Writes a chunk of data (string or `Buffer`) to the response stream. Can be called multiple times.
- `res.end([data])`: Signals to the server that all response headers and body content have been sent. **Must be called on every request** to prevent client connections from hanging indefinitely.

```js
res.setHeader("Content-Type", "text/html; charset=utf-8");
res.write("<!DOCTYPE html><html><body>");
res.write("<h1>Welcome to August Backend Class</h1>");
res.write("<p>Node.js HTTP module in action.</p>");
res.write("</body></html>");
res.end(); // Flushes stream and closes TCP response
```

### 5.4 Setting CORS Headers (Cross-Origin Resource Sharing)

When a frontend web app running on `http://localhost:5173` (e.g. Vite or React) sends a `fetch()` to a Node.js backend on `http://localhost:3000`, the browser enforces Same-Origin Policy (SOP).

To permit cross-origin frontend access, the Node backend must set explicit CORS headers, especially for handling HTTP `OPTIONS` preflight requests:

```js
function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Or specific origin e.g. "http://localhost:5173"
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

const server = http.createServer((req, res) => {
  setCorsHeaders(res);

  // Handle browser CORS preflight check
  if (req.method === "OPTIONS") {
    res.writeHead(204); // 204 No Content
    return res.end();
  }

  // Normal request handling...
});
```

---

## 6. Building a Vanilla REST API Router

Without third-party libraries like Express or Koa, routing in Node.js is accomplished using conditional logic matching `req.method` and the request `pathname`.

### 6.1 Standardized Helper Functions

Create clean, reusable helper utilities for JSON responses and error handling:

```js
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "X-Powered-By": "Node.js HTTP"
  });
  res.end(JSON.stringify(data));
}

function sendError(res, statusCode, message) {
  sendJSON(res, statusCode, {
    success: false,
    error: message,
    statusCode
  });
}
```

### 6.2 Complete Vanilla In-Memory REST API

Here is a clean, production-structured vanilla Node.js REST API for managing a list of students:

```js
const http = require("node:http");
const { URL } = require("node:url");

// In-memory data store
let students = [
  { id: 1, name: "Ada Lovelace", track: "Backend Development" },
  { id: 2, name: "Alan Turing", track: "DevOps Engineering" }
];
let nextId = 3;

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const text = Buffer.concat(chunks).toString("utf-8");
      if (!text) return resolve({});
      try {
        resolve(JSON.parse(text));
      } catch (err) {
        reject(new Error("Invalid JSON format"));
      }
    });
    req.on("error", (err) => reject(err));
  });
}

const server = http.createServer(async (req, res) => {
  const baseURL = `http://${req.headers.host || "localhost:3000"}`;
  const parsedUrl = new URL(req.url, baseURL);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  try {
    // GET /api/students -> Fetch all students (with optional ?track= filter)
    if (method === "GET" && pathname === "/api/students") {
      const trackFilter = parsedUrl.searchParams.get("track");
      let result = students;
      if (trackFilter) {
        result = students.filter(s => s.track.toLowerCase().includes(trackFilter.toLowerCase()));
      }
      return sendJSON(res, 200, { success: true, count: result.length, data: result });
    }

    // GET /api/students/:id -> Fetch single student by ID
    if (method === "GET" && pathname.startsWith("/api/students/")) {
      const idStr = pathname.split("/")[3];
      const id = parseInt(idStr, 10);
      const student = students.find(s => s.id === id);

      if (!student) {
        return sendError(res, 404, `Student with ID ${idStr} not found`);
      }
      return sendJSON(res, 200, { success: true, data: student });
    }

    // POST /api/students -> Create new student
    if (method === "POST" && pathname === "/api/students") {
      const body = await parseRequestBody(req);

      if (!body.name || !body.track) {
        return sendError(res, 400, "Missing required fields: 'name' and 'track'");
      }

      const newStudent = { id: nextId++, name: body.name, track: body.track };
      students.push(newStudent);
      return sendJSON(res, 201, { success: true, data: newStudent });
    }

    // DELETE /api/students/:id -> Delete student by ID
    if (method === "DELETE" && pathname.startsWith("/api/students/")) {
      const idStr = pathname.split("/")[3];
      const id = parseInt(idStr, 10);
      const index = students.findIndex(s => s.id === id);

      if (index === -1) {
        return sendError(res, 404, `Student with ID ${idStr} not found`);
      }

      const deleted = students.splice(index, 1)[0];
      return sendJSON(res, 200, { success: true, message: "Student deleted", data: deleted });
    }

    // Fallback for unknown paths
    sendError(res, 404, `Route ${method} ${pathname} not found`);

  } catch (error) {
    console.error("Unhandled server error:", error);
    sendError(res, 500, "Internal Server Error");
  }
});

server.listen(3000, () => {
  console.log("REST API Server listening at http://localhost:3000/");
});
```

---

## 7. Serving Static Files (Connecting Modules 01, 02, 05, 06)

A key responsibility of web servers is serving static files (HTML, CSS, JS, images). This requires integrating:
- Module 01 (`node:path`): `path.join()`, `path.extname()`
- Module 02 (`node:fs`): `fs.createReadStream()`, `fs.promises.stat()`
- Module 05 (`node:url`): `new URL(req.url, base)`
- Module 06 (`node:http`): `http.createServer()`

### 7.1 Security Notice: Preventing Path Traversal Attacks

A common security vulnerability in vanilla static file servers is **Path Traversal** (or Directory Traversal). If a malicious client sends a request for `http://localhost:3000/../../etc/passwd` or `../../windows/system32`, an unguarded server might read secret system files!

Always resolve target file paths using `path.join()` or `path.resolve()` and verify that the target path begins strictly with the root public directory:

```js
const safePath = path.join(PUBLIC_DIR, pathname);
if (!safePath.startsWith(PUBLIC_DIR)) {
  // Path traversal detected! Block request immediately.
  res.writeHead(403, { "Content-Type": "text/plain" });
  return res.end("Forbidden: Access Denied");
}
```

### 7.2 Complete Static File Server Implementation

```js
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

// Dictionary of supported MIME types
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const server = http.createServer(async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain" });
    return res.end("Method Not Allowed");
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  let reqPath = parsedUrl.pathname;

  // Default root path '/' to '/index.html'
  if (reqPath === "/") reqPath = "/index.html";

  // Prevent Directory Traversal Attack
  const filePath = path.normalize(path.join(PUBLIC_DIR, reqPath));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    return res.end("403 Forbidden");
  }

  try {
    const stats = await fs.promises.stat(filePath);

    if (!stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      return res.end("404 Not Found");
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": stats.size,
      "Cache-Control": "public, max-age=3600"
    });

    // Stream file contents directly into the response writable stream
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on("error", (err) => {
      console.error("File stream error:", err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("500 Internal Server Error");
      }
    });

  } catch (error) {
    if (error.code === "ENOENT") {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 File Not Found");
    } else {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("500 Internal Server Error");
    }
  }
});

server.listen(PORT, () => {
  console.log(`Static File Server running at http://localhost:${PORT}/ serving directory ${PUBLIC_DIR}`);
});
```

---

## 8. Robustness, Best Practices & Graceful Shutdown

### 8.1 Summary Comparison Table: Frontend vs. Backend Concepts

| Frontend (Client / Browser) | Backend (Node.js `node:http`) |
| --- | --- |
| `window.location.href` | `req.url` & `new URL(req.url, base)` |
| `fetch(url, { method: 'POST' })` | `http.createServer((req, res) => ...)` |
| `response.json()` | `JSON.parse(rawStreamBody)` |
| `response.status` | `res.statusCode = 200` |
| `response.headers.get('content-type')` | `req.headers['content-type']` |
| `DevTools Network Tab` | Server console logs / terminal output |
| Browser DOM Rendering | `res.write()` / `res.end()` |

### 8.2 Graceful Shutdown Pattern

When stopping a server (e.g. pressing `Ctrl+C` or deploying an update), closing the server gracefully allows existing active requests to finish while rejecting new incoming TCP connections:

```js
const http = require("node:http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Processing complete");
});

server.listen(3000, () => console.log("Server running..."));

function handleShutdown(signal) {
  console.log(`Received ${signal}. Closing HTTP server gracefully...`);
  server.close(() => {
    console.log("HTTP server closed. All connections terminated clean. Exiting process.");
    process.exit(0);
  });

  // Force close after 10 seconds if connections hang
  setTimeout(() => {
    console.error("Could not close connections in time, forcing shutdown.");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));
```

---

## 9. Summary & Essential Cheat Sheet

```js
const http = require("node:http");
const { URL } = require("node:url");

// 1. Create Server
const server = http.createServer((req, res) => {
  // 2. Read Request Info
  const method = req.method; // "GET", "POST", etc.
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const pathname = urlObj.pathname;
  const contentType = req.headers["content-type"];

  // 3. Read Body (if applicable)
  let body = "";
  req.on("data", chunk => { body += chunk; });
  req.on("end", () => {

    // 4. Set Headers & Status
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");

    // 5. Send Response Body & End
    res.end(JSON.stringify({ success: true, path: pathname, method }));
  });
});

// 6. Start Listening
server.listen(3000, () => console.log("Server listening on port 3000"));
```
