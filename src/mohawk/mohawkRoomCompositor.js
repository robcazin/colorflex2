/**
 * Mohawk Room — minimal stack compositor (wallpaper + pinned surfaces + semantic masks).
 * Source of truth: docs/mohawk-room/COMPOSITOR_STACK.md
 * Uses ./mohawkPinnedSurface.js for homography-pinned floor carpet and pinned-wall wallpaper.
 * No Bassett displacement, no base.png, no mohawk-mask.png.
 */

import { applyPinnedSurfaceComposite } from './mohawkPinnedSurface.js';

const DEFAULT_FILES = {
  floorDetail: 'floor-detail.png',
  wallMask: 'wall-mask.png',
  pinnedWallMask: 'pinned-wall.png',
  trim: 'trim.png',
  panelMask: 'panel-mask.png',
  sofaDetail: 'sofa-detail.png',
  sofaMask: 'sofa-mask.png',
  pillowMask: 'pillow-mask.png',
};

const DEFAULT_PINNED = {
  floorPinned: {
    cornersNormalized: [
      [0.0, 0.71],
      [1.0, 0.71],
      [1.4, 1.0],
      [-0.45, 1.0],
    ],
    tileRepeat: 5,
    matteFile: 'floor-tile.png',
  },
  pinnedWall: {
    enabled: true,
    cornersNormalized: [
      [-0.1, -0.2],
      [0.12, 0.05],
      [0.12, 0.7],
      [-0.1, 0.77],
    ],
    tileRepeat: 8,
  },
};

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
    const c = document.createElement('canvas');
    const x = c.getContext('2d');
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
  let blend = (blendMode || 'multiply').toLowerCase();
  if (blend !== 'multiply' && blend !== 'color') blend = 'multiply';
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

function drawWallpaperThroughMask(createCanvas, ctx, outW, outH, maskImg, patternImg, tileInches) {
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

function deepMerge(base, over) {
  if (!over || typeof over !== 'object') return base;
  const out = Object.assign({}, base);
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

/**
 * @param {object} opts
 * @param {HTMLCanvasElement} opts.compCanvas - target (e.g. 2000×2000)
 * @param {(rel: string) => string} opts.resolveAssetUrl - maps basename → full URL for loading
 * @param {(url: string) => Promise<HTMLImageElement>} opts.loadImage
 * @param {HTMLImageElement|HTMLCanvasElement} opts.patternImage - ColorFlex wallpaper preview / pattern raster
 * @param {HTMLImageElement|HTMLCanvasElement} opts.carpetImage - Mohawk carpet thumbnail (tile source)
 * @param {{ trim: string, panels: string, sofa: string, pillow: string }} opts.colors - CSS hex
 * @param {object} [opts.config] - merged window.COLORFLEX_MOHAWK_ROOM_CONFIG
 */
export async function renderMohawkRoomComposite(opts) {
  const compCanvas = opts.compCanvas;
  const resolveAssetUrl = opts.resolveAssetUrl;
  const loadImage = opts.loadImage;
  const patternImage = opts.patternImage;
  const carpetImage = opts.carpetImage;
  const colors = opts.colors || {};
  const user = opts.config || {};

  const files = Object.assign({}, DEFAULT_FILES, user.files || {});
  const cfg = deepMerge(
    {
      wallpaperTileInches: [24, 24],
      floorDetailOpacity: 1,
      semanticBlend: { trim: 'color', panels: 'multiply', sofa: 'multiply', pillow: 'multiply' },
    },
    user
  );
  const floorPinned = deepMerge(DEFAULT_PINNED.floorPinned, cfg.floorPinned || {});
  const pinnedWall = deepMerge(DEFAULT_PINNED.pinnedWall, cfg.pinnedWall || {});

  const outW = compCanvas.width;
  const outH = compCanvas.height;
  if (outW < 2 || outH < 2) return;

  const load = function (key) {
    return loadImage(resolveAssetUrl(files[key]));
  };

  const floorDetail = await load('floorDetail');
  const wallMask = await load('wallMask');
  const pinnedWallMask = await load('pinnedWallMask');
  const trimImg = await load('trim');
  const panelMask = await load('panelMask');
  const sofaDetail = await load('sofaDetail');
  const sofaMask = await load('sofaMask');
  const pillowMask = await load('pillowMask');

  const matteRel = floorPinned.matteFile || files.floorMatte || DEFAULT_PINNED.floorPinned.matteFile;
  const matteUrl = resolveAssetUrl(matteRel);
  const floorMatteImg = await loadImage(matteUrl);

  const ctx = compCanvas.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, outW, outH);

  const fdw = floorDetail.naturalWidth || floorDetail.width;
  const fdh = floorDetail.naturalHeight || floorDetail.height;
  const op = typeof cfg.floorDetailOpacity === 'number' ? cfg.floorDetailOpacity : 1;
  ctx.globalAlpha = Math.max(0, Math.min(1, op));
  ctx.drawImage(floorDetail, 0, 0, fdw, fdh, 0, 0, outW, outH);
  ctx.globalAlpha = 1;

  const tileInches = cfg.wallpaperTileInches || [24, 24];
  const createCanvas = function (w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  };

  drawWallpaperThroughMask(createCanvas, ctx, outW, outH, wallMask, patternImage, tileInches);

  if (pinnedWall.enabled !== false) {
    const cn = pinnedWall.cornersNormalized || DEFAULT_PINNED.pinnedWall.cornersNormalized;
    const corners = cn.map(function (pt) {
      return [pt[0] * outW, pt[1] * outH];
    });
    await applyPinnedSurfaceComposite(
      compCanvas,
      {
        corners,
        matteImage: pinnedWallMask,
        tileImage: patternImage,
        tileRepeat: typeof pinnedWall.tileRepeat === 'number' ? pinnedWall.tileRepeat : 8,
      },
      null,
      null
    );
  }

  const cnF = floorPinned.cornersNormalized || DEFAULT_PINNED.floorPinned.cornersNormalized;
  const cornersF = cnF.map(function (pt) {
    return [pt[0] * outW, pt[1] * outH];
  });
  await applyPinnedSurfaceComposite(
    compCanvas,
    {
      corners: cornersF,
      matteImage: floorMatteImg,
      tileImage: carpetImage,
      tileRepeat: typeof floorPinned.tileRepeat === 'number' ? floorPinned.tileRepeat : 5,
    },
    null,
    null
  );

  function drawSemantic(maskImg, role) {
    const hex = colors[role] || '#888888';
    const blend = (cfg.semanticBlend && cfg.semanticBlend[role]) || (role === 'trim' ? 'color' : 'multiply');
    const mkCanvas = createCanvas(outW, outH);
    const mkCtx = mkCanvas.getContext('2d');
    applySemanticMaskColorize(mkCtx, outW, outH, maskImg, hex, blend);
    ctx.drawImage(mkCanvas, 0, 0);
  }

  const tW = trimImg.naturalWidth || trimImg.width;
  const tH = trimImg.naturalHeight || trimImg.height;
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(trimImg, 0, 0, tW, tH, 0, 0, outW, outH);

  drawSemantic(panelMask, 'panels');

  const sdw = sofaDetail.naturalWidth || sofaDetail.width;
  const sdh = sofaDetail.naturalHeight || sofaDetail.height;
  ctx.drawImage(sofaDetail, 0, 0, sdw, sdh, 0, 0, outW, outH);

  drawSemantic(sofaMask, 'sofa');
  drawSemantic(pillowMask, 'pillow');
}
