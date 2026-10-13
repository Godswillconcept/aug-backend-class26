const { Payment, Program, Enrolment, User } = require("../models");

class PaymentController {
  // get all payments with paginated data
  static getAllPayments = async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const { count, rows } = await Payment.findAndCountAll({
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        include: {
          model: Enrolment,
          as: "enrolment",
          attributes: {
            exclude: ["id", "created_at", "updated_at"],
          },
          include: [
            {
              model: User,
              as: "user",
              attributes: {
                exclude: ["id", "password", "created_at", "updated_at"],
              },
            },
            {
              model: Program,
              as: "program",
              attributes: {
                exclude: ["id", "created_at", "updated_at"],
              },
            },
          ],
        },
        order: [["created_at", "DESC"]],
      });

      return res.status(200).json({
        message: "Payments fetched successfully",
        data: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({ message: "Internal Server error", error });
    }
  };

  // get payment by id
  static getPaymentById = async (req, res) => {
    try {
      const { id } = req.params;
      const payment = await Payment.findByPk(id, {
        include: {
          model: Enrolment,
          as: "enrolment",
          attributes: {
            exclude: ["id", "created_at", "updated_at"],
          },
          include: [
            {
              model: User,
              as: "user",
              attributes: {
                exclude: ["id", "password", "created_at", "updated_at"],
              },
            },
            {
              model: Program,
              as: "program",
              attributes: {
                exclude: ["id", "created_at", "updated_at"],
              },
            },
          ],
        },
      });

      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      return res.status(200).json({
        message: "Payment fetched successfully",
        data: payment,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server error", error });
    }
  };

  // create payment
  static createPayment = async (req, res) => {
    try {
      const { enrolment_id, amount, payment_date, payment_method, status } =
        req.body;
      const payment = await Payment.create({
        enrolment_id,
        amount,
        payment_date,
        payment_method,
        status,
      });

      return res.status(200).json({
        message: "Payment created successfully",
        data: payment,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server error", error });
    }
  };

  // update payment
  static updatePayment = async (req, res) => {
    try {
      const { id } = req.params;
      const { enrolment_id, amount, payment_date, payment_method, status } =
        req.body;

      const findEnrolment = await Enrolment.findByPk(enrolment_id);
      if (!findEnrolment) {
        return res
          .status(404)
          .json({ message: "Enrolment not found", enrolment_id });
      }

      const payment = await Payment.findByPk(parseInt(id));
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      const update = await payment.update({
        enrolment_id,
        amount,
        payment_date,
        payment_method,
        status,
      });

      return res.status(200).json({
        message: "Payment updated successfully",
        data: update,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server error", error });
    }
  };

  // delete payment
  static deletePayment = async (req, res) => {
    try {
      const { id } = req.params;
      const payment = await Payment.findByPk(id);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      await payment.destroy();
      return res.status(200).json({ message: "Payment deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server error", error });
    }
  };
}

module.exports = PaymentController;
