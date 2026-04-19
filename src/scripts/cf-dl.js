    const Airtable = require('airtable');
const fsSync = require('fs');
const https = require('https');
const sharp = require('sharp');
const path = require('path');
const { execSync } = require('child_process');
const fetch = require('node-fetch');
const FormData = require('form-data');

// Ensure paths are relative to project root, not script location
const projectRoot = path.resolve(__dirname, '../..');
process.chdir(projectRoot);
console.log('Working directory set to:', process.cwd());

// Load Shopify credentials from .env / config/local.env / api/.env (same as shopify-create-products.js)
try {
    require('dotenv').config();
    if (!process.env.SHOPIFY_STORE || !process.env.SHOPIFY_ACCESS_TOKEN) {
        const localEnv = path.join(projectRoot, 'config', 'local.env');
        if (fsSync.existsSync(localEnv)) require('dotenv').config({ path: localEnv });
        if ((!process.env.SHOPIFY_STORE || !process.env.SHOPIFY_ACCESS_TOKEN) && fsSync.existsSync(path.join(projectRoot, 'api', '.env'))) {
            require('dotenv').config({ path: path.join(projectRoot, 'api', '.env') });
        }
    }
} catch (e) { /* dotenv optional */ }

// Data path: Synology cf-data (bucket root) or project ./data
const DATA_PATH = process.env.COLORFLEX_DATA_PATH
    ? path.resolve(process.env.COLORFLEX_DATA_PATH)
    : path.join(projectRoot, 'data');
// With a top-level data/ folder: cf-data/data/ has collections/, mockups/, collections.json. Same path format everywhere.
const DATA_ROOT = process.env.COLORFLEX_DATA_PATH ? path.join(DATA_PATH, 'data') : DATA_PATH;
const BASE_DATA_URL = process.env.COLORFLEX_DATA_BASE_URL || 'https://so-animation.com/colorflex';
// Single path format: base URL + /data/collections/ (bucket has top-level data/ folder)
const COLLECTIONS_URL_PATH = '/data/collections/';
// Paths in collections.json: always ./data/collections/ and ./data/mockups/
const JSON_PATH_PREFIX = './data/collections/';
const JSON_MOCKUP_PREFIX = './data/mockups/';
/** PDP coordinate gallery images live next to thumbnails/layers (not 21-COORDINATES wallpapers). */
const COORDINATE_COMPANIONS_SUBDIR = 'pp-coordinates';

// Collections that use mockupId (reference src/assets/mockups.json). New collections should use this.
const COLLECTION_MOCKUP_IDS = {
    'cabin-fever': 'white-dresser',
    'hip-to-be-square': 'white-dresser'
};

/** Convert path from collections.json (./data/collections/... or ./data/mockups/...) to filesystem path */
function jsonPathToFsPath(jsonPath) {
    if (!jsonPath || typeof jsonPath !== 'string') return jsonPath;
    const p = jsonPath.replace(/^\.\//, '').replace(/^data\//, '');
    return path.join(DATA_ROOT, p);
}

/** Max gallery images per pattern for PDP "Coordinates" strip (Airtable PP-COORDINATES). */
const MAX_PDP_COORDINATE_GALLERY = 10;

/** Legacy: Airtable "COMPANIONS" / "COORDINATES COMPANIONS" on the pattern row (filenames use -companions-). */
function getCompanionsAttachments(record) {
    const raw = record.get('COMPANIONS') || record.get('COORDINATES COMPANIONS') || [];
    return Array.isArray(raw) ? raw : [];
}

/**
 * Per-pattern PDP gallery: Airtable **PP-COORDINATES** (product-pitch thumbnails).
 * Field name tries common variants; attachment order = gallery order.
 */
function getPpCoordinatesAttachments(record) {
    if (!record || typeof record.get !== 'function') return [];
    const raw =
        record.get('PP-COORDINATES') ||
        record.get('PP COORDINATES') ||
        record.get('PP_COORDINATES') ||
        record.get('PPCOORDINATES') ||
        [];
    return Array.isArray(raw) ? raw : [];
}

/**
 * JSON paths for PDP coordinate gallery under collections/{base}/pp-coordinates/.
 * Prefers PP-COORDINATES on the pattern row; falls back to legacy COMPANIONS on that row.
 * Master row **COORDINATES** is only for collection ColorFlex matching wallpapers (see mapCoordAttachmentFieldToRecords), not this gallery.
 */
function buildPdpCoordinateGalleryPaths(record, baseName, fileSafeName) {
    const pp = getPpCoordinatesAttachments(record);
    if (pp.length > MAX_PDP_COORDINATE_GALLERY) {
        console.warn(
            `[PP-COORDINATES] ${fileSafeName}: ${pp.length} attachments; using first ${MAX_PDP_COORDINATE_GALLERY} only`
        );
    }
    const paths = [];
    const capPp = Math.min(pp.length, MAX_PDP_COORDINATE_GALLERY);
    for (let i = 0; i < capPp; i++) {
        const att = pp[i];
        if (!att || !att.url) continue;
        let ext = att.filename ? path.extname(att.filename).toLowerCase() : '.jpg';
        if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) ext = '.jpg';
        const idx = paths.length + 1;
        paths.push(
            `${JSON_PATH_PREFIX}${baseName}/${COORDINATE_COMPANIONS_SUBDIR}/${fileSafeName}-pp-coordinates-${idx}${ext}`
        );
    }
    if (paths.length) return paths;

    const raw = getCompanionsAttachments(record);
    if (!raw.length) return [];
    if (raw.length > MAX_PDP_COORDINATE_GALLERY) {
        console.warn(
            `[COORDINATES PDP] Legacy COMPANIONS on pattern ${fileSafeName}: ${raw.length} attachments; using first ${MAX_PDP_COORDINATE_GALLERY} only`
        );
    }
    for (let i = 0; i < Math.min(raw.length, MAX_PDP_COORDINATE_GALLERY); i++) {
        const att = raw[i];
        if (!att || !att.url) continue;
        let ext = att.filename ? path.extname(att.filename).toLowerCase() : '.jpg';
        if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) ext = '.jpg';
        const idx = paths.length + 1;
        paths.push(
            `${JSON_PATH_PREFIX}${baseName}/${COORDINATE_COMPANIONS_SUBDIR}/${fileSafeName}-companions-${idx}${ext}`
        );
    }
    return paths;
}

// Global file tracking
const processedFiles = {
    dataFiles: [],
    csvFiles: [],
    deploymentFiles: []
};

function extractDimensions(filename) {
    const match = filename.match(/(\d+)\s*X\s*(\d+)/i);
    if (match) {
        const width = parseInt(match[1], 10);
        const height = parseInt(match[2], 10);
        return [width, height];
    }
    return [24, 24];
}

const airtablePat = process.env.AIRTABLE_PAT;
if (!airtablePat) {
    console.error('Missing AIRTABLE_PAT. Add it to .env or config/local.env (never commit tokens).');
    process.exit(1);
}
const airtable = new Airtable({ apiKey: airtablePat });
const base = airtable.base(process.env.AIRTABLE_BASE_ID || 'appsywaKYiyKQTnl3');

// #region agent log
const AGENT_DEBUG_LOG_PATH = path.join(projectRoot, '.cursor', 'debug-0b8664.log');
/** NDJSON debug (session 0b8664); no secrets — file append + ingest */
function agentDebugLog(payload) {
    const body = Object.assign(
        { sessionId: '0b8664', timestamp: Date.now(), runId: process.env.CF_DEBUG_RUN_ID || 'run1' },
        payload
    );
    try {
        fsSync.appendFileSync(AGENT_DEBUG_LOG_PATH, JSON.stringify(body) + '\n');
    } catch (e) {
        /* ignore */
    }
    fetch('http://127.0.0.1:7744/ingest/9beec9bf-ddf5-40e6-9cf3-482a5094c6aa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '0b8664' },
        body: JSON.stringify(body),
    }).catch(() => {});
}
// #endregion

function cleanPatternName(str) {
    try {
        // Input validation and sanitization
        if (!str || typeof str !== 'string') {
            console.warn(`[CLEAN NAME WARNING] Invalid input: ${typeof str}, returning fallback`);
            return 'Unnamed Pattern';
        }

        const cleanedName = str
            .trim()
            .toLowerCase()
            .replace(/\.\w+$/, '')                           // Remove file extensions
            .replace(/^\d+[a-z]*\s*-\s*/i, '')              // Remove pattern numbers like "110 - "
            .replace(/\s*-\s*\d+x\d+$/i, '')                // Remove dimensions like " - 24X24"
            .replace(/\s*-\s*variant$/i, '')                // Remove -variant suffix
            .replace(/\s*-\s*[a-z\s]+\s+on\s+[a-z\s]+$/i, '') // Remove color descriptions like " - ECRU ON RED PRAIRIE"
            .replace(/\s*-\s*[a-z\s]+\s+and\s+[a-z\s]+$/i, '') // Handle " - COLOR and COLOR" patterns  
            .replace(/\s*-\s*[a-z\s]+\s+over\s+[a-z\s]+$/i, '') // Handle " - COLOR over COLOR" patterns
            .replace(/_/g, ' ')                             // Replace underscores with spaces
            .replace(/\s*-\s*$/, '')                        // Remove trailing " - "
            .split(/[\s-]+/)                                // Split on spaces and hyphens
            .filter(word => word && word.length > 0)        // Remove empty strings and null values
            .map(word => {
                try {
                    return word.charAt(0).toUpperCase() + word.slice(1);
                } catch (e) {
                    console.warn(`[CLEAN NAME WARNING] Error capitalizing word "${word}":`, e.message);
                    return String(word); // Fallback to string conversion
                }
            })
            .join(" ");                                     // Join with spaces

        // Final validation - ensure we have a reasonable result
        if (!cleanedName || cleanedName.trim().length === 0) {
            console.warn(`[CLEAN NAME WARNING] Empty result from "${str}", using fallback`);
            return 'Unnamed Pattern';
        }

        // Warn about suspicious results that might indicate data quality issues
        if (cleanedName.length > 100) {
            console.warn(`[CLEAN NAME WARNING] Very long pattern name (${cleanedName.length} chars): "${cleanedName.substring(0, 50)}..."`);
        }

        return cleanedName;

    } catch (error) {
        console.error(`[CLEAN NAME ERROR] Failed to process pattern name "${str}":`, error.message);
        console.error(`[CLEAN NAME ERROR] Using fallback name for problematic input`);
        return 'Unnamed Pattern';
    }
}

/**
 * Get curated colors from a placeholder record. Tries multiple Airtable field name variants
 * (API may return field names with different casing) and handles string or array (e.g. linked records).
 */
function getCuratedColorsFromRecord(record) {
    const fieldNames = ['CURATED COLORS', 'Curated Colors', 'Curated colors', 'curated colors'];
    let raw = null;
    for (const name of fieldNames) {
        raw = record.get(name);
        if (raw !== undefined && raw !== null && raw !== '') break;
    }
    if (raw === undefined || raw === null) return [];
    if (Array.isArray(raw)) {
        return raw
            .map(item => typeof item === 'string' ? item : (item && typeof item === 'object' && (item.name || item.fields?.Name)) ? String(item.name || item.fields.Name) : String(item))
            .join(', ')
            .split(/[,|.\n]+/)
            .map(c => c.trim())
            .filter(Boolean);
    }
    return String(raw)
        .split(/[,|.\n]+/)
        .map(c => c.trim())
        .filter(Boolean);
}

// Parse pattern number components (e.g., "01-01-101A" -> {category: "01", collection: "01", pattern: "101", variant: "A"})
function parsePatternNumber(numberString) {
    if (!numberString || typeof numberString !== 'string') {
        return { category: '', collection: '', pattern: '', variant: '', full: '' };
    }
    
    const match = numberString.match(/^(\d+)-(\d+)-(\d+)([A-Z]?)$/);
    if (match) {
        return {
            category: match[1],
            collection: match[2], 
            pattern: match[3],
            variant: match[4] || '',
            full: numberString
        };
    }
    
    // Fallback for non-standard formats
    return { category: '', collection: '', pattern: '', variant: '', full: numberString };
}

/** Normalize Airtable field values (string, long text, occasional object shapes) to plain text. */
function airtableFieldToPlainString(raw) {
    if (raw == null) return '';
    if (typeof raw === 'string') return raw.trim();
    if (typeof raw === 'number' && Number.isFinite(raw)) return String(raw);
    if (Array.isArray(raw)) {
        const parts = raw.map((x) => airtableFieldToPlainString(x)).filter(Boolean);
        return parts.join('\n').trim();
    }
    if (typeof raw === 'object') {
        if (raw.value != null && typeof raw.value === 'string') return raw.value.trim();
        if (raw.text != null && typeof raw.text === 'string') return raw.text.trim();
    }
    return '';
}

/**
 * Read long description from an Airtable record (master -000 or pattern row). Tries common field names.
 */
function readAirtableDescriptionField(record) {
    if (!record || typeof record.get !== 'function') return '';
    const names = ['Description', 'DESCRIPTION', 'description', 'Collection description', 'COLLECTION DESCRIPTION'];
    for (const name of names) {
        const text = airtableFieldToPlainString(record.get(name));
        if (text) return text;
    }
    return '';
}

