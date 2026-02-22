const express = require('express');
const next = require('next');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const { initCloudinary } = require('./util/cloudinary');
const { ensureAdmin } = require('./middleware/auth');

async function start() {
  await app.prepare();
  initCloudinary();

  const server = express();
  
  // Security & Performance Middleware
  server.use(helmet({
    contentSecurityPolicy: false, // Disabled for dev/Next.js compatibility
    crossOriginEmbedderPolicy: false
  }));
  server.use(compression());
  
  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: dev ? 10000 : 100, // limit each IP to 100 requests per windowMs (10000 in dev)
    standardHeaders: true,
    legacyHeaders: false,
  });
  server.use('/api', limiter);

  server.use(express.json());
  server.use(cookieParser());
  server.use(cors({
    origin: process.env.NEXT_PUBLIC_APP_URL || '*',
    credentials: true
  }));
  server.use(morgan('dev'));
  server.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/painting_gallery';
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 }).then(() => {
    console.log('MongoDB connected successfully.');
  }).catch(err => {
    console.error('MongoDB connection error:', err.message);
  });

  server.use('/api/auth', require('./routes/auth'));
  server.use('/api/paintings', require('./routes/paintings'));
  server.use('/api/orders', require('./routes/orders'));
  server.use('/api/payments', require('./routes/payments'));
  server.use('/api/refunds', require('./routes/refunds'));
  server.use('/api/artists', require('./routes/artists'));
  server.use('/api/artists-public', require('./routes/public_artists'));
  server.use('/api/faqs', require('./routes/faqs'));
  server.use('/api/admin', require('./routes/admin'));
  server.use('/api/media', require('./routes/media'));
  server.use('/api/testimonials', require('./routes/testimonials'));
  server.use('/api/pages', require('./routes/pages'));
  server.use('/api/user', require('./routes/user'));
  server.use('/api/auctions', require('./routes/auctions'));
  server.use('/api/articles', require('./routes/articles'));
  server.use('/api/features', require('./routes/features'));
  server.use('/api/config', require('./routes/config'));
  server.use('/api/categories', require('./routes/categories'));

  server.get('/api/health', (req, res) => res.json({ ok: true }));
  
  // Global Error Handler
  server.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: dev ? err.message : undefined 
    });
  });

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
}

start();
