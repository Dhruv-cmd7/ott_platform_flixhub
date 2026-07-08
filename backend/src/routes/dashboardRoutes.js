const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, authorizeAdmin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const bannerUpload = upload.single('image');

// Banners public retrieval route
router.get('/banners', dashboardController.getBanners);

// Notifications retrieval (logged-in users can retrieve theirs, admins see all/create)
router.get('/notifications', protect, dashboardController.getNotifications);
router.patch('/notifications/:id/read', protect, dashboardController.markNotificationRead);

// Protected Admin Dashboard Routes
router.get(
  '/stats',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Finance Manager', 'Support Manager'),
  dashboardController.getStats
);

router.get(
  '/users',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Support Manager'),
  dashboardController.searchUsers
);

router.patch(
  '/users/:id/status',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Support Manager'),
  dashboardController.updateUserStatus
);

// Admin Banner Management Routes
router.post(
  '/banners',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Content Manager'),
  bannerUpload,
  dashboardController.createBanner
);

router.put(
  '/banners/:id',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Content Manager'),
  bannerUpload,
  dashboardController.updateBanner
);

router.delete(
  '/banners/:id',
  protect,
  authorizeAdmin('Super Admin', 'Admin'),
  dashboardController.deleteBanner
);

// Admin Notification Send Route
router.post(
  '/notifications',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Support Manager'),
  dashboardController.createNotification
);

module.exports = router;
