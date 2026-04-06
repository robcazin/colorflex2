/**
 * ColorFlex Shopify API Server
 * Express server for handling customer metafield operations
 */

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');
const { 
    savePatternToCustomer, 
    getCustomerSavedPatterns, 
    deleteCustomerPattern 
} = require('./shopify-metafields');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy (needed for rate limiter when behind ngrok/proxy)
// Only trust the first proxy (ngrok) to prevent IP spoofing
// Set to 1 to only trust the first proxy hop
app.set('trust proxy', 1);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://your-shopify-store.myshopify.com'],
    credentials: true
}));

// Rate limiting - configure to work with proxy
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP',
    // Use standardHeaders for better proxy compatibility
    standardHeaders: true,
    legacyHeaders: false,
    // Skip validation warnings in development (ngrok/proxy setup)
    skip: (req) => {
        // In development, we're behind ngrok, so skip validation
        return process.env.NODE_ENV === 'development';
    }
});
app.use('/api/', limiter);

/**
 * Save pattern to customer metafields
 * POST /api/colorFlex/save-pattern
 */
app.post('/api/colorFlex/save-pattern', async (req, res) => {
    try {
        const { customerId, patternData } = req.body;
        const customerAccessToken = req.headers['x-shopify-customer-access-token'];

        // Validate required fields
        if (!customerId || !patternData || !customerAccessToken) {
            return res.status(400).json({
                error: 'Missing required fields: customerId, patternData, or access token'
            });
        }

        // Validate pattern data structure
        if (!patternData.pattern || !patternData.pattern.name || !patternData.pattern.collection) {
            return res.status(400).json({
                error: 'Invalid pattern data structure'
            });
        }

        // Save to Shopify
        const result = await savePatternToCustomer(customerId, patternData, customerAccessToken);

        res.json({
            success: true,
            message: 'Pattern saved successfully',
            data: result
        });

    } catch (error) {
        console.error('Save pattern error:', error);
        res.status(500).json({
            error: 'Failed to save pattern',
            message: error.message
        });
    }
});

/**
 * Get customer's saved patterns
 * GET /api/colorFlex/patterns/:customerId
 */
app.get('/api/colorFlex/patterns/:customerId', async (req, res) => {
    try {
        const { customerId } = req.params;
        const customerAccessToken = req.headers['x-shopify-customer-access-token'];

        if (!customerAccessToken) {
            return res.status(401).json({
                error: 'Customer access token required'
            });
        }

        const patterns = await getCustomerSavedPatterns(customerId, customerAccessToken);

        res.json({
            success: true,
            patterns: patterns,
            count: patterns.length
        });

    } catch (error) {
        console.error('Get patterns error:', error);
        res.status(500).json({
            error: 'Failed to retrieve patterns',
            message: error.message
        });
    }
});

/**
 * Delete a specific pattern
 * DELETE /api/colorFlex/patterns/:customerId/:patternId
 */
app.delete('/api/colorFlex/patterns/:customerId/:patternId', async (req, res) => {
    try {
        const { customerId, patternId } = req.params;
        const customerAccessToken = req.headers['x-shopify-customer-access-token'];

        if (!customerAccessToken) {
            return res.status(401).json({
                error: 'Customer access token required'
            });
        }

        const result = await deleteCustomerPattern(customerId, parseInt(patternId), customerAccessToken);

        res.json({
            success: true,
            message: 'Pattern deleted successfully',
            data: result
        });

    } catch (error) {
        console.error('Delete pattern error:', error);
        res.status(500).json({
            error: 'Failed to delete pattern',
            message: error.message
        });
    }
});

/**
 * Extract thumbnails from order (webhook handler)
 * POST /api/orders/thumbnail-extract
 * 
 * Set up as Shopify webhook: orders/create
 * Webhook URL: https://your-api-server.com/api/orders/thumbnail-extract
 */
