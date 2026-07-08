const logger = require('../utils/logger');
const { sendResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for developers
  logger.error('Error caught in middleware: %s', err.stack || err.message);

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    return sendResponse(res, 404, false, message);
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value entered for ${field} field. Value must be unique.`;
    return sendResponse(res, 400, false, message);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    return sendResponse(res, 400, false, message);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return sendResponse(res, 401, false, 'Invalid security token');
  }

  if (err.name === 'TokenExpiredError') {
    return sendResponse(res, 401, false, 'Security token expired');
  }

  // Default server error
  return sendResponse(
    res,
    error.statusCode || 500,
    false,
    error.message || 'Internal Server Error',
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
};

module.exports = errorHandler;
