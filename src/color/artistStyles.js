/**
 * artistStyles.js — deterministic “artist influence” HSL shaping (color behavior only).
 * Applied after harmony + design style. Full transform is blended toward original by
 * `artistStrength` (default 0.35) so artist stays a lighter layer than style.
 */

const SLOTS = ['primary', 'secondary', 'accent', 'neutral', 'background'];

export const DEFAULT_ARTIST_STRENGTH = 0.35;

/** One-line blurbs for UI (plain English, not reproduction). */
export const ENGINE_ARTIST_BLURBS = {
  none: '',
  monet: 'Luminous atmosphere: softened complements, blue-violet shadows, lifted lights.',
  picasso: 'Structured emotion: cool shadow blues, ochre counterpoints, sharper value splits.',
  dali: 'Theatrical warmth: desert light, lifted highlights, deep but warm shadows.',
  sargent: 'Refined balance: restrained chroma, warm neutrals, elegant darks.',
  lichtenstein: 'Graphic pop: primaries, high saturation, poster-like separation.',
  vangogh: 'Energetic complements: gold lights, blue shadows, expressive saturation.',
  matisse: 'Decorative joy: high chroma blocks, warm/cool play, cheerful mids.',
  okeeffe: 'Organic desert-floral: muted jewels, warm earth, smooth tonal steps.'
};

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function hueAdd(h, deg) {
  return ((h + deg) % 360 + 360) % 360;
}

function lerpHue(h, target, t) {
  let d = target - h;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return hueAdd(h, d * clamp(t, 0, 1));
}

/** Shortest-arc hue blend from `from` toward `to` by amount t in [0,1]. */
function lerpHsl(from, to, t) {
  const tt = clamp(t, 0, 1);
  return {
    h: lerpHue(from.h, to.h, tt),
    s: lerp(from.s, to.s, tt),
    l: lerp(from.l, to.l, tt)
  };
}

/** @typedef {{ baseHue: number }} ArtistCtx */

function nearestAnchorHue(h, anchors) {
  let best = anchors[0];
  let bd = 999;
  for (const a of anchors) {
    let d = Math.abs(h - a);
    if (d > 180) d = 360 - d;
    if (d < bd) {
      bd = d;
      best = a;
    }
  }
  return best;
}

/** ---------- Monet: luminous, atmospheric, colored shadows ---------- */
function artistMonetFull(hsl, slotKey, ctx) {
  const bh = ctx.baseHue;
  let { h, s, l } = hsl;
  const corridor = [210, 125, 58, 15, 345];
  h = lerpHue(h, nearestAnchorHue(h, corridor), 0.22);
  l = clamp(l + 0.14 * (0.55 + 0.45 * (1 - l)), 0.08, 0.97);
  s = clamp(s * 0.88, 0.04, 0.8);
  const isDark = l < 0.42;
  if (isDark || slotKey === 'neutral') {
    h = lerpHue(h, 268, isDark ? 0.38 : 0.18);
    s = clamp(s * 0.75 + 0.12, 0.06, 0.55);
    l = clamp(l + (isDark ? 0.1 : 0.04), 0.12, 0.72);
  }
  if (slotKey === 'accent') {
    h = lerpHue(h, hueAdd(bh, 165), 0.28);
    s = clamp(s * 0.9, 0.08, 0.72);
    l = clamp(l + 0.06, 0.2, 0.68);
  }
  if (slotKey === 'secondary') {
    h = lerpHue(h, hueAdd(bh, -32), 0.12);
  }
  if (slotKey === 'background') {
    s = clamp(s * 0.68, 0.02, 0.22);
    l = clamp(l + 0.04, 0.9, 0.98);
  }
  l = clamp(0.5 + (l - 0.5) * 0.88, 0.06, 0.98);
  return { h, s, l };
}

/** ---------- Picasso: cool shadows, ochre warmth, reduced naturalism ---------- */
function artistPicassoFull(hsl, slotKey, ctx) {
  const bh = ctx.baseHue;
  let { h, s, l } = hsl;
  const inBlueFamily = bh >= 185 && bh <= 275;
  if (l < 0.45 || slotKey === 'accent') {
    h = lerpHue(h, 218, 0.28);
    s = clamp(s * 0.82 + 0.08, 0.1, 0.75);
    l = slotKey === 'accent' ? clamp(l * 0.82 - 0.05, 0.08, 0.42) : clamp(l * 0.94, 0.1, 0.48);
  }
  if (slotKey === 'secondary' || (slotKey === 'primary' && !inBlueFamily)) {
    h = lerpHue(h, 38, 0.16);
    l = clamp(l + 0.03, 0.22, 0.78);
  }
  if (slotKey === 'neutral') {
    h = lerpHue(h, inBlueFamily ? 215 : 42, 0.2);
    s = clamp(s * 0.72, 0.04, 0.26);
    l = clamp(0.5 + (l - 0.5) * 1.08, 0.42, 0.62);
  }
  if (slotKey === 'background') {
    s = clamp(s * 0.85, 0.03, 0.24);
    l = clamp(l * 0.98 + 0.01, 0.86, 0.96);
  }
  if (l >= 0.55) {
    l = clamp(0.52 + (l - 0.52) * 1.12, 0.5, 0.94);
  } else if (l <= 0.4) {
    l = clamp(0.08 + l * 0.85, 0.08, 0.44);
  }
  return { h, s, l };
}

