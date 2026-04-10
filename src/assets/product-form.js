/**
 * Upload ColorFlex data-URL thumbnail before /cart/add so line items get properties[_pattern_preview]=https://...
 * (Cart page Liquid uses it in main-cart-items.liquid.) Hosted Shopify checkout still shows the variant image
 * for the line thumbnail; replacing that requires a Checkout UI extension that reads this property.
 */

if (typeof window !== 'undefined' && typeof window.colorflexDumpDiagnostics !== 'function') {
  window.colorflexDumpDiagnostics = function () {
    let persisted = null;
    try {
      const raw = sessionStorage.getItem('colorflexLastDiagnostics');
      if (raw) persisted = JSON.parse(raw);
    } catch (e) {
      /* ignore */
    }
    return {
      submit: window.__colorflexLastSubmitDiagnostic || (persisted && persisted.submit) || null,
      proofRender: window.__colorflexLastProofRenderSnapshot || (persisted && persisted.proofRender) || null,
      restore: window.__colorflexLastRestoreSnapshot || (persisted && persisted.restore) || null,
      global: window.__colorflexGlobalDiagnostics || (persisted && persisted.global) || null,
    };
  };
}

if (typeof window !== 'undefined') {
  if (!window.__colorflexGlobalDiagnostics) {
    window.__colorflexGlobalDiagnostics = {
      startedAt: new Date().toISOString(),
      events: [],
      source: 'product-form',
    };
  }
  if (!window.__colorflexDiagFetchWrappedPF && typeof window.fetch === 'function') {
    window.__colorflexDiagFetchWrappedPF = true;
    const __cfPfOrigFetch = window.fetch.bind(window);
    window.fetch = async function (url, options) {
      try {
        const urlString = typeof url === 'string' ? url : url && url.url ? url.url : '';
        const isCartAdd = /\/cart\/add(\.js)?/i.test(urlString);
        if (isCartAdd) {
          const payload = {};
          const body = options && options.body;
          if (body instanceof FormData) {
            try {
              for (const [k, v] of body.entries()) payload[k] = typeof v === 'string' ? v : '[binary]';
            } catch (e) {
              payload.__formDataReadError = String(e && e.message ? e.message : e);
            }
          } else if (typeof body === 'string') {
            payload.__raw = body.length > 4000 ? body.slice(0, 4000) + '...[truncated]' : body;
          }

          window.__colorflexLastSubmitDiagnostic = {
            at: new Date().toISOString(),
            source: 'product-form-fetch-monitor',
            requestUrl: urlString,
            payload,
            proofRender: window.__colorflexLastProofRenderSnapshot || null,
            restore: window.__colorflexLastRestoreSnapshot || null,
          };
          window.__colorflexGlobalDiagnostics.events.push({
            at: new Date().toISOString(),
            type: 'cart_add_observed',
            requestUrl: urlString,
          });
          try {
            sessionStorage.setItem(
              'colorflexLastDiagnostics',
              JSON.stringify({
                submit: window.__colorflexLastSubmitDiagnostic || null,
                proofRender: window.__colorflexLastProofRenderSnapshot || null,
                restore: window.__colorflexLastRestoreSnapshot || null,
                global: window.__colorflexGlobalDiagnostics || null,
              })
            );
          } catch (e) {
            /* ignore */
          }
        }
      } catch (diagErr) {
        try {
          window.__colorflexGlobalDiagnostics.events.push({
            at: new Date().toISOString(),
            type: 'diag_error',
            message: String(diagErr && diagErr.message ? diagErr.message : diagErr),
          });
        } catch (_) {}
      }
      return __cfPfOrigFetch(url, options);
    };
  }

  const captureCartFormDiagnostic = function (formEl, source) {
    try {
      if (!formEl || !formEl.action || !/\/cart\/add/i.test(formEl.action)) return;
      const payload = {};
      try {
        const fd = new FormData(formEl);
        for (const [k, v] of fd.entries()) payload[k] = typeof v === 'string' ? v : '[binary]';
      } catch (e) {
        payload.__formReadError = String(e && e.message ? e.message : e);
      }
      window.__colorflexLastSubmitDiagnostic = {
        at: new Date().toISOString(),
        source: source || 'product-form-submit-monitor',
        requestUrl: formEl.action,
        payload,
        proofRender: window.__colorflexLastProofRenderSnapshot || null,
        restore: window.__colorflexLastRestoreSnapshot || null,
      };
      window.__colorflexGlobalDiagnostics.events.push({
        at: new Date().toISOString(),
        type: 'cart_add_form_submit_observed',
        source: source || 'submit-capture',
      });
      sessionStorage.setItem(
        'colorflexLastDiagnostics',
        JSON.stringify({
          submit: window.__colorflexLastSubmitDiagnostic || null,
          proofRender: window.__colorflexLastProofRenderSnapshot || null,
          restore: window.__colorflexLastRestoreSnapshot || null,
          global: window.__colorflexGlobalDiagnostics || null,
        })
      );
    } catch (e) {
      try {
        window.__colorflexGlobalDiagnostics.events.push({
          at: new Date().toISOString(),
          type: 'diag_error',
          message: String(e && e.message ? e.message : e),
        });
      } catch (_) {}
    }
  };

  if (!window.__colorflexDiagFormSubmitBoundPF && typeof document !== 'undefined') {
    window.__colorflexDiagFormSubmitBoundPF = true;
    document.addEventListener(
      'submit',
      function (evt) {
        captureCartFormDiagnostic(evt && evt.target, 'document-submit-capture');
      },
      true
    );
  }

  if (!window.__colorflexDiagNativeSubmitWrappedPF && typeof HTMLFormElement !== 'undefined') {
    window.__colorflexDiagNativeSubmitWrappedPF = true;
    const __origNativeSubmit = HTMLFormElement.prototype.submit;
    HTMLFormElement.prototype.submit = function () {
      captureCartFormDiagnostic(this, 'native-form-submit');
      return __origNativeSubmit.call(this);
    };
  }
}

