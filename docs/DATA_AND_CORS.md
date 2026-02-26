# ColorFlex Data Source and CORS (Backblaze B2)

This doc answers: where does the main site get its images, did code/deploy cause the CORS break, and how to fix or avoid CORS issues. It’s written so you can come back to it without prior context.

---

## 1. Where does the main site get pattern images?

The **main site** (e.g. saffroncottage.shop) loads pattern layers and thumbnails from a **base URL** that can come from:

1. **Theme setting**  
   **Theme settings → ColorFlex → “ColorFlex data base URL”**.  
   If this is set, that URL is used (e.g. your Backblaze bucket).

2. **Code default**  
   If the setting is blank, the theme uses a **hardcoded default** in Liquid/JS:  
   `https://s3.us-east-005.backblazeb2.com/cf-data`  
   So by default the main site uses **Backblaze B2**, not so-animation.

So: **yes, the main site was using Backblaze** whenever that theme setting was blank or set to the B2 URL. It wasn’t “not using Backblaze” — the default in code and in theme settings is Backblaze.

---

## 2. Did “cross-contamination” or the Bassett deploy change the main site?

**No.** The deploy script is set up so that:

- **`./deploy-shopify-cli.sh bassett`**  
  Pushes **only** to the **CF Bassett** (unpublished) theme.  
  It uploads: `color-flex-bassett.min.js`, `page.colorflex-bassett.liquid`, `pattern-displace.worker.js`.  
  It does **not** push `color-flex-core.min.js` or any other file to the **live** theme.

- **Live theme** is only updated when you run other deploy modes (e.g. `assets`, `all`, `config`) **and** you’re on a branch that targets the live theme (e.g. `main`), not when you run `bassett`.

So:

- **Bassett deploy does not touch the live theme.**  
  No “source code sharing” or cross-contamination from the Bassett deploy to the main site.
- **Nothing in the Bassett deploy changes `color-flex-core.min.js` on the main site.**  
  Core on live only changes if you deploy assets/config to the live theme with a different build of core.

If the main site broke right after a Bassett deploy, the cause was not the Bassett deploy changing live code; the fix was still **bucket CORS** (see below).

---

## 3. Why did CORS break? (Bucket, not code)

ColorFlex loads images in JavaScript and draws them on a **canvas**. To do that safely, the code sets **`img.crossOrigin = "anonymous"`** when loading images. That makes the browser do a **CORS request**: it sends an `Origin` header and requires the image server to respond with **`Access-Control-Allow-Origin`**. If the server doesn’t send that header, the browser blocks the image and you see CORS errors in the console.

So:

- **Who requires CORS?**  
  The **browser**, because the **code** sets `crossOrigin` on images used for canvas. That’s normal and hasn’t changed for this.
- **Who must fix it?**  
  The **server** that serves the images — here, the **Backblaze bucket** (`cf-data`). The bucket must send the right CORS headers. That’s a **bucket configuration** issue, not a bug in ColorFlex or in the deploy script.

So:

- **Nothing in `color-flex-core.min.js` “caused” CORS in the sense of being wrong.**  
  The core has always needed CORS when loading cross-origin images for canvas; the missing piece was the **bucket** not sending CORS headers.
- **Fixing the break = configuring CORS on the bucket** (S3 CORS for the endpoint the site uses). No change to core was required to fix it.

---

## 4. B2 has two APIs → two CORS configs

Backblaze exposes the same bucket in two ways:

| API | URL you see | CORS config |
|-----|-------------|-------------|
| **B2 Native API** | e.g. `f005.backblazeb2.com/file/cf-data/...` | Set with B2 CLI: `b2 bucket update --cors-rules ...` |
| **S3-Compatible API** | `s3.us-east-005.backblazazeb2.com/cf-data/...` | Set with S3 API: `PutBucketCors` (e.g. our Python script or AWS CLI) |

The **main site** loads images from the **S3-Compatible** URL (`s3.us-east-005.backblazeb2.com/cf-data/...`). So:

- **Only S3 CORS** affects those requests.  
  B2 Native CORS does **not** apply to the S3 endpoint.
- If the bucket already had **B2 Native CORS** rules, Backblaze can **reject** S3 `PutBucketCors` until you clear the Native CORS rules. Then you set S3 CORS.

So “we set CORS but it still failed” usually means: CORS was set for the **Native** API, but the site uses the **S3** endpoint. You have to set CORS for the **S3** side (and clear Native CORS first if Backblaze asks for it).

---

## 5. How we fixed it (no AWS CLI)

We don’t use the AWS CLI. We use:

1. **Python script**  
   `scripts/set-b2-s3-cors.py`  
   It uses **boto3** and your B2 credentials (e.g. from `config/local.env`) to call the S3-compatible API and set CORS on the `cf-data` bucket.

2. **If the script errors** with something like “bucket contains B2 Native CORS rules”:  
   First **remove** B2 Native CORS, then run the script again:
   ```bash
   env -u B2_APPLICATION_KEY -u B2_KEY_ID .venv-b2/bin/b2 bucket update --cors-rules '[]' cf-data allPublic
   ```
   Then:
   ```bash
   source config/local.env
   .venv-b2/bin/python scripts/set-b2-s3-cors.py
   ```

Details and options (e.g. restrict origins) are in **`docs/BACKBLAZE_CORS_FIX.md`**.

---

## 6. Short answers to your questions

- **Did source code sharing / cross-contamination cause this?**  
  **No.** The Bassett deploy does not push any code to the live theme. No shared code was deployed to the main site by the Bassett deploy.

- **Was something changed in color-flex-core.min.js that caused it?**  
  **No.** The Bassett deploy doesn’t update core on live. The break was the bucket not sending CORS headers. Fix = S3 CORS on the bucket, not a change to core.

- **Was the main site maybe not using Backblaze before?**  
  **It was using Backblaze.** The theme default and the code fallback are both the Backblaze URL. So CORS was always required for the main site once it was on that default; the bucket just wasn’t configured for it until we set S3 CORS.

- **Do I need clear documentation?**  
  Yes. This file is that documentation. Use **`docs/BACKBLAZE_CORS_FIX.md`** for the exact fix steps (Python script, clearing Native CORS if needed).
