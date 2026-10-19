const express = require("express");
const router = express.Router();
const programController = require("../controllers/program.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.get("/", programController.getAllPrograms); // public
router.post(
  "/",
  authenticate,
  authorize("admin"),
  programController.createProgram,
); // private
router.get("/:id", programController.getProgramById); // public
router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  programController.updateProgram,
); // private
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  programController.deleteProgram,
); // private
router.get("/:id/courses", programController.getProgramCourses); // public
router.post(
  "/:id/courses",
  authenticate,
  authorize("admin"),
  programController.attachCourses,
); // private
router.delete("/:id/courses", programController.detachCourses); // private

module.exports = router;
