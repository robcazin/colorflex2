/**
 * Multi-Step Product Configuration Flow
 * 
 * Handles: Saved Pattern → Material Category → Texture Selection → Cart
 * 
 * Flow: Pattern → Wallpaper/Fabric → Smooth/Rough/Textured → Add to Cart
 */

class ProductConfigurationFlow {
    constructor() {
        this.state = this.loadState() || {
            pattern: null,
            category: null,        // 'pre-pasted', 'peel-stick', 'unpasted', or 'grasscloth'
            variant: null,         // Shopify variant ID
            step: 'pattern',       // 'pattern' → 'category' → 'texture' → 'cart'
            selectedTexture: null, // Store selected texture info
            selectedQuantity: null, // Store selected quantity info
            promoCode: null,       // Active promo code (e.g., 'FIRSTROLL25')
            promoApplied: false,   // Whether promo has been successfully applied
            promoUsed: false       // Track if promo was already used this session
        };
        
        this.materials = [
            // Wallpaper options
            {
                id: 'wallpaper-custom-sample',
                name: 'Custom Sample',
                productHandle: 'custom-sample',
                icon: '/assets/wallpaper-icon.jpg',
                description: 'Sample of your specified paper type with your custom ColorFlex design',
                priceFrom: '$12/sample'
            },
            {
                id: 'wallpaper-prepasted',
                name: 'Prepasted Wallpaper',
                productHandle: 'custom-wallpaper',
                icon: '/assets/wallpaper-icon.jpg',
                description: 'Traditional wallpaper with adhesive backing, just add water',
                priceFrom: '$180/roll'
            },
            {
                id: 'wallpaper-peel-stick',
                name: 'Peel & Stick Wallpaper',
                productHandle: 'custom-wallpaper',
                icon: '/assets/peel-stick-icon.jpg',
                description: 'Easy removable wallpaper, perfect for renters',
                priceFrom: '$320/roll'
            },
            {
                id: 'wallpaper-unpasted',
                name: 'Unpasted Wallpaper',
                productHandle: 'custom-wallpaper',
                icon: '/assets/unpasted-icon.jpg',
                description: 'Professional installation, requires separate adhesive',
                priceFrom: '$180/roll'
            },
            {
                id: 'wallpaper-grasscloth',
                name: 'Grasscloth Wallpaper',
                productHandle: 'custom-wallpaper',
                icon: '/assets/grasscloth-icon.jpg',
                description: 'Natural texture, premium quality finish',
                priceFrom: 'Contact for pricing'
            },
            // Fabric options
            {
                id: 'fabric-custom-sample',
                name: 'Custom Sample',
                productHandle: 'custom-sample',
                icon: '/assets/fabric-icon.jpg',
                description: 'Sample of your specified fabric type with your custom ColorFlex design',
                priceFrom: '$12/sample'
            },
            {
                id: 'fabric-soft-velvet',
                name: 'Soft Velvet',
                productHandle: 'custom-fabric',
                icon: '/assets/fabric-icon.jpg',
                description: 'Luxurious soft velvet with rich texture',
                priceFrom: '$29/yard'
            },
            {
                id: 'fabric-decorator-linen',
                name: 'Decorator Linen',
                productHandle: 'custom-fabric',
                icon: '/assets/fabric-icon.jpg',
                description: 'Premium decorator linen for upholstery',
                priceFrom: '$29/yard'
            },
            {
                id: 'fabric-drapery-sheer',
                name: 'Drapery Sheer',
                productHandle: 'custom-fabric',
                icon: '/assets/fabric-icon.jpg',
                description: 'Lightweight sheer fabric for window treatments',
                priceFrom: '$24/yard'
            },
            {
                id: 'fabric-lightweight-linen',
                name: 'Lightweight Linen',
                productHandle: 'custom-fabric',
                icon: '/assets/fabric-icon.jpg',
                description: 'Versatile lightweight linen fabric',
                priceFrom: '$26/yard'
            },
            {
                id: 'fabric-faux-suede',
                name: 'Faux Suede',
                productHandle: 'custom-fabric',
                icon: '/assets/fabric-icon.jpg',
                description: 'Premium faux suede with authentic texture',
                priceFrom: '$36/yard'
            },
            {
                id: 'fabric-drapery-light-block',
                name: 'Drapery Light Block',
                productHandle: 'custom-fabric',
                icon: '/assets/fabric-icon.jpg',
                description: 'Light-blocking drapery fabric',
                priceFrom: '$31/yard'
            }
        ];
        
        this.bindEvents();
    }

    // ===== STATE MANAGEMENT =====
    
    loadState() {
        try {
            const saved = localStorage.getItem('colorflex_config_flow');
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.warn('Failed to load configuration flow state:', error);
            return null;
        }
    }
    
    saveState() {
        try {
            localStorage.setItem('colorflex_config_flow', JSON.stringify(this.state));
        } catch (error) {
            console.warn('Failed to save configuration flow state:', error);
        }
    }
    
    clearState() {
        localStorage.removeItem('colorflex_config_flow');
        this.state = {
            pattern: null,
            category: null, 
            variant: null,
            step: 'pattern'
        };
    }

    // ===== PATTERN THUMBNAIL GENERATION =====
    
    generatePatternThumbnail() {
        // If we already have a pattern preview, use it
        if (this.state.pattern.preview) {
            return `<img src="${this.state.pattern.preview}" style="width: 100%; height: 100%; object-fit: cover;" alt="${this.state.pattern.name}">`;
        }
        
        // Try to capture from canvas first
        const canvasPreview = this.capturePatternFromCanvas();
        if (canvasPreview) {
            // Store it for later use in cart
            this.state.pattern.preview = canvasPreview;
            return `<img src="${canvasPreview}" style="width: 100%; height: 100%; object-fit: cover;" alt="${this.state.pattern.name}">`;
        }
        
        // Try to generate thumbnail using existing ColorFlex logic
        if (typeof window.generatePatternProof === 'function' && this.state.pattern.colors.length > 0) {
            // Generate thumbnail asynchronously and update the modal
            setTimeout(() => {
                this.generateAsyncThumbnail();
            }, 100);
            
            // Return placeholder while generating
            return `
                <div style="width: 100%; height: 100%; background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%), linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%); background-size: 8px 8px; background-position: 0 0, 4px 4px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 10px;">
                    Generating...
                </div>
            `;
        }
        
        // Fallback placeholder
        return `
            <div style="width: 100%; height: 100%; background: #f8f9fa; display: flex; align-items: center; justify-content: center; color: #999; font-size: 10px; text-align: center;">
                🎨<br>Custom<br>Pattern
            </div>
        `;
    }
    
    async generateAsyncThumbnail() {
        try {
            console.log('🔍 generateAsyncThumbnail - Pattern data:', this.state.pattern);
            
            const colorArray = this.state.pattern.colors.map(colorObj => {
                if (typeof colorObj === 'string') return colorObj;
                return colorObj.color || colorObj.name || colorObj;
            });
            
            console.log('🔍 generateAsyncThumbnail - Color array:', colorArray);
            console.log('🔍 generateAsyncThumbnail - generatePatternProof available:', typeof window.generatePatternProof);
            
            const result = await window.generatePatternProof(
                this.state.pattern.name,
                this.state.pattern.collection,
                colorArray
            );
            
            console.log('🔍 generateAsyncThumbnail - Generation result:', result);
            
            if (result && result.dataUrl) {
                // Update the thumbnail in the modal
                const thumbnailEl = document.getElementById('pattern-thumbnail');
                if (thumbnailEl) {
                    thumbnailEl.innerHTML = `<img src="${result.dataUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="${this.state.pattern.name}">`;
                }
                
                // Also update texture modal thumbnail if it exists
                const textureThumbEl = document.getElementById('pattern-thumbnail-texture');
                if (textureThumbEl) {
                    textureThumbEl.innerHTML = `<img src="${result.dataUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="${this.state.pattern.name}">`;
                }
                
                // Store the preview for future use
                this.state.pattern.preview = result.dataUrl;
                this.saveState();
                console.log('✅ Thumbnail generated and stored successfully');
            } else {
                console.warn('⚠️ generatePatternProof returned no dataUrl');
            }
        } catch (error) {
            console.warn('❌ Failed to generate pattern thumbnail:', error);
        }
    }

    // ===== FLOW CONTROL =====
    
