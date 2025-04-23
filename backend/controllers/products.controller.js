const Product = require("../src/config/model/Products.model.js");
const merchant = require("../src/config/model/Merchant.model.js");

const createProduct = async (req, res) => {
  const { name, description, price, stock_quantity, category } = req.body;

  // Validate required fields
  if (!name || !description || !price || !stock_quantity || !category) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const product = await Product.create({
      merchantId: req.merchant._id,
      name,
      description,
      price,
      stock_quantity,
      category,
    });

    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all merchant products
const getMyProducts = async (req, res) => {
  const products = await Product.find({ merchantId: req.merchant._id });
  res.json(products);
};

//get single product

const getSingleProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findOne({ _id: id, merchantId: req.merchant._id });

  if (!product) return res.status(404).json({ message: "Product not found" });

  res.json(product);
};

// Update a product
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findOne({ _id: id, merchantId: req.merchant._id });

  if (!product) return res.status(404).json({ message: "Product not found" });

  Object.assign(product, req.body);
  await product.save();

  res.json({ message: "Product updated", product });
};

// Delete product
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findOneAndDelete({ _id: id, merchantId: req.merchant._id });

  if (!product) return res.status(404).json({ message: "Product not found" });

  res.json({ message: "Product deleted" });
};

module.exports = {
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getSingleProduct,
};
