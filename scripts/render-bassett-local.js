#!/usr/bin/env node
/**
 * Build Bassett local HTML and start the local server.
 * Run from repo root: node scripts/render-bassett-local.js
 */
const { spawn } = require('child_process');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const buildScript = path.join(REPO_ROOT, 'scripts', 'build-bassett-local-html.js');
const serverPath = path.join(REPO_ROOT, 'bassett-local', 'server.js');

const build = spawn(process.execPath, [buildScript], { cwd: REPO_ROOT, stdio: 'inherit' });
build.on('close', (code) => {
  if (code !== 0) process.exit(code);
  const server = spawn(process.execPath, [serverPath], { cwd: REPO_ROOT, stdio: 'inherit' });
  server.on('error', (err) => {
    console.error(err);
    process.exit(1);
  });
});
