#!/usr/bin/env node
/**
 * Build static index.html for local Bassett app from the Liquid template.
 * Run from repo root: node scripts/build-bassett-local-html.js
 * Output: bassett-local/index.html
 */
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const siblingMain = path.join(REPO_ROOT, '..', 'colorflex2');
const siblingBassett = path.join(REPO_ROOT, '..', 'colorflex2-bassett');
const fallbackRoots = [REPO_ROOT];
if (fs.existsSync(siblingMain)) fallbackRoots.push(siblingMain);
if (fs.existsSync(siblingBassett) && siblingBassett !== REPO_ROOT) fallbackRoots.push(siblingBassett);

function findTemplate() {
  for (const root of fallbackRoots) {
    const p = path.join(root, 'src/templates/page.colorflex-bassett.liquid');
    if (fs.existsSync(p)) return p;
  }
  return null;
}
const LIQUID_PATH = findTemplate();
if (!LIQUID_PATH) {
  console.error('Not found: src/templates/page.colorflex-bassett.liquid (tried current repo and sibling colorflex2 / colorflex2-bassett)');
  process.exit(1);
}
const OUT_DIR = path.join(REPO_ROOT, 'bassett-local');
const OUT_HTML = path.join(OUT_DIR, 'index.html');

let html = fs.readFileSync(LIQUID_PATH, 'utf8');

// Remove theme-check comments
html = html.replace(/\{%\s*#\s*theme-check-[^%]+%\}/g, '');

// {{ 'file' | asset_url | stylesheet_tag }} → <link rel="stylesheet" href="/assets/file">
html = html.replace(/\{\{\s*'([^']+)'\s*\|\s*asset_url\s*\|\s*stylesheet_tag\s*\}\}/g, '<link rel="stylesheet" href="/assets/$1">');

// {{ 'file' | asset_url }} (standalone, e.g. in script src) → /assets/file
html = html.replace(/\{\{\s*'([^']+)'\s*\|\s*asset_url\s*\}\}/g, '/assets/$1');

// <script src="{{ 'x' | asset_url }}" → <script src="/assets/x"
html = html.replace(/src="\{\{\s*'([^']+)'\s*\|\s*asset_url\s*\}\}"/g, 'src="/assets/$1"');

// {{ page.title }} → Bassett
html = html.replace(/\{\{\s*page\.title\s*\}\}/g, 'Bassett');

// Shopify customer block: use guest branch only
html = html.replace(
  /\{%\s*if\s+customer\s*%\}[\s\S]*?\{\%\s*else\s*%\}([\s\S]*?)\{\%\s*endif\s*%\}/g,
  '$1'
);

// Metafield colors: use else (load from assets)
html = html.replace(
  /\{%\s*if\s+shop\.metafields\.colorflex\.colors\.value\s*%\}[\s\S]*?\{\%\s*else\s*%\}([\s\S]*?)\{\%\s*endif\s*%\}/g,
  '$1'
);

// Metafield collections: use else
html = html.replace(
  /\{%\s*if\s+shop\.metafields\.colorflex\.collections\.value\s*%\}[\s\S]*?\{\%\s*else\s*%\}([\s\S]*?)\{\%\s*endif\s*%\}/g,
  '$1'
);

// ColorFlexApiBaseUrl: use empty string for same-origin when running locally
html = html.replace(
  /window\.ColorFlexApiBaseUrl\s*=\s*[^;]+;/,
  "window.ColorFlexApiBaseUrl = ''; // same origin for local server"
);

// Use test mockup layers (beauty.png, sofa_disp.png, pillow1/2/3_disp.png) when running locally; skip displacement worker for testing. Load collection images from this server.
html = html.replace(
  /(window\.COLORFLEX_MODE\s*=\s*['"]BASSETT['"];)/,
  "$1\n  window.BASSETT_USE_TEST_LAYERS = true;\n  window.BASSETT_LAYERS_BASE_URL = '/data/mockups/bassett';\n  window.BASSETT_SKIP_DISPLACEMENT = true;\n  window.COLORFLEX_DATA_BASE_URL = window.location.origin;"
);

// Any remaining {{ 'x' | asset_url }} (e.g. in JSON)
html = html.replace(/\{\{\s*'([^']+)'\s*\|\s*asset_url\s*\}\}/g, '/assets/$1');

// Strip any remaining Liquid that might break (single-line)
html = html.replace(/\{%[^%]*%}/g, '');

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_HTML, html, 'utf8');
console.log('Wrote', OUT_HTML);
