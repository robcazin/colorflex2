#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Atmospheric Mohawk palette extraction — macro room-impression bias.
 * Outputs a stable ranked 10-color palette for variable layer-count patterns.
 * Separate from tools/mohawk/extract-palette.js. Not wired into the app.
 *
 * Usage:
 *   node tools/mohawk/extract-palette-atmospheric.js <imagePathOrUrl> [--colors 10]
 */

const fs = require('fs');
const path = require('path');
const {
  REPO_ROOT,
  DISCLAIMER,
  clamp,
  rgbToLab255,
  chromaFromAB,
  hueDegFromAB,
  hueDist,
  smoothstep,
  labDist2,
  labToRgbHex,
  averagePaletteSaturation,
  weightedLabKMeans,
  loadMacroRgbSample
} = require('./palette-shared');

const STRATEGY_ID = 'atmospheric-macro-v2';
const EXTRACTOR_VERSION = 'atmospheric-macro-v2';
const DEFAULT_OUT = path.join(REPO_ROOT, 'tools', 'mohawk', 'compare-out', 'last-atmospheric.json');
const TARGET_PALETTE_SIZE = 10;
const NEUTRAL_AVG_SAT_THRESHOLD = 0.15;
const DEFAULT_MIN_DELTA_E = 5;
const K_MACRO = 16;
const MERGE_DE = 7;
const MIN_CLUSTER_KEEP = 12;
const MIN_PALETTE_DE = 11;

/** Ranked slot names — index 0 is most broadly useful for thin patterns. */
const RANKED_SLOTS = [
  'field',
  'structure',
  'warm-accent',
  'cool-counterbalance',
  'highlight',
  'secondary-accent',
  'bridge',
  'shadow',
  'motif-alt',
  'specialty'
];

function argValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] || null;
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function atmosphericHueAffinity(hDeg, chroma) {
  const h = ((hDeg % 360) + 360) % 360;
  let score = 0;
  if (h >= 18 && h <= 72) score += 1.4;
  if (h >= 68 && h <= 115) score += 1.1;
  if (h >= 330 || h <= 22) score += 0.9;
  if (h >= 12 && h <= 38 && chroma < 38) score += 0.8;
  if (h >= 180 && h <= 270) score -= 0.7;
  if (chroma > 55) score -= 0.5;
  return score;
}

function isWarmHue(h) {
  return h >= 12 && h <= 78;
}

function isCoolHue(h) {
  return h >= 145 && h <= 265;
}

function isOliveHue(h) {
  return h >= 78 && h <= 145;
}

function buildAtmosphericWeights(labL, labA, labB) {
  const n = labL.length;
  const weight = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const C = chromaFromAB(labA[i], labB[i]);
    const lightGate = smoothstep(4, 14, labL[i]) * smoothstep(98, 88, labL[i]);
    const chromaDamp = Math.exp(-Math.max(0, C - 42) * 0.035);
    const mutedBoost = 1 + atmosphericHueAffinity(hueDegFromAB(labA[i], labB[i]), C) * 0.12;
    weight[i] = lightGate * chromaDamp * mutedBoost + 0.85;
  }
  return { weight };
}

function mergeNearbyClusters(clusters, mergeDe, minKeep) {
  const out = clusters.slice();
  while (out.length > minKeep) {
    let bestI = -1;
    let bestJ = -1;
    let bestD = mergeDe;
    for (let i = 0; i < out.length; i++) {
      for (let j = i + 1; j < out.length; j++) {
        const d = Math.sqrt(
          labDist2(out[i].L, out[i].a, out[i].b, out[j].L, out[j].a, out[j].b)
        );
        if (d < bestD) {
          bestD = d;
          bestI = i;
          bestJ = j;
        }
      }
    }
    if (bestI < 0) break;
    const A = out[bestI];
    const B = out[bestJ];
    const totalW = A.w + B.w;
    const mergedA = (A.a * A.w + B.a * B.w) / totalW;
    const mergedB = (A.b * A.w + B.b * B.w) / totalW;
    out[bestI] = {
      L: (A.L * A.w + B.L * B.w) / totalW,
      a: mergedA,
      b: mergedB,
      w: totalW,
      chroma: chromaFromAB(mergedA, mergedB),
      source: 'merged'
    };
    out.splice(bestJ, 1);
  }
  return out;
}

function clusterEntry(c, tag) {
  const hue = hueDegFromAB(c.a, c.b);
  return {
    L: c.L,
    a: c.a,
    b: c.b,
    w: c.w,
    chroma: c.chroma,
    hue,
    hex: labToRgbHex(c.L, c.a, c.b),
    source: c.source || tag || 'macro-kmeans',
    synthetic: tag === 'synthetic'
  };
}

