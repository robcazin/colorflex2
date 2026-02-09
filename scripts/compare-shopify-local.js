#!/usr/bin/env node
/**
 * Compare local collections.json with Shopify products
 * Shows which patterns are missing from Shopify
 */

require('dotenv').config();
const fs = require('fs');

const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

async function getShopifyProducts() {
    let allProducts = [];
    let url = `https://${SHOPIFY_STORE}/admin/api/2024-01/products.json?limit=250`;

    while (url) {
        const response = await fetch(url, {
            headers: {
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        allProducts = allProducts.concat(data.products || []);

        // Check for pagination
        const linkHeader = response.headers.get('link');
        if (linkHeader && linkHeader.includes('rel="next"')) {
            const match = linkHeader.match(/<([^>]+)>; rel="next"/);
            url = match ? match[1] : null;
        } else {
            url = null;
        }
    }
    return allProducts;
}

async function main() {
    console.log('🔍 Fetching Shopify products...');
    const shopifyProducts = await getShopifyProducts();
    console.log(`📦 Found ${shopifyProducts.length} products in Shopify\n`);

    // Get handles from Shopify
    const shopifyHandles = new Set(shopifyProducts.map(p => p.handle.toLowerCase()));

    // Load local collections
    const collections = JSON.parse(fs.readFileSync('data/collections.json', 'utf8'));

    console.log('📊 Comparing local collections to Shopify:\n');

    let totalMissing = 0;
    const missingByCollection = {};

    for (const collection of collections.collections) {
        // Skip clothing/furniture variants
        if (collection.name.includes('.clo') || collection.name.includes('.fur')) continue;

        const missing = [];
        for (const pattern of collection.patterns) {
            // Check both full handle (collection-pattern) and short handle (pattern only)
            const fullHandle = `${collection.name}-${pattern.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
            const shortHandle = pattern.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            if (!shopifyHandles.has(fullHandle) && !shopifyHandles.has(shortHandle)) {
                missing.push(pattern.name);
            }
        }

        if (missing.length > 0) {
            console.log(`❌ ${collection.name}: ${missing.length} missing`);
            missing.forEach(p => console.log(`   - ${p}`));
            totalMissing += missing.length;
            missingByCollection[collection.name] = missing;
        } else {
            console.log(`✅ ${collection.name}: All ${collection.patterns.length} patterns in Shopify`);
        }
    }

    console.log(`\n📈 Total missing from Shopify: ${totalMissing} patterns`);

    if (totalMissing > 0) {
        console.log('\n💡 To add missing patterns, run:');
        for (const collName of Object.keys(missingByCollection)) {
            console.log(`   node scripts/shopify-create-products.js ${collName}`);
        }
    }
}

main();
