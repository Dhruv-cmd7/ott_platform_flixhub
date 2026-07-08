const Coupon = require('../models/Coupon');
const AuditLog = require('../models/AuditLog');
const { sendResponse } = require('../utils/response');

const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return sendResponse(res, 200, true, 'Coupons retrieved successfully', coupons);
  } catch (error) {
    next(error);
  }
};

const createCoupon = async (req, res, next) => {
  try {
    const { code, discountType, discountValue, minPurchaseAmount, maxDiscountAmount, expiryDate, maxUses } = req.body;
    
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minPurchaseAmount,
      maxDiscountAmount,
      expiryDate,
      maxUses,
    });

    await AuditLog.create({
      admin: req.user._id,
      action: 'Create Coupon',
      details: `Created coupon code: "${code.toUpperCase()}"`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendResponse(res, 201, true, 'Coupon created successfully', coupon);
  } catch (error) {
    next(error);
  }
};

const updateCoupon = async (req, res, next) => {
  try {
    const updateFields = { ...req.body };
    if (updateFields.code) {
      updateFields.code = updateFields.code.toUpperCase();
    }

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!coupon) return sendResponse(res, 404, false, 'Coupon not found');

    await AuditLog.create({
      admin: req.user._id,
      action: 'Update Coupon',
      details: `Updated coupon code ID: ${coupon._id} ("${coupon.code}")`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendResponse(res, 200, true, 'Coupon updated successfully', coupon);
  } catch (error) {
    next(error);
  }
};

const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return sendResponse(res, 404, false, 'Coupon not found');

    await AuditLog.create({
      admin: req.user._id,
      action: 'Delete Coupon',
      details: `Deleted coupon ID: ${coupon._id} ("${coupon.code}")`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendResponse(res, 200, true, 'Coupon deleted successfully');
  } catch (error) {
    next(error);
  }
};

const validateCoupon = async (req, res, next) => {
  try {
    const { code, purchaseAmount } = req.body;
    if (!code) {
      return sendResponse(res, 400, false, 'Coupon code is required');
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return sendResponse(res, 404, false, 'Coupon code is invalid or expired');
    }

    if (coupon.expiryDate < new Date()) {
      return sendResponse(res, 400, false, 'Coupon has expired');
    }

    if (coupon.usesCount >= coupon.maxUses) {
      return sendResponse(res, 400, false, 'Coupon usage limit has been reached');
    }

    if (purchaseAmount && purchaseAmount < coupon.minPurchaseAmount) {
      return sendResponse(
        res,
        400,
        false,
        `Minimum purchase of INR ${coupon.minPurchaseAmount} is required to apply this coupon`
      );
    }

    return sendResponse(res, 200, true, 'Coupon is valid', {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscountAmount: coupon.maxDiscountAmount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
};
