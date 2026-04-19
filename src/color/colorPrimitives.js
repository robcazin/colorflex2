/**
 * colorPrimitives.js — shared RGB/HEX/HSL helpers (no palette logic).
 * Used by paletteEngine, harmonyPalettes, and other color modules.
 */

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
    throw new Error('colorPrimitives: expected #RRGGBB or RRGGBB, got ' + hex);
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
