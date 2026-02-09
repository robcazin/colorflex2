/**
 * Shopify Customer Metafields API Handler
 * Handles saving/loading ColorFlex patterns to customer metafields
 */

const SHOPIFY_STORE_URL = process.env.SHOPIFY_STORE_URL;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

// Customer Metafield configuration
const METAFIELD_CONFIG = {
    namespace: 'colorFlex',
    key: 'saved_patterns',
    type: 'json',
    description: 'ColorFlex saved pattern configurations'
};

/**
 * Save pattern to customer metafields
 */
async function savePatternToCustomer(customerId, patternData, customerAccessToken) {
    try {
        // Validate customer access
        const customer = await validateCustomerAccess(customerId, customerAccessToken);
        if (!customer) {
            throw new Error('Invalid customer access');
        }

        // Get existing saved patterns
        const existingPatterns = await getCustomerSavedPatterns(customerId);
        
        // Add new pattern (limit to 50 patterns max)
        existingPatterns.push(patternData);
        const limitedPatterns = existingPatterns.slice(-50);

        // Save to Shopify metafields
        const metafieldData = {
            metafield: {
                namespace: METAFIELD_CONFIG.namespace,
                key: METAFIELD_CONFIG.key,
                value: JSON.stringify(limitedPatterns),
                type: METAFIELD_CONFIG.type,
                description: METAFIELD_CONFIG.description
            }
        };

        const response = await fetch(`${SHOPIFY_STORE_URL}/admin/api/2023-10/customers/${customerId}/metafields.json`, {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(metafieldData)
        });

        if (!response.ok) {
            throw new Error(`Shopify API error: ${response.status}`);
        }

        const result = await response.json();
        return {
            success: true,
            metafield: result.metafield,
            totalPatterns: limitedPatterns.length
        };

    } catch (error) {
        console.error('Error saving pattern to customer:', error);
        throw error;
    }
}

/**
 * Get customer's saved patterns
 */
async function getCustomerSavedPatterns(customerId, customerAccessToken) {
    try {
        // Validate customer access
        const customer = await validateCustomerAccess(customerId, customerAccessToken);
        if (!customer) {
            throw new Error('Invalid customer access');
        }

        // Fetch metafields for this customer
        const response = await fetch(`${SHOPIFY_STORE_URL}/admin/api/2023-10/customers/${customerId}/metafields.json?namespace=${METAFIELD_CONFIG.namespace}&key=${METAFIELD_CONFIG.key}`, {
            headers: {
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                return []; // No saved patterns yet
            }
            throw new Error(`Shopify API error: ${response.status}`);
        }

        const result = await response.json();
        const metafield = result.metafields[0];
        
        return metafield ? JSON.parse(metafield.value) : [];

    } catch (error) {
        console.error('Error fetching customer patterns:', error);
        return []; // Return empty array on error
    }
}

/**
 * Delete a specific pattern from customer's saved list
 */
async function deleteCustomerPattern(customerId, patternId, customerAccessToken) {
    try {
        // Validate customer access
        const customer = await validateCustomerAccess(customerId, customerAccessToken);
        if (!customer) {
            throw new Error('Invalid customer access');
        }

        // Get existing patterns
        const existingPatterns = await getCustomerSavedPatterns(customerId);
        
        // Remove the pattern with matching ID
        const updatedPatterns = existingPatterns.filter(pattern => pattern.id !== patternId);

        if (updatedPatterns.length === existingPatterns.length) {
            throw new Error('Pattern not found');
        }

        // Update metafield with remaining patterns
        const metafieldData = {
            metafield: {
                namespace: METAFIELD_CONFIG.namespace,
                key: METAFIELD_CONFIG.key,
                value: JSON.stringify(updatedPatterns),
                type: METAFIELD_CONFIG.type
            }
        };

        const response = await fetch(`${SHOPIFY_STORE_URL}/admin/api/2023-10/customers/${customerId}/metafields.json`, {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(metafieldData)
        });

        if (!response.ok) {
            throw new Error(`Shopify API error: ${response.status}`);
        }

        return {
            success: true,
            deletedPatternId: patternId,
            remainingPatterns: updatedPatterns.length
        };

    } catch (error) {
        console.error('Error deleting customer pattern:', error);
        throw error;
    }
}

/**
 * Validate customer access token
 */
async function validateCustomerAccess(customerId, customerAccessToken) {
    try {
        // Verify customer access token with Shopify
        const response = await fetch(`${SHOPIFY_STORE_URL}/admin/api/2023-10/customers/${customerId}.json`, {
            headers: {
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
                'X-Shopify-Customer-Access-Token': customerAccessToken,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return null;
        }

        const result = await response.json();
        return result.customer;

    } catch (error) {
        console.error('Error validating customer access:', error);
        return null;
    }
}

module.exports = {
    savePatternToCustomer,
    getCustomerSavedPatterns,
    deleteCustomerPattern,
    validateCustomerAccess
};