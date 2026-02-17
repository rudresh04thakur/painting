const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  subCategories: [{ type: String }],
  active: { type: Boolean, default: true },
  image: String, // Optional cover image
  featured: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.models.Category || mongoose.model('Category', CategorySchema);
