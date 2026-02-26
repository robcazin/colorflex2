"""Composite layers into a single image and return PNG data URL."""
from pathlib import Path
import base64
import io

try:
    from PIL import Image
except ImportError:
    Image = None


def composite_layers_to_image(layers_and_images, size, background=(0, 0, 0, 0)):
    """Composite (layer_name, PIL Image) list into one RGBA image of size."""
    if Image is None:
        raise RuntimeError("PIL/Pillow required")
    out = Image.new("RGBA", size, background)
    for name, img in layers_and_images:
        if img is None:
            continue
        if img.size != size:
            img = img.resize(size, Image.Resampling.LANCZOS)
        out = Image.alpha_composite(out, img)
    return out


def composite_to_png_data_url(pil_image):
    """Convert PIL Image to data:image/png;base64,..."""
    if Image is None:
        raise RuntimeError("PIL/Pillow required")
    buf = io.BytesIO()
    pil_image.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    return f"data:image/png;base64,{b64}"