function labDE(a, b) {
  return Math.sqrt(labDist2(a.L, a.a, a.b, b.L, b.a, b.b));
}

function minDistToChosen(entry, chosen) {
  if (!chosen.length) return 999;
  let minHue = 999;
  let minDe = 999;
  for (const c of chosen) {
    minHue = Math.min(minHue, hueDist(entry.hue, c.hue));
    minDe = Math.min(minDe, labDE(entry, c));
  }
  return minHue * 0.35 + minDe * 0.08;
}

function tooCloseToChosen(entry, chosen, minDe, minHue) {
  for (const c of chosen) {
    if (labDE(entry, c) < minDe) return true;
    if (hueDist(entry.hue, c.hue) < minHue && labDE(entry, c) < minDe + 6) return true;
  }
  return false;
}

function bestCandidate(pool, chosen, scoreFn, minDe, minHue) {
  let best = null;
  let bestSc = Number.NEGATIVE_INFINITY;
  for (const c of pool) {
    if (tooCloseToChosen(c, chosen, minDe, minHue)) continue;
    const sc = scoreFn(c);
    if (sc > bestSc) {
      bestSc = sc;
      best = c;
    }
  }
  return best;
}

function labBlend(a, b, t) {
  return clusterEntry(
    {
      L: a.L * (1 - t) + b.L * t,
      a: a.a * (1 - t) + b.a * t,
      b: a.b * (1 - t) + b.b * t,
      w: Math.min(a.w, b.w) * 0.5,
      chroma: chromaFromAB(
        a.a * (1 - t) + b.a * t,
        a.b * (1 - t) + b.b * t
      ),
      source: 'synthetic'
    },
    'synthetic'
  );
}

function shiftLab(entry, dL, da, db) {
  return clusterEntry(
    {
      L: clamp(entry.L + dL, 4, 96),
      a: entry.a + da,
      b: entry.b + db,
      w: entry.w * 0.35,
      chroma: chromaFromAB(entry.a + da, entry.b + db),
      source: 'synthetic'
    },
    'synthetic'
  );
}

function synthesizeFillers(chosen, need) {
  const out = [];
  if (chosen.length < 2 || need <= 0) return out;
  const field = chosen[0];
  const structure = chosen[1] || chosen[0];
  const warm = chosen[2] || chosen[0];
  const cool = chosen[3] || chosen[0];
  const highlight = chosen[4] || chosen[0];

  const recipes = [
    () => labBlend(field, warm, 0.45),
    () => labBlend(field, cool, 0.4),
    () => shiftLab(structure, -6, 0, 0),
    () => shiftLab(field, 8, 2, 4),
    () => labBlend(warm, cool, 0.5),
    () => shiftLab(highlight, -4, -1, -1),
    () => labBlend(structure, warm, 0.35),
    () => shiftLab(field, -10, 1, 2)
  ];

  for (let i = 0; i < recipes.length && out.length < need; i++) {
    const candidate = recipes[i]();
    if (tooCloseToChosen(candidate, chosen.concat(out), 8, 10)) continue;
    out.push(candidate);
  }
  return out;
}

function pickField(clusters) {
  return clusters
    .slice()
    .sort((a, b) => Math.log(b.w) * 2.2 - b.chroma * 0.06 - (Math.log(a.w) * 2.2 - a.chroma * 0.06))[0];
}

function pickStructure(pool, field) {
  return bestCandidate(
    pool,
    [field],
    (c) => {
      const darkness = Math.pow(1 - c.L / 100, 1.5) * 5.5;
      const lowChroma = Math.max(0, 1 - c.chroma / 50) * 1.4;
      const contrast = labDE(c, field) * 0.25;
      const area = Math.log(Math.max(1, c.w)) * 0.35;
      return darkness + lowChroma + contrast + area;
    },
    MIN_PALETTE_DE,
    12
  );
}

function pickWarmAccent(pool, chosen) {
  const warm = pool.filter((c) => isWarmHue(c.hue));
  const candidates = warm.length ? warm : pool;
  return bestCandidate(
    candidates,
    chosen,
    (c) =>
      Math.log(Math.max(1, c.w)) * 0.85 +
      Math.min(c.chroma, 44) * 0.35 +
      atmosphericHueAffinity(c.hue, c.chroma) +
      minDistToChosen(c, chosen) * 0.06,
    MIN_PALETTE_DE,
    16
  );
}

