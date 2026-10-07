const { Program } = require("../models");

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
}

module.exports = ProgramController;
