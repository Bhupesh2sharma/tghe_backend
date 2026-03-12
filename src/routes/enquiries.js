const express = require('express');
const { body } = require('express-validator');
const Enquiry = require('../models/Enquiry');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { ApiError } = require('../utils/errors');
const { createNotification } = require('../services/notifications');

const router = express.Router();

const createValidations = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('pax').optional().isInt({ min: 1 }).withMessage('PAX must be a positive number').toInt(),
  body('phone').optional().trim(),
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
    .trim(),
  body('packageId').optional().isMongoId().withMessage('Invalid package ID'),
  body('packageName').optional().trim(),
  body('tourDate').optional().trim(),
  body('message').optional().trim(),
];

// Admin: get all enquiries
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const list = await Enquiry.find()
      .populate('packageId', 'name title duration')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

// Public: submit enquiry
router.post('/', validate(createValidations), async (req, res, next) => {
  try {
    const payload = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone ?? '',
      packageName: req.body.packageName ?? '',
      message: req.body.message ?? '',
    };
    if (req.body.pax != null) payload.pax = req.body.pax;
    if (req.body.packageId) payload.packageId = req.body.packageId;
    if (req.body.tourDate) {
      const d = new Date(req.body.tourDate);
      payload.tourDate = isNaN(d.getTime()) ? null : d;
    }
    const enquiry = await Enquiry.create(payload);
    await createNotification(
      'enquiry',
      `New enquiry from ${enquiry.name}`,
      enquiry.packageName ? `Package: ${enquiry.packageName}. ${enquiry.message || ''}`.trim() : (enquiry.message || ''),
      `/enquiries/${enquiry._id}`,
      enquiry._id
    );
    res.status(201).json({
      success: true,
      message: 'Enquiry submitted',
      data: {
        _id: enquiry._id,
        name: enquiry.name,
        pax: enquiry.pax,
        phone: enquiry.phone,
        email: enquiry.email,
        packageId: enquiry.packageId,
        packageName: enquiry.packageName,
        tourDate: enquiry.tourDate,
        message: enquiry.message,
        createdAt: enquiry.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
