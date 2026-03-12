const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true }
);

adminSchema.index({ email: 1 });

adminSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    this.passwordHash = await bcrypt.hash(this.passwordHash, SALT_ROUNDS);
    next();
  } catch (err) {
    next(err);
  }
});

adminSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

adminSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('Admin', adminSchema);
