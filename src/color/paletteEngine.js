/**
 * paletteEngine.js — minimal deterministic palette from one base hex.
 *
 * Phase 1: generate + lock. Palette generation is independent; a future
 * paintLibraryMatcher (local JSON, no APIs) can conform each hex afterward
 * without changing this module’s contract.
 */

let _lockedPalette = null;

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

/** @param {string} hex */
export function hexToRgb(hex) {
  const h = String(hex).replace(/^#/, '').trim();
  if (h.length === 3) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16)
    };
  }
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) {
    throw new Error('paletteEngine: expected #RRGGBB or RRGGBB, got ' + hex);
  }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16)
  };
}

/** @returns {string} #RRGGBB */
export function rgbToHex(r, g, b) {
  const x = (n) =>
    clamp(Math.round(n), 0, 255)
      .toString(16)
      .padStart(2, '0');
  return '#' + x(r) + x(g) + x(b);
}

/**
 * HSL in [0,360), [0,1], [0,1]
 * @param {number} r
 * @param {number} g
 * @param {number} b
 */
export function rgbToHsl(r, g, b) {
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

/**
 * @param {number} h 0..360
 * @param {number} s 0..1
 * @param {number} l 0..1
 */
export function hslToRgb(h, s, l) {
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
  const t = (t) => {
    let tt = t;
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

function hexToHsl(hex) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

function hslToHex(h, s, l) {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

/**
 * Deterministic 5-color palette from a single base hex.
 * Structure leaves room for a later pass: each slot can be replaced by
 * matchToPaintLibrary(hex, library) without regenerating the whole palette.
 *
 * @param {string} baseHex
 * @returns {{ primary: string, secondary: string, accent: string, neutral: string, background: string }}
 */
export function generatePalette(baseHex) {
  const { h, s, l } = hexToHsl(baseHex);
  const { r, g, b } = hexToRgb(baseHex);
  const primary = rgbToHex(r, g, b);

  // Secondary: +18° hue, slightly less saturation, modestly lighter
  const secondary = hslToHex(h + 18, clamp(s * 0.88, 0.08, 0.95), clamp(l + 0.08, 0.12, 0.88));

  // Accent: -15° hue, a bit more saturation, lighter
  const accent = hslToHex(h - 15 + 360, clamp(s * 1.08, 0.12, 1), clamp(l + 0.12, 0.18, 0.95));

  // Neutral: same hue family, strong desaturation, mid-lightness
  const neutral = hslToHex(h, clamp(s * 0.14, 0.02, 0.22), 0.56);

  // Background: very light wash, slight chroma
  const background = hslToHex(h, clamp(s * 0.2, 0.02, 0.32), 0.93);

  return {
    primary,
    secondary,
    accent,
    neutral,
    background
  };
}

/**
 * Freeze palette for the session (e.g. so swapping source images does not alter colors).
 * @param {{ primary: string, secondary: string, accent: string, neutral: string, background: string }} palette
 */
export function lockPalette(palette) {
  if (!palette || typeof palette !== 'object') {
    throw new Error('lockPalette: invalid palette');
  }
  const keys = ['primary', 'secondary', 'accent', 'neutral', 'background'];
  for (const k of keys) {
    if (!palette[k] || typeof palette[k] !== 'string') {
      throw new Error('lockPalette: missing key ' + k);
    }
    hexToRgb(palette[k]);
  }
  _lockedPalette = Object.freeze({
    primary: palette.primary,
    secondary: palette.secondary,
    accent: palette.accent,
    neutral: palette.neutral,
    background: palette.background
  });
}

/** @returns {Readonly<{ primary, secondary, accent, neutral, background }> | null} */
export function getLockedPalette() {
  return _lockedPalette;
}

/** Clear lock (optional reset for demos). */
export function clearLockedPalette() {
  _lockedPalette = null;
}
