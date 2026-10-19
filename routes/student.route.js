const express = require("express");
const router = express.Router();
const studentController = require("../controllers/student.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.post("/register", studentController.registerStudent); // public
router.get("/", studentController.getAllStudents); // public
router.post(
    "/",
    authenticate,
    authorize("admin"),
    studentController.createStudent,
); // private
router.get("/:id", studentController.getStudentById); // public
router.put(
    "/:id",
    authenticate,
    authorize("admin"),
    studentController.updateStudent,
); // private
router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    studentController.deleteStudent,
); // private

module.exports = router;
