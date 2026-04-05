const Transaction = require('../models/Transaction');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/transactions
// Query params: search, category, type, status, sort, page, limit
const getTransactions = asyncHandler(async (req, res) => {
  const { search, category, type, status, sort = 'newest', page = 1, limit = 50, month, year } = req.query;

  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }
  if (category && category !== 'all') filter.category = category;
  if (type && type !== 'all') filter.type = type;
  if (status && status !== 'all') filter.status = status;

  if (month && year) {
    const m = Number(month);
    const y = Number(year);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);
    filter.date = { $gte: start, $lt: end };
  }

  const sortMap = {
    newest: { date: -1 },
    oldest: { date: 1 },
    highest: { amount: -1 },
    lowest: { amount: 1 },
  };

  const skip = (Number(page) - 1) * Number(limit);

  const [transactions, total] = await Promise.all([
    Transaction.find(filter).sort(sortMap[sort] || { date: -1 }).skip(skip).limit(Number(limit)),
    Transaction.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: transactions,
    meta: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
  });
});

// GET /api/transactions/:id
const getTransaction = asyncHandler(async (req, res) => {
  const tx = await Transaction.findById(req.params.id);
  if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });
  res.json({ success: true, data: tx });
});

// POST /api/transactions
const createTransaction = asyncHandler(async (req, res) => {
  const tx = await Transaction.create(req.body);
  res.status(201).json({ success: true, data: tx });
});

// PUT /api/transactions/:id
const updateTransaction = asyncHandler(async (req, res) => {
  const tx = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });
  res.json({ success: true, data: tx });
});

// DELETE /api/transactions/:id
const deleteTransaction = asyncHandler(async (req, res) => {
  const tx = await Transaction.findByIdAndDelete(req.params.id);
  if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });
  res.json({ success: true, message: 'Transaction deleted' });
});

module.exports = { getTransactions, getTransaction, createTransaction, updateTransaction, deleteTransaction };
