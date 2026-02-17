const express = require('express');
const { Auction } = require('../models/Auction');
const { authRequired, ensureAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/auctions - Public: Get auctions
router.get('/', async (req, res) => {
  try {
    const { status, featured, limit } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (featured === 'true') filter.featured = true;

    let query = Auction.find(filter).populate('paintingId').sort({ startTime: 1 });
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const auctions = await query.exec();
    res.json(auctions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/auctions/:id - Public: Get single auction
router.get('/:id', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id).populate('paintingId').populate('bids.bidderId', 'name');
    if (!auction) return res.status(404).json({ error: 'Auction not found' });
    res.json(auction);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auctions - Admin: Create
router.post('/', authRequired, ensureAdmin, async (req, res) => {
  try {
    const auction = new Auction(req.body);
    await auction.save();
    res.status(201).json(auction);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/auctions/:id - Admin: Update
router.put('/:id', authRequired, ensureAdmin, async (req, res) => {
  try {
    const auction = await Auction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!auction) return res.status(404).json({ error: 'Auction not found' });
    res.json(auction);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/auctions/:id - Admin: Delete
router.delete('/:id', authRequired, ensureAdmin, async (req, res) => {
  try {
    await Auction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Auction deleted' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
