const Subscription = require('../models/Subscription');
const { asyncHandler } = require('../middleware/errorHandler');
const { processSubscriptions } = require('../jobs/processSubscriptions');

// GET /api/subscriptions — supports ?status=active|paused|cancelled
const getSubscriptions = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const subscriptions = await Subscription.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: subscriptions });
});

// GET /api/subscriptions/:id
const getSubscription = asyncHandler(async (req, res) => {
  const sub = await Subscription.findById(req.params.id);
  if (!sub) {
    const err = new Error('Subscription not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, data: sub });
});

// POST /api/subscriptions
const createSubscription = asyncHandler(async (req, res) => {
  const { name, amount, category, billingCycle, nextBillingDate, status } = req.body;
  const sub = await Subscription.create({ name, amount, category, billingCycle, nextBillingDate, status });
  res.status(201).json({ success: true, data: sub });
});

// PUT /api/subscriptions/:id
const updateSubscription = asyncHandler(async (req, res) => {
  const sub = await Subscription.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!sub) {
    const err = new Error('Subscription not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, data: sub });
});

// DELETE /api/subscriptions/:id
const deleteSubscription = asyncHandler(async (req, res) => {
  const sub = await Subscription.findByIdAndDelete(req.params.id);
  if (!sub) {
    const err = new Error('Subscription not found');
    err.statusCode = 404;
    throw err;
  }
  res.json({ success: true, data: {} });
});

// POST /api/subscriptions/process-due — manual trigger (also called by cron)
const processDue = asyncHandler(async (req, res) => {
  const result = await processSubscriptions();
  res.json({ success: true, data: result });
});

module.exports = { getSubscriptions, getSubscription, createSubscription, updateSubscription, deleteSubscription, processDue };
