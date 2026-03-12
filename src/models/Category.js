const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, trim: true, default: '' },
    image: { type: String, trim: true, default: '' },
    images: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
