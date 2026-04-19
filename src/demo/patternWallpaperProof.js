/**
 * patternWallpaperProof.js — deterministic palette on real repo patterns (flat + layered).
 * Serve repo root (e.g. npx serve .) and open src/demo/patternWallpaperProof.html
 */

import { generatePalette, lockPalette, getLockedPalette } from '../color/paletteEngine.js';
import { applyPaletteToImage } from '../color/applyPalette.js';
import { ENGINE_STYLE_IDS, ENGINE_STYLE_LABELS } from '../color/paletteStyles.js';
import { ENGINE_ARTIST_IDS } from '../color/artistStyles.js';
import { ENGINE_HARMONY_IDS } from '../color/harmonyPalettes.js';
import { PATTERN_WALLPAPER_PROOF_MANIFEST } from './patternWallpaperProofConfig.js';
import { applyPaletteSlotToImage, slotKeyForLayerIndex } from './layerSlotRecolor.js';

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

/** @type {{ harmony: string, style?: string, artist?: string }} */
function buildPaletteOptions(harmonyId, styleId, artistId) {
  const opt = {
    harmony: harmonyId && harmonyId !== 'none' ? harmonyId : 'analogous'
  };
  if (styleId && styleId !== 'none') opt.style = styleId;
  if (artistId && artistId !== 'none') opt.artist = artistId;
  return opt;
}

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

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

/**
 * @param {string} url
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load ' + url));
    img.src = url;
  });
}

/**
 * @param {HTMLImageElement[]} images same dimensions
 */
function compositeImages(images) {
  if (!images.length) throw new Error('compositeImages: empty');
  const w = images[0].naturalWidth || images[0].width;
  const h = images[0].naturalHeight || images[0].height;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('compositeImages: no context');
  for (const im of images) {
    ctx.drawImage(im, 0, 0);
  }
  return c;
}

/**
 * @param {HTMLCanvasElement[]} canvases
 */
function compositeCanvases(canvases) {
  if (!canvases.length) throw new Error('compositeCanvases: empty');
  const w = canvases[0].width;
  const h = canvases[0].height;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('compositeCanvases: no context');
  for (const layer of canvases) {
    ctx.drawImage(layer, 0, 0);
  }
  return c;
}

/** @param {{ id: string, name: string, mode: string, layers?: string[], flat?: string }} def */
async function loadPatternAssets(def) {
  if (def.mode === 'flat' && def.flat) {
    const img = await loadImage(def.flat);
    return { mode: 'flat', images: [img] };
  }
  if (def.mode === 'layered' && def.layers) {
    const images = await Promise.all(def.layers.map((u) => loadImage(u)));
    return { mode: 'layered', images };
  }
  throw new Error('Invalid pattern def: ' + def.id);
}

/**
 * @param {{ mode: string, images: HTMLImageElement[] }} assets
 * @param {ReturnType<getLockedPalette>} palette
 */
function renderLockedCanvas(assets, palette) {
  if (!palette) throw new Error('palette not locked');
  if (assets.mode === 'flat') {
    return applyPaletteToImage(assets.images[0], palette);
  }
  const recolored = assets.images.map((im, i) => {
    const { hex } = slotKeyForLayerIndex(i, palette);
    return applyPaletteSlotToImage(im, hex);
  });
  return compositeCanvases(recolored);
}

/**
 * @param {{ mode: string, images: HTMLImageElement[] }} assets
 */
function renderOriginalCanvas(assets) {
  if (assets.mode === 'flat') {
    const im = assets.images[0];
    const c = document.createElement('canvas');
    c.width = im.naturalWidth || im.width;
    c.height = im.naturalHeight || im.height;
    const ctx = c.getContext('2d');
    if (!ctx) throw new Error('no ctx');
    ctx.drawImage(im, 0, 0);
    return c;
  }
  return compositeImages(assets.images);
}

/**
 * @param {HTMLElement} mount
 */
