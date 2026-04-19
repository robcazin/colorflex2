/**
 * paletteStyles.js — design-style modifiers on HSL (post-harmony, pre-artist).
 * Each style applies slot-aware rules, then shared refinement: clamp extremes,
 * preserve roles, enforce separation, subtle cohesion toward base hue.
 */

const SLOTS = ['primary', 'secondary', 'accent', 'neutral', 'background'];

export const ENGINE_STYLE_IDS = [
  'none',
  'renaissance',
  'bauhaus',
  'minimal',
  'scandinavian',
  'coastal',
  'earth',
  'luxury',
  'pastel'
];

/** Short dropdown labels */
export const ENGINE_STYLE_LABELS = {
  none: 'None (harmony only)',
  renaissance: 'Renaissance',
  bauhaus: 'Bauhaus',
  minimal: 'Minimal',
  scandinavian: 'Scandinavian',
  coastal: 'Coastal',
  earth: 'Earth',
  luxury: 'Luxury',
  pastel: 'Pastel'
};

/** One-line descriptions for demo UI */
export const ENGINE_STYLE_DESCRIPTIONS = {
  none: '',
  renaissance: 'Warm, muted; compressed geometry; earthy neutrals.',
  bauhaus: 'Bold planes; high saturation; strong light/dark split.',
  minimal: 'Heavy calm; neutrals lead; narrow chroma.',
  scandinavian: 'Bright, neutral, calm — cool bias, soft contrast.',
  coastal: 'Airy blues and aquas; sandy neutrals; soft contrast.',
  earth: 'Warm organic clay, olive, ochre; grounded, mid saturation.',
  luxury: 'Deep darks, crisp lights; refined gold accent; no neon.',
  pastel: 'Soft, light, gentle — low saturation, airy background.'
};

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
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

function cloneSlots(slots) {
  /** @type {Record<string, { h: number, s: number, l: number }>} */
  const o = {};
  for (const k of SLOTS) {
    if (!slots[k]) continue;
    o[k] = { h: slots[k].h, s: slots[k].s, l: slots[k].l };
  }
  return o;
}

/** Normalized HSL distance in [0, ~1.2] */
function hslDistance(a, b) {
  let dh = Math.abs(a.h - b.h);
  if (dh > 180) dh = 360 - dh;
  dh /= 360;
  const ds = a.s - b.s;
  const dl = a.l - b.l;
  return Math.sqrt(dh * dh + ds * ds + dl * dl);
}

/**
 * @param {Record<string, { h: number, s: number, l: number }>} slots
 * @param {string} styleId
 * @param {number} baseHue
 */
