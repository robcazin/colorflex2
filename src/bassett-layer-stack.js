/**
 * Bassett test composite: layer stack for sofa-with-pillows-mockup-2.
 * Order = draw order (first = back, last = front).
 * Source folder: /Volumes/K3/jobs/saffron/colorFlex-shopify/data/mockups/bassett/sofa-with-pillows-mockup-2/
 *
 * Displacement files: PILLOW-1-DSPL.png, PILLOW-2-DSPL.png, SOFA-DSPL.png
 */

export const BASSETT_LAYER_STACK = [
  // Back (drawn first)
  { id: 'background', file: 'Background.png', type: 'image', colorFlexIndex: null },
  // Optional: wall mask for wallpaper (tiled pattern, no deformation). Add WALL-MASK.png to use.
  { id: 'wall-pattern', file: 'WALL-MASK.png', type: 'wall-pattern', colorFlexIndex: null },
  { id: 'sofa-displaced', file: null, displacementFile: 'SOFA-DSPL.png', type: 'pattern-displaced', colorFlexIndex: null },
  { id: 'sofa-shadows', file: 'SOFA-SHADOWS.png', type: 'image', colorFlexIndex: null },
  { id: 'blanket', file: 'BLANKET-BACKGROUND.png', type: 'solid-color', colorFlexIndex: 1 }, // second ColorFlex color (index 1) — tint/fill this layer
  { id: 'pillow2', file: 'PILLOW-2.png', type: 'image', colorFlexIndex: null },
  { id: 'pillow2-displaced', file: null, displacementFile: 'PILLOW-2-DSPL.png', type: 'pattern-displaced', colorFlexIndex: null },
  { id: 'pillow2-shadows', file: 'PILLOW-2-SHADOWS.png', type: 'image', colorFlexIndex: null },
  { id: 'pillow1', file: 'PILLOW-1.png', type: 'image', colorFlexIndex: null },
  { id: 'pillow1-displaced', file: null, displacementFile: 'PILLOW-1-DSPL.png', type: 'pattern-displaced', colorFlexIndex: null },
  { id: 'pillow1-shadows', file: 'PILLOW-1-SHADOWS.png', type: 'image', colorFlexIndex: null },
  // Front (drawn last)
];

/** Base URL for layer images (no trailing slash). Override with window.BASSETT_LAYERS_BASE_URL */
export function getLayersBaseUrl() {
  return (typeof window !== 'undefined' && window.BASSETT_LAYERS_BASE_URL) ||
    '/data/mockups/bassett/sofa-with-pillows-mockup-2';
}

/** Resolve layer file or displacement file path */
export function getLayerUrl(layer, baseUrl) {
  const base = baseUrl || getLayersBaseUrl();
  const file = layer.displacementFile || layer.file;
  return file ? base + '/' + file : null;
}
