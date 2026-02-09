#!/usr/bin/env node
/**
 * Generate furniture collection entries from rendered pattern layers
 * Scans data/furniture/sofa-capitol/patterns/ and creates .fur-1 collections
 */

const fs = require('fs');
const path = require('path');

const FURNITURE_PATTERNS_DIR = path.join(process.cwd(), 'data/furniture/sofa-capitol/patterns');
const COLLECTIONS_FILE = path.join(process.cwd(), 'data/collections.json');

// Collections to process
const FURNITURE_COLLECTIONS = [
    'bombay',
    'botanicals',
    'cottage-sketch-book',
    'coverlets',
    'english-cottage',
    'farmhouse',
    'folksie',
    'geometry',
    'ikats',
    'new-orleans',
    'silk-road',
    'traditions'
];

function getPatternSlug(patternName) {
    return patternName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function scanFurniturePatterns(collectionName) {
    const collectionDir = path.join(FURNITURE_PATTERNS_DIR, collectionName);

    if (!fs.existsSync(collectionDir)) {
        console.log(`⚠️ No furniture patterns found for ${collectionName}`);
        return [];
    }

    const patterns = [];
    const patternDirs = fs.readdirSync(collectionDir).filter(f => {
        const fullPath = path.join(collectionDir, f);
        return fs.statSync(fullPath).isDirectory();
    });

    for (const patternDir of patternDirs) {
        const patternPath = path.join(collectionDir, patternDir);
        const files = fs.readdirSync(patternPath);

        // Get layer files (PNG files with layer- in name)
        const layerFiles = files
            .filter(f => f.endsWith('.png') && f.includes('layer-'))
            .sort((a, b) => {
                const numA = parseInt(a.match(/layer-(\d+)/)?.[1] || '0');
                const numB = parseInt(b.match(/layer-(\d+)/)?.[1] || '0');
                return numA - numB;
            });

        if (layerFiles.length > 0) {
            // Extract layer labels from filenames
            const layerLabels = layerFiles.map(f => {
                // Format: pattern_label_layer-N.png
                const match = f.match(/^[^_]+_(.+)_layer-\d+\.png$/);
                if (match) {
                    return match[1].split('-').map(w =>
                        w.charAt(0).toUpperCase() + w.slice(1)
                    ).join(' ');
                }
                return `Layer ${layerFiles.indexOf(f) + 1}`;
            });

            patterns.push({
                patternSlug: patternDir,
                layerFiles: layerFiles,
                layerLabels: layerLabels,
                layerCount: layerFiles.length
            });
        }
    }

    return patterns;
}

function findBaseCollection(collections, collectionName) {
    // Find the base collection (non-.fur, non-.clo)
    return collections.find(c =>
        c.name === collectionName ||
        c.name.toLowerCase() === collectionName.toLowerCase()
    );
}

function findPatternInBase(baseCollection, patternSlug) {
    if (!baseCollection || !baseCollection.patterns) return null;

    return baseCollection.patterns.find(p => {
        const pSlug = getPatternSlug(p.name);
        return pSlug === patternSlug || p.id === patternSlug;
    });
}

function generateFurnitureCollection(collectionName, baseCollection, furniturePatterns) {
    const furCollection = {
        name: `${collectionName}.fur-1`,
        displayName: `${baseCollection?.displayName || collectionName} (Furniture)`,
        curatedColors: baseCollection?.curatedColors || [],
        coordinates: [],
        mockupWidthInches: 90,
        mockupHeightInches: 60,
        patterns: []
    };

    for (const fp of furniturePatterns) {
        const basePattern = findPatternInBase(baseCollection, fp.patternSlug);

        if (!basePattern) {
            console.log(`  ⚠️ No base pattern found for ${fp.patternSlug} in ${collectionName}`);
            continue;
        }

        // Build mockupLayers paths
        const mockupLayers = fp.layerFiles.map(f =>
            `./data/furniture/sofa-capitol/patterns/${collectionName}/${fp.patternSlug}/${f}`
        );

        const pattern = {
            id: basePattern.id || fp.patternSlug,
            name: basePattern.name,
            thumbnail: basePattern.thumbnail,
            repeatH: basePattern.repeatH || 24,
            repeatV: basePattern.repeatV || 24,
            halfDrop: basePattern.halfDrop || false,
            tilingType: basePattern.tilingType || 'straight',
            layerLabels: fp.layerLabels,
            layers: basePattern.layers || [],
            mockupLayers: mockupLayers,
            curatedColors: basePattern.curatedColors || baseCollection?.curatedColors || []
        };

        furCollection.patterns.push(pattern);
    }

    return furCollection;
}

async function main() {
    console.log('🪑 Generating furniture collections...\n');

    // Load existing collections.json
    const collectionsData = JSON.parse(fs.readFileSync(COLLECTIONS_FILE, 'utf8'));

    // Track existing fur collections to update
    const existingFurNames = new Set(
        collectionsData.collections
            .filter(c => c.name.includes('.fur-'))
            .map(c => c.name)
    );

    const newFurCollections = [];

    for (const collectionName of FURNITURE_COLLECTIONS) {
        console.log(`📦 Processing ${collectionName}...`);

        // Scan furniture patterns
        const furniturePatterns = scanFurniturePatterns(collectionName);

        if (furniturePatterns.length === 0) {
            console.log(`  ⏭️ No patterns found, skipping`);
            continue;
        }

        console.log(`  Found ${furniturePatterns.length} patterns with furniture layers`);

        // Find base collection
        const baseCollection = findBaseCollection(collectionsData.collections, collectionName);

        if (!baseCollection) {
            console.log(`  ⚠️ Base collection not found in collections.json`);
            continue;
        }

        // Generate furniture collection
        const furCollection = generateFurnitureCollection(collectionName, baseCollection, furniturePatterns);

        console.log(`  ✅ Generated ${furCollection.patterns.length} furniture patterns`);

        // Check if we should update existing or add new
        const furName = `${collectionName}.fur-1`;
        if (existingFurNames.has(furName)) {
            // Find and update existing
            const idx = collectionsData.collections.findIndex(c => c.name === furName);
            if (idx >= 0) {
                collectionsData.collections[idx] = furCollection;
                console.log(`  🔄 Updated existing ${furName}`);
            }
        } else {
            newFurCollections.push(furCollection);
        }
    }

    // Add new collections
    if (newFurCollections.length > 0) {
        collectionsData.collections.push(...newFurCollections);
        console.log(`\n✨ Added ${newFurCollections.length} new furniture collections`);
    }

    // Backup and save
    const backupPath = COLLECTIONS_FILE.replace('.json', `-backup-fur-${Date.now()}.json`);
    fs.copyFileSync(COLLECTIONS_FILE, backupPath);
    console.log(`\n💾 Backup saved to: ${path.basename(backupPath)}`);

    fs.writeFileSync(COLLECTIONS_FILE, JSON.stringify(collectionsData, null, 2));
    console.log(`✅ Updated collections.json`);

    // Summary
    const totalFurPatterns = collectionsData.collections
        .filter(c => c.name.includes('.fur-'))
        .reduce((sum, c) => sum + (c.patterns?.length || 0), 0);

    console.log(`\n📊 Summary:`);
    console.log(`   Furniture collections: ${collectionsData.collections.filter(c => c.name.includes('.fur-')).length}`);
    console.log(`   Total furniture patterns: ${totalFurPatterns}`);
    console.log(`\n🚀 Don't forget to deploy collections.json to the server!`);
}

main().catch(console.error);
