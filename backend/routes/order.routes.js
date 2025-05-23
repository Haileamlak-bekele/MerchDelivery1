const express = require('express');
const router = express.Router();
const { placeOrder, viewOrderDetails, confirmOrder,assignDsp } = require('../controllers/customer.controller.js');
const { authenticate } = require('../middleware/auth.middleware');

// Place a new order
router.post('/place', authenticate, placeOrder);

// View order details
router.get('/:orderId', authenticate, viewOrderDetails);

// Confirm order
router.post('/:orderId/confirm', authenticate, confirmOrder);

//assign order to DSP
router.post('/:orderId/assign-dsp', authenticate, assignDsp);

module.exports = router; 