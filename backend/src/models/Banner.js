const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a banner title'],
      trim: true,
    },
    description: {
      type: String,
    },
    imageUrl: {
      type: String,
      required: [true, 'Please add a banner image URL'],
    },
    linkUrl: {
      type: String, // Path like /movie/1234 or /series/5678
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', BannerSchema);
