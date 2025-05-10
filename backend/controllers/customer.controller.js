const Product = require("../src/config/model/Products.model.js");
const merchant = require("../src/config/model/Merchant.model.js");
const Customer = require('../src/config/model/Customers.model.js');
const user = require("../src/config/model/Users.model.js");


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
    console.log('Customer ID:', customerId);

    // Find the customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
     // Find the product
     const product = await Product.findById(productId);
     if (!product) {
       return res.status(404).json({ message: 'Product not found' });
     }
 
     // Check if the product is already in the cart
     const cartItem = customer.cart.find(
       (item) => item.productId.toString() === productId
     );
 
     if (cartItem) {
       // Update the quantity if the product is already in the cart
       cartItem.quantity += quantity;
     } else {
       // Add the product to the cart
       customer.cart.push({ productId, quantity });
     }
 
     // Save the updated customer document
     await customer.save();
     res.status(200).json({ message: 'Product added to cart', cart: customer.cart });
    } catch (err) {
      console.error('Error in addToCart:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };

//view cart
const viewCart = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId);

    const customer = await user.findOne({ _id: userId });
    console.log(customer);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    // const allCartItems = await customer.find();
    // console.log(allCartItems);

    const cartItems = await customer.find({ userId: customer._id }).populate('productId');
    console.log(cartItems);

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