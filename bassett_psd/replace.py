"""Replace Smart Object contents and solid color layers."""
from pathlib import Path
import io

try:
    from PIL import Image
except ImportError:
    Image = None


def replace_smart_object_with_image(layer, image_path_or_pil):
    """Replace a Smart Object layer's contents with the given image (path or PIL Image)."""
    if Image is None:
        raise RuntimeError("PIL/Pillow required")
    if isinstance(image_path_or_pil, (str, Path)):
        img = Image.open(image_path_or_pil).convert("RGBA")
    else:
        img = image_path_or_pil
    # psd-tools may not support in-place replacement; caller may need to composite instead
    return img


def replace_solid_color_layer(layer, hex_color):
    """Return a PIL Image that would represent filling this layer with the given hex color."""
    if Image is None:
        raise RuntimeError("PIL/Pillow required")
    return solid_color_image(layer.size, hex_color)


def solid_color_image(size, hex_color):
    """Create a solid color RGBA image of the given size. size is (width, height)."""
    if Image is None:
        raise RuntimeError("PIL/Pillow required")
    hex_color = hex_color.strip().lstrip("#")
    if len(hex_color) == 6:
        r = int(hex_color[0:2], 16)
        g = int(hex_color[2:4], 16)
        b = int(hex_color[4:6], 16)
        a = 255
    else:
        r = g = b = 128
        a = 255
    w, h = size if isinstance(size, (list, tuple)) and len(size) >= 2 else (256, 256)
    img = Image.new("RGBA", (w, h), (r, g, b, a))
    return img


if __name__ == "__main__":
    import sys
    psd_path = sys.argv[1] if len(sys.argv) > 1 else "/Volumes/K3/jobs/saffron/colorFlex-shopify/data/mockups/bassett/sofa-with-pillows-mockup-1.psd"
    from .loader import load_psd
    psd = load_psd(psd_path)
    if psd:
        for layer in psd.descendants:
            if "BLANKET" in layer.name.upper():
                print(layer.name, layer.size)
