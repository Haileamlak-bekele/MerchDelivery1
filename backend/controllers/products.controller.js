const Product = require("../src/config/model/Products.model.js");
const merchant = require("../src/config/model/Merchant.model.js");
const fs = require('fs');
const path = require('path');

const createProduct = async (req, res) => {
  const { name, description, price, stock_quantity, category } = req.body;

  // Validate required fields
  if (!name || !description || !price || !stock_quantity || !category) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Log the file information for debugging
    console.log('File information:', req.file);
    
    const product = await Product.create({
      merchantId: req.merchant._id,
      name,
      description,
      price,
      stock_quantity,
      category,
      image: req.file ? `/uploads/products/${req.file.filename}` : null,
    });

    console.log('Created product:', product);
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

  // If a new image is uploaded, delete the old one
  if (req.file) {
    if (product.image) {
      const oldImagePath = path.join(__dirname, '..', product.image);
      fs.unlink(oldImagePath, (err) => {
        if (err) {
          console.error('Failed to delete old image:', err.message);
        } else {
          console.log('Old image deleted:', oldImagePath);
        }
      });
    }
    product.image = `/uploads/products/${req.file.filename}`;
  }

  // Update other fields
  product.name = req.body.name || product.name;
  product.description = req.body.description || product.description;
  product.price = req.body.price || product.price;
  product.stock_quantity = req.body.stock_quantity || product.stock_quantity;
  product.category = req.body.category || product.category;

  await product.save();

  res.json({ message: "Product updated", product });
};

// Delete product
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findOne({ _id: id, merchantId: req.merchant._id });

  if (!product) return res.status(404).json({ message: "Product not found" });

  // Delete the product image if it exists
  if (product.image) {
    const imagePath = path.join(__dirname, '..', product.image);
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Failed to delete product image:', err.message);
      } else {
        console.log('Product image deleted:', imagePath);
      }
    });
  }

  // Delete the product from the database
  await Product.deleteOne({ _id: id, merchantId: req.merchant._id });

  res.json({ message: "Product deleted successfully" });
};

module.exports = {
  
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getSingleProduct,
};
