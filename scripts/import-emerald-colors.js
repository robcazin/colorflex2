#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Import Sherwin-Williams "Emerald Designer Edition" colors from an .xlsx into colors.json.
 *
 * Usage:
 *   node scripts/import-emerald-colors.js \
 *     --xlsx "/path/Emerald Designer Edition Digital Data.xlsx" \
 *     --colors "/path/to/colors.json" \
 *     [--dry-run]
 */

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

function argValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] || null;
}

const xlsxPath = argValue("--xlsx");
const colorsPath = argValue("--colors");
const dryRun = process.argv.includes("--dry-run");

if (!xlsxPath || !colorsPath) {
  console.error(
    "Missing required args. Provide --xlsx and --colors.\n" +
      "Example:\n" +
      '  node scripts/import-emerald-colors.js --xlsx "/path/Emerald Designer Edition Digital Data.xlsx" --colors "/path/colors.json"\n'
  );
  process.exit(2);
}

function normalizeSwNumber(v) {
  if (v == null) return "";
  const s = String(v).trim();
  if (!s) return "";
  // Accept SW#### / SC#### (case-insensitive). Keep original prefix, normalize to upper.
  const m = s.match(/^(sw|sc)\s*0*(\d{1,6})$/i);
  if (!m) return s.toUpperCase();
  const prefix = m[1].toUpperCase();
  const num = m[2];
  // Preserve leading zeros if present in source? For SW ids in xlsx it's SW9501 (no padding issue).
  return `${prefix}${num.padStart(4, "0")}`;
}

function normalizeHex(v) {
  if (v == null) return "";
  let s = String(v).trim();
  if (!s) return "";
  s = s.replace(/^#/, "").toUpperCase();
  if (!/^[0-9A-F]{6}$/.test(s)) return s;
  return s;
}

function toInt(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function safeReadJsonArray(p) {
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error(`Expected JSON array in ${p}`);
  }
  return { raw, data };
}

const wb = XLSX.readFile(xlsxPath);
if (!wb.SheetNames || wb.SheetNames.length === 0) {
  throw new Error("No sheets found in xlsx");
}
const sheetName = wb.SheetNames[0];
const ws = wb.Sheets[sheetName];
const rows = XLSX.utils.sheet_to_json(ws, { defval: null });

const { data: existing } = safeReadJsonArray(colorsPath);

const bySw = new Map();
existing.forEach((c, idx) => {
  const sw = normalizeSwNumber(c && c.sw_number);
  if (!sw) return;
  if (!bySw.has(sw)) bySw.set(sw, { idx, item: c });
});

let added = 0;
let skippedExisting = 0;
let conflicts = 0;
const toAppend = [];

rows.forEach((r) => {
  const sw = normalizeSwNumber(r["Color ID"] || r["Name"] || "");
  const name = (r["Color Name"] || "").toString().trim();
  const hex = normalizeHex(r["HEX"]);
  const red = toInt(r["R"]);
  const green = toInt(r["G"]);
  const blue = toInt(r["B"]);

  if (!sw || !name || !hex || red == null || green == null || blue == null) return;

  const next = {
    color_name: name,
    hex,
    red,
    green,
    blue,
    sw_number: sw,
  };

  const hit = bySw.get(sw);
  if (hit) {
    skippedExisting++;
    const ex = hit.item || {};
    const exHex = normalizeHex(ex.hex);
    if (exHex && exHex !== hex) {
      conflicts++;
      console.warn(
        `⚠️ SW conflict ${sw}: existing hex=${exHex} xlsx hex=${hex} (keeping existing)`
      );
    }
    return;
  }

  toAppend.push(next);
  bySw.set(sw, { idx: existing.length + toAppend.length - 1, item: next });
  added++;
});

if (added === 0) {
  console.log("No new Emerald colors to add (all present or rows missing required fields).");
  process.exit(0);
}

// Keep file stable: append at end, then sort by sw_number when possible (optional).
const merged = existing.concat(toAppend);
merged.sort((a, b) => {
  const sa = normalizeSwNumber(a && a.sw_number);
  const sb = normalizeSwNumber(b && b.sw_number);
  if (sa && sb && sa !== sb) return sa.localeCompare(sb, "en", { numeric: true });
  return String((a && a.color_name) || "").localeCompare(String((b && b.color_name) || ""));
});

console.log(`Sheet: ${sheetName}`);
console.log(`Existing colors: ${existing.length}`);
console.log(`Rows in xlsx: ${rows.length}`);
console.log(`Added: ${added}`);
console.log(`Skipped existing: ${skippedExisting}`);
console.log(`Conflicts (kept existing): ${conflicts}`);

if (dryRun) {
  console.log("Dry run; not writing file.");
  process.exit(0);
}

const out = JSON.stringify(merged, null, 2) + "\n";
fs.writeFileSync(colorsPath, out, "utf8");
console.log(`✅ Wrote ${merged.length} colors to ${path.resolve(colorsPath)}`);

