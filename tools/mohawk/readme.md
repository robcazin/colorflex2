# Mohawk image palette tool

Standalone CLI (Node + **sharp**) that extracts **role-aware** swatches from a product preview: **background**, **linework**, **accent**, optional **extra**\*.

**Canonical script:** `tools/mohawk/extract-palette.js` (run from repo root).

Console includes **`Extractor version: role-aware-v2-debug`** and a **per-cluster debug table** after each run.

## Run

```bash
node tools/mohawk/extract-palette.js ./path/to/carpet.jpg --colors 5
node tools/mohawk/extract-palette.js "https://example.com/product.jpg" --colors 3
```

Default output: `src/demo/mohawkPaletteTest.json`.

## Options

| Flag | Meaning |
|------|---------|
| `--colors N` | Swatch count **3–6** (default **5**). |
| `--min-delta-e D` | Min **Lab ΔE (CIE76)** from pass-1 background centroid for a pixel to count as “feature” unless it’s in the small k=2 cluster (default **6**, try **6–10**). |

## Algorithm (short)

- **Pass 1:** k=2 on opaque pixels; larger cluster = **background**.
- **Feature mask:** non-background label **or** **ΔE** from background centroid above threshold (with automatic relaxation if the pool is tiny).
- **Pass 2:** k-means on feature pixels (k **3–4**).
- **Linework / accent:** scored clusters (low-sat dark structure vs warm / saturated motif); see script comments.
- Deterministic k-means init and subsampling.

## JSON output

`mohawkPaletteTest.json`:

- `source`, `disclaimer`, `averageSaturation`, `paletteCharacter` (`neutral-anchor` \| `color-driving`), `strategy`, `palette` (`background`, `linework`, `accent`, …).

## Disclaimer

Image-derived **test** data only — **not** manufacturing-accurate color.
