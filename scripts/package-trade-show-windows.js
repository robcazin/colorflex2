#!/usr/bin/env node
/**
 * Assemble a Windows "golden master" folder for the offline trade-show demo.
 *
 * Usage (repo root):
 *   npm run build:trade-demo
 *   npm run build:trade-show-snapshot
 *   npm run package:trade-show-windows
 *
 * With local raster tree (large):
 *   npm run package:trade-show-windows -- --cf-data=/path/to/cf-data
 *
 * Output default: ./ColorFlexTradeShow/ (gitignored). Override:
 *   npm run package:trade-show-windows -- /path/to/ColorFlexTradeShow
 *
 * Then on Windows: copy the folder, run `npm install` in it, double-click Start-Trade-Show-Demo.cmd.
 * See trade-show-local/WINDOWS_DEPLOY.md
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');

function gitHeadShort() {
  const r = spawnSync('git', ['rev-parse', '--short', 'HEAD'], {
    cwd: REPO_ROOT,
    encoding: 'utf8'
  });
  if (r.status !== 0 || !r.stdout) return '(unknown)';
  return r.stdout.trim();
}

/**
 * Must match <link> / <script> hrefs in trade-show-local/index.html (same-origin /assets/…).
 * The dev server on Mac serves the whole repo src/assets; the Windows handoff only has what we copy here.
 */
const TRADE_SHOW_ASSET_FILES = [
  'base.css',
  'component-list-menu.css',
  'component-search.css',
  'component-menu-drawer.css',
  'component-cart-notification.css',
  'color-flex-core.min.css',
  'colorflex-responsive.css',
  'color-flex-trade-demo.min.js'
];

