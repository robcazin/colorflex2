#!/usr/bin/env node
/**
 * Generates curated wallpaper-only assets under demo-snapshot/ for the trade-show offline demo.
 * Run from repo root: node scripts/build-trade-show-snapshot.js
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const SNAP = path.join(ROOT, 'demo-snapshot');
const TOOLS_COLORS = path.join(ROOT, 'src', 'tools', 'colors.json');

async function writeJpeg(rel, rgb) {
  const dest = path.join(SNAP, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 3,
      background: { r: rgb[0], g: rgb[1], b: rgb[2] }
    }
  })
    .jpeg({ quality: 85 })
    .toFile(dest);
}

async function writePng(rel, rgb) {
  const dest = path.join(SNAP, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  await sharp({
    create: {
      width: 900,
      height: 600,
      channels: 3,
      background: { r: rgb[0], g: rgb[1], b: rgb[2] }
    }
  })
    .png()
    .toFile(dest);
}

async function writeThumb(rel, rgb, label) {
  const dest = path.join(SNAP, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320">
      <rect fill="rgb(${rgb.join(',')})" width="100%" height="100%"/>
      <text x="50%" y="50%" text-anchor="middle" fill="#222" font-family="sans-serif" font-size="14">${label}</text>
    </svg>`
  );
  await sharp(svg).jpeg({ quality: 90 }).toFile(dest);
}

async function main() {
  // Raster assets (local paths match collections.json)
  await writeThumb('data/collections/bombay/bombay-thumb.jpg', [220, 200, 170], 'Bombay');
  await writeThumb('data/collections/bombay/thumbnails/andheri-star-flower.jpg', [200, 180, 220], 'Andheri');
  await writeThumb('data/collections/bombay/thumbnails/chakapara.jpg', [180, 210, 190], 'Chakapara');
  await writeJpeg('data/collections/bombay/layers/andheri-star-flower_star-flower_layer-1.jpg', [190, 190, 200]);
  await writeJpeg('data/collections/bombay/proof-layers/andheri-star-flower_star-flower_layer-1.jpg', [190, 190, 200]);
  await writeJpeg('data/collections/bombay/layers/chakapara_layer-1_layer-1.jpg', [200, 185, 175]);
  await writeJpeg('data/collections/bombay/proof-layers/chakapara_layer-1_layer-1.jpg', [200, 185, 175]);
  await writePng('data/mockups/white-dresser-W72H72.png', [235, 232, 228]);
  await writeJpeg('data/mockups/white-dresser-shadow-W72H72.jpg', [40, 40, 45]);
  await writeJpeg('data/collections/fallback.jpg', [200, 200, 200]);
  await writeThumb('img/camelion-sm-r.jpg', [212, 175, 55], 'CF');

  const collections = {
    collections: [
      {
        name: 'bombay',
        tableName: '8 - BOMBAY (demo)',
        collectionNumber: 8,
        collection_thumbnail: './data/collections/bombay/bombay-thumb.jpg',
        curatedColors: [
          'SC0001 COTTAGE LINEN',
          'SW6395 ALCHEMY',
          'SW6811 HONORABLE BLUE',
          'SW6810 LUPINE'
        ],
        coordinates: [],
        colorFlex: true,
        mockupId: 'white-dresser',
        description:
          'Trade-show snapshot: Bombay wallpaper patterns with local assets only (two ColorFlex patterns).',
        patterns: [
          {
            id: 'rec0YgzbbxikypVMj',
            number: '01-08-101',
            name: 'Andheri Star Flower',
            thumbnail: './data/collections/bombay/thumbnails/andheri-star-flower.jpg',
            size: [24, 24],
            repeat: 'yes',
            layers: [
              {
                path: './data/collections/bombay/layers/andheri-star-flower_star-flower_layer-1.jpg',
                proofPath: './data/collections/bombay/proof-layers/andheri-star-flower_star-flower_layer-1.jpg'
              }
            ],
            layerLabels: ['Star Flower'],
            tilingType: 'straight',
            designer_colors: ['SW6395 ALCHEMY', 'SC0001 COTTAGE LINEN'],
            colorFlex: true,
            coordinates: [],
            baseComposite: null,
            tintWhite: false
          },
          {
            id: 'rectlBxCvxvMFVazh',
            number: '01-08-103',
            name: 'Chakapara',
            thumbnail: './data/collections/bombay/thumbnails/chakapara.jpg',
            size: [24, 24],
            repeat: 'yes',
            layers: [
              {
                path: './data/collections/bombay/layers/chakapara_layer-1_layer-1.jpg',
                proofPath: './data/collections/bombay/proof-layers/chakapara_layer-1_layer-1.jpg'
              }
            ],
            layerLabels: ['Layer 1'],
            tilingType: 'straight',
            designer_colors: ['SW6811 HONORABLE BLUE', 'SC0001 COTTAGE LINEN'],
            colorFlex: true,
            coordinates: [],
            baseComposite: null,
            tintWhite: false
          }
        ]
      }
    ]
  };

  fs.mkdirSync(path.join(SNAP, 'data'), { recursive: true });
  fs.writeFileSync(
    path.join(SNAP, 'data', 'collections.json'),
    JSON.stringify(collections, null, 2),
    'utf8'
  );

  const mockups = {
    mockups: {
      'white-dresser': {
        id: 'white-dresser',
        name: 'White Dresser',
        image: './data/mockups/white-dresser-W72H72.png',
        shadow: './data/mockups/white-dresser-shadow-W72H72.jpg',
        widthInches: 90,
        heightInches: 60,
        description: 'Trade-show placeholder mockup'
      }
    }
  };
  fs.writeFileSync(path.join(SNAP, 'data', 'mockups.json'), JSON.stringify(mockups, null, 2), 'utf8');

  if (!fs.existsSync(TOOLS_COLORS)) {
    console.error('Missing', TOOLS_COLORS);
    process.exit(1);
  }
  fs.copyFileSync(TOOLS_COLORS, path.join(SNAP, 'data', 'colors.json'));
  console.log('Wrote demo-snapshot/ (collections, mockups, colors copy, raster assets).');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
