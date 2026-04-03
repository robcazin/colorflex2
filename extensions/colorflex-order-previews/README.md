# ColorFlex order previews (Admin UI extension)

Shows **inline thumbnails** on the **order details** page in Shopify Admin by reading each line item’s `customAttributes` for **`_pattern_preview`** (HTTPS image URL). This matches the line property your theme sets after `api/server.js` uploads the preview.

## Prerequisites

1. **Thumbnail URL on the order line** — Deploy `api/` (see `api/DEPLOYMENT.md`), set **Theme settings → ColorFlex → ColorFlex thumbnail upload API (base URL)**, and place a test order. In Admin, the order’s line item should list the property (or you can verify with Storefront `/cart.js` before checkout).
2. **A Shopify app** that can ship **Admin UI extensions** (Partner Dashboard + Shopify CLI). This folder is **one extension**; it is not a full app by itself.

## Install into a CLI app

1. Create an app (if you do not have one for extensions):

   ```bash
   npm init @shopify/app@latest
   ```

   Choose a template that supports **extensions** (e.g. Remix).

2. Copy this folder into the app:

   ```text
   your-app/extensions/colorflex-order-previews/
   ```

   (same layout as in this repo.)

3. From the **app root** (not the theme repo):

   ```bash
   cd your-app
   npm install
   shopify app dev
   ```

   Select this extension when prompted. Fix any version prompts so `shopify.extension.toml` `api_version` matches your CLI.

4. **OAuth scopes** — In the Partner Dashboard, ensure the app has at least **`read_orders`** (and any other scopes your app already uses). The extension queries `order { lineItems { nodes { customAttributes } } }`.

5. **Deploy** — `shopify app deploy`, install the app on your store, open **Settings → Apps** and confirm it is installed.

6. **Pin the block** — In Admin, open **Orders → [an order]**, click **Customize** (or the block picker, depending on Admin version), add **“ColorFlex order previews”** to the order details layout, save.

## Troubleshooting

- **Empty state message** — No line has `_pattern_preview` with an HTTPS URL. Fix storefront upload + theme API URL first.
- **GraphQL errors** — Confirm `read_orders` and that the app is installed on the same shop you’re viewing.
- **CORS** — Not applicable; the extension calls `shopify:admin/api/graphql.json` inside Admin.

## Files

| File | Purpose |
|------|--------|
| `shopify.extension.toml` | Target `admin.order-details.block.render` |
| `src/OrderPreviewBlock.jsx` | GraphQL + UI |
| `locales/en.default.json` | Extension name in Admin |
