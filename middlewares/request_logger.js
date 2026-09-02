// request logger with full http info

const requestLogger = (req, res, next) => {
  console.log("url", req.url);
  console.log("method", req.method);
  console.log("headers", req.headers);
  console.log("query", req.query);
  console.log("body", req.body);
  next();
};

module.exports = requestLogger;
