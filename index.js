const express = require("express"); // 3rd Party module
const app = express();
const { URL } = require("url"); // Built in module
const path = require("path"); // Built in module

const productUrl = new URL("/products", "http://localhost:3000");
productUrl.searchParams.append("id", "123"); // ?id=123

console.log(productUrl.href); // http://localhost:3000/products?id=123

app.get("/", (req, res) => {
  res.send(`Hello world `);
});

app.get("/about", (req, res) => {
  res.send("About page");
});

app.get("/contact", (req, res) => {
  res.send("Contact page");
});

app.get("/products", (req, res) => {
  res.send("Products page");
});

/// Rendering files with Express
app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/// Json response
app.get("/items", (req, res) => {
  res.json({
    message: "Success",
  });
});

/// Using different HTTP methods
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "signup.html"));
});

app.post("/signup", (req, res) => {
  res.send("Form submitted");
});

app.put("/profile", (req, res) => {
  res.send("Profile updated");
});

app.patch("/profile", (req, res) => {
  res.send("Profile updated partially");
});

app.delete("/profile", (req, res) => {
  res.send("Profile deleted");
});

app.get("/login", (req, res) => {
  res.send("Login page");
});

app.listen(3000, () => {
  console.log(`Server is running on port http://localhost:3000`);
});
