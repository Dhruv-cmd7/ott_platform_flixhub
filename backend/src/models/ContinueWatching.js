const mongoose = require('mongoose');

const ContinueWatchingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contentType: {
      type: String,
      required: true,
      enum: ['Movie', 'Episode'],
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'contentType',
    },
    resumePosition: {
      type: Number, // in seconds
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure a user only has one resume position per content item
ContinueWatchingSchema.index({ user: 1, contentId: 1 }, { unique: true });

module.exports = mongoose.model('ContinueWatching', ContinueWatchingSchema);
