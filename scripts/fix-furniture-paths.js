#!/usr/bin/env node

/**
 * Fix Furniture Paths in collections.json
 * 
 * Updates old furniture path format to new format:
 * OLD: ./data/furniture/sofa-capitol/patterns/{collection}/{pattern}/{pattern}_{layer}.png
 * NEW: ./data/collections/{collection}-fur/layers/Sofa-Capitol/{pattern}_{layer}_scale-1.0.png
 * 
 * Also fixes full URLs:
 * OLD: https://so-animation.com/colorflex/data/furniture/sofa-capitol/patterns/{collection}/{pattern}/{pattern}_{layer}.png
 * NEW: https://so-animation.com/colorflex/data/collections/{collection}-fur/layers/Sofa-Capitol/{pattern}_{layer}_scale-1.0.png
 */

const fs = require('fs');
const path = require('path');

const COLLECTIONS_JSON = path.join(__dirname, '../src/assets/collections.json');
const BACKUP_JSON = path.join(__dirname, '../src/assets/collections.json.backup-before-path-fix-' + Date.now());

console.log('🔧 Fixing furniture paths in collections.json...\n');

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

// Process each collection
collections.collections.forEach(collection => {
    if (!collection.patterns) return;
    
    let collectionFixed = false;
    
    collection.patterns.forEach(pattern => {
        if (!pattern.mockupLayers) return;
        
        let patternFixed = false;
        
        // Handle array format (old format like Coverlets)
        if (Array.isArray(pattern.mockupLayers)) {
            pattern.mockupLayers = pattern.mockupLayers.map(mockupPath => {
                if (typeof mockupPath !== 'string') return mockupPath;
                
                // Match old format: ./data/furniture/sofa-capitol/patterns/{collection}/{pattern}/{pattern}_{layer}.png
                const oldPattern = /\.\/data\/furniture\/sofa-capitol\/patterns\/([^\/]+)\/([^\/]+)\/([^\/]+)_([^\/]+)\.png/;
                const match = mockupPath.match(oldPattern);
                
                if (match) {
                    const [, collectionName, patternFolder, patternPrefix, layerName] = match;
                    // Extract layer number from layer name (e.g., "shadows_layer-1" -> "shadows_layer-1")
                    const newPath = `./data/collections/${collectionName}-fur/layers/Sofa-Capitol/${patternPrefix}_${layerName}_scale-1.0.png`;
                    console.log(`  🔧 Fixed: ${mockupPath.split('/').pop()} → ${newPath.split('/').pop()}`);
                    patternFixed = true;
                    totalFixed++;
                    return newPath;
                }
                
                return mockupPath;
            });
            
            if (patternFixed) {
                collectionFixed = true;
            }
        }
        // Handle nested format (new format like Folksie)
        else if (typeof pattern.mockupLayers === 'object' && !Array.isArray(pattern.mockupLayers)) {
            Object.keys(pattern.mockupLayers).forEach(furnitureType => {
                const typeLayers = pattern.mockupLayers[furnitureType];
                
                if (typeof typeLayers === 'object' && !Array.isArray(typeLayers)) {
                    // Multi-resolution format: { "1.0": [...], "1.5": [...] }
                    Object.keys(typeLayers).forEach(scale => {
                        const scaleLayers = typeLayers[scale];
                        if (Array.isArray(scaleLayers)) {
                            scaleLayers.forEach(layer => {
                                if (layer && layer.path) {
                                    const oldPath = layer.path;
                                    
                                    // Match old format: https://so-animation.com/colorflex/data/furniture/sofa-capitol/patterns/{collection}/{pattern}/{pattern}_{layer}.png
                                    const oldPattern = /https:\/\/so-animation\.com\/colorflex\/data\/furniture\/sofa-capitol\/patterns\/([^\/]+)\/([^\/]+)\/([^\/]+)_([^\/]+)\.png/;
                                    const match = oldPath.match(oldPattern);
                                    
                                    if (match) {
                                        const [, collectionName, patternFolder, patternPrefix, layerName] = match;
                                        const newPath = `https://so-animation.com/colorflex/data/collections/${collectionName}-fur/layers/Sofa-Capitol/${patternPrefix}_${layerName}_scale-${scale}.png`;
                                        console.log(`  🔧 Fixed: ${oldPath.split('/').pop()} → ${newPath.split('/').pop()} (${scale}X)`);
                                        layer.path = newPath;
                                        patternFixed = true;
                                        totalFixed++;
                                    }
                                }
                            });
                        }
                    });
                }
            });
            
            if (patternFixed) {
                collectionFixed = true;
            }
        }
    });
    
    if (collectionFixed) {
        collectionsFixed++;
        console.log(`\n✅ Fixed collection: ${collection.name}`);
    }
});

// Save updated collections.json
try {
    fs.writeFileSync(COLLECTIONS_JSON, JSON.stringify(collections, null, 2));
    console.log(`\n✅ Updated collections.json saved`);
    console.log(`\n📊 Summary:`);
    console.log(`   Collections fixed: ${collectionsFixed}`);
    console.log(`   Total paths fixed: ${totalFixed}`);
    console.log(`   Backup: ${path.basename(BACKUP_JSON)}`);
} catch (error) {
    console.error(`❌ Error saving collections.json: ${error.message}`);
    console.error(`   Restore from backup: ${BACKUP_JSON}`);
    process.exit(1);
}

console.log('\n✅ Done!');
