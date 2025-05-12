const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User', // or 'Customer' if you have a separate Customer model
    required: true
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);
