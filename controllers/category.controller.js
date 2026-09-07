const categories = [];

const getAllCategories = (req, res) => {
  res.json({
    message: "get all categories",
    success: true,
    data: categories,
  });
};

//  create category
const createCategory = (req, res) => {
  const { name, description, icon } = req.body;
  categories.push({ id: categories.length + 1, name, description, icon });
  res.json({
    message: "category created successfully",
    success: true,
    data: categories,
  });
};

// get a single category
const getCategoryById = (req, res) => {
  const { id } = req.params;
  const category = categories.find((category) => category.id === Number(id));
  if (!category) {
    return res.status(404).json({
      message: "category not found",
      success: false,
    });
  }
  res.json({
    message: "category found",
    success: true,
    data: category,
  });
};

// update a category
const updateCategory = (req, res) => {
  const { id } = req.params;
  const { name, description, icon } = req.body;
  const category = categories.find((category) => category.id === Number(id));
  if (!category) {
    return res.status(404).json({
      message: "category not found",
      success: false,
    });
  }
  category.name = name;
  category.description = description;
  category.icon = icon;
  res.json({
    message: "category updated successfully",
    success: true,
    data: category,
  });
};

// delete a category
const deleteCategory = (req, res) => {
  const { id } = req.params;
  const category = categories.find((category) => category.id === Number(id));
  if (!category) {
    return res.status(404).json({
      message: "category not found",
      success: false,
    });
  }
  categories = categories.filter((category) => category.id !== Number(id));
  res.json({
    message: "category deleted successfully",
    success: true,
    data: category,
  });
};
