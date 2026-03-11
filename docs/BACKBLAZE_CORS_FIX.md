# Emergency: Fix CORS on Backblaze B2 (cf-data) for Main Site

**CRITICAL:** Standard collections and ColorFlex thumbnails (e.g. coverlets, any pattern image from `s3.us-east-005.backblazeb2.com/cf-data/...`) will show CORS errors and fail to load until the bucket sends `Access-Control-Allow-Origin`. The fix is **bucket configuration**, not code. **If CORS breaks again:** run `source config/local.env && .venv-b2/bin/python scripts/set-b2-s3-cors.py` (see “Fix” below).

**Quick fix (run from repo root):**  
`source config/local.env && .venv-b2/bin/python scripts/set-b2-s3-cors.py`  
If it fails or CORS errors persist, clear B2 Native CORS then re-run (see "Thumbnails / Bassett still blocked?" below).

**If CORS still never appears** (script says OK but curl/browser still get no header): use the **proxy workaround** so the store never talks to B2 directly—see **"If CORS still won't stick: proxy workaround"** at the end of this doc. You deploy a tiny Cloudflare Worker that adds the CORS header and set the theme’s "ColorFlex data base URL" to the Worker URL; all image requests then go through the proxy and load correctly.

**Background:** See **`docs/DATA_AND_CORS.md`** for: where the main site gets its data (Backblaze by default), why Bassett deploy doesn’t touch the live theme, and why the fix is bucket CORS not code.

The main site and **Bassett** (e.g. `/pages/bassett`) load ColorFlex images and **thumbnails** from `https://s3.us-east-005.backblazeb2.com/cf-data/...` (e.g. `.../data/collections/coverlets/thumbnails/zane-tweed.jpg`). Browsers block these when the bucket does **not** send `Access-Control-Allow-Origin`. The store uses the **S3-Compatible** URL, so CORS must be set via the **S3 API** (Option B or the Python script). B2 Native API CORS (Option A) does **not** apply to that endpoint.

---

## Why does CORS keep breaking?

1. **Two CORS configs, one URL**  
   Backblaze has **B2 Native CORS** (console / `b2 bucket update --cors-rules`) and **S3 CORS** (S3 API only). Your app uses the **S3** URL (`s3.us-east-005.backblazeb2.com`). Only **S3 CORS** applies to that. If CORS was set in the B2 console or with the B2 CLI, it doesn’t affect the S3 endpoint, so the browser still blocks. Fix: always use the **S3** method (Python script or AWS CLI).

2. **CORS lives on the bucket, not in the repo**  
   CORS is bucket configuration in the cloud. It isn’t stored in this repo. So a new bucket, a restored bucket, or a bucket that was recreated won’t have CORS until you run the script again.

3. **B2 Native CORS can block S3 CORS**  
   If the bucket already has B2 Native CORS rules, Backblaze can reject setting S3 CORS until Native CORS is cleared. So after any “reset” or console change that re-adds Native CORS, you may need to clear it and re-run the S3 CORS script.

4. **One-time checklist after any bucket change**  
   After creating or reconfiguring the `cf-data` bucket: (1) Clear B2 Native CORS if present: `b2 bucket update --cors-rules '[]' cf-data allPublic`. (2) Run `scripts/set-b2-s3-cors.py` with credentials in env. (3) Verify with the `curl` command in “Verify” below.

---

## Automatic CORS in the update process

**`update-collection.sh`** runs the S3 CORS script automatically at the end of every run when B2 credentials are in the environment.

- **When:** After collection update, Shopify deploy, and product creation (if any). CORS is applied once per run; the call is idempotent.
- **Requirements:** `B2_KEY_ID` and `B2_APPLICATION_KEY` set (e.g. in `config/local.env`), and `.venv-b2` with boto3 (`python3 -m venv .venv-b2 && .venv-b2/bin/pip install boto3`). The script loads `config/local.env` at startup.
- **If CORS is skipped:** Missing credentials, missing `scripts/set-b2-s3-cors.py`, or missing `.venv-b2` causes a warning and the update continues. You can then run the manual fix below.

So you don’t need to remember to run the CORS script separately when using the normal update flow.

---

## Fix: Add CORS rules to the `cf-data` bucket (manual)

### Recommended: Python script (no AWS CLI)

From repo root, with B2 credentials in env (e.g. `source config/local.env`):

```bash
source config/local.env
.venv-b2/bin/python scripts/set-b2-s3-cors.py
```

