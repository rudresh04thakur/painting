const express = require('express');
const dayjs = require('dayjs');
const bcrypt = require('bcryptjs');
const { authRequired, ensureAdmin } = require('../middleware/auth');
const { User } = require('../models/User');
const { Order } = require('../models/Order');
const { Painting } = require('../models/Painting');
const { Refund } = require('../models/Refund');
const { Config } = require('../models/Config');
const { createObjectCsvStringifier } = require('csv-writer');
const { escapeRegex } = require('../util/regex');

const router = express.Router();

router.use(authRequired, ensureAdmin);

// SEO Routes
router.get('/seo', async (req, res) => {
  const config = await Config.findOne({ key: 'seo' });
  res.json(config?.value || { title: '', description: '', keywords: '' });
});

router.post('/seo', async (req, res) => {
  const { title, description, keywords } = req.body;
  const config = await Config.findOneAndUpdate(
    { key: 'seo' },
    { value: { title, description, keywords } },
    { upsert: true, new: true }
  );
  res.json(config.value);
});

// Page Content Management
router.get('/pages/:key', async (req, res) => {
  const config = await Config.findOne({ key: `page_${req.params.key}` });
  res.json({ content: config?.value?.content || '' });
});

router.put('/pages/:key', async (req, res) => {
  const { content } = req.body;
  const config = await Config.findOneAndUpdate(
    { key: `page_${req.params.key}` },
    { value: { content } },
    { upsert: true, new: true }
  );
  res.json({ content: config.value.content });
});

// Payment Settings
router.get('/payment-settings', async (req, res) => {
  const config = await Config.findOne({ key: 'payment_settings' });
  res.json(config?.value || {
    online: {
      upi: { enabled: true, upiId: '', qrCodeUrl: '' },
      stripe: { enabled: false, publishableKey: '', secretKey: '' }
    },
    offline: {
      enabled: true,
      bankDetails: { accountName: '', accountNumber: '', ifsc: '', bankName: '' }
    }
  });
});

router.put('/payment-settings', async (req, res) => {
  const settings = req.body;
  const config = await Config.findOneAndUpdate(
    { key: 'payment_settings' },
    { value: settings },
    { upsert: true, new: true }
  );
  res.json(config.value);
});

// Invoice Settings
router.get('/invoice-settings', async (req, res) => {
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

router.put('/invoice-settings', async (req, res) => {
  const settings = req.body;
  const config = await Config.findOneAndUpdate(
    { key: 'invoice_settings' },
    { value: settings },
    { upsert: true, new: true }
  );
  res.json(config.value);
});

// User Orders
router.get('/users/:id/orders', async (req, res) => {
  const orders = await Order.find({ customerId: req.params.id }).sort({ createdAt: -1 });
  res.json(orders);
});

// Reports
router.get('/reports/sales', async (req, res) => {
  const { start, end } = req.query;
  const filter = {};
  if (start || end) {
    filter.createdAt = {};
    if (start) filter.createdAt.$gte = new Date(start);
    if (end) filter.createdAt.$lte = new Date(end);
  }
  const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
  res.json(orders);
});

router.get('/users/artists', async (req, res) => {
  const artists = await User.find({ role: 'artist' }).select('name email');
  res.json(artists);
});

router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = {};
    
    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { role: searchRegex }
      ];
    }

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const total = await User.countDocuments(filter);
    
    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      items: users,
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

router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role: role || 'customer' });
    res.json({ ok: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { name, role, password, image, country, bio } = req.body;
    const update = { name, role, image, country, bio };
    if (password) {
      update.passwordHash = await bcrypt.hash(password, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-passwordHash');
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 50, search, status } = req.query;
    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const filter = {};

    if (status && status !== 'All') filter.status = status;

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), 'i');
      
      // Find users matching search to include their orders
      const users = await User.find({ 
        $or: [{ name: searchRegex }, { email: searchRegex }] 
      }).select('_id');
      const userIds = users.map(u => u._id);

      const orConditions = [
        { customerId: { $in: userIds } },
        { status: searchRegex },
        { paymentMethod: searchRegex },
        { 'address.city': searchRegex },
        { 'address.country': searchRegex },
        { 'tracking.awb': searchRegex }
      ];

      // If search looks like an ObjectId, add it
      if (/^[0-9a-fA-F]{24}$/.test(search)) {
        orConditions.push({ _id: search });
      }

      filter.$or = orConditions;
    }

    const total = await Order.countDocuments(filter);
    const list = await Order.find(filter)
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      items: list,
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

