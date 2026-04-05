# Flovex — Backend

Express + MongoDB REST API for the Flovex financial dashboard. Serves transaction data, dashboard stats, chart aggregations, and subscription management.

---

## Tech Stack

| Concern      | Library / Tool         |
|--------------|------------------------|
| Runtime      | Node.js 18+            |
| Framework    | Express 4              |
| Database     | MongoDB + Mongoose 8   |
| Scheduling   | node-cron              |
| Env config   | dotenv                 |
| Dev server   | nodemon                |

---

## Project Structure

```
flovex-server/
├── src/
│   ├── controllers/       # Route handler logic
│   ├── data/
│   │   └── seed.js        # Database seed script (33 realistic transactions)
│   ├── jobs/
│   │   └── processSubscriptions.js  # Cron job logic
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── models/            # Mongoose schemas (Transaction, Subscription)
│   └── routes/            # Express routers
│       ├── transactions.js
│       ├── dashboard.js
│       ├── charts.js
│       └── subscriptions.js
├── .env                   # Local environment variables (git-ignored)
├── .env.example           # Template — copy to .env and fill in values
├── server.js              # App entry point
└── package.json
```

---

## Local Development

### Prerequisites

- Node.js 18+
- MongoDB (local instance **or** a MongoDB Atlas connection string)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your local env file
cp .env.example .env
# Edit .env — set MONGODB_URI to your local or Atlas URI

# 3. Seed the database with 33 sample transactions
npm run seed

# 4. Start the dev server (nodemon, auto-restarts on changes)
npm run dev
# → http://localhost:5001
```

### Available Scripts

| Script         | Description                                       |
|----------------|---------------------------------------------------|
| `npm run dev`  | Start with nodemon (auto-reload on file changes)  |
| `npm start`    | Start with plain node (production mode)           |
| `npm run seed` | Seed the database with sample data                |

---

## Environment Variables

| Variable           | Required | Description                                                   |
|--------------------|----------|---------------------------------------------------------------|
| `PORT`             | No       | Port to listen on (default: `5001`). Render sets this automatically. |
| `MONGODB_URI`      | Yes      | MongoDB connection string                                     |
| `NODE_ENV`         | No       | `development` or `production`                                 |
| `ALLOWED_ORIGINS`  | Yes (prod) | Comma-separated frontend URLs allowed by CORS               |

Example `.env` for local development:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/flovex
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5700
```

---

## API Reference

### Transactions

| Method | Endpoint                   | Description                                                              |
|--------|----------------------------|--------------------------------------------------------------------------|
| GET    | `/api/transactions`        | List all. Query params: `search`, `category`, `type`, `sort`, `page`, `limit` |
| POST   | `/api/transactions`        | Create a transaction                                                     |
| GET    | `/api/transactions/:id`    | Get single transaction                                                   |
| PUT    | `/api/transactions/:id`    | Update transaction                                                       |
| DELETE | `/api/transactions/:id`    | Delete transaction                                                       |

### Dashboard

| Method | Endpoint                   | Description                                          |
|--------|----------------------------|------------------------------------------------------|
| GET    | `/api/dashboard/stats`     | Balance, income, expenses, savings, savings rate     |
| GET    | `/api/dashboard/recent`    | 5 most recent transactions                          |

### Charts

| Method | Endpoint                           | Description                          |
|--------|------------------------------------|--------------------------------------|
| GET    | `/api/charts/weekly`               | Last 7 days income vs expense        |
| GET    | `/api/charts/monthly`              | Last 6 months summary                |
| GET    | `/api/charts/categories`           | Spending breakdown by category       |
| GET    | `/api/charts/category-trend`       | Trend for a single category (`?category=`) |
| GET    | `/api/charts/all-categories`       | List of all distinct categories      |

### Subscriptions

| Method | Endpoint                           | Description                          |
|--------|------------------------------------|--------------------------------------|
| GET    | `/api/subscriptions`               | List all subscriptions               |
| POST   | `/api/subscriptions`               | Create a subscription                |
| GET    | `/api/subscriptions/:id`           | Get single subscription              |
| PUT    | `/api/subscriptions/:id`           | Update subscription                  |
| DELETE | `/api/subscriptions/:id`           | Delete subscription                  |
| POST   | `/api/subscriptions/process-due`   | Manually trigger billing cycle       |

### Health

```
GET /api/health
→ { "status": "ok", "message": "Flovex API is running" }
```

---

## Deploying to Render

### Step 1 — Push to GitHub

Make sure the `flovex-server` directory (or the whole monorepo) is on GitHub.

### Step 2 — Create a new Web Service on Render

1. Go to [render.com](https://render.com) and sign in.
2. Click **New → Web Service**.
3. Connect your GitHub repository.

### Step 3 — Configure the service

| Field                  | Value                              |
|------------------------|------------------------------------|
| **Name**               | `flovex-api` (or any name you like) |
| **Region**             | Closest to your users              |
| **Branch**             | `main`                             |
| **Root Directory**     | `flovex-server`                    |
| **Runtime**            | `Node`                             |
| **Build Command**      | `npm install`                      |
| **Start Command**      | `npm start`                        |
| **Instance Type**      | Free (or Starter for always-on)    |

### Step 4 — Add environment variables

In the **Environment** tab, add the following key-value pairs:

| Key                | Value                                              |
|--------------------|----------------------------------------------------|
| `MONGODB_URI`      | Your full MongoDB Atlas connection string          |
| `NODE_ENV`         | `production`                                       |
| `ALLOWED_ORIGINS`  | `https://your-app.vercel.app` (your Vercel URL)    |

> Do **not** set `PORT` — Render injects it automatically.

### Step 5 — Deploy

Click **Create Web Service**. Render will install dependencies and start the server. The service URL will be something like:

```
https://flovex-api.vercel.app
```

Copy this URL — you'll need it as `VITE_API_URL` in your Vercel frontend config.

### Step 6 — Seed production data (optional)

After the service is live, you can run the seed script once via Render's Shell tab:

```bash
npm run seed
```

### Important notes on the Free tier

- Free Render instances **spin down after 15 minutes of inactivity**. The first request after a sleep takes ~30 seconds to respond. Upgrade to Starter ($7/month) for always-on behaviour.
- The daily cron job (`5 0 * * *`) that processes subscriptions runs inside the Node process — it will only fire if the service is awake. On the Free tier, consider triggering it manually via `POST /api/subscriptions/process-due` or using an external cron service (e.g. cron-job.org) to keep the service warm.

---

## Cron Job

A `node-cron` schedule fires every day at 00:05 server time:

```
5 0 * * *  →  processSubscriptions()
```

It checks all active subscriptions with a `nextBillingDate` in the past, creates the corresponding transaction records, and advances `nextBillingDate` to the next cycle.
