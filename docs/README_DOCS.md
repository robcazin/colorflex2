# Docs index

**Shopify theme deploy & collection/product pipeline (canonical — use these before guessing)**

- **`DEPLOYMENT.md`** — All theme uploads via `./deploy-shopify-cli.sh` from repo root (`all`, `sections`, `assets`, `data`, etc.). Run `./deploy-shopify-cli.sh help` for the full list. Also documents **post-build deploy** for Cursor (see **`.cursor/rules/deploy-after-build.mdc`**) and the **coordinates “Back to Pattern”** control layout.
- **`DEPLOYMENT GUIDE.md`** — `update-collection.sh` commands vs images/CSV/products, flags `--skip-products` / `--update-products`, and when to run `node scripts/shopify-create-products.js`.
- **`GENERAL_USAGE.md`** — High-level `update-collection.sh complete <slug>` for new collections; points to **`ADD_NEW_COLLECTION_FROM_AIRTABLE.md`** for full setup.
- **`SETUP_AFTER_REBUILD.md`** — Shopify CLI / env when (re)setting up the machine.

Note: **`DEPLOYMENT_QUICK_REF.md`** and **`WORKFLOW.md`** are older; prefer **`DEPLOYMENT.md`** and **`update-collection.sh`** / **`DEPLOYMENT GUIDE.md`** for current paths (e.g. `src/`, not `dist/`).

Additional drift note:

- **`CART_INTEGRATION_GUIDE.md`**, **`IMPLEMENTATION_PLAN.md`**, and **`PRODUCT_CONFIGURATION_FLOW.md`** are useful architecture history, but include legacy examples. Confirm live behavior against `COLORFLEX_MANAGER_PREVIEW_STEPS.md` before implementing changes.
- **`CLAUDE.md`** is a long-running session record with mixed-era guidance; treat it as supplemental context, not source of truth.

---

- **`AI_CONTEXT.md`** — **Read this first** after a new session or context loss. Restores correct understanding (e.g. Bassett Local has nothing to do with Shopify).
- **`BASSETT_WORKFLOW.md`** — Bassett workflow, layer stack, data path, milestones, progress log.
- **`GIT_LOCAL_WORKFLOW.md`** — Worktrees, branches, safety checklist, merge direction.
- **`COLORFLEX_BASSETT.md`** — What is safe to edit for Bassett only; PSD/API notes.

**CORS & data source**

- **`DATA_AND_CORS.md`** — Where ColorFlex gets images, why CORS breaks, B2 vs S3 CORS.
- **`BACKBLAZE_CORS_FIX.md`** — B2 bucket CORS fix (Python script, manual steps).
- **`CLOUDFLARE_CORS_PROXY.md`** — Cloudflare Worker proxy when B2 CORS won't stick.
- **`CORS_QUICK_FIX.md`** — 5‑minute Cloudflare Worker setup for CORS errors.