function sanitizeThumbSuffix(value) {
  return String(value || '').replace(/[^a-zA-Z0-9-]/g, '_');
}

function normalizeScaleForPreviewLink(scaleValue) {
  const raw = String(scaleValue || '').trim().toLowerCase();
  if (!raw) return '100';
  if (raw === 'normal' || raw === '1x') return '100';
  if (raw === '0.5x') return '50';
  if (raw === '2x') return '200';
  if (raw === '3x') return '300';
  if (raw === '4x') return '400';
  const num = parseInt(raw, 10);
  return Number.isFinite(num) && num > 0 ? String(num) : '100';
}

function inferPreferredMaterialForPreviewLink(formData) {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('preferred_material');
    if (fromUrl) return String(fromUrl).trim();
  } catch (e) {
    /* ignore */
  }
  const materialType = (formData.get('properties[Material Type]') || '').toString().trim().toLowerCase();
  if (!materialType) return '';
  if (materialType.includes('peel') && materialType.includes('stick')) return 'wallpaper-peel-stick';
  if (materialType.includes('prepasted') || materialType.includes('pre-pasted')) return 'wallpaper-prepasted';
  if (materialType.includes('grasscloth')) return 'wallpaper-grasscloth';
  if (materialType.includes('velvet')) return 'fabric-soft-velvet';
  if (materialType.includes('decorator') && materialType.includes('linen')) return 'fabric-decorator-linen';
  if (materialType.includes('lightweight') && materialType.includes('linen')) return 'fabric-lightweight-linen';
  if (materialType.includes('sheer')) return 'fabric-drapery-sheer';
  if (materialType.includes('suede')) return 'fabric-faux-suede';
  return '';
}

function buildColorFlexEditorLink(formData) {
  try {
    const patternName = (formData.get('properties[Custom Pattern]') || formData.get('properties[Pattern Name]') || '')
      .toString()
      .trim();
    const collection = (formData.get('properties[Pattern Collection]') || formData.get('properties[Collection]') || '')
      .toString()
      .trim();
    if (!patternName || !collection) return null;

    const patternId = (formData.get('properties[Pattern ID]') || '').toString().trim();
    const customColors = (formData.get('properties[Custom Colors]') || formData.get('properties[custom_colors]') || '')
      .toString()
      .trim();
    const patternScale = normalizeScaleForPreviewLink(formData.get('properties[Pattern Scale]'));
    const preferredMaterial = inferPreferredMaterialForPreviewLink(formData);
    const saveDate = (formData.get('properties[Save Date]') || '').toString().trim();

    const params = new URLSearchParams();
    params.set('pattern', patternName);
    params.set('pattern_name', patternName);
    params.set('collection', collection);
    if (patternId) {
      params.set('pattern_id', patternId);
      params.set('saved_pattern_id', patternId);
    }
    if (customColors) {
      params.set('colors', customColors);
      params.set('custom_colors', customColors);
    }
    params.set('scale', patternScale);
    params.set('source', 'colorflex_saved_patterns');
    if (preferredMaterial) params.set('preferred_material', preferredMaterial);
    if (saveDate) params.set('save_date', saveDate);

    return `${window.location.origin}/pages/colorflex?${params.toString()}`;
  } catch (e) {
    return null;
  }
}

