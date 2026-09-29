"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      first_name: { type: Sequelize.STRING, allowNull: false },
      last_name: { type: Sequelize.STRING, allowNull: false },
      middle_name: { type: Sequelize.STRING, allowNull: true },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        validate: { isEmail: true, notEmpty: true },
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: { len: [6, 20], notEmpty: true },
      },
      gender: {
        type: Sequelize.ENUM("male", "female", "other"),
        allowNull: false,
        defaultValue: "male",
      },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW() },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW() },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");
  },
};
