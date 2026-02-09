/**
 * Order Thumbnail Handler
 * Extracts thumbnails from order line item properties and saves them for admin viewing
 * 
 * This should be set up as a Shopify webhook: orders/create
 * Webhook URL: https://your-api-server.com/api/orders/thumbnail-extract
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const SHOPIFY_STORE = process.env.SHOPIFY_STORE || process.env.SHOPIFY_STORE_URL;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || '2024-10';
const THUMBNAIL_OUTPUT_DIR = path.join(__dirname, '../order-thumbnails');

// Ensure output directory exists
if (!fs.existsSync(THUMBNAIL_OUTPUT_DIR)) {
    fs.mkdirSync(THUMBNAIL_OUTPUT_DIR, { recursive: true });
}

/**
 * Extract thumbnail from order line item properties and save it
 */
async function extractThumbnailFromOrder(orderData) {
    try {
        const order = orderData.order || orderData;
        
        if (!order || !order.line_items) {
            console.log('[ORDER THUMBNAIL] No line items in order');
            return [];
        }

        const extractedThumbnails = [];

        for (const lineItem of order.line_items) {
            // Convert Shopify properties array to object for easier access
            // Shopify returns properties as: [{name: "key", value: "value"}, ...]
            const properties = {};
            if (lineItem.properties && Array.isArray(lineItem.properties)) {
                lineItem.properties.forEach(prop => {
                    if (prop.name && prop.value !== null && prop.value !== undefined) {
                        properties[prop.name] = prop.value;
                    }
                });
            } else if (lineItem.properties && typeof lineItem.properties === 'object') {
                // Fallback: if it's already an object, use it directly
                Object.assign(properties, lineItem.properties);
            }
            
            // Debug: Show all properties for this line item
            if (Object.keys(properties).length > 0) {
                console.log(`[DEBUG] Line item "${lineItem.name}" has ${Object.keys(properties).length} properties:`);
                Object.entries(properties).forEach(([key, value]) => {
                    const preview = key === '_pattern_preview' || key === 'pattern_preview' || key === 'Pattern Preview';
                    let valuePreview;
                    if (preview && typeof value === 'string') {
                        valuePreview = value ? `${value.substring(0, 50)}... (${value.length} chars)` : 'empty';
                    } else {
                        valuePreview = typeof value === 'string' ? value.substring(0, 100) : String(value);
                    }
                    console.log(`  - ${key}: ${valuePreview}`);
                });
            }
            
            // Check if this is a ColorFlex item
            const isColorFlex = Object.keys(properties).length > 0 && (
                properties['Custom Pattern'] ||
                properties['ColorFlex Design'] === 'Yes' ||
                properties['_pattern_preview'] ||
                properties['pattern_preview'] ||
                properties['Pattern Preview']
            );

            if (!isColorFlex) {
                console.log(`[DEBUG] Skipping line item "${lineItem.name}" - not a ColorFlex item`);
                continue;
            }
            
            console.log(`[DEBUG] Found ColorFlex item: "${lineItem.name}"`);

            const patternName = properties['Custom Pattern'] || 
                              properties['Pattern Name'] || 
                              'unknown-pattern';
            const collection = properties['Pattern Collection'] || 
                             properties['Collection'] || 
                             'unknown-collection';
            
            // Get thumbnail from properties (try both with and without underscore)
            let thumbnailBase64 = properties['_pattern_preview'] || 
                                 properties['pattern_preview'] ||
                                 properties['Pattern Preview'];
            
            if (!thumbnailBase64) {
                console.log(`[ORDER THUMBNAIL] ⚠️ No thumbnail found for ${patternName} in order ${order.id}`);
                continue;
            }

            // Clean base64 data (remove data:image prefix if present)
            const base64Data = thumbnailBase64.replace(/^data:image\/\w+;base64,/, '');
            
            // Convert base64 to buffer
            let buffer;
            try {
                buffer = Buffer.from(base64Data, 'base64');
            } catch (error) {
                console.error(`[ORDER THUMBNAIL] ❌ Invalid base64 data for ${patternName}:`, error.message);
                continue;
            }

            // Generate filename
            const safePatternName = patternName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const safeCollection = collection.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const filename = `${order.id}-${order.order_number || 'unknown'}-${safeCollection}-${safePatternName}-${lineItem.id}.jpg`;
            const filepath = path.join(THUMBNAIL_OUTPUT_DIR, filename);

            // Save thumbnail
            fs.writeFileSync(filepath, buffer);
            console.log(`[ORDER THUMBNAIL] ✅ Saved thumbnail: ${filename}`);

            // Optionally upload to Shopify Files and store URL in order metafields
            let shopifyFileUrl = null;
            if (SHOPIFY_STORE && SHOPIFY_ACCESS_TOKEN) {
                try {
                    shopifyFileUrl = await uploadThumbnailToShopifyFiles(buffer, filename, SHOPIFY_STORE, SHOPIFY_ACCESS_TOKEN);
                    
                    // Store thumbnail URL in order metafield for easy admin access
                    if (shopifyFileUrl) {
                        await addThumbnailToOrderMetafield(order.id, lineItem.id, shopifyFileUrl, SHOPIFY_STORE, SHOPIFY_ACCESS_TOKEN);
                    }
                } catch (uploadError) {
                    console.error(`[ORDER THUMBNAIL] ⚠️ Failed to upload to Shopify Files:`, uploadError.message);
                }
            }

            extractedThumbnails.push({
                orderId: order.id,
                orderNumber: order.order_number || order.order_name,
                lineItemId: lineItem.id,
                patternName: patternName,
                collection: collection,
                filename: filename,
                filepath: filepath,
                shopifyFileUrl: shopifyFileUrl
            });
        }

        return extractedThumbnails;

    } catch (error) {
        console.error(`[ORDER THUMBNAIL] ❌ Error extracting thumbnails from order:`, error.message);
        return [];
    }
}

/**
 * Upload thumbnail to Shopify Files
 */
async function uploadThumbnailToShopifyFiles(buffer, filename, shopifyStore, shopifyToken) {
    try {
        const imageBase64 = buffer.toString('base64');
        
        const url = `https://${shopifyStore}.myshopify.com/admin/api/${API_VERSION}/files.json`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': shopifyToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                file: {
                    attachment: imageBase64,
                    filename: filename,
                    content_type: 'image/jpeg'
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Shopify API error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return data.file.url;
        
    } catch (error) {
        console.error(`[ORDER THUMBNAIL] Error uploading to Shopify Files:`, error.message);
        throw error;
    }
}

/**
 * Add thumbnail URL to order metafield for admin viewing
 */
async function addThumbnailToOrderMetafield(orderId, lineItemId, thumbnailUrl, shopifyStore, shopifyToken) {
    try {
        // Store in order metafields with line item reference
        const metafieldData = {
            metafield: {
                namespace: 'colorflex',
                key: `line_item_${lineItemId}_thumbnail`,
                value: thumbnailUrl,
                type: 'url',
                description: 'ColorFlex pattern thumbnail for order fulfillment'
            }
        };

        const url = `https://${shopifyStore}.myshopify.com/admin/api/${API_VERSION}/orders/${orderId}/metafields.json`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': shopifyToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(metafieldData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.warn(`[ORDER THUMBNAIL] ⚠️ Could not add metafield: ${errorText}`);
            return false;
        }

        console.log(`[ORDER THUMBNAIL] ✅ Added thumbnail URL to order metafield`);
        return true;
        
    } catch (error) {
        console.error(`[ORDER THUMBNAIL] Error adding metafield:`, error.message);
        return false;
    }
}

module.exports = { extractThumbnailFromOrder };
