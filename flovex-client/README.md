# Flovex — Frontend

React 18 + Vite frontend for the Flovex financial dashboard. Connects to the [flovex-server](../flovex-server) REST API.

---

## Tech Stack

| Concern        | Library                          |
|----------------|----------------------------------|
| UI Framework   | React 18                         |
| Build Tool     | Vite 5                           |
| Styling        | Tailwind CSS 3                   |
| Animations     | Framer Motion 11                 |
| Charts         | Recharts 2                       |
| State / Data   | Redux Toolkit + RTK Query        |
| Routing        | React Router DOM v6              |
| Icons          | Lucide React                     |

---

## Project Structure

```
flovex-client/
├── public/
├── src/
│   ├── components/        # Shared UI components (cards, modals, sidebar, etc.)
│   ├── hooks/             # Custom React hooks (useCountUp, etc.)
│   ├── pages/             # Route-level page components
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Transactions.jsx
│   │   ├── Insights.jsx
│   │   ├── Subscriptions.jsx
│   │   └── Settings.jsx
│   ├── store/
│   │   ├── api/           # RTK Query service definitions
│   │   │   ├── transactionsApi.js
│   │   │   ├── dashboardApi.js
│   │   │   ├── chartsApi.js
│   │   │   └── subscriptionsApi.js
│   │   └── index.js       # Redux store setup
│   ├── styles/            # Global CSS / Tailwind base styles
│   ├── App.jsx            # Router and layout shell
│   └── main.jsx           # Entry point
├── .env.example           # Environment variable template
├── vercel.json            # Vercel SPA routing config
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Local Development

### Prerequisites

- Node.js 18+
- The [flovex-server](../flovex-server) running on `http://localhost:5001`

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy the env template (no changes needed for local dev)
cp .env.example .env

# 3. Start the dev server
npm run dev
# → http://localhost:5700
```

The Vite proxy in [vite.config.js](vite.config.js) forwards all `/api/*` requests to `http://localhost:5001` automatically — `VITE_API_URL` does **not** need to be set locally.

### Available Scripts

| Script          | Description                              |
|-----------------|------------------------------------------|
| `npm run dev`   | Start Vite dev server with HMR           |
| `npm run build` | Production build to `dist/`             |
| `npm run preview` | Preview the production build locally  |

---

## Environment Variables

| Variable        | Required in production | Description                                        |
|-----------------|------------------------|----------------------------------------------------|
| `VITE_API_URL`  | Yes                    | Full URL of the backend, e.g. `https://flovex-api.onrender.com` (no trailing slash) |

In development, leave `VITE_API_URL` empty — the Vite proxy handles routing.

---

## Deploying to Vercel

### Step 1 — Push to GitHub

Make sure your code is in a GitHub repository.

### Step 2 — Create a new Vercel project

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **Add New → Project**.
3. Import your GitHub repository.

### Step 3 — Configure the project

On the configuration screen:

| Field               | Value                        |
|---------------------|------------------------------|
| **Framework Preset**| Vite                         |
| **Root Directory**  | `flovex-client`              |
| **Build Command**   | `npm run build`              |
| **Output Directory**| `dist`                       |

### Step 4 — Add the environment variable

In the **Environment Variables** section, add:

```
VITE_API_URL = https://your-render-service.onrender.com
```

Replace the URL with your actual Render backend URL (see [flovex-server README](../flovex-server/README.md)).

### Step 5 — Deploy

Click **Deploy**. Vercel will build and deploy the app. Subsequent pushes to `main` trigger automatic redeployments.

### How SPA routing works on Vercel

The [vercel.json](vercel.json) file contains a single rewrite rule:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This ensures that all routes (e.g. `/dashboard/transactions`) are served by `index.html` so React Router can handle them client-side. Without this, refreshing any non-root page would return a 404.

---

## Role-Based Access

The app supports two roles selected at `/login`. Role is stored in `localStorage` and persists across refreshes.

| Feature              | Admin | Viewer |
|----------------------|:-----:|:------:|
| View dashboard       | ✓     | ✓      |
| View transactions    | ✓     | ✓      |
| Add transaction      | ✓     | ✗      |
| Edit transaction     | ✓     | ✗      |
| Delete transaction   | ✓     | ✗      |
| Export CSV           | ✓     | ✗      |
| Manage subscriptions | ✓     | ✗      |

---

## Pages

| Route                        | Description                                    |
|------------------------------|------------------------------------------------|
| `/`                          | Landing page with animated hero                |
| `/login`                     | Role selection (Admin / Viewer)                |
| `/dashboard`                 | Overview — stats cards, charts, recent tx      |
| `/dashboard/transactions`    | Full CRUD table (mutations gated to Admin)     |
| `/dashboard/insights`        | Charts, savings ring, AI-style insights        |
| `/dashboard/subscriptions`   | Recurring billing tracker                      |
| `/dashboard/settings`        | Role toggle, CSV export                        |
