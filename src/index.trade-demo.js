/**
 * Trade-show offline demo entry (wallpaper only).
 * Does not import src/index.js — no Shopify cart wrapper.
 */
window.ColorFlexBuildTarget = 'trade-demo';

import './CFM.js';

function bootTradeDemo() {
  if (typeof window.startApp !== 'function') {
    console.error('[ColorFlex trade-demo] startApp not available after CFM load');
    return;
  }
  window.startApp().catch(function (err) {
    console.error('[ColorFlex trade-demo] startApp failed:', err);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootTradeDemo);
} else {
  bootTradeDemo();
}
