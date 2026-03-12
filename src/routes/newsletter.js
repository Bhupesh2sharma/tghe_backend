const express = require('express');
const { body } = require('express-validator');
const Newsletter = require('../models/Newsletter');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { ApiError } = require('../utils/errors');
const { createNotification } = require('../services/notifications');

const router = express.Router();

const subscribeValidations = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
    .trim(),
];

// Public: subscribe (save email)
router.post(
  '/',
  validate(subscribeValidations),
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const existing = await Newsletter.findOne({ email });
      if (existing) {
        return res.json({
          success: true,
          message: 'Already subscribed',
          data: { email: existing.email },
        });
      }
      const subscriber = await Newsletter.create({ email });
      await createNotification(
        'newsletter',
        'New newsletter subscription',
        subscriber.email,
        '/newsletter',
        subscriber._id
      );
      res.status(201).json({
        success: true,
        message: 'Subscribed successfully',
        data: { email: subscriber.email },
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.json({
          success: true,
          message: 'Already subscribed',
          data: { email: req.body.email },
        });
      }
      next(err);
    }
  }
);

// Admin: list all newsletter emails
router.get(
  '/',
  requireAuth,
  async (req, res, next) => {
    try {
      const list = await Newsletter.find()
        .sort({ createdAt: -1 })
        .select('email createdAt')
        .lean();
      res.json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
