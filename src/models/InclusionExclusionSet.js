const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, enum: ['inclusion', 'exclusion'] },
    text: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const inclusionExclusionSetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    items: [itemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('InclusionExclusionSet', inclusionExclusionSetSchema);
