const PromotionModel = require('../models/promotionModel');

class PromotionController {
  static async renderPromotionsPage(req, res, next) {
    try {
      const promotions = await PromotionModel.getActivePromotions();
      res.render('promotions/index', { title: 'Акции и скидки', promotions });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PromotionController;
