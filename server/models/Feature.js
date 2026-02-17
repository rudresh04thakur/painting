const mongoose = require('mongoose');

const FeatureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String }, // SVG content or icon class or image URL
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const Feature = mongoose.models.Feature || mongoose.model('Feature', FeatureSchema);
module.exports = { Feature };
