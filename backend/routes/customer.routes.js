const express = require('express');
import { getAllProducts } from '../controllers/products.controller.js'; // Import the controller function

const router = express.Router();
router.get('/allProducts', getAllProducts);


// Export the router
module.exports = router;
