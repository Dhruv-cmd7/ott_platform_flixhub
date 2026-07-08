const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-order', protect, paymentController.createOrder);
router.post('/verify', protect, paymentController.verifyPayment);
router.post('/webhook', paymentController.handleWebhook);
router.get('/history', protect, paymentController.getPaymentHistory);

module.exports = router;