function pickCoolCounterbalance(pool, chosen) {
  const coolish = pool.filter((c) => isCoolHue(c.hue) || isOliveHue(c.hue));
  const candidates = coolish.length ? coolish : pool.filter((c) => !isWarmHue(c.hue));
  return bestCandidate(
    candidates.length ? candidates : pool,
    chosen,
    (c) => {
      let sc = Math.log(Math.max(1, c.w)) * 0.75 + minDistToChosen(c, chosen) * 0.08;
      if (isCoolHue(c.hue)) sc += 1.4;
      if (isOliveHue(c.hue)) sc += 1.2;
      sc += hueDist(c.hue, chosen[0].hue) * 0.025;
      return sc;
    },
    MIN_PALETTE_DE,
    18
  );
}

function pickHighlight(pool, chosen) {
  return bestCandidate(
    pool,
    chosen,
    (c) => {
      let sc = c.L * 0.14 + Math.max(0, 1 - c.chroma / 42) * 1.6;
      if (c.L < 48) sc -= 4;
      sc += minDistToChosen(c, chosen) * 0.05;
      return sc;
    },
    MIN_PALETTE_DE - 2,
    14
  );
}

function pickSecondaryAccent(pool, chosen) {
  return bestCandidate(
    pool,
    chosen,
    (c) =>
      Math.log(Math.max(1, c.w)) * 0.7 +
      Math.min(c.chroma, 40) * 0.25 +
      atmosphericHueAffinity(c.hue, c.chroma) * 0.6 +
      minDistToChosen(c, chosen) * 0.1,
    MIN_PALETTE_DE - 1,
    14
  );
}

function pickBridge(pool, chosen, field, warm) {
  const synthetic = labBlend(field, warm || field, 0.42);
  if (!tooCloseToChosen(synthetic, chosen, 8, 12)) return synthetic;
  return bestCandidate(
    pool,
    chosen,
    (c) =>
      Math.max(0, 1 - Math.abs(c.chroma - 22) / 30) * 2 +
      Math.log(Math.max(1, c.w)) * 0.4 +
      minDistToChosen(c, chosen) * 0.12,
    MIN_PALETTE_DE - 2,
    12
  );
}

function pickShadow(pool, chosen, structure, field) {
  const synth = shiftLab(structure || field, -8, 0.5, 0.5);
  if (!tooCloseToChosen(synth, chosen, 7, 10)) return synth;
  return bestCandidate(
    pool,
    chosen,
    (c) => (1 - c.L / 100) * 6 + Math.log(Math.max(1, c.w)) * 0.25 + minDistToChosen(c, chosen) * 0.08,
    MIN_PALETTE_DE - 3,
    10
  );
}

function pickMotifAlt(pool, chosen) {
  return bestCandidate(
    pool,
    chosen,
    (c) => minDistToChosen(c, chosen) * 0.18 + Math.log(Math.max(1, c.w)) * 0.55 + c.chroma * 0.12,
    MIN_PALETTE_DE - 2,
    20
  );
}

function pickSpecialty(pool, chosen) {
  return bestCandidate(
    pool,
    chosen,
    (c) => Math.log(Math.max(1, c.w)) * 0.45 + c.chroma * 0.08 + minDistToChosen(c, chosen) * 0.14,
    8,
    8
  );
}

function rankAtmosphericPalette(clusters, targetCount) {
  const entries = clusters.map((c) => clusterEntry(c));
  const chosen = [];
  const used = new Set();

  function take(pick) {
    if (!pick) return false;
    const key = pick.hex;
    if (used.has(key)) return false;
    used.add(key);
    chosen.push(pick);
    return true;
  }

  function poolExcludingChosen() {
    return entries.filter((e) => !used.has(e.hex));
  }

  take(pickField(entries));
  take(pickStructure(poolExcludingChosen(), chosen[0]));
  take(pickWarmAccent(poolExcludingChosen(), chosen));
  take(pickCoolCounterbalance(poolExcludingChosen(), chosen));
  take(pickHighlight(poolExcludingChosen(), chosen));

  take(pickSecondaryAccent(poolExcludingChosen(), chosen));
  take(pickBridge(poolExcludingChosen(), chosen, chosen[0], chosen[2]));
  take(pickShadow(poolExcludingChosen(), chosen, chosen[1], chosen[0]));
  take(pickMotifAlt(poolExcludingChosen(), chosen));
  take(pickSpecialty(poolExcludingChosen(), chosen));

  while (chosen.length < targetCount) {
    const fillers = synthesizeFillers(chosen, targetCount - chosen.length);
    if (!fillers.length) break;
    for (const f of fillers) {
      if (chosen.length >= targetCount) break;
      take(f);
    }
    if (fillers.length === 0) break;
  }

  while (chosen.length < targetCount) {
    const rest = poolExcludingChosen().sort(
      (a, b) =>
        minDistToChosen(b, chosen) * 0.15 +
        Math.log(b.w) -
        (minDistToChosen(a, chosen) * 0.15 + Math.log(a.w))
    );
    if (!rest.length) break;
    if (!take(rest[0])) break;
  }

  const palette = [];
  for (let i = 0; i < targetCount; i++) {
    const entry = chosen[i] || chosen[chosen.length - 1];
    palette.push({
      index: i,
      slot: RANKED_SLOTS[i] || 'specialty',
      hex: entry.hex,
      synthetic: !!entry.synthetic
    });
  }

  return palette;
}

