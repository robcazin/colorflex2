#!/usr/bin/env node
/**
 * ColorFlex trade-show — local static server + optional B2 proxy for /cf-data.
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

const B2_BASE = 'https://s3.us-east-005.backblazeb2.com/cf-data';

const indexHtml = path.join(__dirname, 'index.html');
const homeHtml = path.join(__dirname, 'home.html');
const demoSnapshotDir = path.join(REPO_ROOT, 'demo-snapshot');
const assetsDir = path.join(REPO_ROOT, 'src', 'assets');
/** Offline raster + JSON under deployment root: cf-data/data/collections/…, cf-data/data/mockups/… */
const cfDataDir = path.join(REPO_ROOT, 'cf-data');

const app = express();

app.get('/', function (req, res) {
  res.sendFile(indexHtml);
});

app.get('/index.html', function (req, res) {
  res.sendFile(indexHtml);
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

if (fs.existsSync(assetsDir)) {
  app.use('/assets', express.static(assetsDir));
}

if (fs.existsSync(cfDataDir)) {
  app.use('/cf-data', express.static(cfDataDir));
} else {
  /**
   * Same-origin proxy for Backblaze `cf-data` when the local folder is absent.
   * Canvas recoloring needs CORS-safe image responses.
   */
  app.get(['/cf-data/*', '/cf-data'], async function (req, res) {
    try {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.status(405).send('Method not allowed');
        return;
      }

      const subPath = String(req.path || '').replace(/^\/cf-data\/?/, '');
      const upstreamUrl = `${B2_BASE}/${subPath}${req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''}`;

      const upstreamRes = await fetch(upstreamUrl, {
        method: req.method,
        headers: {
          range: req.headers.range
        }
      });

      res.status(upstreamRes.status);

      const ct = upstreamRes.headers.get('content-type');
      if (ct) res.setHeader('content-type', ct);
      const cc = upstreamRes.headers.get('cache-control');
      if (cc) res.setHeader('cache-control', cc);
      const etag = upstreamRes.headers.get('etag');
      if (etag) res.setHeader('etag', etag);
      const acceptRanges = upstreamRes.headers.get('accept-ranges');
      if (acceptRanges) res.setHeader('accept-ranges', acceptRanges);
      const contentRange = upstreamRes.headers.get('content-range');
      if (contentRange) res.setHeader('content-range', contentRange);
      const contentLength = upstreamRes.headers.get('content-length');
      if (contentLength) res.setHeader('content-length', contentLength);

      res.setHeader('access-control-allow-origin', '*');
      res.setHeader('access-control-allow-methods', 'GET, HEAD');
      res.setHeader('access-control-allow-headers', '*');

      if (req.method === 'HEAD' || !upstreamRes.body) {
        res.end();
        return;
      }

      const ab = Buffer.from(await upstreamRes.arrayBuffer());
      res.end(ab);
    } catch (e) {
      res.status(502).send('Proxy error: ' + (e && e.message ? e.message : String(e)));
    }
  });
}

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
  if (fs.existsSync(cfDataDir)) {
    console.log('  /cf-data →', cfDataDir, '(static)');
  } else {
    console.log('  /cf-data → B2 proxy (' + B2_BASE + ') — add ./cf-data for offline static');
  }
});