function parseArgs(argv) {
  const out = { dest: null, cfData: null, zip: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--zip' || a === '-z') out.zip = true;
    else if (a.startsWith('--cf-data=')) out.cfData = a.slice('--cf-data='.length);
    else if (!a.startsWith('-')) out.dest = a;
  }
  return out;
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.error('Missing source folder:', src);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

function copyFile(src, dest) {
  if (!fs.existsSync(src)) {
    console.error('Missing source file:', src);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function main() {
  const args = parseArgs(process.argv);
  const destRoot = path.resolve(
    process.env.TRADE_SHOW_PACKAGE_DIR || args.dest || path.join(REPO_ROOT, 'ColorFlexTradeShow')
  );

  const tradeDemoJs = path.join(REPO_ROOT, 'src', 'assets', 'color-flex-trade-demo.min.js');
  if (!fs.existsSync(tradeDemoJs)) {
    console.error('Run first: npm run build:trade-demo');
    console.error('  (missing', tradeDemoJs + ')');
    process.exit(1);
  }

  const snapCollections = path.join(REPO_ROOT, 'demo-snapshot', 'data', 'collections.json');
  if (!fs.existsSync(snapCollections)) {
    console.error('Run first: npm run build:trade-show-snapshot');
    console.error('  (missing', snapCollections + ')');
    process.exit(1);
  }

  if (fs.existsSync(destRoot)) {
    fs.rmSync(destRoot, { recursive: true, force: true });
  }
  fs.mkdirSync(destRoot, { recursive: true });

  console.log('Package →', destRoot);

  copyDir(path.join(REPO_ROOT, 'trade-show-local'), path.join(destRoot, 'trade-show-local'));
  copyDir(path.join(REPO_ROOT, 'demo-snapshot'), path.join(destRoot, 'demo-snapshot'));

  const assetsSrc = path.join(REPO_ROOT, 'src', 'assets');
  const assetsOut = path.join(destRoot, 'src', 'assets');
  fs.mkdirSync(assetsOut, { recursive: true });
  for (const name of TRADE_SHOW_ASSET_FILES) {
    copyFile(path.join(assetsSrc, name), path.join(assetsOut, name));
  }

  const buildLines = [
    'ColorFlexTradeShow — package build stamp',
    '',
    'Built (UTC): ' + new Date().toISOString(),
    'Repo git HEAD: ' + gitHeadShort(),
    '',
    'Bundled under src/assets/: ' + TRADE_SHOW_ASSET_FILES.join(', '),
    '',
    'IMPORTANT: Code fixes on the Mac do NOT reach the PC until you:',
    '  1) git pull on the Mac (or copy latest repo),',
    '  2) npm run package:trade-show-windows',
    '  3) Replace the ENTIRE ColorFlexTradeShow folder on the PC (delete the old one first),',
    '     then npm install there if needed.',
    ''
  ];
  fs.writeFileSync(path.join(destRoot, 'PACKAGE_BUILD.txt'), buildLines.join('\r\n'), 'utf8');

  copyFile(path.join(REPO_ROOT, 'Start-Trade-Show-Demo.cmd'), path.join(destRoot, 'Start-Trade-Show-Demo.cmd'));
  copyFile(path.join(REPO_ROOT, 'OWNER_INSTRUCTIONS.txt'), path.join(destRoot, 'OWNER_INSTRUCTIONS.txt'));
  copyFile(
    path.join(REPO_ROOT, 'trade-show-windows-runtime.package.json'),
    path.join(destRoot, 'package.json')
  );
  fs.writeFileSync(
    path.join(destRoot, 'WHY_PACKAGE_JSON_HERE.txt'),
    [
      'This folder intentionally has package.json at the top level.',
      '',
      'It is the Windows "runtime" manifest: only Express, so `npm install` can run',
      'without the full Shopify theme repo. It is NOT a mistake and not a leak of',
      'the main app package.json.',
      '',
      'Source in dev repo: trade-show-windows-runtime.package.json',
      ''
    ].join('\r\n'),
    'utf8'
  );

  const cfSrc = args.cfData || process.env.TRADE_SHOW_CF_DATA;
  if (cfSrc) {
    const abs = path.resolve(cfSrc);
    if (!fs.existsSync(abs)) {
      console.error('cf-data path not found:', abs);
      process.exit(1);
    }
    console.log('Copying cf-data from', abs);
    copyDir(abs, path.join(destRoot, 'cf-data'));
  } else {
    console.log('(Skipped cf-data — folder will be large. Re-run with --cf-data=/path/to/cf-data to include.)');
  }

  const staffReadme = path.join(destRoot, 'STAFF_WINDOWS_SETUP.txt');
  fs.writeFileSync(
    staffReadme,
    [
      'ColorFlex trade-show — staff setup (Windows)',
      '',
      'Handoff: copy THIS FOLDER (ColorFlexTradeShow) to the PC — not the parent repo.',
      'If you used --zip, ColorFlexTradeShow.zip sits next to this folder; that is normal.',
      '',
      'After fixes on the Mac: pull latest, run npm run package:trade-show-windows again,',
      'then on the PC delete the old demo folder and copy this whole folder in again.',
      'Open PACKAGE_BUILD.txt here to confirm you have the new drop (time + git hash).',
      '',
      'This folder was built on a dev machine. Before handing it to show PCs:',
      '',
      '1. Copy this entire folder to a Windows 10/11 machine.',
      '2. Open Command Prompt in this folder (Shift+right-click → Open in Terminal).',
      '3. Run:  npm install',
      '   (Uses minimal package.json — only Express for the local server.)',
      '4. If cf-data was NOT bundled: copy your full cf-data tree here so you have:',
      '      cf-data\\data\\collections\\...',
      '      cf-data\\data\\mockups\\...',
      '5. Double-click Start-Trade-Show-Demo.cmd at this folder root.',
      '',
      'Verify: browser at http://127.0.0.1:3340/ — collections and images load.',
      'If layout looks unstyled: ensure src\\assets\\ contains all .css files from the packager (see repo script).',
      '',
      'Full technical notes: trade-show-local\\WINDOWS_DEPLOY.md',
      ''
    ].join('\r\n'),
    'utf8'
  );

  console.log('Done. Replace the PC copy of ColorFlexTradeShow with this folder — updates are not automatic.');
  console.log('Build stamp:', path.join(destRoot, 'PACKAGE_BUILD.txt'));

  if (args.zip) {
    const base = path.basename(destRoot);
    const parent = path.dirname(destRoot);
    const zipPath = path.join(parent, base + '.zip');
    if (fs.existsSync(zipPath)) fs.rmSync(zipPath);
    const { spawnSync } = require('child_process');
    const r = spawnSync('zip', ['-r', '-q', zipPath, base], { cwd: parent, stdio: 'inherit' });
    if (r.status !== 0) {
      console.warn('zip command failed or missing — skip archive. Folder is ready at:', destRoot);
    } else {
      console.log('Created', zipPath);
    }
  }
}

main();
