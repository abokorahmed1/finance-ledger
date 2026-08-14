# Progress

## Done
- [x] Project scaffold (React + Vite + Tailwind)
- [x] IndexedDB schema (transactions, inventory, sales, debts)
- [x] Dashboard with KPI islands, monthly chart, category breakdown
- [x] Ledger screen — full CRUD, quarter filtering
- [x] Inventory screen — stock tracking with status, cost/list, platform
- [x] Debts screen — creditor tracking with payment logging
- [x] CSV import screen — drag-and-drop parser for UK bank exports
- [x] UK tax year utility (Q1–Q4 filtering)
- [x] Dark navy theme, mobile-first layout
- [x] Vercel build config fixed (deps moved out of devDependencies, vercel.json, .gitignore)

## Doing
- [ ] Deploy to Vercel — build verified green locally under production conditions; run `vercel --prod`

## Next
- [ ] eBay/Vinted sales CSV parser (platform-specific columns)
- [ ] Bank statement reconciliation view
- [ ] Open Banking API stubs (TrueLayer)
- [ ] Data export (JSON backup / restore)
- [ ] PWA manifest for add-to-home-screen
- [ ] Code-split the 678 kB bundle (Recharts is the bulk of it)
