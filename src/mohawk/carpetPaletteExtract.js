/**
 * Browser carpet thumbnail → role palette (aligned with tools/mohawk/extract-palette.js intent).
 * Feeds generatePaletteFromMohawkRoles for harmonious expansion up to N hexes.
 */

import { generatePaletteFromMohawkRoles } from '../color/paletteEngine.js';

const MAX_SAMPLE_SIDE = 300;
const KMEANS_ITERS = 20;
const SUBSAMPLE_TARGET = 12000;
const DEFAULT_MIN_DELTA_E = 6;
const MIN_ACCENT_SAT = 0.12;
const MIN_LINE_COUNT = 35;
const MIN_ACCENT_COUNT = 25;

function clamp(n lo hi) {
  return Math.max(lo, Math.min(hi, n));
}

function clamp01(n) {
  return clamp(n, 0, 1);
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const l = (max + min) / 2;
  let s = 0;
  if (d > 1e-8) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return { h: h * 360, s, l };
}

function rgbToXyz255(r, g, b) {
  const lin = (u) => (u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4));
  const R = lin(r / 255);
  const G = lin(g / 255);
  const B = lin(b / 255);
  const x = R * 0.4124564 + G * 0.3575761 + B * 0.1804375;
  const y = R * 0.2126729 + G * 0.7151522 + B * 0.072175;
  const z = R * 0.0193339 + G * 0.119192 + B * 0.9503041;
  return { x, y, z };
}

function xyzToLab(x, y, z) {
  const xn = 0.95047;
  const yn = 1.0;
  const zn = 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const L = 116 * f(y / yn) - 16;
  const a = 500 * (f(x / xn) - f(y / yn));
  const b = 200 * (f(y / yn) - f(z / zn));
  return { L, a, b };
}

function rgbToLab255(r, g, b) {
  const { x, y, z } = rgbToXyz255(r, g, b);
  return xyzToLab(x, y, z);
}

function deltaE76(labA, labB) {
  const dL = labA.L - labB.L;
  const da = labA.a - labB.a;
  const db = labA.b - labB.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}

function rgbToHex(r, g, b) {
  const x = (n) =>
    clamp(Math.round(n), 0, 255)
      .toString(16)
      .padStart(2, '0');
  return '#' + x(r) + x(g) + x(b);
}

function hexToRgb(hex) {
  const h = String(hex).replace(/^#/, '').trim();
  if (h.length === 3) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16)
    };
  }
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) {
    throw new Error('Expected #RRGGBB or #RGB, got ' + hex);
  }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16)
  };
}

function collectOpaquePixels(buf) {
  const out = [];
  for (let i = 0; i < buf.length; i += 4) {
    if (buf[i + 3] === 0) continue;
    out.push(buf[i], buf[i + 1], buf[i + 2]);
  }
  return new Float32Array(out);
}

function assignToCentroids(pixels, centroids, kk) {
  const n = pixels.length / 3;
  const assign = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    const p = i * 3;
    let best = 0;
    let bestD = dist2(pixels, p, centroids, 0);
    for (let j = 1; j < kk; j++) {
      const d = dist2(pixels, p, centroids, j * 3);
      if (d < bestD) {
        bestD = d;
        best = j;
      }
    }
    assign[i] = best;
  }
  return assign;
}

function featurePixelsDeltaE(sample, assign1, bgLabel, bgR, bgG, bgB, minDeltaE) {
  const bgLab = rgbToLab255(bgR, bgG, bgB);
  const n = sample.length / 3;
  const out = [];
  for (let i = 0; i < n; i++) {
    const p = i * 3;
    const r = sample[p];
    const g = sample[p + 1];
    const b = sample[p + 2];
    const de = deltaE76(rgbToLab255(r, g, b), bgLab);
    if (assign1[i] !== bgLabel || de > minDeltaE) {
      out.push(r, g, b);
    }
  }
  return new Float32Array(out);
}

function pixelsExcludingLabel(sample, assign, excludeLabel) {
  const out = [];
  const n = sample.length / 3;
  for (let i = 0; i < n; i++) {
    if (assign[i] === excludeLabel) continue;
    const p = i * 3;
    out.push(sample[p], sample[p + 1], sample[p + 2]);
  }
  return new Float32Array(out);
}

