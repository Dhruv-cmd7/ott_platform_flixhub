const SystemSetting = require('../models/SystemSetting');
const Payment = require('../models/Payment');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const { sendResponse } = require('../utils/response');
const AuditLog = require('../models/AuditLog');

// GET /api/settings
const getSettings = async (req, res, next) => {
  try {
    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = await SystemSetting.create({});
    }
    // Never expose smtpPass or razorpayKeySecret in plaintext — mask them
    const data = settings.toObject();
    if (data.smtpPass) data.smtpPass = data.smtpPass.replace(/./g, '•');
    if (data.razorpayKeySecret) data.razorpayKeySecret = data.razorpayKeySecret.replace(/./g, '•');
    return sendResponse(res, 200, true, 'Settings retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

// PUT /api/settings
const updateSettings = async (req, res, next) => {
  try {
    const allowed = [
      'siteName', 'supportEmail', 'siteLogoUrl', 'sessionExpire', 'maintenanceMode',
      'allowRegistration', 'defaultLanguage', 'timezone',
      'videoCDN', 'hlsEnabled', 'maxStreamQuality', 'defaultPlayerTheme',
      'autoplayEnabled', 'subtitleEnabled', 'watermarkEnabled', 'watermarkText', 'maxConcurrentStreams',
      'paymentGateway', 'razorpayKeyId', 'razorpayKeySecret', 'razorpayWebhookSecret',
      'currency', 'trialDays', 'refundPolicy', 'taxPercentage', 'testMode',
      'smtpHost', 'smtpPort', 'smtpUser', 'smtpPass', 'smtpSecure',
      'emailFromName', 'emailFromAddress', 'emailFooterText',
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        // Don't overwrite secrets if the value is all bullets (masked)
        if ((key === 'smtpPass' || key === 'razorpayKeySecret') && /^•+$/.test(req.body[key])) continue;
        // Boolean coercion
        if (['maintenanceMode', 'allowRegistration', 'hlsEnabled', 'autoplayEnabled',
              'subtitleEnabled', 'watermarkEnabled', 'testMode', 'smtpSecure'].includes(key)) {
          updates[key] = req.body[key] === true || req.body[key] === 'true';
        } else if (['smtpPort', 'maxConcurrentStreams', 'trialDays', 'taxPercentage'].includes(key)) {
          updates[key] = Number(req.body[key]);
        } else {
          updates[key] = req.body[key];
        }
      }
    }

    let settings = await SystemSetting.findOne();
    if (!settings) {
      settings = await SystemSetting.create(updates);
    } else {
      Object.assign(settings, updates);
      await settings.save();
    }

    await AuditLog.create({
      admin: req.user._id,
      action: 'Update System Settings',
      details: `Updated system configurations`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendResponse(res, 200, true, 'Settings updated successfully', { success: true });
  } catch (error) {
    next(error);
  }
};

// GET /api/settings/payments  — Payment history + stats for gateway page
const getPaymentStats = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, status } = req.query;
    const query = status ? { status } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [total, captured, failed, payments, plans] = await Promise.all([
      Payment.countDocuments(query),
      Payment.countDocuments({ status: 'captured' }),
      Payment.countDocuments({ status: 'failed' }),
      Payment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'name email')
        .populate('plan', 'name price durationDays'),
      SubscriptionPlan.find({ isActive: true }).select('name price durationDays'),
    ]);

    const revenueAgg = await Payment.aggregate([
      { $match: { status: 'captured' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    const monthAgg = await Payment.aggregate([
      { $match: { status: 'captured', createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const monthRevenue = monthAgg[0]?.total || 0;

    return sendResponse(res, 200, true, 'Payment stats retrieved', {
      stats: { total, captured, failed, totalRevenue, monthRevenue },
      payments,
      plans,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  getPaymentStats,
};
