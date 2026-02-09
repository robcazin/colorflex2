const Airtable = require('airtable');
const fsSync = require('fs');
const https = require('https');
const sharp = require('sharp');
const path = require('path');
const { execSync } = require('child_process');
const fetch = require('node-fetch');

// Ensure paths are relative to project root, not script location
const projectRoot = path.resolve(__dirname, '../..');
process.chdir(projectRoot);
console.log('Working directory set to:', process.cwd());

// Global file tracking
const processedFiles = {
    dataFiles: [],
    csvFiles: [],
    deploymentFiles: []
};

function extractDimensions(filename) {
    const match = filename.match(/(\d+)\s*X\s*(\d+)/i);
    if (match) {
        const width = parseInt(match[1], 10);
        const height = parseInt(match[2], 10);
        return [width, height];
    }
    return [24, 24];
}

const airtable = new Airtable({ apiKey: 'REDACTED_USE_AIRTABLE_PAT_ENV' });
const base = airtable.base('appsywaKYiyKQTnl3');

function cleanPatternName(str) {
    try {
        // Input validation and sanitization
        if (!str || typeof str !== 'string') {
            console.warn(`[CLEAN NAME WARNING] Invalid input: ${typeof str}, returning fallback`);
            return 'Unnamed Pattern';
        }

        const cleanedName = str
            .trim()
            .toLowerCase()
            .replace(/\.\w+$/, '')                           // Remove file extensions
            .replace(/^\d+[a-z]*\s*-\s*/i, '')              // Remove pattern numbers like "110 - "
            .replace(/\s*-\s*\d+x\d+$/i, '')                // Remove dimensions like " - 24X24"
            .replace(/\s*-\s*variant$/i, '')                // Remove -variant suffix
            .replace(/\s*-\s*[a-z\s]+\s+on\s+[a-z\s]+$/i, '') // Remove color descriptions like " - ECRU ON RED PRAIRIE"
            .replace(/\s*-\s*[a-z\s]+\s+and\s+[a-z\s]+$/i, '') // Handle " - COLOR and COLOR" patterns  
            .replace(/\s*-\s*[a-z\s]+\s+over\s+[a-z\s]+$/i, '') // Handle " - COLOR over COLOR" patterns
            .replace(/_/g, ' ')                             // Replace underscores with spaces
            .replace(/\s*-\s*$/, '')                        // Remove trailing " - "
            .split(/[\s-]+/)                                // Split on spaces and hyphens
            .filter(word => word && word.length > 0)        // Remove empty strings and null values
            .map(word => {
                try {
                    return word.charAt(0).toUpperCase() + word.slice(1);
                } catch (e) {
                    console.warn(`[CLEAN NAME WARNING] Error capitalizing word "${word}":`, e.message);
                    return String(word); // Fallback to string conversion
                }
            })
            .join(" ");                                     // Join with spaces

        // Final validation - ensure we have a reasonable result
        if (!cleanedName || cleanedName.trim().length === 0) {
            console.warn(`[CLEAN NAME WARNING] Empty result from "${str}", using fallback`);
            return 'Unnamed Pattern';
        }

        // Warn about suspicious results that might indicate data quality issues
        if (cleanedName.length > 100) {
            console.warn(`[CLEAN NAME WARNING] Very long pattern name (${cleanedName.length} chars): "${cleanedName.substring(0, 50)}..."`);
        }

        return cleanedName;

    } catch (error) {
        console.error(`[CLEAN NAME ERROR] Failed to process pattern name "${str}":`, error.message);
        console.error(`[CLEAN NAME ERROR] Using fallback name for problematic input`);
        return 'Unnamed Pattern';
    }
}

// Parse pattern number components (e.g., "01-01-101A" -> {category: "01", collection: "01", pattern: "101", variant: "A"})
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
    
    // Fallback for non-standard formats
    return { category: '', collection: '', pattern: '', variant: '', full: numberString };
}

/**
 * Load Shopify credentials from config file or environment variables
 */
function loadShopifyCredentials() {
    // Try .env file first (if dotenv is available)
    let shopifyStore = process.env.SHOPIFY_STORE || process.env.SHOPIFY_STORE_URL;
    let shopifyToken = process.env.SHOPIFY_ACCESS_TOKEN;
    
    // If not in .env, try config/shopify.json
    if (!shopifyStore || !shopifyToken) {
        try {
            const configPath = path.join(projectRoot, 'config', 'shopify.json');
            if (fsSync.existsSync(configPath)) {
                const config = JSON.parse(fsSync.readFileSync(configPath, 'utf8'));
                // Use production by default, or test if specified
                const env = process.env.SHOPIFY_ENV || 'production';
                const shopifyConfig = config[env] || config.production;
                
                if (shopifyConfig) {
                    shopifyStore = shopifyStore || shopifyConfig.store;
                    // Note: Access token should be in .env for security, not in config file
                    // But we'll check if it's there as fallback
                    shopifyToken = shopifyToken || shopifyConfig.access_token;
                }
            }
        } catch (error) {
            console.warn('[SHOPIFY] Could not load config file:', error.message);
        }
    }
    
    // Remove https:// and .myshopify.com if present
    if (shopifyStore) {
        shopifyStore = shopifyStore.replace(/^https?:\/\//, '').replace(/\.myshopify\.com$/, '');
    }
    
    return { shopifyStore, shopifyToken };
}

/**
 * Upload image to Shopify Files API
 * @param {string} imagePath - Local path to image file
 * @param {string} shopifyStore - Shopify store name (without .myshopify.com)
 * @param {string} shopifyToken - Shopify Admin API access token
 * @returns {Promise<string>} Shopify-hosted image URL
 */
async function uploadImageToShopifyFiles(imagePath, shopifyStore, shopifyToken) {
    try {
        if (!fsSync.existsSync(imagePath)) {
            throw new Error(`Image file not found: ${imagePath}`);
        }
        
        // Read image file
        const imageBuffer = fsSync.readFileSync(imagePath);
        const imageBase64 = imageBuffer.toString('base64');
        
        // Determine content type from file extension
        const ext = path.extname(imagePath).toLowerCase();
        const contentTypeMap = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        };
        const contentType = contentTypeMap[ext] || 'image/jpeg';
        
        // Upload to Shopify Files API
        const url = `https://${shopifyStore}.myshopify.com/admin/api/2025-01/files.json`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': shopifyToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                file: {
                    attachment: imageBase64,
                    filename: path.basename(imagePath),
                    content_type: contentType
                }
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Shopify API error ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        const shopifyUrl = data.file.url;
        
        console.log(`[SHOPIFY UPLOAD] ✅ Uploaded ${path.basename(imagePath)} to Shopify Files`);
        return shopifyUrl;
        
    } catch (error) {
        console.error(`[SHOPIFY UPLOAD] ❌ Error uploading ${imagePath}:`, error.message);
        throw error;
    }
}

