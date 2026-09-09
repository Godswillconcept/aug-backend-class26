const fs = require("fs");
const { join } = require("path");
// Get all products
/// loading products data from book.json file
const jsonPath = join(__dirname, "../storage/products.json");
let jsonContent = fs.readFileSync(jsonPath, "utf-8");

let products;
try {
  products = jsonContent.trim() ? JSON.parse(jsonContent) : [];
} catch (err) {
  console.error(
    "Failed to parse products.json, defaulting to empty array:",
    err.message,
  );
  products = [];
}

const getAllProducts = (req, res) => {
  res.json({
    message: "get all products",
    success: true,
    data: products,
  });
};

const createProduct = (req, res) => {
  const { name, price, stock, category } = req.body;
  products.push({ id: products.length + 1, name, price, stock, category });
  fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2), "utf8");
  res.json({
    message: "create a new product",
    success: true,
    data: products,
  });
};

const getProductById = (req, res) => {
  const { id } = req.params;
  const product = products.find((product) => product.id === Number(id));
  if (!product) {
    return res.status(404).json({
      message: "product not found",
      success: false,
    });
  }

  res.json({
    message: "get a single product",
    success: true,
    data: product,
  });
};

const updateProduct = (req, res) => {
  const { id } = req.params;
  const { name, price, stock, category } = req.body;
  const product = products.find((product) => product.id === Number(id));
  if (!product) {
    return res.status(404).json({
      message: "product not found",
      success: false,
    });
  }
  Object.assign(product, { name, price, stock, category });

  fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2), "utf8");
  res.json({
    message: "product updated successfully",
    success: true,
    data: product,
  });
};

const partialProductUpdate = (req, res) => {
  const { id } = req.params;
  const product = products.find((product) => product.id === Number(id));
  if (!product) {
    return res.status(404).json({
      message: "product not found",
      success: false,
    });
  }
  const updatedProduct = Object.assign(product, req.body);
  fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2), "utf8");
  res.json({
    message: "product updated successfully",
    success: true,
    data: updatedProduct,
  });
};

const deleteProduct = (req, res) => {
  const { id } = req.params;
  const product = products.find((product) => product.id === Number(id));
  if (!product) {
    return res.status(404).json({
      message: "product not found",
      success: false,
    });
  }

  products = products.filter((product) => product.id !== Number(id)); // remove deleted product
  fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2), "utf8");
  res.json({
    message: "product deleted successfully",
    success: true,
    data: product,
  });
};

const getProductByCategory = (req, res) => {
  const { category } = req.params;
  const categoryProducts = products.filter(
    (product) => product.category === category,
  );

  if (!categoryProducts) {
    return res.status(404).json({
      message: "product not found",
      success: false,
    });
  }

  res.json({
    message: "get products by category",
    success: true,
    data: categoryProducts,
  });
};

module.exports = {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  partialProductUpdate,
  deleteProduct,
  getProductByCategory,
};
