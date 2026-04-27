const express = require('express');
const ProductController = require('../controllers/productController');
const productRoutes = require('./products');
const authRoutes = require('./auth');
const cartRoutes = require('./cart');
const profileRoutes = require('./profile');
const orderRoutes = require('./orders');
const promotionRoutes = require('./promotions');
const adminRoutes = require('./admin');

const router = express.Router();

router.get('/', ProductController.renderHomePage);
router.use('/products', productRoutes);
router.use('/auth', authRoutes);
router.use('/cart', cartRoutes);
router.use('/profile', profileRoutes);
router.use('/orders', orderRoutes);
router.use('/promotions', promotionRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
