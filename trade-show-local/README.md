# Trade-show local server (wallpaper-only offline demo)

Minimal **localhost** static server. **Phase 1:** shell only. **Phase 2:** `index.html` bootstraps globals and loads `color-flex-trade-demo.min.js` from `/assets` (build first).

## Offline snapshot (wallpaper data + images)

From the repo root:

```bash
npm run build:trade-show-snapshot
```

Writes `demo-snapshot/` (collections, colors copy, mockups, generated JPEG/PNG assets).

## Build the demo bundle

From the repo root:

```bash
npm run build:trade-demo
```

Output: `src/assets/color-flex-trade-demo.min.js`

## Run

From the repo root:

```bash
npm run serve:trade-demo
```

Default URL: **http://127.0.0.1:3340**

Override host/port:

```bash
TRADE_SHOW_HOST=127.0.0.1 TRADE_SHOW_PORT=3340 npm run serve:trade-demo
```

## Static mounts (when folders exist)

- `/` → `trade-show-local/index.html`
- `/demo-snapshot` → repo `demo-snapshot/` (optional; omitted if missing)
- `/assets` → repo `src/assets/` (optional; omitted if missing)

## Windows — turnkey golden master

- **Owner:** **`OWNER_INSTRUCTIONS.txt`** at the repo root (copy it next to `Start-Trade-Show-Demo.cmd` in the distributed folder).
- **Launcher:** double-click **`Start-Trade-Show-Demo.cmd`** at the **root** of the golden master folder. A second copy inside `trade-show-local` only forwards to that same root file.
- **Technical:** **[WINDOWS_DEPLOY.md](./WINDOWS_DEPLOY.md)** — exact folder tree, how to build `node_modules` once on Windows, and verification before duplicating to multiple PCs.
