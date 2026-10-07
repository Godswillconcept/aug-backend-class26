const { Student, User, sequelize } = require("../models");

class StudentController {
  // create student profile for existing user
  static createStudent = async (req, res) => {
    const t = await sequelize.transaction(); // function is used to rollback the transaction if any error occurs
    try {
      const { user_id, dob, guardian_name, guardian_email, guardian_phone } =
        req.body;
      // Validating fields
      if (
        !user_id ||
        !dob ||
        !guardian_name ||
        !guardian_email ||
        !guardian_phone
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
      if (studentExists) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: "Student profile already exists" });
      }

      // Creating student profile
      const studentProfile = await Student.create({
        user_id,
        dob,
        guardian_name,
        guardian_email,
        guardian_phone,
      });

      // return full student data with his profile
      const student = await Student.findByPk(studentProfile.id, {
        include: {
          model: User,
          as: "user",
          attributes: {
            exclude: ["id", "password", "created_at", "updated_at"],
          },
        },
        transaction: t,
      });

      // commit transaction
      await t.commit();

      return res.status(200).json({
        message: "Student created successfully",
        data: student,
      });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({ message: "Internal server error", error });
    }
  };

  // registerStudent: function to create a user and student profile at the same time
  static registerStudent = async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const {
        first_name,
        last_name,
        middle_name,
        email,
        password,
        gender,
        dob,
        address,
        guardian_name,
        guardian_email,
        guardian_phone,
      } = req.body;

      // create user
      const user = await User.create(
        {
          first_name,
          last_name,
          middle_name,
          email,
          password,
          gender,
          role: "student",
          is_active: true,
          address,
        },
        { transaction: t },
      );

      // create student profile
      const studentProfile = await Student.create(
        {
          user_id: user.id,
          dob,
          guardian_name,
          guardian_email,
          guardian_phone,
        },
        { transaction: t },
      );

      // return full student data with his profile
      const student = await Student.findByPk(studentProfile.id, {
        include: {
          model: User,
          as: "user",
          attributes: {
            exclude: ["id", "password", "created_at", "updated_at"],
          },
        },
        transaction: t,
      });

      // commit transaction
      await t.commit();

      return res.status(201).json({
        message: "Student created successfully",
        data: student,
      });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({ message: "Internal server error", error });
    }
  };

  // get all students with pagination
  static getAllStudents = async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const { count: totalItems, rows: students } =
        await Student.findAndCountAll({
          limit: Number(limit),
          offset: (Number(page) - 1) * Number(limit),
          include: {
            model: User,
            as: "user",
            attributes: {
              exclude: ["id", "password", "created_at", "updated_at"],
            },
          },
          order: [["created_at", "DESC"]],
        });

      const pagination = {
        totalItems,
        totalPages: Math.ceil(totalItems / Number(limit)),
        currentPage: Number(page),
        perPage: Number(limit),
      };

      return res.status(200).json({
        message: "Students fetched successfully",
        data: students,
        pagination,
      });
    } catch (error) {}
  };

  // get student by id
  static getStudentById = async (req, res) => {
    try {
      const { id } = req.params;
      const student = await Student.findOne({
        where: { id },
        include: {
          model: User,
          as: "user",
          attributes: {
            exclude: ["id", "password", "created_at", "updated_at"],
          },
        },
      });
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      return res.status(200).json({
        message: "Student fetched successfully",
        data: student,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error", error });
    }
  };

  // update student profile
  static updateStudent = async (req, res) => {
    try {
      const { id } = req.params;
      const { dob, guardian_name, guardian_email, guardian_phone } = req.body;
      const student = await Student.findOne({
        where: { id },
        include: {
          model: User,
          as: "user",
          attributes: {
            exclude: ["id", "password", "created_at", "updated_at"],
          },
        },
      });
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      const updatedStudent = await student.update({
        dob,
        guardian_name,
        guardian_email,
        guardian_phone,
      });
      return res.status(200).json({
        message: "Student updated successfully",
        data: updatedStudent,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error", error });
    }
  };

  // delete student profile
  static deleteStudent = async (req, res) => {
    try {
      const { id } = req.params;
      const student = await Student.findByPk(id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      await student.destroy();
      return res
        .status(200)
        .json({ message: "Student deleted successfully", data: student });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error", error });
    }
  };
}

module.exports = StudentController;
