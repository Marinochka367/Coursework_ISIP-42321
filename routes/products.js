const express = require('express');
const ProductController = require('../controllers/productController');

const router = express.Router();

router.get('/', ProductController.renderCatalogPage);
router.get('/:slug', ProductController.renderProductDetailPage);

module.exports = router;
