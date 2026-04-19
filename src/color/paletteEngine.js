/**
 * paletteEngine.js — minimal deterministic palette from one base hex.
 *
 * Phase 1: generate + lock. Palette generation is independent; a future
 * paintLibraryMatcher (local JSON, no APIs) can conform each hex afterward
 * without changing this module’s contract.
 *
 * Pipeline: harmony (color theory) → optional `style` (design/historical) →
 * optional `artist` (expressive HSL shaping, blended by `artistStrength`) → HEX.
 * Defaults: harmony analogous, style none, artist none, `artistStrength` 0.35 when artist is set.
 *
 * Legacy exact `primary` hex is preserved when both style and artist are unset/`none`.
 */

export {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb
} from './colorPrimitives.js';

import { hexToRgb, rgbToHex, rgbToHsl, hslToRgb } from './colorPrimitives.js';
import { harmonyPaletteToHslSlots } from './harmonyPalettes.js';
import { applyStyleToPaletteHsl } from './paletteStyles.js';
import { applyArtistToPaletteHsl } from './artistStyles.js';

let _lockedPalette = null;

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

function hslSlotsToHex(slots) {
  return {
    primary: hslToHex(slots.primary.h, slots.primary.s, slots.primary.l),
    secondary: hslToHex(slots.secondary.h, slots.secondary.s, slots.secondary.l),
    accent: hslToHex(slots.accent.h, slots.accent.s, slots.accent.l),
    neutral: hslToHex(slots.neutral.h, slots.neutral.s, slots.neutral.l),
    background: hslToHex(slots.background.h, slots.background.s, slots.background.l)
  };
}

/**
 * Deterministic 5-color palette from a single base hex.
 * Structure leaves room for a later pass: each slot can be replaced by
 * matchToPaintLibrary(hex, library) without regenerating the whole palette.
 *
 * @param {string} baseHex
 * @param {{
 *   harmony?: string,
 *   style?: string,
 *   artist?: string,
 *   artistStrength?: number
 * } | undefined} [options]
 * @returns {{ primary: string, secondary: string, accent: string, neutral: string, background: string }}
 */
export function generatePalette(baseHex, options) {
  const rawHarmony =
    options && typeof options === 'object' && typeof options.harmony === 'string'
      ? options.harmony.trim().toLowerCase()
      : '';
  const harmony = !rawHarmony || rawHarmony === 'none' ? 'analogous' : rawHarmony;

  let slots = harmonyPaletteToHslSlots(baseHex, harmony);
  const { h: baseHue } = hexToHsl(baseHex);
  const style =
    options && typeof options === 'object' && typeof options.style === 'string'
      ? options.style.trim().toLowerCase()
      : '';
  const artist =
    options && typeof options === 'object' && typeof options.artist === 'string'
      ? options.artist.trim().toLowerCase()
      : '';
  if (style && style !== 'none') {
    slots = applyStyleToPaletteHsl(slots, style, baseHue);
  }
  if (artist && artist !== 'none') {
    let artistStrength;
    if (options && typeof options === 'object' && options.artistStrength != null) {
      const n = Number(options.artistStrength);
      if (!Number.isNaN(n)) artistStrength = clamp01(n);
    }
    slots = applyArtistToPaletteHsl(slots, artist, baseHue, artistStrength);
  }
  const out = hslSlotsToHex(slots);
  // Legacy primary used exact RGB from the base hex (HSL round-trip can differ by 1 step).
  if ((!style || style === 'none') && (!artist || artist === 'none')) {
    const { r, g, b } = hexToRgb(baseHex);
    out.primary = rgbToHex(r, g, b);
  }
  return out;
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
