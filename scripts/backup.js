#!/usr/bin/env node
/**
 * npm run backup / backup:list — thin wrapper around scripts/full-backup.sh
 * (repo historically referenced scripts/backup.js; full-backup.sh is the implementation.)
 */
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const BACKUPS_DIR = path.join(REPO_ROOT, 'backups');
const SHELL = process.env.SHELL || '/bin/bash';
const FULL_BACKUP = path.join(__dirname, 'full-backup.sh');

const cmd = process.argv[2] || 'create';

if (cmd === 'create') {
  if (!fs.existsSync(FULL_BACKUP)) {
    console.error('Missing', FULL_BACKUP);
    process.exit(1);
  }
  const r = spawnSync(SHELL, [FULL_BACKUP], { cwd: REPO_ROOT, stdio: 'inherit' });
  process.exit(r.status === null ? 1 : r.status);
}

if (cmd === 'list') {
  if (!fs.existsSync(BACKUPS_DIR)) {
    console.log('No backups/ directory yet. Run: npm run backup');
    process.exit(0);
  }
  const entries = fs
    .readdirSync(BACKUPS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith('full-backup-'))
    .map((d) => d.name)
    .sort()
    .reverse();
  if (!entries.length) {
    console.log('No full-backup-* folders in backups/');
    process.exit(0);
  }
  console.log('Recent backups (newest first):\n');
  entries.slice(0, 15).forEach((name) => {
    const p = path.join(BACKUPS_DIR, name);
    let size = '';
    try {
      const st = spawnSync('du', ['-sh', p], { encoding: 'utf8' });
      if (st.status === 0 && st.stdout) size = st.stdout.trim().split(/\s+/)[0];
    } catch (_e) {}
    console.log(' ', name, size ? '(' + size + ')' : '');
  });
  process.exit(0);
}

console.error('Usage: node scripts/backup.js [create|list]');
process.exit(1);
