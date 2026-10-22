const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const products = require('../data/products');
const coupons = require('../data/coupons');

// Fills an empty database with the seed catalog and coupons (runs at server start), so a
// fresh deployment or the in-memory dev database has products straight away.
const seedIfEmpty = async () => {
  const [productCount, couponCount] = await Promise.all([
    Product.estimatedDocumentCount(),
    Coupon.estimatedDocumentCount(),
  ]);

  if (productCount === 0) {
    await Product.insertMany(products);
    console.log(`🌱 Seeded ${products.length} products`);
  }
  if (couponCount === 0) {
    await Coupon.insertMany(coupons);
    console.log(`🌱 Seeded ${coupons.length} coupon(s)`);
  }
};

// Replaces the catalog and coupons with the seed data (orders and subscribers are kept)
const resetCatalog = async () => {
  await Product.deleteMany({});
  await Coupon.deleteMany({});
  await Product.insertMany(products);
  await Coupon.insertMany(coupons);
  return { products: products.length, coupons: coupons.length };
};

module.exports = { seedIfEmpty, resetCatalog };
