const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    // Add merchant info per item (optional, for redundancy and fast lookup)
    merchant: {
      _id: { type: Schema.Types.ObjectId, 
        ref: 'Merchant' },
      storeName: String,
      location: {
        lat: Number,
        lng: Number
      }
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  paymentDetails: {
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['COMPLETED', 'PENDING', 'FAILED'],
      default: 'COMPLETED'
    }
  },
  orderStatus: {
    type: String,
    enum: ['PENDING', 'CONFIRMED','DspAssigned','DspAccepted','DspRejected','OnShipping', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING'
  },
  dspAssigned: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);