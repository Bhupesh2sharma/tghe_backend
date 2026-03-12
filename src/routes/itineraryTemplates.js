const express = require('express');
const { body } = require('express-validator');
const ItineraryTemplate = require('../models/ItineraryTemplate');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { ApiError } = require('../utils/errors');

const router = express.Router();

const createValidations = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('days').optional().isArray(),
  body('days.*.dayNumber').isInt({ min: 1 }),
  body('days.*.title').trim().notEmpty(),
  body('days.*.description').optional().trim(),
];

const updateValidations = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('days').optional().isArray(),
  body('days.*.dayNumber').optional().isInt({ min: 1 }),
  body('days.*.title').optional().trim().notEmpty(),
  body('days.*.description').optional().trim(),
];

router.get('/', async (req, res, next) => {
  try {
    const list = await ItineraryTemplate.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const doc = await ItineraryTemplate.findById(req.params.id).lean();
    if (!doc) throw new ApiError(404, 'Itinerary template not found');
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
      const { name, days = [] } = req.body;
      const sorted = [...days].sort((a, b) => (a.dayNumber || 0) - (b.dayNumber || 0));
      const doc = await ItineraryTemplate.create({ name: name.trim(), days: sorted });
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
      const updates = { ...req.body };
      if (updates.days) {
        updates.days = [...updates.days].sort((a, b) => (a.dayNumber || 0) - (b.dayNumber || 0));
      }
      const doc = await ItineraryTemplate.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
      ).lean();
      if (!doc) throw new ApiError(404, 'Itinerary template not found');
      res.json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const doc = await ItineraryTemplate.findByIdAndDelete(req.params.id);
    if (!doc) throw new ApiError(404, 'Itinerary template not found');
    res.json({ success: true, message: 'Itinerary template deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
