# Emergency: Fix CORS on Backblaze B2 (cf-data) for Main Site

**CRITICAL:** Standard collections and ColorFlex thumbnails (e.g. coverlets, any pattern image from `s3.us-east-005.backblazeb2.com/cf-data/...`) will show CORS errors and fail to load until the bucket sends `Access-Control-Allow-Origin`. The fix is **bucket configuration**, not code.

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
env -u B2_APPLICATION_KEY -u B2_KEY_ID .venv-b2/bin/b2 bucket update --cors-rules '[]' cf-data allPublic
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
   env -u B2_APPLICATION_KEY -u B2_KEY_ID .venv-b2/bin/b2 bucket update --cors-rules '[]' cf-data allPublic
   source config/local.env
   .venv-b2/bin/python scripts/set-b2-s3-cors.py
   ```

3. **Verify**: In a terminal, check that the bucket returns CORS headers for a GET with `Origin`:
   ```bash
   curl -sI -H "Origin: https://saffroncottage.shop" "https://s3.us-east-005.backblazeb2.com/cf-data/data/collections/pages/thumbnails/piere.jpg" | grep -i access-control
   ```
   You should see `Access-Control-Allow-Origin: *` (or your origin). If not, S3 CORS is still not applied to the bucket.

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

### References

- [Backblaze CORS rules](https://backblaze.com/docs/cloud-storage-cross-origin-resource-sharing-rules)
- [Enable CORS with the CLI](https://www.backblaze.com/docs/cloud-storage-enable-cors-with-the-cli)
