/**
 * Browser atmospheric carpet palette extraction for Mohawk Room runtime.
 * Feeds the ranked 10-color bridge in colorflexPaletteHook.js.
 */
import {
  collectOpaquePixels,
  subsampleDeterministic
} from './paletteLab.js';
import {
  buildAtmosphericPalette,
  TARGET_PALETTE_SIZE,
  RANKED_SLOTS,
  EXTRACTOR_VERSION
} from './paletteAtmosphericCore.js';

function loadImage(url) {
  return new Promise(function (resolve, reject) {
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () { resolve(img); };
    img.onerror = function () { reject(new Error('Failed to load carpet image: ' + url)); };
    img.src = url;
  });
}

function macroSampleFromImage(img, opts) {
  var blurSigma = opts && opts.blurSigma != null ? opts.blurSigma : 2.5;
  var maxWidth = opts && opts.maxWidth != null ? opts.maxWidth : 140;
  var subsampleTarget = opts && opts.subsampleTarget != null ? opts.subsampleTarget : 9000;

  var iw = img.naturalWidth || img.width || 1;
  var ih = img.naturalHeight || img.height || 1;
  var scale = Math.min(1, maxWidth / iw);
  var w = Math.max(1, Math.round(iw * scale));
  var h = Math.max(1, Math.round(ih * scale));

  var c1 = document.createElement('canvas');
  c1.width = w;
  c1.height = h;
  var ctx1 = c1.getContext('2d', { willReadFrequently: true });
  ctx1.drawImage(img, 0, 0, w, h);

  var shrink = Math.max(1, 1 + blurSigma * 0.45);
  var bw = Math.max(1, Math.round(w / shrink));
  var bh = Math.max(1, Math.round(h / shrink));
  var c2 = document.createElement('canvas');
  c2.width = bw;
  c2.height = bh;
  c2.getContext('2d').drawImage(c1, 0, 0, bw, bh);

  var c3 = document.createElement('canvas');
  c3.width = w;
  c3.height = h;
  c3.getContext('2d').drawImage(c2, 0, 0, w, h);

  var data = c3.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, w, h).data;
  var opaque = collectOpaquePixels(data);
  var nPix = opaque.length / 3;
  if (nPix < 80) {
    throw new Error('Too few opaque pixels (' + nPix + ') after macro preprocess.');
  }
  var sample = subsampleDeterministic(opaque, Math.min(subsampleTarget, nPix));
  return { sample: sample, width: w, height: h, nPix: nPix };
}

/**
 * @param {string} imageUrl CORS-accessible carpet thumbnail URL
 * @param {{ minDeltaE?: number }} [options]
 * @returns {Promise<{ colors: string[], palette: object[], rankedSlots: string[], roles: object, extractorVersion: string }>}
 */
export async function extractMohawkCarpetPaletteAtmospheric(imageUrl, options) {
  var img = await loadImage(imageUrl);
  var sampled = macroSampleFromImage(img, options || {});
  var built = buildAtmosphericPalette(sampled.sample, TARGET_PALETTE_SIZE, options || {});
  var colors = built.colors;
  return {
    colors: colors,
    palette: built.palette,
    rankedSlots: RANKED_SLOTS.slice(0, built.targetCount),
    roles: {
      background: colors[0],
      linework: colors[1] || colors[0],
      accent: colors[2] || colors[1] || colors[0]
    },
    extractorVersion: EXTRACTOR_VERSION
  };
}
