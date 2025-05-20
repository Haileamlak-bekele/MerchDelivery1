const express = require('express');
const router = express.Router();
const { placeOrder, viewOrderDetails, confirmOrder } = require('../controllers/customer.controller.js');
const { authenticate } = require('../middleware/auth.middleware');

// Place a new order
router.post('/place', authenticate, placeOrder);

// View order details
router.get('/:orderId', authenticate, viewOrderDetails);

// Confirm order
router.post('/:orderId/confirm', authenticate, confirmOrder);

module.exports = router; 