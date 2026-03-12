const { validationResult } = require('express-validator');
const { ApiError } = require('../utils/errors');

function validate(validations) {
  return async (req, res, next) => {
    await Promise.all(validations.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    next(new ApiError(400, 'Validation failed', details));
  };
}

module.exports = { validate };