If the script fails with **"bucket contains B2 Native CORS rules"** (or CORS errors persist), clear B2 Native CORS first, then run the script again:

```bash
env -u B2_APPLICATION_KEY -u B2_KEY_ID -u B2_APPLICATION_KEY_ID .venv-b2/bin/b2 bucket update --cors-rules '[]' cf-data allPublic
source config/local.env
.venv-b2/bin/python scripts/set-b2-s3-cors.py
```

The script uses boto3 (already in `.venv-b2`) and your `B2_KEY_ID` / `B2_APPLICATION_KEY` from `config/local.env`.

---

## Thumbnails / Bassett still blocked by CORS?

If you see **"Access to image at 'https://s3.us-east-005.backblazeb2.com/cf-data/...' has been blocked by CORS policy"** (e.g. on the Bassett page or when loading standard pattern thumbnails):

1. **Re-apply S3 CORS** (B2 Native CORS does *not* apply to S3 URLs):
   ```bash
   source config/local.env
   .venv-b2/bin/python scripts/set-b2-s3-cors.py
   ```

2. **If the script fails or CORS errors persist**, clear B2 Native CORS then re-run the script so only S3 CORS is in effect:
   ```bash
   env -u B2_APPLICATION_KEY -u B2_KEY_ID -u B2_APPLICATION_KEY_ID .venv-b2/bin/b2 bucket update --cors-rules '[]' cf-data allPublic
   source config/local.env
   .venv-b2/bin/python scripts/set-b2-s3-cors.py
   ```

3. **Verify**: In a terminal, check that the bucket returns CORS headers for a GET with `Origin`:
   ```bash
   curl -sI -H "Origin: https://saffroncottage.shop" "https://s3.us-east-005.backblazeb2.com/cf-data/data/collections/english-cottage/thumbnails/keswick.jpg" | grep -i access-control
   ```
   You should see `Access-Control-Allow-Origin: *` (or your origin). If not, S3 CORS is still not applied to the bucket.

4. **Only one collection failing (e.g. stripes)?** If other collections load but a single collection’s thumbnails show “blocked by CORS policy”, the cause is often **404 Not Found**: the image object is missing on B2, and S3/B2 typically do **not** send CORS headers on error responses, so the browser reports a CORS error. Check the real status:
   ```bash
   curl -sI "https://s3.us-east-005.backblazeb2.com/cf-data/data/collections/stripes/thumbnails/handwrought-stripe.jpg"
   ```
   If you see `HTTP/2 404`, the fix is to **upload the missing collection images** to B2 (e.g. ensure `data/collections/<collection>/thumbnails/` is synced from your data source). If you see `HTTP/2 200`, then re-apply S3 CORS (step 1) and test again with the `Origin` curl above.

---

### Shopify-recommended CORS via B2 CLI (exact rule for S3 GET)

Shopify recommends a specific CORS rule so your store can load images from the bucket. The Backblaze **web UI doesn’t let you paste this JSON**; you have to apply it with the **B2 command line**.

1. **Apply the Shopify rule** (from repo root). The B2 CLI uses your key from `config/local.env`; you don’t need to run `b2 account authorize`:
   ```bash
   source config/local.env
   .venv-b2/bin/b2 bucket update --cors-rules "$(cat scripts/b2-cors-cf-data-shopify.json)" cf-data allPublic
   ```
   That uses `scripts/b2-cors-cf-data-shopify.json`: origins `https://saffroncottage.shop` and `https://*.myshopify.com`, operation `s3_get`, so the S3-compatible endpoint should send CORS headers for GETs.

2. **Verify:** hard-refresh the store or test with:
   ```bash
   curl -sI -H "Origin: https://saffroncottage.shop" "https://s3.us-east-005.backblazeb2.com/cf-data/data/collections/geometry/thumbnails/rapids.jpg" | grep -i access-control
   ```
   You should see `Access-Control-Allow-Origin`. If you see **no output**, the S3 endpoint is still not sending CORS—use the **“Nuclear option”** below.

**Nuclear option (S3 endpoint only):** The S3 URL often only obeys **S3 CORS**, not B2 Native rules. If the Shopify rule didn’t fix the `curl` check, clear Native CORS and apply S3 CORS with the script:
   ```bash
   source config/local.env
   .venv-b2/bin/b2 bucket update --cors-rules '[]' cf-data allPublic
   .venv-b2/bin/python scripts/set-b2-s3-cors.py
   ```
   Then run the `curl` command again; you should see the header. After that, hard-refresh the store.

---

