const express = require('express');
const { body } = require('express-validator');
const Category = require('../models/Category');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { optionalImageAndImagesUpload } = require('../middleware/optionalImageUpload');
const { ApiError } = require('../utils/errors');

const router = express.Router();

const createValidations = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('title').optional().trim(),
  body('image').optional().trim(),
  body('images').optional().isArray().withMessage('images must be an array'),
  body('images.*').optional().isString().trim(),
];

const updateValidations = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('title').optional().trim(),
  body('image').optional().trim(),
  body('images').optional().isArray().withMessage('images must be an array'),
  body('images.*').optional().isString().trim(),
];

router.get('/', async (req, res, next) => {
  try {
    const list = await Category.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const doc = await Category.findById(req.params.id).lean();
    if (!doc) throw new ApiError(404, 'Category not found');
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
});

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

router.post(
  '/',
  requireAuth,
  optionalImageAndImagesUpload,
  validate(createValidations),
  async (req, res, next) => {
    try {
      const body = normalizeImages({ ...req.body });
      const category = await Category.create(body);
      res.status(201).json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:id',
  requireAuth,
  optionalImageAndImagesUpload,
  validate(updateValidations),
  async (req, res, next) => {
    try {
      const body = normalizeImages({ ...req.body });
      const category = await Category.findByIdAndUpdate(
        req.params.id,
        { $set: body },
        { new: true, runValidators: true }
      ).lean();
      if (!category) throw new ApiError(404, 'Category not found');
      res.json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) throw new ApiError(404, 'Category not found');
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
