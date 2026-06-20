#!/usr/bin/env node
/**
 * Static check for src/mohawk/mohawkPinnedSurface.js: parses as ESM and asserts public exports.
 * Does not execute compositor code (no canvas / document). Safe before CFM wiring.
 *
 * Run: node scripts/verify-mohawk-pinned-surface.js
 */

const fs = require('fs');
const path = require('path');
const { parseSync } = require('@babel/core');

const file = path.join(__dirname, '..', 'src', 'mohawk', 'mohawkPinnedSurface.js');
const REQUIRED_EXPORTS = ['applyPinnedSurfaceComposite', 'applyPinnedSurfacesInOrder'];

function collectExportedNames(ast) {
  const names = new Set();
  for (const node of ast.program.body) {
    if (node.type !== 'ExportNamedDeclaration') continue;
    if (node.declaration) {
      const d = node.declaration;
      if (d.type === 'FunctionDeclaration' && d.id) {
        names.add(d.id.name);
      } else if (d.type === 'VariableDeclaration') {
        for (const dec of d.declarations) {
          if (dec.id && dec.id.type === 'Identifier') names.add(dec.id.name);
        }
      }
    }
    for (const spec of node.specifiers || []) {
      if (spec.exported && spec.exported.type === 'Identifier') {
        names.add(spec.exported.name);
      }
    }
  }
  return names;
}

function main() {
  if (!fs.existsSync(file)) {
    console.error('Missing file:', file);
    process.exit(1);
  }
  const code = fs.readFileSync(file, 'utf8');
  let ast;
  try {
    ast = parseSync(code, {
      sourceType: 'module',
      filename: file,
    });
  } catch (e) {
    console.error('Parse failed:', e.message);
    process.exit(1);
  }

  const exported = collectExportedNames(ast);
  const missing = REQUIRED_EXPORTS.filter((n) => !exported.has(n));
  if (missing.length) {
    console.error('Missing exports:', missing.join(', '));
    console.error('Found:', [...exported].sort().join(', '));
    process.exit(1);
  }

  console.log('OK', path.relative(process.cwd(), file));
  console.log('  Exports:', REQUIRED_EXPORTS.join(', '));
}

main();
