const http = require("http");
const server = http.createServer((req, res) => {
  if (req.url === "/" && req.method === "GET") {
    res.end("Hello world");
  } else if (req.url === "/about" && req.method === "GET") {
    res.end("About page");
  } else if (req.url === "/contact" && req.method === "GET") {
    res.end("Contact page");
  } else {
    res.end("Page not found");
  }
});

server.listen(4000, () => {
  console.log("server is running on port http://localhost:4000");
});
