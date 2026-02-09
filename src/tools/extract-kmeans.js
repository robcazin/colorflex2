const fs = require('fs');
const sharp = require('sharp');
const { execSync } = require('child_process');
const { kmeans } = require('ml-kmeans');
const { default: Color } = require('colorjs.io');
const { createCanvas } = require('canvas');

const COLOR_DB_PATH = 'colors.json';
const TMP_IMAGE_PATH = 'clipboard_image.png';
const DEFAULT_COLOR_COUNT = 6;
const DELTA_E_THRESHOLD = 2.3;

const swColors = JSON.parse(fs.readFileSync(COLOR_DB_PATH, 'utf8'));

// Read CLI args
const argIndex = process.argv.indexOf('--colors');
const colorCount = argIndex >= 0 && !isNaN(process.argv[argIndex+1])
  ? parseInt(process.argv[argIndex+1],10)
  : DEFAULT_COLOR_COUNT;
const doSwatch = process.argv.includes('--swatch');
const useClipboard = process.argv.includes('--from-clipboard');

// Utility functions
function deltaE(rgb1, rgb2) {
  const c1 = new Color("srgb", rgb1.map(v => v/255));
  const c2 = new Color("srgb", rgb2.map(v => v/255));
  return c1.deltaE(c2, { method: "2000" });
}

function filterDistinct(colors, threshold=DELTA_E_THRESHOLD) {
  const unique = [];
  colors.forEach(col => {
    if (!unique.some(u => deltaE(col, u) < threshold)) {
      unique.push(col);
    }
  });
  return unique;
}

function matchSW(rgb) {
  let closest = null;
  let closestDelta = Infinity;
  for (const sw of swColors) {
    const dE = deltaE(rgb, [sw.red, sw.green, sw.blue]);
    if (dE < 1.5) {
      return sw;
    }
    if (dE < closestDelta) {
      closest = sw;
      closestDelta = dE;
    }
  }
  return closest;
}

function rgbToHex(rgb) {
  return '#' + rgb.map(v => Math.round(v).toString(16).padStart(2,'0')).join('').toUpperCase();
}

function generateSwatchCard(results) {
  const circleRadius = 40;
  const spacing = 40;
  const width = results.length * (circleRadius * 2 + spacing);
  const height = 200;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 🔒 Force opaque white background
  ctx.globalAlpha = 1.0;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#000000';
  ctx.font = '14px sans-serif';

  results.forEach((res, i) => {
    const cx = spacing/2 + circleRadius + i * (circleRadius * 2 + spacing);
    const cy = 40;

    // 🟠 Color Circle
    ctx.beginPath();
    ctx.fillStyle = res.hex;
    ctx.arc(cx, cy, circleRadius, 0, Math.PI * 2);
    ctx.fill();

    // 🔤 Label: SW Code
    ctx.fillStyle = '#000000';
    ctx.fillText(res.sw_number.toUpperCase(), cx, cy + circleRadius + 10);

    // 🔤 Label: Name
    ctx.fillText(res.color_name.toUpperCase(), cx, cy + circleRadius + 28);
  });

  const out = fs.createWriteStream('swatch-card.png');
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  out.on('finish', () => console.log('✅ Swatch card saved as swatch-card.png'));
}



// Main flow
(async () => {
  if (useClipboard) {
    try {
      execSync(`pngpaste ${TMP_IMAGE_PATH}`);
      console.log('📋 Clipboard image saved to', TMP_IMAGE_PATH);
    } catch (err) {
      console.error('❌ Could not extract image from clipboard. Make sure an image is copied.');
      process.exit(1);
    }
  }
  const imagePath = useClipboard ? TMP_IMAGE_PATH : 'image.jpg';

  try {
    const { data, info } = await sharp(imagePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const pixels = [];
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i+3];
      if (a > 128) {
        pixels.push([data[i], data[i+1], data[i+2]]);
      }
    }

    const result = kmeans(pixels, colorCount);
    const centers = filterDistinct(result.centroids);
    console.log(`\n🎯 Extracted ${centers.length} distinct color(s):\n`);

    const finalResults = centers.map(rgb => {
      const match = matchSW(rgb);
      const hex = rgbToHex(rgb);
      console.log(`RGB(${rgb.map(v=>Math.round(v)).join(', ')}) → ${match.color_name.toUpperCase()} [${match.sw_number}] - ${hex}`);
      return { color_name: match.color_name, sw_number: match.sw_number, hex };
    });

    if (doSwatch) {
      generateSwatchCard(finalResults);
    }

    if (useClipboard) {
      fs.unlinkSync(TMP_IMAGE_PATH);
    }

  } catch (err) {
    console.error('💥 Error:', err.message);
  }
})();
