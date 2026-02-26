"""Export layers or composites as PNG."""
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    Image = None


def export_layer_as_png(layer, out_path):
    """Export a single layer as PNG (e.g. from composite)."""
    if Image is None:
        raise RuntimeError("PIL/Pillow required")
    if hasattr(layer, "composite") and layer.composite():
        img = layer.composite()
        if hasattr(img, "numpy"):
            from PIL import Image as PILImage
            arr = img.numpy()
            if arr.ndim == 2:
                pil = PILImage.fromarray(arr, mode="L")
            elif arr.shape[2] == 4:
                pil = PILImage.fromarray(arr, mode="RGBA")
            else:
                pil = PILImage.fromarray(arr, mode="RGB")
            pil.save(out_path)
            return str(out_path)
    return None


def export_replacements_as_pngs(psd, replacements, out_dir):
    """Given a PSD and a dict of layer_name -> PIL Image, composite and export PNGs."""
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    results = []
    for name, pil in replacements.items():
        p = out_dir / f"{name.replace(' ', '_')}.png"
        pil.save(p)
        results.append(str(p))
    return results
