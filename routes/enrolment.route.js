const express = require("express");
const router = express.Router();
const enrolmentController = require("../controllers/enrolment.controller");

router.post("/with-payment", enrolmentController.enrolWithPayment);
router.get("/", enrolmentController.getAllEnrolments);
router.post("/", enrolmentController.createEnrolment);
router.get("/:id", enrolmentController.getEnrolmentById);
router.put("/:id", enrolmentController.updateEnrolment);
router.delete("/:id", enrolmentController.deleteEnrolment);

module.exports = router;
