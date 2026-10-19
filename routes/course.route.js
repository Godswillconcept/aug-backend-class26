const express = require("express");
const router = express.Router();
const courseController = require("../controllers/course.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.get("/", courseController.getAllCourses);
router.post(
  "/",
  authenticate,
  authorize("admin"),
  courseController.createCourse,
);
router.get("/:id", courseController.getCourseById);
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  courseController.updateCourse,
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  courseController.deleteCourse,
);

module.exports = router;
