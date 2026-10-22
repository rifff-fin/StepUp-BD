const Coupon = require('../models/Coupon');
const { couponDiscount } = require('../services/pricingService');

// @desc    Check a coupon code and preview its discount
// @route   POST /api/coupons/validate   { code, subtotal }
// @access  Public (rate limited)
const validateCoupon = async (req, res) => {
  try {
    const code = String(req.body.code || '')
      .trim()
      .toUpperCase();
    const subtotal = Number(req.body.subtotal) || 0;

    if (!/^[A-Z0-9]{3,20}$/.test(code)) {
      return res.status(400).json({ valid: false, message: 'Enter a valid coupon code' });
    }

    const coupon = await Coupon.findOne({ code });
    if (!coupon || !coupon.isUsable()) {
      return res.status(404).json({ valid: false, message: 'This coupon code is not valid' });
    }

    res.json({
      valid: true,
      code: coupon.code,
      percent: coupon.percent,
      description: coupon.description,
      discount: couponDiscount(subtotal, coupon.percent),
      message: `${coupon.code} applied: ${coupon.percent}% off`,
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({ valid: false, message: 'Server error' });
  }
};

module.exports = { validateCoupon };