function refinePaletteAfterStyle(slots, styleId, baseHue) {
  const baseH = ((baseHue % 360) + 360) % 360;
  const s = cloneSlots(slots);

  for (const k of SLOTS) {
    if (!s[k]) continue;
    s[k].s = clamp(s[k].s, 0.03, 0.94);
    s[k].l = clamp(s[k].l, 0.06, 0.97);
  }

  if (s.background.l < 0.76) {
    s.background.l = clamp(s.background.l + 0.07, 0.78, 0.98);
  }
  if (s.background.s > 0.34) {
    s.background.s = clamp(s.background.s * 0.85, 0.02, 0.32);
  }

  if (s.neutral.s > s.primary.s * 0.75 && s.primary.s > 0.12) {
    s.neutral.s = clamp(s.primary.s * 0.52, 0.03, 0.36);
  }

  if (s.primary.s < s.secondary.s * 0.88 && s.secondary.s > 0.06) {
    s.primary.s = clamp(s.secondary.s * 0.96 + 0.02, 0.07, 0.92);
  }

  const lowAccentPunch = new Set(['scandinavian', 'minimal', 'pastel']);
  if (!lowAccentPunch.has(styleId) && s.accent.s < 0.11 && s.primary.s > 0.14) {
    s.accent.s = clamp(s.accent.s + 0.1, 0.12, 0.78);
  }

  if (hslDistance(s.accent, s.secondary) < 0.075) {
    const bump = styleId === 'pastel' ? 10 : 20;
    s.accent.h = hueAdd(s.accent.h, bump);
  }
  if (Math.abs(s.accent.l - s.secondary.l) < 0.055) {
    s.accent.l = clamp(s.accent.l + (s.secondary.l >= 0.52 ? -0.08 : 0.08), 0.1, 0.9);
  }

  let dh = Math.abs(s.primary.h - s.secondary.h);
  if (dh > 180) dh = 360 - dh;
  if (dh < 14) {
    s.secondary.h = hueAdd(s.secondary.h, 15);
  }

  if (s.neutral.l > s.background.l - 0.06) {
    s.neutral.l = clamp(s.background.l - 0.14, 0.36, 0.72);
  }

  const cohesionByStyle = {
    scandinavian: 0.062,
    coastal: 0.058,
    earth: 0.068,
    luxury: 0.042,
    pastel: 0.072,
    renaissance: 0.058,
    bauhaus: 0.038,
    minimal: 0.052
  };
  const c0 = cohesionByStyle[styleId] ?? 0.054;
  for (const k of SLOTS) {
    if (!s[k]) continue;
    const t =
      k === 'background' ? c0 * 0.48 : k === 'accent' ? c0 * 0.88 : k === 'neutral' ? c0 * 0.58 : c0 * 0.62;
    s[k].h = lerpHue(s[k].h, baseH, t);
  }

  for (const k of SLOTS) {
    if (!s[k]) continue;
    s[k].s = clamp(s[k].s, 0.025, 0.95);
    s[k].l = clamp(s[k].l, 0.05, 0.98);
  }

  return s;
}

/**
 * @param {{ h: number, s: number, l: number }} hsl
 * @param {string} slotKey
 * @param {number} baseHue
 */
function styleRenaissance(hsl, slotKey, baseHue) {
  let { h, s, l } = hsl;
  h = lerpHue(h, 38, 0.11);
  s = clamp(s * 0.76, 0.05, 0.85);
  l = 0.47 + (l - 0.47) * 0.7;
  if (slotKey === 'neutral' || slotKey === 'background') {
    s = clamp(s * 0.8, 0.03, 0.32);
    l =
      slotKey === 'background'
        ? clamp(l * 0.97 + 0.02, 0.83, 0.96)
        : clamp(l * 0.98, 0.43, 0.61);
  }
  if (slotKey === 'accent') {
    h = lerpHue(h, hueAdd(baseHue, 162), 0.08);
    s = clamp(s * 0.92, 0.08, 0.72);
  }
  l = clamp(0.5 + (l - 0.5) * 0.9, 0.08, 0.95);
  return { h, s, l };
}

function styleBauhaus(hsl, slotKey, baseHue) {
  let { h, s, l } = hsl;
  if (s < 0.22) {
    s = clamp(s * 1.1, 0.05, 0.32);
  } else {
    s = clamp(s * 1.18, 0.14, 0.95);
  }
  if (l <= 0.48) {
    l = clamp(0.1 + l * 0.76, 0.08, 0.45);
  } else {
    l = clamp(0.53 + (l - 0.48) * 1.2, 0.52, 0.93);
  }
  if (slotKey === 'neutral') {
    s = clamp(s * 0.9, 0.07, 0.38);
    l = clamp(l, 0.46, 0.62);
  }
  if (slotKey === 'background') {
    s = clamp(s * 0.75, 0.02, 0.18);
    l = clamp(l + 0.02, 0.9, 0.98);
  }
  return { h, s, l };
}