/** ---------- Dalí: golden desert, theatrical contrast, one sharper accent ---------- */
function artistDaliFull(hsl, slotKey, ctx) {
  let { h, s, l } = hsl;
  h = lerpHue(h, 44, 0.24);
  if (l > 0.58 || slotKey === 'background') {
    l = clamp(l + 0.12 * (slotKey === 'background' ? 0.8 : 1), 0.72, 0.98);
    s = clamp(s * 1.05 + 0.04, 0.06, 0.38);
  }
  if (l < 0.42 || slotKey === 'accent') {
    l = clamp(l * 0.78 - (slotKey === 'accent' ? 0.08 : 0.04), 0.07, 0.44);
    h = lerpHue(h, 28, slotKey === 'accent' ? 0.2 : 0.1);
    s = clamp(s * (slotKey === 'accent' ? 1.35 : 1.05), 0.12, 1);
  }
  if (slotKey === 'accent') {
    h = hueAdd(h, 14);
    s = clamp(s * 1.15, 0.2, 1);
  }
  if (slotKey === 'neutral') {
    h = lerpHue(h, 55, 0.15);
    s = clamp(s * 0.9, 0.05, 0.32);
    l = clamp(l * 0.96 + 0.02, 0.4, 0.62);
  }
  if (slotKey === 'secondary') {
    l = clamp(l + 0.05, 0.25, 0.82);
  }
  return { h, s, l };
}

/** ---------- Sargent: restrained chroma, warm neutrals, rich darks ---------- */
function artistSargentFull(hsl, slotKey, ctx) {
  let { h, s, l } = hsl;
  h = lerpHue(h, 34, 0.12);
  s = clamp(s * 0.72, 0.03, 0.58);
  if (slotKey === 'neutral' || slotKey === 'background') {
    h = lerpHue(h, 32, 0.18);
    s = clamp(s * 0.78, 0.02, 0.16);
    l =
      slotKey === 'background'
        ? clamp(l * 0.96 + 0.02, 0.82, 0.94)
        : clamp(0.5 + (l - 0.5) * 0.9, 0.44, 0.62);
  }
  if (slotKey === 'accent') {
    s = clamp(s * 0.88, 0.06, 0.45);
    l = clamp(l * 0.92, 0.14, 0.48);
  }
  if (slotKey === 'primary' || slotKey === 'secondary') {
    l = clamp(0.48 + (l - 0.48) * 1.04, 0.18, 0.72);
  }
  return { h, s, l };
}

/** ---------- Lichtenstein: graphic primaries, poster contrast ---------- */
function artistLichtensteinFull(hsl, slotKey, ctx) {
  let { h, s, l } = hsl;
  const prim = [0, 120, 240];
  let nearest = prim[0];
  let bd = 999;
  for (const p of prim) {
    let d = Math.abs(h - p);
    if (d > 180) d = 360 - d;
    if (d < bd) {
      bd = d;
      nearest = p;
    }
  }
  h = lerpHue(h, nearest, 0.38);
  s = clamp(s * 1.42, 0.28, 1);
  if (l <= 0.48) {
    l = clamp(0.05 + l * 0.68, 0.06, 0.42);
  } else {
    l = clamp(0.56 + (l - 0.48) * 1.25, 0.52, 0.96);
  }
  if (slotKey === 'neutral') {
    h = lerpHue(h, nearest, 0.25);
    s = clamp(s * 0.95, 0.15, 0.52);
    l = clamp(l + 0.02, 0.48, 0.68);
  }
  if (slotKey === 'background') {
    s = clamp(s * 0.65, 0.02, 0.2);
    l = clamp(l + 0.03, 0.9, 0.99);
  }
  return { h, s, l };
}

/** ---------- van Gogh: gold lights, blue shadows, complementary tension ---------- */
function artistVangoghFull(hsl, slotKey, ctx) {
  const bh = ctx.baseHue;
  let { h, s, l } = hsl;
  const comp = hueAdd(bh, 172);
  if (l > 0.52 || slotKey === 'secondary') {
    h = lerpHue(h, 54, slotKey === 'secondary' ? 0.22 : 0.18);
    s = clamp(s * 1.18, 0.15, 1);
    l = clamp(l + 0.04, 0.22, 0.92);
  }
  if (l < 0.48 || slotKey === 'accent') {
    h = lerpHue(h, 228, slotKey === 'accent' ? 0.32 : 0.2);
    s = clamp(s * 1.12, 0.12, 1);
    l = clamp(l * 0.88 - (slotKey === 'accent' ? 0.06 : 0.02), 0.08, 0.52);
  }
  if (slotKey === 'primary') {
    h = lerpHue(h, lerpHue(bh, comp, 0.4), 0.1);
    s = clamp(s * 1.1, 0.12, 1);
  }
  if (slotKey === 'neutral') {
    h = lerpHue(h, 235, 0.12);
    s = clamp(s * 0.85, 0.05, 0.35);
  }
  if (slotKey === 'background') {
    l = clamp(l + 0.02, 0.88, 0.98);
    s = clamp(s * 0.9, 0.05, 0.35);
  }
  return { h, s, l };
}

