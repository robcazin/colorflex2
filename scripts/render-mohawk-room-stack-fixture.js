#!/usr/bin/env node
/**
 * Visual fixture: full Mohawk room stack from your real layer PNGs + wallpaper + carpet thumbnail.
 * Mirrors the draw order of `runMohawkExplicitNineStepRoom` in the Bassett CFM branch (floor detail,
 * wallpaper through wall + pinned-wall masks, pinned Mohawk carpet, semantic trim/panels/sofa/pillow,
 * sofa detail plate). Does not import CFM.
 *
 * Source assets are read in place (no copy into the repo). Set:
 *
 *   MOHAWK_ROOM_FIXTURE_DIR=/absolute/path/to/your/mockups/mohawk
 *
 * to the same directory your ColorFlex Mohawk mockup already uses on disk (the folder behind
 * `design.mockup.layersBaseUrl`, e.g. `<COLORFLEX_DATA_PATH>/data/mockups/mohawk` when using local cf-data).
 *
 * If MOHAWK_ROOM_FIXTURE_DIR is unset, the script falls back to tmp/mohawk-room-assets (empty unless you use it).
 *
 * Filenames are never fixed: map production names in JSON (see scripts/mohawk-room-fixture.config.example.json).
 * Config is merged from, in order: defaults → `<MOHAWK_ROOM_FIXTURE_DIR>/fixture-config.json` → optional
 * `MOHAWK_ROOM_FIXTURE_CONFIG` (path to another JSON file, overrides).
 *
 * Use an `assets` object and/or the same keys at the root of the JSON (e.g. `"trimMask": "trim-mask.png"`).
 * Required logical keys: floorDetail, wallMask, pinnedWallMask, trim (detail plate), trimMask (optional tint mask; falls back to trim for legacy folders), panelMask, sofaDetail, sofaMask,
 * pillowMask, wallpaper, carpet (or mohawkCarpet), floorMatte (carpet pin matte — same role as mockup floor matte / floor-tile).
 *
 * Requires optional `canvas` package: npm install canvas
 * Output only: tmp/mohawk-room-stack-fixture.png
 *
 * Run: MOHAWK_ROOM_FIXTURE_DIR=/path/to/mockups/mohawk node scripts/render-mohawk-room-stack-fixture.js
 */

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

/** Logical roles → default basename (only used when config omits that key). */
const DEFAULT_ASSETS = {
  floorDetail: 'floor-detail.png',
  wallMask: 'wall-mask.png',
  pinnedWallMask: 'pinned-wall.png',
  trim: 'trim.png',
  trimMask: 'trim-mask.png',
  panelMask: 'panel-mask.png',
  sofaDetail: 'sofa-detail.png',
  sofaMask: 'sofa-mask.png',
  pillowMask: 'pillow-mask.png',
  wallpaper: 'wallpaper.png',
  carpet: 'mohawk-carpet.png',
  floorMatte: 'floor-tile.png',
};

const ASSET_ROLE_ORDER = [
  'floorDetail',
  'wallMask',
  'pinnedWallMask',
  'trim',
  'trimMask',
  'panelMask',
  'sofaDetail',
  'sofaMask',
  'pillowMask',
  'wallpaper',
  'carpet',
  'floorMatte',
];

const DEFAULT_CONFIG = {
  outW: 2000,
  outH: 2000,
  wallpaperTileInches: [24, 24],
  floorDetailOpacity: 1,
  assets: Object.assign({}, DEFAULT_ASSETS),
  floorPinned: {
    cornersNormalized: [
      [0.0, 0.71],
      [1.0, 0.71],
      [1.4, 1.0],
      [-0.45, 1.0],
    ],
    tileRepeat: 5,
    matteFile: null,
  },
  semantic: {
    trim: { hex: '#e8e2d4', blend: 'color' },
    panels: { hex: '#d8d0c4', blend: 'multiply' },
    sofa: { hex: '#747a4e', blend: 'multiply' },
    pillow: { hex: '#c4b8a8', blend: 'multiply' },
  },
};

/**
 * Build filename map: defaults < cfg.assets < recognized root-level string keys (trimMask → trim, etc.).
 */
