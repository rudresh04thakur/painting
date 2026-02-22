const express = require('express');
const multer = require('multer');
const path = require('path');
const os = require('os');
const { Painting } = require('../models/Painting');
const { authRequired, ensureRole } = require('../middleware/auth');
const { uploadImage } = require('../util/cloudinary');
const { escapeRegex } = require('../util/regex');

const router = express.Router();

const isDev = process.env.NODE_ENV !== 'production';
const upload = multer({
  dest: isDev ? path.join(__dirname, '../uploads') : os.tmpdir(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.get('/filters', async (req, res) => {
  try {
    const artists = await Painting.distinct('artistName');
    const styles = await Painting.distinct('style');
    const categories = await Painting.distinct('category');
    const subcategories = await Painting.distinct('subcategory');
    // Get absolute min and max prices
    const maxP = await Painting.findOne().sort({ 'price.USD': -1 }).select('price.USD');
    const minP = await Painting.findOne().sort({ 'price.USD': 1 }).select('price.USD');

    res.json({
      artists: artists.filter(Boolean).sort(),
      styles: styles.filter(Boolean).sort(),
      categories: categories.filter(Boolean).sort(),
      subcategories: subcategories.filter(Boolean).sort(),
      minPrice: minP?.price?.USD || 0,
      maxPrice: maxP?.price?.USD || 10000
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/stats/artists', async (req, res) => {
  try {
    const artists = await Painting.aggregate([
      { $match: { artistName: { $exists: true, $ne: "" } } },
      {
        $group: {
          _id: "$artistName",
          count: { $sum: 1 },
          image: { $first: { $arrayElemAt: ["$images", 0] } },
          styles: { $addToSet: "$style" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(artists);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/', async (req, res) => {
  const { featured, artist, style, category, subcategory, min, max, minRating, sort, customizable, onSale, search } = req.query;
  const filter = {};

  if (search) {
    const searchRegex = new RegExp(escapeRegex(search), 'i');
    filter.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { artistName: searchRegex },
      { style: searchRegex },
      { category: searchRegex },
      { subcategory: searchRegex }
    ];
  }

  if (featured === 'true') filter.featured = true;

  if (artist) {
    const list = artist.split(',').filter(Boolean);
    if (list.length > 0) {
      filter.artistName = { $in: list.map(a => new RegExp(`^${a}$`, 'i')) };
    }
  }

  if (style) {
    const list = style.split(',').filter(Boolean);
    if (list.length > 0) {
      filter.style = { $in: list.map(s => new RegExp(`^${s}$`, 'i')) };
    }
  }

  if (category) {
    const list = category.split(',').filter(Boolean);
    if (list.length > 0) {
      filter.category = { $in: list.map(s => new RegExp(`^${s}$`, 'i')) };
    }
  }

  if (subcategory) {
    const list = subcategory.split(',').filter(Boolean);
    if (list.length > 0) {
      filter.subcategory = { $in: list.map(s => new RegExp(`^${s}$`, 'i')) };
    }
  }

  if (min || max) {
    filter['price.USD'] = {};
    if (min) filter['price.USD'].$gte = Number(min);
    if (max) filter['price.USD'].$lte = Number(max);
  }

  if (minRating) filter['averageRating'] = { $gte: Number(minRating) };

  if (customizable === 'true') filter.isCustomizable = true;

  if (onSale === 'true') {
    // Mongo query for where original > USD
    filter.$expr = { $gt: ["$price.original", "$price.USD"] };
  }

  let sortOption = { createdAt: -1 }; // Default: Newest
  if (sort === 'oldest') sortOption = { createdAt: 1 };
  if (sort === 'price_asc') sortOption = { 'price.USD': 1 };
  if (sort === 'price_desc') sortOption = { 'price.USD': -1 };
  if (sort === 'popular') sortOption = { popularityScore: -1 };

  // Pagination
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.max(1, Number(req.query.limit || 60));
  const skip = (page - 1) * limit;

  try {
    const total = await Painting.countDocuments(filter);
    const items = await Painting.find(filter).sort(sortOption).skip(skip).limit(limit);

    res.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/:id', async (req, res) => {
  const item = await Painting.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.post('/', authRequired, ensureRole('admin'), async (req, res) => {
  const p = await Painting.create(req.body);
  res.json(p);
});

router.post('/:id/images', authRequired, upload.array('images', 6), async (req, res) => {
  const files = req.files || [];
  const urls = [];
  for (const f of files) {
    urls.push(await uploadImage(f.path));
  }
  const p = await Painting.findByIdAndUpdate(req.params.id, { $push: { images: { $each: urls } } }, { new: true });
  res.json(p);
});

router.post('/:id/rate', authRequired, async (req, res) => {
  const { rating } = req.body;
  const value = Math.max(1, Math.min(5, Number(rating || 0)));
  const p = await Painting.findById(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const total = p.averageRating * p.ratingsCount + value;
  const count = p.ratingsCount + 1;
  p.averageRating = Number((total / count).toFixed(2));
  p.ratingsCount = count;
  await p.save();
  res.json({ averageRating: p.averageRating, ratingsCount: p.ratingsCount });
});

module.exports = router;
