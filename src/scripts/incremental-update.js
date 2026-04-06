const Airtable = require('airtable');
const fsSync = require('fs');
const https = require('https');
const sharp = require('sharp');
const path = require('path');
const { execSync } = require('child_process');

// Ensure paths are relative to project root
const projectRoot = path.resolve(__dirname, '../..');
process.chdir(projectRoot);
console.log('🔄 Incremental Update - Working directory:', process.cwd());

try {
    require('dotenv').config();
    if (!process.env.AIRTABLE_PAT) {
        const localEnv = path.join(projectRoot, 'config', 'local.env');
        if (fsSync.existsSync(localEnv)) require('dotenv').config({ path: localEnv });
    }
} catch (e) {
    /* dotenv optional */
}

// Define functions directly since cf-dl.js doesn't export them
function cleanPatternName(str) {
    try {
        if (!str || typeof str !== 'string') {
            console.warn(`[CLEAN NAME WARNING] Invalid input: ${typeof str}, returning fallback`);
            return 'Unnamed Pattern';
        }

        const cleanedName = str
            .trim()
            .toLowerCase()
            .replace(/\.\w+$/, '')                           
            .replace(/^\d+[a-z]*\s*-\s*/i, '')              
            .replace(/\s*-\s*\d+x\d+$/i, '')                
            .replace(/\s*-\s*variant$/i, '')                
            .replace(/\s*-\s*[a-z\s]+\s+on\s+[a-z\s]+$/i, '') 
            .replace(/\s*-\s*[a-z\s]+\s+and\s+[a-z\s]+$/i, '') 
            .replace(/\s*-\s*[a-z\s]+\s+over\s+[a-z\s]+$/i, '') 
            .replace(/_/g, ' ')                             
            .replace(/\s*-\s*$/, '')                        
            .split(/[\s-]+/)                                
            .filter(word => word && word.length > 0)        
            .map(word => {
                try {
                    return word.charAt(0).toUpperCase() + word.slice(1);
                } catch (e) {
                    return String(word);
                }
            })
            .join(" ");                                     

        if (!cleanedName || cleanedName.trim().length === 0) {
            return 'Unnamed Pattern';
        }

        return cleanedName;

    } catch (error) {
        console.error(`[CLEAN NAME ERROR] Failed to process pattern name "${str}":`, error.message);
        return 'Unnamed Pattern';
    }
}

function extractDimensions(filename) {
    const match = filename.match(/(\d+)\s*X\s*(\d+)/i);
    if (match) {
        const width = parseInt(match[1], 10);
        const height = parseInt(match[2], 10);
        return [width, height];
    }
    return [24, 24];
}

function parsePatternNumber(numberString) {
    if (!numberString || typeof numberString !== 'string') {
        return { category: '', collection: '', pattern: '', variant: '', full: '' };
    }
    
    const match = numberString.match(/^(\d+)-(\d+)-(\d+)([A-Z]?)$/);
    if (match) {
        return {
            category: match[1],
            collection: match[2], 
            pattern: match[3],
            variant: match[4] || '',
            full: numberString
        };
    }
    
    return { category: '', collection: '', pattern: '', variant: '', full: numberString };
}

async function downloadImage(url, destPath, maxDimension = 2800, retries = 3, forceDownload = false) {
    // Check if file already exists (for incremental updates)
    if (!forceDownload && fsSync.existsSync(destPath)) {
        try {
            const metadata = await sharp(destPath).metadata();
            console.log(`[SKIP] File exists: ${destPath} (${metadata.width}x${metadata.height})`);
            return metadata;
        } catch (err) {
            console.log(`[EXISTING ERROR] Corrupted file detected, re-downloading: ${destPath}`);
        }
    }
    
    console.log(`[DOWNLOAD] Starting download: ${url} -> ${destPath}`);
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await new Promise((resolve, reject) => {
                https.get(url, { timeout: 30000 }, (response) => {
                    const file = fsSync.createWriteStream(destPath);
                    response.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        resolve();
                    });
                    file.on('error', (err) => {
                        fsSync.unlink(destPath, () => {});
                        reject(err);
                    });
                }).on('error', (err) => reject(err));
            });

            const metadata = await sharp(destPath).metadata();
            console.log(`[DOWNLOAD SUCCESS] Downloaded ${destPath}: ${metadata.width}x${metadata.height}`);
            if (maxDimension && (metadata.width > maxDimension || metadata.height > maxDimension)) {
                const aspectRatio = metadata.width / metadata.height;
                const [targetWidth, targetHeight] = metadata.width > metadata.height
                    ? [maxDimension, Math.round(maxDimension / aspectRatio)]
                    : [Math.round(maxDimension * aspectRatio), maxDimension];
                const tempPath = `${destPath}.tmp`;
                await sharp(destPath)
                    .resize(targetWidth, targetHeight, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 90 })
                    .toFile(tempPath);
                fsSync.renameSync(tempPath, destPath);
                console.log(`[RESIZE] Resized to ${targetWidth}x${targetHeight}`);
            }
            return metadata;
        } catch (err) {
            console.error(`[DOWNLOAD ERROR] Attempt ${attempt} failed for ${destPath}: ${err.message}`);
            if (attempt === retries) throw err;
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        }
    }
}

