const mongoose = require('mongoose');

const PaymentSettingSchema = new mongoose.Schema({
  online: {
    upi: {
      enabled: { type: Boolean, default: false },
      upiId: { type: String, default: '' },
      qrCodeUrl: { type: String, default: '' }
    },
    stripe: {
      enabled: { type: Boolean, default: false },
      publishableKey: { type: String, default: '' },
      secretKey: { type: String, default: '' }
    }
  },
  offline: {
    enabled: { type: Boolean, default: true },
    bankDetails: {
      bankName: { type: String, default: '' },
      accountName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifsc: { type: String, default: '' }
    }
  },
  updatedAt: { type: Date, default: Date.now }
});

// Singleton pattern helper
PaymentSettingSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const PaymentSetting = mongoose.models.PaymentSetting || mongoose.model('PaymentSetting', PaymentSettingSchema);
module.exports = { PaymentSetting };
