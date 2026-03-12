const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    pax: { type: Number, default: null },
    phone: { type: String, trim: true, default: '' },
    email: { type: String, required: true, trim: true, lowercase: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', default: null },
    packageName: { type: String, trim: true, default: '' },
    tourDate: { type: Date, default: null },
    message: { type: String, default: '' },
  },
  { timestamps: true }
);

enquirySchema.index({ createdAt: -1 });
enquirySchema.index({ packageId: 1 });

module.exports = mongoose.model('Enquiry', enquirySchema);
