#!/usr/bin/env node
/**
 * ColorFlex trade-show — local static server for Mohawk room development.
 *
 * Requires:
 *   /Volumes/jobs/cf-data
 * or
 *   COLORFLEX_DATA_PATH=/Volumes/jobs/cf-data
 *   COLORFLEX_DATA_PATH=/Volumes/jobs/cf-data/data
 *
 *   npm run serve:trade-demo
 *   Open http://127.0.0.1:3340
 *
 * Env: TRADE_SHOW_PORT (default 3340), TRADE_SHOW_HOST (default 0.0.0.0)
 */
const path = require('path');
const fs = require('fs');
const express = require('express');

const REPO_ROOT = path.resolve(__dirname, '..');
const PORT = parseInt(process.env.TRADE_SHOW_PORT || '3340', 10);
const HOST = process.env.TRADE_SHOW_HOST || '0.0.0.0';

const indexHtml = path.join(__dirname, 'index.html');
const homeHtml = path.join(__dirname, 'home.html');
const demoSnapshotDir = path.join(REPO_ROOT, 'demo-snapshot');
const assetsDir = path.join(REPO_ROOT, 'src', 'assets');
const DEFAULT_CF_DATA_ROOT = '/Volumes/jobs/cf-data';
const configuredCfDataPath = path.resolve(process.env.COLORFLEX_DATA_PATH || DEFAULT_CF_DATA_ROOT);
/** Mohawk local dev requires the real cf-data share; normalize known `/data` form back to the share root. */
const sharedCfDataRoot = path.basename(configuredCfDataPath) === 'data'
  ? path.dirname(configuredCfDataPath)
  : configuredCfDataPath;
const requiredDataDir = sharedCfDataRoot ? path.join(sharedCfDataRoot, 'data') : null;

if (!fs.existsSync(sharedCfDataRoot)) {
  throw new Error('Mohawk local cf-data share does not exist: ' + sharedCfDataRoot);
}

if (!fs.existsSync(requiredDataDir)) {
  throw new Error('Mohawk local cf-data share is missing required data directory: ' + requiredDataDir);
}

const app = express();

function mohawkRoomPatternFromThumb(p) {
  const thumb = p.thumbnail;
  return Object.assign({}, p, {
    size: p.size || [24, 24],
    repeat: p.repeat || 'yes',
    tilingType: p.tilingType || 'straight',
    layerLabels: ['Sofa', 'Pillow', 'Trim', 'Panels'],
    layers: [
      { path: thumb },
      { path: thumb },
      { path: thumb },
      { path: thumb },
    ],
    designer_colors: [
      'SW7006 Extra White',
      'SW7674 Peppercorn',
      'SW9173 Art Deco',
      'SW0045 Arresting Auburn',
      'SW0059 Historic White',
    ],
    colorFlex: true,
    coordinates: null,
    baseComposite: null,
    tintWhite: false,
    updatedAt: '2026-05-14T00:00:00.000Z',
  });
}

const MOHAWK_ROOM_PATTERNS = [
  { id: 'd111362', number: 'MOHAWK-001', name: 'D111362', thumbnail: '/cf-data/data/mohawk-designs/D111362.jpg' },
  { id: 'atmo-loop-34031', number: 'MOHAWK-002', name: 'Atmo Loop 34031', thumbnail: '/cf-data/data/mohawk-designs/Atmo-Loop-34031.jpeg' },
  { id: 'saya', number: 'MOHAWK-003', name: 'Saya', thumbnail: '/cf-data/data/mohawk-designs/Saya.jpg' },
  { id: 'mogul-majesty', number: 'MOHAWK-004', name: 'Mogul Majesty', thumbnail: '/cf-data/data/mohawk-designs/Mogul-Majesty.jpg' },
  { id: 'windsor', number: 'MOHAWK-005', name: 'Windsor', thumbnail: '/cf-data/data/mohawk-designs/Windsor.jpg' },
  { id: 'embroidered-print', number: 'MOHAWK-006', name: 'Embroidered Print', thumbnail: '/cf-data/data/mohawk-designs/embroidered-print.jpeg' },
].map(mohawkRoomPatternFromThumb);

const MOHAWK_ROOM_COLLECTIONS = {
  collections: [
    {
      name: 'mohawk-room',
      tableName: 'MOHAWK ROOM',
      collectionNumber: 1,
      collection_thumbnail: '/cf-data/data/mohawk-designs/D111362.jpg',
      curatedColors: [],
      coordinates: null,
      colorFlex: true,
      mockupId: null,
      description: 'Fixed Mohawk room local collection.',
      patterns: MOHAWK_ROOM_PATTERNS
    }
  ]
};