/** Shopify vendor line (replaces fixed "Saffron Cottage") — human-readable collection name */
function formatCollectionVendorName(collectionName) {
    if (!collectionName || typeof collectionName !== 'string') return 'Saffron Cottage';
    return collectionName
        .replace(/[._]+/g, '-')
        .split(/[-\s]+/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}

function escapeHtmlForProductBody(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/** Airtable "Description" → Shopify body HTML (plain → wrapped <p>, existing HTML kept) */
function patternDescriptionToBodyHtml(description) {
    if (description == null) return '';
    const raw = String(description).trim();
    if (!raw) return '';
    if (/<[a-z][\s\S]*>/i.test(raw)) return raw;
    return `<p>${escapeHtmlForProductBody(raw)}</p>`;
}

function buildDefaultPatternBodyParagraph(pattern, collection, numberData, variantDescription) {
    const pretty = formatCollectionVendorName(collection.name);
    const numPart = numberData.full ? `Pattern #${numberData.full}. ` : '';
    const isColorFlex = pattern.colorFlex === true;
    const flexPart = isColorFlex
        ? 'Customize colors to match your space perfectly with our ColorFlex system.'
        : 'Classic design available in standard colorways.';
    return `<p>${pattern.name} pattern from our ${pretty} collection. ${numPart}${flexPart} Available as ${variantDescription}</p>`;
}

/** Product body for Shopify CSV: prefer master (-000) collection Description, then pattern row Description */
function buildPatternProductBodyHtml(pattern, collection, numberData, variantDescription) {
    const collectionDesc = collection && collection.description && String(collection.description).trim();
    const patternDesc = pattern && pattern.description && String(pattern.description).trim();
    const sourceDesc = collectionDesc || patternDesc;
    if (sourceDesc) {
        const main = patternDescriptionToBodyHtml(collectionDesc ? collection.description : pattern.description);
        const avail = variantDescription
            ? `<p><em>Available as ${escapeHtmlForProductBody(variantDescription)}</em></p>`
            : '';
        return main + avail;
    }
    return buildDefaultPatternBodyParagraph(pattern, collection, numberData, variantDescription);
}

function buildPatternSeoDescription(pattern, collection, isColorFlex) {
    const pretty = formatCollectionVendorName(collection.name);
    const collectionDesc = collection && collection.description && String(collection.description).trim();
    const patternDesc = pattern && pattern.description && String(pattern.description).trim();
    const custom = collectionDesc || patternDesc;
    if (custom) {
        const plain = custom.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        return plain.length > 320 ? `${plain.slice(0, 317)}...` : plain;
    }
    return `${pattern.name} pattern from our ${pretty} collection. ${isColorFlex ? 'Customize colors to match your space perfectly with our ColorFlex system.' : 'Classic design available in standard colorways.'} Available for wallpaper, fabric, and other applications.`;
}

/** Sort patterns by pattern number (01-02-101, 01-02-102, …). Mutates the array in place. */
function sortCollectionPatternsByNumber(patterns) {
    if (!Array.isArray(patterns) || patterns.length === 0) return;
    patterns.sort((a, b) => {
        const na = (a.number != null && a.number !== '') ? String(a.number).trim() : '\uFFFF';
        const nb = (b.number != null && b.number !== '') ? String(b.number).trim() : '\uFFFF';
        return na.localeCompare(nb, undefined, { numeric: true });
    });
}

function normalizePatternKey(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
}

function getPatternIdentity(pattern) {
    if (!pattern || typeof pattern !== 'object') return null;
    const byId = normalizePatternKey(pattern.id);
    if (byId) return `id:${byId}`;
    const byNumber = normalizePatternKey(pattern.number);
    if (byNumber) return `number:${byNumber}`;
    const bySlug = normalizePatternKey(pattern.slug);
    if (bySlug) return `slug:${bySlug}`;
    const byName = normalizePatternKey(cleanPatternName(pattern.name || ''));
    if (byName) return `name:${byName}`;
    return null;
}

function findPatternIndexByIdentity(patterns, candidate) {
    if (!Array.isArray(patterns) || !candidate) return -1;
    const candidateId = normalizePatternKey(candidate.id);
    if (candidateId) {
        const idx = patterns.findIndex((p) => normalizePatternKey(p && p.id) === candidateId);
        if (idx !== -1) return idx;
    }
    const candidateNumber = normalizePatternKey(candidate.number);
    if (candidateNumber) {
        const idx = patterns.findIndex((p) => normalizePatternKey(p && p.number) === candidateNumber);
        if (idx !== -1) return idx;
    }
    const candidateSlug = normalizePatternKey(candidate.slug);
    if (candidateSlug) {
        const idx = patterns.findIndex((p) => normalizePatternKey(p && p.slug) === candidateSlug);
        if (idx !== -1) return idx;
    }
    const candidateName = normalizePatternKey(cleanPatternName(candidate.name || ''));
    if (candidateName) {
        return patterns.findIndex((p) => normalizePatternKey(cleanPatternName((p && p.name) || '')) === candidateName);
    }
    return -1;
}

/**
 * Load Shopify credentials from config file or environment variables
 */
function loadShopifyCredentials() {
    // Try .env file first (if dotenv is available)
    let shopifyStore = process.env.SHOPIFY_STORE || process.env.SHOPIFY_STORE_URL;
    let shopifyToken = process.env.SHOPIFY_ACCESS_TOKEN;
    
    // If not in .env, try config/shopify.json
    if (!shopifyStore || !shopifyToken) {
        try {
            const configPath = path.join(projectRoot, 'config', 'shopify.json');
            if (fsSync.existsSync(configPath)) {
                const config = JSON.parse(fsSync.readFileSync(configPath, 'utf8'));
                // Use production by default, or test if specified
                const env = process.env.SHOPIFY_ENV || 'production';
                const shopifyConfig = config[env] || config.production;
                
                if (shopifyConfig) {
                    shopifyStore = shopifyStore || shopifyConfig.store;
                    // Note: Access token should be in .env for security, not in config file
                    // But we'll check if it's there as fallback
                    shopifyToken = shopifyToken || shopifyConfig.access_token;
                }
            }
        } catch (error) {
            console.warn('[SHOPIFY] Could not load config file:', error.message);
        }
    }
    
    // Remove https:// and .myshopify.com if present
    if (shopifyStore) {
        shopifyStore = shopifyStore.replace(/^https?:\/\//, '').replace(/\.myshopify\.com$/, '');
    }
    
    return { shopifyStore, shopifyToken };
}

/**
 * Upload image to Shopify Files via GraphQL staged upload (REST files.json returns 406).
 * Flow: stagedUploadsCreate → POST file to staged target → fileCreate with resourceUrl.
 */
async function uploadImageToShopifyFiles(imagePath, shopifyStore, shopifyToken) {
    try {
        if (!fsSync.existsSync(imagePath)) {
            throw new Error(`Image file not found: ${imagePath}`);
        }
        const imageBuffer = fsSync.readFileSync(imagePath);
        const fileSize = imageBuffer.length;
        const filename = path.basename(imagePath);
        const ext = path.extname(imagePath).toLowerCase();
        const mimeMap = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
        const mimeType = mimeMap[ext] || 'image/jpeg';
        const graphqlUrl = `https://${shopifyStore}.myshopify.com/admin/api/2025-01/graphql.json`;
        // IMAGE staged targets pair with fileCreate(contentType: IMAGE). FILE can return empty targets on some shops/API versions.
        const stagedResource = mimeType.startsWith('image/') ? 'IMAGE' : 'FILE';

        // 1. Create staged upload target (Settings > Files via fileCreate after upload)
        const stagedMutation = `mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
          stagedUploadsCreate(input: $input) {
            stagedTargets { url resourceUrl parameters { name value } }
            userErrors { field message }
          }
        }`;
        const stagedRes = await fetch(graphqlUrl, {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': shopifyToken,
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({
                query: stagedMutation,
                variables: {
                    input: [{ filename, mimeType, resource: stagedResource, httpMethod: 'POST' }]
                }
            })
        });
        const stagedJson = await stagedRes.json().catch(() => null);
        if (!stagedRes.ok) {
            throw new Error(
                `stagedUploadsCreate HTTP ${stagedRes.status}: ${stagedJson ? JSON.stringify(stagedJson).slice(0, 1200) : 'no body'}`
            );
        }
        if (stagedJson?.errors?.length) {
            throw new Error(`stagedUploadsCreate GraphQL: ${JSON.stringify(stagedJson.errors).slice(0, 1200)}`);
        }
        const createData = stagedJson.data?.stagedUploadsCreate;
        const userErrors = createData?.userErrors || [];
        if (userErrors.length) {
            throw new Error(`Staged upload: ${userErrors.map(e => e.message).join('; ')}`);
        }
        const target = createData?.stagedTargets?.[0];
        if (!target?.url || !target?.resourceUrl) {
            throw new Error(
                `Staged upload did not return url/resourceUrl (resource=${stagedResource}). Response: ${JSON.stringify(stagedJson).slice(0, 1500)}`
            );
        }

        // 2. POST file to staged target (multipart form with params + file)
        const form = new FormData();
        (target.parameters || []).forEach(p => form.append(p.name, p.value));
        form.append('file', imageBuffer, filename);
        const uploadHeaders = { ...form.getHeaders(), 'X-Shopify-Access-Token': shopifyToken };
        if (target.url.includes('amazonaws.com')) {
            uploadHeaders['Content-Length'] = fileSize + 5000;
        }
        const uploadRes = await fetch(target.url, {
            method: 'POST',
            headers: uploadHeaders,
            body: form
        });
        if (!uploadRes.ok) {
            const errText = await uploadRes.text();
            throw new Error(`Staged target upload failed ${uploadRes.status}: ${errText}`);
        }

        // 3. Create file in Shopify with resourceUrl
        const fileCreateMutation = `mutation fileCreate($files: [FileCreateInput!]!) {
          fileCreate(files: $files) {
            files { id ... on MediaImage { image { url } originalSource { url } status } ... on GenericFile { url fileStatus } }
            userErrors { field message code }
          }
        }`;
        const fileCreateRes = await fetch(graphqlUrl, {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': shopifyToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: fileCreateMutation,
                variables: {
                    files: [{
                        contentType: 'IMAGE',
                        originalSource: target.resourceUrl,
                        filename: filename,
                        duplicateResolutionMode: 'REPLACE'
                    }]
                }
            })
        });
        const fileCreateJson = await fileCreateRes.json();
        const fc = fileCreateJson.data?.fileCreate;
        if (fc?.userErrors?.length) {
            throw new Error(`fileCreate: ${fc.userErrors.map(e => e.message).join('; ')}`);
        }
        let fileObj = fc?.files?.[0];
        let shopifyUrl = fileObj?.image?.url || fileObj?.originalSource?.url || fileObj?.url;
        // File processing is async; image.url is null until status is READY. Poll once or twice.
        const fileId = fileObj?.id;
        if (!shopifyUrl && fileId) {
            const pollQuery = `query getFile($id: ID!) {
              node(id: $id) {
                ... on MediaImage { image { url } originalSource { url } status }
                ... on GenericFile { url fileStatus }
              }
            }`;
            for (let attempt = 0; attempt < 3 && !shopifyUrl; attempt++) {
                await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
                const pollRes = await fetch(graphqlUrl, {
                    method: 'POST',
                    headers: { 'X-Shopify-Access-Token': shopifyToken, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: pollQuery, variables: { id: fileId } })
                });
                const pollJson = await pollRes.json();
                const node = pollJson.data?.node;
                if (node) {
                    fileObj = node;
                    shopifyUrl = node?.image?.url || node?.originalSource?.url || node?.url;
                }
            }
        }
        if (!shopifyUrl) {
            throw new Error('fileCreate did not return file url (file may still be processing)');
        }
        console.log(`[SHOPIFY UPLOAD] ✅ Uploaded ${filename} to Shopify Files`);
        return shopifyUrl;
    } catch (error) {
        console.error(`[SHOPIFY UPLOAD] ❌ Error uploading ${imagePath}:`, error.message);
        throw error;
    }
}

