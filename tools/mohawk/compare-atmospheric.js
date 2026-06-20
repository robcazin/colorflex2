#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Side-by-side comparison: current Mohawk extractor vs atmospheric variant.
 * Does not touch app, palette bridge, compositor, or deploy.
 *
 * Usage:
 *   npm run test:mohawk-atmospheric -- /path/to/carpet.jpg
 *   node tools/mohawk/compare-atmospheric.js /path/to/carpet.jpg [--colors 5]
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { extractMohawkPalette } = require('./extract-palette');
const { extractMohawkPaletteAtmospheric } = require('./extract-palette-atmospheric');
const { REPO_ROOT, slugifyInput, loadInputBuffer, hexToRgb } = require('./palette-shared');

const COMPARE_OUT = path.join(REPO_ROOT, 'tools', 'mohawk', 'compare-out');
const SWATCH = 72;
const GAP = 8;
const PAD = 16;

function argValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] || null;
}

function printHelp() {
  console.log(`
Usage:
  npm run test:mohawk-atmospheric -- <imagePathOrUrl> [--colors 5]

Runs the current perceptual extractor and the atmospheric macro extractor,
writes JSON for both, and generates compare.html + compare.png.

Output directory:
  tools/mohawk/compare-out/<carpet-slug>/
`);
}

function paletteSummary(doc) {
  const bg = doc.palette.find((p) => p.role === 'background');
  const lw = doc.palette.find((p) => p.role === 'linework');
  const ac = doc.palette.find((p) => p.role === 'accent');
  return {
    background: bg ? bg.hex : null,
    linework: lw ? lw.hex : null,
    accent: ac ? ac.hex : null,
    averageSaturation: doc.averageSaturation,
    strategy: doc.strategy,
    extractorVersion: doc.extractorVersion || doc.strategy
  };
}

function renderSwatchRowHtml(title, doc) {
  const chips = doc.palette
    .map(function (p) {
      return (
        '<div class="chip">' +
        '<div class="sw" style="background:' +
        p.hex +
        '"></div>' +
        '<div class="meta"><span class="role">' +
        p.role +
        '</span><span class="hex">' +
        p.hex +
        '</span></div></div>'
      );
    })
    .join('');
  const sum = paletteSummary(doc);
  return (
    '<section class="panel"><h2>' +
    title +
    '</h2>' +
    '<p class="sub">' +
    (doc.extractorVersion || doc.strategy) +
    ' · avg sat ' +
    sum.averageSaturation +
    '</p>' +
    '<div class="row">' +
    chips +
    '</div></section>'
  );
}