app.post('/api/orders/thumbnail-extract', async (req, res) => {
    try {
        const orderData = req.body;
        
        if (!orderData || !orderData.order) {
            return res.status(400).json({
                error: 'Invalid order data'
            });
        }

        const { extractThumbnailFromOrder } = require('./order-thumbnail-handler');
        const thumbnails = await extractThumbnailFromOrder(orderData);

        // Return success even if no thumbnails found (not all orders have ColorFlex items)
        res.status(200).json({
            success: true,
            orderId: orderData.order.id,
            orderNumber: orderData.order.order_number || orderData.order.order_name,
            thumbnailsExtracted: thumbnails.length,
            thumbnails: thumbnails
        });

    } catch (error) {
        console.error('Extract thumbnail error:', error);
        // Return 200 to prevent webhook retries for processing errors
        res.status(200).json({
            success: false,
            error: 'Failed to extract thumbnails',
            message: error.message
        });
    }
});

/**
 * Upload thumbnail to Shopify Files and return URL
 * POST /api/upload-thumbnail
 * Body: { thumbnail: "data:image/jpeg;base64,...", filename: "pattern-thumbnail.jpg" }
 */
app.post('/api/upload-thumbnail', async (req, res) => {
    try {
        const { thumbnail, filename } = req.body;
        
        if (!thumbnail) {
            return res.status(400).json({
                error: 'Missing thumbnail data'
            });
        }

        // Extract base64 data from data URL if present
        let base64Data = thumbnail.replace(/^data:image\/\w+;base64,/, '');
        // Trim any whitespace
        base64Data = base64Data.trim();
        
        // Get Shopify credentials from environment
        const SHOPIFY_STORE = process.env.SHOPIFY_STORE || process.env.SHOPIFY_STORE_URL;
        const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
        // Force 2025-01 to match cf-dl.js which works - Files API may not work in newer versions
        const API_VERSION = '2025-01';
        
        if (!SHOPIFY_STORE || !SHOPIFY_ACCESS_TOKEN) {
            console.error('❌ Missing Shopify credentials:', {
                hasStore: !!SHOPIFY_STORE,
                hasToken: !!SHOPIFY_ACCESS_TOKEN
            });
            return res.status(500).json({
                error: 'Shopify credentials not configured'
            });
        }

        // Clean store name (remove https:// and .myshopify.com if present)
        const cleanStore = SHOPIFY_STORE.replace(/^https?:\/\//, '').replace(/\.myshopify\.com$/, '').trim();
        const cleanToken = SHOPIFY_ACCESS_TOKEN.trim();
        
        // Generate filename - sanitize to remove spaces and special characters
        const sanitizeFilename = (name) => {
            if (!name) return `colorflex-thumbnail-${Date.now()}.jpg`;
            // Remove path separators and keep only safe characters
            return name
                .replace(/[^a-zA-Z0-9._-]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')
                .substring(0, 255) || `colorflex-thumbnail-${Date.now()}.jpg`;
        };
        const finalFilename = sanitizeFilename(filename) || `colorflex-thumbnail-${Date.now()}.jpg`;
        
        // Use GraphQL fileCreate. Do NOT fall back to REST /files.json:
        // Shopify's REST Files endpoint may be unavailable in newer API versions
        // and can return 404/406. GraphQL works consistently and returns a file id
        // we can poll until a CDN URL is available.
        const graphqlUrl = `https://${cleanStore}.myshopify.com/admin/api/${API_VERSION}/graphql.json`;
        
        console.log('📤 Uploading to Shopify Files via GraphQL:', {
            store: cleanStore,
            apiVersion: API_VERSION,
            filename: finalFilename,
            base64Length: base64Data.length,
            tokenPrefix: cleanToken.substring(0, 10) + '...'
        });
        
        // GraphQL mutation for fileCreate
        const graphqlMutation = `
            mutation fileCreate($files: [FileCreateInput!]!) {
                fileCreate(files: $files) {
                    files {
                        id
                        fileStatus
                        ... on MediaImage {
                            id
                            image {
                                url
                                altText
                            }
                        }
                        ... on GenericFile {
                            id
                            url
                        }
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }
        `;
        
        const graphqlVariables = {
            files: [{
                originalSource: `data:image/jpeg;base64,${base64Data}`,
                alt: finalFilename
            }]
        };

        const response = await fetch(graphqlUrl, {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': cleanToken,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                query: graphqlMutation,
                variables: graphqlVariables
            })
        });

        const graphqlData = await response.json().catch(() => null);
        if (!response.ok) {
            throw new Error(`GraphQL HTTP ${response.status}: ${graphqlData ? JSON.stringify(graphqlData) : 'No JSON body'}`);
        }
        if (!graphqlData) {
            throw new Error('GraphQL response was not JSON');
        }
        if (graphqlData.errors) {
            console.error('❌ GraphQL errors:', graphqlData.errors);
            throw new Error(`GraphQL errors: ${JSON.stringify(graphqlData.errors)}`);
        }

        const fileCreate = graphqlData.data?.fileCreate;
        if (fileCreate?.userErrors?.length > 0) {
            console.error('❌ GraphQL user errors:', fileCreate.userErrors);
            throw new Error(`GraphQL user errors: ${JSON.stringify(fileCreate.userErrors)}`);
        }

        const createdFile = fileCreate?.files?.[0];
        const createdId = createdFile?.id;
        let shopifyUrl =
            createdFile?.image?.url ||
            createdFile?.url ||
            null;

        // Sometimes Shopify returns fileStatus=PROCESSING with no URL yet.
        // Poll by id for up to ~10s to get the final CDN URL.
        if (!shopifyUrl && createdId) {
            const pollQuery = `
              query fileNode($id: ID!) {
                node(id: $id) {
                  __typename
                  ... on MediaImage {
                    id
                    fileStatus
                    image { url altText }
                  }
                  ... on GenericFile {
                    id
                    fileStatus
                    url
                  }
                }
              }
            `;
            const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

            const maxAttempts = 10;
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                await sleep(1000);
                const pollRes = await fetch(graphqlUrl, {
                    method: 'POST',
                    headers: {
                        'X-Shopify-Access-Token': cleanToken,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        query: pollQuery,
                        variables: { id: createdId }
                    })
                });
                const pollJson = await pollRes.json().catch(() => null);
                const node = pollJson?.data?.node;
                shopifyUrl =
                    node?.image?.url ||
                    node?.url ||
                    null;
                if (shopifyUrl) break;
            }
        }

        if (!shopifyUrl) {
            console.error('❌ Upload succeeded but no URL returned:', {
                fileId: createdId,
                fileStatus: createdFile?.fileStatus,
            });
            throw new Error('Shopify did not return a file URL (still processing). Try again.');
        }

        console.log('✅ Shopify Files upload successful via GraphQL!');
        console.log('✅ File URL:', shopifyUrl);
        console.log('✅ File ID:', createdId);

        return res.json({
            success: true,
            url: shopifyUrl
        });

    } catch (error) {
        console.error('Upload thumbnail error:', error);
        res.status(500).json({
            error: 'Failed to upload thumbnail',
            message: error.message
        });
    }
});

