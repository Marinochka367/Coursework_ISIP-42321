const express = require('express');
const CartController = require('../controllers/cartController');
const { cartAddValidationRules, cartUpdateValidationRules, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

router.get('/', CartController.renderCartPage);
router.post('/add', cartAddValidationRules, handleValidationErrors, CartController.addToCart);
router.post('/update', cartUpdateValidationRules, handleValidationErrors, CartController.updateCartItem);
router.post('/remove', cartAddValidationRules, handleValidationErrors, CartController.removeCartItem);

module.exports = router;
