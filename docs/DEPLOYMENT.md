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
