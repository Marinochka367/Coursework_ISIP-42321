const express = require('express');
const ProfileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');
const { profileUpdateValidationRules, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

router.use(authMiddleware);
router.get('/', ProfileController.renderProfilePage);
router.get('/edit', ProfileController.renderEditProfilePage);
router.post('/edit', profileUpdateValidationRules, handleValidationErrors, ProfileController.updateProfile);
router.get('/orders', ProfileController.renderOrdersHistoryPage);

module.exports = router;
