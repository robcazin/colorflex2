# Adding a New Collection from Airtable

Use this when you add a new wallpaper collection (e.g. **30 - STRIPES**, fully ColorFlex) so it appears in ColorFlex **and** so thumbnails and layer images are downloaded.

**Important:** Images are only downloaded when you use **`./update-collection.sh complete <collection>`** (or `images`). Running `node src/scripts/cf-dl.js` with no arguments does **not** download images.

---

## 1. In Airtable

### Create the table

- **Table name (exact):** `30 - STRIPES`  
  Format is `{number} - {NAME}`. The script discovers tables matching `# - NAME` or `## - NAME` (1–2 digit number, space, hyphen, name). The number controls sort order in the app.

### Master row (collection metadata)

- Add one **master record** with **NUMBER** ending in **-000**, e.g. `01-30-000`.
- Set **ACTIVE** = 1 (or checked) so the collection is included.
- Set **ColorFlex** (or **Color-Flex**) = **checked** so the whole collection is treated as ColorFlex.
- Set **THUMBNAIL**: attach the collection thumbnail image (required for image download step).
- Optionally: **MOCKUP** (room mockup id or path), curated color fields, **COORDINATES** (if used).

### Pattern rows

- One row per pattern: **NUMBER** e.g. `01-30-001`, `01-30-002`, …
- **ACTIVE** = 1, **NAME** = pattern name.
- **LAYER SEPARATIONS**: attach layer images in order (required for ColorFlex; order = layer order).
- **THUMBNAIL**: attach pattern thumbnail image.
- For a fully ColorFlex collection, ensure each pattern has **Color-Flex** checked (or rely on collection-level ColorFlex from the master row).

---

## 2. In the repo (fallback list)

If Airtable table discovery fails, the script uses a hardcoded list.

- **File:** `src/scripts/cf-dl.js`
- **Function:** `getFallbackCollections()`
- Add: `{ name: '30 - STRIPES' }`.

**30 - STRIPES** is already in the fallback list.

---

## 3. Run the full pipeline (fetch + download images + CSV + Shopify)

From the project root, use **`update-collection.sh`** so that **images are downloaded**:

```bash
# New collection: full pipeline (fetch from Airtable + download all images + generate CSV + upload collections.json to Shopify)
./update-collection.sh complete stripes
```

- **`complete`** = fetch data, **download thumbnails and layer images**, generate Shopify CSV, upload `collections.json` to Shopify assets. Data and images go to `COLORFLEX_DATA_PATH` (e.g. Synology/Backblaze).
- Collection name is the **slug**: `stripes` (from "30 - STRIPES" → baseName `stripes`).

To download images for a single collection without CSV/product steps:

```bash
./update-collection.sh images stripes
```

**Do not** rely on:

- `node src/scripts/cf-dl.js` with no args — **downloadImages** is false, so no images are downloaded.
- `node src/scripts/cf-dl.js stripes` — still no first argument `true`, so no images.

If you call `cf-dl.js` directly, you must pass **`true`** first to download images:

```bash
node src/scripts/cf-dl.js true stripes
```

---

## 4. After the run

- **collections.json** is uploaded to Shopify assets by `update-collection.sh` (so the app sees the new collection).
- Images live under your data path (e.g. `.../data/collections/stripes/thumbnails/`, `.../data/collections/stripes/layers/`). Ensure that path is what your store/CDN uses (e.g. Backblaze, `COLORFLEX_DATA_BASE_URL`).
- Optionally create Shopify products via the script (or import the generated CSV from `deployment/csv/`).

---

## Summary for 30 - STRIPES (fully ColorFlex)

| Step | Action |
|------|--------|
| Airtable | Create table **30 - STRIPES**; master row `01-30-000` with **ACTIVE=1**, **ColorFlex=checked**, **THUMBNAIL**; pattern rows with NUMBER, NAME, **LAYER SEPARATIONS**, **THUMBNAIL**. |
| Repo | Fallback list in `cf-dl.js` includes **30 - STRIPES**; `update-collection.sh` usage lists **stripes**. |
| Run | **`./update-collection.sh complete stripes`** (this downloads images; plain `node src/scripts/cf-dl.js` does not). |
| Deploy | Script uploads collections.json to Shopify; images are in your data path (Synology/Backblaze etc.). |

No change is required in CFM.js for a fully ColorFlex collection; the app uses it once it’s in **collections.json** and image URLs point at your data base URL.

---

## Troubleshooting

### "We got thumbnails but nothing else" (no layer images)

The script only downloads what exists in Airtable. If you see pattern **thumbnails** but no **layer** images:

1. **LAYER SEPARATIONS** must be filled for each pattern. In the Airtable table, the column must be named exactly **`LAYER SEPARATIONS`** (type: Attachment). For each pattern row, **attach the layer image(s)** to that field — order = layer order (first attachment = layer 1, etc.). If the field is empty or missing, the log will show `LAYER SEPARATIONS field: undefined` and `layerAttachments.length: 0`, and no layer files will be downloaded.
2. Re-run after attaching: `./update-collection.sh complete stripes` (or `images stripes` to skip CSV/products).

### No collection thumbnail / "No placeholder record (-000) found"

- Add a **master row** with **NUMBER** = `01-30-000` (or `30-000`), **ACTIVE** = 1, **ColorFlex** = checked. Attach the collection image to that row's **THUMBNAIL** field. Without this row, the script cannot download a collection thumbnail and cannot read collection-level ColorFlex/curated settings.
