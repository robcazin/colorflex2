#!/usr/bin/env node
/**
 * Visual fixture for src/mohawk/mohawkPinnedSurface.js — writes a PNG for manual inspection
 * before CFM wiring. Uses the real applyPinnedSurfaceComposite (tiling + homography + matte quad).
 *
 * Requires the optional `canvas` package (node-canvas / browser Canvas in Node). It is not
 * listed in package.json; some repo tools (e.g. src/tools/extract-kmeans.js) expect it too.
 * Install locally when you want PNG output:
 *   npm install canvas
 *
 * Output: tmp/mohawk-pinned-surface-fixture.png (tmp/ is gitignored)
 *
 * Run: node scripts/render-mohawk-pinned-surface-fixture.js
 */

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

function installCanvasGlobals() {
  let createCanvas;
  let Image;
  let Canvas;
  try {
    // eslint-disable-next-line import/no-extraneous-dependencies, import/no-unresolved
    const canvasLib = require('canvas');
    createCanvas = canvasLib.createCanvas;
    Image = canvasLib.Image;
    Canvas = canvasLib.Canvas || createCanvas(1, 1).constructor;
  } catch (e) {
    if (e && e.code === 'MODULE_NOT_FOUND') {
      console.error(
        '[mohawk-pinned-fixture] The `canvas` package is not installed (not a declared dependency).\n' +
          '  Install it to render PNG fixtures, e.g.: npm install canvas\n' +
          '  (See also: src/tools/extract-kmeans.js — same optional dependency.)\n' +
          '  No new dependency was added to package.json by this script.'
      );
      process.exit(1);
    }
    throw e;
  }

  global.HTMLCanvasElement = Canvas;
  global.HTMLImageElement = Image;
  global.Image = Image;

  global.document = {
    createElement(tagName) {
      const t = String(tagName).toLowerCase();
      if (t !== 'canvas') {
        throw new Error('[mohawk-pinned-fixture] document.createElement only supports canvas, got: ' + tagName);
      }
      return createCanvas(2, 2);
    },
  };

  return { createCanvas };
}

function meanRgb(imageData) {
  const d = imageData.data;
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let i = 0; i < d.length; i += 4) {
    r += d[i];
    g += d[i + 1];
    b += d[i + 2];
    n++;
  }
  return { r: r / n, g: g / n, b: b / n };
}

function totalAbsDiff(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    s += Math.abs(a[i] - b[i]);
  }
  return s;
}

async function main() {
  const { createCanvas } = installCanvasGlobals();

  const W = 512;
  const H = 384;
  const base = createCanvas(W, H);
  const ctx = base.getContext('2d');
  ctx.fillStyle = 'rgb(192, 192, 192)';
  ctx.fillRect(0, 0, W, H);
  const before = ctx.getImageData(0, 0, W, H);

  const moduleUrl = pathToFileURL(path.join(__dirname, '..', 'src', 'mohawk', 'mohawkPinnedSurface.js')).href;
  const { applyPinnedSurfaceComposite } = await import(moduleUrl);

  // Trapezoid quad: perspective + tiling visible in output PNG
  const corners = [
    [72, 96],
    [440, 84],
    [468, 308],
    [44, 318],
  ];

  await applyPinnedSurfaceComposite(
    base,
    {
      corners,
      matteFromQuad: true,
      proceduralTile: true,
      tileRepeat: 9,
    },
    null,
    null
  );

  const after = ctx.getImageData(0, 0, W, H);
  const diff = totalAbsDiff(before.data, after.data);
  const meanBefore = meanRgb(before);
  const meanAfter = meanRgb(after);

  if (diff < 500000) {
    console.error('[mohawk-pinned-fixture] Expected large pixel change vs gray baseline, got diff sum', diff);
    process.exit(1);
  }

  const outDir = path.join(__dirname, '..', 'tmp');
  const outFile = path.join(outDir, 'mohawk-pinned-surface-fixture.png');
  fs.mkdirSync(outDir, { recursive: true });
  const png = base.toBuffer('image/png');
  fs.writeFileSync(outFile, png);

  console.log('Wrote', path.relative(process.cwd(), outFile), '(' + png.length + ' bytes)');
  console.log('  mean RGB before:', meanBefore.r.toFixed(2), meanBefore.g.toFixed(2), meanBefore.b.toFixed(2));
  console.log('  mean RGB after: ', meanAfter.r.toFixed(2), meanAfter.g.toFixed(2), meanAfter.b.toFixed(2));
  console.log('  total abs channel diff vs baseline:', diff);
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
