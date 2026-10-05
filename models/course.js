"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Course.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        notEmpty: true,
        validate: {
          notNull: { msg: "Course title is required" },
          notEmpty: { msg: "Course title can not be empty" },
        },
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        notEmpty: true,
        unique: {
          name: "course_code_unique",
          msg: "Course code already exists",
        },
        validate: {
          notNull: { msg: "Course code is required" },
          notEmpty: { msg: "Course code can not be empty" },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        notEmpty: true,
        validate: {
          notNull: { msg: "Course description is required" },
          notEmpty: { msg: "Course description can not be empty" },
        },
      },
      duration: {
        type: DataTypes.STRING,
        allowNull: false,
        notEmpty: true,
        validate: {
          notNull: { msg: "Course duration is required" },
          notEmpty: { msg: "Course duration can not be empty" },
        },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        validate: {
          notNull: { msg: "Course is_active is required" },
        },
      },
    },
    {
      sequelize,
      modelName: "Course",
    },
  );
  return Course;
};