function buildAtmosphericPalette(rgbSample, requestedColors, opts) {
  const targetCount = clamp(
    requestedColors != null ? requestedColors : TARGET_PALETTE_SIZE,
    TARGET_PALETTE_SIZE,
    TARGET_PALETTE_SIZE
  );
  const minDeltaE = (opts && opts.minDeltaE) || DEFAULT_MIN_DELTA_E;
  const n = rgbSample.length / 3;
  if (n < 40) throw new Error('Too few pixels for atmospheric extraction.');

  const labL = new Float32Array(n);
  const labA = new Float32Array(n);
  const labB = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const p = i * 3;
    const lab = rgbToLab255(rgbSample[p], rgbSample[p + 1], rgbSample[p + 2]);
    labL[i] = lab.L;
    labA[i] = lab.a;
    labB[i] = lab.b;
  }

  const { weight } = buildAtmosphericWeights(labL, labA, labB);
  const allIdx = new Array(n);
  for (let i = 0; i < n; i++) allIdx[i] = i;

  const uniformW = new Float32Array(n);
  for (let i = 0; i < n; i++) uniformW[i] = 1;
  const bgKm = weightedLabKMeans(labL, labA, labB, uniformW, allIdx, 2, 20);
  let bgIdx = (bgKm.wcount[1] || 0) > (bgKm.wcount[0] || 0) ? 1 : 0;
  const w0 = bgKm.wcount[0] || 0;
  const w1 = bgKm.wcount[1] || 0;
  const ratio = Math.max(w0, w1) / Math.max(1, Math.min(w0, w1));
  if (ratio < 1.45) {
    const ch0 = chromaFromAB(bgKm.cA[0], bgKm.cB[0]);
    const ch1 = chromaFromAB(bgKm.cA[1], bgKm.cB[1]);
    bgIdx = ch0 < ch1 ? 0 : 1;
  }

  const macroKm = weightedLabKMeans(labL, labA, labB, weight, allIdx, K_MACRO, 28);
  let clusters = [];
  for (let j = 0; j < macroKm.cL.length; j++) {
    if (!(macroKm.wcount[j] > 0)) continue;
    clusters.push({
      L: macroKm.cL[j],
      a: macroKm.cA[j],
      b: macroKm.cB[j],
      w: macroKm.wcount[j],
      chroma: chromaFromAB(macroKm.cA[j], macroKm.cB[j]),
      source: 'macro-kmeans'
    });
  }
  clusters = mergeNearbyClusters(clusters, MERGE_DE, MIN_CLUSTER_KEEP);

  const palette = rankAtmosphericPalette(clusters, targetCount);
  const colors = palette.map((p) => p.hex);

  const clusterDebug = clusters.map((c) => ({
    hex: labToRgbHex(c.L, c.a, c.b),
    weightedCount: Math.round(c.w),
    L: Math.round(c.L * 10) / 10,
    a: Math.round(c.a * 10) / 10,
    b: Math.round(c.b * 10) / 10,
    chroma: Math.round(c.chroma * 10) / 10,
    hue: Math.round(hueDegFromAB(c.a, c.b)),
    atmosphericAffinity:
      Math.round(atmosphericHueAffinity(hueDegFromAB(c.a, c.b), c.chroma) * 100) / 100,
    source: c.source || 'macro-kmeans'
  }));

  return {
    palette,
    colors,
    rankedSlots: RANKED_SLOTS.slice(0, targetCount),
    targetCount,
    featurePixelCount: n,
    clusterDebug,
    minDeltaEUsed: minDeltaE,
    bgClusterRatio: Math.round(ratio * 100) / 100,
    macroClusterCount: clusters.length
  };
}

