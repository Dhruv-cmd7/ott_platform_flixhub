const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, authorizeAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerValidator,
  loginValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../validators/authValidator');

// User Authentication Routes
router.post('/register', authLimiter, registerValidator, validate, authController.registerUser);
router.post('/login', authLimiter, loginValidator, validate, authController.loginUser);
router.post('/logout', protect, authController.logout);
router.post('/refresh', authController.refreshUserToken);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/reset-password/:resetToken', authLimiter, resetPasswordValidator, validate, authController.resetPassword);
router.put('/change-password', protect, changePasswordValidator, validate, authController.changePassword);
router.get('/profile', protect, authController.getProfile);
router.post('/google-login', authLimiter, authController.googleLogin);

// Admin Authentication Routes
router.post('/admin/login', authLimiter, loginValidator, validate, authController.loginAdmin);
router.post('/admin/refresh', authController.refreshAdminToken);
router.post(
  '/admin/register',
  protect,
  authorizeAdmin('Super Admin'),
  registerValidator,
  validate,
  authController.registerAdmin
);

module.exports = router;
