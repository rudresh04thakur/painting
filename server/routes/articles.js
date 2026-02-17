const express = require('express');
const { Article } = require('../models/Article');
const { authRequired, ensureAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/articles - Public
router.get('/', async (req, res) => {
  try {
    const { limit } = req.query;
    let query = Article.find({ active: true }).sort({ publishDate: -1 });
    if (limit) query = query.limit(parseInt(limit));
    const articles = await query.exec();
    res.json(articles);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/articles/:id - Public
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/articles - Admin
router.post('/', authRequired, ensureAdmin, async (req, res) => {
  try {
    const article = new Article(req.body);
    await article.save();
    res.status(201).json(article);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/articles/:id - Admin
router.put('/:id', authRequired, ensureAdmin, async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(article);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/articles/:id - Admin
router.delete('/:id', authRequired, ensureAdmin, async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ message: 'Article deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
