# Bassett ColorFlex — local only (no Shopify)

Run at **http://localhost:3333**. No Shopify deploy.

## One-way workflow (two repos)

- **colorflex2** — Shared code (CFM.js, etc.), webpack build, Shopify theme. **Do not deploy Bassett to Shopify from here.** When you change shared code, build and **sync** into colorflex2-bassett.
- **colorflex2-bassett** — Day-to-day Bassett work. Run the server here. Config here (`config/local.env`). The server **only** serves from this repo; no auto-detection of colorflex2.

### When you change shared code (CFM.js, app code)

1. In **colorflex2**: build and sync to colorflex2-bassett:
   ```bash
   cd /Volumes/K3/jobs/colorflex2
   node scripts/sync-bassett-to-bassett-repo.js
   ```
   This builds the bundle and HTML, then copies `color-flex-bassett.min.js`, `bassett-local/index.html`, and `bassett-local/server.js` into colorflex2-bassett.

2. In **colorflex2-bassett**: restart the server if it’s running. No need to touch colorflex2 again until the next shared-code change.

### Daily Bassett work (templates, server tweaks, testing)

Work only in **colorflex2-bassett**:

```bash
cd /Volumes/K3/jobs/colorflex2-bassett
node bassett-local/server.js
```

Open **http://localhost:3333**. Config: `config/local.env` in this repo (`COLORFLEX_DATA_PATH`, `BASSETT_MOCKUPS_PATH`, etc.).

---

## Running from colorflex2 only (no second repo)

```bash
cd /Volumes/K3/jobs/colorflex2
npm run build && node scripts/build-bassett-local-html.js
node bassett-local/server.js
```

Then open **http://localhost:3333**.

---

## Config

In the repo you run the server from, set in `config/local.env`:

- **COLORFLEX_DATA_PATH** — folder that contains `data/` (e.g. `data/collections.json`).
- **BASSETT_MOCKUPS_PATH** — folder with layer PNGs: `beauty.png`, `sofa_disp.png`, `pillow1_disp.png`, etc.

Optional: **BASSETT_REPO_ROOT** — if set, the server loads that repo’s config and serves assets from there (override; not needed for the one-way workflow above).

## Env vars (reference)

| Variable | Purpose |
|----------|---------|
| COLORFLEX_DATA_PATH | Folder containing `data/` (collections, etc.). |
| BASSETT_MOCKUPS_PATH | Folder with layer PNGs for room preview. |
| BASSETT_REPO_ROOT | Optional: use another repo for config + assets. |
| BASSETT_LOCAL_PORT | Port (default 3333). |

## After template changes (HTML)

If you edit the Bassett HTML template in colorflex2, rebuild and sync:

```bash
cd /Volumes/K3/jobs/colorflex2
node scripts/sync-bassett-to-bassett-repo.js
```

If you only run from colorflex2, run `node scripts/build-bassett-local-html.js` there and restart the server.
