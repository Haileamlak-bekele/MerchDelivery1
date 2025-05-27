const express = require('express');
const router = express.Router();
const { placeOrder, viewOrderDetails, confirmOrder,assignDsp,DspAcceptOrder,DspRejectOrder,DspOnShipping,customerOrderDelivered } = require('../controllers/customer.controller.js');
const { authenticate } = require('../middleware/auth.middleware');

// Place a new order
router.post('/place', authenticate, placeOrder);

// View order details
router.get('/:orderId', authenticate, viewOrderDetails);

// Confirm order
router.post('/:orderId/confirm', authenticate, confirmOrder);

//assign order to DSP
router.post('/:orderId/assign-dsp', authenticate, assignDsp);
// DSP accepts the order
router.post('/:orderId/dsp-accept', authenticate, DspAcceptOrder);
// DSP rejects the order
router.post('/:orderId/dsp-reject', authenticate, DspRejectOrder);
// DSP marks the order as on shipping
router.post('/:orderId/dsp-on-shipping', authenticate, DspOnShipping);
// Mark order as delivered by customer
router.post('/:orderId/delivered', authenticate, customerOrderDelivered);

module.exports = router; 