const express = require('express');
const { body } = require('express-validator');
const mongoose = require('mongoose');
const Package = require('../models/Package');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { optionalImageAndImagesUpload } = require('../middleware/optionalImageUpload');
const { ApiError } = require('../utils/errors');

const router = express.Router();

const createValidations = [
  body('name').trim().notEmpty().withMessage('Package name is required'),
  body('title').optional().trim(),
  body('duration').optional().trim(),
  body('durationDescription').optional().trim(),
  body('description').optional().trim(),
  body('image').optional().trim(),
  body('images').optional().isArray().withMessage('images must be an array'),
  body('images.*').optional().isString().trim(),
  body('itineraryTemplateId').optional().isMongoId(),
  body('inclusionExclusionSetId').optional().isMongoId(),
  body('paymentRefundPolicyTemplateId').optional().isMongoId(),
  body('termsConditionTemplateId').optional().isMongoId(),
];

const assignValidations = [
  body('categoryIds')
    .optional()
    .isArray()
    .withMessage('categoryIds must be an array'),
  body('categoryIds.*')
    .isMongoId()
    .withMessage('Each categoryId must be a valid ID'),
  body('destinationIds')
    .optional()
    .isArray()
    .withMessage('destinationIds must be an array'),
  body('destinationIds.*')
    .isMongoId()
    .withMessage('Each destinationId must be a valid ID'),
];

function normalizeImages(body) {
  if (body.images === undefined) return body;
  if (typeof body.images === 'string') {
    try {
      body.images = JSON.parse(body.images);
    } catch {
      body.images = body.images ? [body.images] : [];
    }
  }
  if (Array.isArray(body.images)) body.images = body.images.filter(Boolean).slice(0, 20);
  return body;
}

// Step 1: Create package (no categories/destinations yet). Accepts JSON or multipart with optional image/images.
router.post(
  '/',
  requireAuth,
  optionalImageAndImagesUpload,
  validate(createValidations),
  async (req, res, next) => {
    try {
      const body = normalizeImages({ ...req.body });
      const pkg = await Package.create({
        name: body.name,
        title: body.title ?? '',
        duration: body.duration ?? '',
        durationDescription: body.durationDescription ?? '',
        description: body.description ?? '',
        image: body.image ?? '',
        images: body.images ?? [],
        categories: [],
        destinations: [],
        itineraryTemplate: body.itineraryTemplateId || null,
        inclusionExclusionSet: body.inclusionExclusionSetId || null,
        paymentRefundPolicyTemplate: body.paymentRefundPolicyTemplateId || null,
        termsConditionTemplate: body.termsConditionTemplateId || null,
      });
      res.status(201).json({ success: true, data: pkg });
    } catch (err) {
      next(err);
    }
  }
);

// List packages with optional filter by category or destination
router.get('/', async (req, res, next) => {
  try {
    const { categoryId, destinationId } = req.query;
    const filter = {};
    try {
      if (categoryId) filter.categories = new mongoose.Types.ObjectId(categoryId);
      if (destinationId) filter.destinations = new mongoose.Types.ObjectId(destinationId);
    } catch {
      return next(new ApiError(400, 'Invalid categoryId or destinationId'));
    }

    const list = await Package.find(filter)
      .populate('categories', 'name title image images')
      .populate('destinations', 'name details image images')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const pkg = await Package.findById(req.params.id)
      .populate('categories', 'name title image images')
      .populate('destinations', 'name details image images')
      .populate('itineraryTemplate')
      .populate('inclusionExclusionSet')
      .populate('paymentRefundPolicyTemplate')
      .populate('termsConditionTemplate')
      .lean();
    if (!pkg) throw new ApiError(404, 'Package not found');
    const itineraryTemplate = pkg.itineraryTemplate;
    const inclusionExclusionSet = pkg.inclusionExclusionSet;
    const paymentRefundPolicyTemplate = pkg.paymentRefundPolicyTemplate;
    const termsConditionTemplate = pkg.termsConditionTemplate;

    const itinerary = (itineraryTemplate?.days || []).map((d, i) => ({
      _id: d._id || `day-${i}`,
      dayNumber: d.dayNumber,
      title: d.title,
      description: d.description || '',
    }));
    const items = inclusionExclusionSet?.items || [];
    const inclusions = items.filter((i) => i.type === 'inclusion');
    const exclusions = items.filter((i) => i.type === 'exclusion');
    res.json({
      success: true,
      data: {
        ...pkg,
        itinerary,
        paymentRefundPolicy: { content: paymentRefundPolicyTemplate?.content ?? '' },
        inclusions,
        exclusions,
        termsCondition: { content: termsConditionTemplate?.content ?? '' },
      },
    });
  } catch (err) {
    next(err);
  }
});

const updateValidations = [
  body('name').optional().trim().notEmpty().withMessage('Package name cannot be empty'),
  body('title').optional().trim(),
  body('duration').optional().trim(),
  body('durationDescription').optional().trim(),
  body('description').optional().trim(),
  body('image').optional().trim(),
  body('images').optional().isArray().withMessage('images must be an array'),
  body('images.*').optional().isString().trim(),
  body('itineraryTemplateId').optional().isMongoId(),
  body('inclusionExclusionSetId').optional().isMongoId(),
  body('paymentRefundPolicyTemplateId').optional().isMongoId(),
  body('termsConditionTemplateId').optional().isMongoId(),
];

// Update package fields (not categories/destinations). Accepts JSON or multipart with optional image/images.
router.patch(
  '/:id',
  requireAuth,
  optionalImageAndImagesUpload,
  validate(updateValidations),
  async (req, res, next) => {
    try {
      const body = normalizeImages({ ...req.body });
      const set = { ...body };
      if (set.itineraryTemplateId !== undefined) {
        set.itineraryTemplate = set.itineraryTemplateId || null;
        delete set.itineraryTemplateId;
      }
      if (set.inclusionExclusionSetId !== undefined) {
        set.inclusionExclusionSet = set.inclusionExclusionSetId || null;
        delete set.inclusionExclusionSetId;
      }
      if (set.paymentRefundPolicyTemplateId !== undefined) {
        set.paymentRefundPolicyTemplate = set.paymentRefundPolicyTemplateId || null;
        delete set.paymentRefundPolicyTemplateId;
      }
      if (set.termsConditionTemplateId !== undefined) {
        set.termsConditionTemplate = set.termsConditionTemplateId || null;
        delete set.termsConditionTemplateId;
      }
      const pkg = await Package.findByIdAndUpdate(
        req.params.id,
        { $set: set },
        { new: true, runValidators: true }
      )
        .populate('categories', 'name title image images')
        .populate('destinations', 'name details image images')
        .lean();
      if (!pkg) throw new ApiError(404, 'Package not found');
      res.json({ success: true, data: pkg });
    } catch (err) {
      next(err);
    }
  }
);

// Step 2: Assign categories and destinations to a package
router.patch(
  '/:id/categories-destinations',
  requireAuth,
  validate(assignValidations),
  async (req, res, next) => {
    try {
      const pkg = await Package.findById(req.params.id);
      if (!pkg) throw new ApiError(404, 'Package not found');

      if (req.body.categoryIds !== undefined) pkg.categories = req.body.categoryIds;
      if (req.body.destinationIds !== undefined) pkg.destinations = req.body.destinationIds;
      await pkg.save();

      const updated = await Package.findById(pkg._id)
        .populate('categories', 'name title image images')
        .populate('destinations', 'name details image images')
        .lean();
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);
    if (!pkg) throw new ApiError(404, 'Package not found');
    res.json({ success: true, message: 'Package deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
