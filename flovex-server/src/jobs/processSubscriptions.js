const Subscription = require('../models/Subscription');
const Transaction = require('../models/Transaction');

/**
 * Processes all active subscriptions whose nextBillingDate <= today.
 * For each due cycle: creates a Transaction, then advances nextBillingDate.
 * Handles multiple missed cycles (e.g. server was down for weeks) via while-loop.
 * Returns { processed, transactionsCreated }
 */
async function processSubscriptions() {
  const now = new Date();
  const dueSubscriptions = await Subscription.find({
    status: 'active',
    nextBillingDate: { $lte: now },
  });

  let transactionsCreated = 0;

  for (const sub of dueSubscriptions) {
    let billingDate = new Date(sub.nextBillingDate);

    // Create one transaction per missed billing cycle
    while (billingDate <= now) {
      await Transaction.create({
        name: sub.name,
        amount: sub.amount,
        category: sub.category,
        type: 'expense',
        status: 'completed',
        date: billingDate,
      });
      transactionsCreated++;

      // Advance to next cycle
      billingDate = advanceBillingDate(billingDate, sub.billingCycle);
    }

    sub.nextBillingDate = billingDate;
    await sub.save();
  }

  return { processed: dueSubscriptions.length, transactionsCreated };
}

function advanceBillingDate(date, cycle) {
  const d = new Date(date);
  if (cycle === 'weekly') {
    d.setDate(d.getDate() + 7);
  } else if (cycle === 'monthly') {
    d.setMonth(d.getMonth() + 1);
  } else if (cycle === 'yearly') {
    d.setFullYear(d.getFullYear() + 1);
  }
  return d;
}

module.exports = { processSubscriptions };
