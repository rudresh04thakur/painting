const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { authRequired, ensureAdmin } = require('../middleware/auth');

// Get all categories (Public or Admin)
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;
    const query = {};
    if (active === 'true') query.active = true;
    
    const categories = await Category.find(query).sort({ name: 1 });
    res.json(categories);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create Category (Admin)
router.post('/', authRequired, ensureAdmin, async (req, res) => {
  try {
    const { name, subCategories, description, image, active, featured } = req.body;
    
    // Check if exists
    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ error: 'Category already exists' });

    const category = await Category.create({
      name,
      subCategories: subCategories || [],
      description,
      image,
      active: active !== undefined ? active : true,
      featured: featured || false
    });

    res.json(category);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update Category (Admin)
router.put('/:id', authRequired, ensureAdmin, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(category);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete Category (Admin)
router.delete('/:id', authRequired, ensureAdmin, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
