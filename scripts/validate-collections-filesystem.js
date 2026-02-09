#!/usr/bin/env node

/**
 * Collections.json to Filesystem Validation Script
 * 
 * Compares paths in collections.json to actual files on the filesystem
 * Reports missing files, incorrect paths, and structural issues
 */

const fs = require('fs');
const path = require('path');

// Configuration
const COLLECTIONS_JSON_PATH = path.join(__dirname, '../src/assets/collections.json');
const DATA_ROOT = path.join(__dirname, '../data');
const WEB_ROOT = 'https://so-animation.com/colorflex';

// Statistics
const stats = {
    totalCollections: 0,
    totalPatterns: 0,
    checkedFiles: 0,
    missingFiles: 0,
    foundFiles: 0,
    errors: []
};

// Results storage
const results = {
    collections: {},
    summary: {
        missingThumbnails: [],
        missingLayers: [],
        missingMockupLayers: [],
        missingVariantCollections: [],
        structuralIssues: []
    }
};

/**
 * Convert JSON path to local filesystem path
 */
function jsonPathToLocal(jsonPath) {
    if (!jsonPath || typeof jsonPath !== 'string') return null;
    
    // Handle full URLs (convert to local path)
    if (jsonPath.startsWith('http://') || jsonPath.startsWith('https://')) {
        // Extract path after /colorflex/data/ or /colorflex/
        const urlMatch = jsonPath.match(/\/colorflex\/data\/(.+)$/);
        if (urlMatch) {
            // Already has 'data/' in the match, so use it directly
            return path.join(DATA_ROOT, urlMatch[1]);
        }
        // Try without /data/ prefix
        const urlMatch2 = jsonPath.match(/\/colorflex\/(.+)$/);
        if (urlMatch2) {
            const relativePath = urlMatch2[1];
            // If it starts with 'data/', remove it since DATA_ROOT already includes 'data'
            if (relativePath.startsWith('data/')) {
                return path.join(DATA_ROOT, relativePath.substring(5));
            }
            return path.join(DATA_ROOT, relativePath);
        }
        // If no /colorflex/ match, try to extract data/ path
        const dataMatch = jsonPath.match(/\/data\/(.+)$/);
        if (dataMatch) {
            return path.join(DATA_ROOT, dataMatch[1]);
        }
        return null;
    }
    
    // Remove leading ./ if present
    let localPath = jsonPath.startsWith('./') ? jsonPath.substring(2) : jsonPath;
    
    // Convert to absolute path
    if (localPath.startsWith('data/')) {
        return path.join(DATA_ROOT, localPath.substring(5)); // Remove 'data/' prefix
    }
    
    return null;
}

/**
 * Convert JSON path to web URL
 */
function jsonPathToWeb(jsonPath) {
    if (!jsonPath || typeof jsonPath !== 'string') return null;
    
    let webPath = jsonPath.startsWith('./') ? jsonPath.substring(2) : jsonPath;
    
    if (webPath.startsWith('data/')) {
        return `${WEB_ROOT}/${webPath}`;
    }
    
    return null;
}

/**
 * Check if file exists
 */
function fileExists(filePath) {
    try {
        return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
    } catch (e) {
        return false;
    }
}

/**
 * Check if directory exists
 */
function dirExists(dirPath) {
    try {
        return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
    } catch (e) {
        return false;
    }
}

/**
 * Validate a single file path
 */
function validateFilePath(jsonPath, context) {
    stats.checkedFiles++;
    
    if (!jsonPath) {
        return { exists: false, error: 'Path is null or undefined' };
    }
    
    const localPath = jsonPathToLocal(jsonPath);
    if (!localPath) {
        return { exists: false, error: 'Could not convert to local path', webUrl: jsonPathToWeb(jsonPath) };
    }
    
    const exists = fileExists(localPath);
    if (exists) {
        stats.foundFiles++;
    } else {
        stats.missingFiles++;
    }
    
    return {
        exists,
        localPath,
        webUrl: jsonPathToWeb(jsonPath),
        context
    };
}

/**
 * Validate collection structure
 */