/** ---------- Matisse: high chroma, decorative separation ---------- */
function artistMatisseFull(hsl, slotKey, ctx) {
  let { h, s, l } = hsl;
  const warmT = 78;
  const coolT = hueAdd(h, -95);
  if (slotKey === 'accent') {
    h = lerpHue(h, coolT, 0.28);
    s = clamp(s * 1.35, 0.25, 1);
    l = clamp(0.42 + (l - 0.42) * 1.15, 0.22, 0.68);
  } else if (slotKey === 'secondary') {
    h = lerpHue(h, warmT, 0.22);
    s = clamp(s * 1.28, 0.2, 1);
    l = clamp(l + 0.05, 0.35, 0.78);
  } else {
    h = lerpHue(h, hueAdd(h, 55), 0.14);
    s = clamp(s * 1.22, 0.14, 1);
  }
  if (slotKey === 'neutral') {
    s = clamp(s * 1.15, 0.12, 0.5);
    l = clamp(l + 0.03, 0.5, 0.7);
    h = lerpHue(h, 340, 0.08);
  }
  if (slotKey === 'background') {
    s = clamp(s * 1.2, 0.08, 0.42);
    l = clamp(l + 0.02, 0.84, 0.97);
  }
  if (l > 0.55) l = clamp(0.54 + (l - 0.55) * 1.15, 0.52, 0.93);
  return { h, s, l };
}

/** ---------- O'Keeffe: warm earth, muted jewel, smooth transitions ---------- */
function artistOkeeffeFull(hsl, slotKey, ctx) {
  let { h, s, l } = hsl;
  h = lerpHue(h, 22, 0.16);
  s = clamp(s * 0.78, 0.04, 0.65);
  if (slotKey === 'accent') {
    h = lerpHue(h, 355, 0.12);
    s = clamp(s * 1.08, 0.1, 0.52);
    l = clamp(0.4 + (l - 0.4) * 0.88, 0.28, 0.58);
  }
  if (slotKey === 'neutral') {
    h = lerpHue(h, 35, 0.14);
    s = clamp(s * 0.85, 0.03, 0.2);
    l = clamp(l * 0.97 + 0.02, 0.48, 0.64);
  }
  if (slotKey === 'background') {
    h = lerpHue(h, 48, 0.1);
    s = clamp(s * 0.75, 0.02, 0.18);
    l = clamp(l * 0.99 + 0.01, 0.9, 0.97);
  }
  l = clamp(0.5 + (l - 0.5) * 0.88, 0.08, 0.96);
  return { h, s, l };
}

const ARTIST_MODIFIERS = {
  monet: artistMonetFull,
  picasso: artistPicassoFull,
  dali: artistDaliFull,
  sargent: artistSargentFull,
  lichtenstein: artistLichtensteinFull,
  vangogh: artistVangoghFull,
  matisse: artistMatisseFull,
  okeeffe: artistOkeeffeFull
};

export const ENGINE_ARTIST_IDS = [
  'none',
  'monet',
  'picasso',
  'dali',
  'sargent',
  'lichtenstein',
  'vangogh',
  'matisse',
  'okeeffe'
];

/**
 * @param {Record<string, { h: number, s: number, l: number }>} hslSlots
 * @param {string} artistId
 * @param {number} baseHue
 * @param {number} [artistStrength] 0..1 blend toward full artist transform; default DEFAULT_ARTIST_STRENGTH
 */
export function applyArtistToPaletteHsl(hslSlots, artistId, baseHue, artistStrength) {
  if (!artistId || artistId === 'none') return hslSlots;
  const fn = ARTIST_MODIFIERS[artistId];
  if (!fn) return hslSlots;

  let t =
    artistStrength == null || Number.isNaN(Number(artistStrength))
      ? DEFAULT_ARTIST_STRENGTH
      : Number(artistStrength);
  t = clamp(t, 0, 1);

  const ctx = { baseHue: ((baseHue % 360) + 360) % 360 };
  const out = {};
  for (const k of SLOTS) {
    const src = hslSlots[k];
    if (!src) continue;
    const full = fn({ h: src.h, s: src.s, l: src.l }, k, ctx);
    out[k] = lerpHsl(src, full, t);
  }
  return out;
}
