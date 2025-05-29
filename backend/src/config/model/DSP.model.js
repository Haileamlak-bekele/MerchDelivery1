// import mongoose from "mongoose";
const mongoose = require("mongoose");

const dspSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicleDetails: {
      type: String,
      required: true,
    },
    drivingLicense: {
      type: String,
      required: true,
    },
    deliveryStatus: {
      type: String,
      enum: ["Available", "Unavailable"],
      default: "Available",
    },
    paymentProof: {
      type: String,
      default: null,
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
);

const DSP = mongoose.model("DSP", dspSchema);

module.exports = DSP;
