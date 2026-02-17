const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  name: { type: String }, // Original filename
  type: { type: String }, // Mime type
  folder: { type: String, default: 'General' }, // Folder categorization
  createdAt: { type: Date, default: Date.now }
});

module.exports = { Media: mongoose.model('Media', mediaSchema) };
