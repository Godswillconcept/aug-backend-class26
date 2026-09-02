const caseConvert = (req, res, next) => {
  req.url = req.url.toLowerCase();
  console.log("from caseConvert middleware");
  console.log("url", req.url);
  next();
};

module.exports = caseConvert;
