# ColorFlex trade-show — Windows deployment (technical)

Branch: **`demo/trade-show-offline`**. Wallpaper-only offline demo; no Shopify runtime in the shell.

**Golden master model:** one folder is prepared on Windows (with `node_modules`), then **copied as-is** to other Windows PCs. The owner only installs **Node.js** once per machine and double-clicks **`Start-Trade-Show-Demo.cmd`** at the **root** of that folder.

---

## 1. Golden master folder (exact layout)

Everything lives under one folder (example: `ColorFlexTradeShow`). The owner must **only** double-click the root launcher — not files inside `trade-show-local`.

```text
ColorFlexTradeShow\
  Start-Trade-Show-Demo.cmd     ← only launcher owners should use
  OWNER_INSTRUCTIONS.txt
  package.json                  ← from trade-show-windows-runtime.package.json rename, or full repo package.json
  package-lock.json             ← optional
  node_modules\                 ← required on each copy; build on Windows (§2)
  trade-show-local\
    index.html
    server.js
    WINDOWS_DEPLOY.md
    Start-Trade-Show-Demo.cmd   ← forwards to root launcher (same as root)
  demo-snapshot\
    data\
    img\
  src\
    assets\
      color-flex-trade-demo.min.js
```

**Cloneability:** Zip or xcopy the **entire** folder including **`node_modules`**. Same build works on other Windows 10/11 PCs with Node installed — no `npm install` on each show PC.

---

## 2. Building the golden master (staff)

### A. Build demo assets (any OS), repo root, branch `demo/trade-show-offline`:

```bash
git checkout demo/trade-show-offline
npm install
npm run build:trade-demo
npm run build:trade-show-snapshot
```

### B. Install `node_modules` for distribution (**Windows**, in the staging folder that will become the golden master)

1. Copy into the empty staging folder: `trade-show-local\`, `demo-snapshot\`, `src\assets\color-flex-trade-demo.min.js`, root **`Start-Trade-Show-Demo.cmd`**, **`OWNER_INSTRUCTIONS.txt`**, **`trade-show-windows-runtime.package.json`**.

2. In that folder:

   ```bat
   copy /Y trade-show-windows-runtime.package.json package.json
   npm install
   ```

   (Larger alternative: use the repo’s full `package.json` + `npm install --omit=dev`.)

3. Zip or duplicate the **whole** folder — that is the master to hand off.

---

## 3. Owner workflow (show floor)

1. Copy the **whole** folder to the PC.
2. Node.js LTS installed once (**Add to PATH**).
3. Double-click **`Start-Trade-Show-Demo.cmd`** at the folder **root**.
4. Browser should open to **http://127.0.0.1:3340/** ; if not, open that URL manually.
5. **Stop:** close the window titled **ColorFlex Server — close this window to stop**.

Plain-language steps: **`OWNER_INSTRUCTIONS.txt`**.

---

## 4. Verification before duplicating to multiple PCs

On one **Windows** machine that matches the show PCs:

| Check | Expected |
|--------|----------|
| Launch | No error dialogs from `Start-Trade-Show-Demo.cmd` |
| Path with spaces | Copy master to e.g. `C:\Test Folder With Spaces\ColorFlexTradeShow` and launch — still works |
| Browser | Opens to `http://127.0.0.1:3340/` |
| Demo | Collections load; preview and mockup work; no broken snapshot images |
| Stop | Closing the server window frees the app |

Fix the master before cloning.

---

## 5. Prerequisites that remain

- **Node.js LTS** on each PC (PATH). The repo does not ship Node.
- **`node_modules`** must come from the golden master (or run `npm install` once on that PC using the same `package.json` as the master).

---

## 6. Limitations

- **`node_modules`** should be built on **Windows** for Windows show machines.
- **Port 3340** must be free (one demo at a time unless you change port + launcher URL).
- **`furniture-config.json`** may be absent in the snapshot — wallpaper demo tolerates it (possible console warning).

---

## 7. Merge note (`main` → `demo/trade-show-offline`)

Live **`CFM.js`** updates are merged here; offline bootstrap in **`trade-show-local/index.html`** is unchanged.
