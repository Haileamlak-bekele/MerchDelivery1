const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  customer: { type: String, required: true },
  merchant: { type: String, required: true },
  dsp: { type: String, required: true },
  complaint: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