function subsampleDeterministic(pixels, target) {
  const n = pixels.length / 3;
  if (n <= target) return pixels;
  const out = new Float32Array(target * 3);
  const step = (n - 1) / (target - 1);
  for (let i = 0; i < target; i++) {
    const idx = Math.floor(i * step);
    const o = i * 3;
    const p = idx * 3;
    out[o] = pixels[p];
    out[o + 1] = pixels[p + 1];
    out[o + 2] = pixels[p + 2];
  }
  return out;
}

function dist2(a, oa, b, ob) {
  const dr = a[oa] - b[ob];
  const dg = a[oa + 1] - b[ob + 1];
  const db = a[oa + 2] - b[ob + 2];
  return dr * dr + dg * dg + db * db;
}

function kMeans(pixels, k) {
  const n = pixels.length / 3;
  if (n === 0) return { centroids: new Float32Array(0), counts: [] };
  const kk = Math.min(k, n);
  const centroids = new Float32Array(kk * 3);
  const step = Math.max(1, Math.floor(n / kk));
  for (let j = 0; j < kk; j++) {
    const idx = Math.min(n - 1, j * step);
    const p = idx * 3;
    const c = j * 3;
    centroids[c] = pixels[p];
    centroids[c + 1] = pixels[p + 1];
    centroids[c + 2] = pixels[p + 2];
  }

  const assign = new Int32Array(n);
  const sums = new Float32Array(kk * 3);
  const counts = new Int32Array(kk);

  for (let iter = 0; iter < KMEANS_ITERS; iter++) {
    let moved = false;
    for (let i = 0; i < n; i++) {
      const p = i * 3;
      let best = 0;
      let bestD = dist2(pixels, p, centroids, 0);
      for (let j = 1; j < kk; j++) {
        const d = dist2(pixels, p, centroids, j * 3);
        if (d < bestD) {
          bestD = d;
          best = j;
        }
      }
      if (assign[i] !== best) {
        assign[i] = best;
        moved = true;
      }
    }
    sums.fill(0);
    counts.fill(0);
    for (let i = 0; i < n; i++) {
      const c = assign[i];
      const p = i * 3;
      const o = c * 3;
      sums[o] += pixels[p];
      sums[o + 1] += pixels[p + 1];
      sums[o + 2] += pixels[p + 2];
      counts[c]++;
    }
    for (let j = 0; j < kk; j++) {
      const o = j * 3;
      const cnt = counts[j];
      if (cnt > 0) {
        centroids[o] = sums[o] / cnt;
        centroids[o + 1] = sums[o + 1] / cnt;
        centroids[o + 2] = sums[o + 2] / cnt;
      }
    }
    if (!moved && iter > 0) break;
  }

  return { centroids, counts: Array.from(counts) };
}

