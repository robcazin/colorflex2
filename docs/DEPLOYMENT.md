# Deployment guide

Use the deploy script for **all** theme uploads. Run it from the **repo root** (where `deploy-shopify-cli.sh` lives).

---

## Deploy everything (recommended after restore work)

To push your whole local theme to Shopify without removing anything that exists only on the live theme:

```bash
./deploy-shopify-cli.sh all
```

- When it asks **Are you sure? (y/n)** type **y** and press Enter.
- It uses **`--nodelete`**, so files that exist on Shopify but not in your `src/` folder are **not** deleted.
- This uploads: sections (including main-product, rich-text), templates (index.json, etc.), layout, locales, snippets, assets, config.

Use this when you’ve made multiple changes (sections, templates, locales, CSS) and want one full sync.

---

## Deploy only certain parts

If you only changed one kind of file, you can push just that:

| What you changed | Command | What gets pushed |
|------------------|---------|-------------------|
| **Sections** (e.g. main-product, rich-text) | `./deploy-shopify-cli.sh sections` | main-product.liquid, rich-text.liquid |
| **Templates** (e.g. index.json) | `./deploy-shopify-cli.sh templates` | Script’s template list (see script for exact list) |
| **Locales** (translations, schema names) | `./deploy-shopify-cli.sh locales` | Entire `src/locales/` (en.default.json, en.default.schema.json) |
| **Layout** (theme.liquid) | `./deploy-shopify-cli.sh layout` | theme.liquid |
| **CSS** (after restoring theme CSS to src/assets/) | `./deploy-shopify-cli.sh css` | All `.css` in `src/assets/` |
| **ColorFlex JS + simple CSS** | `./deploy-shopify-cli.sh assets` | ColorFlex JS files + colorflex-simple-mode.css |
| **collections.json** (design data) | `./deploy-shopify-cli.sh data` | collections.json to theme assets |

Each command will list what it will push and ask **Continue? (y/n)** — type **y** to run it.

---

## After the restore work we did

To get the latest sections (rich-text with blocks, main-product), templates (index.json with rich-text sections), and locales (schema names reconnected) onto the live theme in one go:

```bash
./deploy-shopify-cli.sh all
```

Answer **y** when prompted. That single run is enough for the deployment.

---

## Notes

- **Theme target:** The script is set to theme **#150150381799** (“Updated copy of Sense”) on **f63bae-86.myshopify.com**. To change store or theme, edit the script or use Shopify config.
- **Never run** `shopify theme push` without `--nodelete` from the repo root unless you intend to delete remote-only files.
- **Help:** Run `./deploy-shopify-cli.sh help` (or no argument) to see all options.

---

## Recent ColorFlex patch deploy set (April 2026)

For recent ColorFlex runtime/UI fixes, this is the safe targeted deploy sequence after `npm run build`:

```bash
./deploy-shopify-cli.sh only assets/color-flex-core.min.js
./deploy-shopify-cli.sh only assets/color-flex-furniture.min.js
./deploy-shopify-cli.sh only assets/color-flex-clothing.min.js
./deploy-shopify-cli.sh only assets/unified-pattern-modal.js
```

Use this targeted set for updates like:

- My Designs save/delete behavior fixes
- chameleon icon placement/stability fixes
- welcome modal logic or return-flow behavior that depends on runtime assets

---

## Content page updates (Trade + Contact)

For static content/style page updates, deploy only the touched template/section files:

```bash
./deploy-shopify-cli.sh only templates/page.trade-program.liquid
./deploy-shopify-cli.sh only sections/main-page.liquid
./deploy-shopify-cli.sh only sections/contact-form.liquid
```

Notes:

- Current VIP Trade page primary CTA routes to `/pages/contact` (not a direct support mailbox).
- This is intentional until a dedicated support inbox is confirmed.

---

## Cursor agent: build then deploy

The repo includes **`.cursor/rules/deploy-after-build.mdc`** (always-on for Cursor). Unless the project owner opts out, agents should **deploy right after a production webpack build** (for example `npm run build` or `npm run build:all`):

```bash
npm run theme:push:changed:assets
```

That pushes git-changed files under `src/assets/` (including the minified ColorFlex bundles). If you also edited Liquid, JSON templates, or sections outside assets, run **`npm run theme:push:changed`** or a targeted `./deploy-shopify-cli.sh only …` as appropriate.

---

## Coordinates: “Back to Pattern” control (April 2026)

When the shopper picks a **coordinate** row, **`#backToPatternLink`** is appended inside **`#coordinatesContainer`**. Runtime code in **`src/CFM.js`** measures the first **`.coordinate-item`** and places the link **about 30px to its left**, **vertically centered** on that thumbnail (`position: absolute` inside the already `position: relative` container, with a **`ResizeObserver`** to keep alignment when the block reflows). Shared styles are in **`src/styles/CFM-merged.css`** (merged into **`src/assets/color-flex-core.min.css`**). After changing `CFM.js` or coordinate-related CSS, run **`npm run build:all`** (or the relevant mode build) and deploy the updated **`color-flex-*.min.js`** / core CSS using the commands above.
