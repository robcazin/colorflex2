/**
 * Mohawk room — pinned-surface compositing (minimal).
 *
 * Maps a **repeatable tile** (carpet thumbnail, wallpaper swatch, etc.) onto a **screen quad**
 * using a **homography** (planar perspective): four **corner pins** in canvas space define the
 * destination. A **matte** (mask image or filled quad) restricts where pixels are replaced.
 *
 * Supports:
 * - **floor** — tiled Mohawk carpet on the floor quad
 * - **pinned-wall** — same pipeline for an upper / “pinned” wallpaper wall quad (caller supplies config)
 *
 * Derived from legacy `bassett-mohawk-floor.js` (colorflex2-bassett / `mohawk-floor-texture-poc`);
 * this module is **not** wired into CFM or bundles until explicitly imported.
 *
 * Tile special path:
 * - `__ACTIVE_COLORFLEX_PATTERN__`: use `extras.patternTileImage` (HTMLImageElement | HTMLCanvasElement)
 *   or `extras.patternTileUrl`.
 *
 * Matte: `mattePath` / `matteImage`, or `matteFromQuad: true` (filled quad from corners).
 */

const LOG = '[mohawkPinnedSurface]';

function drawPinnedSurfaceDebugOverlay(ctx, corners, config) {
  if (!config || !config.debugQuad) return;
  const cw = ctx.canvas.width;
  const ch = ctx.canvas.height;
  const scale = Math.max(cw, ch) / 2000;
  const stroke = config.debugQuadColor || 'rgba(0, 255, 128, 0.95)';
  ctx.save();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = Math.max(2, 3 * scale);
  ctx.beginPath();
  ctx.moveTo(corners[0][0], corners[0][1]);
  for (let i = 1; i < 4; i++) ctx.lineTo(corners[i][0], corners[i][1]);
  ctx.closePath();
  ctx.stroke();
  if (config.debugQuadLabels) {
    const labels = ['TL', 'TR', 'BR', 'BL'];
    const fs = Math.max(11, Math.round(16 * scale));
    ctx.font = 'bold ' + fs + 'px ui-sans-serif, system-ui, sans-serif';
    ctx.fillStyle = stroke;
    for (let i = 0; i < 4; i++) {
      ctx.fillText(labels[i], corners[i][0] + 6 * scale, corners[i][1] - 6 * scale);
    }
  }
  ctx.restore();
}

/** 3×3 row-major; multiply H * [x,y,1]^T → [wx, wy, w] */
function multiply33(H, x, y) {
  const a = H[0] * x + H[1] * y + H[2];
  const b = H[3] * x + H[4] * y + H[5];
  const c = H[6] * x + H[7] * y + H[8];
  return [a, b, c];
}

function invert33(H) {
  const a = H[0], b = H[1], c = H[2];
  const d = H[3], e = H[4], f = H[5];
  const g = H[6], h = H[7], i = H[8];
  const A = e * i - f * h;
  const B = -(d * i - f * g);
  const C = d * h - e * g;
  const D = -(b * i - c * h);
  const E = a * i - c * g;
  const F = -(a * h - b * g);
  const G = b * f - c * e;
  const Hh = -(a * f - c * d);
  const I = a * e - b * d;
  const det = a * A + b * B + c * C;
  if (Math.abs(det) < 1e-12) return null;
  const invDet = 1 / det;
  return [A * invDet, D * invDet, G * invDet, B * invDet, E * invDet, Hh * invDet, C * invDet, F * invDet, I * invDet];
}

/** Solve 8×8 system (Gaussian elimination); returns length-8 vector or null. */
function solve8x8(A, b) {
  const n = 8;
  const M = A.map(function (row, i) { return row.slice().concat([b[i]]); });
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    }
    if (Math.abs(M[pivot][col]) < 1e-12) return null;
    const tmp = M[col];
    M[col] = M[pivot];
    M[pivot] = tmp;
    const div = M[col][col];
    for (let c = col; c <= n; c++) M[col][c] /= div;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r][col];
      if (Math.abs(f) < 1e-15) continue;
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c];
    }
  }
  return M.map(function (row) { return row[n]; });
}

