#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Sync repo colors.json from the cf-data master colors.json.
 *
 * Defaults:
 * - src: /Volumes/jobs/cf-data/data/colors.json
 * - dest: <repo>/src/tools/colors.json
 *
 * Usage:
 *   node scripts/sync-colors-from-cf-data.js
 *   node scripts/sync-colors-from-cf-data.js --src "/Volumes/jobs/cf-data/data/colors.json" --dest "./src/tools/colors.json"
 */

const fs = require("fs");
const path = require("path");

function argValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] || null;
}

const repoRoot = path.resolve(__dirname, "..");
const src = argValue("--src") || "/Volumes/jobs/cf-data/data/colors.json";
const dest = argValue("--dest") || path.join(repoRoot, "src/tools/colors.json");

function readJsonArray(p) {
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error(`Expected JSON array at ${p}`);
  return { raw, data };
}

const { data: srcData } = readJsonArray(src);
const out = JSON.stringify(srcData, null, 2) + "\n";

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, out, "utf8");

console.log(`✅ Synced colors.json`);
console.log(`   src : ${src} (${srcData.length} colors)`);
console.log(`   dest: ${dest}`);