function rgbDist(a, b) {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function accentFromHighSaturationPixels(pixels, bgR, bgG, bgB, minDeltaE) {
  const bgLab = rgbToLab255(bgR, bgG, bgB);
  const n = pixels.length / 3;
  const scored = [];
  for (let i = 0; i < n; i++) {
    const p = i * 3;
    const r = pixels[p];
    const g = pixels[p + 1];
    const b = pixels[p + 2];
    const { s } = rgbToHsl(r, g, b);
    const de = deltaE76(rgbToLab255(r, g, b), bgLab);
    if (de < minDeltaE + 1 || s < 0.14) continue;
    scored.push({ r, g, b, score: s * 1.4 + de * 0.06 });
  }
  if (scored.length === 0) return null;
  scored.sort((a, b) => b.score - a.score);
  const take = clamp(Math.max(60, Math.floor(scored.length * 0.14)), 1, 900);
  let R = 0;
  let G = 0;
  let B = 0;
  for (let i = 0; i < take; i++) {
    R += scored[i].r;
    G += scored[i].g;
    B += scored[i].b;
  }
  return rgbToHex(R / take, G / take, B / take);
}

function warmHueBoostDeg(hDeg) {
  const h = ((hDeg % 360) + 360) % 360;
  return h >= 25 && h <= 65 ? 1 : 0;
}

function coolBiasDeg(hDeg) {
  const h = ((hDeg % 360) + 360) % 360;
  return h >= 180 && h <= 260 ? 1 : 0;
}

function computeAccentScore(hDeg, s, count) {
  if (s < MIN_ACCENT_SAT) return Number.NEGATIVE_INFINITY;
  return s * 1.5 + warmHueBoostDeg(hDeg) * 0.8 + Math.log(Math.max(1, count));
}

function computeLineworkScore(hDeg, s, l) {
  return (1 - l) * 1.2 + (1 - s) * 0.8 + coolBiasDeg(hDeg);
}

function extraUsefulness(st) {
  return st.count * (1 + st.s);
}

function hexFromCentroids(centroids, idx) {
  const o = idx * 3;
  return rgbToHex(centroids[o], centroids[o + 1], centroids[o + 2]);
}

function deltaEFromBackgroundRgb(r, g, b, bgR, bgG, bgB) {
  return deltaE76(rgbToLab255(r, g, b), rgbToLab255(bgR, bgG, bgB));
}

/**
 * @param {Float32Array} sample - RGB interleaved opaque pixels
 * @param {number} requestedColors - extracted swatches before engine expansion (3–10)
 * @param {number} minDeltaE
 * @returns {{ palette: {role: string, hex: string}[] }}
 */
function buildRolePalette(sample, requestedColors, minDeltaE) {
  const kPass2 = Math.min(4, Math.max(3, requestedColors - 1));
  const maxSlots = 1 + kPass2;
  const outCount = Math.min(requestedColors, maxSlots);

  if (sample.length < 6) throw new Error('Too few opaque pixels after resize.');

  const km1 = kMeans(sample, 2);
  if (km1.counts[0] === 0 || km1.counts[1] === 0) {
    throw new Error('Pass-1 clustering collapsed.');
  }
  const bgLabel = km1.counts[0] >= km1.counts[1] ? 0 : 1;
  const bgCentroidOff = bgLabel * 3;
  const bgR = km1.centroids[bgCentroidOff];
  const bgG = km1.centroids[bgCentroidOff + 1];
  const bgB = km1.centroids[bgCentroidOff + 2];
  const assign1 = assignToCentroids(sample, km1.centroids, 2);

  let featureSample = featurePixelsDeltaE(sample, assign1, bgLabel, bgR, bgG, bgB, minDeltaE);
  let nFeat = featureSample.length / 3;
  const minNeed = kPass2 * 45;
  if (nFeat < minNeed) {
    const relaxed = Math.max(4, minDeltaE * 0.65);
    const wider = featurePixelsDeltaE(sample, assign1, bgLabel, bgR, bgG, bgB, relaxed);
    if (wider.length / 3 > nFeat) {
      featureSample = wider;
      nFeat = featureSample.length / 3;
    }
  }
  if (nFeat < kPass2 * 20) {
    featureSample = pixelsExcludingLabel(sample, assign1, bgLabel);
    nFeat = featureSample.length / 3;
  }
  if (nFeat < kPass2 * 20) {
    throw new Error('Too few feature pixels after background separation.');
  }

  const featSub = subsampleDeterministic(featureSample, Math.min(SUBSAMPLE_TARGET, nFeat));
  const km2 = kMeans(featSub, kPass2);
  const active = km2.counts
    .map((c, i) => ({ c, i }))
    .filter((x) => x.c > 0)
    .map((x) => x.i);

  if (active.length < 2) {
    throw new Error('Pass-2 clustering collapsed.');
  }

  const stats = active.map((idx) => {
    const o = idx * 3;
    const r = km2.centroids[o];
    const g = km2.centroids[o + 1];
    const b = km2.centroids[o + 2];
    const { h, s, l } = rgbToHsl(r, g, b);
    const count = km2.counts[idx];
    return { idx, h, s, l, count };
  });

  const lineCandidates = stats.filter((st) => st.count >= MIN_LINE_COUNT);
  const linePool = lineCandidates.length ? lineCandidates : stats.slice();
  const rankedLine = linePool
    .map((st) => ({ ...st, lScore: computeLineworkScore(st.h, st.s, st.l) }))
    .sort((a, b) => b.lScore - a.lScore);

  const hasGrayish = stats.some((st) => st.s < 0.22 && st.l < 0.62);
  let lineworkPick = rankedLine[0];
  if (lineworkPick && hasGrayish) {
    const warmBrown =
      lineworkPick.h >= 20 &&
      lineworkPick.h <= 78 &&
      lineworkPick.s > 0.12 &&
      lineworkPick.s < 0.42;
    if (warmBrown) {
      const alt = rankedLine.find((st) => {
        const neutralish = st.s < 0.26 || coolBiasDeg(st.h) > 0;
        return st.idx !== lineworkPick.idx && neutralish && st.lScore >= lineworkPick.lScore - 0.4;
      });
      if (alt) lineworkPick = alt;
    }
  }
  const lineworkIdx = lineworkPick.idx;

  const accentPool = stats.filter((st) => st.idx !== lineworkIdx && st.count >= MIN_ACCENT_COUNT);
  let accentPick = null;
  let bestAccentSc = Number.NEGATIVE_INFINITY;
  for (const st of accentPool) {
    const sc = computeAccentScore(st.h, st.s, st.count);
    if (sc > bestAccentSc) {
      bestAccentSc = sc;
      accentPick = st;
    } else if (accentPick && sc === bestAccentSc) {
      if (st.s > accentPick.s) accentPick = st;
      else if (st.s === accentPick.s && st.count < accentPick.count) accentPick = st;
    }
  }
  if (!accentPick || bestAccentSc === Number.NEGATIVE_INFINITY) {
    accentPick = stats.filter((st) => st.idx !== lineworkIdx).reduce((a, b) => (b.s > a.s ? b : a));
  }
  const accentIdx = accentPick.idx;

  const used = new Set([accentIdx, lineworkIdx]);
  const extras = stats
    .filter((st) => !used.has(st.idx))
    .sort((a, b) => extraUsefulness(b) - extraUsefulness(a))
    .map((st) => st.idx);

  const palette = [
    { role: 'background', hex: rgbToHex(bgR, bgG, bgB) },
    { role: 'linework', hex: hexFromCentroids(km2.centroids, lineworkIdx) },
    { role: 'accent', hex: hexFromCentroids(km2.centroids, accentIdx) }
  ];

  let extraNum = 1;
  for (const idx of extras) {
    if (palette.length >= outCount) break;
    palette.push({ role: 'extra' + extraNum++, hex: hexFromCentroids(km2.centroids, idx) });
  }

  const backgroundHex = palette[0].hex;
  const bgRgb = hexToRgb(backgroundHex);
  const acEntry = palette.find((e) => e.role === 'accent');
  const acRgb = hexToRgb(acEntry.hex);
  const acDe = deltaEFromBackgroundRgb(acRgb.r, acRgb.g, acRgb.b, bgR, bgG, bgB);
  if (acEntry.hex === backgroundHex || rgbDist(acRgb, bgRgb) < 14 || acDe < minDeltaE + 2) {
    const scan = subsampleDeterministic(featureSample, Math.min(4500, nFeat));
    const alt = accentFromHighSaturationPixels(scan, bgR, bgG, bgB, minDeltaE);
    if (alt && alt !== backgroundHex && rgbDist(hexToRgb(alt), bgRgb) >= 12) {
      acEntry.hex = alt;
    }
  }

  return { palette };
}

function uniqueHexesInOrder(list) {
  const seen = new Set();
  const out = [];
  for (const h of list) {
    const k = String(h || '').trim().toLowerCase();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(k.startsWith('#') ? k : '#' + k);
  }
  return out;
}

/**
 * If all colors sit in mid luminance, add a highlight and shadow anchor (wallpaper-friendly thin stacks).
 * @param {string[]} hexes
 * @returns {string[]}
 */
function padMidtonePalette(hexes) {
  if (!hexes.length) return hexes;
  let minL = 1;
  let maxL = 0;
  for (const h of hexes) {
    try {
      const { r, g, b } = hexToRgb(h);
      const { l } = rgbToHsl(r, g, b);
      minL = Math.min(minL, l);
      maxL = Math.max(maxL, l);
    } catch (_e) {}
  }
  if (maxL - minL >= 0.28) return hexes;
  const extra = ['#f4f1ea', '#2c2a26'];
  return uniqueHexesInOrder(hexes.concat(extra));
}

/**
 * @param {{ palette: {role: string, hex: string}[] }} roleResult
 * @param {number} maxColors
 * @returns {string[]}
 */
function expandRolePaletteWithEngine(roleResult, maxColors) {
  const p = roleResult.palette;
  const bg = p.find((x) => x.role === 'background')?.hex;
  const lw = p.find((x) => x.role === 'linework')?.hex;
  const ac = p.find((x) => x.role === 'accent')?.hex;
  if (!bg || !lw || !ac) throw new Error('Missing role hexes');
  const pal5 = generatePaletteFromMohawkRoles(
    { background: bg, linework: lw, accent: ac },
    { harmony: 'analogous', style: 'none', artist: 'none' }
  );
  const extraHexes = p.filter((x) => String(x.role).startsWith('extra')).map((x) => x.hex);
  const ordered = [
    pal5.background,
    pal5.primary,
    pal5.secondary,
    pal5.accent,
    pal5.neutral,
    ...extraHexes
  ];
  let out = uniqueHexesInOrder(ordered);
  out = out.slice(0, maxColors);
  return padMidtonePalette(out).slice(0, maxColors);
}

/**
 * Raster from ImageBitmap | HTMLImageElement | HTMLCanvasElement.
 * @param {CanvasImageSource} source
 * @returns {{ data: Uint8ClampedArray, width: number, height: number }}
 */
export function rasterizeCarpetSourceForExtract(source) {
  const wNat =
    source.naturalWidth ||
    source.width ||
    (source instanceof ImageBitmap ? source.width : 0);
  const hNat =
    source.naturalHeight ||
    source.height ||
    (source instanceof ImageBitmap ? source.height : 0);
  if (wNat < 2 || hNat < 2) throw new Error('Carpet image has invalid dimensions.');
  const scale = Math.min(1, MAX_SAMPLE_SIDE / Math.max(wNat, hNat));
  const tw = Math.max(2, Math.round(wNat * scale));
  const th = Math.max(2, Math.round(hNat * scale));
  const c = document.createElement('canvas');
  c.width = tw;
  c.height = th;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(source, 0, 0, tw, th);
  const img = x.getImageData(0, 0, tw, th);
  return { data: img.data, width: tw, height: th };
}

/**
 * @param {CanvasImageSource} source
 * @param {{ maxColors?: number, minDeltaE?: number, patternLayerCount?: number }} [options]
 * @returns {{ hexes: string[], roles: { background: string, linework: string, accent: string } }}
 */
export function extractMohawkCarpetDesignerHexes(source, options) {
  const maxColors = Math.min(10, Math.max(5, options && options.maxColors != null ? Number(options.maxColors) : 10));
  const minDeltaE =
    options && options.minDeltaE != null
      ? clamp(Number(options.minDeltaE), 4, 14)
      : DEFAULT_MIN_DELTA_E;
  const { data } = rasterizeCarpetSourceForExtract(source);
  const opaque = collectOpaquePixels(data);
  const nPix = opaque.length / 3;
  if (nPix < 100) throw new Error('Too few opaque pixels in carpet image.');
  const sample = subsampleDeterministic(opaque, Math.min(SUBSAMPLE_TARGET, nPix));
  const rolePalette = buildRolePalette(sample, maxColors, minDeltaE);
  let hexes = expandRolePaletteWithEngine(rolePalette, maxColors);
  const layerCnt = options && options.patternLayerCount != null ? Number(options.patternLayerCount) : 99;
  if (layerCnt <= 3) {
    hexes = padMidtonePalette(hexes);
    hexes = hexes.slice(0, maxColors);
  }
  const bg = rolePalette.palette.find((x) => x.role === 'background')?.hex;
  const lw = rolePalette.palette.find((x) => x.role === 'linework')?.hex;
  const ac = rolePalette.palette.find((x) => x.role === 'accent')?.hex;
  return {
    hexes,
    roles: { background: bg, linework: lw, accent: ac }
  };
}