function homographyUnitSquareToQuad(dstQuad) {
  const src = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const rows = [];
  for (let i = 0; i < 4; i++) {
    const u = src[i][0];
    const v = src[i][1];
    const X = dstQuad[i][0];
    const Y = dstQuad[i][1];
    rows.push([u, v, 1, 0, 0, 0, -X * u, -X * v, X]);
    rows.push([0, 0, 0, u, v, 1, -Y * u, -Y * v, Y]);
  }
  const A = [];
  const b = [];
  for (let r = 0; r < 8; r++) {
    A.push(rows[r].slice(0, 8));
    b.push(rows[r][8]);
  }
  const h8 = solve8x8(A, b);
  if (!h8) return null;
  return h8.concat([1]);
}

function mapInverse(Hinv, px, py) {
  const r = multiply33(Hinv, px, py);
  const w = r[2];
  if (Math.abs(w) < 1e-10) return null;
  return [r[0] / w, r[1] / w];
}

function loadImage(src, kind) {
  const label = kind || 'asset';
  return new Promise(function (resolve, reject) {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = function () { resolve(im); };
    im.onerror = function () {
      const msg = LOG + ' IMAGE LOAD FAILED: ' + label + ' → ' + src;
      console.error(msg);
      reject(new Error(msg));
    };
    im.src = src;
  });
}

function resolveUrl(pathOrUrl, layersBaseUrl) {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl) || pathOrUrl.startsWith('data:') || pathOrUrl.startsWith('blob:')) return pathOrUrl;
  if (pathOrUrl.startsWith('/')) {
    const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin.replace(/\/$/, '') : '';
    return origin ? origin + pathOrUrl : pathOrUrl;
  }
  const base = (layersBaseUrl || '').replace(/\/$/, '');
  return base ? base + '/' + pathOrUrl : pathOrUrl;
}

function clamp01(x) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function sampleBilinear(imgData, w, h, x, y) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(x0 + 1, w - 1);
  const y1 = Math.min(y0 + 1, h - 1);
  const fx = x - x0;
  const fy = y - y0;
  const i00 = (y0 * w + x0) * 4;
  const i10 = (y0 * w + x1) * 4;
  const i01 = (y1 * w + x0) * 4;
  const i11 = (y1 * w + x1) * 4;
  const r =
    imgData[i00] * (1 - fx) * (1 - fy) +
    imgData[i10] * fx * (1 - fy) +
    imgData[i01] * (1 - fx) * fy +
    imgData[i11] * fx * fy;
  const g =
    imgData[i00 + 1] * (1 - fx) * (1 - fy) +
    imgData[i10 + 1] * fx * (1 - fy) +
    imgData[i01 + 1] * (1 - fx) * fy +
    imgData[i11 + 1] * fx * fy;
  const b =
    imgData[i00 + 2] * (1 - fx) * (1 - fy) +
    imgData[i10 + 2] * fx * (1 - fy) +
    imgData[i01 + 2] * (1 - fx) * fy +
    imgData[i11 + 2] * fx * fy;
  const a =
    imgData[i00 + 3] * (1 - fx) * (1 - fy) +
    imgData[i10 + 3] * fx * (1 - fy) +
    imgData[i01 + 3] * (1 - fx) * fy +
    imgData[i11 + 3] * fx * fy;
  return [r, g, b, a];
}

/**
 * Perspective-correct tiled pinned surface (floor Mohawk carpet, pinned-wall wallpaper swatch, …).
 * @param {HTMLCanvasElement} baseCanvas
 * @param {object} config
 * @param {string} [layersBaseUrl]
 * @param {object} [extras] - `patternTileImage` (Image|Canvas), `patternTileUrl` (string)
 */
