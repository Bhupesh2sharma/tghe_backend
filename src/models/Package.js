const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, trim: true, default: '' },
    duration: { type: String, trim: true, default: '' },
    durationDescription: { type: String, trim: true, default: '' },
    description: { type: String, default: '' },
    image: { type: String, trim: true, default: '' },
    images: [{ type: String, trim: true }],
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: [] }],
    destinations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination', default: [] }],
    itineraryTemplate: { type: mongoose.Schema.Types.ObjectId, ref: 'ItineraryTemplate', default: null },
    inclusionExclusionSet: { type: mongoose.Schema.Types.ObjectId, ref: 'InclusionExclusionSet', default: null },
    paymentRefundPolicyTemplate: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentRefundPolicyTemplate', default: null },
    termsConditionTemplate: { type: mongoose.Schema.Types.ObjectId, ref: 'TermsConditionTemplate', default: null },
  },
  { timestamps: true }
);

packageSchema.index({ categories: 1 });
packageSchema.index({ destinations: 1 });

module.exports = mongoose.model('Package', packageSchema);
