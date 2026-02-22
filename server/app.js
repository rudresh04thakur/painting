const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { initCloudinary } = require('./util/cloudinary');

const app = express();

const dev = process.env.NODE_ENV !== 'production';

// Security & Performance Middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(compression());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: dev ? 10000 : 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.NEXT_PUBLIC_APP_URL || '*',
    credentials: true
}));
if (dev) app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Note: DB connection is handled outside for better control in serverless
// But we can keep it here for standard Express behavior
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        console.error('MONGODB_URI is not defined');
        return;
    }
    return mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
};

// Middleware to ensure DB connection for every API request
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        next(err);
    }
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/paintings', require('./routes/paintings'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/refunds', require('./routes/refunds'));
app.use('/api/artists', require('./routes/artists'));
app.use('/api/artists-public', require('./routes/public_artists'));
app.use('/api/faqs', require('./routes/faqs'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/media', require('./routes/media'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/pages', require('./routes/pages'));
app.use('/api/user', require('./routes/user'));
app.use('/api/auctions', require('./routes/auctions'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/features', require('./routes/features'));
app.use('/api/config', require('./routes/config'));
app.use('/api/categories', require('./routes/categories'));

app.get('/api/health', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV }));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: dev ? err.message : 'Something went wrong on the server'
    });
});

module.exports = app;
