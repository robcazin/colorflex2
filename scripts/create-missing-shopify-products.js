#!/usr/bin/env node

/**
 * Create Missing Shopify Products
 * 
 * This script specifically creates the 4 missing Folksie patterns:
 * - Folk Bouquet
 * - Fancy Pantry
 * - Country Kitchen
 * - First Bloom
 * 
 * Usage:
 *   node scripts/create-missing-shopify-products.js [--force]
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Import the createProduct function from shopify-create-products.js
// For simplicity, we'll duplicate the necessary functions here

const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const API_VERSION = '2025-01';
const BASE_SERVER_URL = 'https://so-animation.com/colorflex';
const RATE_LIMIT_DELAY = 550;

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
    const response = await fetch(url, options);
    if (response.status === 429) {
        log('⏳ Rate limited, waiting 2 seconds...', 'yellow');
        await sleep(2000);
        return shopifyRequest(endpoint, method, body);
    }
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Shopify API Error ${response.status}: ${errorText}`);
    }
    const text = await response.text();
    return text ? JSON.parse(text) : {};
}

async function findProductByHandle(handle) {
    try {
        const data = await shopifyRequest(`products.json?handle=${handle}&limit=1`);
        return data.products && data.products.length > 0 ? data.products[0] : null;
    } catch (error) {
        return null;
    }
}

async function createProduct(pattern, collection, force = false) {
    const patternFileName = pattern.name.toLowerCase().replace(/\s+/g, '-');
    const handle = `${collection.name}-${pattern.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    
    log(`\n🔍 Checking: ${pattern.name} (handle: ${handle})`, 'blue');
    
    // Check if product exists
    const existing = await findProductByHandle(handle);
    await sleep(RATE_LIMIT_DELAY);
    
    if (existing && !force) {
        log(`  ⏭️ Product already exists (ID: ${existing.id})`, 'yellow');
        log(`  💡 Use --force to update it`, 'yellow');
        return { skipped: true, handle, id: existing.id };
    }
    
    if (existing && force) {
        log(`  🔄 Updating existing product: ${pattern.name}`, 'yellow');
        // Update logic would go here
        return { updated: true, handle, id: existing.id };
    }
    
    // Create new product
    log(`  ✨ Creating new product: ${pattern.name}`, 'green');
    
    const thumbnailUrl = `${BASE_SERVER_URL}/data/collections/${collection.name}/thumbnails/${patternFileName}.jpg`;
    const isColorFlex = pattern.colorFlex === true;
    
    // Build product data (simplified - you may need to add more fields)
    const productData = {
        product: {
            title: pattern.name,
            handle: handle,
            body_html: `<p>${pattern.name}</p>`,
            vendor: 'Saffron Cottage',
            product_type: 'Wallpaper',
            images: [{
                src: thumbnailUrl
            }],
            variants: [{
                price: '0.00',
                inventory_management: null,
                inventory_policy: 'deny'
            }]
        }
    };
    
    try {
        const createData = await shopifyRequest('products.json', 'POST', productData);
        await sleep(RATE_LIMIT_DELAY);
        
        if (createData.product && createData.product.id) {
            log(`  ✅ Created: ${pattern.name} (ID: ${createData.product.id})`, 'green');
            return { created: true, handle, id: createData.product.id };
        } else {
            log(`  ⚠️ Created but no ID returned`, 'yellow');
            return { created: true, handle, id: null };
        }
    } catch (error) {
        log(`  ❌ Error: ${error.message}`, 'red');
        return { error: true, handle, message: error.message };
    }
}

async function main() {
    const args = process.argv.slice(2);
    const force = args.includes('--force');
    
    const missingPatterns = [
        'Folk Bouquet',
        'Fancy Pantry',
        'Country Kitchen',
        'First Bloom'
    ];
    
    log('🎨 Creating Missing Folksie Products', 'blue');
    log('=====================================\n', 'blue');
    
    if (!SHOPIFY_STORE || !SHOPIFY_ACCESS_TOKEN) {
        log('❌ Missing Shopify credentials. Create .env file with:', 'red');
        log('   SHOPIFY_STORE=your-store.myshopify.com', 'yellow');
        log('   SHOPIFY_ACCESS_TOKEN=SHOPIFY_TOKEN_...', 'yellow');
        process.exit(1);
    }
    
    // Load collections.json
    const collectionsPath = path.join(process.cwd(), 'data', 'collections.json');
    if (!fs.existsSync(collectionsPath)) {
        log(`❌ collections.json not found at ${collectionsPath}`, 'red');
        log(`💡 Make sure you have a symlink: ln -s /Volumes/K3/jobs/saffron/colorFlex-shopify/data data`, 'yellow');
        process.exit(1);
    }
    
    const collectionsData = JSON.parse(fs.readFileSync(collectionsPath, 'utf8'));
    const collection = collectionsData.collections.find(c => c.name === 'folksie' || c.name === 'folksie.fur-1');
    
    if (!collection) {
        log('❌ Folksie collection not found', 'red');
        process.exit(1);
    }
    
    log(`📦 Found ${collection.patterns.length} patterns in ${collection.name}\n`, 'blue');
    
    // Find the missing patterns
    const patternsToCreate = collection.patterns.filter(p => 
        missingPatterns.includes(p.name)
    );
    
    if (patternsToCreate.length === 0) {
        log('❌ None of the missing patterns found in collection', 'red');
        log(`   Looking for: ${missingPatterns.join(', ')}`, 'yellow');
        process.exit(1);
    }
    
    log(`✅ Found ${patternsToCreate.length} patterns to create:\n`, 'green');
    patternsToCreate.forEach(p => log(`   - ${p.name}`, 'blue'));
    log('');
    
    const results = {
        created: 0,
        skipped: 0,
        errors: 0
    };
    
    for (const pattern of patternsToCreate) {
        const result = await createProduct(pattern, collection, force);
        
        if (result.created) {
            results.created++;
        } else if (result.skipped) {
            results.skipped++;
        } else if (result.error) {
            results.errors++;
        }
        
        await sleep(RATE_LIMIT_DELAY);
    }
    
    log('\n📊 Summary:', 'blue');
    log(`   ✅ Created: ${results.created}`, 'green');
    if (results.skipped > 0) log(`   ⏭️ Skipped: ${results.skipped}`, 'yellow');
    if (results.errors > 0) log(`   ❌ Errors: ${results.errors}`, 'red');
}

main().catch(error => {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    process.exit(1);
});
