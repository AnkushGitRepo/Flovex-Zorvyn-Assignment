const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    name:            { type: String, required: true, trim: true },
    amount:          { type: Number, required: true, min: 0 },
    category:        { type: String, required: true, trim: true },
    type:            { type: String, default: 'expense', enum: ['expense'] },
    billingCycle:    { type: String, required: true, enum: ['weekly', 'monthly', 'yearly'] },
    nextBillingDate: { type: Date, required: true },
    status:          { type: String, required: true, enum: ['active', 'paused', 'cancelled'], default: 'active' },
  },
  { timestamps: true }
);

subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ nextBillingDate: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
