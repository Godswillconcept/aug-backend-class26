const express = require("express");
const router = express.Router();
const instructorController = require("../controllers/instructor.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

// public routes
router.post("/register", instructorController.registerInstructor);
router.get("/", instructorController.getAllInstructors);
router.get("/:id", instructorController.getInstructorById);
router.get("/:id/courses", instructorController.getInstructorCourses);

// private routes
router.use(authenticate);
router.post("/", authorize("admin"), instructorController.createInstructor);
router.put(
  "/:id",
  authorize("admin", "instructor"),
  instructorController.updateInstructor,
);
router.delete(
  "/:id",
  authorize("admin"),
  instructorController.deleteInstructor,
);
router.post(
  "/:id/courses",
  authorize("admin"),
  instructorController.attachCourses,
);
router.delete(
  "/:id/courses",
  authorize("admin"),
  instructorController.detachCourses,
);

module.exports = router;
