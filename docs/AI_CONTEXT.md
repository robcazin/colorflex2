# AI / context recovery — read this first

**Use this file to restore correct understanding after a new session, context loss, or crash.** Update it when we fix a recurring mistake or add a critical distinction.

---

## Critical: Bassett Local has nothing to do with Shopify

- **Bassett Local** is a **local-only** app. It runs at **http://localhost:3333** and serves static HTML + built JavaScript from `bassett-local/` and the repo.
- It does **not** run on Shopify. It does **not** deploy to Shopify. It is **not** “the Shopify Bassett theme” or “for Shopify preview.” Describing Bassett Local as part of Shopify or as “for Shopify” is **wrong** and confuses the user.
- **Shopify** = live store (saffroncottage.shop), theme deploy, ColorFlex wallpaper/furniture/clothing pages. **Bassett Local** = separate local app, same codebase but different entry point and no Shopify involvement.
- The **.liquid file** (`page.colorflex-bassett.liquid`) is only a **source format** used by the build script. The script **strips Liquid** and writes **static** `bassett-local/index.html`. The running app is plain HTML + JS. Liquid is a historical/convenience choice in this repo; for the local app it is not “because Shopify”—the local app never touches Shopify.

---

## Repo layout and workflows

| What | Where | Notes |
|------|--------|------|
| **Main repo** | `colorflex2` | Shared code (CFM.js, etc.), webpack build, Shopify theme. Build and **sync** to bassett worktree when shared code changes. |
| **Bassett worktree** | `colorflex2-bassett` (sibling) | Day-to-day Bassett work. Run the server here. After sync from main: `node bassett-local/server.js` → http://localhost:3333. |
| **Sync (one-way)** | `node scripts/sync-bassett-to-bassett-repo.js` | Run from **colorflex2**. Builds all bundles, builds bassett-local HTML, copies `color-flex-bassett.min.js`, `bassett-local/index.html`, `bassett-local/server.js` into **colorflex2-bassett**. |
| **Run from main** | `npm run bassett` (in colorflex2) | Builds bundle + HTML, starts server. Open http://localhost:3333. No Shopify. |
| **Deploy Bassett to web (CF Bassett theme only)** | `./deploy-shopify-cli.sh bassett` | From any branch. Pushes Bassett JS + template + worker to the **CF Bassett** theme only (unpublished). Preview in Shopify: Themes → CF Bassett → Preview. Set Theme settings → ColorFlex → Bassett layers base URL (e.g. Backblaze path to mockup folder) so room preview loads. Create a page with handle `colorflex-bassett` to use the template. |

---

## Safety rules (do not violate)

1. **Do not deploy Bassett to the live theme.** Bassett must never appear on the main storefront. You may deploy to the **CF Bassett (unpublished) theme only** for web testing via theme preview.
2. **Do not describe Bassett Local as a Shopify feature or “for Shopify.”** It is a standalone local app.
3. **Merge direction:** Changes flow **bassett → main** (merge in main folder). Do not merge main into bassett if there are Bassett-only experiments.
4. **Bassett-only code:** Use `window.COLORFLEX_MODE === 'BASSETT'` guards in shared code (e.g. CFM.js) so main/live behavior is unchanged.

---

## Where to read more

- **Workflow, layer stack, data path:** `docs/BASSETT_WORKFLOW.md`
- **Git, worktrees, branches:** `docs/GIT_LOCAL_WORKFLOW.md`
- **What is safe to edit for Bassett only:** `docs/COLORFLEX_BASSETT.md`

---

## When context is lost (new session / summarization)

- **Read the most recently modified `.md` files** in the repo (e.g. sort by mtime in `docs/`, root, and key subdirs). They often reflect the latest workflows, fixes, and decisions and are a fast way to re-anchor.

---

## Significant fixes / milestones

- **2026-03** — **Proof download and preview/mockup colors (Bamboo Lattice Full Color, Coordinates).** Pattern proof was missing the top outline and background/layer colors were wrong. Fixes in `generatePatternProof` (CFM.js): (1) Path-based shadow detection (match preview: `_SHADOW_` / `SHADOW_LAYER` / `ISSHADOW`) so shadow uses multiply, not tint. (2) Color index for pattern layers: `colorArray` = `[background, …pattern colors]`; canvas fill uses `colorArray[0]`, pattern layers use `colorArray[1]`, `colorArray[2]`, … (start `nonShadowColorIndex` at 1). (3) Room mockup: added `ISSHADOW` to path-based shadow check so shadow is never tinted. Proof and preview/mockup now match.

---

## When you add to this file

- Add a **short dated bullet** under a clear heading (e.g. “Common mistakes” or “Clarifications”).
- Keep the top section **unchanged** in meaning: “Bassett Local has nothing to do with Shopify” must remain explicit and first.
