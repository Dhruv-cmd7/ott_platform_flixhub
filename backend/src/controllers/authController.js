const crypto = require('crypto');
const User = require('../models/User');
const Admin = require('../models/Admin');
const AuditLog = require('../models/AuditLog');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const { sendForgotPasswordEmail } = require('../services/mailService');
const { sendResponse } = require('../utils/response');
const jwt = require('jsonwebtoken');

// Helper to configure cookies for tokens
const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendResponse(res, 400, false, 'User already exists');
    }

    const user = await User.create({ name, email, password });

    const accessToken = generateAccessToken({ id: user._id, type: 'user', role: 'user' });
    const refreshToken = generateRefreshToken({ id: user._id, type: 'user', role: 'user' });

    user.refreshToken = refreshToken;
    await user.save();

    setRefreshTokenCookie(res, refreshToken);

    return sendResponse(res, 201, true, 'User registered successfully', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        activeSubscription: user.activeSubscription,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log in user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return sendResponse(res, 401, false, 'Invalid email or password');
    }

    if (user.status !== 'active') {
      return sendResponse(res, 403, false, 'Account has been suspended');
    }

    const accessToken = generateAccessToken({ id: user._id, type: 'user', role: 'user' });
    const refreshToken = generateRefreshToken({ id: user._id, type: 'user', role: 'user' });

    user.refreshToken = refreshToken;
    await user.save();

    setRefreshTokenCookie(res, refreshToken);

    return sendResponse(res, 200, true, 'Logged in successfully', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        activeSubscription: user.activeSubscription,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log out user / Admin
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      if (req.userType === 'admin') {
        await Admin.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
      } else {
        await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
      }
    }

    res.clearCookie('refreshToken');
    return sendResponse(res, 200, true, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh user Access Token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refreshUserToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      return sendResponse(res, 401, false, 'No refresh token supplied');
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_123');
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      return sendResponse(401, false, 'Invalid refresh token');
    }

    const accessToken = generateAccessToken({ id: user._id, type: 'user', role: 'user' });
    return sendResponse(res, 200, true, 'Token refreshed successfully', { accessToken });
  } catch (error) {
    return sendResponse(res, 401, false, 'Invalid or expired refresh token');
  }
};

/**
 * @desc    Request forgot password email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return sendResponse(res, 404, false, 'User not found with this email');
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

    await sendForgotPasswordEmail(user.email, resetUrl);

    return sendResponse(res, 200, true, 'Password reset email sent');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password/:resetToken
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return sendResponse(res, 400, false, 'Invalid or expired reset token');
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return sendResponse(res, 200, true, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const accountModel = req.userType === 'admin' ? Admin : User;
    const account = await accountModel.findById(req.user._id).select('+password');

    if (!(await account.matchPassword(oldPassword))) {
      return sendResponse(res, 400, false, 'Incorrect current password');
    }

    account.password = newPassword;
    await account.save();

    return sendResponse(res, 200, true, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

// ================= ADMIN AUTH CONTROLLERS =================

/**
 * @desc    Register a new admin (Super Admin only)
 * @route   POST /api/auth/admin/register
 * @access  Private (Super Admin)
 */
const registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return sendResponse(res, 400, false, 'Admin account already exists');
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || 'Admin',
    });

    // Audit log
    await AuditLog.create({
      admin: req.user._id,
      action: 'Create Admin',
      details: `Created new admin: ${admin.email} with role: ${admin.role}`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendResponse(res, 201, true, 'Admin account created successfully', {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log in admin
 * @route   POST /api/auth/admin/login
 * @access  Public
 */
const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin || !(await admin.matchPassword(password))) {
      return sendResponse(res, 401, false, 'Invalid email or password');
    }

    if (admin.status !== 'active') {
      return sendResponse(res, 403, false, 'Admin account is suspended');
    }

    const accessToken = generateAccessToken({ id: admin._id, type: 'admin', role: admin.role });
    const refreshToken = generateRefreshToken({ id: admin._id, type: 'admin', role: admin.role });

    admin.refreshToken = refreshToken;
    await admin.save();

    setRefreshTokenCookie(res, refreshToken);

    // Audit log
    await AuditLog.create({
      admin: admin._id,
      action: 'Login',
      details: 'Administrator logged in successfully',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    return sendResponse(res, 200, true, 'Admin logged in successfully', {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh admin Access Token
 * @route   POST /api/auth/admin/refresh
 * @access  Public
 */
const refreshAdminToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      return sendResponse(res, 401, false, 'No refresh token supplied');
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_123');
    const admin = await Admin.findById(decoded.id).select('+refreshToken');

    if (!admin || admin.refreshToken !== token) {
      return sendResponse(res, 401, false, 'Invalid refresh token');
    }

    const accessToken = generateAccessToken({ id: admin._id, type: 'admin', role: admin.role });
    return sendResponse(res, 200, true, 'Admin token refreshed successfully', { accessToken });
  } catch (error) {
    return sendResponse(res, 401, false, 'Invalid or expired refresh token');
  }
};

/**
 * @desc    Get current user/admin profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    if (req.userType === 'admin') {
      return sendResponse(res, 200, true, 'Admin profile fetched successfully', {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        status: req.user.status,
        type: 'admin',
      });
    } else {
      return sendResponse(res, 200, true, 'User profile fetched successfully', {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        status: req.user.status,
        activeSubscription: req.user.activeSubscription,
        type: 'user',
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Google Sign-In / Login
 * @route   POST /api/auth/google-login
 * @access  Public
 */
const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return sendResponse(res, 400, false, 'ID Token is required');
    }

    // Verify Google ID Token via Google API (native fetch)
    const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
    const googleRes = await fetch(verifyUrl);
    const googleData = await googleRes.json();

    if (!googleRes.ok || googleData.error || !googleData.email) {
      return sendResponse(res, 400, false, googleData.error_description || 'Invalid Google ID token');
    }

    const { email, name } = googleData;

    // Check if the email matches the designated admin email
    const isAdminEmail = email.toLowerCase() === 'dhruvsoni930@gmail.com';

    if (isAdminEmail) {
      // Find or create the Admin account
      let admin = await Admin.findOne({ email: email.toLowerCase() });
      if (!admin) {
        admin = await Admin.create({
          name: name || 'Dhruv Soni',
          email: email.toLowerCase(),
          password: crypto.randomBytes(16).toString('hex'), // generate safe random password
          role: 'Super Admin',
          status: 'active',
        });
      }

      const accessToken = generateAccessToken({ id: admin._id, type: 'admin', role: admin.role });
      const refreshToken = generateRefreshToken({ id: admin._id, type: 'admin', role: admin.role });

      admin.refreshToken = refreshToken;
      await admin.save();

      setRefreshTokenCookie(res, refreshToken);

      // Audit log
      await AuditLog.create({
        admin: admin._id,
        action: 'Google Login',
        details: 'Admin logged in via Google Sign-In',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      return sendResponse(res, 200, true, 'Admin logged in successfully', {
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          status: admin.status,
        },
        accessToken,
      });
    } else {
      return sendResponse(res, 403, false, 'Access Denied: Only authorized administrators can log in');
    }
  } catch (error) {
    console.error('Google verification error:', error);
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logout,
  refreshUserToken,
  forgotPassword,
  resetPassword,
  changePassword,
  registerAdmin,
  loginAdmin,
  refreshAdminToken,
  getProfile,
  googleLogin,
};
