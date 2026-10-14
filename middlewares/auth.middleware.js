const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt.config");
const { User, Student, Instructor } = require("../models");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized, Authentication token not found",
      });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, jwtConfig.secret);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        error.statusCode = 401;
        error.message = "Authentication token expired";
        throw error;
      } else {
        error.statusCode = 403;
        error.message = "Invalid authentication token";
        throw error;
      }
    }

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
      include: [
        { model: Student, as: "student", attributes: ["id"] },
        { model: Instructor, as: "instructor", attributes: ["id"] },
      ],
    });

    if (!user || !user.is_active) {
      return res.status(401).json({
        message: "Unauthorized, Invalid or inactive user",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        message: error.message,
      });
    }
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden, You do not have permission to access this resource.Required [${roles.join(", ")}]`,
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize };
