const jwtConfig = require("../config/jwt.config");
const { User, Student, Instructor } = require("../models");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const emailService = require("../services/email.service");

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
          { model: Student, as: "student", attributes: { exclude: ["user_id", "created_at", "updated_at"] } },
          { model: Instructor, as: "instructor", attributes: { exclude: ["user_id", "created_at", "updated_at"] } },
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
      console.log("error", error);
      return res.status(500).json({
        message: "Internal Server Error",
        error,
      });
    }
  };

  static getCurrentUser = async (req, res) => {
    try {
      const user = req.user; // authenticated
      if (!user) {
        return res
          .status(401)
          .json({ message: "Unauthorized", success: false });
      }
      return res.status(200).json({
        message: "User fetched successfully",
        data: user,
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
      await emailService.sendPasswordResetEmail(user, otp)
      await user.save();

      return res.status(200).json({
        message: "OTP sent successfully",
        data: {
          otp,
        },
        success: true,
      });
    } catch (error) {
      console.log('error', error);
      return res.status(500).json({
        message: "Internal Server Error",
        error,
      });
    }
  };

  static resetPassword = async (req, res) => {
    try {
      const { otp, password } = req.body;
      const user = await User.findOne({ where: { otp } });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.otp_expires_at < Date.now()) {
        return res.status(400).json({ message: "OTP has expired" });
      }
      user.password = password;
      user.otp = null;
      user.otp_expires_at = null;
      await user.save();
      return res.status(200).json({
        message: "Password reset successful",
        success: true,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
        error,
      });
    }
  };

  static changePassword = async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          message: "Current password and new password are required",
          success: false,
        });
      }

      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized", success: false });
      }

      // Fetch user from DB to include password column (excluded by authenticate middleware)
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found", success: false });
      }

      const isMatch = await user.validatePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      user.password = newPassword;
      await user.save();

      return res.status(200).json({
        message: "Password changed successfully",
        success: true,
      });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({
        message: "Internal Server Error",
        error,
      });
    }
  };

  static updateProfile = async (req, res) => {
    try {
      const { first_name, last_name, middle_name, email, address, gender, dob, guardian_name, guardian_email, guardian_phone, bio, specialization, years_experience } = req.body;
      const user = await User.findByPk(req.user.id, {
        include: [
          { model: Student, as: "student", attributes: { exclude: ["user_id", "created_at", "updated_at"] } },
          { model: Instructor, as: "instructor", attributes: { exclude: ["user_id", "created_at", "updated_at"] } },
        ],
      });
      if (!user) {
        return res.status(404).json({ message: "User not found", success: false });
      }

      await user.update({
        first_name,
        last_name,
        middle_name,
        email,
        address,
        gender,
      });


      if (req.user.role === 'student') {
        const student = await Student.findOne({ where: { user_id: req.user.id } });
        if (!student) {
          return res.status(404).json({ message: "Student not found", success: false });
        }
        await student.update({ dob, guardian_name, guardian_email, guardian_phone });
      }

      if (req.user.role === 'instructor') {
        const instructor = await Instructor.findOne({ where: { user_id: req.user.id } });
        if (!instructor) {
          return res.status(404).json({ message: "Instructor not found", success: false });
        }
        await instructor.update({ bio, specialization, years_experience });
      }

      const userJson = user.toJSON();
      delete userJson.password; // Setting user password to null in response
      return res.status(200).json({
        message: "User Profile updated successfully",
        data: userJson,
        success: true,
      });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({
        message: "Internal Server Error",
        error,
      });
    }
  }

  static changeProfilePicture = async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized", success: false });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Profile picture is required", success: false });
      }

      // Upload new profile picture
      await user.update({ profile_pic: req.file.path });

      const userJson = user.toJSON();
      delete userJson.password; // Setting user password to null in response

      return res.status(200).json({
        message: "Profile picture changed successfully",
        data: userJson,
        success: true,
      });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({
        message: "Internal Server Error",
        error,
      });
    }
  }
}

module.exports = AuthController;
