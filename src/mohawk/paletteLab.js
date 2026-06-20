/**
 * Browser-safe Lab / k-means helpers for Mohawk atmospheric palette extraction.
 * Node CLI tools use tools/mohawk/palette-shared.js (keep algorithm params in sync).
 */

export function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

export function rgbToLab255(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const lin = (u) => (u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4));
  const R = lin(r);
  const G = lin(g);
  const B = lin(b);
  const x = R * 0.4124564 + G * 0.3575761 + B * 0.1804375;
  const y = R * 0.2126729 + G * 0.7151522 + B * 0.072175;
  const z = R * 0.0193339 + G * 0.119192 + B * 0.9503041;
  const xn = 0.95047;
  const yn = 1.0;
  const zn = 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return {
    L: 116 * f(y / yn) - 16,
    a: 500 * (f(x / xn) - f(y / yn)),
    b: 200 * (f(y / yn) - f(z / zn))
  };
}

export function chromaFromAB(a, b) {
  return Math.sqrt(a * a + b * b);
}

export function hueDegFromAB(a, b) {
  const h = Math.atan2(b, a) * (180 / Math.PI);
  return ((h % 360) + 360) % 360;
}

export function hueDist(h1, h2) {
  const d = Math.abs(h1 - h2);
  return Math.min(d, 360 - d);
}

export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function labDist2(L1, a1, b1, L2, a2, b2) {
  const dL = L1 - L2;
  const da = a1 - a2;
  const db = b1 - b2;
  return dL * dL + da * da + db * db;
}

export function rgbToHex(r, g, b) {
  const x = (n) =>
    clamp(Math.round(n), 0, 255)
      .toString(16)
      .padStart(2, '0');
  return '#' + x(r) + x(g) + x(b);
}

export function labToRgbHex(L, a, b) {
  const xn = 0.95047;
  const yn = 1.0;
  const zn = 1.08883;
  const fy = (L + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;
  const f3 = (t) => {
    const t3 = t * t * t;
    return t3 > 0.008856 ? t3 : (t - 16 / 116) / 7.787;
  };
  const X = f3(fx) * xn;
  const Y = f3(fy) * yn;
  const Z = f3(fz) * zn;
  let R = X * 3.2404542 + Y * -1.5371385 + Z * -0.4985314;
  let G = X * -0.969266 + Y * 1.8760108 + Z * 0.041556;
  let B = X * 0.0556434 + Y * -0.2040259 + Z * 1.0572252;
  const gamma = (u) => (u <= 0.0031308 ? 12.92 * u : 1.055 * Math.pow(u, 1 / 2.4) - 0.055);
  R = gamma(R);
  G = gamma(G);
  B = gamma(B);
  return rgbToHex(R * 255, G * 255, B * 255);
}

export function collectOpaquePixels(buf) {
  const out = [];
  for (let i = 0; i < buf.length; i += 4) {
    if (buf[i + 3] === 0) continue;
    out.push(buf[i], buf[i + 1], buf[i + 2]);
  }
  return new Float32Array(out);
}

export function subsampleDeterministic(pixels, target) {
  const n = pixels.length / 3;
  if (n <= target) return pixels;
  const out = new Float32Array(target * 3);
  const step = (n - 1) / (target - 1);
  for (let i = 0; i < target; i++) {
    const idx = Math.floor(i * step);
    const o = i * 3;
    const p = idx * 3;
    out[o] = pixels[p];
    out[o + 1] = pixels[p + 1];
    out[o + 2] = pixels[p + 2];
  }
  return out;
}

export function weightedLabKMeans(labL, labA, labB, weight, indexList, k, maxIters) {
  const m = indexList.length;
  if (m === 0) {
    return { cL: new Float32Array(0), cA: new Float32Array(0), cB: new Float32Array(0), wcount: [] };
  }
  const kk = Math.min(k, m);
  const cL = new Float32Array(kk);
  const cA = new Float32Array(kk);
  const cB = new Float32Array(kk);
  const iters = maxIters || 24;

  let firstIdx = 0;
  let firstW = weight[indexList[0]];
  for (let i = 1; i < m; i++) {
    const w = weight[indexList[i]];
    if (w > firstW) {
      firstW = w;
      firstIdx = i;
    }
  }
  cL[0] = labL[indexList[firstIdx]];
  cA[0] = labA[indexList[firstIdx]];
  cB[0] = labB[indexList[firstIdx]];

  const distBuf = new Float32Array(m);
  for (let c = 1; c < kk; c++) {
    for (let i = 0; i < m; i++) {
      const pi = indexList[i];
      let dmin = labDist2(labL[pi], labA[pi], labB[pi], cL[0], cA[0], cB[0]);
      for (let j = 1; j < c; j++) {
        const d = labDist2(labL[pi], labA[pi], labB[pi], cL[j], cA[j], cB[j]);
        if (d < dmin) dmin = d;
      }
      distBuf[i] = dmin;
    }
    let pick = 0;
    let pickV = distBuf[0];
    for (let i = 1; i < m; i++) {
      if (distBuf[i] > pickV) {
        pickV = distBuf[i];
        pick = i;
      }
    }
    cL[c] = labL[indexList[pick]];
    cA[c] = labA[indexList[pick]];
    cB[c] = labB[indexList[pick]];
  }

  const assign = new Int32Array(m);
  const wSumL = new Float64Array(kk);
  const wSumA = new Float64Array(kk);
  const wSumB = new Float64Array(kk);
  const wcount = new Float64Array(kk);

  for (let iter = 0; iter < iters; iter++) {
    let moved = false;
    for (let i = 0; i < m; i++) {
      const pi = indexList[i];
      let best = 0;
      let bestD = labDist2(labL[pi], labA[pi], labB[pi], cL[0], cA[0], cB[0]);
      for (let j = 1; j < kk; j++) {
        const d = labDist2(labL[pi], labA[pi], labB[pi], cL[j], cA[j], cB[j]);
        if (d < bestD) {
          bestD = d;
          best = j;
        }
      }
      if (assign[i] !== best) {
        assign[i] = best;
        moved = true;
      }
    }
    wSumL.fill(0);
    wSumA.fill(0);
    wSumB.fill(0);
    wcount.fill(0);
    for (let i = 0; i < m; i++) {
      const pi = indexList[i];
      const c = assign[i];
      const w = weight[pi];
      wSumL[c] += labL[pi] * w;
      wSumA[c] += labA[pi] * w;
      wSumB[c] += labB[pi] * w;
      wcount[c] += w;
    }
    for (let j = 0; j < kk; j++) {
      if (wcount[j] > 0) {
        cL[j] = wSumL[j] / wcount[j];
        cA[j] = wSumA[j] / wcount[j];
        cB[j] = wSumB[j] / wcount[j];
      }
    }
    if (!moved && iter > 0) break;
  }
  return { cL, cA, cB, wcount: Array.from(wcount) };
}