// Import generateShopifyCSV from cf-dl.js
const { generateShopifyCSV } = require('./cf-dl.js');

const airtablePat = process.env.AIRTABLE_PAT;
if (!airtablePat) {
    console.error('Missing AIRTABLE_PAT. Add it to .env or config/local.env (never commit tokens).');
    process.exit(1);
}
const airtable = new Airtable({ apiKey: airtablePat });
const base = airtable.base(process.env.AIRTABLE_BASE_ID || 'appsywaKYiyKQTnl3');

// Track new patterns found
const newPatterns = {
    collections: [],
    totalNewPatterns: 0,
    processedFiles: []
};

// Load existing collections.json
function loadExistingData() {
    try {
        if (fsSync.existsSync('./data/collections.json')) {
            const fileContent = fsSync.readFileSync('./data/collections.json', 'utf8');
            const data = JSON.parse(fileContent);
            console.log(`📚 Loaded existing collections.json: ${data.collections.length} collections`);
            
            // Create pattern lookup map for fast existence checking
            const patternLookup = new Map();
            data.collections.forEach(collection => {
                collection.patterns.forEach(pattern => {
                    const key = `${collection.name}:${pattern.name}`;
                    patternLookup.set(key, pattern);
                });
            });
            
            console.log(`📋 Created lookup map with ${patternLookup.size} existing patterns`);
            return { data, patternLookup };
        } else {
            console.log('📂 No existing collections.json found, starting fresh');
            return { data: { collections: [] }, patternLookup: new Map() };
        }
    } catch (error) {
        console.error('❌ Error loading existing data:', error);
        return { data: { collections: [] }, patternLookup: new Map() };
    }
}

// Check if pattern already exists
function patternExists(collectionName, patternName, patternLookup) {
    const key = `${collectionName}:${patternName}`;
    return patternLookup.has(key);
}

function normalizePatternKey(value) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function findPatternIndexByIdentity(patterns, candidate) {
    if (!Array.isArray(patterns) || !candidate) return -1;
    const candidateId = normalizePatternKey(candidate.id);
    if (candidateId) {
        const idx = patterns.findIndex((p) => normalizePatternKey(p && p.id) === candidateId);
        if (idx !== -1) return idx;
    }
    const candidateNumber = normalizePatternKey(candidate.number);
    if (candidateNumber) {
        const idx = patterns.findIndex((p) => normalizePatternKey(p && p.number) === candidateNumber);
        if (idx !== -1) return idx;
    }
    const candidateSlug = normalizePatternKey(candidate.slug);
    if (candidateSlug) {
        const idx = patterns.findIndex((p) => normalizePatternKey(p && p.slug) === candidateSlug);
        if (idx !== -1) return idx;
    }
    const candidateName = normalizePatternKey(cleanPatternName(candidate.name || ''));
    if (candidateName) {
        return patterns.findIndex((p) => normalizePatternKey(cleanPatternName((p && p.name) || '')) === candidateName);
    }
    return -1;
}

