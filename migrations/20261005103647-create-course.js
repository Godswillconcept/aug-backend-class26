"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("courses", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
        notEmpty: true,
      },
      code: {
        type: Sequelize.STRING(255),
        allowNull: false,
        notEmpty: true,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
        notEmpty: true,
      },
      duration: {
        type: Sequelize.STRING(255),
        allowNull: false,
        notEmpty: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
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
    await queryInterface.dropTable("courses");
  },
};
