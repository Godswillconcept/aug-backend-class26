const express = require("express");
const router = express.Router();
const programController = require("../controllers/program.controller");

router.get("/", programController.getAllPrograms);
router.post("/", programController.createProgram);
router.get("/:id", programController.getProgramById);
router.put("/:id", programController.updateProgram);
router.delete("/:id", programController.deleteProgram);
router.get("/:id/courses", programController.getProgramCourses);
router.post("/:id/courses", programController.attachCourses);
router.delete("/:id/courses", programController.detachCourses);

module.exports = router;
