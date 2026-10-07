"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("programs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      program_code: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      tuition: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          isDecimal: true,
          notEmpty: true,
          notNull: true,
        },
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        validate: {
          isBoolean: true,
          notNull: true,
        },
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        field: "updated_at",
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("programs");
  },
};
