const { body } = require('express-validator');

const movieValidator = [
  body('title').notEmpty().withMessage('Movie title is required').trim(),
  body('description').notEmpty().withMessage('Description is required').trim(),
  body('duration').isNumeric().withMessage('Duration must be a number representing minutes'),
  body('releaseYear').isNumeric().withMessage('Release year must be a valid number'),
];

const seriesValidator = [
  body('title').notEmpty().withMessage('Series title is required').trim(),
  body('description').notEmpty().withMessage('Description is required').trim(),
  body('releaseYear').isNumeric().withMessage('Release year must be a valid number'),
];

const episodeValidator = [
  body('series').isMongoId().withMessage('Invalid Series ID'),
  body('seasonNumber').isNumeric().withMessage('Season number must be a number'),
  body('episodeNumber').isNumeric().withMessage('Episode number must be a number'),
  body('title').notEmpty().withMessage('Episode title is required').trim(),
  body('duration').isNumeric().withMessage('Duration must be a number representing minutes'),
];

const planValidator = [
  body('name').notEmpty().withMessage('Plan name is required').trim(),
  body('description').notEmpty().withMessage('Description is required').trim(),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('durationDays').isNumeric().withMessage('Duration in days must be a number'),
];

const couponValidator = [
  body('code').notEmpty().withMessage('Coupon code is required').trim().toUpperCase(),
  body('discountType').isIn(['flat', 'percentage']).withMessage('Discount type must be flat or percentage'),
  body('discountValue').isNumeric().withMessage('Discount value must be a number'),
  body('expiryDate').isISO8601().withMessage('Expiry date must be a valid ISO8601 date'),
];

module.exports = {
  movieValidator,
  seriesValidator,
  episodeValidator,
  planValidator,
  couponValidator,
};
