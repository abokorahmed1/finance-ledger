# Finance Ledger

Personal finance tracker — income, expenses, inventory, debts, UK tax year quarters. All data stored locally in IndexedDB (browser). No server, no accounts, no cloud.

## Run locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

## Deploy

```bash
npm run build
# Deploy dist/ to Vercel, Netlify, or any static host
```

## Stack

- React + Vite
- Tailwind CSS
- Dexie.js (IndexedDB wrapper — persistent local database)
- Recharts (dashboard charts)
- PapaParse (CSV import)

## Features

- **Dashboard** — KPI islands (earned, spent, net, stock value), monthly chart, top spending categories
- **Ledger** — full transaction list with manual add/edit, bank/category/type tagging
- **Inventory** — stock items with cost/list price, platform, status tracking
- **Debts** — creditor tracking with payment logging and progress bars
- **Import** — CSV drag-and-drop parser for UK bank exports (Monzo, Starling, Nationwide, Revolut)
- **UK tax year** — Q1–Q4 quarterly filtering (6 Apr – 5 Apr)
