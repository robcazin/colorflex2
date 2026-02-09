# Why the homepage still looks minimal after copying the index

Copying **only** the index template (index.json or index.liquid) from the previous theme is not enough. The page you see is built by:

1. **Layout** (theme.liquid) – which renders **header**, **footer**, **cart drawer**, then **template content**
2. **Template** (index.liquid or index.json) – the main content in the middle

Your layout expects snippets and section groups that are **missing** from this theme (e.g. `cart-drawer`, `header-group`, `footer-group`). So you only see the logo (“Saffron Cottage”) and the main content (“Welcome to SAFFRON COTTAGE” or whatever the index outputs). The full nav, footer, and structure never render because those files aren’t there.

## Fix: restore all missing files from the previous theme

Use the **previous theme** (the one you copied the index from) as the source and copy **every missing** snippet, section, config, and locale into `src/`. Then deploy.

### Step 1 – List themes and get the previous theme ID

```bash
shopify theme list --store=f63bae-86.myshopify.com
```

Note the **theme ID** of the previous theme (the one you got the index from). For this project, use **"Copy of Updated copy of Sense"** as the source.

### Step 2 – Recover missing files (no overwrites)

From the project root:

```bash
./scripts/theme-recover-missing-files.sh THEME_ID
```

Replace `THEME_ID` with the number from step 1. This will:

- Pull that theme into `./theme-recovery-pull`
- Copy into `src/` **only files that are missing** (snippets, sections, config, locales, layout, templates, assets)
- **Not** overwrite your custom `theme.liquid`, `main-product.liquid`, or ColorFlex assets

You should see it add things like `cart-drawer.liquid`, `meta-tags.liquid`, header/footer sections, config for section groups, and possibly `rich-text.liquid` (or the Sense equivalent) if that theme has it.

### Step 3 – Deploy everything with --nodelete

```bash
./deploy-shopify-cli.sh all
```

Answer **y** when prompted. This pushes the recovered files and your existing customizations without deleting anything on the theme.

### Step 4 – If index uses “rich-text” again

If the index you copied from the previous theme uses a **rich-text** (or similar) section and the recovery script **did** copy that section into `src/sections/`, then your full index.json will work and the homepage should show all sections.

If the recovery script **did not** copy a section that your index references (e.g. that theme didn’t have it either), you’ll still get “Section type 'X' does not refer to an existing section file” when pushing. In that case either remove that section from `index.json` again or add the missing section file from another source.

---

**Summary:** The minimal look is from **missing layout pieces** (header, footer, snippets), not just the index. Run the recovery script with the previous theme ID, then `./deploy-shopify-cli.sh all`, to restore the full page.