    /**
     * Intercept the existing "Add to Cart" button click from saved patterns
     * @param {Object} patternData - Pattern configuration from saved patterns modal
     */
    interceptAddToCart(patternData) {
        // CFM proceed-to-cart passes { pattern: {...}, category, materialInfo, ... }; flatten for this flow
        if (patternData && patternData.pattern && typeof patternData.pattern === 'object') {
            const inner = patternData.pattern;
            patternData = {
                ...patternData,
                patternName: patternData.patternName || inner.patternName || inner.name,
                name: patternData.name || inner.name || inner.patternName,
                collection: patternData.collection || inner.collection,
                id: patternData.id != null ? patternData.id : inner.id,
                colors: patternData.colors || inner.colors,
                patternPreview: patternData.patternPreview || inner.thumbnail,
                thumbnailUrl: patternData.thumbnailUrl || inner.thumbnailUrl,
                currentScale: patternData.currentScale != null ? patternData.currentScale : inner.currentScale,
                scaleMultiplier: patternData.scaleMultiplier != null ? patternData.scaleMultiplier : inner.scaleMultiplier
            };
        }

        console.log('🎯 Starting configuration flow for pattern:', patternData.patternName);
        console.log('🎨 RECEIVED PATTERN DATA:', JSON.stringify(patternData, null, 2));
        
        // Ensure we have a proper Pattern ID - preserve existing ID from CFM.js
        console.log('🔍 PRODUCTCONFIGFLOW Pattern ID input data:');
        console.log('  patternData.id:', patternData.id);
        console.log('  patternData.patternName:', patternData.patternName);
        console.log('  patternData.colors:', patternData.colors);

        const patternId = patternData.id || this.generatePatternId({
            name: patternData.patternName,
            patternName: patternData.patternName,
            collection: patternData.collection,
            colors: patternData.colors,
            currentScale: patternData.currentScale
        }, patternData.currentScale);

        console.log('🔍 Pattern ID check - incoming ID:', patternData.id, 'final ID:', patternId);
        
        const thumb = patternData.patternPreview || patternData.thumbnail || null;
        this.state.pattern = {
            id: patternId,
            name: patternData.patternName || patternData.name || 'Custom Pattern',
            patternName: patternData.patternName || patternData.name || 'Custom Pattern', // Both formats for compatibility
            collection: patternData.collection || 'unknown',
            colors: patternData.colors || [],
            preview: thumb,
            thumbnailUrl: patternData.thumbnailUrl || null,
            currentScale: patternData.currentScale,
            scaleMultiplier: patternData.scaleMultiplier
        };
        
        console.log('✅ Pattern data initialized with ID:', patternId);
        
        this.state.step = 'category';
        this.saveState();
        const preselect = patternData.category || patternData.preferredMaterial;
        if (preselect && this.materials.some((m) => m.id === preselect)) {
            this.selectMaterial(preselect);
        } else {
            this.showMaterialModal();
        }
    }
    
    /**
     * Handle material category selection
     * @param {String} categoryId - 'pre-pasted', 'peel-stick', 'unpasted', or 'grasscloth'
     */
    selectMaterial(categoryId) {
        console.log('🎯 Material selected:', categoryId);
        
        this.state.category = categoryId;
        this.state.step = 'complete';
        this.saveState();
        
        // 🔧 CRITICAL: Ensure thumbnail is stored in localStorage before redirecting
        if (this.state.pattern && this.state.pattern.preview) {
            try {
                localStorage.setItem('colorflexCurrentThumbnail', this.state.pattern.preview);
                console.log('✅ Stored thumbnail in localStorage before redirect');
            } catch (error) {
                console.warn('⚠️ Failed to store thumbnail in localStorage:', error);
            }
        } else if (this.state.pattern && typeof window.capturePatternThumbnail === 'function') {
            // Try to capture thumbnail if not already captured
            try {
                const thumbnail = window.capturePatternThumbnail();
                if (thumbnail) {
                    this.state.pattern.preview = thumbnail;
                    localStorage.setItem('colorflexCurrentThumbnail', thumbnail);
                    console.log('✅ Captured and stored thumbnail before redirect');
                }
            } catch (error) {
                console.error('❌ Error capturing thumbnail:', error);
            }
        }
        
        this.closeMaterialModal();
        
        // Skip texture modal entirely and go straight to product page
        // The product page has its own texture selection interface
        console.log('🔄 Skipping texture modal, redirecting directly to product page');
        this.redirectToProductPage(this.buildCartItem());
    }
    
    /**
     * Handle texture selection and final cart add
     * @param {String} variantId - Shopify variant ID
     * @param {Object} variantData - Variant details
     */
    async selectTextureAndAddToCart(variantId, variantData) {
        console.log('🎯 Texture selected, adding to cart:', variantId);
        
        this.state.variant = {
            id: variantId,
            name: variantData.title,
            price: variantData.price,
            sku: variantData.sku
        };
        
        // 🔧 CRITICAL: Capture thumbnail if not already captured
        if (!this.state.pattern.preview && typeof window.capturePatternThumbnail === 'function') {
            console.log('📸 Capturing pattern thumbnail before adding to cart...');
            try {
                const thumbnail = window.capturePatternThumbnail();
                if (thumbnail) {
                    this.state.pattern.preview = thumbnail;
                    // Also store in localStorage for product page
                    localStorage.setItem('colorflexCurrentThumbnail', thumbnail);
                    console.log('✅ Thumbnail captured and added to pattern state');
                } else {
                    console.warn('⚠️ Thumbnail capture returned null');
                }
            } catch (error) {
                console.error('❌ Error capturing thumbnail:', error);
            }
        } else if (this.state.pattern.preview) {
            console.log('✅ Pattern already has thumbnail');
            // Ensure it's also in localStorage
            localStorage.setItem('colorflexCurrentThumbnail', this.state.pattern.preview);
        } else {
            // Try to get from localStorage as fallback
            const storedThumbnail = localStorage.getItem('colorflexCurrentThumbnail');
            if (storedThumbnail) {
                this.state.pattern.preview = storedThumbnail;
                console.log('✅ Retrieved thumbnail from localStorage');
            } else {
                console.warn('⚠️ No thumbnail available and capturePatternThumbnail function not available');
            }
        }
        
        // CRITICAL FIX: Preserve existing ColorFlex properties from URL and form
        console.log('🔍 CART FIX: Preserving ColorFlex data from pattern state and form...');
        const existingProperties = this.buildColorFlexProperties();
        console.log('🔍 CART FIX: Built ColorFlex properties:', existingProperties);
        
        // Extract color names properly (matching CFM.js layerColors format)
        const colorNames = this.state.pattern.colors.map(colorObj => {
            console.log('🎨 Processing color object:', colorObj, typeof colorObj);
            if (typeof colorObj === 'string') return colorObj;
            if (colorObj && typeof colorObj === 'object') {
                // Handle different color object formats
                return colorObj.color || colorObj.name || colorObj.value || colorObj.hex || Object.values(colorObj)[0] || 'Unknown Color';
            }
            return String(colorObj || 'Unknown Color');
        }).filter(color => color && color !== 'Unknown Color').join(', ');
        
        console.log('🎨 Final color names for cart:', colorNames);

        // Calculate total price with promo discount if applicable
        const quantity = this.state.customQuantity || this.state.selectedQuantity?.rolls || 1;
        const subtotal = this.state.selectedTexture.price * quantity;
        let finalTotal = subtotal;

        // Apply promo discount to total price
        if (this.state.promoApplied && this.state.promoCode === 'FIRSTROLL25') {
            finalTotal = subtotal * 0.75; // 25% off
            console.log('🎫 PROMO: Applying 25% discount to cart total:', {
                subtotal: subtotal,
                discounted: finalTotal,
                saved: (subtotal - finalTotal).toFixed(2)
            });
        }

        // Build cart configuration - MERGE with existing properties instead of replacing
        const cartItem = {
            id: variantId,
            quantity: quantity,
            properties: {
                // PRESERVE existing ColorFlex properties first
                ...existingProperties,

                // Add/override with texture-specific properties
                'Texture': variantData.title,
                'Texture Price': `$${this.state.selectedTexture.price} per ${this.state.category === 'wallpaper' ? 'roll' : 'yard'}`,
                'Length': `${quantity} rolls`,
                'Coverage': `~${this.state.selectedQuantity?.coverage || 30} sq ft`,
                'Unit Price': `$${this.state.selectedTexture.price}/roll`,
                'Total Price': `$${finalTotal.toFixed(2)}` + (this.state.promoApplied ? ` (was $${subtotal.toFixed(2)})` : ''),

                // Technical properties (with underscore prefix)
                '_texture_type': variantData.title.toLowerCase(),
                '_colorflex_config': 'v2.0',
                '_configuration_timestamp': new Date().toISOString()
            }
        };
        
        console.log('🛍️ Final cart item being added:', cartItem);
        console.log('🖼️ Pattern preview included:', !!cartItem.properties['_pattern_preview']);
        console.log('🆔 Pattern ID included:', cartItem.properties['Pattern ID']);
        console.log('🎨 CUSTOM COLORS IN CART:', cartItem.properties['Custom Colors']);
        console.log('🎨 PATTERN NAME IN CART:', cartItem.properties['Custom Pattern']);
        console.log('🎨 COLLECTION IN CART:', cartItem.properties['Pattern Collection']);
        console.log('🎨 THUMBNAIL KEY IN CART:', cartItem.properties['Thumbnail Key']);
        console.log('🎨 COLORFLEX DESIGN:', cartItem.properties['ColorFlex Design']);
        console.log('🎨 TEXTURE INFO:', cartItem.properties['Texture'], cartItem.properties['Texture Price']);
        console.log('📊 CART FIX SUMMARY: ColorFlex properties preserved =', Object.keys(existingProperties).length, 'Texture properties added = 5');
        
        // 🔧 CRITICAL FIX: Add properties to the actual product form so they're included in standard form submission
        console.log('🔧 Adding properties to product form for standard submission...');
        const formUpdateSuccess = this.addPropertiesToForm(cartItem.properties);
        
        if (formUpdateSuccess) {
            console.log('✅ Properties successfully added to form - regular "Add to Cart" will now include ColorFlex data');
        } else {
            console.warn('⚠️ Failed to add properties to form - falling back to direct API submission');
        }
        
        // 🔧 CORRECT FLOW: Redirect to Custom Wallpaper product page instead of direct cart addition
        console.log('🔄 Redirecting to Custom Wallpaper product page with pattern data...');
        this.redirectToProductPage(cartItem);
    }
    
