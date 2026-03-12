const express = require('express');
const { body } = require('express-validator');
const InclusionExclusionSet = require('../models/InclusionExclusionSet');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { ApiError } = require('../utils/errors');

const router = express.Router();

const createValidations = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('items').optional().isArray(),
  body('items.*.type').isIn(['inclusion', 'exclusion']),
  body('items.*.text').trim().notEmpty(),
  body('items.*.order').optional().isInt({ min: 0 }),
];

const updateValidations = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('items').optional().isArray(),
  body('items.*.type').optional().isIn(['inclusion', 'exclusion']),
  body('items.*.text').optional().trim().notEmpty(),
  body('items.*.order').optional().isInt({ min: 0 }),
];

router.get('/', async (req, res, next) => {
  try {
    const list = await InclusionExclusionSet.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const doc = await InclusionExclusionSet.findById(req.params.id).lean();
    if (!doc) throw new ApiError(404, 'Inclusion/Exclusion set not found');
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
      const { name, items = [] } = req.body;
      const doc = await InclusionExclusionSet.create({ name: name.trim(), items });
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
      const doc = await InclusionExclusionSet.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      ).lean();
      if (!doc) throw new ApiError(404, 'Inclusion/Exclusion set not found');
      res.json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const doc = await InclusionExclusionSet.findByIdAndDelete(req.params.id);
    if (!doc) throw new ApiError(404, 'Inclusion/Exclusion set not found');
    res.json({ success: true, message: 'Inclusion/Exclusion set deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
