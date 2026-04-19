#!/usr/bin/env node
/**
 * Trade-show offline demo: full wallpaper collections from src/assets/collections.json.
 * - Same wallpaper vs furniture/clothing filter as CFM WALLPAPER MODE (initializeApp).
 * - Rasters resolve at runtime via COLORFLEX_DATA_BASE_URL → canonical cf-data (see trade-show-local/index.html).
 *
 * Run: node scripts/build-trade-show-snapshot.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SNAP = path.join(ROOT, 'demo-snapshot');
const SRC_COLLECTIONS = path.join(ROOT, 'src', 'assets', 'collections.json');
const SRC_MOCKUPS = path.join(ROOT, 'src', 'assets', 'mockups.json');
const TOOLS_COLORS = path.join(ROOT, 'src', 'tools', 'colors.json');

/** Mirrors CFM wallpaper filter (src/CFM.js ~11317–11328). */
function isWallpaperCollection(c) {
  const name = (c && c.name) || '';
  const isFurniture = name.includes('-fur') || name.includes('.fur') || name.endsWith('.fur');
  const isClothing = name.includes('-clo') || name.includes('.clo') || name.endsWith('.clo');
  return !isFurniture && !isClothing;
}

function countPatterns(collections) {
  let n = 0;
  for (const c of collections) {
    const pats = c && Array.isArray(c.patterns) ? c.patterns : [];
    n += pats.length;
  }
  return n;
}

function main() {
  if (!fs.existsSync(SRC_COLLECTIONS)) {
    console.error('Missing', SRC_COLLECTIONS);
    process.exit(1);
  }
  if (!fs.existsSync(SRC_MOCKUPS)) {
    console.error('Missing', SRC_MOCKUPS);
    process.exit(1);
  }
  if (!fs.existsSync(TOOLS_COLORS)) {
    console.error('Missing', TOOLS_COLORS);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(SRC_COLLECTIONS, 'utf8'));
  const all = Array.isArray(raw.collections) ? raw.collections : [];
  const wallpaper = all.filter(isWallpaperCollection);
  const out = { collections: wallpaper };

  if (fs.existsSync(SNAP)) {
    fs.rmSync(SNAP, { recursive: true, force: true });
  }
  fs.mkdirSync(path.join(SNAP, 'data'), { recursive: true });

  fs.writeFileSync(path.join(SNAP, 'data', 'collections.json'), JSON.stringify(out, null, 2), 'utf8');
  fs.copyFileSync(SRC_MOCKUPS, path.join(SNAP, 'data', 'mockups.json'));
  fs.copyFileSync(TOOLS_COLORS, path.join(SNAP, 'data', 'colors.json'));

  const np = countPatterns(wallpaper);
  console.log(
    'Wrote demo-snapshot/ from src/assets/collections.json (wallpaper-only filter).',
    'Collections:',
    wallpaper.length,
    'Patterns:',
    np
  );
}

main();
