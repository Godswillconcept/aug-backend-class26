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
  res.sendFile(path.join(__dirname, "login.html"));
});

app.post("/login", (req, res) => {
  res.send("Login submitted");
});

app.get("/api", (req, res) => {
  res.json({
    message: "API endpoint",
    version: "1.0.0",
    description: "Welcome to the API",
    author: "Alusoft",
  });
});

/// Request Query String
app.get("/api/users", (req, res) => {
  res.json({ query: req.query });
});

const products = [
  {
    name: "Laptop",
    price: 1000,
    quantity: 10,
  },
  {
    name: "Mouse",
    price: 200,
    quantity: 20,
  },
  {
    name: "Keyboard",
    price: 300,
    quantity: 30,
  },
];

app.get("/api/products", (req, res) => {
  let prodName = req.query.name; // variable assignment
  const { price, quantity } = req.query; // Destructuring
  res.json({
    name: prodName,
    price,
    quantity,
  });
});

app.get("/api/products/search", (req, res) => {
  const { name } = req.query;
  // const product = products.find(
  //   (product) => product.name.toLowerCase() === name.toLowerCase(),
  // ); // returns the first element that matches the condition

  const result = products.filter((product) =>
    product.name.toLowerCase().includes(name.toLowerCase()),
  ); // returns all the elements that matches the condition
  if (result.length === 0) {
    res.status(404).json({ message: "Product not found" });
    return;
  }
  res.json(result);
});

const users = [
  { id: 1, name: "John Doe", age: 23 },
  { id: 2, name: "Jane Doe", age: 25 },
  { id: 3, name: "Bob Smith", age: 28 },
  { id: 4, name: "Alice Johnson", age: 30 },
  { id: 5, name: "Charlie Brown", age: 32 },
  { id: 6, name: "David Wilson", age: 34 },
];

/// Request parameters - use it to access resource based on the key specified in the url
app.get("/api/users/:id", (req, res) => {
  // res.json(req.params);
  const { id } = req.params; // destructuring
  const user = users.find((user) => user.id === Number(id));
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json(user);
});

app.get("/api/programmes/:programId/courses/:courseId", (req, res) => {
  const { programId, courseId } = req.params;
  res.json({ programId, courseId });
});

app.listen(3000, () => {
  console.log(`Server is running on port http://localhost:3000`);
});
