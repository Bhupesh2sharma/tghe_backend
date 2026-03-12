const express = require('express');
const { body } = require('express-validator');
const PaymentRefundPolicy = require('../models/PaymentRefundPolicy');
const Package = require('../models/Package');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { ApiError } = require('../utils/errors');

const router = express.Router({ mergeParams: true });

const validations = [
  body('content').optional().trim(),
];

async function ensurePackage(req, res, next) {
  const packageId = req.params.packageId || req.params.id;
  const pkg = await Package.findById(packageId);
  if (!pkg) throw new ApiError(404, 'Package not found');
  req.packageId = pkg._id;
  next();
}

// Get payment & refund policy for a package (public)
router.get('/', async (req, res, next) => {
  try {
    const packageId = req.params.packageId || req.params.id;
    const doc = await PaymentRefundPolicy.findOne({ package: packageId }).lean();
    res.json({ success: true, data: doc || { package: packageId, content: '' } });
  } catch (err) {
    next(err);
  }
});

// Create or update payment & refund policy (admin) — upsert
router.put(
  '/',
  requireAuth,
  ensurePackage,
  validate(validations),
  async (req, res, next) => {
    try {
      const doc = await PaymentRefundPolicy.findOneAndUpdate(
        { package: req.packageId },
        { $set: { content: req.body.content ?? '' } },
        { new: true, upsert: true, runValidators: true }
      ).lean();
      res.json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
