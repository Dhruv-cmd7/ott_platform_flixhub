const SubscriptionPlan = require('../models/SubscriptionPlan');
const Subscription = require('../models/Subscription');
const AuditLog = require('../models/AuditLog');
const { sendResponse } = require('../utils/response');

/**
 * @desc    Get all plans (Public gets active only, Admin gets all)
 * @route   GET /api/subscriptions/plans
 * @access  Public / Private
 */
const getPlans = async (req, res, next) => {
  try {
    // If request comes from an authenticated admin, we show all plans
    const showInactive = req.headers['x-admin-request'] === 'true' || req.query.admin === 'true';
    const query = showInactive ? {} : { isActive: true };

    const plans = await SubscriptionPlan.find(query);
    return sendResponse(res, 200, true, 'Plans fetched successfully', plans);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get subscription plan details
 * @route   GET /api/subscriptions/plans/:id
 * @access  Public
 */
const getPlanById = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan) {
      return sendResponse(res, 404, false, 'Subscription plan not found');
    }
    return sendResponse(res, 200, true, 'Plan retrieved successfully', plan);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create subscription plan
 * @route   POST /api/subscriptions/plans
 * @access  Private (Finance Manager / Admin)
 */
const createPlan = async (req, res, next) => {
  try {
    const { name, description, price, durationDays, resolution, simultaneousScreens } = req.body;
    
    const plan = await SubscriptionPlan.create({
      name,
      description,
      price,
      durationDays,
      resolution,
      simultaneousScreens,
    });

    await AuditLog.create({
      admin: req.user._id,
      action: 'Create Plan',
      details: `Created subscription plan: "${name}"`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendResponse(res, 201, true, 'Subscription plan created successfully', plan);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update subscription plan
 * @route   PUT /api/subscriptions/plans/:id
 * @access  Private (Finance Manager / Admin)
 */
const updatePlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!plan) {
      return sendResponse(res, 404, false, 'Subscription plan not found');
    }

    await AuditLog.create({
      admin: req.user._id,
      action: 'Update Plan',
      details: `Updated subscription plan ID: ${plan._id} ("${plan.name}")`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendResponse(res, 200, true, 'Subscription plan updated successfully', plan);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete subscription plan
 * @route   DELETE /api/subscriptions/plans/:id
 * @access  Private (Admin / Super Admin)
 */
const deletePlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return sendResponse(res, 404, false, 'Subscription plan not found');
    }

    await AuditLog.create({
      admin: req.user._id,
      action: 'Delete Plan',
      details: `Deleted subscription plan ID: ${plan._id} ("${plan.name}")`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendResponse(res, 200, true, 'Subscription plan deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Deactivate subscription plan
 * @route   PATCH /api/subscriptions/plans/:id/deactivate
 * @access  Private (Finance Manager / Admin)
 */
const deactivatePlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!plan) {
      return sendResponse(res, 404, false, 'Subscription plan not found');
    }
    return sendResponse(res, 200, true, 'Plan deactivated successfully', plan);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Activate subscription plan
 * @route   PATCH /api/subscriptions/plans/:id/activate
 * @access  Private (Finance Manager / Admin)
 */
const activatePlan = async (req, res, next) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );
    if (!plan) {
      return sendResponse(res, 404, false, 'Subscription plan not found');
    }
    return sendResponse(res, 200, true, 'Plan activated successfully', plan);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged in user's active subscription status
 * @route   GET /api/subscriptions/my-status
 * @access  Private
 */
const getUserSubscription = async (req, res, next) => {
  try {
    if (req.userType !== 'user') {
      return sendResponse(res, 400, false, 'Only client users have active subscriptions');
    }

    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: 'active',
      endDate: { $gte: new Date() },
    }).populate('plan');

    if (!subscription) {
      return sendResponse(res, 200, true, 'No active subscription found', null);
    }

    return sendResponse(res, 200, true, 'Active subscription retrieved successfully', subscription);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  deactivatePlan,
  activatePlan,
  getUserSubscription,
};
