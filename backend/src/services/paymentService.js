const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const User = require('../models/User');
const logger = require('../utils/logger');

// Initialize Razorpay
const isRazorpayConfigured = 
  process.env.RAZORPAY_KEY_ID && 
  process.env.RAZORPAY_KEY_SECRET &&
  process.env.RAZORPAY_KEY_ID !== 'rzp_test_yourkeyid';

let razorpay = null;
if (isRazorpayConfigured) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  logger.info('Razorpay initialized successfully.');
} else {
  logger.warn('Razorpay keys missing or default. Payment service will operate in MOCK mode.');
}

/**
 * Create a new Razorpay order
 */
const createOrder = async (userId, planId, couponCode = null) => {
  const plan = await SubscriptionPlan.findById(planId);
  if (!plan || !plan.isActive) {
    throw new Error('Subscription plan not found or inactive');
  }

  let finalAmount = plan.price;
  // Apply coupon calculations if any (coupons handled in coupon route/controller)

  // Razorpay expects amount in paise (1 INR = 100 paise)
  const amountInPaise = Math.round(finalAmount * 100);

  let razorpayOrder = null;
  const orderId = isRazorpayConfigured ? null : 'order_mock_' + crypto.randomBytes(8).toString('hex');

  if (isRazorpayConfigured) {
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_plan_${planId.toString().substring(0, 10)}`,
    };
    razorpayOrder = await razorpay.orders.create(options);
  } else {
    // Generate mock Razorpay order
    razorpayOrder = {
      id: orderId,
      entity: 'order',
      amount: amountInPaise,
      amount_paid: 0,
      amount_due: amountInPaise,
      currency: 'INR',
      receipt: `receipt_plan_${planId.toString().substring(0, 10)}`,
      status: 'created',
      created_at: Math.floor(Date.now() / 1000),
    };
  }

  // Create payment record in database with status 'created'
  const payment = await Payment.create({
    user: userId,
    plan: planId,
    amount: finalAmount,
    razorpayOrderId: razorpayOrder.id,
    status: 'created',
  });

  return {
    order: razorpayOrder,
    payment,
  };
};

/**
 * Verify Razorpay payment signature and activate subscription
 */
const verifyPayment = async (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  // Find payment record
  const payment = await Payment.findOne({ razorpayOrderId }).populate('plan');
  if (!payment) {
    throw new Error('Payment record not found for this order ID');
  }

  let isVerified = false;

  if (isRazorpayConfigured) {
    const text = razorpayOrderId + '|' + razorpayPaymentId;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    isVerified = generatedSignature === razorpaySignature;
  } else {
    // In mock mode, verify any signature that is non-empty
    isVerified = !!razorpaySignature;
  }

  if (!isVerified) {
    payment.status = 'failed';
    await payment.save();
    return { success: false, message: 'Invalid payment signature' };
  }

  // Update payment status
  payment.status = 'captured';
  payment.razorpayPaymentId = razorpayPaymentId;
  payment.razorpaySignature = razorpaySignature;
  await payment.save();

  // Create subscription
  const plan = payment.plan;
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + plan.durationDays);

  const subscription = await Subscription.create({
    user: payment.user,
    plan: plan._id,
    payment: payment._id,
    startDate,
    endDate,
    status: 'active',
  });

  // Link user profile to active subscription
  await User.findByIdAndUpdate(payment.user, {
    activeSubscription: subscription._id,
  });

  logger.info(`Subscription activated for user: ${payment.user} with subscription ID: ${subscription._id}`);

  return {
    success: true,
    message: 'Payment verified and subscription activated successfully',
    subscription,
    payment,
  };
};

/**
 * Webhook handler for async events
 */
const handleWebhook = async (body, signature) => {
  // Verify webhook signature (if enabled)
  if (isRazorpayConfigured && process.env.RAZORPAY_WEBHOOK_SECRET) {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(body))
      .digest('hex');
      
    if (expectedSignature !== signature) {
      logger.error('Invalid Razorpay webhook signature');
      throw new Error('Invalid signature');
    }
  }

  const event = body.event;
  logger.info(`Processing Razorpay webhook event: ${event}`);

  if (event === 'payment.captured') {
    const paymentEntity = body.payload.payment.entity;
    const razorpayOrderId = paymentEntity.order_id;
    const razorpayPaymentId = paymentEntity.id;

    // Run verification / capture logic if not already done
    const payment = await Payment.findOne({ razorpayOrderId });
    if (payment && payment.status === 'created') {
      await verifyPayment(razorpayOrderId, razorpayPaymentId, 'webhook_verified');
    }
  }

  return { received: true };
};

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
};
