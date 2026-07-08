const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { protect, authorizeAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { couponValidator } = require('../validators/contentValidator');

// Public validation before checkout
router.post('/validate', protect, couponController.validateCoupon);

// Admin / Finance Manager Protected Routes
router.get(
  '/',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Finance Manager'),
  couponController.getCoupons
);

router.post(
  '/',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Finance Manager'),
  couponValidator,
  validate,
  couponController.createCoupon
);

router.put(
  '/:id',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Finance Manager'),
  couponController.updateCoupon
);

// Admin-Only Route
router.delete(
  '/:id',
  protect,
  authorizeAdmin('Super Admin', 'Admin'),
  couponController.deleteCoupon
);

module.exports = router;
