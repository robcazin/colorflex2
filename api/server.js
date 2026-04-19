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
const FormData = require('form-data');
const nodeFetch = require('node-fetch');
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
    origin: process.env.ALLOWED_ORIGINS?.split(',').map(s => s.trim()).filter(Boolean) || ['https://your-shopify-store.myshopify.com'],
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

        // Extract base64 + mime from data URL (Shopify fileCreate does NOT accept data: URLs — use staged upload)
        const dataUrlMatch = thumbnail.match(/^data:(image\/[\w.+-]+);base64,/);
        const mimeType = dataUrlMatch ? dataUrlMatch[1] : 'image/jpeg';
        let base64Data = thumbnail.replace(/^data:image\/\w+;base64,/, '');
        base64Data = base64Data.trim();
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
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
        
        // Flow matches src/scripts/cf-dl.js: stagedUploadsCreate → POST to staged URL → fileCreate(resourceUrl).
        // Inline data: URLs are not valid originalSource for fileCreate.
        const graphqlUrl = `https://${cleanStore}.myshopify.com/admin/api/${API_VERSION}/graphql.json`;
        
        console.log('📤 Uploading to Shopify Files (staged):', {
            store: cleanStore,
            apiVersion: API_VERSION,
            filename: finalFilename,
            mimeType,
            bytes: imageBuffer.length,
            tokenPrefix: cleanToken.substring(0, 10) + '...'
        });

        const stagedResource = mimeType.startsWith('image/') ? 'IMAGE' : 'FILE';
        const stagedMutation = `mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
          stagedUploadsCreate(input: $input) {
            stagedTargets { url resourceUrl parameters { name value } }
            userErrors { field message }
          }
        }`;
        const stagedRes = await fetch(graphqlUrl, {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': cleanToken,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                query: stagedMutation,
                variables: {
                    input: [{ filename: finalFilename, mimeType, resource: stagedResource, httpMethod: 'POST' }]
                }
            })
        });
        const stagedJson = await stagedRes.json().catch(() => null);
        if (!stagedRes.ok) {
            console.error('❌ Shopify GraphQL request failed:', {
                url: graphqlUrl,
                status: stagedRes.status,
                body: stagedJson
            });
            if (stagedRes.status === 404) {
                throw Object.assign(
                    new Error(
                        'Shopify returned 404 for the Admin GraphQL URL. ' +
                        'Set SHOPIFY_STORE to your store handle exactly as in the Shopify Admin URL: ' +
                        'https://YOUR-HANDLE.myshopify.com (Settings → Domains → Shopify domain). ' +
                        'It may differ from your public domain (e.g. saffroncottage.shop).'
                    ),
                    { step: 'stagedUploadsCreate' }
                );
            }
            throw Object.assign(
                new Error(`stagedUploadsCreate HTTP ${stagedRes.status}: ${stagedJson ? JSON.stringify(stagedJson) : 'no body'}`),
                { step: 'stagedUploadsCreate' }
            );
        }
        if (stagedJson?.errors?.length) {
            console.error('❌ stagedUploadsCreate GraphQL errors:', stagedJson.errors);
            throw Object.assign(
                new Error(`stagedUploadsCreate: ${JSON.stringify(stagedJson.errors)}`),
                { step: 'stagedUploadsCreate' }
            );
        }
        const stagedData = stagedJson?.data?.stagedUploadsCreate;
        const stagedUserErrs = stagedData?.userErrors || [];
        if (stagedUserErrs.length) {
            throw Object.assign(
                new Error(`stagedUploadsCreate userErrors: ${JSON.stringify(stagedUserErrs)}`),
                { step: 'stagedUploadsCreate' }
            );
        }
        const target = stagedData?.stagedTargets?.[0];
        if (!target?.url || !target?.resourceUrl) {
            throw Object.assign(
                new Error(
                    `Staged upload did not return url/resourceUrl (resource=${stagedResource}). ${JSON.stringify(stagedJson).slice(0, 1500)}`
                ),
                { step: 'stagedUploadsCreate' }
            );
        }

        // Multipart POST to Shopify/S3 — use node-fetch + Content-Length (global fetch often breaks streams; S3 may reject without length).
        const form = new FormData();
        (target.parameters || []).forEach((p) => form.append(p.name, p.value));
        form.append('file', imageBuffer, { filename: finalFilename, contentType: mimeType });

        // Match the proven cf-dl.js upload behavior for staged S3 targets.
        const uploadHeaders = { ...form.getHeaders(), 'X-Shopify-Access-Token': cleanToken };
        if (target.url.includes('amazonaws.com')) {
            uploadHeaders['Content-Length'] = imageBuffer.length + 5000;
        }

        const uploadRes = await nodeFetch(target.url, {
            method: 'POST',
            headers: uploadHeaders,
            body: form
        });
        if (!uploadRes.ok) {
            const errText = await uploadRes.text();
            throw Object.assign(
                new Error(`Staged target upload failed ${uploadRes.status}: ${errText.slice(0, 800)}`),
                { step: 'stagedTargetPost' }
            );
        }

        const fileCreateMutation = `mutation fileCreate($files: [FileCreateInput!]!) {
          fileCreate(files: $files) {
            files {
              id
              ... on MediaImage {
                id
                fileStatus
                image { url altText }
                originalSource { url }
              }
              ... on GenericFile {
                id
                fileStatus
                url
              }
            }
            userErrors { field message code }
          }
        }`;
        const fileCreateRes = await fetch(graphqlUrl, {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': cleanToken,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                query: fileCreateMutation,
                variables: {
                    files: [{
                        contentType: 'IMAGE',
                        originalSource: target.resourceUrl,
                        filename: finalFilename
                    }]
                }
            })
        });
        const fileCreateJson = await fileCreateRes.json().catch(() => null);
        if (!fileCreateRes.ok) {
            throw Object.assign(
                new Error(`fileCreate HTTP ${fileCreateRes.status}: ${fileCreateJson ? JSON.stringify(fileCreateJson) : 'no body'}`),
                { step: 'fileCreate' }
            );
        }
        if (fileCreateJson?.errors?.length) {
            console.error('❌ fileCreate GraphQL errors:', fileCreateJson.errors);
            throw Object.assign(
                new Error(`fileCreate: ${JSON.stringify(fileCreateJson.errors)}`),
                { step: 'fileCreate' }
            );
        }
        const fc = fileCreateJson?.data?.fileCreate;
        if (fc?.userErrors?.length > 0) {
            console.error('❌ fileCreate user errors:', fc.userErrors);
            throw Object.assign(
                new Error(`fileCreate userErrors: ${JSON.stringify(fc.userErrors)}`),
                { step: 'fileCreate' }
            );
        }

        let fileObj = fc?.files?.[0];
        const createdId = fileObj?.id;
        let shopifyUrl =
            fileObj?.image?.url ||
            fileObj?.originalSource?.url ||
            fileObj?.url ||
            null;

        const pollQuery = `query getFile($id: ID!) {
          node(id: $id) {
            ... on MediaImage {
              id
              fileStatus
              image { url altText }
              originalSource { url }
            }
            ... on GenericFile {
              id
              fileStatus
              url
            }
          }
        }`;
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        if (!shopifyUrl && createdId) {
            for (let attempt = 0; attempt < 10 && !shopifyUrl; attempt++) {
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
                if (node) {
                    fileObj = node;
                    shopifyUrl = node?.image?.url || node?.originalSource?.url || node?.url || null;
                }
            }
        }

        if (!shopifyUrl) {
            console.error('❌ Upload succeeded but no URL returned:', {
                fileId: createdId,
                fileStatus: fileObj?.fileStatus,
            });
            throw Object.assign(
                new Error('Shopify did not return a file URL (still processing). Try again.'),
                { step: 'pollFileUrl' }
            );
        }

        console.log('✅ Shopify Files upload successful (staged + fileCreate)');
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
            message: error.message,
            step: error.step || undefined
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
 * Verify SHOPIFY_STORE + SHOPIFY_ACCESS_TOKEN can reach Admin GraphQL (read-only).
 * GET https://your-railway-app/api/shopify-admin-check
 * Use after changing Railway variables; if this fails, thumbnail upload will too.
 */
