# Bassett: Per-Layer Pattern Transforms (handoff note)

**Status (as of this note):** Implemented and working. User is reworking assets and will return.

## What we built

- **Per-layer transform handles** so the pattern can be scaled, translated, and rotated **per object** (sofa, pillow1–3).
- Transform is applied to the **pattern only**, **before** displacement/mask. So the pattern is offset within the same confines (alpha/displacement shape); the mask stays the same.

Pipeline: **pattern → transform (scale/translate/rotate) → mask by displacement → composite.**

## Where it lives

- **`src/bassett-layer-stack.js`** – Layer stack definition. Add optional `transform: { scale, scaleX, scaleY, translateX, translateY, rotation }` on any `pattern-displaced` or `wall-pattern` layer. Transform is in “mask space” (displacement image size).
- **`src/bassett-flags.js`** – Imports `BASSETT_LAYER_STACK` and sets `window.BASSETT_LAYER_STACK` so CFM uses it (required for transforms to apply).
- **`src/CFM.js`** – `applyLayerTransform(ctx, transform, w, h)` helper; used when building the **pattern buffer** for each layer (tileCanvas for pattern-displaced, wallTile for wall-pattern), not on the final composite draw. Search for `applyLayerTransform` and “layer.transform” in the composite loop (~13976–14155).

## Deploy

- **Local:** `npm run bassett` (build + local server). Uses `src/assets/color-flex-bassett.min.js`.
- **Shopify pages/bassett on main theme:** `./deploy-shopify-cli.sh bassett-live` (builds and pushes to **live** theme). Use `bassett` only for the unpublished CF Bassett theme preview.

## Debug logs (can remove later)

- `bassett-flags.js`: logs “[Bassett] layer stack set from bassett-layer-stack.js…”
- `CFM.js` composite: logs stack source (window vs CFM internal) and per-layer transforms.

## Next steps (when user returns)

- User is reworking assets; will return to continue.
- Possible follow-ups: tune transform values per layer, remove or reduce debug logging, any further composite tweaks.
