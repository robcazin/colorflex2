
// 🚨 DEBUG: Updated CFM.js with thumbnail capture - July 30, 2025 at 14:25
console.log('🚨 DEBUG: ColorFlex CFM.js loaded - Version with thumbnail capture!');

// Create a dimensions display element
// const dimensionsDisplay = document.createElement('div');
// dimensionsDisplay.id = 'dimensions-display';
// dimensionsDisplay.style.cssText = `
//     position: fixed;
//     top: 10px;
//     right: 10px;
//     background: rgba(0, 0, 0, 0.7);
//     color: white;
//     padding: 5px 10px;
//     font-size: 14px;
//     font-family: monospace;
//     z-index: 1000;
//     border-radius: 3px;
// `;
// document.body.appendChild(dimensionsDisplay);

// // Function to update dimensions in the UI
// const updateDimensionsDisplay = () => {
//     const width = window.innerWidth;
//     const height = window.innerHeight;
//     dimensionsDisplay.textContent = `${width} x ${height}px`;
// };

// updateDimensionsDisplay();

// window.addEventListener('resize', updateDimensionsDisplay);

// Wrap your key functions:
function traceWrapper(fn, name) {
  return function(...args) {
    console.group(`🧠 ${name}`);
    console.log('Arguments:', args);
    const result = fn.apply(this, args);
    console.log('Result:', result);
    console.groupEnd();
    return result;
  };
}

// Then guard against premature loading:
function guard(fn) {
  return function (...args) {
    if (!isAppReady) {
      console.warn(`⏳ Skipping ${fn.name} — app not ready`);
      return;
    }
    return fn.apply(this, args);
  };
}


/**
 * =============================================================================
 * COLORFLEX MAIN APPLICATION (CFM.js)
 * =============================================================================
 * 
 * This is the core application file for the ColorFlex pattern customization system.
 * It handles pattern rendering, customer save functionality, and UI interactions.
 * 
 * KEY FEATURES:
 * - Advanced fabric rendering with multiple blend modes
 * - Real-time pattern color customization
 * - Customer pattern saving with Shopify integration
 * - Resolution-independent image processing
 * - Interactive UI components and modals
 * 
 * MAIN FUNCTION GROUPS:
 * 1. Configuration & Setup (lines ~60-120)
 * 2. Customer Save System (lines ~120-650) 
 * 3. Fabric Rendering Engine (lines ~650-1200)
 * 4. Pattern Processing (lines ~1200-2000)
 * 5. UI Components & Events (lines ~2000-end)
 * =============================================================================
 */

// ---- Debug Logging Setup ----
const DEBUG_TRACE = false; // set to false to disable tracing
const USE_GUARD = false;

// Optional: Remove later by commenting out or deleting these lines// Toggle flag for normalization (set to false for binary threshold, true for normalization)
const USE_NORMALIZATION = true; // Change to true to enable normalization

/**
 * =============================================================================
 * SECTION 1: CONFIGURATION & SETUP
 * =============================================================================
 */

/**
 * Fabric composite tuning parameters
 * These control the visual appearance of fabric rendering
 * 
 * @type {Object}
 * @property {number} alphaStrength - Controls pattern opacity (0.0 - 2.0)
 * @property {number} baseTintStrength - Controls background color influence (0.0 - 2.0)
 * @property {number} patternContrast - Controls pattern contrast (0.0 - 3.0)
 * @property {number} shadowMultiplier - Controls shadow strength (0.0 - 2.0)  
 * @property {number} colorVibrance - Controls color saturation (0.0 - 2.0)
 * @property {string} blendMode - Blend mode selection: 'multiply', 'overlay', 'soft-light', 'auto'
 * @property {number} glossyStrength - Controls glossy layer opacity (0.0 - 2.0)
 */
const fabricTuning = {
    alphaStrength: 1.0,     // Controls pattern opacity (0.0 - 2.0)
    baseTintStrength: 1.0,  // Controls how much background color affects fabric base (0.0 - 2.0)
    patternContrast: 1.0,   // Controls pattern contrast (0.0 - 3.0)
    shadowMultiplier: 1.0,  // Controls shadow interaction strength (0.0 - 2.0)
    colorVibrance: 1.2,     // Controls color saturation (0.0 - 2.0)
    blendMode: 'auto',      // Blend mode: 'multiply', 'overlay', 'soft-light', 'auto'
    glossyStrength: 1.0     // Controls glossy layer opacity (0.0 - 2.0)
};

// Control visibility of fabric tuning controls
const SHOW_FABRIC_CONTROLS = false; // Set to true to show controls, false to hide


// Debounce function for tuning controls
let fabricRenderTimeout;
function debouncedFabricRender() {
    clearTimeout(fabricRenderTimeout);
    fabricRenderTimeout = setTimeout(() => {
        if (appState.isInFabricMode) {
            renderFabricMockup();
        }
    }, 100); // 100ms debounce
}

// App state - Made global for save functionality
window.appState = {
    collections: [],
    colorsData: [],
    currentPattern: null,
    currentLayers: [],
    curatedColors: [],
    layerInputs: [],
    selectedCollection: null,
    cachedLayerPaths: [],
    lastSelectedLayer: null,
    currentScale: 10,
    designer_colors: [],
    originalPattern: null,
    originalCoordinates: null,
    originalLayerInputs: null,
    originalCurrentLayers: null,
    lastSelectedColor: null,
    selectedFurniture: null,
    isInFabricMode: false
};

const BACKGROUND_INDEX = 0;
const FURNITURE_BASE_INDEX = 1;
const PATTERN_BASE_INDEX = 2;
let isAppReady = false; // Flag to track if the app is fully initialized

/**
 * =============================================================================
 * SECTION 2: CUSTOMER SAVE SYSTEM  
 * =============================================================================
 * 
 * This section handles saving customer patterns to Shopify metafields or localStorage.
 * It includes validation, API calls, notifications, and UI components.
 */

/**
 * Main save function - saves current pattern to customer's list
 * 
 * FLOW:
 * 1. Validate pattern data (pattern, collection, layers)
 * 2. Try saving to Shopify customer metafields (if authenticated)
 * 3. Fall back to localStorage if Shopify unavailable
 * 4. Show user notification with result
 * 
 * @global
 * @function saveToMyList
 * @throws {Error} If pattern data is incomplete or save operation fails
 */

/**
 * Capture the current pattern preview as a thumbnail image
 * @returns {string|null} Base64 data URL of the captured thumbnail, or null if capture fails
 */
function capturePatternThumbnail() {
    try {
        // Try to find the pattern preview element - check common selectors
        const selectors = [
            '#preview', // Main ColorFlex preview container
            '#pattern-preview',
            '.pattern-preview', 
            '#colorflex-preview',
            '.colorflex-preview',
            '#pattern-display',
            '.pattern-display',
            '[id*="preview"]',
            '[class*="preview"]'
        ];
        
        let previewElement = null;
        console.log('🔍 Searching for pattern preview elements...');
        for (const selector of selectors) {
            previewElement = document.querySelector(selector);
            if (previewElement) {
                console.log('📸 Found pattern preview element:', selector, previewElement);
                break;
            } else {
                console.log('❌ Not found:', selector);
            }
        }
        
        if (!previewElement) {
            console.warn('⚠️ No pattern preview element found for thumbnail capture');
            // List all available elements for debugging
            console.log('🔍 Available elements with "pattern" in ID/class:');
            document.querySelectorAll('[id*="pattern"], [class*="pattern"]').forEach(el => {
                console.log('  -', el.tagName, el.id || el.className);
            });
            console.log('🔍 Available SVG elements:', document.querySelectorAll('svg').length);
            console.log('🔍 Available Canvas elements:', document.querySelectorAll('canvas').length);
            return null;
        }
        
        // If we found a container, look for the actual pattern inside it
        let actualPatternElement = null;
        if (previewElement.tagName === 'DIV') {
            // Look for canvas or SVG inside the container
            actualPatternElement = previewElement.querySelector('canvas') || 
                                 previewElement.querySelector('svg') ||
                                 previewElement.querySelector('[data-pattern]');
            
            if (actualPatternElement) {
                console.log('📸 Found actual pattern element inside container:', actualPatternElement.tagName);
                previewElement = actualPatternElement;
            } else {
                console.log('📸 No canvas/SVG found inside container, will use DIV with background');
                console.log('📸 Background image:', getComputedStyle(previewElement).backgroundImage);
                console.log('📸 Background size:', getComputedStyle(previewElement).backgroundSize);
            }
        }
        
        // Create a canvas to capture the element
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set thumbnail size (optimized high resolution - 800x800 with JPEG compression)
        canvas.width = 800;
        canvas.height = 800;
        
        // If it's already a canvas, just copy it
        if (previewElement.tagName === 'CANVAS') {
            ctx.drawImage(previewElement, 0, 0, 800, 800);
        }
        // If it's an SVG, we'll need a different approach due to async nature
        else if (previewElement.tagName === 'SVG') {
            // For now, create a placeholder - SVG capture requires async handling
            ctx.fillStyle = '#e8f4fd';
            ctx.fillRect(0, 0, 800, 800);
            ctx.fillStyle = '#2c5aa0';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('SVG Pattern', 100, 90);
            ctx.fillText('Preview', 100, 110);
        }
        // For other elements, create a simple representation
        else {
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, 800, 800);
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Custom Pattern', 100, 90);
            ctx.fillText('Preview', 100, 110);
        }
        
        // Convert to base64 data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        console.log('📸 Captured pattern thumbnail (length:', dataUrl.length, ')');
        return dataUrl;
        
    } catch (error) {
        console.error('❌ Failed to capture pattern thumbnail:', error);
        return null;
    }
}

// Generate meaningful pattern ID based on collection and colors
function generatePatternId(collectionName, layers) {
    // Start with collection name
    let id = collectionName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Extract SW numbers from colors
    const swNumbers = [];
    layers.forEach(layer => {
        if (layer.color) {
            // Look for SW/SC numbers in the color name
            const swMatch = layer.color.match(/\b(SW|SC)(\d+)\b/i);
            if (swMatch) {
                swNumbers.push(swMatch[2]); // Just the number part
            } else {
                // For colors without SW numbers, create a short hash
                const colorHash = layer.color.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 4);
                if (colorHash) swNumbers.push(colorHash);
            }
        }
    });
    
    // Combine collection + sw numbers
    if (swNumbers.length > 0) {
        id += '-' + swNumbers.join('-');
    }
    
    // Add timestamp for uniqueness if ID gets too long
    if (id.length > 50) {
        // Keep it manageable by using first 30 chars + short timestamp
        id = id.substring(0, 30) + '-' + Date.now().toString().slice(-6);
    }
    
    return id;
}

window.saveToMyList = function() {
    console.log('🎯 saveToMyList() function called!');
    try {
        // Use global appState reference
        const state = window.appState;
        
        // Validate that we have the required data
        if (!state.currentPattern || !state.currentPattern.name) {
            showSaveNotification('❌ No pattern selected to save');
            return;
        }
        
        if (!state.selectedCollection || !state.selectedCollection?.name) {
            showSaveNotification('❌ No collection selected');
            return;
        }
        
        if (!state.currentLayers || state.currentLayers.length === 0) {
            showSaveNotification('❌ No layers to save');
            return;
        }
        
        console.log('🔄 Starting pattern save process...');
        
        // Capture pattern thumbnail before saving
        console.log('📸 About to capture thumbnail...');
        const thumbnailDataUrl = capturePatternThumbnail();
        console.log('📸 Thumbnail capture result:', thumbnailDataUrl ? 'Success' : 'Failed');
        
        // Capture current pattern state - match Liquid template structure
        const currentState = {
            collectionName: state.selectedCollection?.name || 'Unknown',
            patternName: state.currentPattern.name,
            colors: state.currentLayers.map(layer => ({
                label: layer.label,
                color: layer.color
            })),
            thumbnail: thumbnailDataUrl, // Store the captured thumbnail
            timestamp: new Date().toISOString(),
            id: generatePatternId(appState.selectedCollection.name, appState.currentLayers) // Meaningful ID based on collection + colors
        };
        
        console.log('💾 Saving pattern to list:', currentState);
        
        // Try to save to Shopify customer metafields (if available)
        const customerId = getCustomerId();
        const customerAccessToken = getCustomerAccessToken();
        
        if (customerId && customerAccessToken) {
            saveToShopifyMetafields(currentState).then(function() {
                console.log('✅ Saved to Shopify customer metafields');
            }).catch(function(error) {
                console.log('🔄 Shopify save failed, using localStorage fallback');
                saveToLocalStorage(currentState);
            });
        } else {
            // Fall back to localStorage for development/testing
            console.log('📱 Customer not authenticated, saving to localStorage');
            saveToLocalStorage(currentState);
        }
        
        // Show success message
        showSaveNotification('✅ Pattern saved to your list!');
        
    } catch (error) {
        console.error('❌ Failed to save pattern:', error);
        showSaveNotification('❌ Failed to save pattern');
    }
};

/**
 * Saves pattern data to Shopify customer metafields
 * 
 * This function handles the API communication with the custom Shopify app
 * to store pattern data in the customer's private metafields.
 * 
 * @param {Object} patternData - Complete pattern information to save
 * @param {Object} patternData.pattern - Pattern details
 * @param {string} patternData.pattern.name - Pattern name
 * @param {string} patternData.pattern.collection - Collection name
 * @param {Array} patternData.pattern.layers - Layer configurations
 * @param {string} patternData.timestamp - Save timestamp
 * @param {number} patternData.id - Unique pattern ID
 * @returns {Promise} Resolves with save result or rejects with error
 */
function saveToShopifyMetafields(patternData) {
    return new Promise(function(resolve, reject) {
        try {
            var customerId = getCustomerId();
            var customerAccessToken = getCustomerAccessToken();
            
            if (!customerId || !customerAccessToken) {
                reject(new Error('Customer not authenticated'));
                return;
            }

            console.log('🔄 Saving to Shopify customer metafields...');
            
            fetch('/api/colorFlex/save-pattern', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Customer-Access-Token': customerAccessToken
                },
                body: JSON.stringify({
                    customerId: customerId,
                    patternData: patternData
                })
            }).then(function(response) {
                if (!response.ok) {
                    response.json().then(function(errorData) {
                        reject(new Error(errorData.message || 'Failed to save to Shopify'));
                    }).catch(function() {
                        reject(new Error('Failed to save to Shopify'));
                    });
                    return;
                }

                response.json().then(function(result) {
                    console.log('✅ Pattern saved to Shopify metafields:', result);
                    resolve(result);
                }).catch(function(error) {
                    reject(error);
                });
                
            }).catch(function(error) {
                console.error('❌ Shopify save failed:', error);
                // Fallback to localStorage
                console.log('🔄 Falling back to localStorage...');
                saveToLocalStorage(patternData);
                reject(error);
            });
            
        } catch (error) {
            console.error('❌ Shopify save failed:', error);
            // Fallback to localStorage
            console.log('🔄 Falling back to localStorage...');
            saveToLocalStorage(patternData);
            reject(error);
        }
    });
}

// Save to localStorage as fallback
function saveToLocalStorage(patternData) {
    const existingPatterns = JSON.parse(localStorage.getItem('colorflexSavedPatterns') || '[]');
    existingPatterns.push(patternData);
    
    // Limit to last 20 patterns
    const limitedPatterns = existingPatterns.slice(-20);
    localStorage.setItem('colorflexSavedPatterns', JSON.stringify(limitedPatterns));
    
    // Update menu icon
    updateSavedPatternsMenuIcon();
}

// Helper functions
function getShopifyMetafield(key) {
    // In a real Shopify app, this would fetch from customer metafields
    return JSON.parse(localStorage.getItem('colorflexSavedPatterns') || '[]');
}

function getCustomerId() {
    // Get from Shopify customer object or URL params
    if (window.ShopifyCustomer && window.ShopifyCustomer.id) {
        return window.ShopifyCustomer.id;
    }
    
    // Check for Liquid template customer ID
    if (typeof window.customer !== 'undefined' && window.customer.id) {
        return window.customer.id;
    }
    
    // Fallback to localStorage for development
    return localStorage.getItem('development_customer_id') || null;
}

function getCustomerAccessToken() {
    // Get from Shopify customer access token
    if (window.ShopifyCustomer && window.ShopifyCustomer.access_token) {
        return window.ShopifyCustomer.access_token;
    }
    
    // Check for global customer access token
    if (window.customerAccessToken) {
        return window.customerAccessToken;
    }
    
    // Fallback for development
    return localStorage.getItem('development_customer_token') || null;
}

function showSaveNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${message.includes('✅') ? '#48bb78' : '#f56565'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-family: 'Special Elite', monospace;
        font-size: 14px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
        style.remove();
    }, 3000);
}

/**
 * =============================================================================
 * SECTION 3: UI COMPONENTS & INTERACTIONS
 * =============================================================================
 * 
 * This section handles UI elements, modals, notifications, and user interactions
 * for the pattern save system.
 */

/**
 * Adds save and view buttons to the pattern preview area
 * 
 * This function locates the existing save button in the DOM and adds a 
 * "View Saved Patterns" button next to it with matching styling.
 * 
 * FLOW:
 * 1. Check if view button already exists (prevent duplicates)
 * 2. Find existing save button in DOM
 * 3. Create new view button with matching styles
 * 4. Add to same container as existing button
 * 5. Wire up click event handlers
 * 
 * @function addSaveButton
 */
function addSaveButton() {
    console.log('🔍 addSaveButton() called');
    
    // Check if view button already exists
    if (document.getElementById('viewSavedBtn')) {
        console.log('✅ View button already exists');
        return;
    }
    
    // Find the existing save button
    const existingSaveButton = document.getElementById('saveToListButton');
    if (!existingSaveButton) {
        console.warn('❌ Existing save button not found');
        return;
    }
    
    console.log('✅ Existing save button found, adding view button next to it...');
    
    // Create "View Saved" button with the same styling as existing save button
    const viewSavedButton = document.createElement('button');
    viewSavedButton.id = 'viewSavedBtn';
    viewSavedButton.className = 'py-4';
    viewSavedButton.setAttribute('aria-label', 'View Saved Patterns');
    viewSavedButton.setAttribute('data-tooltip', 'View your saved patterns');
    viewSavedButton.style.cssText = existingSaveButton.style.cssText;
    viewSavedButton.style.background = '#6b8dc9ff'; // Different color to distinguish
    
    viewSavedButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3h18v18H3zM9 9h6v6H9z"></path>
        </svg>
        View Saved
    `;
    
    // Add click handler for view saved patterns
    viewSavedButton.addEventListener('click', showSavedPatternsModal);
    
    // Add the view button next to the existing save button
    const buttonContainer = existingSaveButton.parentNode;
    if (buttonContainer) {
        buttonContainer.appendChild(viewSavedButton);
        console.log('✅ View button added to button container');
    } else {
        console.warn('❌ Could not find button container');
    }
    
    console.log('🔍 Button IDs in DOM:', {
        existingSaveBtn: document.getElementById('saveToListButton') ? 'EXISTS' : 'NOT FOUND',
        newViewBtn: document.getElementById('viewSavedBtn') ? 'EXISTS' : 'NOT FOUND'
    });
    
    // IMPORTANT: Override the existing save button to use our thumbnail capture function
    console.log('🔧 Binding our saveToMyList function to existing save button...');
    
    // Remove any existing click handlers and add our own
    const newSaveButton = existingSaveButton.cloneNode(true);
    existingSaveButton.parentNode.replaceChild(newSaveButton, existingSaveButton);
    
    newSaveButton.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('💾 Save button clicked - calling our saveToMyList()');
        window.saveToMyList();
    });
}

/**
 * Displays a modal showing all saved patterns for the current user
 * 
 * This function loads saved patterns from either Shopify metafields (for logged-in users)
 * or localStorage (for guest users) and displays them in an interactive modal.
 * 
 * FEATURES:
 * - Shows pattern name, collection, save date, and layer count
 * - Displays actual color codes used in each layer
 * - Delete functionality with confirmation
 * - Responsive modal design with overlay
 * 
 * @function showSavedPatternsModal
 */
function showSavedPatternsModal() {
    try {
        console.log('🔍 Loading saved patterns...');
        
        // Get saved patterns from localStorage (will add Shopify support later)
        var savedPatterns = JSON.parse(localStorage.getItem('colorflexSavedPatterns') || '[]');
        console.log('📱 Loaded patterns from localStorage:', savedPatterns.length);
        
        createSavedPatternsModal(savedPatterns);
        
    } catch (error) {
        console.error('❌ Error loading saved patterns:', error);
        showSaveNotification('❌ Failed to load saved patterns');
    }
}

// Create saved patterns modal
function createSavedPatternsModal(patterns) {
    // Remove existing modal
    var existingModal = document.getElementById('savedPatternsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal overlay
    var modal = document.createElement('div');
    modal.id = 'savedPatternsModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    // Create modal content
    var modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: #1a202c;
        color: white;
        padding: 20px;
        border-radius: 10px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        font-family: 'Special Elite', monospace;
        border: 2px solid #4a5568;
    `;
    
    // Modal header
    var header = document.createElement('div');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #d4af37; padding-bottom: 10px;';
    
    var title = document.createElement('h2');
    title.textContent = '📂 My Saved Patterns (' + patterns.length + ')';
    title.style.margin = '0';
    title.style.color = '#efeeeaff';
    title.style.fontFamily = "'Island Moments', italic";
    
    var closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
        background: transparent;
        border: 1px solid #4a5568;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: #f56565;
    `;
    closeBtn.addEventListener('click', function() { modal.remove(); });
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    modalContent.appendChild(header);
    
    // Patterns list
    if (patterns.length === 0) {
        var emptyMessage = document.createElement('div');
        emptyMessage.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #a0aec0;">
                <div style="font-size: 48px; margin-bottom: 20px;">
                <img src="https://so-animation.com/colorflex/img/camelion-sm-r.jpg" style="width: 100px; height: 100px; border-radius: 50%; margin-bottom: 20px;">
                <h3>No saved patterns yet</h3>
                <div style="font-size: 24px; margin-bottom: 20px;">
                <p>Start customizing patterns and save your favorites!</p>
                </div>
            </div>
        `;
        modalContent.appendChild(emptyMessage);
    } else {
        for (var i = 0; i < patterns.length; i++) {
            var patternDiv = createSavedPatternItem(patterns[i], i);
            modalContent.appendChild(patternDiv);
        }
    }
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Close on overlay click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Create individual saved pattern item
function createSavedPatternItem(pattern, index) {
    console.log('🔍 DEBUG: createSavedPatternItem called for pattern:', pattern.patternName);
    var item = document.createElement('div');
    item.style.cssText = `
        border: 1px solid #4a5568;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 15px;
        background: #2d3748;
        transition: background 0.3s ease;
        position: relative;
        min-height: 400px;
    `;
    
    // Hover effect
    item.addEventListener('mouseenter', function() {
        item.style.background = '#374151';
    });
    item.addEventListener('mouseleave', function() {
        item.style.background = '#2d3748';
    });
    
    // ID Badge will be positioned with Buy It button later
    
    // Pattern Name (large, script font)
    var patternName = document.createElement('div');
    patternName.style.cssText = `
        font-family: 'Island Moments', cursive;
        font-size: 48px;
        color: white;
        margin-bottom: 8px;
        line-height: 1.1;
    `;
    patternName.textContent = pattern.patternName;
    
    // Collection info section
    var collectionInfo = document.createElement('div');
    collectionInfo.style.cssText = 'margin-bottom: 12px;';
    
    var collectionLabel = document.createElement('div');
    collectionLabel.style.cssText = `
        color: #a0aec0;
        font-size: 14px;
        font-family: 'Special Elite', monospace;
        margin-bottom: 4px;
    `;
    collectionLabel.innerHTML = `
        <strong style="color: #e2e8f0;">Collection:</strong><br>
        ${pattern.collectionName ? pattern.collectionName.charAt(0).toUpperCase() + pattern.collectionName.slice(1) : 'Unknown'}
    `;
    
    // Metadata section (saved date, layers)
    var metadata = document.createElement('div');
    metadata.style.cssText = 'display: flex; gap: 20px; margin-bottom: 16px;';
    
    var savedInfo = document.createElement('div');
    savedInfo.style.cssText = 'display: flex; align-items: center; gap: 6px;';
    savedInfo.innerHTML = `
        <span style="font-size: 16px;">📅</span>
        <div style="color: #e2e8f0; font-family: 'Special Elite', monospace;">
            <strong>Saved:</strong><br>
            <span style="color: #a0aec0;">${new Date(pattern.timestamp).toLocaleDateString()}</span>
        </div>
    `;
    
    var layersInfo = document.createElement('div');
    layersInfo.style.cssText = 'display: flex; align-items: center; gap: 6px;';
    layersInfo.innerHTML = `
        <span style="font-size: 16px;">🎯</span>
        <div style="color: #e2e8f0; font-family: 'Special Elite', monospace;">
            <strong>Layers:</strong><br>
            <span style="color: #a0aec0;">${pattern.colors ? pattern.colors.length : 0}</span>
        </div>
    `;
    
    metadata.appendChild(savedInfo);
    metadata.appendChild(layersInfo);
    
    // Layer Details section
    var layerDetails = document.createElement('div');
    layerDetails.style.cssText = 'margin-bottom: 16px;';
    
    var layerDetailsTitle = document.createElement('div');
    layerDetailsTitle.style.cssText = `
        color: #d4af37;
        font-size: 14px;
        font-family: 'Special Elite', monospace;
        font-weight: bold;
        margin-bottom: 8px;
    `;
    layerDetailsTitle.textContent = 'Layer Details:';
    
    var layerDetailsList = document.createElement('div');
    layerDetailsList.style.cssText = 'font-size: 12px; color: #a0aec0; line-height: 1.4;';
    
    if (pattern.colors && pattern.colors.length > 0) {
        pattern.colors.forEach(function(color) {
            var layerItem = document.createElement('div');
            layerItem.style.cssText = 'margin-bottom: 2px;';
            layerItem.innerHTML = `• ${color.label}: ${color.color}`;
            layerDetailsList.appendChild(layerItem);
        });
    }
    
    layerDetails.appendChild(layerDetailsTitle);
    layerDetails.appendChild(layerDetailsList);
    
    // Large Pattern Thumbnail
    var thumbnailContainer = document.createElement('div');
    thumbnailContainer.style.cssText = `
        width: 100%;
        height: 200px;
        margin-bottom: 16px;
        border-radius: 8px;
        overflow: hidden;
        border: 2px solid #d4af37;
    `;
    
    if (pattern.thumbnail) {
        var thumbnailImg = document.createElement('img');
        thumbnailImg.src = pattern.thumbnail;
        thumbnailImg.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
        `;
        thumbnailImg.alt = pattern.patternName + ' thumbnail';
        
        // Handle thumbnail load error
        thumbnailImg.onerror = function() {
            // Create placeholder if image fails to load
            var placeholder = document.createElement('div');
            placeholder.style.cssText = `
                width: 100%;
                height: 100%;
                background: #2d3748;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #d4af37;
                font-family: 'Special Elite', monospace;
                font-size: 48px;
            `;
            placeholder.textContent = '🎨';
            thumbnailContainer.replaceChild(placeholder, thumbnailImg);
        };
        
        thumbnailContainer.appendChild(thumbnailImg);
    } else {
        // Create placeholder if no thumbnail
        var placeholder = document.createElement('div');
        placeholder.style.cssText = `
            width: 100%;
            height: 100%;
            background: #2d3748;
            background-image: url('https://so-animation.com/colorflex/img/camelion-sm.jpg');
            background-size: cover;
            background-position: center;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #d4af37;
            font-family: 'Special Elite', monospace;
            font-size: 48px;
        `;
        placeholder.textContent = "";
        thumbnailContainer.appendChild(placeholder);
    }
    
    // Assemble the top section
    var topSection = document.createElement('div');
    topSection.appendChild(patternName);
    topSection.appendChild(collectionInfo);
    topSection.appendChild(collectionLabel);
    topSection.appendChild(metadata);
    topSection.appendChild(layerDetails);
    
    // Assemble everything
    var mainContent = document.createElement('div');
    mainContent.appendChild(topSection);
    mainContent.appendChild(thumbnailContainer);
    
    // Three-button layout at bottom
    var buttons = document.createElement('div');
    buttons.style.cssText = 'display: flex; gap: 10px; margin-top: auto; padding-top: 16px;';
    
    // Load Pattern button (yellow border)
    var loadBtn = document.createElement('button');
    loadBtn.textContent = '🔄 Open in ColorFlex';
    loadBtn.style.cssText = `
        background: transparent;
        color: #d4af37;
        border: 2px solid #d4af37;
        padding: 10px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-family: 'Special Elite', monospace;
        transition: all 0.3s ease;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    `;
    loadBtn.addEventListener('mouseenter', function() {
        loadBtn.style.background = '#d4af37';
        loadBtn.style.color = '#1a202c';
    });
    loadBtn.addEventListener('mouseleave', function() {
        loadBtn.style.background = 'transparent';
        loadBtn.style.color = '#d4af37';
    });
    loadBtn.addEventListener('click', function() {
        loadSavedPatternToUI(pattern);
    });
    
    // Download Proof button (blue background)
    var downloadProofBtn = document.createElement('button');
    downloadProofBtn.textContent = '📥 Download Proof';
    downloadProofBtn.style.cssText = `
        background: #667eea;
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        transition: all 0.2s ease;
        flex: 1;
        min-width: 0;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    `;
    
    downloadProofBtn.addEventListener('mouseenter', function() {
        this.style.background = '#5a67d8';
        this.style.transform = 'translateY(-1px)';
    });
    downloadProofBtn.addEventListener('mouseleave', function() {
        this.style.background = '#667eea';
        this.style.transform = 'translateY(0)';
    });
    downloadProofBtn.addEventListener('click', function() {
        downloadSavedPatternProof(pattern);
    });
    
    // Delete button (red border)
    var deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️ Delete';
    deleteBtn.style.cssText = `
        background: transparent;
        color: #f56565;
        border: 2px solid #f56565;
        padding: 10px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-family: 'Special Elite', monospace;
        transition: all 0.3s ease;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    `;
    deleteBtn.addEventListener('mouseenter', function() {
        deleteBtn.style.background = '#f56565';
        deleteBtn.style.color = 'white';
    });
    deleteBtn.addEventListener('mouseleave', function() {
        deleteBtn.style.background = 'transparent';
        deleteBtn.style.color = '#f56565';
    });
    deleteBtn.addEventListener('click', function() {
        if (confirm('🗑️ Delete "' + pattern.patternName + '"?\n\nThis action cannot be undone.')) {
            deleteSavedPattern(pattern.id);
            document.getElementById('savedPatternsModal').remove();
            showSavedPatternsModal(); // Refresh modal
        }
    });
    
    // Buy it! button (purple background)
    var addToCartBtn = document.createElement('button');
    addToCartBtn.textContent = 'Buy it!';
    addToCartBtn.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 30px;
        font-family: 'Island Moments', cursive;
        transition: all 0.3s ease;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 0.25rem;
        flex: 1;
    `;
    addToCartBtn.addEventListener('mouseenter', function() {
        addToCartBtn.style.transform = 'translateY(-2px)';
        addToCartBtn.style.boxShadow = '0 4px 8px rgba(102, 126, 234, 0.3)';
    });
    addToCartBtn.addEventListener('mouseleave', function() {
        addToCartBtn.style.transform = 'translateY(0)';
        addToCartBtn.style.boxShadow = 'none';
    });
    addToCartBtn.addEventListener('click', function() {
        showMaterialSelectionModal(pattern);
    });

    buttons.appendChild(loadBtn);
    buttons.appendChild(downloadProofBtn);
    buttons.appendChild(deleteBtn);
    
    // Create separate container for Buy it! button and ID badge at bottom
    var downloadButtonContainer = document.createElement('div');
    downloadButtonContainer.style.cssText = 'margin-top: 16px; padding-top: 16px; border-top: 1px solid #4a5568; display: flex; align-items: center; gap: 12px;';
    
    // ID Badge (positioned next to Buy It button)
    var idBadge = document.createElement('div');
    idBadge.style.cssText = `
        background: transparent;
        border: 2px solid #d4af37;
        color: #d4af37;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-family: 'Special Elite', monospace;
        font-weight: bold;
        white-space: nowrap;
    `;
    idBadge.textContent = `ID: ${pattern.id} (FIXED)`;
    
    downloadButtonContainer.appendChild(addToCartBtn);
    downloadButtonContainer.appendChild(idBadge);
    
    item.appendChild(mainContent);
    item.appendChild(buttons);
    item.appendChild(downloadButtonContainer);
    
    return item;
}

// Download proof for a saved pattern
function downloadSavedPatternProof(pattern) {
    try {
        console.log('🔧 Download proof requested for saved pattern:', pattern.patternName);
        
        if (!pattern.colors || pattern.colors.length === 0) {
            alert('No colors found in saved pattern');
            return;
        }
        
        // Extract color strings from saved pattern color objects
        const colorArray = pattern.colors.map(colorObj => colorObj.color);
        
        console.log('🎨 Generating proof for:', pattern.patternName, 'from collection:', pattern.collectionName, 'with colors:', colorArray);
        
        // Use the same proof generation as product pages
        window.generatePatternProof(
            pattern.patternName,
            pattern.collectionName,
            colorArray
        ).then(canvas => {
            console.log('✅ Pattern proof generation complete, adding customer info...');
            
            // Add customer personalization to the proof
            const personalizedCanvas = addCustomerInfoToProof(canvas, pattern);
            
            const filename = `${pattern.patternName}_${pattern.collectionName}_proof.jpg`;
            window.downloadPatternProof(personalizedCanvas, filename);
        }).catch(error => {
            console.error('❌ Error generating saved pattern proof:', error);
            alert('Error generating proof. Check console for details.');
        });
        
    } catch (error) {
        console.error('❌ Error in downloadSavedPatternProof:', error);
        alert('Error downloading proof. Please try again.');
    }
}

// Delete a saved pattern
function deleteSavedPattern(patternId) {
    try {
        // Delete from localStorage
        var patterns = JSON.parse(localStorage.getItem('colorflexSavedPatterns') || '[]');
        var updatedPatterns = patterns.filter(function(p) { return p.id !== patternId; });
        localStorage.setItem('colorflexSavedPatterns', JSON.stringify(updatedPatterns));
        
        console.log('✅ Pattern deleted from localStorage');
        
        // Update menu icon
        updateSavedPatternsMenuIcon();
        showSaveNotification('✅ Pattern deleted successfully!');
        
    } catch (error) {
        console.error('❌ Error deleting pattern:', error);
        showSaveNotification('❌ Failed to delete pattern');
    }
}

/**
 * Show material selection modal for adding pattern to cart
 * @param {Object} pattern - The saved pattern data
 */
function showMaterialSelectionModal(pattern) {
    // Remove existing modal if present
    var existingModal = document.getElementById('materialSelectionModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal overlay
    var modal = document.createElement('div');
    modal.id = 'materialSelectionModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: 'Special Elite', monospace;
    `;

    // Create modal content
    var modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: #1a202c;
        color: #e2e8f0;
        padding: 30px;
        border-radius: 12px;
        width: 90%;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        border: 2px solid #4a5568;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    `;

    // Modal header
    var header = document.createElement('div');
    header.style.cssText = 'margin-bottom: 20px; text-align: center;';
    header.innerHTML = `
        <h3 style="margin: 0 0 10px 0; color: #d4af37; font-size: 18px;">🛒 Proceed to Cart</h3>
        <p style="margin: 0; color: #a0aec0; font-size: 14px;">
            Choose material and configure options for: <strong style="color: #e2e8f0;">${pattern.patternName}</strong><br>
            <span style="font-size: 12px; color: #718096;">You'll be able to select quantity, dimensions, and other options on the product page.</span>
        </p>
    `;

    // Material selection section
    var materialSection = document.createElement('div');
    materialSection.style.cssText = 'margin-bottom: 25px;';
    
    var materialLabel = document.createElement('label');
    materialLabel.style.cssText = 'display: block; margin-bottom: 15px; color: #d4af37; font-weight: bold;';
    materialLabel.textContent = 'Select Material:';

    // Create material options
    var materials = [
        { value: 'wallpaper', label: '🗂️ Wallpaper', description: 'Removable peel & stick wallpaper' },
        { value: 'fabric', label: '🧵 Fabric', description: 'Premium cotton fabric by the yard' }
    ];

    var materialContainer = document.createElement('div');
    materialContainer.style.cssText = 'display: flex; flex-direction: column; gap: 12px;';

    materials.forEach(function(material, index) {
        var optionContainer = document.createElement('div');
        optionContainer.style.cssText = `
            border: 2px solid #4a5568;
            border-radius: 8px;
            padding: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            background: #2d3748;
        `;

        var radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'material';
        radio.value = material.value;
        radio.id = 'material_' + material.value;
        radio.style.cssText = 'margin-right: 10px;';
        if (index === 0) radio.checked = true; // Default to wallpaper

        var label = document.createElement('label');
        label.htmlFor = 'material_' + material.value;
        label.style.cssText = 'cursor: pointer; display: flex; flex-direction: column; gap: 5px; width: 100%;';
        label.innerHTML = `
            <div style="font-weight: bold; color: #e2e8f0;">${material.label}</div>
            <div style="font-size: 12px; color: #a0aec0;">${material.description}</div>
        `;

        optionContainer.appendChild(radio);
        optionContainer.appendChild(label);

        // Add hover and selection effects
        optionContainer.addEventListener('mouseenter', function() {
            optionContainer.style.borderColor = '#d4af37';
            optionContainer.style.background = '#374151';
        });
        
        optionContainer.addEventListener('mouseleave', function() {
            if (!radio.checked) {
                optionContainer.style.borderColor = '#4a5568';
                optionContainer.style.background = '#2d3748';
            }
        });

        optionContainer.addEventListener('click', function() {
            radio.checked = true;
            // Update all option styles
            materialContainer.querySelectorAll('div').forEach(function(div) {
                var r = div.querySelector('input[type="radio"]');
                if (r && r.checked) {
                    div.style.borderColor = '#d4af37';
                    div.style.background = '#374151';
                } else if (r) {
                    div.style.borderColor = '#4a5568';
                    div.style.background = '#2d3748';
                }
            });
        });

        materialContainer.appendChild(optionContainer);
    });

    materialSection.appendChild(materialLabel);
    materialSection.appendChild(materialContainer);

    // Button section
    var buttonSection = document.createElement('div');
    buttonSection.style.cssText = 'display: flex; gap: 12px; justify-content: flex-end; margin-top: 25px;';

    // Cancel button
    var cancelBtn = document.createElement('button');
    cancelBtn.textContent = '❌ Cancel';
    cancelBtn.style.cssText = `
        background: transparent;
        color: #f56565;
        border: 2px solid #f56565;
        padding: 10px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-family: 'Special Elite', monospace;
        font-weight: bold;
        transition: all 0.3s ease;
    `;
    cancelBtn.addEventListener('mouseenter', function() {
        cancelBtn.style.background = '#f56565';
        cancelBtn.style.color = 'white';
    });
    cancelBtn.addEventListener('mouseleave', function() {
        cancelBtn.style.background = 'transparent';
        cancelBtn.style.color = '#f56565';
    });
    cancelBtn.addEventListener('click', function() {
        modal.remove();
    });

    // Proceed to Cart button (replaces direct cart add)
    var configureBtn = document.createElement('button');
    configureBtn.textContent = '🛒 Proceed to Cart';
    configureBtn.style.cssText = `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-family: 'Special Elite', monospace;
        font-weight: bold;
        transition: all 0.3s ease;
    `;
    configureBtn.addEventListener('mouseenter', function() {
        configureBtn.style.transform = 'translateY(-2px)';
        configureBtn.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
    });
    configureBtn.addEventListener('mouseleave', function() {
        configureBtn.style.transform = 'translateY(0)';
        configureBtn.style.boxShadow = 'none';
    });
    configureBtn.addEventListener('click', function() {
        var selectedMaterial = materialContainer.querySelector('input[name="material"]:checked').value;
        
        // Store thumbnail in localStorage for the product page to use
        if (pattern.thumbnail) {
            try {
                // Clean up old saved patterns to free up space
                cleanupLocalStorage();
                
                // Try to store the thumbnail
                localStorage.setItem('colorflexCurrentThumbnail', pattern.thumbnail);
                console.log('🖼️ Stored thumbnail in localStorage for product page');
            } catch (quotaError) {
                console.warn('⚠️ localStorage quota exceeded, trying with smaller thumbnail...');
                
                // Create a smaller, more compressed thumbnail as fallback
                const smallerThumbnail = createCompressedThumbnail(pattern.thumbnail);
                if (smallerThumbnail) {
                    try {
                        localStorage.setItem('colorflexCurrentThumbnail', smallerThumbnail);
                        console.log('🖼️ Stored compressed thumbnail in localStorage');
                    } catch (stillTooLarge) {
                        console.error('❌ Even compressed thumbnail too large for localStorage');
                        // Continue without thumbnail
                    }
                }
            }
        }
        
        redirectToProductConfiguration(pattern, selectedMaterial);
        modal.remove();
    });

    buttonSection.appendChild(cancelBtn);
    buttonSection.appendChild(configureBtn);

    // Assemble modal
    modalContent.appendChild(header);
    modalContent.appendChild(materialSection);
    modalContent.appendChild(buttonSection);
    modal.appendChild(modalContent);

    // Close modal when clicking overlay
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });

    // Add to page
    document.body.appendChild(modal);

    // Add escape key listener
    function handleEscape(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', handleEscape);
        }
    }
    document.addEventListener('keydown', handleEscape);
}

/**
 * Clean up localStorage to free up space for thumbnails
 */
function cleanupLocalStorage() {
    try {
        // Only clean up old saved patterns (keep only last 10)
        // DON'T remove colorflexCurrentThumbnail as it's needed for the product page
        const savedPatterns = JSON.parse(localStorage.getItem('colorflexSavedPatterns') || '[]');
        if (savedPatterns.length > 10) {
            // Sort by timestamp and keep only the most recent 10
            savedPatterns.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            const recentPatterns = savedPatterns.slice(0, 10);
            localStorage.setItem('colorflexSavedPatterns', JSON.stringify(recentPatterns));
            console.log(`🧹 Cleaned up localStorage: kept ${recentPatterns.length} most recent patterns`);
        }
        
    } catch (error) {
        console.warn('⚠️ Error during localStorage cleanup:', error);
    }
}

/**
 * Create a smaller, more compressed thumbnail for localStorage
 * @param {string} originalThumbnail - Base64 data URL of original thumbnail
 * @returns {string|null} Compressed thumbnail or null if failed
 */
function createCompressedThumbnail(originalThumbnail) {
    try {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Smaller size for emergency compression (400x400)
        canvas.width = 400;
        canvas.height = 400;
        
        img.onload = function() {
            ctx.drawImage(img, 0, 0, 400, 400);
            // More aggressive compression (50% quality)
            return canvas.toDataURL('image/jpeg', 0.5);
        };
        
        img.src = originalThumbnail;
        
        // Since this is synchronous fallback, return a simple compressed version
        // This is a simplified approach - in practice, we'd need async handling
        return null; // For now, continue without thumbnail if quota exceeded
        
    } catch (error) {
        console.error('Failed to create compressed thumbnail:', error);
        return null;
    }
}

/**
 * Redirect to product configuration page with pattern data
 * @param {Object} pattern - The saved pattern data
 * @param {string} material - Selected material ('wallpaper' or 'fabric')
 */
function redirectToProductConfiguration(pattern, material) {
    try {
        console.log('⚙️ Redirecting to product configuration:', pattern.patternName, 'Material:', material);

        // Generate multiple possible product handles
        var possibleHandles = generateProductHandles(pattern, material);
        
        // Show loading notification
        showSaveNotification('🔄 Finding product page...');
        
        console.log('🔍 Trying product handles:', possibleHandles);
        
        // Build URL parameters
        var urlParams = new URLSearchParams({
            // Pattern identification
            'pattern_name': pattern.patternName,
            'collection': pattern.collectionName || '',
            'pattern_id': pattern.id,
            
            // Material selection
            'material': material,
            'application': material === 'wallpaper' ? 'Wallpaper' : 'Fabric',
            
            // Custom colors (for display in product page)
            'custom_colors': pattern.colors ? pattern.colors.map(c => c.color).join(',') : '',
            'colorflex_design': 'true',
            
            // Pattern metadata
            'save_date': pattern.saveDate || new Date().toLocaleDateString(),
            'pattern_size': pattern.patternSize || '',
            'tiling_type': pattern.tilingType || '',
            
            // Source identification
            'source': 'colorflex_saved_patterns'
        });
        
        // Try each handle until we find one that works
        tryProductHandles(possibleHandles, urlParams.toString(), pattern, material, 0);
        
    } catch (error) {
        console.error('❌ Error redirecting to product:', error);
        showSaveNotification('❌ Error opening product page');
        
        // Fallback: show manual instructions
        showProductSearchInstructions(pattern, material);
    }
}

/**
 * Try multiple product handles until one works
 * @param {Array} handles - Array of handles to try
 * @param {string} urlParams - URL parameters string
 * @param {Object} pattern - Pattern data
 * @param {string} material - Material type
 * @param {number} index - Current handle index
 */
function tryProductHandles(handles, urlParams, pattern, material, index) {
    if (index >= handles.length) {
        console.warn('❌ No valid product page found for any handle');
        showSaveNotification('❌ Product page not found');
        showProductSearchInstructions(pattern, material);
        return;
    }
    
    var handle = handles[index];
    var testUrl = '/products/' + handle + '.js'; // Use .js endpoint to test if product exists
    
    console.log(`🔍 Testing handle ${index + 1}/${handles.length}: ${handle}`);
    
    fetch(testUrl)
        .then(function(response) {
            if (response.ok) {
                // Product exists! Redirect to it
                var fullUrl = '/products/' + handle + '?' + urlParams;
                console.log('✅ Found product! Redirecting to:', fullUrl);
                showSaveNotification('✅ Product found! Opening...');
                window.location.href = fullUrl;
            } else {
                // Try next handle
                console.log('❌ Handle not found:', handle);
                tryProductHandles(handles, urlParams, pattern, material, index + 1);
            }
        })
        .catch(function(error) {
            console.log('❌ Error testing handle:', handle, error);
            // Try next handle
            tryProductHandles(handles, urlParams, pattern, material, index + 1);
        });
}

/**
 * Show manual product search instructions as fallback
 * @param {Object} pattern - Pattern data
 * @param {string} material - Material type
 */
function showProductSearchInstructions(pattern, material) {
    var productHandle = generateProductHandle(pattern, material);
    var searchTerm = pattern.patternName;
    
    var instructions = `
🔍 To find this product manually:

1. Search for: "${searchTerm}"
2. Or try the direct link: /products/${productHandle}
3. Select material: ${material === 'wallpaper' ? 'Wallpaper' : 'Fabric'}
4. Configure your options:
   • Quantity/Square footage
   • Dimensions (if applicable)
   • Special requests
5. Add custom colors in notes:
   ${pattern.layerColors ? pattern.layerColors.join(', ') : 'Use ColorFlex custom colors'}

Pattern Details:
• Collection: ${pattern.collectionName || 'N/A'}
• Saved: ${pattern.saveDate || 'Recently'}
• ColorFlex Design: Yes
    `.trim();
    
    // Create a better modal for instructions
    showProductInstructionsModal(instructions, productHandle, pattern);
}

/**
 * Show product instructions in a modal format
 * @param {string} instructions - Instructions text
 * @param {string} productHandle - Product handle
 * @param {Object} pattern - Pattern data
 */
function showProductInstructionsModal(instructions, productHandle, pattern) {
    // Remove existing modal if present
    var existingModal = document.getElementById('productInstructionsModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal
    var modal = document.createElement('div');
    modal.id = 'productInstructionsModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: 'Special Elite', monospace;
    `;

    var modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: #1a202c;
        color: #e2e8f0;
        padding: 30px;
        border-radius: 12px;
        width: 90%;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        border: 2px solid #f56565;
    `;

    modalContent.innerHTML = `
        <h3 style="color: #f56565; margin-bottom: 20px;">📝 Product Search Instructions</h3>
        <pre style="white-space: pre-wrap; font-family: 'Special Elite', monospace; font-size: 12px; line-height: 1.4; color: #e2e8f0;">${instructions}</pre>
        <div style="margin-top: 25px; display: flex; gap: 12px; justify-content: flex-end;">
            <button onclick="this.closest('#productInstructionsModal').remove()" style="
                background: transparent;
                color: #f56565;
                border: 2px solid #f56565;
                padding: 10px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-family: 'Special Elite', monospace;
                font-weight: bold;
            ">Close</button>
            <button onclick="navigator.clipboard.writeText('${productHandle}'); this.style.background='#48bb78'; this.textContent='✅ Copied!'" style="
                background: #667eea;
                color: white;
                border: none;
                padding: 10px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-family: 'Special Elite', monospace;
                font-weight: bold;
            ">📋 Copy Handle</button>
        </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Close on overlay click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

/**
 * Add pattern to Shopify cart with selected material
 * @param {Object} pattern - The saved pattern data
 * @param {string} material - Selected material ('wallpaper' or 'fabric')
 */
function addPatternToCart(pattern, material) {
    try {
        console.log('🛒 Adding pattern to cart:', pattern.patternName, 'Material:', material);

        // Generate Shopify product handle from pattern data
        var productHandle = generateProductHandle(pattern, material);
        
        // Create cart item data
        var cartItem = {
            id: productHandle, // This will need to be the actual Shopify variant ID
            quantity: 1,
            properties: {
                'Pattern Name': pattern.patternName,
                'Collection': pattern.collectionName,
                'Material': material === 'wallpaper' ? 'Wallpaper' : 'Fabric',
                'Custom Colors': pattern.layerColors ? pattern.layerColors.join(', ') : 'Default',
                'ColorFlex Design': 'Yes',
                'Save Date': pattern.saveDate || new Date().toLocaleDateString(),
                'Pattern ID': pattern.id
            }
        };

        // Show loading state
        showSaveNotification('🔄 Adding to cart...');

        // Add to Shopify cart using AJAX API
        addToShopifyCart(cartItem, material)
            .then(function(response) {
                console.log('✅ Successfully added to cart:', response);
                showSaveNotification(`✅ ${pattern.patternName} (${material}) added to cart!`);
                
                // Optional: Update cart UI elements if they exist
                updateCartBadge();
            })
            .catch(function(error) {
                console.error('❌ Failed to add to cart:', error);
                showSaveNotification('❌ Failed to add to cart. Please try again.');
                
                // Fallback: Show manual instructions
                showManualCartInstructions(pattern, material);
            });

    } catch (error) {
        console.error('❌ Error in addPatternToCart:', error);
        showSaveNotification('❌ Error adding to cart');
    }
}

/**
 * Generate multiple possible Shopify product handles from pattern data
 * @param {Object} pattern - Pattern data
 * @param {string} material - Material type
 * @returns {Array} Array of possible product handles to try
 */
function generateProductHandles(pattern, material) {
    // Convert pattern name to handle format
    var patternHandle = pattern.patternName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Remove duplicate hyphens
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

    var collectionHandle = '';
    if (pattern.collectionName) {
        collectionHandle = pattern.collectionName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    // Generate multiple possible handles to try
    var possibleHandles = [];
    
    if (collectionHandle && patternHandle) {
        // Try base handle first (this matches your CSV format)
        possibleHandles.push(collectionHandle + '-' + patternHandle);
        possibleHandles.push(patternHandle);
        
        // Then try with material suffixes
        possibleHandles.push(collectionHandle + '-' + patternHandle + '-' + material);
        possibleHandles.push(patternHandle + '-' + material);
        possibleHandles.push(collectionHandle + '-' + patternHandle + '-wallpaper');
        possibleHandles.push(collectionHandle + '-' + patternHandle + '-fabric');
        
        // Try with different separators
        possibleHandles.push(patternHandle + '-from-' + collectionHandle);
        possibleHandles.push(patternHandle + '-' + collectionHandle);
    } else if (patternHandle) {
        possibleHandles.push(patternHandle);
        possibleHandles.push(patternHandle + '-' + material);
        possibleHandles.push(patternHandle + '-wallpaper');
        possibleHandles.push(patternHandle + '-fabric');
    }
    
    // Remove duplicates
    return [...new Set(possibleHandles)];
}

/**
 * Legacy function for backward compatibility
 */
function generateProductHandle(pattern, material) {
    var handles = generateProductHandles(pattern, material);
    return handles[0] || 'unknown-pattern';
}

/**
 * Add item to Shopify cart using AJAX API
 * @param {Object} cartItem - Cart item data
 * @param {string} material - Material type for error handling
 * @returns {Promise} Cart API response
 */
function addToShopifyCart(cartItem, material) {
    return new Promise(function(resolve, reject) {
        // First, try to find the product by handle
        var productHandle = cartItem.id;
        
        // In a real implementation, you'd need to:
        // 1. Look up the product by handle using Storefront API
        // 2. Get the variant ID for the specific material
        // 3. Add the variant ID to cart using AJAX API
        
        // For now, we'll simulate the cart addition
        // This would be replaced with actual Shopify AJAX cart calls
        
        // Simulate network delay
        setTimeout(function() {
            // Check if we're in a Shopify environment
            if (typeof window.Shopify !== 'undefined' && window.Shopify.routes) {
                // Real Shopify environment - attempt actual cart add
                tryRealShopifyCartAdd(cartItem, resolve, reject);
            } else {
                // Development/preview environment - simulate success
                console.log('📝 Simulated cart addition (development mode)');
                resolve({
                    product_handle: productHandle,
                    material: material,
                    message: 'Cart addition simulated successfully'
                });
            }
        }, 500);
    });
}

/**
 * Attempt real Shopify cart addition
 * @param {Object} cartItem - Cart item data
 * @param {Function} resolve - Promise resolve
 * @param {Function} reject - Promise reject
 */
function tryRealShopifyCartAdd(cartItem, resolve, reject) {
    try {
        console.log('🔍 Looking up product for cart addition:', cartItem.id);
        
        // First, look up the product by handle to get the variant ID
        lookupProductByHandle(cartItem.id)
            .then(function(productData) {
                if (!productData || !productData.variants || productData.variants.length === 0) {
                    throw new Error('Product not found or has no variants');
                }
                
                // Find the best matching variant based on material type
                var variant = findBestVariantForMaterial(productData.variants, cartItem.properties.Material);
                
                console.log('✅ Found variant:', variant.id, variant.title);
                
                // Add to cart using Shopify AJAX Cart API
                return fetch('/cart/add.js', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        items: [{
                            id: variant.id,
                            quantity: cartItem.quantity,
                            properties: cartItem.properties
                        }]
                    })
                });
            })
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Cart add failed: ' + response.status + ' ' + response.statusText);
                }
                return response.json();
            })
            .then(function(data) {
                console.log('✅ Successfully added to Shopify cart:', data);
                resolve({
                    success: true,
                    cartData: data,
                    message: 'Successfully added to cart'
                });
            })
            .catch(function(error) {
                console.error('❌ Cart addition failed:', error);
                reject(error);
            });
            
    } catch (error) {
        console.error('❌ Error in tryRealShopifyCartAdd:', error);
        reject(error);
    }
}

/**
 * Find the best matching variant for the selected material
 * @param {Array} variants - Product variants
 * @param {string} materialType - 'Wallpaper' or 'Fabric'
 * @returns {Object} Best matching variant
 */
function findBestVariantForMaterial(variants, materialType) {
    console.log('🔍 Finding variant for material:', materialType, 'from', variants.length, 'variants');
    
    if (!variants || variants.length === 0) {
        throw new Error('No variants available');
    }
    
    // If only one variant, return it
    if (variants.length === 1) {
        return variants[0];
    }
    
    // Try to find variant that matches the material type
    var materialKeywords = materialType.toLowerCase() === 'wallpaper' 
        ? ['wallpaper', 'wall paper', 'peel', 'stick', 'removable']
        : ['fabric', 'cotton', 'textile', 'yard', 'material'];
    
    // First, try to find exact material match
    var exactMatch = variants.find(function(variant) {
        var title = (variant.title || '').toLowerCase();
        var option1 = (variant.option1 || '').toLowerCase();
        var option2 = (variant.option2 || '').toLowerCase();
        
        return materialKeywords.some(function(keyword) {
            return title.includes(keyword) || option1.includes(keyword) || option2.includes(keyword);
        });
    });
    
    if (exactMatch && exactMatch.available) {
        console.log('✅ Found exact material match:', exactMatch.title);
        return exactMatch;
    }
    
    // If no exact match, try available variants first
    var availableVariant = variants.find(function(variant) {
        return variant.available;
    });
    
    if (availableVariant) {
        console.log('✅ Using available variant:', availableVariant.title);
        return availableVariant;
    }
    
    // Last resort: return first variant
    console.log('⚠️ Using first variant as fallback:', variants[0].title);
    return variants[0];
}

/**
 * Look up product by handle using Shopify's product JSON endpoint
 * @param {string} productHandle - Product handle
 * @returns {Promise} Product data
 */
function lookupProductByHandle(productHandle) {
    return new Promise(function(resolve, reject) {
        console.log('🔍 Looking up product by handle:', productHandle);
        
        // Try to fetch product data from Shopify's product JSON endpoint
        var productUrl = '/products/' + productHandle + '.js';
        
        fetch(productUrl)
            .then(function(response) {
                if (!response.ok) {
                    // If exact handle doesn't work, try some variations
                    if (response.status === 404) {
                        console.log('📝 Product not found, trying handle variations...');
                        return tryProductHandleVariations(productHandle);
                    }
                    throw new Error('Product lookup failed: ' + response.status);
                }
                return response.json();
            })
            .then(function(product) {
                console.log('✅ Product found:', product.title, 'Variants:', product.variants.length);
                resolve(product);
            })
            .catch(function(error) {
                console.error('❌ Product lookup failed:', error);
                reject(error);
            });
    });
}

/**
 * Try different variations of the product handle
 * @param {string} baseHandle - Original handle
 * @returns {Promise} Product data or rejection
 */
function tryProductHandleVariations(baseHandle) {
    return new Promise(function(resolve, reject) {
        // Common handle variations to try
        var variations = [
            baseHandle.replace('-wallpaper', '').replace('-fabric', ''), // Remove material suffix
            baseHandle.replace(/^[^-]+-/, ''), // Remove collection prefix
            baseHandle.split('-').slice(0, -1).join('-'), // Remove last segment
            baseHandle.replace(/-/g, '_'), // Replace hyphens with underscores
            baseHandle.toLowerCase().replace(/[^a-z0-9-]/g, '') // Clean special characters
        ];
        
        console.log('🔄 Trying handle variations:', variations);
        
        // Try each variation
        var tryNext = function(index) {
            if (index >= variations.length) {
                reject(new Error('No product found for any handle variation'));
                return;
            }
            
            var handle = variations[index];
            if (!handle || handle === baseHandle) {
                tryNext(index + 1);
                return;
            }
            
            console.log('🔍 Trying variation:', handle);
            
            fetch('/products/' + handle + '.js')
                .then(function(response) {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error('Not found');
                })
                .then(function(product) {
                    console.log('✅ Found product with variation:', handle, product.title);
                    resolve(product);
                })
                .catch(function() {
                    tryNext(index + 1);
                });
        };
        
        tryNext(0);
    });
}

/**
 * Show manual cart instructions as fallback
 * @param {Object} pattern - Pattern data
 * @param {string} material - Material type
 */
function showManualCartInstructions(pattern, material) {
    var instructions = `
        To manually add this pattern to your cart:
        
        1. Search for: "${pattern.patternName}"
        2. Select material: ${material === 'wallpaper' ? 'Wallpaper' : 'Fabric'}
        3. Add your custom colors in the notes: ${pattern.layerColors ? pattern.layerColors.join(', ') : 'Default colors'}
    `;
    
    alert('Manual Cart Instructions:\n' + instructions);
}

/**
 * Update cart badge/counter if it exists
 */
function updateCartBadge() {
    // Fetch current cart data to get accurate count
    fetch('/cart.js')
        .then(function(response) {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Cart fetch failed');
        })
        .then(function(cart) {
            var itemCount = cart.item_count;
            console.log('🛒 Updated cart count:', itemCount);
            
            // Look for common cart badge selectors
            var cartBadges = [
                '#cart-count',
                '.cart-count', 
                '.cart-counter',
                '[data-cart-count]',
                '.header-cart-count',
                '[data-cart-item-count]',
                '.cart-item-count'
            ];
            
            cartBadges.forEach(function(selector) {
                var badge = document.querySelector(selector);
                if (badge) {
                    console.log('📊 Updating cart badge:', selector, itemCount);
                    
                    // Update the count
                    if (badge.hasAttribute('data-cart-count') || badge.hasAttribute('data-cart-item-count')) {
                        badge.setAttribute('data-cart-count', itemCount);
                        badge.setAttribute('data-cart-item-count', itemCount);
                    }
                    
                    // Update text content
                    badge.textContent = itemCount;
                    
                    // Add visual feedback animation
                    badge.style.animation = 'pulse 0.5s ease-in-out';
                    badge.style.transform = 'scale(1.2)';
                    
                    setTimeout(function() {
                        badge.style.animation = '';
                        badge.style.transform = 'scale(1)';
                    }, 500);
                    
                    // Show/hide badge based on count
                    if (itemCount > 0) {
                        badge.style.display = '';
                        if (badge.classList) {
                            badge.classList.remove('hidden');
                            badge.classList.add('visible');
                        }
                    } else {
                        if (badge.classList && badge.classList.contains('hide-when-empty')) {
                            badge.style.display = 'none';
                        }
                    }
                }
            });
            
            // Trigger custom cart update event for theme compatibility
            var cartUpdateEvent = new CustomEvent('cart:updated', {
                detail: { cart: cart, itemCount: itemCount }
            });
            document.dispatchEvent(cartUpdateEvent);
            
            // Also try updating via Shopify's theme events if available
            if (window.theme && window.theme.cartCounter) {
                window.theme.cartCounter.update(itemCount);
            }
            
        })
        .catch(function(error) {
            console.error('❌ Failed to update cart badge:', error);
            
            // Fallback: just add visual feedback without count update
            var cartBadges = ['#cart-count', '.cart-count', '.cart-counter'];
            cartBadges.forEach(function(selector) {
                var badge = document.querySelector(selector);
                if (badge) {
                    badge.style.animation = 'pulse 0.5s ease-in-out';
                    setTimeout(function() {
                        badge.style.animation = '';
                    }, 500);
                }
            });
        });
}

// Preview a saved pattern by loading it into the main interface
function previewSavedPattern(pattern) {
    try {
        console.log('👁️ Previewing saved pattern:', pattern.patternName);
        
        // Close the saved patterns modal
        const modal = document.getElementById('savedPatternsModal');
        if (modal) {
            modal.remove();
        }
        
        // Find the collection and pattern
        const targetCollection = appState.collections.find(
            c => c && typeof c.name === 'string' && c.name.toLowerCase() === pattern.collectionName.toLowerCase()
        );
        
        if (!targetCollection) {
            showSaveNotification('❌ Collection "' + pattern.collectionName + '" not found');
            return;
        }
        
        const targetPattern = targetCollection.patterns.find(
            p => p && typeof p.name === 'string' && p.name.toLowerCase() === pattern.patternName.toLowerCase()
        );
        
        if (!targetPattern) {
            showSaveNotification('❌ Pattern "' + pattern.patternName + '" not found');
            return;
        }
        
        // Set the collection and pattern
        appState.selectedCollection = targetCollection;
        appState.currentPattern = targetPattern;
        
        // Update collection header
        const collectionHeader = document.getElementById('collectionHeader');
        if (collectionHeader) {
            collectionHeader.textContent = targetCollection.name.toUpperCase();
        }
        
        // Populate layer inputs with saved colors
        populateLayerInputs(targetPattern);
        
        // Apply saved colors to layers if they exist
        if (pattern.colors && pattern.colors.length > 0) {
            // Wait for layer inputs to be created, then apply colors
            setTimeout(function() {
                pattern.colors.forEach(function(savedColor, index) {
                    if (appState.currentLayers[index]) {
                        appState.currentLayers[index].color = savedColor.color;
                        
                        // Update the visual input elements
                        const input = document.getElementById('layer-' + index);
                        const circle = document.querySelector('#layer-' + index + ' ~ .layer-circle');
                        
                        if (input) {
                            // Use clean color name without SW codes for input display
                            input.value = getCleanColorName(savedColor.color);
                        }
                        if (circle) {
                            const colorHex = lookupColor(savedColor.color);
                            circle.style.backgroundColor = colorHex;
                        }
                    }
                });
                
                // Update previews
                updatePreview();
                updateRoomMockup();
                populateCoordinates();
                
            }, 300);
        }
        
        // Update pattern thumbnails for the new collection
        populatePatternThumbnails(targetCollection.patterns);
        
        // Show success message
        showSaveNotification('✅ Pattern "' + pattern.patternName + '" loaded successfully!');
        
    } catch (error) {
        console.error('❌ Error previewing pattern:', error);
        showSaveNotification('❌ Failed to load pattern preview');
    }
}

// Load a saved pattern into the main UI with full functionality
function loadSavedPatternToUI(pattern) {
    try {
        console.log('🔄 Loading saved pattern into UI:', pattern.patternName);
        
        // Close the saved patterns modal
        const modal = document.getElementById('savedPatternsModal');
        if (modal) {
            modal.remove();
        }
        
        // Check if ColorFlex app state is available
        if (!appState || !appState.collections || appState.collections.length === 0) {
            console.warn('⚠️ ColorFlex app state not available - opening pattern in multi-step flow instead');
            
            // If we're on a product page or ColorFlex app isn't loaded, use the multi-step flow
            if (window.configFlow && typeof window.configFlow.interceptAddToCart === 'function') {
                console.log('🚀 Using multi-step flow to load saved pattern');
                
                // Convert saved pattern to multi-step flow format
                const enhancedPattern = {
                    id: pattern.id,
                    name: pattern.patternName,
                    patternName: pattern.patternName,
                    collection: pattern.collectionName || 'custom',
                    colors: pattern.colors || [],
                    patternPreview: pattern.thumbnail || null,
                    saveDate: pattern.saveDate || new Date().toISOString().split('T')[0]
                };
                
                window.configFlow.interceptAddToCart(enhancedPattern);
                return;
            } else {
                showSaveNotification('❌ ColorFlex app not fully loaded. Please navigate to /pages/colorflex to load patterns.');
                return;
            }
        }
        
        // Find the collection and pattern (original logic)
        const targetCollection = appState.collections.find(
            c => c && typeof c.name === 'string' && c.name.toLowerCase() === pattern.collectionName.toLowerCase()
        );
        
        if (!targetCollection) {
            showSaveNotification('❌ Collection "' + pattern.collectionName + '" not found');
            return;
        }
        
        const targetPattern = targetCollection.patterns.find(
            p => p && typeof p.name === 'string' && p.name.toLowerCase() === pattern.patternName.toLowerCase()
        );
        
        if (!targetPattern) {
            showSaveNotification('❌ Pattern "' + pattern.patternName + '" not found');
            return;
        }
        
        // Set the collection and pattern
        appState.selectedCollection = targetCollection;
        appState.currentPattern = targetPattern;
        
        // Update collection header
        const collectionHeader = document.getElementById('collectionHeader');
        if (collectionHeader) {
            collectionHeader.textContent = targetCollection.name.toUpperCase();
        }
        
        // Update pattern name display
        const patternNameElement = document.getElementById('patternName');
        if (patternNameElement) {
            patternNameElement.textContent = targetPattern.name;
        }
        
        // Populate layer inputs with saved colors
        populateLayerInputs(targetPattern);
        
        // Apply saved colors to layers if they exist
        if (pattern.colors && pattern.colors.length > 0) {
            // Wait for layer inputs to be created, then apply colors
            setTimeout(function() {
                pattern.colors.forEach(function(savedColor, index) {
                    if (appState.currentLayers[index]) {
                        appState.currentLayers[index].color = savedColor.color;
                        
                        // Update the visual input elements
                        const input = document.getElementById('layer-' + index);
                        const circle = document.querySelector('#layer-' + index + ' ~ .layer-circle');
                        
                        if (input) {
                            // Use clean color name without SW codes for input display
                            input.value = getCleanColorName(savedColor.color);
                        }
                        if (circle) {
                            const colorHex = lookupColor(savedColor.color);
                            circle.style.backgroundColor = colorHex;
                        }
                    }
                });
                
                // Update all previews and UI elements
                updatePreview();
                updateRoomMockup();
                populateCoordinates();
                
                // Force a complete UI refresh
                setTimeout(function() {
                    updatePreview();
                }, 100);
                
            }, 300);
        }
        
        // Update pattern thumbnails for the new collection
        populatePatternThumbnails(targetCollection.patterns);
        
        // Update the selected thumbnail to highlight the loaded pattern
        setTimeout(function() {
            const thumbnails = document.querySelectorAll('.pattern-thumbnail');
            thumbnails.forEach(function(thumb) {
                thumb.classList.remove('selected');
                if (thumb.dataset.patternName === targetPattern.name) {
                    thumb.classList.add('selected');
                }
            });
        }, 500);
        
        // Show success message with enhanced feedback
        showSaveNotification('✅ Pattern "' + pattern.patternName + '" loaded successfully!');
        console.log('✅ Pattern loaded - Collection:', targetCollection.name, 'Pattern:', targetPattern.name);
        
    } catch (error) {
        console.error('❌ Error loading pattern to UI:', error);
        showSaveNotification('❌ Failed to load pattern into UI');
    }
}

// Path normalization function to fix ./data/ vs data/ inconsistencies
function normalizePath(path) {
    if (!path || typeof path !== 'string') return path;
    
    // If it's already a full URL, return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    
    // Convert "./data/" to "data/" for consistency
    if (path.startsWith('./data/')) {
        path = path.substring(2); // Remove the "./"
    }
    
    // For any other relative paths, ensure they don't start with "./"
    if (path.startsWith('./')) {
        path = path.substring(2);
    }
    
    // If it's a data/ path, convert to absolute URL
    if (path.startsWith('data/')) {
        return `https://so-animation.com/colorflex/${path}`;
    }
    
    return path;
}

// Store furniture view settings globally for consistency
const furnitureViewSettings = {
    scale: 0.7,
    offsetX: 0,
    offsetY: -120,
    // Zoom states
    isZoomed: false,
    zoomScale: 2,  // 220% zoom when clicked
    zoomX: 0,        // Where we're zoomed to
    zoomY: 0         // Where we're zoomed to

};
const DEFAULT_FURNITURE_SETTINGS = {
    scale: 0.7,
    offsetX: 0,
    offsetY: -120
};


function addInteractiveZoom() {
    console.log("🔍 Adding interactive zoom to furniture preview");
    
    const roomMockup = document.getElementById('roomMockup');
    if (!roomMockup) {
        console.error("❌ Room mockup container not found");
        return;
    }
    
    // ✅ Add debouncing to prevent rapid clicks
    let isZoomInProgress = false;
    let lastClickTime = 0;
    const MIN_CLICK_INTERVAL = 500; // Minimum 500ms between clicks
    
    roomMockup.style.cursor = 'pointer';
    roomMockup.onclick = null;
    
    roomMockup.addEventListener('click', function(e) {
        const currentTime = Date.now();
        
        // ✅ Debounce rapid clicks
        if (currentTime - lastClickTime < MIN_CLICK_INTERVAL) {
            console.log("🚫 Click ignored - too rapid");
            return;
        }
        
        // ✅ Prevent overlapping zoom operations
        if (isZoomInProgress) {
            console.log("🚫 Click ignored - zoom in progress");
            return;
        }
        
        lastClickTime = currentTime;
        isZoomInProgress = true;
        
        console.log("🖱️ Room mockup clicked (debounced)");
        
        const isFurnitureCollection = appState.selectedCollection?.wallMask != null;
        if (!isFurnitureCollection) {
            console.log("Not a furniture collection, ignoring click");
            isZoomInProgress = false;
            return;
        }
        
        // Get click position
        const rect = roomMockup.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const clickX = (x / rect.width) * 600;
        const clickY = (y / rect.height) * 450;
        
        console.log(`🎯 Click at canvas coordinates: (${clickX.toFixed(0)}, ${clickY.toFixed(0)})`);
        
        // ✅ More robust state detection
        const currentScale = furnitureViewSettings.scale;
        const isCurrentlyZoomed = currentScale > 1.0; // Any scale > 1.0 is considered "zoomed"
        
        console.log(`🔍 Current state - scale: ${currentScale}, considered zoomed: ${isCurrentlyZoomed}`);
        
        if (isCurrentlyZoomed) {
            // Zoom out to default
            console.log(`🔍 Zooming out to default scale (${DEFAULT_FURNITURE_SETTINGS.scale})`);
            furnitureViewSettings.isZoomed = false;
            furnitureViewSettings.scale = DEFAULT_FURNITURE_SETTINGS.scale;
            furnitureViewSettings.offsetX = DEFAULT_FURNITURE_SETTINGS.offsetX;
            furnitureViewSettings.offsetY = DEFAULT_FURNITURE_SETTINGS.offsetY;
            roomMockup.style.cursor = 'zoom-in';
        } else {
            // Zoom in to click point
            console.log(`🔍 Zooming in to click point`);
            furnitureViewSettings.isZoomed = true;
            furnitureViewSettings.scale = furnitureViewSettings.zoomScale; // 2.2
            
            // Proper offset calculation accounting for default offset
            const canvasWidth = 600;
            const canvasHeight = 450;
            const centerX = canvasWidth / 2;
            const centerY = canvasHeight / 2;
            
            // Calculate how much to offset to center the clicked point
            const defaultScale = 0.7;  // Your default scale
            const defaultOffsetX = 0;  // Your default offsetX  
            const defaultOffsetY = -120; // Your default offsetY
            
            const scaleFactor = furnitureViewSettings.zoomScale / defaultScale; // 2.2 / 0.7 = 3.14
            
            // Calculate offset relative to the default position
            furnitureViewSettings.offsetX = defaultOffsetX + (centerX - clickX) * (scaleFactor - 1);
            furnitureViewSettings.offsetY = defaultOffsetY + (centerY - clickY) * (scaleFactor - 1);
            
            console.log(`   Scale factor: ${scaleFactor}`);
            console.log(`   Default offset: (${defaultOffsetX}, ${defaultOffsetY})`);
            console.log(`   New offset: (${furnitureViewSettings.offsetX.toFixed(0)}, ${furnitureViewSettings.offsetY.toFixed(0)})`);
            
            roomMockup.style.cursor = 'zoom-out';
        }
        
        console.log("🔄 Calling updateFurniturePreview with new zoom state");
        console.log("🔄 Final settings:", JSON.stringify({
            scale: furnitureViewSettings.scale,
            offsetX: furnitureViewSettings.offsetX,
            offsetY: furnitureViewSettings.offsetY,
            isZoomed: furnitureViewSettings.isZoomed
        }, null, 2));
        
        // ✅ Call update and reset progress flag when done
        if (typeof updateFurniturePreview === 'function') {
            updateFurniturePreview().then(() => {
                isZoomInProgress = false;
                console.log("✅ Zoom operation completed");
            }).catch(error => {
                console.error("❌ Zoom operation failed:", error);
                isZoomInProgress = false;
            });
        } else {
            console.error("❌ updateFurniturePreview function not found!");
            updateDisplays();
            isZoomInProgress = false;
        }
    });
    
    // Set initial cursor
    const isFurnitureCollection = window.appState.selectedCollection && window.appState.selectedCollection.wallMask != null;
    if (isFurnitureCollection) {
        const currentScale = furnitureViewSettings.scale;
        const isCurrentlyZoomed = currentScale > 1.0;
        roomMockup.style.cursor = isCurrentlyZoomed ? 'zoom-out' : 'zoom-in';
        console.log("✅ Set cursor for furniture collection");
    } else {
        roomMockup.style.cursor = 'default';
        console.log("✅ Set default cursor for non-furniture collection");
    }
    
    console.log("✅ Interactive zoom added to room mockup");
}

// Also add this debug function to test zoom manually:
function testZoom() {
    console.log("🧪 Testing zoom functionality");
    console.log("Current furnitureViewSettings:", furnitureViewSettings);
    
    // Test zoom in
    furnitureViewSettings.isZoomed = true;
    furnitureViewSettings.scale = 2.2;
    furnitureViewSettings.offsetX = -100;
    furnitureViewSettings.offsetY = -50;
    
    console.log("Updated furnitureViewSettings:", furnitureViewSettings);
    
    // Trigger re-render
    if (typeof updateFurniturePreview === 'function') {
        console.log("Calling updateFurniturePreview...");
        updateFurniturePreview();
    } else {
        console.error("updateFurniturePreview function not found!");
    }
}



// DOM references
const dom = {
    patternName: document.getElementById("patternName"),
    collectionHeader: document.getElementById("collectionHeader"),
    collectionThumbnails: document.getElementById("collectionThumbnails"),
    layerInputsContainer: document.getElementById("layerInputsContainer"),
    curatedColorsContainer: document.getElementById("curatedColorsContainer"),
    coordinatesContainer: document.getElementById("coordinatesContainer"),
    preview: document.getElementById("preview"),
    roomMockup: document.getElementById("roomMockup"),
    printButton: document.getElementById("printButton") // Assuming a button exists
};

// Validate DOM elements and report missing ones
function validateDOMElements() {
    console.log("🔍 DOM Validation:");
    Object.entries(dom).forEach(([key, element]) => {
        if (element) {
            console.log(`  ✅ ${key}: found`);
        } else {
            console.error(`  ❌ ${key}: NOT FOUND - missing element with id "${key}"`);
        }
    });
}

// Watch changes to patternName
const patternNameElement = document.getElementById("patternName");
Object.defineProperty(dom, 'patternName', {
    get() {
        return patternNameElement;
    },
    set(value) {
        console.log("Setting #patternName to:", value, "Caller:", new Error().stack.split('\n')[2].trim());
        patternNameElement.textContent = value;
    },
    configurable: true
});

// Debug function to check what's happening with collection names
window.debugCollectionName = function() {
    console.log(`🔍 COLLECTION NAME DEBUG:`);
    console.log(`========================`);
    console.log(`Current collection name: "${appState.selectedCollection?.name}"`);
    console.log(`Current pattern name: "${appState.currentPattern?.name}"`);
    console.log(`Furniture mode: ${appState.furnitureMode}`);
    
    if (appState.furnitureMode) {
        console.log(`Original collection: "${appState.originalCollection?.name}"`);
        console.log(`Original collection exists: ${!!appState.originalCollection?.fullCollection}`);
        
        // Check if we can get the original collection name from the furniture collection
        const originalFromFurniture = appState.selectedCollection?.originalCollectionName;
        console.log(`Original collection from furniture collection: "${originalFromFurniture}"`);
    }
    
    // Test what the path should be
    if (appState.selectedCollection && appState.currentPattern) {
        let collectionNameForPaths;
        
        if (appState.furnitureMode) {
            // Try multiple ways to get the original collection name
            collectionNameForPaths = appState.originalCollection?.name 
                || appState.selectedCollection?.originalCollectionName
                || "UNKNOWN";
        } else {
            collectionNameForPaths = appState.selectedCollection.name;
        }
        
        const patternName = appState.currentPattern.name;
        const slug = createPatternSlug(patternName);
        
        console.log(`Expected path structure:`);
        console.log(`  Collection for paths: "${collectionNameForPaths}"`);
        console.log(`  Pattern: "${patternName}"`);
        console.log(`  Slug: "${slug}"`);
        console.log(`  Should be: data/furniture/sofa-capitol/patterns/${collectionNameForPaths}/${slug}/`);
        
        if (collectionNameForPaths === "UNKNOWN") {
            console.error(`❌ Cannot determine original collection name!`);
            console.error(`   This is why paths are broken.`);
        }
    }
    
    return {
        selectedCollection: appState.selectedCollection?.name,
        currentPattern: appState.currentPattern?.name,
        furnitureMode: appState.furnitureMode,
        originalCollection: appState.originalCollection?.name
    };
};
window.getAppState = function() {
    return {
        selectedCollection: appState.selectedCollection?.name,
        currentPattern: appState.currentPattern?.name,
        furnitureMode: appState.furnitureMode,
        originalCollection: appState.originalCollection?.name,
        collections: appState.collections?.map(c => c.name),
        furnitureConfigLoaded: !!furnitureConfig
    };
};
window.fixOriginalCollection = function(originalCollectionName) {
    console.log(`🔧 QUICK FIX: Setting original collection to "${originalCollectionName}"`);
    
    if (!appState.originalCollection) {
        appState.originalCollection = {};
    }
    
    appState.originalCollection.name = originalCollectionName;
    
    // Also store it in the furniture collection for future reference
    if (appState.selectedCollection) {
        appState.selectedCollection.originalCollectionName = originalCollectionName;
    }
    
    console.log(`✅ Fixed! Original collection name is now: "${appState.originalCollection.name}"`);
    console.log(`Run debugCollectionName() to verify the fix.`);
    
    return {
        originalCollection: appState.originalCollection.name,
        furnitureCollection: appState.selectedCollection?.originalCollectionName
    };
};

// Status check accessible from console
window.checkStatus = function() {
    console.log(`🔍 FURNITURE IMPLEMENTATION STATUS CHECK:`);
    console.log(`======================================`);
    
    // Check if furniture config is loaded
    if (!furnitureConfig) {
        console.log(`❌ furnitureConfig not loaded`);
        return { error: "furnitureConfig not loaded" };
    }
    console.log(`✅ furnitureConfig loaded: ${Object.keys(furnitureConfig).length} furniture pieces`);
    
    // Check collections
    if (!appState.collections || appState.collections.length === 0) {
        console.log(`❌ Collections not loaded`);
        return { error: "Collections not loaded" };
    }
    console.log(`✅ Collections loaded: ${appState.collections.length} collections`);
    
    // Check current state
    const currentCollection = appState.selectedCollection?.name;
    if (!currentCollection) {
        console.log(`❌ No collection currently selected`);
        return { error: "No collection selected" };
    }
    console.log(`✅ Current collection: ${currentCollection}`);
    
    // Check compatibility
    const compatible = getCompatibleFurniture(currentCollection);
    console.log(`✅ Compatible furniture: ${compatible.length} pieces`);
    compatible.forEach(f => console.log(`   - ${f.name}`));
    
    // Check if Try Furniture button should be visible
    const tryButton = document.getElementById('tryFurnitureBtn');
    const backButton = document.getElementById('backToPatternsBtn');
    
    if (appState.furnitureMode) {
        console.log(`🪑 Currently in FURNITURE MODE`);
        console.log(`   Back button present: ${!!backButton}`);
    } else {
        console.log(`🎨 Currently in PATTERN MODE`);
        console.log(`   Try Furniture button present: ${!!tryButton}`);
        if (!tryButton && compatible.length > 0) {
            console.log(`⚠️  Try Furniture button should be visible but isn't!`);
        }
    }
    
    return {
        furnitureConfigLoaded: !!furnitureConfig,
        collectionsLoaded: appState.collections?.length > 0,
        currentCollection: currentCollection,
        compatibleFurniture: compatible.length,
        furnitureMode: appState.furnitureMode,
        tryButtonPresent: !!tryButton,
        backButtonPresent: !!backButton,
        originalCollection: appState.originalCollection?.name
    };
};

function ensureButtonsAfterUpdate() {
    // Small delay to ensure DOM update is complete
    setTimeout(() => {
        if (!appState.furnitureMode && !document.getElementById('tryFurnitureBtn')) {
            if (window.COLORFLEX_DEBUG) {
                console.log("🔄 Re-adding Try Fabric button after room mockup update");
            }
            addTryFurnitureButton();
        }
        
        if (appState.furnitureMode && !document.getElementById('backToPatternsBtn')) {
            if (window.COLORFLEX_DEBUG) {
                console.log("🔄 Re-adding Back to Patterns button after room mockup update");
            }
            addBackToPatternsButton();
        }
    }, 50);
}

// Test pattern slug generation
window.testSlug = function(patternName) {
    const slug = createPatternSlug(patternName);
    console.log(`Pattern: "${patternName}" → Slug: "${slug}"`);
    return slug;
};

// Simple state viewer
window.viewState = function() {
    const state = {
        selectedCollection: appState.selectedCollection?.name,
        currentPattern: appState.currentPattern?.name,
        furnitureMode: appState.furnitureMode,
        originalCollection: appState.originalCollection?.name,
        patterns: appState.selectedCollection?.patterns?.length,
        furnitureConfig: Object.keys(furnitureConfig || {})
    };
    
    console.table(state);
    return state;
};

// Debug functions available in development mode only
if (window.location.hostname === 'localhost' || window.location.hostname.includes('dev')) {
    console.log(`
🔧 DEBUG FUNCTIONS LOADED!
=========================

Available console commands:
• debugCollectionName() - Debug collection name issues
• fixOriginalCollection("botanicals") - Quick fix for collection name
• checkStatus() - Check implementation status  
• viewState() - View current app state
• testSlug("Pattern Name") - Test slug conversion
• getAppState() - Get simplified app state

Try running: debugCollectionName()
`);
}

// Create pattern slug from pattern name
function createPatternSlug(patternName) {
    if (!patternName || typeof patternName !== 'string') {
        return '';
    }
    return patternName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')         // Replace spaces with hyphens
        .replace(/-+/g, '-')          // Remove multiple consecutive hyphens
        .replace(/^-|-$/g, '')        // Remove leading/trailing hyphens
        .trim();
}

window.simpleDebug = function() {
    console.log(`🔍 SIMPLE DEBUG:`);
    console.log(`================`);
    
    if (appState.furnitureMode) {
        console.log(`In furniture mode: YES`);
        console.log(`Current collection: "${appState.selectedCollection?.name}"`);
        console.log(`Stored original collection: "${appState.selectedCollection?.originalCollectionName}"`);
        console.log(`Current pattern: "${appState.currentPattern?.name}"`);
        
        if (appState.selectedCollection?.originalCollectionName) {
            const slug = createPatternSlug(appState.currentPattern?.name || "test");
            console.log(`✅ Path should be: data/furniture/sofa-capitol/patterns/${appState.selectedCollection.originalCollectionName}/${slug}/`);
        } else {
            console.log(`❌ No original collection name stored!`);
        }
    } else {
        console.log(`In furniture mode: NO`);
        console.log(`Current collection: "${appState.selectedCollection?.name}"`);
    }
};

// Quick fix function:
window.quickFix = function() {
    if (appState.furnitureMode && !appState.selectedCollection?.originalCollectionName) {
        // Try to guess the original collection from the furniture collection name
        const furnitureCollectionName = appState.selectedCollection?.name;
        if (furnitureCollectionName && furnitureCollectionName.includes("BOTANICAL")) {
            appState.selectedCollection.originalCollectionName = "botanicals";
            console.log(`🔧 Quick fix: Set original collection to "botanicals"`);
            return true;
        }
    }
    return false;
};

window.fixPatternPaths = function() {
    if (appState.furnitureMode && appState.currentPattern) {
        const originalCollectionName = appState.selectedCollection.originalCollectionName;
        const furnitureConfig = appState.selectedCollection.furnitureConfig;
        
        console.log(`🔧 Regenerating pattern paths:`);
        console.log(`   Collection: ${originalCollectionName}`);
        console.log(`   Pattern: ${appState.currentPattern.name}`);
        
        // Re-create the furniture pattern with correct paths
        const correctedPattern = createFurniturePattern(
            appState.currentPattern.originalPattern || appState.currentPattern,
            furnitureConfig,
            originalCollectionName
        );
        
        // Update the current pattern
        appState.currentPattern = correctedPattern;
        
        // Update in the collection too
        const patternIndex = appState.selectedCollection.patterns.findIndex(p => p.id === correctedPattern.id);
        if (patternIndex !== -1) {
            appState.selectedCollection.patterns[patternIndex] = correctedPattern;
        }
        
        console.log(`✅ Pattern paths regenerated`);
        return correctedPattern;
    }
};


// Cache for furniture compatibility checks to improve performance
let furnitureCompatibilityCache = new Map();
let addFurnitureButtonDebounce = null;

function getCompatibleFurniture(collectionName) {
    // Check cache first to avoid repeated computations
    if (furnitureCompatibilityCache.has(collectionName)) {
        return furnitureCompatibilityCache.get(collectionName);
    }
    
    // Reduced logging for performance
    if (window.COLORFLEX_DEBUG) {
        console.log(`🪑 Checking furniture compatibility for collection: ${collectionName}`);
    }
    
    if (!furnitureConfig) {
        // Don't spam the console - only warn once per collection
        if (!furnitureCompatibilityCache.has(collectionName + '_warned')) {
            console.warn("Furniture config not loaded yet");
            furnitureCompatibilityCache.set(collectionName + '_warned', true);
        }
        return [];
    }
    
    const compatible = Object.entries(furnitureConfig)
        .filter(([furnitureId, config]) => {
            const isCompatible = config.compatibleCollections && 
                               config.compatibleCollections.includes(collectionName);
            return isCompatible;
        })
        .map(([furnitureId, config]) => ({
            id: furnitureId,
            name: config.name,
            thumbnail: config.thumbnail,
            description: config.description || '',
            config: config
        }));
    
    // Cache the result for future use
    furnitureCompatibilityCache.set(collectionName, compatible);
    
    if (window.COLORFLEX_DEBUG) {
        console.log(`Found ${compatible.length} compatible furniture pieces`);
    }
    return compatible;
}

function addTryFurnitureButtonDebounced() {
    // Debounce to prevent excessive calls
    if (addFurnitureButtonDebounce) {
        clearTimeout(addFurnitureButtonDebounce);
    }
    
    addFurnitureButtonDebounce = setTimeout(() => {
        addTryFurnitureButtonInternal();
    }, 100); // 100ms delay
}

// Legacy function name for backward compatibility
function addTryFurnitureButton() {
    addTryFurnitureButtonDebounced();
}

function addTryFurnitureButtonInternal() {
    // Performance optimization - avoid excessive logging unless in debug mode
    if (window.COLORFLEX_DEBUG) {
        console.log("🪑 Adding Try Fabric button");
    }
    
    // Remove existing button if present
    const existingButton = document.getElementById('tryFurnitureBtn');
    if (existingButton) {
        existingButton.remove();
    }
    
    // Check compatibility
    const currentCollection = appState.selectedCollection?.name;
    if (!currentCollection) {
        if (window.COLORFLEX_DEBUG) {
            console.log("No current collection, skipping furniture button");
        }
        return;
    }
    
    const compatibleFurniture = getCompatibleFurniture(currentCollection);
    if (compatibleFurniture.length === 0) {
        if (window.COLORFLEX_DEBUG) {
            console.log("No compatible furniture found for", currentCollection);
        }
        return;
    }
    
    // Create button
    const button = document.createElement('button');
    button.id = 'tryFurnitureBtn';
    button.className = 'try-furniture-btn';
    button.innerHTML = `
        <span class="furniture-icon">🪑</span>
        <span class="button-text">Try Fabric (${compatibleFurniture.length})</span>
    `;
    
    // Add styles
    button.style.cssText = `
        position: absolute;
        bottom: 10px;
        right: 10px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 12px 18px;
        border-radius: 25px;
        font-family: 'Special Elite', monospace;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 100;
    `;
    
    // Add hover effects
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    });
    
    // Add click handler
    button.addEventListener('click', () => {
        showFurnitureModal(compatibleFurniture);
    });
    
    // Find the room mockup container and add button
    const roomMockup = document.getElementById('roomMockup');
    if (roomMockup) {
        // Make sure the container is positioned relatively
        if (getComputedStyle(roomMockup).position === 'static') {
            roomMockup.style.position = 'relative';
        }
        roomMockup.appendChild(button);
        console.log("✅ Try Furniture button added to room mockup");
    } else {
        console.error("❌ Could not find room mockup container");
    }
}

// 3. showFurnitureModal function (also referenced but missing)
function showFurnitureModal(compatibleFurniture) {
    console.log("🪑 Showing furniture modal with", compatibleFurniture.length, "options");
    
    // Remove existing modal
    const existingModal = document.getElementById('furnitureModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'furnitureModal';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    `;
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        border-radius: 15px;
        padding: 30px;
        max-width: 600px;
        width: 90%;
        max-height: 80%;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        animation: slideUp 0.3s ease;
    `;
    
    // Modal header
    const header = document.createElement('div');
    header.innerHTML = `
        <h2 style="margin: 0 0 20px 0; font-family: 'Special Elite', monospace; color: #333; text-align: center;">
            Choose Furniture for ${toInitialCaps(appState.selectedCollection.name)}
        </h2>
    `;
    
    // Furniture grid
    const furnitureGrid = document.createElement('div');
    furnitureGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 20px;
    `;
    
    // Add furniture options
    compatibleFurniture.forEach(furniture => {
        const furnitureCard = document.createElement('div');
        furnitureCard.style.cssText = `
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            padding: 15px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            background: white;
        `;
        
        furnitureCard.innerHTML = `
            <img src="${normalizePath(furniture.thumbnail)}" alt="${furniture.name}" 
                 style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;"
                 onerror="this.style.background='#f0f0f0'; this.style.display='flex'; this.style.alignItems='center'; this.style.justifyContent='center'; this.innerHTML='🪑';">
            <h3 style="margin: 10px 0 5px 0; font-family: 'Special Elite', monospace; font-size: 16px;">${furniture.name}</h3>
            <p style="margin: 0; font-size: 12px; color: #666; line-height: 1.4;">${furniture.description}</p>
        `;
        
        // Hover effects
        furnitureCard.addEventListener('mouseenter', () => {
            furnitureCard.style.borderColor = '#667eea';
            furnitureCard.style.transform = 'translateY(-2px)';
            furnitureCard.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
        });
        
        furnitureCard.addEventListener('mouseleave', () => {
            furnitureCard.style.borderColor = '#e0e0e0';
            furnitureCard.style.transform = 'translateY(0)';
            furnitureCard.style.boxShadow = 'none';
        });
        
        // Click handler
        furnitureCard.addEventListener('click', () => {
            selectFurniture(furniture);
            modalOverlay.remove();
        });
        
        furnitureGrid.appendChild(furnitureCard);
    });
    
    // Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.style.cssText = `
        background: #ccc;
        color: #333;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-family: 'Special Elite', monospace;
        display: block;
        margin: 0 auto;
    `;
    
    cancelButton.addEventListener('click', () => {
        modalOverlay.remove();
    });
    
    // Assemble modal
    modalContent.appendChild(header);
    modalContent.appendChild(furnitureGrid);
    modalContent.appendChild(cancelButton);
    modalOverlay.appendChild(modalContent);
    
    // Close on overlay click
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.remove();
        }
    });
    
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(modalOverlay);
}

// 4. selectFurniture function
function selectFurniture(selectedFurniture) {
    console.log("🪑 Selected furniture:", selectedFurniture.name);
    console.log("🧵 Full furniture object:", selectedFurniture);
    
    // Store selected furniture in appState
    appState.selectedFurniture = selectedFurniture;
    appState.isInFabricMode = selectedFurniture.name === "Fabric";
    
    // Direct check for fabric name
    if (selectedFurniture.name === "Fabric") {
        console.log("🧵 ================================");
        console.log("🧵 FABRIC NAME DETECTED - CALLING FABRIC MOCKUP");
        console.log("🧵 ================================");
        renderFabricMockup();
        return;
    }
    
    // Switch to furniture mode for actual furniture
    console.log("🪑 Regular furniture selected, switching to furniture mode");
    switchToFurnitureMode(selectedFurniture);
}

// 5. addBackToPatternsButton function
function addBackToPatternsButton() {
    console.log("🔙 addBackToPatternsButton() called");
    
    const existingButton = document.getElementById('backToPatternsBtn');
    if (existingButton) {
        console.log("🗑️ Removing existing back button");
        existingButton.remove();
    }
    
    const button = document.createElement('button');
    button.id = 'backToPatternsBtn';
    button.innerHTML = `
        <span>← Back to Patterns</span>
    `;
    
    button.style.cssText = `
        position: absolute;
        bottom: 10px;
        left: 10px;
        background: linear-gradient(135deg, #ff7b7b 0%, #667eea 100%);
        color: white;
        border: none;
        padding: 12px 18px;
        border-radius: 25px;
        font-family: 'Special Elite', monospace;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
        z-index: 100;
    `;
    
    console.log("🔗 Adding click event listener to back button");
    button.addEventListener('click', (event) => {
        console.log("🔙 Back button clicked!");
        event.stopPropagation(); // Prevent zoom handler from receiving this event
        event.preventDefault();  // Prevent any default behavior
        
        // Check if we're in fabric mode or furniture mode
        if (appState.isInFabricMode) {
            console.log("🧵 Returning from fabric mode to patterns");
            returnToPatternsModeFromFabric();
        } else {
            console.log("🪑 Returning from furniture mode to patterns");
            returnToPatternsMode();
        }
    });
    
    const roomMockup = document.getElementById('roomMockup');
    if (roomMockup) {
        roomMockup.appendChild(button);
        console.log("✅ Back button added to DOM");
        
        // Test if button is actually clickable
        console.log("🧪 Button in DOM:", document.getElementById('backToPatternsBtn'));
        console.log("🧪 Button parent:", document.getElementById('backToPatternsBtn')?.parentElement);
    } else {
        console.error("❌ roomMockup not found!");
    }
}

// Function to return from fabric mode to patterns mode
function returnToPatternsModeFromFabric() {
    console.log("🧵 Returning from fabric mode to patterns");
    
    // Clear fabric mode state
    appState.selectedFurniture = null;
    appState.isInFabricMode = false;
    
    // Remove back button
    const backButton = document.getElementById('backToPatternsBtn');
    if (backButton) {
        backButton.remove();
    }
    
    // Remove fabric tuning controls
    removeFabricTuningControls();
    
    // Re-add try furniture button
    addTryFurnitureButton();
    
    // Trigger room mockup update to show regular pattern view
    if (appState.currentPattern) {
        updateRoomMockup();
    }
    
    console.log("✅ Returned from fabric mode to patterns mode");
}

// 6. initializeTryFurnitureFeature function
function initializeTryFurnitureFeature() {
    console.log("🪑 Initializing Try Furniture feature");
    
    // Add the button when a collection is loaded
    if (appState.selectedCollection && !appState.furnitureMode) {
        addTryFurnitureButton();
    }
}

// Resolve furniture pattern paths using collection-based structure
function resolveFurniturePatternPaths(furnitureConfig, collectionName, patternName, originalPatternLayers) {
    console.log(`🔍 Resolving furniture pattern paths:`);
    console.log(`   Collection: "${collectionName}"`);
    console.log(`   Pattern: "${patternName}"`);
    
    // ✅ VALIDATION: Make sure we have a valid collection name
    if (!collectionName || collectionName === "UNKNOWN" || collectionName === patternName) {
        console.error(`❌ Invalid collection name: "${collectionName}"`);
        console.error(`   Pattern name: "${patternName}"`);
        console.error(`   These should be different!`);
        
        // Try to get it from the current furniture collection
        const fallbackCollectionName = appState.selectedCollection?.originalCollectionName;
        if (fallbackCollectionName) {
            console.log(`🔧 Using fallback collection name: "${fallbackCollectionName}"`);
            collectionName = fallbackCollectionName;
        } else {
            console.error(`❌ No fallback collection name available!`);
            return [];
        }
    }
    
    const patternSlug = createPatternSlug(patternName);
    
    // Replace template variables
    const patternFolder = furnitureConfig.patternPathTemplate
        .replace('{collection}', collectionName)
        .replace('{patternSlug}', patternSlug);
    
    console.log(`   Pattern slug: "${patternSlug}"`);
    console.log(`   ✅ Final folder: "${patternFolder}"`);
    
    // Map layers to furniture paths
    const furniturePatternLayers = originalPatternLayers.map((layer, index) => {
        const originalFileName = layer.path.split('/').pop();
        const layerName = originalFileName.replace(/\.[^/.]+$/, '');
        const cleanLayerName = layerName.replace(/^[^_]*_/, ''); // Remove everything before first underscore
        const furnitureFileName = `${patternSlug}_${cleanLayerName}.png`;
        const furniturePath = `${patternFolder}${furnitureFileName}`;
        
        return {
            ...layer,
            path: furniturePath,
            originalPath: layer.path,
            furnitureFileName: furnitureFileName
        };
    });
    
    return furniturePatternLayers;
}


function createFurniturePattern(originalPattern, furnitureConfig, collectionName) {
    console.log(`🔄 Creating furniture pattern:`);
    console.log(`   Pattern: ${originalPattern.name}`);
    console.log(`   Collection: ${collectionName}`);
    console.log(`   Furniture: ${furnitureConfig.name}`);
    
    // ✅ VERIFY: Make sure collectionName is correct
    if (!collectionName || collectionName === originalPattern.name) {
        console.error(`❌ COLLECTION NAME ERROR!`);
        console.error(`   Expected collection name like "botanicals"`);
        console.error(`   Got: "${collectionName}"`);
        console.error(`   Pattern name: "${originalPattern.name}"`);
        console.error(`   These should be different!`);
    }
    
    const furniturePatternLayers = resolveFurniturePatternPaths(
        furnitureConfig, 
        collectionName,           // ← This should be "botanicals"
        originalPattern.name,     // ← This should be "Key Largo"
        originalPattern.layers || []
    );
    
    const furniturePattern = {
        ...originalPattern,
        layers: furniturePatternLayers,
        isFurniture: true,
        furnitureConfig: furnitureConfig,
        originalPattern: originalPattern,
        collectionName: collectionName // Store collection name for reference
    };
    
    console.log(`✅ Created furniture pattern with ${furniturePatternLayers.length} layers`);
    console.log(`   Expected path pattern: data/furniture/.../patterns/${collectionName}/${createPatternSlug(originalPattern.name)}/`);
    
    return furniturePattern;
}


// Updated switchToFurnitureMode function
function switchToFurnitureMode(furniture) {
    console.log("🔄 Switching to furniture mode for:", furniture.name);
    
    // ✅ SIMPLE: Just grab the current collection name RIGHT NOW
    const originalCollectionName = appState.selectedCollection.name;
    console.log(`📝 Original collection name: "${originalCollectionName}"`);
    
    // Store the ENTIRE original collection
    appState.originalCollection = { ...appState.selectedCollection };
    
    // Convert all patterns to furniture patterns using the CURRENT collection name
    const furniturePatterns = appState.selectedCollection.patterns.map(pattern => {
        return createFurniturePattern(pattern, furniture.config, originalCollectionName);
    });
    
    // Create virtual furniture collection
    const furnitureCollection = {
        name: `${originalCollectionName.toUpperCase()} ${furniture.name.toUpperCase()}`,
        patterns: furniturePatterns,
        curatedColors: appState.selectedCollection.curatedColors,
        coordinates: [],
        mockup: null,
        furnitureType: furniture.id,
wallMask: furniture.config.wallMask || "default-wall-mask.png",  // ← Ensure it's not null
        // ✅ SIMPLE: Store the original collection name directly
        originalCollectionName: originalCollectionName,
        furnitureConfig: furniture.config
    };
    
    // Update app state
    appState.selectedCollection = furnitureCollection;
    appState.furnitureMode = true;
    
    console.log(`✅ Switched to furniture mode. Paths will use: "${originalCollectionName}"`);
    
    // Update UI
    if (dom.collectionHeader) {
        dom.collectionHeader.textContent = furnitureCollection.name;
    }
    
    // Remove try furniture button and add back button
    const tryButton = document.getElementById('tryFurnitureBtn');
    if (tryButton) tryButton.remove();
    addBackToPatternsButton();
    
    // Trigger re-render
    if (appState.currentPattern) {
        const furniturePattern = furniturePatterns.find(p => p.id === appState.currentPattern.id);
        if (furniturePattern) {
            loadPatternData(appState.selectedCollection, furniturePattern.id);
        }
    }
}

function returnToPatternsMode() {
    console.log("🔄 Returning to patterns mode");
    
    // Restore original collection
    if (appState.originalCollection) {
        console.log("🔄 Restoring original collection:", appState.originalCollection.name);
        
        appState.selectedCollection = appState.originalCollection; // Remove .fullCollection
        appState.furnitureMode = false;
        appState.originalCollection = null;
        
        // Clear fabric mode state
        appState.selectedFurniture = null;
        appState.isInFabricMode = false;
        
        // Update UI
        if (dom.collectionHeader) {
            dom.collectionHeader.textContent = toInitialCaps(appState.selectedCollection.name);
        }
        
        // Remove back button
        const backButton = document.getElementById('backToPatternsBtn');
        if (backButton) {
            backButton.remove();
        }
        
        // Re-add try furniture button
        addTryFurnitureButton();
        
        // Trigger re-render in patterns mode
        if (appState.currentPattern) {
            // Find the original pattern (not the furniture version)
            const originalPattern = appState.selectedCollection.patterns.find(p => p.id === appState.currentPattern.id);
            if (originalPattern) {
                loadPatternData(appState.selectedCollection, originalPattern.id);
            }
        }
        
        console.log("✅ Returned to patterns mode");
    } else {
        console.error("❌ Cannot return to patterns mode - original collection not found");
    }
}


// Development helper: Generate expected folder structure
function generateFolderStructure(collectionName, furnitureId) {
    const collection = appState.collections?.find(c => c.name === collectionName);
    const furniture = furnitureConfig?.[furnitureId];
    
    if (!collection || !furniture) {
        console.error("❌ Collection or furniture not found");
        return;
    }
    
    console.log(`📁 FOLDER STRUCTURE for ${furniture.name} + ${collectionName}:`);
    console.log(`📁 Base path: data/furniture/${furnitureId}/patterns/${collectionName}/`);
    console.log(`📁 Folders needed:`);
    
    const folders = [];
    collection.patterns.forEach(pattern => {
        const slug = createPatternSlug(pattern.name);
        const folder = `data/furniture/${furnitureId}/patterns/${collectionName}/${slug}/`;
        folders.push({
            pattern: pattern.name,
            slug: slug,
            folder: folder
        });
        console.log(`   ${folder}`);
    });
    
    console.log(`📊 Total folders needed: ${folders.length}`);
    return folders;
}

// Development helper: Check what files are expected for a pattern
function getExpectedFiles(collectionName, patternName, furnitureId) {
    const collection = appState.collections?.find(c => c.name === collectionName);
    const pattern = collection?.patterns.find(p => p.name === patternName);
    const furniture = furnitureConfig?.[furnitureId];
    
    if (!pattern || !furniture) {
        console.error("❌ Pattern or furniture not found");
        return;
    }
    
    const slug = createPatternSlug(patternName);
    const folder = `https://so-animation.com/colorflex/data/furniture/${furnitureId}/patterns/${collectionName}/${slug}/`;
    
    console.log(`📋 EXPECTED FILES for ${patternName} on ${furniture.name}:`);
    console.log(`📁 Folder: ${folder}`);
    console.log(`📄 Files needed:`);
    
    const expectedFiles = [];
    if (pattern.layers) {
        pattern.layers.forEach((layer, index) => {
            const originalFileName = layer.path.split('/').pop();
            const layerName = originalFileName.replace(/\.[^/.]+$/, '');
            const furnitureFileName = `${slug}-${layerName}.png`;
            expectedFiles.push({
                original: originalFileName,
                furniture: furnitureFileName,
                fullPath: `${folder}${furnitureFileName}`
            });
            console.log(`   ${furnitureFileName}`);
        });
    }
    
    return {
        folder: folder,
        files: expectedFiles
    };
}
// 1. Console commands for planning your work
window.workflowHelpers = {
    
    // See all expected folders for a furniture + collection combo
    showFolders: function(furnitureId, collectionName) {
        console.log(`📁 FOLDER STRUCTURE: ${furnitureId} + ${collectionName}`);
        return generateFolderStructure(collectionName, furnitureId);
    },
    
    // See expected files for a specific pattern
    showFiles: function(collectionName, patternName, furnitureId) {
        console.log(`📄 EXPECTED FILES: ${patternName} on ${furnitureId}`);
        return getExpectedFiles(collectionName, patternName, furnitureId);
    },
    
    // Get overview of all work needed
    showPlan: function() {
        console.log(`🎨 COMPLETE RENDERING PLAN`);
        return generateRenderingPlan();
    },
    
    // Test pattern slug generation
    testSlug: function(patternName) {
        const slug = createPatternSlug(patternName);
        console.log(`Pattern: "${patternName}" → Slug: "${slug}"`);
        return slug;
    },
    
    // Check what's compatible
    showCompatibility: function() {
        console.log(`🔗 FURNITURE COMPATIBILITY:`);
        Object.entries(furnitureConfig || {}).forEach(([furnitureId, furniture]) => {
            console.log(`${furniture.name}: ${furniture.compatibleCollections.join(', ')}`);
        });
    },
    
    // Generate folder creation script
    generateFolderScript: function(furnitureId) {
        const furniture = furnitureConfig?.[furnitureId];
        if (!furniture) {
            console.error(`❌ Furniture ${furnitureId} not found`);
            return;
        }
        
        console.log(`📜 FOLDER CREATION SCRIPT for ${furniture.name}:`);
        console.log(`# Copy and paste these commands to create folders:\n`);
        
        let script = `# Furniture: ${furniture.name}\n`;
        script += `mkdir -p data/furniture/${furnitureId}/patterns\n\n`;
        
        furniture.compatibleCollections.forEach(collectionName => {
            const collection = appState.collections?.find(c => c.name === collectionName);
            if (!collection) return;
            
            script += `# Collection: ${collectionName}\n`;
            script += `mkdir -p data/furniture/${furnitureId}/patterns/${collectionName}\n`;
            
            collection.patterns.forEach(pattern => {
                const slug = createPatternSlug(pattern.name);
                script += `mkdir -p data/furniture/${furnitureId}/patterns/${collectionName}/${slug}\n`;
            });
            script += `\n`;
        });
        
        console.log(script);
        return script;
    }
};

// 2. Development status checker
function checkFurnitureImplementationStatus() {
    console.log(`🔍 FURNITURE IMPLEMENTATION STATUS CHECK:`);
    console.log(`======================================`);
    
    // Check if furniture config is loaded
    if (!furnitureConfig) {
        console.log(`❌ furnitureConfig not loaded`);
        return;
    }
    console.log(`✅ furnitureConfig loaded: ${Object.keys(furnitureConfig).length} furniture pieces`);
    
    // Check collections
    if (!appState.collections || appState.collections.length === 0) {
        console.log(`❌ Collections not loaded`);
        return;
    }
    console.log(`✅ Collections loaded: ${appState.collections.length} collections`);
    
    // Check current state
    const currentCollection = appState.selectedCollection?.name;
    if (!currentCollection) {
        console.log(`❌ No collection currently selected`);
        return;
    }
    console.log(`✅ Current collection: ${currentCollection}`);
    
    // Check compatibility
    const compatible = getCompatibleFurniture(currentCollection);
    console.log(`✅ Compatible furniture: ${compatible.length} pieces`);
    compatible.forEach(f => console.log(`   - ${f.name}`));
    
    // Check if Try Furniture button should be visible
    const tryButton = document.getElementById('tryFurnitureBtn');
    const backButton = document.getElementById('backToPatternsBtn');
    
    if (appState.furnitureMode) {
        console.log(`🪑 Currently in FURNITURE MODE`);
        console.log(`   Back button present: ${!!backButton}`);
    } else {
        console.log(`🎨 Currently in PATTERN MODE`);
        console.log(`   Try Furniture button present: ${!!tryButton}`);
        if (!tryButton && compatible.length > 0) {
            console.log(`⚠️  Try Furniture button should be visible but isn't!`);
        }
    }
    
    return {
        furnitureConfigLoaded: !!furnitureConfig,
        collectionsLoaded: appState.collections?.length > 0,
        currentCollection: currentCollection,
        compatibleFurniture: compatible.length,
        furnitureMode: appState.furnitureMode,
        tryButtonPresent: !!tryButton,
        backButtonPresent: !!backButton
    };
}

// 3. Easy console commands
window.checkStatus = checkFurnitureImplementationStatus;

// 4. Example usage guide
// Workflow helpers available in development mode only
if (window.location.hostname === 'localhost' || window.location.hostname.includes('dev')) {
    console.log(`
🪑 FURNITURE WORKFLOW HELPERS LOADED!
=====================================

Console Commands:
• workflowHelpers.showPlan() - See complete rendering plan
• workflowHelpers.showFolders('sofa-capitol', 'botanicals') - See folder structure
• workflowHelpers.showFiles('botanicals', 'Key Largo', 'sofa-capitol') - See expected files
• workflowHelpers.testSlug('Pattern Name Here') - Test slug conversion
• workflowHelpers.showCompatibility() - See what's compatible with what
• workflowHelpers.generateFolderScript('sofa-capitol') - Generate mkdir commands
• checkStatus() - Check implementation status

Example Workflow:
1. workflowHelpers.showPlan() - See total work needed
2. workflowHelpers.generateFolderScript('sofa-capitol') - Create folders
3. Render patterns and save to generated folders
4. Test with Try Furniture button!
`);
}

// 5. Integration check
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for everything to load
    setTimeout(() => {
        console.log(`🔍 Running furniture integration check...`);
        checkFurnitureImplementationStatus();
    }, 2000);
});

// Load furniture config on app init
let furnitureConfig = null;

async function loadFurnitureConfig() {
    try {
        console.log("📁 Loading furniture config...");
        let response;
        const furnitureConfigUrl = window.ColorFlexAssets?.furnitureConfigUrl || '/assets/furniture-config.json';
        response = await fetch(furnitureConfigUrl, {
            method: 'GET',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            furnitureConfig = await response.json();
            console.log('✅ Loaded furniture config:', furnitureConfig);
            
            // Debug the structure
            Object.keys(furnitureConfig).forEach(key => {
                console.log(`  ${key}:`, Object.keys(furnitureConfig[key]));
            });
        } else {
            if (response.status === 0 || response.status === 403) {
                throw new Error('CORS Error: Cross-origin request blocked');
            }
            console.error("❌ Furniture config response not ok:", response.status);
        }
    } catch (e) {
        if (e.name === 'TypeError' && e.message.includes('fetch')) {
            console.error('❌ Network/CORS Error loading furniture config:', e);
        } else {
            console.error("❌ Error loading furniture config:", e);
        }
    }
}


dom._patternName = document.getElementById("patternName"); // Initial assignment

// Fetch colors from colors.json
async function loadColors() {
    try {
        // Check if colors are embedded (Shopify mode)
        if (window.ColorFlexData && window.ColorFlexData.colors) {
            console.log("🎯 Using embedded Sherwin-Williams colors");
            appState.colorsData = window.ColorFlexData.colors;
            console.log("✅ Colors loaded:", appState.colorsData.length);
            return;
        }
        
        // Load directly from Shopify assets
        console.log("📁 Loading colors from Shopify assets");
        const colorsUrl = window.ColorFlexAssets?.colorsUrl || "/assets/colors.json";
        const response = await fetch(colorsUrl, {
            method: 'GET',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            if (response.status === 0 || response.status === 403) {
                throw new Error('CORS Error: Cross-origin request blocked');
            }
            throw new Error(`HTTP error: ${response.status}`);
        }
        
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("Colors data is empty or invalid");
        }

        appState.colorsData = data;
        console.log("✅ Colors loaded:", appState.colorsData.length);
    } catch (err) {
        console.error("âŒ Error loading colors:", err);
        alert("Failed to load Sherwin-Williams colors.");
    }
}

// Helper function to get clean color name without SW/SC codes for display
function getCleanColorName(colorName) {
    if (!colorName || typeof colorName !== "string") {
        return colorName;
    }
    return colorName.replace(/^(SW|SC)\d+\s*/i, "").trim();
}

// Lookup color from colors.json data
let lookupColor = (colorName) => {
    if (!colorName || typeof colorName !== "string") {
        console.warn(`Invalid colorName: ${colorName}, defaulting to #FFFFFF`);
        return "#FFFFFF";
    }
    const cleanedColorName = colorName.replace(/^(SW|SC)\d+\s*/i, "").toLowerCase().trim();
    console.log(`lookupColor: cleanedColorName=${cleanedColorName}`);
    if (/^#[0-9A-F]{6}$/i.test(cleanedColorName)) {
        console.log(`lookupColor: ${colorName} is a hex value, returning ${cleanedColorName}`);
        return cleanedColorName;
    }
    const colorEntry = appState.colorsData.find(c => c && typeof c.color_name === 'string' && c.color_name.toLowerCase() === cleanedColorName);
    if (!colorEntry) {
        console.warn(`Color '${cleanedColorName}' not found in colorsData, defaulting to #FFFFFF`);
        return "#FFFFFF";
    }
    console.log(`Looked up ${colorName} -> #${colorEntry.hex}`);
    return `#${colorEntry.hex}`;
};
if (USE_GUARD && DEBUG_TRACE) {
    lookupColor = guard(traceWrapper(lookupColor, "lookupColor")); // Wrapped for debugging
} else if (USE_GUARD) {
    lookupColor = guard(lookupColor, "lookupColor"); // Wrapped for debugging
}

// Add saved patterns indicator to main navigation
function addSavedPatternsMenuIcon() {
    // Check if we're on a Shopify page (not the ColorFlex app)
    if (window.location.pathname.includes('/pages/colorflex')) return;
    
    const patterns = JSON.parse(localStorage.getItem('colorflexSavedPatterns') || '[]');
    const existingIcon = document.getElementById('colorflexMenuIcon');
    
    if (patterns.length > 0 && !existingIcon) {
        // Find the main navigation or header to add our icon to
        const nav = document.querySelector('nav, header, .header, .navigation, .main-header, .site-header');
        if (nav) {
            const menuIcon = document.createElement('div');
            menuIcon.id = 'colorflexMenuIcon';
            menuIcon.style.cssText = `
                position: relative;
                display: inline-flex;
                align-items: center;
                cursor: pointer;
                margin: 0 10px;
                padding: 8px;
                border-radius: 50%;
                background: rgba(212, 175, 55, 0.1);
                border: 2px solid rgba(212, 175, 55, 0.6);
                transition: all 0.3s ease;
                z-index: 1000;
            `;
            
            menuIcon.innerHTML = `
                <img src="https://so-animation.com/colorflex/img/camelion-sm-r.jpg" 
                     style="width: 24px; height: 24px; border-radius: 50%;" 
                     alt="My ColorFlex Patterns">
                <span style="
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #d4af37;
                    color: white;
                    border-radius: 50%;
                    width: 18px;
                    height: 18px;
                    font-size: 10px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">${patterns.length}</span>
            `;
            
            menuIcon.addEventListener('click', () => {
                console.log('🎨 Opening saved patterns from menu icon');
                showSavedPatternsModal();
            });
            
            menuIcon.addEventListener('mouseenter', () => {
                menuIcon.style.background = 'rgba(212, 175, 55, 0.2)';
                menuIcon.style.transform = 'scale(1.1)';
            });
            
            menuIcon.addEventListener('mouseleave', () => {
                menuIcon.style.background = 'rgba(212, 175, 55, 0.1)';
                menuIcon.style.transform = 'scale(1)';
            });
            
            // Try to place it near existing user/account icons
            const userIcon = nav.querySelector('[href*="account"], [href*="login"], .user-icon, .account-icon');
            if (userIcon && userIcon.parentNode) {
                userIcon.parentNode.insertBefore(menuIcon, userIcon);
            } else {
                // Fallback: add to the end of navigation
                nav.appendChild(menuIcon);
            }
            
            console.log('✅ Added ColorFlex menu icon with', patterns.length, 'saved patterns');
        }
    } else if (patterns.length === 0 && existingIcon) {
        // Remove icon if no patterns saved
        existingIcon.remove();
        console.log('🗑️ Removed ColorFlex menu icon (no saved patterns)');
    } else if (existingIcon) {
        // Update count if icon exists
        const countSpan = existingIcon.querySelector('span');
        if (countSpan) {
            countSpan.textContent = patterns.length;
        }
    }
}

// Update menu icon whenever patterns are saved/deleted
function updateSavedPatternsMenuIcon() {
    setTimeout(addSavedPatternsMenuIcon, 100); // Small delay to ensure DOM is ready
}

// Initialize menu icon on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add saved patterns menu icon if patterns exist
    updateSavedPatternsMenuIcon();
    
    // Hamburger menu functionality
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('leftSidebar');
    
    if (hamburgerBtn && sidebar) {
        hamburgerBtn.addEventListener('click', function() {
            hamburgerBtn.classList.toggle('active');
            sidebar.classList.toggle('open');
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 1023 && 
                !sidebar.contains(e.target) && 
                !hamburgerBtn.contains(e.target) && 
                sidebar.classList.contains('open')) {
                hamburgerBtn.classList.remove('active');
                sidebar.classList.remove('open');
            }
        });
    }
});

// Check if a specific pattern has furniture renders
async function checkFurnitureAvailability(patternName) {
  if (!patternName || typeof patternName !== 'string') {
    console.warn('checkFurnitureAvailability: Invalid patternName provided');
    return { available: false };
  }
  const patternSlug = patternName.toLowerCase().replace(/ /g, '-');
  const manifestUrl = `data/furniture/sofa-capitol/patterns/${patternSlug}/manifest.json`;
  
  try {
    const response = await fetch(manifestUrl, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (response.ok) {
      const manifest = await response.json();
      return {
        available: true,
        manifest: manifest,
        furnitureType: 'sofa-capitol'
      };
    }
  } catch (e) {
    // No furniture version
  }
  return { available: false };
}

// Call loadFurnitureConfig when your app initializes
loadFurnitureConfig();



/**
 * =============================================================================
 * SECTION 4: FABRIC RENDERING ENGINE
 * =============================================================================
 * 
 * This section contains the core fabric and pattern rendering system including:
 * - Advanced fabric compositing with multiple blend modes
 * - Resolution-independent image scaling and processing  
 * - Furniture layer drawing and mockup generation
 * - Masked layer processing with alpha channels
 * - Real-time fabric parameter tuning and effects
 */

// Utility Functions

/**
 * Helper function for scaling images while preserving aspect ratio
 * Calculates dimensions to fit an image within target bounds
 * 
 * @param {HTMLImageElement} img - Source image to scale
 * @param {number} targetWidth - Maximum width
 * @param {number} targetHeight - Maximum height
 * @returns {Object} Scaled dimensions and positioning {width, height, x, y}
 */
function scaleToFit(img, targetWidth, targetHeight) {
    const aspectRatio = img.width / img.height;
    let drawWidth = targetWidth;
    let drawHeight = targetHeight;
    
    if (aspectRatio > targetWidth / targetHeight) {
        drawHeight = drawWidth / aspectRatio;
    } else {
        drawWidth = drawHeight * aspectRatio;
    }
    
    const x = (targetWidth - drawWidth) / 2;
    const y = (targetHeight - drawHeight) / 2;
    
    return { width: drawWidth, height: drawHeight, x, y };
}
// Shared helper for loading and tinting a masked image
async function drawMaskedLayer(imgPath, tintColor, label) {
    // Check if this is a wall panel image
    const isWallPanel = imgPath.includes('wall-panels');
    
    // Get the original, untinted grayscale image for alpha calculation
    const originalUrl = await new Promise(resolve => 
        processImage(imgPath, resolve, null, 2.2, false, false, false)
    );
    const img = await loadImage(originalUrl);

    // Draw the original image centered on an offscreen canvas
    const offscreen = document.createElement("canvas");
    offscreen.width = 1080;
    offscreen.height = 1080;
    const offCtx = offscreen.getContext("2d");
    drawCenteredImage(offCtx, img, 1080, 1080);

    // Get pixel data
    let imageData;
    try {
        imageData = offCtx.getImageData(0, 0, 1080, 1080);
    } catch (e) {
        console.warn("⚠️ Canvas tainted, skipping masked layer processing:", e.message);
        return;
    }
    const { data } = imageData;

    // Invert luminance for alpha: white (255) â†’ alpha 0, black (0) â†’ alpha 255
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        data[i + 3] = 255 - luminance; // INVERTED for correct alpha
    }
    offCtx.putImageData(imageData, 0, 0);

    // Prepare the colored (tint) layer and mask it with the alpha
    const tintLayer = document.createElement("canvas");
    tintLayer.width = 1080;
    tintLayer.height = 1080;
    const tintCtx = tintLayer.getContext("2d");
    tintCtx.fillStyle = tintColor;
    tintCtx.fillRect(0, 0, 1080, 1080);
    tintCtx.globalCompositeOperation = "destination-in";
    tintCtx.drawImage(offscreen, 0, 0);

    // Composite result onto main canvas
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(tintLayer, 0, 0);

    console.log(`✅ [${label}] tint-mask drawn.`);
}

function applyNormalizationProcessing(data, rLayer, gLayer, bLayer) {
    // IMPROVED normalization logic for better detail preservation
    let minLuminance = 255, maxLuminance = 0;
    for (let i = 0; i < data.length; i += 4) {
        const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        minLuminance = Math.min(minLuminance, luminance);
        maxLuminance = Math.max(maxLuminance, luminance);
    }
    const range = maxLuminance - minLuminance || 1;
    console.log("Min Luminance:", minLuminance, "Max Luminance:", maxLuminance);

    for (let i = 0; i < data.length; i += 4) {
        const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        let normalized = (luminance - minLuminance) / range;
        normalized = Math.max(0, Math.min(1, normalized));
        
        let alpha = 1 - normalized;
        
        if (alpha > 0.8) {
            alpha = 1;
        } else if (alpha > 0.5) {
            alpha = 0.8 + (alpha - 0.5) * 0.67;
        } else if (alpha > 0.2) {
            alpha = alpha * 1.6;
        } else {
            alpha = alpha * 0.5;
        }
        alpha = Math.min(1, Math.max(0, alpha));

        if (alpha > 0.05) {
            data[i] = rLayer;
            data[i + 1] = gLayer;
            data[i + 2] = bLayer;
        } else {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
        }
        data[i + 3] = Math.round(alpha * 255);
    }
}

function resolveColor(raw) {
    const color = (!raw || typeof raw !== "string") ? "Snowbound" : raw.trim().toUpperCase();
    const resolved = lookupColor(color);
    if (!resolved) console.warn(`âš ï¸ [resolveColor] Could not resolve color: '${color}', using Snowbound`);
    return resolved || lookupColor("Snowbound") || "#DDDDDD";
}

function drawCenteredImage(ctx, img, canvasWidth, canvasHeight) {
    const aspect = img.width / img.height;
    let drawWidth = canvasWidth;
    let drawHeight = drawWidth / aspect;

    if (drawHeight > canvasHeight) {
        drawHeight = canvasHeight;
        drawWidth = drawHeight * aspect;
    }

    const offsetX = Math.round((canvasWidth - drawWidth) / 2);
    const offsetY = Math.round((canvasHeight - drawHeight) / 2);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

function hexToHSL(hex) {
    // Remove # if present
    hex = hex.replace(/^#/, '');

    // Convert 3-digit to 6-digit hex
    if (hex.length === 3) {
        hex = hex.split('').map(x => x + x).join('');
    }

    if (hex.length !== 6) {
        console.error("âŒ Invalid HEX color:", hex);
        return null;
    }

    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
            case g: h = ((b - r) / d + 2); break;
            case b: h = ((r - g) / d + 4); break;
        }
        h *= 60;
    }

    return {
        h: Math.round(h),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;

    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
        Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));

    return `#${[f(0), f(8), f(4)].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function findClosestSWColor(targetHex) {
    let bestMatch = null;
    let bestDistance = Infinity;

    for (const color of colorsData) {
        const dist = colorDistance(`#${color.hex}`, targetHex);
        if (dist < bestDistance) {
            bestDistance = dist;
            bestMatch = color;
        }
    }

    return bestMatch;
}

function colorDistance(hex1, hex2) {
    const rgb1 = hexToRGB(hex1);
    const rgb2 = hexToRGB(hex2);
    return Math.sqrt(
        Math.pow(rgb1.r - rgb2.r, 2) +
        Math.pow(rgb1.g - rgb2.g, 2) +
        Math.pow(rgb1.b - rgb2.b, 2)
    );
}

function hexToRGB(hex) {
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const bigint = parseInt(hex, 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: (bigint & 255) };
}
// Reusable listener setup
const setupPrintListener = () => {
    // Only set up print listeners on ColorFlex app pages
    if (!isColorFlexAppPage()) {
        console.log('🔧 Skipping print listener setup - not on ColorFlex app page');
        return;
    }
    
    const tryAttachListener = (attempt = 1, maxAttempts = 10) => {
        const printButton = document.getElementById("printButton");
        console.log(`Print listener - Attempt ${attempt} - Looking for printButton: ${printButton ? "Found" : "Not found"}`);

        if (printButton) {
            const newButton = printButton.cloneNode(true);
            printButton.parentNode.replaceChild(newButton, printButton);

            newButton.addEventListener("click", async () => {
                console.log("Print preview triggered");
                const result = await generatePrintPreview();
                if (!result) {
                    console.error("Print preview - Failed to generate output");
                }
            });
            console.log("Print listener attached");
        } else if (attempt < maxAttempts) {
            console.warn(`Print button not found, retrying (${attempt}/${maxAttempts})`);
            setTimeout(() => tryAttachListener(attempt + 1, maxAttempts), 500);
        } else {
            console.error("Print button not found after max attempts");
        }
    };

    console.log("Print listener - Initial DOM state:", document.readyState);
    console.log("Print listener - Pattern preview wrapper:", document.getElementById("patternPreviewWrapper"));

    if (document.readyState === "complete" || document.readyState === "interactive") {
        tryAttachListener();
    } else {
        document.addEventListener("DOMContentLoaded", () => {
            console.log("Print listener - DOMContentLoaded fired");
            tryAttachListener();
        });
    }
};


    const toInitialCaps = (str) => {
        if (!str || typeof str !== 'string') {
            return '';
        }
        return str
            .toLowerCase()
            .replace(/\.\w+$/, '') // Remove file extensions like .jpg, .png, etc.
            .replace(/-\d+x\d+$|-variant$/i, '') // Remove suffixes like -24x24, -variant
            .replace(/_/g, ' ') // Replace underscores with spaces
            .split(/[\s-]+/) // Split on spaces and hyphens
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

        const stripSWNumber = (colorName) => {
        return colorName.replace(/(SW|SC)\d+\s*/, '').trim(); // Removes "SW" followed by digits and optional space
    };

const getContrastClass = (hex) => {
    // console.trace("getContrastClass received:", hex);

    if (typeof hex !== "string" || !hex.startsWith("#") || hex.length < 7) {
        console.warn("⚠️ Invalid hex value in getContrastClass:", hex);
        return "text-black"; // or choose a safe default
    }

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "text-black" : "text-white";
};


async function drawFurnitureLayer(ctx, imagePath, options = {}) {
    console.log("🔍 drawFurnitureLayer ENTRY:");
    console.log("  imagePath received:", imagePath);
    console.log("  Is sofa base?", imagePath?.includes('sofa-capitol-base'));
    console.log("  Is ferns pattern?", imagePath?.includes('ferns'));

    const {
        tintColor = null,
        isMask = false,
        opacity = 1.0,
        blendMode = "source-over",
        zoomState = null,
        highRes = false
    } = options;
    
    const width = 600;
    const height = 450;

    // ✅ Scale up for high resolution pattern rendering
    const renderScale = highRes ? 2 : 1;
    const renderWidth = width * renderScale;
    const renderHeight = height * renderScale;

    
    // ✅ Use passed zoom state if provided, otherwise fall back to global
    const activeZoomState = zoomState || {
        scale: furnitureViewSettings.scale,
        offsetX: furnitureViewSettings.offsetX,
        offsetY: furnitureViewSettings.offsetY,
        isZoomed: furnitureViewSettings.isZoomed
    };
    
    const { scale, offsetX, offsetY } = activeZoomState;
    
    console.log(`🔍 drawFurnitureLayer DEBUG for: ${imagePath.split('/').pop()}`);
    console.log(`   📊 ZOOM STATE: scale=${scale}, offset=(${offsetX.toFixed(1)}, ${offsetY.toFixed(1)})`);
    console.log(`   🔒 Using ${zoomState ? 'PASSED' : 'GLOBAL'} zoom state`);
    console.log(`   Canvas size: ${width}x${height}`);
    
    try {
        const img = await loadImage(imagePath);
        if (!img) {
            console.error("❌ Failed to load image:", imagePath);
            return;
        }
        
        console.log(`   Original image: ${img.naturalWidth}x${img.naturalHeight}`);
        if (highRes) console.log(`   🔍 High-res rendering: ${renderWidth}x${renderHeight}`);
        
        const scaledWidth = img.naturalWidth * scale;  // Keep original logic
        const scaledHeight = img.naturalHeight * scale; // Keep original logic

        let drawX = (renderWidth / 2) - (scaledWidth / 2) + (offsetX * renderScale);
        let drawY = (renderHeight / 2) - (scaledHeight / 2) + (offsetY * renderScale);
        
        
        console.log(`   Draw position: (${drawX.toFixed(1)}, ${drawY.toFixed(1)})`);
        
        // Create working canvas at render resolution
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = renderWidth;
        tempCanvas.height = renderHeight;
        const tempCtx = tempCanvas.getContext("2d");
        
        if (isMask && tintColor) {
            // ✅ CORRECTED WALL MASK LOGIC
            console.log(`   🎭 Processing wall mask with color ${tintColor}`);
            
            // First, draw the mask image to get its alpha values
            const maskCanvas = document.createElement("canvas");
            maskCanvas.width = width;
            maskCanvas.height = height;
            const maskCtx = maskCanvas.getContext("2d");
            
            // Draw the scaled mask image
            maskCtx.drawImage(img, drawX, drawY, scaledWidth, scaledHeight);
            
            // Get the mask pixel data
            let maskImageData;
            try {
                maskImageData = maskCtx.getImageData(0, 0, width, height);
            } catch (e) {
                console.warn("⚠️ Canvas tainted, falling back to simple draw for mask processing:", e.message);
                tempCtx.drawImage(img, drawX, drawY, scaledWidth, scaledHeight);
                ctx.drawImage(tempCanvas, 0, 0);
                return;
            }
            const maskData = maskImageData.data;
            
            // Create output canvas with the tint color
            const outputImageData = tempCtx.createImageData(width, height);
            const outputData = outputImageData.data;

            console.log("🎨 TINTING DEBUG:");
            console.log("  Image being tinted:", imagePath?.split('/').pop());
            console.log("  tintColor parameter:", tintColor);
            console.log("  Is sofa base:", imagePath?.includes('sofa-capitol-base'));

            
            // Parse tint color
            const hex = tintColor.replace("#", "");
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            
            console.log("  Parsed RGB:", r, g, b);
            console.log("  Should be Cottage Linen RGB: 240, 240, 233");

            console.log(`   🎨 Tint color RGB: (${r}, ${g}, ${b})`);
            
            // Apply mask: white areas in mask = wall color, black areas = transparent
            for (let i = 0; i < maskData.length; i += 4) {
                const maskR = maskData[i];
                const maskG = maskData[i + 1];
                const maskB = maskData[i + 2];
                
                // Calculate mask intensity (how white the pixel is)
                const maskIntensity = (maskR + maskG + maskB) / 3;
                
                if (maskIntensity > 128) {
                    // White area in mask = apply wall color
                    outputData[i] = r;
                    outputData[i + 1] = g;
                    outputData[i + 2] = b;
                    outputData[i + 3] = 128; // Fully opaque
                } else {
                    // Black area in mask = transparent (let room background show through)
                    outputData[i] = 0;
                    outputData[i + 1] = 0;
                    outputData[i + 2] = 0;
                    outputData[i + 3] = 0; // Fully transparent
                }
            }
            
            // Put the processed image data to the temp canvas
            tempCtx.putImageData(outputImageData, 0, 0);
            
            console.log(`   ✅ Wall mask applied: white areas colored, black areas transparent`);
            
            } else if (tintColor) {
            if (imagePath?.includes('sofa-capitol-base') || imagePath?.includes('patterns/botanicals/')) {
                console.log("🎨 Using LUMINANCE-based logic for:", imagePath?.split('/').pop());
                
                // Draw the image first
                tempCtx.drawImage(img, drawX, drawY, scaledWidth, scaledHeight);
                
                // Get image data
                let imageData;
                try {
                    imageData = tempCtx.getImageData(0, 0, renderWidth, renderHeight);
                } catch (e) {
                    console.warn("⚠️ Canvas tainted, falling back to simple tinting for luminance processing:", e.message);
                    // Fall back to simple tinting
                    tempCtx.fillStyle = tintColor;
                    tempCtx.fillRect(0, 0, renderWidth, renderHeight);
                    tempCtx.globalCompositeOperation = "destination-in";
                    tempCtx.drawImage(img, drawX, drawY, scaledWidth, scaledHeight);
                    tempCtx.globalCompositeOperation = "source-over";
                    ctx.drawImage(tempCanvas, 0, 0);
                    return;
                }
                const data = imageData.data;
                
                // Parse tint color
                const hex = tintColor.replace("#", "");
                const rLayer = parseInt(hex.substring(0, 2), 16);
                const gLayer = parseInt(hex.substring(2, 4), 16);
                const bLayer = parseInt(hex.substring(4, 6), 16);
                
                // ✅ USE LUMINANCE for both sofa base AND patterns
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const brightness = (r + g + b) / 3;
                    
                    if (brightness <= 5) {  // Pure black - transparent
                        data[i + 3] = 0;
                    } else {  // Non-black pixels - tint based on brightness
                        const alpha = brightness / 255;
                        
                        data[i] = rLayer;
                        data[i + 1] = gLayer; 
                        data[i + 2] = bLayer;
                        data[i + 3] = Math.round(alpha * 255);
                    }
                }
                
                tempCtx.putImageData(imageData, 0, 0);
                
            } else {
                // Keep original alpha-based logic for other elements (if any)
                tempCtx.fillStyle = tintColor;
                tempCtx.fillRect(0, 0, width, height);
                
                tempCtx.globalCompositeOperation = "destination-in";
                tempCtx.drawImage(img, drawX, drawY, scaledWidth, scaledHeight);
                tempCtx.globalCompositeOperation = "source-over";
            }
        }

        else {
            // Direct images - draw at calculated position and size
            tempCtx.drawImage(img, drawX, drawY, scaledWidth, scaledHeight);
            console.log(`   ✅ Direct image drawn at (${drawX.toFixed(1)}, ${drawY.toFixed(1)})`);
        }
        
        // Draw to main canvas
        ctx.save();
        ctx.globalAlpha = opacity;
        console.log("   🎨 Using NORMAL blend for", imagePath?.split('/').pop());
        ctx.globalCompositeOperation = blendMode; // Normal for everything else

        if (highRes) {
            // Scale down from high-res to normal resolution
            ctx.drawImage(tempCanvas, 0, 0, renderWidth, renderHeight, 0, 0, width, height);
            console.log(`   ✅ High-res layer scaled down and composited`);
        } else {
            ctx.drawImage(tempCanvas, 0, 0);
        }
        ctx.restore();        
        console.log(`   ✅ Layer composited to main canvas`);
        
    } catch (error) {
        console.error("❌ Error in drawFurnitureLayer:", error);
    }
}

// Create a color input UI element
const createColorInput = (label, id, initialColor, isBackground = false) => {
    console.log(`Creating ${label} input, ID: ${id}, initialColor: ${initialColor}`);
    
    const container = document.createElement("div");
    container.className = "layer-input-container";

    const labelEl = document.createElement("div");
    labelEl.className = "layer-label";
    labelEl.textContent = label || "Unknown Layer";

    const colorCircle = document.createElement("div");
    colorCircle.className = "circle-input";
    colorCircle.id = `${id}Circle`;
    const cleanInitialColor = (initialColor || "Snowbound").replace(/^(SW|SC)\d+\s*/i, "").trim();
    const colorValue = lookupColor(cleanInitialColor);
    console.log(`Setting ${label} circle background to: ${colorValue}`);
    colorCircle.style.backgroundColor = colorValue;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "layer-input";
    input.id = id;
    input.placeholder = `Enter ${label ? label.toLowerCase() : 'layer'} color`;
    input.value = toInitialCaps(cleanInitialColor);
    console.log(`Setting ${label} input value to: ${input.value}`);

    container.append(labelEl, colorCircle, input);
   


    const updateColor = () => {
        console.log(`updateColor called for ${label}, input value: ${input.value}`);
        const formatted = toInitialCaps(input.value.trim());
        if (!formatted) {
            input.value = toInitialCaps(cleanInitialColor);
            colorCircle.style.backgroundColor = colorValue;
            console.log(`${label} input restored to initial color: ${colorValue}`);
        } else {
            const hex = lookupColor(formatted) || "#FFFFFF";
            if (hex === "#FFFFFF" && formatted !== "Snowbound") {
                input.value = toInitialCaps(cleanInitialColor);
                colorCircle.style.backgroundColor = colorValue;
                console.log(`${label} input restored to initial color due to invalid color: ${colorValue}`);
            } else {
                input.value = formatted;
                colorCircle.style.backgroundColor = hex;
                console.log(`${label} input updated to: ${hex}`);
            }
        }

        const layerIndex = appState.currentLayers.findIndex(layer => layer.label === label);
        if (layerIndex !== -1) {
            appState.currentLayers[layerIndex].color = input.value;

            console.log("🎯 COLOR UPDATE DEBUG:");
            console.log(`  Changed input: ${label} (index ${layerIndex})`);
            console.log(`  New value: ${input.value}`);
            console.log("  Current layer structure after update:");
            appState.currentLayers.forEach((layer, i) => {
                console.log(`    ${i}: ${layer.label} = "${layer.color}"`);
            });


            console.log(`Updated appState.currentLayers[${layerIndex}].color to: ${input.value}`);
        }

        const isFurniturePattern = appState.currentPattern?.isFurniture || false;

        // Check if we're in fabric mode - render both fabric mockup and pattern preview
        if (appState.isInFabricMode) {
            console.log("🧵 Color changed in fabric mode - calling both renderFabricMockup() and updatePreview()");
            renderFabricMockup();
            updatePreview(); // Also update the pattern preview on the left
        } else {
            // Regular furniture or pattern mode
            updatePreview();
            updateRoomMockup();
        }
        populateCoordinates();
    };

    // Restore original event listeners
    input.addEventListener("blur", updateColor);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") updateColor();
    });

    // Restore original click handler
    console.log(`Attaching click handler to ${label} color circle, ID: ${colorCircle.id}`);
        colorCircle.addEventListener("click", () => {
        // Check if we're in coordinate mode (back button exists) - exit coordinate mode
        const coordinateBackButton = document.getElementById('backToPatternLink');
        
        if (coordinateBackButton) {
            console.log(`🔄 Color circle clicked in coordinate mode - triggering back to pattern then selecting layer`);
            coordinateBackButton.click(); // Trigger the coordinate back button
            // Pass through the click after returning to pattern mode
            setTimeout(() => {
                appState.lastSelectedLayer = {
                    input,
                    circle: colorCircle,
                    label,
                    isBackground
                };
                highlightActiveLayer(colorCircle);
                console.log(`✅ Layer selected after returning from coordinate mode: ${label}`);
            }, 50);
            return;
        }
        
        // In furniture mode, allow normal color changes - do NOT exit furniture mode
        const furnitureBackButton = document.getElementById('backToPatternsBtn');
        if (furnitureBackButton) {
            console.log(`🎨 Color circle clicked in furniture mode - changing color while staying in furniture mode: ${label}`);
            // Continue with normal color selection behavior below
        }
        
        // Normal color circle behavior
        appState.lastSelectedLayer = {
            input,
            circle: colorCircle,
            label,
            isBackground
        };
        highlightActiveLayer(colorCircle);
        console.log(`Clicked ${label} color circle`);
    });


    return {
        container,
        input,
        circle: colorCircle,
        label,
        isBackground
    };

};


// Populate curated colors in header
function populateCuratedColors(colors) {
  console.log("🎨 populateCuratedColors called with colors:", colors?.length);
  console.log("🔍 curatedColorsContainer element:", dom.curatedColorsContainer);

  if (!dom.curatedColorsContainer) {
    console.error("❌ curatedColorsContainer not found in DOM");
    console.log("🔍 Available DOM elements:", Object.keys(dom));
    return;
  }

  if (!colors || !colors.length) {
    console.warn("⚠️ No curated colors provided, colors array:", colors);
    return;
  }
  
  console.log("✅ About to populate", colors.length, "curated colors");

  dom.curatedColorsContainer.innerHTML = "";

  // 🎟️ Run The Ticket Button
  const ticketCircle = document.createElement("div");
  ticketCircle.id = "runTheTicketCircle";
  ticketCircle.className = "curated-color-circle cursor-pointer border-2";
  ticketCircle.style.backgroundColor = "black";

  const ticketLabel = document.createElement("span");
  ticketLabel.className = "text-xs font-bold text-white text-center whitespace-pre-line font-special-elite";
  ticketLabel.textContent = appState.activeTicketNumber
    ? `TICKET\n${appState.activeTicketNumber}`
    : "RUN\nTHE\nTICKET";

  ticketCircle.appendChild(ticketLabel);
  ticketCircle.addEventListener("click", () => {
    const ticketNumber = prompt("🎟️ Enter the Sherwin-Williams Ticket Number:");
    if (ticketNumber) runStaticTicket(ticketNumber.trim());
  });
  dom.curatedColorsContainer.appendChild(ticketCircle);

  // 🎨 Add curated color swatches
  colors.forEach(label => {
    if (!Array.isArray(appState.colorsData)) {
  console.error("❌ appState.colorsData is not available or not an array");
  return;
}

const found = appState.colorsData.find(c =>
      c && (
        (typeof c.sw_number === 'string' && label.toLowerCase().includes(c.sw_number.toLowerCase())) ||
        (typeof c.color_name === 'string' && label.toLowerCase().includes(c.color_name.toLowerCase()))
      )
    );

    if (!found || !found.hex) {
      console.warn("⚠️ Missing hex for curated color:", label);
      return;
    }

    const hex = `#${found.hex}`;
    const circle = document.createElement("div");
    circle.className = "curated-color-circle cursor-pointer";
    circle.style.backgroundColor = hex;

    const text = document.createElement("span");
    text.className = `text-xs font-bold text-center ${getContrastClass(hex)} whitespace-pre-line`;
    text.textContent = `${found.sw_number?.toUpperCase()}\n${toInitialCaps(found.color_name)}`;

    circle.appendChild(text);
    circle.addEventListener("click", () => {
      const selectedLayer = appState.lastSelectedLayer;
      if (!selectedLayer) return alert("Please select a layer first.");

      selectedLayer.input.value = toInitialCaps(found.color_name);
      selectedLayer.circle.style.backgroundColor = hex;

      const i = appState.currentLayers.findIndex(l => l.label === selectedLayer.label);
      if (i !== -1) appState.currentLayers[i].color = found.color_name;

      const j = appState.layerInputs.findIndex(li => li.label === selectedLayer.label);
      if (j !== -1) {
        appState.layerInputs[j].input.value = toInitialCaps(found.color_name);
        appState.layerInputs[j].circle.style.backgroundColor = hex;
      }

      appState.lastSelectedColor = { name: found.color_name, hex };
      updateDisplays();
    });

    dom.curatedColorsContainer.appendChild(circle);
  });

  console.log("✅ Curated colors populated:", colors.length);
}

function getLayerMappingForPreview(isFurnitureCollection) {
    if (isFurnitureCollection) {
        return {
            type: 'furniture',
            patternStartIndex: 2,      // Pattern layers start at index 2  
            backgroundIndex: 1,        // Sofa base = pattern background (index 1)
            wallIndex: 0               // Wall color (index 0)
        };
    } else {
        return {
            type: 'standard',
            patternStartIndex: 1,      // Pattern layers start at index 1
            backgroundIndex: 0,        // True background
            wallIndex: null            // No wall color
        };
    }
}

function validateLayerMapping() {
    const isFurnitureCollection = appState.selectedCollection?.furnitureType != null || appState.furnitureMode === true;
    const mapping = getLayerMappingForPreview(isFurnitureCollection);
    
    console.log("🔍 LAYER MAPPING VALIDATION (WITH WALL COLOR):");
    console.log("  Collection type:", isFurnitureCollection ? "furniture" : "standard");
    console.log("  Total inputs:", appState.currentLayers.length);
    console.log("  Pattern start index:", mapping.patternStartIndex);
    console.log("  Background/Sofa base index:", mapping.backgroundIndex);
    console.log("  Wall index:", mapping.wallIndex);
    
    console.log("  Layer assignments:");
    appState.currentLayers.forEach((layer, index) => {
        let usage = "unused";
        if (index === mapping.wallIndex) {
            usage = "wall color (via mask)";
        } else if (index === mapping.backgroundIndex) {
            if (isFurnitureCollection) {
                usage = "sofa base + pattern background";
            } else {
                usage = "pattern background";
            }
        } else if (index >= mapping.patternStartIndex) {
            usage = `pattern layer ${index - mapping.patternStartIndex}`;
        }
        
        console.log(`    ${index}: ${layer.label} = "${layer.color}" (${usage})`);
    });

    // Show the mapping clearly
    if (isFurnitureCollection) {
        console.log("🔄 FURNITURE COLLECTION MAPPING (WITH WALL MASK):");
        console.log("  Pattern Preview:");
        console.log(`    Background ← Input ${mapping.backgroundIndex} (${appState.currentLayers[mapping.backgroundIndex]?.label})`);
        for (let i = 0; i < (appState.currentLayers.length - mapping.patternStartIndex); i++) {
            const inputIndex = mapping.patternStartIndex + i;
            if (appState.currentLayers[inputIndex]) {
                console.log(`    Pattern Layer ${i} ← Input ${inputIndex} (${appState.currentLayers[inputIndex].label})`);
            }
        }
        console.log("  Furniture Mockup:");
        console.log("    Room Scene ← sofa-capitol.png");
        console.log(`    Wall Areas ← Input ${mapping.wallIndex} (${appState.currentLayers[mapping.wallIndex]?.label}) via wall mask`);
        console.log(`    Sofa Base ← Input ${mapping.backgroundIndex} (${appState.currentLayers[mapping.backgroundIndex]?.label})`);
        for (let i = 0; i < (appState.currentLayers.length - mapping.patternStartIndex); i++) {
            const inputIndex = mapping.patternStartIndex + i;
            if (appState.currentLayers[inputIndex]) {
                console.log(`    Pattern Layer ${i} ← Input ${inputIndex} (${appState.currentLayers[inputIndex].label})`);
            }
        }
    }
}


function insertTicketIndicator(ticketNumber) {
    const existing = document.getElementById("ticketIndicator");
    if (existing) {
        existing.innerHTML = `TICKET<br>${ticketNumber}`;
        return;
    }

    const indicator = document.createElement("div");
    indicator.id = "ticketIndicator";
    indicator.className = "w-20 h-20 rounded-full flex items-center justify-center text-center text-xs font-bold text-gray-800";
    indicator.style.backgroundColor = "#e5e7eb"; // Tailwind gray-200
    indicator.style.marginRight = "8px";
    indicator.innerHTML = `TICKET<br>${ticketNumber}`;

    dom.curatedColorsContainer.prepend(indicator);
}

function promptTicketNumber() {
    const input = prompt("Enter Sherwin-Williams ticket number (e.g., 280):");
    const ticketNum = parseInt(input?.trim());
    if (isNaN(ticketNum)) {
        alert("Please enter a valid numeric ticket number.");
        return;
    }
    runStaticTicket(ticketNum);
}

function runTheTicket(baseColor) {
    console.log("ðŸŽŸï¸ Running the Ticket for:", baseColor);

    if (!isAppReady) {
        console.warn("⚠️ App is not ready yet. Ignoring runTheTicket call.");
        alert("Please wait while the app finishes loading.");
        return;
    }

    if (!baseColor || !baseColor.hex) {
        console.warn("âŒ No base color provided to runTheTicket.");
        return;
    }

    if (!Array.isArray(appState.colorsData) || appState.colorsData.length === 0) {
        console.warn("X¸ Sherwin-Williams colors not loaded yet.");
        alert("Color data is still loading. Please try again shortly.");
        return;
    }

    const baseHSL = hexToHSL(baseColor.hex);
    if (!baseHSL) {
        console.error("X Failed to convert base HEX to HSL.");
        return;
    }

    console.log("+ Base color HSL:", baseHSL);

    const swColors = appState.colorsData
        .filter(c => c.hex && c.name)
        .map(c => ({
            name: c.name,
            hex: c.hex,
            hsl: hexToHSL(c.hex)
        }));

    console.log("** Total SW Colors to search:", swColors.length);

    const scored = swColors
        .map(c => {
            const hueDiff = Math.abs(baseHSL.h - c.hsl.h);
            const satDiff = Math.abs(baseHSL.s - c.hsl.s);
            const lightDiff = Math.abs(baseHSL.l - c.hsl.l);
            return {
                ...c,
                score: hueDiff + satDiff * 0.5 + lightDiff * 0.8
            };
        })
        .sort((a, b) => a.score - b.score)
        .slice(0, appState.currentLayers.length);

    console.log("ðŸŽ¯ Top Ticket matches:", scored);

    if (!Array.isArray(appState.layerInputs) || appState.layerInputs.length === 0) {
        console.warn("âŒ No layer inputs available. Cannot apply ticket.");
        return;
    }

    scored.forEach((ticketColor, idx) => {
        const inputSet = appState.layerInputs[idx];
        if (!inputSet || !inputSet.input || !inputSet.circle) {
            console.warn(`âŒ Missing input or circle at index ${idx}`);
            return;
        }

        const formatted = toInitialCaps(ticketColor.name);
        inputSet.input.value = formatted;
        inputSet.circle.style.backgroundColor = ticketColor.hex;
        appState.currentLayers[idx].color = formatted;

        console.log(`ðŸŽ¯ Layer ${idx + 1} set to ${formatted} (${ticketColor.hex})`);
    });

    insertTicketIndicator(ticketNumber);

    updateDisplays();
    console.log("✅ Ticket run complete.");
}

function runStaticTicket(ticketNumber) {
    console.log(`ðŸŽ« Static Ticket Requested: ${ticketNumber}`);

    if (!Array.isArray(appState.colorsData) || appState.colorsData.length === 0) {
        alert("Color data not loaded yet.");
        return;
    }

    const ticketColors = [];
    for (let i = 1; i <= 7; i++) {
        const locatorId = `${ticketNumber}-C${i}`;
        const color = appState.colorsData.find(c => c.locator_id?.toUpperCase() === locatorId.toUpperCase());
        if (color) {
            const displayName = `${color.sw_number?.toUpperCase() || ""} ${toInitialCaps(color.color_name)}`;
            ticketColors.push(displayName.trim());
        }
    }

    if (ticketColors.length === 0) {
        alert(`No colors found for ticket ${ticketNumber}`);
        return;
    }

    appState.curatedColors = ticketColors;
    appState.activeTicketNumber = ticketNumber; // ðŸ†• Track it for label update
    populateCuratedColors(ticketColors);

    console.log(`ðŸŽ¯ Loaded ticket ${ticketNumber} with ${ticketColors.length} colors`);
}


async function initializeApp() {
    try {
        console.log("🚀 Starting app...");
        
        // Validate DOM elements first
    validateDOMElements();
    
    // ✅ Step 1: Load Sherwin-Williams Colors
    await loadColors();
    console.log("✅ Colors loaded:", appState.colorsData.length);

    try {
        // ✅ Step 2: Load Collections
        // Check if data is embedded in window object (Shopify mode)
        let data;
        if (window.ColorFlexData && window.ColorFlexData.collections) {
            console.log("🎯 Using embedded ColorFlex data");
            data = { collections: window.ColorFlexData.collections };
        } else {
            console.log("📁 Loading collections from Shopify assets");
            const collectionsUrl = window.ColorFlexAssets?.collectionsUrl || "/assets/collections.json";
            const response = await fetch(collectionsUrl, { 
                method: 'GET',
                cache: "no-store",
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) throw new Error(`Failed to fetch collections: ${response.status}`);
            data = await response.json();
        }

        // ADD THIS DEBUG:
        console.log("🔍 Raw JSON collections loaded:", data.collections.length);
        const farmhouseCollection = data.collections.find(c => c && typeof c.name === 'string' && c.name === "farmhouse");
        console.log("🔍 Raw farmhouse collection:", farmhouseCollection);
        console.log("🔍 Raw farmhouse elements:", farmhouseCollection?.elements);


        if (!data.collections?.length) {
            console.error("X No collections found in collections.json");
            dom.collectionHeader.textContent = "No Collections Available";
            dom.preview.innerHTML = "<p>No collections available. Please run the data import script.</p>";
            return;
        }

        // ✅ Step 3: Save collections once  
        if (!appState.collections.length) {
            // Filter out any invalid collections that might cause toLowerCase errors
            appState.collections = data.collections.filter(c => 
                c && typeof c === 'object' && typeof c.name === 'string'
            ).map(collection => {
                // Also filter out invalid patterns within each collection
                if (collection.patterns && Array.isArray(collection.patterns)) {
                    collection.patterns = collection.patterns.filter(p => 
                        p && typeof p === 'object' && (typeof p.name === 'string' || typeof p.id === 'string')
                    );
                }
                return collection;
            });
            console.log("✅ Collections loaded:", appState.collections.length);
            console.log("🔍 First collection structure:", appState.collections[0]);
        }

        // ✅ Step 4: Select collection via Shopify integration, URL param, or fallback
        const urlParams = new URLSearchParams(window.location.search);
        const urlCollectionName = urlParams.get("collection")?.trim();
        
        console.log("🔍 COLLECTION SELECTION DEBUG:");
        console.log("  URL collection param:", urlCollectionName);
        console.log("  Shopify target collection:", window.appState?.selectedCollection);
        console.log("  Shopify target pattern:", window.appState?.targetPattern?.name);
        console.log("  Available collections:", appState.collections.map(c => c.name));
        console.log("  Total collections loaded:", appState.collections.length);
        
        // Priority 1: Use Shopify-detected collection (from product page integration)
        let collectionName = window.appState?.selectedCollection || urlCollectionName;
        
        let selectedCollection = appState.collections.find(
            c => c && typeof c.name === 'string' && collectionName && typeof collectionName === 'string' && 
            c.name.trim().toLowerCase() === collectionName.toLowerCase()
        ) || appState.collections[0];
        
        console.log("  Selected collection source:", window.appState?.selectedCollection ? "Shopify" : "URL");
        console.log("  Final collection:", selectedCollection?.name);

        if (!selectedCollection) {
            console.error("X No valid collection found.");
            return;
        }

        // ✅ Step 5: Set collection in appState
        appState.selectedCollection = selectedCollection;
        appState.lockedCollection = true;
        appState.curatedColors = selectedCollection.curatedColors || [];
        console.log("@ Selected Collection:", selectedCollection.name);
        console.log("@ Curated colors:", appState.curatedColors.length);

        // ✅ Step 6: Update UI header
        if (dom.collectionHeader) {
            dom.collectionHeader.textContent = toInitialCaps(selectedCollection.name);
        }

        // ✅ Step 7: Show curated color circles + ticket button
        populateCuratedColors(appState.curatedColors);

        // ✅ Step 8: Load target pattern or first pattern
        // Priority 1: Check URL pattern parameter
        let initialPattern = null;
        const urlPatternName = urlParams.get("pattern")?.trim();
        const decodedPatternName = urlPatternName ? decodeURIComponent(urlPatternName) : null;
        if (decodedPatternName) {
            console.log(`🔍 Looking for pattern: "${decodedPatternName}" (original: "${urlPatternName}")`);
            // First try to find pattern in selected collection
            initialPattern = selectedCollection.patterns.find(p => 
                p && typeof p === 'object' && typeof p.name === 'string' && (
                    p.name.toLowerCase() === decodedPatternName.toLowerCase() ||
                    p.id === decodedPatternName
                )
            ) || (
                // First try exact matches within selected collection
                selectedCollection.patterns.find(p => 
                    p && typeof p === 'object' && typeof p.name === 'string' && 
                    p.name.toLowerCase() === decodedPatternName.toLowerCase()
                ) ||
                // Then try partial matches within selected collection - but prioritize longer matches
                selectedCollection.patterns.find(p => 
                    p && typeof p === 'object' && typeof p.name === 'string' && (
                        // Only match if pattern name contains search term (avoid short pattern names matching longer search terms)
                        p.name.toLowerCase().includes(decodedPatternName.toLowerCase()) ||
                        // Only reverse match for patterns longer than 4 characters to avoid "Chester" matching "Chesterfield"
                        (decodedPatternName.toLowerCase().includes(p.name.toLowerCase()) && p.name.length > 4)
                    )
                )
            );
            
            // If pattern not found in selected collection, search all collections (DYNAMIC)
            if (!initialPattern) {
                console.log("🔍 Pattern not found in selected collection, searching all collections dynamically...");
                console.log(`🔍 Searching for pattern: "${decodedPatternName}" across ${appState.collections.length} collections`);
                
                // First pass: Look for exact matches across all collections
                let foundPattern = null;
                for (const collection of appState.collections) {
                    foundPattern = collection.patterns?.find(p => {
                        if (!p || typeof p !== 'object') return false;
                        const patternName = (typeof p.name === 'string' ? p.name.toLowerCase() : '') || '';
                        const patternId = (typeof p.id === 'string' ? p.id.toLowerCase() : '') || '';
                        const searchName = decodedPatternName.toLowerCase();
                        
                        // Only exact matches in first pass
                        return patternName === searchName || patternId === searchName;
                    });
                    
                    if (foundPattern) {
                        console.log(`🎯 EXACT MATCH: Pattern "${urlPatternName}" → "${foundPattern.name}" in collection "${collection.name}"`);
                        selectedCollection = collection;
                        break;
                    }
                }
                
                // Second pass: If no exact match, try partial matches
                if (!foundPattern) {
                    for (const collection of appState.collections) {
                        console.log(`  🔍 Checking collection: "${collection.name}" (${collection.patterns?.length || 0} patterns)`);
                        foundPattern = collection.patterns?.find(p => {
                            if (!p || typeof p !== 'object') return false;
                            const patternName = (typeof p.name === 'string' ? p.name.toLowerCase() : '') || '';
                            const patternId = (typeof p.id === 'string' ? p.id.toLowerCase() : '') || '';
                            const searchName = decodedPatternName.toLowerCase();
                            
                            // Partial matches - but prioritize longer pattern name matches
                            if (patternName.includes(searchName)) return true;
                            if (searchName.includes(patternName) && patternName.length > 4) return true; // Avoid matching very short patterns
                            
                            // Handle special cases for known patterns
                            if (searchName === 'constantinople' && patternName.includes('constantinople')) return true;
                            if (searchName === 'istanbul' && patternName.includes('istanbul')) return true;
                            
                            return false;
                        });
                        
                        if (foundPattern) {
                            console.log(`🎯 PARTIAL MATCH: Pattern "${urlPatternName}" → "${foundPattern.name}" in collection "${collection.name}"`);
                            selectedCollection = collection;
                            break;
                        }
                    }
                }
                
                if (foundPattern) {
                    console.log(`🔄 Switching from collection "${selectedCollection.name}" to collection with found pattern`);
                    appState.selectedCollection = selectedCollection;
                    appState.curatedColors = selectedCollection.curatedColors || [];
                    initialPattern = foundPattern;
                        
                        // Update UI to reflect correct collection
                        if (dom.collectionHeader) {
                            dom.collectionHeader.textContent = toInitialCaps(selectedCollection.name);
                        }
                        populateCuratedColors(appState.curatedColors);
                        break;
                    }
                }
                
                if (!initialPattern) {
                    console.warn(`❌ Pattern "${urlPatternName}" not found in any collection`);
                }
            }
            console.log("🎯 Using URL pattern parameter:", urlPatternName, "→", initialPattern?.name, "in collection:", selectedCollection?.name);
        }
        
        // Priority 2: Use Shopify-detected target pattern
        if (!initialPattern && window.appState?.targetPattern) {
            initialPattern = selectedCollection.patterns.find(p => 
                p && typeof p === 'object' && (
                    p.id === window.appState.targetPattern.id || 
                    p.name === window.appState.targetPattern.name
                )
            );
            console.log("🎯 Using Shopify target pattern:", initialPattern?.name);
        }
        
        // Priority 3: Use first pattern as fallback
        if (!initialPattern) {
            initialPattern = selectedCollection.patterns[0];
            console.log("📍 Using first pattern as fallback:", initialPattern?.name);
        }
        
        const initialPatternId = initialPattern?.id;
        if (initialPatternId) {
            loadPatternData(selectedCollection, initialPatternId);  // ✅ Fixed: pass collection
        } else {
            console.warn("âš ï¸ No patterns found for", selectedCollection.name);
        }

        // ✅ Step 9: Load thumbnails + setup print
        populatePatternThumbnails(selectedCollection.patterns);
        setupPrintListener();

        isAppReady = true;
        console.log("✅ App is now fully ready.");

        function initializeInteractiveZoom() {
            // Set up interactive zoom when app is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', addInteractiveZoom);
            } else {
                addInteractiveZoom();
            }
        }
        // Call this when collections are loaded
        initializeInteractiveZoom();  // ← Add this line right here
        initializeTryFurnitureFeature();

        console.log("Current state during app init:");
console.log("  furnitureConfig loaded:", !!furnitureConfig);
console.log("  appState.selectedCollection:", !!appState.selectedCollection);
console.log("  appState.collections:", !!appState.collections?.length);
console.log("  DOM ready:", document.readyState);



    } catch (error) {
        console.error("X Error loading collections:", error);
        dom.collectionHeader.textContent = "Error Loading Collection";
        dom.preview.innerHTML = "<p>Error loading data. Please try refreshing.</p>";
    }
}


// Ensure appState has a default
appState._selectedCollection = null;

// Check if we're on the ColorFlex app page
function isColorFlexAppPage() {
    return document.getElementById('colorflex-app') || window.location.pathname.includes('/colorflex');
}

// Run on initial load and refresh
window.addEventListener('load', () => {
    initializeApp().catch(error => console.error("Initialization failed:", error));
});

window.addEventListener('popstate', () => {
    initializeApp().catch(error => console.error("Refresh initialization failed:", error));
});

// Populate pattern thumbnails in sidebar
function populatePatternThumbnails(patterns) {
    console.log("populatePatternThumbnails called with patterns:", patterns);
    if (!dom.collectionThumbnails) {
        console.error("collectionThumbnails not found in DOM");
        return;
    }
    if (!Array.isArray(patterns)) {
        console.error("Patterns is not an array:", patterns);
        return;
    }

    const validPatterns = patterns.filter(p => p && typeof p === 'object' && p.name);
    if (!validPatterns.length) {
        console.warn("No valid patterns to display");
        dom.collectionThumbnails.innerHTML = "<p>No patterns available.</p>";
        return;
    }

    function cleanPatternName(str) {
        if (!str || typeof str !== 'string') {
            return '';
        }
        return str
            .toLowerCase()
            .replace(/\.\w+$/, '')
            .replace(/-\d+x\d+$|-variant$/i, '')
            .replace(/^\d+[a-z]+-|-.*$/i, '')
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    dom.collectionThumbnails.innerHTML = "";
    console.log("Cleared existing thumbnails");

    validPatterns.forEach(pattern => {
        console.log("Processing pattern:", pattern);
        pattern.displayName = cleanPatternName(pattern.name);
        const thumb = document.createElement("div");
        thumb.className = "thumbnail cursor-pointer border-1 border-transparent";
        thumb.dataset.patternId = pattern.id || (typeof pattern.name === 'string' ? pattern.name.toLowerCase().replace(/\s+/g, '-') : 'unknown-pattern');
        thumb.style.width = "120px";
        thumb.style.boxSizing = "border-box";

        const img = document.createElement("img");
        img.src = normalizePath(pattern.thumbnail) || "https://so-animation.com/colorflex/data/collections/fallback.jpg";
        img.alt = pattern.displayName;
        img.className = "w-full h-auto";
        img.onerror = () => {
            console.warn(`Failed to load thumbnail for ${pattern.displayName}: ${img.src}`);
            if (img.src !== "https://so-animation.com/colorflex/data/collections/fallback.jpg") {
                img.src = "https://so-animation.com/colorflex/data/collections/fallback.jpg";
                img.onerror = () => {
                    console.warn(`Failed to load fallback for ${pattern.displayName}`);
                    const placeholder = document.createElement("div");
                    placeholder.textContent = pattern.displayName || "Thumbnail Unavailable";
                    placeholder.style.width = "100%";
                    placeholder.style.height = "80px";
                    placeholder.style.backgroundColor = "#e0e0e0";
                    placeholder.style.border = "1px solid #ccc";
                    placeholder.style.display = "flex";
                    placeholder.style.alignItems = "center";
                    placeholder.style.justifyContent = "center";
                    placeholder.style.fontSize = "12px";
                    placeholder.style.textAlign = "center";
                    placeholder.style.padding = "5px";
                    placeholder.style.boxSizing = "border-box";
                    thumb.replaceChild(placeholder, img);
                    img.onerror = null;
                    console.log(`Replaced failed thumbnail for ${pattern.displayName} with placeholder div`);
                };
            } else {
                const placeholder = document.createElement("div");
                placeholder.textContent = pattern.displayName || "Thumbnail Unavailable";
                placeholder.style.width = "100%";
                placeholder.style.height = "80px";
                placeholder.style.backgroundColor = "#e0e0e0";
                placeholder.style.border = "1px solid #ccc";
                placeholder.style.display = "flex";
                placeholder.style.alignItems = "center";
                placeholder.style.justifyContent = "center";
                placeholder.style.fontSize = "12px";
                placeholder.style.textAlign = "center";
                placeholder.style.padding = "5px";
                placeholder.style.boxSizing = "border-box";
                thumb.replaceChild(placeholder, img);
                img.onerror = null;
                console.log(`Replaced failed thumbnail for ${pattern.displayName} with placeholder div`);
            }
        };

        thumb.appendChild(img);

        const label = document.createElement("p");
        label.textContent = pattern.displayName;
        label.className = "text-center";
        thumb.appendChild(label);

        if (appState.currentPattern && String(appState.currentPattern.id) === String(pattern.id)) {
            thumb.classList.add("selected");
            console.log(`Applied 'selected' class to ${pattern.displayName}`);
        }

        thumb.addEventListener("click", (e) => {
            console.log(`Thumbnail clicked: ${pattern.displayName}, ID: ${thumb.dataset.patternId}`);
            handleThumbnailClick(thumb.dataset.patternId);
            document.querySelectorAll(".thumbnail").forEach(t => t.classList.remove("selected"));
            thumb.classList.add("selected");
        });

        dom.collectionThumbnails.appendChild(thumb);
    });
    console.log("Pattern thumbnails populated:", validPatterns.length);

    // Update collection header
    if (dom.collectionHeader) {
        dom.collectionHeader.textContent = toInitialCaps(appState.selectedCollection?.name || "Unknown");
        console.log("Updated collectionHeader:", dom.collectionHeader.textContent);
    }
}

// Populate coordinates thumbnails in #coordinatesContainer
const populateCoordinates = () => {
    if (!dom.coordinatesContainer) {
        console.error("coordinatesContainer not found in DOM");
        return;
    }
    
    dom.coordinatesContainer.innerHTML = "";
    
    const coordinates = appState.selectedCollection?.coordinates || [];
    console.log("Collection coordinates data:", coordinates);

    if (!coordinates.length) {
        console.log("No matching coordinates available for collection:", appState.selectedCollection?.name);
        return;
    }

    const numCoordinates = coordinates.length;
    const xStep = 80;
    const yStep = 60;
    
    // Get actual container dimensions
    const containerWidth = dom.coordinatesContainer.offsetWidth || 600;
    const containerHeight = dom.coordinatesContainer.offsetHeight || 300;
    
    // Calculate total span and center the layout
    const totalXSpan = (numCoordinates - 1) * xStep;
    const totalYSpan = numCoordinates > 1 ? yStep : 0;
    
    const xStart = (containerWidth / 2) - (totalXSpan / 2);
    const yStart = (containerHeight / 2) - (totalYSpan / 2);

    coordinates.forEach((coord, index) => {
        const div = document.createElement("div");
        div.className = "coordinate-item";
        
        const xOffset = xStart + (index * xStep);
        const yOffset = yStart + (index % 2 === 0 ? 0 : yStep);
        
        div.style.setProperty("--x-offset", `${xOffset}px`);
        div.style.setProperty("--y-offset", `${yOffset}px`);

        const img = document.createElement("img");
        const normalizedPath = normalizePath(coord.path);
        console.log(`🔍 Coordinate path: "${coord.path}" → normalized: "${normalizedPath}"`);
        img.src = normalizedPath || "https://so-animation.com/colorflex/data/collections/default-coordinate.jpg";
        img.alt = coord.pattern || `Coordinate ${index + 1}`;
        img.className = "coordinate-image";
        img.dataset.filename = coord.path || "fallback";
        
        img.onerror = () => {
            console.warn(`Failed to load coordinate image: ${img.src}`);
            const placeholder = document.createElement("div");
            placeholder.className = "coordinate-placeholder";
            placeholder.textContent = coord.pattern || "Coordinate Unavailable";
            div.replaceChild(placeholder, img);
        };

        div.appendChild(img);
        dom.coordinatesContainer.appendChild(div);
    });
        console.log("Coordinates populated:", coordinates.length);
        setupCoordinateImageHandlers();

};

// Populate the layer inputs UI
function populateLayerInputs(pattern = appState.currentPattern) {
  try {
    console.log("🎛️ populateLayerInputs called with pattern:", pattern?.name);
    
    if (!pattern) {
      console.error("❌ No pattern provided or set in appState.");
      return;
    }

    handlePatternSelection(pattern.name);
    appState.layerInputs = [];
    appState.currentLayers = [];

    if (!dom.layerInputsContainer) {
      console.error("❌ layerInputsContainer not found in DOM");
      console.log("🔍 Available DOM elements:", Object.keys(dom));
      return;
    }
    
    console.log("✅ layerInputsContainer found:", dom.layerInputsContainer);

    // 🔧 NEW: Check if pattern supports ColorFlex
    if (pattern.colorFlex === false) {
      console.log("📋 Standard pattern detected - no color inputs needed");
      dom.layerInputsContainer.innerHTML = "";
      
      // Still need to build layer model for display, but no inputs
      const allLayers = buildLayerModel(
        pattern,
        [], // No colors needed for standard patterns
        {
          isWallPanel: appState.selectedCollection?.name === "wall-panels",
          tintWhite: false // No tinting for standard patterns
        }
      );
      appState.currentLayers = allLayers;
      
      // Trigger pattern display without color controls
      console.log("✅ Standard pattern loaded for display only");
      return;
    }
    
    console.log("🎨 ColorFlex pattern detected - creating color inputs");

    const designerColors = pattern.designer_colors || [];
    const curatedColors = appState.selectedCollection?.curatedColors || [];
    
    // Use curated colors as fallback if no designer colors
    const effectiveColors = designerColors.length > 0 ? designerColors : curatedColors;
    console.log("🎨 COLOR FALLBACK DEBUG:");
    console.log("  - designerColors:", designerColors.length, designerColors);
    console.log("  - curatedColors:", curatedColors.length, curatedColors);
    console.log("  - effectiveColors:", effectiveColors.length, effectiveColors);

    // Get all layers (including shadows)
    const allLayers = buildLayerModel(
      pattern,
      effectiveColors,
      {
        isWallPanel: appState.selectedCollection?.name === "wall-panels",
        tintWhite: appState.tintWhite || false
      }
    );

    // Store all layers in currentLayers
    appState.currentLayers = allLayers;
    dom.layerInputsContainer.innerHTML = "";

    // Create inputs ONLY for non-shadow layers
    const inputLayers = allLayers.filter(layer => !layer.isShadow);
    
    // Add inputs directly to container (no row wrappers)
    inputLayers.forEach(layer => {
      const layerData = createColorInput(
        layer.label,
        layer.inputId,
        layer.color,
        layer.isBackground
      );

      appState.layerInputs.push({
        input: layerData.input,
        circle: layerData.circle,
        label: layerData.label,
        isBackground: layerData.isBackground,
        color: layer.color,
        hex: lookupColor(layer.color) || "#FFFFFF"
      });

      // Add directly to container - no row grouping needed!
      dom.layerInputsContainer.appendChild(layerData.container);
    });

    console.log("✅ Populated layerInputs:", appState.layerInputs.map(l => ({
      label: l.label,
      value: l.input.value
    })));
    
    console.log("✅ All layers (including shadows):", appState.currentLayers.map(l => ({
      label: l.label,
      isShadow: l.isShadow,
      path: l.path
    })));
    
    // Add save button after pattern layers are populated
    addSaveButton();
    
    } catch (e) {
        console.error("❌ Error in populateLayerInputs:", e);
    }
}

if (USE_GUARD && DEBUG_TRACE) {
  populateLayerInputs = guard(traceWrapper(populateLayerInputs, "populateLayerInputs"));
} else if (USE_GUARD) {
  populateLayerInputs = guard(populateLayerInputs, "populateLayerInputs");
}

if (USE_GUARD && DEBUG_TRACE) {
  populateLayerInputs = guard(traceWrapper(populateLayerInputs, "populateLayerInputs"));
} else if (USE_GUARD) {
  populateLayerInputs = guard(populateLayerInputs, "populateLayerInputs");
}


function handlePatternSelection(patternName, preserveColors = false) {
    console.log(`handlePatternSelection: pattern=${patternName}, lockedCollection=${appState.lockedCollection}, currentCollection=${appState.selectedCollection?.name}`);
    const pattern = appState.selectedCollection.patterns.find(
        p => p.name.toUpperCase() === patternName.toUpperCase()
    ) || appState.selectedCollection.patterns[0];
    if (!pattern) {
        console.error(`Pattern ${patternName} not found in selected collection`);
        return;
    }
    appState.currentPattern = pattern;
    console.log("Pattern set to:", appState.currentPattern.name);
    console.log("Layer labels available:", appState.currentPattern.layerLabels);
    console.log("Layers available:", JSON.stringify(appState.currentPattern.layers, null, 2));

    const designerColors = appState.currentPattern.designer_colors || [];
    const curatedColors = appState.selectedCollection.curatedColors || [];
    const colorSource = designerColors.length > 0 ? designerColors : curatedColors;
    console.log("🔍 DEBUG Color Logic:");
    console.log("  - designerColors:", designerColors);
    console.log("  - curatedColors:", curatedColors);
    console.log("  - colorSource:", colorSource);
    console.log("  - colorSource.length:", colorSource.length);

    // Save current color values if preserving
    const savedColors = preserveColors ? 
        appState.currentLayers.map(layer => layer.color) : [];

    appState.currentLayers = [];
    let colorIndex = 0; // ✅ Make sure this is only declared once

    const patternType = getPatternType(pattern, appState.selectedCollection);
    console.log(`🔍 Pattern type detected: ${patternType} for pattern: ${pattern.name} in collection: ${appState.selectedCollection?.name}`);
    const isWallPanel = patternType === "wall-panel";
    const isWall = pattern.isWall || isWallPanel;

    if (isWall) {
        const wallColor = colorSource[colorIndex] || "#FFFFFF";
        appState.currentLayers.push({ 
            imageUrl: null, 
            color: wallColor, 
            label: "Wall Color",
            isShadow: false
        });
        colorIndex++;
    }

    const backgroundColor = colorSource[colorIndex] || "#FFFFFF";
    appState.currentLayers.push({ 
        imageUrl: null, 
        color: backgroundColor, 
        label: "Background",
        isShadow: false
    });
    console.log("DEBUG: currentLayers[0]?.color =", appState.currentLayers[0]?.color);
    colorIndex++;

    if (!appState.currentPattern.tintWhite) {
        const overlayLayers = pattern.layers || [];
        console.log(`Processing ${overlayLayers.length} overlay layers`);
        overlayLayers.forEach((layer, index) => {
            const layerPath = layer.path || "";
            const label = pattern.layerLabels[index] || `Layer ${index + 1}`;
            const isShadow = layer.isShadow === true;
            if (!isShadow) {
                const layerColor = colorSource[colorIndex] || "#000000";
                appState.currentLayers.push({
                    imageUrl: layerPath,
                    color: layerColor,
                    label: label,
                    isShadow: false
                });
                console.log(`Assigned color to ${label}: ${layerColor}`);
                colorIndex++;
            }
        });
        console.log("Final appState.currentLayers:", JSON.stringify(appState.currentLayers, null, 2));
    }

    // Restore saved colors if preserving
    if (preserveColors && savedColors.length > 0) {
        appState.currentLayers.forEach((layer, index) => {
            if (savedColors[index] && layer.color) {
                layer.color = savedColors[index];
            }
        });
        console.log("🔄 Colors preserved from previous selection");
    }
}

function applyColorsToLayerInputs(colors, curatedColors = []) {
    console.log("Applying colors to layer inputs:", colors, 
                "Curated colors:", curatedColors,
                "Layer inputs length:", appState.layerInputs.length,
                "Current layers length:", appState.currentLayers.length);
    appState.layerInputs.forEach((layer, index) => {
        if (index >= appState.currentLayers.length) {
            console.warn(`Skipping input ${layer.label} at index ${index}: no corresponding currentLayer`);
            return;
        }
        const color = colors[index] || curatedColors[index] || (layer.isBackground ? "#FFFFFF" : "Snowbound");
        const cleanColor = color.replace(/^(SW|SC)\d+\s*/i, "").trim();
        const hex = lookupColor(color) || "#FFFFFF";
        layer.input.value = toInitialCaps(cleanColor);
        layer.circle.style.backgroundColor = hex;
        console.log(`Applied ${cleanColor} (${hex}) to ${layer.label} input (index ${index})`);
        
        appState.currentLayers[index].color = cleanColor;
    });
    console.log("Inputs after apply:", 
                appState.layerInputs.map(l => ({ id: l.input.id, label: l.label, value: l.input.value })));
    updateDisplays();
}

// Highlight active layer
const highlightActiveLayer = (circle) => {
    document.querySelectorAll(".circle-input").forEach((c) => (c.style.outline = "none"));
    circle.style.outline = "6px solid rgb(244, 255, 219)";
};


/**
 * =============================================================================
 * SECTION 5: PATTERN PROCESSING ENGINE
 * =============================================================================
 * 
 * This section handles the core image processing functionality including:
 * - Pattern layer color application and tinting
 * - Image normalization and gamma correction
 * - Shadow and transparency processing  
 * - Canvas-based pixel manipulation
 * - Real-time pattern rendering and updates
 */

/**
 * Main image processing function - applies colors and effects to pattern layers
 * 
 * This is the core function that takes a pattern image and applies color tinting,
 * shadow effects, and other transformations to create the final rendered pattern.
 * 
 * PROCESSING PIPELINE:
 * 1. Normalize and load the image URL
 * 2. Apply color tinting based on layerColor parameter
 * 3. Handle special cases (shadows, walls, panels)
 * 4. Process pixels with normalization or binary thresholding
 * 5. Apply gamma correction and output to callback
 * 
 * @param {string} url - Image URL to process
 * @param {Function} callback - Callback function receiving processed canvas
 * @param {string} layerColor - Hex color to apply to the pattern (#7f817e default)
 * @param {number} gamma - Gamma correction value (2.2 default)
 * @param {boolean} isShadow - Whether this layer represents a shadow
 * @param {boolean} isWallPanel - Whether this is a wall panel layer  
 * @param {boolean} isWall - Whether this is a solid wall color
 */
let processImage = (url, callback, layerColor = '#7f817e', gamma = 2.2, isShadow = false, isWallPanel = false, isWall = false) => {
    console.log("🔍 processImage called from:", new Error().stack.split('\n')[2]);
    
    // Normalize the URL path to fix ./data/ vs data/ inconsistencies
    const normalizedUrl = normalizePath(url);
    console.log(`Processing image ${url} -> ${normalizedUrl} with color ${layerColor}, Normalization: ${USE_NORMALIZATION}, IsShadow: ${isShadow}, IsWallPanel: ${isWallPanel}, IsWall: ${isWall}`);
    
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = `${normalizedUrl}?t=${new Date().getTime()}`;

    img.onload = () => {
        console.log(`✅ Processed image: ${img.src} (${img.naturalWidth}x${img.naturalHeight})`);
        console.log("Image loaded successfully:", url);

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const width = img.width;
        const height = img.height;
        canvas.width = width;
        canvas.height = height;

        if (isWall && (!url || url === "")) {
            ctx.fillStyle = layerColor;
            ctx.fillRect(0, 0, width, height);
            console.log("Applied solid wall color:", layerColor);
            callback(canvas);
            return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        let imageData;
        try {
            imageData = ctx.getImageData(0, 0, width, height);
        } catch (e) {
            console.warn("⚠️ Canvas tainted, returning image without processing:", e.message);
            callback(canvas);
            return;
        }
        const data = imageData.data;

        console.log("Original Sample (R,G,B,A):", data[0], data[1], data[2], data[3]);

        let rLayer, gLayer, bLayer;
        if (layerColor && !isShadow) {
            const hex = layerColor.replace("#", "");
            rLayer = parseInt(hex.substring(0, 2), 16);
            gLayer = parseInt(hex.substring(2, 4), 16);
            bLayer = parseInt(hex.substring(4, 6), 16);
            console.log(`Layer color parsed: R=${rLayer}, G=${gLayer}, B=${bLayer}`);
        } else if (isShadow) {
            console.log("Shadow layer: Skipping color parsing");
        }

        if (isWallPanel && layerColor && !isShadow) {
            // Wall panel processing
            const isDesignLayer = url.toLowerCase().includes("design");
            const isBackLayer = url.toLowerCase().includes("back");
            const layerType = isDesignLayer ? "Design" : isBackLayer ? "Back" : "Other";
            let designPixelCount = 0;
            let transparentPixelCount = 0;

            console.log(`🔍 Wall panel debug - Layer type: ${layerType}`);
            console.log(`🔍 Data array length: ${data.length}`);
            console.log(`🔍 Image dimensions: ${canvas.width}x${canvas.height}`);
            console.log(`🔍 Expected pixels: ${canvas.width * canvas.height}`);
            console.log(`🔍 First 3 pixels:`, 
                `(${data[0]},${data[1]},${data[2]},${data[3]})`,
                `(${data[4]},${data[5]},${data[6]},${data[7]})`, 
                `(${data[8]},${data[9]},${data[10]},${data[11]})`);

            applyNormalizationProcessing(data, rLayer, gLayer, bLayer);
            
            console.log(`Processed ${layerType} layer: Design pixels=${designPixelCount}, Transparent pixels=${transparentPixelCount}`);
        } else if (isShadow) {
            // Shadow processing
                console.log("🔍 Processing shadow layer");

            for (let i = 0; i < data.length; i += 4) {
                const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                const alpha = 1 - (luminance / 255);
                data[i] = 0;
                data[i + 1] = 0;
                data[i + 2] = 0;
                data[i + 3] = Math.round(alpha * 255);
            }
        } else if (layerColor && USE_NORMALIZATION) {
            // Standard pattern normalization
            applyNormalizationProcessing(data, rLayer, gLayer, bLayer);
        } else if (layerColor) {
            // Standard brightness-based masking (when normalization is off)
            let recoloredPixels = 0;
            let maskedPixels = 0;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];

                const brightness = (r + g + b) / 3;

                if (brightness < 200 && a > 0) {
                    data[i] = rLayer;
                    data[i + 1] = gLayer;
                    data[i + 2] = bLayer;
                    data[i + 3] = 255;
                    recoloredPixels++;
                } else {
                    data[i + 3] = 0;
                    maskedPixels++;
                }
            }

            console.log(`Recolored pixels: ${recoloredPixels}, Transparent (masked): ${maskedPixels}`);
        }

        console.log("Processed Sample (R,G,B,A):", data[0], data[1], data[2], data[3]);
        ctx.putImageData(imageData, 0, 0);
        callback(canvas);
    };

    img.onerror = () => console.error(`Canvas image load failed: ${url}`);
};
   // GUARD / TRACE WRAPPER
    if (USE_GUARD && DEBUG_TRACE) {
    processImage = guard(traceWrapper(processImage, "processImage")); // Wrapped for debugging
    } else if (USE_GUARD) {
        processImage = guard(processImage, "processImage"); // Wrapped for debugging
    }


    // Load pattern data from JSON
function loadPatternData(collection, patternId) {
    console.log(`loadPatternData: patternId=${patternId}`);
    
    const pattern = collection.patterns.find(p => p.id === patternId);
        
    if (pattern) {
        console.log(`✅ Found pattern "${pattern.name}" (ID: ${pattern.id}) in collection "${collection.name}"`);
        appState.currentPattern = pattern;

        // ===== INSERT DEBUG LOGS HERE =====
        console.log("🔍 SOURCE DATA DEBUG:");
        console.log("  Current pattern:", appState.currentPattern?.name);
        console.log("  Designer colors:", appState.currentPattern?.designer_colors);
        console.log("  Layer labels:", appState.currentPattern?.layerLabels);
        console.log("  Layers array:", appState.currentPattern?.layers?.map((l, i) => `${i}: ${l.path?.split('/').pop()}`));

        // Check if this is a furniture collection
        const isFurnitureCollection = appState.selectedCollection?.wallMask != null || 
                                        appState.selectedCollection?.furnitureType != null;
        
        if (isFurnitureCollection) {
            appState.furnitureMode = true;
        }

        // ✅ Build layer + input models once pattern is set
        populateLayerInputs(pattern);
        

        // ===== DEBUG AFTER populateLayerInputs =====
        console.log("🎛️ UI POPULATION DEBUG:");
        console.log("  currentLayers count:", appState.currentLayers?.length);
        console.log("  currentLayers content:");
        appState.currentLayers?.forEach((layer, index) => {
            console.log(`    ${index}: "${layer.label}" = "${layer.color}"`);
        });

        // ===== DEBUG ACTUAL DOM INPUTS =====
        setTimeout(() => {
            console.log("🔍 ACTUAL UI INPUTS:");
            const inputs = document.querySelectorAll('.layer-input');
            inputs.forEach((input, index) => {
                const container = input.closest('.layer-input-container');
                const label = container?.querySelector('.layer-label')?.textContent;
                console.log(`    UI Input ${index}: "${label}" = "${input.value}"`);
            });
        }, 100); // Small delay to ensure DOM is updated

        console.log(">>> Updated appState.currentPattern:", JSON.stringify(pattern, null, 2));
        appState.curatedColors = appState.selectedCollection.curatedColors || [];
        console.log(">>> Updated appState.curatedColors:", appState.curatedColors);
        
        if (!Array.isArray(appState.colorsData) || appState.colorsData.length === 0) {
            console.warn("🛑 Sherwin-Williams colors not loaded yet. Delaying populateCuratedColors.");
            return;
        }

        // ✅ Only call curated color population when everything is ready
        if (appState.colorsData.length && collection.curatedColors?.length) {
            appState.curatedColors = collection.curatedColors;
            populateCuratedColors(appState.curatedColors);
        } else {
            console.warn("X Not populating curated colors - missing data");
        }

        const isFurniturePattern = appState.currentPattern?.isFurniture || false;
        
        updatePreview();
        
        // Check if we're in fabric mode - if so, only render fabric mockup
        if (appState.isInFabricMode) {
            console.log("🧵 loadPatternData in fabric mode - calling renderFabricMockup()");
            renderFabricMockup();
        } else {
            updateRoomMockup();
        }
        
        populatePatternThumbnails(appState.selectedCollection.patterns);
        populateCoordinates();

    } else {
        console.error(">>> Pattern not found:", patternId);
    }
}
    // GUARD / TRACE WRAPPER
    if (USE_GUARD && DEBUG_TRACE) {
    loadPatternData = guard(traceWrapper(loadPatternData, "loadPatternData")); // Wrapped for debugging
    } else if (USE_GUARD) {
        loadPatternData = guard(loadPatternData, "loadPatternData"); // Wrapped for debugging
    }

    // Pattern scaling
    window.setPatternScale = function(multiplier) {
        appState.scaleMultiplier = multiplier;
        console.log(`>>> Scale multiplier set to: ${appState.scaleMultiplier}`);

        // Highlight active button
        document.querySelectorAll('#scaleControls button').forEach(btn => {
            const btnMultiplier = parseFloat(btn.dataset.multiplier);
            if (btnMultiplier === multiplier) {
                btn.classList.add('!bg-blue-500', 'text-white', 'active-scale');
                btn.classList.remove('!bg-gray-200');
            } else {
                btn.classList.add('!bg-gray-200');
                btn.classList.remove('!bg-blue-500', 'text-white', 'active-scale');
            }
        });

        // Check if we're in fabric mode - if so, only render fabric mockup
        if (appState.isInFabricMode) {
            console.log("🧵 setPatternScale in fabric mode - calling renderFabricMockup()");
            renderFabricMockup();
        } else {
            updateRoomMockup();
        }

        const isFurniturePattern = appState.currentPattern?.isFurniture || false;

        updatePreview();
        
    };
    // GUARD / TRACE WRAPPER
    if (USE_GUARD && DEBUG_TRACE) {
    setPatternScale = guard(traceWrapper(setPatternScale, "setPatternScale")); // Wrapped for debugging
    } else if (USE_GUARD) {
        setPatternScale = guard(setPatternScale, "setPatternScale"); // Wrapped for debugging
    }
    
    // Initialize scale on page load
    document.addEventListener('DOMContentLoaded', () => {
        appState.scaleMultiplier = 1; // Default to Normal
        setPatternScale(1);
        console.log('setPatternScale called with multiplier:', appState.scaleMultiplier);
    });


    // Ensure updatePreview is defined before updateDisplays uses it
// ============================================================================
// CORE ISSUES AND FIXES
// ============================================================================

// 1. Fix buildLayerModel to return a flat array consistently
function buildLayerModel(pattern, designerColors = [], options = {}) {
    const { isWallPanel = false, tintWhite = false } = options;
    const patternLayers = pattern.layers || [];
    const layerLabels = pattern.layerLabels || [];

    console.log("🏗️ buildLayerModel LABEL FIX DEBUG:");
    console.log("  Pattern layers:", patternLayers.length);
    console.log("  Layer labels:", layerLabels);
    console.log("  Designer colors available:", designerColors.length);

    let colorIndex = 0;
    let inputIndex = 0;
    const allLayers = [];

    // Check if this is a furniture collection
console.log("🔍 FURNITURE DETECTION DEBUG:");
console.log("  selectedCollection name:", appState.selectedCollection?.name);
console.log("  selectedCollection wallMask:", appState.selectedCollection?.wallMask);
console.log("  selectedCollection furnitureType:", appState.selectedCollection?.furnitureType);
console.log("  selectedCollection keys:", Object.keys(appState.selectedCollection || {}));

const isFurnitureCollection = appState.selectedCollection?.wallMask != null;
console.log("  isFurnitureCollection result:", isFurnitureCollection);
    

    if (isFurnitureCollection) {
        // Add wall color layer
        const furnitureConfig = appState.selectedCollection?.furnitureConfig;
        const defaultWallColor = furnitureConfig?.defaultWallColor || "SW7006 Extra White";
        
        allLayers.push({
            label: "Wall Color",
            color: defaultWallColor,
            path: null,
            isBackground: false,
            isShadow: false,
            isWallPanel: false,
            inputId: `layer-${inputIndex++}`
        });
        console.log(`  ✅ Added Wall Color (default): ${defaultWallColor}`);

        // Add sofa base layer  
        allLayers.push({
            label: "BG/Sofa Base",
            color: designerColors[colorIndex++] || "Snowbound", 
            path: null,
            isBackground: true,
            isShadow: false,
            isWallPanel: false,
            inputId: `layer-${inputIndex++}`
        });
        console.log(`  ✅ Added BG/Sofa Base (designer color ${colorIndex - 1})`);

    } else {
        // Standard collection - just background
        allLayers.push({
            label: "Background",
            color: designerColors[colorIndex++] || "Snowbound", 
            path: null,
            isBackground: true,
            isShadow: false,
            isWallPanel: false,
            inputId: `layer-${inputIndex++}`
        });
    }

    // ✅ PATTERN LAYERS (shared by both furniture and standard)
    console.log("  🎨 Processing pattern layers:");
    let patternLabelIndex = 0;

    for (let i = 0; i < patternLayers.length; i++) {
        const layer = patternLayers[i];
        const isTrueShadow = layer.isShadow === true;

        if (!isTrueShadow) {
            const originalLabel = layerLabels[patternLabelIndex] || `Pattern Layer ${patternLabelIndex + 1}`;
            
            const layerObj = {
                label: originalLabel,
                color: designerColors[colorIndex++] || "Snowbound",
                path: layer.path || "",
                isBackground: false,
                isShadow: false,
                isWallPanel: false,
                tintWhite,
                inputId: `layer-${inputIndex++}`,
                patternLayerIndex: i
            };

            allLayers.push(layerObj);
            console.log(`    ✅ Added pattern layer: "${originalLabel}" (designer color ${colorIndex - 1})`);
            patternLabelIndex++;
        
    } else {
            // Shadow layers (no input needed)
            const layerObj = {
                label: `Shadow ${i + 1}`,
                color: null,
                path: layer.path || "",
                isBackground: false,
                isShadow: true,
                isWallPanel: false,
                tintWhite,
                inputId: null,
                patternLayerIndex: i
            };

            allLayers.push(layerObj);
            console.log(`    ✅ Added shadow layer: "Shadow ${i + 1}" (no color index used)`);
        }
    }

    console.log(`🏗️ Final layer model (used ${colorIndex} designer colors):`);
    allLayers.forEach((layer, index) => {
        const type = layer.isBackground ? 'bg' : layer.isShadow ? 'shadow' : 'layer';
        console.log(`  ${index}: ${layer.label} (${type}) = ${layer.color || 'no color'}`);
    });

    // VALIDATION: Check counts
    const inputLayers = allLayers.filter(l => !l.isShadow);
    console.log(`✅ Created ${inputLayers.length} input layers, used ${colorIndex} designer colors`);
    
    if (designerColors.length < colorIndex) {
        console.warn(`⚠️ Not enough designer colors: need ${colorIndex}, have ${designerColors.length}`);
    }

    // Add this at the very end of buildLayerModel(), just before the return statement
console.log(`🏗️ FINAL LAYER MODEL DEBUG:`);
console.log(`  Total layers created: ${allLayers.length}`);
console.log(`  isFurnitureCollection was: ${isFurnitureCollection}`);
console.log(`  Used ${colorIndex} designer colors`);
console.log(`  Final layer structure:`);
allLayers.forEach((layer, index) => {
    const type = layer.isBackground ? 'bg' : layer.isShadow ? 'shadow' : 'input';
    console.log(`    ${index}: "${layer.label}" (${type}) = "${layer.color}" | inputId: ${layer.inputId}`);
});


    return allLayers;
}





// ✅ Wrap in an IIFE to avoid illegal top-level return
if (appState.currentPattern) {
(() => {
  try {
    const pattern = appState.currentPattern;

    if (!pattern || !Array.isArray(pattern.layers)) {
      console.error("❌ Invalid pattern or missing layers:", pattern);
      return;
    }

    const designerColors = pattern.designer_colors || [];
    const curatedColors = appState.selectedCollection?.curatedColors || [];
    
    // Use curated colors as fallback if no designer colors
    const effectiveColors = designerColors.length > 0 ? designerColors : curatedColors;
    console.log("🎨 PATTERN LOAD COLOR FALLBACK:");
    console.log("  - Pattern:", pattern.name);
    console.log("  - designerColors:", designerColors.length, designerColors);
    console.log("  - curatedColors:", curatedColors.length, curatedColors);
    console.log("  - Using effectiveColors:", effectiveColors.length, effectiveColors);

    appState.currentLayers = buildLayerModel(
      pattern,
      effectiveColors,
      {
        isWallPanel: appState.selectedCollection?.name === "wall-panels",
        tintWhite: appState.tintWhite || false
      }
    );

    appState.layerInputs = appState.currentLayers.map(layer => {
      const layerData = createColorInput(
        layer.label,
        layer.inputId,
        layer.color,
        layer.isBackground
      );
      return {
        ...layerData,
        color: layer.color,
        hex: lookupColor(layer.color) || "#FFFFFF"
      };
    });

  } catch (e) {
    console.error("❌ Error populating layer inputs:", e);
  }
})();
}


// Hide all price elements on product pages - SAFE VERSION
function hidePriceElements() {
    const priceSelectors = [
        '[id^="price-"]',  // Only elements starting with "price-" 
        '.price:not([class*="colorFlex"]):not([id*="colorFlex"])',
        '.price--large', 
        '.price--small',
        '.price--on-sale',
        '.price--sold-out', 
        '.price-per-item',
        '.variant-item__old-price',
        '.price-per-item--current',
        '.product-price',
        '.product__price',
        '.card__price',
        '.money:not([class*="colorFlex"]):not([id*="colorFlex"])'
    ];
    
    const style = document.createElement('style');
    style.textContent = priceSelectors.map(selector => `${selector} { display: none !important; }`).join('\n');
    document.head.appendChild(style);
    
    console.log('💰 Price elements hidden (safe version)');
}

// Run price hiding when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hidePriceElements);
} else {
    hidePriceElements();
}

// 2. updatePreview
let updatePreview = async () => {

            console.log("🔍 updatePreview PATTERN DEBUG:");
        console.log("  currentPattern name:", appState.currentPattern?.name);
        console.log("  currentPattern layers:", appState.currentPattern?.layers?.map(l => l.path?.split('/').pop()));
        console.log("  isFurnitureMode:", appState.furnitureMode);
        console.log("  selectedCollection name:", appState.selectedCollection?.name);
        
        if (!dom.preview) return console.error("preview not found in DOM");


    try {
        if (!dom.preview) return console.error("preview not found in DOM");
        if (!appState.currentPattern) return console.error("No current pattern selected");

        console.log("🔍 updatePreview START");

        // Get responsive canvas size from CSS custom properties
        const computedStyle = getComputedStyle(document.documentElement);
        const previewSizeValue = computedStyle.getPropertyValue('--preview-size');
        const canvasSize = parseInt((previewSizeValue && typeof previewSizeValue === 'string') ? previewSizeValue.replace('px', '') : '700') || 700;
        console.log("📱 Canvas size from CSS:", canvasSize);

        const previewCanvas = document.createElement("canvas");
        const previewCtx = previewCanvas.getContext("2d", { willReadFrequently: true });
        previewCanvas.width = canvasSize;
        previewCanvas.height = canvasSize;

        // Check if this is a furniture collection
        const isFurnitureCollection = appState.selectedCollection?.wallMask != null;
        const layerMapping = getLayerMappingForPreview(isFurnitureCollection);
        console.log("🔍 SOFA BASE DEBUG:");
        console.log("  Layer mapping:", layerMapping);
        console.log("  backgroundIndex:", layerMapping.backgroundIndex);
        console.log("  Current layers length:", appState.currentLayers.length);

        


        
        console.log("🔍 Layer mapping:", layerMapping);
        console.log("🔍 Current layers:", appState.currentLayers.map((l, i) => `${i}: ${l.label} = ${l.color}`));

        let patternToRender = appState.currentPattern;
        let usesBotanicalLayers = false;

        // For furniture collections, try to find the botanical pattern
        if (isFurnitureCollection) {
            console.log("🌿 Furniture mode detected - looking for original pattern");
            
            // Try multiple ways to get the original pattern
            let originalPattern = null;
            
            // Method 1: Check if furniture pattern stores original
            if (appState.currentPattern.originalPattern) {
                originalPattern = appState.currentPattern.originalPattern;
                console.log("✅ Found original pattern via .originalPattern");
            }
            
            // Method 2: Look up by name in botanicals collection
            if (!originalPattern) {
                const botanicalCollection = appState.collections.find(c => c.name === "botanicals");
                if (botanicalCollection) {
                    // Remove any furniture prefixes from the name to find botanical pattern
                    const currentPatternName = appState.currentPattern.name;
                    const cleanPatternName = (currentPatternName && typeof currentPatternName === 'string') 
                        ? currentPatternName
                            .replace(/^.*\s+/, '') // Remove collection prefix
                            .replace(/\s+\w+\s+sofa$/i, '') // Remove furniture suffix
                        : '';
                    
                    originalPattern = botanicalCollection.patterns.find(p => 
                        p && typeof p.name === 'string' && cleanPatternName && (
                            p.name.toLowerCase() === cleanPatternName.toLowerCase() ||
                            (currentPatternName && typeof currentPatternName === 'string' && 
                             p.name.toLowerCase() === currentPatternName.toLowerCase())
                        )
                    );
                    
                    if (originalPattern) {
                        console.log("✅ Found original pattern by name lookup:", originalPattern.name);
                    }
                }
            }
            
            // Method 3: Use stored original collection
            if (!originalPattern && appState.originalCollection) {
                originalPattern = appState.originalCollection.patterns?.find(p => 
                    p.id === appState.currentPattern.id
                );
                
                if (originalPattern) {
                    console.log("✅ Found original pattern via originalCollection");
                }
            }
            
            if (originalPattern) {
                console.log("🌿 Using original pattern for preview:", originalPattern.name);
                console.log("  Original layers:", originalPattern.layers?.map(l => l.path.split('/').pop()));
                
                patternToRender = originalPattern;
                usesBotanicalLayers = true;
            } else {
                console.warn("⚠️ Could not find original pattern, using furniture pattern");
            }
        }


        // Get background color based on collection type
        let backgroundLayerIndex = layerMapping.backgroundIndex;
        let backgroundColor;

        if (isFurnitureCollection && usesBotanicalLayers) {
            // ✅ FIX: For furniture mode pattern preview, use the BG/Sofa Base color (index 1)
            // but this should be the same as the original background color
            backgroundColor = lookupColor(appState.currentLayers[1]?.color || "Snowbound");
            console.log(`🌿 Furniture mode pattern preview - using BG/Sofa Base color from input 1: ${backgroundColor}`);
        } else {
            // Standard mode or furniture room mockup
            const backgroundLayer = appState.currentLayers[backgroundLayerIndex];
            backgroundColor = lookupColor(backgroundLayer?.color || "Snowbound");
            console.log(`🎨 Standard background color from input ${backgroundLayerIndex}: ${backgroundColor}`);
        }        
        console.log(`🎨 Background color from input ${backgroundLayerIndex}: ${backgroundColor}`);

        // Clear canvas to transparent
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

        // Handle tint white patterns
        if (patternToRender.tintWhite && patternToRender.baseComposite) {
            console.log("🎨 Rendering tint white pattern");
            
            const baseImage = new Image();
            baseImage.crossOrigin = "Anonymous";
            baseImage.src = normalizePath(patternToRender.baseComposite);
            
            await new Promise((resolve, reject) => {
                baseImage.onload = () => {
                    const scaleMultiplier = appState.scaleMultiplier || 1;
                    const imgAspect = baseImage.width / baseImage.height;
                    const maxSize = canvasSize * scaleMultiplier;
                    
                    let drawWidth, drawHeight, offsetX, offsetY;
                    if (imgAspect > 1) {
                        drawWidth = Math.min(maxSize, canvasSize);
                        drawHeight = drawWidth / imgAspect;
                    } else {
                        drawHeight = Math.min(maxSize, canvasSize);
                        drawWidth = drawHeight * imgAspect;
                    }
                    
                    offsetX = (canvasSize - drawWidth) / 2;
                    offsetY = (canvasSize - drawHeight) / 2;
                    
                    previewCtx.fillStyle = backgroundColor;
                    previewCtx.fillRect(offsetX, offsetY, drawWidth, drawHeight);
                    previewCtx.drawImage(baseImage, offsetX, offsetY, drawWidth, drawHeight);
                    
                    // Apply tint to white areas
                    let imageData;
                    try {
                        imageData = previewCtx.getImageData(offsetX, offsetY, drawWidth, drawHeight);
                    } catch (e) {
                        console.warn("⚠️ Canvas tainted, skipping preview tinting:", e.message);
                        resolve();
                        return;
                    }
                    const data = imageData.data;
                    const wallColor = lookupColor(appState.currentLayers[0]?.color || "Snowbound");
                    const hex = wallColor.replace("#", "");
                    const rTint = parseInt(hex.substring(0, 2), 16);
                    const gTint = parseInt(hex.substring(2, 4), 16);
                    const bTint = parseInt(hex.substring(4, 6), 16);
                    
                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i], g = data[i + 1], b = data[i + 2];
                        if (r > 240 && g > 240 && b > 240) {
                            data[i] = rTint;
                            data[i + 1] = gTint;
                            data[i + 2] = bTint;
                        }
                    }
                    
                    previewCtx.putImageData(imageData, offsetX, offsetY);
                    resolve();
                };
                baseImage.onerror = reject;
            });
            
        } else if (patternToRender.layers?.length) {
            console.log("🎨 Rendering layered pattern");
            console.log("  Uses botanical layers:", usesBotanicalLayers);
            
            const firstLayer = patternToRender.layers.find(l => !l.isShadow);
            if (firstLayer) {
                const tempImg = new Image();
                tempImg.crossOrigin = "Anonymous";
                tempImg.src = normalizePath(firstLayer.path);
                
                await new Promise((resolve) => {
                    tempImg.onload = () => {
                        // Use pattern size metadata for aspect ratio when available
                        let patternAspect;
                        if (patternToRender.size && Array.isArray(patternToRender.size) && patternToRender.size.length >= 2) {
                            patternAspect = patternToRender.size[0] / patternToRender.size[1];
                            console.log(`📏 Using pattern metadata aspect ratio: ${patternToRender.size[0]}x${patternToRender.size[1]} = ${patternAspect.toFixed(3)}`);
                        } else {
                            patternAspect = tempImg.width / tempImg.height;
                            console.log(`📏 Using layer image aspect ratio: ${tempImg.width}x${tempImg.height} = ${patternAspect.toFixed(3)}`);
                        }
                        const scaleMultiplier = appState.scaleMultiplier || 1;
                        
                        let patternDisplayWidth, patternDisplayHeight;
                        const baseSize = canvasSize;
                        
                        if (patternAspect > 1) {
                            patternDisplayWidth = Math.min(baseSize, canvasSize);
                            patternDisplayHeight = patternDisplayWidth / patternAspect;
                        } else {
                            patternDisplayHeight = Math.min(baseSize, canvasSize);
                            patternDisplayWidth = patternDisplayHeight * patternAspect;
                        }
                        
                        const offsetX = (canvasSize - patternDisplayWidth) / 2;
                        const offsetY = (canvasSize - patternDisplayHeight) / 2;
                        
                        previewCtx.fillStyle = backgroundColor;
                        previewCtx.fillRect(offsetX, offsetY, patternDisplayWidth, patternDisplayHeight);
                        
                        console.log(`🎨 Pattern area: ${patternDisplayWidth.toFixed(0)}x${patternDisplayHeight.toFixed(0)}`);
                        
                        resolve({ offsetX, offsetY, patternDisplayWidth, patternDisplayHeight, scaleMultiplier });
                    };
                    tempImg.onerror = () => resolve(null);
                }).then(async (patternBounds) => {
                    if (!patternBounds) return;
                    
                    // Render each layer with correct color mapping
                    for (let layerIndex = 0; layerIndex < patternToRender.layers.length; layerIndex++) {
                        const layer = patternToRender.layers[layerIndex];
                        const isShadow = layer.isShadow === true;
                        
                        let layerColor = null;
                        if (!isShadow) {
                            if (usesBotanicalLayers) {
    // ✅ FIX: Map botanical layer to furniture input correctly
    const furnitureInputIndex = layerMapping.patternStartIndex + layerIndex;
    layerColor = lookupColor(appState.currentLayers[furnitureInputIndex]?.color || "Snowbound");
    
    // ✅ DEBUG: Show the mapping
    const inputLayer = appState.currentLayers[furnitureInputIndex];
    console.log(`🌿 Botanical layer ${layerIndex} → furniture input ${furnitureInputIndex} (${inputLayer?.label}) → ${layerColor}`);

                            } else {
                                // Standard mapping
                                const inputIndex = layerMapping.patternStartIndex + layerIndex;
                                layerColor = lookupColor(appState.currentLayers[inputIndex]?.color || "Snowbound");
                                console.log(`🏠 Standard layer ${layerIndex} → input ${inputIndex} → ${layerColor}`);
                            }
                        }

                        await new Promise((resolve) => {
                            processImage(layer.path, (processedCanvas) => {
                                if (!(processedCanvas instanceof HTMLCanvasElement)) {
                                    return resolve();
                                }

                                // Fix for non-square patterns: calculate scale based on aspect ratio
                                const patternAspect = processedCanvas.width / processedCanvas.height;
                                const displayAspect = patternBounds.patternDisplayWidth / patternBounds.patternDisplayHeight;
                                
                                let baseScale;
                                if (patternAspect > displayAspect) {
                                    // Pattern is wider than display area - scale to fit width
                                    baseScale = patternBounds.patternDisplayWidth / processedCanvas.width;
                                } else {
                                    // Pattern is taller than display area - scale to fit height  
                                    baseScale = patternBounds.patternDisplayHeight / processedCanvas.height;
                                }
                                
                                const finalScale = baseScale * patternBounds.scaleMultiplier;
                                const tileWidth = processedCanvas.width * finalScale;
                                const tileHeight = processedCanvas.height * finalScale;

                                const tilingType = patternToRender.tilingType || "";
                                const isHalfDrop = tilingType === "half-drop";

                                previewCtx.save();
                                previewCtx.beginPath();
                                previewCtx.rect(
                                    patternBounds.offsetX, 
                                    patternBounds.offsetY, 
                                    patternBounds.patternDisplayWidth, 
                                    patternBounds.patternDisplayHeight
                                );
                                previewCtx.clip();

                                previewCtx.globalCompositeOperation = isShadow ? "multiply" : "source-over";
                                previewCtx.globalAlpha = isShadow ? 0.3 : 1.0;
                                
                                const startX = patternBounds.offsetX;
                                const startY = patternBounds.offsetY;
                                const endX = patternBounds.offsetX + patternBounds.patternDisplayWidth + tileWidth;
                                const endY = patternBounds.offsetY + patternBounds.patternDisplayHeight + tileHeight;
                                
                                for (let x = startX; x < endX; x += tileWidth) {
                                    const isOddColumn = Math.floor((x - startX) / tileWidth) % 2 !== 0;
                                    const yOffset = isHalfDrop && isOddColumn ? tileHeight / 2 : 0;
                                    
                                    for (let y = startY - tileHeight + yOffset; y < endY; y += tileHeight) {
                                        previewCtx.drawImage(processedCanvas, x, y, tileWidth, tileHeight);
                                    }
                                }
                                
                                previewCtx.restore();
                                console.log(`✅ Rendered layer ${layerIndex} with color ${layerColor}`);
                                resolve();
                            }, layerColor, 2.2, isShadow, false, false);
                        });
                    }
                });
            }
        } else {
            // 🔧 NEW: Handle standard patterns (colorFlex: false, no layers)
            console.log("📋 Rendering standard pattern (no layers)");
            if (appState.currentPattern.thumbnail) {
                const thumbnailImg = new Image();
                thumbnailImg.crossOrigin = "Anonymous";
                const thumbnailSrc = normalizePath(appState.currentPattern.thumbnail);
                
                await new Promise((resolve) => {
                    thumbnailImg.onload = () => {
                        console.log(`✅ Standard pattern thumbnail loaded: ${thumbnailSrc}`);
                        
                        // Calculate size to fit canvas while maintaining aspect ratio
                        const imgAspect = thumbnailImg.width / thumbnailImg.height;
                        let drawWidth, drawHeight, offsetX, offsetY;
                        
                        if (imgAspect > 1) {
                            drawWidth = canvasSize;
                            drawHeight = canvasSize / imgAspect;
                            offsetX = 0;
                            offsetY = (canvasSize - drawHeight) / 2;
                        } else {
                            drawHeight = canvasSize;
                            drawWidth = canvasSize * imgAspect;
                            offsetX = (canvasSize - drawWidth) / 2;
                            offsetY = 0;
                        }
                        
                        // Draw standard pattern thumbnail
                        previewCtx.clearRect(0, 0, canvasSize, canvasSize);
                        previewCtx.drawImage(thumbnailImg, offsetX, offsetY, drawWidth, drawHeight);
                        
                        console.log("✅ Standard pattern rendered in preview");
                        resolve();
                    };
                    
                    thumbnailImg.onerror = () => {
                        console.error(`❌ Failed to load standard pattern thumbnail: ${thumbnailSrc}`);
                        resolve(); // Continue anyway
                    };
                    
                    thumbnailImg.src = thumbnailSrc;
                });
            } else {
                console.warn("⚠️ Standard pattern has no thumbnail to display");
            }
        }

        // Update DOM
        dom.preview.innerHTML = "";
        dom.preview.appendChild(previewCanvas);
        dom.preview.style.width = `${canvasSize}px`;
        dom.preview.style.height = `${canvasSize}px`;
        dom.preview.style.backgroundColor = "rgba(17, 24, 39, 1)";

        if (patternToRender.name) {
            dom.patternName.textContent = toInitialCaps(appState.currentPattern.name); // Keep original name
        }
        
        console.log("✅ Pattern preview rendered");
        
    } catch (err) {
        console.error("updatePreview error:", err);
    }
};



// Utility: Promisified image loader
function loadImage(src) {
    return new Promise((resolve, reject) => {
        if (!src) {
            console.error("❌ loadImage: No src provided");
            reject(new Error("No image source provided"));
            return;
        }
        
        // Normalize the path to fix ./data/ vs data/ inconsistencies
        const normalizedSrc = normalizePath(src);
        console.log(`📥 Loading image: ${src} -> ${normalizedSrc}`);
        const img = new Image();
        img.crossOrigin = "Anonymous";
        
        img.onload = () => {
            console.log(`✅ Image loaded successfully: ${normalizedSrc} (${img.naturalWidth}x${img.naturalHeight})`);
            resolve(img);
        };
        
        img.onerror = (error) => {
            console.error(`❌ Failed to load image: ${normalizedSrc}`);
            console.error("❌ Error details:", error);
            reject(new Error(`Failed to load image: ${normalizedSrc}`));
        };
        
        img.src = normalizedSrc;
    });
}

    
//  room mockup
let updateRoomMockup = async () => {
    try {
        if (!dom.roomMockup) {
            console.error("roomMockup element not found in DOM");
            return;
        }

        if (!appState.selectedCollection || !appState.currentPattern) {
            console.log("🔍 Skipping updateRoomMockup - no collection/pattern selected");
            return;
        }

        // Check if this is a furniture collection
        const isFurnitureCollection = appState.selectedCollection.wallMask != null;
        
        if (isFurnitureCollection) {
        console.log("🪑 Rendering furniture preview");
        updateFurniturePreview();
        return;
        }



        const isWallPanel = appState.selectedCollection?.name === "wall-panels";

        // 🔍 ADD THIS DEBUG HERE:
        console.log("🔍 CURRENT LAYERS MAPPING (Room Mockup):");
        appState.currentLayers.forEach((layer, index) => {
            console.log(`  ${index}: ${layer.label} = ${layer.color} (isShadow: ${layer.isShadow})`);
        });


        // 🔍 DEBUG: Check what path we're taking
        console.log("🔍 DEBUG START updateRoomMockup");
        console.log("🔍 isWallPanel:", isWallPanel);
        console.log("🔍 selectedCollection name:", appState.selectedCollection?.name);
        console.log("🔍 currentPattern.isWallPanel:", appState.currentPattern?.isWallPanel);
        console.log("🔍 currentPattern has layers:", !!appState.currentPattern?.layers?.length);
        console.log("🔍 currentPattern has tintWhite:", !!appState.currentPattern?.tintWhite);

        
        // Get colors from correct layer indices
        const wallColor = isWallPanel ? 
            lookupColor(appState.currentLayers[0]?.color || "Snowbound") : 
            lookupColor(appState.currentLayers[0]?.color || "Snowbound");
        const backgroundColor = isWallPanel ? 
            lookupColor(appState.currentLayers[1]?.color || "Snowbound") :
            lookupColor(appState.currentLayers[0]?.color || "Snowbound");
        
        console.log(">>> Wall color:", wallColor, "Background color:", backgroundColor);

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 600;
        canvas.height = 450;
        console.log(`🎨 Room mockup canvas created: ${canvas.width}x${canvas.height}`);

        const processOverlay = async () => {
            console.log("🔍 processOverlay() START - TRACE VERSION 2025-08-22 12:45 ACTIVE");
            // Fill wall color
            ctx.fillStyle = wallColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            console.log("🔍 Wall color filled");
            
            // 🔧 TRACE: Check standard pattern conditions
            console.log("🔍 TRACE START - Standard pattern check");
            console.log("🔍 TRACE appState.currentPattern exists:", !!appState.currentPattern);
            if (appState.currentPattern) {
                console.log("🔍 TRACE pattern name:", appState.currentPattern.name);
                console.log("🔍 TRACE pattern layers:", appState.currentPattern.layers);
                console.log("🔍 TRACE layers length:", appState.currentPattern.layers?.length);
                console.log("🔍 TRACE condition result:", !appState.currentPattern.layers || appState.currentPattern.layers.length === 0);
            }
            
            // 🔧 Handle standard patterns (no layers) - tile them right after wall color
            if (appState.currentPattern && (!appState.currentPattern.layers || appState.currentPattern.layers.length === 0)) {
                console.log("🔍 TRACE CONDITION MATCHED - Processing standard pattern:", appState.currentPattern.name);
                
                if (appState.currentPattern.thumbnail) {
                    const thumbnailImg = new Image();
                    thumbnailImg.crossOrigin = "Anonymous";
                    const thumbnailSrc = normalizePath(appState.currentPattern.thumbnail);
                    
                    await new Promise((resolve) => {
                        thumbnailImg.onload = () => {
                            console.log(`✅ Standard pattern loaded: ${thumbnailSrc}`);
                            
                            // Tile the thumbnail over the wall color
                            const scale = (appState.currentScale / 100 || 1) * (appState.scaleMultiplier || 1);
                            const tileWidth = thumbnailImg.width * scale * 0.5; // Make smaller for room view
                            const tileHeight = thumbnailImg.height * scale * 0.5;
                            
                            console.log(`🔍 Tiling: ${tileWidth.toFixed(1)}x${tileHeight.toFixed(1)} tiles`);
                            
                            for (let x = 0; x < canvas.width; x += tileWidth) {
                                for (let y = 0; y < canvas.height; y += tileHeight) {
                                    ctx.drawImage(thumbnailImg, x, y, tileWidth, tileHeight);
                                }
                            }
                            
                            console.log("✅ Standard pattern tiled in room mockup");
                            resolve();
                        };
                        
                        thumbnailImg.onerror = () => {
                            console.error(`❌ Failed to load: ${thumbnailSrc}`);
                            resolve(); // Continue anyway
                        };
                        
                        thumbnailImg.src = thumbnailSrc;
                    });
                }
            }

            if (isWallPanel && appState.currentPattern?.layers?.length) {
                    console.log("🔍 TAKING PATH: Wall panel processing");

                // Handle wall panel rendering
                const panelWidthInches = appState.currentPattern.size[0] || 24;
                const panelHeightInches = appState.currentPattern.size[1] || 36;
                const scale = Math.min(canvas.width / 100, canvas.height / 80) * (appState.scaleMultiplier || 1);
                
                const panelWidth = panelWidthInches * scale;
                const panelHeight = panelHeightInches * scale;
                
                const layout = appState.currentPattern.layout || "3,20";
                const [numPanelsStr, spacingStr] = layout.split(",");
                const numPanels = parseInt(numPanelsStr, 10) || 3;
                const spacing = parseInt(spacingStr, 10) || 20;
                
                const totalWidth = (numPanels * panelWidth) + ((numPanels - 1) * spacing);
                const startX = (canvas.width - totalWidth) / 2;
                const startY = (canvas.height - panelHeight) / 2 - (appState.currentPattern?.verticalOffset || 50);

                // Create panel canvas
                const panelCanvas = document.createElement("canvas");
                panelCanvas.width = panelWidth;
                panelCanvas.height = panelHeight;
                const panelCtx = panelCanvas.getContext("2d");

                // Process panel layers - find input layers only
let currentLayerIndex = 0;
const inputLayers = appState.currentLayers.filter(layer => !layer.isShadow);
let inputLayerIndex = 0;

for (let i = 0; i < appState.currentPattern.layers.length; i++) {
    const layer = appState.currentPattern.layers[i];
    const isShadow = layer.isShadow === true;
    
    let layerColor = null;
    if (!isShadow) {
        const inputLayer = inputLayers[inputLayerIndex + 1]; // Skip background
        layerColor = lookupColor(inputLayer?.color || "Snowbound");
        inputLayerIndex++;
        console.log(`🎨 Regular layer ${i}: using color ${layerColor} from inputLayer[${inputLayerIndex}]`);
    } else {
        console.log(`🌑 Shadow layer ${i}: path=${layer.path}`);
    }

    const tilingType = appState.currentPattern.tilingType || "";
    const isHalfDrop = tilingType === "half-drop";
    console.log(`🔄 ROOM MOCKUP Tiling type: ${tilingType}, Half-drop: ${isHalfDrop}`);

    await new Promise((resolve) => {
        console.log(`🧪 Calling processImage for layer ${i}:`, {
            path: layer.path,
            color: layerColor,
            isShadow,
        });

        processImage(layer.path, (processedCanvas) => {
            console.log(`🎯 processImage callback fired for layer ${i}`, processedCanvas);

            if (processedCanvas instanceof HTMLCanvasElement) {
                const scale = (appState.currentScale / 100 || 1) * (appState.scaleMultiplier || 1);
                const tileWidth = processedCanvas.width * scale;
                const tileHeight = processedCanvas.height * scale;

                patternCtx.globalCompositeOperation = isShadow ? "multiply" : "source-over";
                patternCtx.globalAlpha = isShadow ? 0.3 : 1.0;

                for (let x = -tileWidth; x < canvas.width + tileWidth; x += tileWidth) {
                    const isOddColumn = Math.floor((x + tileWidth) / tileWidth) % 2 !== 0;
                    const yOffset = isHalfDrop && isOddColumn ? tileHeight / 2 : 0;
                    for (let y = -tileHeight + yOffset; y < canvas.height + tileHeight; y += tileHeight) {
                        patternCtx.drawImage(processedCanvas, x, y, tileWidth, tileHeight);
                    }
                }
                console.log(`✅ Regular layer ${i} rendered with color ${layerColor}`);
            } else {
                console.warn(`⚠️ processImage returned non-canvas for layer ${i}`);
            }

            resolve();
        }, layerColor, 2.2, isShadow, false, false);
    });
}

console.log("✅ All layers looped and processed, drawing patternCanvas to main ctx");
ctx.drawImage(patternCanvas, 0, 0);
console.log("🖼️ Pattern canvas rendered to main canvas");
                    

                // Draw panels
                for (let i = 0; i < numPanels; i++) {
                    const x = startX + (i * (panelWidth + spacing));
                    ctx.fillStyle = backgroundColor;
                    ctx.fillRect(x, startY, panelWidth, panelHeight);
                    ctx.drawImage(panelCanvas, x, startY, panelWidth, panelHeight);
                }
            } else {
                    console.log("🔍 TAKING PATH: Regular pattern processing");
                    console.log("🔍 appState.currentPattern:", appState.currentPattern);
                    console.log("🔍 appState.currentPattern.layers:", appState.currentPattern?.layers);

                // Handle regular pattern rendering
                const patternCanvas = document.createElement("canvas");
                patternCanvas.width = canvas.width;
                patternCanvas.height = canvas.height;
                const patternCtx = patternCanvas.getContext("2d");
                
                // 🔧 DEBUG: Check which condition path is taken
                console.log("🔍 ROOM MOCKUP CONDITION DEBUG:");
                console.log("  - tintWhite:", appState.currentPattern?.tintWhite);
                console.log("  - baseComposite:", !!appState.currentPattern?.baseComposite);
                console.log("  - layers.length:", appState.currentPattern?.layers?.length);
                console.log("  - layers.length truthy:", !!appState.currentPattern?.layers?.length);
                console.log("  - isWallPanel:", isWallPanel);
                console.log("  - condition1 (tintWhite && baseComposite):", !!(appState.currentPattern?.tintWhite && appState.currentPattern?.baseComposite));
                console.log("  - condition2 (layers.length && !isWallPanel):", !!(appState.currentPattern?.layers?.length && !isWallPanel));
                
                if (appState.currentPattern?.tintWhite && appState.currentPattern?.baseComposite) {
                            console.log("🔍 TAKING SUBPATH: Tint white");

                    // Handle tint white in room mockup
                    const baseImage = new Image();
                    baseImage.crossOrigin = "Anonymous";
                    baseImage.src = normalizePath(appState.currentPattern.baseComposite);
                    
                    await new Promise((resolve) => {
                        baseImage.onload = () => {
                            const scale = (appState.currentScale / 100 || 1) * (appState.scaleMultiplier || 1);
                            const tileWidth = baseImage.width * scale;
                            const tileHeight = baseImage.height * scale;
                            
                            // Tile pattern
                            for (let x = -tileWidth; x < canvas.width + tileWidth; x += tileWidth) {
                                for (let y = -tileHeight; y < canvas.height + tileHeight; y += tileHeight) {
                                    patternCtx.drawImage(baseImage, x, y, tileWidth, tileHeight);
                                }
                            }
                            
                            // Apply tint (with CORS protection)
                            let imageData;
                            try {
                                imageData = patternCtx.getImageData(0, 0, canvas.width, canvas.height);
                            } catch (e) {
                                console.warn("⚠️ Canvas tainted, skipping tint white effect:", e.message);
                                ctx.drawImage(patternCanvas, 0, 0);
                                return;
                            }
                            const data = imageData.data;
                            const hex = wallColor.replace("#", "");
                            const rTint = parseInt(hex.substring(0, 2), 16);
                            const gTint = parseInt(hex.substring(2, 4), 16);
                            const bTint = parseInt(hex.substring(4, 6), 16);
                            
                            for (let i = 0; i < data.length; i += 4) {
                                const r = data[i], g = data[i + 1], b = data[i + 2];
                                if (r > 240 && g > 240 && b > 240) {
                                    data[i] = rTint;
                                    data[i + 1] = gTint;
                                    data[i + 2] = bTint;
                                }
                            }
                            
                            patternCtx.putImageData(imageData, 0, 0);
                            ctx.drawImage(patternCanvas, 0, 0);
                            resolve();
                        };
                        baseImage.onerror = resolve;
                    });
                } else if (appState.currentPattern?.layers?.length && !isWallPanel) {
                                console.log("🔍 TAKING SUBPATH: Regular layers");

                    // Handle regular layered patterns - FIXED indexing
                    let currentLayerIndex = 0; // Start from first non-shadow layer
                    
                    const inputLayers = appState.currentLayers.filter(layer => !layer.isShadow);
                    let inputLayerIndex = 0;

                    for (let i = 0; i < appState.currentPattern.layers.length; i++) {
                        const layer = appState.currentPattern.layers[i];
                        const isShadow = layer.isShadow === true;
                        
                        let layerColor = null;
                        if (!isShadow) {
                            const inputLayer = inputLayers[inputLayerIndex + 1]; // Skip background
                            layerColor = lookupColor(inputLayer?.color || "Snowbound");
                            inputLayerIndex++; // Increment here
                        }

                    // Check for half-drop tiling (declare once, outside)
                    const tilingType = appState.currentPattern.tilingType || "";
                    const isHalfDrop = tilingType === "half-drop";
                    console.log(`🔄 ROOM MOCKUP Tiling type: ${tilingType}, Half-drop: ${isHalfDrop}`);

                    await new Promise((resolve) => {
                        processImage(layer.path, (processedCanvas) => {
                            if (processedCanvas instanceof HTMLCanvasElement) {
                                const scale = (appState.currentScale / 100 || 1) * (appState.scaleMultiplier || 1);
                                const tileWidth = processedCanvas.width * scale;
                                const tileHeight = processedCanvas.height * scale;
                                
                                patternCtx.globalCompositeOperation = isShadow ? "multiply" : "source-over";
                                patternCtx.globalAlpha = isShadow ? 0.3 : 1.0;
                                
                                for (let x = -tileWidth; x < canvas.width + tileWidth; x += tileWidth) {
                                    const isOddColumn = Math.floor((x + tileWidth) / tileWidth) % 2 !== 0;
                                    const yOffset = isHalfDrop && isOddColumn ? tileHeight / 2 : 0;
                                    console.log(`🔄 Column at x=${x}, isOdd=${isOddColumn}, yOffset=${yOffset}`);
                                    
                                    for (let y = -tileHeight + yOffset; y < canvas.height + tileHeight; y += tileHeight) {
                                        patternCtx.drawImage(processedCanvas, x, y, tileWidth, tileHeight);
                                    }
                                }
                                console.log(`✅ Regular layer ${i} rendered with color ${layerColor}`);
                            }
                            resolve();
                        }, layerColor, 2.2, isShadow, false, false);
                    });
                        
                    }
                    
                    ctx.drawImage(patternCanvas, 0, 0);
                    console.log("🔍 Pattern canvas drawn to main canvas");
                }
            }
            
            
            console.log("🔍 Finished pattern processing, moving to collection mockup check");

            console.log("🔍 Full selectedCollection:", Object.keys(appState.selectedCollection));
            console.log("🔍 selectedCollection object:", appState.selectedCollection);
            console.log("🔍 selectedCollection.mockup:", appState.selectedCollection?.mockup);
            console.log("🔍 selectedCollection.mockupShadow:", appState.selectedCollection?.mockupShadow);


            // Apply mockup overlay if exists
            if (appState.selectedCollection?.mockup) {
                const originalPath = appState.selectedCollection.mockup;
                const normalizedPath = normalizePath(originalPath);
                console.log(`🏠 Loading collection mockup:`);
                console.log(`  Original: ${originalPath}`);
                console.log(`  Normalized: ${normalizedPath}`);
                const mockupImage = new Image();
                mockupImage.crossOrigin = "Anonymous";
                mockupImage.src = normalizedPath;
                
                await new Promise((resolve) => {
                    mockupImage.onload = () => {
                        console.log(`✅ Collection mockup loaded: ${mockupImage.width}x${mockupImage.height}`);
                        const fit = scaleToFit(mockupImage, canvas.width, canvas.height);
                        ctx.drawImage(mockupImage, fit.x, fit.y, fit.width, fit.height);
                        console.log(`📐 Mockup drawn at: ${fit.x}, ${fit.y}, ${fit.width}x${fit.height}`);
                        
                        console.log("🔍 selectedCollection:", appState.selectedCollection?.name);
                        console.log("🔍 selectedCollection.elements:", appState.selectedCollection?.elements);
                        resolve();
                    };
                    mockupImage.onerror = (e) => {
                        console.error(`❌ Failed to load collection mockup: ${normalizedPath}`, e);
                        console.error(`❌ Actual URL that failed: ${mockupImage.src}`);
                        resolve();
                    };
                });
            }

            // Apply shadow overlay if exists
            if (appState.selectedCollection?.mockupShadow) {
                const shadowOriginalPath = appState.selectedCollection.mockupShadow;
                const shadowNormalizedPath = normalizePath(shadowOriginalPath);
                console.log(`🌫️ Loading collection shadow:`);
                console.log(`  Original: ${shadowOriginalPath}`);
                console.log(`  Normalized: ${shadowNormalizedPath}`);
                const shadowOverlay = new Image();
                shadowOverlay.crossOrigin = "Anonymous";
                shadowOverlay.src = shadowNormalizedPath;
                
                await new Promise((resolve) => {
                    shadowOverlay.onload = () => {
                        console.log(`✅ Collection shadow loaded: ${shadowOverlay.width}x${shadowOverlay.height}`);
                        ctx.globalCompositeOperation = "multiply";
                        const fit = scaleToFit(shadowOverlay, canvas.width, canvas.height);
                        ctx.drawImage(shadowOverlay, fit.x, fit.y, fit.width, fit.height);
                        console.log(`🌫️ Shadow drawn at: ${fit.x}, ${fit.y}, ${fit.width}x${fit.height}`);
                        ctx.globalCompositeOperation = "source-over";
                        resolve();
                    };
                    shadowOverlay.onerror = (e) => {
                        console.error(`❌ Failed to load shadow overlay: ${shadowNormalizedPath}`, e);
                        console.error(`❌ Actual shadow URL that failed: ${shadowOverlay.src}`);
                        resolve();
                    };
                });
            } else {
                console.warn("⚠️ No mockup found for collection:", appState.selectedCollection?.name);
                console.log("🔍 Available collection properties:", Object.keys(appState.selectedCollection || {}));
            }


            // Render final canvas with CORS error handling
            let dataUrl;
            try {
                dataUrl = canvas.toDataURL("image/png");
                console.log("✅ Room mockup canvas exported successfully");
            } catch (e) {
                if (e.name === 'SecurityError') {
                    console.log("🛡️ Room mockup CORS error - using canvas directly in DOM");
                    // Instead of using dataURL, append the canvas directly
                    canvas.style.cssText = "width: 100%; height: 100%; object-fit: contain; border: 1px solid #333;";
                    dom.roomMockup.innerHTML = "";
                    dom.roomMockup.appendChild(canvas);
                    console.log("✅ Room mockup canvas appended directly to DOM");
                    ensureButtonsAfterUpdate();
                    // Reset all styling including background from fabric mode
                    dom.roomMockup.style.cssText = "width: 600px; height: 450px; position: relative; background-image: none; background-color: #434341;";
                    return; // Exit early, don't create img element
                }
                throw e; // Re-throw non-CORS errors

                try {
                    const pixel = ctx.getImageData(10, 10, 1, 1).data;
                    console.log("🎯 Sampled pixel at (10,10):", pixel);
                    } catch (e) {
                    console.warn("⚠️ Pixel read failed:", e);
                }
            }
            
            const img = document.createElement("img");
            img.src = dataUrl;
            img.style.cssText = "width: 100%; height: 100%; object-fit: contain; border: 1px solid #333;";
            
            img.onload = () => {
                console.log("✅ Room mockup image loaded successfully");
            };
            img.onerror = (e) => {
                console.error("❌ Room mockup image failed to load:", e);
            };
            
            dom.roomMockup.innerHTML = "";
            dom.roomMockup.appendChild(img);
            console.log("✅ Room mockup image appended to DOM");
            ensureButtonsAfterUpdate();
            dom.roomMockup.style.cssText = "width: 600px; height: 450px; position: relative; background: #434341;";
        };

        await processOverlay().catch(error => {
            console.error("Error processing room mockup:", error);
        });

    } catch (e) {
        console.error('Error in updateRoomMockup:', e);
    }
};
// GUARD / TRACE WRAPPER
if (USE_GUARD && DEBUG_TRACE) {
updateRoomMockup = guard(traceWrapper(updateRoomMockup, "updateRoomMockup")); // Wrapped for debugging
} else if (USE_GUARD) {
    updateRoomMockup = guard(updateRoomMockup, "updateRoomMockup"); // Wrapped for debugging
}

const updateFurniturePreview = async () => {
// Add this at the start of updateFurniturePreview()
const layerMapping = getLayerMappingForPreview(true);
console.log("🔍 LAYER MAPPING DEBUG IN FURNITURE PREVIEW:");
console.log("  wallIndex:", layerMapping.wallIndex);
console.log("  backgroundIndex:", layerMapping.backgroundIndex);  
console.log("  patternStartIndex:", layerMapping.patternStartIndex);
console.log("  Expected: wallIndex=0, backgroundIndex=1, patternStartIndex=2");

    try {
        console.log("🛋️ =========================");
        console.log("🛋️ Starting furniture preview");
        console.log("🛋️ =========================");

            const frozenZoomState = {
            scale: furnitureViewSettings.scale,
            offsetX: furnitureViewSettings.offsetX,
            offsetY: furnitureViewSettings.offsetY,
            isZoomed: furnitureViewSettings.isZoomed,
            timestamp: Date.now()
        };
        
        console.log("🔒 FROZEN zoom state for all layers:", frozenZoomState);

        
        // 🔍 ADD THIS DEBUG LINE:
        console.log("🔍 ENTRY POINT - Current furnitureViewSettings:", JSON.stringify(furnitureViewSettings, null, 2));
        
        // ✅ PRESERVE ZOOM SETTINGS ONCE AT THE START
        const preservedSettings = {
            scale: furnitureViewSettings.scale,
            offsetX: furnitureViewSettings.offsetX,
            offsetY: furnitureViewSettings.offsetY,
            isZoomed: furnitureViewSettings.isZoomed
        };

        
        console.log("🔒 Preserved zoom settings:", preservedSettings);

        // Basic validation
        if (!dom.roomMockup) {
            console.error("❌ roomMockup element not found in DOM");
            return;
        }

        if (!appState.currentPattern) {
            console.error("❌ No current pattern selected");
            return;
        }

        // Ensure furniture config is loaded
        if (!furnitureConfig) {
            console.log("🔄 Loading furniture config...");
            await loadFurnitureConfig();
        }

        if (!furnitureConfig) {
            console.error("❌ furnitureConfig still not loaded after attempt");
            return;
        }

        // Setup canvas
        const canvas = document.createElement("canvas");
        canvas.width = 600;
        canvas.height = 450;
        const ctx = canvas.getContext("2d");

        // Get collection and pattern data
        const collection = appState.selectedCollection;
        const pattern = appState.currentPattern;
        const furnitureType = collection?.furnitureType || 'sofa-capitol';
        const furniture = furnitureConfig?.[furnitureType];

        // Debug furniture config
        console.log("🔍 FURNITURE CONFIG DEBUG:");
        console.log("  Collection name:", collection?.name);
        console.log("  Furniture type:", furnitureType);
        console.log("  Available furniture configs:", Object.keys(furnitureConfig || {}));
        console.log("  Selected furniture config exists:", !!furniture);

        if (!furniture) {
            console.error("❌ No furniture config found for:", furnitureType);
            console.log("Available configs:", Object.keys(furnitureConfig));
            return;
        }

        // Debug furniture paths
        console.log("🔍 FURNITURE PATHS DEBUG:");
        console.log("  Mockup path:", furniture.mockup);
        console.log("  Wall mask path:", furniture.wallMask);
        console.log("  Base path:", furniture.base);
        console.log("  Extras path:", furniture.extras);

        // Test if files exist
        const testPaths = [
            { name: "mockup", path: furniture.mockup },
            { name: "wallMask", path: furniture.wallMask },
            { name: "base", path: furniture.base },
            { name: "extras", path: furniture.extras }
        ];

        console.log("🔍 TESTING FILE EXISTENCE:");
        testPaths.forEach(({ name, path }) => {
            if (path) {
                const testImg = new Image();
                testImg.onload = () => console.log(`✅ ${name} file exists: ${path}`);
                testImg.onerror = () => console.log(`❌ ${name} file MISSING: ${path}`);
                testImg.src = normalizePath(path);
            } else {
                console.log(`⚠️ ${name} path not defined in config`);
            }
        });

        // Get layer mapping for furniture collection
        const layerMapping = getLayerMappingForPreview(true); // Always true for furniture
        console.log("🔍 LAYER MAPPING DEBUG:");
        console.log("  Layer mapping:", layerMapping);
        console.log("  Total current layers:", appState.currentLayers.length);

        // Debug current layer assignments
        console.log("🔍 CURRENT LAYER ASSIGNMENTS:");
        appState.currentLayers.forEach((layer, index) => {
            let usage = "unused";
            if (index === layerMapping.wallIndex) usage = "wall color";
            else if (index === layerMapping.backgroundIndex) usage = "sofa base color";
            else if (index >= layerMapping.patternStartIndex) usage = `pattern layer ${index - layerMapping.patternStartIndex}`;
            
            console.log(`  ${index}: ${layer.label} = "${layer.color}" (${usage})`);
        });

        // Clear canvas with white background
        ctx.fillStyle = "transparent";
        ctx.fillRect(0, 0, 600, 450);
        console.log("🧹 Canvas cleared with white background");
        ctx.clearRect(0, 0, 600, 450);
        ctx.fillStyle = "#F5F5F5";
        ctx.fillRect(0, 0, 600, 450);



        // ❌ REMOVED: The problematic settings update that was resetting zoom
        // NO LONGER UPDATING furnitureViewSettings here - using preserved settings

        console.log("🔍 FURNITURE VIEW SETTINGS:");
        console.log("  Scale:", furnitureViewSettings.scale);
        console.log("  Offset X:", furnitureViewSettings.offsetX);
        console.log("  Offset Y:", furnitureViewSettings.offsetY);

        try {
        console.log("🏗️ =========================");
        console.log("🏗️ FURNITURE RENDERING SEQUENCE (WITH WALL MASK)");
        console.log("🏗️ =========================");
        
        // ===== STEP 1: Draw room mockup base =====
        console.log("1️⃣ Drawing mockup base (room scene)");
        const mockupPath = furniture.mockup;
        if (mockupPath) {
            console.log("  Mockup path:", mockupPath);
            await drawFurnitureLayer(ctx, mockupPath).catch(err => {
                console.error("❌ Failed to load mockup:", err);
                zoomState: frozenZoomState
                ctx.fillStyle = "#E5E7EB";
                ctx.fillRect(0, 0, 600, 450);
                console.log("🔄 Drew fallback background due to mockup failure");
            });
            console.log("✅ Room mockup base drawn");
        } else {
            console.error("❌ No mockup path in furniture config");
            ctx.fillStyle = "#E5E7EB";
            ctx.fillRect(0, 0, 600, 450);
        }
        
        // ===== STEP 2: Draw wall color using wall mask =====
        console.log("2️⃣ Drawing wall color via mask");
        const wallColor = resolveColor(appState.currentLayers[layerMapping.wallIndex]?.color || "Snowbound");
        console.log(`  Wall color from input ${layerMapping.wallIndex}: ${wallColor}`);
        
        if (furniture.wallMask) {
            console.log("  Wall mask path:", furniture.wallMask);
            await drawFurnitureLayer(ctx, furniture.wallMask, {
                tintColor: wallColor,
                isMask: true,
                zoomState: frozenZoomState
            });
            console.log("✅ Wall color applied via mask");
        } else {
            console.error("❌ No wallMask path in furniture config");
            console.log("  Available furniture config keys:", Object.keys(furniture));
        }

        // TEST: Try to load the wall mask image manually
        console.log("🧪 TESTING WALL MASK IMAGE LOAD:");
        try {
            const testMaskImg = new Image();
            testMaskImg.onload = () => {
                console.log(`✅ Wall mask loaded successfully: ${furniture.wallMask}`);
                console.log(`  Dimensions: ${testMaskImg.naturalWidth}x${testMaskImg.naturalHeight}`);
                console.log(`  Image appears valid for masking`);
            };
            testMaskImg.onerror = (err) => {
                console.log(`❌ Wall mask failed to load: ${furniture.wallMask}`);
                console.log(`  Error:`, err);
                console.log(`  This is why wall color fills entire canvas!`);
            };
            testMaskImg.src = normalizePath(furniture.wallMask);
        } catch (e) {
            console.log(`❌ Error testing wall mask: ${e.message}`);
        }

        // ===== STEP 3: Draw sofa base =====
        console.log("3️⃣ Drawing sofa base - USING MAPPING");

        // ✅ Use the layer mapping to get the correct background index
        const backgroundIndex = layerMapping.backgroundIndex;

        
        const backgroundLayer = appState.currentLayers[backgroundIndex];
        const sofaBaseColor = resolveColor(backgroundLayer?.color || "#FAFAFA");

        // ✅ ENHANCED DEBUG - Let's catch the bug red-handed
        console.log("🔍 SOFA BASE COLOR RESOLUTION DEBUG:");
        console.log("  backgroundIndex:", backgroundIndex);
        console.log("  backgroundLayer:", backgroundLayer);
        console.log("  backgroundLayer.label:", backgroundLayer?.label);
        console.log("  backgroundLayer.color:", backgroundLayer?.color);
        console.log("  sofaBaseColor resolved to:", sofaBaseColor);

        // ✅ ALSO CHECK: What does resolveColor actually return?
        console.log("  resolveColor direct test:", resolveColor(backgroundLayer?.color));
        console.log("  lookupColor direct test:", lookupColor(backgroundLayer?.color));


        console.log(`  Sofa base color from input ${backgroundIndex} (${appState.currentLayers[backgroundIndex]?.label}): ${sofaBaseColor}`);

        if (furniture.base) {
            console.log("  🛋️ Sofa base path exists:", furniture.base);
            console.log("  🛋️ Calling drawFurnitureLayer for sofa base...");
            
            // ✅ ENSURE SOFA BASE COMPLETES BEFORE PATTERNS
            console.log("🐛 ABOUT TO DRAW SOFA BASE:");
        console.log("  furniture.base path:", furniture.base);
        console.log("  Should be: data/furniture/sofa-capitol/sofa-capitol-base.png");
        console.log("  Tint color:", sofaBaseColor);

            try {
                await drawFurnitureLayer(ctx, furniture.base, {
                    tintColor: sofaBaseColor,
                    zoomState: frozenZoomState
                });
                console.log("  ✅ Sofa base step completed - CONFIRMED");
            } catch (error) {
                console.error("  ❌ Sofa base failed:", error);
            }

                // ✅ Then: Add shadow layer with multiply blend (no UI input needed)
                const shadowPath = furniture.baseShadow || furniture.base.replace('.png', '-shadow.png');
                console.log("  🌚 Adding sofa base shadow...");
                
                await drawFurnitureLayer(ctx, shadowPath, {
                    tintColor: null,  // No tinting for shadow
                    zoomState: frozenZoomState,
                    blendMode: "multiply",  // Multiply blend for shadow
                    opacity: 0.7  // Adjust shadow intensity
                });
                console.log("  ✅ Sofa base shadow completed");

        } else {
            console.error("❌ No base path in furniture config");
        }

        // ✅ ADD DELAY TO ENSURE SOFA BASE IS FULLY RENDERED
        console.log("⏳ Waiting for sofa base to complete before patterns...");
        await new Promise(resolve => setTimeout(resolve, 50));
    

            // ===== STEP 4: Draw pattern layers =====
            console.log("4️⃣ Drawing pattern layers - ENHANCED DEBUG");
            console.log(`  Total pattern layers to process: ${pattern.layers.length}`);
            console.log(`  Pattern layer start index: ${layerMapping.patternStartIndex}`);
            console.log(`  Available inputs: ${appState.currentLayers.length}`);

            // Show all current inputs
            console.log("  📋 ALL CURRENT INPUTS:");
            appState.currentLayers.forEach((layer, idx) => {
                console.log(`    Input ${idx}: ${layer.label} = "${layer.color}"`);
            });

            console.log("  🎨 PATTERN LAYER MAPPING:");
            for (let i = 0; i < pattern.layers.length; i++) {

                const layer = pattern.layers[i];
                const furnitureInputIndex = layerMapping.patternStartIndex + i;
                const inputLayer = appState.currentLayers[furnitureInputIndex];
                const layerColor = resolveColor(inputLayer?.color || "Snowbound");
                
                console.log(`  📐 Pattern layer ${i}:`);
                console.log(`    Layer path: ${layer.path?.split('/').pop()}`);
                console.log(`    Maps to input ${furnitureInputIndex}: ${inputLayer?.label} = "${inputLayer?.color}"`);
                console.log(`    Resolved color: ${layerColor}`);
                console.log(`    Input exists: ${!!inputLayer}`);
                
                if (layerColor && layer.path) {
                    try {
                        console.log(`    🎨 Using processImage for pattern layer ${i} with color ${layerColor}`);
                        
                if (layerColor && layer.path) {
                    try {
                        await drawFurnitureLayer(ctx, layer.path, {
                            tintColor: layerColor,
                            zoomState: frozenZoomState,
                            highRes: true  // ✅ Enable high-res for patterns

                        });
                        console.log(`    ✅ Pattern layer ${i} rendered in high resolution`);
                    } catch (error) {
                        console.error(`    ❌ Failed to render pattern layer ${i}:`, error);
                    }
                }        
                    } catch (error) {
                        console.error(`    ❌ Failed to render pattern layer ${i}:`, error);
                    }
                } else {
                    console.warn(`    ⚠️ Skipping pattern layer ${i}: missing color or path`);
                }
            }        
            console.log("✅ Pattern layers step completed");

            // ✅ NEW STEP 4.5: Add sofa base shadow AFTER patterns
            console.log("4️⃣.5 Adding sofa base shadow on top of patterns");

            const shadowPath = furniture.baseShadow || furniture.base.replace('.png', '-shadow.png');
            if (shadowPath && furniture.base) {
                console.log("  🌚 Drawing shadow on top of patterns...");
                
                try {
                    await drawFurnitureLayer(ctx, shadowPath, {
                        tintColor: null,  // No tinting for shadow
                        zoomState: frozenZoomState,
                        blendMode: "multiply",  // Multiply blend for shadow effect
                        opacity: 0.7  // Adjust shadow intensity as needed
                    });
                    console.log("  ✅ Shadow applied on top of patterns");
                } catch (error) {
                    console.log("  ⚠️ Shadow file not found, skipping:", shadowPath);
                }
            } else {
                console.log("  ⚠️ No shadow path defined, skipping shadow");
            }

            
            // ===== STEP 5: Draw extras on top =====
            console.log("5️⃣ Drawing extras");
            if (furniture.extras) {
                console.log("  Extras path:", furniture.extras);
                console.log("  Drawing extras without tint (natural colors)");
                
                try {
                    await drawFurnitureLayer(ctx, furniture.extras, {
                        tintColor: null,
                        zoomState: frozenZoomState,
                        opacity: 1.0,
                        blendMode: "source-over"
                    });
                    console.log("✅ Extras step completed");
                } catch (error) {
                    console.error("❌ Failed to draw extras:", error);
                }
            } else {
                console.warn("⚠️ No extras defined in furniture config");
            }
            
            console.log("🎉 =========================");
            console.log("🎉 FURNITURE RENDERING COMPLETE (WITH WALL MASK)");
            console.log("🎉 =========================");

            
            // ===== STEP 6: Display result =====
            console.log("6️⃣ Displaying result");
            const dataUrl = canvas.toDataURL("image/png");
            const img = document.createElement("img");
            img.src = dataUrl;
            img.style.cssText = "width: 100%; height: 100%; object-fit: contain;";
            
            // Clear and append to DOM
            dom.roomMockup.innerHTML = "";
            dom.roomMockup.appendChild(img);
            // Reset all styling including background from fabric mode
            dom.roomMockup.style.cssText = "width: 600px; height: 450px; position: relative; background-image: none; background-color: var(--color-bg-medium);";
            ensureButtonsAfterUpdate();

            
            console.log("✅ Furniture preview displayed in DOM");
            console.log("📊 Final canvas dimensions:", canvas.width, "x", canvas.height);
            console.log("📊 DataURL length:", dataUrl.length);
            
        } catch (renderError) {
            console.error("❌ Error in furniture rendering sequence:", renderError);
            console.error("❌ Error stack:", renderError.stack);
            
            // Fallback: show error message in mockup area
            dom.roomMockup.innerHTML = `
                <div style="
                    width: 100%; 
                    height: 100%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    background: #f3f4f6; 
                    color: #dc2626;
                    font-family: monospace;
                    text-align: center;
                    padding: 20px;
                ">
                    <div>
                        <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
                        <div>Furniture Preview Error</div>
                        <div style="font-size: 12px; margin-top: 10px;">Check console for details</div>
                    </div>
                </div>
            `;
        }

        // ✅ RESTORE PRESERVED SETTINGS AT THE END
        Object.assign(furnitureViewSettings, preservedSettings);
        console.log("✅ Zoom settings restored after rendering:", furnitureViewSettings);

    } catch (mainError) {
        console.error("🔥 Critical error in updateFurniturePreview:", mainError);
        console.error("🔥 Error stack:", mainError.stack);
        
        // Ultimate fallback
        if (dom.roomMockup) {
            dom.roomMockup.innerHTML = `
                <div style="
                    width: 100%; 
                    height: 100%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    background: #fef2f2; 
                    color: #dc2626;
                    font-family: monospace;
                ">
                    Critical furniture preview error - check console
                </div>
            `;
        }
    }
};
        
    function parseCoordinateFilename(filename) {

        console.log('Before click - Scroll Y:', window.scrollY);


        const parts = filename.split('/');
        const filePart = parts[5]; // "BOMBAY-KITANELLI-VINE.jpg"
        const collectionName = 'coordinates';
        const patternPart = filePart
            .replace(/^BOMBAY-/, '') // Remove "BOMBAY-"
            .replace(/\.jpg$/i, ''); // Remove ".jpg"
        const patternName = patternPart
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        // No mapping needed to match JSON
        const normalizedPatternName = patternName;
        console.log(`Parsed filename: ${filename} â†’ collection: ${collectionName}, pattern: ${normalizedPatternName}`);
        return { collectionName, patternName: normalizedPatternName };
    }

    function loadPatternFromLocalCollections(collectionName, patternName) {
        try {
            if (!appState.collections || !appState.collections.length) {
                console.error("appState.collections is empty or not initialized");
                return null;
            }
            const collection = appState.collections.find(
                c => c && typeof c.name === 'string' && c.name.toLowerCase() === "coordinates"
            );
            if (!collection) {
                console.error("Coordinates collection not found in appState.collections");
                return null;
            }
            const pattern = collection.patterns.find(
                p => p && typeof p.name === 'string' && patternName && typeof patternName === 'string' && 
                p.name.toLowerCase() === patternName.toLowerCase()
            );
            if (!pattern) {
                console.error(`Pattern ${patternName} not found in coordinates collection`);
                return null;
            }
            console.log(`Loaded pattern: ${pattern.name} from coordinates collection`);
            return { collection, pattern };
        } catch (error) {
            console.error(`Error accessing collections: ${error.message}`);
            return null;
        }
    }

    function setupCoordinateImageHandlers() {
        const coordinateImages = document.querySelectorAll(".coordinate-image");
        console.log(`Found ${coordinateImages.length} coordinate images`);
        coordinateImages.forEach(image => {
            image.removeEventListener("click", handleCoordinateClick);
            image.addEventListener("click", handleCoordinateClick);
        });
    
        function handleCoordinateClick() {
            const image = this;
            console.log('>>> handleCoordinateClick START <<<');
        
            // Only store original state if not already stored
            if (!appState.originalPattern) {
                appState.originalPattern = { ...appState.currentPattern };
                appState.originalCoordinates = appState.selectedCollection?.coordinates ? [...appState.selectedCollection.coordinates] : [];
                appState.originalLayerInputs = appState.layerInputs.map((layer, index) => ({
                    id: `layer-${index}`,
                    label: layer.label,
                    inputValue: layer.input.value,
                    hex: layer.circle.style.backgroundColor,
                    isBackground: layer.isBackground
                }));
                appState.originalCurrentLayers = appState.currentLayers.map(layer => ({ ...layer }));
                console.log("Stored original state:", {
                    pattern: appState.originalPattern.name,
                    coordinates: appState.originalCoordinates,
                    layerInputs: appState.originalLayerInputs,
                    currentLayers: appState.originalCurrentLayers
                });
            }
        
            // Highlight selected image
            document.querySelectorAll(".coordinate-image").forEach(img => img.classList.remove("selected"));
            image.classList.add("selected");
        
            const filename = image.dataset.filename;
            console.log(`Coordinate image clicked: ${filename}`);
        
            // Find the coordinate
            const coordinate = appState.selectedCollection?.coordinates?.find(coord => coord.path === filename);
            if (!coordinate) {
                console.error(`Coordinate not found for filename: ${filename}`);
                if (dom.coordinatesContainer) {
                    dom.coordinatesContainer.innerHTML += "<p style='color: red;'>Error: Coordinate not found.</p>";
                }
                return;
            }
            console.log(`Found coordinate:`, coordinate);
        
            // Find the primary pattern layer index (non-background, non-shadow)
            const primaryLayerIndex = appState.currentLayers.findIndex(layer => 
                layer.label !== "Background" &&  
                !layer.imageUrl?.toUpperCase().includes("ISSHADOW")
            );
            if (primaryLayerIndex === -1) {
                console.error("No primary pattern layer found in appState.currentLayers:", appState.currentLayers);
                return;
            }
            console.log(`Primary layer index: ${primaryLayerIndex}`);
        
            // Determine layers to use (handle both layerPath and layerPaths)
            const layerPaths = coordinate.layerPaths || (coordinate.layerPath ? [coordinate.layerPath] : []);
            if (layerPaths.length === 0) {
                console.error(`No layers found for coordinate: ${filename}`);
                return;
            }
        
            // Load the first coordinate image to get its dimensions
            const coordImage = new Image();
            const normalizedCoordPath = normalizePath(layerPaths[0]);
            console.log(`🔍 Coordinate click path: "${layerPaths[0]}" → normalized: "${normalizedCoordPath}"`);
            coordImage.src = normalizedCoordPath;
            coordImage.onload = () => {
                // Limit coordinate image dimensions to prevent oversized canvases
                const maxDimension = 400;
                const naturalWidth = coordImage.naturalWidth;
                const naturalHeight = coordImage.naturalHeight;
                const scale = Math.min(maxDimension / naturalWidth, maxDimension / naturalHeight, 1);
                const imageWidth = Math.floor(naturalWidth * scale);
                const imageHeight = Math.floor(naturalHeight * scale);
                
                console.log(`📐 Coordinate image sizing: natural(${naturalWidth}x${naturalHeight}) → scaled(${imageWidth}x${imageHeight})`);    
        
                // Create layers and labels for all coordinate layers
                const layers = layerPaths.map(path => ({ path }));
                const layerLabels = layerPaths.map((_, index) => index === 0 ? "Flowers" : `Layer ${index + 1}`);
        
                // Update currentPattern with coordinate data
                appState.currentPattern = {
                    ...appState.currentPattern,
                    name: coordinate.filename.replace(/\.jpg$/, ''),
                    thumbnail: coordinate.path,
                    size: [imageWidth / 100, imageHeight / 100], // Convert pixels to inches (assuming 100 DPI)
                    layers: layers, // All coordinate layers
                    layerLabels: layerLabels,
                    tintWhite: false
                };
                console.log(`Updated appState.currentPattern:`, appState.currentPattern);
        
                // Update the primary pattern layer's imageUrl in currentLayers
                appState.currentLayers = appState.currentLayers.map((layer, index) => {
                    if (index === primaryLayerIndex) {
                        console.log(`Updating layer at index ${index} with layerPath: ${layerPaths[0]}`);
                        return {
                            ...layer,
                            imageUrl: layerPaths[0] // Update primary layer
                        };
                    }
                    return layer;
                });
        
                // Preserve the original layer structure and colors
                const currentColors = appState.layerInputs.map(layer => layer.input.value);
                console.log("Preserving colors:", currentColors);
        
                // Restore layer inputs with preserved colors
                appState.layerInputs = [];
                if (dom.layerInputsContainer) dom.layerInputsContainer.innerHTML = "";
                appState.currentLayers.forEach((layer, index) => {
                const id = `layer-${index}`;
                const isBackground = layer.label === "Background";
                const initialColor = currentColors[index] || (isBackground ? "#FFFFFF" : "Snowbound");
                const layerData = createColorInput(layer.label, id, initialColor, isBackground);
                layerData.input.value = toInitialCaps(initialColor.replace(/^(SW|SC)\d+\s*/i, "").trim());
                layerData.circle.style.backgroundColor = lookupColor(initialColor) || "#FFFFFF";
                
                // ✅ ADD THIS LINE - append to DOM
                dom.layerInputsContainer.appendChild(layerData.container);
                
                appState.layerInputs[index] = layerData;
                console.log(`Set ${layer.label} input to ${layerData.input.value}, circle to ${layerData.circle.style.backgroundColor}, id=${id}`);
            });

        
                // Update UI
                // updatePreview();
                // const isFurniturePattern = appState.currentPattern?.isFurniture || false;

                
                updatePreview();
                
                // Check if we're in fabric mode - if so, only render fabric mockup
                if (appState.isInFabricMode) {
                    console.log("🧵 handleCoordinateClick in fabric mode - calling renderFabricMockup()");
                    renderFabricMockup();
                } else {
                    updateRoomMockup();
                }
        
                // Add "Back to Pattern" link
                console.log("🔍 Adding Back to Pattern button...");
                const coordinatesContainer = document.getElementById("coordinatesContainer");
                console.log("🔍 coordinatesContainer found:", !!coordinatesContainer);
                if (coordinatesContainer) {
                    let backLink = document.getElementById("backToPatternLink");
                    if (backLink) {
                        console.log("🔍 Removing existing back link");
                        backLink.remove();
                    }
                    backLink = document.createElement("div");
                    backLink.id = "backToPatternLink";
                    backLink.style.cssText = `
                        color: #f0e6d2 !important;
                        font-family: 'Island Moments', cursive !important;
                        font-size: 1.8rem !important;
                        text-align: center !important;
                        cursor: pointer !important;
                        margin-top: 6rem !important;
                        padding: 0.5rem !important;
                        transition: color 0.2s !important;
                        display: block !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                        z-index: 1000 !important;
                        position: relative !important;
                    `;
                    backLink.textContent = "  ← Back to Pattern ";
                    backLink.addEventListener("mouseover", () => {
                        backLink.style.color = "#beac9f";
                    });
                    backLink.addEventListener("mouseout", () => {
                        backLink.style.color = "#f0e6d2";
                    });
                    coordinatesContainer.appendChild(backLink);
                    backLink.addEventListener("click", restoreOriginalPattern);
                    console.log("✅ Back to Pattern button added successfully");
                } else {
                    console.error("❌ coordinatesContainer not found - cannot add back link");
                }
            };
            coordImage.onerror = () => {
                console.error(`Failed to load coordinate image: ${layerPaths[0] || coordinate.layerPath}`);
            };
        }
    }

    function restoreOriginalPattern() {
    try {
        console.log('>>> restoreOriginalPattern START <<<');

        if (!appState.originalPattern || !appState.originalCurrentLayers || !appState.originalLayerInputs) {
            console.warn("No original state to restore", {
                originalPattern: appState.originalPattern,
                originalCurrentLayers: appState.originalCurrentLayers,
                originalLayerInputs: appState.originalLayerInputs
            });
            return;
        }
        console.log("Restoring original pattern:", appState.originalPattern.name, 
                    "Original state:", {
                        layerInputs: appState.originalLayerInputs,
                        currentLayers: appState.originalCurrentLayers
                    });

        // Restore appState to the original pattern
        appState.currentPattern = { ...appState.originalPattern };
        appState.currentLayers = appState.originalCurrentLayers.map(layer => ({ ...layer }));
        console.log("Restored appState: collection=", appState.selectedCollection.name, 
                    "pattern=", appState.currentPattern.name);

        // Restore layer inputs

        appState.originalLayerInputs.forEach((layer, index) => {
            const id = layer.id || `layer-${index}`;
            const layerData = createColorInput(layer.label, id, layer.inputValue, layer.isBackground);
            layerData.input.value = toInitialCaps(layer.inputValue.replace(/^(SW|SC)\d+\s*/i, "").trim());
            layerData.circle.style.backgroundColor = layer.hex;
            appState.layerInputs[index] = layerData;
            console.log(`Restored ${layer.label} input to ${layer.inputValue}, circle to ${layer.hex}, id=${id}`);
        });

        console.log("After restore, layerInputs:", 
                    appState.layerInputs.map(l => ({ id: l.input.id, label: l.label, value: l.input.value })));

        // Update UI       
        updatePreview();
        
        // Check if we're in fabric mode - if so, only render fabric mockup
        if (appState.isInFabricMode) {
            console.log("🧵 restoreOriginalPattern in fabric mode - calling renderFabricMockup()");
            renderFabricMockup();
        } else {
            updateRoomMockup();
        }
        
        populateCoordinates();

        // Remove Back to Pattern link and clean up
        const coordinatesSection = document.getElementById("coordinatesSection");
        const backLink = document.getElementById("backToPatternLink");
        if (backLink) {
            backLink.remove();
            console.log("Removed Back to Pattern link");
        }
        const errorMessages = coordinatesSection.querySelectorAll("p[style*='color: red']");
        errorMessages.forEach(msg => msg.remove());
        console.log("Cleared error messages:", errorMessages.length);

        console.log('>>> restoreOriginalPattern END <<<');
    } catch (e) {
        console.error("Error restoring original pattern:", e);
    }
}

// Update displays with layer compositing
function updateDisplays() {
    try {
        console.log('updateDisplays called');
        
        // ✅ Always update pattern preview
        updatePreview();
        
        // Check if we're in fabric mode - if so, only render fabric mockup
        if (appState.isInFabricMode) {
            console.log("🧵 updateDisplays in fabric mode - calling renderFabricMockup()");
            renderFabricMockup();
        } else {
            updateRoomMockup();
        }
        populateCoordinates();
    } catch (e) {
        console.error('Error in updateDisplays:', e);
    }
}

function handleThumbnailClick(patternId) {
    console.log(`handleThumbnailClick: patternId=${patternId}`);
    if (!patternId) {
        console.error("Invalid pattern ID:", patternId);
        return;
    }
    
    try {
        // Preserve current mockup
        const originalMockup = appState.selectedCollection?.mockup || "";
        console.log("Preserving mockup for thumbnail click:", originalMockup);

        loadPatternData(appState.selectedCollection, patternId);

        // Update thumbnails
        document.querySelectorAll(".thumbnail").forEach(t => t.classList.remove("selected"));
        const selectedThumb = document.querySelector(`.thumbnail[data-pattern-id="${patternId}"]`);
        if (selectedThumb) {
            selectedThumb.classList.add("selected");
            console.log(`Selected thumbnail: ${patternId}`);
        } else {
            console.warn(`Thumbnail not found for ID: ${patternId}`);
        }
    } catch (error) {
        console.error("Error handling thumbnail click:", error);
    }
}

// Generate print preview
const generatePrintPreview = () => {
    if (!appState.currentPattern) {
        console.error("No current pattern selected for print preview");
        return null;
    }

    const isWall = appState.currentPattern?.isWall || appState.selectedCollection?.name === "wall-panels";
    const backgroundIndex = isWall ? 1 : 0;
    const backgroundInput = appState.layerInputs[backgroundIndex]?.input;
    if (!backgroundInput) {
        console.error(`Background input not found at index ${backgroundIndex}`, appState.layerInputs);
        return null;
    }

    const backgroundColor = lookupColor(backgroundInput.value);
    console.log("Print preview - Background color:", backgroundColor, "isWall:", isWall);
    console.log("Print preview - Layer inputs:", appState.layerInputs.map((li, i) => ({
        index: i,
        value: li?.input?.value
    })));

    const dpi = 100;
    const patternWidthInches = appState.currentPattern?.size?.[0] || 24;
    const patternHeightInches = appState.currentPattern?.size?.[1] || 24;
    const printWidth = Math.round(patternWidthInches * dpi);
    const printHeight = Math.round(patternHeightInches * dpi);
    const aspectRatio = patternHeightInches / patternWidthInches;

    console.log(`Print preview - Pattern: ${patternWidthInches}x${patternHeightInches}, Aspect: ${aspectRatio}`);
    console.log(`Print canvas: ${printWidth}x${printHeight}, DPI: ${dpi}`);

    const printCanvas = document.createElement("canvas");
    const printCtx = printCanvas.getContext("2d", { willReadFrequently: true });
    printCanvas.width = printWidth;
    printCanvas.height = printHeight;

    const collectionName = toInitialCaps(appState.selectedCollection?.name || "Unknown");
    const patternName = toInitialCaps(appState.currentPattern.name || "Pattern");
    let layerLabels = [];

    const processPrintPreview = async () => {
        printCtx.fillStyle = backgroundColor;
        printCtx.fillRect(0, 0, printWidth, printHeight);
        console.log("Print preview - Filled background with:", backgroundColor);

        const isTintWhite = appState.currentPattern?.tintWhite || false;
        console.log(`Print preview - tintWhite flag: ${isTintWhite}`);

        if (isTintWhite && appState.currentPattern?.baseComposite) {        } else if (appState.currentPattern?.layers?.length) {
            layerLabels = appState.currentPattern.layers.map((l, i) => ({
                label: appState.currentPattern.layerLabels?.[i] || `Layer ${i + 1}`,
                color: appState.layerInputs[i + (isWall ? 2 : 1)]?.input?.value || "Snowbound"
            }));
            
            // Add background color to the beginning of the color list
            layerLabels.unshift({
                label: "Background",
                color: backgroundInput.value || "Snowbound"
            });

            const shadowLayers = [];
            const nonShadowLayers = [];
            appState.currentPattern.layers.forEach((layer, index) => {
                const label = layerLabels[index].label;
                const isShadow = layer.isShadow === true;
                (isShadow ? shadowLayers : nonShadowLayers).push({ layer, index, label });
            });

            let nonShadowInputIndex = isWall ? 2 : 1;

            for (const { layer, index, label } of shadowLayers) {
                const layerPath = layer.path || "";
                await new Promise((resolve) => {
                    processImage(
                        layerPath,
                        (processedUrl) => {
                            const img = new Image();
                            console.log("🧪 processedUrl type:", typeof processedUrl, processedUrl);
                            if (processedUrl instanceof HTMLCanvasElement) {
                                img.src = processedUrl.toDataURL("image/png");
                            } else {
                                img.src = processedUrl;
                            }
                            img.onload = () => {
                                printCtx.globalCompositeOperation = "multiply";
                                printCtx.globalAlpha = 0.3;
                                printCtx.drawImage(img, 0, 0, printWidth, printHeight);
                                resolve();
                            };
                            img.onerror = () => resolve();
                        },
                        null,
                        2.2,
                        true,
                        isWall
                    );
                });
            }

            for (const { layer, index, label } of nonShadowLayers) {
                const layerPath = layer.path || "";
                const layerInput = appState.layerInputs[nonShadowInputIndex];
                const layerColor = lookupColor(layerInput?.input?.value || "Snowbound");
                await new Promise((resolve) => {
                    processImage(
                        layerPath,
                        (processedUrl) => {
                            const img = new Image();
                            console.log("🧪 processedUrl type:", typeof processedUrl, processedUrl);
                            if (processedUrl instanceof HTMLCanvasElement) {
                                img.src = processedUrl.toDataURL("image/png");
                            } else {
                                img.src = processedUrl;
                            }
                            img.onload = () => {
                                printCtx.globalCompositeOperation = "source-over";
                                printCtx.globalAlpha = 1.0;
                                printCtx.drawImage(img, 0, 0, printWidth, printHeight);
                                nonShadowInputIndex++;
                                resolve();
                            };
                            img.onerror = () => resolve();
                        },
                        layerColor,
                        2.2,
                        false,
                        isWall
                    );
                });
            }
        }

        const dataUrl = printCanvas.toDataURL("image/png");
        console.log(`Print preview - Generated data URL, length: ${dataUrl.length}`);

        // Generate HTML content
        let textContent = `
            <img src="https://so-animation.com/colorflex/img/SC-header-mage.jpg" alt="SC Logo" class="sc-logo">
            <h2>${collectionName}</h2>
            <h3>${patternName}</h3>
            <ul style="list-style: none; padding: 0;">
        `;
        layerLabels.forEach(({ label, color }, index) => {
            const swNumber = appState.selectedCollection?.curatedColors?.[index] || color || "N/A";
            textContent += `
                <li>${toInitialCaps(label)} | ${swNumber}</li>
            `;
        });
        textContent += "</ul>";

        // Open preview window
        const previewWindow = window.open('', '_blank', 'width=800,height=1200');
        if (!previewWindow) {
            console.error("Print preview - Failed to open preview window");
            return { canvas: printCanvas, dataUrl };
        }

        previewWindow.document.write(`
            <html>
                <head>
                    <title>Print Preview</title>
                    <link href="https://fonts.googleapis.com/css2?family=Special+Elite&display=swap" rel="stylesheet">
                    <style>
                        body {
                            font-family: 'Special Elite', 'Times New Roman', serif !important;
                            padding: 20px;
                            margin: 0;
                            display: flex;
                            justify-content: center;
                            align-items: flex-start;
                            min-height: 100vh;
                            background-color: #111827;
                            color: #f0e6d2;
                            overflow: auto;
                        }
                        .print-container {
                            text-align: center;
                            max-width: 600px;
                            width: 100%;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            background-color: #434341;
                            padding: 20px;
                            border-radius: 8px;
                        }
                        .sc-logo {
                            width: 400px !important;
                            height: auto;
                            margin: 0 auto 20px;
                            display: block;
                        }
                        h2 { font-size: 24px; margin: 10px 0; }
                        h3 { font-size: 20px; margin: 5px 0; }
                        ul { margin: 10px 0; }
                        li { margin: 5px 0; font-size: 16px; }
                        img { max-width: 100%; height: auto; margin: 20px auto; display: block; }
                        .button-container { margin-top: 20px; }
                        button {
                            font-family: 'Special Elite', serif;
                            padding: 10px 20px;
                            margin: 0 10px;
                            font-size: 16px;
                            cursor: pointer;
                            background-color: #f0e6d2;
                            color: #111827;
                            border: none;
                            border-radius: 4px;
                        }
                        button:hover {
                            background-color: #e0d6c2;
                        }
                    </style>
                </head>
                <body>
                    <div class="print-container">
                        ${textContent}
                        <img src="${dataUrl}" alt="Pattern Preview">
                        <div class="button-container">
                            <button onclick="window.print();">Print</button>
                            <button onclick="download()">Download</button>
                            <button onclick="window.close();">Close</button>
                        </div>
                    </div>
                    <script>
                        function download() {
                            const link = document.createElement("a");
                            link.href = "${dataUrl}";
                            link.download = "${patternName}-print.png";
                            link.click();
                        }
                    </script>
                </body>
            </html>
        `);
        previewWindow.document.close();
        console.log("Print preview - Preview window opened");

        return { canvas: printCanvas, dataUrl, layerLabels, collectionName, patternName };
    };

    return processPrintPreview().catch(error => {
        console.error("Print preview error:", error);
        return null;
    });
};

// Start the app
async function startApp() {
    await initializeApp();
    // Call this when app starts
    await loadFurnitureConfig();

    isAppReady = true;

    console.log("✅ App fully initialized and ready.");
}

// Expose startApp to window so Shopify template can access it
window.startApp = startApp;

// THUMBNAIL CAPTURE SYSTEM
console.log('🎯 Thumbnail Capture System initializing...');
console.log('🔍 Current DOM ready state:', document.readyState);
console.log('🔍 Current timestamp:', Date.now());

// Function to capture pattern thumbnail using the same method as print function
function capturePatternThumbnailBuiltIn() {
    console.log('📸 Capturing pattern thumbnail using print method...');
    
    return new Promise(async (resolve) => {
        if (!appState.currentPattern) {
            console.warn('⚠️ No current pattern selected for thumbnail');
            resolve(null);
            return;
        }

        try {
            const isWall = appState.currentPattern?.isWall || appState.selectedCollection?.name === "wall-panels";
            const backgroundIndex = isWall ? 1 : 0;
            const backgroundInput = appState.layerInputs[backgroundIndex]?.input;
            
            if (!backgroundInput) {
                console.warn('⚠️ Background input not found for thumbnail');
                resolve(null);
                return;
            }

            const backgroundColor = lookupColor(backgroundInput.value);
            console.log('📸 Thumbnail - Background color:', backgroundColor);
            console.log('📸 Thumbnail - Background input value:', backgroundInput.value);
            
            // Debug all layer inputs
            console.log('📸 Thumbnail - All layer inputs:');
            appState.layerInputs.forEach((layerInput, index) => {
                if (layerInput && layerInput.input) {
                    const colorValue = layerInput.input.value;
                    const resolvedColor = lookupColor(colorValue);
                    console.log(`  Layer ${index}: "${colorValue}" -> ${resolvedColor}`);
                }
            });

            // Create high-resolution thumbnail canvas (800x800 with JPEG compression)
            const thumbCanvas = document.createElement('canvas');
            const thumbCtx = thumbCanvas.getContext('2d', { willReadFrequently: true });
            thumbCanvas.width = 800;
            thumbCanvas.height = 800;

            // Fill background
            thumbCtx.fillStyle = backgroundColor;
            thumbCtx.fillRect(0, 0, 800, 800);

            // Process layers like the print function does
            if (appState.currentPattern?.layers?.length) {
                const shadowLayers = [];
                const nonShadowLayers = [];
                
                appState.currentPattern.layers.forEach((layer, index) => {
                    const isShadow = layer.isShadow === true;
                    (isShadow ? shadowLayers : nonShadowLayers).push({ layer, index });
                });

                // Process shadow layers first
                for (const { layer, index } of shadowLayers) {
                    await new Promise((layerResolve) => {
                        processImage(
                            layer.path || "",
                            (processedUrl) => {
                                const img = new Image();
                                if (processedUrl instanceof HTMLCanvasElement) {
                                    img.src = processedUrl.toDataURL("image/png");
                                } else {
                                    img.src = processedUrl;
                                }
                                img.onload = () => {
                                    thumbCtx.globalCompositeOperation = "multiply";
                                    thumbCtx.globalAlpha = 0.3;
                                    thumbCtx.drawImage(img, 0, 0, 800, 800);
                                    thumbCtx.globalCompositeOperation = "source-over";
                                    thumbCtx.globalAlpha = 1.0;
                                    layerResolve();
                                };
                                img.onerror = () => layerResolve();
                            },
                            null,
                            2.2,
                            true,
                            isWall
                        );
                    });
                }

                // Process non-shadow layers
                let nonShadowInputIndex = isWall ? 2 : 1;
                for (const { layer, index } of nonShadowLayers) {
                    const layerInput = appState.layerInputs[nonShadowInputIndex]?.input;
                    const layerColor = layerInput ? lookupColor(layerInput.value) : "#ffffff";
                    
                    await new Promise((layerResolve) => {
                        processImage(
                            layer.path || "",
                            (processedUrl) => {
                                const img = new Image();
                                if (processedUrl instanceof HTMLCanvasElement) {
                                    img.src = processedUrl.toDataURL("image/png");
                                } else {
                                    img.src = processedUrl;
                                }
                                img.onload = () => {
                                    thumbCtx.drawImage(img, 0, 0, 800, 800);
                                    layerResolve();
                                };
                                img.onerror = () => layerResolve();
                            },
                            layerColor,
                            2.2,
                            false,
                            isWall
                        );
                    });
                    nonShadowInputIndex++;
                }
            }

            const dataUrl = thumbCanvas.toDataURL('image/jpeg', 0.9);
            console.log('✅ Thumbnail captured successfully using print method');
            resolve(dataUrl);

        } catch (error) {
            console.error('❌ Failed to capture thumbnail:', error);
            resolve(null);
        }
    });
}

// Initialize thumbnail capture system by overriding the saveToMyList function
function initializeThumbnailCapture() {
    console.log('🎯 Initializing thumbnail capture by overriding saveToMyList function...');
    
    // Wait for the original saveToMyList function to be defined
    const waitForSaveFunction = () => {
        if (window.saveToMyList && typeof window.saveToMyList === 'function') {
            console.log('✅ Found original saveToMyList function, overriding with thumbnail capture...');
            
            // Store reference to original function
            const originalSaveToMyList = window.saveToMyList;
            
            // Override with our thumbnail-capturing version
            window.saveToMyList = async function() {
                console.log('🎯 THUMBNAIL CAPTURE: saveToMyList called!');
                
                try {
                    // Capture thumbnail first
                    console.log('📸 Starting thumbnail capture...');
                    const thumbnail = await capturePatternThumbnailBuiltIn();
                    
                    if (thumbnail) {
                        console.log('✅ Thumbnail captured successfully, adding to save...');
                        
                        // Override localStorage temporarily
                        const originalSetItem = localStorage.setItem;
                        
                        localStorage.setItem = function(key, value) {
                            if (key === 'colorflexSavedPatterns') {
                                console.log('🎯 Intercepting localStorage save to add thumbnail...');
                                try {
                                    const patterns = JSON.parse(value);
                                    const lastPattern = patterns[patterns.length - 1];
                                    if (lastPattern) {
                                        // Always replace thumbnail with our custom one
                                        const oldThumbnail = lastPattern.thumbnail;
                                        lastPattern.thumbnail = thumbnail;
                                        value = JSON.stringify(patterns);
                                        console.log('✅ Custom thumbnail replaced for pattern:', lastPattern.patternName);
                                        console.log('📸 Old thumbnail:', oldThumbnail ? oldThumbnail.substring(0, 50) + '...' : 'none');
                                        console.log('📸 New thumbnail:', thumbnail.substring(0, 50) + '...');
                                    }
                                } catch (error) {
                                    console.error('❌ Error adding thumbnail:', error);
                                }
                            }
                            return originalSetItem.call(this, key, value);
                        };
                        
                        // Call the original save function
                        console.log('📝 Calling original saveToMyList function...');
                        originalSaveToMyList.call(this);
                        
                        // Restore localStorage after delay
                        setTimeout(() => {
                            localStorage.setItem = originalSetItem;
                            console.log('🔄 localStorage setItem restored');
                        }, 2000);
                        
                    } else {
                        console.warn('⚠️ Thumbnail capture failed, saving without thumbnail');
                        originalSaveToMyList.call(this);
                    }
                } catch (error) {
                    console.error('❌ Error in thumbnail capture:', error);
                    originalSaveToMyList.call(this);
                }
            };
            
            console.log('✅ Thumbnail capture system fully initialized by overriding saveToMyList!');
        } else {
            console.log('⏳ saveToMyList function not found yet, retrying...');
            setTimeout(waitForSaveFunction, 1000);
        }
    };
    
    // Start waiting for the save function
    waitForSaveFunction();
}

// Run immediately if DOM is already ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        startApp();
        initializeThumbnailCapture();
    });
} else {
    startApp();
    initializeThumbnailCapture();
}

// === PATTERN TYPE HELPERS ===

function getPatternType(pattern, collection) {
    if (collection?.name === "wall-panels") return "wall-panel";
    if (pattern?.tintWhite) return "tint-white"; 
    if (collection?.elements?.length) return "element-coloring";
    return "standard";
}

function getColorMapping(patternType, currentLayers, layerIndex) {
    switch (patternType) {
        case "wall-panel":
            return currentLayers[layerIndex + 2]; // Skip wall + background
        case "standard":
            const inputLayers = currentLayers.filter(layer => !layer.isShadow);
            return inputLayers[layerIndex + 1]; // Skip background
        case "element-coloring":
            // Future: element-specific color mapping
            const inputLayersElement = currentLayers.filter(layer => !layer.isShadow);
            return inputLayersElement[layerIndex + 1];
        default:
            return currentLayers[layerIndex + 1];
    }
}



// Add fabric tuning controls
function addFabricTuningControls() {
    // Check if controls should be shown
    if (!SHOW_FABRIC_CONTROLS) {
        return; // Exit early if controls are disabled
    }
    
    // Remove existing controls
    const existingControls = document.getElementById('fabricTuningControls');
    if (existingControls) {
        existingControls.remove();
    }
    
    // Create control panel
    const controlPanel = document.createElement('div');
    controlPanel.id = 'fabricTuningControls';
    controlPanel.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 15px;
        border-radius: 8px;
        border: 2px solid #d4af37;
        z-index: 1000;
        font-family: monospace;
        font-size: 12px;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    `;
    
    // Add title
    const title = document.createElement('h3');
    title.textContent = '🧵 Fabric Tuning';
    title.style.cssText = 'margin: 0 0 10px 0; color: #d4af37; font-size: 14px;';
    controlPanel.appendChild(title);
    
    // Create sliders for each parameter
    const params = [
        { key: 'alphaStrength', label: 'Pattern Opacity', min: 0, max: 2, step: 0.1 },
        { key: 'baseTintStrength', label: 'Base Color Tint', min: 0, max: 2, step: 0.1 },
        { key: 'patternContrast', label: 'Pattern Contrast', min: 0.1, max: 3, step: 0.1 },
        { key: 'shadowMultiplier', label: 'Shadow Interaction', min: 0, max: 2, step: 0.1 },
        { key: 'colorVibrance', label: 'Color Vibrance', min: 0, max: 2, step: 0.1 },
        { key: 'glossyStrength', label: 'Glossy Finish', min: 0, max: 2, step: 0.1 }
    ];
    
    // Add blend mode selector
    const blendModeContainer = document.createElement('div');
    blendModeContainer.style.cssText = 'margin-bottom: 10px;';
    
    const blendModeLabel = document.createElement('label');
    blendModeLabel.textContent = 'Blend Mode';
    blendModeLabel.style.cssText = 'display: block; margin-bottom: 3px; font-weight: bold;';
    
    const blendModeSelect = document.createElement('select');
    blendModeSelect.style.cssText = 'width: 100%; padding: 2px; background: #333; color: white; border: 1px solid #555;';
    
    const blendModes = [
        { value: 'auto', label: 'Auto (Smart)' },
        { value: 'multiply', label: 'Multiply' },
        { value: 'overlay', label: 'Overlay' },
        { value: 'soft-light', label: 'Soft Light' },
        { value: 'hard-light', label: 'Hard Light' },
        { value: 'screen', label: 'Screen' }
    ];
    
    blendModes.forEach(mode => {
        const option = document.createElement('option');
        option.value = mode.value;
        option.textContent = mode.label;
        if (mode.value === fabricTuning.blendMode) {
            option.selected = true;
        }
        blendModeSelect.appendChild(option);
    });
    
    blendModeSelect.addEventListener('change', (e) => {
        fabricTuning.blendMode = e.target.value;
        debouncedFabricRender();
    });
    
    blendModeContainer.appendChild(blendModeLabel);
    blendModeContainer.appendChild(blendModeSelect);
    controlPanel.appendChild(blendModeContainer);
    
    params.forEach(param => {
        const container = document.createElement('div');
        container.style.cssText = 'margin-bottom: 10px;';
        
        const label = document.createElement('label');
        label.textContent = param.label;
        label.style.cssText = 'display: block; margin-bottom: 3px; font-weight: bold;';
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = param.min;
        slider.max = param.max;
        slider.step = param.step;
        slider.value = fabricTuning[param.key];
        slider.style.cssText = 'width: 100%; margin-bottom: 2px;';
        
        const valueDisplay = document.createElement('span');
        valueDisplay.textContent = fabricTuning[param.key].toFixed(1);
        valueDisplay.style.cssText = 'color: #d4af37; font-weight: bold;';
        
        // Update function
        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            fabricTuning[param.key] = value;
            valueDisplay.textContent = value.toFixed(1);
            
            // Re-render fabric in real-time with debounce
            debouncedFabricRender();
        });
        
        container.appendChild(label);
        container.appendChild(slider);
        container.appendChild(valueDisplay);
        controlPanel.appendChild(container);
    });
    
    // Add reset button
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset to Defaults';
    resetBtn.style.cssText = `
        background: #d4af37;
        color: black;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: bold;
        margin-top: 10px;
        width: 100%;
    `;
    
    resetBtn.addEventListener('click', () => {
        fabricTuning.alphaStrength = 1.0;
        fabricTuning.baseTintStrength = 1.0;
        fabricTuning.patternContrast = 1.0;
        fabricTuning.shadowMultiplier = 1.0;
        fabricTuning.colorVibrance = 1.2;
        fabricTuning.blendMode = 'auto';
        fabricTuning.glossyStrength = 1.0;
        
        // Update slider values
        controlPanel.querySelectorAll('input[type="range"]').forEach((slider, index) => {
            slider.value = Object.values(fabricTuning)[index];
        });
        controlPanel.querySelectorAll('span').forEach((span, index) => {
            if (index < 5) { // Only update value displays
                span.textContent = Object.values(fabricTuning)[index].toFixed(1);
            }
        });
        
        // Update blend mode selector
        const blendModeSelect = controlPanel.querySelector('select');
        if (blendModeSelect) {
            blendModeSelect.value = fabricTuning.blendMode;
        }
        
        // Re-render with debounce
        debouncedFabricRender();
    });
    
    controlPanel.appendChild(resetBtn);
    
    // Add copy values button
    const copyBtn = document.createElement('button');
    copyBtn.textContent = 'Copy Values to Console';
    copyBtn.style.cssText = `
        background: #4a5568;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: bold;
        margin-top: 5px;
        width: 100%;
    `;
    
    copyBtn.addEventListener('click', () => {
        console.log('🧵 Current fabric tuning values:');
        console.log('fabricTuning = {');
        Object.entries(fabricTuning).forEach(([key, value]) => {
            console.log(`    ${key}: ${value},`);
        });
        console.log('};');
    });
    
    controlPanel.appendChild(copyBtn);
    
    // Add to document
    document.body.appendChild(controlPanel);
}

// Function to remove fabric tuning controls
function removeFabricTuningControls() {
    const existingControls = document.getElementById('fabricTuningControls');
    if (existingControls) {
        existingControls.remove();
    }
}

// Simple fabric mockup function
async function renderFabricMockup() {
    console.log("🧵 ================================");
    console.log("🧵 FABRIC MOCKUP STARTING");
    console.log("🧵 ================================");
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    // Will be dynamically sized based on first loaded image
    let canvasWidth = 600;  // Default fallback
    let canvasHeight = 450; // Default fallback
    
    // Get fabric config with error handling
    console.log("🔍 Global furnitureConfig:", furnitureConfig);
    console.log("🔍 Collection furnitureConfig:", appState.selectedCollection?.furnitureConfig);
    
    // Try to get furniture config from collection first, then fall back to global
    let actualFurnitureConfig = appState.selectedCollection?.furnitureConfig || furnitureConfig;
    console.log("🔍 Using furnitureConfig:", actualFurnitureConfig);
    
    const fabricConfig = actualFurnitureConfig?.fabric;
    
    if (!fabricConfig) {
        console.error("❌ Fabric config not found in furnitureConfig!");
        console.log("🔍 Available furniture config keys:", Object.keys(actualFurnitureConfig || {}));
        return;
    }
    
    console.log("🔍 Fabric config:", fabricConfig);
    
    // Get background color (first layer is Background)
    console.log("🔍 Current layers:", appState.currentLayers);
    console.log("🔍 First layer:", appState.currentLayers[0]);
    const backgroundColor = lookupColor(appState.currentLayers[0]?.color || "Snowbound");
    console.log("🎨 Background color:", backgroundColor);
    console.log("🔍 Base tint strength:", fabricTuning.baseTintStrength);
    
    try {
        // 1. Load and draw room mockup background
        const mockupBg = new Image();
        mockupBg.crossOrigin = "anonymous";
        
        await new Promise((resolve, reject) => {
            mockupBg.onload = resolve;
            mockupBg.onerror = reject;
            mockupBg.src = `https://so-animation.com/colorflex/${fabricConfig.mockup}`;
        });
        
        // Set canvas size based on mockup image dimensions
        canvasWidth = mockupBg.width;
        canvasHeight = mockupBg.height;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        console.log(`📐 Canvas sized to match mockup: ${canvasWidth}x${canvasHeight}`);
        
        // Draw room background at full resolution
        ctx.drawImage(mockupBg, 0, 0);
        
        // 2. Load fabric base for later use
        const fabricBase = new Image();
        fabricBase.crossOrigin = "anonymous";
        
        await new Promise((resolve, reject) => {
            fabricBase.onload = resolve;
            fabricBase.onerror = reject;
            fabricBase.src = `https://so-animation.com/colorflex/${fabricConfig.base}`;
        });
        
        console.log(`📐 Fabric base: ${fabricBase.width}x${fabricBase.height}`);
        
        // 3. Create tinted base layer using fabric base alpha channel
        const baseCanvas = document.createElement("canvas");
        const baseCtx = baseCanvas.getContext("2d");
        baseCanvas.width = canvasWidth;
        baseCanvas.height = canvasHeight;
        
        // Draw fabric base to get alpha channel at full resolution
        baseCtx.drawImage(fabricBase, 0, 0, canvasWidth, canvasHeight);
        
        // Extract alpha channel and apply background color tint
        const baseImageData = baseCtx.getImageData(0, 0, canvasWidth, canvasHeight);
        const baseData = baseImageData.data;
        
        // Parse background color
        const bgColorMatch = backgroundColor.match(/^#([0-9a-f]{6})$/i);
        if (bgColorMatch) {
            const bgR = parseInt(bgColorMatch[1].substr(0, 2), 16);
            const bgG = parseInt(bgColorMatch[1].substr(2, 2), 16);
            const bgB = parseInt(bgColorMatch[1].substr(4, 2), 16);
            
            for (let j = 0; j < baseData.length; j += 4) {
                const r = baseData[j];
                const g = baseData[j + 1];
                const b = baseData[j + 2];
                const alpha = baseData[j + 3];
                
                if (alpha > 0) {
                    const tintStrength = fabricTuning.baseTintStrength;
                    
                    // Apply background color tint
                    baseData[j] = Math.floor(bgR * tintStrength + r * (1 - tintStrength));
                    baseData[j + 1] = Math.floor(bgG * tintStrength + g * (1 - tintStrength));
                    baseData[j + 2] = Math.floor(bgB * tintStrength + b * (1 - tintStrength));
                    // Keep original alpha channel
                }
            }
            
            baseCtx.putImageData(baseImageData, 0, 0);
        }
        
        console.log("✅ Created tinted base layer with fabric alpha channel");
        
        // Load pattern layers using the fabric config from furniture-config.json
        const patternSlug = createPatternSlug(appState.currentPattern.name);
        const pattern = appState.currentPattern;
        
        console.log(`🔍 Pattern layers available:`, pattern.layers);
        console.log(`🔍 Fabric config patternPathTemplate:`, fabricConfig.patternPathTemplate);
        
        // Process pattern layers (skip Background layer at index 0)
        for (let i = 0; i < pattern.layers.length; i++) {
            const layer = pattern.layers[i];
            console.log(`🔍 Pattern layer ${i} object:`, layer);
            
            // Extract filename from layer's path or imageUrl and change extension to .png
            let layerFileName;
            if (typeof layer === 'string') {
                layerFileName = layer;
            } else if (layer.path) {
                const originalFileName = layer.path.split('/').pop();
                layerFileName = originalFileName.replace(/\.(jpg|jpeg)$/i, '.png');
            } else if (layer.imageUrl) {
                const originalFileName = layer.imageUrl.split('/').pop();
                layerFileName = originalFileName.replace(/\.(jpg|jpeg)$/i, '.png');
            } else {
                layerFileName = `${patternSlug}_layer-${i+1}.png`;
            }
            
            // Use the patternPathTemplate from fabric config
            const layerPath = `https://so-animation.com/colorflex/${fabricConfig.patternPathTemplate
                .replace('{collection}', appState.selectedCollection.name)
                .replace('{patternSlug}', patternSlug)}${layerFileName}`;
            
            console.log(`🔍 Loading pattern layer ${i}: ${layerPath}`);
            
            try {
                const layerImg = new Image();
                layerImg.crossOrigin = "anonymous";
                
                await new Promise((resolve, reject) => {
                    layerImg.onload = resolve;
                    layerImg.onerror = reject;
                    layerImg.src = layerPath;
                });
                
                // Apply pattern to pattern composite (like pattern preview)
                const tempCanvas = document.createElement("canvas");
                const tempCtx = tempCanvas.getContext("2d");
                tempCanvas.width = canvasWidth;
                tempCanvas.height = canvasHeight;
                
                // Draw the pattern image at full resolution
                tempCtx.drawImage(layerImg, 0, 0, canvasWidth, canvasHeight);
                
                // Get the layer's color from appState (pattern layers start at index 1 after Background)
                const colorIndex = i + 1; // Skip Background layer at index 0
                const layerColor = lookupColor(appState.currentLayers[colorIndex]?.color || "#FFFFFF");
                console.log(`🎨 Using color ${layerColor} for pattern layer ${i} (color index ${colorIndex})`);
                
                // Parse pattern color (hex to RGB)
                const colorMatch = layerColor.match(/^#([0-9a-f]{6})$/i);
                if (!colorMatch) {
                    console.warn(`⚠️ Invalid color format for layer ${i}: ${layerColor}`);
                    continue;
                }
                
                const colorR = parseInt(colorMatch[1].substr(0, 2), 16);
                const colorG = parseInt(colorMatch[1].substr(2, 2), 16);
                const colorB = parseInt(colorMatch[1].substr(4, 2), 16);
                
                // Apply color vibrance adjustment
                const vibrance = fabricTuning.colorVibrance;
                const vibranceR = Math.floor(127 + (colorR - 127) * vibrance);
                const vibranceG = Math.floor(127 + (colorG - 127) * vibrance);
                const vibranceB = Math.floor(127 + (colorB - 127) * vibrance);
                
                console.log(`🎨 Pattern layer ${i} RGB: ${vibranceR}, ${vibranceG}, ${vibranceB}`);
                
                // Extract pattern luminance and apply color (like pattern preview)
                const imageData = tempCtx.getImageData(0, 0, canvasWidth, canvasHeight);
                const data = imageData.data;
                
                let nonTransparentPixels = 0;
                let averageLuminance = 0;
                
                // Apply pattern processing (similar to pattern preview)
                for (let j = 0; j < data.length; j += 4) {
                    const r = data[j];
                    const g = data[j + 1];
                    const b = data[j + 2];
                    const alpha = data[j + 3];
                    
                    if (alpha > 0) {
                        nonTransparentPixels++;
                        
                        // Calculate pattern luminance
                        let patternLuminance = 0.299 * r + 0.587 * g + 0.114 * b;
                        
                        // Apply pattern contrast adjustment
                        patternLuminance = Math.pow(patternLuminance / 255, 1 / fabricTuning.patternContrast) * 255;
                        averageLuminance += patternLuminance;
                        
                        // Create colored pattern with luminance-based opacity
                        const opacity = (patternLuminance / 255) * fabricTuning.alphaStrength;
                        
                        data[j] = vibranceR;
                        data[j + 1] = vibranceG;
                        data[j + 2] = vibranceB;
                        data[j + 3] = Math.min(255, opacity * 255);
                    } else {
                        data[j + 3] = 0;
                    }
                }
                
                if (nonTransparentPixels > 0) {
                    averageLuminance /= nonTransparentPixels;
                    console.log(`🔍 Pattern layer ${i}: ${nonTransparentPixels} pixels, avg luminance: ${averageLuminance.toFixed(2)}`);
                } else {
                    console.warn(`⚠️ Pattern layer ${i}: No non-transparent pixels found`);
                }
                
                // Put the processed pattern back
                tempCtx.putImageData(imageData, 0, 0);
                
                // Apply to base canvas using normal blending
                baseCtx.globalCompositeOperation = "source-over";
                baseCtx.drawImage(tempCanvas, 0, 0);
                
                console.log(`🔍 Applied pattern layer ${i} to base canvas`);
                
                console.log(`✅ Pattern layer ${i} (${layerFileName}) applied`);
                
            } catch (error) {
                console.warn(`⚠️ Pattern layer ${i} (${layerFileName}) failed:`, error);
            }
        }
        
        // 4. Final compositing in correct order
        console.log("🧵 Final compositing: mockup -> base -> patterns -> fabric shadows");
        
        // Layer 1: Mockup (unaltered room background)
        ctx.drawImage(mockupBg, 0, 0);
        
        // Layer 2: Base + Patterns (composited with alpha channel)
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(baseCanvas, 0, 0);
        
        // Layer 3: Fabric base for shadows (multiply to bring shadows back)
        ctx.globalCompositeOperation = "multiply";
        ctx.drawImage(fabricBase, 0, 0, canvasWidth, canvasHeight);
        
        // Layer 4: Glossy finish (screen blend for shine effect)
        if (fabricTuning.glossyStrength > 0) {
            try {
                const fabricGlossy = new Image();
                fabricGlossy.crossOrigin = "anonymous";
                
                await new Promise((resolve, reject) => {
                    fabricGlossy.onload = resolve;
                    fabricGlossy.onerror = reject;
                    // Use fabric-glossy.png from the same directory as fabric-base.png
                    const glossyPath = fabricConfig.base.replace('fabric-base.png', 'fabric-glossy.png');
                    fabricGlossy.src = `https://so-animation.com/colorflex/${glossyPath}`;
                });
                
                console.log(`📐 Fabric glossy: ${fabricGlossy.width}x${fabricGlossy.height}`);
                
                // Apply glossy layer with screen blend mode and tunable opacity
                ctx.globalCompositeOperation = "screen";
                ctx.globalAlpha = fabricTuning.glossyStrength;
                ctx.drawImage(fabricGlossy, 0, 0, canvasWidth, canvasHeight);
                
                // Reset alpha and composite operation
                ctx.globalAlpha = 1.0;
                ctx.globalCompositeOperation = "source-over";
                
                console.log("✅ Glossy layer applied with screen blend");
                
            } catch (error) {
                console.warn("⚠️ Glossy layer failed to load:", error);
                // Continue without glossy layer if it fails
            }
        }
        
        // Reset composite operation
        ctx.globalCompositeOperation = "source-over";
        
        console.log("✅ All layers composited in correct order");
        
        // Update display - try both possible element references
        let roomMockup = document.getElementById('roomMockup');
        if (!roomMockup && dom?.roomMockup) {
            roomMockup = dom.roomMockup;
        }
        
        console.log("🔍 roomMockup element found:", !!roomMockup);
        console.log("🔍 dom.roomMockup available:", !!dom?.roomMockup);
        
        if (roomMockup) {
            const dataURL = canvas.toDataURL();
            console.log("🔍 Canvas dataURL length:", dataURL.length);
            console.log("🔍 roomMockup element type:", roomMockup.tagName);
            
            // Check if it's an img or div element
            if (roomMockup.tagName === 'IMG') {
                roomMockup.src = dataURL;
                console.log("✅ Set fabric mockup as img src");
            } else {
                // It's a div - preserve back button but clear other content
                console.log("🔍 Div innerHTML before:", roomMockup.innerHTML.substring(0, 100));
                
                // Save existing back button if it exists
                const existingButton = roomMockup.querySelector('#backToPatternsBtn');
                
                // Clear the div content
                roomMockup.innerHTML = '';
                
                // Clear the CSS background color to make background image visible
                roomMockup.style.backgroundColor = 'transparent';
                
                // Set background image
                roomMockup.style.backgroundImage = `url(${dataURL})`;
                roomMockup.style.backgroundSize = 'contain';
                roomMockup.style.backgroundRepeat = 'no-repeat';
                roomMockup.style.backgroundPosition = 'center';
                
                // Restore the back button if it existed
                if (existingButton) {
                    roomMockup.appendChild(existingButton);
                    console.log("✅ Restored back button after clearing div");
                }
                
                console.log("✅ Set fabric mockup as div background and cleared other content");
            }
            
            console.log("✅ Fabric mockup displayed to element:", roomMockup.id);
        } else {
            console.error("❌ No roomMockup element found!");
        }
        
        // Add back button for fabric mode (but only if not already present)
        if (!document.getElementById('backToPatternsBtn')) {
            addBackToPatternsButton();
        }
        
        // Add fabric tuning controls
        addFabricTuningControls();
        
    } catch (error) {
        console.error("❌ Fabric mockup error:", error);
    }
}

// Add Try Fabric button functionality
function addTryFabricButton() {
    console.log("🧵 addTryFabricButton called");
    console.log("🧵 selectedCollection:", appState.selectedCollection?.name);
    
    // Check if we're in a compatible collection for fabric
    if (!appState.selectedCollection || appState.selectedCollection.name !== "botanicals") {
        console.log("🧵 Not botanicals collection, skipping fabric button");
        return;
    }
    
    console.log("🧵 Creating Try Fabric button");
    
    const existingButton = document.getElementById('tryFabricBtn');
    if (existingButton) {
        existingButton.remove();
    }
    
    const button = document.createElement('button');
    button.id = 'tryFabricBtn';
    button.textContent = 'Try Fabric';
    button.className = 'btn btn-primary';
    button.style.cssText = `
        margin-top: 10px;
        padding: 8px 16px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;
    
    button.addEventListener('click', () => {
        console.log("🧵 ================================");
        console.log("🧵 TRY FABRIC BUTTON CLICKED");
        console.log("🧵 ================================");
        renderFabricMockup();
    });
    
    // Add button to the appropriate location
    const tryFurnitureBtn = document.getElementById('tryFurnitureBtn');
    if (tryFurnitureBtn) {
        tryFurnitureBtn.parentNode.insertBefore(button, tryFurnitureBtn.nextSibling);
    } else {
        const controlsContainer = document.querySelector('.controls-container') || document.body;
        controlsContainer.appendChild(button);
    }
}

// Add this line at the bottom of your CFM.js file to expose the function globally:
window.addTryFurnitureButton = addTryFurnitureButton;
window.getCompatibleFurniture = getCompatibleFurniture;
window.showFurnitureModal = showFurnitureModal;
window.selectFurniture = selectFurniture;
window.renderFabricMockup = renderFabricMockup;
window.addTryFabricButton = addTryFabricButton;

// Debug function to manually test fabric
window.testFabric = function() {
    console.log("🧵 Manual fabric test called");
    renderFabricMockup();
};

// Simple red canvas test
window.testRedCanvas = function() {
    console.log("🔴 Testing red canvas display");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 600;
    canvas.height = 450;
    
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, 600, 450);
    
    ctx.fillStyle = "white";
    ctx.font = "48px Arial";
    ctx.fillText("FABRIC TEST", 150, 250);
    
    const roomMockup = document.getElementById('roomMockup') || dom?.roomMockup;
    if (roomMockup) {
        roomMockup.src = canvas.toDataURL();
        console.log("🔴 Red canvas set to roomMockup");
    } else {
        console.error("❌ No roomMockup element found");
    }
};

// Simple fabric function that just fits a 3840x2160 image into 600x450
window.simpleFabricTest = function() {
    console.log("🧵 SIMPLE FABRIC TEST");
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 600;
    canvas.height = 450;
    
    // Fill with a color first
    ctx.fillStyle = "#F0F0E9";
    ctx.fillRect(0, 0, 600, 450);
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function() {
        console.log(`Image loaded: ${img.width}x${img.height}`);
        
        // Calculate scale to fit 3840x2160 into 600x450
        const scaleX = 600 / img.width;
        const scaleY = 450 / img.height;
        const scale = Math.min(scaleX, scaleY);
        
        console.log(`Scale: ${scale} (${scaleX}, ${scaleY})`);
        
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (600 - w) / 2;
        const y = (450 - h) / 2;
        
        console.log(`Drawing at: ${x}, ${y}, ${w}x${h}`);
        
        ctx.drawImage(img, x, y, w, h);
        
        // Update display
        const roomMockup = document.getElementById('roomMockup');
        if (roomMockup) {
            roomMockup.src = canvas.toDataURL();
            console.log("✅ Simple fabric test complete");
        }
    };
    
    img.src = "https://so-animation.com/colorflex/data/fabric/fabric-base.png";
};
// Enhanced color parsing function for proof generation
async function parseColorEnhanced(colorStr) {
    if (!colorStr) return null;
    
    console.log('🔍 Parsing color:', `"${colorStr}"`);
    
    // Handle hex colors
    if (colorStr.startsWith('#')) {
        const hex = colorStr.substring(1);
        if (hex.length === 3) {
            return {
                r: parseInt(hex[0] + hex[0], 16),
                g: parseInt(hex[1] + hex[1], 16),
                b: parseInt(hex[2] + hex[2], 16)
            };
        } else if (hex.length === 6) {
            return {
                r: parseInt(hex.substring(0, 2), 16),
                g: parseInt(hex.substring(2, 4), 16),
                b: parseInt(hex.substring(4, 6), 16)
            };
        }
    }
    
    // Handle rgb() format
    const rgbMatch = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
        return {
            r: parseInt(rgbMatch[1]),
            g: parseInt(rgbMatch[2]),
            b: parseInt(rgbMatch[3])
        };
    }
    
    // Handle named colors with SW/SC codes
    const cleanColor = colorStr.toLowerCase().trim();
    
    // Load colors if not already loaded
    if (!window.colorFlexColors) {
        console.log('🔄 Loading colors from colors.json...');
        try {
            const response = await fetch('/assets/colors.json');
            const colorsData = await response.json();
            
            window.colorFlexColors = {};
            colorsData.forEach(color => {
                const baseName = color.color_name.toLowerCase().trim();
                const rgb = { r: color.red, g: color.green, b: color.blue };
                
                // Add multiple variations for flexible matching
                window.colorFlexColors[baseName] = rgb;
                if (color.sw_number) {
                    window.colorFlexColors[color.sw_number.toLowerCase() + ' ' + baseName] = rgb;
                    window.colorFlexColors[color.sw_number.toLowerCase()] = rgb;
                }
            });
            console.log('✅ Loaded', Object.keys(window.colorFlexColors).length, 'color variations');
        } catch (error) {
            console.error('❌ Failed to load colors.json:', error);
            return null;
        }
    }
    
    // Try direct match first
    if (window.colorFlexColors[cleanColor]) {
        return window.colorFlexColors[cleanColor];
    }
    
    // Try partial matches
    for (const [key, value] of Object.entries(window.colorFlexColors)) {
        if (key.includes(cleanColor) || cleanColor.includes(key)) {
            console.log(`✅ Found partial match: "${cleanColor}" matched "${key}"`);
            return value;
        }
    }
    
    console.warn(`❌ Could not parse color: "${colorStr}"`);
    return null;
}

// Pattern proof generation functions for product pages
async function generatePatternProof(patternName, collectionName, colorArray) {
    console.log('🔧 generatePatternProof called with:', patternName, collectionName, colorArray);
    
    try {
        // Access collections from appState
        const collectionsData = appState.collections;
        if (!collectionsData) {
            throw new Error('Collections data not loaded');
        }
        
        const targetCollection = collectionsData.find(c => c.name === collectionName);
        if (!targetCollection) {
            throw new Error(`Collection "${collectionName}" not found`);
        }
        
        const targetPattern = targetCollection.patterns.find(p => 
            p.name.toLowerCase().trim() === patternName.toLowerCase().trim()
        );
        
        if (!targetPattern) {
            throw new Error(`Pattern "${patternName}" not found in collection "${collectionName}"`);
        }
        
        console.log('🔧 Found pattern:', targetPattern.name, 'with', targetPattern.layers?.length || 0, 'layers');
        
        // Create canvas and context - size will be determined by pattern dimensions
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Handle patterns exactly like updatePreview does
        if (targetPattern.tintWhite && targetPattern.baseComposite) {
            console.log("🎨 Rendering tint white pattern for proof");
            
            const baseImage = new Image();
            baseImage.crossOrigin = "Anonymous";
            baseImage.src = normalizePath(targetPattern.baseComposite);
            
            await new Promise((resolve, reject) => {
                baseImage.onload = () => {
                    // Always scale to 2400 width, maintaining aspect ratio
                    const scale = 2400 / baseImage.width;
                    const canvasWidth = 2400;
                    const canvasHeight = baseImage.height * scale;
                    
                    canvas.width = canvasWidth;
                    canvas.height = canvasHeight;
                    
                    console.log(`🔧 Canvas sized: ${canvas.width}x${canvas.height} (original: ${baseImage.width}x${baseImage.height})`);
                    
                    // Use first color as background
                    const backgroundColor = lookupColor(colorArray[0] || "Snowbound");
                    ctx.fillStyle = backgroundColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
                    
                    resolve();
                };
                baseImage.onerror = reject;
            });
            
        } else if (targetPattern.layers?.length) {
            console.log("🎨 Rendering layered pattern for proof");
            
            const firstLayer = targetPattern.layers.find(l => !l.isShadow);
            if (firstLayer) {
                const tempImg = new Image();
                tempImg.crossOrigin = "Anonymous";
                tempImg.src = normalizePath(firstLayer.path);
                
                const patternBounds = await new Promise((resolve) => {
                    tempImg.onload = () => {
                        // Always scale to 2400 width, maintaining aspect ratio
                        const canvasSizeMultiplier = 2400 / tempImg.width;
                        const canvasWidth = 2400;
                        const canvasHeight = tempImg.height * canvasSizeMultiplier;
                        
                        canvas.width = canvasWidth;
                        canvas.height = canvasHeight;
                        
                        console.log(`🔧 Canvas sized: ${canvas.width}x${canvas.height} (original: ${tempImg.width}x${tempImg.height})`);
                        
                        // Set background color (use first color as background)
                        const backgroundColor = lookupColor(colorArray[0] || "Snowbound");
                        ctx.fillStyle = backgroundColor;
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        
                        // Pattern fills the entire canvas
                        resolve({ 
                            offsetX: 0, 
                            offsetY: 0, 
                            patternDisplayWidth: canvas.width, 
                            patternDisplayHeight: canvas.height, 
                            scaleMultiplier: appState.scaleMultiplier || 1 
                        });
                    };
                    tempImg.onerror = () => resolve(null);
                });
                
                if (patternBounds) {
                    // Render each layer using the exact same logic as updatePreview
                    for (let layerIndex = 0; layerIndex < targetPattern.layers.length; layerIndex++) {
                        const layer = targetPattern.layers[layerIndex];
                        const isShadow = layer.isShadow === true;
                        
                        // Use colors from colorArray in order (skip first color since it's background)
                        const layerColor = !isShadow ? lookupColor(colorArray[layerIndex + 1] || colorArray[layerIndex] || "Snowbound") : null;
                        
                        console.log(`🔧 Proof layer ${layerIndex} with color:`, layerColor);
                        
                        await new Promise((resolve) => {
                            // Simplified proof generation - just composite the layers at full size
                            processImage(layer.path, (processedCanvas) => {
                                if (!(processedCanvas instanceof HTMLCanvasElement)) {
                                    return resolve();
                                }

                                // Simple layer compositing without tiling/clipping
                                ctx.globalCompositeOperation = isShadow ? "multiply" : "source-over";
                                ctx.globalAlpha = isShadow ? 0.3 : 1.0;
                                
                                // Scale and draw the processed layer to fill the canvas
                                ctx.drawImage(processedCanvas, 0, 0, canvas.width, canvas.height);
                                
                                ctx.globalAlpha = 1.0; // Reset alpha
                                console.log(`✅ Rendered proof layer ${layerIndex} with color ${layerColor}`);
                                resolve();
                            }, layerColor, 2.2, isShadow, false, false);
                        });
                    }
                }
            }
        }
        
        console.log('✅ Pattern proof generation complete');
        return canvas;
        
    } catch (error) {
        console.error('❌ Error in generatePatternProof:', error);
        throw error;
    }
}

function downloadPatternProof(canvas, filename) {
    console.log('📥 Downloading pattern proof:', filename);
    
    canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('✅ Proof downloaded:', filename);
    }, 'image/jpeg', 0.95);
}

/**
 * Add customer personalization info to a proof canvas
 * @param {HTMLCanvasElement} canvas - Original pattern canvas
 * @param {Object} pattern - Saved pattern data
 * @returns {HTMLCanvasElement} - New canvas with customer info
 */
function addCustomerInfoToProof(canvas, pattern) {
    console.log('🏷️ Adding customer info to proof...');
    
    // Create a new canvas with extra space for customer info
    const newCanvas = document.createElement('canvas');
    const ctx = newCanvas.getContext('2d');
    
    // Add 200px height for customer info area
    const infoHeight = 200;
    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height + infoHeight;
    
    // Draw the original pattern
    ctx.drawImage(canvas, 0, 0);
    
    // Add white background for customer info area
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, canvas.height, newCanvas.width, infoHeight);
    
    // Add border between pattern and info
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(newCanvas.width, canvas.height);
    ctx.stroke();
    
    // Get customer info
    const customerName = (window.ShopifyCustomer && window.ShopifyCustomer.first_name && window.ShopifyCustomer.last_name) 
        ? `${window.ShopifyCustomer.first_name} ${window.ShopifyCustomer.last_name}`
        : (window.ShopifyCustomer && window.ShopifyCustomer.email) 
        ? window.ShopifyCustomer.email
        : 'ColorFlex Customer';
    
    const currentDate = new Date().toLocaleDateString();
    
    // Draw customer info text
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    
    const startY = canvas.height + 40;
    const leftMargin = 20;
    
    // Pattern info
    ctx.fillText(`Pattern: ${pattern.patternName}`, leftMargin, startY);
    ctx.fillText(`Collection: ${pattern.collectionName}`, leftMargin, startY + 35);
    
    // Customer info
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#666666';
    ctx.fillText(`Created for: ${customerName}`, leftMargin, startY + 80);
    ctx.fillText(`Date: ${currentDate}`, leftMargin, startY + 110);
    
    // Add ColorFlex branding
    ctx.font = 'italic 16px Arial';
    ctx.fillStyle = '#888888';
    ctx.textAlign = 'right';
    ctx.fillText('Generated by ColorFlex', newCanvas.width - 20, startY + 140);
    
    console.log('✅ Customer info added to proof');
    return newCanvas;
}

// Enhanced pattern proof generation with customer info
async function generatePatternProofWithInfo(patternName, collectionName, colorArray, customerName, dimensions, tiling) {
    console.log('🔧 generatePatternProofWithInfo called with:', patternName, collectionName, colorArray, customerName, dimensions, tiling);
    
    try {
        // First generate the standard pattern proof
        const standardCanvas = await generatePatternProof(patternName, collectionName, colorArray);
        
        // Create a pattern object similar to what addCustomerInfoToProof expects
        const pattern = {
            patternName: patternName,
            collectionName: collectionName,
            colors: colorArray.map((color, index) => ({
                color: color,
                label: `Layer ${index + 1}`
            })),
            // Add any additional pattern info
            dimensions: dimensions,
            tiling: tiling
        };
        
        // Add customer info to the proof using the existing function
        const enhancedCanvas = addCustomerInfoToProof(standardCanvas, pattern, customerName);
        
        console.log('✅ Pattern proof with customer info generated successfully');
        return enhancedCanvas;
        
    } catch (error) {
        console.error('❌ Error in generatePatternProofWithInfo:', error);
        throw error;
    }
}

// Expose proof generation functions globally
window.generatePatternProof = generatePatternProof;
window.generatePatternProofWithInfo = generatePatternProofWithInfo;
window.downloadPatternProof = downloadPatternProof;

window.addBackToPatternsButton = addBackToPatternsButton;
window.initializeTryFurnitureFeature = initializeTryFurnitureFeature;