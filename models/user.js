"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      if (models.Student) {
        User.hasOne(models.Student, {
          foreignKey: "user_id",
          as: "studentProfile",
          onDelete: "CASCADE",
        });
      }
      if (models.Instructor) {
        User.hasOne(models.Instructor, {
          foreignKey: "user_id",
          as: "instructorProfile",
          onDelete: "CASCADE",
        });
      }
    }
  }
  User.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "First name is required" },
          notEmpty: { msg: "First name cannot be empty" },
        },
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Last name is required" },
          notEmpty: { msg: "Last name cannot be empty" },
        },
      },
      middle_name: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          name: "users_email_unique",
          msg: "email already taken",
        },
        validate: {
          isEmail: true,
          notEmpty: true,
        },
      },
      address: {
        type: DataTypes.TEXT,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { len: [6, 20], notEmpty: true },
      },
      role: {
        type: DataTypes.ENUM("student", "instructor", "admin"),
        allowNull: false,
        defaultValue: "student",
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      gender: {
        type: DataTypes.ENUM("male", "female", "other"),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );
  return User;
};
