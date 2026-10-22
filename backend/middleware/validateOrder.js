const mongoose = require('mongoose');
const { ALL_DISTRICTS } = require('../data/districts');
const { SIZES } = require('../data/catalogOptions');
const { PAYMENT_METHODS } = require('../models/Order');
const { MAX_QTY_PER_LINE } = require('../services/pricingService');

const MAX_LINES = 20;

// "+880 1712-345678" / "8801712345678" / "01712345678" -> "01712345678"
const normalizePhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('880')) return `0${digits.slice(3)}`;
  return digits;
};

const text = (value) => (typeof value === 'string' ? value.trim() : '');

/**
 * Validates and normalises POST /api/orders. Builds `req.order` from whitelisted fields
 * only, so anything else in the body (e.g. a card number a modified client might send) is
 * dropped and never stored.
 */
const validateOrder = (req, res, next) => {
  const errors = {};
  const body = req.body || {};

  // Items: merge duplicate product + size lines
  const lines = new Map();
  if (!Array.isArray(body.items) || body.items.length === 0) {
    errors.items = 'Your cart is empty';
  } else if (body.items.length > MAX_LINES) {
    errors.items = `An order can have at most ${MAX_LINES} lines`;
  } else {
    for (const item of body.items) {
      const productId = String(item?.productId || '');
      const size = Number(item?.size);
      const qty = Number(item?.qty);
      if (!mongoose.isValidObjectId(productId)) {
        errors.items = 'An item in your cart is invalid';
        break;
      }
      if (!SIZES.includes(size)) {
        errors.items = 'Please choose a valid size for every item';
        break;
      }
      if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_LINE) {
        errors.items = `Quantity must be between 1 and ${MAX_QTY_PER_LINE}`;
        break;
      }
      const key = `${productId}:${size}`;
      const prev = lines.get(key);
      lines.set(key, {
        productId,
        size,
        qty: Math.min(MAX_QTY_PER_LINE, (prev?.qty || 0) + qty),
      });
    }
  }

  // Shipping
  const shipping = body.shipping || {};
  const name = text(shipping.name);
  const phone = normalizePhone(shipping.phone);
  const address = text(shipping.address);
  const district = text(shipping.district);
  const note = text(shipping.note).slice(0, 240);

  if (name.length < 2 || name.length > 80) errors.name = 'Please enter your full name';
  if (!/^01[3-9]\d{8}$/.test(phone)) {
    errors.phone = 'Enter a valid Bangladeshi mobile number (01XXXXXXXXX)';
  }
  if (address.length < 8 || address.length > 240) {
    errors.address = 'Please enter your full address (house, road, area)';
  }
  if (!ALL_DISTRICTS.includes(district)) errors.district = 'Please choose your district';

  // Payment: the method only
  const paymentMethod = text(body.paymentMethod).toLowerCase();
  if (!PAYMENT_METHODS.includes(paymentMethod)) errors.paymentMethod = 'Choose a payment method';

  const couponCode = text(body.couponCode).toUpperCase() || null;

  if (Object.keys(errors).length) {
    return res.status(400).json({ message: 'Please check your order details', errors });
  }

  req.order = {
    items: [...lines.values()],
    shipping: { name, phone, address, district, note },
    paymentMethod,
    couponCode,
  };
  next();
};

module.exports = { validateOrder, normalizePhone };
