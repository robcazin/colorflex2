# ColorFlex trade-show demo — Windows deployment

This document matches **`demo/trade-show-offline`** after merging **`main`** (wallpaper / CFM improvements) while keeping offline bootstrap and demo gating.

## A. Exact folders/files to copy to each Windows PC

Copy a single folder (recommended name: `ColorFlexTradeShow`) whose layout **preserves paths relative to the repo root** (the parent of `trade-show-local/`):

| Path | Purpose |
|------|---------|
| `trade-show-local/` | `index.html` (offline globals + `/demo-snapshot` base URL), `server.js` |
| `demo-snapshot/` | Local JSON + raster assets (`data/collections.json`, `data/colors.json`, `data/mockups.json`, `data/collections/…`, `data/mockups/…`, `img/…`) |
| `src/assets/color-flex-trade-demo.min.js` | Built wallpaper trade-demo bundle (only this file is required under `src/assets/` for runtime) |
| `package.json` | Root `package.json` (so `npm install` can install `express`) |
| `package-lock.json` | Optional but recommended for reproducible installs |

You do **not** need the full `src/` tree, theme, or webpack on the PC if the bundle and snapshot are already built on the source machine.

**Do not** rely on `bassett-local/` or Bassett bundles for this demo.

## B. Pre-copy build steps (source machine — macOS/Linux)

On branch **`demo/trade-show-offline`**, from the repo root:

```bash
git checkout demo/trade-show-offline
git pull   # if you use a remote
npm install
npm run build:trade-demo
npm run build:trade-show-snapshot
```

- **`build:trade-demo`** writes `src/assets/color-flex-trade-demo.min.js` (embeds merged `CFM.js` + wallpaper trade entry).
- **`build:trade-show-snapshot`** regenerates `demo-snapshot/` (requires `sharp` + `src/tools/colors.json` in the repo).

Then copy the folder layout in section A to the PC (USB, network share, etc.).

## C. Recommended folder layout on the Windows PC

Example:

```text
C:\ColorFlexTradeShow\
  package.json
  package-lock.json
  trade-show-local\
    index.html
    server.js
    Start-Trade-Show-Demo.cmd
    WINDOWS_DEPLOY.md
  demo-snapshot\
    data\
    img\
  src\
    assets\
      color-flex-trade-demo.min.js
```

## D. Launch steps on the Windows PC

1. Install **Node.js LTS** (includes `node` and `npm` on PATH) if not already installed.
2. Open **Command Prompt** or **PowerShell**, `cd` to `C:\ColorFlexTradeShow` (or your path).
3. Install dependencies (once per machine):

   ```bat
   npm install --omit=dev
   ```

   This installs runtime deps from root `package.json` (including `express`). DevDependencies are omitted to save time and disk.

4. Start the server:

   ```bat
   node trade-show-local\server.js
   ```

   Or double-click **`trade-show-local\Start-Trade-Show-Demo.cmd`** from Explorer (runs from repo root).

5. In the browser, open **http://127.0.0.1:3340/** (default).  
   Override port/host if needed:

   ```bat
   set TRADE_SHOW_PORT=3340
   set TRADE_SHOW_HOST=127.0.0.1
   node trade-show-local\server.js
   ```

## E. Remaining runtime dependencies (not fully local)

- **Node.js** is required to run `trade-show-local/server.js` (Express static server). There is no file:// workflow in this implementation.
- With **`COLORFLEX_DEMO_OFFLINE`** / **`COLORFLEX_TRADE_SHOW`** set in `trade-show-local/index.html`, CFM **does not** add Backblaze as a fallback for colors when offline (`loadColors`), and cart / Shopify customer flows are gated.
- **Raster and JSON** for the curated snapshot are served from **`/demo-snapshot`** on the same origin — no CDN for those assets when the snapshot is present.
- If you later add remote fonts, analytics, or third-party scripts to `index.html`, list them here; the stock trade-show `index.html` uses system UI fonts only.

## F. What changed when merging `main` into `demo/trade-show-offline`

Important **`main`**-side improvements brought in (wallpaper-relevant):

- **`fix(colorflex): canonical layer compositing and documented CORS policy`** — CFM / compositing and data-fetch behavior aligned with live pipeline docs.
- **PDP / preview thumbnail and repeat-label behavior** — theme and CFM updates for product-page accuracy (mostly visible on Shopify; CFM core still benefits the bundle).
- **Theme styling / calculator / contact gradient** — primarily Shopify theme assets; the offline shell does not load full theme CSS unless you add `<link>` tags later.

**Preserved on the demo branch:**

- `isColorFlexDemoOffline()` and **`COLORFLEX_DEMO_OFFLINE` / `COLORFLEX_TRADE_SHOW`** gating in `CFM.js`.
- `trade-show-local/index.html` bootstrap: `COLORFLEX_DATA_BASE_URL = origin + '/demo-snapshot'`, `ColorFlexAssets` pointing at `/demo-snapshot/data/*.json`, `ShopifyCustomer = null`, `COLORFLEX_MODE = 'WALLPAPER'`.
- No Shopify cart/checkout runtime for the offline shell.

## G. Suggested next step for maximum portability

Bundle a **portable Node** build or a single **installer** that adds Node to PATH and drops a desktop shortcut running `Start-Trade-Show-Demo.cmd`. Alternatively, pre-run `npm install --omit=dev` on one PC and zip **`node_modules`** along with the app (same Windows + Node major version recommended).
