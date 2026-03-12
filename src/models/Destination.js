const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    details: { type: String, default: '' },
    image: { type: String, trim: true, default: '' },
    images: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Destination', destinationSchema);
