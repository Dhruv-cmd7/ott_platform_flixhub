const mongoose = require('mongoose');

const EpisodeSchema = new mongoose.Schema(
  {
    series: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Series',
      required: [true, 'Please add a series reference'],
    },
    seasonNumber: {
      type: Number,
      required: [true, 'Please add a season number'],
    },
    episodeNumber: {
      type: Number,
      required: [true, 'Please add an episode number'],
    },
    title: {
      type: String,
      required: [true, 'Please add an episode title'],
      trim: true,
    },
    description: {
      type: String,
    },
    thumbnailUrl: {
      type: String,
    },
    videoUrl: {
      type: String,
      required: [true, 'Please add a video URL'],
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Please add duration in minutes'],
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness of season/episode in a series
EpisodeSchema.index({ series: 1, seasonNumber: 1, episodeNumber: 1 }, { unique: true });

module.exports = mongoose.model('Episode', EpisodeSchema);
