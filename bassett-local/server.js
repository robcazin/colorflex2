#!/usr/bin/env node
/**
 * Bassett ColorFlex — local server (no Shopify).
 * Serves UI, assets, data, and layer-stack room preview.
 *
 * 1. npm run build && node scripts/build-bassett-local-html.js
 * 2. node bassett-local/server.js
 * 3. Open http://localhost:3333
 *
 * Config: config/local.env (or env). Set COLORFLEX_DATA_PATH, BASSETT_MOCKUPS_PATH.
 * Two repos: set BASSETT_REPO_ROOT to the repo you build in; server loads that repo's config and serves its assets.
 */
const path = require('path');
const fs = require('fs');

const REPO = path.resolve(__dirname, '..');

// Load env file so "export KEY=value" and "KEY=value" both set process.env.KEY (dotenv only handles KEY=value)
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  content.split('\n').forEach(function (line) {
    const trimmed = line.replace(/^\s*#.*$/, '').trim();
    const m = trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) {
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      process.env[m[1]] = val;
    }
  });
}

// Load config from this repo only (standalone). Set BASSETT_REPO_ROOT only if you want to use another repo for config + assets.
const envPath = path.join(REPO, 'config', 'local.env');
loadEnvFile(envPath);
const otherRepo = process.env.BASSETT_REPO_ROOT ? path.resolve(process.env.BASSETT_REPO_ROOT) : null;
if (otherRepo) loadEnvFile(path.join(otherRepo, 'config', 'local.env'));

const express = require('express');

// Data: folder that contains data/collections.json (COLORFLEX_DATA_PATH = parent of data/)
const DATA_ROOT = process.env.COLORFLEX_DATA_PATH
  ? path.join(path.resolve(process.env.COLORFLEX_DATA_PATH), 'data')
  : null;
// Assets (JS, workers): this repo or BASSETT_REPO_ROOT
const CONTENT_ROOT = otherRepo || REPO;
const FALLBACK_ROOTS = [CONTENT_ROOT, REPO];
// Prefer repo's collections.json when it exists so local dev gets full repo data (e.g. coverlets); only use DATA_ROOT if repo has no file
const repoCollectionsPath = path.join(CONTENT_ROOT, 'data', 'collections.json');
const useRepoCollections = fs.existsSync(repoCollectionsPath);

const PORT = process.env.BASSETT_LOCAL_PORT || 3333;
const HOST = process.env.BASSETT_LOCAL_HOST || '0.0.0.0';

// Resolve PSD path (env or default) for render API only — optional; room preview uses layer stack PNGs, not PSD
const DEFAULT_PSD_PATH = '/Volumes/K3/jobs/saffron/colorFlex-shopify/data/mockups/bassett/sofa-with-pillows-mockup-1.psd';
function resolvePsdPath() {
  const env = process.env.BASSETT_PSD_PATH || process.env['   BASSETT_PSD_PATH'];
  if (env && fs.existsSync(path.resolve(env))) return path.resolve(env);
  if (fs.existsSync(DEFAULT_PSD_PATH)) return DEFAULT_PSD_PATH;
  return null;
}

// Layer stack for room preview: folder containing beauty.png, sofa_disp.png, pillow1/2/3_disp.png
function resolveMockupsPath() {
  const env = process.env.BASSETT_MOCKUPS_PATH;
  if (!env) return null;
  const p = path.resolve(env);
  try {
    return fs.existsSync(p) && fs.statSync(p).isDirectory() ? p : null;
  } catch (_) {
    return null;
  }
}

// Resolve paths and log once
function findFile(relativePath) {
  for (const root of FALLBACK_ROOTS) {
    const p = path.join(root, relativePath);
    try {
      if (fs.existsSync(p)) return p;
    } catch (_) {}
  }
  return null;
}

const collectionsPath = useRepoCollections
  ? repoCollectionsPath
  : (DATA_ROOT && fs.existsSync(path.join(DATA_ROOT, 'collections.json'))
    ? path.join(DATA_ROOT, 'collections.json')
    : findFile(path.join('data', 'collections.json')) || findFile(path.join('src', 'assets', 'collections.json')));
const resolvedPsd = resolvePsdPath();
const resolvedMockups = resolveMockupsPath();

const app = express();
app.use(express.json({ limit: '20mb' }));

