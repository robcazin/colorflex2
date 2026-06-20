# ColorFlex — Service Providers & Credentials Map

**Purpose:** Single reference for every external service tied to this project, where credentials live, and which URLs matter.

> **Security:** This file lists *where* secrets are stored, never the secrets themselves. Rotate anything that has ever been committed to git (see [Credential hygiene](#credential-hygiene)).

---

## Credential files (summary)

| File | Git status | Used for |
|------|------------|----------|
| `config/local.env` | **Ignored** | Primary local secrets: Shopify theme deploy, B2, Airtable, SSH deploy keys, data paths |
| `config/shopify.json` | **Ignored** | Shopify store/theme config (optional; scripts may fall back to hardcoded store) |
| `api/.env` | **Ignored** | Railway API service (`SHOPIFY_ACCESS_TOKEN`, `ALLOWED_ORIGINS`, etc.) |
| `.env` (repo root) | **Ignored** | Occasionally loaded by Node scripts alongside `config/local.env` |
| `docs/saffron cottage credentials.md` | **Tracked in git** ⚠️ | Legacy notes — may contain live creds; prefer `config/local.env` and consider rotating anything still in this file |

Scripts load env via `dotenv` from `config/local.env`, `api/.env`, and sometimes root `.env` (see `update-collection.sh`, `src/scripts/cf-dl.js`).

---

## 1. Shopify — Saffron Cottage (live store)

| | |
|---|---|
| **Role** | Production e-commerce + ColorFlex theme (Liquid, assets, cart, custom sample PDP) |
| **Storefront** | https://saffroncottage.shop |
| **Admin** | https://f63bae-86.myshopify.com/admin |
| **Live theme** | Theme `#150150381799` on `f63bae-86.myshopify.com` |
| **Theme root in repo** | `src/` |
| **Deploy** | `./deploy-shopify-cli.sh`, `./deploy-one-off.sh` |
| **Docs** | `docs/COLLECTION_AND_SHOPIFY_WORKFLOW.md`, `docs/DEPLOYMENT.md`, `docs/CART_INTEGRATION_GUIDE.md` |

**Env vars (in `config/local.env`):**
- `SHOPIFY_THEME_PASSWORD` — Theme Kit / CLI theme push
- `SHOPIFY_STORE` / `SHOPIFY_STORE_URL` — store handle
- `SHOPIFY_ACCESS_TOKEN` — Admin API (also in `api/.env` for Railway)

**Related (checkout — no separate project creds):** PayPal, Stripe, Braintree run through Shopify Payments / checkout CSP.

---

## 2. Backblaze B2 — ColorFlex data (images + collections.json)

| | |
|---|---|
| **Role** | Public object storage for `cf-data` (collections, layers, thumbnails, mockups, Mohawk assets) |
| **Bucket** | `cf-data` |
| **Public base URL** | https://s3.us-east-005.backblazeb2.com/cf-data/ |
| **Console** | https://secure.backblazeb2.com |
| **Docs** | `docs/BACKBLAZE_CORS_FIX.md`, `docs/DATA_AND_CORS.md`, `docs/ColorFlex-layer-pipeline-and-CORS-policy.md` |

**Env vars (in `config/local.env`):**
- `B2_KEY_ID` / `B2_APPLICATION_KEY_ID`
- `B2_APPLICATION_KEY`
- `B2_BUCKET_NAME`
- `COLORFLEX_DATA_BASE_URL` — public URL prefix used by theme/runtime (must allow browser CORS or go through Cloudflare Worker)

**Local data mirror (not a cloud login):** `/Volumes/jobs/cf-data` (or `COLORFLEX_DATA_PATH`) — Synology sync → B2.

---

## 3. Bluehost — so-animation.com (your server)

| | |
|---|---|
| **Role** | Shared hosting for studio site + static ColorFlex demos + rsync deploy target |
| **Site** | https://so-animation.com |
| **SSH** | `soanimat@162.241.24.65` port `2222` |
| **Web root** | `/home4/soanimat/public_html/` |
| **ColorFlex app path** | `public_html/colorflex/` → https://so-animation.com/colorflex/ |
| **Static demos** | `public_html/dist-mohawk-room/`, `public_html/archive-cat/`, etc. |
| **Deploy (automated)** | `./deploy.sh` (SSH/rsync; reads deploy key from `config/local.env`) |
| **Deploy (static folders)** | cPanel File Manager — see `trade-show-local/BLUEHOST_SHARED_HOSTING_UPLOAD.md` |

**Env vars (in `config/local.env`):**
- `COLORFLEX_SERVER_KEY` and/or `COLORFLEX_DEPLOY_KEY` — SSH private key material for rsync deploy

**cPanel / FTP:** If stored, may be in `config/local.env` or legacy `docs/saffron cottage credentials.md` (rotate if ever committed).

---

## 4. Railway — Order thumbnail API

| | |
|---|---|
| **Role** | Node API: browser uploads custom pattern thumbnail → Shopify Files → CDN URL for cart/orders |
| **Production URL** | https://colorflex2-production.up.railway.app |
| **Health check** | https://colorflex2-production.up.railway.app/api/health |
| **Main endpoint** | `POST /api/upload-thumbnail` |
| **Code** | `api/server.js` |
| **Config** | `api/railway.json` |
| **Docs** | `api/RAILWAY_SETUP.md`, `api/DEPLOYMENT.md`, `api/ORDER_THUMBNAIL_SETUP.md` |

**Env vars (Railway dashboard + `api/.env` locally):**
- `SHOPIFY_STORE` — must be `f63bae-86` (myshopify handle, not custom domain)
- `SHOPIFY_ACCESS_TOKEN` — Admin API token with Files / staged upload scopes
- `ALLOWED_ORIGINS` — e.g. `https://saffroncottage.shop`
- `PORT` — set by Railway at runtime

**Theme wiring:** `window.COLORFLEX_API_URL` in theme Liquid points at Railway (or ngrok during dev).

---

## 5. Cloudflare — CORS proxy (Workers)

| | |
|---|---|
| **Role** | Proxy B2/cf-data requests with correct CORS headers for Shopify storefront |
| **Worker (known)** | https://colorflex-cors-proxy.rob-e06.workers.dev |
| **Optional custom domain** | https://colorflex-proxy.saffroncottage.shop (or `data.saffroncottage.shop`) |
| **Console** | https://dash.cloudflare.com |
| **Worker script in repo** | `scripts/cf-cors-proxy-worker.js` |
| **Docs** | `docs/CLOUDFLARE_CORS_PROXY.md`, `docs/CORS_QUICK_FIX.md` |

**Credentials:** Cloudflare account API token / login (not in repo — Cloudflare dashboard).

**Theme setting:** Shopify **Theme settings → ColorFlex → ColorFlex data base URL** → Worker URL (no trailing slash).

---

## 6. Airtable — Collection & pattern source

| | |
|---|---|
| **Role** | Master data for collections, patterns, images, metadata; feeds `cf-dl.js` / `update-collection.sh` |
| **Console** | https://airtable.com |
| **Docs** | `docs/ADD_NEW_COLLECTION_FROM_AIRTABLE.md` |

**Env vars (in `config/local.env` and/or `api/.env`):**
- `AIRTABLE_PAT` — Personal Access Token (**required** by update scripts)
- `AIRTABLE_BASE_ID` / `AIRTABLE_BASE`
- `AIRTABLE_API_KEY` — legacy name; prefer `AIRTABLE_PAT`

**Update scripts:** `./update-collection.sh complete <collection>`, `./update-collection.sh metadata <collection>`

---

## 7. GitHub — Source control

| | |
|---|---|
| **Role** | Git repository for ColorFlex codebase |
| **Repo** | https://github.com/robcazin/colorflex2 |
| **Legacy repo (mentioned)** | https://github.com/robcazin/colorFlex-shopify |
| **Docs** | `docs/GIT_BRANCH_WORKFLOW.md`, `docs/GIT_LOCAL_WORKFLOW.md` |

**Credentials:** SSH key or GitHub PAT on developer machine (not in repo).

---

## 8. Synology NAS — Local data volume (sync hub)

| | |
|---|---|
| **Role** | Canonical local `cf-data` tree; Cloud Sync pushes to Backblaze B2 |
| **Typical path** | `/Volumes/jobs/cf-data` (mounted from Synology) |
| **Env** | `COLORFLEX_DATA_PATH` in `config/local.env` |

Not a cloud API credential in the project — access is via local mount / Synology account.

---

## 9. ngrok — Local dev tunnel (optional)

| | |
|---|---|
| **Role** | Expose local `api/server.js` (port 3001) to test thumbnail upload before Railway deploy |
| **Console** | https://dashboard.ngrok.com |
| **Docs** | `api/NGROK_SETUP.md`, `api/NGROK_TESTING.md` |

**Credentials:** ngrok authtoken (ngrok account, typically `~/.ngrok2` or env — not in repo).

---

## 10. Third-party via Shopify (no separate project creds)

| Service | Role |
|---------|------|
| **PayPal** | Checkout payment method (Shopify-enabled) |
| **Stripe** | Referenced in Shopify checkout CSP |
| **Braintree** | Referenced in Shopify checkout CSP |
| **Pinterest** | Shopify app embed (“Pin it”) + ad traffic to ColorFlex |
| **Google Analytics** | Store analytics (theme / Shopify) |
| **Shopify CDN** | `cdn.shopify.com`, theme assets |

---

## Deployment surfaces (quick reference)

| What | Where it goes | Tool |
|------|---------------|------|
| Shopify theme + JS/CSS | `f63bae-86` live theme | `./deploy-shopify-cli.sh` |
| cf-data / colorflex on server | `so-animation.com/colorflex/` | `./deploy.sh` |
| Static demo packages | `so-animation.com/dist-mohawk-room/`, `archive-cat/`, etc. | cPanel upload (`trade-show-local/BLUEHOST_SHARED_HOSTING_UPLOAD.md`) |
| collections.json to theme | `src/assets/collections.json` | `./deploy-shopify-cli.sh data` |
| Thumbnail API | Railway | `api/` deploy via Railway dashboard / CLI |
| B2 public data | `s3.us-east-005.backblazeb2.com/cf-data/` | B2 upload scripts / Synology sync |

---

## Credential hygiene

1. **Canonical secrets file:** `config/local.env` (gitignored).
2. **Rotate** anything found in `docs/saffron cottage credentials.md` — that file is **tracked in git** and was flagged in a prior security review.
3. **Never commit:** `.env`, `config/local.env`, `config/shopify.json`, `api/.env`, private keys, or API tokens.
4. **Railway tokens** live in Railway project variables *and* local `api/.env` for development.

---

## Not integrated (referenced only)

- **Spoonflower** — trade program link in ads context only
- **Vercel / Netlify / Heroku** — mentioned as generic hosting examples, not active deploy targets

---

*Last updated: 2026-06-16. Verify URLs and env var names against `config/local.env` and `api/.env` on a machine where those files are intact.*
