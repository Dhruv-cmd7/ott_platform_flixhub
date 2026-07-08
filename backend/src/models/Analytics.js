const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
      default: () => new Date().setHours(0, 0, 0, 0),
    },
    totalUsers: {
      type: Number,
      default: 0,
    },
    activeUsers: {
      type: Number,
      default: 0,
    },
    premiumUsers: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
    watchTime: {
      type: Number, // in minutes
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analytics', AnalyticsSchema);
