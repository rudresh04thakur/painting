const express = require('express');
const { authRequired } = require('../middleware/auth');
const { User } = require('../models/User');
const { Painting } = require('../models/Painting');

const router = express.Router();

router.use(authRequired);

// Get my profile (including wishlist)
router.get('/me', async (req, res) => {
  const user = await User.findById(req.userId).select('-passwordHash');
  res.json(user);
});

// Toggle Wishlist
router.post('/wishlist/:id', async (req, res) => {
  try {
    const paintingId = req.params.id;
    
    // Check if painting exists
    const painting = await Painting.findById(paintingId);
    if (!painting) return res.status(404).json({ error: 'Painting not found' });

    const user = await User.findById(req.userId);
    const isWishlisted = user.wishlist.includes(paintingId);

    let updatedUser;
    let added = false;

    if (isWishlisted) {
        // Remove
        updatedUser = await User.findByIdAndUpdate(
            req.userId, 
            { $pull: { wishlist: paintingId } }, 
            { new: true }
        ).select('-passwordHash');
        await Painting.findByIdAndUpdate(paintingId, { $inc: { wishlistCount: -1 } });
    } else {
        // Add
        updatedUser = await User.findByIdAndUpdate(
            req.userId, 
            { $addToSet: { wishlist: paintingId } }, 
            { new: true }
        ).select('-passwordHash');
        added = true;
        await Painting.findByIdAndUpdate(paintingId, { $inc: { wishlistCount: 1 } });
    }
    
    res.json({ ok: true, added, wishlist: updatedUser.wishlist });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get Wishlist items details
router.get('/wishlist', async (req, res) => {
  const user = await User.findById(req.userId).populate('wishlist');
  res.json(user.wishlist);
});

module.exports = router;