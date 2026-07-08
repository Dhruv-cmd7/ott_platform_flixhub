const dotenv = require('dotenv');
// Load environment variables before importing other modules
dotenv.config();

const app = require('./app');
const logger = require('./utils/logger');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    logger.info('Connected to MongoDB database successfully.');

    // Start Express Server
    const server = app.listen(PORT, () => {
      logger.info(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
    });

    // Handle server shutdown signals
    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Promise Rejection: %s', err.message);
      // Close server & exit process
      server.close(() => process.exit(1));
    });
  } catch (err) {
    logger.error('Database connection failed: %s', err.message);
    process.exit(1);
  }
};

startServer();


