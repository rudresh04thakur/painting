const express = require('express');
const { Faq } = require('../models/Faq');
const { authRequired, ensureAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/faqs - Public
router.get('/', async (req, res) => {
  try {
    const faqs = await Faq.find({ active: true }).sort({ order: 1 });
    res.json(faqs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/faqs - Admin
router.post('/', authRequired, ensureAdmin, async (req, res) => {
  try {
    const faq = new Faq(req.body);
    await faq.save();
    res.status(201).json(faq);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/faqs/:id - Admin
router.put('/:id', authRequired, ensureAdmin, async (req, res) => {
  try {
    const faq = await Faq.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(faq);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/faqs/:id - Admin
router.delete('/:id', authRequired, ensureAdmin, async (req, res) => {
  try {
    await Faq.findByIdAndDelete(req.params.id);
    res.json({ message: 'Faq deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