function buildCompareHtml(input, carpetRel, currentDoc, atmosphericDoc) {
  const carpetSection =
    '<section class="panel"><h2>Original carpet</h2>' +
    '<p class="sub">' +
    input +
    '</p>' +
    '<img class="carpet" src="' +
    carpetRel +
    '" alt="carpet thumbnail"/></section>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Mohawk palette compare — ${path.basename(String(input))}</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; background:#1a1a1a; color:#e8e8e8; margin:0; padding:24px; }
    h1 { font-size:1.1rem; font-weight:600; margin:0 0 20px; color:#d4af37; }
    .grid { display:grid; grid-template-columns: 280px 1fr 1fr; gap:20px; align-items:start; }
    @media (max-width: 960px) { .grid { grid-template-columns: 1fr; } }
    .panel { background:#242424; border:1px solid #333; border-radius:8px; padding:14px; }
    h2 { font-size:0.85rem; margin:0 0 6px; letter-spacing:0.04em; text-transform:uppercase; color:#ccc; }
    .sub { font-size:0.72rem; color:#888; margin:0 0 12px; word-break:break-all; }
    .carpet { max-width:100%; height:auto; border-radius:6px; border:1px solid #444; }
    .row { display:flex; flex-wrap:wrap; gap:10px; }
    .chip { width:72px; }
    .sw { width:72px; height:72px; border-radius:6px; border:1px solid rgba(255,255,255,0.15); }
    .meta { margin-top:4px; font-size:0.65rem; line-height:1.3; }
    .role { display:block; color:#aaa; }
    .hex { display:block; font-family: ui-monospace, monospace; color:#ddd; }
    .png-link { margin-top:16px; font-size:0.8rem; }
    a { color:#7eb8ff; }
  </style>
</head>
<body>
  <h1>Mohawk extractor comparison</h1>
  <div class="grid">
    ${carpetSection}
    ${renderSwatchRowHtml('Current extractor', currentDoc)}
    ${renderSwatchRowHtml('Atmospheric extractor', atmosphericDoc)}
  </div>
  <p class="png-link">Flat strip: <a href="compare.png">compare.png</a></p>
</body>
</html>
`;
}

async function drawSwatchStrip(doc, label) {
  const n = doc.palette.length;
  const labelH = 22;
  const w = PAD * 2 + n * SWATCH + (n - 1) * GAP;
  const h = PAD * 2 + labelH + SWATCH;
  const bg = Buffer.alloc(w * h * 4, 255);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      bg[i] = 36;
      bg[i + 1] = 36;
      bg[i + 2] = 36;
      bg[i + 3] = 255;
    }
  }
  for (let i = 0; i < n; i++) {
    const { r, g, b } = hexToRgb(doc.palette[i].hex);
    const x0 = PAD + i * (SWATCH + GAP);
    const y0 = PAD + labelH;
    for (let y = y0; y < y0 + SWATCH; y++) {
      for (let x = x0; x < x0 + SWATCH; x++) {
        const p = (y * w + x) * 4;
        bg[p] = r;
        bg[p + 1] = g;
        bg[p + 2] = b;
        bg[p + 3] = 255;
      }
    }
  }
  const row = await sharp(bg, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
  const labelSvg =
    '<svg width="' +
    w +
    '" height="' +
    labelH +
    '"><text x="4" y="15" fill="#cccccc" font-family="sans-serif" font-size="12">' +
    label +
    '</text></svg>';
  const labelBuf = await sharp(Buffer.from(labelSvg)).png().toBuffer();
  return sharp(row).extend({ top: 0, bottom: 0, left: 0, right: 0 }).toBuffer();
}

async function buildComparePng(carpetThumbBuf, currentDoc, atmosphericDoc) {
  const thumb = await sharp(carpetThumbBuf)
    .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
    .extend({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      background: { r: 36, g: 36, b: 36, alpha: 1 }
    })
    .png()
    .toBuffer();

  const thumbMeta = await sharp(thumb).metadata();
  const thumbW = thumbMeta.width || 200;
  const thumbH = thumbMeta.height || 200;

  async function paletteRow(doc, label) {
    const n = doc.palette.length;
    const w = PAD * 2 + n * SWATCH + Math.max(0, n - 1) * GAP;
    const labelH = 20;
    const h = PAD + labelH + SWATCH + PAD;
    const canvas = Buffer.alloc(w * h * 4);
    for (let i = 0; i < canvas.length; i += 4) {
      canvas[i] = 36;
      canvas[i + 1] = 36;
      canvas[i + 2] = 36;
      canvas[i + 3] = 255;
    }
    for (let si = 0; si < n; si++) {
      const { r, g, b } = hexToRgb(doc.palette[si].hex);
      const x0 = PAD + si * (SWATCH + GAP);
      const y0 = PAD + labelH;
      for (let y = y0; y < y0 + SWATCH; y++) {
        for (let x = x0; x < x0 + SWATCH; x++) {
          const p = (y * w + x) * 4;
          canvas[p] = r;
          canvas[p + 1] = g;
          canvas[p + 2] = b;
          canvas[p + 3] = 255;
        }
      }
    }
    const rowImg = await sharp(canvas, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
    const labelSvg =
      '<svg width="' +
      w +
      '" height="' +
      labelH +
      '"><text x="4" y="14" fill="#d4af37" font-family="sans-serif" font-size="11">' +
      label +
      '</text></svg>';
    const labelImg = await sharp(Buffer.from(labelSvg)).png().toBuffer();
    return sharp({
      create: {
        width: Math.max(w, thumbW),
        height: h,
        channels: 4,
        background: { r: 36, g: 36, b: 36, alpha: 1 }
      }
    })
      .composite([
        { input: labelImg, top: PAD, left: 0 },
        { input: rowImg, top: PAD, left: 0 }
      ])
      .png()
      .toBuffer();
  }

  const rowCurrent = await paletteRow(currentDoc, 'Current (perceptual v3)');
  const rowAtmo = await paletteRow(atmosphericDoc, 'Atmospheric macro v1');

  const rowMeta = await sharp(rowCurrent).metadata();
  const rowW = rowMeta.width || thumbW;
  const rowH = (rowMeta.height || 0) + (await sharp(rowAtmo).metadata()).height + GAP;

  const totalW = Math.max(thumbW, rowW) + PAD * 3 + 200;
  const leftW = Math.max(thumbW, 200);
  const rightW = Math.max(rowW, leftW);
  const totalH = PAD + Math.max(thumbH, rowH) + PAD;

  const carpetCol = await sharp({
    create: {
      width: leftW,
      height: thumbH + 24,
      channels: 4,
      background: { r: 36, g: 36, b: 36, alpha: 1 }
    }
  })
    .composite([{ input: thumb, top: 24, left: Math.floor((leftW - thumbW) / 2) }])
    .png()
    .toBuffer();

  const carpetLabel = await sharp(
    Buffer.from(
      '<svg width="' +
        leftW +
        '" height="20"><text x="4" y="14" fill="#d4af37" font-family="sans-serif" font-size="11">Original carpet</text></svg>'
    )
  )
    .png()
    .toBuffer();

  const stackedRows = await sharp(rowCurrent)
    .extend({
      bottom: GAP,
      background: { r: 36, g: 36, b: 36, alpha: 1 }
    })
    .composite([{ input: rowAtmo, top: (rowMeta.height || 0) + GAP, left: 0 }])
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: leftW + GAP + rightW + PAD * 2,
      height: totalH,
      channels: 4,
      background: { r: 26, g: 26, b: 26, alpha: 1 }
    }
  })
    .composite([
      { input: carpetLabel, top: PAD, left: PAD },
      { input: carpetCol, top: PAD + 20, left: PAD },
      { input: stackedRows, top: PAD, left: PAD + leftW + GAP }
    ])
    .png()
    .toBuffer();
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printHelp();
    process.exit(argv.length === 0 ? 1 : 0);
  }

  const positional = argv.filter((a) => !a.startsWith('--'));
  const input = positional[0];
  if (!input) {
    console.error('Error: missing <imagePathOrUrl>');
    printHelp();
    process.exit(1);
  }

  let colors = parseInt(argValue('--colors') || '5', 10);
  if (Number.isNaN(colors)) colors = 5;

  const slug = slugifyInput(input);
  const outDir = path.join(COMPARE_OUT, slug);
  fs.mkdirSync(outDir, { recursive: true });

  console.log('Running current extractor (perceptual v3)...');
  const currentDoc = await extractMohawkPalette(input, { colors });
  console.log('Running atmospheric extractor...');
  const atmosphericDoc = await extractMohawkPaletteAtmospheric(input, { colors });

  const currentPath = path.join(outDir, 'current.json');
  const atmosphericPath = path.join(outDir, 'atmospheric.json');
  fs.writeFileSync(currentPath, JSON.stringify(currentDoc, null, 2) + '\n', 'utf8');
  fs.writeFileSync(atmosphericPath, JSON.stringify(atmosphericDoc, null, 2) + '\n', 'utf8');

  const carpetBuf = await loadInputBuffer(input);
  const carpetPreview = path.join(outDir, 'carpet-thumb.jpg');
  await sharp(carpetBuf)
    .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 88 })
    .toFile(carpetPreview);

  const html = buildCompareHtml(input, 'carpet-thumb.jpg', currentDoc, atmosphericDoc);
  const htmlPath = path.join(outDir, 'compare.html');
  fs.writeFileSync(htmlPath, html, 'utf8');

  const pngBuf = await buildComparePng(carpetBuf, currentDoc, atmosphericDoc);
  const pngPath = path.join(outDir, 'compare.png');
  fs.writeFileSync(pngPath, pngBuf);

  const cur = paletteSummary(currentDoc);
  const atm = paletteSummary(atmosphericDoc);

  console.log('');
  console.log('=== Comparison summary ===');
  console.log('Carpet:      ', input);
  console.log('');
  console.log('Current:');
  console.log('  background:', cur.background);
  console.log('  linework:  ', cur.linework);
  console.log('  accent:    ', cur.accent);
  console.log('  avg sat:   ', cur.averageSaturation);
  console.log('');
  console.log('Atmospheric:');
  console.log('  background:', atm.background);
  console.log('  linework:  ', atm.linework);
  console.log('  accent:    ', atm.accent);
  console.log('  avg sat:   ', atm.averageSaturation);
  console.log('');
  console.log('Outputs:');
  console.log(' ', path.relative(REPO_ROOT, currentPath));
  console.log(' ', path.relative(REPO_ROOT, atmosphericPath));
  console.log(' ', path.relative(REPO_ROOT, htmlPath));
  console.log(' ', path.relative(REPO_ROOT, pngPath));
  console.log(' ', path.relative(REPO_ROOT, carpetPreview));
}

if (require.main === module) {
  main().catch(function (err) {
    console.error(err.message || err);
    process.exit(1);
  });
}
