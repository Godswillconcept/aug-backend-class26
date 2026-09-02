const serializeData = (req, res, next) => {
  req.query = JSON.stringify(req.query);
  console.log("from serializeData middleware");
  console.log("query", req.query);
  next();
};

const caseConvert = (req, res, next) => {
  req.url = req.url.toLowerCase();
  console.log("from caseConvert middleware");
  console.log("url", req.url);
  next();
};

const middleware1 = (req, res, next) => {
  console.log("from middleware1");
  next();
};

const middleware2 = (req, res, next) => {
  console.log("from middleware2");
  next();
};

const middleware3 = (req, res, next) => {
  console.log("from middleware3");
  next();
};

module.exports = {
  serializeData,
  caseConvert,
  middleware1,
  middleware2,
  middleware3,
};
