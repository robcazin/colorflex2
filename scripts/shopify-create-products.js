#!/usr/bin/env node
/**
 * Shopify Product Creation via Admin API
 * Replaces CSV import with direct API calls
 *
 * Usage: node scripts/shopify-create-products.js <collection-name>
 * Example: node scripts/shopify-create-products.js english-cottage
 */

// Load Shopify credentials: .env (root) → config/local.env → api/.env (same as other API scripts)
const fs = require('fs');
const path = require('path');
require('dotenv').config();
if (!process.env.SHOPIFY_STORE || !process.env.SHOPIFY_ACCESS_TOKEN) {
    if (fs.existsSync('config/local.env')) require('dotenv').config({ path: 'config/local.env' });
    if ((!process.env.SHOPIFY_STORE || !process.env.SHOPIFY_ACCESS_TOKEN) && fs.existsSync('api/.env')) {
        require('dotenv').config({ path: path.resolve('api/.env') });
    }
}

const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const API_VERSION = '2025-01';  // Updated from 2024-01 to match current API
const BASE_SERVER_URL = 'https://so-animation.com/colorflex';

// Rate limiting - Shopify allows 2 requests/second for REST API
const RATE_LIMIT_DELAY = 550; // ms between requests

// Colors for console output
const colors = {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Make a Shopify API request with rate limiting
 */
async function shopifyRequest(endpoint, method = 'GET', body = null) {
    const url = `https://${SHOPIFY_STORE}/admin/api/${API_VERSION}/${endpoint}`;

    const options = {
        method,
        headers: {
            'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
            'Content-Type': 'application/json'
        }
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    // DEBUG: Log request details
    if (method === 'POST') {
        console.log(`    🔍 POST to: ${url}`);
        console.log(`    🔍 Method: ${method}`);
        console.log(`    🔍 Headers:`, JSON.stringify(options.headers));
        console.log(`    🔍 Body preview:`, options.body ? options.body.substring(0, 200) + '...' : 'none');
    }

    const response = await fetch(url, options);

    // DEBUG: Log response status
    if (method === 'POST') {
        console.log(`    🔍 Response status: ${response.status} ${response.statusText}`);
        console.log(`    🔍 Response headers:`, JSON.stringify([...response.headers.entries()]));
    }

    // Handle rate limiting
    if (response.status === 429) {
        log('⏳ Rate limited, waiting 2 seconds...', 'yellow');
        await sleep(2000);
        return shopifyRequest(endpoint, method, body);
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Shopify API Error ${response.status}: ${errorText}`);
    }

    // Some endpoints return 201 with empty body
    const text = await response.text();
    return text ? JSON.parse(text) : {};
}

// Product Images REST endpoint is deprecated in 2025-01; use 2024-01 for image upload
const IMAGE_API_VERSION = '2024-01';

/**
 * Add a product image from a local file (base64). Use this so thumbnails always
 * appear in Shopify even when CSV import or URL fetch fails.
 */
async function addProductImageFromFile(productId, localPath, alt = '') {
    const absPath = path.resolve(process.cwd(), localPath.replace(/^\.\//, ''));
    if (!fs.existsSync(absPath)) return false;
    try {
        const imageBuffer = fs.readFileSync(absPath);
        const base64 = imageBuffer.toString('base64');
        const body = { image: { attachment: base64 } };
        if (alt) body.image.alt = alt;
        const url = `https://${SHOPIFY_STORE}/admin/api/${IMAGE_API_VERSION}/products/${productId}/images.json`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (res.status === 429) {
            await sleep(2000);
            return addProductImageFromFile(productId, localPath, alt);
        }
        if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
        await sleep(RATE_LIMIT_DELAY);
        return true;
    } catch (err) {
        log(`  ⚠️ Image upload from file failed: ${err.message}`, 'yellow');
        return false;
    }
}

/**
 * Check if a product already exists by handle
 */
async function findProductByHandle(handle) {
    try {
        const data = await shopifyRequest(`products.json?handle=${handle}&limit=1`);
        return data.products && data.products.length > 0 ? data.products[0] : null;
    } catch (error) {
        return null;
    }
}

/**
 * Create or update metafields for a product
 */
async function setProductMetafields(productId, metafields) {
    for (const metafield of metafields) {
        try {
            await shopifyRequest(`products/${productId}/metafields.json`, 'POST', {
                metafield: {
                    namespace: metafield.namespace,
                    key: metafield.key,
                    value: metafield.value,
                    type: metafield.type
                }
            });
            await sleep(RATE_LIMIT_DELAY);
        } catch (error) {
            // Metafield might already exist, try to update
            log(`  ⚠️ Metafield ${metafield.key}: ${error.message}`, 'yellow');
        }
    }
}

/**
 * Create a single product with variants and metafields
 */
async function createProduct(pattern, collection, options = {}) {
    const { dryRun = false, update = false } = options;

    const patternFileName = pattern.name.toLowerCase().replace(/\s+/g, '-');
    const handle = `${collection.name}-${pattern.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const thumbnailUrl = `${BASE_SERVER_URL}/data/collections/${collection.name}/thumbnails/${patternFileName}.jpg`;
    const localThumbPath = pattern.thumbnail ? path.resolve(process.cwd(), pattern.thumbnail.replace(/^\.\//, '')) : null;
    const hasLocalThumb = localThumbPath && fs.existsSync(localThumbPath);

    const isColorFlex = pattern.colorFlex === true;

    // Determine category for Shopify collection assignment
    // - Pattern category field (if present) → use that
    // - Furniture collections (*.fur-*) → "Furniture"
    // - Clothing collections (*.clo-*) → "Clothing"
    // - All other wallpaper collections → "Decor in Home & Garden"
    //   Note: Shopify UI displays this shortened as "Decor" but actual value is full name
    let category = null;
    if (pattern.category) {
        category = pattern.category;
    } else if (collection.name.includes('.fur-') || collection.name.includes('-fur-')) {
        category = 'Furniture';  // Prevents furniture patterns from appearing in wallpaper collections
    } else if (collection.name.includes('.clo-') || collection.name.includes('-clo-')) {
        category = 'Clothing';
    } else {
        // Default: All wallpaper collections use "Decor in Home & Garden"
        category = 'Decor in Home & Garden';
    }

    const productType = category === 'Clothing' ? 'Clothing' : (isColorFlex ? 'ColorFlex Pattern' : 'Standard Pattern');

    // Parse pattern number
    const numberMatch = pattern.number?.match(/^(\d+)-(\d+)-(\d+)([A-Z]?)$/);
    const numberData = numberMatch ? {
        full: pattern.number,
        category: numberMatch[1],
        collection: numberMatch[2],
        pattern: numberMatch[3],
        variant: numberMatch[4] || ''
    } : { full: '', category: '', collection: '', pattern: '', variant: '' };

    // Build product data
    const productData = {
        product: {
            title: pattern.name,
            handle: handle,
            body_html: `<p>${pattern.name} pattern from our ${collection.name.charAt(0).toUpperCase() + collection.name.slice(1)} collection. ${numberData.full ? `Pattern #${numberData.full}. ` : ''}${isColorFlex ? 'Customize colors to match your space perfectly with our ColorFlex system.' : 'Classic design available in standard colorways.'}</p>`,
            vendor: 'Saffron Cottage',
            product_type: productType,
            tags: `${collection.name}, pattern, wallpaper, fabric${isColorFlex ? ', removable, custom-color, colorflex' : ', standard'}`,
            status: 'active',  // Set product status to active
            published: true,   // Publish to available sales channels
            variants: [
                {
                    option1: 'Wallpaper',
                    price: '89.99',
                    sku: `${numberData.full || handle}-wallpaper`,
                    requires_shipping: true,
                    taxable: true,
                    inventory_policy: 'continue'
                },
                {
                    option1: 'Fabric',
                    price: '79.99',
                    sku: `${numberData.full || handle}-fabric`,
                    requires_shipping: true,
                    taxable: true,
                    inventory_policy: 'continue'
                },
                {
                    option1: 'Removable Decal',
                    price: '69.99',
                    sku: `${numberData.full || handle}-decal`,
                    requires_shipping: true,
                    taxable: true,
                    inventory_policy: 'continue'
                }
            ],
            options: [
                { name: 'Application' }
            ],
            // Use local file upload after create/update when available so thumbnails always appear (CSV/URL import often fails)
            images: hasLocalThumb ? [] : [
                { src: thumbnailUrl, alt: `${pattern.name} pattern thumbnail` }
            ]
        }
    };

    // Metafields to set after product creation
    const metafields = [
        { namespace: 'color_flex', key: 'base_url', value: `${BASE_SERVER_URL}/data/collections/`, type: 'url' },
        { namespace: 'color_flex', key: 'collection', value: collection.name, type: 'single_line_text_field' },
        { namespace: 'color_flex', key: 'pattern', value: patternFileName, type: 'single_line_text_field' },
        { namespace: 'color_flex', key: 'layer_count', value: String(pattern.layers?.length || 0), type: 'number_integer' },
        // FIX: Use pattern.layerLabels array instead of pattern.layers[].name
        { namespace: 'color_flex', key: 'layer_labels', value: pattern.layerLabels?.join(', ') || '', type: 'single_line_text_field' },
        // FIX: Use pattern.size array instead of pattern.width/height
        { namespace: 'color_flex', key: 'pattern_size', value: pattern.size ? `${pattern.size[0] || 24}x${pattern.size[1] || 24}` : '24x24', type: 'single_line_text_field' },
        { namespace: 'color_flex', key: 'tiling_type', value: pattern.tilingType || 'straight', type: 'single_line_text_field' },
        // FIX: Use pattern.designer_colors array instead of pattern.layers[].defaultColor
        { namespace: 'color_flex', key: 'designer_colors', value: pattern.designer_colors?.join(', ') || '', type: 'single_line_text_field' },
        { namespace: 'color_flex', key: 'pattern_number', value: numberData.full, type: 'single_line_text_field' },
        { namespace: 'color_flex', key: 'collection_sequence', value: numberData.collection, type: 'single_line_text_field' },
        { namespace: 'color_flex', key: 'pattern_sequence', value: numberData.pattern, type: 'single_line_text_field' }
    ];

    // Add pattern_variant only if it has a value (not blank)
    if (numberData.variant && numberData.variant.trim() !== '') {
        metafields.push({
            namespace: 'color_flex',
            key: 'pattern_variant',
            value: numberData.variant,
            type: 'single_line_text_field'
        });
    }

    // Add category metafield for collection assignment (e.g., "Decor in Home & Garden" for folksie, "Clothing" for clothing collections)
    if (category && category.trim() !== '') {
        metafields.push({
            namespace: 'custom',
            key: 'category',
            value: category,
            type: 'single_line_text_field'
        });
    }

    if (dryRun) {
        log(`  [DRY RUN] Would create: ${pattern.name} (${handle})`, 'blue');
        return { dryRun: true, handle };
    }

    try {
        // Check if product exists
        const existing = await findProductByHandle(handle);
        await sleep(RATE_LIMIT_DELAY);

        let product;
        if (existing) {
            if (update) {
                log(`  🔄 Updating: ${pattern.name}`, 'yellow');
                // Update existing product
                const updateData = await shopifyRequest(`products/${existing.id}.json`, 'PUT', productData);
                product = updateData.product;
            } else {
                log(`  ⏭️ Skipping (exists): ${pattern.name}`, 'yellow');
                return { skipped: true, handle, id: existing.id };
            }
        } else {
            log(`  ✨ Creating: ${pattern.name}`, 'green');
            const createData = await shopifyRequest('products.json', 'POST', productData);
            console.log(`    📊 API Response keys: ${Object.keys(createData).join(', ')}`);
            console.log(`    📊 Full response:`, JSON.stringify(createData, null, 2).substring(0, 500));
            product = createData.product;
        }

        await sleep(RATE_LIMIT_DELAY);

        // Add thumbnail from local file so it always appears (re-import/URL often doesn't bring images in)
        if (product && product.id && hasLocalThumb && pattern.thumbnail) {
            const added = await addProductImageFromFile(product.id, pattern.thumbnail, `${pattern.name} pattern thumbnail`);
            if (added) log(`  🖼️ Image attached from file: ${pattern.name}`, 'green');
        }

        // Set metafields only for ColorFlex patterns (those with layers)
        if (product && product.id) {
            if (isColorFlex) {
                await setProductMetafields(product.id, metafields);
                log(`  ✅ Created with metafields: ${pattern.name} (ID: ${product.id})`, 'green');
            } else {
                log(`  ✅ Created (standard pattern): ${pattern.name} (ID: ${product.id})`, 'green');
            }
            return { created: true, handle, id: product.id };
        } else {
            log(`  ⚠️ Product created but no ID returned: ${pattern.name}`, 'yellow');
            return { created: true, handle, id: null };
        }

    } catch (error) {
        log(`  ❌ Error creating ${pattern.name}: ${error.message}`, 'red');
        return { error: true, handle, message: error.message };
    }
}

/**
 * Process all patterns in a collection
 */
async function processCollection(collectionName, options = {}) {
    const { dryRun = false, update = false } = options;

    log(`\n🎨 Processing collection: ${collectionName}`, 'blue');

    // Load collections.json (check data path, then src/assets, then project data/)
    const dataPath = process.env.COLORFLEX_DATA_PATH
        ? path.join(process.env.COLORFLEX_DATA_PATH, 'data', 'collections.json')
        : null;
    const assetsPath = path.join(process.cwd(), 'src', 'assets', 'collections.json');
    const projectDataPath = path.join(process.cwd(), 'data', 'collections.json');
    const collectionsPath = (dataPath && fs.existsSync(dataPath))
        ? dataPath
        : fs.existsSync(assetsPath)
            ? assetsPath
            : projectDataPath;
    if (!fs.existsSync(collectionsPath)) {
        throw new Error(`collections.json not found (checked ${dataPath || 'N/A'}, ${assetsPath}, ${projectDataPath})`);
    }

    const collectionsData = JSON.parse(fs.readFileSync(collectionsPath, 'utf8'));
    const collection = collectionsData.collections.find(c => c.name === collectionName);

    if (!collection) {
        throw new Error(`Collection "${collectionName}" not found in collections.json`);
    }

    log(`📦 Found ${collection.patterns.length} patterns in ${collectionName}`, 'blue');

    const results = {
        created: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
        dryRun: dryRun
    };

    for (const pattern of collection.patterns) {
        const result = await createProduct(pattern, collection, { dryRun, update });

        if (!result) {
            results.errors++;
        } else if (result.created) {
            results.created++;
        } else if (result.skipped) {
            results.skipped++;
        } else if (result.error) {
            results.errors++;
        } else if (result.dryRun) {
            results.created++;
        }

        // Rate limiting between products
        if (!dryRun) {
            await sleep(RATE_LIMIT_DELAY);
        }
    }

    // Summary
    log(`\n📊 Summary for ${collectionName}:`, 'blue');
    log(`   ✅ Created: ${results.created}`, 'green');
    if (results.skipped > 0) log(`   ⏭️ Skipped: ${results.skipped}`, 'yellow');
    if (results.errors > 0) log(`   ❌ Errors: ${results.errors}`, 'red');
    if (dryRun) log(`   🔍 (Dry run - no changes made)`, 'yellow');

    return results;
}

// Main execution
async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log(`
Usage: node scripts/shopify-create-products.js <collection-name> [options]

Options:
  --dry-run    Show what would be created without making changes
  --update     Update existing products instead of skipping them

Examples:
  node scripts/shopify-create-products.js english-cottage
  node scripts/shopify-create-products.js botanicals --dry-run
  node scripts/shopify-create-products.js abundance --update
`);
        process.exit(0);
    }

    // Check credentials
    if (!SHOPIFY_STORE || !SHOPIFY_ACCESS_TOKEN) {
        log('❌ Missing Shopify credentials. Add to .env or config/local.env:', 'red');
        log('   SHOPIFY_STORE=your-store.myshopify.com', 'yellow');
        log('   SHOPIFY_ACCESS_TOKEN=SHOPIFY_TOKEN_...', 'yellow');
        process.exit(1);
    }

    const collectionName = args[0];
    const dryRun = args.includes('--dry-run');
    const update = args.includes('--update');

    try {
        await processCollection(collectionName, { dryRun, update });
        log('\n✅ Done!', 'green');
    } catch (error) {
        log(`\n❌ Error: ${error.message}`, 'red');
        process.exit(1);
    }
}

main();
