const express = require("express");
const router = express.Router();
const enrolmentController = require("../controllers/enrolment.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.post(
  "/with-payment",
  authenticate,
  authorize("student"),
  enrolmentController.enrolWithPayment,
);

// Global usage of authenticate and authorize middleware for other routes
router.use(authenticate, authorize("admin"));
router.get("/", enrolmentController.getAllEnrolments);
router.post("/", enrolmentController.createEnrolment);
router.get("/:id", enrolmentController.getEnrolmentById);
router.put("/:id", enrolmentController.updateEnrolment);
router.delete("/:id", enrolmentController.deleteEnrolment);

module.exports = router;