app.get('/api/shopify-admin-check', async (req, res) => {
    try {
        const SHOPIFY_STORE = process.env.SHOPIFY_STORE || process.env.SHOPIFY_STORE_URL;
        const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
        if (!SHOPIFY_STORE || !SHOPIFY_ACCESS_TOKEN) {
            return res.status(503).json({
                ok: false,
                error: 'Missing SHOPIFY_STORE or SHOPIFY_ACCESS_TOKEN in environment'
            });
        }
        const cleanStore = SHOPIFY_STORE.replace(/^https?:\/\//, '').replace(/\.myshopify\.com$/, '').trim();
        const API_VERSION = '2025-01';
        const graphqlUrl = `https://${cleanStore}.myshopify.com/admin/api/${API_VERSION}/graphql.json`;
        const query = `{ shop { name myshopifyDomain } }`;
        const r = await fetch(graphqlUrl, {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN.trim(),
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({ query })
        });
        const body = await r.json().catch(() => null);
        if (!r.ok) {
            return res.status(500).json({
                ok: false,
                httpStatus: r.status,
                graphqlUrl,
                shopify: body
            });
        }
        if (body.errors && body.errors.length) {
            return res.status(500).json({
                ok: false,
                graphqlUrl,
                errors: body.errors
            });
        }
        return res.json({
            ok: true,
            graphqlUrl,
            shop: body.data?.shop || null
        });
    } catch (error) {
        console.error('shopify-admin-check error:', error);
        return res.status(500).json({ ok: false, message: error.message });
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