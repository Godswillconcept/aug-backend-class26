const express = require("express");
const router = express.Router();
// const { Router } = express; // object destructuring
// const router = Router(); // using object destructuring

const productController = require("../controllers/product.controller"); // import controller

router.get("/", productController.getAllProducts); // get all products

router.post("/", productController.createProduct); // create a new product

router.get("/:id", productController.getProductById); // get a single product by id

router.put("/:id", productController.updateProduct); // update a product by id

router.patch("/:id", productController.partialProductUpdate); // update a product by id

router.delete("/:id", productController.deleteProduct); // delete a product by id

router.get("/:category/categories", productController.getProductByCategory); // get products by category

// api/products/groceries/catgeries
// api/products/1
module.exports = router;
