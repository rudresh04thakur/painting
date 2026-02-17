const mongoose = require('mongoose');

const AuctionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  paintingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Painting', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['upcoming', 'live', 'ended', 'closed'], default: 'upcoming' },
  startingBid: { type: Number, required: true },
  currentBid: { type: Number, default: 0 },
  minIncrement: { type: Number, default: 50 },
  bids: [{
    bidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    time: { type: Date, default: Date.now }
  }],
  watchers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  featured: { type: Boolean, default: false }
}, { timestamps: true });

const Auction = mongoose.models.Auction || mongoose.model('Auction', AuctionSchema);
module.exports = { Auction };
