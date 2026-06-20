/**
 * Standalone Harmony Generator page (Shopify template: page.colorflex-harmony).
 * Bundled as assets/color-flex-harmony.min.js — not part of ColorFlex core CFM bundle.
 */
import { runPaletteDemo } from './demo/paletteDemo.js';

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const mount = document.getElementById('harmony-demo-mount');
    if (mount) runPaletteDemo(mount);
  });
}
