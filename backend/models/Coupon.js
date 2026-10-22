const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      match: /^[A-Z0-9]{3,20}$/,
    },
    percent: { type: Number, required: true, min: 1, max: 90 }, // % off the subtotal
    description: { type: String, trim: true },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null }, // null = never expires
  },
  { timestamps: true, toJSON: { versionKey: false } },
);

// True when the coupon can be applied right now
couponSchema.methods.isUsable = function () {
  return this.active && (!this.expiresAt || this.expiresAt > new Date());
};

module.exports = mongoose.model('Coupon', couponSchema);
