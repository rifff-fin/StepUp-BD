const express = require('express');
const router = express.Router();
const { getMeta } = require('../controllers/metaController');

router.get('/', getMeta);

module.exports = router;
