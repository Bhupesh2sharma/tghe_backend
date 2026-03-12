const express = require('express');
const { body } = require('express-validator');
const Itinerary = require('../models/Itinerary');
const Package = require('../models/Package');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { ApiError } = require('../utils/errors');

const router = express.Router({ mergeParams: true });

const createValidations = [
  body('dayNumber').isInt({ min: 1 }).withMessage('dayNumber must be a positive integer'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
];

const updateValidations = [
  body('dayNumber').optional().isInt({ min: 1 }).withMessage('dayNumber must be a positive integer'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim(),
];

async function ensurePackage(req, res, next) {
  const packageId = req.params.packageId || req.params.id;
  const pkg = await Package.findById(packageId);
  if (!pkg) throw new ApiError(404, 'Package not found');
  req.packageId = pkg._id;
  next();
}

// List itinerary for a package (public)
router.get('/', async (req, res, next) => {
  try {
    const packageId = req.params.packageId || req.params.id;
    const list = await Itinerary.find({ package: packageId })
      .sort({ dayNumber: 1 })
      .lean();
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

// Create itinerary item (admin)
router.post(
  '/',
  requireAuth,
  ensurePackage,
  validate(createValidations),
  async (req, res, next) => {
    try {
      const item = await Itinerary.create({
        package: req.packageId,
        dayNumber: req.body.dayNumber,
        title: req.body.title,
        description: req.body.description ?? '',
      });
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }
);

// Update itinerary item (admin)
router.patch(
  '/:itineraryId',
  requireAuth,
  validate(updateValidations),
  async (req, res, next) => {
    try {
      const packageId = req.params.packageId || req.params.id;
      const item = await Itinerary.findOneAndUpdate(
        { _id: req.params.itineraryId, package: packageId },
        { $set: req.body },
        { new: true, runValidators: true }
      ).lean();
      if (!item) throw new ApiError(404, 'Itinerary item not found');
      res.json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  }
);

// Delete itinerary item (admin)
router.delete('/:itineraryId', requireAuth, async (req, res, next) => {
  try {
    const packageId = req.params.packageId || req.params.id;
    const item = await Itinerary.findOneAndDelete({
      _id: req.params.itineraryId,
      package: packageId,
    });
    if (!item) throw new ApiError(404, 'Itinerary item not found');
    res.json({ success: true, message: 'Itinerary item deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
