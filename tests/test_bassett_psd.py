# Tests for bassett_psd package. Run from repo root:
#   python -m pytest tests/test_bassett_psd.py -v
# or
#   python -m unittest tests.test_bassett_psd

import sys
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from bassett_psd.loader import load_psd, enumerate_layers
from bassett_psd.smart_objects import find_smart_object_layers_from_path
from bassett_psd.replace import solid_color_image
from bassett_psd.composite import composite_to_png_data_url


# Use a real PSD path if available so tests can run; else skip
PSD_PATH = "/Volumes/K3/jobs/saffron/colorFlex-shopify/data/mockups/bassett/sofa-with-pillows-mockup-1.psd"


class TestBassettPsd(unittest.TestCase):
    @unittest.skipUnless(Path(PSD_PATH).exists(), "PSD not found")
    def test_load_psd(self):
        psd = load_psd(PSD_PATH)
        self.assertIsNotNone(psd)
        self.assertGreater(psd.width, 0)
        self.assertGreater(psd.height, 0)

    @unittest.skipUnless(Path(PSD_PATH).exists(), "PSD not found")
    def test_enumerate_layers(self):
        psd = load_psd(PSD_PATH)
        names = [name for name, _ in enumerate_layers(psd)]
        self.assertIsInstance(names, list)

    @unittest.skipUnless(Path(PSD_PATH).exists(), "PSD not found")
    def test_find_smart_objects(self):
        psd = load_psd(PSD_PATH)
        so_layers = find_smart_object_layers_from_path(psd)
        self.assertIsInstance(so_layers, list)

    def test_solid_color_image(self):
        img = solid_color_image((100, 100), "#336699")
        self.assertIsNotNone(img)
        self.assertEqual(img.size, (100, 100))

    def test_composite_to_png_data_url(self):
        img = solid_color_image((10, 10), "#ff0000")
        data_url = composite_to_png_data_url(img)
        self.assertTrue(data_url.startswith("data:image/png;base64,"))


if __name__ == "__main__":
    unittest.main()
