/**
 * Opt-in UI for tuning `COLORFLEX_MOHAWK_ROOM_CONFIG.compositing` at runtime.
 *
 * Enable with either:
 *   window.COLORFLEX_MOHAWK_COMPOSITING_UI = true
 *   or add query param: ?mohawkBlend=1
 */

import { getDefaultMohawkRoomCompositingConfig } from './mohawkRoomCompositor.js';

const BLEND_MODES = [
  'color',
  'multiply',
  'soft-light',
  'overlay',
  'hard-light',
  'screen',
  'darken',
  'lighten',
  'hue',
  'saturation',
  'luminosity',
  'source-over',
];

function shouldMountCompositingUi() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  if (window.COLORFLEX_MOHAWK_ROOM !== true) return false;
  if (window.COLORFLEX_MOHAWK_COMPOSITING_UI === true) return true;
  try {
    var q = new URLSearchParams(window.location.search || '');
    return q.get('mohawkBlend') === '1';
  } catch (_e) {
    return false;
  }
}

function ensureRoomConfigCompositing() {
  window.COLORFLEX_MOHAWK_ROOM_CONFIG = window.COLORFLEX_MOHAWK_ROOM_CONFIG || {};
  var base = getDefaultMohawkRoomCompositingConfig();
  window.COLORFLEX_MOHAWK_ROOM_CONFIG.compositing = Object.assign(
    {},
    base,
    window.COLORFLEX_MOHAWK_ROOM_CONFIG.compositing || {}
  );
  var semIn = window.COLORFLEX_MOHAWK_ROOM_CONFIG.compositing.semantic || {};
  base.semantic = base.semantic || {};
  for (var role in base.semantic) {
    if (!Object.prototype.hasOwnProperty.call(base.semantic, role)) continue;
    semIn[role] = Object.assign({}, base.semantic[role], semIn[role] || {});
  }
  window.COLORFLEX_MOHAWK_ROOM_CONFIG.compositing.semantic = semIn;
  var pf = window.COLORFLEX_MOHAWK_ROOM_CONFIG.compositing.pinnedFloor || {};
  window.COLORFLEX_MOHAWK_ROOM_CONFIG.compositing.pinnedFloor = Object.assign(
    {},
    base.pinnedFloor,
    pf
  );
  return window.COLORFLEX_MOHAWK_ROOM_CONFIG.compositing;
}

function debounce(fn, ms) {
  var t = null;
  return function () {
    clearTimeout(t);
    var args = arguments;
    t = setTimeout(function () {
      fn.apply(null, args);
    }, ms);
  };
}

/**
 * @param {() => Promise<void>|void} requestRedraw - typically `updateRoomMockupMohawkRoom`
 */
