const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please add a coupon code'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    discountType: {
      type: String,
      enum: ['flat', 'percentage'],
      required: [true, 'Please add discount type (flat or percentage)'],
    },
    discountValue: {
      type: Number,
      required: [true, 'Please add discount value'],
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
    },
    maxDiscountAmount: {
      type: Number,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please add expiry date'],
    },
    maxUses: {
      type: Number,
      default: 100,
    },
    usesCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', CouponSchema);