function renderMohawkRoomHtml() {
  let html = fs.readFileSync(indexHtml, 'utf8');
  // Inject Mohawk Room runtime config BEFORE the bundled ColorFlex script so initializeApp() sees it.
  // Bootstrap path is the bundled /assets/color-flex-trade-demo.min.js (NOT raw /src/CFM.js as a module —
  // raw module loading traverses an `import colorsJson from '../tools/colors.json'` which the browser
  // rejects with "Expected a JavaScript-or-Wasm module script ... MIME type application/json").
  html = html.replace(
    '<script src="/assets/color-flex-trade-demo.min.js"></script>',
    `<script>
  (function () {
    window.COLORFLEX_MOHAWK_ROOM = true;
    window.COLORFLEX_MOHAWK_ROOM_SKIP_STANDARD_MOCKUPS = true;
    // Intentionally NOT setting COLORFLEX_MOHAWK_ROOM_COLLECTIONS_URL: the Mohawk
    // carpet catalog is a parallel palette/floor source (see strip below), not the
    // primary wallpaper collection dataset. Standard wallpaper collections continue
    // to load via the cf-data path so the left sidebar shows real patterns.
    window.COLORFLEX_MOHAWK_ROOM_CONFIG = Object.assign({
      layersBaseUrl: '/cf-data/mockups/mohawk/',
      carpetTileUrl: '/cf-data/data/mohawk-designs/D111362.jpg',
    }, window.COLORFLEX_MOHAWK_ROOM_CONFIG || {});
    window.COLORFLEX_MOHAWK_CARPET_CATALOG = [
      { id: 'd111362',          name: 'D111362',           thumbnail: '/cf-data/data/mohawk-designs/D111362.jpg',           roles: { background: '#4c2226', linework: '#3f2529', accent: '#be601f' } },
      { id: 'atmo-loop-34031',  name: 'Atmo Loop 34031',   thumbnail: '/cf-data/data/mohawk-designs/Atmo-Loop-34031.jpeg',  roles: { background: '#7b776c', linework: '#6a665b', accent: '#aca99c' } },
      { id: 'saya',             name: 'Saya',              thumbnail: '/cf-data/data/mohawk-designs/Saya.jpg',              roles: { background: '#636b6c', linework: '#6e7677', accent: '#284554' } },
      { id: 'mogul-majesty',    name: 'Mogul Majesty',     thumbnail: '/cf-data/data/mohawk-designs/Mogul-Majesty.jpg',     roles: { background: '#505a50', linework: '#3a707a', accent: '#726a41' } },
      { id: 'windsor',          name: 'Windsor',           thumbnail: '/cf-data/data/mohawk-designs/Windsor.jpg',           roles: { background: '#836b4f', linework: '#7c745c', accent: '#946e43' } },
      { id: 'embroidered-print', name: 'Embroidered Print', thumbnail: '/cf-data/data/mohawk-designs/embroidered-print.jpeg', roles: { background: '#3c3436', linework: '#2e3042', accent: '#bc2e24' } }
    ];
    window.ColorFlexAssets = Object.assign({}, window.ColorFlexAssets || {}, {
      mockupsUrl: ''
    });
  })();
</script>
<script src="/assets/color-flex-trade-demo.min.js"></script>`
  );
  return html;
}

app.get('/', function (req, res) {
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.send(renderMohawkRoomHtml());
});

app.get(['/mohawk-room', '/mohawk-room.html'], function (req, res) {
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.send(renderMohawkRoomHtml());
});

/**
 * Temporary no-rebuild recovery (Option A):
 *
 * The currently shipped /assets/color-flex-trade-demo.min.js has a hardcoded
 * fetch of this URL when window.COLORFLEX_MOHAWK_ROOM === true, and uses the
 * response as the PRIMARY appState.collections (skipping the cf-data fallback
 * entirely because of an internal short-circuit on the Mohawk flag).
 *
 * Until that bundle is rebuilt, neutralize the takeover by serving the real
 * cf-data wallpaper collections.json here. Left sidebar then shows the real
 * wallpaper catalog; the separate Mohawk carpet strip remains driven by
 * COLORFLEX_MOHAWK_CARPET_CATALOG and is unaffected.
 */
app.get('/mohawk-room-data/collections.json', function (req, res) {
  const realCollectionsJson = path.join(sharedCfDataRoot, 'data', 'collections.json');
  if (fs.existsSync(realCollectionsJson)) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.sendFile(realCollectionsJson);
    return;
  }
  console.warn('[mohawk-room recovery] real cf-data collections.json missing at', realCollectionsJson, '— falling back to Mohawk stub.');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.send(JSON.stringify(MOHAWK_ROOM_COLLECTIONS));
});

app.get('/index.html', function (req, res) {
  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.send(renderMohawkRoomHtml());
});

/** Bookmarks / older snippets may use /home.html — real file avoids ENOENT on sendFile. */
app.get(['/home', '/home.html'], function (req, res) {
  if (fs.existsSync(homeHtml)) {
    res.sendFile(homeHtml);
    return;
  }
  res.redirect(302, '/index.html');
});

app.use('/demo-snapshot', express.static(demoSnapshotDir));

app.use('/src', express.static(path.join(REPO_ROOT, 'src')));

if (fs.existsSync(assetsDir)) {
  app.use('/assets', express.static(assetsDir));
}

app.use('/cf-data', express.static(sharedCfDataRoot));
app.use('/cf-data/mockups', express.static(path.join(sharedCfDataRoot, 'data', 'mockups')));
app.use('/cf-data/mohawk-designs', express.static(path.join(sharedCfDataRoot, 'data', 'mohawk-designs')));

app.listen(PORT, HOST, function () {
  console.log('ColorFlex trade-show local server');
  console.log('  URL: http://127.0.0.1:' + PORT);
  console.log('  Listening on ' + HOST + ':' + PORT);
  if (!fs.existsSync(demoSnapshotDir)) {
    console.log('  (demo-snapshot/ not present — /demo-snapshot will 404 until it exists)');
  }
  if (!fs.existsSync(assetsDir)) {
    console.log('  (src/assets/ not present — /assets not mounted)');
  }
  console.log('  COLORFLEX_DATA_PATH →', configuredCfDataPath);
  console.log('  cf-data root →', sharedCfDataRoot);
  console.log('  /cf-data →', sharedCfDataRoot, '(static)');
});
