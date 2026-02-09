const fs = require('fs');
const { execSync } = require('child_process');
const { getPaletteFromURL } = require('color-thief-node');
const ColorModule = require('colorjs.io');
const Color = ColorModule.default || ColorModule;

const COLOR_DB_PATH = 'colors.json';
const TMP_IMAGE_PATH = 'clipboard_image.png';
const SWATCH_COUNT = 10;
const DELTA_E_THRESHOLD = 2.3;

// 🖼️ Grab from clipboard
try {
  execSync(`pngpaste ${TMP_IMAGE_PATH}`);
  console.log('📋 Clipboard image saved to', TMP_IMAGE_PATH);
} catch (e) {
  console.error('❌ Could not extract image from clipboard. Make sure an image is copied.');
  process.exit(1);
}

// 🎨 Load Sherwin-Williams color DB
const swColors = JSON.parse(fs.readFileSync(COLOR_DB_PATH, 'utf8'));

// 🔬 Match two RGB arrays via DeltaE
function colorDistance(rgb1, rgb2) {
  const srgb1 = rgb1.map(v => v / 255);
  const srgb2 = rgb2.map(v => v / 255);
  const color1 = new Color("srgb", srgb1);
  const color2 = new Color("srgb", srgb2);
  return color1.deltaE(color2, { method: "2000" });
}

// 🧠 Filter out similar colors (DeltaE < 2.3)
function filterDistinctColors(palette, threshold = DELTA_E_THRESHOLD) {
  const distinct = [];

  palette.forEach(color => {
    const isDuplicate = distinct.some(existing => colorDistance(color, existing) < threshold);
    if (!isDuplicate) distinct.push(color);
  });

  return distinct;
}

// 🎯 Find closest SW match
function findClosestColor(rgb) {
  return swColors.reduce((closest, sw) => {
    const dist = colorDistance(rgb, [sw.red, sw.green, sw.blue]);
    return dist < closest.dist ? { ...sw, dist } : closest;
  }, { dist: Infinity });
}

// 🏁 Run the magic
(async () => {
  try {
const palette = await getPaletteFromURL(TMP_IMAGE_PATH, SWATCH_COUNT);
    const distinctColors = filterDistinctColors(palette);

    console.log(`\n🎨 Found ${distinctColors.length} distinct color(s):\n`);

    distinctColors.forEach(rgb => {
      const match = findClosestColor(rgb);
      const hex = '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
      console.log(`RGB(${rgb.join(', ')}) → ${match.color_name.toUpperCase()} [${match.sw_number}] - ${hex}`);
    });

    fs.unlinkSync(TMP_IMAGE_PATH); // cleanup
  } catch (err) {
    console.error('💥 Error:', err.message);
  }
})();
