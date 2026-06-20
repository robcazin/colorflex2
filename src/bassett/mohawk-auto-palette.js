/**
 * Mohawk-auto: expand generated palette + Mohawk weights into per-layer hexes for ColorFlex.
 */
import { generatePaletteFromMohawkRoles } from '../color/paletteEngine.js';
import { hexToRgb, rgbToHex } from '../color/colorPrimitives.js';

function mixHex(a, b, t) {
  const u = Math.max(0, Math.min(1, t));
  const A = hexToRgb(a.startsWith('#') ? a : '#' + a);
  const B = hexToRgb(b.startsWith('#') ? b : '#' + b);
  return rgbToHex(
    Math.round(A.r + (B.r - A.r) * u),
    Math.round(A.g + (B.g - A.g) * u),
    Math.round(A.b + (B.b - A.b) * u)
  );
}

function normalizeWeights(w) {
  const keys = ['field', 'structure', 'motif', 'secondary', 'accent'];
  const raw = keys.map((k) => Math.max(0, Number(w[k]) || 0));
  const sum = raw.reduce((a, b) => a + b, 0) || 1;
  const out = {};
  keys.forEach((k, i) => {
    out[k] = raw[i] / sum;
  });
  return out;
}

/**
 * @param {{ background: string, linework: string, accent: string }} roles
 * @param {{ field: number, structure: number, motif: number, secondary: number, accent: number }} weights
 * @param {number} colorableCount — layers with non-null color (excludes shadows)
 * @returns {{ palette: object, layerHexes: string[] }}
 */
export function buildMohawkAutoPalette(roles, weights, colorableCount) {
  const w = normalizeWeights(weights);
  const pal = generatePaletteFromMohawkRoles(roles, { style: 'none', artist: 'none' });

  const bucketDefs = [
    { key: 'field', hex: pal.background, w: w.field },
    { key: 'structure', hex: pal.secondary, w: w.structure },
    { key: 'motif', hex: pal.accent, w: w.motif },
    { key: 'secondary', hex: pal.neutral, w: w.secondary },
    { key: 'accent', hex: pal.primary, w: w.accent }
  ];

  const n = Math.max(1, Math.floor(colorableCount));
  const counts = bucketDefs.map((b) => Math.floor(n * b.w));
  let used = counts.reduce((a, b) => a + b, 0);
  let r = 0;
  while (used < n && r < 100) {
    const i = r % counts.length;
    counts[i]++;
    used++;
    r++;
  }
  while (used > n) {
    const idx = counts.indexOf(Math.max(...counts));
    if (counts[idx] > 0) {
      counts[idx]--;
      used--;
    } else break;
  }

  const stream = [];
  bucketDefs.forEach((b, i) => {
    for (let j = 0; j < counts[i]; j++) stream.push(b.hex);
  });
  while (stream.length < n) stream.push(pal.background);
  stream.length = n;

  /** Interleave so adjacent layers are not always the same bucket */
  const interleaved = [];
  let left = 0;
  let right = stream.length - 1;
  let flip = true;
  while (left <= right) {
    if (flip) {
      interleaved.push(stream[left]);
      left++;
    } else {
      interleaved.push(stream[right]);
      right--;
    }
    flip = !flip;
  }

  const layerHexes = interleaved.slice(0, n);
  return { palette: pal, layerHexes };
}

/**
 * Warm vs cool from average hue of role hexes.
 */
export function carpetIsWarmNeutral(roles) {
  const list = [roles.background, roles.linework, roles.accent];
  let sumHue = 0;
  let n = 0;
  for (const h of list) {
    const rgb = hexToRgb(h.startsWith('#') ? h : '#' + h);
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let hue = 0;
    if (d > 1e-6) {
      if (max === r) hue = ((g - b) / d) % 6;
      else if (max === g) hue = (b - r) / d + 2;
      else hue = (r - g) / d + 4;
      hue *= 60;
      if (hue < 0) hue += 360;
    }
    sumHue += hue;
    n++;
  }
  const avg = n ? sumHue / n : 45;
  return avg >= 30 && avg <= 100;
}

function luminance(hex) {
  const { r, g, b } = hexToRgb(hex.startsWith('#') ? hex : '#' + hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/**
 * Deterministic trim + carpet floor tints for Bassett composite overlay (CFM reads appState.mohawkMockupTints).
 */
export function computeMohawkMockupTints(palette, roles, wallpaperAvgLuminance) {
  const warm = carpetIsWarmNeutral(roles);
  const wallLum = wallpaperAvgLuminance != null ? wallpaperAvgLuminance : luminance(palette.background);
  const contrast = Math.abs(luminance(palette.accent) - luminance(palette.background));

  let trimHex = warm ? '#f5f0e6' : '#f4f6f8';
  if (warm) trimHex = mixHex('#f5f0e6', '#fff8e7', 0.35);
  else trimHex = mixHex('#f4f6f8', '#e8ecef', 0.25);

  if (wallLum < 0.35) {
    trimHex = mixHex(trimHex, '#ffffff', 0.45);
  } else if (wallLum > 0.85) {
    trimHex = mixHex(trimHex, '#6b6560', 0.22);
  }

  trimHex = mixHex(trimHex, palette.neutral, 0.15);
  trimHex = mixHex(trimHex, palette.accent, 0.08);

  const carpetHex = mixHex(palette.background, roles.background, 0.55);
  const wallWashHex = mixHex(palette.neutral, palette.background, 0.4);

  return {
    trimHex,
    carpetHex,
    wallWashHex,
    warmNeutral: warm,
    wallpaperLuminance: wallLum,
    contrast
  };
}
