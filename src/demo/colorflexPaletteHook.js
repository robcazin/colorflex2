/**
 * colorflexPaletteHook.js — test-only palette engine UI inside ColorFlex.
 *
 * STRICT: does not modify the rendering pipeline or layer loading. It only fills existing
 * layer color inputs after the user clicks Apply, using CFM’s applyColorsToLayerInputs
 * (assigned to window in CFM.js so this module stays decoupled from broad refactors).
 *
 * Enable: ?paletteEngineTest=1 (or =true)  or  localStorage.setItem("paletteEngineTest", "1")
 *
 * Optional base hex (defaults to dev preset): ?paletteEngineBaseHex=%235d6f7f  or  ?peBase=5d6f7f
 *
 * Example (adjust /pages/your-handle to your ColorFlex page URL):
 *   /pages/colorflex?collection=silk-road&pattern=constantinople&source=collection_page&paletteEngineTest=1
 */

import {
  generatePalette,
  generatePaletteFromMohawkRoles,
  lockPalette,
  getLockedPalette
} from '../color/paletteEngine.js';
// `lockPalette` / `getLockedPalette` are kept as imports because the optional
// palette-engine UI (initColorFlexPaletteHook) below still uses them. The
// Mohawk roles bridge intentionally does NOT call lockPalette (would freeze
// the palette across carpet swaps and silence diversity changes).
import {
  matchToPaintLibrary,
  conformPaletteToPaintLibrary,
  normalizeMatchHex
} from '../color/paintLibraryMatcher.js';
import { ensureLayerContrast } from '../color/ensureLayerContrast.js';
import { COLORFLEX_SW_CATALOG } from '../color/colorflexCatalogAdapter.js';
import { ENGINE_HARMONY_IDS } from '../color/harmonyPalettes.js';
import { ENGINE_STYLE_IDS, ENGINE_STYLE_LABELS, ENGINE_STYLE_DESCRIPTIONS } from '../color/paletteStyles.js';
import { ENGINE_ARTIST_IDS, ENGINE_ARTIST_BLURBS, DEFAULT_ARTIST_STRENGTH } from '../color/artistStyles.js';

const SLOT_KEYS = ['primary', 'secondary', 'accent', 'neutral', 'background'];

/** Default base when no URL override (palette engine test UI). */
const PALETTE_ENGINE_DEFAULT_BASE = '#5d6f7f';

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function normalizeHex(v) {
  let h = String(v || '').trim();
  if (!h) return '#d6873d';
  if (h[0] !== '#') h = '#' + h;
  if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  if (h.length !== 7) return '#5a7d9a';
  return h.toLowerCase();
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function engineHarmonyLabels() {
  return {
    analogous: 'Similar colors',
    complementary: 'Complementary',
    splitComplementary: 'Split-complementary',
    triadic: 'Triadic',
    monochromatic: 'Monochromatic',
    neutral: 'Neutral (warm-neutral)'
  };
}

function engineArtistLabels() {
  return {
    none: 'None',
    monet: 'Monet',
    picasso: 'Picasso',
    dali: 'Dalí',
    sargent: 'Sargent',
    lichtenstein: 'Lichtenstein',
    vangogh: 'van Gogh',
    matisse: 'Matisse',
    okeeffe: "O'Keeffe"
  };
}

function rgbClampByte(n) {
  const x = Math.round(n);
  return x < 0 ? 0 : x > 255 ? 255 : x;
}

function hexToRgb(hex) {
  const h = String(hex).replace(/^#/, '').trim();
  if (h.length !== 6) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16)
  };
}

function rgbToHex(r, g, b) {
  const x = (n) => rgbClampByte(n).toString(16).padStart(2, '0');
  return '#' + x(r) + x(g) + x(b);
}

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
  const t = (tt) => {
    let x = tt;
    if (x < 0) x += 1;
    if (x > 1) x -= 1;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };
  return {
    r: Math.round(255 * t(hk + 1 / 3)),
    g: Math.round(255 * t(hk)),
    b: Math.round(255 * t(hk - 1 / 3))
  };
}

function variantDarker(hex) {
  const { r, g, b } = hexToRgb(hex);
  const hsl = rgbToHsl(r, g, b);
  const out = hslToRgb(hsl.h, hsl.s * 0.95, hsl.l * 0.72);
  return rgbToHex(out.r, out.g, out.b);
}

function variantLighter(hex) {
  const { r, g, b } = hexToRgb(hex);
  const hsl = rgbToHsl(r, g, b);
  const nl = clamp(hsl.l + (1 - hsl.l) * 0.38, 0, 1);
  const out = hslToRgb(hsl.h, hsl.s * 0.88, nl);
  return rgbToHex(out.r, out.g, out.b);
}

function variantMutedAccent(hex) {
  const { r, g, b } = hexToRgb(hex);
  const hsl = rgbToHsl(r, g, b);
  const out = hslToRgb(hsl.h, clamp(hsl.s * 0.55, 0.06, 0.45), clamp(hsl.l * 1.02, 0, 1));
  return rgbToHex(out.r, out.g, out.b);
}

function variantWarmNeutral(hex) {
  const { r, g, b } = hexToRgb(hex);
  const hsl = rgbToHsl(r, g, b);
  const out = hslToRgb(38, clamp(hsl.s * 0.18, 0.03, 0.22), clamp(0.5 + (hsl.l - 0.5) * 0.85, 0.36, 0.72));
  return rgbToHex(out.r, out.g, out.b);
}

function variantCoolNeutral(hex) {
  const { r, g, b } = hexToRgb(hex);
  const hsl = rgbToHsl(r, g, b);
  const out = hslToRgb(220, clamp(hsl.s * 0.18, 0.03, 0.22), clamp(0.5 + (hsl.l - 0.5) * 0.85, 0.36, 0.72));
  return rgbToHex(out.r, out.g, out.b);
}

/** Build up to 12 colors for layer fill mapping. */
function expandPaletteTo12(palette) {
  const p = palette.primary;
  const s = palette.secondary;
  const a = palette.accent;
  const n = palette.neutral;
  const b = palette.background;
  return [
    p,
    s,
    a,
    n,
    b,
    variantDarker(p),
    variantLighter(p),
    variantDarker(s),
    variantLighter(s),
    variantMutedAccent(a),
    variantWarmNeutral(n),
    variantCoolNeutral(n)
  ];
}

