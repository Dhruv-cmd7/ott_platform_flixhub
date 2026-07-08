const Wishlist = require('../models/Wishlist');
const WatchHistory = require('../models/WatchHistory');
const ContinueWatching = require('../models/ContinueWatching');
const Review = require('../models/Review');
const Rating = require('../models/Rating');
const Movie = require('../models/Movie');
const Series = require('../models/Series');
const { sendResponse } = require('../utils/response');

// ================= WISHLIST =================

const getWishlist = async (req, res, next) => {
  try {
    const list = await Wishlist.find({ user: req.user._id })
      .populate({
        path: 'contentId',
        populate: [{ path: 'categories' }, { path: 'genres' }]
      });

    return sendResponse(res, 200, true, 'Wishlist retrieved successfully', list);
  } catch (error) {
    next(error);
  }
};

const toggleWishlist = async (req, res, next) => {
  try {
    const { contentType, contentId } = req.body;
    if (!['Movie', 'Series'].includes(contentType) || !contentId) {
      return sendResponse(res, 400, false, 'Invalid content type or ID');
    }

    const existing = await Wishlist.findOne({ user: req.user._id, contentId });
    if (existing) {
      await Wishlist.findByIdAndDelete(existing._id);
      return sendResponse(res, 200, true, 'Item removed from wishlist');
    }

    const item = await Wishlist.create({
      user: req.user._id,
      contentType,
      contentId,
    });

    return sendResponse(res, 201, true, 'Item added to wishlist', item);
  } catch (error) {
    next(error);
  }
};

// ================= WATCH HISTORY =================

const getWatchHistory = async (req, res, next) => {
  try {
    const history = await WatchHistory.find({ user: req.user._id })
      .sort({ watchedAt: -1 })
      .populate('contentId');
    return sendResponse(res, 200, true, 'Watch history retrieved successfully', history);
  } catch (error) {
    next(error);
  }
};

const addWatchHistory = async (req, res, next) => {
  try {
    const { contentType, contentId, watchedDuration } = req.body;
    if (!['Movie', 'Episode'].includes(contentType) || !contentId || !watchedDuration) {
      return sendResponse(res, 400, false, 'Invalid parameters');
    }

    const history = await WatchHistory.create({
      user: req.user._id,
      contentType,
      contentId,
      watchedDuration,
    });

    return sendResponse(res, 201, true, 'Watch history saved successfully', history);
  } catch (error) {
    next(error);
  }
};

// ================= CONTINUE WATCHING =================

const getContinueWatchingList = async (req, res, next) => {
  try {
    const list = await ContinueWatching.find({ user: req.user._id })
      .sort({ updatedAt: -1 })
      .populate('contentId');
    return sendResponse(res, 200, true, 'Continue watching list retrieved', list);
  } catch (error) {
    next(error);
  }
};

const savePlaybackPosition = async (req, res, next) => {
  try {
    const { contentType, contentId, resumePosition } = req.body;
    if (!['Movie', 'Episode'].includes(contentType) || !contentId || resumePosition === undefined) {
      return sendResponse(res, 400, false, 'Invalid params');
    }

    const position = await ContinueWatching.findOneAndUpdate(
      { user: req.user._id, contentId },
      { contentType, resumePosition, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    return sendResponse(res, 200, true, 'Playback position saved', position);
  } catch (error) {
    next(error);
  }
};

const deletePlaybackPosition = async (req, res, next) => {
  try {
    const { id } = req.params;
    await ContinueWatching.findOneAndDelete({ user: req.user._id, contentId: id });
    return sendResponse(res, 200, true, 'Playback position removed');
  } catch (error) {
    next(error);
  }
};

// ================= REVIEWS & RATINGS =================

const addReview = async (req, res, next) => {
  try {
    const { contentType, contentId, reviewText } = req.body;
    if (!['Movie', 'Series'].includes(contentType) || !contentId || !reviewText) {
      return sendResponse(res, 400, false, 'Missing review parameters');
    }

    const review = await Review.create({
      user: req.user._id,
      contentType,
      contentId,
      reviewText,
    });

    return sendResponse(res, 201, true, 'Review submitted successfully', review);
  } catch (error) {
    next(error);
  }
};

const getReviewsForContent = async (req, res, next) => {
  try {
    const { contentId } = req.params;
    const reviews = await Review.find({ contentId, isApproved: true })
      .sort({ createdAt: -1 })
      .populate('user', 'name profilePic');

    return sendResponse(res, 200, true, 'Reviews retrieved successfully', reviews);
  } catch (error) {
    next(error);
  }
};

const addRating = async (req, res, next) => {
  try {
    const { contentType, contentId, ratingValue } = req.body;
    if (!['Movie', 'Series'].includes(contentType) || !contentId || !ratingValue) {
      return sendResponse(res, 400, false, 'Missing parameters');
    }

    // Save/Update rating
    const rating = await Rating.findOneAndUpdate(
      { user: req.user._id, contentId },
      { contentType, ratingValue },
      { upsert: true, new: true }
    );

    // Calculate new average rating for target model
    const Model = contentType === 'Movie' ? Movie : Series;
    const ratings = await Rating.find({ contentId });
    const total = ratings.length;
    const avg = ratings.reduce((sum, r) => sum + r.ratingValue, 0) / total;

    await Model.findByIdAndUpdate(contentId, {
      averageRating: parseFloat(avg.toFixed(1)),
      totalRatings: total,
    });

    return sendResponse(res, 200, true, 'Rating saved successfully', rating);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
  getWatchHistory,
  addWatchHistory,
  getContinueWatchingList,
  savePlaybackPosition,
  deletePlaybackPosition,
  addReview,
  getReviewsForContent,
  addRating,
};
