# Colorflex Basset branch

**Page handle:** `colorflex-bassett` → URL: `/pages/colorflex-bassett`  
**Template:** `page.colorflex-bassett` (file: `templates/page.colorflex-bassett.liquid`)

This branch is a separate experience from the main ColorFlex page. To avoid affecting the main site:

---

## Safe to edit for Basset only

- **`src/templates/page.colorflex-bassett.liquid`** – Basset page template. All Basset-specific layout, copy, and behavior go here.
- Any new file whose name or path includes **`bassett`** (e.g. `colorflex-bassett.js`, `section-bassett.css`).

---

## Do not edit for Basset work

Do **not** change these for Basset-only features; they drive the main ColorFlex experience:

- `src/templates/page.colorflex.liquid` – main ColorFlex page
- `src/sections/colorflex-app*.liquid` – main app sections
- `src/assets/CFM.js` – core app (unless the change is intended for **both** main and Basset)
- `src/assets/color-flex-core.min.js` / `color-flex-core.min.css` – built core assets
- Layout, header, footer, product templates, and other main-site files

If a fix or feature should apply to **both** main and Basset, add it in shared code and guard by `window.COLORFLEX_MODE` where behavior must differ.

---

## Chameleon icon and My Designs

On Bassett the ColorFlex (chameleon) icon should **show My Designs** (saved patterns), same as main—not directly launch the furniture page. If the user has designs, **using a design** is what takes them to the furniture experience. That furniture page is to be revised; the current ColorFlex furniture page may be a starting point for the Bassett page. The theme setting “ColorFlex icon opens furniture page” is only for testing direct launch; leave it unchecked for normal behavior.

---

## Mode flag

The Basset template sets **`window.COLORFLEX_MODE = 'BASSETT'`** before the core script runs. Use this in shared JS when you need Basset-only behavior:

```js
if (window.COLORFLEX_MODE === 'BASSETT') {
  // Basset-only code
}
```

---

## PSD-rendered sofa (room mockup)

Basset uses the **same room mockup flow as furniture** (background room image + sofa + extras + wall mask), but the **sofa is one transparent PNG** from a PSD renderer instead of pre-rendered layer files.

You must provide a global function that the app calls to get that PNG:

- **`window.renderBassetSofaWithPattern(psdTemplateId, patternImageDataUrl)`**
  - **psdTemplateId** (string): e.g. `'default'` or an id from `appState.bassetPsdTemplateId` / furniture config `bassetPsdTemplateId`.
  - **patternImageDataUrl** (string): Data URL of the current pattern (e.g. `data:image/png;base64,...` from the preview canvas).
  - **Returns:** `Promise<string>` — data URL or URL of a **32-bit PNG with transparency** (the rendered sofa/furniture to composite over the room).
  - If the promise resolves to a falsy value or rejects, the sofa step is skipped (room background and optional extras/wall mask still draw).

Implementation can be:

- **Python pipeline (this repo):** `bassett_psd.process_psd_to_composite_png(psd_path, patternImageDataUrl, blanket_color=...)` returns a dict with `data_url` (single composite PNG). Pattern can be a file path or data URL. See `bassett_psd/README.md`.
- A stub that returns a placeholder PNG or `null` until the PSD pipeline exists.
- An API client that POSTs the pattern to your backend (e.g. Python/psd-tools), which returns the PNG URL or base64.
- Any in-page implementation that uses the PSD + pattern and returns a PNG data URL.

The app draws the returned image with the same scaling/positioning as other furniture layers (zoom state, canvas size).

---

## PSD Smart Object workflow (layer names)

**Test file:** `SOFA WITH PILLOWS MOCKUP 1.psd`  
Path (in colorFlex-shopify project): `/Volumes/K3/jobs/saffron/colorFlex-shopify/data/mockups/bassett/sofa-with-pillows-mockup-1.psd`

The Bassett PSD template uses **Smart Objects** for pattern placement and one layer for a solid color. When building the PSD pipeline (e.g. backend script or Photoshop automation), target these **exact layer names**:

