const { callbackify } = require("util"); // node built-in module
const { findById, create } = require("./util-module"); // custom module

const findByIdCallback = callbackify(findById); // convert async function to callback function
const createCallback = callbackify(create);

findByIdCallback(3, (err, data) => {
  if (err) {
    console.log("Error", err);
    return;
  }

  console.log(data);
});

createCallback(
  {
    name: "Callbackify",
    email: "callbackify@gmail.com",
    password: "123456",
  },
  (err, data) => {
    if (err) {
      console.log("Error", err);
      return;
    }

    console.log(data);
  },
);
