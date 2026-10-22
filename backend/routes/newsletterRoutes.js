const express = require('express');
const router = express.Router();
const { subscribe } = require('../controllers/newsletterController');
const { rateLimiter } = require('../middleware/rateLimiter');

router.post('/', rateLimiter({ windowMs: 10 * 60 * 1000, max: 10 }), subscribe);

module.exports = router;
