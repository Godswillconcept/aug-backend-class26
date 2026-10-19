const { User } = require("../models");
const bcrypt = require("bcryptjs");

class UserController {
  static getAllUsers = async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const { count, rows } = await User.findAndCountAll({
        limit: Number(limit),
        offset: Number(page - 1) * Number(limit),
        attributes: {
          exclude: ["password", "created_at", "updated_at"],
        },
      });
      return res.status(200).json({
        message: "Users fetched successfully",

        data: rows,
        pagination: {
          total: count,
          page: Number(page),
          per_page: Number(limit),
          total_page: Math.ceil(count / limit),
        },

        success: true,
      });
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      return res.status(500).json({ message: "Internal server error", error });
    }
  };

  // get user by id
  static getUserById = async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json({
        message: "User fetched successfully",
        data: user,
        success: true,
      });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({ message: "Internal server error", error });
    }
  };

  // create user
  static createUser = async (req, res) => {
    try {
      const {
        first_name,
        last_name,
        middle_name,
        email,
        password,
        address,
        role,
        is_active,
        gender,
      } = req.body;

      const user = await User.create({
        first_name,
        last_name,
        middle_name,
        email,
        password,
        address,
        role,
        is_active,
        gender,
      });

      return res.status(201).json({
        message: "User created successfully",
        data: user,
        success: true,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error", error });
    }
  };

  // update user
  static updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        first_name,
        last_name,
        middle_name,
        email,
        address,
        role,
        is_active,
        gender,
        password,
      } = req.body;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      console.log("hello i am here");

      const updateData = {
        first_name,
        last_name,
        middle_name,
        email,
        address,
        role,
        is_active,
        gender,
      };

      if (password) {
        updateData.password = password;
      }

      const update = await user.update(updateData);

      return res.status(200).json({
        message: "User updated successfully",
        data: update,
        success: true,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error", error });
    }
  };

  // delete user
  static deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      await user.destroy();
      return res.status(200).json({
        message: "User deleted successfully",
        success: true,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error", error });
    }
  };
}

module.exports = UserController;
