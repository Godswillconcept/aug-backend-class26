const { User } = require("../models");

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
        data: {
          users: rows,
          meta: {
            total: count,
            page: Number(page),
            per_page: Number(limit),
            total_page: Math.ceil(count / limit),
          },
        },
        success: true,
      });
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}

module.exports = UserController;
