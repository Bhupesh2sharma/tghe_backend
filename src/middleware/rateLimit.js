const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many attempts. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter };
