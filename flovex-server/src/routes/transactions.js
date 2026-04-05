const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');

/**
 * @route   GET    /api/transactions
 * @desc    Get all transactions (supports ?search, ?category, ?type, ?status, ?sort, ?page, ?limit)
 *
 * @route   POST   /api/transactions
 * @desc    Create a new transaction
 */
router.route('/').get(getTransactions).post(createTransaction);

/**
 * @route   GET    /api/transactions/:id
 * @route   PUT    /api/transactions/:id
 * @route   DELETE /api/transactions/:id
 */
router.route('/:id').get(getTransaction).put(updateTransaction).delete(deleteTransaction);

module.exports = router;
