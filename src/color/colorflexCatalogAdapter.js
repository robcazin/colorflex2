/**
 * Adapts ColorFlex colors.json rows into paintLibraryMatcher entries { name, code, hex }.
 * Source: src/tools/colors.json (same data family as runtime /assets/colors.json).
 */

import colorsJson from '../tools/colors.json';

function toTitleCaseWords(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Normalize sw_number like "sw6216", "SW 6216", "SC0001" → "SW 6216" / "SC 1"
 * @param {string | undefined} swRaw
 * @returns {string}
 */
export function formatColorflexSwCode(swRaw) {
  const s = String(swRaw || '').trim();
  if (!s) return '';
  const m = s.match(/^(SW|SC|sw|sc)\s*0*(\d+)$/i);
  if (m) {
    const fam = m[1].toUpperCase();
    const num = parseInt(m[2], 10);
    return `${fam} ${num}`;
  }
  const digits = s.match(/^0*(\d+)$/);
  if (digits) return `SW ${parseInt(digits[1], 10)}`;
  return s.toUpperCase();
}

/**
 * @param {Record<string, unknown>} row
 * @returns {{ name: string, code: string, hex: string } | null}
 */
export function adaptColorflexCatalogRow(row) {
  if (!row || typeof row !== 'object') return null;
  const hexRaw = row.hex;
  if (hexRaw == null || typeof hexRaw !== 'string') return null;
  let h = hexRaw.trim().replace(/^#/, '');
  if (h.length === 3) {
    h = h.split('').map((c) => c + c).join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  const hex = '#' + h.toLowerCase();

  const rawName = row.color_name ?? row.name;
  if (rawName == null || String(rawName).trim() === '') return null;
  const name = toTitleCaseWords(String(rawName));

  const code = formatColorflexSwCode(row.sw_number != null ? String(row.sw_number) : '');

  return { name, code, hex };
}

/**
 * @param {unknown} data
 * @returns {{ name: string, code: string, hex: string }[]}
 */
export function buildColorflexSwCatalog(data) {
  if (!Array.isArray(data)) return [];
  const out = [];
  const seenHex = new Set();
  for (const row of data) {
    const e = adaptColorflexCatalogRow(row);
    if (!e) continue;
    if (seenHex.has(e.hex)) continue;
    seenHex.add(e.hex);
    out.push(e);
  }
  return out;
}

/** Full catalog for palette hook matching (bundled). */
export const COLORFLEX_SW_CATALOG = buildColorflexSwCatalog(colorsJson);

/** Entry count after de-duplication by hex. */
export const COLORFLEX_SW_CATALOG_COUNT = COLORFLEX_SW_CATALOG.length;

/** UI copy */
export const COLORFLEX_SW_CATALOG_LABEL = 'Full ColorFlex Sherwin-Williams catalog';
