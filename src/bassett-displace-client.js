/**
 * Client for pattern-displace.worker.js.
 * Displaces a tiled pattern image using a displacement map, off the main thread.
 *
 * Usage:
 *   const bitmap = await displaceTiledPattern(patternImageBitmap, displacementMapBitmap, { strength: 1 });
 *   ctx.drawImage(bitmap, 0, 0);
 *   bitmap.close();
 *
 * Worker URL: /assets/workers/pattern-displace.worker.js (set window.BASSETT_DISPLACE_WORKER_URL to override)
 */

let _worker = null;

function getWorker() {
  if (_worker) return _worker;
  const base = (typeof window !== 'undefined' && (window.ColorFlexApiBaseUrl || window.location.origin)) || '';
  const url = (typeof window !== 'undefined' && window.BASSETT_DISPLACE_WORKER_URL) ||
    (base.replace(/\/$/, '') + '/assets/workers/pattern-displace.worker.js');
  _worker = new Worker(url);
  return _worker;
}

/**
 * @param {ImageBitmap} patternBitmap - Tiled pattern (will be drawn to displacement map size in worker)
 * @param {ImageBitmap} displacementMapBitmap - Grayscale or RG displacement map (R=X, G=Y; 128=no shift)
 * @param {{ strength?: number }} options - strength multiplies displacement (default 1)
 * @returns {Promise<ImageBitmap>} - Displaced pattern as ImageBitmap; caller should .close() when done
 */
function displaceTiledPattern(patternBitmap, displacementMapBitmap, options) {
  const strength = (options && options.strength != null) ? options.strength : 1;
  return new Promise((resolve, reject) => {
    const worker = getWorker();
    const onMessage = (e) => {
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);
      const d = e.data;
      if (d && d.type === 'result' && d.bitmap) resolve(d.bitmap);
      else if (d && d.type === 'error') reject(new Error(d.message || 'displace failed'));
      else reject(new Error('displace worker unknown response'));
    };
    const onError = (err) => {
      worker.removeEventListener('message', onMessage);
      worker.removeEventListener('error', onError);
      reject(err && err.message ? err : new Error('displace worker error'));
    };
    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', onError);
    worker.postMessage(
      { type: 'displace', pattern: patternBitmap, displacementMap: displacementMapBitmap, strength },
      [patternBitmap, displacementMapBitmap]
    );
  });
}

/**
 * Create ImageBitmaps from image URL(s) for use with displaceTiledPattern.
 * @param {string} patternUrl - URL or data URL of tiled pattern
 * @param {string} displacementMapUrl - URL or data URL of displacement map
 * @returns {Promise<{ pattern: ImageBitmap, displacementMap: ImageBitmap }>} - Call .close() on both when done
 */
function loadPatternAndDisplacementMap(patternUrl, displacementMapUrl) {
  const createBitmap = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => createImageBitmap(img).then(resolve, reject);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });
  return Promise.all([createBitmap(patternUrl), createBitmap(displacementMapUrl)]).then(
    ([pattern, displacementMap]) => ({ pattern, displacementMap })
  );
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { displaceTiledPattern, loadPatternAndDisplacementMap, getWorker };
}
