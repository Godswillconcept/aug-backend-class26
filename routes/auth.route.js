const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const upload = require("../config/upload");

router.post("/login", authController.login); // public
router.post("/forget-password", authController.forgetPassword); // public
router.post("/reset-password", authController.resetPassword); // public

router.post("/change-password", authenticate, authController.changePassword); // private
router.get("/me", authenticate, authController.getCurrentUser); // private
router.put("/me", authenticate, authController.updateProfile); // private
router.put("/profile-picture", authenticate, upload.single("profile_picture"), authController.changeProfilePicture); // private

module.exports = router;
