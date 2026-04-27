const express = require('express');
const AdminController = require('../controllers/adminController');
const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  categoryValidationRules,
  productValidationRules,
  promotionValidationRules,
  orderStatusValidationRules,
  handleValidationErrors
} = require('../middleware/validation');

const router = express.Router();

router.use(adminMiddleware);

router.get('/', AdminController.renderDashboard);

router.get('/categories', AdminController.renderCategoriesPage);
router.get('/categories/:id/edit', AdminController.renderEditCategoryPage);
router.post('/categories', categoryValidationRules, handleValidationErrors, AdminController.createCategory);
router.post('/categories/:id', categoryValidationRules, handleValidationErrors, AdminController.updateCategory);
router.post('/categories/:id/delete', AdminController.deleteCategory);

router.get('/products', AdminController.renderProductsPage);
router.get('/products/:id/edit', AdminController.renderEditProductPage);
router.post('/products', upload.single('image'), productValidationRules, handleValidationErrors, AdminController.createProduct);
router.post('/products/:id', upload.single('image'), productValidationRules, handleValidationErrors, AdminController.updateProduct);
router.post('/products/:id/delete', AdminController.deleteProduct);

router.get('/promotions', AdminController.renderPromotionsPage);
router.get('/promotions/:id/edit', AdminController.renderEditPromotionPage);
router.post('/promotions', promotionValidationRules, handleValidationErrors, AdminController.createPromotion);
router.post('/promotions/:id', promotionValidationRules, handleValidationErrors, AdminController.updatePromotion);
router.post('/promotions/:id/delete', AdminController.deletePromotion);

router.get('/orders', AdminController.renderOrdersPage);
router.get('/orders/:id', AdminController.renderOrderDetailsPage);
router.post('/orders/:id/status', orderStatusValidationRules, handleValidationErrors, AdminController.updateOrderStatus);

module.exports = router;