// All collections configuration
const collections = [
    { name: '1 - ABUNDANCE' },
    { name: '2 - COVERLETS' },
    { name: '3 - ENGLISH COTTAGE' },
    { name: '4 - TRADITIONS' },
    { name: '5 - FARMHOUSE' },
    { name: '6 - BOTANICALS' },
    { name: '7 - DISHED UP' },
    { name: '8 - BOMBAY' },
    { name: '9 - PAGES' },
    { name: '10 - GALLERIA' },
    { name: '13 - ANCIENT TILES' },
    { name: '14 - GEOMETRY' },
    { name: '15 - SILK ROAD' },
    { name: '16 - WALL PANELS' },
    { name: '17 - NEW ORLEANS' },
    { name: '18 - FOLKSIE' },
    { name: '21 - COORDINATES' },
    { name: '22 - IKATS' }
];

async function findNewPatterns(collectionName = null) {
    console.log('\n🔍 Starting incremental pattern detection...');
    
    const { data: existingData, patternLookup } = loadExistingData();
    
    // Filter collections if specific collection requested
    let targetCollections = collections;
    if (collectionName) {
        // Try exact match first, then partial match with flexible formatting
        targetCollections = collections.filter(c => {
            const cleanCollectionName = c.name.toLowerCase().replace(/[^a-z]/g, '');
            const cleanSearchName = collectionName.toLowerCase().replace(/[^a-z]/g, '');
            return cleanCollectionName.includes(cleanSearchName) || 
                   c.name.toLowerCase().includes(collectionName.toLowerCase());
        });
        
        if (!targetCollections.length) {
            console.error(`❌ No collection found matching: ${collectionName}`);
            console.error(`Available collections: ${collections.map(c => c.name).join(', ')}`);
            return { existingData, newPatterns };
        }
        
        console.log(`🎯 Found ${targetCollections.length} matching collections:`, targetCollections.map(c => c.name));
    }

    console.log(`🎯 Checking ${targetCollections.length} collections for new patterns...`);

    for (const collection of targetCollections) {
        const tableName = collection.name;
        const baseName = tableName.split(' - ')[1]?.toLowerCase().replace(/\s+/g, '-') || 
                        tableName.toLowerCase().replace(/\s+/g, '-');
        
        console.log(`\n📊 Processing ${tableName} (${baseName})...`);

        try {
            // Get all records and find placeholder
            const allRecords = await base(tableName).select({}).all();
            const placeholderRecord = allRecords.find(r => 
                (r.get('NUMBER') || '').toLowerCase().endsWith('-000')
            );
            
            if (!placeholderRecord) {
                console.log(`⏭️  No placeholder record found for ${baseName}, skipping`);
                continue;
            }

            // Check if collection is active
            const isActive = placeholderRecord.get('ACTIVE');
            if (!isActive) {
                console.log(`⏭️  Collection ${baseName} not active, skipping`);
                continue;
            }

            // Get active records
            const records = await base(tableName).select({ 
                filterByFormula: "{ACTIVE} = 1" 
            }).all();
            
            console.log(`📝 Found ${records.length} active records in ${tableName}`);

            // Find existing collection or create new one
            let existingCollection = existingData.collections.find(c => c.name === baseName);
            let newPatternsInCollection = [];
            
            // Process each record
            for (const record of records) {
                try {
                    const number = record.get('NUMBER') || '';
                    
                    // Skip placeholder record
                    if (number.toLowerCase().endsWith('-000')) {
                        continue;
                    }

                    const rawName = record.get('NAME') || `${baseName}-pattern`;
                    const parsedPatternName = cleanPatternName(rawName.split(/\s*-\s*/)[1] || rawName);
                    
                    // Check if pattern already exists
                    const existsCheck = patternExists(baseName, parsedPatternName, patternLookup);
                    if (existsCheck) {
                        console.log(`✅ Pattern already exists: ${baseName}:${parsedPatternName}`);
                        continue;
                    }
                    
                    // Debug: Let's see what patterns we're actually checking
                    console.log(`🔍 DEBUG: Checking pattern "${parsedPatternName}" in collection "${baseName}"`);
                    console.log(`🔍 DEBUG: Raw name from Airtable: "${rawName}"`);
                    console.log(`🔍 DEBUG: Pattern lookup key: "${baseName}:${parsedPatternName}"`);
                    
                    // Let's also check what similar patterns exist in this collection
                    const similarPatterns = [];
                    patternLookup.forEach((pattern, key) => {
                        if (key.startsWith(`${baseName}:`)) {
                            similarPatterns.push(key);
                        }
                    });
                    console.log(`🔍 DEBUG: Existing patterns in ${baseName}:`, similarPatterns.slice(0, 5)); // Show first 5

                    console.log(`🆕 NEW PATTERN FOUND: ${baseName}:${parsedPatternName}`);
                    
                    // Build new pattern object
                    const layerAttachments = record.get('LAYER SEPARATIONS') || [];
                    const thumbnailAttachment = (record.get('THUMBNAIL') || [])[0];
                    const size = extractDimensions(thumbnailAttachment?.filename || '');
                    const isColorFlex = record.get('Color-Flex') === true;
                    
                    const fileSafeName = parsedPatternName.toLowerCase().replace(/\s+/g, '-');
                    const thumbnailPath = `./data/collections/${baseName}/thumbnails/${fileSafeName}.jpg`;
                    
                    // Process layers
                    const layerData = [];
                    const layerLabels = [];
                    
                    for (let i = 0; i < layerAttachments.length; i++) {
                        const layerFilename = layerAttachments[i].filename || `${fileSafeName}-layer-${i + 1}.jpg`;
                        const layerPath = `./data/collections/${baseName}/layers/${fileSafeName}_layer-${i + 1}.jpg`;
                        const proofLayerPath = `./data/collections/${baseName}/proof-layers/${fileSafeName}_layer-${i + 1}.jpg`;
                        
                        layerData.push({ path: layerPath, proofPath: proofLayerPath });
                        layerLabels.push(`Layer ${i + 1}`); // Simplified for incremental
                    }

                    // Get designer colors
                    const designerColors = (record.get('DESIGNER COLORS') || "")
                        .split(/[,|.]/)
                        .map(c => c.trim())
                        .filter(Boolean);

                    const newPattern = {
                        id: record.id,
                        number: number,
                        name: parsedPatternName,
                        thumbnail: thumbnailPath,
                        size: size,
                        repeat: record.get('REPEAT TYPE') || "yes",
                        layers: isColorFlex ? layerData : [],
                        layerLabels: isColorFlex ? layerLabels : [],
                        tilingType: thumbnailAttachment?.filename?.toUpperCase().includes("HD") ? "half-drop" : "straight",
                        designer_colors: designerColors,
                        colorFlex: isColorFlex,
                        coordinates: null, // Will be set at collection level
                        baseComposite: null, // Simplified for incremental
                        tintWhite: record.get('tintWhite') === true,
                        updatedAt: new Date().toISOString(),
                        // Store URLs for downloading
                        _downloadUrls: {
                            thumbnail: thumbnailAttachment?.url,
                            layers: layerAttachments.map(l => l.url).filter(Boolean)
                        }
                    };
                    
                    newPatternsInCollection.push(newPattern);
                    newPatterns.totalNewPatterns++;
                    
                } catch (patternError) {
                    console.error(`❌ Error processing pattern in ${baseName}:`, patternError.message);
                }
            }

            // If we found new patterns, add collection to new patterns list
            if (newPatternsInCollection.length > 0) {
                console.log(`🎉 Found ${newPatternsInCollection.length} new patterns in ${baseName}`);
                
                // Create collection structure (copy existing metadata if available)
                const newCollectionData = existingCollection ? 
                    { ...existingCollection, patterns: newPatternsInCollection } :
                    {
                        name: baseName,
                        tableName: tableName,
                        collection_thumbnail: `./data/collections/${baseName}/${baseName}-thumb.jpg`,
                        curatedColors: [], // Will be populated if needed
                        coordinates: null,
                        mockup: "./data/mockups/English-Countryside-Bedroom-1-W60H45.png",
                        mockupShadow: null,
                        mockupWidthInches: 60,
                        mockupHeightInches: 45,
                        patterns: newPatternsInCollection
                    };
                
                newPatterns.collections.push(newCollectionData);
            } else {
                console.log(`✨ No new patterns found in ${baseName}`);
            }

        } catch (collectionError) {
            console.error(`❌ Error processing collection ${tableName}:`, collectionError.message);
        }
    }

    console.log(`\n🎯 Incremental scan complete: ${newPatterns.totalNewPatterns} new patterns found across ${newPatterns.collections.length} collections`);
    
    return { existingData, newPatterns };
}

