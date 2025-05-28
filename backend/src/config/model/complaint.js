const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    OrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    CustomerId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dspId: {
      type: String,
      ref: "User",
    },
    // Other fields related to the complaint
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "resolved", "rejected"],
      default: "pending",
    },
    // Add any other fields as needed
  },
  {
    timestamps: true,
  }
);

const Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = Complaint;