/**
 * Generate Bassett room mockup image from current pattern (Python composite, no Photoshop).
 * POST /api/bassett/render
 * Body: { patternUrl?: string, patternDataUrl?: string, blanketColor?: string }
 * Returns: PNG image (Content-Type: image/png) or { error }.
 * Requires: BASSETT_REPO_ROOT, BASSETT_PSD_PATH on server; Python 3 + bassett_psd deps.
 */
app.post('/api/bassett/render', async (req, res) => {
  const REPO_ROOT = process.env.BASSETT_REPO_ROOT;
  const PSD_PATH = process.env.BASSETT_PSD_PATH;
  if (!REPO_ROOT || !PSD_PATH) {
    return res.status(503).json({
      error: 'Bassett render not configured',
      message: 'Set BASSETT_REPO_ROOT and BASSETT_PSD_PATH to enable instant room preview.'
    });
  }
  const scriptPath = path.join(REPO_ROOT, 'scripts', 'bassett_psd_export.py');
  const psdPath = path.resolve(PSD_PATH);
  if (!fs.existsSync(scriptPath) || !fs.existsSync(psdPath)) {
    return res.status(503).json({
      error: 'Bassett paths missing',
      message: 'Script or PSD not found. Check BASSETT_REPO_ROOT and BASSETT_PSD_PATH.'
    });
  }

  try {
    let { patternUrl, patternDataUrl, blanketColor = '#336699' } = req.body;
    if (!patternUrl && !patternDataUrl) {
      return res.status(400).json({ error: 'Provide patternUrl or patternDataUrl' });
    }
    if (typeof blanketColor !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(blanketColor.trim())) {
      blanketColor = '#336699';
    } else {
      blanketColor = blanketColor.trim();
    }

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bassett-'));
    const patternPath = path.join(tmpDir, 'pattern.png');
    const outDir = path.join(tmpDir, 'out');
    fs.mkdirSync(outDir, { recursive: true });

    try {
      if (patternDataUrl) {
        const base64 = patternDataUrl.replace(/^data:image\/\w+;base64,/, '').trim();
        fs.writeFileSync(patternPath, Buffer.from(base64, 'base64'));
      } else {
        const resp = await fetch(patternUrl, { redirect: 'follow' });
        if (!resp.ok) throw new Error(`Failed to fetch pattern: ${resp.status}`);
        const buf = Buffer.from(await resp.arrayBuffer());
        fs.writeFileSync(patternPath, buf);
      }

      await new Promise((resolve, reject) => {
        const py = spawn('python3', [
          scriptPath,
          psdPath,
          patternPath,
          '--out-dir', outDir,
          '--blanket', blanketColor
        ], { cwd: REPO_ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
        let stderr = '';
        py.stderr.on('data', (d) => { stderr += d.toString(); });
        py.on('close', (code) => {
          if (code === 0) resolve();
          else reject(new Error(stderr || `Python exited ${code}`));
        });
      });

      const compositePath = path.join(outDir, 'composite.png');
      if (!fs.existsSync(compositePath)) {
        throw new Error('Composite not produced');
      }
      const png = fs.readFileSync(compositePath);
      res.set('Content-Type', 'image/png');
      res.send(png);
    } finally {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch (_) {}
    }
  } catch (error) {
    console.error('Bassett render error:', error);
    res.status(500).json({
      error: 'Bassett render failed',
      message: error.message || String(error)
    });
  }
});

/**
 * Upload Bassett room mockup result (sofa composite from run_bassett_photoshop.sh)
 * POST /api/bassett/upload-result
 * Body: { image: "data:image/png;base64,...", filename?: "bassett-sofa.png" }
 * Returns: { success, url } for use as room mockup image.
 */
app.post('/api/bassett/upload-result', async (req, res) => {
  try {
    const { image, filename } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Missing image data' });
    }
    let base64Data = image.replace(/^data:image\/\w+;base64,/, '').trim();
    const SHOPIFY_STORE = process.env.SHOPIFY_STORE || process.env.SHOPIFY_STORE_URL;
    const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
    const API_VERSION = '2025-01';
    if (!SHOPIFY_STORE || !SHOPIFY_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'Shopify credentials not configured' });
    }
    const cleanStore = SHOPIFY_STORE.replace(/^https?:\/\//, '').replace(/\.myshopify\.com$/, '').trim();
    const finalFilename = (filename || `bassett-room-${Date.now()}.png`).replace(/[^a-zA-Z0-9._-]/g, '-');
    const graphqlUrl = `https://${cleanStore}.myshopify.com/admin/api/${API_VERSION}/graphql.json`;
    const graphqlMutation = `
      mutation fileCreate($files: [FileCreateInput!]!) {
        fileCreate(files: $files) {
          files {
            id
            ... on MediaImage { image { url } }
            ... on GenericFile { url }
          }
          userErrors { field message }
        }
      }
    `;
    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN.trim(),
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        query: graphqlMutation,
        variables: {
          files: [{ originalSource: `data:image/png;base64,${base64Data}`, alt: finalFilename }]
        }
      })
    });
    if (!response.ok) throw new Error(`Shopify API ${response.status}`);
    const data = await response.json();
    const userErrors = data.data?.fileCreate?.userErrors;
    if (userErrors?.length) throw new Error(userErrors.map(e => e.message).join('; '));
    const file = data.data?.fileCreate?.files?.[0];
    const url = file?.image?.url || file?.url;
    if (!url) throw new Error('No URL in response');
    res.json({ success: true, url });
  } catch (error) {
    console.error('Bassett upload error:', error);
    res.status(500).json({
      error: 'Failed to upload Bassett result',
      message: error.message
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ColorFlex Shopify API'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('API Error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 ColorFlex API server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;