/**
 * Worker: displace a tiled pattern image using a displacement map.
 * Uses OffscreenCanvas so all work runs off the main thread.
 * Honors alpha: output is transparent where displacement map alpha < 128;
 * elsewhere we copy the sampled pattern pixel (including its alpha).
 *
 * Message in:  { type: 'displace', pattern: ImageBitmap, displacementMap: ImageBitmap, strength?: number }
 * Message out: { type: 'result', bitmap: ImageBitmap } or { type: 'error', message: string }
 * ImageBitmaps are transferred (not copied).
 */

self.onmessage = function (e) {
  try {
    const { type, pattern, displacementMap, strength = 1 } = e.data || {};
    if (type !== 'displace' || !pattern || !displacementMap) {
      self.postMessage({ type: 'error', message: 'displace needs pattern and displacementMap' });
      return;
    }

    const w = displacementMap.width;
    const h = displacementMap.height;
    const oc = new OffscreenCanvas(w, h);
    const ctx = oc.getContext('2d');
    if (!ctx) {
      self.postMessage({ type: 'error', message: 'OffscreenCanvas 2d not available' });
      return;
    }

    const maxDispX = w * 0.15 * strength;
    const maxDispY = h * 0.15 * strength;

    ctx.drawImage(displacementMap, 0, 0);
    const dispData = ctx.getImageData(0, 0, w, h);
    const disp = dispData.data;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(pattern, 0, 0, w, h);
    const patternData = ctx.getImageData(0, 0, w, h);
    const patternPixels = patternData.data;

    const outData = ctx.createImageData(w, h);
    const out = outData.data;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) << 2;
        const a = disp[i + 3];
        if (a < 96) {
          out[i] = 0;
          out[i + 1] = 0;
          out[i + 2] = 0;
          out[i + 3] = 0;
          continue;
        }
        const r = disp[i];
        const g = disp[i + 1];
        const dx = ((r - 128) / 128) * maxDispX;
        const dy = ((g - 128) / 128) * maxDispY;
        const sx = Math.max(0, Math.min(w - 1, x + dx));
        const sy = Math.max(0, Math.min(h - 1, y + dy));
        const si = (Math.floor(sy) * w + Math.floor(sx)) << 2;
        out[i]     = patternPixels[si];
        out[i + 1] = patternPixels[si + 1];
        out[i + 2] = patternPixels[si + 2];
        out[i + 3] = patternPixels[si + 3];
      }
    }

    ctx.putImageData(outData, 0, 0);
    oc.convertToBlob({ type: 'image/png' }).then(function (blob) {
      return createImageBitmap(blob);
    }).then(function (bitmap) {
      self.postMessage({ type: 'result', bitmap }, [bitmap]);
    }).catch(function (err) {
      self.postMessage({ type: 'error', message: err && err.message ? err.message : String(err) });
    });
  } catch (err) {
    self.postMessage({ type: 'error', message: (err && err.message ? err.message : String(err)) });
  }
};
