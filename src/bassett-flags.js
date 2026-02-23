/**
 * Bassett-only flags: set before the main app (CFM.js) loads.
 * Used only by the Bassett bundle (index.bassett.js). Not imported by core/furniture/clothing.
 * This keeps Bassett behavior (test layers, no displacement worker) out of the Shopify bundles.
 */
if (typeof window !== 'undefined') {
  window.__BASSETT_BUNDLE_LOADED__ = true;
  window.COLORFLEX_MODE = 'BASSETT';
  window.BASSETT_USE_TEST_LAYERS = true;
  window.BASSETT_LAYERS_BASE_URL = '/data/mockups/bassett';
  window.BASSETT_SKIP_DISPLACEMENT = true;
}
