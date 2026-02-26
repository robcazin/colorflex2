# bassett_psd

PSD pipeline for Bassett: load sofa mockup PSD, replace Smart Object layers with the ColorFlex pattern, set BLANKET COLOR, export composite PNG.

## Layer names (must match PSD)

- **LEFT PILLOW PATTERN**, **RIGHT PILLOW PATTERN**, **SOFA FABRIC PATTERN** — Smart Objects; replace with pattern image.
- **BLANKET COLOR** — Solid fill from user color (hex).

## Usage

- **Python (no Photoshop):** `process_psd_to_composite_png(psd_path, pattern_data_url, blanket_color)` returns `{ "data_url": "data:image/png;base64,..." }`. Pattern stays flat (no warp). Install: `pip install -r requirements-psd.txt`.
- **Photoshop (warped output):** Use `run_bassett_photoshop.sh` (macOS + Photoshop). Writes bridge file; JSX reads it and exports composite.
- Output is written to `colorflex2-bassett/bassett_psd_output/composite_photoshop.png` (or `./bassett_psd_output/` if no worktree), unless you pass a third argument or `--output path`.

## Export layers only

```bash
python scripts/export_psd_layers_raw.py /path/to/sofa.psd --out-dir ./my_layers
```

## Test PSD path (example)

`/Volumes/K3/jobs/saffron/colorFlex-shopify/data/mockups/bassett/sofa-with-pillows-mockup-1.psd`

## Worktree

If the **colorflex2-bassett** worktree exists (sibling of the repo you're in), files go to **`colorflex2-bassett/bassett_psd_output/`** (composite.png + per-layer PNGs with `--layers`).
