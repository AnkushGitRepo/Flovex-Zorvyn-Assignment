const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const transactionRoutes = require('./src/routes/transactions');
const dashboardRoutes = require('./src/routes/dashboard');
const chartsRoutes = require('./src/routes/charts');
const subscriptionRoutes = require('./src/routes/subscriptions');
const { errorHandler } = require('./src/middleware/errorHandler');
const { processSubscriptions } = require('./src/jobs/processSubscriptions');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/charts', chartsRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Flovex API is running' });
});

// Error handler
app.use(errorHandler);

// Connect to MongoDB then start server
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flovex')
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Flovex API running on http://localhost:${PORT}`));

    // Daily cron at 00:05 — process due subscription billing
    cron.schedule('5 0 * * *', async () => {
      try {
        const result = await processSubscriptions();
        if (result.transactionsCreated > 0) {
          console.log(`⏰ Cron: processed ${result.processed} subscriptions, created ${result.transactionsCreated} transactions`);
        }
      } catch (err) {
        console.error('❌ Cron job failed:', err.message);
      }
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
