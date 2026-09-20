const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, 'Item description is required'],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    rate: {
      type: Number,
      required: [true, 'Rate is required'],
      min: [0, 'Rate cannot be negative']
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative']
    }
  },
  { _id: true }
);

const invoiceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client is required'],
      index: true
    },
    invoiceNumber: {
      type: String,
      required: true,
      trim: true
    },
    items: {
      type: [invoiceItemSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Invoice must contain at least one line item'
      }
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    },
    taxPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Tax percentage cannot be negative'],
      max: [100, 'Tax percentage cannot exceed 100']
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: [0, 'Tax amount cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    grandTotal: {
      type: Number,
      required: true,
      min: [0, 'Grand total cannot be negative']
    },
    issueDate: {
      type: Date,
      default: Date.now,
      required: true
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    status: {
      type: String,
      enum: ['Draft', 'Unpaid', 'Paid', 'Overdue'],
      default: 'Unpaid'
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for user search and filter performance
invoiceSchema.index({ user: 1, invoiceNumber: 1 });
invoiceSchema.index({ user: 1, status: 1 });
invoiceSchema.index({ user: 1, client: 1 });
invoiceSchema.index({ user: 1, issueDate: -1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
