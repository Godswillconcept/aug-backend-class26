"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Student extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      if (models.User) {
        Student.belongsTo(models.User, {
          foreignKey: "user_id",
          as: "user",
          onDelete: "CASCADE",
        });
      }
    }
  }
  Student.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: {
          name: "student_user_id_unique",
          msg: "Student profile already exists for this user",
        },
        validate: {
          isNumeric: true,
          notNull: true,
          notEmpty: true,
        },
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      dob: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isDate: {
            msg: "Date must be in this format YYYY-MM-DD`",
          },
          notNull: {
            msg: "Date of birth is required",
          },
          notEmpty: {
            msg: "Date of birth cannot be empty",
          },
        },
      },
      guardian_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          notEmpty: true,
        },
      },
      guardian_email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
          notNull: true,
          notEmpty: true,
        },
      },
      guardian_phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isNumeric: true,
          notNull: true,
          notEmpty: true,
        },
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Student",
    },
  );
  return Student;
};
