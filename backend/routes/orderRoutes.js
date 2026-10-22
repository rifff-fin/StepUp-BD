const express = require('express');
const router = express.Router();
const { createOrder, getOrder } = require('../controllers/orderController');
const { validateOrder } = require('../middleware/validateOrder');
const { rateLimiter } = require('../middleware/rateLimiter');

router.post('/', rateLimiter({ windowMs: 10 * 60 * 1000, max: 15 }), validateOrder, createOrder);
router.get('/:orderNumber', rateLimiter({ windowMs: 10 * 60 * 1000, max: 40 }), getOrder);

module.exports = router;
