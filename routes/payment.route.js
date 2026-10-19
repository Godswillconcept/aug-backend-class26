const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.use(authenticate);
router.get("/", authorize("admin"), paymentController.getAllPayments);
router.post("/", paymentController.createPayment);
router.get("/:id", paymentController.getPaymentById);
router.put("/:id", authorize("admin"), paymentController.updatePayment);
router.delete("/:id", authorize("admin"), paymentController.deletePayment);

module.exports = router;
