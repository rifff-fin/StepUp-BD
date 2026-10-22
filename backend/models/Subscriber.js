const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    },
    source: { type: String, default: 'newsletter-section' },
  },
  { timestamps: true, toJSON: { versionKey: false } },
);

module.exports = mongoose.model('Subscriber', subscriberSchema);
