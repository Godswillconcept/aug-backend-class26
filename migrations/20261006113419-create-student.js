"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("students", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        unique: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      dob: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      guardian_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      guardian_email: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      guardian_phone: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("students");
  },
};
