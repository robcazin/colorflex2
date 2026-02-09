// Server-side API for Shopify Pattern Integration
// This endpoint fetches available patterns from Shopify product catalog

const express = require('express');
const router = express.Router();

// Shopify Admin API configuration (would come from environment variables)
const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL || 'your-store.myshopify.com';
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || 'your-access-token';

// Cache for Shopify responses
const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Helper function to make Shopify API calls
async function fetchFromShopify(endpoint) {
    const url = `https://${SHOPIFY_STORE_URL}/admin/api/2023-10/${endpoint}`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Shopify API call failed:', error);
        throw error;
    }
}

// Get patterns for a specific collection
router.get('/patterns/:collectionName', async (req, res) => {
    const { collectionName } = req.params;
    const cacheKey = `patterns_${collectionName}`;
    
    try {
        // Check cache first
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            console.log(`Serving cached patterns for ${collectionName}`);
            return res.json({
                success: true,
                patterns: cached.data,
                cached: true,
                collection: collectionName
            });
        }

        console.log(`Fetching fresh patterns from Shopify for ${collectionName}`);

        // Fetch products from Shopify
        // Filter by product type and tags
        const products = await fetchShopifyProducts({
            product_type: 'ColorFlex Pattern,Standard Pattern',
            tag: collectionName,
            status: 'active',
            limit: 250 // Shopify's max per request
        });

        // Transform Shopify products to our pattern format
        const patterns = products.map(product => transformShopifyProduct(product, collectionName));

        // Cache the results
        cache.set(cacheKey, {
            data: patterns,
            timestamp: Date.now()
        });

        res.json({
            success: true,
            patterns: patterns,
            cached: false,
            collection: collectionName,
            count: patterns.length
        });

    } catch (error) {
        console.error(`Error fetching patterns for ${collectionName}:`, error);
        res.status(500).json({
            success: false,
            error: error.message,
            collection: collectionName
        });
    }
});

// Fetch products from Shopify with filters
async function fetchShopifyProducts(filters = {}) {
    const queryParams = new URLSearchParams();
    
    // Add filters to query
    Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            queryParams.append(key, value);
        }
    });

    // Fetch products with metafields
    const endpoint = `products.json?${queryParams.toString()}&fields=id,title,handle,status,product_type,tags,images,variants,metafields`;
    
    const response = await fetchFromShopify(endpoint);
    return response.products || [];
}

// Transform Shopify product to our pattern format
function transformShopifyProduct(product, collectionName) {
    // Extract pattern info from metafields
    const metafields = product.metafields || [];
    const getMetafield = (key) => {
        const field = metafields.find(m => m.key === key && m.namespace === 'color_flex');
        return field ? field.value : null;
    };

    return {
        id: product.id,
        handle: product.handle,
        name: product.title,
        collectionName: collectionName,
        
        // Use Shopify product image as thumbnail
        image: product.images && product.images.length > 0 ? {
            src: product.images[0].src,
            alt: product.images[0].alt || product.title,
            width: product.images[0].width,
            height: product.images[0].height
        } : null,
        
        // Product status and availability
        status: product.status,
        available: product.status === 'active',
        
        // Pricing from first variant
        price: product.variants && product.variants.length > 0 ? 
            product.variants[0].price : null,
        
        // Product type (ColorFlex vs Standard)
        productType: product.product_type,
        isColorFlex: product.product_type === 'ColorFlex Pattern',
        
        // Tags for filtering
        tags: product.tags ? product.tags.split(',').map(tag => tag.trim()) : [],
        
        // ColorFlex metafields
        metafields: {
            pattern: getMetafield('pattern'),
            collection: getMetafield('collection'),
            patternNumber: getMetafield('pattern_number'),
            collectionSequence: getMetafield('collection_sequence'),
            patternSequence: getMetafield('pattern_sequence'),
            patternVariant: getMetafield('pattern_variant'),
            layerCount: getMetafield('layer_count'),
            layerLabels: getMetafield('layer_labels'),
            patternSize: getMetafield('pattern_size'),
            tilingType: getMetafield('tiling_type'),
            designerColors: getMetafield('designer_colors'),
            baseUrl: getMetafield('base_url')
        },
        
        // Link to product page
        productUrl: `https://${SHOPIFY_STORE_URL}/products/${product.handle}`,
        
        // Admin link (for internal use)
        adminUrl: `https://${SHOPIFY_STORE_URL}/admin/products/${product.id}`
    };
}

// Get all available collections
router.get('/collections', async (req, res) => {
    try {
        // Fetch all products and extract unique collections
        const products = await fetchShopifyProducts({
            product_type: 'ColorFlex Pattern,Standard Pattern',
            status: 'active',
            limit: 250
        });

        // Extract collections from tags
        const collections = new Set();
        products.forEach(product => {
            if (product.tags) {
                const tags = product.tags.split(',').map(tag => tag.trim().toLowerCase());
                // Known collection names
                const knownCollections = [
                    'abundance', 'botanicals', 'farmhouse', 'english-cottage',
                    'traditions', 'bombay', 'geometry', 'silk-road', 
                    'new-orleans', 'folksie', 'coordinates', 'coverlets'
                ];
                
                tags.forEach(tag => {
                    if (knownCollections.includes(tag)) {
                        collections.add(tag);
                    }
                });
            }
        });

        res.json({
            success: true,
            collections: Array.from(collections).sort(),
            totalProducts: products.length
        });

    } catch (error) {
        console.error('Error fetching collections:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        service: 'Shopify Pattern Integration',
        timestamp: new Date().toISOString(),
        cache: {
            size: cache.size,
            keys: Array.from(cache.keys())
        }
    });
});

// Clear cache endpoint (for development)
router.post('/cache/clear', (req, res) => {
    cache.clear();
    res.json({
        success: true,
        message: 'Cache cleared',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;