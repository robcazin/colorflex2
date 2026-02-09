#!/usr/bin/env node
/**
 * Update furniture collections with multi-scale mockupLayers
 * Reads manifests from data/collections/{collection}-fur/layers/{furniture-type}/
 * Creates nested structure: { "Sofa-Capitol": { "1.0": [...], "1.25": [...] }, ... }
 */

const fs = require('fs');
const path = require('path');

const COLLECTIONS_DIR = path.join(process.cwd(), 'data/collections');
const COLLECTIONS_FILE = path.join(process.cwd(), 'src/assets/collections.json');

// Base URL for layer images on SoAnimation server
const LAYER_BASE_URL = 'https://so-animation.com/colorflex/data/collections';

function loadManifests(collectionFurDir) {
    const manifests = {};
    const layersDir = path.join(collectionFurDir, 'layers');

    if (!fs.existsSync(layersDir)) {
        return manifests;
    }

    // Scan furniture types (e.g., Sofa-Capitol, Sofa-Kite)
    const furnitureTypes = fs.readdirSync(layersDir).filter(f => {
        const fullPath = path.join(layersDir, f);
        return fs.statSync(fullPath).isDirectory();
    });

    for (const furnitureType of furnitureTypes) {
        const typeDir = path.join(layersDir, furnitureType);
        const manifestFiles = fs.readdirSync(typeDir).filter(f => f.startsWith('manifest_') && f.endsWith('.json'));

        for (const manifestFile of manifestFiles) {
            const manifestPath = path.join(typeDir, manifestFile);
            try {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                const patternSlug = manifest.pattern_slug;

                if (!manifests[patternSlug]) {
                    manifests[patternSlug] = {
                        pattern: manifest.pattern,
                        furnitureTypes: {}
                    };
                }

                // Build the scale -> layers mapping
                manifests[patternSlug].furnitureTypes[furnitureType] = {};

                for (const [scale, layers] of Object.entries(manifest.scales || {})) {
                    manifests[patternSlug].furnitureTypes[furnitureType][scale] = layers.map(layer => ({
                        path: `${LAYER_BASE_URL}/${path.basename(collectionFurDir)}/layers/${furnitureType}/${layer.filename}`,
                        label: layer.label,
                        index: layer.index
                    }));
                }
            } catch (err) {
                console.error(`  Error reading manifest ${manifestFile}:`, err.message);
            }
        }
    }

    return manifests;
}

function updateCollectionPatterns(collection, manifests) {
    let updatedCount = 0;

    for (const pattern of collection.patterns || []) {
        // Try to match by pattern name (case-insensitive)
        const patternNameLower = pattern.name?.toLowerCase();

        // Find matching manifest by pattern name
        let matchedManifest = null;
        for (const [slug, manifest] of Object.entries(manifests)) {
            if (manifest.pattern?.toLowerCase() === patternNameLower) {
                matchedManifest = manifest;
                break;
            }
        }

        if (matchedManifest && matchedManifest.furnitureTypes) {
            // Create nested mockupLayers structure
            pattern.mockupLayers = matchedManifest.furnitureTypes;
            updatedCount++;
            console.log(`    ✅ ${pattern.name}: ${Object.keys(matchedManifest.furnitureTypes).length} furniture types`);
        }
    }

    return updatedCount;
}

async function main() {
    console.log('🪑 Updating furniture collections with multi-scale layers...\n');

    // Load existing collections.json
    const collectionsData = JSON.parse(fs.readFileSync(COLLECTIONS_FILE, 'utf8'));

    // Find furniture collection directories
    const furDirs = fs.readdirSync(COLLECTIONS_DIR).filter(f => {
        const fullPath = path.join(COLLECTIONS_DIR, f);
        return fs.statSync(fullPath).isDirectory() && f.endsWith('-fur');
    });

    console.log(`Found ${furDirs.length} furniture layer directories:\n`);

    let totalUpdated = 0;

    for (const furDir of furDirs) {
        const collectionFurDir = path.join(COLLECTIONS_DIR, furDir);
        console.log(`📦 Processing ${furDir}...`);

        // Load manifests from this directory
        const manifests = loadManifests(collectionFurDir);
        const manifestCount = Object.keys(manifests).length;

        if (manifestCount === 0) {
            console.log(`  ⏭️ No manifests found`);
            continue;
        }

        console.log(`  Found ${manifestCount} pattern manifests`);

        // Find the corresponding .fur-1 collection in collections.json
        // Map: botanicals-fur -> botanicals.fur-1
        const baseName = furDir.replace('-fur', '');
        const collectionName = `${baseName}.fur-1`;

        const collection = collectionsData.collections.find(c => c.name === collectionName);

        if (!collection) {
            console.log(`  ⚠️ Collection ${collectionName} not found in collections.json`);
            continue;
        }

        // Update patterns with multi-scale mockupLayers
        const updated = updateCollectionPatterns(collection, manifests);
        totalUpdated += updated;
        console.log(`  🔄 Updated ${updated} patterns\n`);
    }

    // Backup and save
    const backupPath = COLLECTIONS_FILE.replace('.json', `-backup-multiscale-${Date.now()}.json`);
    fs.copyFileSync(COLLECTIONS_FILE, backupPath);
    console.log(`💾 Backup saved to: ${path.basename(backupPath)}`);

    fs.writeFileSync(COLLECTIONS_FILE, JSON.stringify(collectionsData, null, 2));
    console.log(`✅ Updated collections.json with ${totalUpdated} multi-scale patterns`);

    console.log(`\n🚀 Next steps:`);
    console.log(`   1. Deploy collections.json to Shopify: ./deploy-shopify-cli.sh data`);
    console.log(`   2. Test furniture-simple page`);
}

main().catch(console.error);