async function generateShopifyCSV(collectionsData, baseServerUrl, shopifyStore = null, shopifyToken = null) {
    const csvRows = [];
    
    // Load Shopify credentials if not provided
    if (!shopifyStore || !shopifyToken) {
        const credentials = loadShopifyCredentials();
        shopifyStore = shopifyStore || credentials.shopifyStore;
        shopifyToken = shopifyToken || credentials.shopifyToken;
    }
    
    const shouldUploadToShopify = shopifyStore && shopifyToken;
    
    if (shouldUploadToShopify) {
        console.log(`[CSV] Shopify upload enabled - images will be uploaded to Shopify Files`);
    } else {
        console.log(`[CSV] ⚠️  Shopify credentials not found - using external URLs (thumbnails may not display in CSV import)`);
        console.log(`[CSV] Set SHOPIFY_STORE and SHOPIFY_ACCESS_TOKEN in .env or config/shopify.json`);
    }
    
    // ✅ EXACT Shopify Official CSV Headers (2025) - No manual mapping required
    // Using product.metafields.namespace.key format for automatic metafield recognition
    const headers = [
        'Handle',
        'Title', 
        'Body (HTML)',
        'Vendor',
        'Product Category',
        'Type',
        'Tags',
        'Published',
        'Option1 Name',
        'Option1 Value',
        'Variant SKU',
        'Variant Price',
        'Variant Compare At Price',
        'Variant Requires Shipping',
        'Variant Taxable',
        'Variant Barcode',
        'Variant Inventory Tracker',
        'Variant Inventory Policy',
        'Variant Inventory Qty',
        'Image Src',
        'Image Position',
        'Image Alt Text',
        'SEO Title',
        'SEO Description',
        'product.metafields.color_flex.base_url',
        'product.metafields.color_flex.collection',
        'product.metafields.color_flex.pattern',
        'product.metafields.color_flex.layer_count',
        'product.metafields.color_flex.layer_labels',
        'product.metafields.color_flex.pattern_size',
        'product.metafields.color_flex.tiling_type',
        'product.metafields.color_flex.designer_colors',
        'product.metafields.color_flex.pattern_number',
        'product.metafields.color_flex.collection_sequence',
        'product.metafields.color_flex.pattern_sequence',
        'product.metafields.color_flex.pattern_variant'
    ];
    
    csvRows.push(headers);
    
    // Use for...of loops to properly handle async operations
    for (const collection of collectionsData.collections) {
        // Process ALL patterns, but distinguish between ColorFlex and Standard
        const allPatterns = collection.patterns;
        const colorFlexCount = allPatterns.filter(p => p.colorFlex === true).length;
        const standardCount = allPatterns.length - colorFlexCount;
        
        console.log(`[CSV] Collection ${collection.name}: ${colorFlexCount} ColorFlex + ${standardCount} Standard = ${allPatterns.length} total patterns`);
        
        for (let index = 0; index < allPatterns.length; index++) {
            const pattern = allPatterns[index];
            try {
                // Validate pattern data before processing
                if (!pattern.name || typeof pattern.name !== 'string') {
                    console.warn(`[CSV WARNING] Invalid pattern name in collection ${collection.name}, pattern #${index + 1}:`, pattern.name);
                    pattern.name = `Pattern ${index + 1}`;
                }

                // Safe handle generation with error handling
                let handle, patternFileName;
                try {
                    handle = `${collection.name}-${pattern.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
                    patternFileName = pattern.name.toLowerCase().replace(/\s+/g, '-');
                } catch (nameError) {
                    console.warn(`[CSV WARNING] Error processing pattern name "${pattern.name}":`, nameError.message);
                    const fallbackName = `pattern-${index + 1}`;
                    handle = `${collection.name}-${fallbackName}`;
                    patternFileName = fallbackName;
                }
                
                // Parse pattern number components with error handling
                const numberData = parsePatternNumber(pattern.number);
                
                // Determine thumbnail path - check thumbnails-shopify first, then thumbnails
                const thumbnailShopifyPath = path.join(projectRoot, 'data', 'collections', collection.name, 'thumbnails-shopify', `${patternFileName}.jpg`);
                const thumbnailPath = path.join(projectRoot, 'data', 'collections', collection.name, 'thumbnails', `${patternFileName}.jpg`);
                
                let thumbnailUrl;
                
                // Try to upload to Shopify Files if credentials are available
                if (shouldUploadToShopify) {
                    try {
                        // Check thumbnails-shopify first, then thumbnails
                        let localThumbnailPath = null;
                        if (fsSync.existsSync(thumbnailShopifyPath)) {
                            localThumbnailPath = thumbnailShopifyPath;
                        } else if (fsSync.existsSync(thumbnailPath)) {
                            localThumbnailPath = thumbnailPath;
                        }
                        
                        if (localThumbnailPath) {
                            // Upload to Shopify Files
                            thumbnailUrl = await uploadImageToShopifyFiles(localThumbnailPath, shopifyStore, shopifyToken);
                            console.log(`[CSV] ✅ Using Shopify-hosted URL for ${pattern.name}`);
                            
                            // Rate limiting - Shopify allows 2 requests per second
                            await new Promise(resolve => setTimeout(resolve, 550));
                        } else {
                            console.warn(`[CSV] ⚠️  Thumbnail not found locally for ${pattern.name}, using external URL`);
                            thumbnailUrl = `${baseServerUrl}/data/collections/${collection.name}/thumbnails/${patternFileName}.jpg`;
                        }
                    } catch (uploadError) {
                        console.error(`[CSV] ❌ Failed to upload thumbnail for ${pattern.name}:`, uploadError.message);
                        // Fallback to external URL
                        thumbnailUrl = `${baseServerUrl}/data/collections/${collection.name}/thumbnails/${patternFileName}.jpg`;
                    }
                } else {
                    // No credentials - use external URL
                    thumbnailUrl = `${baseServerUrl}/data/collections/${collection.name}/thumbnails/${patternFileName}.jpg`;
                }
            
            // Determine product type based on ColorFlex flag
            const isColorFlex = pattern.colorFlex === true;

            // Check for custom category (e.g., Clothing for CLO collections)
            const productType = pattern.category === 'Clothing' ? 'Clothing' : (isColorFlex ? 'ColorFlex Pattern' : 'Standard Pattern');
            const productCategory = 'Home & Garden > Decor';
            
            // Different tags based on pattern type
            // Include collection name as first tag for smart collection filtering
            const baseTags = `${collection.name}, pattern, wallpaper, fabric`;
            const tags = isColorFlex 
                ? `${baseTags}, removable, custom-color, colorflex`
                : `${baseTags}, standard`;
            
            // Generate SEO-optimized content
            const seoTitle = `${pattern.name} - ${collection.name.charAt(0).toUpperCase() + collection.name.slice(1)} Collection | ColorFlex Wallpaper`;
            const seoDescription = `${pattern.name} pattern from our ${collection.name.charAt(0).toUpperCase() + collection.name.slice(1)} collection. ${isColorFlex ? 'Customize colors to match your space perfectly with our ColorFlex system.' : 'Classic design available in standard colorways.'} Available for wallpaper, fabric, and other applications.`;
            
            // Create multiple variants for different applications
            const variants = [
                {
                    name: 'Wallpaper',
                    sku: 'wallpaper',
                    price: '89.99',
                    description: 'Professional-grade removable wallpaper. Easy to install and remove without damage.'
                },
                {
                    name: 'Fabric',
                    sku: 'fabric',
                    price: '79.99',
                    description: 'High-quality fabric suitable for upholstery, curtains, and decor projects.'
                },
                {
                    name: 'Removable Decal',
                    sku: 'decal',
                    price: '69.99',
                    description: 'Removable vinyl decal perfect for temporary decoration and rental spaces.'
                }
            ];

            for (let variantIndex = 0; variantIndex < variants.length; variantIndex++) {
                const variant = variants[variantIndex];
                const row = [
                    handle, // Handle (same for all variants)
                    pattern.name, // Title (same for all variants)
                    `<p>${pattern.name} pattern from our ${collection.name.charAt(0).toUpperCase() + collection.name.slice(1)} collection. ${numberData.full ? `Pattern #${numberData.full}. ` : ''}${isColorFlex ? 'Customize colors to match your space perfectly with our ColorFlex system.' : 'Classic design available in standard colorways.'} Available as ${variant.description}</p>`, // Body HTML
                    'Saffron Cottage', // Vendor
                    productCategory, // Product Category
                    productType, // Type
                    tags, // Tags
                    'TRUE', // Published
                    'Application', // Option1 Name
                    variant.name, // Option1 Value (Wallpaper, Fabric, Removable Decal)
                    `${numberData.full || handle}-${variant.sku}`, // Variant SKU
                    variant.price, // Variant Price
                    '', // Variant Compare At Price
                    'TRUE', // Variant Requires Shipping
                    'TRUE', // Variant Taxable
                    '', // Variant Barcode
                    '', // Variant Inventory Tracker (empty = no inventory tracking)
                    'continue', // Variant Inventory Policy (continue selling when out of stock)
                    '', // Variant Inventory Qty (empty = no inventory tracking)
                    thumbnailUrl, // Image Src (only for first variant)
                    variantIndex === 0 ? '1' : '', // Image Position (only for first variant)
                    variantIndex === 0 ? `${pattern.name} pattern thumbnail` : '', // Image Alt Text (only for first variant)
                    seoTitle, // SEO Title
                    seoDescription, // SEO Description
                    baseServerUrl + '/data/collections/', // Metafield: color_flex.base_url [url]
                    collection.name, // Metafield: color_flex.collection [single_line_text_field]
                    patternFileName, // Metafield: color_flex.pattern [single_line_text_field]
                    pattern.layers.length.toString(), // Metafield: color_flex.layer_count [number_integer]
                    pattern.layerLabels.join(','), // Metafield: color_flex.layer_labels [single_line_text_field]
                    `${pattern.size[0]}x${pattern.size[1]}`, // Metafield: color_flex.pattern_size [single_line_text_field]
                    pattern.tilingType || 'straight', // Metafield: color_flex.tiling_type [single_line_text_field]
                    pattern.designer_colors.join(','), // Metafield: color_flex.designer_colors [single_line_text_field]
                    numberData.full, // Metafield: color_flex.pattern_number [single_line_text_field]
                    numberData.collection, // Metafield: color_flex.collection_sequence [single_line_text_field]
                    numberData.pattern, // Metafield: color_flex.pattern_sequence [single_line_text_field]
                    numberData.variant // Metafield: color_flex.pattern_variant [single_line_text_field]
                ];
                
                csvRows.push(row);
            }
            
            } catch (csvError) {
                console.error(`[CSV ERROR] Failed to process pattern "${pattern.name}" in collection ${collection.name}:`, csvError.message);
                console.warn(`[CSV ERROR] Skipping problematic pattern and continuing...`);
                
                // Create a minimal fallback row so the CSV isn't completely broken
                const fallbackHandle = `${collection.name}-error-pattern-${index + 1}`;
                const fallbackRow = [
                    fallbackHandle, // Handle
                    `Error Pattern ${index + 1}`, // Title
                    '<p>Pattern data could not be processed due to an error.</p>', // Body HTML
                    'Saffron Cottage', // Vendor
                    'Home & Garden > Decor', // Product Category
                    'Error Pattern', // Type
                    `${collection.name}, error`, // Tags
                    'FALSE', // Published - don't publish error patterns
                    ...Array(40).fill('') // Fill remaining columns with empty values
                ];
                csvRows.push(fallbackRow);
            }
        }
    }
    
    // Convert to CSV string
    const csvContent = csvRows.map(row => 
        row.map(field => `"${String(field || '').replace(/"/g, '""')}"`)
           .join(',')
    ).join('\n');
    
    return csvContent;
}

// Generate a blank Shopify CSV template for reference (eliminates column mapping)
function generateShopifyTemplate() {
    const headers = [
        'Handle',
        'Title', 
        'Body (HTML)',
        'Vendor',
        'Product Category',
        'Type',
        'Tags',
        'Published',
        'Option1 Name',
        'Option1 Value',
        'Variant SKU',
        'Variant Price',
        'Variant Compare At Price',
        'Variant Requires Shipping',
        'Variant Taxable',
        'Variant Barcode',
        'Variant Inventory Tracker',
        'Variant Inventory Policy',
        'Variant Inventory Qty',
        'Image Src',
        'Image Position',
        'Image Alt Text',
        'SEO Title',
        'SEO Description',
        'Metafield: color_flex.base_url',
        'Metafield: color_flex.collection',
        'Metafield: color_flex.pattern',
        'Metafield: color_flex.layer_count',
        'Metafield: color_flex.layer_labels',
        'Metafield: color_flex.pattern_size',
        'Metafield: color_flex.tiling_type',
        'Metafield: color_flex.designer_colors',
        'Metafield: color_flex.pattern_number',
        'Metafield: color_flex.collection_sequence',
        'Metafield: color_flex.pattern_sequence',
        'Metafield: color_flex.pattern_variant'
    ];
    
    // Add example row showing data format
    const exampleRow = [
        'example-pattern-handle',
        'Example Pattern Name',
        '<p>Example pattern description with HTML formatting.</p>',
        'Saffron Cottage',
        'Home & Garden > Decor',
        'ColorFlex Pattern',
        'collection-name, pattern, wallpaper, fabric, removable, custom-color, colorflex',
        'TRUE',
        'Application',
        'Pattern',
        '01-01-101A',
        '89.99',
        '',
        'TRUE',
        'TRUE',
        '',
        '',
        'continue',
        '',
        'https://example.com/image.jpg',
        '1',
        'Pattern thumbnail alt text',
        'Pattern Name - Collection | ColorFlex Wallpaper',
        'SEO description for pattern...',
        'https://example.com/data/collections/',
        'collection-name',
        'pattern-file-name',
        '2',
        'Layer 1,Layer 2',
        '24x24',
        'straight',
        'Color1,Color2',
        '01-01-101A',
        '01',
        '101',
        'A'
    ];
    
    const csvContent = [headers, exampleRow]
        .map(row => row.map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(','))
        .join('\n');
    
    return csvContent;
}


async function downloadImage(url, destPath, maxDimension = 2800, retries = 3, forceDownload = false) {
    // Check if file already exists (for incremental updates) - skip if force download is enabled
    if (!forceDownload && fsSync.existsSync(destPath)) {
        try {
            const metadata = await sharp(destPath).metadata();
            console.log(`[SKIP] File exists: ${destPath} (${metadata.width}x${metadata.height})`);
            return metadata;
        } catch (err) {
            console.log(`[EXISTING ERROR] Corrupted file detected, re-downloading: ${destPath}`);
            // Continue with download if existing file is corrupted
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
            if (maxDimension && (metadata.width !== maxDimension || metadata.height !== maxDimension)) {
                // Resize needed - either downscale (too large) or upscale (too small) to match maxDimension
                const aspectRatio = metadata.width / metadata.height;
                const [targetWidth, targetHeight] = metadata.width > metadata.height
                    ? [maxDimension, Math.round(maxDimension / aspectRatio)]
                    : [Math.round(maxDimension * aspectRatio), maxDimension];
                const tempPath = `${destPath}.tmp`;
                await sharp(destPath)
                    .resize(targetWidth, targetHeight, { fit: 'inside', withoutEnlargement: false }) // Allow upscaling
                    .jpeg({ quality: 90 })
                    .toFile(tempPath);
                fsSync.renameSync(tempPath, destPath);
                const action = (metadata.width > maxDimension || metadata.height > maxDimension) ? 'Downscaled' : 'Upscaled';
                console.log(`[RESIZE] ${action} to ${targetWidth}x${targetHeight}`);
            }
            return metadata;
        } catch (err) {
            console.error(`[DOWNLOAD ERROR] Attempt ${attempt} failed for ${destPath}: ${err.message}`);
            if (attempt === retries) throw err;
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        }
    }
}

function parseFileName(filename, layerIndex, patternNameOverride = null) {
    const withoutExtension = filename.replace(/\.jpg$/i, '');
    const parts = withoutExtension.split(" - ").filter(Boolean);

    console.log(`Parsing filename: ${filename}, patternNameOverride: ${patternNameOverride}`);
    console.log(`Parts: ${parts}`);

    // Use patternNameOverride if provided, otherwise fall back to the second part
    const patternName = patternNameOverride || (parts.length > 1 ? cleanPatternName(parts[1]) : `Pattern${layerIndex + 1}`);
    console.log(`Pattern name: ${patternName}`);

    // Layer label is the third part (index 2)
    const layerLabelRaw = parts.length > 2 ? parts[2] : `Unnamed Layer`;
    let layerLabel = layerLabelRaw
        .split(/[\s-]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .trim();

    // Special case for shadows
    if (layerLabelRaw.toUpperCase().includes("ISSHADOW") || layerLabelRaw.toUpperCase().includes("SHADOW")) {
        layerLabel = "Shadows";
        console.log(`Applied shadow special case: ${layerLabel}`);
    }

    // Construct filename with pattern name and raw layer label
    const normalizedFileName = [
        patternName.toLowerCase().replace(/\s+/g, '-'),
        layerLabelRaw.toLowerCase().replace(/\s+/g, '-'),
        `layer-${layerIndex + 1}`
    ].filter(Boolean).join('_').replace(/_+/g, '_');

    console.log(`Result: Pattern: ${patternName}, Label: ${layerLabel}, File: ${normalizedFileName}`);
    return { patternName, layerFileName: normalizedFileName, layerLabel };
}

function parseMockupDimensions(filename) {
    const match = filename.match(/W(\d+)H(\d+)/i);
    return match ? { widthInches: parseInt(match[1]), heightInches: parseInt(match[2]) } : { widthInches: 60, heightInches: 45 };
}

function cleanLayerFilename(filename, coordinateName, index) {
    // Clean the coordinate name (e.g., "TRESSELWOOD" -> "tresselwood")
    const cleanCoordName = coordinateName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

    // Extract the layer label from the filename (e.g., "BACK" or "FRONT")
    const parts = filename.toLowerCase().split(' - ');
    const label = parts.length > 1 ? parts[1].replace(/[^a-z0-9]/g, '') : `layer${index + 1}`;

    // Construct the cleaned filename
    return `${cleanCoordName}_${label}_layer-${index + 1}.jpg`;
}

/**
 * Simplified incremental pattern fetcher - User's suggested approach
 * 1. Fetch ONLY pattern names from Airtable (ACTIVE=1)
 * 2. Compare with existing collections.json to find NEW names
 * 3. Fetch full data ONLY for NEW patterns
 * This bypasses coordinate filtering issues entirely
 */
async function fetchNewPatternsOnly(collectionName, existingPatterns) {
    console.log(`\n[INCREMENTAL] Starting simplified name-first approach for ${collectionName}`);

    // Map collection name to table name
    const tableMapping = {
        'abundance': '1 - ABUNDANCE',
        'coverlets': '2 - COVERLETS',
        'english-cottage': '3 - ENGLISH COTTAGE',
        'traditions': '4 - TRADITIONS',
        'farmhouse': '5 - FARMHOUSE',
        'botanicals': '6 - BOTANICALS',
        'dished-up': '7 - DISHED UP',
        'bombay': '8 - BOMBAY',
        'pages': '9 - PAGES',
        'galleria': '10 - GALLERIA',
        'ancient-tiles': '13 - ANCIENT TILES',
        'geometry': '14 - GEOMETRY',
        'silk-road': '15 - SILK ROAD',
        'wall-panels': '16 - WALL PANELS',
        'new-orleans': '17 - NEW ORLEANS',
        'folksie': '18 - FOLKSIE',
        'ikats': '22 - IKATS'
    };

    const tableName = tableMapping[collectionName.toLowerCase()];
    if (!tableName) {
        console.error(`[INCREMENTAL] Unknown collection: ${collectionName}`);
        return [];
    }

    console.log(`[INCREMENTAL] Fetching from table: ${tableName}`);

    // Step 1: Fetch ALL records with ACTIVE=1 (names only, minimal data)
    console.log(`[INCREMENTAL] Step 1: Fetching pattern names from Airtable...`);
    const allRecords = await base(tableName).select({
        filterByFormula: "{ACTIVE} = 1",
        fields: ['NUMBER', 'NAME'] // Only fetch what we need for comparison
    }).all();

    console.log(`[INCREMENTAL] Found ${allRecords.length} ACTIVE records in Airtable`);

    // Build set of existing pattern names (cleaned)
    const existingNames = new Set(
        existingPatterns.map(p => cleanPatternName(p.name).toLowerCase())
    );

    console.log(`[INCREMENTAL] Existing patterns in collections.json (${existingNames.size}):`);
    existingPatterns.forEach(p => {
        console.log(`  - ${p.name} → cleaned: "${cleanPatternName(p.name)}"`);
    });

    // Step 2: Compare and find NEW pattern names
    console.log(`\n[INCREMENTAL] Step 2: Comparing to find NEW patterns...`);
    const newPatternRecords = [];

    for (const record of allRecords) {
        const number = record.get('NUMBER') || '';
        const rawName = record.get('NAME') || '';

        // Skip master record
        if (number.toLowerCase().endsWith('-000')) {
            console.log(`[INCREMENTAL SKIP] ${number} (master record)`);
            continue;
        }

        // Extract pattern name using same logic as main fetcher
        const nameParts = rawName.split(/\s*-\s*/);
        const parsedName = nameParts.length > 1 ? cleanPatternName(nameParts[1]) : cleanPatternName(rawName);
        const cleanedName = cleanPatternName(parsedName).toLowerCase();

        const isNew = !existingNames.has(cleanedName);

        console.log(`  ${number}: ${rawName}`);
        console.log(`    → Parsed: "${parsedName}" → Cleaned: "${cleanedName}"`);
        console.log(`    → ${isNew ? '✨ NEW - will fetch full data' : '(exists - skip)'}`);

        if (isNew) {
            newPatternRecords.push({ number, rawName, parsedName, recordId: record.id });
        }
    }

    console.log(`\n[INCREMENTAL] Found ${newPatternRecords.length} NEW patterns to add`);

    if (newPatternRecords.length === 0) {
        console.log(`[INCREMENTAL] No new patterns found - nothing to add`);
        return [];
    }

    // Step 3: Fetch full data ONLY for NEW patterns
    console.log(`\n[INCREMENTAL] Step 3: Fetching full data for NEW patterns only...`);
    const newPatterns = [];

    for (const newPattern of newPatternRecords) {
        console.log(`\n[INCREMENTAL FETCH] Getting full data for: ${newPattern.rawName} (${newPattern.number})`);

        try {
            // Fetch the full record with all fields
            const fullRecord = await base(tableName).find(newPattern.recordId);

            // Process this record using the same logic as main fetcher
            const layerAttachments = fullRecord.get('LAYER SEPARATIONS') || [];
            const thumbnail = fullRecord.get('THUMBNAIL')?.[0];
            const size = extractDimensions(thumbnail?.filename || '');
            const tilingType = (fullRecord.get('TILING') || 'straight').toLowerCase();

            const pattern = {
                name: newPattern.parsedName,
                number: newPattern.number,
                size: size,
                tilingType: tilingType,
                layers: layerAttachments.map((attachment, index) => {
                    const layerFilename = cleanLayerFilename(
                        attachment.filename || `${newPattern.parsedName}_layer-${index + 1}.jpg`,
                        newPattern.parsedName,
                        index
                    );
                    return {
                        name: `Layer ${index + 1}`,
                        url: attachment.url,
                        filename: layerFilename
                    };
                })
            };

            if (thumbnail) {
                pattern.thumbnail = {
                    url: thumbnail.url,
                    filename: `${newPattern.parsedName.toLowerCase().replace(/\s+/g, '-')}.jpg`
                };
            }

            newPatterns.push(pattern);
            console.log(`[INCREMENTAL FETCH] ✅ Successfully processed ${newPattern.parsedName} (${layerAttachments.length} layers)`);

        } catch (error) {
            console.error(`[INCREMENTAL ERROR] Failed to fetch full data for ${newPattern.rawName}:`, error.message);
        }
    }

    console.log(`\n[INCREMENTAL] Successfully fetched ${newPatterns.length} new patterns`);
    return newPatterns;
}

/**
 * Dynamically discover all collection tables from Airtable base
 * @returns {Promise<Array>} Array of collection objects with name property
 */
async function getCollectionsFromAirtable() {
    try {
        // Fetch base schema using Airtable Meta API
        const https = require('https');

        const options = {
            hostname: 'api.airtable.com',
            path: `/v0/meta/bases/${base._base._id}/tables`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${airtable._apiKey}`
            }
        };

        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        if (response.tables) {
                            // Filter for collection tables (pattern: "# - NAME" or "## - NAME")
                            const collections = response.tables
                                .map(t => t.name)
                                .filter(name => /^\d{1,2}\s*-\s*.+/.test(name))
                                .map(name => ({ name }))
                                .sort((a, b) => {
                                    // Sort by collection number
                                    const numA = parseInt(a.name.match(/^(\d+)/)[1]);
                                    const numB = parseInt(b.name.match(/^(\d+)/)[1]);
                                    return numA - numB;
                                });

                            console.log(`[AUTO-DISCOVERY] Found ${collections.length} collection tables in Airtable`);
                            resolve(collections);
                        } else {
                            console.warn('[AUTO-DISCOVERY] No tables found in response, using fallback');
                            resolve(getFallbackCollections());
                        }
                    } catch (err) {
                        console.error('[AUTO-DISCOVERY] Error parsing response:', err.message);
                        resolve(getFallbackCollections());
                    }
                });
            });

            req.on('error', (err) => {
                console.error('[AUTO-DISCOVERY] Failed to fetch from Airtable:', err.message);
                console.log('[AUTO-DISCOVERY] Using fallback collection list');
                resolve(getFallbackCollections());
            });

            req.end();
        });
    } catch (error) {
        console.error('[AUTO-DISCOVERY] Error in getCollectionsFromAirtable:', error.message);
        return getFallbackCollections();
    }
}

/**
 * Fallback hardcoded collection list (used if API fails)
 * @returns {Array} Array of collection objects
 */
function getFallbackCollections() {
    return [
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
        { name: '11 - COTTAGE SKETCH BOOK' },
        { name: '12 - OCEANA' },
        { name: '13 - ANCIENT TILES' },
        { name: '14 - GEOMETRY' },
        { name: '15 - SILK ROAD' },
        { name: '16 - WALL PANELS' },
        { name: '17 - NEW ORLEANS' },
        { name: '18 - FOLKSIE' },
        { name: '21 - COORDINATES' }, // Background data only - not displayed as products
        { name: '22 - IKATS' }
    ];
}

async function fetchCollectionData(collectionName = null) {

// Dynamically discover collections from Airtable (with fallback to hardcoded list)
const collections = await getCollectionsFromAirtable();
    // Read existing collections.json
    let existingData = { collections: [] };
    try {
        if (fsSync.existsSync('./data/collections.json')) {
            const fileContent = fsSync.readFileSync('./data/collections.json', 'utf8');
            existingData = JSON.parse(fileContent);
            console.log("Loaded existing collections.json:", existingData.collections.map(c => c.name));
        }
    } catch (error) {
        console.error("Error reading collections.json, starting with empty data:", error);
    }

    // Filter collections if collectionName is specified
    let targetCollections = collections;
    if (collectionName) {
        // Normalize for matching: remove spaces, hyphens, and lowercase
        const normalizedSearchName = collectionName.toLowerCase().replace(/[\s-]/g, '');
        targetCollections = collections.filter(c => {
            const normalizedCollectionName = c.name.toLowerCase().replace(/[\s-]/g, '');
            return normalizedCollectionName.includes(normalizedSearchName);
        });
        if (!targetCollections.length) {
            console.error(`No collection found matching: ${collectionName}`);
            return existingData;
        }
        console.log(`Processing single collection: ${collectionName}`);
        console.log(`Matched collections:`, targetCollections.map(c => c.name));
    }

    console.log("Starting fetchCollectionData...");
    console.log("Input collections:", targetCollections);

    if (!targetCollections || targetCollections.length === 0) {
        console.error("No collections to process");
        return existingData;
    }

    // Fetch coordinates from 21 - COORDINATES table
    // NOTE: Coordinates are not displayed as products to customers, only used for matching function in app
    let coordinateRecords = [];
    try {
        coordinateRecords = await base('21 - COORDINATES').select({ filterByFormula: "{ACTIVE} = 1" }).all();
        console.log(`Fetched ${coordinateRecords.length} ACTIVE coordinate records from 21 - COORDINATES (background data only)`);
    } catch (error) {
        console.error("Error fetching coordinate records:", error);
    }

    const coordinateData = coordinateRecords.map(record => {
        const rawName = record.get('NAME') || '';
        const filename = rawName
            .toLowerCase()
            .replace(/[^a-z0-9\s-.]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/\.jpg$/i, '')
            || '';
        const thumbnailUrl = record.get('THUMBNAIL')?.[0]?.url || '';
        const layerAttachments = record.get('LAYER SEPARATIONS') || [];
    
        // Process all layers in LAYER SEPARATIONS
        const layerPaths = layerAttachments.map((attachment, index) => {
            const layerFilename = cleanLayerFilename(attachment.filename || `${filename}_layer-${index + 1}.jpg`, filename, index);
            return `./data/collections/coordinates/layers/${layerFilename}`;
        });
    
        console.log(`Coordinate record: rawName="${rawName}", cleaned="${filename}", layers=`, layerPaths);
    
        return {
            filename,
            thumbnailPath: thumbnailUrl ? `./data/collections/coordinates/thumbnails/${filename}.jpg` : null,
            layerPaths: layerPaths.length > 0 ? layerPaths : null // Array of layer paths
        };
    }).filter(coord => coord.thumbnailPath && coord.layerPaths && coord.layerPaths.length > 0);
    
    console.log("Processed coordinate data:", coordinateData);

    for (const collection of targetCollections) {
        console.log(`\n[COLLECTION CHECK] Processing ${collection.name}`);
        
        const tableName = collection.tableName || collection.name;
        const baseName = tableName.split(' - ')[1]?.toLowerCase().replace(/\s+/g, '-') || tableName.toLowerCase().replace(/\s+/g, '-');
        console.log(`[START] Processing ${tableName} (baseName: ${baseName})`);

        try {
            // First, fetch all records to find the placeholder
            console.log(`[FETCH] Getting all records from ${tableName}...`);
            const allRecords = await base(tableName).select({}).all();
            console.log(`[FETCH] Found ${allRecords.length} total records in ${tableName}`);
            
            // Find placeholder record
            const placeholderRecord = allRecords.find(r => (r.get('NUMBER') || '').toLowerCase().endsWith('-000'));
            
            if (!placeholderRecord) {
                console.warn(`[SKIP] No placeholder record (-000) found for ${baseName}`);
                continue;
            }

            console.log(`[PLACEHOLDER] Found placeholder record: ${placeholderRecord.get('NUMBER')}`);

            // Check ACTIVE field on the master record (controls Shopify inclusion)
            const isActive = placeholderRecord.get('ACTIVE');
            console.log(`[ACTIVE] Field value for ${baseName}: ${isActive} (type: ${typeof isActive})`);
            
            if (!isActive) {
                console.log(`[SKIP] ACTIVE is not enabled for ${baseName} - enable it on the master record (${placeholderRecord.get('NUMBER')})`);
                continue;
            }

            console.log(`[PROCEED] ACTIVE is enabled for ${baseName}, proceeding...`);

            // Now get ACTIVE records (Color-Flex field is now just metadata)
            console.log(`[FETCH] Getting ACTIVE records for ${tableName}...`);
            const records = await base(tableName).select({ filterByFormula: "{ACTIVE} = 1" }).all();
            console.log(`[FETCH] Found ${records.length} ACTIVE records for ${tableName}`);
            
            // Debug: Show all records and their ACTIVE/Color-Flex status
            console.log(`[DEBUG ALL RECORDS] Checking ACTIVE/Color-Flex status for all records in ${tableName}:`);
            for (const record of allRecords) {
                const number = record.get('NUMBER') || 'no-number';
                const name = record.get('NAME') || 'no-name';
                const isActive = record.get('ACTIVE');
                const colorFlex = record.get('Color-Flex');
                const hasLayers = (record.get('LAYER SEPARATIONS') || []).length > 0;
                console.log(`  - ${number}: ${name.substring(0, 30)}... | ACTIVE: ${isActive} | Color-Flex: ${colorFlex} | Has Layers: ${hasLayers}`);
            }

            if (records.length === 0) {
                console.warn(`[SKIP] No ACTIVE records found for ${tableName}`);
                continue;
            }

            const collectionThumbPath = `./data/collections/${baseName}/${baseName}-thumb.jpg`;
            let collectionCuratedColors = [];
            let collectionCoordinates = [];
            let mockupName = "./data/mockups/English-Countryside-Bedroom-1-W60H45.png";
            let mockupShadowName = null;
            let mockupDims = { widthInches: 60, heightInches: 45 };

            const thumbAttachments = placeholderRecord.get('THUMBNAIL') || [];
            collectionCuratedColors = (placeholderRecord.get('CURATED COLORS') || "")
                .split(/[,|.]/)
                .map(c => c.trim())
                .filter(Boolean);

            // Map COORDINATES field to 21 - COORDINATES
            const coordField = placeholderRecord.get('COORDINATES') || [];
            console.log(`[COORDINATES] Field for ${baseName}:`, coordField);
            collectionCoordinates = coordField.map(coord => {
                const rawFilename = coord.filename || '';
                let cleanFilename = rawFilename
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-.]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/\.jpg$/i, '');
                const coordRecord = coordinateData.find(c => c.filename === cleanFilename);
                if (coordRecord) {
                    return {
                        collection: 'coordinates',
                        filename: coordRecord.filename + '.jpg',
                        path: coordRecord.thumbnailPath,
                        layerPaths: coordRecord.layerPaths
                    };
                }
                console.warn(`No matching coordinate record for ${rawFilename} (cleaned: ${cleanFilename})`);
                return null;
            }).filter(Boolean);

            console.log(`[COLLECTION DATA] Curated colors for ${baseName}:`, collectionCuratedColors);
            console.log(`[COLLECTION DATA] Coordinates for ${baseName}:`, collectionCoordinates);

            const mockupField = placeholderRecord.get('MOCKUP');
            if (mockupField) {
                // Handle both string and array types for MOCKUP field
                let mockupValues;
                if (Array.isArray(mockupField)) {
                    // If it's an array (linked records), extract the first value
                    mockupValues = mockupField.map(item => {
                        if (typeof item === 'string') return item;
                        if (item && item.name) return item.name; // Handle linked record objects
                        return String(item);
                    });
                } else if (typeof mockupField === 'string') {
                    // If it's a string, split by comma
                    mockupValues = mockupField.split(',').map(v => v.trim());
                } else {
                    // Fallback: convert to string
                    mockupValues = [String(mockupField)];
                }
                mockupName = `./data/mockups/${mockupValues[0]}.png`;
                if (mockupValues.length > 1) mockupShadowName = `./data/mockups/${mockupValues[1]}.jpg`;
            }
            mockupDims = parseMockupDimensions(mockupName.split('/').pop());

            const coordinateIds = new Set();
            for (const record of records) {
                const coordField = record.get('COORDINATES');
                if (coordField && Array.isArray(coordField)) {
                    coordField.forEach(coord => coordinateIds.add(coord.id));
                }
            }

            const patternMap = new Map();
            const skippedPatterns = [];
            
            for (const record of records) {
                try {
                    const number = record.get('NUMBER') || '';
                    
                    // Skip the master record (-000) - it's only for collection metadata
                    if (number.toLowerCase().endsWith('-000')) {
                        console.log(`[SKIP PATTERN] ${number} (master record - collection metadata only)`);
                        continue;
                    }
                    
                    if (coordinateIds.has(record.id)) {
                        console.log(`[SKIP PATTERN] ${record.id} (coordinate)`);
                        continue;
                    }

                    const rawName = record.get('NAME') || `${baseName}-product`;
                    
                    // Enhanced error handling for pattern name processing
                    let parsedPatternName;
                    try {
                        const nameParts = rawName.split(/\s*-\s*/);
                        parsedPatternName = nameParts.length > 1 ? cleanPatternName(nameParts[1]) : cleanPatternName(rawName);
                        
                        // Validate that we got a reasonable pattern name
                        if (!parsedPatternName || parsedPatternName === 'Unnamed Pattern') {
                            console.warn(`[PATTERN WARNING] Poor quality pattern name from "${rawName}", using record ID as fallback`);
                            parsedPatternName = `Pattern ${record.id.substring(0, 8)}`;
                        }
                    } catch (nameError) {
                        console.error(`[PATTERN ERROR] Failed to process pattern name "${rawName}":`, nameError.message);
                        parsedPatternName = `Pattern ${record.id.substring(0, 8)}`;
                        console.log(`[PATTERN ERROR] Using fallback name: ${parsedPatternName}`);
                    }

                    const layerAttachments = record.get('LAYER SEPARATIONS') || [];
                    
                    // Enhanced layer filename parsing with error handling
                    if (parsedPatternName === baseName && layerAttachments.length > 0) {
                        try {
                            const firstLayer = layerAttachments[0];
                            if (firstLayer && firstLayer.filename) {
                                const firstLayerParts = firstLayer.filename.split(" - ");
                                if (firstLayerParts.length > 1 && firstLayerParts[0].match(/^\d+[-A-Za-z]*$/)) {
                                    const fallbackName = cleanPatternName(firstLayerParts[1]);
                                    if (fallbackName && fallbackName !== 'Unnamed Pattern') {
                                        parsedPatternName = fallbackName;
                                    }
                                }
                            }
                        } catch (layerError) {
                            console.warn(`[PATTERN WARNING] Error processing layer filename for ${rawName}:`, layerError.message);
                            // Continue with existing parsedPatternName
                        }
                    }

                    const existing = patternMap.get(parsedPatternName);
                    if (!existing || layerAttachments.length > existing.layerCount) {
                        patternMap.set(parsedPatternName, { record, layerCount: layerAttachments.length });
                        console.log(`[PATTERN SUCCESS] Processed: "${parsedPatternName}" (${layerAttachments.length} layers)`);
                    }

                } catch (recordError) {
                    console.error(`[PATTERN ERROR] Failed to process record ${record.id}:`, recordError.message);
                    skippedPatterns.push({
                        id: record.id,
                        name: record.get('NAME') || 'Unknown',
                        number: record.get('NUMBER') || 'Unknown',
                        error: recordError.message
                    });
                    console.log(`[PATTERN ERROR] Skipping problematic record and continuing...`);
                }
            }
            
            // Report on any skipped patterns
            if (skippedPatterns.length > 0) {
                console.warn(`[PATTERN WARNING] Skipped ${skippedPatterns.length} problematic patterns in ${tableName}:`);
                skippedPatterns.forEach(pattern => {
                    console.warn(`  - ${pattern.name} (${pattern.number}): ${pattern.error}`);
                });
            }

            console.log(`[PATTERNS] Found ${patternMap.size} patterns for ${tableName}`);

            if (patternMap.size === 0) {
                console.warn(`[SKIP] No valid patterns found for ${tableName}`);
                continue;
            }

            let jsonRecords = [];
            for (const [parsedPatternName, { record }] of patternMap) {
                const recordId = record.id;
                const number = record.get('NUMBER') || '';
                const fileSafeName = parsedPatternName.toLowerCase().replace(/\s+/g, '-');
                const thumbnailPath = `./data/collections/${baseName}/thumbnails/${fileSafeName}.jpg`;
                const tilingStyle = (record.get('THUMBNAIL') || [])[0]?.filename.toUpperCase().includes("HD") ? "half-drop" : "straight";

                const tintWhite = record.get('tintWhite') === true;
                const layerAttachments = record.get('LAYER SEPARATIONS') || [];
                console.log(`[DEBUG LAYERS] Pattern ${parsedPatternName}:`);
                console.log(`  - tintWhite: ${tintWhite}`);
                console.log(`  - LAYER SEPARATIONS field:`, record.get('LAYER SEPARATIONS'));
                console.log(`  - layerAttachments.length: ${layerAttachments.length}`);
                if (layerAttachments.length > 0) {
                    console.log(`  - First layer filename: ${layerAttachments[0].filename}`);
                    console.log(`  - First layer URL: ${layerAttachments[0].url}`);
                }
                
                let baseCompositePath = null;
                if (tintWhite && record.get('BASE COMPOSITE')?.[0]) {
                    const baseCompositeFilename = record.get('BASE COMPOSITE')[0].filename || `${fileSafeName}-base.jpg`;
                    const parsedBaseComposite = parseFileName(baseCompositeFilename, 0, parsedPatternName);
                    baseCompositePath = `./data/collections/${baseName}/layers/${parsedBaseComposite.layerFileName}.jpg`;
                }

                // For Galleria collection, ensure correct layer assignment:
                // Layer 1 (Etching) - gets user input via background tinting
                // Layer 2 (Pattern) - composited over the background+etching result
                let processedLayerAttachments = layerAttachments;

                const layerData = [];
                const layerLabels = [];
                for (let i = 0; i < processedLayerAttachments.length; i++) {
                    const layerFilename = processedLayerAttachments[i].filename || `${fileSafeName}-layer-${i + 1}.jpg`;
                    const parsedLayer = parseFileName(layerFilename, i, parsedPatternName);
                    const layerPath = `./data/collections/${baseName}/layers/${parsedLayer.layerFileName}.jpg`;
                    const proofLayerPath = `./data/collections/${baseName}/proof-layers/${parsedLayer.layerFileName}.jpg`;
                    layerData.push({ path: layerPath, proofPath: proofLayerPath });
                    layerLabels.push(parsedLayer.layerLabel);
                }

                // Get designer colors, fallback to collection curated colors if empty
                let designerColors = (record.get('DESIGNER COLORS') || "")
                    .split(/[,|.]/)
                    .map(c => c.trim())
                    .filter(Boolean);
                
                // If no designer colors, use collection's curated colors as fallback
                if (designerColors.length === 0) {
                    designerColors = collectionCuratedColors;
                    console.log(`[FALLBACK COLORS] Pattern ${parsedPatternName}: Using collection curated colors (${designerColors.length} colors)`);
                } else {
                    console.log(`[DESIGNER COLORS] Pattern ${parsedPatternName}: Using pattern-specific colors (${designerColors.length} colors)`);
                }

                const thumbnailAttachment = (record.get('THUMBNAIL') || [])[0];
                const thumbnailFilename = thumbnailAttachment?.filename || '';
                const size = extractDimensions(thumbnailFilename);
                console.log(`[PATTERN] ${parsedPatternName}: size=${size}, layers=${layerData.length}`);

                const isColorFlex = record.get('Color-Flex') === true;
                
                jsonRecords.push({
                    id: recordId,
                    number: number,
                    name: parsedPatternName,
                    thumbnail: thumbnailPath,
                    size: size,                     
                    repeat: record.get('REPEAT TYPE') || "yes",
                    layers: isColorFlex ? layerData : [], // Standard patterns have no layers
                    layerLabels: isColorFlex ? layerLabels : [], // Standard patterns have no layer labels
                    tilingType: tilingStyle,
                    designer_colors: designerColors,
                    colorFlex: isColorFlex, // Add ColorFlex flag
                    coordinates: collectionCoordinates.length > 0 ? collectionCoordinates : null,
                    baseComposite: baseCompositePath,
                    tintWhite: tintWhite,
                    updatedAt: new Date().toISOString()
                });
            }

            const newCollectionData = {
                name: baseName,
                tableName: tableName,
                collection_thumbnail: collectionThumbPath,
                curatedColors: collectionCuratedColors,
                coordinates: collectionCoordinates.length > 0 ? collectionCoordinates : null,
                mockup: mockupName,
                mockupShadow: mockupShadowName,
                mockupWidthInches: mockupDims.widthInches,
                mockupHeightInches: mockupDims.heightInches,
                patterns: jsonRecords
            };

            // Merge with existing data
            const existingIndex = existingData.collections.findIndex(c => c.name === baseName);
            if (existingIndex !== -1) {
                existingData.collections[existingIndex] = newCollectionData;
                console.log(`[UPDATE] Updated existing collection ${baseName} in collections.json`);
            } else {
                existingData.collections.push(newCollectionData);
                console.log(`[ADD] Added new collection ${baseName} to collections.json`);
            }
        } catch (error) {
            console.error(`[ERROR] Processing ${tableName}:`, error);
        }
    }

    console.log(`\n[COMPLETE] fetchCollectionData completed, collections: ${existingData.collections.length}`);
    return existingData;
}

async function downloadImagesForCollections(data, collectionName = null, forceDownload = false) {
    console.log(`\n[DOWNLOAD START] Starting downloadImagesForCollections with collectionName=${collectionName}, forceDownload=${forceDownload}`);
    console.log(`[DOWNLOAD START] Collections available:`, data.collections.map(c => c.name));
    
    let targetCollections = data.collections;
    if (collectionName && collectionName !== 'null') {
        targetCollections = data.collections.filter(c => c.name.toLowerCase().includes(collectionName.toLowerCase()));
        if (!targetCollections.length) {
            console.error(`[DOWNLOAD ERROR] No collection found matching: ${collectionName}`);
            return;
        }
        console.log(`[DOWNLOAD] Downloading images for single collection: ${collectionName}`);
    } else {
        console.log(`[DOWNLOAD] Processing all collections for image downloads`);
    }

    console.log(`[DOWNLOAD] Target collections:`, targetCollections.map(c => c.name));

    for (const collection of targetCollections) {
        const baseName = collection.name;
        console.log(`\n[DOWNLOAD COLLECTION] Starting ${baseName}`);

        // Create directories
        const dirs = [
            `./data/collections/${baseName}/thumbnails`,
            `./data/collections/${baseName}/layers`,
            `./data/collections/${baseName}/proof-layers`,
            `./data/collections/${baseName}/coordinates`,
            `./data/collections/coordinates/thumbnails`,
            `./data/collections/coordinates/layers`
        ];
        
        for (const dir of dirs) {
            fsSync.mkdirSync(dir, { recursive: true });
            console.log(`[MKDIR] Created directory: ${dir}`);
        }

        // Download collection thumbnail
        const placeholderRecord = (await base(collection.tableName).select({}).all()).find(r => (r.get('NUMBER') || '').toLowerCase().endsWith('-000'));
        if (placeholderRecord && placeholderRecord.get('THUMBNAIL')?.[0]?.url) {
            console.log(`[DOWNLOAD COLLECTION THUMB] Downloading collection thumbnail for ${baseName}`);
            try {
                await downloadImage(placeholderRecord.get('THUMBNAIL')[0].url, collection.collection_thumbnail, 2800, 3, forceDownload);
            } catch (error) {
                console.error(`[DOWNLOAD ERROR] Failed to download collection thumbnail for ${baseName}:`, error);
            }
        } else {
            console.warn(`[DOWNLOAD WARN] No collection thumbnail URL for ${baseName}`);
        }

        // Download pattern images
        console.log(`[DOWNLOAD PATTERNS] Processing ${collection.patterns.length} patterns for ${baseName}`);
        for (const pattern of collection.patterns) {
            console.log(`\n[DOWNLOAD PATTERN] Processing pattern: ${pattern.name}`);
            
            try {
                const patternRecord = await base(collection.tableName).find(pattern.id);
                const thumbnailUrl = patternRecord.get('THUMBNAIL')?.[0]?.url;
                
                if (thumbnailUrl) {
                    console.log(`[DOWNLOAD THUMB] Downloading thumbnail for ${pattern.name}`);
                    const metadata = await downloadImage(thumbnailUrl, pattern.thumbnail, 2800, 3, forceDownload);
                    if (metadata) {
                        const pixelAspect = metadata.width / metadata.height;
                        pattern.size[1] = Math.round(pattern.size[0] / pixelAspect);
                    }
                } else {
                    console.warn(`[DOWNLOAD WARN] No THUMBNAIL URL for ${pattern.name}`);
                }

                if (pattern.baseComposite) {
                    const baseCompositeUrl = patternRecord.get('BASE COMPOSITE')?.[0]?.url;
                    if (baseCompositeUrl) {
                        console.log(`[DOWNLOAD BASE] Downloading base composite for ${pattern.name}`);
                        await downloadImage(baseCompositeUrl, pattern.baseComposite, 2800, 3, forceDownload);
                    }
                }

                // STEP 1: Determine maximum proof layer dimension across all layers
                // This ensures all proof layers are the same size for proper alignment
                let maxProofDimension = 0;
                const layerUrls = [];

                for (let i = 0; i < pattern.layers.length; i++) {
                    const layerUrl = patternRecord.get('LAYER SEPARATIONS')?.[i]?.url;
                    if (layerUrl) {
                        layerUrls.push({ index: i, url: layerUrl });

                        // Get original dimensions from Airtable
                        try {
                            const response = await new Promise((resolve, reject) => {
                                https.get(layerUrl, { timeout: 30000 }, (response) => {
                                    const chunks = [];
                                    response.on('data', chunk => chunks.push(chunk));
                                    response.on('end', () => resolve(Buffer.concat(chunks)));
                                }).on('error', reject);
                            });

                            const metadata = await sharp(response).metadata();
                            const maxDim = Math.max(metadata.width, metadata.height);
                            console.log(`[PROOF CHECK] Layer ${i} (${pattern.layerLabels[i]}): ${metadata.width}x${metadata.height} (max: ${maxDim})`);
                            maxProofDimension = Math.max(maxProofDimension, maxDim);
                        } catch (err) {
                            console.warn(`[PROOF CHECK WARN] Could not get dimensions for layer ${i}: ${err.message}`);
                        }
                    }
                }

                // Round up to nearest 100 for clean dimension
                maxProofDimension = Math.ceil(maxProofDimension / 100) * 100;
                console.log(`[PROOF NORMALIZE] Using ${maxProofDimension}x${maxProofDimension} for all proof layers in ${pattern.name}`);

                // STEP 2: Download all layers normalized to maxProofDimension
                for (let i = 0; i < pattern.layers.length; i++) {
                    const layerUrl = patternRecord.get('LAYER SEPARATIONS')?.[i]?.url;
                    if (layerUrl) {
                        console.log(`[DOWNLOAD LAYER] Downloading layer ${pattern.layerLabels[i]} for ${pattern.name} (URL: ${layerUrl})`);

                        // Download proof layer normalized to maxProofDimension (ensures all layers same size)
                        await downloadImage(layerUrl, pattern.layers[i].proofPath, maxProofDimension, 3, forceDownload);

                        // Download optimized working layer (always 1400x1400)
                        const metadata = await downloadImage(layerUrl, pattern.layers[i].path, 1400, 3, forceDownload);
                        if (i === 0 && !pattern.tintWhite && !pattern.baseComposite && metadata) {
                            const pixelAspect = metadata.width / metadata.height;
                            pattern.size[1] = Math.round(pattern.size[0] / pixelAspect);
                        }
                    } else {
                        console.warn(`[DOWNLOAD WARN] No layer URL for ${pattern.name} layer ${i} - LAYER SEPARATIONS field may be empty`);
                        console.log(`[DEBUG] LAYER SEPARATIONS field content:`, patternRecord.get('LAYER SEPARATIONS'));
                    }
                }
            } catch (error) {
                console.error(`[DOWNLOAD ERROR] Failed to process pattern ${pattern.name}:`, error);
            }
        }

        // Download coordinate images
        if (collection.coordinates) {
            console.log(`[DOWNLOAD COORDINATES] Processing ${collection.coordinates.length} coordinates for ${baseName}`);
            const coordRecords = await base('21 - COORDINATES').select({}).all();
            
            for (const coord of collection.coordinates) {
                console.log(`[DOWNLOAD COORD] Processing coordinate: ${coord.filename}`);
                const cleanFilename = coord.filename
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-.]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/\.jpg$/i, '');
                    
                const coordRecord = coordRecords.find(r => {
                    const recordName = r.get('NAME')?.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') || '';
                    return recordName === cleanFilename;
                });
                
                if (coordRecord) {
                    const thumbnailUrl = coordRecord.get('THUMBNAIL')?.[0]?.url;
                    const layerUrls = coordRecord.get('LAYER SEPARATIONS')?.map(attachment => attachment.url) || [];
                    
                    if (thumbnailUrl) {
                        console.log(`[DOWNLOAD COORD THUMB] Downloading coordinate thumbnail ${coord.filename}`);
                        try {
                            await downloadImage(thumbnailUrl, coord.path, 2800, 3, forceDownload);
                        } catch (error) {
                            console.error(`[DOWNLOAD ERROR] Failed to download thumbnail for ${coord.filename}:`, error);
                        }
                    }
                    
                    for (let i = 0; i < layerUrls.length; i++) {
                        const layerPath = coord.layerPaths[i];
                        console.log(`[DOWNLOAD COORD LAYER] Downloading coordinate layer ${i + 1} for ${coord.filename}`);
                        try {
                            await downloadImage(layerUrls[i], layerPath, 2800, 3, forceDownload);
                        } catch (error) {
                            console.error(`[DOWNLOAD ERROR] Failed to download layer ${i + 1} for ${coord.filename}:`, error);
                        }
                    }
                } else {
                    console.warn(`[DOWNLOAD WARN] No coordinate record found for ${coord.filename} (cleaned: ${cleanFilename})`);
                }
            }
        }
        
        console.log(`[DOWNLOAD COMPLETE] Finished downloading for collection: ${baseName}`);
    }
    
    console.log(`\n[DOWNLOAD ALL COMPLETE] All downloads finished`);
}

// Server deployment function using the existing deploy.sh script
async function deployToServer(collectionName = null) {
    console.log(`\n[SERVER DEPLOY] Starting server deployment...`);
    
    try {
        let deployCommand;
        
        if (collectionName && collectionName !== 'null') {
            // Deploy specific collection
            deployCommand = `./deploy.sh -collection ${collectionName}`;
            console.log(`[SERVER DEPLOY] Deploying collection: ${collectionName}`);
        } else {
            // Deploy all images
            deployCommand = `./deploy.sh -images`;
            console.log(`[SERVER DEPLOY] Deploying all collection images`);
        }
        
        console.log(`[SERVER DEPLOY] Running: ${deployCommand}`);
        const output = execSync(deployCommand, { 
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: process.cwd()
        });
        
        console.log(`[SERVER DEPLOY] Deploy output:`);
        console.log(output);
        
        // Track deployment in processedFiles
        processedFiles.deploymentFiles.push({
            type: 'Server Deployment',
            path: 'so-animation.com/colorflex/data/collections/',
            details: collectionName ? `Collection: ${collectionName}` : 'All collections',
            timestamp: new Date().toISOString()
        });
        
        console.log(`[SERVER DEPLOY] ✅ Server deployment completed successfully`);
        
    } catch (error) {
        console.error(`[SERVER DEPLOY ERROR] Failed to deploy to server:`, error.message);
        console.error(`[SERVER DEPLOY ERROR] Make sure deploy.sh is executable and deployment keys are set up`);
        
        // Still track attempt even if failed
        processedFiles.deploymentFiles.push({
            type: 'Server Deployment (FAILED)',
            path: 'so-animation.com/colorflex/data/collections/',
            details: `Error: ${error.message}`,
            timestamp: new Date().toISOString()
        });
        
        throw error; // Re-throw to handle in main
    }
}

async function main(downloadImages = true, collectionName = null, generateShopify = false, forceDownload = true, incrementalMode = false) {
    console.log(`\n=== STARTING MAIN ===`);
    console.log(`[MAIN] Running with downloadImages=${downloadImages}, collectionName=${collectionName}, generateShopify=${generateShopify}, forceDownload=${forceDownload}, incrementalMode=${incrementalMode}`);
    
    const data = await fetchCollectionData(collectionName);
    console.log(`[MAIN] Fetched collection data:`, data.collections.map(c => c.name));

    // Handle incremental mode - SIMPLER APPROACH: Compare names first, then fetch only new patterns
    let finalData = data;
    let newPatternsAdded = 0;
    let newPatternsData = null; // Track only new patterns for CSV generation

    if (incrementalMode) {
        console.log(`[MAIN] 🔄 INCREMENTAL MODE: Using name comparison approach`);
        const collectionsPath = path.resolve('./data/collections.json');

        try {
            // Load existing collections.json
            if (fsSync.existsSync(collectionsPath)) {
                const existingData = JSON.parse(fsSync.readFileSync(collectionsPath, 'utf8'));
                console.log(`[MAIN] Loaded existing collections.json with ${existingData.collections.length} collections`);

                // Create structure to hold ONLY new patterns for CSV
                newPatternsData = { collections: [] };

                // For the specified collection, compare by cleanPatternName()
                data.collections.forEach(newCollection => {
                    const existingCollection = existingData.collections.find(c =>
                        c.name.toLowerCase() === newCollection.name.toLowerCase()
                    );

                    if (existingCollection) {
                        console.log(`[MAIN] 🔍 Comparing pattern names for "${newCollection.name}"...`);

                        // Build set of existing pattern names (cleaned and lowercase)
                        const existingPatternNames = new Set(
                            existingCollection.patterns.map(p => cleanPatternName(p.name).toLowerCase())
                        );

                        console.log(`[MAIN] Existing patterns (${existingPatternNames.size}):`);
                        existingCollection.patterns.forEach(p => {
                            console.log(`  - ${p.name} → cleaned: "${cleanPatternName(p.name)}"`);
                        });

                        console.log(`[MAIN] Fetched patterns (${newCollection.patterns.length}):`);
                        newCollection.patterns.forEach(p => {
                            const cleaned = cleanPatternName(p.name);
                            const isNew = !existingPatternNames.has(cleaned.toLowerCase());
                            console.log(`  - ${p.name} → cleaned: "${cleaned}" ${isNew ? '✨ NEW' : '(exists)'}`);
                        });

                        // Find truly NEW patterns by comparing cleaned names
                        const newPatterns = newCollection.patterns.filter(p => {
                            const cleanedName = cleanPatternName(p.name);
                            return !existingPatternNames.has(cleanedName.toLowerCase());
                        });

                        if (newPatterns.length > 0) {
                            console.log(`[MAIN] ✅ Found ${newPatterns.length} NEW patterns in "${newCollection.name}":`);
                            newPatterns.forEach(p => console.log(`     - ${p.name} (cleaned: ${cleanPatternName(p.name)})`));

                            // Append new patterns to existing collection
                            existingCollection.patterns = [...existingCollection.patterns, ...newPatterns];
                            newPatternsAdded += newPatterns.length;

                            // Track new patterns separately for CSV generation
                            newPatternsData.collections.push({
                                ...newCollection,
                                patterns: newPatterns
                            });
                        } else {
                            console.log(`[MAIN] ℹ️  No new patterns found in "${newCollection.name}"`);
                        }
                    } else {
                        // Entire collection is new
                        console.log(`[MAIN] ✨ NEW collection found: "${newCollection.name}" with ${newCollection.patterns.length} patterns`);
                        existingData.collections.push(newCollection);
                        newPatternsAdded += newCollection.patterns.length;

                        // Entire collection is new, add to newPatternsData
                        newPatternsData.collections.push(newCollection);
                    }
                });

                finalData = existingData;
                console.log(`[MAIN] 🎯 Incremental merge complete: ${newPatternsAdded} new patterns added`);
            } else {
                console.log(`[MAIN] ⚠️  No existing collections.json found, will create new file`);
            }
        } catch (error) {
            console.error(`[MAIN ERROR] Error during incremental merge:`, error);
            console.log(`[MAIN] Falling back to full overwrite`);
        }
    }

    // Write updated data to collections.json
    try {
        const collectionsPath = path.resolve('./data/collections.json');
        fsSync.writeFileSync(collectionsPath, JSON.stringify(finalData, null, 2));

        if (incrementalMode) {
            console.log(`[MAIN] ✅ Successfully updated collections.json (${newPatternsAdded} new patterns added)`);
        } else {
            console.log(`[MAIN] ✅ Successfully wrote to collections.json (full overwrite)`);
        }

        processedFiles.dataFiles.push({
            type: incrementalMode ? 'Collections Data (Incremental)' : 'Collections Data',
            path: collectionsPath,
            patterns: finalData.collections.reduce((total, col) => total + col.patterns.length, 0),
            collections: finalData.collections.length,
            newPatterns: incrementalMode ? newPatternsAdded : undefined
        });
    } catch (error) {
        console.error(`[MAIN ERROR] Error writing to collections.json:`, error);
    }

    // Generate Shopify CSV if requested
    if (generateShopify) {
        try {
            const baseServerUrl = 'https://so-animation.com/colorflex'; // Your actual server URL

            // In incremental mode, only generate CSV for NEW patterns
            let csvData;
            if (incrementalMode && newPatternsData && newPatternsData.collections.length > 0) {
                console.log(`[CSV] 🔄 INCREMENTAL MODE: Generating CSV for NEW patterns only`);
                csvData = newPatternsData;
                const newPatternCount = csvData.collections.reduce((total, col) => total + col.patterns.length, 0);
                console.log(`[CSV] CSV will contain ${newPatternCount} NEW patterns across ${csvData.collections.length} collections`);
            } else if (collectionName && collectionName !== 'null') {
                console.log(`[CSV] Filtering CSV to only include collection: ${collectionName}`);
                csvData = {
                    collections: finalData.collections.filter(col =>
                        col.name.toLowerCase() === collectionName.toLowerCase()
                    )
                };
                console.log(`[CSV] Filtered from ${finalData.collections.length} to ${csvData.collections.length} collections`);
            } else {
                console.log(`[CSV] Generating CSV for all collections (no filter specified)`);
                csvData = finalData;
            }
            
            const csvContent = await generateShopifyCSV(csvData, baseServerUrl);
            const totalPatterns = csvData.collections.reduce((total, col) => total + col.patterns.length, 0);
            
            // Generate timestamped filename in standardized location
            const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const collectionSuffix = (collectionName && collectionName !== 'null') ? `-${collectionName}` : '';
            const csvFilename = `./deployment/csv/shopify-import${collectionSuffix}-${timestamp}.csv`;
            
            // Ensure deployment/csv directory exists
            if (!fsSync.existsSync('./deployment/csv')) {
                fsSync.mkdirSync('./deployment/csv', { recursive: true });
            }
            
            fsSync.writeFileSync(csvFilename, csvContent);
            console.log(`[MAIN] ✅ Successfully generated ${csvFilename} with EXACT Shopify headers (no manual mapping required!)`);
            
            // Track CSV files
            processedFiles.csvFiles.push({
                type: 'Shopify Import CSV',
                path: path.resolve(csvFilename),
                patterns: totalPatterns,
                timestamp: new Date().toISOString()
            });
            
            // Also generate template file for reference in deployment/csv
            const templateContent = generateShopifyTemplate();
            const templateFilename = './deployment/csv/shopify-template.csv';
            fsSync.writeFileSync(templateFilename, templateContent);
            
            // Track template file
            processedFiles.csvFiles.push({
                type: 'Shopify Template CSV',
                path: path.resolve(templateFilename),
                purpose: 'Reference template for manual CSV creation'
            });
            console.log(`[MAIN] ✅ Generated ${templateFilename} for future reference`);
        } catch (error) {
            console.error(`[MAIN ERROR] Error generating Shopify CSV:`, error);
        }
    }

    // Download images if specified
    if (downloadImages) {
        console.log(`[MAIN] Starting image downloads...`);

        // In incremental mode, only download images for NEW patterns
        let dataForDownload;
        if (incrementalMode && newPatternsData && newPatternsData.collections.length > 0) {
            console.log(`[MAIN] 🔄 INCREMENTAL MODE: Downloading images for NEW patterns only`);
            dataForDownload = newPatternsData;
            // Force download for new patterns (they don't exist yet)
            await downloadImagesForCollections(dataForDownload, collectionName, true);
        } else {
            // Normal mode or no new patterns - use finalData
            await downloadImagesForCollections(finalData, collectionName, forceDownload);
        }
        console.log(`[MAIN] Image downloads completed`);
        
        // Automatically deploy to server after downloading images
        console.log(`[MAIN] Starting automatic server deployment...`);
        try {
            await deployToServer(collectionName);
            console.log(`[MAIN] Server deployment completed`);
        } catch (error) {
            console.error(`[MAIN ERROR] Server deployment failed:`, error.message);
            console.error(`[MAIN ERROR] Images were downloaded locally but not deployed to server`);
            console.error(`[MAIN ERROR] Run './deploy.sh -images' manually to deploy`);
        }
    } else {
        console.log(`[MAIN] Skipping image downloads (downloadImages=${downloadImages})`);
    }

    console.log(`[MAIN] Main execution completed`);
    
    // Print comprehensive file summary
    printFileProcessingSummary();
    
    console.log(`=== MAIN COMPLETE ===\n`);
}

// Print comprehensive file processing summary
function printFileProcessingSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📁 FILE PROCESSING SUMMARY');
    console.log('='.repeat(60));
    
    // Data files
    if (processedFiles.dataFiles.length > 0) {
        console.log('\n🗃️  DATA FILES PROCESSED:');
        processedFiles.dataFiles.forEach(file => {
            console.log(`   ✅ ${file.type}`);
            console.log(`      Path: ${file.path}`);
            if (file.collections) console.log(`      Collections: ${file.collections}`);
            if (file.patterns) console.log(`      Total Patterns: ${file.patterns}`);
            console.log('');
        });
    }
    
    // CSV files
    if (processedFiles.csvFiles.length > 0) {
        console.log('📊 CSV FILES GENERATED:');
        processedFiles.csvFiles.forEach(file => {
            console.log(`   ✅ ${file.type}`);
            console.log(`      Path: ${file.path}`);
            if (file.patterns) console.log(`      Patterns: ${file.patterns}`);
            if (file.purpose) console.log(`      Purpose: ${file.purpose}`);
            if (file.timestamp) console.log(`      Generated: ${file.timestamp}`);
            console.log('');
        });
    }
    
    // Deployment files
    if (processedFiles.deploymentFiles.length > 0) {
        console.log('🚀 DEPLOYMENT FILES:');
        processedFiles.deploymentFiles.forEach(file => {
            console.log(`   ✅ ${file.type}`);
            console.log(`      Path: ${file.path}`);
            if (file.details) console.log(`      Details: ${file.details}`);
            console.log('');
        });
    }
    
    if (processedFiles.dataFiles.length === 0 && processedFiles.csvFiles.length === 0 && processedFiles.deploymentFiles.length === 0) {
        console.log('   ⚠️  No output files were generated');
    }
    
    console.log('='.repeat(60));
    console.log('🎯 READY FOR DEPLOYMENT');
    console.log('='.repeat(60));
}

// Update the command line arguments parsing
const args = process.argv.slice(2);
const downloadImages = args[0] === 'true';
const collectionName = args[1] || null;
const generateShopify = args[2] === 'shopify';
const forceDownload = args[3] === 'force' || args[2] === 'force';
const incrementalMode = args[3] === 'incremental' || args[4] === 'incremental';

console.log(`\n=== SCRIPT START ===`);
console.log(`Arguments: downloadImages=${downloadImages}, collectionName=${collectionName}, generateShopify=${generateShopify}, forceDownload=${forceDownload}, incrementalMode=${incrementalMode}`);

// Export functions for use in other modules
module.exports = {
    fetchCollectionData,
    downloadImagesForCollections,
    generateShopifyCSV,
    generateShopifyTemplate,
    main
};

// Only run main if this file is executed directly
if (require.main === module) {
    main(downloadImages, collectionName, generateShopify, forceDownload, incrementalMode).catch(err => console.error("Main error:", err));
}