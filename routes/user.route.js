const express = require("express");
const router = express.Router();
// const { Router } = express; // object destructuring
// const router = Router(); // using object destructuring

router.get("/", (req, res) => {
  const { name, age } = req.query;
  console.log(name, age);
  res.json({
    message: "get all users",
    success: true,
    data: {
      name: name,
      age: age,
    },
  });
});

router.post("/", (req, res) => {
  const { name, age } = req.body;
  console.log(name, age);
  res.json({
    message: "create a new user",
    success: true,
    data: {
      name: name,
      age: age,
    },
  });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  console.log(id);
  res.json({
    message: "get a single user",
    success: true,
    data: {
      id: id,
    },
  });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  console.log(id);
  res.json({
    message: "update a user",
    success: true,
    data: {
      id: id,
    },
  });
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  console.log(id);
  res.json({
    message: "delete a user",
    success: true,
    data: {
      id: id,
    },
  });
});

module.exports = router;
