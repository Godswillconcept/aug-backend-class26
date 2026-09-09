const fs = require("fs");
const { join } = require("path");

// Get all books
/// loading books data from book.json file
const jsonPath = join(__dirname, "../storage/library.json");
let jsonContent = fs.readFileSync(jsonPath, "utf-8");

let books;
try {
  books = jsonContent.trim() ? JSON.parse(jsonContent) : [];
} catch (err) {
  console.error(
    "Failed to parse library.json, defaulting to empty array:",
    err.message,
  );
  books = [];
}

const getAllBooks = (req, res) => {
  const { name, age } = req.query;
  console.log(name, age);
  res.json({
    message: "get all books",
    success: true,
    data: books,
  });
};

const createBook = (req, res) => {
  const { title, author, pageCount, publishedDate, isbn } = req.body;
  console.log({ title, author, pageCount, publishedDate, isbn });
  books.push({
    id: books.length + 1,
    title,
    author,
    pageCount,
    publishedDate,
    isbn,
  });
  fs.writeFileSync(jsonPath, JSON.stringify(books, null, 2), "utf8");
  res.json({
    message: "create a new book",
    success: true,
    data: books,
  });
};

const getBookById = (req, res) => {
  const { id } = req.params;
  const book = books.find((book) => book.id === Number(id));
  if (!book) {
    return res.status(404).json({
      message: "book not found",
      success: false,
    });
  }

  res.json({
    message: "get a single book",
    success: true,
    data: book,
  });
};

const updateBook = (req, res) => {
  const { id } = req.params;
  const { title, author, pageCount, publishedDate, isbn } = req.body;
  const book = books.find((book) => book.id === Number(id));
  if (!book) {
    return res.status(404).json({
      message: "book not found",
      success: false,
    });
  }
  book.title = title;
  book.author = author;
  book.pageCount = pageCount;
  book.publishedDate = publishedDate;
  book.isbn = isbn;

  fs.writeFileSync(jsonPath, JSON.stringify(books, null, 2), "utf8");
  res.json({
    message: "book updated successfully",
    success: true,
    data: book,
  });
};

const partialBookUpdate = (req, res) => {
  const { id } = req.params;
  const book = books.find((book) => book.id === Number(id));
  if (!book) {
    return res.status(404).json({
      message: "book not found",
      success: false,
    });
  }
  const updatedBook = Object.assign(book, req.body);
  fs.writeFileSync(jsonPath, JSON.stringify(books, null, 2), "utf8");
  res.json({
    message: "book updated successfully",
    success: true,
    data: updatedBook,
  });
};

const deleteBook = (req, res) => {
  const { id } = req.params;
  const book = books.find((book) => book.id === Number(id));
  if (!book) {
    return res.status(404).json({
      message: "book not found",
      success: false,
    });
  }

  books = books.filter((book) => book.id !== Number(id)); // remove deleted book
  fs.writeFileSync(jsonPath, JSON.stringify(books, null, 2), "utf8");
  res.json({
    message: "book deleted successfully",
    success: true,
    data: book,
  });
};

module.exports = {
  getAllBooks,
  createBook,
  getBookById,
  updateBook,
  partialBookUpdate,
  deleteBook,
};