    /**
     * Navigate back one step in the flow
     */
    goBack() {
        switch(this.state.step) {
            case 'texture':
                this.state.step = 'category';
                this.closeTextureModal();
                this.showMaterialModal();
                break;
            case 'category':
                this.state.step = 'pattern';
                this.closeMaterialModal();
                // Return to saved patterns modal
                break;
        }
        this.saveState();
    }

    // ===== MODAL CREATION =====
    
    showMaterialModal() {
        const modal = this.createMaterialModal();
        document.body.appendChild(modal);
        
        // Focus management for accessibility
        const firstButton = modal.querySelector('.material-card');
        if (firstButton) firstButton.focus();
    }
    
    /**
     * Check if we're currently on a product page (Custom Wallpaper/Custom Fabric)
     */
    isOnProductPage() {
        const currentPath = window.location.pathname;
        return currentPath.includes('/products/custom-wallpaper') || 
               currentPath.includes('/products/custom-fabric') ||
               currentPath.includes('/products/custom-sample') ||
               document.querySelector('.product-form, form[action*="cart/add"]');
    }
    
    /**
     * Instead of showing modals, enhance the existing product page with pattern data
     */
    enhanceProductPageWithPatternData() {
        console.log('🎨 Enhancing product page with ColorFlex pattern data');
        
        // The pattern display snippet should handle the visual display
        // We just need to integrate with the existing add-to-cart form
        this.integrateWithProductForm();
    }
    
    /**
     * Integrate ColorFlex data with existing product form instead of showing modals
     */
    integrateWithProductForm() {
        console.log('🔗 Integrating with existing product form');
        
        // Find the product form
        const productForm = document.querySelector('.product-form, form[action*="cart/add"], form[action*="cart"]');
        if (!productForm) {
            console.warn('⚠️ Product form not found, falling back to redirect');
            return this.redirectToProductPage(this.buildCartItem());
        }
        
        // Listen for form submission and add our pattern data
        productForm.addEventListener('submit', (e) => {
            console.log('📦 Product form submitted, adding ColorFlex properties');
            this.addColorFlexPropertiesToForm(productForm);
        });
        
        // Also monitor for AJAX cart additions
        this.monitorAjaxCartAdditions();
    }
    
    /**
     * Add ColorFlex properties to the product form
     */
    addColorFlexPropertiesToForm(form) {
        const properties = this.buildColorFlexProperties();
        
        // Add hidden inputs for each property
        Object.entries(properties).forEach(([key, value]) => {
            // Remove existing property input if it exists
            const existingInput = form.querySelector(`input[name="properties[${key}]"]`);
            if (existingInput) {
                existingInput.remove();
            }
            
            // Add new hidden input
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = `properties[${key}]`;
            input.value = value;
            form.appendChild(input);
        });
        
        console.log('✅ Added ColorFlex properties to form:', Object.keys(properties));
    }
    
    /**
     * Build cart item structure for current pattern and state
     */
    buildCartItem() {
        return {
            pattern: this.state.pattern,
            category: this.state.category,
            variant: this.state.variant
        };
    }
    
