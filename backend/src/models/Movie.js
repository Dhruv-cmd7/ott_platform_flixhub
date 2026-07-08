const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a movie title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    thumbnailUrl: {
      type: String,
      required: [true, 'Please add a thumbnail URL'],
    },
    bannerUrl: {
      type: String,
      required: [true, 'Please add a banner URL'],
    },
    trailerUrl: {
      type: String,
    },
    videoUrl: {
      type: String,
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Please add duration in minutes'],
    },
    releaseYear: {
      type: Number,
      required: [true, 'Please add a release year'],
    },
    ageRating: {
      type: String,
      default: 'PG-13',
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
      },
    ],
    genres: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre',
        required: true,
      },
    ],
    languages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Language',
        required: true,
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movie', MovieSchema);
