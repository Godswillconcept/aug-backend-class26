const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.get("/", userController.getAllUsers); // public
router.post("/", userController.createUser); // public
router.get("/:id", userController.getUserById); // public
router.put(
  "/:id",
  authenticate,
  authorize("admin", "instructor", "student"),
  userController.updateUser,
); // private
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  userController.deleteUser,
); // private

module.exports = router;
