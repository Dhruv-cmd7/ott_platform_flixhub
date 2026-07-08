const mongoose = require('mongoose');

const WatchHistorySchema = new mongoose.Schema(
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
    watchedDuration: {
      type: Number, // in seconds
      required: true,
    },
    watchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WatchHistory', WatchHistorySchema);
