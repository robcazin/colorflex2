#!/usr/bin/env node

/**
 * Build Furniture Mockup Layers Script
 * 
 * Scans the data/collections directory structure and builds mockupLayers entries
 * for furniture collections. 
 * 
 * IMPORTANT NAMING CONVENTION:
 * - "mockup" = images for the mockup preview container (furniture/room preview)
 * - "pattern" = images for the pattern preview (fabric/pattern layers)
 * - This script builds "mockupLayers" (for furniture mockup preview), NOT pattern layers
 * 
 * Supports both:
 * - Standard format (array of strings) - for colorflex-furniture page
 * - Multi-resolution format (nested object) - for colorflex-furniture-simple page
 * 
 * Usage:
 *   node scripts/build-furniture-mockup-layers.js [options]
 * 
 * Options:
 *   --format=standard|multi-res|both    Output format (default: both)
 *   --collection=<name>                  Process specific collection only
 *   --output=<file>                     Output file path (default: collections.json)
 *   --dry-run                           Show what would be generated without writing
 */

const fs = require('fs');
const path = require('path');

// Configuration
// Point to the actual data directory where collections.json lives
const DATA_DIR = path.resolve('/Volumes/K3/jobs/saffron/colorFlex-shopify/data');
const COLLECTIONS_DIR = path.join(DATA_DIR, 'collections');
const FURNITURE_DIR = path.join(DATA_DIR, 'furniture');
const COLLECTIONS_JSON = path.join(DATA_DIR, 'collections.json');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    format: 'both', // 'standard', 'multi-res', or 'both'
    collection: null,
    output: COLLECTIONS_JSON,
    dryRun: false
};

