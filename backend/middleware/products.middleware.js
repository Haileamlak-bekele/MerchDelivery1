const Merchant = require('../src/config/model/Merchant.model.js');

const isApprovedMerchant = async (req, res, next) => {
  try {
    // Check if the user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User is not authenticated" });
    }

    // Retrieve the merchant record for the authenticated user
    const userId = req.user.id;
    const merchant = await Merchant.findOne({ userId });

    // Check if the merchant exists and is approved
    if (!merchant || merchant.approvalStatus !== "approved") {
      return res.status(403).json({ message: "Only approved merchants can manage products" });
    }

    // Attach the merchant record to the request object
    req.merchant = merchant;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error in isApprovedMerchant middleware:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  isApprovedMerchant,
};