const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const users = require("../src/config/model/Users.model.js");
const merchant = require("../src/config/model/Merchant.model.js");
const dsp = require("../src/config/model/DSP.model.js");

const addUser = async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    phoneNumber,
    storeName,
    location,
    vehicleDetails,
  } = req.body;
  

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

      // Set status to "active" if the role is "customer" and "admin"
    // const status = role === "customer"&&"admin" ? "active" : "inactive";
    

    // Create user
    const user = await users.create({
      name,
      email,
      password: hashedPassword,
      role,
      phoneNumber,
      
    });

    try {
      const savedUser = await user.save();

      // If the role is 'merchant', create the merchant record
      if (role === "merchant") {
        const newMerchant = new merchant({
          userId: savedUser._id,
          storeName,
          location,
          tradeLicense:req.file ? `/uploads/License/${req.file.filename}` : null,
        });

        await newMerchant.save();
      }

      //If the role is 'customer', create the customer record
      if (role === "customer") {
        const newCustomer = new customer({
          userId: savedUser._id,
          phoneNumber,
        });
        await newCustomer.save();
      };

      // If the role is 'dsp', create the dsp record
      if (role === "dsp") {
        const newDsp = new dsp({
          userId: savedUser._id,
          vehicleDetails,
          drivingLicense :req.file ? `/uploads/License/${req.file.filename}` : null,
  
        });
        await newDsp.save();
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
    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    // Send response
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      status: user.status,
      token,
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

module.exports = {
  addUser,
  // getAllUsers,
  // getUserById,
  // updateUser,
  // DeleteUser,
  loginUser,
};