async function generateShopifyCSV(collectionsData, baseServerUrl, shopifyStore = null, shopifyToken = null) {
    const csvRows = [];
    
    // Load Shopify credentials if not provided
    if (!shopifyStore || !shopifyToken) {
        const credentials = loadShopifyCredentials();
        shopifyStore = shopifyStore || credentials.shopifyStore;
        shopifyToken = shopifyToken || credentials.shopifyToken;
    }
    
    const skipFileUploadEnv =
        process.env.CF_SKIP_SHOPIFY_FILE_UPLOAD === '1' ||
        process.env.CF_SKIP_SHOPIFY_FILE_UPLOAD === 'true' ||
        process.env.SHOPIFY_CSV_SKIP_FILE_UPLOAD === '1' ||
        process.env.SHOPIFY_CSV_SKIP_FILE_UPLOAD === 'true';
    let uploadThumbnailsToShopify = !!(shopifyStore && shopifyToken) && !skipFileUploadEnv;

    if (skipFileUploadEnv && shopifyStore && shopifyToken) {
        console.log(
            `[CSV] CF_SKIP_SHOPIFY_FILE_UPLOAD (or SHOPIFY_CSV_SKIP_FILE_UPLOAD) set — skipping Shopify Files uploads; Image Src will use external URLs`
        );
    } else if (uploadThumbnailsToShopify) {
        console.log(`[CSV] Shopify upload enabled - images will be uploaded to Shopify Files`);
    } else {
        console.log(`[CSV] ⚠️  Shopify credentials not found - using external URLs (thumbnails may not display in CSV import)`);
        console.log(`[CSV] Set SHOPIFY_STORE and SHOPIFY_ACCESS_TOKEN in .env or config/shopify.json`);
    }
    
    // ✅ EXACT Shopify Official CSV Headers (2025) - No manual mapping required
    // Using product.metafields.namespace.key format for automatic metafield recognition
    const headers = [
        'Handle',
        'Title', 
        'Body (HTML)',
        'Vendor',
        'Product Category',
        'Type',
        'Tags',
        'Published',
        'Option1 Name',
        'Option1 Value',
        'Variant SKU',
        'Variant Price',
        'Variant Compare At Price',
        'Variant Requires Shipping',
        'Variant Taxable',
        'Variant Barcode',
        'Variant Inventory Tracker',
        'Variant Inventory Policy',
        'Variant Inventory Qty',
        'Image Src',
        'Image Position',
        'Image Alt Text',
        'SEO Title',
        'SEO Description',
        'product.metafields.color_flex.base_url',
        'product.metafields.color_flex.collection',
        'product.metafields.color_flex.pattern',
        'product.metafields.color_flex.layer_count',
        'product.metafields.color_flex.layer_labels',
        'product.metafields.color_flex.pattern_size',
        'product.metafields.color_flex.tiling_type',
        'product.metafields.color_flex.designer_colors',
        'product.metafields.color_flex.pattern_number',
        'product.metafields.color_flex.collection_sequence',
        'product.metafields.color_flex.pattern_sequence',
        'product.metafields.color_flex.pattern_variant',
        'product.metafields.color_flex.collection_description'
    ];
    
    csvRows.push(headers);
    
    // Use for...of loops to properly handle async operations
    for (const collection of collectionsData.collections) {
        // Process ALL patterns, but distinguish between ColorFlex and Standard
        const allPatterns = collection.patterns;
        const colorFlexCount = allPatterns.filter(p => p.colorFlex === true).length;
        const standardCount = allPatterns.length - colorFlexCount;
        
        console.log(`[CSV] Collection ${collection.name}: ${colorFlexCount} ColorFlex + ${standardCount} Standard = ${allPatterns.length} total patterns`);
        
        for (let index = 0; index < allPatterns.length; index++) {
            const pattern = allPatterns[index];
            try {
                // Validate pattern data before processing
                if (!pattern.name || typeof pattern.name !== 'string') {
                    console.warn(`[CSV WARNING] Invalid pattern name in collection ${collection.name}, pattern #${index + 1}:`, pattern.name);
                    pattern.name = `Pattern ${index + 1}`;
                }

                // Safe handle generation with error handling
                let handle, patternFileName;
                try {
                    handle = `${collection.name}-${pattern.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
                    patternFileName = pattern.name.toLowerCase().replace(/\s+/g, '-');
                } catch (nameError) {
                    console.warn(`[CSV WARNING] Error processing pattern name "${pattern.name}":`, nameError.message);
                    const fallbackName = `pattern-${index + 1}`;
                    handle = `${collection.name}-${fallbackName}`;
                    patternFileName = fallbackName;
                }
                
                // Parse pattern number components with error handling
                const numberData = parsePatternNumber(pattern.number);
                
                // Determine thumbnail path - check thumbnails-shopify first, then thumbnails (pattern.thumbnail is JSON path)
                const thumbnailShopifyPath = path.join(DATA_ROOT, 'collections', collection.name, 'thumbnails-shopify', `${patternFileName}.jpg`);
                const thumbnailPathFs = jsonPathToFsPath(pattern.thumbnail);
                
                let thumbnailUrl;
                const externalThumb = `${baseServerUrl}${COLLECTIONS_URL_PATH}${collection.name}/thumbnails/${patternFileName}.jpg`;

                // Try to upload to Shopify Files if credentials are available and not skipped / not disabled after auth failure
                if (uploadThumbnailsToShopify) {
                    try {
                        // Check thumbnails-shopify first, then thumbnails
                        let localThumbnailPath = null;
                        if (fsSync.existsSync(thumbnailShopifyPath)) {
                            localThumbnailPath = thumbnailShopifyPath;
                        } else if (fsSync.existsSync(thumbnailPathFs)) {
                            localThumbnailPath = thumbnailPathFs;
                        }

                        if (localThumbnailPath) {
                            thumbnailUrl = await uploadImageToShopifyFiles(localThumbnailPath, shopifyStore, shopifyToken);
                            console.log(`[CSV] ✅ Using Shopify-hosted URL for ${pattern.name}`);
                            await new Promise(resolve => setTimeout(resolve, 550));
                        } else {
                            console.warn(`[CSV] ⚠️  Thumbnail not found locally for ${pattern.name}, using external URL`);
                            thumbnailUrl = externalThumb;
                        }
                    } catch (uploadError) {
                        const msg = uploadError && uploadError.message ? uploadError.message : String(uploadError);
                        console.error(`[CSV] ❌ Failed to upload thumbnail for ${pattern.name}:`, msg);
                        const authLike =
                            /\b401\b/.test(msg) ||
                            /\b403\b/.test(msg) ||
                            /Invalid API key|access token|unrecognized login|wrong password/i.test(msg);
                        if (authLike) {
                            uploadThumbnailsToShopify = false;
                            console.warn(
                                `[CSV] Shopify Files upload disabled for the rest of this run (auth error). Fix SHOPIFY_ACCESS_TOKEN / app scopes, or set CF_SKIP_SHOPIFY_FILE_UPLOAD=1. Using external URLs.`
                            );
                        }
                        thumbnailUrl = externalThumb;
                    }
                } else {
                    thumbnailUrl = externalThumb;
                }
            
            // Determine product type based on ColorFlex flag
            const isColorFlex = pattern.colorFlex === true;

            // Check for custom category (e.g., Clothing for CLO collections)
            const productType = pattern.category === 'Clothing' ? 'Clothing' : (isColorFlex ? 'ColorFlex Pattern' : 'Standard Pattern');
            const productCategory = 'Home & Garden > Decor';
            
            // Tags: first tag is collection name so Shopify Smart Collections can use "Product tag equals <collection.name>"
            const baseTags = [collection.name, 'pattern', 'wallpaper', 'fabric'].join(', ');
            const tags = isColorFlex
                ? `${baseTags}, removable, custom-color, colorflex`
                : `${baseTags}, standard`;
            
            const vendorDisplay = formatCollectionVendorName(collection.name);
            const collectionDescriptionForProducts =
                collection.description && String(collection.description).trim()
                    ? String(collection.description).trim()
                    : '';
            // Generate SEO-optimized content
            const seoTitle = `${pattern.name} - ${vendorDisplay} Collection | ColorFlex Wallpaper`;
            const seoDescription = buildPatternSeoDescription(pattern, collection, isColorFlex);
            
            // Create multiple variants for different applications
            const variants = [
                {
                    name: 'Wallpaper',
                    sku: 'wallpaper',
                    price: '89.99',
                    description: 'Professional-grade removable wallpaper. Easy to install and remove without damage.'
                },
                {
                    name: 'Fabric',
                    sku: 'fabric',
                    price: '79.99',
                    description: 'High-quality fabric suitable for upholstery, curtains, and decor projects.'
                },
                {
                    name: 'Removable Decal',
                    sku: 'decal',
                    price: '69.99',
                    description: 'Removable vinyl decal perfect for temporary decoration and rental spaces.'
                }
            ];

            for (let variantIndex = 0; variantIndex < variants.length; variantIndex++) {
                const variant = variants[variantIndex];
                const row = [
                    handle, // Handle (same for all variants)
                    pattern.name, // Title (same for all variants)
                    buildPatternProductBodyHtml(pattern, collection, numberData, variant.description), // Body HTML (Airtable Description when set)
                    vendorDisplay, // Vendor (collection display name)
                    productCategory, // Product Category
                    productType, // Type
                    tags, // Tags
                    'TRUE', // Published
                    'Application', // Option1 Name
                    variant.name, // Option1 Value (Wallpaper, Fabric, Removable Decal)
                    `${numberData.full || handle}-${variant.sku}`, // Variant SKU
                    variant.price, // Variant Price
                    '', // Variant Compare At Price
                    'TRUE', // Variant Requires Shipping
                    'TRUE', // Variant Taxable
                    '', // Variant Barcode
                    '', // Variant Inventory Tracker (empty = no inventory tracking)
                    'continue', // Variant Inventory Policy (continue selling when out of stock)
                    '', // Variant Inventory Qty (empty = no inventory tracking)
                    thumbnailUrl, // Image Src (only for first variant)
                    variantIndex === 0 ? '1' : '', // Image Position (only for first variant)
                    variantIndex === 0 ? `${pattern.name} pattern thumbnail` : '', // Image Alt Text (only for first variant)
                    seoTitle, // SEO Title
                    seoDescription, // SEO Description
                    baseServerUrl + COLLECTIONS_URL_PATH.replace(/\/$/, ''), // Metafield: color_flex.base_url [url] (no trailing slash)
                    collection.name, // Metafield: color_flex.collection [single_line_text_field]
                    patternFileName, // Metafield: color_flex.pattern [single_line_text_field]
                    (pattern.layers && Array.isArray(pattern.layers) ? pattern.layers : []).length.toString(), // Metafield: color_flex.layer_count [number_integer]
                    (pattern.layerLabels && Array.isArray(pattern.layerLabels) ? pattern.layerLabels : []).join(','), // Metafield: color_flex.layer_labels [single_line_text_field]
                    (pattern.size && pattern.size[0] != null && pattern.size[1] != null) ? `${pattern.size[0]}x${pattern.size[1]}` : '24x24', // Metafield: color_flex.pattern_size [single_line_text_field]
                    pattern.tilingType || 'straight', // Metafield: color_flex.tiling_type [single_line_text_field]
                    (pattern.designer_colors && Array.isArray(pattern.designer_colors) ? pattern.designer_colors : []).join(','), // Metafield: color_flex.designer_colors [single_line_text_field]
                    numberData.full, // Metafield: color_flex.pattern_number [single_line_text_field]
                    numberData.collection, // Metafield: color_flex.collection_sequence [single_line_text_field]
                    numberData.pattern, // Metafield: color_flex.pattern_sequence [single_line_text_field]
                    numberData.variant, // Metafield: color_flex.pattern_variant [single_line_text_field]
                    collectionDescriptionForProducts // Metafield: color_flex.collection_description [multi_line_text_field]
                ];
                
                csvRows.push(row);
            }
            
            } catch (csvError) {
                console.error(`[CSV ERROR] Failed to process pattern "${pattern.name}" in collection ${collection.name}:`, csvError.message);
                console.warn(`[CSV ERROR] Skipping problematic pattern and continuing...`);
                
                // Create a minimal fallback row so the CSV isn't completely broken
                const fallbackHandle = `${collection.name}-error-pattern-${index + 1}`;
                const fallbackRow = [
                    fallbackHandle, // Handle
                    `Error Pattern ${index + 1}`, // Title
                    '<p>Pattern data could not be processed due to an error.</p>', // Body HTML
                    formatCollectionVendorName(collection.name), // Vendor
                    'Home & Garden > Decor', // Product Category
                    'Error Pattern', // Type
                    `${collection.name}, error`, // Tags
                    'FALSE', // Published - don't publish error patterns
                    ...Array(41).fill('') // Fill remaining columns with empty values
                ];
                csvRows.push(fallbackRow);
            }
        }
    }
    
    // Convert to CSV string
    const csvContent = csvRows.map(row => 
        row.map(field => `"${String(field || '').replace(/"/g, '""')}"`)
           .join(',')
    ).join('\n');
    
    return csvContent;
}

// Generate a blank Shopify CSV template for reference (eliminates column mapping)
function generateShopifyTemplate() {
    const headers = [
        'Handle',
        'Title', 
        'Body (HTML)',
        'Vendor',
        'Product Category',
        'Type',
        'Tags',
        'Published',
        'Option1 Name',
        'Option1 Value',
        'Variant SKU',
        'Variant Price',
        'Variant Compare At Price',
        'Variant Requires Shipping',
        'Variant Taxable',
        'Variant Barcode',
        'Variant Inventory Tracker',
        'Variant Inventory Policy',
        'Variant Inventory Qty',
        'Image Src',
        'Image Position',
        'Image Alt Text',
        'SEO Title',
        'SEO Description',
        'Metafield: color_flex.base_url',
        'Metafield: color_flex.collection',
        'Metafield: color_flex.pattern',
        'Metafield: color_flex.layer_count',
        'Metafield: color_flex.layer_labels',
        'Metafield: color_flex.pattern_size',
        'Metafield: color_flex.tiling_type',
        'Metafield: color_flex.designer_colors',
        'Metafield: color_flex.pattern_number',
        'Metafield: color_flex.collection_sequence',
        'Metafield: color_flex.pattern_sequence',
        'Metafield: color_flex.pattern_variant',
        'Metafield: color_flex.collection_description'
    ];
    
    // Add example row showing data format
    const exampleRow = [
        'example-pattern-handle',
        'Example Pattern Name',
        '<p>Example pattern description with HTML formatting.</p>',
        'Example Collection',
        'Home & Garden > Decor',
        'ColorFlex Pattern',
        'collection-name, pattern, wallpaper, fabric, removable, custom-color, colorflex',
        'TRUE',
        'Application',
        'Pattern',
        '01-01-101A',
        '89.99',
        '',
        'TRUE',
        'TRUE',
        '',
        '',
        'continue',
        '',
        'https://example.com/image.jpg',
        '1',
        'Pattern thumbnail alt text',
        'Pattern Name - Collection | ColorFlex Wallpaper',
        'SEO description for pattern...',
        'https://example.com/data/collections/',
        'collection-name',
        'pattern-file-name',
        '2',
        'Layer 1,Layer 2',
        '24x24',
        'straight',
        'Color1,Color2',
        '01-01-101A',
        '01',
        '101',
        'A',
        'Optional collection marketing copy from master (-000) row.'
    ];
    
    const csvContent = [headers, exampleRow]
        .map(row => row.map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(','))
        .join('\n');
    
    return csvContent;
}


async function downloadImage(url, destPath, maxDimension = 2800, retries = 3, forceDownload = false) {
    // Check if file already exists (for incremental updates) - skip if force download is enabled
    if (!forceDownload && fsSync.existsSync(destPath)) {
        try {
            const metadata = await sharp(destPath).metadata();
            console.log(`[SKIP] File exists: ${destPath} (${metadata.width}x${metadata.height})`);
            return metadata;
        } catch (err) {
            console.log(`[EXISTING ERROR] Corrupted file detected, re-downloading: ${destPath}`);
            // Continue with download if existing file is corrupted
        }
    }
    
    console.log(`[DOWNLOAD] Starting download: ${url} -> ${destPath}`);
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await new Promise((resolve, reject) => {
                https.get(url, { timeout: 30000 }, (response) => {
                    const file = fsSync.createWriteStream(destPath);
                    response.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        resolve();
                    });
                    file.on('error', (err) => {
                        fsSync.unlink(destPath, () => {});
                        reject(err);
                    });
                }).on('error', (err) => reject(err));
            });

            const metadata = await sharp(destPath).metadata();
            console.log(`[DOWNLOAD SUCCESS] Downloaded ${destPath}: ${metadata.width}x${metadata.height}`);
            if (maxDimension && (metadata.width !== maxDimension || metadata.height !== maxDimension)) {
                // Resize needed - either downscale (too large) or upscale (too small) to match maxDimension
                const aspectRatio = metadata.width / metadata.height;
                const [targetWidth, targetHeight] = metadata.width > metadata.height
                    ? [maxDimension, Math.round(maxDimension / aspectRatio)]
                    : [Math.round(maxDimension * aspectRatio), maxDimension];
                const tempPath = `${destPath}.tmp`;
                await sharp(destPath)
                    .resize(targetWidth, targetHeight, { fit: 'inside', withoutEnlargement: false }) // Allow upscaling
                    .jpeg({ quality: 90 })
                    .toFile(tempPath);
                fsSync.renameSync(tempPath, destPath);
                const action = (metadata.width > maxDimension || metadata.height > maxDimension) ? 'Downscaled' : 'Upscaled';
                console.log(`[RESIZE] ${action} to ${targetWidth}x${targetHeight}`);
            }
            return metadata;
        } catch (err) {
            console.error(`[DOWNLOAD ERROR] Attempt ${attempt} failed for ${destPath}: ${err.message}`);
            if (attempt === retries) throw err;
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        }
    }
}

