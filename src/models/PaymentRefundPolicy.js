const mongoose = require('mongoose');

const paymentRefundPolicySchema = new mongoose.Schema(
  {
    package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true, unique: true },
    content: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentRefundPolicy', paymentRefundPolicySchema);