function styleMinimal(hsl, slotKey, baseHue) {
  let { h, s, l } = hsl;
  h = lerpHue(h, hueAdd(h, 14), 0.05);
  s = clamp(s * 0.34, 0.03, 0.36);
  l = clamp(0.5 + (l - 0.5) * 0.44, 0.36, 0.72);
  if (slotKey === 'background') {
    l = clamp(l + 0.2, 0.8, 0.96);
    s = clamp(s * 0.82, 0.02, 0.16);
  }
  if (slotKey === 'neutral') {
    s = clamp(s * 0.88, 0.03, 0.2);
    l = clamp(l * 0.96 + 0.02, 0.46, 0.63);
  }
  if (slotKey === 'accent') {
    s = clamp(s * 1.05, 0.06, 0.32);
  }
  return { h, s, l };
}

function styleScandinavian(hsl, slotKey, baseHue) {
  let { h, s, l } = hsl;
  const cool = 218;
  h = lerpHue(h, cool, slotKey === 'background' ? 0.06 : 0.14);
  s = clamp(s * 0.58, 0.04, slotKey === 'primary' ? 0.48 : 0.38);
  l = clamp(0.56 + (l - 0.5) * 0.55, 0.48, 0.94);
  if (slotKey === 'neutral') {
    s = clamp(s * 0.75, 0.02, 0.16);
    l = clamp(0.52 + (l - 0.52) * 0.75, 0.48, 0.68);
  }
  if (slotKey === 'background') {
    s = clamp(s * 0.65, 0.02, 0.12);
    l = clamp(l + 0.06, 0.9, 0.98);
  }
  if (slotKey === 'accent') {
    h = lerpHue(h, hueAdd(baseHue, 158), 0.1);
    s = clamp(s * 0.85, 0.08, 0.42);
    l = clamp(l + 0.02, 0.55, 0.88);
  }
  l = clamp(0.5 + (l - 0.5) * 0.82, 0.12, 0.96);
  return { h, s, l };
}

function styleCoastal(hsl, slotKey, baseHue) {
  let { h, s, l } = hsl;
  const sea = 202;
  const sand = 78;
  if (slotKey === 'primary' || slotKey === 'secondary') {
    h = lerpHue(h, sea, 0.18);
    s = clamp(s * 0.88, 0.1, 0.72);
    l = clamp(l + 0.06, 0.38, 0.86);
  }
  if (slotKey === 'accent') {
    h = lerpHue(h, 188, 0.15);
    s = clamp(s * 0.95, 0.12, 0.68);
    l = clamp(l + 0.04, 0.42, 0.82);
  }
  if (slotKey === 'neutral') {
    h = lerpHue(h, sand, 0.22);
    s = clamp(s * 0.72, 0.05, 0.28);
    l = clamp(0.5 + (l - 0.5) * 0.88, 0.46, 0.64);
  }
  if (slotKey === 'background') {
    h = lerpHue(h, 48, 0.12);
    s = clamp(s * 0.7, 0.04, 0.22);
    l = clamp(l + 0.05, 0.9, 0.98);
  }
  l = clamp(0.5 + (l - 0.5) * 0.86, 0.1, 0.97);
  return { h, s, l };
}

function styleEarth(hsl, slotKey, baseHue) {
  let { h, s, l } = hsl;
  const warm = 32;
  const olive = 88;
  const clay = 22;
  h = lerpHue(h, warm, 0.12);
  s = clamp(s * 0.82, 0.08, 0.62);
  l = clamp(0.48 + (l - 0.48) * 0.92, 0.18, 0.78);
  if (slotKey === 'secondary') {
    h = lerpHue(h, clay, 0.14);
    s = clamp(s * 0.92, 0.12, 0.58);
  }
  if (slotKey === 'accent') {
    h = lerpHue(h, olive, 0.16);
    s = clamp(s * 0.88, 0.1, 0.55);
    l = clamp(l * 0.96, 0.22, 0.62);
  }
  if (slotKey === 'neutral') {
    h = lerpHue(h, 42, 0.1);
    s = clamp(s * 0.75, 0.04, 0.26);
    l = clamp(l * 0.97 + 0.01, 0.44, 0.6);
  }
  if (slotKey === 'background') {
    h = lerpHue(h, 55, 0.08);
    s = clamp(s * 0.8, 0.04, 0.2);
    l = clamp(l + 0.03, 0.88, 0.96);
  }
  return { h, s, l };
}

