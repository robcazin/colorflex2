/**
 * colorDeltaE.js — deterministic sRGB → CIELAB and ΔE (CIE76).
 * Uses D65 white point; sRGB inverse gamma (IEC 61966-2-1).
 */

/**
 * @param {string} hex #rrggbb
 * @returns {{ L: number, a: number, b: number } | null}
 */
export function labFromHex(hex) {
  const h = String(hex || '')
    .replace(/^#/, '')
    .trim()
    .toLowerCase();
  let rStr = h;
  if (h.length === 3) {
    rStr = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  if (rStr.length !== 6) return null;
  const r = parseInt(rStr.slice(0, 2), 16);
  const g = parseInt(rStr.slice(2, 4), 16);
  const b = parseInt(rStr.slice(4, 6), 16);
  if ([r, g, b].some((x) => Number.isNaN(x))) return null;

  const R = srgbToLinear(r / 255);
  const G = srgbToLinear(g / 255);
  const B = srgbToLinear(b / 255);

  const X = R * 0.4124564 + G * 0.3575761 + B * 0.1804375;
  const Y = R * 0.2126729 + G * 0.7151522 + B * 0.072175;
  const Z = R * 0.0193339 + G * 0.119192 + B * 0.9503041;

  const Xn = 0.95047;
  const Yn = 1.0;
  const Zn = 1.08883;

  let xr = X / Xn;
  let yr = Y / Yn;
  let zr = Z / Zn;

  const f = (t) =>
    t > 0.008856 ? Math.cbrt(t) : (7.787 * t + 16 / 116);

  const fx = f(xr);
  const fy = f(yr);
  const fz = f(zr);

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const bLab = 200 * (fy - fz);

  return { L, a, b: bLab };
}

function srgbToLinear(u) {
  return u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4);
}

/**
 * CIE76 ΔE in LAB space (0 = identical; ~1–2 often “just noticeable”).
 * @param {string} hexA
 * @param {string} hexB
 */
export function deltaE76Hex(hexA, hexB) {
  const A = labFromHex(hexA);
  const B = labFromHex(hexB);
  if (!A || !B) return Number.POSITIVE_INFINITY;
  const dL = A.L - B.L;
  const da = A.a - B.a;
  const db = A.b - B.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}
