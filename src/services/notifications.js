const Notification = require('../models/Notification');

async function createNotification(type, title, message = '', link = '', relatedId = null) {
  try {
    await Notification.create({
      type,
      title,
      message,
      link,
      relatedId,
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}

module.exports = { createNotification };
