const express = require('express');
const dayjs = require('dayjs');
const { authRequired, ensureRole } = require('../middleware/auth');
const { Painting } = require('../models/Painting');
const { Order } = require('../models/Order');

const router = express.Router();

router.use(authRequired, ensureRole('artist'));

router.get('/sales', async (req, res) => {
  try {
    const paintings = await Painting.find({ artistId: req.userId }).select('_id title');
    const pIds = paintings.map(p => p._id);
    const orders = await Order.find({ 'items.paintingId': { $in: pIds } }).populate('items.paintingId');
    
    // Transform to a ledger format: which painting sold, when, price
    const sales = [];
    orders.forEach(o => {
      o.items.forEach(item => {
        if (pIds.some(pid => pid.equals(item.paintingId._id))) {
           sales.push({
             orderId: o._id,
             date: o.createdAt,
             painting: item.paintingId.title,
             price: item.priceUSD,
             status: o.status
           });
        }
      });
    });
    
    res.json(sales);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/paintings', async (req, res) => {
  const list = await Painting.find({ artistId: req.userId }).sort({ createdAt: -1 });
  res.json(list);
});

router.post('/paintings', async (req, res) => {
  const body = req.body || {};
  const p = await Painting.create({
    title: body.title,
    artistId: req.userId,
    artistName: body.artistName || body.title ? undefined : undefined,
    style: body.style,
    medium: body.medium,
    description: body.description,
    price: { USD: Number(body.price || 0) },
    stock: 1,
    images: body.images || []
  });
  res.json(p);
});

router.put('/paintings/:id', async (req, res) => {
  const p = await Painting.findOneAndUpdate({ _id: req.params.id, artistId: req.userId }, req.body, { new: true });
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

module.exports = router;