function parseFileName(filename, layerIndex, patternNameOverride = null, quiet = false) {
    const withoutExtension = filename.replace(/\.jpg$/i, '');
    const parts = withoutExtension.split(" - ").filter(Boolean);

    if (!quiet) {
        console.log(`Parsing filename: ${filename}, patternNameOverride: ${patternNameOverride}`);
        console.log(`Parts: ${parts}`);
    }

    // Use patternNameOverride if provided, otherwise fall back to the second part
    const patternName = patternNameOverride || (parts.length > 1 ? cleanPatternName(parts[1]) : `Pattern${layerIndex + 1}`);
    if (!quiet) console.log(`Pattern name: ${patternName}`);

    // Layer label is the third part (index 2)
    const layerLabelRaw = parts.length > 2 ? parts[2] : `Unnamed Layer`;
    let layerLabel = layerLabelRaw
        .split(/[\s-]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .trim();

    // Special case for shadows
    if (layerLabelRaw.toUpperCase().includes("ISSHADOW") || layerLabelRaw.toUpperCase().includes("SHADOW")) {
        layerLabel = "Shadows";
        if (!quiet) console.log(`Applied shadow special case: ${layerLabel}`);
    }

    // Construct filename with pattern name and raw layer label
    const normalizedFileName = [
        patternName.toLowerCase().replace(/\s+/g, '-'),
        layerLabelRaw.toLowerCase().replace(/\s+/g, '-'),
        `layer-${layerIndex + 1}`
    ].filter(Boolean).join('_').replace(/_+/g, '_');

    if (!quiet) console.log(`Result: Pattern: ${patternName}, Label: ${layerLabel}, File: ${normalizedFileName}`);
    return { patternName, layerFileName: normalizedFileName, layerLabel };
}

function parseMockupDimensions(filename) {
    const match = filename.match(/W(\d+)H(\d+)/i);
    return match ? { widthInches: parseInt(match[1]), heightInches: parseInt(match[2]) } : { widthInches: 60, heightInches: 45 };
}

function cleanLayerFilename(filename, coordinateName, index) {
    // Clean the coordinate name (e.g., "TRESSELWOOD" -> "tresselwood")
    const cleanCoordName = coordinateName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

    // Extract the layer label from the filename (e.g., "BACK" or "FRONT")
    const parts = filename.toLowerCase().split(' - ');
    const label = parts.length > 1 ? parts[1].replace(/[^a-z0-9]/g, '') : `layer${index + 1}`;

    // Construct the cleaned filename
    return `${cleanCoordName}_${label}_layer-${index + 1}.jpg`;
}

/**
 * Simplified incremental pattern fetcher - User's suggested approach
 * 1. Fetch ONLY pattern names from Airtable (ACTIVE=1)
 * 2. Compare with existing collections.json to find NEW names
 * 3. Fetch full data ONLY for NEW patterns
 * This bypasses coordinate filtering issues entirely
 */
async function fetchNewPatternsOnly(collectionName, existingPatterns) {
    console.log(`\n[INCREMENTAL] Starting simplified name-first approach for ${collectionName}`);

    // Map collection name to table name
    const tableMapping = {
        'abundance': '1 - ABUNDANCE',
        'coverlets': '2 - COVERLETS',
        'english-cottage': '3 - ENGLISH COTTAGE',
        'traditions': '4 - TRADITIONS',
        'farmhouse': '5 - FARMHOUSE',
        'botanicals': '6 - BOTANICALS',
        'dished-up': '7 - DISHED UP',
        'bombay': '8 - BOMBAY',
        'pages': '9 - PAGES',
        'galleria': '10 - GALLERIA',
        'ancient-tiles': '13 - ANCIENT TILES',
        'geometry': '14 - GEOMETRY',
        'silk-road': '15 - SILK ROAD',
        'wall-panels': '16 - WALL PANELS',
        'new-orleans': '17 - NEW ORLEANS',
        'folksie': '18 - FOLKSIE',
        'ikats': '22 - IKATS',
        'cabin-fever': '16 - CABIN FEVER'
    };

    const tableName = tableMapping[collectionName.toLowerCase()];
    if (!tableName) {
        console.error(`[INCREMENTAL] Unknown collection: ${collectionName}`);
        return [];
    }

    console.log(`[INCREMENTAL] Fetching from table: ${tableName}`);

    // Step 1: Fetch ALL records with ACTIVE=1 (names only, minimal data)
    console.log(`[INCREMENTAL] Step 1: Fetching pattern names from Airtable...`);
    const allRecords = await base(tableName).select({
        filterByFormula: "{ACTIVE} = 1",
        fields: ['NUMBER', 'NAME'] // Only fetch what we need for comparison
    }).all();

    console.log(`[INCREMENTAL] Found ${allRecords.length} ACTIVE records in Airtable`);

    // Build set of existing pattern names (cleaned)
    const existingNames = new Set(
        existingPatterns.map(p => cleanPatternName(p.name).toLowerCase())
    );

    console.log(`[INCREMENTAL] Existing patterns in collections.json (${existingNames.size}):`);
    existingPatterns.forEach(p => {
        console.log(`  - ${p.name} → cleaned: "${cleanPatternName(p.name)}"`);
    });

    // Step 2: Compare and find NEW pattern names
    console.log(`\n[INCREMENTAL] Step 2: Comparing to find NEW patterns...`);
    const newPatternRecords = [];

    for (const record of allRecords) {
        const number = record.get('NUMBER') || '';
        const rawName = record.get('NAME') || '';

        // Skip master record
        if (number.toLowerCase().endsWith('-000')) {
            console.log(`[INCREMENTAL SKIP] ${number} (master record)`);
            continue;
        }

        // Extract pattern name using same logic as main fetcher
        const nameParts = rawName.split(/\s*-\s*/);
        const parsedName = nameParts.length > 1 ? cleanPatternName(nameParts[1]) : cleanPatternName(rawName);
        const cleanedName = cleanPatternName(parsedName).toLowerCase();

        const isNew = !existingNames.has(cleanedName);

        console.log(`  ${number}: ${rawName}`);
        console.log(`    → Parsed: "${parsedName}" → Cleaned: "${cleanedName}"`);
        console.log(`    → ${isNew ? '✨ NEW - will fetch full data' : '(exists - skip)'}`);

        if (isNew) {
            newPatternRecords.push({ number, rawName, parsedName, recordId: record.id });
        }
    }

    console.log(`\n[INCREMENTAL] Found ${newPatternRecords.length} NEW patterns to add`);

    if (newPatternRecords.length === 0) {
        console.log(`[INCREMENTAL] No new patterns found - nothing to add`);
        return [];
    }

    // Step 3: Fetch full data ONLY for NEW patterns
    console.log(`\n[INCREMENTAL] Step 3: Fetching full data for NEW patterns only...`);
    const newPatterns = [];

    for (const newPattern of newPatternRecords) {
        console.log(`\n[INCREMENTAL FETCH] Getting full data for: ${newPattern.rawName} (${newPattern.number})`);

        try {
            // Fetch the full record with all fields
            const fullRecord = await base(tableName).find(newPattern.recordId);

            // Process this record using the same logic as main fetcher
            const layerAttachments = fullRecord.get('LAYER SEPARATIONS') || [];
            const thumbnail = fullRecord.get('THUMBNAIL')?.[0];
            const size = extractDimensions(thumbnail?.filename || '');
            const tilingType = (fullRecord.get('TILING') || 'straight').toLowerCase();

            const pattern = {
                name: newPattern.parsedName,
                number: newPattern.number,
                size: size,
                tilingType: tilingType,
                layers: layerAttachments.map((attachment, index) => {
                    const layerFilename = cleanLayerFilename(
                        attachment.filename || `${newPattern.parsedName}_layer-${index + 1}.jpg`,
                        newPattern.parsedName,
                        index
                    );
                    return {
                        name: `Layer ${index + 1}`,
                        url: attachment.url,
                        filename: layerFilename
                    };
                })
            };

            if (thumbnail) {
                pattern.thumbnail = {
                    url: thumbnail.url,
                    filename: `${newPattern.parsedName.toLowerCase().replace(/\s+/g, '-')}.jpg`
                };
            }

            newPatterns.push(pattern);
            console.log(`[INCREMENTAL FETCH] ✅ Successfully processed ${newPattern.parsedName} (${layerAttachments.length} layers)`);

        } catch (error) {
            console.error(`[INCREMENTAL ERROR] Failed to fetch full data for ${newPattern.rawName}:`, error.message);
        }
    }

    console.log(`\n[INCREMENTAL] Successfully fetched ${newPatterns.length} new patterns`);
    return newPatterns;
}

/**
 * Dynamically discover all collection tables from Airtable base
 * @returns {Promise<Array>} Array of collection objects with name property
 */
async function getCollectionsFromAirtable() {
    try {
        // Fetch base schema using Airtable Meta API
        const https = require('https');

        const options = {
            hostname: 'api.airtable.com',
            path: `/v0/meta/bases/${base._base._id}/tables`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${airtable._apiKey}`
            }
        };

        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        if (response.tables) {
                            // Filter for collection tables (pattern: "# - NAME" or "## - NAME")
                            const collections = response.tables
                                .map(t => t.name)
                                .filter(name => /^\d{1,2}\s*-\s*.+/.test(name))
                                .map(name => ({ name }))
                                .sort((a, b) => {
                                    // Sort by collection number
                                    const numA = parseInt(a.name.match(/^(\d+)/)[1]);
                                    const numB = parseInt(b.name.match(/^(\d+)/)[1]);
                                    return numA - numB;
                                });

                            console.log(`[AUTO-DISCOVERY] Found ${collections.length} collection tables in Airtable`);
                            resolve(collections);
                        } else {
                            console.warn('[AUTO-DISCOVERY] No tables found in response, using fallback');
                            resolve(getFallbackCollections());
                        }
                    } catch (err) {
                        console.error('[AUTO-DISCOVERY] Error parsing response:', err.message);
                        resolve(getFallbackCollections());
                    }
                });
            });

            req.on('error', (err) => {
                console.error('[AUTO-DISCOVERY] Failed to fetch from Airtable:', err.message);
                console.log('[AUTO-DISCOVERY] Using fallback collection list');
                resolve(getFallbackCollections());
            });

            req.end();
        });
    } catch (error) {
        console.error('[AUTO-DISCOVERY] Error in getCollectionsFromAirtable:', error.message);
        return getFallbackCollections();
    }
}

/**
 * Fallback hardcoded collection list (used if API fails)
 * @returns {Array} Array of collection objects
 */
function getFallbackCollections() {
    return [
        { name: '1 - ABUNDANCE' },
        { name: '2 - COVERLETS' },
        { name: '3 - ENGLISH COTTAGE' },
        { name: '4 - TRADITIONS' },
        { name: '5 - FARMHOUSE' },
        { name: '6 - BOTANICALS' },
        { name: '7 - DISHED UP' },
        { name: '8 - BOMBAY' },
        { name: '9 - PAGES' },
        { name: '10 - GALLERIA' },
        { name: '11 - COTTAGE SKETCH BOOK' },
        { name: '12 - OCEANA' },
        { name: '13 - ANCIENT TILES' },
        { name: '14 - GEOMETRY' },
        { name: '15 - SILK ROAD' },
        { name: '16 - WALL PANELS' },
        { name: '17 - NEW ORLEANS' },
        { name: '18 - FOLKSIE' },
        { name: '21 - COORDINATES' }, // Background data only - not displayed as products
        { name: '22 - IKATS' },
        { name: '16 - CABIN FEVER' },
        { name: '30 - STRIPES' }
    ];
}

async function fetchCollectionData(collectionName = null) {

// Dynamically discover collections from Airtable (with fallback to hardcoded list)
const collections = await getCollectionsFromAirtable();
    // Read existing collections.json (DATA_ROOT first; fallback to project data/ so we never merge into empty when full file lives in repo)
    const projectDataRoot = path.join(projectRoot, 'data');
    const dataRootPath = path.join(DATA_ROOT, 'collections.json');
    const projectDataPath = path.join(projectDataRoot, 'collections.json');
    let existingData = { collections: [] };
    try {
        if (fsSync.existsSync(dataRootPath)) {
            const fileContent = fsSync.readFileSync(dataRootPath, 'utf8');
            existingData = JSON.parse(fileContent);
            console.log("Loaded existing collections.json:", existingData.collections.map(c => c.name));
        } else if (DATA_ROOT !== projectDataRoot && fsSync.existsSync(projectDataPath)) {
            const fileContent = fsSync.readFileSync(projectDataPath, 'utf8');
            existingData = JSON.parse(fileContent);
            console.log("Loaded existing collections.json from project data/ (DATA_ROOT path not found):", existingData.collections.map(c => c.name));
        }
    } catch (error) {
        console.error("Error reading collections.json, starting with empty data:", error);
    }

    // Filter collections if collectionName is specified
    let targetCollections = collections;
    if (collectionName) {
        // Normalize for matching: remove spaces, hyphens, and lowercase
        const normalizedSearchName = collectionName.toLowerCase().replace(/[\s-]/g, '');
        targetCollections = collections.filter(c => {
            const normalizedCollectionName = c.name.toLowerCase().replace(/[\s-]/g, '');
            return normalizedCollectionName.includes(normalizedSearchName);
        });
        if (!targetCollections.length) {
            console.error(`No collection found matching: ${collectionName}`);
            return existingData;
        }
        console.log(`Processing single collection: ${collectionName}`);
        console.log(`Matched collections:`, targetCollections.map(c => c.name));
    }

    console.log("Starting fetchCollectionData...");
    console.log("Input collections:", targetCollections);

    if (!targetCollections || targetCollections.length === 0) {
        console.error("No collections to process");
        return existingData;
    }

    // Fetch coordinates from 21 - COORDINATES table
    // NOTE: Coordinates are not displayed as products to customers, only used for matching function in app
    let coordinateRecords = [];
    try {
        coordinateRecords = await base('21 - COORDINATES').select({ filterByFormula: "{ACTIVE} = 1" }).all();
        console.log(`Fetched ${coordinateRecords.length} ACTIVE coordinate records from 21 - COORDINATES (background data only)`);
    } catch (error) {
        console.error("Error fetching coordinate records:", error);
    }

    const agentCoordNameSamples = [];

    /** One row from 21 - COORDINATES → JSON paths (same shape as entries in coordinateData). */
    function coordPayloadFrom21Record(record) {
        if (!record) return null;
        const rawName = record.get('NAME') || '';
        // #region agent log
        if (agentCoordNameSamples.length < 24) {
            const keys = record.fields && typeof record.fields === 'object' ? Object.keys(record.fields) : [];
            const nameLikeKeys = keys.filter((k) => /name/i.test(k));
            agentCoordNameSamples.push({
                idTail: record.id ? String(record.id).slice(-8) : '',
                hasNAME: record.get('NAME') != null && String(record.get('NAME')).trim() !== '',
                nameLikeKeys,
                rawNameSlice: String(rawName).slice(0, 60),
            });
        }
        // #endregion
        const filename = rawName
            .toLowerCase()
            .replace(/[^a-z0-9\s-.]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/\.jpg$/i, '')
            || '';
        const thumbnailUrl = record.get('THUMBNAIL')?.[0]?.url || '';
        const layerAttachments = record.get('LAYER SEPARATIONS') || [];
        const layerPaths = layerAttachments.map((attachment, index) => {
            const layerFilename = cleanLayerFilename(
                attachment.filename || `${filename}_layer-${index + 1}.jpg`,
                filename,
                index
            );
            return JSON_PATH_PREFIX + 'coordinates/layers/' + layerFilename;
        });
        const thumbnailPath = thumbnailUrl ? (JSON_PATH_PREFIX + 'coordinates/thumbnails/' + filename + '.jpg') : null;
        if (!filename || !thumbnailPath || !layerPaths.length) return null;
        console.log(`Coordinate record: rawName="${rawName}", cleaned="${filename}", layers=`, layerPaths);
        return { filename, thumbnailPath, layerPaths };
    }

    const coordinateData = coordinateRecords
        .map((record) => coordPayloadFrom21Record(record))
        .filter((coord) => coord && coord.thumbnailPath && coord.layerPaths && coord.layerPaths.length > 0);

    // #region agent log
    agentDebugLog({
        location: 'cf-dl.js:fetchCollectionData:coords',
        message: '21-COORDINATES NAME field sampling',
        hypothesisId: 'H5',
        data: { coordinateRecordCount: coordinateRecords.length, payloadCount: coordinateData.length, samples: agentCoordNameSamples },
    });
    // #endregion
    
    console.log("Processed coordinate data:", coordinateData);

    function cleanCoordAttachmentSlug(rawFilename) {
        return String(rawFilename || '')
            .toLowerCase()
            .replace(/[^a-z0-9\s-.]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/\.(jpg|jpeg|png|webp)$/i, '')
            .replace(/^-+|-+$/g, '');
    }

    function buildCoordSlugCandidates(rawFilename) {
        const base = cleanCoordAttachmentSlug(rawFilename);
        const out = [];
        const push = (s) => {
            if (s && !out.includes(s)) out.push(s);
        };
        push(base);
        let s = base;
        for (let i = 0; i < 4; i++) {
            const next = s.replace(/-\d+x\d+$/i, '').replace(/-+$/g, '');
            if (next === s) break;
            s = next;
            push(s);
        }
        const stripLeadingPasses = (str) => {
            let t = str;
            for (let j = 0; j < 5; j++) {
                let nx = null;
                const mNumHyphen = t.match(/^\d{2}-\d{3}-(.+)$/);
                if (mNumHyphen) nx = mNumHyphen[1];
                if (!nx) {
                    // Variant SKUs: "128ABD - FARMHOUSE PLAID - …" (letters after digits can exceed 5)
                    const mAlnum = t.match(/^\d+[a-z]{0,10}-(.+)$/i);
                    if (mAlnum && mAlnum[1].length >= 6) nx = mAlnum[1];
                }
                if (!nx || nx === t) break;
                t = nx;
                push(t);
            }
        };
        stripLeadingPasses(s);
        stripLeadingPasses(base);
        const rawNoExt = String(rawFilename || '').replace(/\.(jpg|jpeg|png|webp)$/i, '');
        const parts = rawNoExt.split(/\s*-\s*/).map((p) => p.trim()).filter(Boolean);
        if (parts.length >= 3) {
            push(cleanCoordAttachmentSlug(parts.slice(1).join(' - ')));
        }
        if (parts.length >= 4) {
            push(cleanCoordAttachmentSlug(parts.slice(2).join(' - ')));
        }
        // Leading token is digits (+ short letters) only, e.g. "130 - UTICA TICKING - …" (not "05-105 - …")
        if (parts.length >= 2) {
            const head = parts[0].replace(/\s/g, '');
            if (/^\d+[a-z]*$/i.test(head) && head.length <= 12) {
                push(cleanCoordAttachmentSlug(parts.slice(1).join(' - ')));
            }
        }
        // "124AB - FARMHOUSE TICKING SM - IRON ORE ON LINEN.jpg" → 21 - COORDINATES NAME is often just the product segment
        if (parts.length >= 3) {
            const head = parts[0].replace(/\s/g, '');
            if (/^\d+[a-z]*$/i.test(head) && head.length <= 12) {
                push(cleanCoordAttachmentSlug(parts[1]));
            }
        }
        return out;
    }

    /** Filename / slug → { filename, thumbnailPath, layerPaths, sourceCollection } for COORDINATES attachments that match real pattern assets anywhere. */
    const crossAttachmentIndex = new Map();
    /** Pattern file slug (e.g. a-little-birdie-told-me) → same payload, for prefix matches on long swatch names. */
    const crossPatternSlugIndex = new Map();

    function deriveParsedPatternNameForCrossIndex(record, baseName) {
        const rawName = record.get('NAME') || `${baseName}-product`;
        let parsedPatternName;
        try {
            const numberNameMatch = rawName.match(/^\s*(\d+[-a-z\d]*)\s*-\s*(.+)$/i);
            const nameToClean = numberNameMatch ? numberNameMatch[2].trim() : rawName;
            parsedPatternName = cleanPatternName(nameToClean);
            if (!parsedPatternName || parsedPatternName === 'Unnamed Pattern') {
                parsedPatternName = `Pattern ${record.id.substring(0, 8)}`;
            }
        } catch {
            parsedPatternName = `Pattern ${record.id.substring(0, 8)}`;
        }
        const layerAttachments = record.get('LAYER SEPARATIONS') || [];
        if (
            String(parsedPatternName).toLowerCase() === String(baseName).toLowerCase() &&
            layerAttachments.length > 0
        ) {
            try {
                const firstLayer = layerAttachments[0];
                if (firstLayer && firstLayer.filename) {
                    const firstLayerParts = firstLayer.filename.split(' - ');
                    if (firstLayerParts.length > 1 && firstLayerParts[0].match(/^\d+[-A-Za-z]*$/)) {
                        const fallbackName = cleanPatternName(firstLayerParts[1]);
                        if (fallbackName && fallbackName !== 'Unnamed Pattern') {
                            parsedPatternName = fallbackName;
                        }
                    }
                }
            } catch {
                /* keep parsedPatternName */
            }
        }
        return { parsedPatternName, layerAttachments };
    }

    async function fillCrossCollectionAttachmentIndex() {
        const skipTables = new Set(['21 - COORDINATES']);
        const addKeysForFile = (attachmentFilename, payload) => {
            if (!attachmentFilename || typeof attachmentFilename !== 'string') return;
            for (const k of buildCoordSlugCandidates(attachmentFilename)) {
                if (k.length < 4) continue;
                if (!crossAttachmentIndex.has(k)) crossAttachmentIndex.set(k, payload);
            }
        };

        for (const coll of collections) {
            const tableName = coll.tableName || coll.name;
            if (!tableName || skipTables.has(tableName)) continue;
            const baseName =
                tableName.split(' - ')[1]?.toLowerCase().replace(/\s+/g, '-') ||
                tableName.toLowerCase().replace(/\s+/g, '-');
            try {
                const allRecords = await base(tableName).select({ filterByFormula: '{ACTIVE} = 1' }).all();
                const coordinateIds = new Set();
                for (const r of allRecords) {
                    const cf = r.get('COORDINATES');
                    if (cf && Array.isArray(cf)) {
                        cf.forEach((c) => {
                            if (c && c.id) coordinateIds.add(c.id);
                        });
                    }
                }
                for (const record of allRecords) {
                    const number = record.get('NUMBER') || '';
                    if (String(number).toLowerCase().endsWith('-000')) continue;
                    if (coordinateIds.has(record.id)) continue;
                    const { parsedPatternName, layerAttachments } = deriveParsedPatternNameForCrossIndex(
                        record,
                        baseName
                    );
                    const fileSafeName = parsedPatternName.toLowerCase().replace(/\s+/g, '-');
                    const thumb = (record.get('THUMBNAIL') || [])[0];
                    if (!thumb && (!layerAttachments || layerAttachments.length === 0)) continue;

                    const layerPaths = [];
                    for (let i = 0; i < layerAttachments.length; i++) {
                        const layerFilename =
                            layerAttachments[i].filename || `${fileSafeName}-layer-${i + 1}.jpg`;
                        const parsedLayer = parseFileName(layerFilename, i, parsedPatternName, true);
                        layerPaths.push(JSON_PATH_PREFIX + baseName + '/layers/' + parsedLayer.layerFileName + '.jpg');
                    }
                    if (layerPaths.length === 0) continue;
                    const thumbnailPath =
                        JSON_PATH_PREFIX + baseName + '/thumbnails/' + fileSafeName + '.jpg';
                    const payload = {
                        filename: fileSafeName,
                        thumbnailPath,
                        layerPaths,
                        sourceCollection: baseName,
                    };
                    if (fileSafeName.length >= 4 && !crossPatternSlugIndex.has(fileSafeName)) {
                        crossPatternSlugIndex.set(fileSafeName, payload);
                    }
                    if (thumb && thumb.filename) {
                        addKeysForFile(thumb.filename, payload);
                    }
                    for (const att of layerAttachments) {
                        if (att && att.filename) addKeysForFile(att.filename, payload);
                    }
                }
            } catch (err) {
                console.warn(`[COORDINATES] Cross-index skip table ${tableName}:`, err.message);
            }
        }
        console.log(
            `[COORDINATES] Cross-collection index: ${crossAttachmentIndex.size} attachment keys, ${crossPatternSlugIndex.size} pattern slugs`
        );
    }

    function resolveCoordinateRecord(rawFilename, logContext) {
        const slug0 = cleanCoordAttachmentSlug(rawFilename);
        if (!slug0 || slug0.length < 3) {
            return null;
        }
        if (slug0.length <= 3 && !/[a-z]{2,}/i.test(slug0)) {
            return null;
        }

        const candidates = buildCoordSlugCandidates(rawFilename);
        for (const cand of candidates) {
            const exact = coordinateData.find((c) => c.filename === cand);
            if (exact) {
                return exact;
            }
        }

        // Prefer longest coordinate slug that is a full prefix of the attachment slug (disambiguates
        // farmhouse-ticking vs farmhouse-ticking-sm when cand is farmhouse-ticking-sm-iron-ore-on-linen).
        for (const cand of candidates) {
            if (cand.length < 6) continue;
            const prefixHits = coordinateData.filter((c) => {
                if (!c.filename || c.filename.length < 4) return false;
                return cand === c.filename || cand.startsWith(`${c.filename}-`);
            });
            if (prefixHits.length === 0) continue;
            prefixHits.sort((a, b) => b.filename.length - a.filename.length);
            const best = prefixHits[0];
            const sameTier = prefixHits.filter((h) => h.filename.length === best.filename.length);
            if (sameTier.length === 1) {
                return best;
            }
        }

        for (const cand of candidates) {
            if (cand.length < 8) continue;
            const hits = coordinateData.filter((c) => {
                if (!c.filename || c.filename.length < 5) return false;
                return cand.includes(c.filename) || c.filename.includes(cand);
            });
            if (hits.length === 1) {
                return hits[0];
            }
            if (hits.length > 1) {
                hits.sort((a, b) => b.filename.length - a.filename.length);
                const best = hits[0];
                const second = hits[1];
                if (best.filename.length > second.filename.length + 3) {
                    return best;
                }
            }
        }

        // Longest coordinate slug that matches as a suffix (e.g. …-farmhouse-ticking-rustic-city-on-linen → farmhouse-ticking-…)
        for (const cand of candidates) {
            if (cand.length < 10) continue;
            const ends = coordinateData.filter(
                (c) => c.filename && c.filename.length >= 8 && cand.endsWith(c.filename)
            );
            if (ends.length === 1) {
                return ends[0];
            }
            if (ends.length > 1) {
                ends.sort((a, b) => b.filename.length - a.filename.length);
                if (ends[0].filename.length > ends[1].filename.length + 2) {
                    return ends[0];
                }
            }
        }

        // Token overlap: attachment slug is long and descriptive; 21 - NAME is short hyphenated slug
        let bestC = null;
        let bestS = 0;
        let secondS = 0;
        for (const cand of candidates) {
            if (cand.length < 10) continue;
            for (const c of coordinateData) {
                if (!c.filename || c.filename.length < 4) continue;
                const toks = c.filename.split('-').filter((t) => t.length >= 3);
                let sc = 0;
                for (const t of toks) {
                    if (cand.includes(t)) sc += t.length;
                }
                if (sc > bestS) {
                    secondS = bestS;
                    bestS = sc;
                    bestC = c;
                } else if (sc > secondS) {
                    secondS = sc;
                }
            }
        }
        const minTokScore = 18;
        if (bestC && bestS >= minTokScore && bestS - secondS >= 4) {
            console.warn(`[COORDINATES] Token-overlap match "${rawFilename}" → "${bestC.filename}" (${logContext})`);
            return bestC;
        }

        // Resolve against any pattern's THUMBNAIL / LAYER SEPARATIONS across all collections (build-time only).
        for (const cand of candidates) {
            const cross = crossAttachmentIndex.get(cand);
            if (cross) {
                console.log(
                    `[COORDINATES] Cross-collection (file) "${rawFilename}" → ${cross.sourceCollection}/${cross.filename}.jpg (${logContext})`
                );
                return cross;
            }
        }
        for (const cand of candidates) {
            if (cand.length < 12) continue;
            let bestSlug = '';
            let bestPay = null;
            for (const [slug, pay] of crossPatternSlugIndex) {
                if (slug.length < 6) continue;
                if (cand === slug || cand.startsWith(`${slug}-`)) {
                    if (slug.length > bestSlug.length) {
                        bestSlug = slug;
                        bestPay = pay;
                    }
                }
            }
            if (bestPay && bestSlug.length >= 6) {
                let sameTier = 0;
                for (const [slug] of crossPatternSlugIndex) {
                    if (slug.length !== bestSlug.length) continue;
                    if (cand === slug || cand.startsWith(`${slug}-`)) sameTier++;
                }
                if (sameTier > 1) continue;
                console.log(
                    `[COORDINATES] Cross-collection (slug) "${rawFilename}" → ${bestPay.sourceCollection}/${bestPay.filename}.jpg via "${bestSlug}" (${logContext})`
                );
                return bestPay;
            }
        }

        return null;
    }

    function mapCoordAttachmentFieldToRecords(coordField, logContext) {
        if (!coordField || !Array.isArray(coordField)) return [];
        const out = [];
        for (const coord of coordField) {
            const rawFilename = coord.filename;
            if (rawFilename && typeof rawFilename === 'string') {
                const coordRecord = resolveCoordinateRecord(rawFilename.trim(), logContext);
                if (coordRecord) {
                    const collName = coordRecord.sourceCollection || 'coordinates';
                    out.push({
                        collection: collName,
                        filename: `${coordRecord.filename}.jpg`,
                        path: coordRecord.thumbnailPath,
                        layerPaths: coordRecord.layerPaths,
                    });
                } else {
                    console.warn(`[COORDINATES] No match for attachment "${rawFilename}" (${logContext})`);
                }
                continue;
            }
            // Linked 21 - COORDINATES rows (Airtable returns { id } without .filename)
            if (coord && typeof coord.id === 'string') {
                const rec21 = coordinateRecords.find((r) => r.id === coord.id);
                if (!rec21) {
                    console.warn(`[COORDINATES] Linked id ${coord.id} not in 21 - COORDINATES (${logContext})`);
                    continue;
                }
                const payload = coordPayloadFrom21Record(rec21);
                if (payload) {
                    out.push({
                        collection: 'coordinates',
                        filename: `${payload.filename}.jpg`,
                        path: payload.thumbnailPath,
                        layerPaths: payload.layerPaths,
                    });
                } else {
                    console.warn(`[COORDINATES] Linked row ${coord.id} has no thumbnail/layers (${logContext})`);
                }
            }
        }
        return out;
    }

    await fillCrossCollectionAttachmentIndex();

    // Fix 21 - COORDINATES layerPaths when Airtable attachments are "SKU - Name.jpg" (cleanLayerFilename wrongly used Name as layer role).
    for (const c of coordinateData) {
        if (!c || !c.filename) continue;
        const cross = crossPatternSlugIndex.get(c.filename);
        if (!cross || !Array.isArray(cross.layerPaths) || cross.layerPaths.length === 0) continue;
        const allUnderCoords = cross.layerPaths.every((p) => {
            const s = String(p).replace(/\\/g, '/').toLowerCase();
            return s.includes('/coordinates/layers/') || s.includes('coordinates/layers/');
        });
        if (!allUnderCoords) continue;
        if (c.layerPaths.join('|') !== cross.layerPaths.join('|')) {
            console.log(`[COORDINATES] Enriched "${c.filename}" layerPaths from cross-index (${cross.layerPaths.length} layers)`);
            c.layerPaths = cross.layerPaths.slice();
        }
    }

    for (const collection of targetCollections) {
        console.log(`\n[COLLECTION CHECK] Processing ${collection.name}`);
        
        const tableName = collection.tableName || collection.name;
        const baseName = tableName.split(' - ')[1]?.toLowerCase().replace(/\s+/g, '-') || tableName.toLowerCase().replace(/\s+/g, '-');
        console.log(`[START] Processing ${tableName} (baseName: ${baseName})`);

        try {
            // First, fetch all records to find the placeholder
            console.log(`[FETCH] Getting all records from ${tableName}...`);
            const allRecords = await base(tableName).select({}).all();
            console.log(`[FETCH] Found ${allRecords.length} total records in ${tableName}`);
            
            // Find placeholder record (master record with NUMBER ending in -000; holds collection metadata)
            // When multiple -000 records exist (e.g. "22-000" and "01-22-000"), prefer the one that matches this collection (01-{num}-000)
            const collectionNum = tableName.split(' - ')[0]?.trim(); // e.g. "22" from "22 - IKATS"
            const placeholderCandidates = allRecords.filter(r => (r.get('NUMBER') || '').toLowerCase().endsWith('-000'));
            const preferredNumber = collectionNum ? `01-${collectionNum}-000` : null; // e.g. "01-22-000"
            const placeholderRecord = (preferredNumber && placeholderCandidates.length > 1)
                ? placeholderCandidates.find(r => (r.get('NUMBER') || '').trim().toUpperCase().replace(/\s/g, '') === preferredNumber.replace(/\s/g, '').toUpperCase())
                : placeholderCandidates[0];
            if (placeholderCandidates.length > 1 && placeholderRecord) {
                console.log(`[PLACEHOLDER] Preferring ${placeholderRecord.get('NUMBER')} (${placeholderCandidates.length} -000 records found, preferred: ${preferredNumber})`);
            }

            let collectionCuratedColors = [];
            let collectionCoordinates = [];
            let collectionColorFlex = false; // from master row (-000): checked = ColorFlex collection, unchecked/missing = standard
            let mockupName = JSON_MOCKUP_PREFIX + 'English-Countryside-Bedroom-1-W60H40.png';
            let mockupShadowName = null;
            let mockupDims = { widthInches: 60, heightInches: 45 };
            let collectionMockupId = null; // when set, use mockupId (mockups.json) instead of old mockup/mockupShadow
            let collectionThumbPath = JSON_PATH_PREFIX + baseName + '/' + baseName + '-thumb.jpg';
            let records;

            if (!placeholderRecord) {
                console.warn(`[SKIP] No placeholder record (-000) found for ${baseName}`);
                console.warn(`[TIP] Add a record with NUMBER ending in -000 (e.g. 27-000) and ACTIVE=1 to enable this collection.`);
                console.log(`[FALLBACK] Proceeding with ACTIVE pattern records only (no collection thumbnail/curated colors from master)...`);
                records = await base(tableName).select({ filterByFormula: "{ACTIVE} = 1" }).all();
                // Exclude any record that looks like a placeholder so we don't treat it as a pattern
                records = records.filter(r => !(r.get('NUMBER') || '').toLowerCase().endsWith('-000'));
                if (records.length === 0) {
                    console.warn(`[SKIP] No ACTIVE pattern records (excluding -000) for ${baseName}`);
                    continue;
                }
            } else {
                console.log(`[PLACEHOLDER] Found placeholder record: ${placeholderRecord.get('NUMBER')}`);

                // Check ACTIVE field on the master record (controls Shopify inclusion). If field is missing (undefined), treat as enabled.
                const isActive = placeholderRecord.get('ACTIVE');
                console.log(`[ACTIVE] Field value for ${baseName}: ${isActive} (type: ${typeof isActive})`);
                if (isActive === false || isActive === 0) {
                    console.log(`[SKIP] ACTIVE is explicitly disabled for ${baseName} - enable it on the master record (${placeholderRecord.get('NUMBER')}) to include this collection.`);
                    continue;
                }
                if (isActive === undefined || isActive === null) {
                    console.log(`[ACTIVE] No ACTIVE field on placeholder - treating as enabled. Add ACTIVE=1 to the 27-000 record to control inclusion.`);
                }
                console.log(`[PROCEED] ACTIVE is enabled for ${baseName}, proceeding...`);

                const thumbAttachments = placeholderRecord.get('THUMBNAIL') || [];
                collectionCuratedColors = getCuratedColorsFromRecord(placeholderRecord);
                const mockupField = placeholderRecord.get('MOCKUP');
                if (mockupField) {
                    let mockupValues;
                    if (Array.isArray(mockupField)) {
                        mockupValues = mockupField.map(item => {
                            if (typeof item === 'string') return item;
                            if (item && item.name) return item.name;
                            return String(item);
                        });
                    } else if (typeof mockupField === 'string') {
                        mockupValues = mockupField.split(',').map(v => v.trim());
                    } else {
                        mockupValues = [String(mockupField)];
                    }
                    const first = (mockupValues[0] || '').trim();
                    // If value looks like a mockupId (no path, no extension), use mockupId style (mockups.json)
                    if (first && !/[\\/]/.test(first) && !/\.(png|jpg|jpeg|gif|webp)$/i.test(first)) {
                        collectionMockupId = first;
                    } else {
                        mockupName = JSON_MOCKUP_PREFIX + (first || 'English-Countryside-Bedroom-1-W60H40') + '.png';
                        if (mockupValues.length > 1) mockupShadowName = JSON_MOCKUP_PREFIX + mockupValues[1] + '.jpg';
                    }
                }
                mockupDims = parseMockupDimensions(mockupName.split('/').pop());

                // Collection-level ColorFlex: master row (-000) checkbox. Checked = ColorFlex collection, unchecked or no column = standard.
                const masterColorFlex = placeholderRecord.get('ColorFlex') ?? placeholderRecord.get('Color-Flex');
                collectionColorFlex = masterColorFlex === true;
                console.log(`[COLORFLEX] Master row ColorFlex for ${baseName}: ${collectionColorFlex} (raw: ${masterColorFlex})`);

                records = await base(tableName).select({ filterByFormula: "{ACTIVE} = 1" }).all();
            }

            console.log(`[FETCH] Getting ACTIVE records for ${tableName}...`);
            console.log(`[FETCH] Found ${records.length} ACTIVE records for ${tableName}`);
            
            // Debug: Show all records and their ACTIVE/Color-Flex status
            console.log(`[DEBUG ALL RECORDS] Checking ACTIVE/Color-Flex status for all records in ${tableName}:`);
            for (const record of allRecords) {
                const number = record.get('NUMBER') || 'no-number';
                const name = record.get('NAME') || 'no-name';
                const isActive = record.get('ACTIVE');
                const colorFlex = record.get('Color-Flex');
                const hasLayers = (record.get('LAYER SEPARATIONS') || []).length > 0;
                console.log(`  - ${number}: ${name.substring(0, 30)}... | ACTIVE: ${isActive} | Color-Flex: ${colorFlex} | Has Layers: ${hasLayers}`);
            }

            if (records.length === 0) {
                console.warn(`[SKIP] No ACTIVE records found for ${tableName}`);
                continue;
            }

            // When placeholder exists, metadata was set in the block above; when missing, defaults were set. Only re-read from placeholder here if present (avoid reference error).
            if (placeholderRecord) {
                collectionCuratedColors = getCuratedColorsFromRecord(placeholderRecord);

            // Map COORDINATES attachments on master (-000) to 21 - COORDINATES (slug + fallbacks)
            const coordField = placeholderRecord.get('COORDINATES') || [];
            console.log(`[COORDINATES] Field for ${baseName}:`, coordField);
            collectionCoordinates = mapCoordAttachmentFieldToRecords(coordField, `collection:${baseName}`);

            console.log(`[COLLECTION DATA] Placeholder: ${placeholderRecord.get('NUMBER')} | Curated colors for ${baseName}: ${collectionCuratedColors.length} colors`, collectionCuratedColors);
            console.log(`[COLLECTION DATA] Coordinates for ${baseName}:`, collectionCoordinates);

            const mockupField = placeholderRecord.get('MOCKUP');
            if (mockupField) {
                // Handle both string and array types for MOCKUP field
                let mockupValues;
                if (Array.isArray(mockupField)) {
                    mockupValues = mockupField.map(item => {
                        if (typeof item === 'string') return item;
                        if (item && item.name) return item.name;
                        return String(item);
                    });
                } else if (typeof mockupField === 'string') {
                    mockupValues = mockupField.split(',').map(v => v.trim());
                } else {
                    mockupValues = [String(mockupField)];
                }
                const first = (mockupValues[0] || '').trim();
                if (first && !/[\\/]/.test(first) && !/\.(png|jpg|jpeg|gif|webp)$/i.test(first)) {
                    collectionMockupId = first;
                } else {
                    mockupName = JSON_MOCKUP_PREFIX + (first || 'English-Countryside-Bedroom-1-W60H40') + '.png';
                    if (mockupValues.length > 1) mockupShadowName = JSON_MOCKUP_PREFIX + mockupValues[1] + '.jpg';
                }
            }
            mockupDims = parseMockupDimensions(mockupName.split('/').pop());
            }

            const coordinateIds = new Set();
            for (const record of records) {
                const coordField = record.get('COORDINATES');
                if (coordField && Array.isArray(coordField)) {
                    coordField.forEach(coord => coordinateIds.add(coord.id));
                }
            }

            const patternMap = new Map();
            const skippedPatterns = [];
            const agentPatternNameSamples = [];

            for (const record of records) {
                try {
                    const number = record.get('NUMBER') || '';
                    
                    // Skip the master record (-000) - it's only for collection metadata
                    if (number.toLowerCase().endsWith('-000')) {
                        console.log(`[SKIP PATTERN] ${number} (master record - collection metadata only)`);
                        continue;
                    }
                    
                    if (coordinateIds.has(record.id)) {
                        console.log(`[SKIP PATTERN] ${record.id} (coordinate)`);
                        continue;
                    }

                    const rawName = record.get('NAME') || `${baseName}-product`;
                    
                    // Enhanced error handling for pattern name processing.
                    // Only split on " - " when the part before it looks like a pattern number (e.g. "27-104 - DOO-SEE-DOO").
                    // Otherwise use the full name so "DOO-SEE-DOO" is not parsed as "See".
                    let parsedPatternName;
                    try {
                        const numberNameMatch = rawName.match(/^\s*(\d+[-a-z\d]*)\s*-\s*(.+)$/i);
                        const nameToClean = numberNameMatch ? numberNameMatch[2].trim() : rawName;
                        parsedPatternName = cleanPatternName(nameToClean);
                        
                        // Validate that we got a reasonable pattern name
                        if (!parsedPatternName || parsedPatternName === 'Unnamed Pattern') {
                            console.warn(`[PATTERN WARNING] Poor quality pattern name from "${rawName}", using record ID as fallback`);
                            parsedPatternName = `Pattern ${record.id.substring(0, 8)}`;
                        }
                    } catch (nameError) {
                        console.error(`[PATTERN ERROR] Failed to process pattern name "${rawName}":`, nameError.message);
                        parsedPatternName = `Pattern ${record.id.substring(0, 8)}`;
                        console.log(`[PATTERN ERROR] Using fallback name: ${parsedPatternName}`);
                    }

                    const layerAttachments = record.get('LAYER SEPARATIONS') || [];
                    let usedLayerFilenameFallback = false;

                    // Enhanced layer filename parsing with error handling
                    if (parsedPatternName === baseName && layerAttachments.length > 0) {
                        try {
                            const firstLayer = layerAttachments[0];
                            if (firstLayer && firstLayer.filename) {
                                const firstLayerParts = firstLayer.filename.split(" - ");
                                if (firstLayerParts.length > 1 && firstLayerParts[0].match(/^\d+[-A-Za-z]*$/)) {
                                    const fallbackName = cleanPatternName(firstLayerParts[1]);
                                    if (fallbackName && fallbackName !== 'Unnamed Pattern') {
                                        parsedPatternName = fallbackName;
                                        usedLayerFilenameFallback = true;
                                    }
                                }
                            }
                        } catch (layerError) {
                            console.warn(`[PATTERN WARNING] Error processing layer filename for ${rawName}:`, layerError.message);
                            // Continue with existing parsedPatternName
                        }
                    }

                    // #region agent log
                    if (agentPatternNameSamples.length < 35) {
                        const nameEqBaseCi = String(parsedPatternName).toLowerCase() === String(baseName).toLowerCase();
                        agentPatternNameSamples.push({
                            baseName,
                            number: String(number).slice(0, 24),
                            hasNAME: record.get('NAME') != null && String(record.get('NAME')).trim() !== '',
                            rawNameSlice: String(rawName).slice(0, 80),
                            parsedPatternName,
                            strictNameEqBase: parsedPatternName === baseName,
                            nameEqBaseCi,
                            usedLayerFilenameFallback,
                            firstLayerSlice: (layerAttachments[0] && layerAttachments[0].filename)
                                ? String(layerAttachments[0].filename).slice(0, 60)
                                : '',
                        });
                    }
                    // #endregion

                    const existing = patternMap.get(parsedPatternName);
                    if (!existing || layerAttachments.length > existing.layerCount) {
                        patternMap.set(parsedPatternName, { record, layerCount: layerAttachments.length });
                        console.log(`[PATTERN SUCCESS] Processed: "${parsedPatternName}" (${layerAttachments.length} layers)`);
                    }

                } catch (recordError) {
                    console.error(`[PATTERN ERROR] Failed to process record ${record.id}:`, recordError.message);
                    skippedPatterns.push({
                        id: record.id,
                        name: record.get('NAME') || 'Unknown',
                        number: record.get('NUMBER') || 'Unknown',
                        error: recordError.message
                    });
                    console.log(`[PATTERN ERROR] Skipping problematic record and continuing...`);
                }
            }
            
            // Report on any skipped patterns
            if (skippedPatterns.length > 0) {
                console.warn(`[PATTERN WARNING] Skipped ${skippedPatterns.length} problematic patterns in ${tableName}:`);
                skippedPatterns.forEach(pattern => {
                    console.warn(`  - ${pattern.name} (${pattern.number}): ${pattern.error}`);
                });
            }

            console.log(`[PATTERNS] Found ${patternMap.size} patterns for ${tableName}`);

            // #region agent log
            agentDebugLog({
                location: 'cf-dl.js:fetchCollectionData:patternNames',
                message: 'Pattern NAME → JSON name sampling',
                hypothesisId: 'H1',
                data: { tableName, baseName, patternCount: patternMap.size, samples: agentPatternNameSamples },
            });
            // #endregion

            if (patternMap.size === 0) {
                console.warn(`[SKIP] No valid patterns found for ${tableName}`);
                continue;
            }

            let jsonRecords = [];
            for (const [parsedPatternName, { record }] of patternMap) {
                const recordId = record.id;
                const number = record.get('NUMBER') || '';
                const fileSafeName = parsedPatternName.toLowerCase().replace(/\s+/g, '-');
                const thumbnailPath = JSON_PATH_PREFIX + baseName + '/thumbnails/' + fileSafeName + '.jpg';
                const tilingStyle = (record.get('THUMBNAIL') || [])[0]?.filename.toUpperCase().includes("HD") ? "half-drop" : "straight";

                const tintWhite = record.get('tintWhite') === true;
                const layerAttachments = record.get('LAYER SEPARATIONS') || [];
                console.log(`[DEBUG LAYERS] Pattern ${parsedPatternName}:`);
                console.log(`  - tintWhite: ${tintWhite}`);
                console.log(`  - LAYER SEPARATIONS field:`, record.get('LAYER SEPARATIONS'));
                console.log(`  - layerAttachments.length: ${layerAttachments.length}`);
                if (layerAttachments.length > 0) {
                    console.log(`  - First layer filename: ${layerAttachments[0].filename}`);
                    console.log(`  - First layer URL: ${layerAttachments[0].url}`);
                }
                
                let baseCompositePath = null;
                if (tintWhite && record.get('BASE COMPOSITE')?.[0]) {
                    const baseCompositeFilename = record.get('BASE COMPOSITE')[0].filename || `${fileSafeName}-base.jpg`;
                    const parsedBaseComposite = parseFileName(baseCompositeFilename, 0, parsedPatternName);
                    baseCompositePath = JSON_PATH_PREFIX + baseName + '/layers/' + parsedBaseComposite.layerFileName + '.jpg';
                }

                // For Galleria collection, ensure correct layer assignment:
                // Layer 1 (Etching) - gets user input via background tinting
                // Layer 2 (Pattern) - composited over the background+etching result
                let processedLayerAttachments = layerAttachments;

                const layerData = [];
                const layerLabels = [];
                for (let i = 0; i < processedLayerAttachments.length; i++) {
                    const layerFilename = processedLayerAttachments[i].filename || `${fileSafeName}-layer-${i + 1}.jpg`;
                    const parsedLayer = parseFileName(layerFilename, i, parsedPatternName);
                    const layerPath = JSON_PATH_PREFIX + baseName + '/layers/' + parsedLayer.layerFileName + '.jpg';
                    const proofLayerPath = JSON_PATH_PREFIX + baseName + '/proof-layers/' + parsedLayer.layerFileName + '.jpg';
                    layerData.push({ path: layerPath, proofPath: proofLayerPath });
                    layerLabels.push(parsedLayer.layerLabel);
                }

                // Get designer colors, fallback to collection curated colors if empty
                let designerColors = (record.get('DESIGNER COLORS') || "")
                    .split(/[,|.\n]+/)
                    .map(c => c.trim())
                    .filter(Boolean);
                
                // If no designer colors, use collection's curated colors as fallback
                if (designerColors.length === 0) {
                    designerColors = collectionCuratedColors;
                    console.log(`[FALLBACK COLORS] Pattern ${parsedPatternName}: Using collection curated colors (${designerColors.length} colors)`);
                } else {
                    console.log(`[DESIGNER COLORS] Pattern ${parsedPatternName}: Using pattern-specific colors (${designerColors.length} colors)`);
                }

                const thumbnailAttachment = (record.get('THUMBNAIL') || [])[0];
                const thumbnailFilename = thumbnailAttachment?.filename || '';
                const size = extractDimensions(thumbnailFilename);
                console.log(`[PATTERN] ${parsedPatternName}: size=${size}, layers=${layerData.length}`);

                // ColorFlex: explicit Airtable checkbox, or infer from layers (so misnamed/missing "Color-Flex" field still yields ColorFlex when LAYER SEPARATIONS is filled)
                const isColorFlex = record.get('Color-Flex') === true || record.get('ColorFlex') === true || layerData.length > 0;

                const patternDescription = readAirtableDescriptionField(record);

                const patternCoordField = record.get('COORDINATES') || [];
                const fromPatternAttachments = mapCoordAttachmentFieldToRecords(
                    patternCoordField,
                    `pattern:${baseName}:${parsedPatternName}`
                );
                // Do not fall back to master (-000) row coordinates; leave pattern blank when it has none.
                const mergedPatternCoordinates = fromPatternAttachments;
                const coordinateCompanionsPaths = buildPdpCoordinateGalleryPaths(record, baseName, fileSafeName);

                jsonRecords.push({
                    id: recordId,
                    number: number,
                    name: parsedPatternName,
                    thumbnail: thumbnailPath,
                    size: size,                     
                    repeat: record.get('REPEAT TYPE') || "yes",
                    layers: isColorFlex ? layerData : [], // Standard patterns have no layers
                    layerLabels: isColorFlex ? layerLabels : [], // Standard patterns have no layer labels
                    tilingType: tilingStyle,
                    designer_colors: designerColors,
                    colorFlex: isColorFlex, // Add ColorFlex flag
                    coordinates: mergedPatternCoordinates.length > 0 ? mergedPatternCoordinates : null,
                    ...(coordinateCompanionsPaths.length > 0 ? { coordinateCompanions: coordinateCompanionsPaths } : {}),
                    baseComposite: baseCompositePath,
                    tintWhite: tintWhite,
                    ...(patternDescription ? { description: patternDescription } : {}),
                    updatedAt: new Date().toISOString()
                });
            }

            // Designer order: sort patterns by pattern number (01-02-101, 01-02-102, …) so collection page matches Airtable order
            jsonRecords.sort((a, b) => {
                const na = (a.number != null && a.number !== '') ? String(a.number).trim() : '\uFFFF';
                const nb = (b.number != null && b.number !== '') ? String(b.number).trim() : '\uFFFF';
                return na.localeCompare(nb, undefined, { numeric: true });
            });

            // Prefer mockupId (references src/assets/mockups.json) over legacy mockup/mockupShadow paths
            const resolvedMockupId = COLLECTION_MOCKUP_IDS[baseName] || collectionMockupId;
            if (resolvedMockupId) {
                console.log(`[MOCKUP] Using mockupId "${resolvedMockupId}" for ${baseName} (mockups.json)`);
            }
            // Collection number for designer sort order (e.g. "22 - IKATS" -> 22; used by theme to order collections)
            const collectionNumber = parseInt(String(tableName).split(' - ')[0], 10) || 999;
            // If master row didn't set ColorFlex (no -000 or field unchecked/misnamed), infer from patterns so STRIPES etc. are ColorFlex when they have layers
            const effectiveCollectionColorFlex = collectionColorFlex || jsonRecords.some(p => p.colorFlex === true);

            // Collection-level copy for ColorFlex sidebar / JSON: Airtable master row (-000) field "Description"
            const existingIndexForMerge = existingData.collections.findIndex(c => c.name === baseName);
            const prevCollectionSnapshot = existingIndexForMerge !== -1 ? existingData.collections[existingIndexForMerge] : null;
            let collectionDescriptionForJson = '';
            if (placeholderRecord) {
                collectionDescriptionForJson = readAirtableDescriptionField(placeholderRecord);
                if (collectionDescriptionForJson) {
                    console.log(`[DESCRIPTION] Collection (${baseName}) master row Description: ${collectionDescriptionForJson.substring(0, 72)}${collectionDescriptionForJson.length > 72 ? '…' : ''}`);
                } else {
                    console.warn(
                        `[DESCRIPTION] No usable collection Description on master row for "${baseName}" (NUMBER ${placeholderRecord.get('NUMBER') || '?'}). ` +
                            'In Airtable, use a single-line or long-text field named **Description** (or rename to match). Checked: Description, DESCRIPTION, description, Collection description.'
                    );
                }
            } else if (prevCollectionSnapshot?.description) {
                collectionDescriptionForJson = String(prevCollectionSnapshot.description).trim();
            }

            const newCollectionData = {
                name: baseName,
                tableName: tableName,
                collectionNumber: Number.isNaN(collectionNumber) ? 999 : collectionNumber,
                collection_thumbnail: collectionThumbPath,
                curatedColors: collectionCuratedColors,
                coordinates: collectionCoordinates.length > 0 ? collectionCoordinates : null,
                colorFlex: effectiveCollectionColorFlex, // from master row (-000) or inferred from patterns with layers
                ...(resolvedMockupId
                    ? { mockupId: resolvedMockupId }
                    : { mockup: mockupName, mockupShadow: mockupShadowName, mockupWidthInches: mockupDims.widthInches, mockupHeightInches: mockupDims.heightInches }
                ),
                ...(collectionDescriptionForJson ? { description: collectionDescriptionForJson } : {}),
                patterns: jsonRecords
            };

            // Merge with existing data
            const existingIndex = existingData.collections.findIndex(c => c.name === baseName);
            if (existingIndex !== -1) {
                existingData.collections[existingIndex] = newCollectionData;
                console.log(`[UPDATE] Updated existing collection ${baseName} in collections.json`);
            } else {
                existingData.collections.push(newCollectionData);
                console.log(`[ADD] Added new collection ${baseName} to collections.json`);
            }
        } catch (error) {
            console.error(`[ERROR] Processing ${tableName}:`, error);
        }
    }

    console.log(`\n[COMPLETE] fetchCollectionData completed, collections: ${existingData.collections.length}`);
    return existingData;
}

function normalizePatternFilterToken(s) {
    return String(s || '')
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, '');
}

function patternMatchesFilter(pattern, filterNorm) {
    if (!filterNorm) return true;
    const n = (x) => normalizePatternFilterToken(x);
    const pn = n(pattern && pattern.name);
    const slug = n(pattern && pattern.slug);
    const num = n(pattern && pattern.number);
    return (
        pn.includes(filterNorm) ||
        filterNorm.includes(pn) ||
        (slug && (slug.includes(filterNorm) || filterNorm.includes(slug))) ||
        (num && (num.includes(filterNorm) || filterNorm.includes(num)))
    );
}

/** Match CLI collection name (e.g. silk-road) to JSON collection.name (silk-road, silk_road, …). */
function collectionNameMatchesCli(cName, cliArg) {
    if (!cliArg || String(cliArg).toLowerCase() === 'null') return true;
    const ca = normalizePatternFilterToken(cName);
    const cb = normalizePatternFilterToken(cliArg);
    if (!ca || !cb) return false;
    if (ca === cb) return true;
    return ca.includes(cb) || cb.includes(ca);
}

async function downloadImagesForCollections(
    data,
    collectionName = null,
    forceDownload = false,
    patternFilter = null
) {
    const patternFilterNorm = patternFilter ? normalizePatternFilterToken(patternFilter) : '';
    console.log(`\n[DOWNLOAD START] Starting downloadImagesForCollections with collectionName=${collectionName}, forceDownload=${forceDownload}, patternFilter=${patternFilterNorm || '(none)'}`);
    console.log(`[DOWNLOAD START] DATA_ROOT=${DATA_ROOT}`);
    console.log(`[DOWNLOAD START] Collections available in this run:`, (data.collections || []).map((c) => c.name));
    console.log(
        `[DOWNLOAD START] On disk, thumbnails/layers/${COORDINATE_COMPANIONS_SUBDIR} go under: ${path.join(DATA_ROOT, 'collections', '<handle>', '…')} (if COLORFLEX_DATA_PATH is set, include the trailing /data segment in that env)`
    );

    let targetCollections = data.collections || [];
    if (collectionName && collectionName !== 'null') {
        targetCollections = targetCollections.filter((c) => collectionNameMatchesCli(c && c.name, collectionName));
        if (!targetCollections.length) {
            const names = (data.collections || []).map((c) => c.name).join(', ') || '(none)';
            console.error(`[DOWNLOAD ERROR] No collection found matching CLI name: "${collectionName}"`);
            console.error(`[DOWNLOAD ERROR] Names present in collections.json for this run: ${names}`);
            console.error(
                `[DOWNLOAD ERROR] No mkdir run — fix the name mismatch or ensure fetch wrote this collection into ${path.join(DATA_ROOT, 'collections.json')}`
            );
            return;
        }
        console.log(`[DOWNLOAD] Downloading images for single collection: ${collectionName}`);
    } else {
        console.log(`[DOWNLOAD] Processing all collections for image downloads`);
    }

    console.log(`[DOWNLOAD] Target collections:`, targetCollections.map(c => c.name));

    for (const collection of targetCollections) {
        const baseName = collection.name;
        console.log(`\n[DOWNLOAD COLLECTION] Starting ${baseName}`);

        // Create directories (filesystem paths under DATA_ROOT: data/collections/...)
        const dirs = [
            path.join(DATA_ROOT, 'collections', baseName, 'thumbnails'),
            path.join(DATA_ROOT, 'collections', baseName, 'layers'),
            path.join(DATA_ROOT, 'collections', baseName, 'proof-layers'),
            path.join(DATA_ROOT, 'collections', baseName, 'coordinates'),
            path.join(DATA_ROOT, 'collections', baseName, COORDINATE_COMPANIONS_SUBDIR),
            path.join(DATA_ROOT, 'collections', 'coordinates', 'thumbnails'),
            path.join(DATA_ROOT, 'collections', 'coordinates', 'layers')
        ];
        
        for (const dir of dirs) {
            fsSync.mkdirSync(dir, { recursive: true });
            console.log(`[MKDIR] Created directory: ${dir}`);
        }

        // Download collection thumbnail (collection_thumbnail is JSON path)
        // Prefer 01-{num}-000 placeholder when multiple -000 records exist (same as fetchCollectionData)
        const allRecs = await base(collection.tableName).select({}).all();
        const thumbPlaceholderCandidates = allRecs.filter(r => (r.get('NUMBER') || '').toLowerCase().endsWith('-000'));
        const tableNum = (collection.tableName || '').split(' - ')[0]?.trim();
        const preferredNum = tableNum ? `01-${tableNum}-000` : null;
        const placeholderRecord = (preferredNum && thumbPlaceholderCandidates.length > 1)
            ? thumbPlaceholderCandidates.find(r => (r.get('NUMBER') || '').trim().toUpperCase().replace(/\s/g, '') === preferredNum.replace(/\s/g, '').toUpperCase())
            : thumbPlaceholderCandidates[0];
        if (placeholderRecord && placeholderRecord.get('THUMBNAIL')?.[0]?.url) {
            console.log(`[DOWNLOAD COLLECTION THUMB] Downloading collection thumbnail for ${baseName}`);
            try {
                await downloadImage(placeholderRecord.get('THUMBNAIL')[0].url, jsonPathToFsPath(collection.collection_thumbnail), 2800, 3, forceDownload);
            } catch (error) {
                console.error(`[DOWNLOAD ERROR] Failed to download collection thumbnail for ${baseName}:`, error);
            }
        } else {
            console.warn(`[DOWNLOAD WARN] No collection thumbnail URL for ${baseName}`);
        }

        // Download pattern images
        const patternsForDownload = (collection.patterns || []).filter((p) =>
            patternMatchesFilter(p, patternFilterNorm)
        );
        if (patternFilterNorm && patternsForDownload.length === 0) {
            console.warn(
                `[DOWNLOAD] Pattern filter "${patternFilter}" matched no patterns in ${baseName}; skipping pattern image downloads for this collection`
            );
        }
        console.log(
            `[DOWNLOAD PATTERNS] Processing ${patternsForDownload.length} pattern(s) for ${baseName}` +
                (patternFilterNorm ? ` (filter: ${patternFilter})` : '')
        );
        for (const pattern of patternsForDownload) {
            console.log(`\n[DOWNLOAD PATTERN] Processing pattern: ${pattern.name}`);
            
            try {
                const patternRecord = await base(collection.tableName).find(pattern.id);
                const thumbnailUrl = patternRecord.get('THUMBNAIL')?.[0]?.url;
                // #region agent log
                agentDebugLog({
                    location: 'cf-dl.js:downloadImagesForCollections:pattern',
                    message: 'pattern image download start',
                    hypothesisId: 'TH-CLI',
                    data: {
                        collection: baseName,
                        patternName: pattern.name,
                        patternId: pattern.id,
                        hasThumbnailUrl: !!thumbnailUrl,
                        layersLen: Array.isArray(pattern.layers) ? pattern.layers.length : -1,
                        colorFlex: pattern.colorFlex,
                        sizeOk: Array.isArray(pattern.size) && pattern.size.length >= 2,
                        jsonThumbTail: typeof pattern.thumbnail === 'string' ? pattern.thumbnail.slice(-64) : null,
                    },
                });
                // #endregion

                if (thumbnailUrl) {
                    console.log(`[DOWNLOAD THUMB] Downloading thumbnail for ${pattern.name}`);
                    const metadata = await downloadImage(thumbnailUrl, jsonPathToFsPath(pattern.thumbnail), 2800, 3, forceDownload);
                    // #region agent log
                    agentDebugLog({
                        location: 'cf-dl.js:downloadImagesForCollections:afterThumb',
                        message: 'thumbnail download finished',
                        hypothesisId: 'TH-CLI-meta',
                        data: {
                            collection: baseName,
                            patternName: pattern.name,
                            metaW: metadata && metadata.width,
                            metaH: metadata && metadata.height,
                            destBasename: pattern.thumbnail ? path.basename(String(pattern.thumbnail)) : null,
                        },
                    });
                    // #endregion
                    if (metadata) {
                        const pixelAspect = metadata.width / metadata.height;
                        pattern.size[1] = Math.round(pattern.size[0] / pixelAspect);
                    }
                } else {
                    console.warn(`[DOWNLOAD WARN] No THUMBNAIL URL for ${pattern.name}`);
                }

                if (pattern.baseComposite) {
                    const baseCompositeUrl = patternRecord.get('BASE COMPOSITE')?.[0]?.url;
                    if (baseCompositeUrl) {
                        console.log(`[DOWNLOAD BASE] Downloading base composite for ${pattern.name}`);
                        await downloadImage(baseCompositeUrl, jsonPathToFsPath(pattern.baseComposite), 2800, 3, forceDownload);
                    }
                }

                // STEP 1: Determine maximum proof layer dimension across all layers
                // This ensures all proof layers are the same size for proper alignment
                let maxProofDimension = 0;
                const layerUrls = [];

                for (let i = 0; i < pattern.layers.length; i++) {
                    const layerUrl = patternRecord.get('LAYER SEPARATIONS')?.[i]?.url;
                    if (layerUrl) {
                        layerUrls.push({ index: i, url: layerUrl });

                        // Get original dimensions from Airtable
                        try {
                            const response = await new Promise((resolve, reject) => {
                                https.get(layerUrl, { timeout: 30000 }, (response) => {
                                    const chunks = [];
                                    response.on('data', chunk => chunks.push(chunk));
                                    response.on('end', () => resolve(Buffer.concat(chunks)));
                                }).on('error', reject);
                            });

                            const metadata = await sharp(response).metadata();
                            const maxDim = Math.max(metadata.width, metadata.height);
                            console.log(`[PROOF CHECK] Layer ${i} (${pattern.layerLabels[i]}): ${metadata.width}x${metadata.height} (max: ${maxDim})`);
                            maxProofDimension = Math.max(maxProofDimension, maxDim);
                        } catch (err) {
                            console.warn(`[PROOF CHECK WARN] Could not get dimensions for layer ${i}: ${err.message}`);
                        }
                    }
                }

                // Round up to nearest 100 for clean dimension
                maxProofDimension = Math.ceil(maxProofDimension / 100) * 100;
                console.log(`[PROOF NORMALIZE] Using ${maxProofDimension}x${maxProofDimension} for all proof layers in ${pattern.name}`);

                // STEP 2: Download all layers normalized to maxProofDimension
                for (let i = 0; i < pattern.layers.length; i++) {
                    const layerUrl = patternRecord.get('LAYER SEPARATIONS')?.[i]?.url;
                    if (layerUrl) {
                        console.log(`[DOWNLOAD LAYER] Downloading layer ${pattern.layerLabels[i]} for ${pattern.name} (URL: ${layerUrl})`);

                        // Download proof layer normalized to maxProofDimension (ensures all layers same size)
                        await downloadImage(layerUrl, jsonPathToFsPath(pattern.layers[i].proofPath), maxProofDimension, 3, forceDownload);

                        // Download optimized working layer (always 1400x1400)
                        const metadata = await downloadImage(layerUrl, jsonPathToFsPath(pattern.layers[i].path), 1400, 3, forceDownload);
                        if (i === 0 && !pattern.tintWhite && !pattern.baseComposite && metadata) {
                            const pixelAspect = metadata.width / metadata.height;
                            pattern.size[1] = Math.round(pattern.size[0] / pixelAspect);
                        }
                    } else {
                        console.warn(`[DOWNLOAD WARN] No layer URL for ${pattern.name} layer ${i} - LAYER SEPARATIONS field may be empty`);
                        console.log(`[DEBUG] LAYER SEPARATIONS field content:`, patternRecord.get('LAYER SEPARATIONS'));
                    }
                }

                if (pattern.coordinateCompanions && pattern.coordinateCompanions.length > 0) {
                    const ppAtt = getPpCoordinatesAttachments(patternRecord);
                    const legacyAtt = getCompanionsAttachments(patternRecord);
                    const usePp = ppAtt.length > 0;
                    const companionsAtt = usePp ? ppAtt : legacyAtt;
                    console.log(
                        `[DOWNLOAD COORDINATES PDP] ${pattern.name}: ${pattern.coordinateCompanions.length} file(s) (source: ${usePp ? 'PP-COORDINATES' : 'COMPANIONS legacy'})`
                    );
                    for (let i = 0; i < pattern.coordinateCompanions.length; i++) {
                        const destJson = pattern.coordinateCompanions[i];
                        const url = companionsAtt[i]?.url;
                        if (!url || !destJson) continue;
                        try {
                            await downloadImage(url, jsonPathToFsPath(destJson), 2800, 3, forceDownload);
                        } catch (e) {
                            console.error(`[DOWNLOAD ERROR] COORDINATES PDP ${pattern.name} #${i + 1}:`, e.message);
                        }
                    }
                }
            } catch (error) {
                console.error(`[DOWNLOAD ERROR] Failed to process pattern ${pattern.name}:`, error);
                // #region agent log
                agentDebugLog({
                    location: 'cf-dl.js:downloadImagesForCollections:catch',
                    message: 'pattern download failed',
                    hypothesisId: 'TH-CLI-err',
                    data: {
                        collection: baseName,
                        patternName: pattern.name,
                        errMsg: error && error.message ? String(error.message).slice(0, 200) : String(error).slice(0, 200),
                    },
                });
                // #endregion
            }
        }

        // Download coordinate images (collection-level + every pattern's coordinates — fetch-only JSON runs skip this)
        const coordsToDownload = (() => {
            const byPath = new Map();
            const add = (arr) => {
                for (const c of arr || []) {
                    if (c && c.path) byPath.set(c.path, c);
                }
            };
            if (!patternFilterNorm) {
                add(collection.coordinates);
            }
            for (const p of collection.patterns || []) {
                if (patternFilterNorm && !patternMatchesFilter(p, patternFilterNorm)) continue;
                add(p.coordinates);
            }
            return [...byPath.values()];
        })();

        if (coordsToDownload.length) {
            console.log(`[DOWNLOAD COORDINATES] Processing ${coordsToDownload.length} unique coordinate ref(s) for ${baseName}`);
            const coordRecords = await base('21 - COORDINATES').select({}).all();
            
            for (const coord of coordsToDownload) {
                console.log(`[DOWNLOAD COORD] Processing coordinate: ${coord.filename}`);
                const cleanFilename = coord.filename
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-.]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/\.jpg$/i, '');
                    
                const coordRecord = coordRecords.find(r => {
                    const recordName = r.get('NAME')?.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') || '';
                    return recordName === cleanFilename;
                });
                
                if (coordRecord) {
                    const thumbnailUrl = coordRecord.get('THUMBNAIL')?.[0]?.url;
                    const layerUrls = coordRecord.get('LAYER SEPARATIONS')?.map(attachment => attachment.url) || [];
                    
                    if (thumbnailUrl) {
                        console.log(`[DOWNLOAD COORD THUMB] Downloading coordinate thumbnail ${coord.filename}`);
                        try {
                            await downloadImage(thumbnailUrl, jsonPathToFsPath(coord.path), 2800, 3, forceDownload);
                        } catch (error) {
                            console.error(`[DOWNLOAD ERROR] Failed to download thumbnail for ${coord.filename}:`, error);
                        }
                    }
                    
                    for (let i = 0; i < layerUrls.length; i++) {
                        const layerPath = coord.layerPaths[i];
                        console.log(`[DOWNLOAD COORD LAYER] Downloading coordinate layer ${i + 1} for ${coord.filename}`);
                        try {
                            await downloadImage(layerUrls[i], jsonPathToFsPath(layerPath), 2800, 3, forceDownload);
                        } catch (error) {
                            console.error(`[DOWNLOAD ERROR] Failed to download layer ${i + 1} for ${coord.filename}:`, error);
                        }
                    }
                } else {
                    console.warn(`[DOWNLOAD WARN] No coordinate record found for ${coord.filename} (cleaned: ${cleanFilename})`);
                }
            }
        }
        
        console.log(`[DOWNLOAD COMPLETE] Finished downloading for collection: ${baseName}`);
    }
    
    console.log(`\n[DOWNLOAD ALL COMPLETE] All downloads finished`);
}

