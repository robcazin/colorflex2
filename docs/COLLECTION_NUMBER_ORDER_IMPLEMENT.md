# Collection order by collection number – implementation steps

Collections now sort by **collection number** (e.g. 1 - ABUNDANCE, 22 - IKATS, 27 - English Cottage) instead of A–Z. The code is already in the repo; follow these steps to get it live.

---

## 1. Build the theme bundle

The sort logic lives in `src/CFM.js`, which is bundled into `color-flex-core.min.js`:

```bash
npm run build
```

This writes `src/assets/color-flex-core.min.js`.

---

## 2. Deploy to Shopify

Push the updated JS and (if you use it) the collections JSON:

```bash
# Deploy the ColorFlex app JS (includes sort logic)
./deploy-shopify-cli.sh assets

# Optional: if you want collections.json to include collectionNumber for each collection, sync data then deploy it
# (see step 3 first)
./deploy-shopify-cli.sh data
```

---

## 3. Optional: add `collectionNumber` to collections.json

- **Without this:** Order still works. The theme parses `tableName` (e.g. `"22 - IKATS"` → 22) when `collectionNumber` is missing.
- **With this:** Each collection in `data/collections.json` gets an explicit `collectionNumber` field when you run the pipeline.

To backfill/update `collectionNumber` in your data:

```bash
# From project root, with your usual env (e.g. COLORFLEX_DATA_PATH if you use Synology)
./update-collection.sh metadata
# or for a single collection, e.g.:
# ./update-collection.sh metadata ikats
```

Then deploy the updated JSON:

```bash
./deploy-shopify-cli.sh data
```

---

## 4. Verify

1. Open the ColorFlex wallpaper (or furniture/clothing) page.
2. Open the collection picker (e.g. “Choose collection” / collections modal).
3. Confirm collections are in numeric order (1, 3, 16, 17, 18, 22, 27, …) instead of A–Z.

---

## What’s in the codebase

| Location | What it does |
|----------|----------------|
| **src/scripts/cf-dl.js** | Adds `collectionNumber` to each collection when building/updating `collections.json` (from `tableName`, e.g. `"22 - IKATS"` → 22). |
| **src/CFM.js** | `getCollectionOrderNumber(c)`, `sortCollectionsByNumber(collections)`; sorts `appState.collections` before exposing to `window.collectionsData`; exposes `window.ColorFlexSortCollectionsByNumber` for Liquid. |
| **src/templates/page.colorflex.liquid** (and furniture, clothing, bassett, *-simple) | Collection modal uses `ColorFlexSortCollectionsByNumber` when available, so the grid shows collection-number order. |

No Shopify admin settings are required; ordering is fully custom in your theme and data.
