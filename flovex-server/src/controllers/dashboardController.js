const Transaction = require('../models/Transaction');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/dashboard/stats
// Returns summary cards data: balance, income, expenses, savings
const getStats = asyncHandler(async (req, res) => {
  const [incomeAgg, expenseAgg] = await Promise.all([
    Transaction.aggregate([{ $match: { type: 'income', status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Transaction.aggregate([{ $match: { type: 'expense', status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
  ]);

  const totalIncome = incomeAgg[0]?.total || 0;
  const totalExpenses = expenseAgg[0]?.total || 0;
  const totalSavings = totalIncome - totalExpenses;
  const balance = totalSavings;

  res.json({
    success: true,
    data: {
      balance,
      totalIncome,
      totalExpenses,
      totalSavings,
      savingsRate: totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(1) : '0.0',
    },
  });
});

// GET /api/dashboard/recent
// Returns 5 most recent transactions
const getRecent = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find().sort({ date: -1 }).limit(5);
  res.json({ success: true, data: transactions });
});

module.exports = { getStats, getRecent };
