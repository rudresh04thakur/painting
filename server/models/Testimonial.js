const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: 'Customer' },
  content: { type: String, required: true },
  image: { type: String },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const Testimonial = mongoose.models.Testimonial || mongoose.model('Testimonial', TestimonialSchema);
module.exports = { Testimonial };