function readStoredCartThumbnail(formData) {
  try {
    const thumbKey = (formData.get('properties[Thumbnail Key]') || '').toString().trim();
    const patternId = (formData.get('properties[Pattern ID]') || '').toString().trim();
    const keys = [];
    if (thumbKey) keys.push(thumbKey);
    if (patternId) keys.push(`cart_thumbnail_${sanitizeThumbSuffix(patternId)}`);
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.thumbnail === 'string' && parsed.thumbnail.startsWith('data:image')) {
        return parsed.thumbnail;
      }
    }
  } catch (e) {
    /* ignore */
  }
  return null;
}

async function isLikelyBlankThumbnail(dataUrl) {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = function () {
        try {
          const c = document.createElement('canvas');
          c.width = 48;
          c.height = 48;
          const ctx = c.getContext('2d');
          ctx.drawImage(img, 0, 0, 48, 48);
          const d = ctx.getImageData(0, 0, 48, 48).data;
          let bright = 0;
          for (let i = 0; i < d.length; i += 4) {
            const lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
            if (lum > 235) bright++;
          }
          const ratio = bright / (d.length / 4);
          resolve(ratio > 0.88);
        } catch (err) {
          resolve(false);
        }
      };
      img.onerror = function () {
        resolve(false);
      };
      img.src = dataUrl;
    } catch (e) {
      resolve(false);
    }
  });
}

async function uploadDataUrlToApi(apiUrl, dataUrl, filename, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(function () {
    controller.abort();
  }, timeoutMs || 8000);
  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thumbnail: dataUrl, filename: filename }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.success && data.url) return data.url;
  } catch (e) {
    clearTimeout(timeoutId);
  }
  return null;
}

async function ensureDataUrlSize(dataUrl, targetSize, quality) {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) return dataUrl;
  const size = Number(targetSize) > 0 ? Number(targetSize) : 3600;
  const jpegQuality = typeof quality === 'number' ? quality : 0.95;
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = function () {
        try {
          const srcW = img.naturalWidth || img.width || 1;
          const srcH = img.naturalHeight || img.height || 1;
          if (srcW === size && srcH === size) {
            resolve(dataUrl);
            return;
          }
          const c = document.createElement('canvas');
          c.width = size;
          c.height = size;
          const ctx = c.getContext('2d');
          // Cover-fit into square target.
          const scale = Math.max(size / srcW, size / srcH);
          const drawW = srcW * scale;
          const drawH = srcH * scale;
          const dx = (size - drawW) / 2;
          const dy = (size - drawH) / 2;
          ctx.drawImage(img, dx, dy, drawW, drawH);
          resolve(c.toDataURL('image/jpeg', jpegQuality));
        } catch (e) {
          resolve(dataUrl);
        }
      };
      img.onerror = function () {
        resolve(dataUrl);
      };
      img.src = dataUrl;
    } catch (e) {
      resolve(dataUrl);
    }
  });
}

function isColorFlexDiagnosticEnabled() {
  try {
    if (window.COLORFLEX_DEBUG_MODE === true) return true;
    const q = new URLSearchParams(window.location.search);
    return q.get('cfdebug') === '1';
  } catch (e) {
    return false;
  }
}

async function getDataUrlDimensions(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) return null;
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = function () {
        resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
      };
      img.onerror = function () {
        resolve(null);
      };
      img.src = dataUrl;
    } catch (e) {
      resolve(null);
    }
  });
}

