const {
  Instructor,
  User,
  Course,
  InstructorCourse,
  sequelize,
} = require("../models");

// Sanitize internal errors so raw SQL/Sequelize detail is never leaked to clients.
function handleControllerError(error) {
  console.error("Instructor controller error:", error);
  if (error && error.name === "SequelizeValidationError") {
    return {
      status: 400,
      message: error.errors?.[0]?.message || error.message || "Validation failed",
    };
  }
  if (error && error.name === "SequelizeUniqueConstraintError") {
    return {
      status: 400,
      message: error.errors?.[0]?.message || "A record with this value already exists",
    };
  }
  if (error && error.name === "SequelizeDatabaseError") {
    return { status: 500, message: "A database error occurred while processing the request" };
  }
  return { status: 500, message: "Internal server error" };
}

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
      const safe = handleControllerError(error);
      return res.status(safe.status).json({ message: safe.message });
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

      if (!first_name || !last_name || !email || !gender) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: "First name, last name, email, and gender are required" });
      }
      if (!specialization || years_experience === undefined || years_experience === "") {
        await t.rollback();
        return res
          .status(400)
          .json({ message: "Specialization and years of experience are required" });
      }

      // create user. Password is optional (provisioned accounts).
      const user = await User.create(
        {
          first_name,
          last_name,
          middle_name,
          email,
          password: password || null,
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
      const safe = handleControllerError(error);
      return res.status(safe.status).json({ message: safe.message });
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
      const safe = handleControllerError(error);
      return res.status(safe.status).json({ message: safe.message });
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
      const safe = handleControllerError(error);
      return res.status(safe.status).json({ message: safe.message });
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
      const safe = handleControllerError(error);
      return res.status(safe.status).json({ message: safe.message });
    }
  };

  static getInstructorCourses = async (req, res) => {
    try {
      const { id } = req.params;
      const instructor = await Instructor.findByPk(parseInt(id));
      // Check if instructor exists
      if (!instructor) {
        return res.status(404).json({ message: "Instructor not found" });
      }

      // Get all courses for the given instructor
      const courses = await instructor.getCourses();

      return res.status(200).json({
        message: "Courses fetched successfully",
        data: courses,
      });
    } catch (error) {
      const safe = handleControllerError(error);
      return res.status(safe.status).json({ message: safe.message });
    }
  };

  static attachCourses = async (req, res) => {
    try {
      const { id } = req.params;
      const { coursesInfo } = req.body;

      const instructor = await Instructor.findByPk(id);
      if (!instructor) {
        return res.status(404).json({ message: "Instructor not found" });
      }

      const courseIds = coursesInfo.map((course) => parseInt(course.course_id));
      const existingCourses = await Course.findAll({
        where: { id: courseIds },
        attributes: ["id"],
      });

      const existingCourseIds = existingCourses.map((c) => c.id);
      const missingCourseIds = courseIds.filter(
        (id) => !existingCourseIds.includes(id),
      );

      if (missingCourseIds.length > 0) {
        return res.status(400).json({
          message: "Some courses do not exist",
          missingCourseIds,
        });
      }

      // check if courses already attached to this instructor
      const existingInstructorCourses = await InstructorCourse.findAll({
        where: { instructor_id: id },
      });
      const existingInstructorCourseIds = existingInstructorCourses.map(
        (c) => c.course_id,
      );
      const duplicateCourseIds = courseIds.filter((id) =>
        existingInstructorCourseIds.includes(id),
      );

      if (duplicateCourseIds.length > 0) {
        return res.status(400).json({
          message: "Some courses already attached to this instructor",
          duplicateCourseIds,
        });
      }

      const courses = await InstructorCourse.bulkCreate(
        coursesInfo.map((course) => {
          return {
            instructor_id: id,
            course_id: course.course_id,
            assigned_at: course.assigned_at || new Date(),
          };
        }),
      );

      return res.status(200).json({
        message: "Courses attached successfully",
        data: courses,
      });
    } catch (error) {
      const safe = handleControllerError(error);
      return res.status(safe.status).json({ message: safe.message });
    }
  };

  static detachCourses = async (req, res) => {
    try {
      const { id } = req.params;
      const { courseIds } = req.body;
      // find the instructor
      const instructor = await Instructor.findByPk(id);
      if (!instructor) {
        return res.status(404).json({ message: "Instructor not found" });
      }

      if (!Array.isArray(courseIds) || courseIds.length === 0) {
        return res.status(400).json({
          message: "Please provide an array of course ids",
        });
      }

      // convert to integers
      const courseIdsInt = courseIds.map((id) => parseInt(id));

      // retrieve existing courses attached to the instructor
      const existingCourses = await InstructorCourse.findAll({
        where: { instructor_id: id },
      });

      const coursesToRemove = existingCourses.filter((course) =>
        courseIdsInt.includes(course.course_id),
      );

      if (coursesToRemove.length === 0) {
        return res.status(400).json({
          message: "No courses found to detach",
        });
      }

      // remove the courses from the instructor
      await InstructorCourse.destroy({
        where: {
          instructor_id: id,
          course_id: coursesToRemove.map((course) => course.course_id),
        },
      });

      return res.status(200).json({
        message: "Courses detached successfully",
        data: coursesToRemove,
      });
    } catch (error) {
      const safe = handleControllerError(error);
      return res.status(safe.status).json({ message: safe.message });
    }
  };
}

module.exports = InstructorController;
