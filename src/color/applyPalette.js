/**
 * applyPalette.js — canvas-based recolor using a fixed 5-slot palette.
 *
 * Maps by luminance + saturation (deterministic constants).
 * Independent from palette generation; accepts any compatible palette object.
 */

import { hexToRgb, rgbToHsl } from './paletteEngine.js';

const NEUTRAL_SAT = 0.18;
const DARK_L = 0.36;
const MID_L = 0.64;

function clamp01(x) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function clampByte(x) {
  const n = Math.round(x);
  return n < 0 ? 0 : n > 255 ? 255 : n;
}

function luminance(r, g, b) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/**
 * @param {HTMLImageElement | HTMLCanvasElement | OffscreenCanvas} image
 * @param {{ primary: string, secondary: string, accent: string, neutral: string, background: string }} palette
 * @returns {HTMLCanvasElement}
 */
export function applyPaletteToImage(image, palette) {
  const w = image.width | 0;
  const h = image.height | 0;
  if (w < 1 || h < 1) {
    throw new Error('applyPaletteToImage: image has no dimensions');
  }

  const src = document.createElement('canvas');
  src.width = w;
  src.height = h;
  const sctx = src.getContext('2d', { willReadFrequently: true });
  if (!sctx) throw new Error('applyPaletteToImage: 2d context unavailable');
  sctx.drawImage(image, 0, 0);
  const imgData = sctx.getImageData(0, 0, w, h);
  const d = imgData.data;

  const pri = hexToRgb(palette.primary);
  const sec = hexToRgb(palette.secondary);
  const acc = hexToRgb(palette.accent);
  const neu = hexToRgb(palette.neutral);
  const bg = hexToRgb(palette.background);

  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3];
    if (a < 8) continue;

    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    const { s, l } = rgbToHsl(r, g, b);
    const y = luminance(r, g, b);

    let tr, tg, tb;
    if (s < NEUTRAL_SAT) {
      // Desaturated → neutral, preserve rough lightness
      const t = clamp01(l * 0.85 + 0.08);
      tr = neu.r * t + 255 * (1 - t) * 0.5;
      tg = neu.g * t + 255 * (1 - t) * 0.5;
      tb = neu.b * t + 255 * (1 - t) * 0.5;
    } else if (l < DARK_L) {
      // Dark → primary (scale by input luminance)
      const k = 0.35 + 0.65 * (y / 0.35);
      tr = (pri.r * k) | 0;
      tg = (pri.g * k) | 0;
      tb = (pri.b * k) | 0;
    } else if (l < MID_L) {
      const k = 0.4 + 0.55 * y;
      tr = (sec.r * k) | 0;
      tg = (sec.g * k) | 0;
      tb = (sec.b * k) | 0;
    } else {
      const k = 0.45 + 0.5 * y;
      tr = (acc.r * k) | 0;
      tg = (acc.g * k) | 0;
      tb = (acc.b * k) | 0;
    }

    // Slight blend toward background in highlights for cohesion
    const hi = clamp01((y - 0.55) / 0.45);
    if (hi > 0) {
      tr = tr * (1 - hi * 0.25) + bg.r * (hi * 0.25);
      tg = tg * (1 - hi * 0.25) + bg.g * (hi * 0.25);
      tb = tb * (1 - hi * 0.25) + bg.b * (hi * 0.25);
    }

    d[i] = clampByte(tr);
    d[i + 1] = clampByte(tg);
    d[i + 2] = clampByte(tb);
  }

  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const octx = out.getContext('2d');
  if (!octx) throw new Error('applyPaletteToImage: output 2d context unavailable');
  octx.putImageData(imgData, 0, 0);
  return out;
}
