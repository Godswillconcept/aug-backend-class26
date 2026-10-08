"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Instructor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      if (models.User) {
        Instructor.belongsTo(models.User, {
          foreignKey: "user_id",
          as: "user",
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        });
      }
    }
  }
  Instructor.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        allowNull: false,
        unique: {
          name: "instructor_user_id_unique",
          msg: "Instructor profile already exists",
        },
        validate: {
          isInt: {
            msg: "Instructor user ID must be an integer",
          },
        },
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      specialization: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Specialization cannot be empty",
          },
        },
      },
      years_experience: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Instructor",
    },
  );
  return Instructor;
};
