const express = require('express');
const Notification = require('../models/Notification');
const { requireAuth } = require('../middleware/auth');
const { ApiError } = require('../utils/errors');

const router = express.Router();
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

// Admin: list notifications (newest first)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { read, limit = DEFAULT_LIMIT } = req.query;
    const filter = {};
    if (read !== undefined) {
      filter.read = read === 'true';
    }
    const cap = Math.min(parseInt(limit, 10) || DEFAULT_LIMIT, MAX_LIMIT);
    const list = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(cap)
      .lean();
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

// Admin: unread count (for badge)
router.get('/unread-count', requireAuth, async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ read: false });
    res.json({ success: true, data: { count } });
  } catch (err) {
    next(err);
  }
});

// Admin: mark all as read (must be before /:id/read)
router.patch('/read-all', requireAuth, async (req, res, next) => {
  try {
    const result = await Notification.updateMany({ read: false }, { read: true });
    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (err) {
    next(err);
  }
});

// Admin: mark one as read
router.patch('/:id/read', requireAuth, async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    ).lean();
    if (!notification) throw new ApiError(404, 'Notification not found');
    res.json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