async function downloadNewPatternImages(newPatternsData, forceDownload = false) {
    console.log('\n📥 Starting downloads for new patterns...');
    
    for (const collection of newPatternsData.collections) {
        const baseName = collection.name;
        console.log(`\n📁 Downloading images for collection: ${baseName}`);
        
        // Create directories
        const dirs = [
            `./data/collections/${baseName}/thumbnails`,
            `./data/collections/${baseName}/layers`,
            `./data/collections/${baseName}/proof-layers`
        ];
        
        for (const dir of dirs) {
            fsSync.mkdirSync(dir, { recursive: true });
        }

        for (const pattern of collection.patterns) {
            console.log(`\n🖼️  Downloading images for: ${pattern.name}`);
            
            try {
                // Download thumbnail
                if (pattern._downloadUrls.thumbnail) {
                    console.log(`📸 Downloading thumbnail...`);
                    await downloadImage(pattern._downloadUrls.thumbnail, pattern.thumbnail, 2800, 3, forceDownload);
                }

                // Download layers
                for (let i = 0; i < pattern._downloadUrls.layers.length; i++) {
                    const layerUrl = pattern._downloadUrls.layers[i];
                    if (layerUrl && pattern.layers[i]) {
                        console.log(`🎨 Downloading layer ${i + 1}...`);
                        
                        // Download proof layer (full resolution)
                        await downloadImage(layerUrl, pattern.layers[i].proofPath, null, 3, forceDownload);
                        
                        // Download working layer (optimized)
                        await downloadImage(layerUrl, pattern.layers[i].path, 1400, 3, forceDownload);
                    }
                }

                // Clean up download URLs (not needed in final JSON)
                delete pattern._downloadUrls;
                
                console.log(`✅ Completed downloads for: ${pattern.name}`);
                
            } catch (downloadError) {
                console.error(`❌ Error downloading images for ${pattern.name}:`, downloadError.message);
            }
        }
    }
    
    console.log(`✅ All downloads completed for ${newPatternsData.totalNewPatterns} new patterns`);
}

