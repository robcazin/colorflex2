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

## Windows PCs (copy / trade show)

See **[WINDOWS_DEPLOY.md](./WINDOWS_DEPLOY.md)** for folder layout, pre-copy builds, `npm install`, and **`Start-Trade-Show-Demo.cmd`**.
