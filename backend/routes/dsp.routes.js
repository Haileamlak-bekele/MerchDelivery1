// routes/dspLocationRoutes.js
const express = require('express');
const router = express.Router();
const { updateLocation } = require('../controllers/dsp.controller.js'); // Import the controller function
const { authenticate } = require('../middleware/auth.middleware.js'); // Authentication middleware

router.post('/location',authenticate, updateLocation);

module.exports = router;
