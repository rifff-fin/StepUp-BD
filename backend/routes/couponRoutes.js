const express = require('express');
const router = express.Router();
const { validateCoupon } = require('../controllers/couponController');
const { rateLimiter } = require('../middleware/rateLimiter');

// Limited so codes cannot be brute-forced
router.post('/validate', rateLimiter({ windowMs: 10 * 60 * 1000, max: 30 }), validateCoupon);

module.exports = router;
