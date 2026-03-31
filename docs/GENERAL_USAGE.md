# ColorFlex — General usage (new users)

Quick reference for common tasks.

---

## Adding a new collection

Once the collection exists in Airtable (table name e.g. **30 - STRIPES**, master row with ACTIVE and ColorFlex set, pattern rows with LAYER SEPARATIONS and THUMBNAIL attached), adding it to ColorFlex is a single command:

```bash
./update-collection.sh complete <collection-slug>
```

Example for a new collection **Stripes** (table **30 - STRIPES**):

```bash
./update-collection.sh complete stripes
```

This fetches data from Airtable, **downloads all thumbnails and layer images**, generates the Shopify CSV, and uploads `collections.json` to Shopify assets. No need to run separate steps for images.

Full setup (Airtable table, fallback list, data path) is in **docs/ADD_NEW_COLLECTION_FROM_AIRTABLE.md**.

---

## Ongoing Shopify updates (existing collections)

For **refreshing copy and metafields** without re-downloading images, **`fetch` vs `sync`**, **`all` collections**, theme **PDP** deploys, and **npm** shortcuts, see:

**[docs/COLLECTION_AND_SHOPIFY_WORKFLOW.md](./COLLECTION_AND_SHOPIFY_WORKFLOW.md)**

---

## Colors data (`colors.json`)

**Source of truth** for app colors is the **cf-data master** next to `collections.json`:

- `cf-data`: `/Volumes/jobs/cf-data/data/colors.json`
- Published URL (Backblaze): `https://s3.us-east-005.backblazeb2.com/cf-data/data/colors.json`

### Sync repo copy from cf-data

The repo keeps a copy at `src/tools/colors.json` for local tooling/builds. To sync it from the master:

```bash
node scripts/sync-colors-from-cf-data.js
```

### Import Emerald Designer Edition (.xlsx) into the master

If you receive an Emerald `.xlsx` from Sherwin-Williams, import it into the master colors file:

```bash
node scripts/import-emerald-colors.js \
  --xlsx "/path/to/Emerald Designer Edition Digital Data.xlsx" \
  --colors "/Volumes/jobs/cf-data/data/colors.json"
```

The importer dedupes by `sw_number` and will warn on hex conflicts (it keeps the existing value by default).
