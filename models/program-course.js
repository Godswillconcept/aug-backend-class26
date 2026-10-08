"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ProgramCourse extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      if (models.Program) {
        ProgramCourse.belongsTo(models.Program, {
          foreignKey: "program_id",
          as: "program",
          onDelete: "CASCADE",
        });
      }

      if (models.Course) {
        ProgramCourse.belongsTo(models.Course, {
          foreignKey: "course_id",
          as: "course",
          onDelete: "CASCADE",
        });
      }
    }
  }
  ProgramCourse.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      program_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "programs",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "courses",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      sequence: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Sequence number is required",
          },
          isInt: {
            msg: "Sequence number must be an integer",
          },
          min: {
            args: [1],
            msg: "Sequence number must be a positive integer",
          },
        },
      },
      is_required: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "ProgramCourse",
    },
  );
  return ProgramCourse;
};
