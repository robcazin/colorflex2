# API Server Deployment Guide

This API server uploads thumbnails to Shopify Files so they're visible in orders.

## Quick Setup

### 1. Install Dependencies
```bash
cd api
npm install
```

### 2. Configure Environment Variables

Make sure `api/.env` has (use your real store and domains):
```bash
SHOPIFY_STORE=your-store-handle
SHOPIFY_ACCESS_TOKEN=your_admin_api_token_here
PORT=3001
ALLOWED_ORIGINS=https://your-store.myshopify.com,https://your-custom-domain.com
```

### 3. Test Locally

```bash
npm start
```

The server will run on `http://localhost:3001`

Test it:
```bash
curl http://localhost:3001/api/health
```

### 4. Deploy to a Hosting Service

You need to deploy this API server so it's accessible from your Shopify store.

**Recommended hosting options:**

1. **Railway** (easiest):
   - Go to https://railway.app
   - Connect your GitHub repo
   - Deploy the `api/` folder
   - Set environment variables in Railway dashboard
   - Get your Railway URL (e.g., `https://colorflex-api.railway.app`)

2. **Heroku**:
   - Create a Heroku app
   - Deploy the `api/` folder
   - Set environment variables
   - Get your Heroku URL

3. **Your own server**:
   - Deploy to your server
   - Use PM2 or similar to keep it running
   - Set up a domain/subdomain (e.g., `api.saffroncottage.shop`)

### 5. Update Theme Configuration

Once deployed, point the theme at your API **without editing Liquid by hand** (recommended):

1. **Shopify Admin** → **Online Store** → **Themes** → **Customize** → **Theme settings** → **ColorFlex**
2. Set **“ColorFlex thumbnail upload API (base URL)”** to your deployed origin only, e.g. `https://your-api-server.railway.app` (no `/api/upload-thumbnail` suffix).

That sets `window.COLORFLEX_API_URL` for `product-form.js`.

**End-to-end checklist (API + theme + Admin preview block):** see **`docs/COLORFLEX_MANAGER_PREVIEW_STEPS.md`** in this repo.

### 6. Test the Flow

1. Add a pattern to cart
2. Check browser console for upload messages
3. Check cart properties - should see `_pattern_preview` with a Shopify URL
4. Complete checkout
5. Check order in Shopify Admin - should see `_pattern_preview` property with the thumbnail URL

## How It Works

1. **Customer adds to cart**: Thumbnail (base64) is sent to API server
2. **API server uploads to Shopify Files**: Uses Shopify Admin API to upload
3. **Shopify returns URL**: e.g., `https://cdn.shopify.com/s/files/1/.../colorflex-thumbnail.jpg`
4. **URL stored in cart property**: `_pattern_preview` = Shopify URL
5. **Order created**: `_pattern_preview` URL is in the order
6. **Admin views order**: Can see the thumbnail URL in order properties

## Troubleshooting

- **Upload fails**: Check API server logs, verify Shopify credentials
- **CORS errors**: Make sure your store URL is in `ALLOWED_ORIGINS`
- **Thumbnail not in order**: Check browser console for upload errors