    /**
     * Monitor for AJAX cart additions to add properties
     */
    monitorAjaxCartAdditions() {
        // Listen for Shopify AJAX cart additions
        document.addEventListener('ajaxCart:add', (e) => {
            console.log('🛒 AJAX cart add detected, ensuring properties included');
            // Properties should already be added to form
        });
        
        // Also listen for fetch requests to cart/add
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            if (args[0] && args[0].includes('/cart/add')) {
                console.log('🛒 Cart/add fetch detected');
                // Properties should be included in the form data
            }
            return originalFetch.apply(this, args);
        };
    }
    
    createMaterialModal() {
        // Create modal overlay with ColorFlex styling
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'material-modal';
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
            position: relative;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        `;
        
        // Generate pattern thumbnail
        const patternThumbnail = this.generatePatternThumbnail();
        
        modalContent.innerHTML = `
            <div style="text-align: center; margin-bottom: 25px;">
                <button onclick="configFlow.closeMaterialModal()" style="
                    position: absolute;
                    top: 15px;
                    right: 20px;
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                ">&times;</button>
                
                <h3 style="margin: 0 0 20px 0; color: #333; font-size: 1.5em;">Choose Material for Custom Pattern</h3>
                
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 25px; padding: 20px; background: #f8f9fa; border-radius: 10px;">
                    <div id="pattern-thumbnail" style="width: 80px; height: 80px; border-radius: 8px; border: 2px solid #d4af37; overflow: hidden;">
                        ${patternThumbnail}
                    </div>
                    <div style="text-align: left;">
                        <div style="font-size: 1.1em; font-weight: 600; color: #333; margin-bottom: 5px;">${this.state.pattern.name}</div>
                        <div style="font-size: 0.9em; color: #666;">${this.state.pattern.collection} Collection</div>
                        <div style="font-size: 0.8em; color: #999; margin-top: 5px;">
                            ${this.state.pattern.colors.length} Custom Colors
                        </div>
                    </div>
                </div>
            </div>

            <!-- Promo Code Section -->
            <div style="background: #f8f9fa; border: 2px solid #d4af37; border-radius: 10px; padding: 20px; margin-bottom: 25px;">
                <h4 style="margin: 0 0 15px 0; color: #333; font-size: 1.1em; text-align: center;">
                    🎉 Special Offer: 25% Off Your First Roll!
                </h4>
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <input
                        type="text"
                        id="promo-code-input"
                        placeholder="Enter promo code: FIRSTROLL25"
                        style="
                            flex: 1;
                            padding: 12px 15px;
                            border: 2px solid #d4af37;
                            border-radius: 8px;
                            font-size: 0.95em;
                            background: white;
                        "
                    />
                    <button
                        onclick="configFlow.applyPromoCode()"
                        style="
                            padding: 12px 24px;
                            background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                            white-space: nowrap;
                            transition: transform 0.2s;
                        "
                        onmouseover="this.style.transform='translateY(-2px)'"
                        onmouseout="this.style.transform='translateY(0)'"
                    >Apply Code</button>
                </div>
                <div id="promo-feedback" style="display: none; font-size: 0.9em; margin-top: 8px; padding: 8px; border-radius: 6px; font-weight: 500; text-align: center;"></div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                ${this.materials.map(material => `
                    <div onclick="configFlow.selectMaterial('${material.id}')" style="
                        border: 2px solid #e0e0e0;
                        border-radius: 12px;
                        padding: 20px;
                        text-align: center;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        background: white;
                    " onmouseover="this.style.borderColor='#d4af37'; this.style.transform='translateY(-2px)'"
                       onmouseout="this.style.borderColor='#e0e0e0'; this.style.transform='translateY(0)'">
                        <div style="width: 60px; height: 60px; background: #f0f0f0; border-radius: 8px; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                            ${material.id.startsWith('wallpaper-') ? '🏠' : '🧵'}
                        </div>
                        <h4 style="margin: 0; color: #333; font-size: 1.1em;">${material.name}</h4>
                    </div>
                `).join('')}
            </div>
        `;
        
        modalOverlay.appendChild(modalContent);
        return modalOverlay;
    }
    
    async showTextureModal() {
        try {
            const variants = await this.fetchProductVariants();
            const modal = this.createTextureModal(variants);
            document.body.appendChild(modal);
            
            const firstButton = modal.querySelector('.texture-card');
            if (firstButton) firstButton.focus();
        } catch (error) {
            console.error('Failed to load texture options:', error);
            this.showErrorMessage('Failed to load texture options. Please try again.');
        }
    }
    
    createTextureModal(variants) {
        const materialInfo = this.materials.find(m => m.id === this.state.category);
        
        // Create modal overlay with ColorFlex styling
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'texture-modal';
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
        
        // Create modal content with ColorFlex dark theme
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: #1a202c;
            color: white;
            padding: 30px;
            border-radius: 10px;
            max-width: 700px;
            width: 90%;
            max-height: 90%;
            overflow-y: auto;
            position: relative;
            font-family: 'Special Elite', monospace;
            border: 2px solid #4a5568;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        `;
        
        // Generate pattern thumbnail
        const patternThumbnail = this.generatePatternThumbnail();
        
        modalContent.innerHTML = `
            <div style="text-align: center; margin-bottom: 25px; border-bottom: 1px solid #d4af37; padding-bottom: 20px;">
                <button onclick="configFlow.closeTextureModal()" style="
                    position: absolute;
                    top: 15px;
                    right: 20px;
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #efeeeaff;
                ">&times;</button>
                
                <h3 style="margin: 0 0 20px 0; color: #efeeeaff; font-size: 1.5em; font-family: 'Island Moments', italic;">🎨 Customize Your ${materialInfo.name}</h3>
                
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 0; padding: 15px; background: #2d3748; border-radius: 8px; border: 1px solid #4a5568;">
                    <div id="pattern-thumbnail-texture" style="width: 60px; height: 60px; border-radius: 8px; border: 2px solid #d4af37; overflow: hidden;">
                        ${patternThumbnail}
                    </div>
                    <div style="text-align: left;">
                        <div style="font-size: 1.1em; font-weight: 600; color: #efeeeaff; margin-bottom: 5px;">${this.state.pattern.name}</div>
                        <div style="font-size: 0.9em; color: #d4af37;">Material: ${materialInfo.name}</div>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h4 style="margin: 0 0 20px 0; color: #efeeeaff; font-size: 1.2em;">Select Texture & Finish</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 30px;">
                    ${variants.map(variant => `
                        <div onclick="configFlow.selectTexture('${variant.id}', '${variant.title}', ${(variant.price / 100).toFixed(2)})" style="
                            border: 2px solid #4a5568;
                            border-radius: 8px;
                            padding: 15px;
                            text-align: center;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            background: #2d3748;
                            color: #efeeeaff;
                        " onmouseover="this.style.borderColor='#d4af37'; this.style.transform='translateY(-2px)'"
                           onmouseout="if(this.getAttribute('data-variant-id') !== '${this.state.selectedTexture?.id || ''}') { this.style.borderColor='#4a5568'; this.style.transform='translateY(0)'; }"
                           data-variant-id="${variant.id}" data-price="${(variant.price / 100).toFixed(2)}" data-title="${variant.title}">
                            <div style="width: 50px; height: 50px; background: #4a5568; border-radius: 8px; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; font-size: 18px;">
                                ${variant.title.toLowerCase().includes('smooth') ? '⚪' : variant.title.toLowerCase().includes('textured') ? '🔘' : '⚫'}
                            </div>
                            <h4 style="margin: 0 0 6px 0; color: #efeeeaff; font-size: 1em;">${variant.title}</h4>
                            <p style="margin: 0 0 8px 0; color: #cbd5e0; font-size: 0.8em;">${this.getTextureDescription(variant.title)}</p>
                            <div style="color: #d4af37; font-weight: 600; font-size: 0.9em;">$${(variant.price / 100).toFixed(2)}/roll</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 30px;">
                <h4 style="margin: 0 0 20px 0; color: #efeeeaff; font-size: 1.2em;">Select Quantity</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-bottom: 20px;">
                    ${this.getQuantityOptions().map(option => `
                        <div onclick="configFlow.selectQuantity(${option.rolls}, ${option.coverage})" style="
                            border: 2px solid #4a5568;
                            border-radius: 8px;
                            padding: 12px;
                            text-align: center;
                            cursor: pointer;
                            transition: all 0.2s ease;
                            background: #2d3748;
                            color: #efeeeaff;
                        " onmouseover="this.style.borderColor='#d4af37'; this.style.backgroundColor='#374151'"
                           onmouseout="if(this.getAttribute('data-quantity') !== '${this.state.selectedQuantity?.rolls || ''}') { this.style.borderColor='#4a5568'; this.style.backgroundColor='#2d3748'; }"
                           data-quantity="${option.rolls}" data-coverage="${option.coverage}">
                            <div style="font-weight: 600; font-size: 0.9em; color: #efeeeaff; margin-bottom: 4px;">${option.rolls} roll${option.rolls > 1 ? 's' : ''}</div>
                            <div style="font-size: 0.75em; color: #cbd5e0;">${option.coverage} sq ft</div>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Promo Code Section -->
                <div style="background: #2d3748; border: 1px solid #4a5568; border-radius: 8px; padding: 16px; margin-top: 16px;">
                    <h5 style="margin: 0 0 12px 0; color: #efeeeaff; font-size: 0.95em;">Have a Promo Code?</h5>
                    <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                        <input
                            type="text"
                            id="promo-code-input"
                            placeholder="Enter code (e.g., FIRSTROLL25)"
                            style="
                                flex: 1;
                                padding: 10px 12px;
                                border: 1px solid #4a5568;
                                border-radius: 6px;
                                background: #1a202c;
                                color: #efeeeaff;
                                font-size: 0.9em;
                            "
                        />
                        <button
                            onclick="configFlow.applyPromoCode()"
                            style="
                                padding: 10px 20px;
                                background: #d4af37;
                                color: #1a202c;
                                border: none;
                                border-radius: 6px;
                                font-weight: 600;
                                cursor: pointer;
                                white-space: nowrap;
                                transition: background 0.2s;
                            "
                            onmouseover="this.style.background='#b8941f'"
                            onmouseout="this.style.background='#d4af37'"
                        >Apply</button>
                    </div>
                    <div id="promo-feedback" style="display: none; font-size: 0.85em; margin-top: 4px; font-weight: 500;"></div>
                </div>

                <!-- Price Summary -->
                <div id="price-summary" style="background: #2d3748; border: 1px solid #4a5568; border-radius: 8px; padding: 16px; margin-top: 16px; display: none;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9em; color: #cbd5e0;">
                        <span>Base Price:</span>
                        <span id="base-price" style="color: #d4af37;">$0</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9em; color: #cbd5e0;">
                        <span>Quantity:</span>
                        <span id="quantity-display" style="color: #efeeeaff;">0 rolls</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9em; color: #cbd5e0;">
                        <span>Coverage:</span>
                        <span id="coverage-display" style="color: #efeeeaff;">0 sq ft</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 1.1em; font-weight: 600; color: #efeeeaff; border-top: 1px solid #d4af37; padding-top: 8px; margin-top: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span>Total:</span>
                            <span id="discount-badge" style="display: none; background: #48bb78; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.7em; font-weight: 600;">25% OFF</span>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: flex-end;">
                            <span id="original-price" style="display: none; color: #cbd5e0; font-size: 0.85em; text-decoration: line-through; margin-bottom: 2px;">$0.00</span>
                            <span id="total-price" style="color: #d4af37;">$0.00</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 15px; padding-top: 20px; border-top: 1px solid #d4af37;">
                <button onclick="configFlow.goBack()" style="
                    background: #4a5568;
                    color: #efeeeaff;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: background 0.2s;
                " onmouseover="this.style.background='#2d3748'"
                   onmouseout="this.style.background='#4a5568'">← Back to Materials</button>
                
                <button id="add-to-cart-btn" onclick="configFlow.addSelectedToCart()" disabled style="
                    background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
                    color: #1a202c;
                    border: none;
                    padding: 14px 32px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 1rem;
                    transition: all 0.2s;
                    opacity: 0.5;
                " onmouseover="if(!this.disabled) { this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(212, 175, 55, 0.3)'; }"
                   onmouseout="if(!this.disabled) { this.style.transform='translateY(0)'; this.style.boxShadow='none'; }">
                    Add to Cart
                </button>
            </div>
        `;
        
        // Update thumbnail if we have a generated one
        if (this.state.pattern.preview) {
            setTimeout(() => {
                const thumbnailEl = modalContent.querySelector('#pattern-thumbnail-texture');
                if (thumbnailEl) {
                    thumbnailEl.innerHTML = `<img src="${this.state.pattern.preview}" style="width: 100%; height: 100%; object-fit: cover;" alt="${this.state.pattern.name}">`;
                }
            }, 100);
        }
        
        // Restore selection states after modal renders
        setTimeout(() => {
            this.updateTextureSelection();
            this.updateQuantitySelection();
            this.updatePriceSummary();
            this.updateAddToCartButton();
        }, 100);
        
        modalOverlay.appendChild(modalContent);
        return modalOverlay;
    }

    // ===== API INTERACTIONS =====
    
    /**
     * Fetch product variants from Shopify
     * @returns {Promise<Array>} Array of variant objects
     */
    async fetchProductVariants() {
        const productHandle = `custom-${this.state.category}`;
        
        try {
            const response = await fetch(`/products/${productHandle}.js`);
            if (!response.ok) throw new Error(`Product not found: ${productHandle}`);
            
            const product = await response.json();
            return product.variants.filter(variant => variant.available);
        } catch (error) {
            console.error('Failed to fetch product variants:', error);
            throw error;
        }
    }
    
    /**
     * Add item to cart using Shopify Cart API
     * @param {Object} cartItem - Cart item configuration
     */
    async addToCartAPI(cartItem) {
        try {
            const response = await fetch('/cart/add.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cartItem)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to add to cart');
            }
            
            const result = await response.json();
            console.log('✅ Added to cart:', result);
            
            // Trigger cart refresh if cart widget exists
            if (window.theme && window.theme.cart) {
                window.theme.cart.getCart();
            }
            
            return result;
        } catch (error) {
            console.error('Cart API error:', error);
            throw error;
        }
    }

    // ===== MODAL MANAGEMENT =====
    
    closeMaterialModal() {
        const modal = document.getElementById('material-modal');
        if (modal) modal.remove();
    }
    
    closeTextureModal() {
        const modal = document.getElementById('texture-modal'); 
        if (modal) modal.remove();
    }
    
    closeAllModals() {
        this.closeMaterialModal();
        this.closeTextureModal();
    }

    // ===== EVENT HANDLING =====
    
    bindEvents() {
        // Handle escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
        
        // Handle click outside modal to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('config-modal-overlay')) {
                this.closeAllModals();
            }
        });
    }

    // ===== UTILITY FUNCTIONS =====
    
    /**
     * CRITICAL FIX: Build complete ColorFlex properties from pattern state
     * This ensures all ColorFlex data is preserved when adding texture properties
     */
    buildColorFlexProperties() {
        try {
            const properties = {};
            
            // Build ColorFlex properties from pattern state (from URL parameters)
            if (this.state.pattern) {
                const pattern = this.state.pattern;
                
                // Core ColorFlex properties (matching CFM.js format)
                properties['Custom Pattern'] = pattern.name || pattern.patternName || 'Custom Pattern';
                properties['Pattern Collection'] = pattern.collection || 'unknown';
                properties['ColorFlex Design'] = 'Yes';
                properties['Pattern ID'] = pattern.id || this.generatePatternId(pattern, pattern.currentScale);
                properties['Save Date'] = new Date().toLocaleDateString();
                
                // Custom colors - format as comma-separated list with SW normalization
                if (pattern.colors && pattern.colors.length > 0) {
                    const colorRows = pattern.colors.filter((colorObj) => {
                        if (colorObj == null) return false;
                        if (typeof colorObj === 'string') return colorObj.trim() !== '';
                        const raw = colorObj.color != null ? colorObj.color : colorObj.name;
                        return raw != null && String(raw).trim() !== '';
                    });
                    const colorNames = colorRows.map((colorObj) => {
                        let colorName;
                        if (typeof colorObj === 'string') {
                            colorName = colorObj;
                        } else if (colorObj && typeof colorObj === 'object') {
                            colorName = colorObj.color || colorObj.name || colorObj.value || 'Unknown Color';
                        } else {
                            colorName = String(colorObj || 'Unknown Color');
                        }

                        // 🎯 NORMALIZE TO SW FORMAT
                        return this.normalizeColorToSwFormat(colorName);
                    }).filter((color) => color && color !== 'Unknown Color');

                    properties['Custom Colors'] = colorNames.join(', ');
                    console.log('🔍 CART FIX: Built normalized colors list:', properties['Custom Colors']);
                }
                
                // 🔧 CRITICAL: Capture thumbnail if not already present
                if (!pattern.preview && typeof window.capturePatternThumbnail === 'function') {
                    console.log('📸 Capturing thumbnail in buildColorFlexProperties...');
                    try {
                        const thumbnail = window.capturePatternThumbnail();
                        if (thumbnail) {
                            pattern.preview = thumbnail;
                            this.state.pattern.preview = thumbnail; // Update state too
                            localStorage.setItem('colorflexCurrentThumbnail', thumbnail);
                            console.log('✅ Thumbnail captured');
                        }
                    } catch (error) {
                        console.error('❌ Error capturing thumbnail:', error);
                    }
                } else if (!pattern.preview) {
                    // Try to get from localStorage as fallback
                    const storedThumbnail = localStorage.getItem('colorflexCurrentThumbnail');
                    if (storedThumbnail) {
                        pattern.preview = storedThumbnail;
                        this.state.pattern.preview = storedThumbnail;
                        console.log('✅ Retrieved thumbnail from localStorage in buildColorFlexProperties');
                    }
                }
                
                // Include pattern preview (thumbnail) if available
                // Store base64 thumbnail - product page will upload to Shopify Files
                if (pattern.preview) {
                    // Store base64 thumbnail in localStorage for product page to upload
                    // The product page will handle uploading to Shopify Files and adding to cart
                    try {
                        localStorage.setItem('colorflexCurrentThumbnail', pattern.preview);
                        console.log('✅ Stored thumbnail in localStorage for product page upload');
                    } catch (error) {
                        console.warn('⚠️ Failed to store thumbnail in localStorage:', error);
                    }
                    
                    // Don't add base64 to properties (too large for Shopify property limit)
                    // The product page will upload it and add the URL to properties
                    console.log('🔍 Thumbnail stored in localStorage, will be uploaded by product page');
                } else {
                    console.warn('⚠️ No pattern preview available for cart');
                }
                
                // Technical properties for thumbnail restoration (must match theme + CFM localStorage)
                const rawId = pattern.id || this.generatePatternId(pattern, pattern.currentScale);
                const thumbnailKey = rawId
                    ? ('cart_thumbnail_' + String(rawId).replace(/[^a-zA-Z0-9-]/g, '_'))
                    : ('cart_thumbnail_' + String(pattern.name || 'pattern').replace(/[^a-zA-Z0-9-]/g, '_') + '_' + Date.now());
                properties['Thumbnail Key'] = thumbnailKey;

                // Promo code metadata (if applied)
                if (this.state.promoApplied && this.state.promoCode) {
                    properties['Promo Code'] = this.state.promoCode;
                    properties['Discount'] = '25% off first roll';
                    console.log('🎫 PROMO: Added promo code to cart properties:', this.state.promoCode);
                }

                console.log('🔍 CART FIX: Built ColorFlex properties from pattern state:', {
                    pattern: properties['Custom Pattern'],
                    collection: properties['Pattern Collection'],
                    colors: properties['Custom Colors'],
                    hasPreview: !!properties['_pattern_preview'],
                    thumbnailKey: properties['Thumbnail Key'],
                    promoCode: properties['Promo Code'] || 'none'
                });
            }
            
            // Also read any existing form properties (fallback/additional)
            const productForm = document.querySelector('form[action*="/cart/add"]') || 
                               document.querySelector('.product-form') ||
                               document.querySelector('[data-product-form]');
            
            if (productForm) {
                const propertyInputs = productForm.querySelectorAll('input[name^="properties["]');
                console.log(`🔍 CART FIX: Found ${propertyInputs.length} existing form properties`);
                
                propertyInputs.forEach(input => {
                    try {
                        const nameMatch = input.name.match(/properties\[(.+)\]/);
                        if (nameMatch && input.value && !properties[nameMatch[1]]) {
                            // Only add if we don't already have this property from pattern state
                            properties[nameMatch[1]] = input.value;
                            console.log(`🔍 CART FIX: Added form property "${nameMatch[1]}" = "${input.value}"`);
                        }
                    } catch (error) {
                        console.warn('🔍 CART FIX: Error reading form property:', error);
                    }
                });
            }
            
            console.log('🔍 CART FIX: Final properties count:', Object.keys(properties).length);
            return properties;
            
        } catch (error) {
            console.error('🔍 CART FIX: Error building ColorFlex properties:', error);
            return {};
        }
    }
    
    /**
     * Add ColorFlex properties as hidden inputs to the product form
     * This ensures properties are included in the standard form submission
     */
    addPropertiesToForm(properties) {
        try {
            console.log('🔧 Adding ColorFlex properties to form:', Object.keys(properties).length, 'properties');
            
            // Find the product form
            const productForm = document.querySelector('form[action*="/cart/add"]') || 
                               document.querySelector('product-form form') ||
                               document.querySelector('[data-product-form] form') ||
                               document.querySelector('.product-form form');
            
            if (!productForm) {
                console.error('❌ Product form not found! Cannot add ColorFlex properties');
                return false;
            }
            
            console.log('✅ Found product form:', productForm);
            
            // Remove any existing ColorFlex properties to avoid duplicates
            const existingInputs = productForm.querySelectorAll('input[name^="properties["][data-colorflex="true"]');
            existingInputs.forEach(input => {
                console.log('🔄 Removing existing ColorFlex input:', input.name);
                input.remove();
            });
            
            // Add each property as a hidden input
            let addedCount = 0;
            Object.entries(properties).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = `properties[${key}]`;
                    input.value = String(value);
                    input.setAttribute('data-colorflex', 'true');
                    
                    productForm.appendChild(input);
                    console.log(`✅ Added property: ${key} = ${value}`);
                    addedCount++;
                }
            });
            
            console.log(`🎯 Successfully added ${addedCount} ColorFlex properties to form`);
            
            // Verify the properties were added
            const verification = productForm.querySelectorAll('input[name^="properties["]');
            console.log('🔍 Form now has', verification.length, 'total property inputs');
            
            return true;
            
        } catch (error) {
            console.error('❌ Error adding properties to form:', error);
            return false;
        }
    }
    
    /**
     * Redirect to actual Shopify product page (Custom Wallpaper or Custom Fabric)
     * Pattern data is passed as URL parameters and will become line item properties
     */
    redirectToProductPage(cartItem) {
        try {
            // Look up the correct product handle based on selected material
            const selectedMaterial = this.materials.find(m => m.id === this.state.category);
            const productHandle = selectedMaterial ? selectedMaterial.productHandle : 'custom-wallpaper';
            
            // Build URL with pattern data that will become line item properties
            const params = new URLSearchParams();
            
            // Pattern information (will be added as line item properties)
            params.set('pattern_name', this.state.pattern.name || this.state.pattern.patternName);
            params.set('collection', this.state.pattern.collection);
            params.set('colorflex_design', 'true');
            params.set('source', 'colorflex_configuration_flow');
            
            // Color information with SW normalization (skip null/empty/shadow slots from older saves)
            const colorRows = (this.state.pattern.colors || []).filter((colorObj) => {
                if (colorObj == null) return false;
                if (typeof colorObj === 'string') return colorObj.trim() !== '';
                const raw = colorObj.color != null ? colorObj.color : colorObj.name;
                return raw != null && String(raw).trim() !== '';
            });
            const colorNames = colorRows.map((colorObj) => {
                let colorName;
                if (typeof colorObj === 'string') {
                    colorName = colorObj;
                } else {
                    colorName = colorObj.color || colorObj.name || '';
                }
                return this.normalizeColorToSwFormat(colorName);
            }).filter((color) => color && color !== 'Unknown Color');

            if (colorNames.length > 0) {
                params.set('custom_colors', colorNames.join(','));
            }

            // Scale information
            if (this.state.pattern.currentScale && this.state.pattern.currentScale !== 100) {
                params.set('scale', this.state.pattern.currentScale);
            }
            
            // Material and texture selection (for variant pre-selection)
            params.set('selected_category', this.state.category);
            if (this.state.variant && this.state.variant.name) {
                params.set('selected_texture', this.state.variant.name);
            }
            if (this.state.variant && (this.state.variant.id != null || this.state.variant.name)) {
                params.set('preselect_variant', this.state.variant.id || this.state.variant.name);
            }
            
            // Pattern metadata
            if (this.state.pattern.id) {
                params.set('pattern_id', this.state.pattern.id);
            }

            // Promo code information (if applied)
            if (this.state.promoApplied && this.state.promoCode) {
                params.set('promo_code', this.state.promoCode);
                params.set('promo_discount', '25');
                console.log('🎫 PROMO: Added promo code to URL params:', this.state.promoCode);
            }

            // Store complete properties for product page to access
            if (cartItem && cartItem.properties) {
                this.storePropertiesForProductPage(cartItem.properties);
            }
            
            // Construct final URL to ACTUAL product
            const productUrl = `/products/${productHandle}?${params.toString()}`;
            
            console.log('🔄 Redirecting to ACTUAL Shopify product:', productHandle);
            console.log('📦 URL:', productUrl);
            console.log('🎨 Pattern will be added as line item properties:', {
                pattern: this.state.pattern.name,
                colors: colorNames,
                category: this.state.category,
                texture: this.state.variant.name
            });
            
            // Close modal and redirect
            this.closeTextureModal();
            this.closeMaterialModal();
            
            // Redirect to the ACTUAL product page
            window.location.href = productUrl;
            
        } catch (error) {
            console.error('❌ Error redirecting to product page:', error);
            
            // Fallback to direct cart addition if redirect fails
            console.log('🔄 Falling back to direct cart addition...');
            this.addToCartAPI(cartItem).then(() => {
                this.closeTextureModal();
                this.showSuccessMessage();
                this.clearState();
            }).catch(cartError => {
                console.error('❌ Fallback cart addition also failed:', cartError);
                this.showErrorMessage('Failed to add to cart. Please try again.');
            });
        }
    }
    
    /**
     * Store ColorFlex properties persistently for product page integration
     * This allows product pages to access full ColorFlex data even when accessed separately
     */
    storePropertiesForProductPage(properties) {
        try {
            const storageKey = 'colorflex_current_properties';
            const storageData = {
                properties: properties,
                timestamp: Date.now(),
                patternName: this.state.pattern?.name || this.state.pattern?.patternName,
                category: this.state.category,
                texture: this.state.variant?.name
            };
            
            localStorage.setItem(storageKey, JSON.stringify(storageData));
            console.log('💾 Stored ColorFlex properties for product page access:', Object.keys(properties).length, 'properties');
            
            return true;
        } catch (error) {
            console.error('❌ Failed to store ColorFlex properties:', error);
            return false;
        }
    }

    // 🎯 TITLE CASE HELPER (matches CFM.js function)
    toTitleCase(str) {
        if (!str) return '';
        return str.toLowerCase().split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    // 🎯 NORMALIZE COLOR TO SW FORMAT (matches CFM.js function)
    // Converts color names to consistent "SW#### COLORNAME" format for cart display
    normalizeColorToSwFormat(colorName) {
        if (!colorName || typeof colorName !== 'string') {
            return 'Unknown Color';
        }

        // If already in SW format, return formatted
        const swMatch = colorName.match(/\b(SW|SC)\s*(\d+)\s+(.+)/i);
        if (swMatch) {
            const prefix = swMatch[1].toUpperCase();
            const number = swMatch[2];
            const name = swMatch[3].toUpperCase();
            return `${prefix}${number} ${name}`;
        }

        // Try to find SW number by reverse lookup (if colorsData available)
        if (window.appState && window.appState.colorsData) {
            const cleanedColorName = colorName.toLowerCase().trim();
            const colorEntry = window.appState.colorsData.find(c =>
                c && typeof c.color_name === 'string' &&
                c.color_name.toLowerCase() === cleanedColorName
            );

            if (colorEntry && colorEntry.sw_number) {
                const formattedName = colorName.toUpperCase();
                return `SW${colorEntry.sw_number} ${formattedName}`;
            }
        }

        // Return original name if no SW number found, with proper title case
        return this.toTitleCase(colorName);
    }

    generatePatternId(patternData, currentScale) {
        console.log('🔍 PRODUCTCONFIGFLOW generatePatternId called with:', {
            patternData,
            currentScale
        });

        // Generate ID using CFM.js format for consistency: pattern name + SW numbers + scale
        const patternName = (patternData.name || patternData.patternName || 'unknown').toLowerCase().replace(/[^a-z0-9]/g, '');
        console.log('📝 Clean pattern name:', patternName);

        // Extract SW/SC numbers from colors (matching CFM.js format exactly)
        const colors = patternData.colors || [];
        console.log('🎨 Colors to process:', colors);
        const swNumbers = [];

        colors.forEach(colorObj => {
            let colorName = '';
            if (typeof colorObj === 'string') {
                colorName = colorObj;
            } else if (colorObj && (colorObj.color || colorObj.name)) {
                colorName = colorObj.color || colorObj.name;
            }

            if (colorName) {
                // First, try to find SW/SC numbers directly in the color name
                const swMatch = colorName.match(/\b(SW|SC)\s*(\d+)\b/i);
                if (swMatch) {
                    const prefix = swMatch[1].toUpperCase();
                    const number = swMatch[2];

                    if (prefix === 'SC') {
                        // SC colors are Saffron Cottage proprietary - keep SC prefix
                        swNumbers.push('sc' + number);
                    } else {
                        // SW colors are Sherwin-Williams - just use number
                        swNumbers.push(number);
                    }
                } else {
                    // If no SW/SC found, try to reverse-lookup from colorsData
                    if (window.appState && window.appState.colorsData) {
                        const cleanedColorName = colorName.toLowerCase().trim();
                        const colorEntry = window.appState.colorsData.find(c =>
                            c && typeof c.color_name === 'string' &&
                            c.color_name.toLowerCase() === cleanedColorName
                        );

                        if (colorEntry && colorEntry.sw_number) {
                            const swNumber = colorEntry.sw_number;
                            const prefix = swNumber.substring(0, 2).toUpperCase();
                            const number = swNumber.substring(2);

                            if (prefix === 'SC') {
                                swNumbers.push('sc' + number);
                            } else if (prefix === 'SW') {
                                swNumbers.push(number);
                            }
                        }
                    }
                }
            }
        });

        // Combine pattern name + sw numbers
        let id = patternName;
        if (swNumbers.length > 0) {
            id += '-' + swNumbers.join('-');
        }

        // ✅ APPEND SCALE if not 100% (matching CFM.js format)
        const scale = currentScale || patternData.currentScale || 100;
        if (scale !== 100) {
            if (scale === 50) id += '-0.5x';
            else if (scale === 200) id += '-2x';
            else if (scale === 300) id += '-3x';
            else if (scale === 400) id += '-4x';
            else id += `-${scale}pct`;
            console.log(`📏 Appended scale to ID: ${scale}% → ${id}`);
        }

        // Add timestamp for uniqueness if ID gets too long
        if (id.length > 50) {
            id = id.substring(0, 30) + '-' + Date.now().toString().slice(-6);
        }

        return id; // Return format like: acadia-6158-7694-sc0001-2x
    }
    
    getTextureDescription(textureName) {
        const descriptions = {
            'Smooth': 'Matte finish, easy application, modern look',
            'Rough': 'Natural texture, rustic feel, hides imperfections', 
            'Textured': 'Raised texture, premium feel, dimensional look'
        };
        return descriptions[textureName] || 'Premium quality finish';
    }
    
    getQuantityOptions() {
        return [
            { rolls: 1, coverage: 30 },
            { rolls: 2, coverage: 60 },
            { rolls: 3, coverage: 90 },
            { rolls: 5, coverage: 150 },
            { rolls: 10, coverage: 300 },
            { rolls: 15, coverage: 450 }
        ];
    }
    
    selectTexture(variantId, title, price) {
        // Store selection
        this.state.selectedTexture = { id: variantId, title, price: parseFloat(price) };
        this.saveState();
        
        // Update visual selection state
        this.updateTextureSelection();
        this.updatePriceSummary();
    }
    
    /**
     * Validate and apply promo code
     * @param {string} code - Promo code entered by user
     * @returns {Object} - Result with success status and message
     */
    validatePromoCode(code) {
        const normalizedCode = (code || '').trim().toUpperCase();

        console.log('🎫 Validating promo code:', normalizedCode);

        // Check if already used this session
        if (this.state.promoUsed) {
            return {
                success: false,
                message: 'Promo code already used in this session'
            };
        }

        // Check if valid promo code
        if (normalizedCode === 'FIRSTROLL25') {
            // Additional eligibility checks could go here
            // (e.g., check if customer has ordered before)

            this.state.promoCode = normalizedCode;
            this.state.promoApplied = true;
            this.state.promoUsed = true;
            this.saveState();

            console.log('✅ Promo code applied:', normalizedCode);

            return {
                success: true,
                message: '25% discount applied!'
            };
        }

        return {
            success: false,
            message: 'Invalid promo code'
        };
    }

    /**
     * Apply promo code from UI input
     */
    applyPromoCode() {
        const input = document.getElementById('promo-code-input');
        const feedback = document.getElementById('promo-feedback');

        if (!input || !feedback) return;

        const code = input.value;
        const result = this.validatePromoCode(code);

        // Show feedback message
        feedback.textContent = result.message;
        feedback.style.display = 'block';

        if (result.success) {
            feedback.style.backgroundColor = '#d4edda';
            feedback.style.color = '#155724';
            feedback.style.border = '1px solid #c3e6cb';
            input.disabled = true;
            input.style.backgroundColor = '#e6f7ed';
            input.style.borderColor = '#48bb78';

            // Update price summary with discount (if on texture modal)
            this.updatePriceSummary();
        } else {
            feedback.style.backgroundColor = '#f8d7da';
            feedback.style.color = '#721c24';
            feedback.style.border = '1px solid #f5c6cb';
        }
    }

    /**
     * Remove applied promo code
     */
    removePromoCode() {
        this.state.promoCode = null;
        this.state.promoApplied = false;
        this.saveState();

        const input = document.getElementById('promo-code-input');
        const feedback = document.getElementById('promo-feedback');

        if (input) {
            input.value = '';
            input.disabled = false;
            input.style.backgroundColor = '#ffffff';
        }

        if (feedback) {
            feedback.style.display = 'none';
        }

        // Update price summary without discount
        this.updatePriceSummary();

        console.log('❌ Promo code removed');
    }

    selectQuantity(rolls, coverage) {
        // Store selection
        this.state.selectedQuantity = { rolls: parseInt(rolls), coverage: parseInt(coverage) };
        this.saveState();

        // Update visual selection state
        this.updateQuantitySelection();
        this.updatePriceSummary();
        this.updateAddToCartButton();
    }
    
    updateTextureSelection() {
        // Reset all texture cards
        document.querySelectorAll('[data-variant-id]').forEach(card => {
            card.style.borderColor = '#e0e0e0';
            card.style.backgroundColor = 'white';
            card.style.transform = 'translateY(0)';
        });
        
        // Highlight selected texture
        if (this.state.selectedTexture) {
            const selectedCard = document.querySelector(`[data-variant-id="${this.state.selectedTexture.id}"]`);
            if (selectedCard) {
                selectedCard.style.borderColor = '#d4af37';
                selectedCard.style.backgroundColor = '#fffbf0';
                selectedCard.style.transform = 'translateY(-2px)';
                selectedCard.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.3)';
            }
        }
    }
    
    updateQuantitySelection() {
        // Reset all quantity options
        document.querySelectorAll('[data-quantity]').forEach(option => {
            option.style.borderColor = '#e0e0e0';
            option.style.backgroundColor = 'white';
            option.style.color = '#333';
        });
        
        // Highlight selected quantity
        if (this.state.selectedQuantity) {
            const selectedOption = document.querySelector(`[data-quantity="${this.state.selectedQuantity.rolls}"]`);
            if (selectedOption) {
                selectedOption.style.borderColor = '#d4af37';
                selectedOption.style.backgroundColor = '#fffbf0';
                selectedOption.style.color = '#d4af37';
                selectedOption.style.fontWeight = '600';
            }
        }
    }
    
    updatePriceSummary() {
        const summary = document.getElementById('price-summary');
        const basePrice = document.getElementById('base-price');
        const quantityDisplay = document.getElementById('quantity-display');
        const coverageDisplay = document.getElementById('coverage-display');
        const totalPrice = document.getElementById('total-price');
        const originalPrice = document.getElementById('original-price');
        const discountBadge = document.getElementById('discount-badge');

        if (this.state.selectedTexture && this.state.selectedQuantity) {
            const subtotal = this.state.selectedTexture.price * this.state.selectedQuantity.rolls;
            let finalTotal = subtotal;

            // Apply promo discount if active
            if (this.state.promoApplied && this.state.promoCode === 'FIRSTROLL25') {
                finalTotal = subtotal * 0.75; // 25% off

                // Show original price struck through
                if (originalPrice) {
                    originalPrice.textContent = `$${subtotal.toFixed(2)}`;
                    originalPrice.style.display = 'inline';
                }

                // Show discount badge
                if (discountBadge) {
                    discountBadge.style.display = 'inline-block';
                }
            } else {
                // Hide discount UI elements
                if (originalPrice) originalPrice.style.display = 'none';
                if (discountBadge) discountBadge.style.display = 'none';
            }

            basePrice.textContent = `$${this.state.selectedTexture.price}`;
            quantityDisplay.textContent = `${this.state.selectedQuantity.rolls} roll${this.state.selectedQuantity.rolls > 1 ? 's' : ''}`;
            coverageDisplay.textContent = `${this.state.selectedQuantity.coverage} sq ft`;
            totalPrice.textContent = `$${finalTotal.toFixed(2)}`;

            summary.style.display = 'block';
        }
    }
    
    updateAddToCartButton() {
        const button = document.getElementById('add-to-cart-btn');
        if (!button) return;
        
        if (this.state.selectedTexture && this.state.selectedQuantity) {
            button.disabled = false;
            button.style.opacity = '1';
            button.style.cursor = 'pointer';
            button.textContent = `Add ${this.state.selectedQuantity.rolls} Roll${this.state.selectedQuantity.rolls > 1 ? 's' : ''} to Cart`;
        } else {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            button.textContent = 'Select Options';
        }
    }
    
    async addSelectedToCart() {
        if (!this.state.selectedTexture || !this.state.selectedQuantity) {
            this.showErrorMessage('Please select texture and quantity');
            return;
        }
        
        // Capture pattern preview directly from canvas before adding to cart
        if (!this.state.pattern.preview) {
            console.log('🎨 Capturing pattern preview from canvas for cart...');
            this.state.pattern.preview = this.capturePatternFromCanvas();
            
            if (this.state.pattern.preview) {
                console.log('✅ Pattern preview captured successfully');
                this.saveState();
            } else {
                console.log('⚠️ Canvas capture failed, continuing without preview');
            }
        } else {
            console.log('✅ Using existing pattern preview for cart');
        }
        
        const variantData = {
            id: this.state.selectedTexture.id,
            title: this.state.selectedTexture.title,
            price: this.state.selectedTexture.price
        };
        
        // Use the existing selectTextureAndAddToCart method but with custom quantity
        this.state.customQuantity = this.state.selectedQuantity.rolls;
        await this.selectTextureAndAddToCart(this.state.selectedTexture.id, variantData);
    }
    
    async capturePatternFromCanvas() {
        console.log('📸 Using ColorFlex built-in thumbnail capture method (same as Save to My List)...');
        
        // First try to use the exact same method as "Save to My List"
        if (typeof window.capturePatternThumbnailBuiltIn === 'function') {
            console.log('✅ Found capturePatternThumbnailBuiltIn function, using it...');
            try {
                const thumbnail = await window.capturePatternThumbnailBuiltIn();
                if (thumbnail && thumbnail.length > 1000) {
                    console.log('🎨 Successfully captured pattern using built-in method');
                    return thumbnail;
                } else {
                    console.log('⚠️ Built-in capture returned null or too small, trying manual recreation...');
                }
            } catch (error) {
                console.log('❌ Error with built-in capture:', error.message);
            }
        } else {
            console.log('⚠️ capturePatternThumbnailBuiltIn function not available');
        }
        
        // Try to recreate the pattern using the same logic as the built-in function
        console.log('🔄 Attempting to recreate pattern thumbnail using ColorFlex logic...');
        
        if (typeof window.appState !== 'undefined' && window.appState.currentPattern && typeof window.lookupColor === 'function') {
            try {
                console.log('✅ Found appState and lookupColor, recreating pattern...');
                
                const isWall = window.appState.currentPattern?.isWall || window.appState.selectedCollection?.name === "wall-panels";
                const backgroundIndex = isWall ? 1 : 0;
                const backgroundInput = window.appState.layerInputs?.[backgroundIndex]?.input;
                
                if (!backgroundInput) {
                    console.warn('⚠️ Background input not found, using fallback');
                    return this.createFallbackPreview();
                }
                
                const backgroundColor = window.lookupColor(backgroundInput.value);
                console.log('📸 Using background color:', backgroundColor, 'from input:', backgroundInput.value);
                
                // Create thumbnail canvas with same logic as capturePatternThumbnailBuiltIn
                const thumbCanvas = document.createElement('canvas');
                const thumbCtx = thumbCanvas.getContext('2d', { willReadFrequently: true });
                thumbCanvas.width = 400; // Smaller for performance
                thumbCanvas.height = 400;
                
                // Fill background
                thumbCtx.fillStyle = backgroundColor || '#f5f5f5';
                thumbCtx.fillRect(0, 0, 400, 400);
                
                // Add pattern layers if available (simplified version)
                if (window.appState.currentPattern?.layers?.length) {
                    console.log('📸 Found pattern layers, processing...');
                    // This is a simplified version - the full logic is quite complex
                    // For now, just add a visual indicator that this is a custom pattern
                    thumbCtx.fillStyle = 'rgba(0,0,0,0.05)';
                    thumbCtx.fillRect(20, 20, 360, 360);
                }
                
                // Add pattern name overlay
                thumbCtx.fillStyle = 'rgba(0,0,0,0.7)';
                thumbCtx.fillRect(0, 360, 400, 40);
                thumbCtx.fillStyle = 'white';
                thumbCtx.font = 'bold 14px Arial';
                thumbCtx.textAlign = 'center';
                thumbCtx.fillText(this.state.pattern.name || 'Custom Pattern', 200, 382);
                
                const dataUrl = thumbCanvas.toDataURL('image/jpeg', 0.8);
                console.log('✅ Pattern thumbnail recreated using ColorFlex logic');
                return dataUrl;
                
            } catch (error) {
                console.log('❌ Error recreating pattern:', error.message);
            }
        }
        
        console.log('🎨 Using fallback preview (ColorFlex data not available)...');
        return this.createFallbackPreview();
    }
    
    createFallbackPreview() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 200;
            canvas.height = 200;
            
            // Create a basic pattern preview with colors
            ctx.fillStyle = '#f7fafc';
            ctx.fillRect(0, 0, 200, 200);
            
            // Add pattern name text
            ctx.fillStyle = '#1a202c';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.state.pattern.name || 'Custom Pattern', 100, 30);
            
            // Show colors if available
            if (this.state.pattern.colors && this.state.pattern.colors.length > 0) {
                const colorHeight = 140 / this.state.pattern.colors.length;
                const startY = 50;
                
                this.state.pattern.colors.forEach((colorObj, index) => {
                    const color = typeof colorObj === 'string' ? colorObj : 
                                (colorObj.color || colorObj.name || '#cccccc');
                    
                    ctx.fillStyle = color;
                    ctx.fillRect(50, startY + (index * colorHeight), 100, colorHeight);
                    
                    // Add color name
                    ctx.fillStyle = '#1a202c';
                    ctx.font = '12px Arial';
                    ctx.textAlign = 'left';
                    ctx.fillText(
                        typeof colorObj === 'string' ? colorObj : (colorObj.name || colorObj.color || 'Color'),
                        160, startY + (index * colorHeight) + (colorHeight / 2)
                    );
                });
            } else {
                // Show a simple pattern placeholder
                ctx.fillStyle = '#d4af37';
                ctx.fillRect(50, 50, 100, 100);
                ctx.fillStyle = '#1a202c';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Custom Pattern', 100, 105);
            }
            
            // Add ColorFlex branding
            ctx.fillStyle = '#d4af37';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('ColorFlex', 100, 180);
            
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            console.log('✅ Fallback preview created');
            return dataUrl;
            
        } catch (error) {
            console.error('❌ Failed to create fallback preview:', error);
            return null;
        }
    }
    
    showSuccessMessage() {
        // Create temporary success notification
        const message = document.createElement('div');
        message.className = 'config-success-message';
        message.innerHTML = `
            <div class="success-content">
                ✅ Added to cart successfully!<br>
                <small>${this.state.pattern.name} • ${this.state.category} • ${this.state.variant.name}</small>
            </div>
        `;
        document.body.appendChild(message);
        
        setTimeout(() => message.remove(), 3000);
    }
    
    showErrorMessage(errorText) {
        const message = document.createElement('div');
        message.className = 'config-error-message';
        message.innerHTML = `
            <div class="error-content">
                ❌ ${errorText}<br>
                <button onclick="this.parentElement.parentElement.remove()">OK</button>
            </div>
        `;
        document.body.appendChild(message);
    }
    
}

