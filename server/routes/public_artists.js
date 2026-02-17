const express = require('express');
const { User } = require('../models/User');

const router = express.Router();

// GET /api/artists-public - Public
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const artists = await User.find({ role: 'artist' })
      .select('name country bio image email createdAt') // Exclude passwordHash
      .limit(limit);
      
    // Ideally we should also fetch their profile image if stored in User or ArtistProfile
    // For now assuming User model might be extended or we use a placeholder/profile logic
    // But wait, the component uses `artist-img1.png`. 
    // I should check if User model has an image field. It doesn't.
    // I should add 'image' to User model or use a gravatar/placeholder.
    // The user asked to "replace all placeholder with all real images... upload it in media gallery then use it".
    // So I should add `image` field to User model.
    
    res.json(artists);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
