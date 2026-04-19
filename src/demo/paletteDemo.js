/**
 * paletteDemo.js — Kuler-style harmony POC (primary) + optional image recolor (secondary).
 *
 * Serve repo over HTTP, then open:
 *   http://127.0.0.1:5050/src/demo/paletteDemo.html
 */

import { lockPalette, getLockedPalette } from '../color/paletteEngine.js';
import { applyPaletteToImage } from '../color/applyPalette.js';
import { HARMONY_DEFINITIONS, generateAllHarmonyPalettes } from '../color/harmonyPalettes.js';

const SLOT_LABELS = ['primary', 'secondary', 'accent', 'neutral', 'background'];

function normalizeHex(v) {
  let h = String(v || '').trim();
  if (!h) return '#5a7d9a';
  if (h[0] !== '#') h = '#' + h;
  if (h.length === 4) {
    h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  }
  if (h.length !== 7) return '#5a7d9a';
  return h.toLowerCase();
}

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

function renderSwatchRow(palette) {
  const row = el('div', 'swatch-row');
  for (const key of SLOT_LABELS) {
    const cell = el('div', 'swatch-cell');
    const chip = el('div', 'swatch-chip');
    chip.style.background = palette[key];
    chip.title = palette[key];
    const cap = el('div', 'swatch-cap', key);
    const hex = el('div', 'swatch-hex', palette[key]);
    cell.appendChild(chip);
    cell.appendChild(cap);
    cell.appendChild(hex);
    row.appendChild(cell);
  }
  return row;
}

function renderHarmonySection(def, palette) {
  const card = el('section', 'harm-card');
  card.appendChild(el('h2', 'harm-title', def.label));
  card.appendChild(renderSwatchRow(palette));
  return card;
}

function renderHarmonies(container, baseHex) {
  container.innerHTML = '';
  const all = generateAllHarmonyPalettes(baseHex);
  for (const def of HARMONY_DEFINITIONS) {
    container.appendChild(renderHarmonySection(def, all[def.id]));
  }
}

/** ---------- Secondary: image recolor (fixed analogous palette) ---------- */

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

function renderImageRecolor(mount, baseHex) {
  const wrap = el('div', 'secondary-wrap');
  wrap.appendChild(el('h2', 'section-kicker', 'Secondary · image recolor'));
  const p = el('p', 'muted', 'Uses the <strong>analogous</strong> harmony only, locked so thumbnails stay stable when you change the base above.');
  wrap.appendChild(p);

  const all = generateAllHarmonyPalettes(baseHex);
  lockPalette(all.analogous);
  const locked = getLockedPalette();
  if (!locked) throw new Error('demo: lock failed');

  const samples = [
    { name: 'Ramp', canvas: makeRampCanvas(200, 120) },
    { name: 'Blobs', canvas: makeBlobCanvas(200, 120) },
    { name: 'Gray', canvas: makeGrayCanvas(200, 120) }
  ];

  const grid = el('div', 'img-grid');
  for (const { name, canvas } of samples) {
    const pair = el('div', 'img-pair');
    const a = el('div', 'slot');
    a.appendChild(el('span', 'img-label', 'before · ' + name));
    a.appendChild(canvas);
    const b = el('div', 'slot');
    b.appendChild(el('span', 'img-label', 'after'));
    b.appendChild(applyPaletteToImage(canvas, locked));
    pair.appendChild(a);
    pair.appendChild(b);
    grid.appendChild(pair);
  }
  wrap.appendChild(grid);
  mount.appendChild(wrap);
}

/**
 * @param {HTMLElement} mount
 */
export function runPaletteDemo(mount) {
  mount.innerHTML = '';

  const controls = el('div', 'controls');
  const lab = el('label', 'base-lab');
  lab.textContent = 'Base color';
  const colorIn = el('input', '');
  colorIn.type = 'color';
  colorIn.id = 'baseColor';
  colorIn.value = '#5a7d9a';
  const textIn = el('input', 'hex-text');
  textIn.type = 'text';
  textIn.setAttribute('spellcheck', 'false');
  textIn.value = '#5a7d9a';
  textIn.setAttribute('aria-label', 'Base hex');
  lab.appendChild(colorIn);
  lab.appendChild(textIn);
  controls.appendChild(lab);

  const harmoniesMount = el('div', 'harmonies');
  const meta = el('div', 'meta', '');

  function syncFromColor() {
    const hex = normalizeHex(colorIn.value);
    textIn.value = hex;
    renderHarmonies(harmoniesMount, hex);
    meta.textContent =
      'Deterministic HSL harmonies from ' + hex + ' · same input → same palettes (no network).';
    const secondary = mount.querySelector('.secondary-wrap');
    if (secondary) secondary.remove();
    renderImageRecolor(mount, hex);
  }

  function syncFromText() {
    const hex = normalizeHex(textIn.value);
    try {
      colorIn.value = hex.length === 7 ? hex : colorIn.value;
    } catch (_e) {}
    textIn.value = hex;
    renderHarmonies(harmoniesMount, hex);
    meta.textContent =
      'Deterministic HSL harmonies from ' + hex + ' · same input → same palettes (no network).';
    const secondary = mount.querySelector('.secondary-wrap');
    if (secondary) secondary.remove();
    renderImageRecolor(mount, hex);
  }

  colorIn.addEventListener('input', syncFromColor);
  textIn.addEventListener('change', syncFromText);
  textIn.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter') syncFromText();
  });

  mount.appendChild(controls);
  mount.appendChild(meta);
  mount.appendChild(harmoniesMount);

  syncFromColor();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function () {
    const mount = document.getElementById('mount');
    if (mount) runPaletteDemo(mount);
  });
}
