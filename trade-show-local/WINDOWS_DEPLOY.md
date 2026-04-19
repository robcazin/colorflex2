# ColorFlex trade-show — Windows deployment (technical)

Branch: **`demo/trade-show-offline`**. Wallpaper-only offline demo; no Shopify runtime in the shell.

---

## 1. Golden master folder (what gets copied to every PC)

Use one **fully prepared** folder (example name: `ColorFlexTradeShow`). The owner double-clicks **`Start-Trade-Show-Demo.cmd`** at the **root** of this folder (same level as `trade-show-local`).

### Exact tree (required)

```text
ColorFlexTradeShow\
  Start-Trade-Show-Demo.cmd          ← primary launcher (root)
  OWNER_INSTRUCTIONS.txt             ← short notes for the owner
  package.json                       ← use minimal runtime (see below) OR full repo package.json
  package-lock.json                  ← optional; recommended if using full npm install
  node_modules\                      ← MUST be present for turnkey use (built on Windows; see §2)
  trade-show-local\
    index.html
    server.js
    WINDOWS_DEPLOY.md
    Start-Trade-Show-Demo.cmd        ← optional; forwards to root launcher
  demo-snapshot\
    data\
    img\
  src\
    assets\
      color-flex-trade-demo.min.js
```

- **App code:** `trade-show-local/`, `src/assets/color-flex-trade-demo.min.js`
- **Data:** `demo-snapshot/`
- **Runtime:** `node_modules/` (Express only if you use the minimal `package.json` below)

You do **not** need the rest of the repo, webpack, or `npm install` on each show PC if `node_modules` is shipped with the golden master.

---

## 2. Before creating the golden master (build machine)

### On any OS (Mac/Linux/Windows) — branch `demo/trade-show-offline`, repo root:

```bash
git checkout demo/trade-show-offline
npm install
npm run build:trade-demo
npm run build:trade-show-snapshot
```

This produces **`src/assets/color-flex-trade-demo.min.js`** and a full **`demo-snapshot/`**.

### On Windows only — create `node_modules` for copying (recommended)

`node_modules` **must be produced on Windows** if you want a turnkey copy (same OS as the show PCs).

1. Create a staging folder and copy into it:

   - `trade-show-local/` (as above)
   - `demo-snapshot/`
   - `src/assets/color-flex-trade-demo.min.js` (keep path `src\assets\`)
   - Root **`Start-Trade-Show-Demo.cmd`**, **`OWNER_INSTRUCTIONS.txt`**, **`trade-show-windows-runtime.package.json`** from this repo

2. In that staging folder, install **only** what the server needs (small, fast):

   ```bat
   copy /Y trade-show-windows-runtime.package.json package.json
   npm install
   ```

   (Or use the repo’s full `package.json` + `npm install --omit=dev` — larger `node_modules`, same result for Express.)

3. Zip the **entire** folder (including `node_modules`) or copy it to USB. That zip/folder is the **golden master**.

---

## 3. Owner workflow (show floor)

1. Copy the **whole** golden master folder to the PC.
2. Install **Node.js LTS** once on that PC if not already installed (https://nodejs.org/), with **Add to PATH** enabled.
3. Double-click **`Start-Trade-Show-Demo.cmd`** at the **root** of the folder.
4. The default browser should open to **http://127.0.0.1:3340/** after a couple of seconds.
5. **Stop:** close the window titled **“ColorFlex Server — close this window to stop”**.

Details: **`OWNER_INSTRUCTIONS.txt`**.

---

## 4. Verification checklist (run on the golden master PC before cloning to other PCs)

Do this once on a **Windows** machine that matches the show environment:

| Check | How |
|--------|-----|
| Launch | Double-click `Start-Trade-Show-Demo.cmd` — no errors in the console that opens. |
| Browser | Default browser opens to `http://127.0.0.1:3340/`. |
| Collections | Page loads; collection UI shows the snapshot (e.g. Bombay demo content). |
| Preview | Select a pattern; preview area updates. |
| Mockup | Room mockup area responds for wallpaper mockup in snapshot. |
| Assets | No broken image icons for thumbnails/layers in the Network tab (all under `/demo-snapshot/`). |
| Stop | Closing the server window stops the app; port is free for next launch. |

If anything fails, fix the master **before** duplicating to other machines.

---

## 5. Remaining prerequisites on each PC

- **Node.js LTS** on PATH (one-time install per machine). The demo does **not** embed Node; `node_modules` only removes the need for **`npm install`**, not Node itself.

---

## 6. Risks / limitations

- **Node + Windows version:** `node_modules` built on one Windows PC should be copied to similar Windows PCs; if you mix OS versions, reinstall with `npm install` using `trade-show-windows-runtime.package.json` as `package.json` on a machine that fails.
- **`furniture-config.json`** may 404 in the snapshot; wallpaper-only demo tolerates that (console warning only).
- **Port 3340** must be free; change `TRADE_SHOW_PORT` only if you also change the launcher URL (advanced).

---

## 7. Merge note (`main` → `demo/trade-show-offline`)

Live wallpaper improvements in **`CFM.js`** are merged into this branch; offline gating (`COLORFLEX_DEMO_OFFLINE` / `COLORFLEX_TRADE_SHOW`) and `/demo-snapshot` bootstrap are unchanged in `trade-show-local/index.html`.
