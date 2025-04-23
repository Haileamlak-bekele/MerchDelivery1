const mongoose = require("mongoose");

const DeliveryPriceSettingsSchema = new mongoose.Schema({
  basePrice: {
    type: Number,
    required: true,
    default: 0,
  },
  perKmRate: {
    type: Number,
    required: true,
    default: 0,
  },
  perKgRate: {
    type: Number,
    required: true,
    default: 0,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("DeliveryPriceSettings", DeliveryPriceSettingsSchema);
