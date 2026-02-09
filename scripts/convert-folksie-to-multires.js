#!/usr/bin/env node

/**
 * Convert Folksie (and other standard format collections) to Multi-Res Format
 * 
 * This script converts collections that use the standard array format
 * to the multi-resolution nested object format.
 * 
 * For Folksie, it converts:
 *   mockupLayers: ["./data/furniture/sofa-capitol/patterns/folksie/..."]
 * 
 * To:
 *   mockupLayers: {
 *     "Sofa-Capitol": {
 *       "1.0": [{ path: "https://...", label: "...", index: 1 }]
 *     }
 *   }
 * 
 * Usage:
 *   node scripts/convert-folksie-to-multires.js [--collection=folksie] [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve('/Volumes/K3/jobs/saffron/colorFlex-shopify/data');
const COLLECTIONS_JSON = path.join(DATA_DIR, 'collections.json');

// Parse arguments
const args = process.argv.slice(2);
const options = {
    collection: 'folksie.fur-1',
    dryRun: false
};

args.forEach(arg => {
    if (arg.startsWith('--collection=')) {
        options.collection = arg.split('=')[1];
    } else if (arg === '--dry-run') {
        options.dryRun = true;
    }
});

/**
 * Convert relative path to absolute URL
 */
function relativeToUrl(relativePath) {
    // Remove leading ./ if present
    const cleanPath = relativePath.replace(/^\.\//, '');
    // Convert to absolute URL
    return `https://so-animation.com/colorflex/${cleanPath}`;
}

/**
 * Extract layer info from filename
 * Example: "cherie-cherie_texture_layer-1.png" -> { label: "Texture", index: 1 }
 */
function extractLayerInfo(filename) {
    // Pattern: {pattern-name}_{layer-name}_layer-{index}.png
    const match = filename.match(/(.+?)_(.+?)_layer-(\d+)\.png/);
    if (match) {
        const [, patternPart, layerName, layerIndex] = match;
        return {
            label: layerName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            index: parseInt(layerIndex)
        };
    }
    // Fallback
    return {
        label: 'Layer',
        index: 1
    };
}

/**
 * Convert standard format array to multi-res format
 */
function convertToMultiRes(standardLayers, furnitureType = 'Sofa-Capitol') {
    if (!Array.isArray(standardLayers) || standardLayers.length === 0) {
        return null;
    }
    
    const multiRes = {
        [furnitureType]: {
            "1.0": []
        }
    };
    
    // Process each layer
    for (const layerPath of standardLayers) {
        // Extract filename
        const filename = path.basename(layerPath);
        const layerInfo = extractLayerInfo(filename);
        
        // Convert to absolute URL
        const absoluteUrl = relativeToUrl(layerPath);
        
        multiRes[furnitureType]["1.0"].push({
            path: absoluteUrl,
            label: layerInfo.label,
            index: layerInfo.index
        });
    }
    
    // Sort by index
    multiRes[furnitureType]["1.0"].sort((a, b) => a.index - b.index);
    
    return multiRes;
}

/**
 * Main conversion function
 */
function main() {
    console.log('🔄 Converting Standard Format to Multi-Res Format');
    console.log('================================================\n');
    console.log(`Collection: ${options.collection}`);
    console.log(`Dry run: ${options.dryRun ? 'YES' : 'NO'}\n`);
    
    // Load collections.json
    if (!fs.existsSync(COLLECTIONS_JSON)) {
        console.error(`❌ Collections JSON not found: ${COLLECTIONS_JSON}`);
        process.exit(1);
    }
    
    console.log('📖 Loading collections.json...');
    const collectionsData = JSON.parse(fs.readFileSync(COLLECTIONS_JSON, 'utf8'));
    
    // Find the collection
    const collection = collectionsData.collections.find(c => c.name === options.collection);
    if (!collection) {
        console.error(`❌ Collection not found: ${options.collection}`);
        console.log(`Available collections: ${collectionsData.collections.map(c => c.name).join(', ')}`);
        process.exit(1);
    }
    
    console.log(`✅ Found collection: ${collection.name}`);
    console.log(`   Patterns: ${collection.patterns.length}\n`);
    
    let convertedCount = 0;
    
    // Process each pattern
    for (const pattern of collection.patterns) {
        // Check if it already has multi-res format
        if (pattern.mockupLayers && typeof pattern.mockupLayers === 'object' && !Array.isArray(pattern.mockupLayers)) {
            console.log(`  ⏭️  ${pattern.name}: Already in multi-res format, skipping`);
            continue;
        }
        
        // Check if it has standard format
        if (Array.isArray(pattern.mockupLayers) && pattern.mockupLayers.length > 0) {
            console.log(`  🔄 ${pattern.name}: Converting ${pattern.mockupLayers.length} layers...`);
            
            // Convert to multi-res
            const multiRes = convertToMultiRes(pattern.mockupLayers);
            
            if (multiRes) {
                if (!options.dryRun) {
                    pattern.mockupLayers = multiRes;
                }
                console.log(`  ✅ ${pattern.name}: Converted to multi-res format`);
                console.log(`     Furniture type: ${Object.keys(multiRes)[0]}`);
                console.log(`     Scale: 1.0 (${multiRes['Sofa-Capitol']['1.0'].length} layers)`);
                convertedCount++;
            } else {
                console.log(`  ⚠️  ${pattern.name}: Conversion failed`);
            }
        } else {
            console.log(`  ⚠️  ${pattern.name}: No mockupLayers found`);
        }
    }
    
    console.log(`\n✅ Converted ${convertedCount} patterns`);
    
    // Save if not dry run
    if (!options.dryRun && convertedCount > 0) {
        console.log(`\n💾 Writing to ${COLLECTIONS_JSON}...`);
        fs.writeFileSync(COLLECTIONS_JSON, JSON.stringify(collectionsData, null, 2));
        console.log('✅ Done!');
    } else if (options.dryRun) {
        console.log('\n🔍 Dry run - no files written');
        console.log('   Run without --dry-run to apply changes');
    }
}

main();