// Server deployment function using the existing deploy.sh script
async function deployToServer(collectionName = null) {
    console.log(`\n[SERVER DEPLOY] Starting server deployment...`);
    
    try {
        let deployCommand;
        
        if (collectionName && collectionName !== 'null') {
            // Deploy specific collection
            deployCommand = `./deploy.sh -collection ${collectionName}`;
            console.log(`[SERVER DEPLOY] Deploying collection: ${collectionName}`);
        } else {
            // Deploy all images
            deployCommand = `./deploy.sh -images`;
            console.log(`[SERVER DEPLOY] Deploying all collection images`);
        }
        
        console.log(`[SERVER DEPLOY] Running: ${deployCommand}`);
        const output = execSync(deployCommand, { 
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: process.cwd()
        });
        
        console.log(`[SERVER DEPLOY] Deploy output:`);
        console.log(output);
        
        // Track deployment in processedFiles
        processedFiles.deploymentFiles.push({
            type: 'Server Deployment',
            path: 'so-animation.com/colorflex/data/collections/',
            details: collectionName ? `Collection: ${collectionName}` : 'All collections',
            timestamp: new Date().toISOString()
        });
        
        console.log(`[SERVER DEPLOY] ✅ Server deployment completed successfully`);
        
    } catch (error) {
        console.error(`[SERVER DEPLOY ERROR] Failed to deploy to server:`, error.message);
        console.error(`[SERVER DEPLOY ERROR] Make sure deploy.sh is executable and deployment keys are set up`);
        
        // Still track attempt even if failed
        processedFiles.deploymentFiles.push({
            type: 'Server Deployment (FAILED)',
            path: 'so-animation.com/colorflex/data/collections/',
            details: `Error: ${error.message}`,
            timestamp: new Date().toISOString()
        });
        
        throw error; // Re-throw to handle in main
    }
}

