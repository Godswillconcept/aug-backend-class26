const express = require("express");
const { ValidationError: SequelizeValidationError } = require("sequelize");
const app = express();
require("./config/database");
const port = process.env.PORT || 3000;

// routes
const userRouter = require("./routes/user.route");
const courseRouter = require("./routes/course.route");
const programRouter = require("./routes/program.route");
const studentRouter = require("./routes/student.route");
app.use(express.json()); // json data pass using req.body
app.use(express.urlencoded({ extended: true })); // url encoded data pass using req.body

// routes added here
app.use("/api/users", userRouter);
app.use("/api/courses", courseRouter);
app.use("/api/programs", programRouter);
app.use("/api/students", studentRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use((err, req, res, next) => {
  console.log(err);

  if (err instanceof SequelizeValidationError) {
    return res.status(400).json({ message: err.message });
  }

  res.status(500).json({ message: "Internal Server Error" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
