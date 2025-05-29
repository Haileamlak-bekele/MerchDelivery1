const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
  bankAccounts: [
    {
      bankName: String,
      bankAccountNumber: String
    }
  ],
  registrationPriceMerchant: {
    type: Number,
    required: true,
    default: 0,
  },
  registrationPriceDSP: {
    type: Number,
    required: true,
    default: 0,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema); 