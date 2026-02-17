const express = require('express');
const { Config } = require('../models/Config');
const { sendContactMessage } = require('../util/mailer');
const router = express.Router();

router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'All fields required' });
    await sendContactMessage({ name, email, message });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:key', async (req, res) => {
  try {
    const config = await Config.findOne({ key: `page_${req.params.key}` });
    res.json({ content: config?.value?.content || '' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
