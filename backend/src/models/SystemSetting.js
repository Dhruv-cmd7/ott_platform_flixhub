const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema(
  {
    // === General Configuration ===
    siteName: { type: String, default: 'FLIXHub OTT' },
    supportEmail: { type: String, default: 'support@flixhub.com' },
    siteLogoUrl: { type: String, default: '' },
    sessionExpire: { type: String, default: '30d' },
    maintenanceMode: { type: Boolean, default: false },
    allowRegistration: { type: Boolean, default: true },
    defaultLanguage: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },

    // === Media & Player Configuration ===
    videoCDN: { type: String, default: 'https://cdn.flixhub.com/streams/' },
    hlsEnabled: { type: Boolean, default: true },
    maxStreamQuality: { type: String, default: '4K' },
    defaultPlayerTheme: { type: String, default: 'dark' },
    autoplayEnabled: { type: Boolean, default: true },
    subtitleEnabled: { type: Boolean, default: true },
    watermarkEnabled: { type: Boolean, default: false },
    watermarkText: { type: String, default: '' },
    maxConcurrentStreams: { type: Number, default: 3 },

    // === Payment Gateway (Razorpay) ===
    paymentGateway: { type: String, default: 'razorpay', enum: ['razorpay', 'stripe', 'paypal'] },
    razorpayKeyId: { type: String, default: '' },
    razorpayKeySecret: { type: String, default: '' },
    razorpayWebhookSecret: { type: String, default: '' },
    currency: { type: String, default: 'INR' },
    trialDays: { type: Number, default: 7 },
    refundPolicy: { type: String, default: '7-day' },
    taxPercentage: { type: Number, default: 18 },
    testMode: { type: Boolean, default: true },

    // === SMTP Mail Settings ===
    smtpHost: { type: String, default: '' },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String, default: '' },
    smtpPass: { type: String, default: '' },
    smtpSecure: { type: Boolean, default: false },
    emailFromName: { type: String, default: 'FLIXHub Support' },
    emailFromAddress: { type: String, default: 'noreply@flixhub.com' },
    emailFooterText: { type: String, default: '© 2025 FLIXHub. All rights reserved.' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
