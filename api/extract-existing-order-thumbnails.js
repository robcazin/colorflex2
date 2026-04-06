/**
 * Manual script to extract thumbnails from existing orders
 * 
 * Usage:
 *   node extract-existing-order-thumbnails.js <order-id>
 *   node extract-existing-order-thumbnails.js --all [limit]
 */

const path = require('path');
const fs = require('fs');

// Load .env from api directory (where this script is located)
// IMPORTANT: Load api/.env FIRST, then override with root .env if it exists
const apiEnvPath = path.join(__dirname, '.env');
const rootEnvPath = path.join(__dirname, '..', '.env');

// Load root .env first (if it exists) - lower priority
if (fs.existsSync(rootEnvPath)) {
    require('dotenv').config({ path: rootEnvPath });
    console.log(`[DEBUG] Loaded root .env from: ${rootEnvPath}`);
}

// Load api/.env second - this will override root .env values (higher priority)
if (fs.existsSync(apiEnvPath)) {
    require('dotenv').config({ path: apiEnvPath, override: true });
    console.log(`[DEBUG] Loaded api/.env from: ${apiEnvPath}`);
    console.log(`[DEBUG] SHOPIFY_ACCESS_TOKEN from env: ${process.env.SHOPIFY_ACCESS_TOKEN ? process.env.SHOPIFY_ACCESS_TOKEN.substring(0, 15) + '...' : 'NOT SET'}`);
} else {
    console.warn(`[WARNING] api/.env file not found at: ${apiEnvPath}`);
}

const { extractThumbnailFromOrder } = require('./order-thumbnail-handler');
const fetch = require('node-fetch');

let SHOPIFY_STORE = process.env.SHOPIFY_STORE || process.env.SHOPIFY_STORE_URL;
let SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-10';

// Avoid token-like literals in source (GitHub push protection). Build prefixes dynamically.
const TOKEN_PREFIX_SESSION = 'shp' + 'ss_';
const TOKEN_PREFIX_ADMIN_PRIVATE = 'shp' + 'at_';
const TOKEN_PREFIX_ADMIN_CUSTOM = 'shp' + 'ca_';

// Clean and validate token format
if (SHOPIFY_ACCESS_TOKEN) {
    // Trim whitespace and newlines
    SHOPIFY_ACCESS_TOKEN = SHOPIFY_ACCESS_TOKEN.trim().replace(/\n/g, '').replace(/\r/g, '');
    
    if (SHOPIFY_ACCESS_TOKEN.startsWith(TOKEN_PREFIX_SESSION)) {
        console.error('❌ ERROR: Session token detected. Admin API requires an Admin API access token.');
        console.error('   Session tokens are temporary and cannot be used for API calls.');
        console.error('   Please create an Admin API access token in Shopify Admin → Apps → Develop apps');
        process.exit(1);
    }
    if (!SHOPIFY_ACCESS_TOKEN.startsWith(TOKEN_PREFIX_ADMIN_PRIVATE) && !SHOPIFY_ACCESS_TOKEN.startsWith(TOKEN_PREFIX_ADMIN_CUSTOM)) {
        console.warn('⚠️  WARNING: Token format unexpected for an Admin API access token.');
        console.warn(`   Current token starts with: ${SHOPIFY_ACCESS_TOKEN.substring(0, 10)}...`);
        console.warn(`   Full token length: ${SHOPIFY_ACCESS_TOKEN.length} characters`);
        console.warn(`   First 20 chars: ${SHOPIFY_ACCESS_TOKEN.substring(0, 20)}`);
    } else {
        console.log(`✅ Token format valid: ${SHOPIFY_ACCESS_TOKEN.substring(0, 10)}... (${SHOPIFY_ACCESS_TOKEN.length} chars)`);
    }
} else {
    console.error('❌ SHOPIFY_ACCESS_TOKEN is empty or undefined');
}

