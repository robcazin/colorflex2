/**
 * paletteDemo.js — browser-only POC.
 *
 * Open from a local HTTP server (ES modules):
 *   npx --yes serve -p 5050 .
 *   visit http://127.0.0.1:5050/src/demo/paletteDemo.html
 *
 * One base color → generatePalette → lockPalette. All sample images use
 * getLockedPalette() so swapping images never changes the palette.
 */

import { generatePalette, lockPalette, getLockedPalette } from '../color/paletteEngine.js';
import { applyPaletteToImage } from '../color/applyPalette.js';

/** Single driver color for the whole demo */
const DEMO_BASE_HEX = '#5a7d9a';

/** @returns {HTMLCanvasElement} horizontal ramp dark → light */
function makeRampCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, '#080808');
  g.addColorStop(0.4, '#505050');
  g.addColorStop(0.6, '#b0b0b0');
  g.addColorStop(1, '#f7f7f7');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  return c;
}

/** @returns {HTMLCanvasElement} soft blobs (mid saturation) */
function makeBlobCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, w, h);
  const rg = ctx.createRadialGradient(w * 0.35, h * 0.4, 10, w * 0.35, h * 0.4, h * 0.55);
  rg.addColorStop(0, '#8844aa');
  rg.addColorStop(1, 'rgba(40,40,60,0)');
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, w, h);
  const rg2 = ctx.createRadialGradient(w * 0.72, h * 0.55, 5, w * 0.72, h * 0.55, h * 0.45);
  rg2.addColorStop(0, '#ccaa66');
  rg2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rg2;
  ctx.fillRect(0, 0, w, h);
  return c;
}

/** @returns {HTMLCanvasElement} mostly desaturated regions */
function makeGrayCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#8a8a8a';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#c5c5c5';
  ctx.fillRect(0, 0, w * 0.5, h);
  ctx.fillStyle = '#4a4a4a';
  ctx.fillRect(w * 0.5, 0, w * 0.5, h);
  return c;
}

/**
 * @param {HTMLElement} mount
 */
export function runPaletteDemo(mount) {
  mount.innerHTML = '';

  const generated = generatePalette(DEMO_BASE_HEX);
  lockPalette(generated);
  const palette = getLockedPalette();
  if (!palette) throw new Error('paletteDemo: lock failed');

  const info = document.getElementById('palInfo');
  if (info) {
    info.textContent = [
      'base = ' + DEMO_BASE_HEX,
      'locked = ' +
        [palette.primary, palette.secondary, palette.accent, palette.neutral, palette.background].join('  ')
    ].join('  |  ');
  }

  const samples = [
    { name: 'Ramp (dark→light)', el: makeRampCanvas(220, 140) },
    { name: 'Blobs (saturated)', el: makeBlobCanvas(220, 140) },
    { name: 'Gray fields (low sat)', el: makeGrayCanvas(220, 140) }
  ];

  for (const { name, el } of samples) {
    const row = document.createElement('div');
    row.className = 'row';

    const left = document.createElement('div');
    left.className = 'slot';
    left.innerHTML = '<div>original · ' + name + '</div>';
    left.appendChild(el);

    const processed = applyPaletteToImage(el, palette);
    const right = document.createElement('div');
    right.className = 'slot';
    right.innerHTML = '<div>palette-locked</div>';
    right.appendChild(processed);

    row.appendChild(left);
    row.appendChild(right);
    mount.appendChild(row);
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function () {
    const mount = document.getElementById('mount');
    if (mount) runPaletteDemo(mount);
  });
}
