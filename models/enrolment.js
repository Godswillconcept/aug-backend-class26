"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Enrolment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      if (models.User) {
        Enrolment.belongsTo(models.User, {
          foreignKey: "user_id",
          as: "user",
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        });
      }

      if (models.Program) {
        Enrolment.belongsTo(models.Program, {
          foreignKey: "program_id",
          as: "program",
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        });
      }

      if (models.Payment) {
        Enrolment.hasMany(models.Payment, {
          foreignKey: "enrolment_id",
          as: "payments",
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        });
      }
    }
  }
  Enrolment.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      program_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "programs",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      enrolment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("enrolled", "completed", "dropped"),
        allowNull: false,
        defaultValue: "enrolled",
      },
      enrolled_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Enrolment",
      indexes: [
        {
          name: "unique_user_program_enrolment",
          unique: true,
          fields: ["user_id", "program_id"],
        },
      ],
    },
  );
  return Enrolment;
};
