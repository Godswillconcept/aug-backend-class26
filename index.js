const express = require("express"); // 3rd Party module
const { join } = require("path");
const app = express();
const userRoute = require("./routes/user.route"); // importing routes
const catgoryRoute = require("./routes/catgory.route"); // importing routes
const authRoute = require("./routes/auth.route");

// middlewares
app.use(express.static(join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// routes
app.use("/api/users", userRoute); // using modular routes with route prefixing
app.use("/api/categories", catgoryRoute);
app.use("/api", authRoute);

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});
app.get("/home", (req, res) => {
  res.redirect("/");
});
app.get("/login", (req, res) => {
  res.sendFile(join(__dirname, "login.html"));
});

// app.post("/api/login", (req, res) => {
//   const { email, password } = req.body; // object destruction
//   console.log({ email, password });

//   res.status(200).send("Login successful");
// });

app.get("/signup", (req, res) => {
  res.sendFile(join(__dirname, "signup.html"));
});
app.post("/api/signup", (req, res) => {
  const { name, email, password } = req.body;
  console.log({ name, email, password });
  res.status(200).send("Signup successful");
});

// error handling middleware
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

app.listen(3000, () => {
  console.log(`Server is running on port http://localhost:3000`);
});
