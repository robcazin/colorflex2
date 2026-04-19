# Trade-show offline demo (wallpaper)

Local **Express** server + static **`index.html`** that mirrors the live ColorFlex wallpaper shell (theme header + ColorFlex layout). No Shopify runtime; CFM uses `COLORFLEX_DEMO_OFFLINE` / `COLORFLEX_TRADE_SHOW` for cart/checkout.

## Quick start (Mac / dev)

```bash
npm install
npm run build:trade-demo
npm run build:trade-show-snapshot
npm run serve:trade-demo
```

Open **http://127.0.0.1:3340/** — JSON from `demo-snapshot/data/`, rasters from **`cf-data/`** (or B2 proxy when `cf-data` is absent). See `server.js`.

## Windows golden master

```bash
npm run package:trade-show-windows
# optional rasters:
npm run package:trade-show-windows -- --cf-data=/path/to/cf-data
```

Handoff folder: **`ColorFlexTradeShow/`** (default; gitignored). Inside it, open **`PACKAGE_BUILD.txt`** to confirm build id after copying to a PC.

| Doc | Audience |
|-----|----------|
| **[WINDOWS_DEPLOY.md](./WINDOWS_DEPLOY.md)** | Staff — folder tree, `npm install` on Windows, checks |
| **[BACKUP_AND_HISTORY.md](./BACKUP_AND_HISTORY.md)** | Git push, tags, `npm run backup`, recovery |
| **[../OWNER_INSTRUCTIONS.txt](../OWNER_INSTRUCTIONS.txt)** | Show-floor owner |

## Offline snapshot

```bash
npm run build:trade-show-snapshot
```

Writes **`demo-snapshot/data/`** from `src/assets/collections.json` (wallpaper filter) plus `colors.json`, `mockups.json`, etc.

## Routes (`server.js`)

- **`/`** → `trade-show-local/index.html`
- **`/home.html`**, **`/home`** → thin landing / redirect
- **`/demo-snapshot`**, **`/assets`**, **`/cf-data`** when folders exist; else B2 proxy for `/cf-data`

## History

This area evolved from a minimal shell to the full stash-restored layout. Preserve history with **git** and optional **`npm run backup`** (see BACKUP_AND_HISTORY.md).
