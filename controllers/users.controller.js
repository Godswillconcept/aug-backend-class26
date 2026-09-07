// Get all users

const users = [];
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

  //   const updatdUser = Object.assign(user, {
  //     firstName,
  //     lastName,
  //     email,
  //     password,
  //   });
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
