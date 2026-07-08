const mongoose = require('mongoose');

const SubscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a plan name'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    durationDays: {
      type: Number,
      required: [true, 'Please add plan duration in days'],
    },
    resolution: {
      type: String,
      enum: ['SD', 'HD', 'FHD', 'UHD/4K'],
      default: 'HD',
    },
    simultaneousScreens: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);