// Export for module usage or global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductConfigurationFlow;
} else {
    window.ProductConfigurationFlow = ProductConfigurationFlow;
}

// ===== GLOBAL CART FORM INTEGRATION =====

/**
 * Global hook to ensure ColorFlex properties are included in ANY cart submission
 * This works as a safety net for direct "Add to Cart" clicks without texture flow
 */
function setupGlobalColorFlexCartHook() {
    console.log('🔧 Setting up global ColorFlex cart submission hook...');
    
    // Find all product forms
    const productForms = document.querySelectorAll('form[action*="/cart/add"], product-form form');
    
    productForms.forEach(form => {
        if (form._colorflexHookAdded) return; // Avoid duplicate hooks
        
        form.addEventListener('submit', function(event) {
            console.log('🔍 Form submission detected, checking for ColorFlex data...');
            
            // Check if this is a ColorFlex product (has pattern data in URL or state)
            const urlParams = new URLSearchParams(window.location.search);
            const hasColorFlexParams = urlParams.get('pattern_name') || urlParams.get('custom_colors') || 
                                      urlParams.get('colorflex_design') || urlParams.get('source') === 'colorflex_saved_patterns';
            
            if (hasColorFlexParams) {
                console.log('🎨 ColorFlex product detected in form submission');
                
                // Check if ColorFlex properties are already in the form
                const existingColorFlexInputs = form.querySelectorAll('input[name^="properties["][data-colorflex="true"]');
                
                if (existingColorFlexInputs.length === 0) {
                    console.log('⚠️ No ColorFlex properties found in form, attempting to add...');
                    
                    // First, try to get complete stored properties from ProductConfigurationFlow
                    let properties = getStoredColorFlexProperties();
                    
                    // If no stored properties, try to extract basic ones from URL
                    if (Object.keys(properties).length === 0) {
                        console.log('📥 No stored properties, extracting from URL...');
                        properties = extractBasicPropertiesFromURL();
                    } else {
                        console.log('📦 Found stored ColorFlex properties:', Object.keys(properties).length);
                    }
                    
                    if (Object.keys(properties).length > 0) {
                        addPropertiesToForm(properties, form);
                        console.log('✅ Added ColorFlex properties to form');
                    }
                } else {
                    console.log('✅ ColorFlex properties already present in form:', existingColorFlexInputs.length);
                }
            }
        });
        
        form._colorflexHookAdded = true;
    });
    
    console.log('✅ Global ColorFlex cart hook setup complete for', productForms.length, 'forms');
}

