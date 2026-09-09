const express = require("express");
const router = express.Router();
// const { Router } = express; // object destructuring
// const router = Router(); // using object destructuring

const userController = require("../controllers/user.controller"); // import controller

router.get("/", userController.getAllUsers); // get all users

router.post("/", userController.createUser); // create a new user

router.get("/:id", userController.getUserById); // get a single user by id

router.put("/:id", userController.updateUser); // update a user by id

router.patch("/:id", userController.partialUserUpdate); // update a user by id

router.delete("/:id", userController.deleteUser); // delete a user by id

module.exports = router;
