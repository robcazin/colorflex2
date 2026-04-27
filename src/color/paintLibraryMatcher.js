/**
 * paintLibraryMatcher.js — deterministic paint-library conforming.
 * Uses CIE76 ΔE in LAB (perceptual) for ranking; supports coordinated multi-slot
 * assignment to reduce duplicate swatches; RGB distance kept as legacy export.
 */

import { deltaE76Hex } from './colorDeltaE.js';

/**
 * @param {string} hex
 * @returns {{ r: number, g: number, b: number } | null}
 */
function hexToRgb(hex) {
  const h = String(hex || '')
    .replace(/^#/, '')
    .trim()
    .toLowerCase();
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    if ([r, g, b].some((x) => Number.isNaN(x))) return null;
    return { r, g, b };
  }
  if (h.length !== 6) return null;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some((x) => Number.isNaN(x))) return null;
  return { r, g, b };
}

/**
 * @param {string} hex
 * @returns {string | null} normalized #rrggbb or null
 */
export function normalizeMatchHex(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const x = (n) => n.toString(16).padStart(2, '0');
  return '#' + x(rgb.r) + x(rgb.g) + x(rgb.b);
}

/**
 * Euclidean distance in RGB (0–~441). Legacy / diagnostics only.
 * @param {string} hexA
 * @param {string} hexB
 */
export function rgbColorDistance(hexA, hexB) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  if (!a || !b) return Number.POSITIVE_INFINITY;
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/** @typedef {{ name: string, code?: string, hex: string }} PaintLibraryEntry */

/** @typedef {{ maxDeltaE?: number, maxRgbDistance?: number, avoidHexes?: Set<string> }} MatchOptions */

const PALETTE_SLOT_ORDER = ['primary', 'secondary', 'accent', 'neutral', 'background'];

/**
 * @param {MatchOptions | undefined} options
 * @returns {number | null}
 */
function resolvedMaxDeltaE(options) {
  if (!options || typeof options !== 'object') return null;
  if (typeof options.maxDeltaE === 'number' && Number.isFinite(options.maxDeltaE)) {
    return options.maxDeltaE;
  }
  // Legacy: RGB Euclidean caps → rough ΔE scale (tunable)
  if (typeof options.maxRgbDistance === 'number' && Number.isFinite(options.maxRgbDistance)) {
    return options.maxRgbDistance / 3.35;
  }
  return null;
}

/**
 * @param {string} inputHex normalized #rrggbb
 * @param {PaintLibraryEntry[]} lib
 * @returns {{ entry: PaintLibraryEntry, candHex: string, deltaE: number }[]}
 */
function rankLibraryByDeltaE(inputHex, lib) {
  const out = [];
  for (const entry of lib) {
    if (!entry || typeof entry.hex !== 'string') continue;
    const candHex = normalizeMatchHex(entry.hex);
    if (!candHex) continue;
    const deltaE = deltaE76Hex(inputHex, candHex);
    out.push({ entry, candHex, deltaE });
  }
  out.sort((a, b) => a.deltaE - b.deltaE);
  return out;
}

/**
 * @param {{ entry: PaintLibraryEntry, candHex: string, deltaE: number }[]} ranked
 * @param {Set<string>} avoidHexes
 */
function pickCandidate(ranked, avoidHexes) {
  const avoid = avoidHexes instanceof Set ? avoidHexes : new Set();
  for (const r of ranked) {
    if (!avoid.has(r.candHex)) {
      return { picked: r, hadToReuse: false };
    }
  }
  return { picked: ranked[0], hadToReuse: ranked.length > 0 };
}

/**
 * @param {string} hexColor
 * @param {PaintLibraryEntry[] | null | undefined} paintLibrary
 * @param {MatchOptions | undefined} [options]
 * @returns {{
 *   inputHex: string,
 *   matchedName: string | null,
 *   matchedHex: string,
 *   distance: number,
 *   matchedCode?: string | null,
 *   usedFallback?: boolean,
 *   warning?: string,
 *   duplicateSlot?: boolean
 * }}
 */
