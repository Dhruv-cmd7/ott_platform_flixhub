const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { protect, authorizeAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { planValidator } = require('../validators/contentValidator');

// Public Plans
router.get('/plans', subscriptionController.getPlans);
router.get('/plans/:id', subscriptionController.getPlanById);

// Client-User Subscription Status
router.get('/my-status', protect, subscriptionController.getUserSubscription);

// Admin / Finance Manager Protected routes
router.post(
  '/plans',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Finance Manager'),
  planValidator,
  validate,
  subscriptionController.createPlan
);

router.put(
  '/plans/:id',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Finance Manager'),
  subscriptionController.updatePlan
);

router.patch(
  '/plans/:id/activate',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Finance Manager'),
  subscriptionController.activatePlan
);

router.patch(
  '/plans/:id/deactivate',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Finance Manager'),
  subscriptionController.deactivatePlan
);

// Admin-Only Route
router.delete(
  '/plans/:id',
  protect,
  authorizeAdmin('Super Admin', 'Admin'),
  subscriptionController.deletePlan
);

module.exports = router;