function buildResolvedAssets(cfg) {
  const out = Object.assign({}, DEFAULT_ASSETS, (cfg.assets && typeof cfg.assets === 'object') ? cfg.assets : {});
  const fromRoot = [
    ['wallpaper', 'wallpaper'],
    ['pattern', 'wallpaper'],
    ['wallpaperPattern', 'wallpaper'],
    ['carpet', 'carpet'],
    ['mohawkCarpet', 'carpet'],
    ['floorTile', 'carpet'],
    ['floorDetail', 'floorDetail'],
    ['wallMask', 'wallMask'],
    ['pinnedWallMask', 'pinnedWallMask'],
    ['trim', 'trim'],
    ['trimMask', 'trimMask'],
    ['panelMask', 'panelMask'],
    ['sofaDetail', 'sofaDetail'],
    ['sofaMask', 'sofaMask'],
    ['pillowMask', 'pillowMask'],
    ['floorMatte', 'floorMatte'],
    ['floorMatteMask', 'floorMatte'],
  ];
  for (let i = 0; i < fromRoot.length; i++) {
    const k = fromRoot[i][0];
    const role = fromRoot[i][1];
    const v = cfg[k];
    if (typeof v === 'string' && v.trim()) out[role] = v.trim();
  }
  return out;
}

function loadJsonConfigFile(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error('[mohawk-room-fixture] Invalid JSON in ' + label + ':', filePath, e.message);
    process.exit(1);
  }
}

function resolveMattePath(assetDir, cfg, assets) {
  const tryPath = function (rel) {
    if (!rel || typeof rel !== 'string' || !rel.trim()) return null;
    const p = path.join(assetDir, rel.trim());
    return fs.existsSync(p) ? p : null;
  };
  let p = tryPath(assets.floorMatte);
  if (p) return p;
  if (cfg.floorPinned && typeof cfg.floorPinned.matteFile === 'string' && cfg.floorPinned.matteFile.trim()) {
    p = tryPath(cfg.floorPinned.matteFile);
    if (p) return p;
  }
  if (typeof cfg.floorMatte === 'string' && cfg.floorMatte.trim()) {
    p = tryPath(cfg.floorMatte);
    if (p) return p;
  }
  return null;
}

function installCanvasGlobals() {
  let createCanvas;
  let Image;
  let Canvas;
  try {
    const canvasLib = require('canvas');
    createCanvas = canvasLib.createCanvas;
    Image = canvasLib.Image;
    Canvas = canvasLib.Canvas || createCanvas(1, 1).constructor;
  } catch (e) {
    if (e && e.code === 'MODULE_NOT_FOUND') {
      console.error(
        '[mohawk-room-fixture] The `canvas` package is not installed.\n' +
          '  npm install canvas\n' +
          '  (Same optional dependency as src/tools/extract-kmeans.js.)'
      );
      process.exit(1);
    }
    throw e;
  }
  global.HTMLCanvasElement = Canvas;
  global.HTMLImageElement = Image;
  global.Image = Image;
  global.document = {
    createElement(tagName) {
      if (String(tagName).toLowerCase() !== 'canvas') {
        throw new Error('[mohawk-room-fixture] createElement only supports canvas');
      }
      return createCanvas(2, 2);
    },
  };
  return { createCanvas, loadImage: require('canvas').loadImage };
}

