# Syncing with the Shopify theme editor

When you change colors, layout, or section settings in the **Shopify theme editor**, those changes live on the theme in Shopify. Your local `src/` folder does not update automatically. To keep local and remote in sync and compare by **dates/timestamps** and content, use this workflow.

---

## 1. Pull the theme from Shopify

Downloads the current theme (including editor changes) into a local folder.

```bash
./deploy-shopify-cli.sh pull
```

Or run the script directly:

```bash
./scripts/theme-pull.sh              # Pull into theme-pull/
./scripts/theme-pull.sh --stamped     # Pull into theme-pull-YYYYMMDD-HHMM/
```

- **theme-pull/** – overwrites with latest each time (good for “current state”).
- **theme-pull-YYYYMMDD-HHMM/** – keeps a timestamped snapshot so you can compare across pulls.

---

## 2. Compare local vs pulled theme

Shows which files **differ** (content) and reports **modification times** (local and remote) for those files. Editor-relevant paths are compared: `config/`, `templates/`, `sections/`, `layout/`.

```bash
./scripts/theme-compare.sh              # Uses theme-pull/ by default
./scripts/theme-compare.sh theme-pull-20250208-1430   # Or a stamped folder
```

Output:

- **DIFF** – file exists in both but content differs; shows **local** and **remote** modification times.
- **only in local** – in `src/` but not in the pulled theme.
- **only in remote** – in the pulled theme but not in `src/` (e.g. new from editor).

Summary counts are printed at the end.

---

## 3. Use dates and diffs to decide what to sync

- **Remote newer / you want editor changes in repo**  
  Copy from the pull folder into `src/`:
  ```bash
  cp theme-pull/config/settings_data.json src/config/
  cp theme-pull/templates/collection.json src/templates/
  # etc.
  ```
- **Local newer / you want to push code to the theme**  
  Use the deploy script (e.g. `./deploy-shopify-cli.sh sections` or `templates`) so your local file wins on the next push. Be aware a full push can overwrite editor-only changes unless you merge them into local first.

---

## 4. Suggested workflow

| Step | When |
|------|--------|
| **Pull** | After you (or someone) has been editing the theme in the Shopify editor and you want those changes locally. |
| **Compare** | After every pull, to see what’s different and which side (local vs remote) is newer for each file. |
| **Copy into src/** | When you want to keep editor changes and bring them into your repo (e.g. `config/settings_data.json`, `templates/*.json`, section JSON). |
| **Push (deploy)** | When you’ve changed Liquid/CSS/JS in `src/` and want to update the live theme. Use targeted options (sections, templates, css, etc.) to avoid overwriting editor-only changes you haven’t merged. |

---

## 5. Files the editor usually changes

These are what the compare script focuses on and what you’ll often need to sync by hand:

- **config/settings_data.json** – theme settings, colors, typography, section order.
- **templates/*.json** – which sections/blocks appear on each template and their settings.
- **sections/*.json** – section group config (e.g. header-group, footer-group).
- **layout/theme.liquid** – only if you change the layout in the editor.

Comparing **dates** (via the compare script) and **content** (via the reported DIFFs and `diff` for single files) lets you decide what to copy from the pull folder into `src/` and what to push from `src/` to the theme.
