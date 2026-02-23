#!/usr/bin/env node
/**
 * One-way sync: build Bassett in colorflex2, then copy bundle + HTML to colorflex2-bassett.
 * Run from colorflex2 only. After this, work and run the server only in colorflex2-bassett.
 *
 *   cd /Volumes/K3/jobs/colorflex2
 *   node scripts/sync-bassett-to-bassett-repo.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const COLORFLEX2 = path.resolve(__dirname, '..');
const BASSETT_REPO = path.join(COLORFLEX2, '..', 'colorflex2-bassett');

if (!fs.existsSync(BASSETT_REPO) || !fs.statSync(BASSETT_REPO).isDirectory()) {
  console.error('colorflex2-bassett not found at', BASSETT_REPO);
  process.exit(1);
}

console.log('Building Bassett bundle in colorflex2...');
execSync('npm run build', { cwd: COLORFLEX2, stdio: 'inherit' });

console.log('Building bassett-local HTML...');
execSync('node scripts/build-bassett-local-html.js', { cwd: COLORFLEX2, stdio: 'inherit' });

const files = [
  { src: path.join(COLORFLEX2, 'src', 'assets', 'color-flex-bassett.min.js'), dest: path.join(BASSETT_REPO, 'src', 'assets', 'color-flex-bassett.min.js') },
  { src: path.join(COLORFLEX2, 'bassett-local', 'index.html'), dest: path.join(BASSETT_REPO, 'bassett-local', 'index.html') },
  { src: path.join(COLORFLEX2, 'bassett-local', 'server.js'), dest: path.join(BASSETT_REPO, 'bassett-local', 'server.js') }
];

for (const { src, dest } of files) {
  if (!fs.existsSync(src)) {
    console.error('Missing:', src);
    process.exit(1);
  }
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(src, dest);
  console.log('Copied:', path.relative(COLORFLEX2, src), '->', path.relative(BASSETT_REPO, dest));
}

console.log('');
console.log('Done. Work and run the server in colorflex2-bassett:');
console.log('  cd', BASSETT_REPO);
console.log('  node bassett-local/server.js');
