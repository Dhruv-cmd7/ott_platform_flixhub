const express = require('express');
const router = express.Router();
const seriesController = require('../controllers/seriesController');
const { protect, authorizeAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { seriesValidator } = require('../validators/contentValidator');
const { upload } = require('../middleware/upload');

// Multer upload fields
const uploadFields = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
]);

// Public Routes
router.get('/', seriesController.getSeries);
router.get('/:id', seriesController.getSeriesById);

// Admin / Content Manager Protected Routes
router.post(
  '/',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Content Manager'),
  uploadFields,
  seriesValidator,
  validate,
  seriesController.createSeries
);

router.put(
  '/:id',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Content Manager'),
  uploadFields,
  seriesController.updateSeries
);

router.patch(
  '/:id/publish',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Content Manager'),
  seriesController.togglePublishSeries
);

// Admin Delete Route
router.delete(
  '/:id',
  protect,
  authorizeAdmin('Super Admin', 'Admin'),
  seriesController.deleteSeries
);

module.exports = router;
