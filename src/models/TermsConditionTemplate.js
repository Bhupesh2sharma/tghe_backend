const mongoose = require('mongoose');

const termsConditionTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TermsConditionTemplate', termsConditionTemplateSchema);
