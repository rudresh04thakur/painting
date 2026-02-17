const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer','artist','admin'], default: 'customer' },
  image: String,
  country: String,
  bio: String,
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Painting' }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
module.exports = { User };
