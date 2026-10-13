const { Program, ProgramCourse, Course } = require("../models");

class ProgramController {
  // get all programs with paginated data
  static getAllPrograms = async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const { count, rows } = await Program.findAndCountAll({
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        where: {
          is_active: true,
        },
        order: [["created_at", "DESC"]],
      });

      return res.status(200).json({
        message: "Programs fetched successfully",
        data: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server error", error });
    }
  };

  // get program by id
  static getProgramById = async (req, res) => {
    try {
      const { id } = req.params;
      const program = await Program.findByPk(id);

      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }

      return res.status(200).json({
        message: "Program fetched successfully",
        data: program,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server error", error });
    }
  };

  // create program
  static createProgram = async (req, res) => {
    try {
      const { name, program_code, description, tuition, is_active } = req.body;
      const program = await Program.create({
        name,
        program_code,
        description,
        tuition,
        is_active,
      });

      return res.status(200).json({
        message: "Program created successfully",
        data: program,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server error", error });
    }
  };

  // update program
  static updateProgram = async (req, res) => {
    try {
      const { id } = req.params;
      const program = await Program.findByPk(parseInt(id));
      const { name, program_code, description, tuition, is_active } = req.body;
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }
      const update = await program.update({
        name,
        program_code,
        description,
        tuition,
        is_active,
      });

      return res.status(200).json({
        message: "Program updated successfully",
        data: update,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server error", error });
    }
  };

  // delete program
  static deleteProgram = async (req, res) => {
    try {
      const { id } = req.params;
      const program = await Program.findByPk(id);
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }
      await program.destroy();
      return res.status(200).json({ message: "Program deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server error", error });
    }
  };

  static getProgramCourses = async (req, res) => {
    try {
      const { id } = req.params;
      const program = await Program.findByPk(parseInt(id));
      // Check if program exists
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }

      // Get all courses for the given program
      const courses = await program.getCourses();

      return res.status(200).json({
        message: "Courses fetched successfully",
        data: courses,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server error", error });
    }
  };

  static attachCourses = async (req, res) => {
    try {
      const { id } = req.params;
      const { coursesInfo } = req.body;

      const program = await Program.findByPk(id);
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }

      const courseIds = coursesInfo.map((course) => course.course_id);
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

      // check if courses already attached to this program
      const existingProgramCourses = await ProgramCourse.findAll({
        where: { program_id: id },
      });
      const existingProgramCourseIds = existingProgramCourses.map(
        (c) => c.course_id,
      );
      const duplicateCourseIds = courseIds.filter((id) =>
        existingProgramCourseIds.includes(id),
      );

      if (duplicateCourseIds.length > 0) {
        return res.status(400).json({
          message: "Some courses already attached to this program",
          duplicateCourseIds,
        });
      }

      const courses = await ProgramCourse.bulkCreate(
        coursesInfo.map((course) => {
          return {
            program_id: id,
            course_id: course.course_id,
            sequence: course.sequence,
            is_required: course.is_required,
          };
        }),
      );

      return res.status(200).json({
        message: "Courses attached successfully",
        data: courses,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server error", error });
    }
  };

  static detachCourses = async (req, res) => {
    try {
      const { id } = req.params;
      const { courseIds } = req.body;
      // find the program
      const program = await Program.findByPk(id);
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }

      if (!Array.isArray(courseIds) || courseIds.length === 0) {
        return res.status(400).json({
          message: "Please provide an array of course ids",
        });
      }

      // convert to integers
      const courseIdsInt = courseIds.map((id) => parseInt(id));

      // retrieve existing courses attached to the program
      const existingCourses = await ProgramCourse.findAll({
        where: { program_id: id },
      });

      const coursesToRemove = existingCourses.filter((course) =>
        courseIdsInt.includes(course.course_id),
      );

      if (coursesToRemove.length === 0) {
        return res.status(400).json({
          message: "No courses found to detach",
        });
      }

      // remove the courses from the program
      await ProgramCourse.destroy({
        where: {
          program_id: id,
          course_id: coursesToRemove.map((course) => course.course_id),
        },
      });

      return res.status(200).json({
        message: "Courses detached successfully",
        data: coursesToRemove,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server error", error });
    }
  };
}

module.exports = ProgramController;
