# Level 1 — Week One

Seven-day diet and steps tracker. Static site, installable as an app (PWA).

- `index.html` — the whole page and tracker logic
- `manifest.webmanifest` / `sw.js` / `icon.svg` — install + offline support

Progress is saved on the device. Fill in `config.js` with a Supabase project
and it also saves to that database, so a client's week follows him between
devices and shows up live on the coach dashboard.

- `coach.html` — every client's week on one page, updating live
- `supabase-setup.sql` — run once in the Supabase SQL editor
- `config.js` — your Supabase URL and anon key

Each client gets their own link: `.../index.html?c=their-name`. Without a
`?c=` the app uses the slug `demo`. Anyone holding the link (and the public
anon key, which ships in the page) can read and write that client's row — the
link is the only secret, so treat it like one and use unguessable slugs for
anything sensitive.

## Run locally

    python3 -m http.server 8000 --directory diet-plan

Then open http://localhost:8000

## Deploy

Serve the `diet-plan` folder as static files over HTTPS (Vercel, Netlify, GitHub Pages).
The service worker and "Install app" button only activate over HTTPS or localhost.
