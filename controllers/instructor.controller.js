const { Instructor, User, sequelize } = require("../models");

class InstructorController {
  // create instructor profile for existing user
  static createInstructor = async (req, res) => {
    const t = await sequelize.transaction(); // function is used to rollback the transaction if any error occurs
    try {
      const { user_id, bio, specialization, years_experience } = req.body;
      // Validating fields
      if (!user_id || !specialization || !years_experience) {
        await t.rollback();
        return res.status(400).json({ message: "All fields are required" });
      }
      const user = await User.findByPk(user_id, { transaction: t });
      // Checking if user exists
      if (!user) {
        await t.rollback();
        return res.status(404).json({ message: "User not found" });
      }

      // Checking if user is instructor
      if (user.role != "instructor") {
        await t.rollback();
        return res.status(400).json({ message: "User is not instructor" });
      }

      // Checking if instructor profile already exists
      const instructorExists = await Instructor.findOne({
        where: { user_id },
        transaction: t,
      });
      if (instructorExists) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: "Instructor profile already exists" });
      }

      // Creating instructor profile
      const instructorProfile = await Instructor.create({
        user_id,
        bio,
        specialization,
        years_experience,
      });

      // return full instructor data with his profile
      const instructor = await Instructor.findByPk(instructorProfile.id, {
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
        message: "Instructor created successfully",
        data: instructor,
      });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({ message: "Internal server error", error });
    }
  };

  // registerInstructor: function to create a user and instructor profile at the same time
  static registerInstructor = async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const {
        first_name,
        last_name,
        middle_name,
        email,
        password,
        gender,
        bio,
        address,
        specialization,
        years_experience,
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
          role: "instructor",
          is_active: true,
          address,
        },
        { transaction: t },
      );

      // create instructor profile
      const instructorProfile = await Instructor.create(
        {
          user_id: user.id,
          bio,
          specialization,
          years_experience,
        },
        { transaction: t },
      );

      // return full instructor data with his profile
      const instructor = await Instructor.findByPk(instructorProfile.id, {
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
        message: "Instructor created successfully",
        data: instructor,
      });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({ message: "Internal server error", error });
    }
  };

  // get all instructors with pagination
  static getAllInstructors = async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const { count: totalItems, rows: instructors } =
        await Instructor.findAndCountAll({
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
        message: "Instructors fetched successfully",
        data: instructors,
        pagination,
      });
    } catch (error) {}
  };

  // get instructor by id
  static getInstructorById = async (req, res) => {
    try {
      const { id } = req.params;
      const instructor = await Instructor.findOne({
        where: { id },
        include: {
          model: User,
          as: "user",
          attributes: {
            exclude: ["id", "password", "created_at", "updated_at"],
          },
        },
      });
      if (!instructor) {
        return res.status(404).json({ message: "Instructor not found" });
      }
      return res.status(200).json({
        message: "Instructor fetched successfully",
        data: instructor,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error", error });
    }
  };

  // update instructor profile
  static updateInstructor = async (req, res) => {
    try {
      const { id } = req.params;
      const { bio, specialization, years_experience } = req.body;
      const instructor = await Instructor.findOne({
        where: { id },
        include: {
          model: User,
          as: "user",
          attributes: {
            exclude: ["id", "password", "created_at", "updated_at"],
          },
        },
      });
      if (!instructor) {
        return res.status(404).json({ message: "Instructor not found" });
      }
      const updatedInstructor = await instructor.update({
        bio,
        specialization,
        years_experience,
      });
      return res.status(200).json({
        message: "Instructor updated successfully",
        data: updatedInstructor,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error", error });
    }
  };

  // delete instructor profile
  static deleteInstructor = async (req, res) => {
    try {
      const { id } = req.params;
      const instructor = await Instructor.findByPk(id);
      if (!instructor) {
        return res.status(404).json({ message: "Instructor not found" });
      }
      await instructor.destroy();
      return res
        .status(200)
        .json({ message: "Instructor deleted successfully", data: instructor });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error", error });
    }
  };
}

module.exports = InstructorController;
