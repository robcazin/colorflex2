#!/usr/bin/env node
/**
 * Verify Shopify Admin API Connection
 * Run: node scripts/verify-shopify-api.js
 */

require('dotenv').config();

const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

async function verifyConnection() {
    console.log('🔍 Verifying Shopify API connection...\n');

    // Check environment variables
    if (!SHOPIFY_STORE) {
        console.error('❌ SHOPIFY_STORE not set in .env');
        process.exit(1);
    }
    if (!SHOPIFY_ACCESS_TOKEN) {
        console.error('❌ SHOPIFY_ACCESS_TOKEN not set in .env');
        process.exit(1);
    }

    console.log(`📍 Store: ${SHOPIFY_STORE}`);
    console.log(`🔑 Token: ${SHOPIFY_ACCESS_TOKEN.substring(0, 10)}...${SHOPIFY_ACCESS_TOKEN.slice(-4)}`);
    console.log('');

    try {
        // Test API connection by fetching shop info
        const shopResponse = await fetch(
            `https://${SHOPIFY_STORE}/admin/api/2024-01/shop.json`,
            {
                headers: {
                    'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!shopResponse.ok) {
            const errorText = await shopResponse.text();
            throw new Error(`API Error ${shopResponse.status}: ${errorText}`);
        }

        const shopData = await shopResponse.json();
        console.log(`✅ Connected to: ${shopData.shop.name}`);
        console.log(`   Email: ${shopData.shop.email}`);
        console.log(`   Domain: ${shopData.shop.domain}`);

        // Test product access
        const productsResponse = await fetch(
            `https://${SHOPIFY_STORE}/admin/api/2024-01/products/count.json`,
            {
                headers: {
                    'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!productsResponse.ok) {
            throw new Error('Cannot access products - check API scopes');
        }

        const productsData = await productsResponse.json();
        console.log(`   Products: ${productsData.count}`);

        console.log('\n✅ Shopify API connection successful!');
        console.log('   You can now use the product creation scripts.\n');

    } catch (error) {
        console.error('\n❌ Connection failed:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Check SHOPIFY_STORE is correct (e.g., saffroncottage.shop)');
        console.error('2. Check SHOPIFY_ACCESS_TOKEN is valid');
        console.error('3. Ensure the app has write_products scope');
        process.exit(1);
    }
}

verifyConnection();
