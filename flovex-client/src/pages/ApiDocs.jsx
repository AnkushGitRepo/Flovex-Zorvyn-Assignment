import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Play, Copy, Check, BookOpen, Zap, Code2, Sparkles, X } from 'lucide-react';

// ─── AI Agent Prompt ─────────────────────────────────────────────────────────

const AI_AGENT_PROMPT = `You are building an application that integrates with the Flovex Finance Dashboard REST API. Below is the complete API reference. The base URL is the server origin (e.g. http://localhost:5700 in development). All responses follow the envelope: { "success": boolean, "data": <payload>, "meta": { "total", "page", "limit" } }.

═══════════════════════════════════════════════
FLOVEX FINANCE API — COMPLETE REFERENCE
Version: 1.1 · 14 endpoints
═══════════════════════════════════════════════

━━━ TRANSACTIONS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1] GET /api/transactions
    List transactions with full filtering & pagination.

    Query params (all optional):
      search   string   Full-text search across name and category
      category string   Filter by category (e.g. Food, Transport)
      type     string   "income" | "expense"
      month    number   Month 1–12
      year     number   Four-digit year (e.g. 2026)
      sort     string   "newest" | "oldest" | "highest" | "lowest"  [default: newest]
      limit    number   Max records to return  [default: 50]

    Response 200:
    {
      "success": true,
      "data": [
        {
          "_id": "664abc123",
          "name": "Zomato Order",
          "amount": 420,
          "category": "Food",
          "type": "expense",
          "status": "completed",
          "date": "2026-04-03T00:00:00.000Z",
          "note": "Dinner"
        }
      ],
      "meta": { "total": 1, "page": 1, "limit": 50 }
    }

────────────────────────────────────────────

[2] GET /api/transactions/:id
    Fetch a single transaction by its MongoDB document ID.

    Path params:
      id  string  REQUIRED — Transaction document ID

    Response 200:
    {
      "success": true,
      "data": {
        "_id": "664abc123",
        "name": "Netflix Subscription",
        "amount": 649,
        "category": "Entertainment",
        "type": "expense",
        "status": "completed",
        "date": "2026-04-01T00:00:00.000Z",
        "note": "Monthly plan"
      }
    }

────────────────────────────────────────────

[3] POST /api/transactions
    Create a new income or expense transaction.
    Automatically updates dashboard stats and category breakdown.
    Date defaults to today if omitted.

    Request body (JSON):
      name      string  REQUIRED  Transaction title (e.g. "Zomato Order")
      amount    number  REQUIRED  Positive value in ₹
      category  string  REQUIRED  Category label (any custom value)
      type      string  REQUIRED  "income" | "expense"
      status    string  optional  "completed" | "pending" | "chargeback"  [default: completed]
      date      string  optional  ISO date string  [default: today]
      note      string  optional  Free-form note

    Example body:
    {
      "name": "Zomato Order",
      "amount": 420,
      "category": "Food",
      "type": "expense",
      "status": "completed",
      "date": "2026-04-03",
      "note": "Dinner with team"
    }

    Response 201:
    {
      "success": true,
      "data": {
        "_id": "664xyz789",
        "name": "Zomato Order",
        "amount": 420,
        "category": "Food",
        "type": "expense",
        "status": "completed",
        "date": "2026-04-03T00:00:00.000Z",
        "note": "Dinner with team"
      }
    }

────────────────────────────────────────────

[4] PUT /api/transactions/:id
    Update an existing transaction. Partial updates are supported —
    only include the fields you want to change.

    Path params:
      id  string  REQUIRED — Transaction document ID

    Request body (JSON, all optional):
      name      string   New title
      amount    number   New amount in ₹
      category  string   New category
      type      string   "income" | "expense"
      status    string   "completed" | "pending" | "chargeback"
      date      string   New ISO date string
      note      string   Updated note

    Example body:
    {
      "amount": 500,
      "status": "pending"
    }

    Response 200:
    {
      "success": true,
      "data": {
        "_id": "664abc123",
        "name": "Zomato Order",
        "amount": 500,
        "status": "pending"
      }
    }

────────────────────────────────────────────

[5] DELETE /api/transactions/:id
    Permanently delete a transaction. Irreversible.
    Triggers cache invalidation — dashboard stats update automatically.

    Path params:
      id  string  REQUIRED — Transaction document ID

    Response 200:
    {
      "success": true,
      "message": "Transaction deleted"
    }

━━━ DASHBOARD ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[6] GET /api/dashboard/stats
    Aggregated financial summary across all transactions.
    Balance = total income − total expenses.
    Savings estimated as a percentage of income after expenses.

    No params required.

    Response 200:
    {
      "success": true,
      "data": {
        "balance": 142500,
        "totalIncome": 280000,
        "totalExpenses": 137500,
        "totalSavings": 52000
      }
    }

────────────────────────────────────────────

[7] GET /api/dashboard/recent
    Returns the 5 most recent transactions for the activity feed.
    Always sorted by date descending. Lightweight display fields only.

    No params required.

    Response 200:
    {
      "success": true,
      "data": [
        {
          "_id": "664abc001",
          "name": "Spotify Premium",
          "amount": 119,
          "type": "expense",
          "date": "2026-04-04T00:00:00.000Z"
        }
      ]
    }

━━━ CHARTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[8] GET /api/charts/weekly
    Income and expense totals grouped by day for the current ISO week (Mon–Sun).
    Days with no transactions return 0.

    No params required.

    Response 200:
    {
      "success": true,
      "data": [
        { "day": "Mon", "income": 0, "expense": 420 },
        { "day": "Tue", "income": 15000, "expense": 0 },
        { "day": "Wed", "income": 0, "expense": 1200 }
      ]
    }

────────────────────────────────────────────

[9] GET /api/charts/monthly
    Income and expense totals aggregated by month for the past 6 months.
    Sorted chronologically oldest to newest. Used for trend analysis.

    No params required.

    Response 200:
    {
      "success": true,
      "data": [
        { "month": "Nov", "income": 60000, "expense": 32000 },
        { "month": "Dec", "income": 72000, "expense": 45000 }
      ]
    }

────────────────────────────────────────────

[10] GET /api/charts/categories
     Expense totals grouped by category. Only expense-type transactions.
     Returns top 5 categories by total spend. Powers the dashboard donut chart.

     No params required.

     Response 200:
     {
       "success": true,
       "data": [
         { "name": "Food", "value": 12400, "color": "#E86B6B" },
         { "name": "Transport", "value": 5200, "color": "#5046E4" },
         { "name": "Entertainment", "value": 3100, "color": "#7DB89A" }
       ]
     }

────────────────────────────────────────────

[11] GET /api/charts/category-trend?category=<name>
     Month-by-month spending for a specific category over the trailing 12 months.
     Months with no transactions return amount: 0.
     Useful for spotting seasonal spending patterns.

     Query params:
       category  string  REQUIRED  Category name (e.g. Food, Transport)

     Response 200:
     {
       "success": true,
       "data": [
         { "month": "May", "amount": 3200 },
         { "month": "Jun", "amount": 4100 },
         { "month": "Jul", "amount": 0 },
         { "month": "Aug", "amount": 2800 }
       ]
     }

────────────────────────────────────────────

[12] GET /api/charts/all-categories
     Returns all unique category names that exist in the database.
     Useful for populating category filter dropdowns.

     No params required.

     Response 200:
     {
       "success": true,
       "data": ["Food", "Transport", "Entertainment", "Utilities", "Health"]
     }

═══════════════════════════════════════════════
DATA MODEL — Transaction
═══════════════════════════════════════════════

Field      Type     Notes
─────────────────────────────────────────────
_id        string   MongoDB ObjectId
name       string   Transaction title
amount     number   Positive ₹ value
category   string   Freeform label
type       string   "income" | "expense"
status     string   "completed" | "pending" | "chargeback"
date       string   ISO 8601 date-time
note       string   Optional free-form note

═══════════════════════════════════════════════
ERROR FORMAT
═══════════════════════════════════════════════

All errors return:
{
  "success": false,
  "error": "Human-readable error message"
}

Common HTTP status codes:
  400 — Bad request / missing required field
  404 — Resource not found
  500 — Internal server error

═══════════════════════════════════════════════
USAGE GUIDELINES FOR AGENTS
═══════════════════════════════════════════════

• Always check "success": true before using "data".
• For lists, use "meta.total" to determine if pagination is needed.
• Transaction amounts are stored as plain numbers in ₹ (Indian Rupees) — no currency symbol.
• The "status" field allows "chargeback" for disputed/reversed transactions.
• Category names are case-sensitive and freeform — use GET /api/charts/all-categories to fetch valid options.
• When building UI, use GET /api/dashboard/stats for the summary cards and GET /api/dashboard/recent for the activity feed.
• Weekly and monthly chart endpoints have no filters — they always return data relative to today.

═══════════════════════════════════════════════
QUICK-START EXAMPLE (JavaScript)
═══════════════════════════════════════════════

// Fetch dashboard summary
const stats = await fetch('/api/dashboard/stats').then(r => r.json());
console.log(stats.data.balance); // e.g. 142500

// List last 10 food expenses
const txns = await fetch('/api/transactions?category=Food&type=expense&limit=10').then(r => r.json());

// Create a new transaction
const created = await fetch('/api/transactions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Swiggy Order',
    amount: 350,
    category: 'Food',
    type: 'expense',
  }),
}).then(r => r.json());

// Update a transaction
await fetch(\`/api/transactions/\${created.data._id}\`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'pending' }),
});

// Delete a transaction
await fetch(\`/api/transactions/\${created.data._id}\`, { method: 'DELETE' });
`;

