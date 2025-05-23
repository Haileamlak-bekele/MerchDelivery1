const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentAccount',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reference: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referenceModel',
  },
  referenceModel: {
    type: String,
    enum: ['Order'],
  },
}, { timestamps: true });

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema); 