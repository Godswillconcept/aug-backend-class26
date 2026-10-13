const express = require("express");
const router = express.Router();
const instructorController = require("../controllers/instructor.controller");

router.post("/register", instructorController.registerInstructor);
router.get("/", instructorController.getAllInstructors);
router.post("/", instructorController.createInstructor);
router.get("/:id", instructorController.getInstructorById);
router.put("/:id", instructorController.updateInstructor);
router.delete("/:id", instructorController.deleteInstructor);
router.get("/:id/courses", instructorController.getInstructorCourses);
router.post("/:id/courses", instructorController.attachCourses);
router.delete("/:id/courses", instructorController.detachCourses);

module.exports = router;
