const express = require("express");
const router = express.Router();
// const { Router } = express; // object destructuring
// const router = Router(); // using object destructuring

router.get("/", (req, res) => {
  const { name, description, icon } = req.query;
  console.log(name, description, icon);
  res.json({
    description: "get all categories",
    success: true,
    data: {
      name: name,
      description: description,
      icon: icon,
    },
  });
});

router.post("/", (req, res) => {
  const { name, description, icon } = req.body;
  console.log(name, description, icon);
  res.json({
    description: "create a new category",
    success: true,
    data: {
      name: name,
      description: description,
    },
  });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  console.log(id);
  res.json({
    description: "get a single category",
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
    description: "update a category",
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
    description: "delete a category",
    success: true,
    data: {
      id: id,
    },
  });
});

module.exports = router;
