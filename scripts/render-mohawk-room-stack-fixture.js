#!/usr/bin/env node
/**
 * Visual fixture: full Mohawk room stack using your real layer PNGs + wallpaper + carpet thumbnail.
 * Mirrors the draw order of `runMohawkExplicitNineStepRoom` in the Bassett CFM branch (floor detail,
 * wallpaper through wall + pinned-wall masks, pinned Mohawk carpet, semantic trim/panels/sofa/pillow,
 * sofa detail plate). Does not import CFM.
 *
 * Place assets under MOHAWK_ROOM_FIXTURE_DIR (default: tmp/mohawk-room-assets):
 *   floor-detail.png, wall-mask.png, pinned-wall.png, trim.png, panel-mask.png,
 *   sofa-detail.png, sofa-mask.png, pillow-mask.png,
 *   wallpaper.png (ColorFlex pattern tile / preview), mohawk-carpet.png (carpet SKU thumbnail)
 * Optional: floor-matte.png OR floor-tile.png — matte for pinned carpet (same role as mockup floorMatteMask)
 * Optional: fixture-config.json — see scripts/mohawk-room-fixture.config.example.json
 *
 * Requires optional `canvas` package: npm install canvas
 * Output: tmp/mohawk-room-stack-fixture.png
 *
 * Run: node scripts/render-mohawk-room-stack-fixture.js
 */

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const REQUIRED_FILES = {
  floorDetail: 'floor-detail.png',
  wallMask: 'wall-mask.png',
  pinnedWallMask: 'pinned-wall.png',
  trim: 'trim.png',
  panelMask: 'panel-mask.png',
  sofaDetail: 'sofa-detail.png',
  sofaMask: 'sofa-mask.png',
  pillowMask: 'pillow-mask.png',
  wallpaper: 'wallpaper.png',
  mohawkCarpet: 'mohawk-carpet.png',
};

const MATTE_CANDIDATES = ['floor-matte.png', 'floor-tile.png'];

const DEFAULT_CONFIG = {
  outW: 2000,
  outH: 2000,
  wallpaperTileInches: [24, 24],
  floorDetailOpacity: 1,
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

async function drawWallpaperThroughMask(ctx, outW, outH, maskImg, patternImg, tileInches) {
  const ww = maskImg.naturalWidth || maskImg.width;
  const wh = maskImg.naturalHeight || maskImg.height;
  const wallTile = require('canvas').createCanvas(ww, wh);
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

function resolveMatteFile(assetDir, cfg) {
  if (cfg.floorPinned && cfg.floorPinned.matteFile) {
    const p = path.join(assetDir, cfg.floorPinned.matteFile);
    if (fs.existsSync(p)) return p;
  }
  for (const name of MATTE_CANDIDATES) {
    const p = path.join(assetDir, name);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function main() {
  const assetDir = process.env.MOHAWK_ROOM_FIXTURE_DIR
    ? path.resolve(process.env.MOHAWK_ROOM_FIXTURE_DIR)
    : path.join(__dirname, '..', 'tmp', 'mohawk-room-assets');

  const missing = [];
  for (const [, fname] of Object.entries(REQUIRED_FILES)) {
    if (!fs.existsSync(path.join(assetDir, fname))) missing.push(path.join(assetDir, fname));
  }
  if (missing.length) {
    console.error('[mohawk-room-fixture] Missing required files:\n  ' + missing.join('\n  '));
    console.error('\nCopy your room PNGs + wallpaper.png + mohawk-carpet.png into:\n  ' + assetDir);
    console.error('Optional matte for carpet pin: floor-matte.png or floor-tile.png');
    process.exit(1);
  }

  let cfg = Object.assign({}, DEFAULT_CONFIG);
  const configPath = path.join(assetDir, 'fixture-config.json');
  if (fs.existsSync(configPath)) {
    try {
      cfg = deepMerge(cfg, JSON.parse(fs.readFileSync(configPath, 'utf8')));
    } catch (e) {
      console.error('[mohawk-room-fixture] Invalid fixture-config.json:', e.message);
      process.exit(1);
    }
  }

  const mattePath = resolveMatteFile(assetDir, cfg);
  if (!mattePath) {
    console.error(
      '[mohawk-room-fixture] No floor carpet matte image. Add one of:\n' +
        '  ' +
        MATTE_CANDIDATES.join(', ') +
        '\n  or set floorPinned.matteFile in fixture-config.json'
    );
    process.exit(1);
  }

  const { createCanvas, loadImage } = installCanvasGlobals();
  const outW = cfg.outW | 0 || 2000;
  const outH = cfg.outH | 0 || 2000;

  const paths = {};
  for (const [key, fname] of Object.entries(REQUIRED_FILES)) {
    paths[key] = path.join(assetDir, fname);
  }

  const imgs = {};
  for (const key of Object.keys(REQUIRED_FILES)) {
    imgs[key] = await loadImage(paths[key]);
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
  await drawWallpaperThroughMask(ctx, outW, outH, imgs.wallMask, imgs.wallpaper, tileInches);
  await drawWallpaperThroughMask(ctx, outW, outH, imgs.pinnedWallMask, imgs.wallpaper, tileInches);

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
      tileImage: imgs.mohawkCarpet,
      tileRepeat: typeof cfg.floorPinned.tileRepeat === 'number' ? cfg.floorPinned.tileRepeat : 5,
    },
    null,
    null
  );

  const sem = cfg.semantic || {};
  function drawSem(maskKey, role) {
    const m = imgs[maskKey];
    const spec = sem[role] || { hex: '#888888', blend: 'multiply' };
    const mkCanvas = createCanvas(outW, outH);
    const mkCtx = mkCanvas.getContext('2d');
    applySemanticMaskColorize(mkCtx, outW, outH, m, spec.hex, spec.blend);
    ctx.drawImage(mkCanvas, 0, 0);
  }

  drawSem('trim', 'trim');
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
  console.log('  assets:', assetDir);
  console.log('  floor matte:', path.relative(process.cwd(), mattePath));
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