async function extractMohawkPaletteAtmospheric(input, options) {
  const opts = options || {};
  let k = parseInt(String(opts.colors != null ? opts.colors : TARGET_PALETTE_SIZE), 10);
  if (Number.isNaN(k)) k = TARGET_PALETTE_SIZE;
  k = TARGET_PALETTE_SIZE;

  let minDeltaE = parseFloat(String(opts.minDeltaE != null ? opts.minDeltaE : DEFAULT_MIN_DELTA_E));
  if (Number.isNaN(minDeltaE)) minDeltaE = DEFAULT_MIN_DELTA_E;
  minDeltaE = clamp(minDeltaE, 3, 12);

  const { sample, info, nPix } = await loadMacroRgbSample(input, {
    blurSigma: opts.blurSigma != null ? opts.blurSigma : 2.5,
    maxWidth: opts.maxWidth != null ? opts.maxWidth : 140,
    subsampleTarget: opts.subsampleTarget != null ? opts.subsampleTarget : 9000
  });

  const r = buildAtmosphericPalette(sample, k, { minDeltaE });
  const averageSaturation = averagePaletteSaturation(r.palette);
  const paletteCharacter =
    averageSaturation < NEUTRAL_AVG_SAT_THRESHOLD ? 'neutral-anchor' : 'color-driving';

  return {
    source: input,
    disclaimer: DISCLAIMER,
    averageSaturation,
    paletteCharacter,
    strategy: STRATEGY_ID,
    extractorVersion: EXTRACTOR_VERSION,
    targetCount: r.targetCount,
    rankedSlots: r.rankedSlots,
    colors: r.colors,
    palette: r.palette,
    meta: {
      imageSize: { width: info.width, height: info.height },
      opaquePixels: nPix,
      sampledPixels: sample.length / 3,
      featurePixelCount: r.featurePixelCount,
      macroClusterCount: r.macroClusterCount,
      bgClusterRatio: r.bgClusterRatio,
      minDeltaEUsed: r.minDeltaEUsed,
      clusterDebug: r.clusterDebug
    }
  };
}

function printHelp() {
  console.log(`
Usage:
  node tools/mohawk/extract-palette-atmospheric.js <imagePathOrUrl> [--colors 10]

Options:
  --colors N        Ranked swatch count (fixed at ${TARGET_PALETTE_SIZE} for wallpaper layers).
  --min-delta-e D   Background separation hint (default ${DEFAULT_MIN_DELTA_E}).
  --out PATH        JSON output path (default: tools/mohawk/compare-out/last-atmospheric.json)
  --debug           Verbose cluster table.

Outputs ${TARGET_PALETTE_SIZE} ordered colors (index 0 = field … index 9 = specialty).
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

  const outPath = argValue('--out') || DEFAULT_OUT;
  const debug = hasFlag('--debug');
  let minDeltaE = parseFloat(argValue('--min-delta-e') || String(DEFAULT_MIN_DELTA_E));
  if (Number.isNaN(minDeltaE)) minDeltaE = DEFAULT_MIN_DELTA_E;

  if (debug) {
    console.log(`Extractor version: ${EXTRACTOR_VERSION}`);
    console.log(`Strategy: ${STRATEGY_ID}`);
    console.log(`Script file: ${__filename}`);
    console.log('\n' + DISCLAIMER + '\n');
  }

  const outDoc = await extractMohawkPaletteAtmospheric(input, { minDeltaE });
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(outDoc, null, 2) + '\n', 'utf8');

  if (debug && outDoc.meta && outDoc.meta.clusterDebug) {
    console.log(`Image size: ${outDoc.meta.imageSize.width}x${outDoc.meta.imageSize.height}`);
    console.log(`Macro clusters: ${outDoc.meta.macroClusterCount}`);
    console.log(`Written:    ${path.relative(REPO_ROOT, outPath)}`);
    console.log('\n=== Macro cluster debug ===');
    for (const row of outDoc.meta.clusterDebug) {
      console.log(
        `${row.hex} w=${row.weightedCount} L=${row.L} C=${row.chroma} hue=${row.hue} aff=${row.atmosphericAffinity}`
      );
    }
    console.log('');
  }

  console.log(`Ranked palette (${outDoc.palette.length} colors):`);
  for (const p of outDoc.palette) {
    const syn = p.synthetic ? ' (synthetic)' : '';
    console.log(`  [${p.index}] ${p.slot.padEnd(20)} ${p.hex}${syn}`);
  }
  console.log(`average saturation: ${outDoc.averageSaturation}`);
  console.log(`output: ${path.relative(REPO_ROOT, outPath)}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  });
}

module.exports = {
  extractMohawkPaletteAtmospheric,
  STRATEGY_ID,
  EXTRACTOR_VERSION,
  TARGET_PALETTE_SIZE,
  RANKED_SLOTS
};