| Layer name | Purpose | Input |
|------------|--------|--------|
| **LEFT PILLOW PATTERN** | Left pillow fabric | ColorFlex pattern image (tiled/repeated as needed) |
| **RIGHT PILLOW PATTERN** | Right pillow fabric | ColorFlex pattern image (tiled/repeated as needed) |
| **SOFA FABRIC PATTERN** | Main sofa upholstery | ColorFlex pattern image (tiled/repeated as needed) |
| **BLANKET COLOR** | Throw/blanket | **Solid color only** — use one of the user’s chosen ColorFlex colors (no pattern image) |

- **Pattern layers** (LEFT PILLOW PATTERN, RIGHT PILLOW PATTERN, SOFA FABRIC PATTERN): replace the Smart Object contents with the current ColorFlex pattern image (the same image used for the preview canvas, or a high-res export).
- **BLANKET COLOR**: fill or tint this layer with a single solid color derived from the user’s color choices (e.g. first color, or a dedicated “blanket” color if the UI exposes it).

Keep these layer names consistent in the PSD so any script or API that drives the template can find them by name.

---

## Pipeline: into the PSD and out with a transparent PNG

To go from the Bassett app (pattern + colors) to a composite PNG, you need these hooks:

### 1. Inputs (from the app)

- **Pattern image** — One image (e.g. data URL or file path) of the current ColorFlex pattern (tiled/fabric). Same image can be used for all three pattern layers (LEFT PILLOW PATTERN, RIGHT PILLOW PATTERN, SOFA FABRIC PATTERN) or you can allow per-layer variants later.
- **Blanket color** — One RGB hex (or equivalent) from the user’s chosen colors, for the BLANKET COLOR layer only.

These are what the app will pass when it calls `window.renderBassetSofaWithPattern(psdTemplateId, patternImageDataUrl)`; you can extend the API later to pass an optional `blanketColor` (and any other options).

### 2. Into the file (opening and finding layers)

- **Open the PSD** — Use a path or ID that points at the template (e.g. `sofa-with-pillows-mockup-1.psd`).
- **Resolve layers by name** — Find layers whose **name** equals (case-sensitive or normalized):
  - `LEFT PILLOW PATTERN`
  - `RIGHT PILLOW PATTERN`
  - `SOFA FABRIC PATTERN`
  - `BLANKET COLOR`
- **Smart Objects** — The first three are Smart Objects. The pipeline must support “replace Smart Object contents” with the pattern image (same or scaled/tiled per your design). If the PSD uses linked Smart Objects, replace the linked file or the embedded contents depending on your tooling.
- **Solid layer** — For `BLANKET COLOR`, set a solid fill (or equivalent) to the provided color; no pattern image.

### 3. Engine options (who does the work)

| Approach | Pros | Cons |
|----------|------|------|
| **Photoshop + ExtendScript (JSX)** | Full control, native Smart Object replace, perfect PNG export. | Needs Photoshop installed; script runs locally or on a machine that has Photoshop. |
| **Python + psd-tools** | No Photoshop; scriptable; applies layer masks so you get the correct *shape* (pillow/sofa cutout). | Does **not** apply the Smart Object’s warp—pattern stays flat inside the shape. For warped output use the Photoshop JSX script or set `BASSETT_USE_PHOTOSHOP=1` (local server on macOS). |
| **Photopea (browser or API)** | No Photoshop; can run in automation. | Need to map your layer names and Smart Object flow to Photopea’s API. |
| **Local Photoshop + AppleScript/shell** | Drive Photoshop from a script; reuse existing PSD. | macOS + Photoshop required; more glue code. |

For a single “SOFA WITH PILLOWS MOCKUP 1.psd” template and three Smart Objects + one solid layer, **Photoshop scripting (JSX)** is the most straightforward: open PSD, find layers by name, replace Smart Object contents three times, set fill on BLANKET COLOR, then export as PNG with transparency.

### 4. Out (back to the app)

- **Export** — Composite (or flatten) only the sofa/pillow/blanket layers (or the whole doc if the PSD is already composed) and export as **32-bit PNG with transparency** (no background, or alpha where the “room” will show through).
- **Return value** — The pipeline should return that PNG as either:
  - A **data URL** (e.g. `data:image/png;base64,...`), or  
  - A **URL** (if the file is saved to a server or CDN).  
  That return value is what `window.renderBassetSofaWithPattern(...)` should resolve with, so the Bassett app can draw it on the canvas over the room background.