// ─── AI Prompt Banner ────────────────────────────────────────────────────────

function AiPromptBanner() {
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(AI_AGENT_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="relative mb-8 rounded-2xl border border-indigo-flovex/20 bg-gradient-to-br from-indigo-flovex/5 via-card to-card overflow-hidden"
    >
      {/* Subtle top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-flovex/40 to-transparent" />

      <div className="px-6 py-5 flex items-start gap-4">
        {/* Icon */}
        <div className="shrink-0 w-9 h-9 rounded-xl bg-indigo-flovex/10 flex items-center justify-center mt-0.5">
          <Sparkles size={16} className="text-indigo-flovex" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-dark">Build with AI Agents</p>
          <p className="text-xs text-muted mt-0.5 leading-relaxed">
            Copy the complete API context prompt — paste it into Claude, ChatGPT, or any AI agent to give it full knowledge of every endpoint, schema, and usage pattern.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-flovex text-white text-xs font-semibold hover:bg-indigo-dim transition-colors"
          >
            {copied ? (
              <>
                <Check size={13} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={13} />
                Copy Prompt
              </>
            )}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-2 rounded-xl text-muted hover:text-dark hover:bg-cream transition-colors"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Endpoint definitions ───────────────────────────────────────────────────

const ENDPOINTS = [
  // ── Transactions ──────────────────────────────────────────────────────────
  {
    id: 'get-transactions',
    group: 'Transactions',
    method: 'GET',
    path: '/api/transactions',
    title: 'List Transactions',
    description: 'Returns a paginated list of transactions. Supports filtering by search term, category, type, month/year, and sorting.',
    features: [
      'Full-text search across name and category',
      'Filter by category, type (income/expense), month and year',
      'Sort by newest, oldest, highest amount, or lowest amount',
      'Pagination via limit param',
    ],
    params: [
      { name: 'search', type: 'string', required: false, description: 'Search term matched against name and category' },
      { name: 'category', type: 'string', required: false, description: 'Filter by category (e.g. Food, Transport)' },
      { name: 'type', type: 'string', required: false, description: '"income" or "expense"' },
      { name: 'month', type: 'number', required: false, description: 'Month number 1–12' },
      { name: 'year', type: 'number', required: false, description: 'Four-digit year (e.g. 2026)' },
      { name: 'sort', type: 'string', required: false, description: '"newest" | "oldest" | "highest" | "lowest". Default: newest' },
      { name: 'limit', type: 'number', required: false, description: 'Max records to return. Default: 50' },
    ],
    body: null,
    response: `{
  "success": true,
  "data": [
    {
      "_id": "664abc123",
      "name": "Zomato Order",
      "amount": 420,
      "category": "Food",
      "type": "expense",
      "status": "completed",
      "date": "2026-04-03T00:00:00.000Z",
      "note": "Dinner"
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 50 }
}`,
    testFields: [
      { key: 'search', label: 'Search', type: 'text', placeholder: 'Zomato' },
      { key: 'category', label: 'Category', type: 'text', placeholder: 'Food' },
      { key: 'type', label: 'Type', type: 'select', options: ['', 'income', 'expense'] },
      { key: 'month', label: 'Month', type: 'number', placeholder: '4' },
      { key: 'year', label: 'Year', type: 'number', placeholder: '2026' },
      { key: 'sort', label: 'Sort', type: 'select', options: ['newest', 'oldest', 'highest', 'lowest'] },
      { key: 'limit', label: 'Limit', type: 'number', placeholder: '50' },
    ],
  },
  {
    id: 'get-transaction',
    group: 'Transactions',
    method: 'GET',
    path: '/api/transactions/:id',
    title: 'Get Transaction',
    description: 'Fetch a single transaction by its ID.',
    features: ['Returns full transaction details including notes and timestamps'],
    params: [
      { name: 'id', type: 'string', required: true, description: 'Transaction document ID (path param)' },
    ],
    body: null,
    response: `{
  "success": true,
  "data": {
    "_id": "664abc123",
    "name": "Netflix Subscription",
    "amount": 649,
    "category": "Entertainment",
    "type": "expense",
    "status": "completed",
    "date": "2026-04-01T00:00:00.000Z",
    "note": "Monthly plan"
  }
}`,
    testFields: [
      { key: ':id', label: 'Transaction ID', type: 'text', placeholder: '664abc123', inPath: true },
    ],
  },
  {
    id: 'create-transaction',
    group: 'Transactions',
    method: 'POST',
    path: '/api/transactions',
    title: 'Create Transaction',
    description: 'Create a new income or expense transaction record.',
    features: [
      'Automatically updates dashboard stats and category breakdown',
      'Accepts any custom category name',
      'Date defaults to today if omitted',
    ],
    params: [],
    body: {
      fields: [
        { name: 'name', type: 'string', required: true, description: 'Transaction title (e.g. "Zomato Order")' },
        { name: 'amount', type: 'number', required: true, description: 'Positive numeric value in ₹' },
        { name: 'category', type: 'string', required: true, description: 'Category label' },
        { name: 'type', type: 'string', required: true, description: '"income" or "expense"' },
        { name: 'status', type: 'string', required: false, description: '"completed" | "pending" | "chargeback". Default: completed' },
        { name: 'date', type: 'string', required: false, description: 'ISO date string. Defaults to today' },
        { name: 'note', type: 'string', required: false, description: 'Optional free-form note' },
      ],
      example: `{
  "name": "Zomato Order",
  "amount": 420,
  "category": "Food",
  "type": "expense",
  "status": "completed",
  "date": "2026-04-03",
  "note": "Dinner with team"
}`,
    },
    response: `{
  "success": true,
  "data": {
    "_id": "664xyz789",
    "name": "Zomato Order",
    "amount": 420,
    "category": "Food",
    "type": "expense",
    "status": "completed",
    "date": "2026-04-03T00:00:00.000Z",
    "note": "Dinner with team"
  }
}`,
    testFields: [
      { key: 'name', label: 'Name', type: 'text', placeholder: 'Zomato Order', inBody: true },
      { key: 'amount', label: 'Amount (₹)', type: 'number', placeholder: '420', inBody: true },
      { key: 'category', label: 'Category', type: 'text', placeholder: 'Food', inBody: true },
      { key: 'type', label: 'Type', type: 'select', options: ['expense', 'income'], inBody: true },
      { key: 'status', label: 'Status', type: 'select', options: ['completed', 'pending', 'chargeback'], inBody: true },
      { key: 'date', label: 'Date', type: 'date', inBody: true },
      { key: 'note', label: 'Note', type: 'text', placeholder: 'Optional…', inBody: true },
    ],
  },
  {
    id: 'update-transaction',
    group: 'Transactions',
    method: 'PUT',
    path: '/api/transactions/:id',
    title: 'Update Transaction',
    description: 'Update any fields of an existing transaction. Only include fields you want to change.',
    features: ['Partial updates supported — omit fields you do not want to change'],
    params: [
      { name: 'id', type: 'string', required: true, description: 'Transaction document ID (path param)' },
    ],
    body: {
      fields: [
        { name: 'name', type: 'string', required: false, description: 'New title' },
        { name: 'amount', type: 'number', required: false, description: 'New amount in ₹' },
        { name: 'category', type: 'string', required: false, description: 'New category' },
        { name: 'type', type: 'string', required: false, description: '"income" or "expense"' },
        { name: 'status', type: 'string', required: false, description: '"completed" | "pending" | "chargeback"' },
        { name: 'date', type: 'string', required: false, description: 'New ISO date string' },
        { name: 'note', type: 'string', required: false, description: 'Updated note' },
      ],
      example: `{
  "amount": 500,
  "status": "pending"
}`,
    },
    response: `{
  "success": true,
  "data": {
    "_id": "664abc123",
    "name": "Zomato Order",
    "amount": 500,
    "status": "pending"
  }
}`,
    testFields: [
      { key: ':id', label: 'Transaction ID', type: 'text', placeholder: '664abc123', inPath: true },
      { key: 'amount', label: 'Amount (₹)', type: 'number', placeholder: '500', inBody: true },
      { key: 'status', label: 'Status', type: 'select', options: ['', 'completed', 'pending', 'chargeback'], inBody: true },
    ],
  },
  {
    id: 'delete-transaction',
    group: 'Transactions',
    method: 'DELETE',
    path: '/api/transactions/:id',
    title: 'Delete Transaction',
    description: 'Permanently delete a transaction by ID. This action is irreversible.',
    features: ['Triggers cache invalidation — dashboard stats update automatically'],
    params: [
      { name: 'id', type: 'string', required: true, description: 'Transaction document ID (path param)' },
    ],
    body: null,
    response: `{
  "success": true,
  "message": "Transaction deleted"
}`,
    testFields: [
      { key: ':id', label: 'Transaction ID', type: 'text', placeholder: '664abc123', inPath: true },
    ],
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  {
    id: 'dashboard-stats',
    group: 'Dashboard',
    method: 'GET',
    path: '/api/dashboard/stats',
    title: 'Dashboard Stats',
    description: 'Returns aggregated financial statistics: total balance, income, expenses, and savings.',
    features: [
      'Computed across all transactions in the database',
      'Balance = total income − total expenses',
      'Savings estimated as a percentage of income after expenses',
    ],
    params: [],
    body: null,
    response: `{
  "success": true,
  "data": {
    "balance": 142500,
    "totalIncome": 280000,
    "totalExpenses": 137500,
    "totalSavings": 52000
  }
}`,
    testFields: [],
  },
  {
    id: 'dashboard-recent',
    group: 'Dashboard',
    method: 'GET',
    path: '/api/dashboard/recent',
    title: 'Recent Transactions',
    description: 'Returns the 5 most recent transactions for the dashboard activity feed.',
    features: ['Always sorted by date descending', 'Lightweight — only returns key display fields'],
    params: [],
    body: null,
    response: `{
  "success": true,
  "data": [
    {
      "_id": "664abc001",
      "name": "Spotify Premium",
      "amount": 119,
      "type": "expense",
      "date": "2026-04-04T00:00:00.000Z"
    }
  ]
}`,
    testFields: [],
  },

  // ── Charts ────────────────────────────────────────────────────────────────
  {
    id: 'charts-weekly',
    group: 'Charts',
    method: 'GET',
    path: '/api/charts/weekly',
    title: 'Weekly Cash Flow',
    description: 'Returns income and expense totals grouped by day for the current ISO week (Mon–Sun).',
    features: ['Used to render the weekly bar chart on the dashboard', 'Days with no transactions return 0'],
    params: [],
    body: null,
    response: `{
  "success": true,
  "data": [
    { "day": "Mon", "income": 0, "expense": 420 },
    { "day": "Tue", "income": 15000, "expense": 0 },
    { "day": "Wed", "income": 0, "expense": 1200 }
  ]
}`,
    testFields: [],
  },
  {
    id: 'charts-monthly',
    group: 'Charts',
    method: 'GET',
    path: '/api/charts/monthly',
    title: 'Monthly Cash Flow',
    description: 'Returns income and expense totals aggregated by month for the past 6 months.',
    features: ['Sorted chronologically oldest to newest', 'Used for trend analysis'],
    params: [],
    body: null,
    response: `{
  "success": true,
  "data": [
    { "month": "Nov", "income": 60000, "expense": 32000 },
    { "month": "Dec", "income": 72000, "expense": 45000 }
  ]
}`,
    testFields: [],
  },
  {
    id: 'charts-categories',
    group: 'Charts',
    method: 'GET',
    path: '/api/charts/categories',
    title: 'Category Breakdown',
    description: 'Returns expense totals grouped by category for the donut chart on the dashboard.',
    features: ['Only includes expense-type transactions', 'Returns top 5 categories by total spend'],
    params: [],
    body: null,
    response: `{
  "success": true,
  "data": [
    { "name": "Food", "value": 12400, "color": "#E86B6B" },
    { "name": "Transport", "value": 5200, "color": "#5046E4" },
    { "name": "Entertainment", "value": 3100, "color": "#7DB89A" }
  ]
}`,
    testFields: [],
  },
  {
    id: 'charts-category-trend',
    group: 'Charts',
    method: 'GET',
    path: '/api/charts/category-trend',
    title: 'Category Trend',
    description: 'Returns month-by-month spending totals for a specific category over the last 12 months. Powers the Trends chart on the Insights page.',
    features: [
      'Covers the trailing 12 months from today',
      'Months with no transactions return amount: 0',
      'Useful for spotting seasonal spending patterns per category',
    ],
    params: [
      { name: 'category', type: 'string', required: true, description: 'Category name to filter by (e.g. Food, Transport)' },
    ],
    body: null,
    response: `{
  "success": true,
  "data": [
    { "month": "May", "amount": 3200 },
    { "month": "Jun", "amount": 4100 },
    { "month": "Jul", "amount": 0 },
    { "month": "Aug", "amount": 2800 }
  ]
}`,
    testFields: [
      { key: 'category', label: 'Category', type: 'text', placeholder: 'Food' },
    ],
  },
];

const GROUPS = [...new Set(ENDPOINTS.map((e) => e.group))];

// ─── Helpers ────────────────────────────────────────────────────────────────

const METHOD_COLORS = {
  GET: 'bg-sage/15 text-sage',
  POST: 'bg-indigo-flovex/15 text-indigo-flovex',
  PUT: 'bg-amber-flovex/15 text-amber-flovex',
  DELETE: 'bg-rose-flovex/15 text-rose-flovex',
};

function MethodBadge({ method }) {
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg font-mono ${METHOD_COLORS[method]}`}>
      {method}
    </span>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-xs text-muted hover:text-dark transition-colors"
    >
      {copied ? <Check size={13} className="text-sage" /> : <Copy size={13} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function CodeBlock({ code }) {
  return (
    <div className="relative group">
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={code} />
      </div>
      <pre className="bg-[#0D0D14] text-white text-xs rounded-xl p-4 overflow-x-auto leading-relaxed font-mono">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
}

function buildCodeExamples(ep) {
  const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;

  // Build path (replace :id placeholder with example)
  const exampleId = '664abc123';
  const path = ep.path.replace(':id', exampleId);
  const url = `${baseUrl}${path}`;

  // Query string for GET with params
  const exampleParams = ep.params
    .filter((p) => !p.name.startsWith(':'))
    .filter((p) => !p.required)
    .slice(0, 2)
    .map((p) => `${p.name}=example`)
    .join('&');
  const queryStr = exampleParams ? `?${exampleParams}` : '';

  const bodyStr = ep.body ? ep.body.example : null;

  const curl = ep.method === 'GET'
    ? `curl "${url}${queryStr}"`
    : `curl -X ${ep.method} "${url}" \\
  -H "Content-Type: application/json" \\
  -d '${bodyStr || '{}'}'`;

  const js = ep.method === 'GET'
    ? `const res = await fetch("${url}${queryStr}");
const data = await res.json();
console.log(data);`
    : `const res = await fetch("${url}", {
  method: "${ep.method}",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(${bodyStr || '{}'}),
});
const data = await res.json();
console.log(data);`;

  const python = ep.method === 'GET'
    ? `import requests

r = requests.get("${url}${queryStr}")
print(r.json())`
    : `import requests

payload = ${bodyStr ? bodyStr.replace(/"/g, "'") : '{}'}
r = requests.${ep.method.toLowerCase()}("${url}", json=payload)
print(r.json())`;

  return { curl, js, python };
}

// ─── Interactive tester ─────────────────────────────────────────────────────

function TryItOut({ ep }) {
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const set = (k, v) => setValues((p) => ({ ...p, [k]: v }));

  const run = async () => {
    setLoading(true);
    setResult(null);

    let path = ep.path;
    const queryParams = new URLSearchParams();
    const body = {};

    for (const field of ep.testFields) {
      const val = values[field.key];
      if (!val && val !== 0) continue;

      if (field.inPath) {
        path = path.replace(field.key, val);
      } else if (field.inBody) {
        body[field.key] = isNaN(val) ? val : Number(val);
      } else {
        queryParams.set(field.key, val);
      }
    }

    const qs = queryParams.toString();
    const url = `/api${path.replace('/api', '')}${qs ? `?${qs}` : ''}`;

    try {
      const opts = {
        method: ep.method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (ep.method !== 'GET' && ep.method !== 'DELETE') {
        opts.body = JSON.stringify(body);
      }
      const res = await fetch(url, opts);
      setStatus(res.status);
      const json = await res.json();
      setResult(JSON.stringify(json, null, 2));
    } catch (err) {
      setStatus('ERR');
      setResult(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {ep.testFields.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {ep.testFields.map((field) => (
            <div key={field.key} className={field.type === 'text' && !field.placeholder?.includes('…') ? '' : ''}>
              <label className="text-xs font-medium text-muted mb-1 block">
                {field.label}
                {field.inPath && <span className="ml-1 text-rose-flovex">*path</span>}
              </label>
              {field.type === 'select' ? (
                <select
                  value={values[field.key] || ''}
                  onChange={(e) => set(field.key, e.target.value)}
                  className="w-full bg-cream border border-border rounded-xl px-3 py-2 text-sm text-dark outline-none focus:border-indigo-flovex/50 transition-colors"
                >
                  {field.options.map((o) => <option key={o} value={o}>{o || '— all —'}</option>)}
                </select>
              ) : (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={values[field.key] || ''}
                  onChange={(e) => set(field.key, e.target.value)}
                  className="w-full bg-cream border border-border rounded-xl px-3 py-2 text-sm text-dark outline-none focus:border-indigo-flovex/50 transition-colors"
                />
              )}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={run}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-flovex text-white text-sm font-semibold rounded-xl hover:bg-indigo-dim transition-colors disabled:opacity-60"
      >
        <Play size={14} />
        {loading ? 'Sending…' : 'Send Request'}
      </button>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-muted">Response</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${status >= 200 && status < 300 ? 'bg-sage/15 text-sage' : 'bg-rose-flovex/15 text-rose-flovex'}`}>
                {status}
              </span>
              <CopyButton text={result} />
            </div>
            <pre className="bg-[#0D0D14] text-white text-xs rounded-xl p-4 overflow-x-auto max-h-64 leading-relaxed font-mono">
              {result}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Endpoint detail ────────────────────────────────────────────────────────

const CODE_TABS = ['cURL', 'JavaScript', 'Python'];

function EndpointDetail({ ep }) {
  const [codeTab, setCodeTab] = useState('cURL');
  const [activeTab, setActiveTab] = useState('overview'); // overview | try
  const examples = buildCodeExamples(ep);
  const codeMap = { cURL: examples.curl, JavaScript: examples.js, Python: examples.python };

  return (
    <motion.div
      key={ep.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start gap-3">
        <MethodBadge method={ep.method} />
        <code className="text-sm font-mono text-dark bg-cream border border-border px-3 py-0.5 rounded-xl">
          {ep.path}
        </code>
      </div>
      <div>
        <h2 className="font-display font-bold text-xl text-dark">{ep.title}</h2>
        <p className="text-sm text-muted mt-1 leading-relaxed">{ep.description}</p>
      </div>

      {/* Features */}
      {ep.features.length > 0 && (
        <ul className="space-y-1.5">
          {ep.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-dark/80">
              <Zap size={13} className="text-indigo-flovex mt-0.5 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      )}

      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-border">
        {['Overview', 'Try It Out'].map((tab) => {
          const key = tab === 'Overview' ? 'overview' : 'try';
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === key
                  ? 'border-indigo-flovex text-indigo-flovex'
                  : 'border-transparent text-muted hover:text-dark'
              }`}
            >
              {tab === 'Try It Out' && <Play size={12} className="inline mr-1.5" />}
              {tab}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Query params */}
            {ep.params.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-dark mb-3 flex items-center gap-2">
                  <BookOpen size={14} className="text-muted" /> Query Parameters
                </h3>
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-cream">
                      <tr className="text-left text-muted font-semibold">
                        <th className="px-4 py-2.5">Name</th>
                        <th className="px-4 py-2.5">Type</th>
                        <th className="px-4 py-2.5">Required</th>
                        <th className="px-4 py-2.5">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ep.params.map((p, i) => (
                        <tr key={p.name} className={`border-t border-border ${i % 2 === 0 ? '' : 'bg-cream/40'}`}>
                          <td className="px-4 py-2.5 font-mono text-indigo-flovex">{p.name}</td>
                          <td className="px-4 py-2.5 text-muted">{p.type}</td>
                          <td className="px-4 py-2.5">
                            {p.required
                              ? <span className="text-rose-flovex font-semibold">Yes</span>
                              : <span className="text-muted">No</span>}
                          </td>
                          <td className="px-4 py-2.5 text-dark/80">{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Request body */}
            {ep.body && (
              <div>
                <h3 className="text-sm font-bold text-dark mb-3 flex items-center gap-2">
                  <BookOpen size={14} className="text-muted" /> Request Body
                </h3>
                <div className="rounded-xl border border-border overflow-hidden mb-3">
                  <table className="w-full text-xs">
                    <thead className="bg-cream">
                      <tr className="text-left text-muted font-semibold">
                        <th className="px-4 py-2.5">Field</th>
                        <th className="px-4 py-2.5">Type</th>
                        <th className="px-4 py-2.5">Required</th>
                        <th className="px-4 py-2.5">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ep.body.fields.map((f, i) => (
                        <tr key={f.name} className={`border-t border-border ${i % 2 === 0 ? '' : 'bg-cream/40'}`}>
                          <td className="px-4 py-2.5 font-mono text-indigo-flovex">{f.name}</td>
                          <td className="px-4 py-2.5 text-muted">{f.type}</td>
                          <td className="px-4 py-2.5">
                            {f.required
                              ? <span className="text-rose-flovex font-semibold">Yes</span>
                              : <span className="text-muted">No</span>}
                          </td>
                          <td className="px-4 py-2.5 text-dark/80">{f.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <CodeBlock code={ep.body.example} lang="json" />
              </div>
            )}

            {/* Response */}
            <div>
              <h3 className="text-sm font-bold text-dark mb-3 flex items-center gap-2">
                <BookOpen size={14} className="text-muted" /> Example Response
              </h3>
              <CodeBlock code={ep.response} lang="json" />
            </div>

            {/* Code examples */}
            <div>
              <h3 className="text-sm font-bold text-dark mb-3 flex items-center gap-2">
                <Code2 size={14} className="text-muted" /> Code Examples
              </h3>
              <div className="flex gap-1 mb-3">
                {CODE_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setCodeTab(tab)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      codeTab === tab
                        ? 'bg-[#1A1A1F] text-white'
                        : 'bg-cream border border-border text-muted hover:text-dark'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <CodeBlock code={codeMap[codeTab]} />
            </div>
          </motion.div>
        ) : (
          <motion.div key="try" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TryItOut ep={ep} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Mobile nav list ────────────────────────────────────────────────────────

function MobileNavList({ selected, onSelect }) {
  return (
    <div className="divide-y divide-border">
      {GROUPS.map((group) => (
        <div key={group}>
          <p className="px-4 py-2.5 text-[10px] font-bold text-muted uppercase tracking-widest bg-cream/60">
            {group}
          </p>
          {ENDPOINTS.filter((e) => e.group === group).map((ep) => (
            <button
              key={ep.id}
              onClick={() => onSelect(ep.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-border/50 last:border-0 ${
                selected === ep.id ? 'bg-indigo-flovex/5' : 'hover:bg-cream/60'
              }`}
            >
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono shrink-0 ${METHOD_COLORS[ep.method]}`}>
                {ep.method}
              </span>
              <span className={`text-sm flex-1 ${selected === ep.id ? 'font-semibold text-indigo-flovex' : 'text-dark'}`}>
                {ep.title}
              </span>
              <ChevronRight size={15} className="text-muted shrink-0" />
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────

export default function ApiDocs() {
  const [selected, setSelected] = useState(ENDPOINTS[0].id);
  const [openGroups, setOpenGroups] = useState(() => Object.fromEntries(GROUPS.map((g) => [g, true])));
  const [mobileView, setMobileView] = useState('nav'); // 'nav' | 'detail'

  const activeEp = ENDPOINTS.find((e) => e.id === selected);

  const toggleGroup = (g) => setOpenGroups((p) => ({ ...p, [g]: !p[g] }));

  const handleMobileSelect = (id) => {
    setSelected(id);
    setMobileView('detail');
  };

  return (
    <>
      {/* ── MOBILE LAYOUT (hidden on lg+) ──────────────────────────────── */}
      <div className="lg:hidden -mx-6 -mt-6">
        <AnimatePresence mode="wait">
          {mobileView === 'nav' ? (
            <motion.div
              key="mobile-nav"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="px-4 py-4 border-b border-border bg-card flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest">API Reference</p>
                  <p className="text-xs text-muted mt-0.5">v1.1 · {ENDPOINTS.length} endpoints</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-indigo-flovex/10 flex items-center justify-center">
                  <BookOpen size={15} className="text-indigo-flovex" />
                </div>
              </div>

              {/* AI Banner — compact mobile version */}
              <div className="mx-4 mt-4 mb-2 rounded-xl border border-indigo-flovex/20 bg-gradient-to-br from-indigo-flovex/5 via-card to-card p-3.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-flovex/10 flex items-center justify-center shrink-0">
                  <Sparkles size={14} className="text-indigo-flovex" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-dark">Build with AI Agents</p>
                  <p className="text-[11px] text-muted mt-0.5 leading-relaxed">Copy the full API prompt for Claude / ChatGPT</p>
                </div>
                <MobileCopyPromptButton />
              </div>

              {/* Endpoint list */}
              <MobileNavList selected={selected} onSelect={handleMobileSelect} />
            </motion.div>
          ) : (
            <motion.div
              key="mobile-detail"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}
            >
              {/* Back bar */}
              <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b border-border bg-cream/90 backdrop-blur">
                <button
                  onClick={() => setMobileView('nav')}
                  className="flex items-center gap-1.5 text-sm font-semibold text-indigo-flovex"
                >
                  <ChevronRight size={16} className="rotate-180" />
                  All Endpoints
                </button>
                {activeEp && (
                  <>
                    <span className="text-muted text-xs">/</span>
                    <span className="text-xs font-medium text-dark truncate">{activeEp.title}</span>
                  </>
                )}
              </div>

              {/* Detail content */}
              <div className="p-4">
                {activeEp && <EndpointDetail key={activeEp.id} ep={activeEp} />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── DESKTOP LAYOUT (hidden below lg) ───────────────────────────── */}
      <div className="hidden lg:flex gap-0 -m-6 min-h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className="w-60 shrink-0 border-r border-border bg-card sticky top-[73px] self-start h-[calc(100vh-73px)] overflow-y-auto">
          <div className="p-4 border-b border-border">
            <p className="text-xs font-bold text-muted uppercase tracking-widest">API Reference</p>
            <p className="text-xs text-muted mt-0.5">v1.1 · {ENDPOINTS.length} endpoints</p>
          </div>
          <nav className="p-2">
            {GROUPS.map((group) => (
              <div key={group} className="mb-1">
                <button
                  onClick={() => toggleGroup(group)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-dark uppercase tracking-wider hover:bg-cream rounded-lg transition-colors"
                >
                  {group}
                  <ChevronRight
                    size={13}
                    className={`text-muted transition-transform ${openGroups[group] ? 'rotate-90' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {openGroups[group] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      {ENDPOINTS.filter((e) => e.group === group).map((ep) => (
                        <button
                          key={ep.id}
                          onClick={() => setSelected(ep.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors text-left ${
                            selected === ep.id
                              ? 'bg-indigo-flovex/10 text-indigo-flovex font-semibold'
                              : 'text-muted hover:text-dark hover:bg-cream'
                          }`}
                        >
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono shrink-0 ${METHOD_COLORS[ep.method]}`}>
                            {ep.method}
                          </span>
                          <span className="truncate">{ep.title}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 min-w-0">
          <AiPromptBanner />
          {activeEp && <EndpointDetail key={activeEp.id} ep={activeEp} />}
        </main>
      </div>
    </>
  );
}

// ─── Mobile copy-prompt button (inline, no dismissed state) ─────────────────

function MobileCopyPromptButton() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(AI_AGENT_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-flovex text-white text-xs font-semibold transition-colors"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}
