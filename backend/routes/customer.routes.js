const express = require('express');
const { authenticate } = require('../middleware/auth.middleware.js'); // Authentication middleware

const { getAllProducts, getProductDetails, addToCart, viewCart, placeOrder, viewOrderDetails, confirmOrder, removeFromCart } = require('../controllers/customer.controller.js'); // Import the controller function

const router = express.Router();
router.get('/allProducts', authenticate, getAllProducts);
router.get('/products/:id', authenticate, getProductDetails);
router.post('/addToCart', authenticate, addToCart); // Route to add product to cart
router.get('/viewCart', authenticate, viewCart); // Route to view cart
router.delete('/cart/:cartItemId', authenticate, removeFromCart);
router.post('/orders/place', authenticate, placeOrder);
router.get('/orders/:orderId', authenticate, viewOrderDetails);
router.post('/orders/:orderId/confirm', authenticate, confirmOrder);

// Export the router
module.exports = router;
