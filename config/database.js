const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("api_development", "root", "", {
  host: "localhost",
  dialect: "mysql",
  logging: true,
  define: {
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

connectDB();

module.exports = sequelize;
