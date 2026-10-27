#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Role-aware two-pass k-means for Mohawk-style product previews (standalone CLI).
 * Does not touch ColorFlex / CFM / palette UI.
 *
 * Usage:
 *   node tools/mohawk/extract-palette.js <imagePathOrUrl> [--colors 5]
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const sharp = require('sharp');

const REPO_ROOT = path.resolve(__dirname, '../..');
const DEFAULT_OUT = path.join(REPO_ROOT, 'src', 'demo', 'mohawkPaletteTest.json');
const MAX_WIDTH = 300;
const KMEANS_ITERS = 20;
const SUBSAMPLE_TARGET = 12000;
const NEUTRAL_AVG_SAT_THRESHOLD = 0.15;
const STRATEGY_ID_LEGACY = 'role-aware-two-pass';
const STRATEGY_ID_PERCEPTUAL = 'role-aware-perceptual-v3';
/** Shown with `--debug`; extraction is role-aware two-pass (Lab ΔE mask + scored roles). */
const EXTRACTOR_VERSION_LEGACY = 'role-aware-v2';
const EXTRACTOR_VERSION_PERCEPTUAL = 'role-aware-perceptual-v3';
const DISCLAIMER =
  'Image-derived test palette only — not manufacturing color accuracy.';
/** Min ΔE (Lab, CIE76) from background centroid to count as feature pixel (tune 6–10). */
const DEFAULT_MIN_DELTA_E = 6;
const MIN_ACCENT_SAT = 0.12;
const MIN_LINE_COUNT = 35;
const MIN_ACCENT_COUNT = 25;

// ============================================================================
// Perceptual-bias extraction (v3 default) — tuned for high-frequency woven
// textiles where simple area-weighted clustering collapses to a muddy mean.
//
// Strategy:
//   - All clustering in CIE Lab (perceptually uniform).
//   - Chroma-weighted k-means: high-chroma pixels pull centroids harder, so
//     recurring vivid threads survive averaging against neutral grunge.
//   - Anti-mud weighting: near-black, near-white, and low-chroma mid-lightness
//     pixels get a small weight; chromatic pixels get chroma^alpha weight.
//   - Background detection uses uniform-weighted k=2; when the two clusters
//     are comparable in size, prefers the lower-chroma centroid as "canvas".
//   - Feature pool: Lab ΔE from background > minDeltaE OR chroma > KEEP.
//   - Over-segment to k=8, then merge clusters with Lab ΔE < MERGE, keeping
//     the higher-chroma representative of each merged group.
//   - Linework: darkest meaningfully-populated cluster (no warm/cool bias).
//   - Accent: highest-chroma cluster with hue ≥ 25° away from background and
//     linework, and Lab ΔE ≥ 18 from each.
//   - Extras: ranked by chroma × log(weight), gated by hue/ΔE diversity.
// ============================================================================
/**
 * Hue-stratified extraction parameters. The hue circle is partitioned into
 * fixed bins so every populated hue family gets at least one chromatic
 * representative, regardless of how unbalanced the chroma distribution is.
 *
 * Each bin's representative = chroma-weighted Lab mean of all pixels falling
 * into that bin with chroma ≥ HUE_BIN_MIN_CHROMA. Bin populations are then
 * ranked by (chroma × log(weighted-count)) for accent / extra selection.
 *
 * This sidesteps a k-means pathology observed on the embroidered-print
 * carpet: cool seeds (hue 270–290) consistently drifted to warm centroids
 * during iteration because adjacent low-chroma neutrals dragged the weighted
 * mean. Stratified bins lock chromatic content to its hue family by design.
 */
const HUE_BIN_COUNT = 12;
const HUE_BIN_MIN_CHROMA = 6;
const HUE_BIN_MIN_POPULATION = 0.005;
const HUE_BIN_CHROMA_ALPHA = 2.2;
const PERCEPTUAL_K_OVERSEG = 12;
const PERCEPTUAL_CHROMA_ALPHA = 1.8;
const PERCEPTUAL_KEEP_CHROMA = 22;
const PERCEPTUAL_CLUSTER_MERGE_DE = 11;
const PERCEPTUAL_MIN_HUE_SEPARATION = 25;
const PERCEPTUAL_MIN_PALETTE_DE = 18;
const PERCEPTUAL_KMEANS_ITERS = 30;
const PERCEPTUAL_ACCENT_MIN_CHROMA = 8;
/**
 * Light gate window for anti-mud weight. Lower bound is permissive so genuine
 * dark colors (navy, indigo, deep teal at L≈12–18) get full weight; only true
 * near-black grunge pixels (L<6) get suppressed. Upper bound suppresses
 * specular blowouts (L>92).
 */
const PERCEPTUAL_MUD_L_LO = 10;
const PERCEPTUAL_MUD_L_HI = 92;

function argValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] || null;
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
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
  r /= 255;
  g /= 255;
  b /= 255;
  const lin = (u) => (u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4));
  let R = lin(r);
  let G = lin(g);
  let B = lin(b);
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
  return { L: L, a: a, b: b };
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

function isRemote(input) {
  return /^https?:\/\//i.test(String(input).trim());
}

