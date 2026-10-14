require("dotenv").config();

module.exports = {
  secret: process.env.JWT_SECRET || "alusoft_training_jwt_secret",
  expiresIn: process.env.JWT_EXPIRES_IN || "24h",
};
