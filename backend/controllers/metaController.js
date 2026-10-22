const {
  BRANDS,
  CATEGORIES,
  COLORS,
  SIZES,
  PRICE_RANGE,
  CURRENCY,
} = require('../data/catalogOptions');
const { DIVISIONS } = require('../data/districts');
const { DELIVERY_FEES, DELIVERY_DAYS, MAX_QTY_PER_LINE } = require('../services/pricingService');

// @desc    Store configuration the frontend needs: filter options, districts, delivery fees
// @route   GET /api/meta
// @access  Public
const getMeta = (req, res) => {
  // Static data: let browsers and the Netlify edge cache it for an hour
  res.set('Cache-Control', 'public, max-age=3600');
  res.json({
    brands: BRANDS,
    categories: CATEGORIES,
    colors: COLORS,
    sizes: SIZES,
    priceRange: PRICE_RANGE,
    currency: CURRENCY,
    divisions: DIVISIONS,
    delivery: { fees: DELIVERY_FEES, days: DELIVERY_DAYS },
    maxQtyPerLine: MAX_QTY_PER_LINE,
  });
};

module.exports = { getMeta };
