const express = require("express");
const router = express.Router();
const userController = require("../controllers/users.controller");

router.get("/", userController.getAllUsers);
router.post("/", userController.createUser);
router.get("/filter", userController.getUsersWithFilter);
router.get("/by-email/:email", userController.getUserByEmail);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
module.exports = router;
