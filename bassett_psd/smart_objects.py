"""Find Smart Object layers in a PSD."""
from pathlib import Path


def find_smart_object_layers_from_path(psd):
    """Return list of (layer, kind) for layers that are Smart Objects."""
    result = []
    for layer in psd.descendants:
        if hasattr(layer, "smart_object") and layer.smart_object is not None:
            result.append((layer, "smart_object"))
    return result


if __name__ == "__main__":
    import sys
    path = sys.argv[1] if len(sys.argv) > 1 else "/Volumes/K3/jobs/saffron/colorFlex-shopify/data/mockups/bassett/sofa-with-pillows-mockup-1.psd"
    from .loader import load_psd
    psd = load_psd(path)
    if psd:
        for layer, kind in find_smart_object_layers_from_path(psd):
            print(layer.name, kind)