args.forEach(arg => {
    if (arg.startsWith('--format=')) {
        options.format = arg.split('=')[1];
    } else if (arg.startsWith('--collection=')) {
        options.collection = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
        options.output = arg.split('=')[1];
    } else if (arg === '--dry-run') {
        options.dryRun = true;
    } else if (arg === '--help' || arg === '-h') {
        console.log(require('fs').readFileSync(__filename, 'utf8').match(/\/\*\*[\s\S]*?\*\//)[0]);
        process.exit(0);
    }
});

/**
 * Convert absolute URL to relative path
 */
function urlToRelative(url) {
    if (typeof url !== 'string') return url;
    const match = url.match(/\/data\/.*$/);
    if (match) {
        return '.' + match[0];
    }
    return url;
}

/**
 * Check if a path exists (handles both local and remote URLs)
 */
function pathExists(filePath) {
    // For local paths
    if (filePath.startsWith('./') || filePath.startsWith('../') || !filePath.startsWith('http')) {
        const fullPath = path.resolve(DATA_DIR, filePath.replace(/^\.\//, ''));
        return fs.existsSync(fullPath);
    }
    // For remote URLs, assume they exist (would need HTTP check for real validation)
    return true;
}

/**
 * Scan directory for furniture mockup layer files (standard format)
 * These are images for the mockup preview container (furniture/room), NOT pattern layers
 * For standard format, we extract the 1.0 scale files from the multi-res structure
 * Returns array of relative file paths (strings)
 */
function scanFurnitureMockupLayers(collectionName, patternName, furnitureType = 'Sofa-Capitol') {
    const mockupLayers = [];
    
    // Multi-res structure: data/collections/{collection}-fur/layers/{furnitureType}/
    // For standard format, we use the 1.0 scale files from this structure
    const multiResPath = path.join(COLLECTIONS_DIR, `${collectionName}-fur`, 'layers', furnitureType);
    
    if (fs.existsSync(multiResPath)) {
        // Scan for PNG files with _scale-1.0 in the name
        const files = fs.readdirSync(multiResPath, { withFileTypes: true });
        
        for (const file of files) {
            if (file.isFile() && file.name.endsWith('.png') && file.name.includes('_scale-1.0')) {
                // Convert to relative path
                const relativePath = path.relative(DATA_DIR, path.join(multiResPath, file.name));
                // Ensure it starts with ./data/
                const relativePathStr = relativePath.startsWith('data/') ? `./${relativePath}` : `./data/${relativePath}`;
                mockupLayers.push(relativePathStr);
            }
        }
        
        // Sort by layer number if present in filename
        mockupLayers.sort((a, b) => {
            const aMatch = a.match(/layer-(\d+)/);
            const bMatch = b.match(/layer-(\d+)/);
            if (aMatch && bMatch) {
                return parseInt(aMatch[1]) - parseInt(bMatch[1]);
            }
            return a.localeCompare(b);
        });
    }
    
    return mockupLayers;
}

/**
 * Scan for multi-resolution mockup layer structure
 * These are mockup preview images (furniture/room) at different scales, NOT pattern layers
 * Returns object with scale keys and layer arrays
 * Structure: data/collections/{collection}-fur/layers/{furnitureType}/*_scale-{scale}.png
 */
function scanMultiResMockupLayers(collectionName, patternName, furnitureType = 'Sofa-Capitol') {
    const multiRes = {};
    const scales = ['0.5', '1.0', '1.25', '1.5', '2.0'];
    
    // Multi-res structure: data/collections/{collection}-fur/layers/{furnitureType}/
    const basePath = path.join(COLLECTIONS_DIR, `${collectionName}-fur`, 'layers', furnitureType);
    
    if (fs.existsSync(basePath)) {
        // Get all files first
        const files = fs.readdirSync(basePath, { withFileTypes: true });
        
        // Check for scale-specific files
        for (const scale of scales) {
            const scaleLayers = [];
            
            // Look for files with scale in name: pattern_layer-1_scale-1.0.png
            for (const file of files) {
                if (file.isFile() && file.name.includes(`_scale-${scale}`) && file.name.endsWith('.png')) {
                    // Use absolute URL (as stored in multi-res format)
                    const relativePath = path.relative(DATA_DIR, path.join(basePath, file.name));
                    const fullUrl = `https://so-animation.com/colorflex/data/${relativePath}`;
                    
                    // Extract layer info from filename
                    // Pattern: {pattern-name}_{layer-name}_layer-{index}_scale-{scale}.png
                    const layerMatch = file.name.match(/(.+?)_(.+?)_layer-(\d+)_scale-(\d+\.\d+)/);
                    if (layerMatch) {
                        const [, patternPart, layerName, layerIndex] = layerMatch;
                        scaleLayers.push({
                            path: fullUrl,
                            label: layerName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                            index: parseInt(layerIndex)
                        });
                    } else {
                        // Fallback: try simpler pattern
                        const simpleMatch = file.name.match(/layer-(\d+)/);
                        if (simpleMatch) {
                            scaleLayers.push({
                                path: fullUrl,
                                label: 'Layer',
                                index: parseInt(simpleMatch[1])
                            });
                        } else {
                            // Last resort: just use the path
                            scaleLayers.push({
                                path: fullUrl,
                                label: 'Layer',
                                index: 1
                            });
                        }
                    }
                }
            }
            
            // Sort by index
            scaleLayers.sort((a, b) => a.index - b.index);
            
            if (scaleLayers.length > 0) {
                multiRes[scale] = scaleLayers;
            }
        }
    }
    
    return Object.keys(multiRes).length > 0 ? multiRes : null;
}

/**
 * Build standard format mockupLayers (array of strings)
 * These are paths to mockup preview images (furniture/room), NOT pattern layers
 */
function buildStandardMockupLayers(collectionName, patternName) {
    const mockupLayers = scanFurnitureMockupLayers(collectionName, patternName);
    
    if (mockupLayers.length === 0) {
        return null;
    }
    
    return mockupLayers;
}

/**
 * Build multi-resolution format mockupLayers (nested object)
 * These are mockup preview images (furniture/room) at different scales, NOT pattern layers
 */
function buildMultiResMockupLayers(collectionName, patternName) {
    const furnitureTypes = ['Sofa-Capitol', 'Sofa-Kite'];
    const result = {};
    
    for (const furnitureType of furnitureTypes) {
        const multiRes = scanMultiResMockupLayers(collectionName, patternName, furnitureType);
        if (multiRes) {
            result[furnitureType] = multiRes;
        }
    }
    
    return Object.keys(result).length > 0 ? result : null;
}

/**
 * Process a single collection
 */
function processCollection(collection, collectionsData) {
    const collectionName = collection.name;
    
    // Skip if filtering by collection name
    if (options.collection && collectionName !== options.collection && !collectionName.includes(options.collection)) {
        return;
    }
    
    // Only process furniture collections
    if (!collectionName.includes('.fur-') && !collectionName.includes('-fur')) {
        return;
    }
    
    console.log(`\n📁 Processing collection: ${collectionName}`);
    
    // Extract base collection name (remove .fur-1 suffix)
    // Examples: "farmhouse.fur-1" -> "farmhouse", "geometry.fur-1" -> "geometry"
    const baseCollectionName = collectionName.replace(/\.fur-\d+$/, '').replace(/-fur$/, '');
    
    console.log(`   Base collection name: ${baseCollectionName}`);
    
    let updated = false;
    
    // Process each pattern
    for (const pattern of collection.patterns || []) {
        const patternName = pattern.name.toLowerCase().replace(/\s+/g, '-');
        let mockupLayers = null;
        
        // Build based on requested format
        // Note: These are mockup preview images (furniture/room), NOT pattern layers
        // Standard format uses 1.0 scale files from multi-res structure
        // Multi-res format uses all scales from multi-res structure
        
        if (options.format === 'standard' || options.format === 'both') {
            const standardMockupLayers = buildStandardMockupLayers(baseCollectionName, patternName);
            if (standardMockupLayers && standardMockupLayers.length > 0) {
                if (options.format === 'standard') {
                    // Standard format only: use the 1.0 scale files
                    mockupLayers = standardMockupLayers;
                    console.log(`  ✅ ${pattern.name}: Found ${standardMockupLayers.length} standard mockup layers (1.0 scale)`);
                } else {
                    // Both formats: store standard for later, but check multi-res first
                    const multiResMockupLayers = buildMultiResMockupLayers(baseCollectionName, patternName);
                    if (multiResMockupLayers) {
                        // Prefer multi-res if available (for furniture-simple page)
                        mockupLayers = multiResMockupLayers;
                        const totalScales = Object.values(multiResMockupLayers).reduce((sum, type) => sum + Object.keys(type).length, 0);
                        console.log(`  ✅ ${pattern.name}: Found multi-res mockup structure (${totalScales} scale entries)`);
                    } else {
                        // Fall back to standard format
                        mockupLayers = standardMockupLayers;
                        console.log(`  ✅ ${pattern.name}: Found ${standardMockupLayers.length} standard mockup layers (1.0 scale)`);
                    }
                }
            }
        } else if (options.format === 'multi-res') {
            const multiResMockupLayers = buildMultiResMockupLayers(baseCollectionName, patternName);
            if (multiResMockupLayers) {
                mockupLayers = multiResMockupLayers;
                const totalScales = Object.values(multiResMockupLayers).reduce((sum, type) => sum + Object.keys(type).length, 0);
                console.log(`  ✅ ${pattern.name}: Found multi-res mockup structure (${totalScales} scale entries)`);
            }
        }
        
        // Update pattern if we found mockup layers
        if (mockupLayers) {
            pattern.mockupLayers = mockupLayers;
            updated = true;
        } else {
            console.log(`  ⚠️  ${pattern.name}: No mockup layers found`);
        }
    }
    
    return updated;
}

/**
 * Main function
 */
function main() {
    console.log('🔍 Building Furniture Mockup Layers');
    console.log('===================================\n');
    console.log(`Format: ${options.format}`);
    console.log(`Output: ${options.output}`);
    console.log(`Dry run: ${options.dryRun ? 'YES' : 'NO'}`);
    if (options.collection) {
        console.log(`Collection filter: ${options.collection}`);
    }
    console.log('');
    
    // Check if collections.json exists
    if (!fs.existsSync(COLLECTIONS_JSON)) {
        console.error(`❌ Collections JSON not found: ${COLLECTIONS_JSON}`);
        process.exit(1);
    }
    
    // Load collections.json
    console.log('📖 Loading collections.json...');
    const collectionsData = JSON.parse(fs.readFileSync(COLLECTIONS_JSON, 'utf8'));
    console.log(`   Found ${collectionsData.collections.length} collections\n`);
    
    // Process each collection
    let totalUpdated = 0;
    for (const collection of collectionsData.collections) {
        if (processCollection(collection, collectionsData)) {
            totalUpdated++;
        }
    }
    
    console.log(`\n✅ Processed ${totalUpdated} collections`);
    
    // Write output
    if (!options.dryRun) {
        console.log(`\n💾 Writing to ${options.output}...`);
        fs.writeFileSync(options.output, JSON.stringify(collectionsData, null, 2));
        console.log('✅ Done!');
    } else {
        console.log('\n🔍 Dry run - no files written');
        console.log('   Run without --dry-run to apply changes');
    }
}

// Run main function
main();
