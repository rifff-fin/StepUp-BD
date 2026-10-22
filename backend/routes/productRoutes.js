const express = require('express');
const router = express.Router();
const { getProducts, getProductBySlug } = require('../controllers/productController');

router.get('/', getProducts);
router.get('/:slug', getProductBySlug);

module.exports = router;
