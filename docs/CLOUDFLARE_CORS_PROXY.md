# Cloudflare CORS Proxy (ColorFlex Data)

ColorFlex loads pattern images (coordinates, thumbnails, layers) from Backblaze B2. When the B2 bucket does not send `Access-Control-Allow-Origin`, browsers block these requests with CORS errors. The **Cloudflare Worker proxy** solves this by fetching from B2 and adding CORS headers—no B2 credentials needed in the Worker.

## When to use

- **Primary:** B2 S3 CORS won't stick (script reports success but curl/browser still get no header)
- **Fallback:** You prefer not to manage B2 CORS; the proxy is a one-time setup
- **Quick fix:** See **`docs/CORS_QUICK_FIX.md`** for a 5‑minute setup guide

## Components

| Item | Path | Purpose |
|------|------|---------|
| Worker script | `scripts/cf-cors-proxy-worker.js` | Deploy to Cloudflare Workers |
| Quick guide | `docs/CORS_QUICK_FIX.md` | Step-by-step deployment |
| Full CORS docs | `docs/BACKBLAZE_CORS_FIX.md` | B2 CORS + proxy workaround section |

## Flow

1. Theme setting **"ColorFlex data base URL"** is set to the Worker URL (e.g. `https://colorflex-cors-proxy.YOUR-SUBDOMAIN.workers.dev`)
2. ColorFlex requests go to the Worker instead of B2 directly
3. Worker forwards `GET`/`HEAD` to `https://s3.us-east-005.backblazeb2.com/cf-data/<path>`
4. Worker adds `Access-Control-Allow-Origin: *` and returns the response
5. Browser allows the load; no CORS error

## Theme configuration

- **Online Store** → **Themes** → **Customize** → **Theme settings** → **ColorFlex**
- **ColorFlex data base URL** = Worker URL, **no trailing slash**, no `/cf-data`
- Apply to both main theme and CF Bassett theme if both use ColorFlex data from B2

## References

- **`docs/CORS_QUICK_FIX.md`** — Fast setup
- **`docs/BACKBLAZE_CORS_FIX.md`** — "If CORS still won't stick: proxy workaround"
- **`docs/DATA_AND_CORS.md`** — Data source overview
