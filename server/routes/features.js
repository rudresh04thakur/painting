const express = require('express');
const { Feature } = require('../models/Feature');
const { authRequired, ensureAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/features - Public
router.get('/', async (req, res) => {
  try {
    const features = await Feature.find({ active: true }).sort({ order: 1 });
    res.json(features);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/features - Admin
router.post('/', authRequired, ensureAdmin, async (req, res) => {
  try {
    const feature = new Feature(req.body);
    await feature.save();
    res.status(201).json(feature);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/features/:id - Admin
router.put('/:id', authRequired, ensureAdmin, async (req, res) => {
  try {
    const feature = await Feature.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(feature);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/features/:id - Admin
router.delete('/:id', authRequired, ensureAdmin, async (req, res) => {
  try {
    await Feature.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feature deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
