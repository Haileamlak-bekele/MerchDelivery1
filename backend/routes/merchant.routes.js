const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware.js'); // Authentication middleware
const { isApprovedMerchant } = require('../middleware/products.middleware.js'); // Merchant approval middleware

const verifyMerchantAuth = require('../middleware/verifyMerchantAuth.middleware.js'); // Merchant authentication middleware
const {
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getSingleProduct,
} = require('../controllers/products.controller.js');

const {getMyProfile,updateMyProfile} = require('../controllers/profile.controller.js');

// Protect product routes with authentication and merchant approval middleware
router.post('/products', authenticate, isApprovedMerchant, createProduct);
router.get('/products', authenticate, isApprovedMerchant, getMyProducts);
router.get('/products/:id', authenticate, isApprovedMerchant, getSingleProduct);
router.put('/products/:id', authenticate, isApprovedMerchant, updateProduct);
router.delete('/products/:id', authenticate, isApprovedMerchant, deleteProduct);

//profile routes
router.get('/profile', verifyMerchantAuth, getMyProfile); // Get merchant profile
router.put('/profile', verifyMerchantAuth, updateMyProfile); // Update merchant profile

module.exports = router;