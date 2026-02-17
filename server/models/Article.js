const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  content: { type: String, required: true }, // HTML content
  excerpt: { type: String },
  image: { type: String },
  author: { type: String, default: 'Admin' }, // Could be a User ref if needed
  publishDate: { type: Date, default: Date.now },
  tags: [String],
  active: { type: Boolean, default: true },
  comments: [{
    user: String,
    content: String,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const Article = mongoose.models.Article || mongoose.model('Article', ArticleSchema);
module.exports = { Article };
