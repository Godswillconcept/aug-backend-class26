const fs = require("fs");
const { join } = require("path");
// Get all users
/// loading users data from user.json file
const jsonPath = join(__dirname, "../storage/users.json");
let jsonContent = fs.readFileSync(jsonPath, "utf-8");

let users;
try {
  users = jsonContent.trim() ? JSON.parse(jsonContent) : [];
} catch (err) {
  console.error(
    "Failed to parse users.json, defaulting to empty array:",
    err.message,
  );
  users = [];
}

const getAllUsers = (req, res) => {
  const { name, age } = req.query;
  console.log(name, age);
  res.json({
    message: "get all users",
    success: true,
    data: users,
  });
};

const createUser = (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  console.log({ firstName, lastName, email, password });
  users.push({ id: users.length + 1, firstName, lastName, email, password });
  fs.writeFileSync(jsonPath, JSON.stringify(users, null, 2), "utf8");
  res.json({
    message: "create a new user",
    success: true,
    data: users,
  });
};

const getUserById = (req, res) => {
  const { id } = req.params;
  const user = users.find((user) => user.id === Number(id));
  if (!user) {
    return res.status(404).json({
      message: "user not found",
      success: false,
    });
  }

  res.json({
    message: "get a single user",
    success: true,
    data: user,
  });
};

const updateUser = (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, password } = req.body;
  const user = users.find((user) => user.id === Number(id));
  if (!user) {
    return res.status(404).json({
      message: "user not found",
      success: false,
    });
  }
  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;
  user.password = password;

  fs.writeFileSync(jsonPath, JSON.stringify(users, null, 2), "utf8");
  res.json({
    message: "user updated successfully",
    success: true,
    data: user,
  });
};

const partialUserUpdate = (req, res) => {
  const { id } = req.params;
  const user = users.find((user) => user.id === Number(id));
  if (!user) {
    return res.status(404).json({
      message: "user not found",
      success: false,
    });
  }
  const updatedUser = Object.assign(user, req.body);
  fs.writeFileSync(jsonPath, JSON.stringify(users, null, 2), "utf8");
  res.json({
    message: "user updated successfully",
    success: true,
    data: updatedUser,
  });
};

const deleteUser = (req, res) => {
  const { id } = req.params;
  const user = users.find((user) => user.id === Number(id));
  if (!user) {
    return res.status(404).json({
      message: "user not found",
      success: false,
    });
  }

  users = users.filter((user) => user.id !== Number(id)); // remove deleted user
  fs.writeFileSync(jsonPath, JSON.stringify(users, null, 2), "utf8");
  res.json({
    message: "user deleted successfully",
    success: true,
    data: user,
  });
};

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  partialUserUpdate,
  deleteUser,
};
