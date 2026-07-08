const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525', 10),
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

/**
 * Send an email
 */
const sendEmail = async ({ to, subject, htmlText }) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@ottplatform.com',
    to,
    subject,
    html: htmlText,
  };

  try {
    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'mockuser') {
      logger.info(`[Email Mock Service] To: ${to} | Subject: ${subject}`);
      logger.debug(`[Email Mock Service] HTML: ${htmlText}`);
      return { message: 'Mock email sent successfully' };
    }

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Nodemailer Error: %s', error.message);
    // Do not throw error to let user sign up/recover password successfully during mock/dev stages
    return null;
  }
};

/**
 * Send Forgot Password verification email
 */
const sendForgotPasswordEmail = async (to, resetUrl) => {
  const htmlText = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #e50914; text-align: center;">Reset Your Password</h2>
      <p>Hello,</p>
      <p>You are receiving this email because you (or someone else) have requested the reset of a password for your account.</p>
      <p>Please click on the following link, or paste it into your browser to complete the process within 10 minutes:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #e50914; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
      </div>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999; text-align: center;">OTT Platform Support Team</p>
    </div>
  `;
  return sendEmail({ to, subject: 'Password Reset Request', htmlText });
};

module.exports = {
  sendEmail,
  sendForgotPasswordEmail,
};
