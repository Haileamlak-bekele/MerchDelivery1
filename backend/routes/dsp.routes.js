// routes/dspLocationRoutes.js
const express = require('express');
const router = express.Router();
const { updateLocation, getDspOrders } = require('../controllers/dsp.controller.js'); // Import the controller function
const { authenticate } = require('../middleware/auth.middleware.js'); // Authentication middleware

router.post('/location',authenticate, updateLocation);
router.get('/orders', authenticate, getDspOrders); // Get DSP orders

module.exports = router;
