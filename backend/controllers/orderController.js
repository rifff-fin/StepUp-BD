const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { divisionOf } = require('../data/districts');
const { normalizePhone } = require('../middleware/validateOrder');
const {
  calculateTotals,
  deliveryZoneFor,
  estimateDelivery,
} = require('../services/pricingService');
const { generateOrderNumber, isOrderNumber } = require('../utils/orderNumber');

// @desc    Place a (demo) order. Prices, coupon and delivery fee are recalculated here from
//          the catalog; the client's totals are never trusted. No payment details are
//          accepted: only the chosen method is stored.
// @route   POST /api/orders
// @access  Public (validated + rate limited)
const createOrder = async (req, res) => {
  try {
    const { items, shipping, paymentMethod, couponCode } = req.order;

    const products = await Product.find({
      _id: { $in: items.map((item) => item.productId) },
      active: true,
    });
    const byId = new Map(products.map((product) => [product.id, product]));

    const orderItems = [];
    for (const item of items) {
      const product = byId.get(item.productId);
      if (!product) {
        return res.status(400).json({
          message: 'An item in your cart is no longer available. Please remove it and try again.',
          errors: { items: 'unavailable' },
        });
      }
      if (!product.sizes.includes(item.size)) {
        return res.status(400).json({
          message: `EU ${item.size} of ${product.name} is sold out. Please pick another size.`,
          errors: { items: 'size-unavailable' },
        });
      }
      orderItems.push({
        product: product._id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        size: item.size,
        qty: item.qty,
        unitPrice: product.price,
        lineTotal: product.price * item.qty,
      });
    }

    let couponPercent = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode });
      if (!coupon || !coupon.isUsable()) {
        return res.status(400).json({
          message: `Coupon ${couponCode} is not valid any more. Remove it and try again.`,
          errors: { couponCode: 'invalid' },
        });
      }
      couponPercent = coupon.percent;
    }

    const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const deliveryZone = deliveryZoneFor(shipping.district);
    const totals = calculateTotals({ subtotal, couponPercent, deliveryZone });

    const order = await Order.create({
      orderNumber: await generateOrderNumber(),
      items: orderItems,
      shipping: { ...shipping, division: divisionOf(shipping.district) },
      deliveryZone,
      payment: {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'cod-pending' : 'demo-paid',
      },
      pricing: { ...totals, couponCode: couponPercent ? couponCode : null },
      estimatedDelivery: estimateDelivery(deliveryZone),
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Look up an order (order number + the phone used at checkout)
// @route   GET /api/orders/:orderNumber?phone=01XXXXXXXXX
// @access  Public (both values must match)
const getOrder = async (req, res) => {
  try {
    const orderNumber = String(req.params.orderNumber || '').toUpperCase();
    const phone = normalizePhone(req.query.phone);

    if (!isOrderNumber(orderNumber) || !/^01[3-9]\d{8}$/.test(phone)) {
      return res.status(400).json({ message: 'Enter your order ID (SUBD-12345) and phone number' });
    }

    const order = await Order.findOne({ orderNumber });
    // Same answer for "no such order" and "wrong phone", so order IDs cannot be probed
    if (!order || order.shipping.phone !== phone) {
      return res.status(404).json({ message: 'No order found with that ID and phone number' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createOrder, getOrder };
