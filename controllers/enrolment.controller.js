const {
  Enrolment,
  Student,
  User,
  Program,
  Payment,
  sequelize,
} = require("../models");

class EnrolmentController {
  // create enrolment for existing user
  static createEnrolment = async (req, res) => {
    const t = await sequelize.transaction(); // function is used to rollback the transaction if any error occurs
    try {
      const { user_id, program_id, enrolment_date, status, enrolled_at } =
        req.body;
      // Validating fields
      if (
        !user_id ||
        !program_id ||
        !enrolment_date ||
        !status ||
        !enrolled_at
      ) {
        await t.rollback();
        return res.status(400).json({ message: "All fields are required" });
      }
      const user = await User.findByPk(user_id, { transaction: t });
      // Checking if user exists
      if (!user) {
        await t.rollback();
        return res.status(404).json({ message: "User not found" });
      }

      // Checking if user is student
      if (user.role != "student") {
        await t.rollback();
        return res.status(400).json({ message: "User is not student" });
      }

      // Checking if student profile already exists
      const studentExists = await Student.findOne({
        where: { user_id },
        transaction: t,
      });
      // if (studentExists) {
      //   await t.rollback();
      //   return res
      //     .status(400)
      //     .json({ message: "Student profile already exists" });
      // }

      const program = await Program.findByPk(program_id, { transaction: t });
      // Checking if program exists
      if (!program) {
        await t.rollback();
        return res.status(404).json({ message: "Program not found" });
      }

      // Creating enrolment
      const enrolmentData = await Enrolment.create({
        user_id,
        program_id,
        enrolment_date,
        status,
        enrolled_at,
      });

      // return full enrolment data with his profile
      const enrolment = await Enrolment.findByPk(enrolmentData.id, {
        include: [
          {
            model: User,
            as: "user",
            attributes: {
              exclude: ["id", "password", "created_at", "updated_at"],
            },
            include: {
              model: Student,
              as: "student",
              attributes: {
                exclude: ["id", "user_id", "created_at", "updated_at"],
              },
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
        transaction: t,
      });

      // commit transaction
      await t.commit();

      return res.status(200).json({
        message: "Enrolment created successfully",
        data: enrolment,
      });
    } catch (error) {
      await t.rollback();
      console.log("error", error);
      return res.status(500).json({ message: "Internal server error", error });
    }
  };

  // enrol with payment: function to create enrolment record and payment at the same time
  static enrolWithPayment = async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const {
        user_id,
        program_id,
        enrolment_date,
        status,
        enrolled_at,
        amount,
        payment_date,
        payment_method,
        payment_status,
      } = req.body;
      const user = await User.findByPk(user_id);
      const program = await Program.findByPk(program_id);

      if (!user || !program) {
        await t.rollback();
        return res.status(404).json({ message: "User or program not found" });
      }

      if (user.role != "student") {
        await t.rollback();
        return res.status(400).json({ message: "User is not student" });
      }

      // create enrolment
      const enrolmentData = await Enrolment.create(
        {
          user_id,
          program_id,
          enrolment_date,
          status,
          enrolled_at,
        },
        { transaction: t },
      );

      // create payment
      const payment = await Payment.create(
        {
          enrolment_id: enrolment.id,
          amount,
          payment_date,
          payment_method,
          status: payment_status,
        },
        { transaction: t },
      );

      // return full enrolment data with his profile
      const enrolment = await Enrolment.findByPk(enrolmentData.id, {
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
          {
            model: Payment,
            as: "payments",
            attributes: {
              exclude: ["id", "created_at", "updated_at"],
            },
          },
        ],
        transaction: t,
      });

      // commit transaction
      await t.commit();

      return res.status(201).json({
        message: "Enrolment with payment created successfully",
        data: enrolment,
      });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({ message: "Internal server error", error });
    }
  };

  // get all enrolments with pagination
  static getAllEnrolments = async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const { count: totalItems, rows: enrolments } =
        await Enrolment.findAndCountAll({
          limit: Number(limit),
          offset: (Number(page) - 1) * Number(limit),
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
            {
              model: Payment,
              as: "payments",
              attributes: {
                exclude: ["id", "created_at", "updated_at"],
              },
            },
          ],
          order: [["created_at", "DESC"]],
        });

      const pagination = {
        totalItems,
        totalPages: Math.ceil(totalItems / Number(limit)),
        currentPage: Number(page),
        perPage: Number(limit),
      };

      return res.status(200).json({
        message: "Enrolments fetched successfully",
        data: enrolments,
        pagination,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error", error });
    }
  };

  // get enrolment by id
  static getEnrolmentById = async (req, res) => {
    try {
      const { id } = req.params;
      const enrolment = await Enrolment.findOne({
        where: { id },
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
          {
            model: Payment,
            as: "payments",
            attributes: {
              exclude: ["id", "created_at", "updated_at"],
            },
          },
        ],
      });
      if (!enrolment) {
        return res.status(404).json({ message: "Enrolment not found" });
      }
      return res.status(200).json({
        message: "Enrolment fetched successfully",
        data: enrolment,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error", error });
    }
  };

  // update enrolment data
  static updateEnrolment = async (req, res) => {
    try {
      const { id } = req.params;
      const { program_id, enrolment_date, status, enrolled_at } = req.body;
      const enrolment = await Enrolment.findOne({
        where: { id },
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
          {
            model: Payment,
            as: "payments",
            attributes: {
              exclude: ["id", "created_at", "updated_at"],
            },
          },
        ],
      });
      if (!enrolment) {
        return res.status(404).json({ message: "Enrolment not found" });
      }
      const updatedEnrolment = await enrolment.update({
        program_id,
        enrolment_date,
        status,
        enrolled_at,
      });
      return res.status(200).json({
        message: "Enrolment updated successfully",
        data: updatedEnrolment,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error", error });
    }
  };

  // delete enrolment
  static deleteEnrolment = async (req, res) => {
    try {
      const { id } = req.params;
      const enrolment = await Enrolment.findByPk(id);
      if (!enrolment) {
        return res.status(404).json({ message: "Enrolment not found" });
      }
      await enrolment.destroy();
      return res.status(200).json({
        message: "Enrolment deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error", error });
    }
  };
}

module.exports = EnrolmentController;
