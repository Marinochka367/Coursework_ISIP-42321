const express = require('express');
const OrderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const { checkoutValidationRules, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

router.use(authMiddleware);
router.get('/checkout', OrderController.renderCheckoutPage);
router.get('/address-suggest', OrderController.suggestAddress);
router.post('/checkout', checkoutValidationRules, handleValidationErrors, OrderController.createOrder);
router.get('/success/:id', OrderController.renderSuccessPage);

module.exports = router;
