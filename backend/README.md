# Teacher Dashboard Backend (Cloudflare Worker)

The Unit 1 dashboard works **without** this backend, using bundled, clearly
labelled catalog snapshots and a built-in astronomy calculation library.

This Worker is only needed to enable **live refresh** of upstream services that
do not send CORS headers to browsers:

| Upstream | Used for | CORS? |
|----------|----------|-------|
| NASA Exoplanet Archive TAP | Panels D & E (live catalog) | ❌ none |
| JPL SBDB | Panel C (live Borrelly elements) | ❌ none |
| NOAA SWPC GOES | Panel A | ✅ works directly, no proxy |

The Worker is **not an open proxy**: all upstream queries are validated and
bounded in `worker.js`.

## Endpoints

- `GET /health`
- `GET /exoplanet/curated` — fixed, curated list (client cannot inject SQL)
- `GET /sbdb?obj=19P` — allowlisted objects only

## Deployment (manual — do not auto-deploy)

1. `cd backend`
2. `cp wrangler.toml.example wrangler.toml`
3. Set `ALLOWED_ORIGINS` to your deployed textbook origin, e.g.
   `https://billmiky.github.io` (use `*` only for local development).
4. Install Wrangler: `npm install -g wrangler` (or `npx wrangler`).
5. Log in: `wrangler login`
6. Deploy: `wrangler deploy`
7. Copy the returned `https://<name>.<account>.workers.dev` URL.

## Point the frontend at the backend

Either:
- Open the dashboard with `?backend=<worker-url>`, e.g.
  `teacher/unit1-dashboard/index.html?backend=https://name.account.workers.dev`,
  or
- In the dashboard, open **⚙ Settings** and enter the backend URL.

The frontend still falls back to its bundled snapshots (labelled "bundled") if
the backend is unreachable — it never silently substitutes demo data.

## Local development

```
cd backend
npx wrangler dev
```

Then open the dashboard with `?backend=http://127.0.0.1:8787` and set
`ALLOWED_ORIGINS = "*"` in `wrangler.toml` for local dev.

## Security notes

- The Worker is intentionally **unauthenticated** — it exposes only public,
  read-only catalog data. Do not extend it with credentials or open queries.
- Keep `ALLOWED_ORIGINS` as narrow as possible in production.
- Responses are cached (24 h for the catalog, 7 days for SBDB elements) to
  avoid repeatedly downloading large datasets.
