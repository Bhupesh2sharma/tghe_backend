const express = require('express');
const { body } = require('express-validator');
const Contact = require('../models/Contact');
const { validate } = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { createNotification } = require('../services/notifications');

const router = express.Router();

const createValidations = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
    .trim(),
  body('message').optional().trim(),
  body('noOfAdults').optional().isInt({ min: 0 }).withMessage('No of adults must be 0 or more').toInt(),
  body('noOfChildren').optional().isInt({ min: 0 }).withMessage('No of children must be 0 or more').toInt(),
];

// Admin: get all contact form submissions
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const list = await Contact.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

// Public: submit contact form
router.post('/', validate(createValidations), async (req, res, next) => {
  try {
    const contact = await Contact.create({
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      message: req.body.message ?? '',
      noOfAdults: req.body.noOfAdults ?? 0,
      noOfChildren: req.body.noOfChildren ?? 0,
    });
    await createNotification(
      'contact',
      `New contact from ${contact.name}`,
      contact.message || `${contact.email} · ${contact.phone}`,
      `/contacts/${contact._id}`,
      contact._id
    );
    res.status(201).json({
      success: true,
      message: 'Contact form submitted',
      data: {
        _id: contact._id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        message: contact.message,
        noOfAdults: contact.noOfAdults,
        noOfChildren: contact.noOfChildren,
        createdAt: contact.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
