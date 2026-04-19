/**
 * paletteDemo.js — Kuler-style harmony POC (primary) + optional image recolor (secondary).
 *
 * Serve repo over HTTP, then open:
 *   http://127.0.0.1:5050/src/demo/paletteDemo.html
 */

import { generatePalette, lockPalette, getLockedPalette } from '../color/paletteEngine.js';
import {
  ENGINE_STYLE_IDS,
  ENGINE_STYLE_LABELS,
  ENGINE_STYLE_DESCRIPTIONS
} from '../color/paletteStyles.js';
import { ENGINE_ARTIST_IDS, ENGINE_ARTIST_BLURBS, DEFAULT_ARTIST_STRENGTH } from '../color/artistStyles.js';
import { applyPaletteToImage } from '../color/applyPalette.js';
import {
  HARMONY_DEFINITIONS,
  generateAllHarmonyPalettes,
  ENGINE_HARMONY_IDS
} from '../color/harmonyPalettes.js';

const SLOT_LABELS = ['primary', 'secondary', 'accent', 'neutral', 'background'];

const ARTIST_IDS_COMPARE = ENGINE_ARTIST_IDS.filter((id) => id !== 'none');

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

function renderSwatchRow(palette, extraRowClass) {
  const row = el('div', 'swatch-row' + (extraRowClass ? ' ' + extraRowClass : ''));
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

/**
 * @param {HTMLElement} container
 * @param {string} hex
 * @param {string} harmony
 * @param {string} style
 * @param {number} artistStrength
 */
function refreshArtistCompare(container, hex, harmony, style, artistStrength) {
  container.innerHTML = '';
  container.appendChild(
    el(
      'h2',
      'section-kicker',
      'Artist influence · compare all (same base, harmony & design style)'
    )
  );
  const sub = el(
    'p',
    'muted artist-compare-lede',
    'Each column applies one artist’s color-behavior rules on top of your settings. Adjust <strong>Artist strength</strong> above to blend (0 = off, 1 = full); default 0.35 keeps artist lighter than design style.'
  );
  container.appendChild(sub);

  const grid = el('div', 'artist-compare-grid');
  const harm = harmony && harmony !== 'none' ? harmony : 'analogous';
  const str =
    typeof artistStrength === 'number' && !Number.isNaN(artistStrength)
      ? artistStrength
      : DEFAULT_ARTIST_STRENGTH;

  for (const aid of ARTIST_IDS_COMPARE) {
    /** @type {{ harmony: string, artist: string, artistStrength: number, style?: string }} */
    const opt = { harmony: harm, artist: aid, artistStrength: str };
    if (style && style !== 'none') opt.style = style;
    const pal = generatePalette(hex, opt);
    const card = el('section', 'harm-card artist-compare-card');
    card.appendChild(el('h3', 'artist-compare-name', ENGINE_ARTIST_LABELS[aid] || aid));
    const blurb = ENGINE_ARTIST_BLURBS[aid];
    if (blurb) card.appendChild(el('p', 'artist-compare-blurb', blurb));
    card.appendChild(renderSwatchRow(pal, 'swatch-row--mini'));
    grid.appendChild(card);
  }
  container.appendChild(grid);
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

const ENGINE_HARMONY_LABELS = {
  analogous: 'Analogous',
  complementary: 'Complementary',
  splitComplementary: 'Split-complementary',
  triadic: 'Triadic',
  monochromatic: 'Monochromatic',
  neutral: 'Neutral (warm-neutral)'
};

const ENGINE_ARTIST_LABELS = {
  none: 'None (no artist layer)',
  monet: 'Monet',
  picasso: 'Picasso',
  dali: 'Dalí',
  sargent: 'Sargent',
  lichtenstein: 'Lichtenstein',
  vangogh: 'van Gogh',
  matisse: 'Matisse',
  okeeffe: "O'Keeffe"
};

/**
 * @param {string} harmonyId
 * @param {string} styleId
 * @param {string} artistId
 * @param {number} artistStrength 0..1 (only used when artistId is not none)
 */
function engineOptionsFromSelectors(harmonyId, styleId, artistId, artistStrength) {
  /** @type {{ harmony: string, style?: string, artist?: string, artistStrength?: number }} */
  const opt = {
    harmony: harmonyId && harmonyId !== 'none' ? harmonyId : 'analogous'
  };
  if (styleId && styleId !== 'none') opt.style = styleId;
  if (artistId && artistId !== 'none') {
    opt.artist = artistId;
    opt.artistStrength =
      typeof artistStrength === 'number' && !Number.isNaN(artistStrength)
        ? artistStrength
        : DEFAULT_ARTIST_STRENGTH;
  }
  return opt;
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

  const enginePanel = el('section', 'harm-card engine-panel');
  enginePanel.appendChild(el('h2', 'harm-title', 'Palette engine'));

  const intro = el(
    'p',
    'muted engine-intro',
    '<code>generatePalette(base, { harmony, style, artist, artistStrength })</code> — <strong>Harmony</strong> → <strong>design style</strong> → <strong>artist</strong> (blended by <code>artistStrength</code>, default 0.35 so artist stays subtler than style). Deterministic, local only.'
  );
  enginePanel.appendChild(intro);

  const hint = el(
    'p',
    'muted engine-hint',
    '<strong>Tip:</strong> With <em>Design style</em> and <em>Artist</em> set to None, you still get a full five-color palette — it comes from <em>Harmony</em> alone (hue relationships, complements, etc.).'
  );
  enginePanel.appendChild(hint);

  const toolbar = el('div', 'engine-toolbar');
  const lab = el('label', 'base-lab');
  lab.textContent = 'Base';
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
  toolbar.appendChild(lab);

  const harmonyLab = el('label', 'style-lab');
  harmonyLab.textContent = 'Harmony';
  const harmonySel = el('select', 'style-select');
  harmonySel.setAttribute('aria-label', 'Color harmony (theory)');
  for (const id of ENGINE_HARMONY_IDS) {
    const o = document.createElement('option');
    o.value = id;
    o.textContent = ENGINE_HARMONY_LABELS[id] || id;
    harmonySel.appendChild(o);
  }
  harmonySel.value = 'analogous';
  harmonyLab.appendChild(harmonySel);
  toolbar.appendChild(harmonyLab);

  const styleLab = el('label', 'style-lab');
  styleLab.textContent = 'Design style';
  const styleSel = el('select', 'style-select');
  styleSel.setAttribute('aria-label', 'Historical or design style (optional)');
  for (const id of ENGINE_STYLE_IDS) {
    const o = document.createElement('option');
    o.value = id;
    o.textContent = ENGINE_STYLE_LABELS[id] || id;
    const desc = ENGINE_STYLE_DESCRIPTIONS[id];
    if (desc) o.title = desc;
    styleSel.appendChild(o);
  }
  styleSel.value = 'none';
  styleLab.appendChild(styleSel);
  toolbar.appendChild(styleLab);

  const artistLab = el('label', 'style-lab');
  artistLab.textContent = 'Artist influence';
  const artistSel = el('select', 'style-select');
  artistSel.setAttribute('aria-label', 'Artist influence (optional)');
  for (const id of ENGINE_ARTIST_IDS) {
    const o = document.createElement('option');
    o.value = id;
    o.textContent = ENGINE_ARTIST_LABELS[id] || id;
    artistSel.appendChild(o);
  }
  artistSel.value = 'none';
  artistLab.appendChild(artistSel);
  toolbar.appendChild(artistLab);

  const strengthLab = el('label', 'style-lab strength-lab');
  strengthLab.appendChild(el('span', 'strength-lab-tit', 'Artist strength'));
  const strengthRange = document.createElement('input');
  strengthRange.type = 'range';
  strengthRange.min = '0';
  strengthRange.max = '1';
  strengthRange.step = '0.05';
  strengthRange.value = String(DEFAULT_ARTIST_STRENGTH);
  strengthRange.className = 'artist-strength-range';
  strengthRange.setAttribute('aria-label', 'Artist influence blend strength');
  const strengthOut = el('span', 'strength-out', String(DEFAULT_ARTIST_STRENGTH));
  strengthLab.appendChild(strengthRange);
  strengthLab.appendChild(strengthOut);
  toolbar.appendChild(strengthLab);

  enginePanel.appendChild(toolbar);

  const styleDesc = el('p', 'muted style-desc', '');
  enginePanel.appendChild(styleDesc);

  const comboLabel = el('div', 'engine-combo', '');
  enginePanel.appendChild(comboLabel);

  const swRowHolder = el('div', 'engine-swatches');
  enginePanel.appendChild(swRowHolder);

  const artistCompareMount = el('div', 'artist-compare-wrap');
  enginePanel.appendChild(artistCompareMount);

  const harmoniesMount = el('div', 'harmonies');
  const meta = el('div', 'meta', '');

  function readArtistStrength() {
    const v = parseFloat(strengthRange.value);
    if (Number.isNaN(v)) return DEFAULT_ARTIST_STRENGTH;
    return Math.max(0, Math.min(1, v));
  }

  function refreshEngine(hex) {
    const harmony = harmonySel.value;
    const style = styleSel.value;
    const artist = artistSel.value;
    const st = readArtistStrength();
    strengthOut.textContent = st.toFixed(2);
    const opt = engineOptionsFromSelectors(harmony, style, artist, st);
    const pal = generatePalette(hex, opt);
    const sd = ENGINE_STYLE_DESCRIPTIONS[style] || '';
    styleDesc.textContent = sd;
    styleDesc.hidden = !sd;
    swRowHolder.innerHTML = '';
    swRowHolder.appendChild(renderSwatchRow(pal));
    comboLabel.textContent =
      'Harmony: ' +
      (ENGINE_HARMONY_LABELS[harmony] || harmony) +
      ' · Base: ' +
      hex +
      ' · Design style: ' +
      (ENGINE_STYLE_LABELS[style] || style) +
      ' · Artist: ' +
      (ENGINE_ARTIST_LABELS[artist] || artist) +
      ' · Strength: ' +
      st.toFixed(2);

    refreshArtistCompare(artistCompareMount, hex, harmony, style, st);
  }

  function syncFromColor() {
    const hex = normalizeHex(colorIn.value);
    textIn.value = hex;
    refreshEngine(hex);
    renderHarmonies(harmoniesMount, hex);
    meta.textContent =
      'Engine uses harmony + optional style/artist · Reference grid below: all six harmonies at once from ' +
      hex +
      ' (same math as the engine’s harmony picker).';
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
    refreshEngine(hex);
    renderHarmonies(harmoniesMount, hex);
    meta.textContent =
      'Engine uses harmony + optional style/artist · Reference grid below: all six harmonies at once from ' +
      hex +
      ' (same math as the engine’s harmony picker).';
    const secondary = mount.querySelector('.secondary-wrap');
    if (secondary) secondary.remove();
    renderImageRecolor(mount, hex);
  }

  function onEngineControlChange() {
    const hex = normalizeHex(textIn.value);
    refreshEngine(hex);
  }

  harmonySel.addEventListener('change', onEngineControlChange);
  styleSel.addEventListener('change', onEngineControlChange);
  artistSel.addEventListener('change', onEngineControlChange);
  strengthRange.addEventListener('input', onEngineControlChange);

  colorIn.addEventListener('input', syncFromColor);
  textIn.addEventListener('change', syncFromText);
  textIn.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter') syncFromText();
  });

  mount.appendChild(enginePanel);
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