function getColorableLayerCount() {
  const st = window.appState;
  if (!st) return 0;
  if (Array.isArray(st.layerInputs) && st.layerInputs.length) return st.layerInputs.length;
  if (Array.isArray(st.currentLayers) && st.currentLayers.length) {
    return st.currentLayers.filter((l) => l && l.color != null && l.isShadow !== true).length;
  }
  return 0;
}

function getPatternName() {
  return window.appState?.currentPattern?.name || window.appState?.targetPattern?.name || '';
}

/** Stable key when pattern or layer inputs change (for auto-refresh). */
function getPaletteHookContextKey() {
  const st = window.appState;
  if (!st) return '';
  const p = st.currentPattern;
  const patKey = p
    ? String(p.name || '') +
      '\u0001' +
      String(p.slug || p.handle || p.patternName || '')
    : '';
  const col = String(st.selectedCollection?.name || '');
  const li = Array.isArray(st.layerInputs) ? st.layerInputs : [];
  const labels = li.map((x) => (x && x.label) || '').join('\u0001');
  return col + '\u0002' + patKey + '\u0002' + li.length + '\u0002' + labels;
}

function getLayerInputs() {
  return Array.isArray(window.appState?.layerInputs) ? window.appState.layerInputs : [];
}

function readActiveMohawkRoles() {
  try {
    const t = document.getElementById('mohawkPaletteToggle');
    if (t && 'checked' in t && !t.checked) return null;
  } catch (_e) {}

  const fromWindow = window.__mohawkRoles || window.mohawkRoles || null;
  const fromStorage = (() => {
    try {
      const raw =
        window.localStorage.getItem('mohawkRoles') ||
        window.localStorage.getItem('colorflexMohawkRoles') ||
        window.localStorage.getItem('mohawkPaletteRoles');
      return raw ? JSON.parse(raw) : null;
    } catch (_e) {
      return null;
    }
  })();

  const roles = fromWindow || fromStorage;
  if (!roles || typeof roles !== 'object') return null;
  if (!roles.background || !roles.linework || !roles.accent) return null;
  return {
    background: normalizeHex(roles.background),
    linework: normalizeHex(roles.linework),
    accent: normalizeHex(roles.accent)
  };
}

function computeProposedLayerColors(expanded12, layerCount) {
  const colors = [];
  const max = Math.min(layerCount, 12);
  for (let i = 0; i < max; i++) colors.push(expanded12[i]);
  return colors;
}

/** Indexed by appState.currentLayers index (matches CFM applyColorsToLayerInputs). */
function buildColorsArrayForApply(proposedForInputs) {
  const layers = Array.isArray(window.appState?.currentLayers) ? window.appState.currentLayers : [];
  const out = new Array(layers.length).fill(null);
  const inputs = getLayerInputs();
  let colorableIdx = 0;
  for (const inp of inputs) {
    const clIdx = layers.findIndex((l) => l && l.label === inp.label);
    if (clIdx === -1) continue;
    const hex = proposedForInputs[colorableIdx];
    if (hex) out[clIdx] = hex;
    colorableIdx++;
  }
  return out;
}

function renderSwatches(list) {
  const row = el('div', 'peh-swatch-row');
  for (const hex of list) {
    const cell = el('div', 'peh-swatch');
    cell.style.background = hex;
    cell.title = hex;
    row.appendChild(cell);
  }
  return row;
}

function enabledByFlag() {
  const sp = new URLSearchParams(window.location.search || '');
  const q = (sp.get('paletteEngineTest') || '').trim().toLowerCase();
  if (q === '1' || q === 'true' || q === 'yes' || q === 'on') return true;
  try {
    const ls = (window.localStorage.getItem('paletteEngineTest') || '').trim().toLowerCase();
    return ls === '1' || ls === 'true' || ls === 'yes' || ls === 'on';
  } catch (_e) {
    return false;
  }
}

/** Initial base hex: query ?paletteEngineBaseHex=#abc or ?peBase=abc123, else default constant. */
function getInitialPaletteEngineBaseHex() {
  const sp = new URLSearchParams(window.location.search || '');
  const raw = (sp.get('paletteEngineBaseHex') || sp.get('peBase') || '').trim();
  if (!raw) return PALETTE_ENGINE_DEFAULT_BASE;
  const n = normalizeHex(raw.startsWith('#') ? raw : '#' + raw);
  return n;
}

function buildGenerateOptions(harmony, style, artist, strength) {
  const opt = { harmony: harmony && harmony !== 'none' ? harmony : 'analogous' };
  if (style && style !== 'none') opt.style = style;
  if (artist && artist !== 'none') {
    opt.artist = artist;
    opt.artistStrength = strength;
  }
  return opt;
}

/**
 * Diversify the extracted Mohawk carpet palette into 12 perceptually-separated
 * ColorFlex slots. Every slot's hue comes from the three extracted carpet hexes
 * (background / linework / accent) — no harmony partners, no complementary
 * rotations, no foreign families. Spread comes from lightness, saturation, and
 * inter-anchor blends only:
 *
 *   0  field             bg
 *   1  structure/trim    lw
 *   2  primary motif     ac
 *   3  secondary motif   ac · lw blend (toward structure)
 *   4  accent depth      darker, saturated ac
 *   5  shadow/depth      very dark bg · lw blend, low chroma
 *   6  muted bridge A    ac muted toward bg (mid lightness)
 *   7  muted bridge B    lw muted toward ac (mid lightness)
 *   8  light balance A   high-key pastel of bg
 *   9  light balance B   high-key pastel of lw
 *  10  light balance C   high-key pastel of ac
 *  11  deep neutral      mid-dark bg · lw blend, very low chroma
 */
/** Full 12-slot roles palette for storage (catalog roles + contrast bias). */
export function buildMohawkRolesStoredPalette(roles, bias) {
  if (!roles || !roles.background || !roles.linework || !roles.accent) return [];
  const bg = normalizeHex(roles.background);
  const lw = normalizeHex(roles.linework);
  const ac = normalizeHex(roles.accent);
  const k = clamp(typeof bias === 'number' ? bias : 0, 0, 1);
  return diversifyMohawkCarpetPalette(bg, lw, ac, k);
}

