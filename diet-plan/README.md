# Level 1 — Week One

Seven-day diet and steps tracker. Static site, installable as an app (PWA).

- `index.html` — the whole page and tracker logic
- `manifest.webmanifest` / `sw.js` / `icon.svg` — install + offline support

Progress is saved in the browser's localStorage on the device.

## Run locally

    python3 -m http.server 8000 --directory diet-plan

Then open http://localhost:8000

## Deploy

Serve the `diet-plan` folder as static files over HTTPS (Vercel, Netlify, GitHub Pages).
The service worker and "Install app" button only activate over HTTPS or localhost.
