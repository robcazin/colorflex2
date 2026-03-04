/**
 * Bassett: one folder (sofa-with-pillow-1). Only set base URL if theme didn't.
 * Layer stack (with optional per-layer transforms) is loaded here so CFM uses it.
 */
import { BASSETT_LAYER_STACK } from './bassett-layer-stack.js';

if (typeof window !== 'undefined') {
  window.__BASSETT_BUNDLE_LOADED__ = true;
  window.COLORFLEX_MODE = 'BASSETT';
  window.BASSETT_LAYER_STACK = BASSETT_LAYER_STACK;
  var dispFiles = BASSETT_LAYER_STACK.map(function(l) { return l && (l.displacementFile || l.file); }).filter(Boolean);
  console.log('[Bassett] layer stack set from bassett-layer-stack.js, layers:', BASSETT_LAYER_STACK.length, 'files:', dispFiles.join(', '));
  var base = (window.BASSETT_LAYERS_BASE_URL || '').toString().trim();
  if (!base || base.indexOf('http') !== 0) {
    window.BASSETT_LAYERS_BASE_URL = 'https://s3.us-east-005.backblazeb2.com/cf-data/data/mockups/bassett/sofa-with-pillow-1';
  }
  window.BASSETT_SKIP_DISPLACEMENT = true;
}
