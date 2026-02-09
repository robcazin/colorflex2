#!/usr/bin/env python3
"""
FLEX-SPLIT  |  Phase 1 prototype for ColorFlex layer extraction

Usage:
    python flex_split.py --image path/to/input.jpg --colors 8 --resize 2800
"""

import os, argparse, json
import numpy as np
from PIL import Image
from sklearn.cluster import KMeans
from skimage.color import rgb2lab, lab2rgb

# -----------------------------------------------------
# Helpers
# -----------------------------------------------------
def ensure_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def rgb_to_hex(rgb):
    return '#%02x%02x%02x' % tuple(int(v) for v in rgb)

# -----------------------------------------------------
# Core logic
# -----------------------------------------------------
def flex_split(image_path, n_colors=8, resize=None):
    base = os.path.splitext(os.path.basename(image_path))[0]
    out_dir = os.path.join("output", f"{base}_split")
    ensure_dir(out_dir)

    img = Image.open(image_path).convert("RGB")
    if resize:
        img = img.resize((resize, resize), Image.LANCZOS)
    arr = np.array(img, dtype=np.float32) / 255.0
    h, w, _ = arr.shape
    flat = arr.reshape((-1, 3))

    # Convert to LAB for perceptual clustering
    lab = rgb2lab(flat.reshape((h, w, 3))).reshape((-1, 3))

    print(f"▶ Quantizing {image_path} → {n_colors} colors ...")
    kmeans = KMeans(n_clusters=n_colors, random_state=42, n_init=5)
    labels = kmeans.fit_predict(lab)
    centers_lab = kmeans.cluster_centers_
    centers_rgb = (lab2rgb(centers_lab.reshape((1, n_colors, 3))).reshape((n_colors, 3)) * 255).clip(0,255)

    # Rebuild posterized image
    posterized = centers_rgb[labels].reshape((h, w, 3)).astype(np.uint8)

    # Export posterized base (for reference)
    Image.fromarray(posterized).save(os.path.join(out_dir, f"{base}_posterized.png"))

    manifest = {"source": image_path, "colors": []}

    for idx, center in enumerate(centers_rgb):
        color_hex = rgb_to_hex(center)
        mask = (labels.reshape((h, w)) == idx).astype(np.uint8) * 255
        rgba = np.zeros((h, w, 4), dtype=np.uint8)
        rgba[..., :3] = posterized
        rgba[..., 3] = mask
        layer_img = Image.fromarray(rgba, mode="RGBA")
        filename = f"layer_{idx+1:02d}.png"
        layer_img.save(os.path.join(out_dir, filename))
        manifest["colors"].append({"index": idx+1, "hex": color_hex, "path": filename})

        print(f"  • Exported {filename}  ({color_hex})")

    with open(os.path.join(out_dir, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)

    print(f"\n✅ Done. Layers written to {out_dir}")
    return out_dir

# -----------------------------------------------------
# CLI
# -----------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Split an image into color layers for ColorFlex.")
    parser.add_argument("--image", required=True, help="Path to image file")
    parser.add_argument("--colors", type=int, default=8, help="Number of dominant colors")
    parser.add_argument("--resize", type=int, help="Resize square dimension (e.g., 2800)")
    args = parser.parse_args()

    flex_split(args.image, n_colors=args.colors, resize=args.resize)