/**
 * Retrieve stored ColorFlex properties from ProductConfigurationFlow
 * This provides access to complete properties on product pages
 */
function getStoredColorFlexProperties() {
    try {
        const storageKey = 'colorflex_current_properties';
        const stored = localStorage.getItem(storageKey);
        
        if (!stored) {
            console.log('📭 No stored ColorFlex properties found');
            return {};
        }
        
        const data = JSON.parse(stored);
        
        // Check if data is recent (within last hour to avoid stale data)
        const maxAge = 60 * 60 * 1000; // 1 hour in milliseconds
        if (Date.now() - data.timestamp > maxAge) {
            console.log('⏰ Stored ColorFlex properties are stale, ignoring');
            localStorage.removeItem(storageKey);
            return {};
        }
        
        console.log('📦 Retrieved stored ColorFlex properties:', Object.keys(data.properties).length, 'properties');
        console.log('🎨 Pattern:', data.patternName, 'Category:', data.category, 'Texture:', data.texture);
        
        return data.properties || {};
        
    } catch (error) {
        console.error('❌ Error retrieving stored ColorFlex properties:', error);
        return {};
    }
}

/**
 * Extract basic ColorFlex properties from URL parameters
 */
function extractBasicPropertiesFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const properties = {};
    
    if (urlParams.get('pattern_name')) {
        properties['Custom Pattern'] = decodeURIComponent(urlParams.get('pattern_name'));
    }
    
    if (urlParams.get('collection')) {
        properties['Pattern Collection'] = decodeURIComponent(urlParams.get('collection'));
    }
    
    if (urlParams.get('custom_colors')) {
        properties['Custom Colors'] = decodeURIComponent(urlParams.get('custom_colors'));
    }
    
    if (urlParams.get('colorflex_design')) {
        properties['ColorFlex Design'] = 'Yes';
    }
    
    if (urlParams.get('source') === 'colorflex_saved_patterns') {
        properties['ColorFlex Design'] = 'Yes';
        properties['Pattern Source'] = 'Saved Pattern';
    }
    
    properties['Configuration Date'] = new Date().toLocaleDateString();
    
    return properties;
}

