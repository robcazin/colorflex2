"""Load PSD and enumerate layers by name."""
from pathlib import Path

try:
    from psd_tools import PSDImage
except ImportError:
    PSDImage = None


def load_psd(path):
    """Load PSD file; return PSDImage or None if psd-tools not available."""
    if PSDImage is None:
        return None
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(str(path))
    return PSDImage.open(path)


def enumerate_layers(psd, prefix=""):
    """Yield (name, layer) for all layers (recursive)."""
    for layer in psd.descendants:
        name = layer.name
        if prefix and not name.lower().startswith(prefix.lower()):
            continue
        yield name, layer
