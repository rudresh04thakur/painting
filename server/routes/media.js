const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { authRequired, ensureAdmin } = require('../middleware/auth');
const { Media } = require('../models/Media');
const { uploadImage } = require('../util/cloudinary');
const { escapeRegex } = require('../util/regex');

const router = express.Router();

const isDev = process.env.NODE_ENV !== 'production';

function ensureStaff(req, res, next) {
  if (['admin', 'artist'].includes(req.userRole)) return next();
  res.status(403).json({ error: 'Forbidden' });
}

// Configure Multer
const upload = multer({
  dest: isDev ? path.join(__dirname, '../uploads') : os.tmpdir(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Get all media (optional folder filter)
router.get('/', authRequired, ensureStaff, async (req, res) => {
  try {
    const { folder, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (folder) query.folder = folder;

    if (search) {
      query.name = new RegExp(escapeRegex(search), 'i');
    }

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

    const total = await Media.countDocuments(query);
    const media = await Media.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      items: media,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get all folders
router.get('/folders', authRequired, ensureStaff, async (req, res) => {
  try {
    const folders = await Media.distinct('folder');
    res.json(folders.filter(f => f)); // Remove null/empty
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Upload media
router.post('/', authRequired, ensureStaff, upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files || [];
    const { folder } = req.body;
    const results = [];

    for (const f of files) {
      // uploadImage handles Cloudinary vs Local logic
      const url = await uploadImage(f.path);

      const media = await Media.create({
        url,
        name: f.originalname,
        type: f.mimetype,
        folder: folder || 'General'
      });
      results.push(media);
    }

    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete media
router.delete('/:id', authRequired, ensureStaff, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ error: 'Media not found' });

    // If local file, try to delete it
    if (media.url.startsWith('/uploads/')) {
      const filename = media.url.split('/uploads/')[1];
      const filePath = path.join(__dirname, '../uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Remove from DB
    await Media.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
