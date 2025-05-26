// routes/dspLocationRoutes.js
const express = require('express');
const router = express.Router();
const { updateLocation, getDspOrders } = require('../controllers/dsp.controller.js'); // Import the controller function
const {getMyDspProfile} = require('../controllers/profile.controller.js'); // Import the controller function for getting DSP profile
const { authenticate } = require('../middleware/auth.middleware.js'); // Authentication middleware

router.post('/location',authenticate, updateLocation);
router.get('/orders', authenticate, getDspOrders); // Get DSP orders
router.get('/profile', authenticate, getMyDspProfile); // Get DSP profile

module.exports = router;
