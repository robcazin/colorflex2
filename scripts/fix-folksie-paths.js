#!/usr/bin/env node

/**
 * Fix Folksie Furniture Paths
 * Converts old path format to new format for folksie.fur collection
 * 
 * Old format: https://so-animation.com/colorflex/data/furniture/sofa-capitol/patterns/folksie/{pattern}/{pattern}_{label}_layer-{n}.png
 * New format: https://so-animation.com/colorflex/data/collections/folksie-fur/layers/Sofa-Capitol/{pattern-slug}_{label}_layer-{n}_scale-{scale}.png
 */

const fs = require('fs');
const path = require('path');

const COLLECTIONS_JSON = path.join(__dirname, '../src/assets/collections.json');
const BACKUP_JSON = path.join(__dirname, '../src/assets/collections.json.backup-folksie-' + new Date().toISOString().replace(/[:.]/g, '-'));

function createPatternSlug(patternName) {
    if (!patternName) return 'unknown';
    return patternName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function fixFolksiePaths() {
    console.log('🔧 Fixing Folksie furniture paths...\n');
    
    // Read collections.json
    if (!fs.existsSync(COLLECTIONS_JSON)) {
        console.error(`❌ Collections JSON not found: ${COLLECTIONS_JSON}`);
        process.exit(1);
    }
    
    const collectionsData = JSON.parse(fs.readFileSync(COLLECTIONS_JSON, 'utf8'));
    
    // Find folksie.fur collection
    const folksieFur = collectionsData.collections.find(c => 
        c && c.name && (c.name === 'folksie.fur' || c.name === 'folksie.fur-1' || c.name === 'folksie-fur' || c.name === 'folksie-fur-1')
    );
    
    if (!folksieFur) {
        console.error('❌ folksie.fur collection not found');
        process.exit(1);
    }
    
    console.log(`✅ Found collection: ${folksieFur.name}`);
    console.log(`   Patterns: ${folksieFur.patterns?.length || 0}\n`);
    
    let totalFixed = 0;
    let patternsFixed = 0;
    
    // Process each pattern
    folksieFur.patterns?.forEach(pattern => {
        if (!pattern.mockupLayers) return;
        
        let patternFixed = false;
        const patternSlug = createPatternSlug(pattern.name);
        
        // Handle nested format (multi-res)
        if (typeof pattern.mockupLayers === 'object' && !Array.isArray(pattern.mockupLayers)) {
            // Check each furniture type
            Object.keys(pattern.mockupLayers).forEach(furnitureType => {
                const furnitureTypeLayers = pattern.mockupLayers[furnitureType];
                
                if (typeof furnitureTypeLayers === 'object' && !Array.isArray(furnitureTypeLayers)) {
                    // Multi-res format: { "1.0": [...], "1.25": [...] }
                    Object.keys(furnitureTypeLayers).forEach(scale => {
                        const scaleLayers = furnitureTypeLayers[scale];
                        
                        if (Array.isArray(scaleLayers)) {
                            scaleLayers.forEach((layer, index) => {
                                let oldPath;
                                let label;
                                let layerNum;
                                
                                if (typeof layer === 'string') {
                                    oldPath = layer;
                                } else if (layer && layer.path) {
                                    oldPath = layer.path;
                                    label = layer.label;
                                    layerNum = layer.index || (index + 1);
                                } else {
                                    return;
                                }
                                
                                // Check if it's the old format OR new format with wrong capitalization
                                const oldPattern = /data\/furniture\/sofa-capitol\/patterns\/folksie\/([^\/]+)\/([^\/]+)_([^\/]+)_layer-(\d+)\.png/;
                                const newPatternWithCaps = /collections\/folksie-fur\/layers\/Sofa-Capitol\/([^\/]+)_([A-Z][^_]+)_layer-(\d+)_scale-([\d.]+)\.png/;
                                
                                let needsFix = false;
                                let newPath;
                                
                                const oldMatch = oldPath.match(oldPattern);
                                const newMatchWithCaps = oldPath.match(newPatternWithCaps);
                                
                                if (oldMatch) {
                                    // Old format detected
                                    const [, patternFolder, patternPrefix, layerName, layerIndex] = oldMatch;
                                    
                                    // Extract label from layerName (e.g., "texture" from "cherie-cherie_texture")
                                    if (!label) {
                                        label = layerName; // layerName is already just the label part
                                    }
                                    
                                    // Convert label to lowercase with hyphens
                                    label = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                                    
                                    if (!layerNum) {
                                        layerNum = layerIndex;
                                    }
                                    
                                    // Construct new path
                                    newPath = `https://so-animation.com/colorflex/data/collections/folksie-fur/layers/Sofa-Capitol/${patternSlug}_${label}_layer-${layerNum}_scale-${scale}.png`;
                                    needsFix = true;
                                    
                                } else if (newMatchWithCaps) {
                                    // New format but with capitalized label (e.g., "Texture" instead of "texture")
                                    const [, pathPatternSlug, capitalizedLabel, layerIndex, pathScale] = newMatchWithCaps;
                                    
                                    // Convert capitalized label to lowercase with hyphens
                                    label = capitalizedLabel.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                                    
                                    if (!layerNum) {
                                        layerNum = layerIndex;
                                    }
                                    
                                    // Construct corrected path
                                    newPath = `https://so-animation.com/colorflex/data/collections/folksie-fur/layers/Sofa-Capitol/${patternSlug}_${label}_layer-${layerNum}_scale-${scale}.png`;
                                    needsFix = true;
                                }
                                
                                if (needsFix) {
                                    console.log(`  🔧 ${pattern.name} (${furnitureType} @ ${scale}X):`);
                                    console.log(`     Old: ${oldPath.split('/').pop()}`);
                                    console.log(`     New: ${newPath.split('/').pop()}`);
                                    
                                    // Update the layer
                                    if (typeof layer === 'string') {
                                        furnitureTypeLayers[scale][index] = newPath;
                                    } else {
                                        layer.path = newPath;
                                    }
                                    
                                    patternFixed = true;
                                    totalFixed++;
                                }
                            });
                        }
                    });
                }
            });
        }
        
        if (patternFixed) {
            patternsFixed++;
            console.log(`  ✅ Fixed ${pattern.name}\n`);
        }
    });
    
    if (totalFixed > 0) {
        // Create backup
        console.log(`\n💾 Creating backup: ${BACKUP_JSON}`);
        fs.copyFileSync(COLLECTIONS_JSON, BACKUP_JSON);
        
        // Write updated collections.json
        console.log(`💾 Writing updated collections.json...`);
        fs.writeFileSync(COLLECTIONS_JSON, JSON.stringify(collectionsData, null, 2));
        
        console.log(`\n✅ Fixed ${totalFixed} paths across ${patternsFixed} patterns`);
        console.log(`📦 Backup saved to: ${BACKUP_JSON}`);
    } else {
        console.log(`\n✅ No paths needed fixing (all already in new format)`);
    }
}

// Run the fix
fixFolksiePaths();
