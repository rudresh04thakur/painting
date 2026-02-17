const mongoose = require('mongoose');

const ConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed
}, { timestamps: true });

const Config = mongoose.models.Config || mongoose.model('Config', ConfigSchema);
module.exports = { Config };