function getPreferredProofColors(formData) {
  // 1) Prefer active ColorFlex INPUT state (most accurate at submit-time).
  try {
    const state = window.appState;
    const inputs = state && Array.isArray(state.layerInputs) ? state.layerInputs : null;
    if (inputs && inputs.length) {
      const isWallPattern =
        !!(state.currentPattern && state.currentPattern.isWall) ||
        !!(state.selectedCollection && state.selectedCollection.name === 'wall-panels');
      const backgroundIndex = isWallPattern ? 1 : 0;
      const nonShadowStart = isWallPattern ? 2 : 1;
      const fromInputs = [];

      const bg = inputs[backgroundIndex] && inputs[backgroundIndex].input ? inputs[backgroundIndex].input.value : '';
      if (typeof bg === 'string' && bg.trim().length) fromInputs.push(bg.trim());

      for (let i = nonShadowStart; i < inputs.length; i++) {
        const v = inputs[i] && inputs[i].input ? inputs[i].input.value : '';
        if (typeof v === 'string' && v.trim().length) fromInputs.push(v.trim());
      }
      if (fromInputs.length) return fromInputs;
    }
  } catch (e) {
    /* ignore */
  }

  // 2) Prefer active ColorFlex layer state.
  try {
    const layers = window.appState && Array.isArray(window.appState.currentLayers) ? window.appState.currentLayers : null;
    if (layers && layers.length) {
      const fromState = layers
        .filter((l) => l && !l.isShadow && typeof l.color === 'string' && l.color.trim().length)
        .map((l) => l.color.trim());
      if (fromState.length) return fromState;
    }
  } catch (e) {
    /* ignore */
  }

  // 3) Fall back to saved pattern payload in localStorage.
  try {
    const patternId = (formData.get('properties[Pattern ID]') || '').toString().trim();
    const patternName = (formData.get('properties[Custom Pattern]') || formData.get('properties[Pattern Name]') || '')
      .toString()
      .trim()
      .toLowerCase();
    const collectionName = (formData.get('properties[Pattern Collection]') || formData.get('properties[Collection]') || '')
      .toString()
      .trim()
      .toLowerCase();
    const raw = localStorage.getItem('colorflexSavedPatterns');
    const saved = JSON.parse(raw || '[]');
    if (Array.isArray(saved) && saved.length) {
      const hit =
        saved.find((p) => patternId && p && (p.id === patternId || p.patternId === patternId)) ||
        saved.find(
          (p) =>
            p &&
            typeof p.patternName === 'string' &&
            typeof p.collectionName === 'string' &&
            p.patternName.toLowerCase() === patternName &&
            p.collectionName.toLowerCase() === collectionName
        );
      if (hit && Array.isArray(hit.colors) && hit.colors.length) {
        const fromSaved = hit.colors
          .map((c) => (c && typeof c === 'object' ? c.color : c))
          .filter((c) => typeof c === 'string' && c.trim().length)
          .map((c) => c.trim());
        if (fromSaved.length) return fromSaved;
      }
    }
  } catch (e) {
    /* ignore */
  }

  // 4) Last resort: form property string.
  const customColors = (formData.get('properties[Custom Colors]') || '')
    .toString()
    .trim();
  return customColors
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
}

function setFormDataProperty(formData, key, value) {
  try {
    if (formData.has(key)) formData.delete(key);
  } catch (e) {
    /* ignore */
  }
  if (value != null && String(value).trim() !== '') {
    formData.append(key, String(value));
  }
}

function currentPatternHasShadowLayers() {
  try {
    const pattern = window.appState && window.appState.currentPattern;
    const patternName = (pattern && pattern.name ? String(pattern.name) : '').toLowerCase();
    if (patternName.includes('shadow dance')) return true;
    const layers = pattern && Array.isArray(pattern.layers) ? pattern.layers : [];
    return layers.some((layer) => {
      if (!layer) return false;
      if (layer.isShadow === true) return true;
      const pathStr = (layer.path || layer.proofPath || '').toString().toUpperCase();
      return pathStr.includes('_SHADOW_') || pathStr.includes('SHADOW_LAYER') || pathStr.includes('ISSHADOW');
    });
  } catch (e) {
    return false;
  }
}