router.put('/orders/:id/status', async (req, res) => {
  const { status, tracking } = req.body;
  const o = await Order.findById(req.params.id);
  if (!o) return res.status(404).json({ error: 'Not found' });
  
  o.status = status;
  o.timeline.push({ time: dayjs().toISOString(), note: `Status updated: ${status}` });
  
  if (tracking) {
    o.tracking = tracking;
    o.timeline.push({ time: dayjs().toISOString(), note: 'Tracking details added' });
  }
  
  await o.save();
  res.json(o);
});

router.put('/orders/:id/tracking', async (req, res) => {
  const { courier, awb, url } = req.body;
  const o = await Order.findById(req.params.id);
  if (!o) return res.status(404).json({ error: 'Not found' });
  o.tracking = { courier, awb, url };
  o.timeline.push({ time: dayjs().toISOString(), note: 'Tracking updated' });
  await o.save();
  res.json(o);
});

router.put('/paintings/:id/featured', async (req, res) => {
  const { featured } = req.body;
  const p = await Painting.findByIdAndUpdate(req.params.id, { featured: !!featured }, { new: true });
  res.json(p);
});

router.post('/paintings', async (req, res) => {
  const p = await Painting.create(req.body);
  res.json(p);
});

router.put('/paintings/:id', async (req, res) => {
  const p = await Painting.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(p);
});

router.delete('/paintings/:id', async (req, res) => {
  await Painting.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.get('/export/orders', async (req, res) => {
  const rows = await Order.find().lean();
  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: '_id', title: 'OrderID' },
      { id: 'status', title: 'Status' },
      { id: 'totalUSD', title: 'TotalUSD' },
      { id: 'paymentMethod', title: 'PaymentMethod' },
      { id: 'createdAt', title: 'CreatedAt' }
    ]
  });
  const header = csvStringifier.getHeaderString();
  const content = csvStringifier.stringifyRecords(rows.map(r => ({
    _id: r._id,
    status: r.status,
    totalUSD: r.totalUSD,
    paymentMethod: r.paymentMethod,
    createdAt: dayjs(r.createdAt).toISOString()
  })));
  const csv = header + content;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
  res.send(csv);
});

router.get('/analytics/summary', async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const delivered = await Order.countDocuments({ status: 'Delivered' });
  const pending = await Order.countDocuments({ status: { $in: ['Pending Payment', 'Processing'] } });
  const cancelled = await Order.countDocuments({ status: 'Cancelled' });
  const orders = await Order.find({}, { totalUSD: 1 }).lean();
  const totalSalesUSD = orders.reduce((s, o) => s + Number(o.totalUSD || 0), 0);
  const refundRequests = await Refund.countDocuments({ status: 'Requested' });
  
  // Recent 5 orders for dashboard
  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).lean();
  
  res.json({ totalOrders, delivered, pending, cancelled, totalSalesUSD, refundRequests, recentOrders });
});

router.get('/analytics/charts', async (req, res) => {
  // Daily Sales (Last 30 Days)
  const thirtyDaysAgo = dayjs().subtract(30, 'day').toDate();
  
  const dailySales = await Order.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $ne: 'Cancelled' } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        sales: { $sum: "$totalUSD" },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Status Distribution
  const statusDistribution = await Order.aggregate([
    {
      $group: {
        _id: "$status",
        value: { $sum: 1 }
      }
    }
  ]);

  res.json({ 
    dailySales: dailySales.map(d => ({ date: d._id, sales: d.sales, orders: d.orders })),
    statusDistribution: statusDistribution.map(d => ({ name: d._id, value: d.value }))
  });
});

// Invoice Settings
router.get('/invoice-settings', async (req, res) => {
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

router.put('/invoice-settings', async (req, res) => {
  const settings = req.body;
  const config = await Config.findOneAndUpdate(
    { key: 'invoice_settings' },
    { value: settings },
    { upsert: true, new: true }
  );
  res.json(config.value);
});

// Refunds
router.get('/refunds', async (req, res) => {
  const refunds = await Refund.find()
    .populate('orderId', 'totalUSD items')
    .populate('customerId', 'name email')
    .sort({ createdAt: -1 });
  res.json(refunds);
});

router.put('/refunds/:id', async (req, res) => {
  const { status, note } = req.body;
  const refund = await Refund.findById(req.params.id);
  if (!refund) return res.status(404).send('Refund not found');

  refund.status = status;
  if (note) refund.history.push({ time: new Date().toISOString(), note });
  
  // If approved, update order status too
  if (status === 'Approved' || status === 'Processed') {
    const Order = require('../models/Order').Order;
    await Order.findByIdAndUpdate(refund.orderId, { status: 'Refunded' });
  }

  await refund.save();
  res.json(refund);
});

module.exports = router;