### 5. End-to-end hook (already defined)

The app calls:

```js
window.renderBassetSofaWithPattern(psdTemplateId, patternImageDataUrl)
```

Your implementation of that function should:

1. Take `patternImageDataUrl` (and optionally a `blanketColor` if you extend the API).
2. Run the pipeline above (open PSD → update the four layers → export PNG).
3. Return a Promise that resolves with the PNG data URL or URL.

So the “hooks” are: **layer names** (into the PSD), **Smart Object replace + solid fill** (inside the file), and **one function** (out: `renderBassetSofaWithPattern`) that returns the transparent PNG.

---

## Git

Work in a branch so main stays clean:

```bash
git checkout -b colorflex-bassett
# do all Basset work in this branch
# merge to main only when Basset is ready and reviewed
```

---

## Commands (PSD export and Photoshop)

**Python composite (flat, no warp):**

```bash
# Composite only
python scripts/bassett_psd_export.py "<psd>" /path/to/pattern.jpg --out-dir ./out --blanket "#336699"

# Composite + export each layer as PNG
python scripts/bassett_psd_export.py "<psd>" "<pattern>" --out-dir ./my_layers --blanket "#336699" --layers

# Export raw layers only (no pattern; no composite)
python scripts/bassett_psd_export.py "<psd>" --out-dir ./my_layers --layers-only
# or:
python scripts/export_psd_layers_raw.py "<psd>" --out-dir ./my_layers
```

**Photoshop (warped output).** Pattern must be a file path:

```bash
./scripts/run_bassett_photoshop.sh "<psd_path>" /path/to/pattern.png
```

- `--blanket "#RRGGBB"` (default `#336699`)
- Third positional arg or `--output /path/to/out.png` for the PNG. Default: `colorflex2-bassett/bassett_psd_output/composite_photoshop.png` or `./bassett_psd_output/composite_photoshop.png`

Example:

```bash
./scripts/run_bassett_photoshop.sh "/Volumes/K3/jobs/saffron/colorFlex-shopify/data/mockups/bassett/sofa-with-pillows-mockup-1.psd" /Users/robcazin/Downloads/pantry.jpg --blanket "#336699" --output /Users/robcazin/Downloads/pantry-bassett.png
```

---

## Build and deploy

**Typical Bassett deploy:** `npm run build` then `./deploy-shopify-cli.sh bassett`.

- **Build:** The Bassett page loads `color-flex-bassett.min.js`. Build with:
  - `npm run build` — builds all bundles (including Bassett).
  - `npm run build -- --env mode=bassett` — builds only the Bassett bundle.
- **Deploy (theme):** Use `deploy-shopify-cli.sh`. Theme is auto-selected by branch (branch `bassett` → CF Bassett preview theme; other branches → live theme).
  - **Bassett only:** `./deploy-shopify-cli.sh bassett` — uploads:
    - `src/assets/color-flex-bassett.min.js`
    - `src/templates/page.colorflex-bassett.liquid`
  - **All assets (includes Bassett):** `./deploy-shopify-cli.sh assets`
  - **One file:** `./deploy-shopify-cli.sh only assets/color-flex-bassett.min.js` or `./deploy-shopify-cli.sh only templates/page.colorflex-bassett.liquid`
  - **Changed files only:** `./deploy-shopify-cli.sh changed` (pushes modified/staged files under `src/`)
- **API (instant room preview):** Deploy the `api/` server (e.g. Railway) separately if you use “Upload Bassett result” on the store. Set `ColorFlexApiBaseUrl` on the Bassett page Room mockup is generated from the selected pattern when the API has BASSETT_REPO_ROOT and BASSETT_PSD_PATH set (Python composite; no Photoshop). Fallback: Upload Bassett result.

## Shopify setup

1. **Online Store → Pages** → create (or edit) a page.
2. Set **Handle** to `colorflex-bassett` (URL becomes `/pages/colorflex-bassett`).
3. Set **Theme template** to **colorflex bassett** (from `page.colorflex-bassett.liquid`).
4. Save.