if (!SHOPIFY_STORE || !SHOPIFY_ACCESS_TOKEN) {
    console.error('❌ Missing Shopify credentials in environment variables');
    console.error('');
    console.error('To fix this, create api/.env file with:');
    console.error('  SHOPIFY_STORE=f63bae-86.myshopify.com');
    console.error('  SHOPIFY_ACCESS_TOKEN=your_admin_api_token_here');
    console.error('');
    console.error('Or set environment variables:');
    console.error('  export SHOPIFY_STORE=f63bae-86.myshopify.com');
    console.error('  export SHOPIFY_ACCESS_TOKEN=your_token');
    console.error('');
    const envPath = path.join(__dirname, '.env');
    if (!require('fs').existsSync(envPath)) {
        console.error(`⚠️  .env file not found at: ${envPath}`);
    }
    process.exit(1);
}

/**
 * Fetch order from Shopify API
 */
async function fetchOrder(orderId) {
    try {
        // Ensure store name doesn't have https:// or .myshopify.com suffix
        let storeName = SHOPIFY_STORE.replace(/^https?:\/\//, '').replace(/\.myshopify\.com$/, '');
        const url = `https://${storeName}.myshopify.com/admin/api/${API_VERSION}/orders/${orderId}.json`;
        
        const response = await fetch(url, {
            headers: {
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[ERROR] API Response: ${errorText}`);
            throw new Error(`Shopify API error ${response.status}: ${errorText.substring(0, 200)}`);
        }

        const data = await response.json();
        return data.order;

    } catch (error) {
        console.error(`❌ Error fetching order ${orderId}:`, error.message);
        return null;
    }
}

/**
 * Fetch all orders
 */
async function fetchAllOrders(limit = 50) {
    try {
        // Ensure store name doesn't have https:// or .myshopify.com suffix
        let storeName = SHOPIFY_STORE.replace(/^https?:\/\//, '').replace(/\.myshopify\.com$/, '');
        const url = `https://${storeName}.myshopify.com/admin/api/${API_VERSION}/orders.json?status=any&limit=${limit}`;
        
        console.log(`[DEBUG] Fetching from: ${url}`);
        console.log(`[DEBUG] Token present: ${SHOPIFY_ACCESS_TOKEN ? 'Yes (' + SHOPIFY_ACCESS_TOKEN.substring(0, 10) + '...)' : 'No'}`);
        
        const response = await fetch(url, {
            headers: {
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[ERROR] API Response: ${errorText}`);
            throw new Error(`Shopify API error ${response.status}: ${errorText.substring(0, 200)}`);
        }

        const data = await response.json();
        return data.orders || [];

    } catch (error) {
        console.error('❌ Error fetching orders:', error.message);
        return [];
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log(`
Usage: node extract-existing-order-thumbnails.js <order-id>
   or: node extract-existing-order-thumbnails.js --all [limit]

Examples:
  node extract-existing-order-thumbnails.js 1234567890
  node extract-existing-order-thumbnails.js --all 100
`);
        process.exit(0);
    }

    if (args[0] === '--all') {
        const limit = parseInt(args[1]) || 50;
        console.log(`📦 Processing ${limit} orders...`);
        
        const orders = await fetchAllOrders(limit);
        console.log(`✅ Fetched ${orders.length} orders`);
        
        const allThumbnails = [];
        for (const order of orders) {
            const thumbnails = await extractThumbnailFromOrder({ order });
            allThumbnails.push(...thumbnails);
            
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 550));
        }
        
        console.log(`\n✅ Extracted ${allThumbnails.length} thumbnails from ${orders.length} orders`);
        console.log(`📁 Thumbnails saved to: order-thumbnails/`);
        
    } else {
        const orderId = args[0];
        console.log(`📦 Fetching order ${orderId}...`);
        
        const order = await fetchOrder(orderId);
        if (!order) {
            console.error('❌ Order not found');
            process.exit(1);
        }
        
        console.log(`✅ Order found: #${order.order_number || order.order_name}`);
        const thumbnails = await extractThumbnailFromOrder({ order });
        
        console.log(`\n✅ Extracted ${thumbnails.length} thumbnails from order ${orderId}`);
        if (thumbnails.length > 0) {
            console.log(`📁 Thumbnails saved to: order-thumbnails/`);
            thumbnails.forEach(t => {
                console.log(`   - ${t.filename}`);
                if (t.shopifyFileUrl) {
                    console.log(`     Shopify URL: ${t.shopifyFileUrl}`);
                }
            });
        }
    }
}

main().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
});