function validateCollection(collection) {
    const collectionName = collection.name;
    stats.totalCollections++;
    
    const collectionResults = {
        name: collectionName,
        patterns: [],
        issues: [],
        missingFiles: []
    };
    
    // Check collection thumbnail
    if (collection.collection_thumbnail) {
        const thumbResult = validateFilePath(collection.collection_thumbnail, `Collection thumbnail: ${collectionName}`);
        if (!thumbResult.exists) {
            collectionResults.missingFiles.push(thumbResult);
            results.summary.missingThumbnails.push({
                collection: collectionName,
                path: collection.collection_thumbnail,
                localPath: thumbResult.localPath
            });
        }
    }
    
    // Check if collection directory exists
    // Handle variant collections: .fur-1 -> -fur, .clo-1 -> -clo
    let collectionDirName = collectionName;
    const variantMatch = collectionName.match(/^(.+?)(\.(fur|clo)(-\d+)?)$/i);
    if (variantMatch) {
        // Convert .fur-1 to -fur, .clo-1 to -clo
        const baseName = variantMatch[1];
        const variantType = variantMatch[3].toLowerCase(); // 'fur' or 'clo'
        collectionDirName = `${baseName}-${variantType}`;
    }
    
    const collectionDir = path.join(DATA_ROOT, 'collections', collectionDirName);
    if (!dirExists(collectionDir)) {
        collectionResults.issues.push({
            type: 'missing_directory',
            message: `Collection directory does not exist: ${collectionDir} (from JSON name: ${collectionName})`
        });
    }
    
    // Validate patterns
    if (collection.patterns && Array.isArray(collection.patterns)) {
        collection.patterns.forEach((pattern, patternIndex) => {
            stats.totalPatterns++;
            const patternResults = {
                name: pattern.name,
                id: pattern.id,
                issues: [],
                missingFiles: []
            };
            
            // Check pattern thumbnail
            if (pattern.thumbnail) {
                const thumbResult = validateFilePath(pattern.thumbnail, `Pattern thumbnail: ${pattern.name}`);
                if (!thumbResult.exists) {
                    patternResults.missingFiles.push(thumbResult);
                }
            }
            
            // Check pattern layers
            if (pattern.layers && Array.isArray(pattern.layers)) {
                pattern.layers.forEach((layer, layerIndex) => {
                    const layerPath = layer.path || layer.file || (typeof layer === 'string' ? layer : null);
                    if (layerPath) {
                        const layerResult = validateFilePath(layerPath, `Pattern layer ${layerIndex + 1}: ${pattern.name}`);
                        if (!layerResult.exists) {
                            patternResults.missingFiles.push(layerResult);
                            results.summary.missingLayers.push({
                                collection: collectionName,
                                pattern: pattern.name,
                                layerIndex: layerIndex + 1,
                                path: layerPath,
                                localPath: layerResult.localPath
                            });
                        }
                    }
                });
            }
            
            // Check mockupLayers (for furniture/clothing)
            if (pattern.mockupLayers) {
                if (Array.isArray(pattern.mockupLayers)) {
                    // Array format (old format like Folksie)
                    pattern.mockupLayers.forEach((mockupLayer, mockupIndex) => {
                        const mockupPath = typeof mockupLayer === 'string' ? mockupLayer : (mockupLayer.path || mockupLayer.file);
                        if (mockupPath) {
                            const mockupResult = validateFilePath(mockupPath, `Mockup layer ${mockupIndex + 1}: ${pattern.name}`);
                            if (!mockupResult.exists) {
                                patternResults.missingFiles.push(mockupResult);
                                results.summary.missingMockupLayers.push({
                                    collection: collectionName,
                                    pattern: pattern.name,
                                    layerIndex: mockupIndex + 1,
                                    path: mockupPath,
                                    localPath: mockupResult.localPath,
                                    format: 'array'
                                });
                            }
                        }
                    });
                } else if (typeof pattern.mockupLayers === 'object') {
                    // Nested format (multi-resolution)
                    Object.keys(pattern.mockupLayers).forEach(furnitureType => {
                        const typeLayers = pattern.mockupLayers[furnitureType];
                        if (typeof typeLayers === 'object' && !Array.isArray(typeLayers)) {
                            // Multi-resolution: { "1.0": [...], "1.5": [...] }
                            Object.keys(typeLayers).forEach(scale => {
                                const scaleLayers = typeLayers[scale];
                                if (Array.isArray(scaleLayers)) {
                                    scaleLayers.forEach((scaleLayer, scaleIndex) => {
                                        const scalePath = typeof scaleLayer === 'string' ? scaleLayer : (scaleLayer.path || scaleLayer.file);
                                        if (scalePath) {
                                            const scaleResult = validateFilePath(scalePath, `Mockup layer ${scaleIndex + 1} (${furnitureType} @ ${scale}X): ${pattern.name}`);
                                            if (!scaleResult.exists) {
                                                patternResults.missingFiles.push(scaleResult);
                                                results.summary.missingMockupLayers.push({
                                                    collection: collectionName,
                                                    pattern: pattern.name,
                                                    furnitureType,
                                                    scale,
                                                    layerIndex: scaleIndex + 1,
                                                    path: scalePath,
                                                    localPath: scaleResult.localPath,
                                                    format: 'nested'
                                                });
                                            }
                                        }
                                    });
                                }
                            });
                        } else if (Array.isArray(typeLayers)) {
                            // Direct array under furniture type
                            typeLayers.forEach((typeLayer, typeIndex) => {
                                const typePath = typeof typeLayer === 'string' ? typeLayer : (typeLayer.path || typeLayer.file);
                                if (typePath) {
                                    const typeResult = validateFilePath(typePath, `Mockup layer ${typeIndex + 1} (${furnitureType}): ${pattern.name}`);
                                    if (!typeResult.exists) {
                                        patternResults.missingFiles.push(typeResult);
                                        results.summary.missingMockupLayers.push({
                                            collection: collectionName,
                                            pattern: pattern.name,
                                            furnitureType,
                                            layerIndex: typeIndex + 1,
                                            path: typePath,
                                            localPath: typeResult.localPath,
                                            format: 'nested-array'
                                        });
                                    }
                                }
                            });
                        }
                    });
                }
            }
            
            if (patternResults.missingFiles.length > 0 || patternResults.issues.length > 0) {
                collectionResults.patterns.push(patternResults);
            }
        });
    }
    
    if (collectionResults.missingFiles.length > 0 || collectionResults.issues.length > 0 || collectionResults.patterns.length > 0) {
        results.collections[collectionName] = collectionResults;
    }
}

