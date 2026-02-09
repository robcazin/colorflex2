require('dotenv').config();
const fetch = require('node-fetch');

const token = process.env.SHOPIFY_ACCESS_TOKEN?.trim();
const store = (process.env.SHOPIFY_STORE || process.env.SHOPIFY_STORE_URL || '')
    .replace(/^https?:\/\//, '')
    .replace(/\.myshopify\.com$/, '')
    .trim();

const API_VERSION = '2025-01';
const url = `https://${store}.myshopify.com/admin/api/${API_VERSION}/files.json`;

console.log('🧪 Testing Shopify Files API endpoint...');
console.log('Store:', store);
console.log('API Version:', API_VERSION);
console.log('URL:', url);
console.log('Token prefix:', token?.substring(0, 15) + '...');
console.log('');

// Test 1: GET request to see if endpoint exists
console.log('Test 1: GET request to check endpoint...');
fetch(url, {
    method: 'GET',
    headers: {
        'X-Shopify-Access-Token': token,
        'Accept': 'application/json'
    }
})
.then(r => {
    console.log('GET Status:', r.status, r.statusText);
    return r.text();
})
.then(t => {
    console.log('GET Response (first 300 chars):', t.substring(0, 300));
    console.log('');
    
    // Test 2: POST with minimal data
    console.log('Test 2: POST request with minimal test data...');
    const testBody = {
        file: {
            attachment: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', // 1x1 red pixel PNG
            filename: 'test-pixel.png',
            content_type: 'image/png'
        }
    };
    
    return fetch(url, {
        method: 'POST',
        headers: {
            'X-Shopify-Access-Token': token,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(testBody)
    });
})
.then(r => {
    console.log('POST Status:', r.status, r.statusText);
    console.log('Response headers:', Object.fromEntries(r.headers.entries()));
    return r.text();
})
.then(t => {
    if (t) {
        console.log('POST Response:', t.substring(0, 500));
    } else {
        console.log('POST Response: (empty body)');
    }
})
.catch(e => {
    console.error('Error:', e.message);
    console.error(e.stack);
});
