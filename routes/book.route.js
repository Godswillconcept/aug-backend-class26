const express = require("express");
const router = express.Router();
// const { Router } = express; // object destructuring
// const router = Router(); // using object destructuring

const bookController = require("../controllers/book.controller"); // import controller

router.get("/", bookController.getAllBooks); // get all books

router.post("/", bookController.createBook); // create a new book

router.get("/:id", bookController.getBookById); // get a single book by id

router.put("/:id", bookController.updateBook); // update a book by id

router.patch("/:id", bookController.partialBookUpdate); // update a book by id

router.delete("/:id", bookController.deleteBook); // delete a book by id

module.exports = router;
