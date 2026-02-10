#!/usr/bin/env node
/**
 * Add isShadow: true to layer objects in collections.json where the path
 * indicates a shadow layer (_shadow_, isshadow, shadow_layer, etc.).
 * Run from repo root: node scripts/add-isshadow-flag.js
 */

const fs = require('fs');
const path = require('path');

const collectionsPath = path.join(__dirname, '../src/assets/collections.json');

function isShadowPath(p) {
  if (!p || typeof p !== 'string') return false;
  const u = p.toUpperCase();
  return u.includes('_SHADOW_') || u.includes('SHADOW_LAYER') || u.includes('ISSHADOW') ||
    u.includes('-SHADOW_') || u.includes('_SHADOWS_') || u.includes('DISH-SHADOW');
}

function processLayers(layers) {
  if (!Array.isArray(layers)) return 0;
  let count = 0;
  layers.forEach((layer) => {
    if (layer && typeof layer === 'object' && (layer.path || layer.proofPath)) {
      const p = layer.path || layer.proofPath;
      if (isShadowPath(p)) {
        layer.isShadow = true;
        count++;
      }
    }
  });
  return count;
}

function walk(obj, stats) {
  if (!obj) return;
  if (Array.isArray(obj)) {
    obj.forEach(item => walk(item, stats));
    return;
  }
  if (typeof obj === 'object') {
    if (obj.layers) {
      const n = processLayers(obj.layers);
      if (n) stats.layersFixed += n;
    }
    Object.keys(obj).forEach(k => walk(obj[k], stats));
  }
}

const json = JSON.parse(fs.readFileSync(collectionsPath, 'utf8'));
const stats = { layersFixed: 0 };
walk(json, stats);

fs.writeFileSync(collectionsPath, JSON.stringify(json, null, 2), 'utf8');
console.log(`Added isShadow: true to ${stats.layersFixed} layer(s) in collections.json`);
