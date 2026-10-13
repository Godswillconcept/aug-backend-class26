"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      if (models.Enrolment) {
        Payment.belongsTo(models.Enrolment, {
          foreignKey: "enrolment_id",
          as: "enrolment",
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        });
      }
    }
  }
  Payment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      enrolment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "enrolments",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      amount: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      payment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      payment_method: {
        type: DataTypes.ENUM("cash", "card", "bank_transfer"),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "completed", "failed"),
        allowNull: false,
        defaultValue: "pending",
      },
    },
    {
      sequelize,
      modelName: "Payment",
      indexes: [
        {
          unique: true,
          fields: ["enrolment_id", "payment_date"],
          name: "unique_enrolment_payment_date",
        },
      ],
    },
  );
  return Payment;
};
