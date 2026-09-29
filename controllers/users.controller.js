const { User } = require("../models");

/// create user

// User.create({}) => data create

class UserController {
  static createUser = async (req, res) => {
    const { first_name, last_name, middle_name, email, gender, password } =
      req.body;

    const data = await User.create({
      first_name: first_name,
      last_name: last_name,
      middle_name: middle_name,
      email: email,
      password: password,
      gender: gender,
    });

    return res.status(201).json({ message: "User Created Successfully", data });
  };

  static async getAllUsers(req, res) {
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    let { count, rows } = await User.findAndCountAll({
      limit: limit,
      offset: (page - 1) * limit,
    });

    return res.status(200).json({
      message: "Users fetched successfully",
      data: rows,
      meta: {
        limit: limit,
        offset: (page - 1) * limit,
        totalCount: count,
      },
    });
  }

  static async getUserById(req, res) {
    let { id } = req.params;
    let user = await User.findByPk(Number(id));
    if (!user) {
      return res.status(404).json({ message: "User id not found" });
    }
    return res.status(200).json({ message: "User found", data: user });
  }

  static async getUsersWithFilter(req, res) {
    const { gender, email } = req.query;
    let users = await User.findAll({
      where: {
        gender: gender,
        email: email,
      },
    });

    return res
      .status(200)
      .json({ message: "Users fetched successfully", data: users });
  }

  static async getUserByEmail(req, res) {
    const { email } = req.params;
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "User found", data: user });
  }

  static async updateUser(req, res) {
    const { id } = req.params;
    const { first_name, last_name, middle_name, email, password, gender } =
      req.body;
    const user = await User.findByPk(Number(id));
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    user.update({
      first_name: first_name,
      last_name: last_name,
      middle_name: middle_name,
      email: email,
      password: password,
      gender: gender,
    });

    return res
      .status(200)
      .json({ message: "User updated successfully", data: user });
  }

  static async deleteUser(req, res) {
    const { id } = req.params;
    const user = await User.findByPk(Number(id));
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    user.destroy();
    return res.status(200).json({ message: "User deleted successfully" });
  }
}

module.exports = UserController;
