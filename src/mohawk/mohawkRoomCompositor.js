/**
 * Mohawk Room — minimal stack compositor (wallpaper + pinned surfaces + semantic masks).
 * Source of truth: docs/mohawk-room/COMPOSITOR_STACK.md
 * Uses ./mohawkPinnedSurface.js for homography-pinned floor carpet and pinned-wall wallpaper.
 * No Bassett displacement, no base.png, no mohawk-mask.png.
 */

import { applyPinnedSurfaceComposite } from './mohawkPinnedSurface.js';

const MOHAWK_ROOM_FILES = {
  floorDetail: 'floor-detail.png',
  wallMask: 'wall-mask.png',
  pinnedWallMask: 'pinned-wall.png',
  trim: 'trim.png',
  /** Localizes trim tint (see docs/mohawk-room/COMPOSITOR_STACK.md — trim detail vs trim-mask). */
  trimMask: 'trim-mask.png',
  panelMask: 'panel-mask.png',
  sofaDetail: 'sofa-detail.png',
  sofaMask: 'sofa-mask.png',
  /** Detail plate drawn under the pillow tint (parallel to sofa-detail / sofa-mask). */
  pillowDetail: 'pillow-details.png',
  pillowMask: 'pillow-mask.png',
  /**
   * Final overlay drawn LAST with `multiply` so the pinned wallpaper (and the
   * rest of the scene) picks up panel shadows. Optional: missing file degrades
   * gracefully via loadOptional.
   */
  wallPanelShadow: 'wall-panel-shadow.png',
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
      [0.1376, 0.0613],
      [0.2182, 0.1488],
      [0.2182, 0.7351],
      [0.1376, 0.7929],
    ],
    tileRepeat: 8,
  },
};

