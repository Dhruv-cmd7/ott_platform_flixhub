const express = require('express');
const router = express.Router();
const metadataController = require('../controllers/metadataController');
const { protect, authorizeAdmin } = require('../middleware/auth');

// ================= CATEGORIES =================
router.get('/categories', metadataController.getCategories);
router.post(
  '/categories',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Content Manager'),
  metadataController.createCategory
);
router.put(
  '/categories/:id',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Content Manager'),
  metadataController.updateCategory
);
router.delete(
  '/categories/:id',
  protect,
  authorizeAdmin('Super Admin', 'Admin'),
  metadataController.deleteCategory
);

// ================= GENRES =================
router.get('/genres', metadataController.getGenres);
router.post(
  '/genres',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Content Manager'),
  metadataController.createGenre
);
router.put(
  '/genres/:id',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Content Manager'),
  metadataController.updateGenre
);
router.delete(
  '/genres/:id',
  protect,
  authorizeAdmin('Super Admin', 'Admin'),
  metadataController.deleteGenre
);

// ================= LANGUAGES =================
router.get('/languages', metadataController.getLanguages);
router.post(
  '/languages',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Content Manager'),
  metadataController.createLanguage
);
router.put(
  '/languages/:id',
  protect,
  authorizeAdmin('Super Admin', 'Admin', 'Content Manager'),
  metadataController.updateLanguage
);
router.delete(
  '/languages/:id',
  protect,
  authorizeAdmin('Super Admin', 'Admin'),
  metadataController.deleteLanguage
);

module.exports = router;
