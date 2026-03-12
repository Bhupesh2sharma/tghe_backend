const express = require('express');
const { body } = require('express-validator');
const PaymentRefundPolicyTemplate = require('../models/PaymentRefundPolicyTemplate');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { ApiError } = require('../utils/errors');

const router = express.Router();

const createValidations = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('content').optional().trim(),
];

const updateValidations = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('content').optional().trim(),
];

router.get('/', async (req, res, next) => {
  try {
    const list = await PaymentRefundPolicyTemplate.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const doc = await PaymentRefundPolicyTemplate.findById(req.params.id).lean();
    if (!doc) throw new ApiError(404, 'Payment/Refund policy template not found');
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  requireAuth,
  validate(createValidations),
  async (req, res, next) => {
    try {
      const doc = await PaymentRefundPolicyTemplate.create({
        name: req.body.name.trim(),
        content: req.body.content ?? '',
      });
      res.status(201).json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:id',
  requireAuth,
  validate(updateValidations),
  async (req, res, next) => {
    try {
      const doc = await PaymentRefundPolicyTemplate.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      ).lean();
      if (!doc) throw new ApiError(404, 'Payment/Refund policy template not found');
      res.json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const doc = await PaymentRefundPolicyTemplate.findByIdAndDelete(req.params.id);
    if (!doc) throw new ApiError(404, 'Payment/Refund policy template not found');
    res.json({ success: true, message: 'Policy template deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
