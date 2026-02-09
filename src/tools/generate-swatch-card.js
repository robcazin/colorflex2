const { createCanvas } = require('canvas');
const fs = require('fs');

// === Load color data ===
const matchedColors = [
  {
    color_name: "RUSTIC CITY",
    sw_number: "SW7699",
    rgb: [187, 157, 110],
    hex: "#BB9D6E"
  },
  {
    color_name: "COTTAGE LINEN",
    sw_number: "SC0001",
    rgb: [239, 240, 232],
    hex: "#EFF0E8"
  },
  {
    color_name: "PEACOCK PLUME",
    sw_number: "SW0020",
    rgb: [116, 149, 147],
    hex: "#749593"
  },
  {
    color_name: "SUBDUED SIENNA",
    sw_number: "SW9009",
    rgb: [202, 137, 108],
    hex: "#CA896C"
  }
];

// === Config ===
const circleRadius = 40;
const spacing = 30;
const width = matchedColors.length * (circleRadius * 2 + spacing);
const height = 200;
const fontSize = 14;

const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// === Drawing Function ===
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, width, height);

ctx.textAlign = 'center';
ctx.font = `${fontSize}px sans-serif`;

matchedColors.forEach((color, i) => {
  const cx = spacing / 2 + circleRadius + i * (circleRadius * 2 + spacing);
  const cy = 60;

  // Draw circle
  const [r, g, b] = color.rgb;
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.beginPath();
  ctx.arc(cx, cy, circleRadius, 0, Math.PI * 2);
  ctx.fill();

  // Draw labels
  ctx.fillStyle = '#000';
  ctx.fillText(color.sw_number, cx, cy + circleRadius + 20);
  ctx.fillText(color.color_name, cx, cy + circleRadius + 40);
});

// === Export PNG ===
const out = fs.createWriteStream('swatch-card.png');
const stream = canvas.createPNGStream();
stream.pipe(out);
out.on('finish', () => {
  console.log('✅ Swatch card saved as swatch-card.png');
});
