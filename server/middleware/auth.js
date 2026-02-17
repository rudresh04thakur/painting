const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

function authRequired(req, res, next) {
  let payload = null;
  const secret = process.env.JWT_SECRET || 'devsecret';
  
  // 1. Check Authorization Header
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    const token = header.slice(7);
    try {
      payload = jwt.verify(token, secret);
    } catch (e) {
      // Header token invalid, fall through to check cookie
    }
  }
  
  // 2. Check Cookie (if no valid payload from header)
  if (!payload && req.cookies && req.cookies.token) {
    try {
      payload = jwt.verify(req.cookies.token, secret);
    } catch (e) {
      // Cookie token invalid
    }
  }

  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  
  req.userId = payload.id;
  req.userRole = payload.role;
  next();
}

function ensureRole(role) {
  return (req, res, next) => {
    if (!req.userRole || req.userRole !== role) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

function ensureAdmin(req, res, next) {
  if (!req.userRole || req.userRole !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
}

module.exports = { authRequired, ensureRole, ensureAdmin };
