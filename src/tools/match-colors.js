const fs = require('fs');
const sharp = require('sharp');
const { execSync } = require('child_process');
const ColorModule = require('colorjs.io');
const Color = ColorModule.default || ColorModule; // ✅ supports both import types

const COLOR_DB_PATH = 'colors.json';
const TMP_IMAGE_PATH = 'clipboard_image.png';

const swColors = JSON.parse(fs.readFileSync(COLOR_DB_PATH, 'utf8'));

// Define sample pixel positions
const SAMPLE_POINTS = [
  { label: 'Top Left Beige', x: 70, y: 60 },
  { label: 'Gold Stroke', x: 110, y: 130 },
  { label: 'Red Stroke', x: 150, y: 60 },
  { label: 'Blue Dot', x: 120, y: 90 }
];

// Load image from clipboard
try {
  execSync(`pngpaste ${TMP_IMAGE_PATH}`);
  console.log('📋 Clipboard image saved to', TMP_IMAGE_PATH);
} catch (e) {
  console.error('❌ Could not extract image from clipboard. Make sure an image is copied.');
  process.exit(1);
}

// Get deltaE between two RGB values using colorjs.io
function colorDistance(rgb1, swColor) {
  const srgb1 = rgb1.map(v => v / 255);
  const srgb2 = [swColor.red, swColor.green, swColor.blue].map(v => v / 255);

  const color1 = new Color("srgb", srgb1);
  const color2 = new Color("srgb", srgb2);

  return color1.deltaE(color2, { method: "2000" });
}

// Find closest Sherwin-Williams match
function findClosestColor(rgb) {
  return swColors.reduce((closest, sw) => {
    const dist = colorDistance(rgb, sw);
    return dist < closest.dist ? { ...sw, dist } : closest;
  }, { dist: Infinity });
}

// Sample pixels and match
sharp(TMP_IMAGE_PATH)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })
  .then(({ data, info }) => {
    console.log(`\n🖼️ Image size: ${info.width}x${info.height}`);
    console.log(`🎯 Sampling ${SAMPLE_POINTS.length} points:\n`);

    SAMPLE_POINTS.forEach(point => {
      const idx = (point.y * info.width + point.x) * 4;
      const rgb = [data[idx], data[idx + 1], data[idx + 2]];

      const match = findClosestColor(rgb);

      console.log(`${point.label} at (${point.x}, ${point.y}):`);
      console.log(`  RGB(${rgb.join(', ')}) → ${match.color_name.toUpperCase()} [${match.sw_number}] - #${match.hex.toUpperCase()}\n`);
    });

    // Optional: cleanup clipboard image
    fs.unlinkSync(TMP_IMAGE_PATH);
  })
  .catch(err => {
    console.error('💥 Sharp error:', err.message);
  });
