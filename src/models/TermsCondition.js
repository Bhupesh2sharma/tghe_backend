const mongoose = require('mongoose');

const termsConditionSchema = new mongoose.Schema(
  {
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true, unique: true },
    content: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TermsCondition', termsConditionSchema);