async function ensureColorFlexPatternPreviewOnFormData(formData) {
  const diagnosticsEnabled = isColorFlexDiagnosticEnabled();
  const diag = {
    at: new Date().toISOString(),
    pattern: (formData.get('properties[Custom Pattern]') || formData.get('properties[Pattern Name]') || '').toString(),
    collection: (formData.get('properties[Pattern Collection]') || formData.get('properties[Collection]') || '').toString(),
    events: [],
  };
  const pushDiag = (name, data) => {
    if (!diagnosticsEnabled) return;
    diag.events.push({ t: Date.now(), name, data: data || {} });
  };
  let existing = formData.get('properties[_pattern_preview]');
  if (!existing) existing = formData.get('properties[pattern_preview]');
  const isColorFlex =
    formData.get('properties[ColorFlex Design]') === 'Yes' ||
    !!(formData.get('properties[Custom Pattern]') || '').trim();
  if (!isColorFlex) return;
  if (existing && String(existing).trim() !== '' && /^https?:\/\//i.test(String(existing).trim())) {
    console.log('ColorFlex: Existing preview URL found; forcing fresh proof render/upload before cart add');
  }

  let thumb = null;
  let fullProofDataUrl = null;
  // Deterministic handoff from ColorFlex modal: use locked proceed-to-cart proof first.
  try {
    const formPattern = (formData.get('properties[Custom Pattern]') || formData.get('properties[Pattern Name]') || '')
      .toString()
      .trim()
      .toLowerCase();
    const formCollection = (formData.get('properties[Pattern Collection]') || formData.get('properties[Collection]') || '')
      .toString()
      .trim()
      .toLowerCase();

    let lockedDataUrl = null;
    let lockedMeta = null;

    try {
      lockedDataUrl = sessionStorage.getItem('colorflexProceedProofDataUrl') || lockedDataUrl;
      const metaRaw = sessionStorage.getItem('colorflexProceedProofMeta');
      if (metaRaw) lockedMeta = JSON.parse(metaRaw);
    } catch (_) {}
    try {
      lockedDataUrl = lockedDataUrl || localStorage.getItem('colorflexProceedProofDataUrl');
      if (!lockedMeta) {
        const metaRaw = localStorage.getItem('colorflexProceedProofMeta');
        if (metaRaw) lockedMeta = JSON.parse(metaRaw);
      }
    } catch (_) {}

    const lockedPattern = String((lockedMeta && lockedMeta.pattern) || '').trim().toLowerCase();
    const lockedCollection = String((lockedMeta && lockedMeta.collection) || '').trim().toLowerCase();
    const metaMatchesForm =
      (!lockedPattern || !formPattern || lockedPattern === formPattern) &&
      (!lockedCollection || !formCollection || lockedCollection === formCollection);

    if (lockedDataUrl && lockedDataUrl.startsWith('data:image') && metaMatchesForm) {
      fullProofDataUrl = lockedDataUrl;
      thumb = lockedDataUrl;
      pushDiag('proof-from-proceed-lock', {
        dimensions: await getDataUrlDimensions(lockedDataUrl),
        pattern: lockedPattern || null,
        collection: lockedCollection || null,
      });
      if (lockedMeta && Array.isArray(lockedMeta.colors) && lockedMeta.colors.length) {
        setFormDataProperty(formData, 'properties[Custom Colors]', lockedMeta.colors.join(', '));
      }
    } else if (lockedDataUrl && !metaMatchesForm) {
      pushDiag('proof-lock-skip-pattern-mismatch', {
        formPattern,
        formCollection,
        lockedPattern,
        lockedCollection,
      });
    }
  } catch (e) {
    pushDiag('proof-lock-read-error', { message: e && e.message ? e.message : String(e) });
  }

  if (!fullProofDataUrl && (typeof window.generatePrintPreview === 'function' || typeof window.generatePatternProofDataUrl === 'function')) {
    try {
      // Prefer proof renderer first to avoid low-res/compressed capture artifacts.
      if (!fullProofDataUrl && typeof window.generatePrintPreview === 'function') {
        const proofResult = await window.generatePrintPreview({ silent: true });
        if (proofResult && typeof proofResult.dataUrl === 'string' && proofResult.dataUrl.startsWith('data:image')) {
          pushDiag('proof-render-silent', {
            layerLabels: Array.isArray(proofResult.layerLabels) ? proofResult.layerLabels : [],
            dataUrlLength: proofResult.dataUrl.length,
          });
          fullProofDataUrl = await ensureDataUrlSize(proofResult.dataUrl, 3600, 0.95);
          pushDiag('proof-render-normalized', { dimensions: await getDataUrlDimensions(fullProofDataUrl) });
          const proofModeColors = Array.isArray(proofResult.layerLabels)
            ? proofResult.layerLabels
                .map((l) => (l && typeof l.color === 'string' ? l.color.trim() : ''))
                .filter(Boolean)
            : [];
          if (proofModeColors.length) {
            setFormDataProperty(formData, 'properties[Custom Colors]', proofModeColors.join(', '));
          }
        }
      }

      // Fallback to visible capture only when proof render is unavailable.
      if (!fullProofDataUrl && typeof window.capturePatternThumbnail === 'function') {
        const visibleCapture = window.capturePatternThumbnail();
        if (visibleCapture && visibleCapture.startsWith('data:image')) {
          fullProofDataUrl = await ensureDataUrlSize(visibleCapture, 3600, 0.95);
          pushDiag('proof-from-visible-capture', { dimensions: await getDataUrlDimensions(fullProofDataUrl) });
        }
      }

      // Fallback only if proof-mode renderer is unavailable/failed.
      if (!fullProofDataUrl && typeof window.generatePatternProofDataUrl === 'function') {
        const proofPatternName = (formData.get('properties[Custom Pattern]') || formData.get('properties[Pattern Name]') || '')
          .toString()
          .trim();
        const proofCollectionName = (formData.get('properties[Pattern Collection]') || formData.get('properties[Collection]') || '')
          .toString()
          .trim();
        const colorArray = getPreferredProofColors(formData);
        if (colorArray.length) {
          setFormDataProperty(formData, 'properties[Custom Colors]', colorArray.join(', '));
        }

        if (proofPatternName && proofCollectionName && colorArray.length > 0) {
          fullProofDataUrl = await window.generatePatternProofDataUrl(
            proofPatternName,
            proofCollectionName,
            colorArray,
            0.95,
            3600
          );
        }
      }

      if (fullProofDataUrl && fullProofDataUrl.startsWith('data:image')) {
        // Keep cart preview and proof link color-identical.
        thumb = fullProofDataUrl;
        pushDiag('proof-used-as-preview', { dimensions: await getDataUrlDimensions(thumb) });
      }
    } catch (e) {
      console.warn('ColorFlex: full proof generation failed, continuing:', e);
      pushDiag('proof-generation-error', { message: e && e.message ? e.message : String(e) });
    }
  }
  if (!thumb) {
    try {
      thumb = localStorage.getItem('colorflexCurrentThumbnail');
    } catch (e) {
      /* ignore */
    }
  }
  if ((!thumb || thumb.length < 80) && typeof window.capturePatternThumbnail === 'function') {
    try {
      thumb = window.capturePatternThumbnail();
    } catch (e) {
      /* ignore */
    }
  }
  if (!thumb || !thumb.startsWith('data:image') || thumb.length < 256) {
    const fallbackThumb = readStoredCartThumbnail(formData);
    if (fallbackThumb) thumb = fallbackThumb;
  }
  if (thumb && thumb.startsWith('data:image') && thumb.length >= 256) {
    const dims = await getDataUrlDimensions(thumb);
    if (dims && (dims.width < 600 || dims.height < 600)) {
      pushDiag('thumb-rejected-low-resolution', dims);
      thumb = null;
    }
  }
  if (!thumb || !thumb.startsWith('data:image') || thumb.length < 256) {
    // Last recovery attempt: generate proof directly instead of uploading tiny localStorage fallbacks.
    try {
      if (typeof window.generatePrintPreview === 'function') {
        const proofResult = await window.generatePrintPreview({ silent: true });
        if (proofResult && typeof proofResult.dataUrl === 'string' && proofResult.dataUrl.startsWith('data:image')) {
          fullProofDataUrl = fullProofDataUrl || proofResult.dataUrl;
          thumb = proofResult.dataUrl;
          pushDiag('thumb-recovered-from-proof-render', { dimensions: await getDataUrlDimensions(thumb) });
        }
      }
    } catch (e) {
      pushDiag('thumb-recovery-error', { message: e && e.message ? e.message : String(e) });
    }
  }
  if (thumb && thumb.startsWith('data:image') && thumb.length >= 256) {
    const blank = await isLikelyBlankThumbnail(thumb);
    if (blank) {
      const fallbackThumb = readStoredCartThumbnail(formData);
      if (fallbackThumb) thumb = fallbackThumb;
    }
  }
  if (!thumb || !thumb.startsWith('data:image') || thumb.length < 256) {
    console.warn(
      'ColorFlex: No canvas thumbnail to upload; set window.COLORFLEX_API_URL and run /api/upload-thumbnail so _pattern_preview can be stored.'
    );
    return;
  }

  // Hard guarantee: every uploaded preview/proof image is 3600x3600.
  thumb = await ensureDataUrlSize(thumb, 3600, 0.95);
  pushDiag('preview-normalized', { dimensions: await getDataUrlDimensions(thumb) });
  if (fullProofDataUrl && fullProofDataUrl.startsWith('data:image')) {
    fullProofDataUrl = await ensureDataUrlSize(fullProofDataUrl, 3600, 0.95);
    pushDiag('proof-normalized-final', { dimensions: await getDataUrlDimensions(fullProofDataUrl) });
  }

  const apiUrl = window.COLORFLEX_API_URL || '/api/upload-thumbnail';
  const patternName = (formData.get('properties[Custom Pattern]') || 'pattern').toString().slice(0, 120);
  const safeName = patternName.replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '') || 'pattern';
  const filename = 'colorflex-' + safeName + '-' + Date.now() + '.jpg';

  try {
    const previewUrl = await uploadDataUrlToApi(apiUrl, thumb, filename, 8000);
    if (!previewUrl) {
      console.warn('ColorFlex thumbnail upload HTTP error');
      pushDiag('upload-preview-failed', {});
      if (diagnosticsEnabled) window.__colorflexLastSubmitDiagnostic = diag;
      return;
    }
    pushDiag('upload-preview-ok', { url: previewUrl });

    let proofUrl = null;
    if (fullProofDataUrl && fullProofDataUrl.startsWith('data:image')) {
      const proofFilename = 'colorflex-proof-' + safeName + '-' + Date.now() + '.jpg';
      proofUrl = await uploadDataUrlToApi(apiUrl, fullProofDataUrl, proofFilename, 15000);
      pushDiag('upload-proof-result', { url: proofUrl || null });
    }

    try {
      if (formData.has('properties[_pattern_preview]')) {
        formData.delete('properties[_pattern_preview]');
      }
      if (formData.has('properties[pattern_preview]')) {
        formData.delete('properties[pattern_preview]');
      }
      if (formData.has('properties[pattern_preview_link]')) {
        formData.delete('properties[pattern_preview_link]');
      }
      if (formData.has('properties[proof_with_info_url]')) {
        formData.delete('properties[proof_with_info_url]');
      }
      if (formData.has('properties[pattern_proof_url]')) {
        formData.delete('properties[pattern_proof_url]');
      }
    } catch (delErr) {
      /* older browsers: append may duplicate key; Shopify uses last value in some paths */
    }

    const editorLink = buildColorFlexEditorLink(formData);
    formData.append('properties[_pattern_preview]', previewUrl);
    // For managers/owners, expose pattern_preview as a click-through ColorFlex link.
    formData.append('properties[pattern_preview]', editorLink || previewUrl);
    if (proofUrl) {
      formData.append('properties[pattern_proof_url]', proofUrl);
    }
    try {
      sessionStorage.removeItem('colorflexProceedProofDataUrl');
      sessionStorage.removeItem('colorflexProceedProofMeta');
    } catch (_) {}
    try {
      localStorage.removeItem('colorflexProceedProofDataUrl');
      localStorage.removeItem('colorflexProceedProofMeta');
    } catch (_) {}
    console.log('ColorFlex: Added _pattern_preview + pattern_preview + pattern_proof_url before cart add');
    pushDiag('form-properties-final', {
      pattern_preview: previewUrl,
      pattern_preview_link: editorLink || null,
      pattern_proof_url: proofUrl || null,
      custom_colors: formData.get('properties[Custom Colors]'),
    });
  } catch (err) {
    console.warn('ColorFlex thumbnail upload skipped:', err && err.message ? err.message : err);
    pushDiag('upload-exception', { message: err && err.message ? err.message : String(err) });
  } finally {
    if (diagnosticsEnabled) {
      window.__colorflexLastSubmitDiagnostic = diag;
      window.colorflexDumpDiagnostics = function () {
        return {
          submit: window.__colorflexLastSubmitDiagnostic || null,
          proofRender: window.__colorflexLastProofRenderSnapshot || null,
          restore: window.__colorflexLastRestoreSnapshot || null,
          global: window.__colorflexGlobalDiagnostics || null,
        };
      };
      try {
        sessionStorage.setItem(
          'colorflexLastDiagnostics',
          JSON.stringify({
            submit: window.__colorflexLastSubmitDiagnostic || null,
            proofRender: window.__colorflexLastProofRenderSnapshot || null,
            restore: window.__colorflexLastRestoreSnapshot || null,
            global: window.__colorflexGlobalDiagnostics || null,
          })
        );
      } catch (e) {
        /* ignore */
      }
      console.log('🧪 ColorFlex diagnostics ready. Run window.colorflexDumpDiagnostics()');
    }
  }
}

