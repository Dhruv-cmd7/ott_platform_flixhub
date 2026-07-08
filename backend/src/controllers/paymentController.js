const paymentService = require('../services/paymentService');
const Payment = require('../models/Payment');
const Coupon = require('../models/Coupon');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const { sendResponse } = require('../utils/response');

/**
 * @desc    Create Razorpay Order
 * @route   POST /api/payments/create-order
 * @access  Private
 */
const createOrder = async (req, res, next) => {
  try {
    const { planId, couponCode } = req.body;
    
    if (!planId) {
      return sendResponse(res, 400, false, 'Plan ID is required');
    }

    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.isActive) {
      return sendResponse(res, 404, false, 'Subscription plan not found or inactive');
    }

    let finalAmount = plan.price;
    let couponRecord = null;

    // Process coupon code if provided
    if (couponCode) {
      couponRecord = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (!couponRecord) {
        return sendResponse(res, 400, false, 'Invalid or expired coupon code');
      }

      if (couponRecord.expiryDate < new Date()) {
        return sendResponse(res, 400, false, 'Coupon has expired');
      }

      if (couponRecord.usesCount >= couponRecord.maxUses) {
        return sendResponse(res, 400, false, 'Coupon usage limit reached');
      }

      if (plan.price < couponRecord.minPurchaseAmount) {
        return sendResponse(
          res, 
          400, 
          false, 
          `Minimum purchase amount of INR ${couponRecord.minPurchaseAmount} required for this coupon`
        );
      }

      // Calculate discount
      if (couponRecord.discountType === 'flat') {
        finalAmount = Math.max(0, plan.price - couponRecord.discountValue);
      } else if (couponRecord.discountType === 'percentage') {
        const discount = (plan.price * couponRecord.discountValue) / 100;
        const cappedDiscount = couponRecord.maxDiscountAmount 
          ? Math.min(couponRecord.maxDiscountAmount, discount) 
          : discount;
        finalAmount = Math.max(0, plan.price - cappedDiscount);
      }
    }

    const orderData = await paymentService.createOrder(req.user._id, planId);
    
    // If discount was applied, update database record
    if (couponCode && couponRecord) {
      orderData.payment.amount = finalAmount;
      orderData.payment.couponApplied = couponRecord._id;
      await orderData.payment.save();

      // Return order with adjusted amount
      orderData.order.amount = Math.round(finalAmount * 100);
    }

    return sendResponse(res, 201, true, 'Order created successfully', {
      orderId: orderData.order.id,
      amount: orderData.order.amount,
      currency: orderData.order.currency,
      paymentId: orderData.payment._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Razorpay payment signature
 * @route   POST /api/payments/verify
 * @access  Private
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return sendResponse(res, 400, false, 'Missing payment parameters');
    }

    const verification = await paymentService.verifyPayment(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!verification.success) {
      return sendResponse(res, 400, false, verification.message);
    }

    // Increment coupon uses count if a coupon was used
    if (verification.payment.couponApplied) {
      await Coupon.findByIdAndUpdate(verification.payment.couponApplied, {
        $inc: { usesCount: 1 },
      });
    }

    return sendResponse(
      res, 
      200, 
      true, 
      verification.message, 
      { subscription: verification.subscription }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Razorpay Webhook Handler
 * @route   POST /api/payments/webhook
 * @access  Public
 */
const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    await paymentService.handleWebhook(req.body, signature);
    return res.status(200).send('ok');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get payment history
 * @route   GET /api/payments/history
 * @access  Private (Users see self, Admin sees all)
 */
const getPaymentHistory = async (req, res, next) => {
  try {
    const query = {};
    if (req.userType === 'user') {
      query.user = req.user._id;
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('plan', 'name price durationDays');

    return sendResponse(res, 200, true, 'Payment history retrieved successfully', payments);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
  getPaymentHistory,
};
