const mongoose = require('mongoose');

const daySchema = new mongoose.Schema(
  {
    dayNumber: { type: Number, required: true, min: 1 },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const itineraryTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    days: [daySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ItineraryTemplate', itineraryTemplateSchema);
