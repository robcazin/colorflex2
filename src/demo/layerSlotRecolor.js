/**
 * Demo-only: recolor a raster layer toward one palette slot while keeping alpha.
 * Not integrated with ColorFlex; proof-of-concept for per-layer slot assignment.
 */

import { hexToRgb, rgbToHsl, hslToRgb } from '../color/paletteEngine.js';

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * @param {CanvasImageSource} image
 * @param {string} slotHex #RRGGBB
 * @returns {HTMLCanvasElement}
 */
export function applyPaletteSlotToImage(image, slotHex) {
  const w = image.width | 0;
  const h = image.height | 0;
  if (w < 1 || h < 1) throw new Error('applyPaletteSlotToImage: bad dimensions');

  const slot = hexToRgb(slotHex);
  const slotH = rgbToHsl(slot.r, slot.g, slot.b);

  const src = document.createElement('canvas');
  src.width = w;
  src.height = h;
  const sctx = src.getContext('2d', { willReadFrequently: true });
  if (!sctx) throw new Error('applyPaletteSlotToImage: no 2d context');
  sctx.drawImage(image, 0, 0);
  const imgData = sctx.getImageData(0, 0, w, h);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3];
    if (a < 8) continue;

    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    const hsl = rgbToHsl(r, g, b);

    let nh = slotH.h;
    let ns;
    let nl;
    if (hsl.s < 0.07) {
      ns = clamp(slotH.s * (0.12 + hsl.s * 3), 0, 0.55);
      nl = clamp(hsl.l * 0.78 + slotH.l * 0.22, 0, 1);
    } else {
      ns = clamp(hsl.s * 0.22 + slotH.s * 0.78, 0, 1);
      nl = clamp(hsl.l * 0.62 + slotH.l * 0.38, 0, 1);
    }

    const out = hslToRgb(nh, ns, nl);
    d[i] = out.r;
    d[i + 1] = out.g;
    d[i + 2] = out.b;
  }

  const outC = document.createElement('canvas');
  outC.width = w;
  outC.height = h;
  const octx = outC.getContext('2d');
  if (!octx) throw new Error('applyPaletteSlotToImage: output context');
  octx.putImageData(imgData, 0, 0);
  return outC;
}

const SLOT_ORDER = ['primary', 'secondary', 'accent', 'neutral', 'background'];

/**
 * @param {number} layerIndex 0-based
 * @param {{ primary: string, secondary: string, accent: string, neutral: string, background: string }} palette
 */
export function slotKeyForLayerIndex(layerIndex, palette) {
  const key = SLOT_ORDER[layerIndex % SLOT_ORDER.length];
  return { key, hex: palette[key] };
}
