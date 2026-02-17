const express = require('express');
const dayjs = require('dayjs');
const { authRequired, ensureAdmin } = require('../middleware/auth');
const { Refund } = require('../models/Refund');

const router = express.Router();

router.post('/', authRequired, async (req, res) => {
  const { orderId, reason, notes } = req.body;
  const r = await Refund.create({
    orderId,
    customerId: req.userId,
    reason,
    notes,
    history: [{ time: dayjs().toISOString(), note: 'Request created' }]
  });
  res.json(r);
});

router.get('/', authRequired, ensureAdmin, async (req, res) => {
  const list = await Refund.find().sort({ createdAt: -1 });
  res.json(list);
});

router.put('/:id/status', authRequired, ensureAdmin, async (req, res) => {
  const { status, note } = req.body;
  const r = await Refund.findByIdAndUpdate(req.params.id, { status }, { new: true });
  r.history.push({ time: dayjs().toISOString(), note: note || `Status updated to ${status}` });
  await r.save();
  res.json(r);
});

module.exports = router;
