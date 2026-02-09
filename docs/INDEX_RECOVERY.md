# Recovering Missing Theme Files (index, snippets, section groups, etc.)

When a full theme push ran without `--nodelete`, Shopify removed any file on the theme that wasn’t in your local `src/`. That can include the homepage template, snippets (e.g. `cart-drawer`, `meta-tags`, `product-media-gallery`), section groups (header, footer), locales, and other assets.

## 1. Recover all missing files from your intact theme (recommended)

Use the theme you got `index.json` from (or any theme in the store that still has the full set of files).

```bash
# List themes and note the theme ID of the intact theme
shopify theme list --store=f63bae-86.myshopify.com

# Pull that theme and copy only MISSING files into src/ (won’t overwrite your customizations)
./scripts/theme-recover-missing-files.sh THEME_ID
```

Example: `./scripts/theme-recover-missing-files.sh 123456789`

The script will:
- Pull the intact theme into `./theme-recovery-pull`
- Copy into `src/` only files that are **missing** (snippets, sections, config, locales, layout, templates, assets)
- **Not** overwrite your custom `theme.liquid`, `main-product.liquid`, `index.json`, or ColorFlex assets

Then deploy with:

```bash
./deploy-shopify-cli.sh all
```

## Recovery options for index only (if you only needed the homepage)

### 1. Another theme in the same store
If you have a second theme that wasn’t overwritten (e.g. original “Sense”, or an older duplicate):

- **Option A – Pull that theme and copy the file**
  - List themes: `shopify theme list --store=f63bae-86.myshopify.com`
  - Pull the theme that might still have the homepage:  
    `shopify theme pull --theme=THEME_ID --store=f63bae-86.myshopify.com --path /tmp/theme-backup`
  - Look in `/tmp/theme-backup/templates/` for `index.liquid` or `index.json`.
  - If found, copy into this repo:  
    `cp /tmp/theme-backup/templates/index.liquid src/templates/` (or index.json).
  - Deploy: `./deploy-shopify-cli.sh all` or push only templates.

- **Option B – Copy from Theme Editor**
  - In Shopify Admin: Online Store → Themes → [Other theme] → Actions → Edit code.
  - Open `templates/index.liquid` or `templates/index.json`, copy all content, then in your live theme create the same file and paste.

### 2. Backup / restore app
If you use Rewind, Backup Bear, or similar: check whether they have a version of the theme that still includes the homepage template, and restore that file (or the whole theme) to a duplicate theme, then copy the file into this repo as above.

### 3. No backup available
If no other theme and no app backup has the file, the custom “advanced” version is not recoverable. Use the Dawn default `index.json` added to this repo so the homepage works again, then rebuild the advanced features in the theme editor or in `src/templates/index.json` / a new section.

## Fallback: Dawn default homepage

A standard Dawn `index.json` has been added to `src/templates/index.json`. It gives you a working homepage (banner, rich text, featured collection, etc.). Deploy with:

```bash
./deploy-shopify-cli.sh all
```

or push only templates. You can then customize it in the theme editor (Customize → Homepage) or by editing `src/templates/index.json` and re-deploying.
