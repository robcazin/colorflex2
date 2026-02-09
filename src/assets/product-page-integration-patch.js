/**
 * Product Page Integration Patch for Multi-Step ColorFlex Flow
 * 
 * This patch intercepts "Add to Cart" clicks on ColorFlex product pages
 * and routes them through our enhanced 4-step configuration flow.
 * 
 * INTEGRATION: Add this script to main-product.liquid after the integration files.
 */

(function() {
    'use strict';
    
    console.log('🛍️ Product Page Integration Patch loading...');
    
    // Wait for DOM and dependencies
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initializeProductPageIntegration, 1000);
    });
    
    function initializeProductPageIntegration() {
        console.log('🔄 Initializing product page ColorFlex integration...');
        
        // Check if this is a ColorFlex product page
        const urlParams = new URLSearchParams(window.location.search);
        const isColorFlexProduct = urlParams.get('source') === 'colorflex_saved_patterns' || 
                                  urlParams.get('colorflex_design') === 'true' ||
                                  urlParams.get('pattern_name');
        
        if (!isColorFlexProduct) {
            console.log('ℹ️ Not a ColorFlex product page, skipping integration');
            return;
        }
        
        console.log('🎨 ColorFlex product page detected - applying enhanced flow');
        
        // Check if ProductConfigurationFlow is available
        if (typeof ProductConfigurationFlow === 'undefined') {
            console.error('❌ ProductConfigurationFlow not found! Please ensure integration files are loaded.');
            return;
        }
        
        // Initialize our configuration flow if not already done
        if (!window.configFlow) {
            window.configFlow = new ProductConfigurationFlow();
        }
        
        // Extract pattern data from URL parameters
        const patternData = extractPatternDataFromURL(urlParams);
        if (!patternData) {
            console.error('❌ Could not extract pattern data from URL');
            return;
        }
        
        console.log('✅ Pattern data extracted:', patternData);
        
        // Find and intercept Add to Cart buttons
        interceptAddToCartButtons(patternData);
    }
    
    function extractPatternDataFromURL(urlParams) {
        try {
            // Method 1: Try URL parameters first
            const customColors = urlParams.get('custom_colors');
            const colorArray = customColors ? decodeURIComponent(customColors).split(',').map(c => c.trim()) : [];
            console.log('🎨 URL custom_colors param:', customColors);
            console.log('🎨 Parsed color array:', colorArray);
            
            let patternName = urlParams.get('pattern_name');
            let collection = urlParams.get('collection');
            
            // Method 2: If no URL params, extract from page content
            if (!patternName) {
                // Try to get pattern name from page title or product title
                const productTitle = document.querySelector('h1')?.textContent || 
                                   document.querySelector('.product-title')?.textContent ||
                                   document.querySelector('[data-product-title]')?.textContent ||
                                   document.title;
                
                console.log('🔍 Extracted product title from page:', productTitle);
                patternName = productTitle ? productTitle.trim() : 'Custom Pattern';
            } else {
                patternName = decodeURIComponent(patternName);
            }
            
            // Try to extract collection from breadcrumbs or product info
            if (!collection) {
                const breadcrumbs = document.querySelector('.breadcrumb')?.textContent ||
                                  document.querySelector('[data-collection]')?.textContent ||
                                  '';
                collection = breadcrumbs.toLowerCase().includes('coverlets') ? 'coverlets' :
                           breadcrumbs.toLowerCase().includes('abundance') ? 'abundance' :
                           breadcrumbs.toLowerCase().includes('farmhouse') ? 'farmhouse' :
                           'custom';
            }
            
            // Method 3: Try to get colors from page meta or default to pattern colors
            let defaultColors = [];
            if (colorArray.length === 0) {
                // Look for pattern colors in page meta or use defaults for known patterns
                if (patternName.toLowerCase().includes('georgetown')) {
                    defaultColors = ['Naval', 'Cottage Linen']; // Georgetown default colors
                }
            } else {
                defaultColors = colorArray;
            }
            
            const patternData = {
                id: urlParams.get('pattern_id') || ('pattern-' + Date.now()),
                patternName: patternName,
                collection: collection,
                colors: defaultColors.map((color, index) => ({
                    layer: `Layer ${index + 1}`,
                    color: color,
                    name: color
                })),
                patternPreview: null, // Will try to capture from page
                saveDate: urlParams.get('save_date') || new Date().toISOString().split('T')[0],
                // Additional metadata
                patternSize: urlParams.get('pattern_size') || '',
                tilingType: urlParams.get('tiling_type') || '',
                material: urlParams.get('material') || urlParams.get('application') || 'wallpaper',
                source: 'product_page',
                thumbnailUrl: extractThumbnailFromPage(patternName) // Will try to extract from page
            };
            
            console.log('✅ Extracted pattern data:', patternData);
            return patternData;
        } catch (error) {
            console.error('❌ Error extracting pattern data from URL:', error);
            return null;
        }
    }
    
    function interceptAddToCartButtons(patternData) {
        // Find all potential Add to Cart buttons
        const addToCartSelectors = [
            'button[name="add"]',
            'button[type="submit"]',
            '.btn--add-to-cart',
            '[data-action="add-to-cart"]',
            '.product-form__buttons button',
            'form[action*="/cart/add"] button[type="submit"]'
        ];
        
        let intercepted = false;
        
        for (const selector of addToCartSelectors) {
            const buttons = document.querySelectorAll(selector);
            
            buttons.forEach(button => {
                // Skip if already intercepted
                if (button._colorflexIntercepted) return;
                
                // Check if this looks like an add to cart button
                const buttonText = button.textContent.toLowerCase();
                if (buttonText.includes('add to cart') || buttonText.includes('add to bag') || 
                    button.name === 'add' || button.closest('form[action*="/cart/add"]')) {
                    
                    console.log('🎯 Intercepting Add to Cart button:', button);
                    
                    // Mark as intercepted
                    button._colorflexIntercepted = true;
                    
                    // Store original click handler
                    const originalOnClick = button.onclick;
                    const originalClickHandlers = [];
                    
                    // Remove existing event listeners (we'll restore them if needed)
                    const newButton = button.cloneNode(true);
                    button.parentNode.replaceChild(newButton, button);
                    
                    // Add our enhanced click handler
                    newButton.addEventListener('click', function(event) {
                        console.log('🛍️ Enhanced Add to Cart clicked - starting multi-step flow');
                        
                        // Prevent default cart addition
                        event.preventDefault();
                        event.stopPropagation();
                        
                        // Determine material category from URL or product
                        let category = 'wallpaper'; // default
                        if (patternData.material) {
                            category = patternData.material.toLowerCase().includes('fabric') ? 'fabric' : 'wallpaper';
                        }
                        
                        // Start our enhanced 4-step flow
                        try {
                            // Use interceptAddToCart to properly initialize the flow
                            console.log('🎯 Starting enhanced flow with pattern data:', patternData);
                            window.configFlow.interceptAddToCart(patternData);
                            
                            intercepted = true;
                            
                        } catch (error) {
                            console.error('❌ Error starting enhanced flow:', error);
                            
                            // Fallback to original behavior
                            console.log('🔄 Falling back to original Add to Cart behavior');
                            if (originalOnClick) {
                                originalOnClick.call(this, event);
                            } else {
                                // Try to submit the form normally
                                const form = this.closest('form');
                                if (form) form.submit();
                            }
                        }
                    });
                    
                    // Update button text to indicate enhanced experience
                    if (!newButton.textContent.includes('Customize')) {
                        newButton.innerHTML = newButton.innerHTML.replace(
                            /add to cart/gi, 
                            'Customize & Add to Cart'
                        );
                    }
                    
                    // Add visual indicator
                    newButton.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    newButton.style.transition = 'all 0.2s ease';
                    
                    intercepted = true;
                }
            });
        }
        
        if (intercepted) {
            console.log('✅ Product page Add to Cart buttons intercepted for enhanced flow');
            
            // Add a notice to the user
            showEnhancedFlowNotice();
        } else {
            console.warn('⚠️ No Add to Cart buttons found to intercept');
        }
    }
    
    function showEnhancedFlowNotice() {
        // Create a subtle notice near the add to cart button
        const notice = document.createElement('div');
        notice.style.cssText = `
            background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
            border: 1px solid #667eea40;
            border-radius: 8px;
            padding: 12px 16px;
            margin: 12px 0;
            font-size: 14px;
            color: #4a5568;
            text-align: center;
        `;
        notice.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 4px;">🎨 Enhanced ColorFlex Experience</div>
            <div>This customized pattern will guide you through material and texture selection before adding to cart.</div>
        `;
        
        // Find the product form to insert the notice
        const productForm = document.querySelector('form[action*="/cart/add"]') || 
                           document.querySelector('.product-form') ||
                           document.querySelector('[data-product-form]');
        
        if (productForm) {
            // Insert notice before the form buttons
            const buttons = productForm.querySelector('.product-form__buttons') || 
                           productForm.querySelector('[data-add-to-cart]') ||
                           productForm.querySelector('button[name="add"]')?.parentElement;
            
            if (buttons) {
                buttons.parentNode.insertBefore(notice, buttons);
            } else {
                productForm.appendChild(notice);
            }
        }
    }
    
    function extractThumbnailFromPage(patternName) {
        try {
            // Try to find pattern thumbnail image on the page
            const selectors = [
                'img[src*="thumbnail"]',
                'img[src*="thumb"]',
                '.product__media img',
                '.product-image img',
                '.product-featured-image img',
                'img[alt*="' + patternName + '"]',
                '.main-product img[src*="jpg"]',
                '.product__media-item img'
            ];
            
            for (const selector of selectors) {
                const img = document.querySelector(selector);
                if (img && img.src) {
                    console.log('🖼️ Found thumbnail image:', img.src);
                    return img.src;
                }
            }
            
            console.log('⚠️ No thumbnail image found on page');
            return null;
            
        } catch (error) {
            console.warn('❌ Error extracting thumbnail from page:', error);
            return null;
        }
    }
    
    // Export for debugging
    window.ProductPageIntegration = {
        extractPatternDataFromURL,
        interceptAddToCartButtons,
        showEnhancedFlowNotice,
        extractThumbnailFromPage
    };
    
    console.log('✅ Product Page Integration Patch loaded');
    
})();