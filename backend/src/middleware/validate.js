const { validationResult } = require('express-validator');
const { sendResponse } = require('../utils/response');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map((err) => err.msg).join(', ');
    return sendResponse(res, 400, false, errorMsg, { errors: errors.array() });
  }
  next();
};

module.exports = validate;
