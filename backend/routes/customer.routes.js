const express = require('express');
const { authenticate } = require('../middleware/auth.middleware.js'); // Authentication middleware

const { getAllProducts, getProductDetails, addToCart, viewCart, placeOrder, viewOrderDetails, confirmOrder, removeFromCart, getOrdersByCustomerId } = require('../controllers/customer.controller.js'); // Import the controller function

const router = express.Router();
router.get('/allProducts', authenticate, getAllProducts);
router.get('/products/:id', authenticate, getProductDetails);
router.post('/addToCart', authenticate, addToCart); // Route to add product to cart
router.get('/viewCart', authenticate, viewCart); // Route to view cart
router.delete('/cart/:cartItemId', authenticate, removeFromCart);
router.post('/orders/place', authenticate, placeOrder);
router.get('/orders/:orderId', authenticate, viewOrderDetails);
router.post('/orders/:orderId/confirm', authenticate, confirmOrder);
router.get('/orders', authenticate, getOrdersByCustomerId); // Fetch all orders for a customer

// Export the router
module.exports = router;
