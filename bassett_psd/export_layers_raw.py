"""Export raw layer images from PSD (by name) to a directory."""
from pathlib import Path


def export_layers_raw(psd_path, out_dir, layer_names=None):
    """
    Export specified layers (or all) from PSD as PNGs.
    psd_path: path to PSD
    out_dir: directory to write PNGs
    layer_names: optional list of layer names to export; if None, export all that have pixels
    Returns list of (layer_name, output_path).
    """
    from .loader import load_psd

    psd = load_psd(psd_path)
    if psd is None:
        raise RuntimeError("psd-tools not available or PSD failed to load")

    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    results = []

    for layer in psd.descendants:
        name = layer.name
        if layer_names is not None and name not in layer_names:
            continue
        try:
            comp = layer.composite()
            if comp is None:
                continue
            if hasattr(comp, "numpy"):
                import numpy as np
                from PIL import Image as PILImage
                arr = comp.numpy()
                if arr.ndim == 2:
                    pil = PILImage.fromarray(arr, mode="L")
                elif arr.shape[2] == 4:
                    pil = PILImage.fromarray(arr, mode="RGBA")
                else:
                    pil = PILImage.fromarray(arr, mode="RGB")
                safe = name.replace(" ", "_").replace("/", "_")
                p = out_dir / f"{safe}.png"
                pil.save(p)
                results.append((name, str(p)))
        except Exception:
            continue

    return results


if __name__ == "__main__":
    import argparse
    ap = argparse.ArgumentParser(description="Export PSD layers as PNGs")
    ap.add_argument("psd_path", help="Path to PSD file")
    ap.add_argument("--out-dir", type=Path, default=Path("./layers_out"), help="Output directory")
    ap.add_argument("--layer", action="append", dest="layers", help="Layer name (repeat for multiple)")
    args = ap.parse_args()
    export_layers_raw(args.psd_path, args.out_dir, args.layers)
