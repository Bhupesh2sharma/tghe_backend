const mongoose = require('mongoose');

const inclusionExclusionSchema = new mongoose.Schema(
  {
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
    type: { type: String, required: true, enum: ['inclusion', 'exclusion'] },
    text: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

inclusionExclusionSchema.index({ package: 1, type: 1 });

module.exports = mongoose.model('InclusionExclusion', inclusionExclusionSchema);