function deepMerge(base, over) {
  if (!over || typeof over !== 'object') return base;
  const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
  for (const k of Object.keys(over)) {
    const v = over[k];
    if (v && typeof v === 'object' && !Array.isArray(v) && typeof out[k] === 'object' && out[k] && !Array.isArray(out[k])) {
      out[k] = deepMerge(out[k], v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function normalizeHexCss(h) {
  if (h == null || h === '') return '#888888';
  const s = String(h).trim();
  if (s.indexOf('#') === 0) {
    const six = s.slice(1).replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
    if (six.length === 6) return '#' + six;
  }
  const m = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (m) {
    const r = ('0' + Number(m[1]).toString(16)).slice(-2);
    const g = ('0' + Number(m[2]).toString(16)).slice(-2);
    const b = ('0' + Number(m[3]).toString(16)).slice(-2);
    return '#' + r + g + b;
  }
  return '#888888';
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (Math.abs(max - min) > 1e-6) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h, s, l };
}

function hue2rgb(p, q, t) {
  let tt = t;
  if (tt < 0) tt += 1;
  if (tt > 1) tt -= 1;
  if (tt < 1 / 6) return p + (q - p) * 6 * tt;
  if (tt < 1 / 2) return q;
  if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
  return p;
}

function hslToRgb(h, s, l) {
  let r;
  let g;
  let b;
  if (s < 1e-6) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function colorizeMaskSoftware(mkCtx, w, h, maskImg, hexCss) {
  mkCtx.clearRect(0, 0, w, h);
  mkCtx.drawImage(maskImg, 0, 0, w, h);
  const img = mkCtx.getImageData(0, 0, w, h);
  const d = img.data;
  const hx = normalizeHexCss(hexCss).replace(/^#/, '');
  if (hx.length !== 6) return;
  const tr = parseInt(hx.slice(0, 2), 16);
  const tg = parseInt(hx.slice(2, 4), 16);
  const tb = parseInt(hx.slice(4, 6), 16);
  const thsl = rgbToHsl(tr, tg, tb);
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3] / 255;
    if (a < 1 / 255) continue;
    const L = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
    const rgb = hslToRgb(thsl.h, thsl.s, L);
    d[i] = rgb[0];
    d[i + 1] = rgb[1];
    d[i + 2] = rgb[2];
  }
  mkCtx.putImageData(img, 0, 0);
}

function canvasBlendModeColorWorks() {
  try {
    const { createCanvas } = require('canvas');
    const x = createCanvas(2, 2).getContext('2d');
    const prev = x.globalCompositeOperation;
    x.globalCompositeOperation = 'color';
    const ok = x.globalCompositeOperation === 'color';
    x.globalCompositeOperation = prev;
    return ok;
  } catch (_) {
    return false;
  }
}

function applySemanticMaskColorize(mkCtx, outW, outH, mkImg, hexCss, blendMode) {
  let blend = (blendMode || 'color').toLowerCase();
  if (blend !== 'multiply' && blend !== 'color') blend = 'color';
  const fillHex = normalizeHexCss(hexCss);
  mkCtx.clearRect(0, 0, outW, outH);
  mkCtx.drawImage(mkImg, 0, 0, outW, outH);
  if (blend === 'multiply') {
    mkCtx.globalCompositeOperation = 'multiply';
    mkCtx.fillStyle = fillHex;
    mkCtx.fillRect(0, 0, outW, outH);
    mkCtx.globalCompositeOperation = 'destination-in';
    mkCtx.drawImage(mkImg, 0, 0, outW, outH);
    mkCtx.globalCompositeOperation = 'source-over';
    return;
  }
  if (canvasBlendModeColorWorks()) {
    try {
      mkCtx.globalCompositeOperation = 'color';
      mkCtx.fillStyle = fillHex;
      mkCtx.fillRect(0, 0, outW, outH);
      mkCtx.globalCompositeOperation = 'destination-in';
      mkCtx.drawImage(mkImg, 0, 0, outW, outH);
      mkCtx.globalCompositeOperation = 'source-over';
      return;
    } catch (_) {
      /* fall through */
    }
  }
  colorizeMaskSoftware(mkCtx, outW, outH, mkImg, fillHex);
}

async function drawWallpaperThroughMask(createCanvas, ctx, outW, outH, maskImg, patternImg, tileInches) {
  const ww = maskImg.naturalWidth || maskImg.width;
  const wh = maskImg.naturalHeight || maskImg.height;
  const wallTile = createCanvas(ww, wh);
  const wctx = wallTile.getContext('2d');
  wctx.imageSmoothingEnabled = true;
  wctx.imageSmoothingQuality = 'high';
  const sizeWall = Array.isArray(tileInches) && tileInches.length >= 2 ? tileInches : [24, 24];
  const aspectWall = sizeWall[0] / sizeWall[1];
  const repsWall = Math.max(4, Math.ceil(outW / ww) + 2);
  const pw = patternImg.naturalWidth || patternImg.width;
  const ph = patternImg.naturalHeight || patternImg.height;
  if (pw < 1 || ph < 1) return;
  let twWall;
  let thWall;
  if (ww >= wh) {
    thWall = wh / 4;
    twWall = thWall * aspectWall;
  } else {
    twWall = ww / 4;
    thWall = twWall / aspectWall;
  }
  for (let tx = -twWall; tx < ww + twWall * repsWall; tx += twWall) {
    for (let ty = -thWall; ty < wh + thWall * repsWall; ty += thWall) {
      wctx.drawImage(patternImg, tx, ty, twWall, thWall);
    }
  }
  wctx.globalCompositeOperation = 'destination-in';
  wctx.drawImage(maskImg, 0, 0);
  ctx.drawImage(wallTile, 0, 0, outW, outH);
}

async function main() {
  const envDir = process.env.MOHAWK_ROOM_FIXTURE_DIR;
  const assetDirFromEnv = !!(envDir && String(envDir).trim());
  const assetDir = assetDirFromEnv
    ? path.resolve(String(envDir).trim())
    : path.join(__dirname, '..', 'tmp', 'mohawk-room-assets');

  if (!assetDirFromEnv) {
    console.warn(
      '[mohawk-room-fixture] MOHAWK_ROOM_FIXTURE_DIR is unset; using fallback directory:\n  ' +
        assetDir +
        '\n  Set MOHAWK_ROOM_FIXTURE_DIR to your existing Mohawk mockup path (same folder as layersBaseUrl on disk).'
    );
  }

  let cfg = Object.assign({}, DEFAULT_CONFIG);
  const configPath = path.join(assetDir, 'fixture-config.json');
  if (fs.existsSync(configPath)) {
    cfg = deepMerge(cfg, loadJsonConfigFile(configPath, 'fixture-config.json'));
  }
  const envConfigPath = process.env.MOHAWK_ROOM_FIXTURE_CONFIG;
  if (envConfigPath && String(envConfigPath).trim()) {
    const abs = path.resolve(String(envConfigPath).trim());
    if (!fs.existsSync(abs)) {
      console.error('[mohawk-room-fixture] MOHAWK_ROOM_FIXTURE_CONFIG file not found:', abs);
      process.exit(1);
    }
    cfg = deepMerge(cfg, loadJsonConfigFile(abs, 'MOHAWK_ROOM_FIXTURE_CONFIG'));
  }

  const assets = buildResolvedAssets(cfg);
  const missing = [];
  for (let i = 0; i < ASSET_ROLE_ORDER.length; i++) {
    const role = ASSET_ROLE_ORDER[i];
    const fname = assets[role];
    if (!fname || typeof fname !== 'string' || !fname.trim()) {
      missing.push(role + ' (not set in fixture config)');
      continue;
    }
    const full = path.join(assetDir, fname.trim());
    if (!fs.existsSync(full)) {
      if (role === 'trimMask') {
        console.warn('[mohawk-room-fixture] Optional asset missing:', full, '— trim tint will use trim.png');
        continue;
      }
      missing.push(full);
    }
  }
  if (missing.length) {
    console.error('[mohawk-room-fixture] Missing or unresolved assets:\n  ' + missing.join('\n  '));
    console.error(
      '\nSet filenames in fixture-config.json (or MOHAWK_ROOM_FIXTURE_CONFIG), e.g. assets.wallpaper, assets.carpet, assets.trimMask, …'
    );
    console.error(
      'Point MOHAWK_ROOM_FIXTURE_DIR at your Mohawk mockup directory. Example:\n' +
        '  MOHAWK_ROOM_FIXTURE_DIR=/path/to/cf-data/data/mockups/mohawk npm run render:mohawk-room-fixture'
    );
    if (!assetDirFromEnv) {
      console.error('\nFallback was tmp/mohawk-room-assets because MOHAWK_ROOM_FIXTURE_DIR was unset.');
    }
    process.exit(1);
  }

  const mattePath = resolveMattePath(assetDir, cfg, assets);
  if (!mattePath) {
    console.error(
      '[mohawk-room-fixture] No floor carpet matte file resolved. Set assets.floorMatte (or floorMatte / floorPinned.matteFile) to your production matte filename under MOHAWK_ROOM_FIXTURE_DIR.'
    );
    process.exit(1);
  }

  const { createCanvas, loadImage } = installCanvasGlobals();
  const outW =
    Number.isFinite(Number(cfg.outW)) && Number(cfg.outW) > 0 ? Math.floor(Number(cfg.outW)) : 2000;
  const outH =
    Number.isFinite(Number(cfg.outH)) && Number(cfg.outH) > 0 ? Math.floor(Number(cfg.outH)) : 2000;

  const paths = {};
  for (let i = 0; i < ASSET_ROLE_ORDER.length; i++) {
    const role = ASSET_ROLE_ORDER[i];
    if (role === 'floorMatte') continue;
    const rel = assets[role];
    if (!rel || typeof rel !== 'string' || !rel.trim()) continue;
    const full = path.join(assetDir, rel.trim());
    if (role === 'trimMask' && !fs.existsSync(full)) continue;
    paths[role] = full;
  }

  const imgs = {};
  const imageRoles = ASSET_ROLE_ORDER.filter(function (r) {
    return r !== 'floorMatte' && paths[r];
  });
  for (let i = 0; i < imageRoles.length; i++) {
    const role = imageRoles[i];
    imgs[role] = await loadImage(paths[role]);
  }
  const matteImg = await loadImage(mattePath);

  const comp = createCanvas(outW, outH);
  const ctx = comp.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const fd = imgs.floorDetail;
  const fdw = fd.naturalWidth || fd.width;
  const fdh = fd.naturalHeight || fd.height;
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, outW, outH);
  const op = typeof cfg.floorDetailOpacity === 'number' ? cfg.floorDetailOpacity : 1;
  ctx.globalAlpha = Math.max(0, Math.min(1, op));
  ctx.drawImage(fd, 0, 0, fdw, fdh, 0, 0, outW, outH);
  ctx.globalAlpha = 1;

  const tileInches = cfg.wallpaperTileInches || [24, 24];
  await drawWallpaperThroughMask(createCanvas, ctx, outW, outH, imgs.wallMask, imgs.wallpaper, tileInches);
  await drawWallpaperThroughMask(createCanvas, ctx, outW, outH, imgs.pinnedWallMask, imgs.wallpaper, tileInches);

  const moduleUrl = pathToFileURL(path.join(__dirname, '..', 'src', 'mohawk', 'mohawkPinnedSurface.js')).href;
  const { applyPinnedSurfaceComposite } = await import(moduleUrl);

  const cn = cfg.floorPinned.cornersNormalized;
  const corners = cn.map(function (pt) {
    return [pt[0] * outW, pt[1] * outH];
  });
  await applyPinnedSurfaceComposite(
    comp,
    {
      corners,
      matteImage: matteImg,
      tileImage: imgs.carpet,
      tileRepeat: typeof cfg.floorPinned.tileRepeat === 'number' ? cfg.floorPinned.tileRepeat : 5,
    },
    null,
    null
  );

  const sem = cfg.semantic || {};
  function drawSemImg(maskImg, role) {
    const spec = sem[role] || { hex: '#888888', blend: 'multiply' };
    const mkCanvas = createCanvas(outW, outH);
    const mkCtx = mkCanvas.getContext('2d');
    applySemanticMaskColorize(mkCtx, outW, outH, maskImg, spec.hex, spec.blend);
    ctx.drawImage(mkCanvas, 0, 0);
  }
  function drawSem(maskKey, role) {
    const m = imgs[maskKey];
    drawSemImg(m, role);
  }

  const td = imgs.trim;
  const tdw = td.naturalWidth || td.width;
  const tdh = td.naturalHeight || td.height;
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(td, 0, 0, tdw, tdh, 0, 0, outW, outH);

  const trimMaskSrc = imgs.trimMask || imgs.trim;
  drawSemImg(trimMaskSrc, 'trim');
  drawSem('panelMask', 'panels');

  const sd = imgs.sofaDetail;
  const sdw = sd.naturalWidth || sd.width;
  const sdh = sd.naturalHeight || sd.height;
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(sd, 0, 0, sdw, sdh, 0, 0, outW, outH);

  drawSem('sofaMask', 'sofa');
  drawSem('pillowMask', 'pillow');

  const outDir = path.join(__dirname, '..', 'tmp');
  const outFile = path.join(outDir, 'mohawk-room-stack-fixture.png');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, comp.toBuffer('image/png'));
  console.log('Wrote', path.relative(process.cwd(), outFile));
  console.log('  source assets (read in place):', assetDir);
  console.log('  floor matte:', path.relative(process.cwd(), mattePath));
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