function filterDataForPatternQuery(data, collectionName, patternFilter) {
    if (!patternFilter || !collectionName || collectionName === 'null' || !data || !data.collections) {
        return data;
    }
    const fn = normalizePatternFilterToken(patternFilter);
    const cn = normalizePatternFilterToken(collectionName);
    return {
        collections: data.collections.map((col) => {
            const coln = normalizePatternFilterToken(col.name);
            if (coln !== cn && !coln.includes(cn)) return col;
            const patterns = (col.patterns || []).filter((p) => patternMatchesFilter(p, fn));
            if (!patterns.length) {
                console.warn(
                    `[MAIN] Pattern filter "${patternFilter}" matched no patterns in ${col.name} (CSV / subset use only)`
                );
            }
            return { ...col, patterns };
        }),
    };
}

async function main(
    downloadImages = true,
    collectionName = null,
    generateShopify = false,
    forceDownload = true,
    incrementalMode = false,
    patternFilter = null
) {
    console.log(`\n=== STARTING MAIN ===`);
    console.log(
        `[MAIN] Running with downloadImages=${downloadImages}, collectionName=${collectionName}, generateShopify=${generateShopify}, forceDownload=${forceDownload}, incrementalMode=${incrementalMode}, patternFilter=${patternFilter || '(none)'}`
    );

    // #region agent log
    agentDebugLog({
        location: 'cf-dl.js:main:entry',
        message: 'Data paths and run mode',
        hypothesisId: 'H2',
        data: {
            DATA_PATH,
            DATA_ROOT,
            downloadImages,
            collectionName,
            incrementalMode,
            projectDataRoot: path.join(projectRoot, 'data'),
        },
    });
    // #endregion

    const data = await fetchCollectionData(collectionName);
    console.log(`[MAIN] Fetched collection data:`, data.collections.map(c => c.name));

    // Handle incremental mode - SIMPLER APPROACH: Compare names first, then fetch only new patterns
    let finalData = data;
    let newPatternsAdded = 0;
    let newPatternsData = null; // Track only new patterns for CSV generation

    if (incrementalMode) {
        console.log(`[MAIN] 🔄 INCREMENTAL MODE: Upsert by id/number/slug/name`);
        const collectionsPath = path.join(DATA_ROOT, 'collections.json');

        try {
            // Load existing collections.json
            if (fsSync.existsSync(collectionsPath)) {
                const existingData = JSON.parse(fsSync.readFileSync(collectionsPath, 'utf8'));
                console.log(`[MAIN] Loaded existing collections.json with ${existingData.collections.length} collections`);

                // Create structure to hold ONLY new patterns for CSV
                newPatternsData = { collections: [] };

                // Scope incremental merge to requested collection when provided.
                // (Before this, single-collection runs still iterated every collection in existingData.)
                const incrementalCollections = collectionName && collectionName !== 'null'
                    ? data.collections.filter(c =>
                        (c.name || '').toLowerCase().includes(String(collectionName).toLowerCase())
                    )
                    : data.collections;
                if (collectionName && collectionName !== 'null') {
                    console.log(`[MAIN] Incremental scope for "${collectionName}": ${incrementalCollections.length} collection(s)`);
                }

                incrementalCollections.forEach(newCollection => {
                    const existingCollection = existingData.collections.find(c =>
                        c.name.toLowerCase() === newCollection.name.toLowerCase()
                    );

                    if (existingCollection) {
                        console.log(`[MAIN] 🔍 Upserting patterns for "${newCollection.name}" by id/number/slug/name...`);
                        const trulyNewPatterns = [];
                        let replacedPatterns = 0;

                        newCollection.patterns.forEach((incomingPattern) => {
                            const existingIdx = findPatternIndexByIdentity(existingCollection.patterns, incomingPattern);
                            if (existingIdx >= 0) {
                                const previous = existingCollection.patterns[existingIdx];
                                existingCollection.patterns[existingIdx] = incomingPattern;
                                replacedPatterns++;
                                console.log(`[MAIN] 🔁 Updated existing pattern: "${previous?.name || '(unknown)'}" -> "${incomingPattern.name}"`);
                            } else {
                                existingCollection.patterns.push(incomingPattern);
                                trulyNewPatterns.push(incomingPattern);
                                newPatternsAdded++;
                                console.log(`[MAIN] ✨ Added new pattern: "${incomingPattern.name}"`);
                            }
                        });

                        console.log(`[MAIN] Collection "${newCollection.name}": ${trulyNewPatterns.length} new, ${replacedPatterns} updated`);

                        // Track only truly NEW patterns for incremental CSV/product creation.
                        if (trulyNewPatterns.length > 0) {
                            newPatternsData.collections.push({
                                ...newCollection,
                                patterns: trulyNewPatterns
                            });
                        }
                    } else {
                        // Entire collection is new
                        console.log(`[MAIN] ✨ NEW collection found: "${newCollection.name}" with ${newCollection.patterns.length} patterns`);
                        existingData.collections.push(newCollection);
                        newPatternsAdded += newCollection.patterns.length;

                        // Entire collection is new, add to newPatternsData
                        newPatternsData.collections.push(newCollection);
                    }
                });

                finalData = existingData;
                console.log(`[MAIN] 🎯 Incremental merge complete: ${newPatternsAdded} new patterns added`);
            } else {
                console.log(`[MAIN] ⚠️  No existing collections.json found, will create new file`);
            }
        } catch (error) {
            console.error(`[MAIN ERROR] Error during incremental merge:`, error);
            console.log(`[MAIN] Falling back to full overwrite`);
        }
    }

    // Ensure every collection's patterns are in designer order (by pattern number) before writing
    finalData.collections.forEach(col => {
        if (col.patterns && col.patterns.length) sortCollectionPatternsByNumber(col.patterns);
    });

    // Safety: single-collection update must not overwrite a full file (e.g. DATA_ROOT missing → we had merged into empty → would write only 1 collection to project fallback)
    const projectDataRoot = path.join(projectRoot, 'data');
    const dataRootJsonPath = path.join(DATA_ROOT, 'collections.json');
    if (collectionName && finalData.collections.length === 1) {
        const singleName = (finalData.collections[0].name || '').toLowerCase().replace(/[\s-]/g, '');
        for (const candidatePath of [dataRootJsonPath, path.join(projectDataRoot, 'collections.json')]) {
            if (fsSync.existsSync(candidatePath)) {
                try {
                    const existing = JSON.parse(fsSync.readFileSync(candidatePath, 'utf8'));
                    if (existing.collections && existing.collections.length > 1) {
                        const idx = existing.collections.findIndex(c =>
                            (c.name || '').toLowerCase().replace(/[\s-]/g, '') === singleName
                        );
                        if (idx >= 0) {
                            existing.collections[idx] = finalData.collections[0];
                        } else {
                            existing.collections.push(finalData.collections[0]);
                        }
                        finalData = existing;
                        console.log(`[MAIN] Merged single collection into existing file (${existing.collections.length} collections) to avoid overwriting`);
                        break;
                    }
                } catch (e) {
                    // ignore parse/read errors, proceed with current finalData
                }
            }
        }
    }

    // Write updated data to collections.json (try DATA_ROOT first, fallback to project data/ if permission denied)
    let collectionsPath = dataRootJsonPath;
    let writeRoot = DATA_ROOT;
    try {
        fsSync.mkdirSync(DATA_ROOT, { recursive: true });
        // #region agent log
        agentDebugLog({
            location: 'cf-dl.js:main:beforeWrite',
            message: 'collections.json write target',
            hypothesisId: 'H2',
            data: {
                collectionsPath,
                writeRoot,
                collectionCount: finalData.collections.length,
                patternTotal: finalData.collections.reduce((n, c) => n + (c.patterns ? c.patterns.length : 0), 0),
                firstCollectionPatternNames: (finalData.collections[0] && finalData.collections[0].patterns)
                    ? finalData.collections[0].patterns.slice(0, 8).map((p) => p.name)
                    : [],
            },
        });
        // #endregion
        fsSync.writeFileSync(collectionsPath, JSON.stringify(finalData, null, 2));
    } catch (error) {
        if ((error.code === 'EACCES' || error.code === 'ENOENT') && DATA_ROOT !== projectDataRoot) {
            console.warn(`[MAIN] Cannot write to ${DATA_ROOT}, falling back to project data/ (${projectDataRoot})`);
            writeRoot = projectDataRoot;
            collectionsPath = path.join(projectDataRoot, 'collections.json');
            try {
                fsSync.mkdirSync(projectDataRoot, { recursive: true });
                fsSync.writeFileSync(collectionsPath, JSON.stringify(finalData, null, 2));
            } catch (fallbackErr) {
                console.error(`[MAIN ERROR] Error writing to collections.json:`, fallbackErr);
            }
        } else {
            console.error(`[MAIN ERROR] Error writing to collections.json:`, error);
        }
    }
    if (fsSync.existsSync(collectionsPath)) {
        if (incrementalMode) {
            console.log(`[MAIN] ✅ Successfully updated collections.json (${newPatternsAdded} new patterns added)`);
        } else {
            console.log(`[MAIN] ✅ Successfully wrote to collections.json (full overwrite)`);
        }
        processedFiles.dataFiles.push({
            type: incrementalMode ? 'Collections Data (Incremental)' : 'Collections Data',
            path: collectionsPath,
            patterns: finalData.collections.reduce((total, col) => total + col.patterns.length, 0),
            collections: finalData.collections.length,
            newPatterns: incrementalMode ? newPatternsAdded : undefined
        });
    }

    // Generate Shopify CSV if requested
    if (generateShopify) {
        try {
            const baseServerUrl = BASE_DATA_URL;

            // In incremental mode, only generate CSV for NEW patterns
            let csvData;
            if (incrementalMode && newPatternsData && newPatternsData.collections.length > 0) {
                console.log(`[CSV] 🔄 INCREMENTAL MODE: Generating CSV for NEW patterns only`);
                csvData = newPatternsData;
                const newPatternCount = csvData.collections.reduce((total, col) => total + col.patterns.length, 0);
                console.log(`[CSV] CSV will contain ${newPatternCount} NEW patterns across ${csvData.collections.length} collections`);
            } else if (collectionName && collectionName !== 'null') {
                console.log(`[CSV] Filtering CSV to only include collection: ${collectionName}`);
                csvData = {
                    collections: finalData.collections.filter(col =>
                        col.name.toLowerCase() === collectionName.toLowerCase()
                    )
                };
                console.log(`[CSV] Filtered from ${finalData.collections.length} to ${csvData.collections.length} collections`);
                if (patternFilter) {
                    csvData = filterDataForPatternQuery(csvData, collectionName, patternFilter);
                    const n = csvData.collections.reduce((t, c) => t + (c.patterns ? c.patterns.length : 0), 0);
                    console.log(`[CSV] After pattern filter "${patternFilter}": ${n} pattern row(s)`);
                }
            } else {
                console.log(`[CSV] Generating CSV for all collections (no filter specified)`);
                csvData = finalData;
            }
            
            const csvContent = await generateShopifyCSV(csvData, baseServerUrl);
            const totalPatterns = csvData.collections.reduce((total, col) => total + col.patterns.length, 0);
            
            // Generate timestamped filename in standardized location
            const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const collectionSuffix = (collectionName && collectionName !== 'null') ? `-${collectionName}` : '';
            const csvFilename = `./deployment/csv/shopify-import${collectionSuffix}-${timestamp}.csv`;
            
            // Ensure deployment/csv directory exists
            if (!fsSync.existsSync('./deployment/csv')) {
                fsSync.mkdirSync('./deployment/csv', { recursive: true });
            }
            
            fsSync.writeFileSync(csvFilename, csvContent);
            console.log(`[MAIN] ✅ Successfully generated ${csvFilename} with EXACT Shopify headers (no manual mapping required!)`);
            
            // Track CSV files
            processedFiles.csvFiles.push({
                type: 'Shopify Import CSV',
                path: path.resolve(csvFilename),
                patterns: totalPatterns,
                timestamp: new Date().toISOString()
            });
            
            // Also generate template file for reference in deployment/csv
            const templateContent = generateShopifyTemplate();
            const templateFilename = './deployment/csv/shopify-template.csv';
            fsSync.writeFileSync(templateFilename, templateContent);
            
            // Track template file
            processedFiles.csvFiles.push({
                type: 'Shopify Template CSV',
                path: path.resolve(templateFilename),
                purpose: 'Reference template for manual CSV creation'
            });
            console.log(`[MAIN] ✅ Generated ${templateFilename} for future reference`);
        } catch (error) {
            console.error(`[MAIN ERROR] Error generating Shopify CSV:`, error);
        }
    }

    // Download images if specified
    if (downloadImages) {
        console.log(`[MAIN] Starting image downloads...`);

        // In incremental mode, only download images for NEW patterns
        let dataForDownload;
        if (incrementalMode && newPatternsData && newPatternsData.collections.length > 0) {
            console.log(`[MAIN] 🔄 INCREMENTAL MODE: Downloading images for NEW patterns only`);
            dataForDownload = newPatternsData;
            // Force download for new patterns (they don't exist yet)
            await downloadImagesForCollections(dataForDownload, collectionName, true, patternFilter);
        } else {
            // Normal mode or no new patterns - use finalData
            await downloadImagesForCollections(finalData, collectionName, forceDownload, patternFilter);
        }
        console.log(`[MAIN] Image downloads completed`);
        
        // Automatically deploy to server after downloading images
        console.log(`[MAIN] Starting automatic server deployment...`);
        try {
            await deployToServer(collectionName);
            console.log(`[MAIN] Server deployment completed`);
        } catch (error) {
            console.error(`[MAIN ERROR] Server deployment failed:`, error.message);
            console.error(`[MAIN ERROR] Images were downloaded locally but not deployed to server`);
            console.error(`[MAIN ERROR] Run './deploy.sh -images' manually to deploy`);
        }
    } else {
        console.log(`[MAIN] Skipping image downloads (downloadImages=${downloadImages})`);
    }

    console.log(`[MAIN] Main execution completed`);
    
    // Print comprehensive file summary
    printFileProcessingSummary();
    
    console.log(`=== MAIN COMPLETE ===\n`);
}

