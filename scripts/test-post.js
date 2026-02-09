require('dotenv').config();
const https = require('https');

const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

const productData = {
  product: {
    title: "Test CLI Product 123",
    vendor: "Saffron Cottage",
    product_type: "ColorFlex Pattern",
    published: true
  }
};

const postData = JSON.stringify(productData);

const options = {
  hostname: SHOPIFY_STORE,
  port: 443,
  path: '/admin/api/2025-01/products.json',
  method: 'POST',
  headers: {
    'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Sending POST request with native https module...');
console.log('Host:', options.hostname);
console.log('Path:', options.path);

const req = https.request(options, (res) => {
  console.log('Status:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    const parsed = JSON.parse(data);
    if (parsed.product) {
      console.log('✅ SUCCESS! Product created:', parsed.product.title);
      console.log('   ID:', parsed.product.id);
      console.log('   Handle:', parsed.product.handle);
    } else if (parsed.products) {
      console.log('❌ ERROR: Got products list instead of single product');
      console.log('   First product:', parsed.products[0]?.title);
    } else if (parsed.errors) {
      console.log('❌ ERROR:', JSON.stringify(parsed.errors, null, 2));
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.write(postData);
req.end();
