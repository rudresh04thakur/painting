const mongoose = require('mongoose');

const RefundSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: String,
  notes: String,
  status: { type: String, enum: ['Requested','Approved','Rejected','Processed'], default: 'Requested' },
  history: [{ time: String, note: String }]
}, { timestamps: true });

const Refund = mongoose.models.Refund || mongoose.model('Refund', RefundSchema);
module.exports = { Refund };
