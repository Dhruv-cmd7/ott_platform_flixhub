const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const { protect, authorizeAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { movieValidator } = require('../validators/contentValidator');
const { upload } = require('../middleware/upload');

// Multer upload field definitions
const uploadFields = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
  { name: 'trailer', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]);

// Public Routes
router.get('/', movieController.getMovies);
router.get('/latest', movieController.getLatestMovies);
router.get('/:id', movieController.getMovieById);

// Admin / Content Manager Protected Routes
router.post(
  '/',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Content Manager'),
  uploadFields,
  movieValidator,
  validate,
  movieController.createMovie
);

router.put(
  '/:id',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Content Manager'),
  uploadFields,
  movieController.updateMovie
);

router.patch(
  '/:id/publish',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Content Manager'),
  movieController.togglePublish
);

router.patch(
  '/:id/featured',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Content Manager'),
  movieController.toggleFeatured
);

router.patch(
  '/:id/trending',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Content Manager'),
  movieController.toggleTrending
);

// Admin-Only Delete Route
router.delete(
  '/:id',
  protect,
  authorizeAdmin('Super Admin', 'Admin'),
  movieController.deleteMovie
);

module.exports = router;
