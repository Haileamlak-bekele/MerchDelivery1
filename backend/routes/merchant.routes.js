const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware.js'); // Authentication middleware
const { isApprovedMerchant } = require('../middleware/products.middleware.js'); // Merchant approval middleware
const { uploadProductImage, handleUploadErrors } = require('../middleware/productImage.js'); // Image upload middleware

const verifyMerchantAuth = require('../middleware/verifyMerchantAuth.middleware.js'); // Merchant authentication middleware
const {
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getSingleProduct,
} = require('../controllers/products.controller.js');

const {getMyProfile,updateMyProfile} = require('../controllers/profile.controller.js');
const { viewAllOrders } = require('../controllers/merchant.controller.js');

// Protect product routes with authentication and merchant approval middleware
router.post('/products', authenticate, isApprovedMerchant, uploadProductImage, handleUploadErrors, createProduct);
router.get('/products', authenticate, isApprovedMerchant, getMyProducts);
router.get('/products/:id', authenticate, isApprovedMerchant, getSingleProduct);
router.put('/products/:id', authenticate, isApprovedMerchant, uploadProductImage, handleUploadErrors, updateProduct);
router.delete('/products/:id', authenticate, isApprovedMerchant, deleteProduct);

//profile routes
router.get('/profile', verifyMerchantAuth, getMyProfile); // Get merchant profile
router.put('/profile', verifyMerchantAuth, updateMyProfile); // Update merchant profile

// View all orders for the merchant
router.get('/orders', authenticate, viewAllOrders);

module.exports = router;