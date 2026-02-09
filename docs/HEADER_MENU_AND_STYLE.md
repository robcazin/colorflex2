# Header: Menus and restyling

## Wallpaper Calculator (keep when editing header)

The header includes the **Wallpaper Calculator** in the right-side icon row:

- **Icon:** `header__icon--calculator` (calculator SVG inline in `header.liquid`).
- **Behavior:** Click calls `window.loadCalculatorModal()`, which fetches `assets/wallpaperCalculator.html` and opens it in a draggable modal.
- **Asset:** `src/assets/wallpaperCalculator.html` must be deployed with the theme.

When editing `src/sections/header.liquid`, do **not** remove the calculator link (id `wallpaperCalculatorIcon`) or the `{% javascript %}` block that defines `loadCalculatorModal`. Both are marked with a “KEEP” comment in the file.

---

## Menus showing up

The header section only shows navigation when **a menu is assigned** and that menu exists in your store.

### 1. Default menu in the theme

`src/sections/header-group.json` is set to use the **main menu** by default:

- **Menu:** `main-menu` (Shopify handle for “Main menu”)
- **Desktop style:** dropdown

If your store uses a different navigation (e.g. “Footer” or a custom one), either:

- In **Theme editor** → Header section → **Menu** → choose the correct menu, or  
- Edit `header-group.json` and change `"menu": "main-menu"` to the handle of your menu (e.g. `"footer"` for “Footer”).

### 2. Create the menu in Shopify Admin

If no menu shows:

1. In **Shopify Admin** go to **Online Store → Navigation**.
2. Ensure there is a menu whose **handle** is `main-menu` (the default “Main menu” has this handle).
3. Add links (e.g. Home, Catalog, Contact). Save.

After saving, the header will show that menu (once the theme has the menu setting pointing to it).

### 3. Menu type (desktop)

In the header section schema you can choose:

- **Dropdown** – classic dropdown menus (current default in `header-group.json`).
- **Mega menu** – wide mega menu (requires `component-mega-menu.css`).
- **Drawer** – menu opens in a side drawer (uses `component-menu-drawer.css`).

Change this in the Theme editor or by editing the `menu_type_desktop` value in `header-group.json`.

---

## Restyling the header

The header is built from the Sense theme and expects several CSS files. If those files are missing, the header and menus can look broken or unstyled.

### CSS files the header uses

These are loaded by `src/sections/header.liquid`:

| File | Purpose |
|------|--------|
| `component-list-menu.css` | List/menu links styling |
| `component-search.css` | Search in header |
| `component-menu-drawer.css` | Drawer menu (if menu type = drawer) |
| `component-cart-notification.css` | Cart notification |
| `component-mega-menu.css` | Mega menu (if menu type = mega) |

If you have a **previous/copy of the Sense theme** (e.g. backup or another theme):

1. Copy the files above from that theme’s `assets/` into `src/assets/`.
2. Deploy assets:  
   `./deploy-shopify-cli.sh css`  
   (or your usual CSS deploy).

### Restyling options

- **Theme editor:** Header section and global theme settings (e.g. **Theme settings → Colors, Typography**) control colors, fonts, logo size, spacing. Use these first for a quick restyle.
- **Custom CSS:** Add rules in Theme settings → **Custom CSS**, or in a section/block that allows custom CSS, to override header/menu styles.
- **Edit the component CSS:** After copying the `component-*.css` files into `src/assets/`, you can change them in the repo and redeploy with `./deploy-shopify-cli.sh css`.

### Deploying header changes

- **Section + menu settings:**  
  `./deploy-shopify-cli.sh sections`  
  (pushes `header.liquid` and `header-group.json`).
- **CSS only:**  
  `./deploy-shopify-cli.sh css`.

After changing `header-group.json` (e.g. menu or `menu_type_desktop`), run a sections (or full) deploy so the live theme gets the updated defaults.
