const crypto = require('crypto');
const Order = require('../models/Order');

const PREFIX = 'SUBD';

// SUBD-48291 style: 5 random digits
const randomOrderNumber = () => `${PREFIX}-${crypto.randomInt(10000, 100000)}`;

// Retries on the rare collision with an existing order
const generateOrderNumber = async (attempts = 8) => {
  for (let i = 0; i < attempts; i += 1) {
    const orderNumber = randomOrderNumber();
    const taken = await Order.exists({ orderNumber });
    if (!taken) return orderNumber;
  }
  throw new Error('Could not generate a unique order number');
};

const isOrderNumber = (value) => typeof value === 'string' && /^SUBD-\d{5}$/.test(value);

module.exports = { generateOrderNumber, isOrderNumber };
