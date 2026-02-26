"""High-level: process PSD with pattern + blanket color, return composite PNG."""
from pathlib import Path

from .loader import load_psd
from .replace import solid_color_image
from .composite import composite_layers_to_image, composite_to_png_data_url


# Layer names from docs
PATTERN_LAYERS = [
    "LEFT PILLOW PATTERN",
    "RIGHT PILLOW PATTERN",
    "SOFA FABRIC PATTERN",
]
BLANKET_LAYER = "BLANKET COLOR"


def process_psd_template(psd_path, pattern_image_path_or_data_url, blanket_color="#336699"):
    """Open PSD, apply pattern to pattern layers and color to BLANKET, return composite PIL Image."""
    from PIL import Image
    import base64
    import io

    psd = load_psd(psd_path)
    if psd is None:
        raise RuntimeError("psd-tools not installed or PSD failed to load")

    # Load pattern image
    if isinstance(pattern_image_path_or_data_url, str):
        if pattern_image_path_or_data_url.startswith("data:"):
            header, b64 = pattern_image_path_or_data_url.split(",", 1)
            raw = base64.b64decode(b64)
            pattern_pil = Image.open(io.BytesIO(raw)).convert("RGBA")
        else:
            pattern_pil = Image.open(pattern_image_path_or_data_url).convert("RGBA")
    else:
        pattern_pil = pattern_image_path_or_data_url

    size = (psd.width, psd.height)
    layers_out = []

    for layer in psd.descendants:
        name = layer.name
        if name in PATTERN_LAYERS:
            # Use pattern (same for all; could scale/tile per layer)
            layer_img = pattern_pil.resize(size, Image.Resampling.LANCZOS) if pattern_pil.size != size else pattern_pil
            layers_out.append((name, layer_img))
        elif name == BLANKET_LAYER:
            w, h = getattr(layer, "width", size[0]) or size[0], getattr(layer, "height", size[1]) or size[1]
            layers_out.append((name, solid_color_image((w, h), blanket_color)))

    if not layers_out:
        # Fallback: single layer composite from PSD
        try:
            comp = psd.composite()
            if comp is not None and hasattr(comp, "numpy"):
                import numpy as np
                arr = comp.numpy()
                if arr.ndim == 3:
                    from PIL import Image as PILImage
                    if arr.shape[2] == 4:
                        out = PILImage.fromarray(arr, mode="RGBA")
                    else:
                        out = PILImage.fromarray(arr, mode="RGB")
                    return out
        except Exception:
            pass

    out = composite_layers_to_image(layers_out, size)
    return out


def process_psd_to_composite_png(psd_path, pattern_image_path_or_data_url, blanket_color="#336699"):
    """Return dict with 'data_url' (PNG data URL) of the composite."""
    img = process_psd_template(psd_path, pattern_image_path_or_data_url, blanket_color)
    data_url = composite_to_png_data_url(img)
    return {"data_url": data_url}