// Print comprehensive file processing summary
function printFileProcessingSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📁 FILE PROCESSING SUMMARY');
    console.log('='.repeat(60));
    
    // Data files
    if (processedFiles.dataFiles.length > 0) {
        console.log('\n🗃️  DATA FILES PROCESSED:');
        processedFiles.dataFiles.forEach(file => {
            console.log(`   ✅ ${file.type}`);
            console.log(`      Path: ${file.path}`);
            if (file.collections) console.log(`      Collections: ${file.collections}`);
            if (file.patterns) console.log(`      Total Patterns: ${file.patterns}`);
            console.log('');
        });
    }
    
    // CSV files
    if (processedFiles.csvFiles.length > 0) {
        console.log('📊 CSV FILES GENERATED:');
        processedFiles.csvFiles.forEach(file => {
            console.log(`   ✅ ${file.type}`);
            console.log(`      Path: ${file.path}`);
            if (file.patterns) console.log(`      Patterns: ${file.patterns}`);
            if (file.purpose) console.log(`      Purpose: ${file.purpose}`);
            if (file.timestamp) console.log(`      Generated: ${file.timestamp}`);
            console.log('');
        });
    }
    
    // Deployment files
    if (processedFiles.deploymentFiles.length > 0) {
        console.log('🚀 DEPLOYMENT FILES:');
        processedFiles.deploymentFiles.forEach(file => {
            console.log(`   ✅ ${file.type}`);
            console.log(`      Path: ${file.path}`);
            if (file.details) console.log(`      Details: ${file.details}`);
            console.log('');
        });
    }
    
    if (processedFiles.dataFiles.length === 0 && processedFiles.csvFiles.length === 0 && processedFiles.deploymentFiles.length === 0) {
        console.log('   ⚠️  No output files were generated');
    }
    
    console.log('='.repeat(60));
    console.log('🎯 READY FOR DEPLOYMENT');
    console.log('='.repeat(60));
}

