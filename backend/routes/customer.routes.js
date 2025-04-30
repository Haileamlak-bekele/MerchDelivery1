const express = require('express');
const { authenticate } = require('../middleware/auth.middleware.js'); // Authentication middleware

const { getAllProducts, getProductDetails, addToCart, viewCart } =require('../controllers/customer.controller.js'); // Import the controller function

const router = express.Router();
router.get('/allProducts', authenticate, getAllProducts);
router.get('/productDetails/:productId', authenticate, getProductDetails); // Route to get product details
router.post('/addToCart', authenticate, addToCart); // Route to add product to cart
router.get('/viewCart', authenticate, viewCart); // Route to view cart


// Export the router
module.exports = router;
