# ColorFlex layer pipeline and CORS policy

This document describes how pattern layers are recolored in production, what **must not** ship as “fixes,” and where real CORS problems are solved.

## Policy (non-negotiable for production)

- **No compositing hacks in shipped code.** The layer tint pipeline must use the real algorithm (pixel read + mask + `source-in` fill). Do not ship client-side approximations such as:
  - CSS `filter` chains (e.g. sepia / hue-rotate) to fake a chosen hex on grayscale separations
  - `globalCompositeOperation = 'color'` (or similar) as a **substitute** for `getImageData` when the canvas is tainted
  - Alternate tint paths that change hue globally and diverge from brand-accurate output

- **Debugging CORS** may use temporary experiments locally or behind a flag, but **those experiments must not be merged as the default online behavior** without infrastructure alignment.

- **If `getImageData` fails** because the image is cross-origin and the canvas is tainted, the correct fixes are **infrastructure-side**, for example:
  - CORS headers on the object store (e.g. Backblaze B2) allowing the storefront origin
  - Or serving layer assets from a same-origin path (Shopify CDN / theme assets / app proxy) so pixels are readable

Do not “paper over” tainted canvases with tint hacks in `processImage` for production.

## Canonical `processImage` behavior (summary)

Production `processImage` in `src/CFM.js` loads each layer with **`crossOrigin = "anonymous"`** and `normalizePath(url)` as the `src`. After `drawImage`:

1. **Non-shadow layers:** Read pixels with `getImageData`, build a soft alpha mask from luminance (white → transparent, ink → opaque), then **`source-in`** fill with the resolved hex from `lookupColor`. This preserves anti-aliasing and matches the intended ColorFlex look.

2. **Shadow layers:** Luminance → alpha for a multiply-friendly shadow pass.

3. **If `getImageData` throws** (e.g. tainted canvas): the handler returns the canvas **without** applying a fake tint hack. Empty or wrong-looking output is preferable to **wrong colors** shipped as if they were correct.

Thumbnail and other loaders use `urlForCorsFetch` where appropriate to avoid stale non-CORS cache entries; that is a cache-bust for fetch/CORS, not a compositing hack.

## Build and deploy

Wallpaper / core bundle:

```bash
npm run build:wallpaper
```

After a production webpack build for this project, deploy theme assets per project convention (e.g. `npm run theme:push:changed:assets` when only `src/assets/` changed).

## Historical note (why this doc exists)

Short-lived attempts added B2-specific branches, fetch+`ImageBitmap` decode paths, tainted-canvas “tint fallbacks,” and CSS filter tinting. Those approaches caused incorrect hues (e.g. green casts) or violated the policy above. They were removed; **production code was restored to the straightforward `processImage` + CORS-clean loading model** documented here.

When diagnosing “gray layers” or CORS in the console, treat the fix as **headers / hosting / URL origin**, not a new blend-mode workaround in `CFM.js`.