// Serve key JSON: data root (SMB) first, then repo fallbacks
app.get('/assets/collections.json', (req, res, next) => {
  const p = useRepoCollections
    ? repoCollectionsPath
    : (DATA_ROOT && fs.existsSync(path.join(DATA_ROOT, 'collections.json'))
      ? path.join(DATA_ROOT, 'collections.json')
      : findFile(path.join('data', 'collections.json')) || findFile(path.join('src', 'assets', 'collections.json')));
  if (p) return res.sendFile(p);
  next();
});
app.get('/assets/colors.json', (req, res, next) => {
  const p = findFile(path.join('src', 'tools', 'colors.json'));
  if (p) return res.sendFile(p);
  next();
});
// Workers (e.g. pattern-displace.worker.js) from src/workers (try content root then REPO)
// Must be before app.use('/assets') so /assets/workers/* is served here, not as static
app.get('/assets/workers/:file', (req, res) => {
  const name = req.params.file.replace(/[^a-zA-Z0-9._-]/g, '');
  const p1 = path.join(CONTENT_ROOT, 'src', 'workers', name);
  const p2 = path.join(REPO, 'src', 'workers', name);
  const p = (fs.existsSync(p1) && fs.statSync(p1).isFile()) ? p1 : (fs.existsSync(p2) && fs.statSync(p2).isFile()) ? p2 : null;
  if (p) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    return res.sendFile(p);
  }
  res.status(404).end();
});
// Static: built assets (bundle lives in this repo; use sync script from colorflex2 to update colorflex2-bassett)
app.use('/assets', (req, res, next) => {
  const sub = (req.path || '').replace(/^\//, '');
  const relativePath = path.join('src', 'assets', sub);
  const p = findFile(relativePath);
  if (p && fs.statSync(p).isFile()) return res.sendFile(p);
  next();
});
// Pattern images and collection data (thumbnails live under data/collections/...). Prefer SMB data root when set.
const dataDirResolved = (DATA_ROOT && fs.existsSync(DATA_ROOT))
  ? DATA_ROOT
  : (collectionsPath ? path.dirname(collectionsPath) : path.join(REPO, 'data'));

// Bassett layer stack PNGs (beauty.png, sofa_disp.png, etc.). Must run before app.use('/data').
app.get('/data/mockups/bassett/:file', (req, res, next) => {
  const name = req.params.file.replace(/[^a-zA-Z0-9._-]/g, '');
  if (!name) return next();
  const candidates = [
    ...(resolvedMockups ? [path.join(resolvedMockups, name)] : []),
    path.join(dataDirResolved, 'mockups', 'bassett', name),
    path.join(dataDirResolved, 'mockups', 'bassett', 'sofa-with-pillow-1', name),
    path.join(REPO, 'data', 'mockups', 'bassett', name),
    path.join(REPO, 'data', 'mockups', 'bassett', 'sofa-with-pillow-1', name)
  ].filter(Boolean);
  for (const p of candidates) {
    try {
      if (fs.existsSync(p) && fs.statSync(p).isFile()) return res.sendFile(p);
    } catch (_) {}
  }
  console.warn('[Bassett] 404 mockup:', name, '| BASSETT_MOCKUPS_PATH:', resolvedMockups || '(not set)', '| DATA_ROOT:', DATA_ROOT || '(not set)');
  res.status(404).end();
});

app.use('/data', express.static(dataDirResolved, { fallthrough: false }));

// Local index (must be built first: node scripts/build-bassett-local-html.js)
const indexPath = path.join(REPO, 'bassett-local', 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('Run first: node scripts/build-bassett-local-html.js');
  process.exit(1);
}
app.get('/', (req, res) => res.sendFile(indexPath));

// Bassett API routes (self-contained; no parent API server needed)
const os = require('os');
const { spawn } = require('child_process');

app.post('/api/bassett/render', async (req, res) => {
  const REPO_ROOT = process.env.BASSETT_REPO_ROOT || REPO;
  const PSD_PATH = resolvePsdPath();
  if (!PSD_PATH) {
    return res.status(503).json({
      error: 'Bassett render not configured',
      message: 'Set BASSETT_PSD_PATH to the Bassett PSD file (or ensure default path exists).'
    });
  }
  const usePhotoshop = process.env.BASSETT_USE_PHOTOSHOP === '1' && process.platform === 'darwin';
  const scriptPath = path.join(REPO_ROOT, 'scripts', 'bassett_psd_export.py');
  const photoshopScriptPath = path.join(REPO_ROOT, 'scripts', 'run_bassett_photoshop.sh');
  if (!fs.existsSync(scriptPath)) {
    return res.status(503).json({ error: 'Script not found', message: 'scripts/bassett_psd_export.py missing.' });
  }
  const tileScriptPath = path.join(REPO_ROOT, 'scripts', 'tile_pattern_for_bassett.py');
  const SO_SIZE = 4096;
  try {
    let { patternUrl, patternDataUrl, blanketColor = '#336699', pillowScale, sofaScale, patternScale, scaleMultiplier } = req.body;
    if (!patternUrl && !patternDataUrl) return res.status(400).json({ error: 'Provide patternUrl or patternDataUrl' });
    // Ensure blanket color is valid #RRGGBB for JSX and Python
    if (typeof blanketColor !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(blanketColor.trim())) {
      blanketColor = '#336699';
    } else {
      blanketColor = blanketColor.trim();
    }

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bassett-'));
    const patternPath = path.join(tmpDir, 'pattern.png');
    const tiledPatternPath = path.join(tmpDir, 'pattern_tiled.png');
    const outDir = path.join(tmpDir, 'out');
    fs.mkdirSync(outDir, { recursive: true });
    const compositePhotoshopPath = path.join(tmpDir, 'composite_photoshop.png');

    if (patternDataUrl) {
      const base64 = patternDataUrl.replace(/^data:image\/\w+;base64,/, '').trim();
      fs.writeFileSync(patternPath, Buffer.from(base64, 'base64'));
    } else {
      const resp = await fetch(patternUrl, { redirect: 'follow' });
      if (!resp.ok) throw new Error(`Failed to fetch pattern: ${resp.status}`);
      const buf = Buffer.from(await resp.arrayBuffer());
      fs.writeFileSync(patternPath, buf);
    }

    let compositePath = path.join(outDir, 'composite.png');
    if (usePhotoshop && fs.existsSync(photoshopScriptPath)) {
      const args = [PSD_PATH, patternPath, '--output', compositePhotoshopPath, '--blanket', blanketColor];
      if (pillowScale != null) args.push('--pillow-scale', String(pillowScale));
      if (sofaScale != null) args.push('--sofa-scale', String(sofaScale));
      if (scaleMultiplier != null) args.push('--tile', '--repeats', String(Math.max(1, Math.round(scaleMultiplier * 4))));
      const sub = spawn(photoshopScriptPath, args, { cwd: REPO_ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
      let stderr = '';
      sub.stderr.on('data', (d) => { stderr += d.toString(); });
      await new Promise((resolve, reject) => {
        sub.on('close', (code) => (code === 0 ? resolve() : reject(new Error(stderr || `Script exited ${code}`))));
      });
      if (fs.existsSync(compositePhotoshopPath)) {
        fs.copyFileSync(compositePhotoshopPath, compositePath);
      }
    }

    if (!fs.existsSync(compositePath)) {
      const py = spawn('python3', [
        scriptPath,
        PSD_PATH,
        patternPath,
        '--out-dir', outDir,
        '--blanket', blanketColor
      ], { cwd: REPO_ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
      let stderr = '';
      py.stderr.on('data', (d) => { stderr += d.toString(); });
      await new Promise((resolve, reject) => {
        py.on('close', (code) => (code === 0 ? resolve() : reject(new Error(stderr || `Python exited ${code}`))));
      });
    }

    if (!fs.existsSync(compositePath)) {
      try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
      return res.status(500).json({ error: 'Composite not produced' });
    }
    const png = fs.readFileSync(compositePath);
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
    res.set('Content-Type', 'image/png');
    res.send(png);
  } catch (error) {
    console.error('Bassett render error:', error);
    res.status(500).json({
      error: 'Bassett render failed',
      message: error.message || String(error)
    });
  }
});

app.post('/api/bassett/upload-result', (req, res) => {
  try {
    const { image, filename } = req.body;
    if (!image) return res.status(400).json({ error: 'Missing image data' });
    const base64 = image.replace(/^data:image\/\w+;base64,/, '').trim();
    const uploadsDir = path.join(REPO, 'bassett-local', 'uploads');
    fs.mkdirSync(uploadsDir, { recursive: true });
    const name = (filename || `bassett-room-${Date.now()}.png`).replace(/[^a-zA-Z0-9._-]/g, '-');
    const filePath = path.join(uploadsDir, name);
    fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
    const url = `/bassett-local/uploads/${name}`;
    res.json({ success: true, url });
  } catch (error) {
    console.error('Bassett upload error:', error);
    res.status(500).json({ error: 'Failed to upload Bassett result', message: error.message });
  }
});

app.use('/bassett-local/uploads', express.static(path.join(REPO, 'bassett-local', 'uploads')));

app.listen(PORT, HOST, () => {
  const bundlePath = path.join(REPO, 'src', 'assets', 'color-flex-bassett.min.js');
  console.log('Bassett http://localhost:' + PORT);
  console.log('  serving from: ' + REPO);
  if (fs.existsSync(bundlePath)) console.log('  JS bundle: ' + bundlePath);
  else console.warn('  JS bundle: NOT FOUND (run sync script from colorflex2: node scripts/sync-bassett-to-bassett-repo.js)');
  if (resolvedMockups) console.log('  layers: ' + resolvedMockups);
  if (collectionsPath) console.log('  collections: ' + collectionsPath + (useRepoCollections ? ' (repo)' : ''));
  else console.warn('  collections.json not found');
});
