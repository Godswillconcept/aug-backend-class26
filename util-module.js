const database = [
  {
    id: 1,
    name: "John Doe",
    email: "john@gmail.com",
    password: "123456",
  },
  {
    id: 2,
    name: "Jane Doe",
    email: "jane@gmail.com",
    password: "123456",
  },
  {
    id: 3,
    name: "John Smith",
    email: "johnsmith@gmail.com",
    password: "123456",
  },
];

async function findById(id) {
  // async is used to make the function asynchronous
  try {
    const user = database.find((user) => user.id === id);
    if (!user) {
      console.log("User not found");
      return null;
    }
    return user;
  } catch (error) {
    console.error("Error to find user by id", error);
  }
}

async function create(body) {
  try {
    const newUser = { id: database.length + 1, ...body };
    database.push(newUser);
    return newUser;
  } catch (error) {
    console.error("Error to create user", error);
    throw error;
  }
}

module.exports = {
  findById,
  create,
};

(async () => {
  const user = await findById(2);
  console.log(user);
})();

(async () => {
  const addedUser = await create({
    name: "Bright Daniel",
    email: "bright@gmail.com",
    password: "etqtwew",
  });
  console.log(addedUser);
})();
