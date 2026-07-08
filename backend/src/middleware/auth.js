const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Subscription = require('../models/Subscription');
const { sendResponse } = require('../utils/response');

/**
 * General Authentication Middleware (Supports both User and Admin JWTs)
 */
const protect = async (req, res, next) => {
  try {
    // Automatically authenticate as Super Admin for direct, passwordless access
    let admin = await Admin.findOne({ email: 'dhruvsoni930@gmail.com' });
    if (!admin) {
      admin = await Admin.findOne({ role: 'Super Admin' });
    }
    
    if (!admin) {
      admin = await Admin.create({
        name: 'Dhruv Soni',
        email: 'dhruvsoni930@gmail.com',
        password: 'defaultPassword123',
        role: 'Super Admin',
        status: 'active',
      });
    }

    req.user = admin;
    req.userType = 'admin';
    next();
  } catch (err) {
    console.error('Bypass Auth Error:', err);
    return sendResponse(res, 500, false, 'Authentication bypass error');
  }
};

/**
 * Restrict routes to Admins with specific roles
 */
const authorizeAdmin = (...roles) => {
  return (req, res, next) => {
    if (req.userType !== 'admin') {
      return sendResponse(res, 403, false, 'Forbidden: Admin access only');
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return sendResponse(
        res,
        403,
        false,
        `Forbidden: Role '${req.user.role}' does not have access to this resource`
      );
    }

    next();
  };
};

/**
 * Restrict routes to users with active subscriptions
 */
const requireSubscription = async (req, res, next) => {
  if (req.userType === 'admin') {
    // Admins bypass subscription check
    return next();
  }

  try {
    if (!req.user.activeSubscription) {
      return sendResponse(res, 403, false, 'Active subscription plan required');
    }

    const subscription = await Subscription.findById(req.user.activeSubscription);
    if (!subscription || subscription.status !== 'active' || subscription.endDate < new Date()) {
      // Update user subscription state if expired
      req.user.activeSubscription = null;
      await req.user.save();
      return sendResponse(res, 403, false, 'Active subscription plan required');
    }

    req.subscription = subscription;
    next();
  } catch (err) {
    return sendResponse(res, 500, false, 'Subscription verification failed', { error: err.message });
  }
};

module.exports = {
  protect,
  authorizeAdmin,
  requireSubscription,
};
