const express = require('express');
const { authenticate } = require('../middleware/auth.middleware.js'); // Authentication middleware

const { getAllProducts, getProductDetails, addToCart, viewCart, placeOrder, viewOrderDetails, confirmOrder, removeFromCart, getOrdersByCustomerId,DspAcceptOrder,DspOnShipping,DspRejectOrder,reassignDsp,customerOrderDelivered} = require('../controllers/customer.controller.js'); // Import the controller function

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
router.post('/orders/:orderId/dsp-accept', authenticate, DspAcceptOrder); // DSP accepts the order
router.post('/orders/:orderId/dsp-on-shipping', authenticate, DspOnShipping); // DSP marks the order as on shipping
router.post('/orders/:orderId/dsp-reject', authenticate, DspRejectOrder); // DSP rejects the order
router.post('/orders/:orderId/reassign-dsp', authenticate, reassignDsp); // Reassign DSP for an order
router.post('/orders/:orderId/delivered', authenticate, customerOrderDelivered); // Mark order as delivered by customer


// Export the router
module.exports = router;
