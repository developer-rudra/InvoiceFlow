const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidationRules, loginValidationRules } = require('../validators/authValidator');
const validate = require('../middleware/validateMiddleware');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerValidationRules, validate, authController.register);
router.post('/login', loginValidationRules, validate, authController.login);
router.get('/me', protect, authController.getMe);

module.exports = router;
