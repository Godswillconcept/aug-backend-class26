const serializeData = (req, res, next) => {
  req.query = JSON.stringify(req.query);
  console.log("from serializeData middleware");
  console.log("query", req.query);
  next();
};

module.exports = serializeData;
