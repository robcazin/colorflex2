# Clear steps: manager sees ColorFlex previews on orders

Goal: **Store staff** see design thumbnails on **Orders** in Shopify Admin. That needs (1) a **public image URL** on each order line as `_pattern_preview`, and (2) an **Admin UI block** that displays those URLs.

Do these in order.

---

## Part A — Run the thumbnail upload API

The storefront cannot put a stable HTTPS URL on the line item without this API (`api/server.js` uploads to **Shopify Files** and returns the URL).

### A1. Local test (optional but useful)

```bash
cd api
cp .env.example .env
# Edit .env: set SHOPIFY_STORE (handle only, e.g. my-store), SHOPIFY_ACCESS_TOKEN (Admin API token from a custom app),
# and ALLOWED_ORIGINS=https://YOUR-STORE.myshopify.com,https://your-custom-domain.com
npm install
npm start
```

Confirm:

```bash
curl -s http://localhost:3001/api/health
```

You should get a JSON health response.

### A2. Deploy the `api` folder to the internet

Pick one host (Railway, Render, Fly, your VPS, etc.). Point the service at the **`api/`** directory (same as `api/RAILWAY_SETUP.md`).

Set these **environment variables** on the host (names must match what `api/server.js` expects):

| Variable | Example |
|----------|---------|
| `SHOPIFY_STORE` | `my-store` (no `https://`, no `.myshopify.com`) |
| `SHOPIFY_ACCESS_TOKEN` | Admin API token (custom app; **never** commit real values) |
| `ALLOWED_ORIGINS` | Your storefront origins, comma-separated: `https://my-store.myshopify.com,https://www.yourdomain.com` |
| `PORT` | Often set automatically by the host (e.g. Railway) |

After deploy, copy your **public base URL** (e.g. `https://colorflex-api.up.railway.app`). You will use it in Part B.

**Health check (replace with your URL):**

```text
https://YOUR-API-BASE/api/health
```

---

## Part B — Point the theme at the API

### B1. Theme settings (recommended)

1. Shopify Admin → **Online Store** → **Themes** → **Customize**.
2. Open **Theme settings** (gear) → find **ColorFlex**.
3. Set **“ColorFlex thumbnail upload API (base URL)”** to your API **origin only**, no path, no trailing slash:  
   `https://YOUR-API-BASE`
4. Save.

The theme sets `window.COLORFLEX_API_URL` to `{base}/api/upload-thumbnail` for `src/assets/product-form.js`.

### B2. Deploy / publish the theme

Push the updated theme to the store so the setting and `product-form.js` are live.

### B3. Verify `_pattern_preview` before checkout

1. On the storefront, add a ColorFlex wallpaper to cart.
2. Open the browser **console** on your shop domain and run:

```javascript
fetch('/cart.js').then(r => r.json()).then(c => {
  const p = c.items[0]?.properties || {};
  console.log('_pattern_preview:', p['_pattern_preview'] || '(missing)');
});
```

You want a string starting with `https://`. If it says **(missing)**, fix Part A/B (API down, wrong base URL, CORS, or upload error — check browser **Network** tab for `upload-thumbnail`).

### B4. Place a test order

Complete checkout for that cart. In Admin → **Orders** → open the order → check **line item properties** for **`_pattern_preview`** (URL). If the property is there, data is ready for Part C.

---

## Part C — Admin block: show thumbnails on the order page

The extension in this repo lives at **`extensions/colorflex-order-previews/`**. It only runs inside a **Shopify app** built with **Shopify CLI** (not Sidekick-only admin apps).

### C1. Create a CLI app (once)

On your machine:

```bash
npm init @shopify/app@latest
```

Use a template that supports **app extensions** (e.g. Remix). Complete login (`shopify auth login`) when asked.

### C2. Add this extension to that app

Copy the whole folder from this repo:

```text
colorflex2/extensions/colorflex-order-previews/
```

into:

```text
your-cli-app/extensions/colorflex-order-previews/
```

So you have `your-cli-app/extensions/colorflex-order-previews/shopify.extension.toml` and `src/OrderPreviewBlock.jsx`.

From **`your-cli-app`** root:

```bash
npm install
shopify app dev
```

Fix any prompts about API version so they match `shopify.extension.toml`.

### C3. App scopes

In **Partner Dashboard** → your app → **Configuration** → **Admin API integration** (or OAuth scopes), ensure the app can read orders (at minimum **`read_orders`**, or scopes your template already uses that include order read access).

### C4. Install the app on your store

Install the development or deployed app on the **same** store where you take orders.

### C5. Deploy the app (when ready)

From the app root:

```bash
shopify app deploy
```

Install/update the app on the store if prompted.

### C6. Pin the block on the order page

1. Admin → **Orders** → open any order that has **`_pattern_preview`** on a line.
2. Use **Customize** on the order details page (or the layout / “add block” control — exact UI depends on Shopify version).
3. Add the block named like **“ColorFlex order previews”** (from `locales/en.default.json`).
4. Save the layout.

You should see images for each line that has `_pattern_preview`.

---

## Quick troubleshooting

| Symptom | What to check |
|--------|----------------|
| `_pattern_preview` missing on cart | Theme API base URL; API `/api/health`; Network tab on add-to-cart for `upload-thumbnail` |
| CORS error in browser | `ALLOWED_ORIGINS` on API includes your exact storefront URL |
| Block says no previews | Order lines lack `_pattern_preview` (Part B) |
| GraphQL error in block | App installed; `read_orders`; logged into correct store |
| No block in picker | Extension deployed; app installed; try refreshing Admin |

---

## Related files in this repo

| Path | Role |
|------|------|
| `api/server.js` | `POST /api/upload-thumbnail` |
| `api/DEPLOYMENT.md` | API env vars and hosting notes |
| `src/config/settings_schema.json` | Theme setting `colorflex_api_base_url` |
| `src/assets/product-form.js` | Uploads thumbnail before `/cart/add` |
| `extensions/colorflex-order-previews/README.md` | Extension-only technical notes |