function sampleDrawableAverage(drawable) {
  if (!drawable || typeof document === 'undefined') return null;
  const width = drawable.naturalWidth || drawable.videoWidth || drawable.width || 0;
  const height = drawable.naturalHeight || drawable.videoHeight || drawable.height || 0;
  if (width < 1 || height < 1) return { width, height, avgRgba: null };
  try {
    const c = document.createElement('canvas');
    c.width = 1;
    c.height = 1;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(drawable, 0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return { width, height, avgRgba: [d[0], d[1], d[2], d[3]] };
  } catch (_err) {
    return { width, height, avgRgba: null };
  }
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

function hexCssToRgb(hexCss) {
  const h = normalizeHexCss(hexCss);
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
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

/**
 * Build a flat chroma layer clipped to the mask. Drawn over the stack with `globalCompositeOperation = 'color'`
 * so destination luminance (detail plates, wallpaper) is preserved.
 */
function applySemanticMaskColorize(mkCtx, outW, outH, mkImg, hexCss) {
  const fillHex = normalizeHexCss(hexCss);
  mkCtx.clearRect(0, 0, outW, outH);
  mkCtx.globalCompositeOperation = 'source-over';
  mkCtx.fillStyle = fillHex;
  mkCtx.fillRect(0, 0, outW, outH);
  mkCtx.globalCompositeOperation = 'destination-in';
  mkCtx.drawImage(mkImg, 0, 0, outW, outH);
  mkCtx.globalCompositeOperation = 'source-over';
}

function drawWallpaperThroughMask(createCanvas, ctx, outW, outH, maskImg, patternImg, tileInches, maskLabel, solidBlend, solidHex) {
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
  const blendAmt = typeof solidBlend === 'number' ? Math.max(0, Math.min(1, solidBlend)) : 0;
  if (blendAmt > 0.001 && solidHex) {
    try {
      const rgb = hexCssToRgb(solidHex);
      const sr = rgb[0];
      const sg = rgb[1];
      const sb = rgb[2];
      const inv = 1 - blendAmt;
      const id = wctx.getImageData(0, 0, ww, wh);
      const d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] === 0) continue;
        d[i] = Math.round(d[i] * inv + sr * blendAmt);
        d[i + 1] = Math.round(d[i + 1] * inv + sg * blendAmt);
        d[i + 2] = Math.round(d[i + 2] * inv + sb * blendAmt);
      }
      wctx.putImageData(id, 0, 0);
    } catch (_solidBlendErr) {
      /* ignore readback failures (e.g. tainted canvas) */
    }
  }
  if (maskLabel) {
    try {
      const img = wctx.getImageData(0, 0, ww, wh).data;
      let visiblePixelCount = 0;
      for (let i = 3; i < img.length; i += 4) {
        if (img[i] > 0) visiblePixelCount++;
      }
      // #region agent log
      (typeof window !== 'undefined' && window.COLORFLEX_DEBUG_INGEST === true) && fetch('http://127.0.0.1:7744/ingest/9beec9bf-ddf5-40e6-9cf3-482a5094c6aa',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0b8664'},body:JSON.stringify({sessionId:'0b8664',runId:'post-fix-1',hypothesisId:'H11',location:'mohawkRoomCompositor.js:drawWallpaperThroughMask',message:'wallpaper mask draw summary',data:{maskLabel:maskLabel,maskSize:{width:ww,height:wh},patternSize:{width:pw,height:ph},tileSize:{width:twWall,height:thWall},visiblePixelCount:visiblePixelCount},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
    } catch (_maskLogErr) {
      /* ignore debug readback failures */
    }
  }
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
 * @param {{ trim: string, panels: string, sofa: string, pillow: string, wallpaperSolid?: string }} opts.colors - CSS hex; wallpaperSolid = layer index 0
 * @param {object} [opts.config] - merged window.COLORFLEX_MOHAWK_ROOM_CONFIG
 */
export async function renderMohawkRoomComposite(opts) {
  console.log('[MOHAWK ROOM COMPOSITOR ACTIVE]');

  const compCanvas = opts.compCanvas;
  const resolveAssetUrl = opts.resolveAssetUrl;
  const loadImage = opts.loadImage;
  const patternImage = opts.patternImage;
  const carpetImage = opts.carpetImage;
  const colors = opts.colors || {};
  const user = opts.config || {};

  const cfg = deepMerge(
    {
      wallpaperTileInches: [24, 24],
      floorDetailOpacity: 1,
      /** Per-role detail-plate opacity (sofa-detail.png, pillow-details.png, trim.png). Default 1 (full plate). */
      sofaDetailOpacity: 1,
      pillowDetailOpacity: 1,
      trimDetailOpacity: 1,
      /**
       * Per-role canvas composite mode applied when drawing the colorized mask
       * over the stack (see drawSemantic). `'multiply'` is the working default
       * for this scene (preserves shadow / detail-plate luminance while
       * tinting). Common alternates: `'color'` (chroma-only), `'overlay'`,
       * `'soft-light'`.
       */
      semanticBlend: { sofa: 'multiply', pillow: 'multiply', trim: 'multiply', panels: 'multiply' },
      /** Per-role tint opacity (globalAlpha on the colorized mask draw). Default 1. */
      semanticOpacity: { sofa: 0.9, pillow: 1, trim: 1, panels: 1 },
      /**
       * Strength of the final wall-panel-shadow.png multiply overlay (last draw).
       * Re-applied on every compositor invocation, so wallpaper changes always
       * pick up the fresh shadow on top.
       */
      wallPanelShadowOpacity: 0.8,
      /**
       * Fade wallpaper pattern toward `colors.wallpaperSolid` (layer index 0).
       * 0 = full pattern, 1 = flat solid color.
       */
      wallpaperSolidBlend: 0,
      /** Optional per-asset basename overrides, e.g. `{ trimMask: 'my-trim-mask.png' }`. */
      assets: {},
    },
    user
  );
  const floorPinned = deepMerge(DEFAULT_PINNED.floorPinned, cfg.floorPinned || {});
  const pinnedWall = deepMerge(DEFAULT_PINNED.pinnedWall, cfg.pinnedWall || {});

  const outW = compCanvas.width;
  const outH = compCanvas.height;
  if (outW < 2 || outH < 2) return;
  if (!patternImage) throw new Error('Missing active ColorFlex pattern preview');
  if (!carpetImage) throw new Error('Missing selected Mohawk carpet image');

  function getMohawkRoomBasename(key) {
    const def = MOHAWK_ROOM_FILES[key];
    const a = cfg.assets && typeof cfg.assets === 'object' ? cfg.assets : null;
    if (a && typeof a[key] === 'string' && a[key].trim()) return a[key].trim();
    return def;
  }

  const loadRequired = async function (key) {
    const fileName = getMohawkRoomBasename(key);
    try {
      return await loadImage(resolveAssetUrl(fileName));
    } catch (e) {
      throw new Error(fileName);
    }
  };

  const loadOptional = async function (key) {
    const fileName = getMohawkRoomBasename(key);
    try {
      return await loadImage(resolveAssetUrl(fileName));
    } catch (_e) {
      if (key === 'pillowDetail' && fileName === 'pillow-details.png') {
        try {
          return await loadImage(resolveAssetUrl('pillow-detail.png'));
        } catch (_e2) {
          return null;
        }
      }
      return null;
    }
  };

  const floorDetail = await loadRequired('floorDetail');
  const wallMask = await loadRequired('wallMask');
  const pinnedWallMask = await loadRequired('pinnedWallMask');
  const trimImg = await loadRequired('trim');
  const trimMaskImg = await loadOptional('trimMask');
  const panelMask = await loadRequired('panelMask');
  const sofaDetail = await loadRequired('sofaDetail');
  const sofaMask = await loadRequired('sofaMask');
  /** Optional: old asset folders may not have pillow-details.png yet. */
  const pillowDetail = await loadOptional('pillowDetail');
  const pillowMask = await loadRequired('pillowMask');
  const wallPanelShadow = await loadOptional('wallPanelShadow');
  const floorMatteImg = floorDetail;

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

  // #region agent log
  (typeof window !== 'undefined' && window.COLORFLEX_DEBUG_INGEST === true) && fetch('http://127.0.0.1:7744/ingest/9beec9bf-ddf5-40e6-9cf3-482a5094c6aa',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0b8664'},body:JSON.stringify({sessionId:'0b8664',runId:'wallpaper-debug-1',hypothesisId:'H7',location:'mohawkRoomCompositor.js:renderMohawkRoomComposite:init',message:'room compositor inputs',data:{canvas:{width:outW,height:outH},pattern:sampleDrawableAverage(patternImage),carpet:sampleDrawableAverage(carpetImage),colors:{trim:colors.trim||null,panels:colors.panels||null,sofa:colors.sofa||null,pillow:colors.pillow||null},pinnedWallEnabled:pinnedWall.enabled!==false,pinnedWallRepeat:typeof pinnedWall.tileRepeat==='number'?pinnedWall.tileRepeat:8,wallpaperTileInches:tileInches},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  const wallpaperSolidBlend =
    typeof cfg.wallpaperSolidBlend === 'number' ? Math.max(0, Math.min(1, cfg.wallpaperSolidBlend)) : 0;
  const wallpaperSolidHex = colors.wallpaperSolid || null;

  drawWallpaperThroughMask(
    createCanvas,
    ctx,
    outW,
    outH,
    wallMask,
    patternImage,
    tileInches,
    'wall-mask',
    wallpaperSolidBlend,
    wallpaperSolidHex
  );

  if (pinnedWall.enabled !== false) {
    // #region agent log
    (typeof window !== 'undefined' && window.COLORFLEX_DEBUG_INGEST === true) && fetch('http://127.0.0.1:7744/ingest/9beec9bf-ddf5-40e6-9cf3-482a5094c6aa',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0b8664'},body:JSON.stringify({sessionId:'0b8664',runId:'post-fix-1',hypothesisId:'H12',location:'mohawkRoomCompositor.js:renderMohawkRoomComposite:pinnedWall',message:'pinned wall uses wallpaper mask path',data:{mask:{width:pinnedWallMask.naturalWidth||pinnedWallMask.width||0,height:pinnedWallMask.naturalHeight||pinnedWallMask.height||0},wallpaperTileInches:tileInches},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    drawWallpaperThroughMask(
      createCanvas,
      ctx,
      outW,
      outH,
      pinnedWallMask,
      patternImage,
      tileInches,
      'pinned-wall-mask',
      wallpaperSolidBlend,
      wallpaperSolidHex
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
        debugLabel: 'floor-pinned',
    },
    null,
    null
  );

  function drawSemantic(maskImg, role) {
    const hex = colors[role] || '#888888';
    const mkCanvas = createCanvas(outW, outH);
    const mkCtx = mkCanvas.getContext('2d');
    applySemanticMaskColorize(mkCtx, outW, outH, maskImg, hex);

    /** Per-role composite mode (cfg.semanticBlend[role]); fall back to `'color'`. */
    const sb = (cfg.semanticBlend && typeof cfg.semanticBlend === 'object') ? cfg.semanticBlend : {};
    const requestedMode = (typeof sb[role] === 'string' && sb[role].trim()) ? sb[role].trim() : 'color';

    /** Per-role tint opacity; clamped to [0, 1]; default 1. */
    const so = (cfg.semanticOpacity && typeof cfg.semanticOpacity === 'object') ? cfg.semanticOpacity : {};
    const opRaw = typeof so[role] === 'number' ? so[role] : 1;
    const opacity = Math.max(0, Math.min(1, opRaw));

    ctx.save();
    ctx.globalAlpha = opacity;
    /** Try the requested mode; if the browser silently rejects it (read-back diverges), fall back. */
    ctx.globalCompositeOperation = requestedMode;
    if (ctx.globalCompositeOperation !== requestedMode) {
      ctx.globalCompositeOperation = canvasBlendModeColorWorks() ? 'color' : 'source-over';
    }
    ctx.drawImage(mkCanvas, 0, 0);
    ctx.restore();
  }

  const tW = trimImg.naturalWidth || trimImg.width;
  const tH = trimImg.naturalHeight || trimImg.height;
  ctx.globalCompositeOperation = 'source-over';
  const trimDetailOp = typeof cfg.trimDetailOpacity === 'number' ? Math.max(0, Math.min(1, cfg.trimDetailOpacity)) : 1;
  ctx.globalAlpha = trimDetailOp;
  ctx.drawImage(trimImg, 0, 0, tW, tH, 0, 0, outW, outH);
  ctx.globalAlpha = 1;

  /** Without trim-mask.png, tint through trim detail (same as fixture script: trimMask || trim). */
  const trimTintMask = trimMaskImg || trimImg;
  if (!trimMaskImg) {
    console.warn(
      '[mohawkRoomCompositor] trim-mask asset missing — tinting trim via trim.png. Expected',
      getMohawkRoomBasename('trimMask')
    );
  }
  drawSemantic(trimTintMask, 'trim');

  drawSemantic(panelMask, 'panels');

  const sdw = sofaDetail.naturalWidth || sofaDetail.width;
  const sdh = sofaDetail.naturalHeight || sofaDetail.height;
  const sofaDetailOp = typeof cfg.sofaDetailOpacity === 'number' ? Math.max(0, Math.min(1, cfg.sofaDetailOpacity)) : 1;
  ctx.globalAlpha = sofaDetailOp;
  ctx.drawImage(sofaDetail, 0, 0, sdw, sdh, 0, 0, outW, outH);
  ctx.globalAlpha = 1;

  drawSemantic(sofaMask, 'sofa');

  /** Pillow detail plate: source-over draw at configured opacity, before the pillow tint pass. */
  if (pillowDetail) {
    const pdw = pillowDetail.naturalWidth || pillowDetail.width;
    const pdh = pillowDetail.naturalHeight || pillowDetail.height;
    const pillowDetailOp = typeof cfg.pillowDetailOpacity === 'number' ? Math.max(0, Math.min(1, cfg.pillowDetailOpacity)) : 1;
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = pillowDetailOp;
    ctx.drawImage(pillowDetail, 0, 0, pdw, pdh, 0, 0, outW, outH);
    ctx.restore();
  }

  drawSemantic(pillowMask, 'pillow');

  /**
   * Final overlay: multiply wall-panel-shadow.png over everything so the
   * shadow re-applies to the freshly painted wallpaper. Opacity comes from
   * cfg.wallPanelShadowOpacity (0..1); 0 effectively disables.
   */
  if (wallPanelShadow) {
    const wpsOpRaw = typeof cfg.wallPanelShadowOpacity === 'number' ? cfg.wallPanelShadowOpacity : 1;
    const wpsOp = Math.max(0, Math.min(1, wpsOpRaw));
    if (wpsOp > 0) {
      const wpsW = wallPanelShadow.naturalWidth || wallPanelShadow.width;
      const wpsH = wallPanelShadow.naturalHeight || wallPanelShadow.height;
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = wpsOp;
      ctx.drawImage(wallPanelShadow, 0, 0, wpsW, wpsH, 0, 0, outW, outH);
      ctx.restore();
    }
  }

  // #region agent log
      (typeof window !== 'undefined' && window.COLORFLEX_DEBUG_INGEST === true) && fetch('http://127.0.0.1:7744/ingest/9beec9bf-ddf5-40e6-9cf3-482a5094c6aa',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0b8664'},body:JSON.stringify({sessionId:'0b8664',runId:'wallpaper-debug-1',hypothesisId:'H10',location:'mohawkRoomCompositor.js:renderMohawkRoomComposite:semantic',message:'semantic passes applied',data:{order:['wallpaper-mask','pinned-wall','floor-pinned','trim-detail','trim-mask','panels-mask','sofa-detail','sofa-mask','pillow-mask'],trimMaskLoaded:!!trimMaskImg,trimTintUsesTrimPngFallback:!trimMaskImg,colors:{trim:colors.trim||'#888888',panels:colors.panels||'#888888',sofa:colors.sofa||'#888888',pillow:colors.pillow||'#888888'}},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
  ctx.fillRect(24, 24, 500, 44);
  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 28px system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText('MOHAWK ROOM COMPOSITOR ACTIVE', 40, 46);
  ctx.restore();
}
