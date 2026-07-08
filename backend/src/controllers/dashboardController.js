const analyticsService = require('../services/analyticsService');
const Banner = require('../models/Banner');
const Notification = require('../models/Notification');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { uploadToCloud } = require('../middleware/upload');
const { sendResponse } = require('../utils/response');

// ================= DASHBOARD ANALYTICS =================

const getStats = async (req, res, next) => {
  try {
    const stats = await analyticsService.getDashboardStats();
    return sendResponse(res, 200, true, 'Dashboard statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

// ================= USER SEARCH & MANAGEMENT =================

const searchUsers = async (req, res, next) => {
  try {
    const { search, status, sort, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    let sortBy = '-createdAt';
    if (sort) {
      sortBy = sort.split(',').join(' ');
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate('activeSubscription');

    return sendResponse(res, 200, true, 'Users list retrieved', {
      users,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return sendResponse(res, 400, false, 'Invalid status value');
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!user) return sendResponse(res, 404, false, 'User not found');

    await AuditLog.create({
      admin: req.user._id,
      action: 'Update User Status',
      details: `Suspended or reactivated user: ${user.email} (Status: ${status})`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendResponse(res, 200, true, `User status updated to ${status}`, user);
  } catch (error) {
    next(error);
  }
};

// ================= BANNERS CRUD =================

const getBanners = async (req, res, next) => {
  try {
    const showAll = req.query.admin === 'true';
    const query = showAll ? {} : { isActive: true };
    const banners = await Banner.find(query).sort({ order: 1 });
    return sendResponse(res, 200, true, 'Banners retrieved successfully', banners);
  } catch (error) {
    next(error);
  }
};

const createBanner = async (req, res, next) => {
  try {
    const { title, description, linkUrl, order } = req.body;
    let imageUrl = req.body.imageUrl || '';

    if (req.file) {
      imageUrl = await uploadToCloud(req.file.path, 'banners');
    }

    if (!imageUrl) {
      return sendResponse(res, 400, false, 'Banner image file is required');
    }

    const banner = await Banner.create({
      title,
      description,
      imageUrl,
      linkUrl,
      order: order ? parseInt(order, 10) : 0,
    });

    return sendResponse(res, 201, true, 'Banner created successfully', banner);
  } catch (error) {
    next(error);
  }
};

const updateBanner = async (req, res, next) => {
  try {
    const updateFields = { ...req.body };
    if (req.file) {
      updateFields.imageUrl = await uploadToCloud(req.file.path, 'banners');
    }

    const banner = await Banner.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!banner) return sendResponse(res, 404, false, 'Banner not found');
    return sendResponse(res, 200, true, 'Banner updated successfully', banner);
  } catch (error) {
    next(error);
  }
};

const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return sendResponse(res, 404, false, 'Banner not found');
    return sendResponse(res, 200, true, 'Banner deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ================= NOTIFICATIONS CRUD =================

const getNotifications = async (req, res, next) => {
  try {
    const query = {};
    if (req.userType === 'user') {
      // Return user specific notifications OR global system-wide notifications
      query.$or = [{ user: req.user._id }, { user: null }];
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 });
    return sendResponse(res, 200, true, 'Notifications retrieved successfully', notifications);
  } catch (error) {
    next(error);
  }
};

const createNotification = async (req, res, next) => {
  try {
    const { user, title, message, type } = req.body;
    
    const notification = await Notification.create({
      user: user || null,
      title,
      message,
      type: type || 'system',
    });

    return sendResponse(res, 201, true, 'Notification sent successfully', notification);
  } catch (error) {
    next(error);
  }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) return sendResponse(res, 404, false, 'Notification not found');
    return sendResponse(res, 200, true, 'Notification marked as read', notification);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  searchUsers,
  updateUserStatus,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getNotifications,
  createNotification,
  markNotificationRead,
};
