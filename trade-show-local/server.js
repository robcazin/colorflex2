#!/usr/bin/env node
/**
 * ColorFlex trade-show — minimal local static server (wallpaper-only offline demo shell).
 * Phase 1: placeholder UI only; no CFM bundle yet.
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
const demoSnapshotDir = path.join(REPO_ROOT, 'demo-snapshot');
const assetsDir = path.join(REPO_ROOT, 'src', 'assets');

const app = express();

app.get('/', function (req, res) {
  res.sendFile(indexHtml);
});

if (fs.existsSync(demoSnapshotDir)) {
  app.use('/demo-snapshot', express.static(demoSnapshotDir));
}

if (fs.existsSync(assetsDir)) {
  app.use('/assets', express.static(assetsDir));
}

app.listen(PORT, HOST, function () {
  console.log('ColorFlex trade-show local server (Phase 1 shell)');
  console.log('  URL: http://127.0.0.1:' + PORT);
  console.log('  Listening on ' + HOST + ':' + PORT);
  if (!fs.existsSync(demoSnapshotDir)) {
    console.log('  (demo-snapshot/ not present — /demo-snapshot not mounted)');
  }
  if (!fs.existsSync(assetsDir)) {
    console.log('  (src/assets/ not present — /assets not mounted)');
  }
});
