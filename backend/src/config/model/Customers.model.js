// models/Customer.js

const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: { type: Number, default: 1 },
});

const customerSchema = new mongoose.Schema({
  name: String,
  email: String,
  cart: [cartItemSchema],
});

module.exports = mongoose.model('Customer', customerSchema);
