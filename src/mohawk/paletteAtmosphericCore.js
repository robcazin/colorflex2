/**
 * Ranked 10-color atmospheric palette core (browser + runtime).
 * Keep in sync with tools/mohawk/extract-palette-atmospheric.js.
 */
import {
  clamp,
  rgbToLab255,
  chromaFromAB,
  hueDegFromAB,
  hueDist,
  smoothstep,
  labDist2,
  labToRgbHex,
  weightedLabKMeans
} from './paletteLab.js';

export const TARGET_PALETTE_SIZE = 10;
export const EXTRACTOR_VERSION = 'atmospheric-macro-v2';
export const DEFAULT_MIN_DELTA_E = 5;
const K_MACRO = 16;
const MERGE_DE = 7;
const MIN_CLUSTER_KEEP = 12;
const MIN_PALETTE_DE = 11;

export const RANKED_SLOTS = [
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
    .sort((a, b) => {
      const score = (e) =>
        Math.log(Math.max(1, e.w)) * 2.4 - e.chroma * 0.1 - Math.abs(e.L - 36) * 0.03;
      return score(b) - score(a);
    })[0];
}

function pickStructure(pool, field) {
  return bestCandidate(
    pool,
    [field],
    (c) => {
      const darkness = Math.pow(1 - c.L / 100, 2.4) * 9;
      const lowChroma = Math.max(0, 1 - c.chroma / 22) * 4;
      const contrast = labDE(c, field) * 0.12;
      const area = Math.log(Math.max(1, c.w)) * 0.25;
      const vividPenalty = c.chroma > 22 ? (c.chroma - 22) * 0.22 : 0;
      const lightPenalty = c.L > 42 ? (c.L - 42) * 0.12 : 0;
      return darkness + lowChroma + contrast + area - vividPenalty - lightPenalty;
    },
    MIN_PALETTE_DE,
    10
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
  const base = structure || field;
  const darkPool = pool.filter((c) => c.L <= (base.L || 40) + 6 && c.chroma < 28);
  const usePool = darkPool.length ? darkPool : pool;
  const picked = bestCandidate(
    usePool,
    chosen,
    (c) =>
      (1 - c.L / 100) * 7 +
      Math.max(0, 1 - c.chroma / 24) * 1.5 +
      Math.log(Math.max(1, c.w)) * 0.2 +
      minDistToChosen(c, chosen) * 0.06,
    MIN_PALETTE_DE - 4,
    8
  );
  if (picked) return picked;
  const synth = shiftLab(base, -10, 0.5, 0.5);
  if (!tooCloseToChosen(synth, chosen, 7, 8)) return synth;
  return synth;
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
    let added = 0;
    for (const f of fillers) {
      if (chosen.length >= targetCount) break;
      if (take(f)) added++;
    }
    if (added === 0) break;
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

export { buildAtmosphericPalette };