async function updateCollectionsJson(existingData, newPatternsData) {
    console.log('\n📝 Updating collections.json with new patterns...');
    
    // Merge new patterns into existing data
    for (const newCollection of newPatternsData.collections) {
        const existingCollectionIndex = existingData.collections.findIndex(
            c => c.name === newCollection.name
        );
        
        if (existingCollectionIndex !== -1) {
            // Upsert patterns into existing collection (replace matching, append only truly new)
            const existingCollection = existingData.collections[existingCollectionIndex];
            let added = 0;
            let updated = 0;
            newCollection.patterns.forEach((incomingPattern) => {
                const idx = findPatternIndexByIdentity(existingCollection.patterns, incomingPattern);
                if (idx >= 0) {
                    existingCollection.patterns[idx] = incomingPattern;
                    updated++;
                } else {
                    existingCollection.patterns.push(incomingPattern);
                    added++;
                }
            });
            
            console.log(`✅ Collection ${newCollection.name}: added ${added}, updated ${updated} patterns`);
        } else {
            // Add entire new collection
            existingData.collections.push(newCollection);
            console.log(`✅ Added new collection: ${newCollection.name} with ${newCollection.patterns.length} patterns`);
        }
    }
    
    // Write updated data back to file
    try {
        const collectionsPath = path.resolve('./data/collections.json');
        fsSync.writeFileSync(collectionsPath, JSON.stringify(existingData, null, 2));
        console.log(`✅ Successfully updated collections.json`);
        
        newPatterns.processedFiles.push({
            type: 'Updated Collections Data',
            path: collectionsPath,
            newPatterns: newPatternsData.totalNewPatterns,
            totalCollections: existingData.collections.length
        });
        
    } catch (error) {
        console.error(`❌ Error writing collections.json:`, error);
        throw error;
    }
}

