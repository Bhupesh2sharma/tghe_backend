const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema(
  {
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    dayNumber: { type: Number, required: true, min: 1 },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

itinerarySchema.index({ package: 1, dayNumber: 1 });

module.exports = mongoose.model('Itinerary', itinerarySchema);
