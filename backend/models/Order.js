const mongoose = require('mongoose');
const { ALL_DISTRICTS } = require('../data/districts');

// Demo orders are removed automatically after this many days (TTL index below)
const DEMO_ORDER_TTL_DAYS = 30;

const PAYMENT_METHODS = ['bkash', 'nagad', 'rocket', 'card', 'cod'];
const ORDER_STATUSES = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    size: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1, max: 10 },
    unitPrice: { type: Number, required: true, min: 0 }, // price from the catalog at order time
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true }, // e.g. SUBD-48291
    items: {
      type: [orderItemSchema],
      validate: { validator: (items) => items.length > 0, message: 'Order has no items' },
    },
    shipping: {
      name: { type: String, required: true, trim: true, maxlength: 80 },
      phone: { type: String, required: true, match: /^01[3-9]\d{8}$/ },
      address: { type: String, required: true, trim: true, maxlength: 240 },
      district: { type: String, required: true, enum: ALL_DISTRICTS },
      division: { type: String, required: true },
      note: { type: String, trim: true, maxlength: 240, default: '' },
    },
    deliveryZone: { type: String, enum: ['inside-dhaka', 'outside-dhaka'], required: true },
    // Only the method is ever stored. Card numbers and wallet PINs never reach the server.
    payment: {
      method: { type: String, enum: PAYMENT_METHODS, required: true },
      status: { type: String, enum: ['demo-paid', 'cod-pending'], required: true },
    },
    pricing: {
      subtotal: { type: Number, required: true },
      couponCode: { type: String, default: null },
      discount: { type: Number, default: 0 },
      deliveryFee: { type: Number, required: true },
      total: { type: Number, required: true },
    },
    estimatedDelivery: {
      from: { type: Date, required: true },
      to: { type: Date, required: true },
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'placed',
    },
    isDemo: { type: Boolean, default: true },
    expireAt: {
      type: Date,
      default: () => new Date(Date.now() + DEMO_ORDER_TTL_DAYS * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true, toJSON: { versionKey: false } },
);

// MongoDB deletes each demo order once `expireAt` has passed
orderSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Order', orderSchema);
module.exports.PAYMENT_METHODS = PAYMENT_METHODS;
module.exports.ORDER_STATUSES = ORDER_STATUSES;
