const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ['income', 'expense'] },
    status: { type: String, required: true, enum: ['completed', 'pending', 'chargeback'], default: 'completed' },
    date: { type: Date, required: true, default: Date.now },
    note: { type: String, trim: true },
  },
  { timestamps: true }
);

// Indexes for common query patterns
transactionSchema.index({ type: 1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ date: -1 });
transactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
