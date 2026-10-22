// Resets the catalog and coupons to the seed data in data/ (orders and subscribers are kept).
//   npm run seed
require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const { resetCatalog } = require('../services/seedService');

const run = async () => {
  await connectDB();
  const counts = await resetCatalog();
  console.log(`🌱 Catalog reset: ${counts.products} products, ${counts.coupons} coupon(s)`);
  await disconnectDB();
};

run().catch(async (error) => {
  console.error('❌ Seed failed:', error);
  await disconnectDB();
  process.exit(1);
});