/** Strip --pattern / --pattern= from argv; merge with CF_PATTERN_FILTER env (env wins if flag absent). */
function parseCfDlArgv(argv) {
    const positional = [];
    let patternFromFlag = (process.env.CF_PATTERN_FILTER || '').trim();
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--pattern' && argv[i + 1]) {
            patternFromFlag = String(argv[i + 1]).trim();
            i++;
            continue;
        }
        if (a.startsWith('--pattern=')) {
            patternFromFlag = a.slice('--pattern='.length).trim();
            continue;
        }
        positional.push(a);
    }
    const patternFilter = patternFromFlag || null;
    return { positional, patternFilter };
}

// Update the command line arguments parsing
const { positional: args, patternFilter: cliPatternFilter } = parseCfDlArgv(process.argv.slice(2));
const downloadImages = args[0] === 'true';
const collectionName = args[1] || null;
const generateShopify = args[2] === 'shopify';
const forceDownload = args[3] === 'force' || args[2] === 'force';
const incrementalMode = args[3] === 'incremental' || args[4] === 'incremental';

console.log(`\n=== SCRIPT START ===`);
console.log(
    `Arguments: downloadImages=${downloadImages}, collectionName=${collectionName}, generateShopify=${generateShopify}, forceDownload=${forceDownload}, incrementalMode=${incrementalMode}, patternFilter=${cliPatternFilter || '(none)'}`
);

// Export functions for use in other modules
module.exports = {
    fetchCollectionData,
    downloadImagesForCollections,
    generateShopifyCSV,
    generateShopifyTemplate,
    main
};

// Only run main if this file is executed directly
if (require.main === module) {
    main(downloadImages, collectionName, generateShopify, forceDownload, incrementalMode, cliPatternFilter).catch((err) =>
        console.error('Main error:', err)
    );
}