export async function runPatternWallpaperProof(mount) {
  mount.innerHTML = '';

  const controls = el('div', 'pwp-controls');
  const baseLab = el('label', 'pwp-lab', 'Base');
  const colorIn = document.createElement('input');
  colorIn.type = 'color';
  colorIn.value = '#5a7d9a';
  const textIn = document.createElement('input');
  textIn.type = 'text';
  textIn.className = 'pwp-hex';
  textIn.value = '#5a7d9a';
  textIn.spellcheck = false;
  baseLab.appendChild(colorIn);
  baseLab.appendChild(textIn);
  controls.appendChild(baseLab);

  function addSelect(labelText, aria, ids, labelsMap, defaultVal) {
    const lab = el('label', 'pwp-lab', labelText);
    const sel = document.createElement('select');
    sel.className = 'pwp-select';
    sel.setAttribute('aria-label', aria);
    for (const id of ids) {
      const o = document.createElement('option');
      o.value = id;
      o.textContent = labelsMap[id] || id;
      sel.appendChild(o);
    }
    sel.value = defaultVal;
    lab.appendChild(sel);
    controls.appendChild(lab);
    return sel;
  }

  const harmonySel = addSelect(
    'Harmony',
    'Harmony',
    ENGINE_HARMONY_IDS,
    ENGINE_HARMONY_LABELS,
    'analogous'
  );
  const styleSel = addSelect('Design style', 'Style', ENGINE_STYLE_IDS, ENGINE_STYLE_LABELS, 'none');
  const artistSel = addSelect('Artist', 'Artist', ENGINE_ARTIST_IDS, ENGINE_ARTIST_LABELS, 'none');

  const status = el('div', 'pwp-status', '');
  const rowsMount = el('div', 'pwp-rows', '');

  mount.appendChild(controls);
  mount.appendChild(status);
  mount.appendChild(rowsMount);

  const rowPainters = new WeakMap();

  try {
    const loads = await Promise.all(
      PATTERN_WALLPAPER_PROOF_MANIFEST.map(async (def) => {
        try {
          const assets = await loadPatternAssets(def);
          return { def, assets, error: null };
        } catch (e) {
          return { def, assets: null, error: e };
        }
      })
    );

    for (const { def, assets, error } of loads) {
      const row = el('section', 'pwp-row');
      const head = el('div', 'pwp-row-head');
      head.appendChild(el('h2', 'pwp-name', def.name));
      const meta = el(
        'div',
        'pwp-meta',
        error
          ? 'Load error: ' + (error instanceof Error ? error.message : String(error))
          : def.mode === 'layered'
            ? def.layers.length + ' layers (each recolored to a palette slot, then composited)'
            : 'Flat (applyPaletteToImage)'
      );
      head.appendChild(meta);
      row.appendChild(head);

      const pairs = el('div', 'pwp-pairs');
      const wrapOrig = el('div', 'pwp-pair');
      wrapOrig.appendChild(el('span', 'pwp-pair-label', 'Original'));
      const cOrig = el('canvas', 'pwp-canvas');
      wrapOrig.appendChild(cOrig);
      const wrapLocked = el('div', 'pwp-pair');
      wrapLocked.appendChild(el('span', 'pwp-pair-label', 'Palette-locked'));
      const cLocked = el('canvas', 'pwp-canvas');
      wrapLocked.appendChild(cLocked);
      pairs.appendChild(wrapOrig);
      pairs.appendChild(wrapLocked);
      row.appendChild(pairs);
      rowsMount.appendChild(row);

      if (!assets) continue;

      /** @param {Readonly<{primary:string,secondary:string,accent:string,neutral:string,background:string}>} pal */
      function paintRow(pal) {
        const orig = renderOriginalCanvas(assets);
        cOrig.width = orig.width;
        cOrig.height = orig.height;
        const octx = cOrig.getContext('2d');
        if (octx) octx.drawImage(orig, 0, 0);

        const locked = renderLockedCanvas(assets, pal);
        cLocked.width = locked.width;
        cLocked.height = locked.height;
        const lctx = cLocked.getContext('2d');
        if (lctx) lctx.drawImage(locked, 0, 0);
      }

      rowPainters.set(row, paintRow);
    }
  } catch (e) {
    status.textContent = 'Fatal: ' + (e instanceof Error ? e.message : String(e));
    return;
  }

  function syncPaletteAndPaint() {
    const hex = normalizeHex(textIn.value);
    try {
      colorIn.value = hex.length === 7 ? hex : colorIn.value;
    } catch (_e) {}
    textIn.value = hex;

    const opt = buildPaletteOptions(harmonySel.value, styleSel.value, artistSel.value);
    const palette = generatePalette(hex, opt);
    lockPalette(palette);
    const locked = getLockedPalette();
    if (!locked) {
      status.textContent = 'Lock failed';
      return;
    }

    status.textContent =
      'Locked palette · Harmony: ' +
      (ENGINE_HARMONY_LABELS[harmonySel.value] || harmonySel.value) +
      ' · Style: ' +
      (ENGINE_STYLE_LABELS[styleSel.value] || styleSel.value) +
      ' · Artist: ' +
      (ENGINE_ARTIST_LABELS[artistSel.value] || artistSel.value) +
      ' · Same palette applied to every pattern below.';

    const rows = rowsMount.querySelectorAll('.pwp-row');
    rows.forEach((row) => {
      const paint = rowPainters.get(row);
      if (typeof paint === 'function') paint(locked);
    });
  }

  function onControlInput() {
    syncPaletteAndPaint();
  }

  colorIn.addEventListener('input', onControlInput);
  textIn.addEventListener('change', onControlInput);
  textIn.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter') onControlInput();
  });
  harmonySel.addEventListener('change', onControlInput);
  styleSel.addEventListener('change', onControlInput);
  artistSel.addEventListener('change', onControlInput);

  syncPaletteAndPaint();
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function () {
    const root = document.getElementById('pwp-mount');
    if (root) runPatternWallpaperProof(root);
  });
}
