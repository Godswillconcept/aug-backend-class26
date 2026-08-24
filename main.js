const http = require("http");
const { readFileSync, existsSync } = require("fs");
const { join, extname } = require("path");

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
};

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  let fileRoute = req.url === "/" ? "/index.html" : req.url;
  let filePath = join(__dirname, fileRoute);

  if (existsSync(filePath)) {
    const ext = String(extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[ext] || "text/plain";

    try {
      const content = readFileSync(filePath);
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
      return;
    } catch (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      res.end("500 Internal Server Error");
      return;
    }
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("404 Not Found");
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});

// Minimal graceful shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} received, closing server gracefully...`);
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