export function applyMohawkRolesPaletteToColorFlexLayers(roles) {
  if (!roles || !roles.background || !roles.linework || !roles.accent) return;
  if (typeof window === 'undefined') return;
  if (typeof window.applyColorsToLayerInputs !== 'function') return;

  const layerCount = getColorableLayerCount();
  if (layerCount < 1) return;

  const bg = normalizeHex(roles.background);
  const lw = normalizeHex(roles.linework);
  const ac = normalizeHex(roles.accent);

  const cfg = (window.COLORFLEX_MOHAWK_ROOM_CONFIG && typeof window.COLORFLEX_MOHAWK_ROOM_CONFIG === 'object')
    ? window.COLORFLEX_MOHAWK_ROOM_CONFIG
    : null;
  const biasRaw = cfg && typeof cfg.paletteContrastBias === 'number' ? cfg.paletteContrastBias : 0;
  const bias = clamp(biasRaw, 0, 1);

  const slots = diversifyMohawkCarpetPalette(bg, lw, ac, bias);
  if (window.activeMohawkCarpet && typeof window.activeMohawkCarpet === 'object') {
    window.activeMohawkCarpet.rankedColors = slots.slice();
  }
  const proposed = computeProposedLayerColors(slots, layerCount);
  const colorsArray = buildColorsArrayForApply(proposed);
  try {
    window.applyColorsToLayerInputs(colorsArray, []);
  } catch (e) {
    console.warn('[Mohawk roles → layers] applyColorsToLayerInputs failed:', e);
  }
}

/**
 * Apply the first N entries from a stored Mohawk carpet palette to visible layer
 * inputs. The full stored array (10 atmospheric or 12 roles) is never truncated
 * on activeMohawkCarpet — only the visible subset is written to the UI.
 * @param {string[]} storedPalette full ranked palette from carpet selection
 */
export function applyMohawkRankedPaletteToColorFlexLayers(storedPalette) {
  if (!Array.isArray(storedPalette) || storedPalette.length < 1) return;
  if (typeof window === 'undefined') return;
  if (typeof window.applyColorsToLayerInputs !== 'function') return;

  const layerCount = getColorableLayerCount();
  if (layerCount < 1) return;

  const slots = storedPalette.slice(0, 12).map((hex) => normalizeHex(hex));
  while (slots.length < 12) {
    slots.push(slots[slots.length - 1]);
  }
  const proposed = computeProposedLayerColors(slots, layerCount);
  const colorsArray = buildColorsArrayForApply(proposed);
  try {
    window.applyColorsToLayerInputs(colorsArray, []);
  } catch (e) {
    console.warn('[Mohawk stored palette → layers] applyColorsToLayerInputs failed:', e);
  }
}

function cssColorToHex(css) {
  const s = String(css || '').trim();
  if (!s) return null;
  if (s[0] === '#') return normalizeHex(s);
  const m = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (m) {
    return (
      '#' +
      [m[1], m[2], m[3]]
        .map((n) => ('0' + parseInt(n, 10).toString(16)).slice(-2))
        .join('')
    );
  }
  return null;
}