if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector('form');
        this.variantIdInput.disabled = false;
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        this.submitButton = this.querySelector('[type="submit"]');
        this.submitButtonText = this.submitButton.querySelector('span');

        if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');

        this.hideErrors = this.dataset.hideErrors === 'true';
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

        this.handleErrorMessage();

        this.submitButton.setAttribute('aria-disabled', true);
        this.submitButton.classList.add('loading');
        const loadingSpinner = this.querySelector('.loading__spinner');
        if (loadingSpinner) loadingSpinner.classList.remove('hidden');

        const resetButton = () => {
          this.submitButton.classList.remove('loading');
          if (!this.error) this.submitButton.removeAttribute('aria-disabled');
          const s = this.querySelector('.loading__spinner');
          if (s) s.classList.add('hidden');
        };

        const self = this;
        (async function () {
          try {
            const config = fetchConfig('javascript');
            config.headers['X-Requested-With'] = 'XMLHttpRequest';
            delete config.headers['Content-Type'];

            // 🔢 QUANTITY FIX: Ensure custom quantity is synced before submission
            const customQtyInput = document.getElementById('customQuantity');
            if (customQtyInput) {
              const customQty = parseInt(customQtyInput.value) || 1;
              console.log('🔢 Custom quantity detected:', customQty);

              let qtyInput = self.form.querySelector('input[name="quantity"]');
              if (!qtyInput) {
                qtyInput = document.createElement('input');
                qtyInput.type = 'hidden';
                qtyInput.name = 'quantity';
                self.form.appendChild(qtyInput);
                console.log('✅ Created quantity input in product form');
              }
              qtyInput.value = customQty;
              console.log('✅ Synced custom quantity to form:', customQty);
            }

            const formData = new FormData(self.form);

            // Never block checkout forever on preview/proof generation.
            // If render/upload takes too long, continue add-to-cart without waiting.
            const previewTimeoutMs = 12000;
            const previewTask = ensureColorFlexPatternPreviewOnFormData(formData);
            const timeoutTask = new Promise((resolve) => {
              setTimeout(() => resolve('timeout'), previewTimeoutMs);
            });
            const previewResult = await Promise.race([previewTask, timeoutTask]);
            if (previewResult === 'timeout') {
              console.warn(
                `ColorFlex: preview/proof preparation exceeded ${previewTimeoutMs}ms; continuing cart add without waiting`
              );
            }

            console.log('🚀 SHOPIFY FORM SUBMISSION DEBUG (product-form.js)');
            console.log('📝 Form action:', self.form.action);
            console.log('📋 Form data being submitted to Shopify cart:');
            try {
              for (let [key, value] of formData.entries()) {
                const preview =
                  key === 'properties[_pattern_preview]' && value && String(value).length > 120
                    ? String(value).substring(0, 120) + '…'
                    : value;
                console.log('  ' + key + ': ' + preview);
              }
            } catch (e) {
              console.warn('⚠️ FormData.entries() log failed:', e);
            }

            const quantity = formData.get('quantity');
            const pattern =
              formData.get('properties[Custom Pattern]') || formData.get('properties[Pattern Name]');
            const colors = formData.get('properties[Custom Colors]') || formData.get('properties[Colors]');

            console.log('🔍 KEY FIELDS IN SHOPIFY SUBMISSION:');
            console.log('  Quantity:', quantity);
            console.log('  Pattern:', pattern);
            console.log('  Colors:', colors);

            if (!quantity || quantity === '1') {
              console.warn('⚠️ Quantity issue in Shopify submission');
            }
            if (!pattern) {
              console.warn('⚠️ No pattern data in Shopify submission');
            }

            if (self.cart && typeof self.cart.getSectionsToRender === 'function') {
              const sections = self.cart.getSectionsToRender();
              if (Array.isArray(sections)) {
                formData.append(
                  'sections',
                  sections.map((section) => section.id)
                );
              }
              formData.append('sections_url', window.location.pathname);
              if (typeof self.cart.setActiveElement === 'function') {
                self.cart.setActiveElement(document.activeElement);
              }
            }
            config.body = formData;

            fetch(`${routes.cart_add_url}`, config)
              .then((response) => response.json())
              .then((response) => {
                if (response.status) {
                  publish(PUB_SUB_EVENTS.cartError, {
                    source: 'product-form',
                    productVariantId: formData.get('id'),
                    errors: response.errors || response.description,
                    message: response.message,
                  });
                  self.handleErrorMessage(response.description);

                  const soldOutMessage = self.submitButton.querySelector('.sold-out-message');
                  if (!soldOutMessage) return;
                  self.submitButton.setAttribute('aria-disabled', true);
                  self.submitButtonText.classList.add('hidden');
                  soldOutMessage.classList.remove('hidden');
                  self.error = true;
                  return;
                } else if (!self.cart) {
                  window.location = window.routes.cart_url;
                  return;
                }

                const startMarker = CartPerformance.createStartingMarker('add:wait-for-subscribers');
                if (!self.error)
                  publish(PUB_SUB_EVENTS.cartUpdate, {
                    source: 'product-form',
                    productVariantId: formData.get('id'),
                    cartData: response,
                  }).then(() => {
                    CartPerformance.measureFromMarker('add:wait-for-subscribers', startMarker);
                  });
                self.error = false;
                const quickAddModal = self.closest('quick-add-modal');
                if (quickAddModal) {
                  document.body.addEventListener(
                    'modalClosed',
                    () => {
                      setTimeout(() => {
                        CartPerformance.measure('add:paint-updated-sections', () => {
                          self.cart.renderContents(response);
                        });
                      });
                    },
                    { once: true }
                  );
                  quickAddModal.hide(true);
                } else {
                  CartPerformance.measure('add:paint-updated-sections', () => {
                    self.cart.renderContents(response);
                  });
                }
              })
              .catch((e) => {
                console.error(e);
              })
              .finally(() => {
                self.submitButton.classList.remove('loading');
                if (self.cart && self.cart.classList.contains('is-empty')) self.cart.classList.remove('is-empty');
                if (!self.error) self.submitButton.removeAttribute('aria-disabled');
                const spinner = self.querySelector('.loading__spinner');
                if (spinner) spinner.classList.add('hidden');

                CartPerformance.measureFromEvent('add:user-action', evt);
              });
          } catch (e) {
            console.error('Product form submit error:', e);
            resetButton();
          }
        })();
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
        if (!this.errorMessageWrapper) return;
        this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

        this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }

      toggleSubmitButton(disable = true, text) {
        if (disable) {
          this.submitButton.setAttribute('disabled', 'disabled');
          if (text) this.submitButtonText.textContent = text;
        } else {
          this.submitButton.removeAttribute('disabled');
          this.submitButtonText.textContent = window.variantStrings.addToCart;
        }
      }

      get variantIdInput() {
        return this.form.querySelector('[name=id]');
      }
    }
  );
}
