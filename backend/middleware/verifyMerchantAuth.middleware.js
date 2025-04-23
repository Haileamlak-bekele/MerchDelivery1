// middleware/verifyMerchantAuth.js
const User = require("../src/config/model/Users.model.js"); // Adjust the path as necessary
const Merchant = require("../src/config/model/Merchant.model.js"); // Adjust the path as necessary
const jwt = require("jsonwebtoken");

const verifyMerchantAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== "merchant") {
      return res.status(403).json({ message: "Forbidden: Not a merchant" });
    }

    const merchant = await Merchant.findOne({ userId: user._id });
    if (!merchant) {
      return res.status(404).json({ message: "Merchant profile not found" });
    }

    req.user = user;
    req.merchant = merchant;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyMerchantAuth;
