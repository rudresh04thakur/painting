const express = require('express');
const { Config } = require('../models/Config');
const router = express.Router();

// GET /api/config/:key - Public: Get config by key
router.get('/:key', async (req, res) => {
  try {
    const config = await Config.findOne({ key: req.params.key });
    if (!config) return res.status(404).json({ error: 'Config not found' });
    res.json(config.value);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
