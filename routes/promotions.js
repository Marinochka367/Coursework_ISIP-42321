const express = require('express');
const PromotionController = require('../controllers/promotionController');

const router = express.Router();

router.get('/', PromotionController.renderPromotionsPage);

module.exports = router;
