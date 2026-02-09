// Clothing-specific entry: suppress furniture-related console noise then load main app
(function() {
  const origLog = console.log.bind(console);
  const origWarn = console.warn.bind(console);
  const origError = console.error.bind(console);
  const filterRegex = /\b(furniture|FURNITURE|🪑|clothing config not found|FABRIC MOCKUP STARTING|FABRIC MODE: Using fabric config)\b/i;
  console.log = function(...args) {
    try {
      const s = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
      if (filterRegex.test(s)) return;
    } catch (e) {}
    origLog(...args);
  };
  console.warn = function(...args) {
    try {
      const s = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
      if (filterRegex.test(s)) return;
    } catch (e) {}
    origWarn(...args);
  };
  // Keep errors visible (but still allow filtering if desired)
  console.error = function(...args) {
    try {
      const s = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
      if (filterRegex.test(s)) return;
    } catch (e) {}
    origError(...args);
  };
  window.ColorFlexBuildTarget = 'clothing';
})();

import './index.js';