### Option A: B2 Native API (B2 CLI) — not sufficient for S3 URLs

This repo has a project-local B2 CLI in `.venv-b2` (no system install needed). From repo root:

1. **Authorize** (one-time; opens browser for Backblaze login):
   ```bash
   .venv-b2/bin/b2 account authorize
   ```

2. **Apply CORS** (if you have `config/local.env` sourced, unset B2 vars so b2 uses cached auth):
   ```bash
   env -u B2_APPLICATION_KEY -u B2_KEY_ID .venv-b2/bin/b2 bucket update --cors-rules "$(<./scripts/b2-cors-cf-data.json)" cf-data allPublic
   ```
   If the bucket is private, use `allPrivate` instead of `allPublic`.

   **If you don’t have the venv** (e.g. on another machine), create it and install B2:
   ```bash
   python3 -m venv .venv-b2 && .venv-b2/bin/pip install b2
   ```
   Then run the authorize and bucket-update commands above.

4. **Verify**: Reload a ColorFlex product and confirm layer images load (no CORS errors in the browser console).

### Option B: S3-Compatible API via AWS CLI (alternative to script)

If you prefer AWS CLI instead of the Python script:

1. **Install AWS CLI** (if needed): `brew install awscli` or [install from AWS](https://aws.amazon.com/cli/).

2. **Configure a profile for B2 S3** (one-time). Use your B2 Application Key ID as the access key and the Application Key as the secret key:
   ```bash
   aws configure set aws_access_key_id "YOUR_B2_KEY_ID" --profile b2
   aws configure set aws_secret_access_key "YOUR_B2_APPLICATION_KEY" --profile b2
   aws configure set region us-east-005 --profile b2
   ```

3. **Apply S3 CORS** from repo root (bucket name and endpoint must match your setup):
   ```bash
   aws s3api put-bucket-cors --bucket cf-data --cors-configuration file://scripts/s3-cors-cf-data.xml --endpoint-url https://s3.us-east-005.backblazeb2.com --profile b2
   ```

4. **Verify**: Reload the main site; layer images should load without CORS errors.

To restrict origins instead of `*`, edit `scripts/s3-cors-cf-data.xml`: replace `<AllowedOrigin>*</AllowedOrigin>` with e.g. `<AllowedOrigin>https://saffroncottage.shop</AllowedOrigin>`.

### Option C: Restrict B2 Native rule to your store only (optional)

In `scripts/b2-cors-cf-data.json`, change `"allowedOrigins": ["https"]` to `"allowedOrigins": ["https://saffroncottage.shop"]`, then run the same `b2 bucket update` command as in Option A.

---

## If CORS still won’t stick: proxy workaround

If the Python script reports success and `get_bucket_cors` shows rules, but **curl** and the browser still get no `Access-Control-Allow-Origin` header (or Backblaze support can’t fix S3 CORS), use a **same-origin proxy** that fetches from B2 and adds the header. The browser then loads images from the proxy (same origin or allowed CORS), so CORS is satisfied.

### Cloudflare Worker (recommended)

1. **Create a Worker** in [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages → Create → Create Worker. Paste the contents of **`scripts/cf-cors-proxy-worker.js`** (in this repo).

2. **Add a route** so the Worker runs on a URL you control, e.g.:
   - Subdomain: `colorflex-proxy.saffroncottage.shop/*` (add a CNAME in DNS pointing to your Worker), or
   - Workers.dev: `your-subdomain.workers.dev/*` (free, no DNS change).

3. **Set the theme base URL** in Shopify: **Online Store → Themes → Customize → Theme settings → ColorFlex** → set **“ColorFlex data base URL”** to the Worker URL **with no trailing slash**, e.g.:
   - `https://colorflex-proxy.saffroncottage.shop` or  
   - `https://your-subdomain.workers.dev`

4. Save and hard-refresh the store. All ColorFlex image requests (thumbnails, layers) will go through the proxy; the proxy fetches from B2 and returns the response with `Access-Control-Allow-Origin: *`, so the browser allows the load.

The Worker is a few lines: it forwards `GET`/`HEAD` to `https://s3.us-east-005.backblazeb2.com/cf-data/<path>` and adds CORS headers to the response. No B2 credentials are needed in the Worker; B2 bucket remains public for read.

### References

- [Backblaze CORS rules](https://backblaze.com/docs/cloud-storage-cross-origin-resource-sharing-rules)
- [Enable CORS with the CLI](https://www.backblaze.com/docs/cloud-storage-enable-cors-with-the-cli)
