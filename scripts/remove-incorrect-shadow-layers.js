#!/usr/bin/env node

/**
 * Remove Incorrect Shadow Layers from collections.json
 * 
 * Removes shadow layer paths from Coverlets patterns that don't actually have shadows
 * according to Airtable (the source of truth).
 * 
 * Patterns to fix:
 * - Charleston Bay
 * - Franklin
 * - Oxford
 * - Piqua 1852
 * - Rosemount
 */

const fs = require('fs');
const path = require('path');

const COLLECTIONS_JSON = path.join(__dirname, '../src/assets/collections.json');
const BACKUP_JSON = path.join(__dirname, '../src/assets/collections.json.backup-before-shadow-removal-' + Date.now());

const PATTERNS_TO_FIX = [
    'Charleston Bay',
    'Franklin',
    'Oxford',
    'Piqua 1852',
    'Rosemount'
];

console.log('🔧 Removing incorrect shadow layers from collections.json...\n');
console.log('Patterns to fix:', PATTERNS_TO_FIX.join(', '));
console.log('');

// Load collections.json
let collections;
try {
    const content = fs.readFileSync(COLLECTIONS_JSON, 'utf8');
    collections = JSON.parse(content);
    console.log(`✅ Loaded collections.json (${collections.collections.length} collections)`);
} catch (error) {
    console.error(`❌ Error loading collections.json: ${error.message}`);
    process.exit(1);
}

// Create backup
try {
    fs.copyFileSync(COLLECTIONS_JSON, BACKUP_JSON);
    console.log(`✅ Backup created: ${path.basename(BACKUP_JSON)}\n`);
} catch (error) {
    console.error(`❌ Error creating backup: ${error.message}`);
    process.exit(1);
}

let totalFixed = 0;
let collectionsFixed = 0;

// Find coverlets.fur-1 collection
const coverletsFur = collections.collections.find(c => c.name === 'coverlets.fur-1');

if (!coverletsFur) {
    console.error('❌ coverlets.fur-1 collection not found');
    process.exit(1);
}

console.log(`📁 Found collection: ${coverletsFur.name}\n`);

// Process each pattern
coverletsFur.patterns.forEach(pattern => {
    if (!PATTERNS_TO_FIX.includes(pattern.name)) {
        return;
    }
    
    if (!pattern.mockupLayers || !Array.isArray(pattern.mockupLayers)) {
        return;
    }
    
    const originalLength = pattern.mockupLayers.length;
    
    // Remove shadow layer paths (containing "_shadows_layer-1")
    pattern.mockupLayers = pattern.mockupLayers.filter(layerPath => {
        if (typeof layerPath === 'string') {
            const isShadow = layerPath.includes('_shadows_layer-1');
            if (isShadow) {
                console.log(`  🗑️  Removed shadow layer from ${pattern.name}: ${layerPath.split('/').pop()}`);
                return false;
            }
        }
        return true;
    });
    
    if (pattern.mockupLayers.length < originalLength) {
        totalFixed += (originalLength - pattern.mockupLayers.length);
        console.log(`  ✅ Fixed ${pattern.name}: removed ${originalLength - pattern.mockupLayers.length} shadow layer(s)`);
        console.log(`     Remaining layers: ${pattern.mockupLayers.length}`);
    }
});

if (totalFixed > 0) {
    collectionsFixed = 1;
}

// Save updated collections.json
try {
    fs.writeFileSync(COLLECTIONS_JSON, JSON.stringify(collections, null, 2));
    console.log(`\n✅ Updated collections.json saved`);
    console.log(`\n📊 Summary:`);
    console.log(`   Collections fixed: ${collectionsFixed}`);
    console.log(`   Total shadow layers removed: ${totalFixed}`);
    console.log(`   Backup: ${path.basename(BACKUP_JSON)}`);
} catch (error) {
    console.error(`❌ Error saving collections.json: ${error.message}`);
    console.error(`   Restore from backup: ${BACKUP_JSON}`);
    process.exit(1);
}

console.log('\n✅ Done!');
