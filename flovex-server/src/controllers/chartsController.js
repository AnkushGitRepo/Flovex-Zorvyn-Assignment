const Transaction = require('../models/Transaction');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/charts/weekly
// Returns last 7 days income vs expense per day
const getWeeklyData = asyncHandler(async (req, res) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const transactions = await Transaction.find({
    date: { $gte: sevenDaysAgo },
    status: 'completed',
  });

  const dataMap = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(sevenDaysAgo.getDate() + i);
    const key = d.toISOString().split('T')[0];
    dataMap[key] = { day: days[d.getDay()], income: 0, expense: 0 };
  }

  transactions.forEach((tx) => {
    const key = tx.date.toISOString().split('T')[0];
    if (dataMap[key]) {
      if (tx.type === 'income') dataMap[key].income += tx.amount;
      else dataMap[key].expense += tx.amount;
    }
  });

  res.json({ success: true, data: Object.values(dataMap) });
});

// GET /api/charts/monthly
// Returns last 6 months income, expense, savings
const getMonthlyData = asyncHandler(async (req, res) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();

  const result = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

    const [incomeAgg, expenseAgg] = await Promise.all([
      Transaction.aggregate([
        { $match: { type: 'income', status: 'completed', date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { type: 'expense', status: 'completed', date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const income = incomeAgg[0]?.total || 0;
    const expense = expenseAgg[0]?.total || 0;
    result.push({ month: months[d.getMonth()], income, expense, savings: income - expense });
  }

  res.json({ success: true, data: result });
});

// GET /api/charts/categories
// Returns spending by category for donut/bar chart
const getCategoryBreakdown = asyncHandler(async (req, res) => {
  const colors = {
    Food: '#E86B6B',
    Transport: '#E8B84B',
    Shopping: '#5046E4',
    Salary: '#7DB89A',
    Freelance: '#7DB89A',
    Utilities: '#9B9BAD',
    Entertainment: '#F5A623',
    Investment: '#4ECDC4',
  };

  const agg = await Transaction.aggregate([
    { $match: { type: 'expense', status: 'completed' } },
    { $group: { _id: '$category', value: { $sum: '$amount' } } },
    { $sort: { value: -1 } },
  ]);

  const data = agg.map((item) => ({
    name: item._id,
    value: item.value,
    color: colors[item._id] || '#9B9BAD',
  }));

  res.json({ success: true, data });
});

// GET /api/charts/category-trend?category=Food
// Returns month-by-month totals for a specific category over the last 12 months
const getCategoryTrend = asyncHandler(async (req, res) => {
  const { category } = req.query;
  if (!category) {
    return res.status(400).json({ success: false, message: 'category query param is required' });
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const result = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

    const agg = await Transaction.aggregate([
      { $match: { category, status: 'completed', date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    result.push({ month: months[d.getMonth()], amount: agg[0]?.total || 0 });
  }

  res.json({ success: true, data: result });
});

// GET /api/charts/all-categories
// Returns all distinct category names across all transactions
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Transaction.distinct('category');
  res.json({ success: true, data: categories.sort() });
});

module.exports = { getWeeklyData, getMonthlyData, getCategoryBreakdown, getCategoryTrend, getAllCategories };
