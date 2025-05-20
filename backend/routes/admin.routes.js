const express = require("express");
const {
  getAllUsers,getUserById,deleteUser,getAllMerchants,getPlatformStats,updateUserStatus, setDeliveryPricing} = require("../controllers/admin.controller.js");
const { protect, authorizeRoles } = require("../middleware/auth.middleware.js");

const router = express.Router();

// Protect all routes & require admin
router.use(protect);
router.use(authorizeRoles("admin"));

router.get("/users", getAllUsers);
router.get("/merchant", getAllMerchants);
router.get("/user/:id", getUserById);
router.delete("/user/:id", deleteUser);
router.put("/approve/:id", updateUserStatus); // Approve or reject merchant/DSP
router.put("/deliveryPricing", setDeliveryPricing); // Set delivery pricing
router.get("/stats", getPlatformStats);

module.exports = router;