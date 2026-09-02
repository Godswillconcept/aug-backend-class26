const express = require("express"); // 3rd Party module
const app = express();
const { URL } = require("url"); // Built in module
const path = require("path"); // Built in module
const requestLogger = require("./middlewares/request_logger");
const {
  serializeData,
  caseConvert,
  middleware1,
  middleware2,
  middleware3,
} = require("./middlewares");

app.use(requestLogger); // global middleware

/// Middleware Functions
// 1. inline Middleware Function
// 2. named Middleware Function
// 3. array of Middleware Function
// 4. modular Middleware Function

// 1. inline Middleware Function

app.get(
  "/",
  (req, res, next) => {
    console.log("url", req.url);
    console.log("method", req.method);
    console.log("from inline middleware");
    next();
  },
  (req, res) => {
    res.end("Hello world");
  },
);

app.get(
  "/health",
  (req, res, next) => {
    const { headers } = req;
    const host = headers.host;
    const origin = new URL(`http://${host}`).origin;
    console.log("from inline middleware");
    console.log("host", host);
    console.log("origin", origin);
    next();
  },
  (req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write("health");
    res.end();
  },
);

app.get(
  "/monitor",
  (req, res, next) => {
    console.log("time", new Date().toLocaleTimeString());
    console.log("from inline middleware");
    next();
  },
  (req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write("monitor");
    res.end();
  },
);

// named Middleware Function

// const caseConvert = (req, res, next) => {
//   req.url = req.url.toLowerCase();
//   console.log("from caseConvert middleware");
//   console.log("url", req.url);
//   next();
// };
// usage of named middleware function
app.get("/TeSt", caseConvert, (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("test");
  res.end();
});

// another example of named middleware function
// const serializeData = (req, res, next) => {
//   req.query = JSON.stringify(req.query);
//   console.log("from serializeData middleware");
//   console.log("query", req.query);
//   next();
// };
// usage of named middleware function
app.get("/serialize", serializeData, (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("serialize");
  res.end();
});

// usage of both named and inline middleware functions
app.get(
  "/dashboard",
  (req, res, next) => {
    const { name } = req.query;
    if (!name) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.write(JSON.stringify({ message: "Name is required" }));
      res.end();
      return;
    }
    next();
  },
  caseConvert,
  serializeData,
  (req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write("dashboard");
    res.end();
  },
);

// array of middleware functions

// const middleware1 = (req, res, next) => {
//   console.log("from middleware1");
//   next();
// };

// const middleware2 = (req, res, next) => {
//   console.log("from middleware2");
//   next();
// };

// const middleware3 = (req, res, next) => {
//   console.log("from middleware3");
//   next();
// };

app.get("/array", [middleware1, middleware2, middleware3], (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("array");
  res.end();
});

app.get("/list", [caseConvert, serializeData], (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("list");
  res.end();
});

app.post("/users", requestLogger, (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("users");
  res.end();
});

app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

app.listen(3000, () => {
  console.log(`Server is running on port http://localhost:3000`);
});
