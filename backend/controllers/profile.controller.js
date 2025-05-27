// filepath: c:\Users\hp\Desktop\MerchDeliver\backend\controllers\profile.controller.js
const Merchant = require("../src/config/model/Merchant.model.js");
const Dsp = require("../src/config/model/DSP.model.js");

// Get current merchant profile
const getMyProfile = async (req, res) => {
  const merchant = await Merchant.findOne({ userId: req.user._id }).populate('userId', 'name email phoneNumber');
  if (!merchant) return res.status(404).json({ message: "Merchant profile not found" });
  res.json(merchant);
};
//get current DSP profile
const getMyDspProfile = async (req, res) => {
  const dsp = await Dsp.findOne({ userId: req.user._id });
  if (!dsp) return res.status(404).json({ message: "DSP profile not found" });
  res.json(dsp);
};

// Update merchant profile
const updateMyProfile = async (req, res) => {
  const merchant = await Merchant.findOne({ userId: req.user._id });
  if (!merchant) return res.status(404).json({ message: "Merchant profile not found" });

  const { storeName, location, tradeLicense, phone } = req.body;

  merchant.storeName = storeName || merchant.storeName;
  merchant.location = location || merchant.location;
  merchant.tradeLicense = tradeLicense || merchant.tradeLicense;
  merchant.phone = phone || merchant.phone;

  await merchant.save();
  res.json({ message: "Profile updated", merchant });
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getMyDspProfile,
};