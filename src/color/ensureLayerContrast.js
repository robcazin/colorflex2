/**
 * ensureLayerContrast.js — deterministic lightness separation for low-layer patterns.
 *
 * This is a final practical adjustment (post style/artist, pre mapping to layers).
 * It only nudges HSL lightness to improve contrast without changing hue structure.
 */

import { hexToRgb, rgbToHsl, hslToRgb, rgbToHex } from './colorPrimitives.js';

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
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
 * Adjust a pair to meet a minimum lightness gap.
 * @param {{ a: {h:number,s:number,l:number}, b: {h:number,s:number,l:number} }} pair
 * @param {number} minGap
 * @returns {{ a: {h:number,s:number,l:number}, b: {h:number,s:number,l:number} }}
 */
function ensureGap2(pair, minGap) {
  const a = { ...pair.a };
  const b = { ...pair.b };

  // Prefer a darker "dominant" and b lighter "support" without swapping roles.
  // First try to push b lighter; if we hit the ceiling, also pull a darker.
  const gap = b.l - a.l;
  if (gap >= minGap) return { a, b };

  const wantB = a.l + minGap;
  const bNew = clamp01(wantB);
  b.l = bNew;

  const newGap = b.l - a.l;
  if (newGap >= minGap) return { a, b };

  // Still short: pull a down just enough (bounded) to reach the gap.
  const needed = minGap - newGap;
  a.l = clamp01(a.l - needed);
  return { a, b };
}

/**
 * Spread 3 lightness values to avoid the same band.
 * Keeps hues/sats intact; preserves relative ordering by lightness.
 * @param {{ p:{h:number,s:number,l:number}, s:{h:number,s:number,l:number}, a:{h:number,s:number,l:number} }} tri
 * @param {number} minGap
 */
function ensureGap3(tri, minGap) {
  const p = { ...tri.p };
  const s = { ...tri.s };
  const a = { ...tri.a };

  const items = [
    { k: 'p', v: p },
    { k: 's', v: s },
    { k: 'a', v: a }
  ].sort((x, y) => x.v.l - y.v.l);

  const lo = items[0].v;
  const mid = items[1].v;
  const hi = items[2].v;

  // First: ensure lo-mid gap by pushing mid up (then pulling lo down if needed).
  let g1 = mid.l - lo.l;
  if (g1 < minGap) {
    const need = minGap - g1;
    const midUp = Math.min(0.97, mid.l + need);
    mid.l = midUp;
    g1 = mid.l - lo.l;
    if (g1 < minGap) {
      lo.l = Math.max(0.06, lo.l - (minGap - g1));
    }
  }

  // Second: ensure mid-hi gap by pushing hi up (then pulling mid down if needed).
  let g2 = hi.l - mid.l;
  if (g2 < minGap) {
    const need = minGap - g2;
    const hiUp = Math.min(0.98, hi.l + need);
    hi.l = hiUp;
    g2 = hi.l - mid.l;
    if (g2 < minGap) {
      mid.l = Math.max(0.08, mid.l - (minGap - g2));
    }
  }

  // Final clamp to sane ranges (keep background/neutral logic elsewhere).
  for (const it of items) it.v.l = clamp01(it.v.l);

  return { p, s, a };
}

/**
 * @param {{primary:string, secondary:string, accent:string, neutral:string, background:string} & Record<string, unknown>} palette
 * @param {number} layerCount
 * @returns {typeof palette & { _contrastAdjusted?: { layerCount: number, minGap: number } }}
 */
export function ensureLayerContrast(palette, layerCount) {
  if (!palette || typeof palette !== 'object') return palette;

  const lc = Number(layerCount) || 0;
  if (lc !== 2 && lc !== 3) return palette;

  const out = { ...palette };

  // Only adjust the slots that are actually mapped early for low-layer patterns.
  const p = hexToHsl(out.primary);
  const s = hexToHsl(out.secondary);
  const a = hexToHsl(out.accent);

  if (lc === 2) {
    const minGap = 0.4; // ~40 L points
    const pair = ensureGap2({ a: p, b: s }, minGap);
    out.primary = hslToHex(pair.a.h, pair.a.s, pair.a.l);
    out.secondary = hslToHex(pair.b.h, pair.b.s, pair.b.l);
    out._contrastAdjusted = { layerCount: 2, minGap };
    return out;
  }

  // lc === 3
  const minGap = 0.25; // ~25 L points
  const tri = ensureGap3({ p, s, a }, minGap);
  out.primary = hslToHex(tri.p.h, tri.p.s, tri.p.l);
  out.secondary = hslToHex(tri.s.h, tri.s.s, tri.s.l);
  out.accent = hslToHex(tri.a.h, tri.a.s, tri.a.l);
  out._contrastAdjusted = { layerCount: 3, minGap };
  return out;
}

