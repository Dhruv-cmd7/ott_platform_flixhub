const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contentType: {
      type: String,
      required: true,
      enum: ['Movie', 'Series'],
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'contentType',
    },
    ratingValue: {
      type: Number,
      required: [true, 'Please add a rating value between 1 and 5'],
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

// Compounded index: A user can only rate a specific content once
RatingSchema.index({ user: 1, contentId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', RatingSchema);
