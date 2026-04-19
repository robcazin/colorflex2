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

const REPO_ROOT = path.resolve(__dirname, '..');

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

  const assetsOut = path.join(destRoot, 'src', 'assets');
  fs.mkdirSync(assetsOut, { recursive: true });
  copyFile(tradeDemoJs, path.join(assetsOut, 'color-flex-trade-demo.min.js'));

  copyFile(path.join(REPO_ROOT, 'Start-Trade-Show-Demo.cmd'), path.join(destRoot, 'Start-Trade-Show-Demo.cmd'));
  copyFile(path.join(REPO_ROOT, 'OWNER_INSTRUCTIONS.txt'), path.join(destRoot, 'OWNER_INSTRUCTIONS.txt'));
  copyFile(
    path.join(REPO_ROOT, 'trade-show-windows-runtime.package.json'),
    path.join(destRoot, 'package.json')
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
      '',
      'Full technical notes: trade-show-local\\WINDOWS_DEPLOY.md',
      ''
    ].join('\r\n'),
    'utf8'
  );

  console.log('Done. Next: copy to Windows, npm install, add cf-data if needed, test launcher.');

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
