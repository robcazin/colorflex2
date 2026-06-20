#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Deprecated entrypoint — canonical extractor is tools/mohawk/extract-palette.js
 */
console.error(
  'Mohawk palette extraction moved to:\n' +
    '  node tools/mohawk/extract-palette.js <imagePathOrUrl> [--colors N] [--min-delta-e D] [--debug]\n'
);
process.exit(1);
