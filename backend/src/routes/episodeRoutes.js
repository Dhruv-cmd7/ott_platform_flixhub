const express = require('express');
const router = express.Router();
const episodeController = require('../controllers/episodeController');
const { protect, authorizeAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { episodeValidator } = require('../validators/contentValidator');
const { upload } = require('../middleware/upload');

// Multer uploads
const uploadFields = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]);

// Public Routes
router.get('/:id', episodeController.getEpisodeById);

// Admin / Content Manager Protected Routes
router.post(
  '/',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Content Manager'),
  uploadFields,
  episodeValidator,
  validate,
  episodeController.addEpisode
);

router.put(
  '/:id',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Content Manager'),
  uploadFields,
  episodeController.updateEpisode
);

// Admin-Only Route
router.delete(
  '/:id',
  protect,
  authorizeAdmin('Super Admin', 'Admin'),
  episodeController.deleteEpisode
);

module.exports = router;
