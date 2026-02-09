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
            category: null,        // 'wallpaper' or 'fabric'
            variant: null,         // Shopify variant ID
            step: 'pattern',       // 'pattern' → 'category' → 'texture' → 'cart'
            selectedTexture: null, // Store selected texture info
            selectedQuantity: null // Store selected quantity info
        };
        
        this.materials = [
            {
                id: 'wallpaper',
                name: 'Wallpaper',
                productHandle: 'custom-wallpaper',
                icon: '/assets/wallpaper-icon.jpg',
                description: 'Removable, various textures, perfect for walls',
                priceFrom: '$45'
            },
            {
                id: 'fabric', 
                name: 'Fabric',
                productHandle: 'custom-fabric',
                icon: '/assets/fabric-icon.jpg',
                description: 'Upholstery, curtains, various weights',
                priceFrom: '$38'
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
        console.log('🎯 Starting configuration flow for pattern:', patternData.patternName);
        
        this.state.pattern = {
            id: patternData.id || this.generatePatternId(patternData),
            name: patternData.patternName,
            collection: patternData.collection || 'unknown',
            colors: patternData.colors || [],
            preview: patternData.patternPreview || null
        };
        
        this.state.step = 'category';
        this.saveState();
        this.showMaterialModal();
    }
    
    /**
     * Handle material category selection
     * @param {String} categoryId - 'wallpaper' or 'fabric'
     */
    selectMaterial(categoryId) {
        console.log('🎯 Material selected:', categoryId);
        
        this.state.category = categoryId;
        this.state.step = 'texture';
        this.saveState();
        
        this.closeMaterialModal();
        this.showTextureModal();
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
        
        // Extract color names properly (not objects)
        const colorNames = this.state.pattern.colors.map(colorObj => {
            if (typeof colorObj === 'string') return colorObj;
            return colorObj.color || colorObj.name || JSON.stringify(colorObj);
        }).join(', ');
        
        // Build cart configuration matching CFM.js format
        const cartItem = {
            id: variantId,
            quantity: this.state.customQuantity || this.state.selectedQuantity?.rolls || 1,
            properties: {
                // Main cart properties (matching CFM.js format)
                'Pattern Name': this.state.pattern.name,
                'Collection': this.state.pattern.collection,
                'Material': this.state.category === 'wallpaper' ? 'Wallpaper' : 'Fabric',
                'Custom Colors': colorNames,
                'ColorFlex Design': 'Yes',
                'Save Date': new Date().toLocaleDateString(),
                'Pattern ID': this.state.pattern.id || this.generatePatternId(this.state.pattern),
                
                // Enhanced properties for multi-step flow
                'Texture': variantData.title,
                'Length': `${this.state.selectedQuantity?.rolls || 1} rolls`,
                'Coverage': `~${this.state.selectedQuantity?.coverage || 30} sq ft`,
                'Unit Price': `$${this.state.selectedTexture.price}/roll`,
                'Total Price': `$${(this.state.selectedTexture.price * (this.state.selectedQuantity?.rolls || 1)).toFixed(2)}`,
                'Customized': 'Yes',
                
                // Technical properties (with underscore prefix)
                '_pattern_preview': this.state.pattern.preview,
                '_texture_type': variantData.title.toLowerCase(),
                '_colorflex_config': 'v2.0',
                '_configuration_timestamp': new Date().toISOString()
            }
        };
        
        console.log('🛍️ Final cart item being added:', cartItem);
        console.log('🖼️ Pattern preview included:', !!cartItem.properties['_pattern_preview']);
        console.log('🆔 Pattern ID included:', cartItem.properties['Pattern ID']);
        
        try {
            await this.addToCartAPI(cartItem);
            this.closeTextureModal();
            this.showSuccessMessage();
            this.clearState();
        } catch (error) {
            console.error('Failed to add to cart:', error);
            this.showErrorMessage(error.message);
        }
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
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
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
                            ${material.id === 'wallpaper' ? '🏠' : '🧵'}
                        </div>
                        <h4 style="margin: 0 0 8px 0; color: #333; font-size: 1.1em;">${material.name}</h4>
                        <p style="margin: 0 0 12px 0; color: #666; font-size: 0.9em; line-height: 1.4;">${material.description}</p>
                        <div style="color: #d4af37; font-weight: 600;">From ${material.priceFrom}</div>
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
                    <div style="display: flex; justify-content: space-between; font-size: 1.1em; font-weight: 600; color: #efeeeaff; border-top: 1px solid #d4af37; padding-top: 8px;">
                        <span>Total:</span>
                        <span id="total-price" style="color: #d4af37;">$0.00</span>
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
    
    generatePatternId(patternData) {
        // Generate consistent ID from pattern name and colors
        const base = (patternData.patternName || 'pattern').toLowerCase().replace(/\s+/g, '-');
        const colorHash = (patternData.colors || []).join('-').replace(/\s+/g, '');
        return `${base}-${colorHash}`;
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
        
        if (this.state.selectedTexture && this.state.selectedQuantity) {
            const total = this.state.selectedTexture.price * this.state.selectedQuantity.rolls;
            
            basePrice.textContent = `$${this.state.selectedTexture.price}`;
            quantityDisplay.textContent = `${this.state.selectedQuantity.rolls} roll${this.state.selectedQuantity.rolls > 1 ? 's' : ''}`;
            coverageDisplay.textContent = `${this.state.selectedQuantity.coverage} sq ft`;
            totalPrice.textContent = `$${total.toFixed(2)}`;
            
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
        
        // Ensure we have a pattern preview before adding to cart
        if (!this.state.pattern.preview) {
            console.log('🎨 Attempting to generate pattern preview for cart...');
            console.log('🔍 Pattern data:', JSON.stringify(this.state.pattern, null, 2));
            console.log('🔍 generatePatternProof available:', typeof window.generatePatternProof);
            
            if (typeof window.generatePatternProof === 'function') {
                try {
                    const colorArray = this.state.pattern.colors.map(colorObj => {
                        if (typeof colorObj === 'string') return colorObj;
                        return colorObj.color || colorObj.name || String(colorObj);
                    });
                    
                    console.log('🎨 Calling generatePatternProof with:', {
                        name: this.state.pattern.name,
                        collection: this.state.pattern.collection,
                        colors: colorArray
                    });
                    
                    const result = await window.generatePatternProof(
                        this.state.pattern.name,
                        this.state.pattern.collection,
                        colorArray
                    );
                    
                    console.log('🔍 generatePatternProof result:', result);
                    console.log('🔍 Result type:', typeof result);
                    console.log('🔍 Result keys:', result ? Object.keys(result) : 'null');
                    
                    if (result && result.dataUrl) {
                        this.state.pattern.preview = result.dataUrl;
                        this.saveState();
                        console.log('✅ Pattern preview generated for cart successfully');
                    } else {
                        console.warn('⚠️ generatePatternProof returned no dataUrl');
                        // Try alternative approaches
                        if (result && result.canvas) {
                            console.log('🔄 Trying canvas.toDataURL...');
                            this.state.pattern.preview = result.canvas.toDataURL('image/jpeg', 0.8);
                            this.saveState();
                            console.log('✅ Pattern preview from canvas');
                        }
                    }
                } catch (error) {
                    console.error('❌ Failed to generate pattern preview for cart:', error);
                    console.error('❌ Error stack:', error.stack);
                }
            } else {
                console.warn('⚠️ generatePatternProof function not available');
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