async function generateIncrementalCSV(newPatternsData) {
    if (newPatternsData.totalNewPatterns === 0) {
        console.log('ℹ️  No new patterns found, skipping CSV generation');
        return;
    }
    
    console.log('\n📊 Generating Shopify CSV for new patterns only...');
    
    try {
        const baseServerUrl = 'https://so-animation.com/colorflex';
        const csvContent = generateShopifyCSV(newPatternsData, baseServerUrl);
        
        // Generate timestamped filename
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const csvFilename = `./deployment/csv/shopify-import-incremental-${timestamp}.csv`;
        
        // Ensure deployment/csv directory exists
        if (!fsSync.existsSync('./deployment/csv')) {
            fsSync.mkdirSync('./deployment/csv', { recursive: true });
        }
        
        fsSync.writeFileSync(csvFilename, csvContent);
        console.log(`✅ Generated incremental CSV: ${csvFilename} with ${newPatternsData.totalNewPatterns} new patterns`);
        
        newPatterns.processedFiles.push({
            type: 'Incremental Shopify CSV',
            path: path.resolve(csvFilename),
            patterns: newPatternsData.totalNewPatterns,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error(`❌ Error generating CSV:`, error);
    }
}

function printIncrementalSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('🔄 INCREMENTAL UPDATE SUMMARY');
    console.log('='.repeat(60));
    
    if (newPatterns.totalNewPatterns === 0) {
        console.log('✨ No new patterns found - all collections are up to date!');
    } else {
        console.log(`🆕 Found ${newPatterns.totalNewPatterns} new patterns across ${newPatterns.collections.length} collections:`);
        
        newPatterns.collections.forEach(collection => {
            console.log(`   📁 ${collection.name}: ${collection.patterns.length} new patterns`);
        });
    }
    
    console.log('\n📁 FILES PROCESSED:');
    newPatterns.processedFiles.forEach(file => {
        console.log(`   ✅ ${file.type}`);
        console.log(`      Path: ${file.path}`);
        if (file.newPatterns) console.log(`      New Patterns: ${file.newPatterns}`);
        if (file.patterns) console.log(`      Total Patterns: ${file.patterns}`);
        if (file.totalCollections) console.log(`      Total Collections: ${file.totalCollections}`);
        console.log('');
    });
    
    console.log('='.repeat(60));
}

// Main incremental update function
async function runIncrementalUpdate(collectionName = null, downloadImages = true, generateCSV = true) {
    console.log('\n🚀 Starting Incremental ColorFlex Update');
    console.log(`   Collection: ${collectionName || 'ALL'}`);
    console.log(`   Download Images: ${downloadImages}`);
    console.log(`   Generate CSV: ${generateCSV}`);
    
    try {
        // Step 1: Find new patterns
        const { existingData, newPatterns: newPatternsData } = await findNewPatterns(collectionName);
        
        // Step 2: Download images for new patterns
        if (downloadImages && newPatternsData.totalNewPatterns > 0) {
            await downloadNewPatternImages(newPatternsData);
        }
        
        // Step 3: Update collections.json
        if (newPatternsData.totalNewPatterns > 0) {
            await updateCollectionsJson(existingData, newPatternsData);
        }
        
        // Step 4: Generate incremental CSV
        if (generateCSV) {
            await generateIncrementalCSV(newPatternsData);
        }
        
        // Step 5: Print summary
        printIncrementalSummary();
        
        console.log('\n✅ Incremental update completed successfully!');
        
        if (newPatternsData.totalNewPatterns > 0 && downloadImages) {
            console.log('\n🚀 Next steps:');
            console.log('   1. Run deployment script to sync images to server');
            console.log('   2. Import the incremental CSV to Shopify');
            console.log('   3. Test new patterns on the website');
        }
        
    } catch (error) {
        console.error('\n❌ Incremental update failed:', error);
        throw error;
    }
}

// Command line interface
const args = process.argv.slice(2);
const collectionName = args[0] === 'all' ? null : args[0];
const downloadImages = args[1] !== 'false';
const generateCSV = args[2] !== 'false';

// Export for use in other modules
module.exports = {
    runIncrementalUpdate,
    findNewPatterns,
    downloadNewPatternImages,
    updateCollectionsJson,
    generateIncrementalCSV
};

// Run if executed directly
if (require.main === module) {
    runIncrementalUpdate(collectionName, downloadImages, generateCSV)
        .catch(err => {
            console.error('❌ Script failed:', err);
            process.exit(1);
        });
}