function readCurrentLayerHexAtIndex(clIdx) {
  const layers = Array.isArray(window.appState?.currentLayers) ? window.appState.currentLayers : [];
  const inputs = Array.isArray(window.appState?.layerInputs) ? window.appState.layerInputs : [];
  const L = layers[clIdx];
  if (!L) return null;
  const inp = inputs.find((x) => x && x.label === L.label);
  if (inp && inp.circle && inp.circle.style && inp.circle.style.backgroundColor) {
    const fromCircle = cssColorToHex(inp.circle.style.backgroundColor);
    if (fromCircle) return fromCircle;
  }
  const raw = L.color != null ? String(L.color).trim() : '';
  if (/^#?[0-9A-Fa-f]{6}$/.test(raw)) return normalizeHex(raw);
  return null;
}

/**
 * Assign random colors from the stored full carpet palette to Mohawk semantic
 * roles (sofa/pillow/trim/panels). Uses semanticLayerInputIndex, not a shuffle
 * of only the colors currently visible in the layer UI.
 * @returns {boolean} true when Mohawk randomize ran
 */
export function randomizeMohawkSemanticColorsFromStoredPalette(activeCarpet, semanticLayerInputIndex) {
  if (!activeCarpet || typeof window === 'undefined') return false;
  const pool = activeCarpet.rankedColors;
  if (!Array.isArray(pool) || pool.length < 1) return false;
  if (typeof window.applyColorsToLayerInputs !== 'function') return false;

  const slii = (semanticLayerInputIndex && typeof semanticLayerInputIndex === 'object')
    ? semanticLayerInputIndex
    : {};
  const roles = ['sofa', 'pillow', 'trim', 'panels'];
  const layers = Array.isArray(window.appState?.currentLayers) ? window.appState.currentLayers : [];
  const colorsArray = layers.map(function (_L, idx) {
    return readCurrentLayerHexAtIndex(idx);
  });
  let assigned = 0;

  for (const role of roles) {
    const idx = slii[role];
    if (typeof idx !== 'number' || idx < 0 || idx >= layers.length) continue;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    colorsArray[idx] = normalizeHex(pick);
    assigned++;
  }

  if (assigned < 1) return false;

  for (var ci = 0; ci < colorsArray.length; ci++) {
    if (colorsArray[ci] == null) {
      colorsArray[ci] = readCurrentLayerHexAtIndex(ci);
    }
  }

  try {
    window.applyColorsToLayerInputs(colorsArray, []);
  } catch (e) {
    console.warn('[Mohawk randomize] applyColorsToLayerInputs failed:', e);
    return false;
  }
  return true;
}

/**
 * Route carpet palette to visible layer inputs from stored rankedColors.
 * Wallpaper pattern changes re-apply the stored array only — no re-extract.
 * @param {{ forceRolesRebuild?: boolean }} [options] rebuild stored palette from roles+bias (bias slider)
 */
export function applyMohawkCarpetPaletteBridge(activeCarpet, options) {
  if (!activeCarpet || typeof window === 'undefined') return;
  const cfg = (window.COLORFLEX_MOHAWK_ROOM_CONFIG && typeof window.COLORFLEX_MOHAWK_ROOM_CONFIG === 'object')
    ? window.COLORFLEX_MOHAWK_ROOM_CONFIG
    : {};
  const source = cfg.mohawkPaletteSource === 'roles' ? 'roles' : 'atmospheric';
  const forceRolesRebuild = !!(options && options.forceRolesRebuild);

  if (
    forceRolesRebuild
    && source === 'roles'
    && activeCarpet.roles
    && activeCarpet.roles.background
    && activeCarpet.roles.linework
    && activeCarpet.roles.accent
  ) {
    const biasRaw = typeof cfg.paletteContrastBias === 'number' ? cfg.paletteContrastBias : 0;
    activeCarpet.rankedColors = buildMohawkRolesStoredPalette(activeCarpet.roles, biasRaw);
  }

  if (Array.isArray(activeCarpet.rankedColors) && activeCarpet.rankedColors.length) {
    applyMohawkRankedPaletteToColorFlexLayers(activeCarpet.rankedColors);
    return;
  }

  if (activeCarpet.roles && activeCarpet.roles.background && activeCarpet.roles.linework && activeCarpet.roles.accent) {
    applyMohawkRolesPaletteToColorFlexLayers(activeCarpet.roles);
  }
}

/**
 * 12 slots derived only from the three carpet anchors via L/S adjustments and
 * inter-anchor blends. Hue is never invented from outside the carpet.
 *
 * `bias` (0..1, default 0.5) interactively controls palette contrast/spread:
 *   - 0.0  Faithful  — every variant collapses toward its source anchor
 *                      (tightly analogous, low contrast, subtle tonal variation).
 *   - 0.5  Default   — exact identity with the prior, fixed-magnitude diversifier.
 *   - 1.0  Expressive — variants overshoot the default targets along L/S
 *                       (stronger luminance separation, more chroma contrast,
 *                       still inside the source hue family — no hue rotation).
 */
function diversifyMohawkCarpetPalette(bgHex, lwHex, acHex, bias) {
  const ac = hexToHsl(acHex);
  const bg = hexToHsl(bgHex);
  const lw = hexToHsl(lwHex);

  const k = clamp(typeof bias === 'number' ? bias : 0.5, 0, 1);
  /** spread (variant slots 4–11): 0.4 (faithful) → 1.0 (k=0.5 identity) → 1.6 (expressive). */
  const spread = 0.4 + 1.2 * k;
  /**
   * tilt2 drives slots 0–3 so the slider has visible effect on patterns with
   * ≤4 colorable layers (Botan, etc.). At tilt2 = 0 (k = 0.5) the anchor
   * outputs equal the literal carpet hexes and `secondary` matches the prior
   * fixed mix — i.e. the entire palette at center detent is identical to the
   * pre-slider behavior. tilt2 = -1 collapses anchors toward mid-tone for the
   * "tightly analogous / low contrast" feel; tilt2 = +1 pushes them apart.
   */
  const tilt2 = (k - 0.5) * 2;
  /** Stretch L away from 0.5 by factor (1 + 0.4 * tilt2). tilt2 = 0 → identity. */
  const stretchL = (l) => clamp(0.5 + (l - 0.5) * (1 + 0.4 * tilt2), 0, 1);
  /** Scale S by (1 + 0.25 * tilt2). tilt2 = 0 → identity. */
  const stretchS = (s) => clamp(s * (1 + 0.25 * tilt2), 0, 1);

  const lerpToward = (anchor, target) => clamp(anchor + (target - anchor) * spread, 0, 1);
  const scaleFromOne = (targetMul) => 1 + (targetMul - 1) * spread;

  /** Slot 3 (secondary) mix weight: 0.4 at k = 0.5 (identity), → 0 (pure accent) at k = 0, → 0.8 (toward structure) at k = 1. */
  const secT = clamp(0.4 + 0.4 * tilt2, 0, 1);

  const fieldOut     = hslOut(bg.h, stretchS(bg.s), stretchL(bg.l));
  const structureOut = hslOut(lw.h, stretchS(lw.s), stretchL(lw.l));
  const primaryOut   = hslOut(ac.h, stretchS(ac.s), stretchL(ac.l));
  const secondary    = hslMix(acHex, lwHex, secT);
  const accentDepth  = hslOut(
    ac.h,
    clamp(ac.s * scaleFromOne(1.05), 0, 1),
    clamp(Math.max(0.18, ac.l * scaleFromOne(0.62)), 0, 1)
  );
  const shadow       = hslShiftFromMix(bgHex, lwHex, 0.5, {
    l: lerpToward((bg.l + lw.l) / 2, 0.14),
    sScale: scaleFromOne(0.45)
  });
  const mutedBridgeA = hslMix(acHex, bgHex, 0.5,  {
    sScale: scaleFromOne(0.5),
    l: lerpToward((ac.l + bg.l) / 2, 0.46)
  });
  const mutedBridgeB = hslMix(lwHex, acHex, 0.55, {
    sScale: scaleFromOne(0.5),
    l: lerpToward((lw.l + ac.l) / 2, 0.5)
  });
  const lightA       = hslOut(
    bg.h,
    lerpToward(bg.s, Math.min(0.35, bg.s * 0.45)),
    lerpToward(bg.l, 0.86)
  );
  const lightB       = hslOut(
    lw.h,
    lerpToward(lw.s, Math.min(0.32, lw.s * 0.4)),
    lerpToward(lw.l, 0.84)
  );
  const lightC       = hslOut(
    ac.h,
    lerpToward(ac.s, Math.min(0.45, ac.s * 0.5)),
    lerpToward(ac.l, 0.82)
  );
  const deepNeutral  = hslShiftFromMix(bgHex, lwHex, 0.5, {
    l: lerpToward((bg.l + lw.l) / 2, 0.3),
    sScale: scaleFromOne(0.18)
  });

  return [
    fieldOut,      // 0  field (bias-stretched bg)
    structureOut,  // 1  structure/trim (bias-stretched lw)
    primaryOut,    // 2  primary motif (bias-stretched ac)
    secondary,     // 3  secondary motif (bias-modulated mix)
    accentDepth,   // 4  accent depth
    shadow,        // 5  shadow/depth
    mutedBridgeA,  // 6  muted bridge A (accent · field)
    mutedBridgeB,  // 7  muted bridge B (structure · accent)
    lightA,        // 8  light balance A (field)
    lightB,        // 9  light balance B (structure)
    lightC,        // 10 light balance C (accent)
    deepNeutral    // 11 deep neutral (field · structure)
  ];
}

function hexToHsl(hex) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

function hslOut(h, s, l) {
  const rgb = hslToRgb(((h % 360) + 360) % 360, clamp(s, 0, 1), clamp(l, 0, 1));
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/** Shortest-arc hue lerp + linear S/L lerp; optional sScale / fixed l override. */
function hslMix(aHex, bHex, t, opts) {
  const a = hexToHsl(aHex);
  const b = hexToHsl(bHex);
  const u = clamp(t, 0, 1);
  let dh = b.h - a.h;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  const h = (a.h + dh * u + 360) % 360;
  let s = a.s + (b.s - a.s) * u;
  let l = a.l + (b.l - a.l) * u;
  if (opts && opts.sScale != null) s *= opts.sScale;
  if (opts && opts.l != null) l = opts.l;
  return hslOut(h, clamp(s, 0, 1), clamp(l, 0, 1));
}

/** Mix two hexes (hue), then override L and scale S — used for shadow and deep neutral. */
function hslShiftFromMix(aHex, bHex, t, opts) {
  return hslMix(aHex, bHex, t, opts);
}

export function initColorFlexPaletteHook() {
  if (typeof document === 'undefined') return;
  if (!enabledByFlag()) return;
  if (document.getElementById('paletteEngineHookRoot')) return;

  const colorControls = document.getElementById('colorControls');
  const layerInputsFallback = document.getElementById('layerInputsContainer');
  const useTabs = !!colorControls;

  const root = el('section', 'peh-root');
  root.id = 'paletteEngineHookRoot';

  const controls = el('div', 'peh-controls');

  const initialBase = getInitialPaletteEngineBaseHex();

  const baseLab = el('label', 'peh-lab peh-lab-base');
  baseLab.appendChild(document.createTextNode('Base'));
  const baseRow = el('div', 'peh-base-row');
  const baseColor = document.createElement('input');
  baseColor.type = 'color';
  baseColor.value = initialBase;
  const baseHex = document.createElement('input');
  baseHex.type = 'text';
  baseHex.value = initialBase;
  baseHex.className = 'peh-hex';
  baseHex.spellcheck = false;
  baseRow.appendChild(baseColor);
  baseRow.appendChild(baseHex);
  baseLab.appendChild(baseRow);
  controls.appendChild(baseLab);

  function addSelect(label, ids, labels, def) {
    const lab = el('label', 'peh-lab', label);
    const sel = document.createElement('select');
    sel.className = 'peh-select';
    for (const id of ids) {
      const o = document.createElement('option');
      o.value = id;
      o.textContent = labels[id] || id;
      sel.appendChild(o);
    }
    sel.value = def;
    lab.appendChild(sel);
    controls.appendChild(lab);
    return sel;
  }

  const harmonySel = addSelect('Harmony', ENGINE_HARMONY_IDS, engineHarmonyLabels(), 'analogous');
  const styleSel = addSelect('Style', ENGINE_STYLE_IDS, ENGINE_STYLE_LABELS, 'none');
  const artistSel = addSelect('Artist', ENGINE_ARTIST_IDS, engineArtistLabels(), 'none');

  const strengthLab = el('label', 'peh-lab peh-lab-strength');
  strengthLab.appendChild(document.createTextNode('Artist Influence'));
  const strengthRow = el('div', 'peh-strength-row');
  const strengthRange = document.createElement('input');
  strengthRange.type = 'range';
  strengthRange.min = '0';
  strengthRange.max = '1';
  strengthRange.step = '0.05';
  strengthRange.value = String(DEFAULT_ARTIST_STRENGTH);
  strengthRange.className = 'peh-range';
  const strengthOut = el('span', 'peh-range-out', String(DEFAULT_ARTIST_STRENGTH));
  strengthRow.appendChild(strengthRange);
  strengthRow.appendChild(strengthOut);
  strengthLab.appendChild(strengthRow);
  controls.appendChild(strengthLab);

  const updatePreviewsBtn = el('button', 'peh-btn peh-apply', 'Update Previews');
  controls.appendChild(updatePreviewsBtn);

  root.appendChild(controls);

  const styleDesc = el('div', 'peh-desc', '');
  root.appendChild(styleDesc);
  const artistDesc = el('div', 'peh-desc', '');
  root.appendChild(artistDesc);

  const preview = el('div', 'peh-preview');
  root.appendChild(preview);

  const mapList = el('div', 'peh-map');
  root.appendChild(mapList);

  const actions = el('div', 'peh-actions');
  const warn = el('div', 'peh-warn', '');
  actions.appendChild(warn);
  root.appendChild(actions);

  const styleEl = document.createElement('style');
  styleEl.textContent = `
    #colorControls.peh-color-center-host{max-width:400px;width:100%;margin-left:auto!important;margin-right:auto!important}
    .peh-tabs{display:flex;flex-wrap:nowrap;gap:6px;margin:0 0 0 0;justify-content:stretch;align-items:flex-end}
    .peh-tabs[role="tablist"]{outline:none}
    .peh-tab{flex:1;min-width:8.75rem;padding:8px 10px;font-size:0.72rem;font-weight:700;font-family:inherit;cursor:pointer;background:#141414;color:#9a9a8a;border:2px solid #5c4d2a;border-radius:8px 8px 0 0;margin:0;white-space:nowrap;transition:color .15s,border-color .15s,background .15s}
    .peh-tab:hover{color:#c8c8b0}
    .peh-tab--active{color:#d4c896;border-color:#4299e1;background:#1c1912;box-shadow:inset 0 2px 0 0 rgba(66,153,225,.35)}
    .peh-tab:focus-visible{outline:2px solid #4299e1;outline-offset:2px}
    .peh-engine-wrap,.peh-panel-native{padding:10px 12px 12px;border:2px solid #4299e1;border-top:none;border-radius:0 0 10px 10px;background:#121212;color:#eaeaea;box-sizing:border-box}
    .peh-panel-native{border-color:#5c4d2a}
    .peh-panel-hidden{display:none!important}
    .peh-root{margin:0;padding:0;border:none;background:transparent;color:#eaeaea;max-width:100%}
    .peh-controls{display:flex;flex-wrap:wrap;gap:10px 14px;align-items:flex-end;margin-bottom:10px}
    .peh-lab{display:flex;flex-direction:column;gap:4px;font-size:1.5rem;color:#a0a0a0;font-weight:600}
    .peh-base-row{display:flex;flex-direction:row;align-items:center;gap:8px}
    .peh-lab-base input[type="color"]{width:48px;height:34px;padding:0;border:1px solid #444;background:#000;flex-shrink:0}
    .peh-hex{flex:1;min-width:6.5rem;max-width:12rem;padding:6px 8px;border-radius:6px;border:1px solid #444;background:#1e1e1e;color:#eee;font-family:ui-monospace,monospace}
    .peh-select{min-width:11rem;padding:6px 8px;border-radius:6px;border:1px solid #444;background:#1e1e1e;color:#eee}
    .peh-strength-row{display:flex;flex-direction:row;align-items:center;gap:8px;min-width:0}
    .peh-lab-strength .peh-range{flex:1;min-width:8rem;max-width:14rem;width:auto}
    .peh-range-out{flex-shrink:0;font-family:ui-monospace,monospace;color:#b8b8a0;font-size:0.78rem;min-width:2.25rem;text-align:right}
    .peh-desc{font-size:0.78rem;color:#a0a090;line-height:1.4;margin:2px 0}
    .peh-swatch-row{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 10px}
    .peh-swatch{width:26px;height:18px;border-radius:5px;border:1px solid rgba(255,255,255,0.16)}
    .peh-map{display:flex;flex-direction:column;gap:1px;margin-bottom:8px}
    .peh-map-line{font-size:0.78rem;color:#cfcfcf;display:flex;gap:10px;align-items:center}
    .peh-chip{width:16px;height:16px;border-radius:4px;border:1px solid rgba(255,255,255,0.16);font-size:1rem;color:#a0a0a0;font-weight:600}
    .peh-actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
    .peh-btn{padding:8px 10px;border-radius:8px;border:1px solid #d7ab60;background:#7c8e88;color:#eee;cursor:pointer;font-weight:700}
    .peh-btn:hover{border-color:#777}
    .peh-btn:disabled{opacity:0.45;cursor:not-allowed}
    .peh-warn{font-size:0.78rem;color:#e0b070;line-height:1.35}
    .peh-map-detail{display:flex;flex-direction:column;gap:1px;align-items:flex-start;padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.06)}
    .peh-map-detail .peh-map-line{border:none;padding:0;margin:0}
    .peh-map-sub{font-size:0.72rem;color:#b0b0a0;padding-left:22px;line-height:1.45}
    .peh-root .peh-btn.peh-apply{margin-top:4px;width:100%;flex-basis:100%;box-sizing:border-box}
  `;
  root.appendChild(styleEl);

  /** @type {HTMLElement | null} */
  let engineWrap = null;
  /** @type {HTMLElement | null} */
  let layersPanel = null;
  /** @type {HTMLButtonElement | null} */
  let tabEngineBtn = null;
  /** @type {HTMLButtonElement | null} */
  let tabLayersBtn = null;

  function setCenterTab(which) {
    if (!engineWrap || !layersPanel || !tabEngineBtn || !tabLayersBtn) return;
    const showEngine = which === 'engine';
    engineWrap.classList.toggle('peh-panel-hidden', !showEngine);
    layersPanel.classList.toggle('peh-panel-hidden', showEngine);
    tabEngineBtn.classList.toggle('peh-tab--active', showEngine);
    tabLayersBtn.classList.toggle('peh-tab--active', !showEngine);
    tabEngineBtn.setAttribute('aria-selected', showEngine ? 'true' : 'false');
    tabLayersBtn.setAttribute('aria-selected', !showEngine ? 'true' : 'false');
  }

  if (useTabs && colorControls) {
    colorControls.classList.add('peh-color-center-host');

    layersPanel = el('div', 'peh-panel-native');
    layersPanel.id = 'peh-native-color-layers-panel';
    layersPanel.setAttribute('role', 'tabpanel');
    layersPanel.setAttribute('aria-label', 'Color layers');

    while (colorControls.firstChild) {
      layersPanel.appendChild(colorControls.firstChild);
    }

    const tabBar = el('div', 'peh-tabs');
    tabBar.setAttribute('role', 'tablist');
    tabBar.setAttribute('aria-label', 'Color tools');

    tabEngineBtn = document.createElement('button');
    tabEngineBtn.type = 'button';
    tabEngineBtn.className = 'peh-tab peh-tab--active';
    tabEngineBtn.textContent = 'Palette Engine';
    tabEngineBtn.setAttribute('role', 'tab');
    tabEngineBtn.setAttribute('aria-selected', 'true');
    tabEngineBtn.setAttribute('aria-controls', 'peh-palette-engine-panel');
    tabEngineBtn.id = 'peh-tab-palette-engine';

    tabLayersBtn = document.createElement('button');
    tabLayersBtn.type = 'button';
    tabLayersBtn.className = 'peh-tab';
    tabLayersBtn.textContent = 'Color Layers';
    tabLayersBtn.setAttribute('role', 'tab');
    tabLayersBtn.setAttribute('aria-selected', 'false');
    tabLayersBtn.setAttribute('aria-controls', 'peh-native-color-layers-panel');
    tabLayersBtn.id = 'peh-tab-color-layers';

    tabBar.appendChild(tabEngineBtn);
    tabBar.appendChild(tabLayersBtn);

    engineWrap = el('div', 'peh-engine-wrap');
    engineWrap.id = 'peh-palette-engine-panel';
    engineWrap.setAttribute('role', 'tabpanel');
    engineWrap.setAttribute('aria-label', 'Palette engine');
    engineWrap.appendChild(root);

    colorControls.appendChild(tabBar);
    colorControls.appendChild(engineWrap);
    colorControls.appendChild(layersPanel);

    tabEngineBtn.addEventListener('click', () => setCenterTab('engine'));
    tabLayersBtn.addEventListener('click', () => setCenterTab('layers'));

    setCenterTab('engine');
  } else {
    const container = layerInputsFallback || document.body;
    root.style.margin = '12px 0';
    root.style.padding = '12px 14px';
    root.style.border = '1px solid #3a3a3a';
    root.style.borderRadius = '10px';
    root.style.background = '#151515';
    root.style.maxWidth = '820px';
    container.prepend(root);
  }

  let lastComputed = null;
  let lastContextKey = '';
  let contextDebounce = null;
  /** @type {MutationObserver | null} */
  let layerInputsObserver = null;
  /** @type {HTMLElement | null} */
  let observedLayerHost = null;

  function scheduleAutoComputeFromPattern() {
    if (contextDebounce) clearTimeout(contextDebounce);
    contextDebounce = setTimeout(() => {
      contextDebounce = null;
      const k = getPaletteHookContextKey();
      if (k === lastContextKey) return;
      compute();
    }, 100);
  }

  function ensureLayerInputsObserver() {
    const host = document.getElementById('layerInputsContainer');
    if (!host || host === observedLayerHost) return;
    observedLayerHost = host;
    if (layerInputsObserver) layerInputsObserver.disconnect();
    layerInputsObserver = new MutationObserver(() => scheduleAutoComputeFromPattern());
    layerInputsObserver.observe(host, { childList: true, subtree: false });
  }

  function readStrength() {
    const v = parseFloat(strengthRange.value);
    const t = Number.isNaN(v) ? DEFAULT_ARTIST_STRENGTH : clamp(v, 0, 1);
    strengthOut.textContent = t.toFixed(2);
    return t;
  }

  function compute() {
    const hex = normalizeHex(baseHex.value);
    baseHex.value = hex;
    try {
      baseColor.value = hex;
    } catch (_e) {}

    const harmony = harmonySel.value || 'analogous';
    const style = styleSel.value || 'none';
    const artist = artistSel.value || 'none';
    const strength = readStrength();

    const mohawkRoles = readActiveMohawkRoles();
    const genOpt = buildGenerateOptions(harmony, style, artist, strength);
    const pal = mohawkRoles
      ? generatePaletteFromMohawkRoles(mohawkRoles, genOpt)
      : generatePalette(hex, genOpt);
    lockPalette(pal);
    const locked = getLockedPalette();
    if (!locked) throw new Error('palette lock failed');

    const layerCount = getColorableLayerCount();
    const ideal = ensureLayerContrast(locked, layerCount) || locked;

    /** Mohawk: seed expansion with explicit field color; neutral stays engine-blended. */
    const inner = mohawkRoles
      ? expandPaletteTo12({
          primary: ideal.primary,
          secondary: ideal.secondary,
          accent: ideal.accent,
          neutral: ideal.neutral,
          background: mohawkRoles.background
        })
      : expandPaletteTo12(ideal);

    /** Mohawk: bias layer fill order toward pattern structure (variants unchanged). */
    const expanded12 = mohawkRoles
      ? [
          mohawkRoles.background,
          mohawkRoles.linework,
          ideal.primary,
          ideal.secondary,
          ideal.accent,
          ...inner.slice(5)
        ]
      : inner;

    const demoMatchOpts = {
      primary: { maxDeltaE: 12 },
      secondary: { maxDeltaE: 18 },
      accent: { maxDeltaE: 18 },
      neutral: { maxDeltaE: 22 },
      background: { maxDeltaE: 22 }
    };

    const conformedBase = conformPaletteToPaintLibrary(ideal, COLORFLEX_SW_CATALOG, demoMatchOpts);
    const baseMeta =
      (conformedBase && typeof conformedBase === 'object' && conformedBase._paintLibraryMeta) || {};
    const baseMatched5 = [
      conformedBase.primary || ideal.primary,
      conformedBase.secondary || ideal.secondary,
      conformedBase.accent || ideal.accent,
      conformedBase.neutral || ideal.neutral,
      conformedBase.background || ideal.background
    ];
    const baseMatches5 = [
      baseMeta.primary || matchToPaintLibrary(ideal.primary, COLORFLEX_SW_CATALOG),
      baseMeta.secondary || matchToPaintLibrary(ideal.secondary, COLORFLEX_SW_CATALOG),
      baseMeta.accent || matchToPaintLibrary(ideal.accent, COLORFLEX_SW_CATALOG),
      baseMeta.neutral || matchToPaintLibrary(ideal.neutral, COLORFLEX_SW_CATALOG),
      baseMeta.background || matchToPaintLibrary(ideal.background, COLORFLEX_SW_CATALOG)
    ];

    const usedLibHexes = new Set();
    for (const k of SLOT_KEYS) {
      const m = baseMeta[k];
      if (m && !m.usedFallback) {
        const hx = normalizeMatchHex(m.matchedHex);
        if (hx) usedLibHexes.add(hx);
      }
    }

    const mMohawkBg =
      mohawkRoles &&
      (baseMeta.background ||
        matchToPaintLibrary(mohawkRoles.background, COLORFLEX_SW_CATALOG, demoMatchOpts.background));
    const mMohawkLw =
      mohawkRoles &&
      matchToPaintLibrary(mohawkRoles.linework, COLORFLEX_SW_CATALOG, demoMatchOpts.neutral);
    if (mohawkRoles) {
      if (mMohawkBg && !mMohawkBg.usedFallback) {
        const hx = normalizeMatchHex(mMohawkBg.matchedHex);
        if (hx) usedLibHexes.add(hx);
      }
      if (mMohawkLw && !mMohawkLw.usedFallback) {
        const hx = normalizeMatchHex(mMohawkLw.matchedHex);
        if (hx) usedLibHexes.add(hx);
      }
    }

    const variantMatches = expanded12.slice(5).map((h) => {
      const m = matchToPaintLibrary(h, COLORFLEX_SW_CATALOG, {
        avoidHexes: usedLibHexes,
        maxDeltaE: 24
      });
      if (!m.usedFallback) {
        const hx = normalizeMatchHex(m.matchedHex);
        if (hx) usedLibHexes.add(hx);
      }
      return m;
    });
    const matchResults12 = mohawkRoles
      ? [mMohawkBg, mMohawkLw, baseMatches5[0], baseMatches5[1], baseMatches5[2]].concat(variantMatches)
      : baseMatches5.concat(variantMatches);
    const matchedExpanded12 = mohawkRoles
      ? [
          conformedBase.background || ideal.background,
          mMohawkLw.matchedHex,
          baseMatched5[0],
          baseMatched5[1],
          baseMatched5[2]
        ].concat(variantMatches.map((m) => m.matchedHex))
      : baseMatched5.concat(variantMatches.map((m) => m.matchedHex));

    styleDesc.textContent = style === 'none' ? '' : (ENGINE_STYLE_DESCRIPTIONS[style] || '');
    styleDesc.hidden = !styleDesc.textContent;
    const ab = ENGINE_ARTIST_BLURBS[artist];
    artistDesc.textContent = artist === 'none' ? '' : (ab || '');
    artistDesc.hidden = !artistDesc.textContent;

    const previewSlots =
      layerCount > 0 ? Math.min(layerCount, 12) : Math.min(expanded12.length, 5);
    preview.innerHTML = '';
    preview.appendChild(renderSwatches(expanded12.slice(0, previewSlots)));
    preview.appendChild(renderSwatches(matchedExpanded12.slice(0, previewSlots)));

    mapList.innerHTML = '';
    const max = Math.min(layerCount, 12);
    const inputsForLabels = getLayerInputs();
    const variantSlotNames = [
      'Darker primary',
      'Lighter primary',
      'Darker secondary',
      'Lighter secondary',
      'Muted accent',
      'Warm neutral',
      'Cool neutral'
    ];
    /** Label for row i: pattern layer name when available (matches apply order), else engine slot name. */
    const mapRowLabel = (i) => {
      const inp = inputsForLabels[i];
      if (inp && inp.label) return String(inp.label);
      if (mohawkRoles) {
        if (i === 0) return 'Field';
        if (i === 1) return 'Structure';
        if (i === 2) return 'Primary';
        if (i === 3) return 'Secondary';
        if (i === 4) return 'Accent';
      }
      if (i < 5) return SLOT_KEYS[i][0].toUpperCase() + SLOT_KEYS[i].slice(1);
      return variantSlotNames[i - 5] || 'Layer ' + (i + 1);
    };

    for (let i = 0; i < max; i++) {
      const role = mapRowLabel(i);

      const m = matchResults12[i];
      const block = el('div', 'peh-map-detail');
      const top = el('div', 'peh-map-line');
      const chip = el('span', 'peh-chip');
      chip.style.background = m.matchedHex;
      top.appendChild(chip);
      top.appendChild(el('span', '', 'Layer ' + (i + 1) + ' — ' + role));
      block.appendChild(top);
      const codePart = m.matchedCode ? m.matchedCode + ' ' : '';
      const namePart = m.matchedName || '(library name missing)';
      block.appendChild(
        el(
          'div',
          'peh-map-sub',
          'Matched: ' + codePart + namePart + ' — ' + m.matchedHex
        )
      );
      mapList.appendChild(block);
    }

    const warnParts = [];
    if (layerCount > 12) {
      warnParts.push(
        'This pattern has ' +
          layerCount +
          ' layers. Palette auto-fill currently supports up to 12. Please review manually.'
      );
    }
    if (typeof window.applyColorsToLayerInputs !== 'function') {
      warnParts.push('applyColorsToLayerInputs is not available on window (needs CFM bridge).');
    }
    warn.textContent = warnParts.join(' ');

    const pushDisabled =
      layerCount < 1 || layerCount > 12 || typeof window.applyColorsToLayerInputs !== 'function';
    updatePreviewsBtn.disabled = pushDisabled;

    lastComputed = {
      locked,
      layerCount,
      expanded12,
      matchedExpanded12,
      matchResults12
    };

    lastContextKey = getPaletteHookContextKey();
  }

  /**
   * Recompute palette, then applyColorsToLayerInputs (CFM updateDisplays / previews).
   * @param {string} doneMessage
   */
  function pushPaletteToLayers(doneMessage) {
    compute();
    if (!window.appState) {
      warn.textContent = 'ColorFlex appState not found.';
      return;
    }
    const layerCount = lastComputed.layerCount;
    if (layerCount < 1) {
      warn.textContent = 'No color layers detected yet. Select a ColorFlex pattern, then try again.';
      return;
    }
    if (layerCount > 12) {
      warn.textContent =
        'This pattern has ' +
        layerCount +
        ' layers. Palette auto-fill supports up to 12. Please set colors manually.';
      return;
    }
    if (typeof window.applyColorsToLayerInputs !== 'function') {
      warn.textContent = 'applyColorsToLayerInputs() not on window. Cannot inject safely.';
      return;
    }

    const source12 = lastComputed.matchedExpanded12;
    const proposed = computeProposedLayerColors(source12, layerCount);
    const colorsArray = buildColorsArrayForApply(proposed);
    window.applyColorsToLayerInputs(colorsArray, []);
    warn.textContent = doneMessage;
  }

  baseColor.addEventListener('input', () => {
    baseHex.value = baseColor.value;
    compute();
  });
  baseHex.addEventListener('change', compute);
  baseHex.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') compute();
  });
  harmonySel.addEventListener('change', compute);
  styleSel.addEventListener('change', compute);
  artistSel.addEventListener('change', compute);
  strengthRange.addEventListener('input', compute);
  updatePreviewsBtn.addEventListener('click', () =>
    pushPaletteToLayers('Applied to layers. Use ColorFlex controls to tweak or undo.')
  );

  compute();

  ensureLayerInputsObserver();
  const contextWatchId = window.setInterval(() => {
    try {
      ensureLayerInputsObserver();
      const k = getPaletteHookContextKey();
      if (k !== lastContextKey) scheduleAutoComputeFromPattern();
    } catch (_e) {}
  }, 320);
  root.dataset.pehContextWatchId = String(contextWatchId);
}

function schedulePaletteHookInit() {
  const run = () => {
    try {
      initColorFlexPaletteHook();
    } catch (e) {
      console.warn('[PaletteEngineHook] init failed:', e);
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
}

schedulePaletteHookInit();
