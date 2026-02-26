/**
 * Bassett: one folder (sofa-with-pillow-1). Order = draw order (first = back, last = front).
 * Files: beauty.png, sofa_disp.png, pillow1_disp.png, pillow2_disp.png, pillow3_disp.png
 *
 * Per-layer transform (optional): add a "transform" object to pattern-displaced or wall-pattern
 * layers. The pattern is transformed (scale/translate/rotate) *before* displacement/mask is
 * applied, so the pattern is offset within the same confines (alpha/displacement shape).
 * All values optional; omitted = no change.
 *
 *   transform: {
 *     scale: 1.0,        // uniform scale (e.g. 1.1 = 10% larger pattern)
 *     scaleX: 1.0,       // separate X/Y scale (overrides scale if set)
 *     scaleY: 1.0,
 *     translateX: 0,     // pixels to shift pattern (positive = right/down)
 *     translateY: 0,
 *     rotation: 0        // degrees clockwise (e.g. 2 = slight tilt)
 *   }
 *
 * Transform is applied around the center of the layer's mask (displacement image size).
 */

export const BASSETT_LAYER_STACK = [
  { id: 'background', file: 'beauty.png', type: 'image', colorFlexIndex: null },
  { id: 'sofa-displaced', displacementFile: 'sofa_disp.png', type: 'pattern-displaced', colorFlexIndex: null },
  { id: 'pillow1-displaced', displacementFile: 'pillow1_disp.png', type: 'pattern-displaced', colorFlexIndex: null, transform: { scale: .95, translateY: -4, rotation: 7.5 } },
  { id: 'pillow2-displaced', displacementFile: 'pillow2_disp.png', type: 'pattern-displaced', colorFlexIndex: null, transform: { scale: .95, translatex: 4, translateY: 4, rotation: -5 } },
  { id: 'pillow3-displaced', displacementFile: 'pillow3_disp.png', type: 'pattern-displaced', colorFlexIndex: null, transform: { scale: .95, translateY: 40, rotation: -7.5 } },
];

var B2_BASSETT_LAYERS_BASE = 'https://s3.us-east-005.backblazeb2.com/cf-data/data/mockups/bassett/sofa-with-pillow-1';
/** Base URL for layer images (no trailing slash). Override with window.BASSETT_LAYERS_BASE_URL (must be absolute). */
export function getLayersBaseUrl() {
  var u = typeof window !== 'undefined' && window.BASSETT_LAYERS_BASE_URL ? (window.BASSETT_LAYERS_BASE_URL || '').toString().trim() : '';
  if (u && u.indexOf('http') === 0) return u;
  return B2_BASSETT_LAYERS_BASE;
}

/** Resolve layer file or displacement file path */
export function getLayerUrl(layer, baseUrl) {
  const base = baseUrl || getLayersBaseUrl();
  const file = layer.displacementFile || layer.file;
  return file ? base + '/' + file : null;
}