/**
 * Add properties to a specific form as hidden inputs
 */
function addPropertiesToForm(properties, targetForm) {
    try {
        console.log('🔧 Adding ColorFlex properties to form:', Object.keys(properties).length, 'properties');
        
        if (!targetForm) {
            console.error('❌ Target form not provided');
            return false;
        }
        
        // Remove any existing ColorFlex properties to avoid duplicates
        const existingInputs = targetForm.querySelectorAll('input[name^="properties["][data-colorflex="true"]');
        existingInputs.forEach(input => {
            console.log('🔄 Removing existing ColorFlex input:', input.name);
            input.remove();
        });
        
        // Add each property as a hidden input
        let addedCount = 0;
        Object.entries(properties).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = `properties[${key}]`;
                input.value = String(value);
                input.setAttribute('data-colorflex', 'true');
                
                targetForm.appendChild(input);
                console.log(`✅ Added property: ${key} = ${value}`);
                addedCount++;
            }
        });
        
        console.log(`🎯 Successfully added ${addedCount} ColorFlex properties to form`);
        return true;
        
    } catch (error) {
        console.error('❌ Error adding properties to form:', error);
        return false;
    }
}

// Initialize global cart hook when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        setupGlobalColorFlexCartHook();
    }, 1500);
});

console.log('✅ ProductConfigurationFlow v2.1 loaded - Enhanced cart integration with global hooks');