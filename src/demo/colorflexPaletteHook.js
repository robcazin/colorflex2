/**
 * colorflexPaletteHook.js — test-only palette engine UI inside ColorFlex.
 *
 * STRICT: does not modify the rendering pipeline or layer loading. It only fills existing
 * layer color inputs after the user clicks Apply, using CFM’s applyColorsToLayerInputs
 * (assigned to window in CFM.js so this module stays decoupled from broad refactors).
 *
 * Enable: ?paletteEngineTest=1  or  localStorage.setItem("paletteEngineTest", "1")
 */

import { generatePalette, lockPalette, getLockedPalette } from '../color/paletteEngine.js';
import { ENGINE_HARMONY_IDS } from '../color/harmonyPalettes.js';
import { ENGINE_STYLE_IDS, ENGINE_STYLE_LABELS, ENGINE_STYLE_DESCRIPTIONS } from '../color/paletteStyles.js';
import { ENGINE_ARTIST_IDS, ENGINE_ARTIST_BLURBS, DEFAULT_ARTIST_STRENGTH } from '../color/artistStyles.js';

const SLOT_KEYS = ['primary', 'secondary', 'accent', 'neutral', 'background'];

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

function normalizeHex(v) {
  let h = String(v || '').trim();
  if (!h) return '#5a7d9a';
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
    analogous: 'Analogous',
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

function getLayerInputs() {
  return Array.isArray(window.appState?.layerInputs) ? window.appState.layerInputs : [];
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
  if (sp.get('paletteEngineTest') === '1') return true;
  try {
    return window.localStorage.getItem('paletteEngineTest') === '1';
  } catch (_e) {
    return false;
  }
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

export function initColorFlexPaletteHook() {
  if (typeof document === 'undefined') return;
  if (!enabledByFlag()) return;
  if (document.getElementById('paletteEngineHookRoot')) return;

  const container =
    document.getElementById('colorControls') ||
    document.getElementById('layerInputsContainer') ||
    document.body;

  const root = el('section', 'peh-root');
  root.id = 'paletteEngineHookRoot';

  root.appendChild(el('div', 'peh-title', 'Palette Engine Test'));
  root.appendChild(
    el(
      'div',
      'peh-note',
      'Preview only until you click Apply. Uses the same apply path as ColorFlex (applyColorsToLayerInputs). Enable with ?paletteEngineTest=1'
    )
  );

  const controls = el('div', 'peh-controls');

  const baseLab = el('label', 'peh-lab', 'Base');
  const baseColor = document.createElement('input');
  baseColor.type = 'color';
  baseColor.value = '#5a7d9a';
  const baseHex = document.createElement('input');
  baseHex.type = 'text';
  baseHex.value = '#5a7d9a';
  baseHex.className = 'peh-hex';
  baseHex.spellcheck = false;
  baseLab.appendChild(baseColor);
  baseLab.appendChild(baseHex);
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

  const strengthLab = el('label', 'peh-lab', 'Artist strength');
  const strengthRange = document.createElement('input');
  strengthRange.type = 'range';
  strengthRange.min = '0';
  strengthRange.max = '1';
  strengthRange.step = '0.05';
  strengthRange.value = String(DEFAULT_ARTIST_STRENGTH);
  strengthRange.className = 'peh-range';
  const strengthOut = el('span', 'peh-range-out', String(DEFAULT_ARTIST_STRENGTH));
  strengthLab.appendChild(strengthRange);
  strengthLab.appendChild(strengthOut);
  controls.appendChild(strengthLab);

  const refreshBtn = el('button', 'peh-btn', 'Refresh layer detection');
  controls.appendChild(refreshBtn);

  root.appendChild(controls);

  const styleDesc = el('div', 'peh-desc', '');
  root.appendChild(styleDesc);
  const artistDesc = el('div', 'peh-desc', '');
  root.appendChild(artistDesc);

  const info = el('div', 'peh-info', '');
  root.appendChild(info);

  const preview = el('div', 'peh-preview');
  root.appendChild(preview);

  const mapList = el('div', 'peh-map');
  root.appendChild(mapList);

  const actions = el('div', 'peh-actions');
  const applyBtn = el('button', 'peh-btn peh-apply', 'Apply Palette to Layers');
  const warn = el('div', 'peh-warn', '');
  actions.appendChild(applyBtn);
  actions.appendChild(warn);
  root.appendChild(actions);

  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .peh-root{margin:12px 0;padding:12px 14px;border:1px solid #3a3a3a;border-radius:10px;background:#151515;color:#eaeaea;max-width:820px}
    .peh-title{font-weight:700;font-size:0.95rem;margin-bottom:4px;color:#d4c896}
    .peh-note{font-size:0.8rem;color:#a0a0a0;line-height:1.4;margin-bottom:10px}
    .peh-controls{display:flex;flex-wrap:wrap;gap:10px 14px;align-items:flex-end;margin-bottom:10px}
    .peh-lab{display:flex;flex-direction:column;gap:4px;font-size:0.72rem;color:#a0a0a0;font-weight:600}
    .peh-lab input[type="color"]{width:48px;height:34px;padding:0;border:1px solid #444;background:#000}
    .peh-hex{width:7.5rem;padding:6px 8px;border-radius:6px;border:1px solid #444;background:#1e1e1e;color:#eee;font-family:ui-monospace,monospace}
    .peh-select{min-width:11rem;padding:6px 8px;border-radius:6px;border:1px solid #444;background:#1e1e1e;color:#eee}
    .peh-range{width:10rem}
    .peh-range-out{font-family:ui-monospace,monospace;color:#b8b8a0;font-size:0.78rem}
    .peh-desc{font-size:0.78rem;color:#a0a090;line-height:1.4;margin:2px 0}
    .peh-info{font-size:0.78rem;color:#9a9a8a;margin:10px 0 8px;line-height:1.4}
    .peh-swatch-row{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 10px}
    .peh-swatch{width:26px;height:18px;border-radius:5px;border:1px solid rgba(255,255,255,0.16)}
    .peh-map{display:flex;flex-direction:column;gap:4px;margin-bottom:10px}
    .peh-map-line{font-size:0.78rem;color:#cfcfcf;display:flex;gap:10px;align-items:center}
    .peh-chip{width:16px;height:16px;border-radius:4px;border:1px solid rgba(255,255,255,0.16)}
    .peh-actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
    .peh-btn{padding:8px 10px;border-radius:8px;border:1px solid #555;background:#222;color:#eee;cursor:pointer;font-weight:700}
    .peh-btn:hover{border-color:#777}
    .peh-btn:disabled{opacity:0.45;cursor:not-allowed}
    .peh-warn{font-size:0.78rem;color:#e0b070;line-height:1.35}
  `;
  root.appendChild(styleEl);

  container.prepend(root);

  let lastComputed = null;

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

    const pal = generatePalette(hex, buildGenerateOptions(harmony, style, artist, strength));
    lockPalette(pal);
    const locked = getLockedPalette();
    if (!locked) throw new Error('palette lock failed');

    const layerCount = getColorableLayerCount();
    const expanded12 = expandPaletteTo12(locked);
    const proposed = computeProposedLayerColors(expanded12, layerCount);

    styleDesc.textContent = style === 'none' ? '' : (ENGINE_STYLE_DESCRIPTIONS[style] || '');
    styleDesc.hidden = !styleDesc.textContent;
    const ab = ENGINE_ARTIST_BLURBS[artist];
    artistDesc.textContent = artist === 'none' ? '' : (ab || '');
    artistDesc.hidden = !artistDesc.textContent;

    preview.innerHTML = '';
    preview.appendChild(renderSwatches([locked.primary, locked.secondary, locked.accent, locked.neutral, locked.background]));

    const pname = getPatternName();
    info.textContent =
      'Detected color layers: ' +
      layerCount +
      (pname ? ' · Pattern: ' + pname : '') +
      ' · Mapping supports up to 12 layers.';

    mapList.innerHTML = '';
    const max = Math.min(layerCount, 12);
    for (let i = 0; i < max; i++) {
      const line = el('div', 'peh-map-line');
      const chip = el('span', 'peh-chip');
      chip.style.background = proposed[i];
      const role =
        i < 5
          ? SLOT_KEYS[i][0].toUpperCase() + SLOT_KEYS[i].slice(1)
          : ['Darker primary', 'Lighter primary', 'Darker secondary', 'Lighter secondary', 'Muted accent', 'Warm neutral', 'Cool neutral'][i - 5];
      line.appendChild(chip);
      line.appendChild(el('span', '', 'Layer ' + (i + 1) + ' — ' + role + ' — ' + proposed[i]));
      mapList.appendChild(line);
    }

    warn.textContent = '';
    if (layerCount > 12) {
      warn.textContent =
        'This pattern has ' +
        layerCount +
        ' layers. Palette auto-fill currently supports up to 12. Please review manually.';
    }

    applyBtn.disabled = layerCount < 1 || layerCount > 12 || typeof window.applyColorsToLayerInputs !== 'function';
    if (typeof window.applyColorsToLayerInputs !== 'function') {
      warn.textContent =
        (warn.textContent ? warn.textContent + ' ' : '') +
        'applyColorsToLayerInputs is not available on window (needs CFM bridge).';
    }

    lastComputed = { locked, layerCount, proposedForInputs: proposed };
  }

  function applyToLayers() {
    if (!lastComputed) compute();
    if (!window.appState) {
      warn.textContent = 'ColorFlex appState not found.';
      return;
    }
    const layerCount = lastComputed.layerCount;
    if (layerCount < 1) {
      warn.textContent = 'No color layers detected yet. Select a ColorFlex pattern, then Refresh.';
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

    const colorsArray = buildColorsArrayForApply(lastComputed.proposedForInputs);
    window.applyColorsToLayerInputs(colorsArray, []);
    warn.textContent = 'Applied. Use existing ColorFlex controls to tweak or undo.';
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
  refreshBtn.addEventListener('click', compute);
  applyBtn.addEventListener('click', applyToLayers);

  compute();
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
