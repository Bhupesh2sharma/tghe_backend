const mongoose = require('mongoose');

const TYPES = ['enquiry', 'contact', 'newsletter'];

const notificationSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, enum: TYPES },
    title: { type: String, required: true, trim: true },
    message: { type: String, default: '' },
    link: { type: String, trim: true, default: '' },
    relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
