const mongoose = require('mongoose');

const FaqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Faq = mongoose.models.Faq || mongoose.model('Faq', FaqSchema);
module.exports = { Faq };
