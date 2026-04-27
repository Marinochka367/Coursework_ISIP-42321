const express = require('express');
const AuthController = require('../controllers/authController');
const { registerValidationRules, loginValidationRules, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

router.get('/register', AuthController.renderRegisterPage);
router.post('/register', registerValidationRules, handleValidationErrors, AuthController.register);
router.get('/login', AuthController.renderLoginPage);
router.post('/login', loginValidationRules, handleValidationErrors, AuthController.login);
router.post('/logout', AuthController.logout);

module.exports = router;
