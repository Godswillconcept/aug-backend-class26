const jwtConfig = require("../config/jwt.config");
const { User, Student, Instructor } = require("../models");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");

class AuthController {
  static login = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      const user = await User.findOne({
        where: { email: email },
        include: [
          { model: Student, as: "student" },
          { model: Instructor, as: "instructor" },
        ],
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.is_active) {
        return res.status(400).json({ message: "User is not active" });
      }

      const isMatch = await user.validatePassword(password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn },
      );

      const userJson = user.toJSON();
      delete userJson.password; // Setting user password to null in response

      return res.status(200).json({
        message: "Login successful",
        data: {
          user: userJson,
          token,
        },
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
        error,
      });
    }
  };

  static getCurrentUser = async (req, res) => {
    try {
      const userInfo = req.user;
      const user = await User.findByPk(userInfo.id, {
        include: [
          { model: Student, as: "student" },
          { model: Instructor, as: "instructor" },
          {
            model: Enrolment,
            as: "enrolments",
            include: {
              model: Program,
              as: "program",
            },
          },
        ],
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const userJson = user.toJSON();
      delete userJson.password;

      return res.status(200).json({
        message: "User fetched successfully",
        data: userJson,
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
        error,
      });
    }
  };

  static forgetPassword = async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const otp = otpGenerator.generate(6, {
        digits: true,
        upperCaseAlphabets: true,
        lowerCaseAlphabets: true,
        specialChars: false,
      });
      user.otp = otp;
      user.otp_expires_at = Date.now() + 10 * 60 * 1000; // 10 minutes

      await user.save();

      return res.status(200).json({
        message: "OTP sent successfully",
        data: {
          otp,
        },
        success: true,
      });
    } catch (error) {}
  };

  static changePassword = async (req, res) => {};
}

module.exports = AuthController;
