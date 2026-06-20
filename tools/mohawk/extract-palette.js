#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Extract 3–6 representative colors from a product image (local path or URL)
 * for Palette Engine / Mohawk-style testing only.
 *
 * Usage:
 *   node tools/mohawk/extract-palette.js <imagePathOrUrl> --colors 5
 *
 * Output: writes src/demo/mohawkPaletteTest.json with palette + meta for low-sat (neutral) carpets.
 *
 * DISCLAIMER: Image-derived test palette only. Not manufacturing color accuracy.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const sharp = require('sharp');

const REPO_ROOT = path.resolve(__dirname, '../..');
const DEFAULT_OUT = path.join(REPO_ROOT, 'src', 'demo', 'mohawkPaletteTest.json');
const MAX_WIDTH = 300;
const KMEANS_ITERS = 20;
const SUBSAMPLE_TARGET = 12000;
const DEFAULT_SAT_THRESHOLD = 0.15;
/** Minimum saturation lift when synthesizing a base from a muddy dominant */
const SYNTHETIC_SAT_TARGET = 0.22;

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

/** HSL: h [0,360), s,l [0,1] — aligned with colorPrimitives rgbToHsl */
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

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 1);
  l = clamp(l, 0, 1);
  if (s < 1e-8) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hk = h / 360;
  const t = (tt0) => {
    let tt = tt0;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const r = Math.round(255 * t(hk + 1 / 3));
  const g = Math.round(255 * t(hk));
  const b = Math.round(255 * t(hk - 1 / 3));
  return { r, g, b };
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
    const u = new URL(urlString);
    const lib = u.protocol === 'https:' ? https : http;
    const req = lib.get(
      urlString,
      {
        headers: { 'User-Agent': 'ColorFlex-mohawk-palette-extract/1.0' }
      },
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
  if (isRemote(s)) {
    return downloadUrl(s);
  }
  const p = path.isAbsolute(s) ? s : path.resolve(REPO_ROOT, s);
  if (!fs.existsSync(p)) {
    throw new Error(`File not found: ${p}`);
  }
  return fs.readFileSync(p);
}

function filterPixels(buf) {
  const out = [];
  for (let i = 0; i < buf.length; i += 4) {
    const a = buf[i + 3];
    if (a === 0) continue;
    const r = buf[i];
    const g = buf[i + 1];
    const b = buf[i + 2];
    const { s, l } = rgbToHsl(r, g, b);
    if (l > 0.92 || l < 0.08) continue;
    if (s < 0.08) continue;
    out.push(r, g, b);
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

function roleForIndex(i) {
  if (i === 0) return 'dominant';
  if (i === 1) return 'secondary';
  if (i === 2) return 'accent';
  return 'extra' + (i - 2);
}

/**
 * @param {{ role: string, hex: string }[]} palette
 * @param {number} satThreshold
 * @param {string | null} userBaseHex
 */
function buildNeutralGuardMeta(palette, satThreshold, userBaseHex) {
  const enriched = palette.map((entry) => {
    const { r, g, b } = hexToRgb(entry.hex);
    const { h, s, l } = rgbToHsl(r, g, b);
    return { ...entry, h, s, l };
  });

  const avgSaturation =
    enriched.reduce((acc, e) => acc + e.s, 0) / Math.max(1, enriched.length);
  const neutralAnchorOnly = avgSaturation < satThreshold;

  const dominant = enriched[0];
  let maxS = -1;
  let maxEntry = enriched[0];
  for (const e of enriched) {
    if (e.s > maxS) {
      maxS = e.s;
      maxEntry = e;
    }
  }

  let recommendedBaseHex = null;
  let recommendedBaseSource = null;

  if (userBaseHex) {
    recommendedBaseHex = userBaseHex.startsWith('#') ? userBaseHex : '#' + userBaseHex;
    hexToRgb(recommendedBaseHex);
    recommendedBaseSource = 'user_supplied';
  } else if (neutralAnchorOnly) {
    if (maxS >= satThreshold) {
      recommendedBaseHex = maxEntry.hex;
      recommendedBaseSource = 'palette_max_saturation';
    } else if (maxS >= avgSaturation + 0.04) {
      recommendedBaseHex = maxEntry.hex;
      recommendedBaseSource = 'palette_max_saturation_relaxed';
    } else {
      const targetS = Math.max(SYNTHETIC_SAT_TARGET, satThreshold + 0.07);
      const { r, g, b } = hslToRgb(dominant.h, targetS, dominant.l);
      recommendedBaseHex = rgbToHex(r, g, b);
      recommendedBaseSource = 'synthetic_sat_boost';
    }
  } else {
    recommendedBaseHex = dominant.hex;
    recommendedBaseSource = 'dominant';
  }

  return {
    avgSaturation: Math.round(avgSaturation * 1000) / 1000,
    satThreshold,
    neutralAnchorOnly,
    recommendedBaseHex,
    recommendedBaseSource,
    preferContrast: neutralAnchorOnly,
    useAsMainBaseGenerator: !neutralAnchorOnly,
    dominantHex: dominant.hex,
    maxSwatchSaturation: Math.round(maxS * 1000) / 1000
  };
}

function promptLine(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (ans) => {
      rl.close();
      resolve(String(ans).trim());
    });
  });
}

