# Trade-show local server (Phase 1)

Minimal **localhost** static server for the wallpaper-only offline demo. **Phase 1** is only the shell: placeholder HTML, optional static mounts. No CFM bundle yet.

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