function downloadUrl(urlString) {
  return new Promise((resolve, reject) => {
    const lib = new URL(urlString).protocol === 'https:' ? https : http;
    const req = lib.get(
      urlString,
      { headers: { 'User-Agent': 'ColorFlex-mohawk-palette-extract/1.0' } },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const next = new URL(res.headers.location, urlString).href;
          res.resume();
          downloadUrl(next).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode} for ${urlString}`));
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }
    );
    req.on('error', reject);
    req.setTimeout(60000, () => {
      req.destroy();
      reject(new Error('Download timeout'));
    });
  });
}

async function loadInputBuffer(input) {
  const s = String(input).trim();
  if (isRemote(s)) return downloadUrl(s);
  const p = path.isAbsolute(s) ? s : path.resolve(REPO_ROOT, s);
  if (!fs.existsSync(p)) throw new Error(`File not found: ${p}`);
  return fs.readFileSync(p);
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

/**
 * Feature pixels: not assigned to background cluster, OR perceptually far from field (ΔE).
 */
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

/** When accent centroid collapses to the field, derive motif from chromatic pixels far in ΔE. */
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

function averagePaletteSaturation(palette) {
  let t = 0;
  for (const { hex } of palette) {
    const { r, g, b } = hexToRgb(hex);
    t += rgbToHsl(r, g, b).s;
  }
  return Math.round((t / palette.length) * 1000) / 1000;
}

function deltaEFromBackgroundRgb(r, g, b, bgR, bgG, bgB) {
  return deltaE76(rgbToLab255(r, g, b), rgbToLab255(bgR, bgG, bgB));
}

function warmHueBoostDeg(hDeg) {
  const h = ((hDeg % 360) + 360) % 360;
  return h >= 25 && h <= 65 ? 1 : 0;
}

function coolBiasDeg(hDeg) {
  const h = ((hDeg % 360) + 360) % 360;
  return h >= 180 && h <= 260 ? 1 : 0;
}

/** Prefer chromatic / warm-gold motifs; size only via log (not linear). */
function computeAccentScore(hDeg, s, count) {
  if (s < MIN_ACCENT_SAT) return Number.NEGATIVE_INFINITY;
  return s * 1.5 + warmHueBoostDeg(hDeg) * 0.8 + Math.log(Math.max(1, count));
}

/** Prefer dark, low-sat, cool structure over warm brown line. */
function computeLineworkScore(hDeg, s, l) {
  return (1 - l) * 1.2 + (1 - s) * 0.8 + coolBiasDeg(hDeg);
}

function extraUsefulness(st) {
  return st.count * (1 + st.s);
}

function buildRolePalette(sample, requestedColors, minDeltaE) {
  /** Prefer ≥3 feature clusters when possible so field / structure / motif can separate. */
  const kPass2 = Math.min(4, Math.max(3, requestedColors - 1));
  const maxSlots = 1 + kPass2;
  const outCount = Math.min(requestedColors, maxSlots);

  if (sample.length < 6) throw new Error('Too few opaque pixels after resize.');

  const km1 = kMeans(sample, 2);
  if (km1.counts[0] === 0 || km1.counts[1] === 0) {
    throw new Error('Pass-1 clustering collapsed; try a different image.');
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
    throw new Error(
      `Too few feature pixels (${nFeat}) after background separation. Try a different image or lower --min-delta-e.`
    );
  }

  const featSub = subsampleDeterministic(featureSample, Math.min(SUBSAMPLE_TARGET, nFeat));
  const nSub = featSub.length / 3;
  const km2 = kMeans(featSub, kPass2);
  const active = km2.counts
    .map((c, i) => ({ c, i }))
    .filter((x) => x.c > 0)
    .map((x) => x.i);

  if (active.length < 2) {
    throw new Error('Pass-2 clustering collapsed; try a different image.');
  }

  const hexFor = (centroids, idx) => {
    const o = idx * 3;
    return rgbToHex(centroids[o], centroids[o + 1], centroids[o + 2]);
  };

  const backgroundHex = rgbToHex(bgR, bgG, bgB);

  const stats = active.map((idx) => {
    const o = idx * 3;
    const r = km2.centroids[o];
    const g = km2.centroids[o + 1];
    const b = km2.centroids[o + 2];
    const { h, s, l } = rgbToHsl(r, g, b);
    const count = km2.counts[idx];
    return { idx, h, s, l, count };
  });

  const clusterDebug = stats.map((st) => {
    const o = st.idx * 3;
    const r = km2.centroids[o];
    const g = km2.centroids[o + 1];
    const b = km2.centroids[o + 2];
    const hex = rgbToHex(r, g, b);
    const de = deltaEFromBackgroundRgb(r, g, b, bgR, bgG, bgB);
    const aScore = computeAccentScore(st.h, st.s, st.count);
    const lScore = computeLineworkScore(st.h, st.s, st.l);
    return {
      hex,
      count: st.count,
      hue: Math.round(st.h * 10) / 10,
      saturation: Math.round(st.s * 1000) / 1000,
      lightness: Math.round(st.l * 1000) / 1000,
      deltaEFromBackground: Math.round(de * 100) / 100,
      accentScore: aScore === Number.NEGATIVE_INFINITY ? null : Math.round(aScore * 1000) / 1000,
      lineworkScore: Math.round(lScore * 1000) / 1000
    };
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
        return (
          st.idx !== lineworkPick.idx &&
          neutralish &&
          st.lScore >= lineworkPick.lScore - 0.4
        );
      });
      if (alt) lineworkPick = alt;
    }
  }
  const lineworkIdx = lineworkPick.idx;

  const accentPool = stats.filter(
    (st) => st.idx !== lineworkIdx && st.count >= MIN_ACCENT_COUNT
  );
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
    accentPick = stats
      .filter((st) => st.idx !== lineworkIdx)
      .reduce((a, b) => (b.s > a.s ? b : a));
  }
  if (!accentPick) throw new Error('Could not assign accent cluster.');
  const accentIdx = accentPick.idx;

  const used = new Set([accentIdx, lineworkIdx]);
  const extras = stats
    .filter((st) => !used.has(st.idx))
    .sort((a, b) => extraUsefulness(b) - extraUsefulness(a))
    .map((st) => st.idx);

  const palette = [
    { role: 'background', hex: backgroundHex },
    { role: 'linework', hex: hexFor(km2.centroids, lineworkIdx) },
    { role: 'accent', hex: hexFor(km2.centroids, accentIdx) }
  ];

  let extraNum = 1;
  for (const idx of extras) {
    if (palette.length >= outCount) break;
    palette.push({ role: 'extra' + extraNum++, hex: hexFor(km2.centroids, idx) });
  }

  const bgRgb = hexToRgb(backgroundHex);
  const acEntry = palette.find((e) => e.role === 'accent');
  const acRgb = hexToRgb(acEntry.hex);
  const acDe = deltaEFromBackgroundRgb(acRgb.r, acRgb.g, acRgb.b, bgR, bgG, bgB);
  if (
    acEntry.hex === backgroundHex ||
    rgbDist(acRgb, bgRgb) < 14 ||
    acDe < minDeltaE + 2
  ) {
    const scan = subsampleDeterministic(featureSample, Math.min(4500, nFeat));
    const alt = accentFromHighSaturationPixels(scan, bgR, bgG, bgB, minDeltaE);
    if (alt && alt !== backgroundHex && rgbDist(hexToRgb(alt), bgRgb) >= 12) {
      acEntry.hex = alt;
    }
  }

  return {
    palette,
    cappedToMaxSlots: requestedColors > maxSlots,
    featurePixelCount: nFeat,
    clusterDebug,
    minDeltaEUsed: minDeltaE
  };
}

// ============================================================================
// Perceptual extraction helpers
// ============================================================================

function chromaFromAB(a, b) {
  return Math.sqrt(a * a + b * b);
}

function hueDegFromAB(a, b) {
  const h = Math.atan2(b, a) * (180 / Math.PI);
  return ((h % 360) + 360) % 360;
}

function hueDist(h1, h2) {
  const d = Math.abs(h1 - h2);
  return Math.min(d, 360 - d);
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function labDist2(L1, a1, b1, L2, a2, b2) {
  const dL = L1 - L2;
  const da = a1 - a2;
  const db = b1 - b2;
  return dL * dL + da * da + db * db;
}

/**
 * Reverse Lab → linear sRGB → sRGB hex. Used to render weighted-Lab centroids
 * back to a swatch hex without a round-trip through raw pixel sampling.
 */
function labToRgbHex(L, a, b) {
  const xn = 0.95047, yn = 1.0, zn = 1.08883;
  const fy = (L + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;
  const f3 = (t) => {
    const t3 = t * t * t;
    return t3 > 0.008856 ? t3 : (t - 16 / 116) / 7.787;
  };
  const X = f3(fx) * xn;
  const Y = f3(fy) * yn;
  const Z = f3(fz) * zn;
  let R = X * 3.2404542 + Y * -1.5371385 + Z * -0.4985314;
  let G = X * -0.969266 + Y * 1.8760108 + Z * 0.041556;
  let B = X * 0.0556434 + Y * -0.2040259 + Z * 1.0572252;
  const gamma = (u) => (u <= 0.0031308 ? 12.92 * u : 1.055 * Math.pow(u, 1 / 2.4) - 0.055);
  R = gamma(R);
  G = gamma(G);
  B = gamma(B);
  return rgbToHex(R * 255, G * 255, B * 255);
}

/** Cache Lab + chroma + per-pixel weights for the perceptual path. */
function buildLabBuffers(rgbSample) {
  const n = rgbSample.length / 3;
  const labL = new Float32Array(n);
  const labA = new Float32Array(n);
  const labB = new Float32Array(n);
  const chroma = new Float32Array(n);
  const weight = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const p = i * 3;
    const lab = rgbToLab255(rgbSample[p], rgbSample[p + 1], rgbSample[p + 2]);
    labL[i] = lab.L;
    labA[i] = lab.a;
    labB[i] = lab.b;
    const C = chromaFromAB(lab.a, lab.b);
    chroma[i] = C;
    /**
     * Anti-mud weight. Chroma^alpha is the primary driver; lightGate kills
     * pure shadow / pure highlight pixels (deep-black grunge noise and
     * specular blowouts contribute almost nothing to identity). A tiny floor
     * keeps true neutrals representable so the background pass still works
     * for legitimately low-chroma textiles.
     */
    const lightGate =
      smoothstep(2, PERCEPTUAL_MUD_L_LO, lab.L) *
      smoothstep(99, PERCEPTUAL_MUD_L_HI, lab.L);
    const chromaTerm = Math.pow(Math.max(C, 0.5), PERCEPTUAL_CHROMA_ALPHA);
    weight[i] = chromaTerm * lightGate + 0.5;
  }
  return { labL, labA, labB, chroma, weight };
}

/**
 * Weighted k-means in Lab. Returns weighted-mean centroids and weighted counts.
 *
 * Seeding (kmeans++):
 *   First centroid = highest-chroma pixel (deterministic anchor in the most
 *   chromatic region). Subsequent centroids picked by pure Lab distance² to
 *   the existing centroid set — NOT distance × weight. Multiplying by weight
 *   biases seeds toward already-high-weight (high-chroma) clusters, starving
 *   minority-color clusters (e.g., the navy in a red-dominant carpet) that we
 *   specifically want to surface. Seeds spread by perceptual distance; chroma
 *   weighting affects centroid means and final scoring.
 *
 * Centroid update: chroma-weighted Lab means.
 */
function weightedLabKMeans(labL, labA, labB, weight, indexList, k) {
  const m = indexList.length;
  if (m === 0) return { cL: new Float32Array(0), cA: new Float32Array(0), cB: new Float32Array(0), wcount: [] };
  const kk = Math.min(k, m);
  const cL = new Float32Array(kk);
  const cA = new Float32Array(kk);
  const cB = new Float32Array(kk);

  let firstIdx = 0;
  let firstW = weight[indexList[0]];
  for (let i = 1; i < m; i++) {
    const w = weight[indexList[i]];
    if (w > firstW) { firstW = w; firstIdx = i; }
  }
  cL[0] = labL[indexList[firstIdx]];
  cA[0] = labA[indexList[firstIdx]];
  cB[0] = labB[indexList[firstIdx]];

  const distBuf = new Float32Array(m);
  for (let c = 1; c < kk; c++) {
    for (let i = 0; i < m; i++) {
      const pi = indexList[i];
      let dmin = labDist2(labL[pi], labA[pi], labB[pi], cL[0], cA[0], cB[0]);
      for (let j = 1; j < c; j++) {
        const d = labDist2(labL[pi], labA[pi], labB[pi], cL[j], cA[j], cB[j]);
        if (d < dmin) dmin = d;
      }
      distBuf[i] = dmin;
    }
    let pick = 0;
    let pickV = distBuf[0];
    for (let i = 1; i < m; i++) {
      if (distBuf[i] > pickV) { pickV = distBuf[i]; pick = i; }
    }
    cL[c] = labL[indexList[pick]];
    cA[c] = labA[indexList[pick]];
    cB[c] = labB[indexList[pick]];
  }
  if (process.env.MOHAWK_DEBUG_SEEDS) {
    for (let j = 0; j < kk; j++) {
      const hue = ((Math.atan2(cB[j], cA[j]) * 180 / Math.PI) % 360 + 360) % 360;
      const chroma = Math.sqrt(cA[j] * cA[j] + cB[j] * cB[j]);
      console.error(`[seed ${j}] L=${cL[j].toFixed(1)} a=${cA[j].toFixed(1)} b=${cB[j].toFixed(1)} chroma=${chroma.toFixed(1)} hue=${hue.toFixed(0)}`);
    }
  }

  const assign = new Int32Array(m);
  const wSumL = new Float64Array(kk);
  const wSumA = new Float64Array(kk);
  const wSumB = new Float64Array(kk);
  const wcount = new Float64Array(kk);

  for (let iter = 0; iter < PERCEPTUAL_KMEANS_ITERS; iter++) {
    let moved = false;
    for (let i = 0; i < m; i++) {
      const pi = indexList[i];
      let best = 0;
      let bestD = labDist2(labL[pi], labA[pi], labB[pi], cL[0], cA[0], cB[0]);
      for (let j = 1; j < kk; j++) {
        const d = labDist2(labL[pi], labA[pi], labB[pi], cL[j], cA[j], cB[j]);
        if (d < bestD) { bestD = d; best = j; }
      }
      if (assign[i] !== best) { assign[i] = best; moved = true; }
    }
    wSumL.fill(0); wSumA.fill(0); wSumB.fill(0); wcount.fill(0);
    for (let i = 0; i < m; i++) {
      const pi = indexList[i];
      const c = assign[i];
      const w = weight[pi];
      wSumL[c] += labL[pi] * w;
      wSumA[c] += labA[pi] * w;
      wSumB[c] += labB[pi] * w;
      wcount[c] += w;
    }
    for (let j = 0; j < kk; j++) {
      if (wcount[j] > 0) {
        cL[j] = wSumL[j] / wcount[j];
        cA[j] = wSumA[j] / wcount[j];
        cB[j] = wSumB[j] / wcount[j];
      }
    }
    if (!moved && iter > 0) break;
  }
  return { cL, cA, cB, wcount: Array.from(wcount) };
}

/**
 * Build hue-stratified clusters: for each fixed hue bin, compute the
 * chroma-weighted Lab mean of pixels in that bin with chroma above the floor.
 * Returns one cluster per populated bin. Guarantees that every meaningful
 * hue family in the image gets a representative independent of k-means
 * convergence dynamics.
 */
function buildHueBinClusters(labL, labA, labB, chroma, featureIdx, alpha) {
  const binWidth = 360 / HUE_BIN_COUNT;
  const bins = new Array(HUE_BIN_COUNT);
  for (let i = 0; i < HUE_BIN_COUNT; i++) {
    bins[i] = { sumL: 0, sumA: 0, sumB: 0, totalW: 0, pixelCount: 0, maxChroma: 0 };
  }
  const minPopAbs = Math.max(5, Math.floor(featureIdx.length * HUE_BIN_MIN_POPULATION));
  for (let k = 0; k < featureIdx.length; k++) {
    const i = featureIdx[k];
    if (chroma[i] < HUE_BIN_MIN_CHROMA) continue;
    const h = hueDegFromAB(labA[i], labB[i]);
    const bin = Math.floor(h / binWidth) % HUE_BIN_COUNT;
    /** Use chroma^alpha as weight so the bin's mean lands on its chromatic
     *  centroid, not its low-chroma fringe. Smaller alpha than the main
     *  k-means path to avoid letting a single high-chroma outlier
     *  monopolise the bin. */
    const w = Math.pow(chroma[i], alpha);
    bins[bin].sumL += labL[i] * w;
    bins[bin].sumA += labA[i] * w;
    bins[bin].sumB += labB[i] * w;
    bins[bin].totalW += w;
    bins[bin].pixelCount++;
    if (chroma[i] > bins[bin].maxChroma) bins[bin].maxChroma = chroma[i];
  }
  const out = [];
  for (let i = 0; i < HUE_BIN_COUNT; i++) {
    const b = bins[i];
    if (b.pixelCount < minPopAbs) continue;
    if (b.totalW <= 0) continue;
    const L = b.sumL / b.totalW;
    const a = b.sumA / b.totalW;
    const bb = b.sumB / b.totalW;
    out.push({ L, a, b: bb, w: b.totalW, chroma: chromaFromAB(a, bb), pixelCount: b.pixelCount, source: 'hue-bin' });
  }
  return out;
}

/**
 * Perceptual palette extraction (v3). See top-of-file design notes.
 */
function buildPerceptualPalette(rgbSample, requestedColors, opts) {
  const minDeltaE = (opts && opts.minDeltaE) || DEFAULT_MIN_DELTA_E;
  const outCount = clamp(requestedColors, 3, 6);
  const n = rgbSample.length / 3;
  if (n < 50) throw new Error('Too few opaque pixels after resize.');

  const { labL, labA, labB, chroma, weight } = buildLabBuffers(rgbSample);

  // -------- Background: dominant Lab cluster via uniform-weighted k=2 -----
  // Uniform weights here because we want raw area for "field". When the two
  // clusters are close in size (< 1.5× ratio), prefer the lower-chroma one.
  const uniformW = new Float32Array(n);
  for (let i = 0; i < n; i++) uniformW[i] = 1;
  const allIndices = new Array(n);
  for (let i = 0; i < n; i++) allIndices[i] = i;
  const bgKm = weightedLabKMeans(labL, labA, labB, uniformW, allIndices, 2);
  let bgIdx = (bgKm.wcount[1] || 0) > (bgKm.wcount[0] || 0) ? 1 : 0;
  const w0 = bgKm.wcount[0] || 0;
  const w1 = bgKm.wcount[1] || 0;
  const ratio = Math.max(w0, w1) / Math.max(1, Math.min(w0, w1));
  if (ratio < 1.5) {
    const ch0 = chromaFromAB(bgKm.cA[0], bgKm.cB[0]);
    const ch1 = chromaFromAB(bgKm.cA[1], bgKm.cB[1]);
    bgIdx = ch0 < ch1 ? 0 : 1;
  }
  const bgL = bgKm.cL[bgIdx];
  const bgA = bgKm.cA[bgIdx];
  const bgB = bgKm.cB[bgIdx];
  const backgroundHex = labToRgbHex(bgL, bgA, bgB);

  // -------- Feature pool ---------------------------------------------------
  const featureIdx = [];
  for (let i = 0; i < n; i++) {
    const dE = Math.sqrt(labDist2(labL[i], labA[i], labB[i], bgL, bgA, bgB));
    if (dE > minDeltaE || chroma[i] > PERCEPTUAL_KEEP_CHROMA) featureIdx.push(i);
  }
  if (featureIdx.length < PERCEPTUAL_K_OVERSEG * 6) {
    /** Relaxed threshold for tiny pools (mostly-neutral textiles). */
    const relaxed = minDeltaE * 0.5;
    const augmented = [];
    for (let i = 0; i < n; i++) {
      const dE = Math.sqrt(labDist2(labL[i], labA[i], labB[i], bgL, bgA, bgB));
      if (dE > relaxed) augmented.push(i);
    }
    if (augmented.length > featureIdx.length) featureIdx.length = 0, Array.prototype.push.apply(featureIdx, augmented);
  }
  if (featureIdx.length < 16) throw new Error(`Perceptual: feature pool too small (${featureIdx.length}).`);

  // -------- Weighted Lab k-means, over-segment ----------------------------
  const fKm = weightedLabKMeans(labL, labA, labB, weight, featureIdx, PERCEPTUAL_K_OVERSEG);
  const kmClusters = [];
  for (let j = 0; j < fKm.cL.length; j++) {
    if (!(fKm.wcount[j] > 0)) continue;
    kmClusters.push({
      L: fKm.cL[j], a: fKm.cA[j], b: fKm.cB[j],
      w: fKm.wcount[j],
      chroma: chromaFromAB(fKm.cA[j], fKm.cB[j]),
      source: 'kmeans'
    });
  }

  // -------- Hue-stratified clusters (guarantee hue-family coverage) -------
  // K-means converges by Lab distance, which on woven textiles causes cool
  // centroids to drift toward neutral when their Voronoi region also
  // contains dark grunge. Hue bins lock each populated hue family to its
  // chroma-weighted Lab mean, so navy/indigo/teal/etc. always surface if
  // they exist in meaningful quantity, independent of k-means dynamics.
  const hueBinClusters = buildHueBinClusters(labL, labA, labB, chroma, featureIdx, HUE_BIN_CHROMA_ALPHA);

  // Combined cluster pool. When a hue-bin entry overlaps a k-means entry
  // (Lab ΔE < merge threshold), keep the higher-chroma representative — the
  // whole point of stratifying by hue is to surface chromatic identity that
  // k-means dynamics suppress, so we don't want a lower-chroma k-means
  // version to absorb a higher-chroma hue-bin version.
  const clusters = kmClusters.slice();
  for (const hb of hueBinClusters) {
    let absorbedIdx = -1;
    for (let i = 0; i < clusters.length; i++) {
      const km = clusters[i];
      if (Math.sqrt(labDist2(hb.L, hb.a, hb.b, km.L, km.a, km.b)) < PERCEPTUAL_CLUSTER_MERGE_DE) {
        absorbedIdx = i;
        break;
      }
    }
    if (absorbedIdx === -1) {
      clusters.push(hb);
    } else if (hb.chroma > clusters[absorbedIdx].chroma + 1) {
      /** Replace with the higher-chroma representative; sum weighted counts. */
      const km = clusters[absorbedIdx];
      clusters[absorbedIdx] = {
        L: hb.L, a: hb.a, b: hb.b,
        w: km.w + hb.w,
        chroma: hb.chroma,
        source: 'hue-bin'
      };
    }
  }
  while (clusters.length > 2) {
    let bestI = -1, bestJ = -1, bestD = PERCEPTUAL_CLUSTER_MERGE_DE;
    for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        const d = Math.sqrt(labDist2(clusters[i].L, clusters[i].a, clusters[i].b, clusters[j].L, clusters[j].a, clusters[j].b));
        if (d < bestD) { bestD = d; bestI = i; bestJ = j; }
      }
    }
    if (bestI < 0) break;
    const A = clusters[bestI];
    const B = clusters[bestJ];
    const keep = A.chroma >= B.chroma ? A : B;
    clusters[bestI] = { L: keep.L, a: keep.a, b: keep.b, w: A.w + B.w, chroma: keep.chroma, source: keep.source };
    clusters.splice(bestJ, 1);
  }

  // -------- Linework: darkest meaningfully-populated cluster --------------
  // Linework is structural — darkness is the dominant criterion. Quadratic
  // darkness pulls hard toward the lowest L; small chroma bonus distinguishes
  // a deep-red from a near-black neutral of the same L; a tiny popularity
  // term avoids micro-clusters; hue-distance from background prevents
  // picking the same family as bg.
  const bgHue = hueDegFromAB(bgA, bgB);
  const linePool = clusters.filter((c) => c.w >= 20);
  const useLinePool = linePool.length ? linePool : clusters;
  let lineworkPick = null;
  let lineworkScore = Number.NEGATIVE_INFINITY;
  for (const c of useLinePool) {
    const cHue = hueDegFromAB(c.a, c.b);
    const hueGap = hueDist(cHue, bgHue);
    const darknessTerm = Math.pow(1 - c.L / 100, 2) * 6.0;
    const chromaTerm = Math.min(c.chroma, 60) * 0.015;
    const hueDiversityTerm = hueGap >= 25 ? 0.4 : -0.6;
    const popularityTerm = Math.log(Math.max(1, c.w)) * 0.1;
    const sc = darknessTerm + chromaTerm + hueDiversityTerm + popularityTerm;
    if (sc > lineworkScore) { lineworkScore = sc; lineworkPick = c; }
  }
  if (!lineworkPick) throw new Error('Perceptual: could not assign linework cluster.');
  const lineworkHex = labToRgbHex(lineworkPick.L, lineworkPick.a, lineworkPick.b);
  const lineworkHue = hueDegFromAB(lineworkPick.a, lineworkPick.b);

  // -------- Accent: hard hue gate, then score among hue-diverse candidates --
  // Hue diversity is the user's explicit primary goal — a soft penalty was
  // swamped by raw chroma score (a chroma-70 red beats every cool cluster
  // even after −8 penalty). Make the gate hard: drop candidates within 25°
  // of linework hue from primary consideration. Fall back through three
  // progressively looser pools so we never fail outright.
  function scoreAccentCandidate(c) {
    const cHue = hueDegFromAB(c.a, c.b);
    const dToBg = hueDist(cHue, bgHue);
    const labDEbg = Math.sqrt(labDist2(c.L, c.a, c.b, bgL, bgA, bgB));
    const labDEline = Math.sqrt(labDist2(c.L, c.a, c.b, lineworkPick.L, lineworkPick.a, lineworkPick.b));
    let sc =
      c.chroma * 1.4 +
      Math.log(Math.max(1, c.w)) * 0.6 +
      labDEbg * 0.05 +
      labDEline * 0.04;
    if (dToBg < PERCEPTUAL_MIN_HUE_SEPARATION) sc -= 4;
    if (labDEbg < PERCEPTUAL_MIN_PALETTE_DE || labDEline < PERCEPTUAL_MIN_PALETTE_DE) sc -= 5;
    if (c.chroma < PERCEPTUAL_ACCENT_MIN_CHROMA) sc -= 6;
    return sc;
  }
  const hueDiverseCandidates = clusters.filter((c) => {
    if (c === lineworkPick) return false;
    const cHue = hueDegFromAB(c.a, c.b);
    return hueDist(cHue, lineworkHue) >= PERCEPTUAL_MIN_HUE_SEPARATION;
  });
  let accentPool = hueDiverseCandidates;
  if (accentPool.length === 0) {
    /** Loosen to half the threshold so we still avoid near-duplicates. */
    const half = PERCEPTUAL_MIN_HUE_SEPARATION / 2;
    accentPool = clusters.filter((c) => {
      if (c === lineworkPick) return false;
      const cHue = hueDegFromAB(c.a, c.b);
      return hueDist(cHue, lineworkHue) >= half;
    });
  }
  if (accentPool.length === 0) {
    accentPool = clusters.filter((c) => c !== lineworkPick);
  }
  let accentPick = null;
  let accentScore = Number.NEGATIVE_INFINITY;
  for (const c of accentPool) {
    const sc = scoreAccentCandidate(c);
    if (sc > accentScore) { accentScore = sc; accentPick = c; }
  }
  if (!accentPick) {
    /** Last-resort fallback: highest-chroma cluster (ignores hue gate). */
    accentPick = clusters.filter((c) => c !== lineworkPick).reduce((a, b) => (b.chroma > a.chroma ? b : a));
  }
  const accentHex = labToRgbHex(accentPick.L, accentPick.a, accentPick.b);

  const palette = [
    { role: 'background', hex: backgroundHex },
    { role: 'linework', hex: lineworkHex },
    { role: 'accent', hex: accentHex }
  ];

  // -------- Extras with hue/ΔE diversity gate ----------------------------
  const chosen = [
    { L: bgL, a: bgA, b: bgB, hue: bgHue },
    { L: lineworkPick.L, a: lineworkPick.a, b: lineworkPick.b, hue: lineworkHue },
    { L: accentPick.L, a: accentPick.a, b: accentPick.b, hue: hueDegFromAB(accentPick.a, accentPick.b) }
  ];
  let extraNum = 1;
  const remaining = clusters
    .filter((c) => c !== lineworkPick && c !== accentPick)
    .sort((a, b) => (b.chroma * Math.log(Math.max(1, b.w))) - (a.chroma * Math.log(Math.max(1, a.w))));
  for (const c of remaining) {
    if (palette.length >= outCount) break;
    const cHue = hueDegFromAB(c.a, c.b);
    let ok = true;
    for (const ch of chosen) {
      if (hueDist(cHue, ch.hue) < PERCEPTUAL_MIN_HUE_SEPARATION) { ok = false; break; }
      const dE = Math.sqrt(labDist2(c.L, c.a, c.b, ch.L, ch.a, ch.b));
      if (dE < PERCEPTUAL_MIN_PALETTE_DE) { ok = false; break; }
    }
    if (!ok) continue;
    palette.push({ role: 'extra' + extraNum++, hex: labToRgbHex(c.L, c.a, c.b) });
    chosen.push({ L: c.L, a: c.a, b: c.b, hue: cHue });
  }

  const clusterDebug = clusters.map((c) => ({
    hex: labToRgbHex(c.L, c.a, c.b),
    weightedCount: Math.round(c.w),
    L: Math.round(c.L * 10) / 10,
    a: Math.round(c.a * 10) / 10,
    b: Math.round(c.b * 10) / 10,
    chroma: Math.round(c.chroma * 10) / 10,
    hue: Math.round(hueDegFromAB(c.a, c.b)),
    deltaEFromBackground: Math.round(Math.sqrt(labDist2(c.L, c.a, c.b, bgL, bgA, bgB)) * 100) / 100,
    source: c.source || 'kmeans'
  }));

  return {
    palette,
    cappedToMaxSlots: requestedColors > outCount,
    featurePixelCount: featureIdx.length,
    clusterDebug,
    minDeltaEUsed: minDeltaE,
    bgClusterRatio: Math.round(ratio * 100) / 100
  };
}

function printHelp() {
  console.log(`
Usage:
  node tools/mohawk/extract-palette.js <imagePathOrUrl> [--colors 5]

Options:
  --colors N        Swatch count (3–6). Default: 5.
  --min-delta-e D   Min ΔE (Lab CIE76) from background to treat pixel as feature (default ${DEFAULT_MIN_DELTA_E}, try 6–10).
  --legacy          Use legacy role-aware-two-pass extractor (RGB k-means, warm/cool hue bias).
                    Default is perceptual v3 (Lab + chroma-weighted, anti-mud, hue-diverse).
  --debug           Verbose log: version, disclaimer, feature stats, per-cluster table.

Output:
  ${path.relative(REPO_ROOT, DEFAULT_OUT)}
`);
}

/**
 * Programmatic entry for comparison tools / tests. Default CLI behavior unchanged.
 * @param {string} input image path or URL
 * @param {{ colors?: number, minDeltaE?: number, legacy?: boolean }} [options]
 */
async function extractMohawkPalette(input, options) {
  const opts = options || {};
  let k = parseInt(String(opts.colors != null ? opts.colors : 5), 10);
  if (Number.isNaN(k)) k = 5;
  k = clamp(k, 3, 6);

  let minDeltaE = parseFloat(String(opts.minDeltaE != null ? opts.minDeltaE : DEFAULT_MIN_DELTA_E));
  if (Number.isNaN(minDeltaE)) minDeltaE = DEFAULT_MIN_DELTA_E;
  minDeltaE = clamp(minDeltaE, 4, 14);

  const legacy = opts.legacy === true;
  const strategyId = legacy ? STRATEGY_ID_LEGACY : STRATEGY_ID_PERCEPTUAL;
  const extractorVersion = legacy ? EXTRACTOR_VERSION_LEGACY : EXTRACTOR_VERSION_PERCEPTUAL;

  const buf = await loadInputBuffer(input);
  const { data, info } = await sharp(buf)
    .resize({
      width: MAX_WIDTH,
      withoutEnlargement: true,
      fit: 'inside'
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const opaque = collectOpaquePixels(data);
  const nPix = opaque.length / 3;
  if (nPix < 100) {
    throw new Error(`Only ${nPix} opaque pixels after resize.`);
  }

  const sample = subsampleDeterministic(opaque, Math.min(SUBSAMPLE_TARGET, nPix));

  const r = legacy
    ? buildRolePalette(sample, k, minDeltaE)
    : buildPerceptualPalette(sample, k, { minDeltaE });

  const averageSaturation = averagePaletteSaturation(r.palette);
  const paletteCharacter =
    averageSaturation < NEUTRAL_AVG_SAT_THRESHOLD ? 'neutral-anchor' : 'color-driving';

  return {
    source: input,
    disclaimer: DISCLAIMER,
    averageSaturation,
    paletteCharacter,
    strategy: strategyId,
    extractorVersion,
    palette: r.palette,
    meta: {
      imageSize: { width: info.width, height: info.height },
      opaquePixels: nPix,
      sampledPixels: sample.length / 3,
      featurePixelCount: r.featurePixelCount,
      clusterDebug: r.clusterDebug,
      bgClusterRatio: r.bgClusterRatio != null ? r.bgClusterRatio : null,
      minDeltaEUsed: r.minDeltaEUsed,
      cappedToMaxSlots: r.cappedToMaxSlots
    }
  };
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printHelp();
    process.exit(argv.length === 0 ? 1 : 0);
  }

  const positional = argv.filter((a) => !a.startsWith('--'));
  const input = positional[0];
  if (!input) {
    console.error('Error: missing <imagePathOrUrl>');
    printHelp();
    process.exit(1);
  }

  let k = parseInt(argValue('--colors') || '5', 10);
  if (Number.isNaN(k)) k = 5;
  k = clamp(k, 3, 6);

  let minDeltaE = parseFloat(argValue('--min-delta-e') || String(DEFAULT_MIN_DELTA_E));
  if (Number.isNaN(minDeltaE)) minDeltaE = DEFAULT_MIN_DELTA_E;
  minDeltaE = clamp(minDeltaE, 4, 14);

  const debug = hasFlag('--debug');
  const legacy = hasFlag('--legacy');

  if (debug) {
    const extractorVersion = legacy ? EXTRACTOR_VERSION_LEGACY : EXTRACTOR_VERSION_PERCEPTUAL;
    const strategyId = legacy ? STRATEGY_ID_LEGACY : STRATEGY_ID_PERCEPTUAL;
    console.log(`Extractor version: ${extractorVersion}`);
    console.log(`Strategy: ${strategyId}`);
    console.log(`Script file: ${__filename}`);
    console.log('\n' + DISCLAIMER + '\n');
  }

  let outDoc;
  try {
    outDoc = await extractMohawkPalette(input, { colors: k, minDeltaE, legacy });
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  }

  if (outDoc.meta && outDoc.meta.cappedToMaxSlots) {
    console.warn(
      `Note: --colors ${k} capped to ${outDoc.palette.length} (pass-2 k ≤ 4 → max 5 swatches).`
    );
  }

  fs.mkdirSync(path.dirname(DEFAULT_OUT), { recursive: true });
  fs.writeFileSync(DEFAULT_OUT, JSON.stringify({
    source: outDoc.source,
    disclaimer: outDoc.disclaimer,
    averageSaturation: outDoc.averageSaturation,
    paletteCharacter: outDoc.paletteCharacter,
    strategy: outDoc.strategy,
    palette: outDoc.palette
  }, null, 2) + '\n', 'utf8');

  const bg = outDoc.palette.find((p) => p.role === 'background');
  const lw = outDoc.palette.find((p) => p.role === 'linework');
  const ac = outDoc.palette.find((p) => p.role === 'accent');
  const outRel = path.relative(REPO_ROOT, DEFAULT_OUT);
  const clusterDebug = outDoc.meta ? outDoc.meta.clusterDebug : [];
  const featurePixelCount = outDoc.meta ? outDoc.meta.featurePixelCount : 0;
  const bgClusterRatio = outDoc.meta ? outDoc.meta.bgClusterRatio : null;

  if (debug) {
    console.log(`Image size: ${outDoc.meta.imageSize.width}x${outDoc.meta.imageSize.height} (after resize)`);
    console.log(`Opaque px:  ${outDoc.meta.opaquePixels} (sampled to ${outDoc.meta.sampledPixels})`);
    console.log(
      `Pass 2:     ${featurePixelCount} feature pixels (ΔE > ${minDeltaE} or non-background label)`
    );
    console.log(`Written:    ${outRel}`);
    console.log('');
    if (legacy) {
      console.log('=== Pass 2: per-cluster debug (legacy) ===');
      console.log(
        'hex       | count | h/s/L                          | DeltaE_bg | accentScore | lineworkScore'
      );
      console.log(
        '----------+-------+--------------------------------+-----------+-------------+--------------'
      );
      for (const row of clusterDebug) {
        const as = row.accentScore == null ? '—' : String(row.accentScore);
        const hsl = `h=${row.hue} s=${row.saturation} L=${row.lightness}`;
        console.log(
          `${row.hex} | ${String(row.count).padStart(5)} | ${hsl.padEnd(30)} | ${String(row.deltaEFromBackground).padStart(9)} | ${String(as).padStart(11)} | ${row.lineworkScore}`
        );
      }
    } else {
      console.log('=== Perceptual cluster debug ===');
      if (bgClusterRatio != null) {
        console.log(`bg k=2 size ratio: ${bgClusterRatio} (< 1.5 → preferred lower-chroma)`);
      }
      console.log(
        'hex       | source  | w-count | L     a     b     | chroma | hue  | DeltaE_bg'
      );
      console.log(
        '----------+---------+---------+-------------------+--------+------+----------'
      );
      for (const row of clusterDebug) {
        const lab = `${String(row.L).padStart(5)} ${String(row.a).padStart(5)} ${String(row.b).padStart(5)}`;
        const src = (row.source || 'kmeans').padEnd(7);
        console.log(
          `${row.hex} | ${src} | ${String(row.weightedCount).padStart(7)} | ${lab} | ${String(row.chroma).padStart(6)} | ${String(row.hue).padStart(4)} | ${String(row.deltaEFromBackground).padStart(9)}`
        );
      }
    }
    console.log('=== end cluster table ===\n');
    console.log(`background: ${bg.hex}`);
    console.log(`linework:   ${lw.hex}`);
    console.log(`accent:     ${ac.hex}`);
    console.log(`average saturation: ${outDoc.averageSaturation}`);
    console.log(`palette character: ${outDoc.paletteCharacter}`);
    console.log('');
  } else {
    console.log(`background: ${bg.hex}`);
    console.log(`linework:   ${lw.hex}`);
    console.log(`accent:     ${ac.hex}`);
    console.log(`average saturation: ${outDoc.averageSaturation}`);
    console.log(`output: ${outRel}`);
  }
}

module.exports = {
  extractMohawkPalette,
  STRATEGY_ID_PERCEPTUAL,
  EXTRACTOR_VERSION_PERCEPTUAL
};

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  });
}
