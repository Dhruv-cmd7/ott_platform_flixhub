const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

// Ensure uniqueness of content items in a user's wishlist
WishlistSchema.index({ user: 1, contentId: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', WishlistSchema);