/**
 * Check for variant collections
 */
function checkVariantCollections(collections) {
    const baseCollections = new Set();
    const variantCollections = new Map();
    
    // Identify base and variant collections
    collections.forEach(collection => {
        const name = collection.name;
        
        // Check if it's a variant (has .fur, .clo, -fur, -clo suffixes)
        const variantMatch = name.match(/^(.+?)(\.(fur|clo)(-\d+)?|-(fur|clo)(-\d+)?)$/i);
        if (variantMatch) {
            const baseName = variantMatch[1];
            baseCollections.add(baseName);
            
            if (!variantCollections.has(baseName)) {
                variantCollections.set(baseName, []);
            }
            variantCollections.get(baseName).push(name);
        } else {
            baseCollections.add(name);
        }
    });
    
    // Check if variant collection directories exist
    variantCollections.forEach((variants, baseName) => {
        variants.forEach(variantName => {
            const variantDir = path.join(DATA_ROOT, 'collections', variantName);
            if (!dirExists(variantDir)) {
                results.summary.missingVariantCollections.push({
                    baseCollection: baseName,
                    variantCollection: variantName,
                    expectedPath: variantDir
                });
            }
        });
    });
}

/**
 * Main validation function
 */
function validateCollections() {
    console.log('🔍 Starting collections.json to filesystem validation...\n');
    console.log(`📁 Collections JSON: ${COLLECTIONS_JSON_PATH}`);
    console.log(`📁 Data Root: ${DATA_ROOT}\n`);
    
    // Load collections.json
    if (!fileExists(COLLECTIONS_JSON_PATH)) {
        console.error(`❌ Collections JSON not found: ${COLLECTIONS_JSON_PATH}`);
        process.exit(1);
    }
    
    let collectionsData;
    try {
        const jsonContent = fs.readFileSync(COLLECTIONS_JSON_PATH, 'utf8');
        collectionsData = JSON.parse(jsonContent);
    } catch (error) {
        console.error(`❌ Error reading/parsing collections.json: ${error.message}`);
        process.exit(1);
    }
    
    if (!collectionsData.collections || !Array.isArray(collectionsData.collections)) {
        console.error('❌ Invalid collections.json structure: missing "collections" array');
        process.exit(1);
    }
    
    console.log(`📊 Found ${collectionsData.collections.length} collections\n`);
    console.log('🔍 Validating collections...\n');
    
    // Validate each collection
    collectionsData.collections.forEach(collection => {
        validateCollection(collection);
    });
    
    // Check variant collections
    checkVariantCollections(collectionsData.collections);
    
    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Collections: ${stats.totalCollections}`);
    console.log(`Total Patterns: ${stats.totalPatterns}`);
    console.log(`Files Checked: ${stats.checkedFiles}`);
    console.log(`Files Found: ${stats.foundFiles}`);
    console.log(`Files Missing: ${stats.missingFiles}`);
    console.log(`Success Rate: ${((stats.foundFiles / stats.checkedFiles) * 100).toFixed(2)}%`);
    
    // Print detailed results
    if (Object.keys(results.collections).length > 0) {
        console.log('\n' + '='.repeat(80));
        console.log('⚠️  ISSUES FOUND');
        console.log('='.repeat(80));
        
        Object.keys(results.collections).forEach(collectionName => {
            const collection = results.collections[collectionName];
            console.log(`\n📁 Collection: ${collectionName}`);
            
            if (collection.missingFiles.length > 0) {
                console.log(`  ❌ Missing ${collection.missingFiles.length} collection-level file(s)`);
                collection.missingFiles.forEach(file => {
                    console.log(`     - ${file.context}`);
                    console.log(`       Expected: ${file.localPath}`);
                });
            }
            
            if (collection.issues.length > 0) {
                collection.issues.forEach(issue => {
                    console.log(`  ⚠️  ${issue.message}`);
                });
            }
            
            if (collection.patterns.length > 0) {
                console.log(`  📋 ${collection.patterns.length} pattern(s) with issues:`);
                collection.patterns.forEach(pattern => {
                    console.log(`\n     Pattern: ${pattern.name} (ID: ${pattern.id})`);
                    if (pattern.missingFiles.length > 0) {
                        console.log(`     ❌ Missing ${pattern.missingFiles.length} file(s):`);
                        pattern.missingFiles.slice(0, 5).forEach(file => {
                            console.log(`        - ${file.context}`);
                            console.log(`          Expected: ${file.localPath}`);
                        });
                        if (pattern.missingFiles.length > 5) {
                            console.log(`        ... and ${pattern.missingFiles.length - 5} more`);
                        }
                    }
                });
            }
        });
    }
    
    // Print summary by category
    if (results.summary.missingThumbnails.length > 0) {
        console.log('\n' + '='.repeat(80));
        console.log(`❌ Missing Collection Thumbnails: ${results.summary.missingThumbnails.length}`);
        results.summary.missingThumbnails.slice(0, 10).forEach(item => {
            console.log(`  - ${item.collection}: ${item.localPath}`);
        });
        if (results.summary.missingThumbnails.length > 10) {
            console.log(`  ... and ${results.summary.missingThumbnails.length - 10} more`);
        }
    }
    
    if (results.summary.missingLayers.length > 0) {
        console.log('\n' + '='.repeat(80));
        console.log(`❌ Missing Pattern Layers: ${results.summary.missingLayers.length}`);
        results.summary.missingLayers.slice(0, 10).forEach(item => {
            console.log(`  - ${item.collection}/${item.pattern} (layer ${item.layerIndex}): ${item.localPath}`);
        });
        if (results.summary.missingLayers.length > 10) {
            console.log(`  ... and ${results.summary.missingLayers.length - 10} more`);
        }
    }
    
    if (results.summary.missingMockupLayers.length > 0) {
        console.log('\n' + '='.repeat(80));
        console.log(`❌ Missing Mockup Layers: ${results.summary.missingMockupLayers.length}`);
        results.summary.missingMockupLayers.slice(0, 10).forEach(item => {
            const context = item.furnitureType ? `${item.furnitureType} @ ${item.scale || 'N/A'}X` : 'N/A';
            console.log(`  - ${item.collection}/${item.pattern} (${context}, layer ${item.layerIndex}): ${item.localPath}`);
        });
        if (results.summary.missingMockupLayers.length > 10) {
            console.log(`  ... and ${results.summary.missingMockupLayers.length - 10} more`);
        }
    }
    
    if (results.summary.missingVariantCollections.length > 0) {
        console.log('\n' + '='.repeat(80));
        console.log(`❌ Missing Variant Collection Directories: ${results.summary.missingVariantCollections.length}`);
        results.summary.missingVariantCollections.forEach(item => {
            console.log(`  - ${item.variantCollection} (base: ${item.baseCollection})`);
            console.log(`    Expected: ${item.expectedPath}`);
        });
    }
    
    // Save detailed report to file
    const reportPath = path.join(__dirname, '../tmp/collections-validation-report.json');
    try {
        fs.mkdirSync(path.dirname(reportPath), { recursive: true });
        fs.writeFileSync(reportPath, JSON.stringify({
            timestamp: new Date().toISOString(),
            stats,
            results
        }, null, 2));
        console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    } catch (error) {
        console.error(`\n⚠️  Could not save report: ${error.message}`);
    }
    
    // Exit with error code if issues found
    if (stats.missingFiles > 0) {
        console.log('\n❌ Validation completed with errors');
        process.exit(1);
    } else {
        console.log('\n✅ Validation completed successfully - all files found!');
        process.exit(0);
    }
}

// Run validation
validateCollections();
