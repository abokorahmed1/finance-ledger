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
- **Import** — CSV drag-and-drop for UK bank exports (Monzo, Starling, Nationwide, Revolut) and for inventory
- **UK tax year** — Q1–Q4 quarterly filtering (6 Apr – 5 Apr)

## Stock list

`public/inventory.csv` is the current stock list (22 rows / 86 units). Meta
glasses are one row per pair; everything else is one row per variant with the
count in `qty`.

It ships with the build, so an empty Inventory screen shows **Load my stock
list** — one tap imports the whole file. It can also be dropped into
**Import → Inventory**, along with any other CSV using these columns:

| Column | Notes |
| --- | --- |
| `name` | Required. Rows without a name are skipped. |
| `purchasePrice` / `listPrice` | Blank → 0 |
| `qty` | Blank → 1 |
| `platform` | eBay / Vinted / Facebook / In-Person / Other (unknown → Other) |
| `status` | InStock / Listed / Sold (unknown → InStock) |
| `category` | Free text, shown on the item card |
| `notes` | Free text |

Importing appends — running it twice creates duplicates.