function printHelp() {
  console.log(`
Usage:
  node tools/mohawk/extract-palette.js <imagePathOrUrl> [--colors 5]

Options:
  --colors N          Number of colors (3–6). Default: 5
  --sat-threshold S   Avg saturation below this marks a neutral / muddy carpet (0–1). Default: ${DEFAULT_SAT_THRESHOLD}
  --base #RRGGBB      Your own base color (skips auto pick when set)
  --prompt            Ask for a base hex interactively (overrides auto after suggestion)

Output:
  ${path.relative(REPO_ROOT, DEFAULT_OUT)}

DISCLAIMER: Image-derived test palette only. Not manufacturing color accuracy.
`);
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

  let satThreshold = parseFloat(argValue('--sat-threshold') || String(DEFAULT_SAT_THRESHOLD));
  if (Number.isNaN(satThreshold)) satThreshold = DEFAULT_SAT_THRESHOLD;
  satThreshold = clamp(satThreshold, 0.05, 0.5);

  let userBaseHex = argValue('--base');
  if (userBaseHex && !userBaseHex.startsWith('#')) userBaseHex = '#' + userBaseHex;

  console.log(
    '\nDISCLAIMER: Image-derived test palette only — not manufacturing color accuracy.\n'
  );

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

  const filtered = filterPixels(data);
  const nPix = filtered.length / 3;
  if (nPix < k) {
    console.error(
      `Error: only ${nPix} usable pixels after filtering (need at least ${k}). Try a different image.`
    );
    process.exit(1);
  }

  const sample = subsampleDeterministic(filtered, Math.min(SUBSAMPLE_TARGET, nPix));
  const { centroids, counts } = kMeans(sample, k);

  const order = counts
    .map((c, i) => ({ c, i }))
    .filter((x) => x.c > 0)
    .sort((a, b) => b.c - a.c)
    .map((x) => x.i);

  if (order.length < k) {
    console.error(
      `Error: only ${order.length} non-empty clusters (need ${k}). Try a different image or lower --colors.`
    );
    process.exit(1);
  }

  const palette = order.slice(0, k).map((ci, rank) => {
    const o = ci * 3;
    const hex = rgbToHex(centroids[o], centroids[o + 1], centroids[o + 2]);
    return { role: roleForIndex(rank), hex };
  });

  let meta = buildNeutralGuardMeta(palette, satThreshold, userBaseHex);

  if (hasFlag('--prompt') && process.stdin.isTTY) {
    const hint = meta.recommendedBaseHex ? ` [suggested: ${meta.recommendedBaseHex}]` : '';
    const ans = await promptLine(`Base color hex for harmonies${hint} (Enter = keep suggested): `);
    if (ans) {
      try {
        const normalized = ans.startsWith('#') ? ans : '#' + ans;
        hexToRgb(normalized);
        meta = buildNeutralGuardMeta(palette, satThreshold, normalized);
      } catch (e) {
        console.error('Invalid hex, keeping previous recommendation.');
      }
    }
  }

  const outDoc = {
    palette,
    meta,
    generationHints: {
      useAsMainBaseGenerator: meta.useAsMainBaseGenerator,
      preferContrast: meta.preferContrast,
      recommendedBaseHex: meta.recommendedBaseHex,
      neutralAnchorOnly: meta.neutralAnchorOnly
    }
  };

  fs.mkdirSync(path.dirname(DEFAULT_OUT), { recursive: true });
  fs.writeFileSync(DEFAULT_OUT, JSON.stringify(outDoc, null, 2) + '\n', 'utf8');

  console.log(`Source:     ${input}`);
  console.log(`Image size: ${info.width}x${info.height} (after resize pipeline)`);
  console.log(`Filtered:   ${nPix} pixels (post L/S/alpha rules)`);
  console.log(`Clusters:   ${k}`);
  console.log(`Avg sat:    ${meta.avgSaturation} (threshold ${meta.satThreshold})`);
  console.log(`Written:    ${path.relative(REPO_ROOT, DEFAULT_OUT)}`);
  console.log('Palette:    ' + palette.map((p) => `${p.role}=${p.hex}`).join('  '));

  if (meta.neutralAnchorOnly) {
    console.log('');
    console.log(
      'Neutral / low-saturation carpet: treat extracted palette as ANCHOR ONLY — not the main base for rich color generation.'
    );
    console.log(`Suggested base for harmonies: ${meta.recommendedBaseHex} (${meta.recommendedBaseSource})`);
    console.log('Hint: preferContrast=true in generationHints — bias harmonies toward contrast, not monochrome mud.');
  } else {
    console.log(`Base for generation: ${meta.recommendedBaseHex} (${meta.recommendedBaseSource})`);
  }
  console.log('');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