export async function applyPinnedSurfaceComposite(baseCanvas, config, layersBaseUrl, extras) {
  if (!baseCanvas || !config || config.enabled === false) return;
  const cw = baseCanvas.width;
  const ch = baseCanvas.height;
  if (cw < 2 || ch < 2) return;

  let corners = config.corners;
  if (!corners && Array.isArray(config.cornersNormalized) && config.cornersNormalized.length === 4) {
    corners = config.cornersNormalized.map(function (pt) {
      return [pt[0] * cw, pt[1] * ch];
    });
  }
  if (!corners || corners.length !== 4) {
    console.warn(LOG + ' need corners (4×2) or cornersNormalized');
    return;
  }

  const matteSrc = config.matteImage || config.mattePath;
  let tileSrc = config.tileImage || config.tilePath;
  const useActivePattern =
    typeof tileSrc === 'string' && tileSrc === '__ACTIVE_COLORFLEX_PATTERN__';
  if (useActivePattern) {
    var _pti = extras && extras.patternTileImage;
    var _ptiOk = _pti && (_pti instanceof HTMLImageElement || _pti instanceof HTMLCanvasElement);
    if (_ptiOk) {
      tileSrc = _pti;
    } else if (extras && typeof extras.patternTileUrl === 'string' && extras.patternTileUrl) {
      tileSrc = extras.patternTileUrl;
    } else {
      console.warn(LOG + ' __ACTIVE_COLORFLEX_PATTERN__ needs extras.patternTileImage or patternTileUrl');
      return;
    }
  }

  const hasMatteAsset = !!matteSrc;
  const hasTileAsset = !!tileSrc;
  const useMatteFromQuad = config.matteFromQuad === true && !hasMatteAsset;
  const useProceduralTile = config.proceduralTile === true && !hasTileAsset;
  if (!useMatteFromQuad && !hasMatteAsset) {
    console.warn(LOG + ' need mattePath/matteImage or matteFromQuad');
    return;
  }
  if (!useProceduralTile && !hasTileAsset) {
    console.warn(LOG + ' need tilePath/tileImage, __ACTIVE_COLORFLEX_PATTERN__ + pattern image, or proceduralTile');
    return;
  }

  const tileRepeat = typeof config.tileRepeat === 'number' && config.tileRepeat > 0 ? config.tileRepeat : 6;

  const matteCanvas = document.createElement('canvas');
  matteCanvas.width = cw;
  matteCanvas.height = ch;
  const mctx = matteCanvas.getContext('2d');
  let matteData;
  if (useMatteFromQuad) {
    mctx.clearRect(0, 0, cw, ch);
    mctx.fillStyle = 'rgba(255,255,255,1)';
    mctx.beginPath();
    mctx.moveTo(corners[0][0], corners[0][1]);
    for (let i = 1; i < 4; i++) mctx.lineTo(corners[i][0], corners[i][1]);
    mctx.closePath();
    mctx.fill();
    matteData = mctx.getImageData(0, 0, cw, ch);
  } else if (hasMatteAsset) {
    const matteResolved = resolveUrl(matteSrc, layersBaseUrl || config.layersBaseUrl);
    const matteImg =
      typeof matteSrc === 'string' ? await loadImage(matteResolved, 'pinned-matte') : matteSrc;
    mctx.drawImage(matteImg, 0, 0, cw, ch);
    matteData = mctx.getImageData(0, 0, cw, ch);
  } else {
    return;
  }

  let tw;
  let th;
  let tileData;
  if (useProceduralTile) {
    tw = 64;
    th = 64;
    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = tw;
    tileCanvas.height = th;
    const tctx = tileCanvas.getContext('2d');
    const cs = 8;
    tctx.fillStyle = '#5c5347';
    tctx.fillRect(0, 0, tw, th);
    tctx.fillStyle = '#8a7f6b';
    for (let i = 0; i < tw / cs; i++) {
      for (let j = 0; j < th / cs; j++) {
        if ((i + j) % 2 === 0) tctx.fillRect(i * cs, j * cs, cs, cs);
      }
    }
    tileData = tctx.getImageData(0, 0, tw, th).data;
  } else if (hasTileAsset) {
    let tileImg;
    if (tileSrc instanceof HTMLImageElement || tileSrc instanceof HTMLCanvasElement) {
      tileImg = tileSrc;
    } else {
      const tileResolved = resolveUrl(tileSrc, layersBaseUrl || config.layersBaseUrl);
      tileImg = await loadImage(tileResolved, 'pinned-tile');
    }
    tw = tileImg.naturalWidth || tileImg.width;
    th = tileImg.naturalHeight || tileImg.height;
    if (tw < 2 || th < 2) return;
    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = tw;
    tileCanvas.height = th;
    const tctx = tileCanvas.getContext('2d');
    tctx.drawImage(tileImg, 0, 0);
    tileData = tctx.getImageData(0, 0, tw, th).data;
  } else {
    return;
  }

  const H = homographyUnitSquareToQuad(corners);
  if (!H) {
    console.warn(LOG + ' could not solve homography');
    return;
  }
  const Hinv = invert33(H);
  if (!Hinv) {
    console.warn(LOG + ' singular homography');
    return;
  }

  const ctx = baseCanvas.getContext('2d', { willReadFrequently: true });
  const baseData = ctx.getImageData(0, 0, cw, ch);
  const out = baseData.data;
  const matteBytes = matteData.data;

  let minX = cw;
  let minY = ch;
  let maxX = 0;
  let maxY = 0;
  for (let i = 0; i < corners.length; i++) {
    const x = corners[i][0];
    const y = corners[i][1];
    minX = Math.min(minX, Math.floor(x));
    minY = Math.min(minY, Math.floor(y));
    maxX = Math.max(maxX, Math.ceil(x));
    maxY = Math.max(maxY, Math.ceil(y));
  }
  minX = Math.max(0, minX - 2);
  minY = Math.max(0, minY - 2);
  maxX = Math.min(cw - 1, maxX + 2);
  maxY = Math.min(ch - 1, maxY + 2);

  for (let py = minY; py <= maxY; py++) {
    for (let px = minX; px <= maxX; px++) {
      const mi = (py * cw + px) * 4;
      let mAlpha = matteBytes[mi + 3] / 255;
      if (mAlpha < 1 / 255) {
        const r0 = matteBytes[mi];
        const g0 = matteBytes[mi + 1];
        const b0 = matteBytes[mi + 2];
        mAlpha = (0.299 * r0 + 0.587 * g0 + 0.114 * b0) / 255;
      }
      if (mAlpha < 1 / 255) continue;

      const uv = mapInverse(Hinv, px, py);
      if (!uv) continue;
      let u = uv[0];
      let v = uv[1];
      u *= tileRepeat;
      v *= tileRepeat;
      u = u - Math.floor(u);
      v = v - Math.floor(v);
      if (u < 0) u += 1;
      if (v < 0) v += 1;

      const sx = clamp01(u) * (tw - 1);
      const sy = clamp01(v) * (th - 1);
      const tileRgb = sampleBilinear(tileData, tw, th, sx, sy);

      const a = mAlpha * (tileRgb[3] / 255);
      const inv = 1 - a;
      out[mi] = out[mi] * inv + tileRgb[0] * a;
      out[mi + 1] = out[mi + 1] * inv + tileRgb[1] * a;
      out[mi + 2] = out[mi + 2] * inv + tileRgb[2] * a;
      out[mi + 3] = 255;
    }
  }

  ctx.putImageData(baseData, 0, 0);

  const shadowSrc = config.shadowPassImage || config.shadowPassPath || config.shadowPath || config.lightingPassPath;
  if (shadowSrc) {
    try {
      const shResolved = resolveUrl(shadowSrc, layersBaseUrl || config.layersBaseUrl);
      const shImg =
        typeof shadowSrc === 'string'
          ? await loadImage(shResolved, 'pinned-shadow')
          : shadowSrc;
      const op = typeof config.shadowPassOpacity === 'number' ? config.shadowPassOpacity : 0.45;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, op));
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(shImg, 0, 0, cw, ch);
      ctx.restore();
    } catch (shErr) {
      console.error(LOG + ' shadow/lighting pass failed:', shadowSrc, shErr && shErr.message ? shErr.message : shErr);
    }
  }

  drawPinnedSurfaceDebugOverlay(ctx, corners, config);
}

