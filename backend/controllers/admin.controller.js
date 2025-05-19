const User = require("../src/config/model/Users.model.js");
const Merchant = require("../src/config/model/Merchant.model.js");
const DSP = require("../src/config/model/DSP.model.js");
const DeliveryPriceSettings = require("../src/config/model/DeliveryPricesetting.model.js");

// @desc Get all users
const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};
// @desc Get user by ID
 const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

// @desc Delete a user
 const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  await user.deleteOne();
  res.json({ message: "User deleted" });
};

// @desc Get all merchants with their details
const getAllMerchants = async (req, res) => {
  try {
    // Find all users with merchant role
    const merchantUsers = await User.find({ role: 'merchant' }).select('-password');
    
    // Get merchant details for each user
    const merchants = await Promise.all(
      merchantUsers.map(async (user) => {
        const merchantDetails = await Merchant.findOne({ userId: user._id });
        return {
          ...user.toObject(),
          merchantDetails
        };
      })
    );

    res.json(merchants);
  } catch (error) {
    console.error('Error fetching merchants:', error);
    res.status(500).json({ message: 'Error fetching merchants', error });
  }
};

const getAllDSPs = async (req, res) => {
  try {
    // Find all users with merchant role
    const DspUsers = await User.find({ role: 'dsp' }).select('-password');
    
    // Get merchant details for each user
    const Dsp = await Promise.all(
      DspUsers.map(async (user) => {
        const DspDetails = await DSP.findOne({ userId: user._id });
        return {
          ...user.toObject(),
          DspDetails
        };
      })
    );

    res.json(Dsp);
  } catch (error) {
    console.error('Error fetching Dsp:', error);
    res.status(500).json({ message: 'Error fetching Dsp', error });
  }
};

const setDeliveryPricing = async (req, res) => {
  const { basePrice, perKmRate, perKgRate } = req.body;
  const adminId = req.user.id;

  // Check if the user is an admin
  const adminUser = await User.findById(adminId);
  if (!adminUser || adminUser.role !== "admin") {
    return res.status(403).json({ message: "Only admins can update delivery pricing" });
  }

  // Validate that rates are non-negative
  if (basePrice < 0 || perKmRate < 0 || perKgRate < 0) {
    return res.status(400).json({ message: "Rates must be non-negative numbers" });
  }

  // Update or create delivery pricing settings
  const settings = await DeliveryPriceSettings.findOneAndUpdate(
    {},
    {
      basePrice,
      perKmRate,
      perKgRate,
      updatedBy: adminId,
      updatedAt: new Date(),
    },
    { new: true, upsert: true }
  );

  res.json({ message: "Delivery pricing updated", deliverySettings: settings });
};

const getDeliveryPricing = async (req, res) => {
  const settings = await DeliveryPriceSettings.findOne();
  if (!settings) return res.status(404).json({ message: 'Delivery pricing settings not found' });

  res.json(settings);
}

// @desc Get platform stats
const getPlatformStats = async (req, res) => {
  try {
    // Count users by role
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: "admin" });
    const merchantCount = await User.countDocuments({ role: "merchant" });
    const dspCount = await User.countDocuments({ role: "dsp" });
    const customerCount = await User.countDocuments({ role: "customer" });

    // Count active and inactive users
    const activeUsers = await User.countDocuments({ status: "active" });
    const inactiveUsers = await User.countDocuments({ status: "inactive" });

    // Count merchants by approvalStatus
    const approvedMerchants = await Merchant.countDocuments({ approvalStatus: "approved" });
    const pendingMerchants = await Merchant.countDocuments({ approvalStatus: "pending" });
    const rejectedMerchants = await Merchant.countDocuments({ approvalStatus: "rejected" });

    // Count DSPs by approvalStatus
    const approvedDsps = await Dsp.countDocuments({ approvalStatus: "approved" });
    const pendingDsps = await Dsp.countDocuments({ approvalStatus: "pending" });
    const rejectedDsps = await Dsp.countDocuments({ approvalStatus: "rejected" });

    // Send response
    res.json({
      totalUsers,
      roles: {
        admin: adminCount,
        merchant: merchantCount,
        dsp: dspCount,
        customer: customerCount,
      },
      status: {
        active: activeUsers,
        inactive: inactiveUsers,
      },
      merchants: {
        approved: approvedMerchants,
        pending: pendingMerchants,
        rejected: rejectedMerchants,
      },
      dsps: {
        approved: approvedDsps,
        pending: pendingDsps,
        rejected: rejectedDsps,
      },
    });
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    res.status(500).json({ message: "Error fetching platform stats", error });
  }
};

// @desc Admin updates approval status (approve/reject merchant/DSP)
const updateUserStatus = async (req, res) => {
  const { id } = req.params; // User ID
  const { status } = req.body; // New approval status

  // Validate the approvalStatus value
  if (!["approved", "rejected", "pending"].includes(status)) {
    return res.status(400).json({ message: "Invalid approval status value" });
  }

  // Find the user by ID
  const user = await User.findById(id);

  if (!user) return res.status(404).json({ message: "User not found" });

  // Check if the user is a merchant or DSP
  if (user.role === "merchant") {
    // Update the approvalStatus in the Merchant table
    const merchant = await Merchant.findOne({ userId: id });
    if (!merchant) return res.status(404).json({ message: "Merchant not found" });

    merchant.approvalStatus = status;
    await merchant.save();

    return res.json({ message: `Merchant approval status updated to ${status}`, merchant });
  } else if (user.role === "dsp") {
    // Update the approvalStatus in the DSP table
    const dsp = await DSP.findOne({ userId: id });
    if (!dsp) return res.status(404).json({ message: "DSP not found" });

    dsp.approvalStatus = status;
    await dsp.save();

    return res.json({ message: `DSP approval status updated `, dsp });
  } else {
    return res.status(400).json({ message: "Can only update status of merchant or dsp" });
  }
};



module.exports = {
  getAllUsers,
  getUserById,
  deleteUser,
  getDeliveryPricing,
  getAllMerchants,
  getAllDSPs ,
  getPlatformStats,
  updateUserStatus,
  setDeliveryPricing,
};