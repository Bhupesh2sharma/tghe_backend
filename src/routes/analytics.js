const express = require('express');
const Category = require('../models/Category');
const Destination = require('../models/Destination');
const Package = require('../models/Package');
const Enquiry = require('../models/Enquiry');
const Contact = require('../models/Contact');
const Newsletter = require('../models/Newsletter');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Admin: simple analytics counts
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const [categories, destinations, packages, enquiries, contacts, newsletter] = await Promise.all([
      Category.countDocuments(),
      Destination.countDocuments(),
      Package.countDocuments(),
      Enquiry.countDocuments(),
      Contact.countDocuments(),
      Newsletter.countDocuments(),
    ]);
    res.json({
      success: true,
      data: {
        categories,
        destinations,
        packages,
        enquiries,
        contacts,
        newsletter,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
