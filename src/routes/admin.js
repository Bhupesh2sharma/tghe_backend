const express = require('express');
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimit');
const { ApiError } = require('../utils/errors');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const registerValidations = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
    .trim(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[A-Za-z]/)
    .withMessage('Password must contain at least one letter'),
];

const loginValidations = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail().trim(),
  body('password').notEmpty().withMessage('Password is required'),
];

function signToken(admin) {
  return jwt.sign(
    { sub: admin._id.toString(), role: 'admin' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

router.post(
  '/register',
  authLimiter,
  validate(registerValidations),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const existing = await Admin.findOne({ email });
      if (existing) {
        throw new ApiError(409, 'An admin with this email already exists');
      }
      const admin = new Admin({ email, passwordHash: password });
      await admin.save();
      const token = signToken(admin);
      res.status(201).json({
        success: true,
        message: 'Admin registered',
        data: { admin: admin.toJSON(), token },
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/login',
  authLimiter,
  validate(loginValidations),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const admin = await Admin.findOne({ email }).select('+passwordHash');
      const valid = admin && (await admin.comparePassword(password));
      if (!valid) {
        throw new ApiError(401, 'Invalid email or password');
      }
      const token = signToken(admin);
      res.json({
        success: true,
        data: { admin: admin.toJSON(), token },
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
