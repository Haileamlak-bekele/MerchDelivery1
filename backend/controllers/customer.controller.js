const Product = require("../src/config/model/Products.model.js");
const merchant = require("../src/config/model/Merchant.model.js");
const Customer = require('../src/config/model/Customers.model.js');
const user = require("../src/config/model/Users.model.js");
const User = require("../src/config/model/Users.model.js");
const Cart = require("../src/config/model/Cart.model.js");


//Get all products for customers
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate('merchantId', 'storeName location'); // only show necessary fields
    res.status(200).json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch products', error: err.message });
  }
};

//get product details for customers

const getProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId).populate({
      path: 'merchantId',
      select: 'storeName location', // You can customize fields
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const addToCart = async (req, res) => {
  try {
    const customerId = req.user.id; // Assume user is authenticated
    const { productId, quantity } = req.body;

    console.log('Customer ID:', customerId);
    console.log('Product ID:', productId, 'Quantity:', quantity);

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the cart item already exists for this customer and product
    let cartItem = await Cart.findOne({ customer: customerId, product: productId });
    if (cartItem) {
      // Update the quantity
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // Create a new cart item
      cartItem = new Cart({ customer: customerId, product: productId, quantity });
      await cartItem.save();
    }

    res.status(200).json({ message: 'Product added to cart', cartItem });
  } catch (err) {
    console.error('Error in addToCart:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

//view cart
const viewCart = async (req, res) => {
  try {
    const customerId = req.user.id;
    // Fetch all cart items for this customer, populate product details
    const cartItems = await Cart.find({ customer: customerId }).populate('product');
    res.status(200).json({ cart: cartItems });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllProducts,
  getProductDetails,
  addToCart,
  viewCart,
};