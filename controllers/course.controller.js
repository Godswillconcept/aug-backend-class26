const { Course } = require("../models");

class CourseController {
  // get all courses with paginated data
  static getAllCourses = async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const { count, rows } = await Course.findAndCountAll({
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        where: {
          is_active: true,
        },
        order: [["created_at", "DESC"]],
      });

      if (!rows.length) {
        return res.status(404).json({ message: "No courses found" });
      }

      return res.status(200).json({
        message: "Courses fetched successfully",
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

  // get course by id
  static getCourseById = async (req, res) => {
    try {
      const { id } = req.params;
      const course = await Course.findByPk(id);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      return res.status(200).json({
        message: "Course fetched successfully",
        data: course,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server error", error });
    }
  };

  // create course
  static createCourse = async (req, res) => {
    try {
      const { title, code, description, duration, is_active } = req.body;
      const course = await Course.create({
        title,
        code,
        description,
        duration,
        is_active,
      });

      return res.status(200).json({
        message: "Course created successfully",
        data: course,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server error", error });
    }
  };

  // update course
  static updateCourse = async (req, res) => {
    try {
      const { id } = req.params;
      const course = await Course.findByPk(parseInt(id));
      const { title, code, description, duration, is_active } = req.body;
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      const update = course.update({
        title,
        code,
        description,
        duration,
        is_active,
      });

      return res.status(200).json({
        message: "Course updated successfully",
        data: update,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server error", error });
    }
  };

  // delete course
  static deleteCourse = async (req, res) => {
    try {
      const { id } = req.params;
      const course = await Course.findByPk(id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      course.destroy();
      return res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server error", error });
    }
  };
}

module.exports = CourseController;
