# CORS Quick Fix (Coordinates & Thumbnails)

If you're seeing **"blocked by CORS policy"** for coordinates or pattern images, use the **Cloudflare Worker proxy**—it works when bucket CORS won't stick.

## Steps (≈5 min)

### 1. Create a Cloudflare Worker

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Create Worker**
2. Name it (e.g. `colorflex-cors-proxy`)
3. Replace the default code with the contents of **`scripts/cf-cors-proxy-worker.js`** from this repo
4. Click **Deploy**

### 2. Get your Worker URL

- **workers.dev (free):** After deploy, you'll get a URL like `https://colorflex-cors-proxy.YOUR-SUBDOMAIN.workers.dev`
- **Custom domain:** Add a route (e.g. `colorflex-proxy.saffroncottage.shop`) and use that URL

### 3. Set the theme base URL in Shopify

1. **Online Store** → **Themes** → **Customize** (your live theme)
2. **Theme settings** (gear icon) → **ColorFlex**
3. **ColorFlex data base URL** → paste your Worker URL, e.g.:
   - `https://colorflex-cors-proxy.YOUR-SUBDOMAIN.workers.dev`
   - or `https://colorflex-proxy.saffroncottage.shop`
4. **No trailing slash.** Save.

### 4. Hard-refresh the store

Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows) to clear cache.

---

All ColorFlex image requests (coordinates, thumbnails, layers) will go through the proxy, which fetches from Backblaze and adds CORS headers. No B2 credentials needed in the Worker.
