"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Program extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Program.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
          notNull: true,
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
          notNull: true,
        },
      },
      program_code: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: {
          name: "program_code_unique",
          msg: "Program code already exists",
        },
        validate: {
          notNull: { msg: "Program code is required" },
          notEmpty: { msg: "Program code can not be empty" },
        },
      },
      tuition: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          isDecimal: true,
          notEmpty: true,
          notNull: true,
        },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        validate: {
          isBoolean: true,
          notNull: true,
        },
      },
    },
    {
      sequelize,
      modelName: "Program",
    },
  );
  return Program;
};
