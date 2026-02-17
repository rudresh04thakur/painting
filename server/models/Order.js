const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  paintingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Painting', required: true },
  priceUSD: { type: Number, required: true }
}, { _id: false });

const TrackingSchema = new mongoose.Schema({
  courier: String,
  awb: String,
  url: String
}, { _id: false });

const TimelineEntrySchema = new mongoose.Schema({
  time: String,
  note: String
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  address: {
    line1: String, city: String, country: String, postalCode: String
  },
  paymentMethod: { type: String, enum: ['upi','card','offline'], required: true },
  upiId: String,
  status: {
    type: String,
    enum: ['Pending Payment','Payment Verified','Processing','Shipped','In Transit','Delivered','On Hold','Cancelled','Refunded'],
    default: 'Pending Payment'
  },
  tracking: TrackingSchema,
  estimatedDeliveryDate: Date,
  timeline: [TimelineEntrySchema],
  totalUSD: Number,
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
module.exports = { Order };
