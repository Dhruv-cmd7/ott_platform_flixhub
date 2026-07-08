const express = require('express');
const router = express.Router();
const userActionController = require('../controllers/userActionController');
const { protect } = require('../middleware/auth');

// All interaction routes require users to be logged in
router.use(protect);

// Wishlist
router.get('/wishlist', userActionController.getWishlist);
router.post('/wishlist/toggle', userActionController.toggleWishlist);

// Watch History
router.get('/watch-history', userActionController.getWatchHistory);
router.post('/watch-history', userActionController.addWatchHistory);

// Continue Watching
router.get('/continue-watching', userActionController.getContinueWatchingList);
router.post('/continue-watching', userActionController.savePlaybackPosition);
router.delete('/continue-watching/:id', userActionController.deletePlaybackPosition);

// Reviews & Ratings
router.post('/reviews', userActionController.addReview);
router.get('/reviews/:contentId', userActionController.getReviewsForContent);
router.post('/ratings', userActionController.addRating);

module.exports = router;
