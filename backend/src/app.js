const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

// Configs
const swaggerSpecs = require('./docs/swagger');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const seriesRoutes = require('./routes/seriesRoutes');
const episodeRoutes = require('./routes/episodeRoutes');
const metadataRoutes = require('./routes/metadataRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const couponRoutes = require('./routes/couponRoutes');
const userActionRoutes = require('./routes/userActionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const settingRoutes = require('./routes/settingRoutes');

const app = express();

// ================= GLOBAL MIDDLEWARES =================

// Secure HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Turn off CSP for development and video streaming support
    crossOriginResourcePolicy: false,
  })
);

// Enable CORS with support for credentials (cookies)
app.use(
  cors({
    origin: true, // Allow all origins for dev simplicity, or specify client origin in prod
    credentials: true,
  })
);

// Logging HTTP requests
app.use(morgan('dev'));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser for refresh/access tokens
app.use(cookieParser());

// Database connection middleware guard (serverless-friendly)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database unavailable',
      error: error.message,
    });
  }
});

// Rate Limiter
app.use('/api', apiLimiter);

// Serve static upload files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger UI Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// ================= API ROUTES =================
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/episodes', episodeRoutes);
app.use('/api/metadata', metadataRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/interactions', userActionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingRoutes);

// Root route redirect to docs
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// ================= ERROR HANDLING =================
app.use(errorHandler);

module.exports = app;