export function ensureMohawkCompositingDebugPanel(requestRedraw) {
  if (!shouldMountCompositingUi()) return;
  if (document.getElementById('colorflex-mohawk-compositing-debug')) return;

  var compositing = ensureRoomConfigCompositing();
  var redraw = debounce(function () {
    Promise.resolve(requestRedraw && requestRedraw()).catch(function (e) {
      console.warn('[Mohawk compositing UI] redraw failed', e);
    });
  }, 200);

  var root = document.createElement('div');
  root.id = 'colorflex-mohawk-compositing-debug';
  root.setAttribute(
    'style',
    [
      'position:fixed',
      'right:12px',
      'bottom:12px',
      'z-index:100000',
      'max-width:min(420px,calc(100vw - 24px))',
      'max-height:70vh',
      'overflow:auto',
      'background:rgba(15,23,42,.94)',
      'color:#e2e8f0',
      'font:12px/1.4 system-ui,sans-serif',
      'border:1px solid #334155',
      'border-radius:8px',
      'padding:10px',
      'box-shadow:0 8px 32px rgba(0,0,0,.4)',
    ].join(';')
  );

  var title = document.createElement('div');
  title.textContent = 'Mohawk compositing';
  title.style.cssText = 'font-weight:600;margin-bottom:8px;color:#facc15;';
  root.appendChild(title);

  var hint = document.createElement('div');
  hint.textContent =
    'Tweaks apply to window.COLORFLEX_MOHAWK_ROOM_CONFIG.compositing (live refresh).';
  hint.style.cssText = 'opacity:.85;margin-bottom:10px;font-size:11px;';
  root.appendChild(hint);

  function addSlider(label, min, max, step, getVal, setVal) {
    var wrap = document.createElement('label');
    wrap.style.cssText = 'display:block;margin:6px 0;';
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;justify-content:space-between;gap:8px;align-items:center;';
    var lab = document.createElement('span');
    lab.textContent = label;
    var input = document.createElement('input');
    input.type = 'range';
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.style.cssText = 'flex:1;min-width:0;';
    input.value = String(getVal());
    var num = document.createElement('span');
    num.style.cssText = 'width:40px;text-align:right;font-variant-numeric:tabular-nums;';
    num.textContent = input.value;
    input.addEventListener('input', function () {
      num.textContent = input.value;
      setVal(parseFloat(input.value));
      redraw();
    });
    row.appendChild(lab);
    row.appendChild(input);
    row.appendChild(num);
    wrap.appendChild(row);
    root.appendChild(wrap);
    return input;
  }

  function addCheckbox(label, getVal, setVal) {
    var wrap = document.createElement('label');
    wrap.style.cssText = 'display:flex;align-items:center;gap:8px;margin:8px 0;cursor:pointer;';
    var input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!getVal();
    input.addEventListener('change', function () {
      setVal(input.checked);
      redraw();
    });
    wrap.appendChild(input);
    var span = document.createElement('span');
    span.textContent = label;
    wrap.appendChild(span);
    root.appendChild(wrap);
  }

  addSlider(
    'Floor detail opacity',
    0,
    1,
    0.01,
    function () {
      if (typeof compositing.floorDetailOpacity === 'number') return compositing.floorDetailOpacity;
      if (typeof window.COLORFLEX_MOHAWK_ROOM_CONFIG.floorDetailOpacity === 'number') {
        return window.COLORFLEX_MOHAWK_ROOM_CONFIG.floorDetailOpacity;
      }
      return 1;
    },
    function (v) {
      compositing.floorDetailOpacity = v;
    }
  );

  addSlider(
    'Carpet tile strength',
    0,
    1,
    0.01,
    function () {
      return typeof compositing.pinnedFloor.tileStrength === 'number'
        ? compositing.pinnedFloor.tileStrength
        : 1;
    },
    function (v) {
      compositing.pinnedFloor.tileStrength = v;
    }
  );

  addCheckbox(
    'Show “COMPOSITOR ACTIVE” banner',
    function () {
      return !!compositing.showCompositorBanner;
    },
    function (v) {
      compositing.showCompositorBanner = v;
    }
  );

  var semTitle = document.createElement('div');
  semTitle.textContent = 'Semantic tints (mask × fill)';
  semTitle.style.cssText =
    'font-weight:600;margin:12px 0 6px;color:#94a3b8;font-size:11px;text-transform:uppercase;';
  root.appendChild(semTitle);

  var roles = ['trim', 'panels', 'sofa', 'pillow'];
  for (var ri = 0; ri < roles.length; ri++) {
    (function (role) {
      var block = document.createElement('div');
      block.style.cssText =
        'border:1px solid #1e293b;border-radius:6px;padding:8px;margin-bottom:8px;background:rgba(0,0,0,.2);';
      var h = document.createElement('div');
      h.textContent = role;
      h.style.cssText = 'font-weight:600;margin-bottom:6px;color:#cbd5e1;';
      block.appendChild(h);

      compositing.semantic[role] = compositing.semantic[role] || { mode: 'color', alpha: 1 };

      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap;';
      var lab = document.createElement('span');
      lab.textContent = 'Blend';
      lab.style.minWidth = '40px';
      var sel = document.createElement('select');
      sel.style.cssText =
        'flex:1;min-width:120px;background:#0f172a;color:#e2e8f0;border:1px solid #475569;border-radius:4px;padding:4px;';
      for (var mi = 0; mi < BLEND_MODES.length; mi++) {
        var o = document.createElement('option');
        o.value = BLEND_MODES[mi];
        o.textContent = BLEND_MODES[mi];
        sel.appendChild(o);
      }
      sel.value = compositing.semantic[role].mode || 'color';
      if (!sel.value) sel.value = 'color';
      sel.addEventListener('change', function () {
        compositing.semantic[role].mode = sel.value;
        redraw();
      });
      row.appendChild(lab);
      row.appendChild(sel);
      block.appendChild(row);

      var alphaRow = document.createElement('div');
      alphaRow.style.cssText = 'display:flex;align-items:center;gap:8px;';
      var alab = document.createElement('span');
      alab.textContent = 'α';
      alab.style.minWidth = '40px';
      var input = document.createElement('input');
      input.type = 'range';
      input.min = '0';
      input.max = '1';
      input.step = '0.01';
      input.style.flex = '1';
      input.value = String(
        typeof compositing.semantic[role].alpha === 'number' ? compositing.semantic[role].alpha : 1
      );
      var num = document.createElement('span');
      num.style.cssText = 'width:36px;text-align:right;';
      num.textContent = input.value;
      input.addEventListener('input', function () {
        num.textContent = input.value;
        compositing.semantic[role].alpha = parseFloat(input.value);
        redraw();
      });
      alphaRow.appendChild(alab);
      alphaRow.appendChild(input);
      alphaRow.appendChild(num);
      block.appendChild(alphaRow);

      root.appendChild(block);
    })(roles[ri]);
  }

  document.body.appendChild(root);
}