function styleLuxury(hsl, slotKey, baseHue) {
  let { h, s, l } = hsl;
  const gold = 46;
  if (slotKey === 'primary' || slotKey === 'secondary') {
    if (l > 0.48) {
      l = clamp(0.52 + (l - 0.48) * 1.15, 0.5, 0.92);
    } else {
      l = clamp(0.08 + l * 0.72, 0.1, 0.42);
    }
    s = clamp(s * 0.92, 0.1, 0.72);
  }
  if (slotKey === 'accent') {
    h = lerpHue(h, gold, 0.28);
    s = clamp(s * 1.02, 0.18, 0.68);
    l = clamp(0.38 + (l - 0.4) * 0.9, 0.32, 0.72);
  }
  if (slotKey === 'neutral') {
    h = lerpHue(h, hueAdd(baseHue, -8), 0.08);
    s = clamp(s * 0.78, 0.05, 0.28);
    l = clamp(0.48 + (l - 0.48) * 0.95, 0.4, 0.58);
  }
  if (slotKey === 'background') {
    s = clamp(s * 0.65, 0.02, 0.14);
    l = clamp(l + 0.02, 0.9, 0.99);
  }
  s = clamp(s, 0.06, 0.72);
  return { h, s, l };
}

function stylePastel(hsl, slotKey, baseHue) {
  let { h, s, l } = hsl;
  s = clamp(s * 0.48, 0.05, 0.42);
  l = clamp(0.64 + (l - 0.5) * 0.45, 0.52, 0.93);
  if (slotKey === 'accent') {
    h = lerpHue(h, hueAdd(baseHue, 168), 0.22);
    s = clamp(s * 1.08, 0.1, 0.45);
    l = clamp(l - 0.04, 0.48, 0.82);
  }
  if (slotKey === 'secondary') {
    h = lerpHue(h, hueAdd(baseHue, -36), 0.12);
    s = clamp(s * 1.02, 0.08, 0.4);
  }
  if (slotKey === 'neutral') {
    s = clamp(s * 0.85, 0.04, 0.22);
    l = clamp(0.55 + (l - 0.55) * 0.85, 0.5, 0.72);
  }
  if (slotKey === 'background') {
    s = clamp(s * 0.7, 0.02, 0.14);
    l = clamp(l + 0.04, 0.9, 0.98);
  }
  l = clamp(0.5 + (l - 0.5) * 0.88, 0.2, 0.97);
  return { h, s, l };
}

const STYLE_MODIFIERS = {
  renaissance: styleRenaissance,
  bauhaus: styleBauhaus,
  minimal: styleMinimal,
  scandinavian: styleScandinavian,
  coastal: styleCoastal,
  earth: styleEarth,
  luxury: styleLuxury,
  pastel: stylePastel
};

/**
 * @param {Record<string, { h: number, s: number, l: number }>} hslSlots
 * @param {string} styleId
 * @param {number} [baseHue] base color hue for cohesion; defaults to primary slot
 * @returns {Record<string, { h: number, s: number, l: number }>}
 */
export function applyStyleToPaletteHsl(hslSlots, styleId, baseHue) {
  if (!styleId || styleId === 'none') return hslSlots;
  const fn = STYLE_MODIFIERS[styleId];
  if (!fn) return hslSlots;

  const bh =
    baseHue != null && !Number.isNaN(baseHue)
      ? ((baseHue % 360) + 360) % 360
      : hslSlots.primary
        ? hslSlots.primary.h
        : 0;

  const out = {};
  for (const k of SLOTS) {
    const src = hslSlots[k];
    if (!src) continue;
    out[k] = fn({ h: src.h, s: src.s, l: src.l }, k, bh);
  }
  return refinePaletteAfterStyle(out, styleId, bh);
}
