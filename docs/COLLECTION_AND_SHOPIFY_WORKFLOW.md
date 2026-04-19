# Collection & Shopify workflow (task guide)

Task-oriented reference for **Airtable → `collections.json` → CSV → Shopify Admin API → theme**.  
Shell help: `./update-collection.sh help` · Theme help: `./deploy-shopify-cli.sh help`

---

## Quick commands (npm)

| Goal | Command |
|------|---------|
| One collection → Shopify (update products, skip images) | `npm run cf:sync -- bombay --skip-images` |
| All collections → same | `npm run cf:sync:all` |
| JSON only from Airtable (no CSV, no Shopify) | `npm run cf:fetch -- folksie` |
| Metadata path without auto `--update` | `npm run cf:metadata -- folksie --update-products` |
| Push PDP/theme files you changed | `npm run theme:push:changed --` or `npm run theme:push:pdp` |
| Only changed assets under `src/assets/` | `npm run theme:push:changed:assets` |

Wrapper script (same as `sync`): `./scripts/cf-sync-collection.sh <name> [--skip-images]`

---

## 1. Update **one** collection on Shopify (Folksie-style)

**What you get:** Airtable → local `collections.json` → Shopify import CSV → upload theme `collections.json` → **existing** products get new body + `color_flex` metafields (including `collection_description` from master row `-000`).

**Recommended (no image churn):**
```bash
./update-collection.sh sync <collection> --skip-images
# e.g.
./update-collection.sh sync folksie --skip-images
```

**Equivalent:** `metadata` with **`--update-products`** (and optional **`--skip-images`** on any command that runs the Shopify script):
```bash
./update-collection.sh metadata <collection> --update-products --skip-images
```

**Do not use** `./update-collection.sh fetch …` for this — **`fetch` does not generate a CSV and does not touch Shopify.**

---

## 2. Update **all** collections (no prompts in our scripts)

```bash
./update-collection.sh sync all --skip-images
```
or
```bash
npm run cf:sync:all
```

- Refreshes every table from Airtable into `collections.json`, writes the **all-collections** CSV, uploads `collections.json` to the theme, then runs:
  - `node scripts/shopify-create-products.js all --update --skip-images`
- **`update-collection.sh` has no y/n prompts.** If the Shopify CLI asks for login, fix auth / Theme Access (`config/local.env`) first.

---

## 3. Refresh **only** `collections.json` from Airtable

No CSV, no Shopify API, no theme upload (except what other steps you run manually):

```bash
./update-collection.sh fetch <collection>
./update-collection.sh fetch all
```

Use when you only need JSON (e.g. before a custom step).

---

## 4. CSV without Shopify API (manual import)

```bash
./update-collection.sh metadata <collection> --skip-products
```

---

## 5. Which `collections.json` does the API script use?

`scripts/shopify-create-products.js` loads, in order:

1. `$COLORFLEX_DATA_PATH/data/collections.json` (if that file exists)  
2. `./data/collections.json`  
3. `./src/assets/collections.json`

This matches **`cf-dl.js`**: fresh data from `./data/` is **not** overridden by stale `src/assets` when the Synology path is unset. The script logs: **`📂 collections.json: <path>`**.

---

## 6. Theme / product page (PDP) deploys

**Single source of truth for the ColorFlex CTA** on the default product template:  
`snippets/shopify-product-colorflex-button.liquid` (included from `templates/product*.json` via a Custom liquid block).  
Do not rely on pushing only `main-product.liquid` unless you know your theme uses that for the button.

**One-shot bundle for PDP-related files:**
```bash
./deploy-shopify-cli.sh pdp --yes
npm run theme:push:pdp
```

Includes: `layout/theme.liquid`, `assets/colorflex-product-page.css`, `shopify-product-colorflex-button.liquid`, `product-pattern-description.liquid`, `sections/main-product.liquid`. (The file `product-collection-description.liquid` still exists in the repo but is **not** part of the default PDP description block—see §7.)

**Git-based partial push:**
```bash
./deploy-shopify-cli.sh changed --yes           # all changed theme files under src/
./deploy-shopify-cli.sh changed-assets --yes    # only src/assets/
```

---

## 7. PDP copy (collection vs product body)

**Regression guard (2026):** The product description block in `sections/main-product.liquid` (`when 'description'`) must render **only** `product-pattern-description`—not `product-collection-description`. We removed the collection marketing paragraph from the PDP more than once; each time it came back, the long Airtable collection blurb (metafield `color_flex.collection_description`) appeared above every pattern’s real body and looked like the product copy had been “replaced.” If you need that story on the storefront, put it on **collection** templates or a dedicated section—not inside the per-pattern description stack.

- **Collection story (Airtable `-000`):** still synced to product metafield `color_flex.collection_description` (CSV / API). Optional snippet: `snippets/product-collection-description.liquid`—**do not** wire it back into the main-product `description` block without an explicit product decision.
- **Pattern / Shopify body:** `snippets/product-pattern-description.liquid` outputs `product.description` and still strips duplicate collection text from the body when an old import embedded the same copy twice.

After changing metafields, run **`sync`** (or `shopify-create-products` with `--update`) so Shopify has the new values.

---

## 8. Command cheat sheet

| Command | CSV | Images download | Theme `collections.json` | Shopify products |
|--------|-----|------------------|---------------------------|------------------|
| `fetch` | no | no | no | no |
| `sync` | yes | no* | yes | yes, **update** existing |
| `metadata` | yes | no | yes | yes, new only† |
| `complete` | yes | yes | yes | yes |

\* Use `sync … --skip-images` so the API script does not PUT images.  
† Add `--update-products` to behave like `sync` for API updates.

---

## 9. Files touched by these workflows (reference)

| Area | Files |
|------|--------|
| Collection pipeline | `update-collection.sh`, `scripts/cf-sync-collection.sh`, `src/scripts/cf-dl.js` |
| Shopify API | `scripts/shopify-create-products.js` |
| Theme deploy | `deploy-shopify-cli.sh`, `package.json` scripts (`theme:push:*`, `cf:*`) |
| PDP Liquid/CSS | `src/snippets/product-*.liquid`, `src/snippets/shopify-product-colorflex-button.liquid`, `src/assets/colorflex-product-page.css`, `src/layout/theme.liquid`, `src/sections/main-product*.liquid` |

---

## 10. See also

- `docs/GENERAL_USAGE.md` (if present) — broader project usage  
- `./deploy-shopify-cli.sh help` — theme targets (`pdp`, `changed`, `data`, etc.)  
- `./update-collection.sh help` — full flag list and examples  
