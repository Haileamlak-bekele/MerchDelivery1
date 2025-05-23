const express = require("express");
const router = express.Router();
// const { someController } = require("../controllers/paymentAccount.controller");
const { getPaymentAccountByUserId, getTransactionsByAccountId } = require("../controllers/paymentAccount.controller");

// Placeholder for payment account endpoints
// router.get("/", someController);

router.get("/:userId", getPaymentAccountByUserId);
router.get("/transactions/:accountId", getTransactionsByAccountId);

module.exports = router; 