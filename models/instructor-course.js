"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class InstructorCourse extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association
      if (models.Course) {
        InstructorCourse.belongsTo(models.Course, {
          foreignKey: "course_id",
          as: "course",
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        });
      }
      if (models.Instructor) {
        InstructorCourse.belongsTo(models.Instructor, {
          foreignKey: "instructor_id",
          as: "instructor",
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        });
      }
    }
  }
  InstructorCourse.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "courses",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      instructor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "instructors",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      assigned_at: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "InstructorCourse",
      indexes: [
        {
          unique: true,
          fields: ["course_id", "instructor_id"],
        },
      ],
    },
  );
  return InstructorCourse;
};
