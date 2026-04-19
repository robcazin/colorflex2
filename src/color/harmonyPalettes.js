/**
 * harmonyPalettes.js — Kuler-style deterministic harmony sets from one base HEX.
 *
 * Pure HSL math (via paletteEngine rgb/hsl helpers). Same base → same output every time.
 * Each harmony returns five slots: primary, secondary, accent, neutral, background
 * (ready for a future paint-library conform step per slot).
 */

import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb } from './paletteEngine.js';

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function hueAdd(h, deg) {
  return ((h + deg) % 360 + 360) % 360;
}

/** Shortest-arc lerp between hues (degrees). t in [0,1]. */
function lerpHue(h, target, t) {
  let d = target - h;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return hueAdd(h, d * t);
}

function hslToHex(h, s, l) {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

/** @returns {{ h: number, s: number, l: number }} */
function baseHsl(baseHex) {
  const { r, g, b } = hexToRgb(baseHex);
  return rgbToHsl(r, g, b);
}

function neutralFromH(h, l) {
  return hslToHex(h, clamp(0.08, 0.02, 0.2), l);
}

function backgroundFromH(h, sBase) {
  return hslToHex(h, clamp(sBase * 0.18, 0.02, 0.28), 0.93);
}

/**
 * @param {string} baseHex
 * @returns {{ primary: string, secondary: string, accent: string, neutral: string, background: string }}
 */
export function analogousPalette(baseHex) {
  const { h, s, l } = baseHsl(baseHex);
  const primary = rgbToHex(hexToRgb(baseHex).r, hexToRgb(baseHex).g, hexToRgb(baseHex).b);
  const secondary = hslToHex(hueAdd(h, 28), clamp(s * 0.9, 0.1, 0.95), clamp(l, 0.12, 0.82));
  const accent = hslToHex(hueAdd(h, -28), clamp(s * 0.9, 0.1, 0.95), clamp(l + 0.06, 0.15, 0.88));
  return {
    primary,
    secondary,
    accent,
    neutral: neutralFromH(h, 0.54),
    background: backgroundFromH(h, s)
  };
}

export function complementaryPalette(baseHex) {
  const { h, s, l } = baseHsl(baseHex);
  const { r, g, b } = hexToRgb(baseHex);
  const primary = rgbToHex(r, g, b);
  const hC = hueAdd(h, 180);
  const secondary = hslToHex(hC, clamp(s * 0.92, 0.12, 1), clamp(l, 0.22, 0.72));
  const accent = hslToHex(hC, clamp(s * 0.72, 0.1, 0.85), clamp(l + 0.14, 0.2, 0.85));
  const midHue = hueAdd(h, 90);
  return {
    primary,
    secondary,
    accent,
    neutral: hslToHex(midHue, 0.09, 0.52),
    background: backgroundFromH(h, s)
  };
}

export function splitComplementaryPalette(baseHex) {
  const { h, s, l } = baseHsl(baseHex);
  const { r, g, b } = hexToRgb(baseHex);
  const primary = rgbToHex(r, g, b);
  const secondary = hslToHex(hueAdd(h, 150), clamp(s * 0.88, 0.1, 0.95), clamp(l, 0.18, 0.78));
  const accent = hslToHex(hueAdd(h, 210), clamp(s * 0.88, 0.1, 0.95), clamp(l + 0.05, 0.2, 0.82));
  return {
    primary,
    secondary,
    accent,
    neutral: neutralFromH(h, 0.53),
    background: backgroundFromH(h, s)
  };
}

export function triadicPalette(baseHex) {
  const { h, s, l } = baseHsl(baseHex);
  const { r, g, b } = hexToRgb(baseHex);
  const primary = rgbToHex(r, g, b);
  const secondary = hslToHex(hueAdd(h, 120), clamp(s * 0.9, 0.1, 0.95), clamp(l, 0.18, 0.78));
  const accent = hslToHex(hueAdd(h, 240), clamp(s * 0.9, 0.1, 0.95), clamp(l + 0.04, 0.2, 0.8));
  return {
    primary,
    secondary,
    accent,
    neutral: neutralFromH(h, 0.55),
    background: backgroundFromH(h, s)
  };
}

export function monochromaticPalette(baseHex) {
  const { h, s, l } = baseHsl(baseHex);
  const { r, g, b } = hexToRgb(baseHex);
  const primary = rgbToHex(r, g, b);
  const secondary = hslToHex(h, clamp(s * 0.78, 0.06, 0.9), clamp(l + 0.12, 0.12, 0.88));
  const accent = hslToHex(h, clamp(s * 0.55, 0.05, 0.75), clamp(l - 0.14, 0.08, 0.75));
  return {
    primary,
    secondary,
    accent,
    neutral: hslToHex(h, 0.1, 0.56),
    background: hslToHex(h, clamp(s * 0.22, 0.04, 0.35), 0.94)
  };
}

/** Warm-biased neutrals; base still drives the family. */
export function warmNeutralPalette(baseHex) {
  const { h } = baseHsl(baseHex);
  const { r, g, b } = hexToRgb(baseHex);
  const primary = rgbToHex(r, g, b);
  const warmH = lerpHue(h, 38, 0.45);
  const secondary = hslToHex(warmH, 0.14, 0.42);
  const accent = hslToHex(warmH, 0.2, 0.64);
  return {
    primary,
    secondary,
    accent,
    neutral: hslToHex(warmH, 0.07, 0.52),
    background: hslToHex(warmH, 0.06, 0.9)
  };
}

/** Ordered list for UI + stable iteration. */
export const HARMONY_DEFINITIONS = [
  { id: 'analogous', label: 'Analogous', fn: analogousPalette },
  { id: 'complementary', label: 'Complementary', fn: complementaryPalette },
  { id: 'splitComplementary', label: 'Split-complementary', fn: splitComplementaryPalette },
  { id: 'triadic', label: 'Triadic', fn: triadicPalette },
  { id: 'monochromatic', label: 'Monochromatic', fn: monochromaticPalette },
  { id: 'warmNeutral', label: 'Neutral / warm-neutral', fn: warmNeutralPalette }
];

/**
 * All harmonies at once (deterministic record for debugging or export).
 * @param {string} baseHex
 */
export function generateAllHarmonyPalettes(baseHex) {
  const out = {};
  for (const { id, fn } of HARMONY_DEFINITIONS) {
    out[id] = fn(baseHex);
  }
  return out;
}
