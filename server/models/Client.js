const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    billingAddress: {
      type: String,
      required: [true, 'Billing address is required'],
      trim: true
    },
    gstNumber: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound index for user & search queries
clientSchema.index({ user: 1, name: 1, companyName: 1, email: 1 });

module.exports = mongoose.model('Client', clientSchema);
