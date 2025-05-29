const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const users = require("../src/config/model/Users.model.js");
const merchant = require("../src/config/model/Merchant.model.js");
const dsp = require("../src/config/model/DSP.model.js");
const PlatformSettings = require("../src/config/model/PlatformSettings.model.js");

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });

const addUser = async (req, res) => {
    const {
        name,
        email,
        password,
        role,
        phoneNumber,
        storeName,
        location, // Expecting location as { lat, lng } or as stringified JSON
        vehicleDetails,
    } = req.body;

    // Get file paths from uploaded files
    const tradeLicense = req.files?.tradeLicense ? req.files.tradeLicense[0].path : null;
    const drivingLicense = req.files?.drivingLicense ? req.files.drivingLicense[0].path : null;

    // Validate required fields
    if (!name || !email || !password || !phoneNumber) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Check if user exists
        const userExists = await users.findOne({ email });
        if (userExists)
            return res.status(400).json({ message: "User already exists" });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await users.create({
            name,
            email,
            password: hashedPassword,
            role,
            phoneNumber,
        });

        let merchantId = null;
        let dspId = null;

        try {
            const savedUser = await user.save();

            if (role === "merchant") {
                // Parse location if sent as JSON string
                let merchantLocation = location;
                if (typeof location === "string") {
                    try {
                        merchantLocation = JSON.parse(location);
                    } catch (e) {
                        return res.status(400).json({ message: "Invalid location format. Should be an object with lat and lng." });
                    }
                }
                // Validate lat/lng
                if (
                    !merchantLocation ||
                    typeof merchantLocation.lat !== "number" ||
                    typeof merchantLocation.lng !== "number"
                ) {
                    return res.status(400).json({ message: "Merchant location must include numeric lat and lng." });
                }

                const newMerchant = new merchant({
                    userId: savedUser._id,
                    storeName,
                    location: {
                        lat: merchantLocation.lat,
                        lng: merchantLocation.lng
                    },
                    tradeLicense,
                });

                const savedMerchant = await newMerchant.save();
                merchantId = savedMerchant._id;
            }

            if (role === "dsp") {
                const newDsp = new dsp({
                    userId: savedUser._id,
                    vehicleDetails,
                    drivingLicense,
                });
                const savedDsp = await newDsp.save();
                dspId = savedDsp._id;
            }
        } catch (error) {
            console.error("Error saving user or merchant:", error);
            return res.status(500).json({ message: "Error saving user or merchant" });
        }

        // Generate token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        // Fetch registration price from platform settings if merchant or dsp
        let needsPayment = false;
        let registrationPrice = 0;
        if (user.role === "merchant" || user.role === "dsp") {
            const settings = await PlatformSettings.findOne().sort({ updatedAt: -1 });
            if (settings) {
                if (user.role === "merchant") registrationPrice = settings.registrationPriceMerchant;
                if (user.role === "dsp") registrationPrice = settings.registrationPriceDSP;
            }
            needsPayment = true;
        }

        // Send response
        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phoneNumber: user.phoneNumber,
            status: user.status,
            token,
            needsPayment,
            registrationPrice,
            merchantId,
            dspId,
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await users.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Check approvalStatus for merchants and DSPs
    if (user.role === "merchant" || user.role === "dsp") {
      const relatedModel = user.role === "merchant" ? merchant : dsp;
      const relatedRecord = await relatedModel.findOne({ userId: user._id });

      if (!relatedRecord || relatedRecord.approvalStatus !== "approved") {
        return res.status(403).json({ message: "Your account is not approved for login" });
      }
    }

    // Match password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Update isActive and lastActive for DSPs
    if (user.role === "dsp") {
      await users.findByIdAndUpdate(user._id, {
        isActive: true,
        lastActive: new Date()
      });
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Get all currently active DSPs
const getActiveDsps = async (req, res) => {
  try {
    const activeDsps = await users.find({
      role: 'dsp',
      isActive: true
    }).select('name email isActive');
    res.json(activeDsps);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



// const getAllUsers = async (req, res) => {
//     try {
//         const usersList = await users.find();
//         res.status(200).json(usersList);
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching users', error });
//     }
// }

// const getUserById = async (req, res) => {
//     try {
//         const userId = req.params.id;
//         const user = await users.findById(userId);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         res.status(200).json(user);
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching user', error });
//     }
// }

// const updateUser = async (req, res) => {
//     try {
//         const userId = req.params.id;
//         const updatedData = req.body;
//         const user = await users.findByIdAndUpdate(userId, updatedData, { new: true });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         res.status(200).json({ message: 'User updated successfully', user });
//     } catch (error) {
//         res.status(500).json({ message: 'Error updating user', error });
//     }
// }

// const DeleteUser = async (req, res) => {
//     try {
//         const userId = req.params.id;
//         const user = await users.findByIdAndDelete(userId);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         res.status(200).json({ message: 'User deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ message: 'Error deleting user', error });
//     }
// }

// Payment proof upload for registration
const uploadPaymentProof = [
  upload.single('paymentProof'),
  async (req, res) => {
    const { merchantId, dspId } = req.body;
    if (!merchantId && !dspId) {
      return res.status(400).json({ message: 'merchantId or dspId is required' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    try {
      let updated;
      if (merchantId) {
        updated = await merchant.findByIdAndUpdate(
          merchantId,
          { $set: { paymentProof: req.file.path } },
          { new: true }
        );
      } else if (dspId) {
        updated = await dsp.findByIdAndUpdate(
          dspId,
          { $set: { paymentProof: req.file.path } },
          { new: true }
        );
      }
      if (!updated) {
        return res.status(404).json({ message: 'User record not found for payment proof' });
      }
      res.json({ message: 'Payment proof uploaded', filePath: req.file.path });
    } catch (err) {
      res.status(500).json({ message: 'Error saving payment proof', error: err.message });
    }
  }
];

module.exports = {
  addUser,
  // getAllUsers,
  // getUserById,
  // updateUser,
  // DeleteUser,
  loginUser,
  getActiveDsps,
  uploadPaymentProof,
};
