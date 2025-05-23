const mongoose = require("mongoose");

const paymentAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accountType: {
      type: String,
      enum: ["merchant", "dsp"],
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentAccount", paymentAccountSchema); 