export function matchToPaintLibrary(hexColor, paintLibrary, options) {
  const inputHex = normalizeMatchHex(hexColor);
  if (!inputHex) {
    return {
      inputHex: String(hexColor || '').trim() || '#000000',
      matchedName: null,
      matchedHex: '#000000',
      distance: 0,
      matchedCode: null,
      usedFallback: true,
      warning: 'Invalid hex; could not match to library.'
    };
  }

  const lib = Array.isArray(paintLibrary) ? paintLibrary : [];
  if (lib.length === 0) {
    return {
      inputHex,
      matchedName: null,
      matchedHex: inputHex,
      distance: 0,
      matchedCode: null,
      usedFallback: true,
      warning: 'No paint library entries; using ideal color.'
    };
  }

  const ranked = rankLibraryByDeltaE(inputHex, lib);
  if (!ranked.length) {
    return {
      inputHex,
      matchedName: null,
      matchedHex: inputHex,
      distance: 0,
      matchedCode: null,
      usedFallback: true,
      warning: 'No valid library swatches; using ideal color.'
    };
  }

  const avoidHexes = options && options.avoidHexes instanceof Set ? options.avoidHexes : new Set();
  const { picked, hadToReuse } = pickCandidate(ranked, avoidHexes);
  const best = picked.entry;
  const bestDE = picked.deltaE;

  const matchedName = typeof best.name === 'string' ? best.name : null;
  const matchedCode = typeof best.code === 'string' ? best.code : null;
  const maxDE = resolvedMaxDeltaE(options);

  const warnings = [];
  if (hadToReuse) {
    warnings.push('Another slot already used the nearest swatch; reused best match for this role.');
  }

  if (maxDE != null && bestDE > maxDE) {
    warnings.push(
      'Nearest library color exceeds fidelity cap for this role; kept ideal hex. (Try a larger catalog or relax caps.)'
    );
    return {
      inputHex,
      matchedName,
      matchedCode,
      matchedHex: inputHex,
      distance: Math.round(bestDE * 100) / 100,
      usedFallback: true,
      warning: warnings.join(' ')
    };
  }

  const matchedHex = picked.candHex;
  if (warnings.length) {
    return {
      inputHex,
      matchedName,
      matchedHex,
      distance: Math.round(bestDE * 100) / 100,
      matchedCode,
      usedFallback: false,
      duplicateSlot: hadToReuse,
      warning: warnings.join(' ')
    };
  }

  return {
    inputHex,
    matchedName,
    matchedHex,
    distance: Math.round(bestDE * 100) / 100,
    matchedCode,
    usedFallback: false
  };
}

/**
 * Conform palette string-hex fields to the library. Resolves slots in a fixed order
 * so primary → background each avoid reusing the same library hex when another
 * nearly-as-good option exists.
 *
 * @param {Record<string, unknown>} palette
 * @param {PaintLibraryEntry[]} paintLibrary
 * @param {Record<string, MatchOptions>} [optionsByKey]
 * @returns {Record<string, unknown> & { _paintLibraryMeta?: Record<string, ReturnType<typeof matchToPaintLibrary>> }}
 */
export function conformPaletteToPaintLibrary(palette, paintLibrary, optionsByKey) {
  if (!palette || typeof palette !== 'object') {
    return {};
  }

  const hexKey = /^#?[0-9a-f]{3}([0-9a-f]{3})?$/i;
  const out = { ...palette };
  /** @type {Record<string, ReturnType<typeof matchToPaintLibrary>>} */
  const meta = {};
  const byKey = optionsByKey && typeof optionsByKey === 'object' ? optionsByKey : {};
  const usedLibraryHexes = new Set();

  const runKey = (key) => {
    if (key.startsWith('_')) return;
    const val = palette[key];
    if (typeof val !== 'string' || !hexKey.test(val.trim())) return;
    const baseOpts = byKey[key] && typeof byKey[key] === 'object' ? byKey[key] : {};
    const m = matchToPaintLibrary(val, paintLibrary, {
      ...baseOpts,
      avoidHexes: usedLibraryHexes
    });
    out[key] = m.matchedHex;
    meta[key] = m;
    if (!m.usedFallback) {
      const h = normalizeMatchHex(m.matchedHex);
      if (h) usedLibraryHexes.add(h);
    }
  };

  for (const key of PALETTE_SLOT_ORDER) {
    if (!Object.prototype.hasOwnProperty.call(palette, key)) continue;
    runKey(key);
  }

  for (const key of Object.keys(palette)) {
    if (PALETTE_SLOT_ORDER.includes(key)) continue;
    runKey(key);
  }

  out._paintLibraryMeta = meta;
  return out;
}

export { PALETTE_SLOT_ORDER };
