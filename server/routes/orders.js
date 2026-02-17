const express = require('express');
const dayjs = require('dayjs');
const { authRequired, ensureAdmin } = require('../middleware/auth');
const { Order } = require('../models/Order');
const { Painting } = require('../models/Painting');
const { User } = require('../models/User');
const { Config } = require('../models/Config');
const { sendOrderConfirmation } = require('../util/mailer');

const router = express.Router();

router.put('/:id/tracking', authRequired, ensureAdmin, async (req, res) => {
  try {
    const { courier, awb, url, status, estimatedDeliveryDate } = req.body;
    const update = {};
    if (courier || awb || url) {
      update.tracking = { courier, awb, url };
    }
    if (status) {
      update.status = status;
    }
    if (estimatedDeliveryDate) {
      update.estimatedDeliveryDate = estimatedDeliveryDate;
    }
    
    // Add timeline entry
    let note = '';
    if (status) note = `Status updated to ${status}`;
    else if (estimatedDeliveryDate) note = `Delivery date updated to ${dayjs(estimatedDeliveryDate).format('YYYY-MM-DD')}`;
    else note = 'Tracking details updated';
    
    update.$push = { timeline: { time: dayjs().toISOString(), note } };
    
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const logger = require('../util/logger');

router.post('/', authRequired, async (req, res) => {
  const { items, address, paymentMethod, upiId } = req.body;
  if (!items?.length) return res.status(400).json({ error: 'Cart empty' });
  
  // Basic Input Validation
  if (!address || !address.line1 || !address.city || !address.country || !address.postalCode) {
    return res.status(400).json({ error: 'Incomplete address details' });
  }

  const itemDocs = [];
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const i of items) {
      // Find and lock document, ensure stock > 0
      const p = await Painting.findOne({ 
        _id: i.paintingId, 
        stock: { $gt: 0 },
        status: 'available'
      }).session(session);

      if (!p) {
        throw new Error(`Item ${i.paintingId} unavailable or out of stock`);
      }
      
      itemDocs.push({ paintingId: p._id, priceUSD: p.price?.USD ?? i.price });
      
      // Decrement stock
      p.stock -= 1;
      if (p.stock === 0) {
        p.status = 'sold';
      }
      await p.save({ session });
    }

    const totalUSD = itemDocs.reduce((s, i) => s + i.priceUSD, 0);
    
    const order = await Order.create([{
      customerId: req.userId,
      items: itemDocs,
      address,
      paymentMethod,
      upiId,
      status: 'Pending Payment',
      timeline: [{ time: dayjs().toISOString(), note: 'Order created' }],
      totalUSD
    }], { session });

    await session.commitTransaction();
    session.endSession();

    // Async tasks after transaction commit
    try {
      const customer = await User.findById(req.userId);
      if (customer?.email) await sendOrderConfirmation(customer.email, order[0]);
    } catch (e) {
      logger.error(`Failed to send email for order ${order[0]._id}: ${e.message}`);
    }

    logger.info(`Order created: ${order[0]._id} by User ${req.userId}`);
    res.json({ ok: true, orderId: order[0]._id });

  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    logger.error(`Order creation failed: ${e.message}`);
    // If "Transaction numbers are only allowed on a replica set" error occurs in local dev without replica set
    // Fallback to non-transactional logic (simple check and update)
    if (e.message.includes('replica set')) {
       return handleNonTransactionalOrder(req, res);
    }
    return res.status(400).json({ error: e.message });
  }
});

// Fallback for standalone MongoDB (dev environment)
async function handleNonTransactionalOrder(req, res) {
  const { items, address, paymentMethod, upiId } = req.body;
  const itemDocs = [];
  const reservedPaintings = [];

  try {
    for (const i of items) {
      const p = await Painting.findById(i.paintingId);
      if (!p || p.stock < 1 || p.status !== 'available') {
        throw new Error(`Item ${i.paintingId} unavailable`);
      }
      itemDocs.push({ paintingId: p._id, priceUSD: p.price?.USD ?? i.price });
      
      // Optimistic update
      const updated = await Painting.findOneAndUpdate(
        { _id: p._id, stock: { $gt: 0 } },
        { $inc: { stock: -1 } },
        { new: true }
      );
      if (!updated) throw new Error(`Item ${i.paintingId} stock mismatch`);
      reservedPaintings.push(updated);
      
      // Update status if sold out
      if (updated.stock === 0) {
        await Painting.findByIdAndUpdate(updated._id, { status: 'sold' });
      }
    }

    const totalUSD = itemDocs.reduce((s, i) => s + i.priceUSD, 0);
    const order = await Order.create({
      customerId: req.userId,
      items: itemDocs,
      address,
      paymentMethod,
      upiId,
      status: 'Pending Payment',
      timeline: [{ time: dayjs().toISOString(), note: 'Order created' }],
      totalUSD
    });
    
    res.json({ ok: true, orderId: order._id });

  } catch (e) {
    // Rollback reserved stock
    for (const p of reservedPaintings) {
      await Painting.findByIdAndUpdate(p._id, { $inc: { stock: 1 }, status: 'available' });
    }
    logger.error(`Order creation fallback failed: ${e.message}`);
    res.status(400).json({ error: e.message });
  }
}


router.get('/invoice-settings', authRequired, async (req, res) => {
  const config = await Config.findOne({ key: 'invoice_settings' });
  res.json(config?.value || {
    companyName: 'Seasons by Ritu',
    addressLine1: '123 Art Gallery Avenue, Creative District',
    cityStateZip: 'New Delhi, India 110001',
    gstin: '07AAAAA0000A1Z5',
    email: 'support@seasonsbyritu.com',
    website: 'www.seasonsbyritu.com'
  });
});

router.get('/:id', authRequired, async (req, res) => {
  const o = await Order.findById(req.params.id).populate('items.paintingId');
  if (!o) return res.status(404).json({ error: 'Not found' });
  if (String(o.customerId) !== String(req.userId) && req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json(o);
});

router.get('/', authRequired, async (req, res) => {
  const list = await Order.find({ customerId: req.userId }).sort({ createdAt: -1 });
  res.json(list);
});

router.get('/:id/invoice', authRequired, async (req, res) => {
  const o = await Order.findById(req.params.id);
  if (!o) return res.status(404).json({ error: 'Not found' });
  if (String(o.customerId) !== String(req.userId) && req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const lines = [];
  lines.push(`Invoice for Order ${o._id}`);
  lines.push(`Date: ${dayjs(o.createdAt).format('YYYY-MM-DD')}`);
  lines.push(`Status: ${o.status}`);
  lines.push(`Payment: ${o.paymentMethod}`);
  lines.push(`Total (USD): ${o.totalUSD}`);
  lines.push('Items:');
  for (const i of o.items) {
    lines.push(` - Painting ${i.paintingId} : $${i.priceUSD}`);
  }
  const text = lines.join('\n');
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', `attachment; filename="invoice-${o._id}.txt"`);
  res.send(text);
});

module.exports = router;
