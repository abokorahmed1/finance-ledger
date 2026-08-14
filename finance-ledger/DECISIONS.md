# Decisions

| Date | Decision | Why |
|------|----------|-----|
| 2026-08-13 | IndexedDB via Dexie over SQLite | Browser-native, no backend needed, persists across sessions, matches drivers-mate pattern |
| 2026-08-13 | React + Vite over Next.js | Lighter, faster, static deploy — no SSR needed for a personal tool |
| 2026-08-13 | UK tax year Q1-Q4 (Apr-Mar) built-in | All filtering aligned to HMRC tax year, not calendar year |
| 2026-08-13 | CSV import first, API hooks stubbed | Quick wins now; TrueLayer/Plaid integration designed but not wired |
| 2026-08-13 | Dark navy theme | Matches drivers-mate look, consistent brand across tools |
| 2026-08-14 | Build tooling in `dependencies`, not `devDependencies` | Vercel builds with `NODE_ENV=production`, which makes npm skip devDependencies — only 49 of 176 packages installed and `vite` was missing, so `vite build` failed with exit 127 |
| 2026-08-14 | `vercel.json` committed to repo | Pins framework/build/output in source so deploys don't depend on dashboard settings drifting |
| 2026-08-14 | `.gitignore` added | Repo had none; `.env.local` (contains VERCEL_OIDC_TOKEN) and `node_modules/` were at risk of being committed |