/**
 * Apply **floor** then optional **pinned-wall** surface in order (same composite as
 * {@link applyPinnedSurfaceComposite}). Pass explicit configs — no `window` registry.
 *
 * @param {HTMLCanvasElement} baseCanvas
 * @param {{ floor?: object, pinnedWall?: object }} surfaces
 * @param {string} [layersBaseUrl]
 * @param {object} [extras]
 * @param {boolean} [extras.applyPinnedWall] - if true, runs `pinnedWall` after `floor` when that config exists and is enabled
 * @param {object} [extras.pinnedWallOverride] - shallow-merged onto `pinnedWall` before apply
 */
export async function applyPinnedSurfacesInOrder(baseCanvas, surfaces, layersBaseUrl, extras) {
  extras = extras || {};
  surfaces = surfaces || {};
  const floorCfg = surfaces.floor;
  if (floorCfg && floorCfg.enabled !== false) {
    await applyPinnedSurfaceComposite(baseCanvas, floorCfg, layersBaseUrl, extras);
  }
  let wallCfg = surfaces.pinnedWall ? Object.assign({}, surfaces.pinnedWall) : null;
  if (extras.pinnedWallOverride) {
    wallCfg = Object.assign({}, wallCfg || {}, extras.pinnedWallOverride);
  }
  if (!wallCfg || wallCfg.enabled === false) return;
  if (extras.applyPinnedWall !== true) return;
  await applyPinnedSurfaceComposite(baseCanvas, wallCfg, layersBaseUrl, extras);
}
