const express = require('express');
const { body } = require('express-validator');
const InclusionExclusion = require('../models/InclusionExclusion');
const Package = require('../models/Package');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { ApiError } = require('../utils/errors');

const router = express.Router({ mergeParams: true });

const createValidations = [
  body('type').isIn(['inclusion', 'exclusion']).withMessage('type must be inclusion or exclusion'),
  body('text').trim().notEmpty().withMessage('Text is required'),
  body('order').optional().isInt({ min: 0 }),
];

const updateValidations = [
  body('type').optional().isIn(['inclusion', 'exclusion']).withMessage('type must be inclusion or exclusion'),
  body('text').optional().trim().notEmpty().withMessage('Text cannot be empty'),
  body('order').optional().isInt({ min: 0 }),
];

async function ensurePackage(req, res, next) {
  const packageId = req.params.packageId || req.params.id;
  const pkg = await Package.findById(packageId);
  if (!pkg) throw new ApiError(404, 'Package not found');
  req.packageId = pkg._id;
  next();
}

// List inclusion/exclusion for a package (public)
router.get('/', async (req, res, next) => {
  try {
    const packageId = req.params.packageId || req.params.id;
    const list = await InclusionExclusion.find({ package: packageId })
      .sort({ type: 1, order: 1 })
      .lean();
    const data = {
      inclusions: list.filter((i) => i.type === 'inclusion'),
      exclusions: list.filter((i) => i.type === 'exclusion'),
    };
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// Create inclusion/exclusion item (admin)
router.post(
  '/',
  requireAuth,
  ensurePackage,
  validate(createValidations),
  async (req, res, next) => {
    try {
      const item = await InclusionExclusion.create({
        package: req.packageId,
        type: req.body.type,
        text: req.body.text,
        order: req.body.order ?? 0,
      });
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }
);

// Update inclusion/exclusion item (admin)
router.patch(
  '/:itemId',
  requireAuth,
  validate(updateValidations),
  async (req, res, next) => {
    try {
      const packageId = req.params.packageId || req.params.id;
      const item = await InclusionExclusion.findOneAndUpdate(
        { _id: req.params.itemId, package: packageId },
        { $set: req.body },
        { new: true, runValidators: true }
      ).lean();
      if (!item) throw new ApiError(404, 'Inclusion/Exclusion item not found');
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }
);

// Delete inclusion/exclusion item (admin)
router.delete('/:itemId', requireAuth, async (req, res, next) => {
  try {
    const packageId = req.params.packageId || req.params.id;
    const item = await InclusionExclusion.findOneAndDelete({
      _id: req.params.itemId,
      package: packageId,
    });
    if (!item) throw new ApiError(404, 'Inclusion/Exclusion item not found');
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
