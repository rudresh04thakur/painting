const express = require('express');
const { Testimonial } = require('../models/Testimonial');
const { authRequired, ensureAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/testimonials - Public: Get all active testimonials (sorted by order)
router.get('/', async (req, res) => {
  try {
    const { all } = req.query;
    const filter = all === 'true' ? {} : { active: true };
    const testimonials = await Testimonial.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(testimonials);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/testimonials - Admin: Create a new testimonial
router.post('/', authRequired, ensureAdmin, async (req, res) => {
  try {
    const testimonial = new Testimonial(req.body);
    await testimonial.save();
    res.status(201).json(testimonial);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/testimonials/:id - Admin: Update a testimonial
router.put('/:id', authRequired, ensureAdmin, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!testimonial) return res.status(404).json({ error: 'Testimonial not found' });
    res.json(testimonial);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/testimonials/:id - Admin: Delete a testimonial
router.delete('/:id', authRequired, ensureAdmin, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return res.status(404).json({ error: 'Testimonial not found' });
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
