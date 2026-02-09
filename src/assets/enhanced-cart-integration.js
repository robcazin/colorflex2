/**
 * Enhanced Cart Integration with Length/Quantity Support
 * 
 * This replaces the existing cart functions in CFM.js to handle:
 * - Pattern customization data
 * - Material and texture selection
 * - Length/quantity selection with dynamic pricing
 * - Coverage calculations
 * - Complete cart properties for order processing
 */

// ===== HELPER FUNCTIONS =====

/**
 * Extract color names from color objects or strings
 * @param {Array} colors - Array of color objects or strings
 * @return {Array} Array of color name strings
 */
function extractColorNames(colors) {
    if (!colors || !Array.isArray(colors)) return [];
    
    return colors.map(colorObj => {
        if (typeof colorObj === 'string') return colorObj;
        return colorObj.color || colorObj.name || String(colorObj);
    }).filter(color => color && color !== 'Unknown Color');
}

// ===== ENHANCED CART ADDITION FUNCTION =====

/**
 * Enhanced cart addition with full configuration including length/quantity
 * @param {Object} cartConfig - Complete configuration from ProductConfigurationFlow
 */
async function addPatternToCartEnhanced(cartConfig) {
    try {
        console.log('🛒 Enhanced cart addition with length:', cartConfig);
        console.log('🎨 ENHANCED CART - RAW COLORS:', cartConfig.pattern.colors);
        console.log('🎨 ENHANCED CART - EXTRACTED COLORS:', extractColorNames(cartConfig.pattern.colors));
        console.log('🖼️ ENHANCED CART - PATTERN PREVIEW:', cartConfig.pattern.preview ? 'HAS PREVIEW (' + cartConfig.pattern.preview.length + ' chars)' : 'NO PREVIEW');
        console.log('🎨 ENHANCED CART - PATTERN NAME:', cartConfig.pattern.patternName);
        
        // Validate required data
        if (!cartConfig.variantId) {
            throw new Error('Shopify variant ID is required');
        }
        if (!cartConfig.pattern || !cartConfig.pattern.patternName) {
            throw new Error('Pattern data is required');
        }
        if (!cartConfig.quantity || cartConfig.quantity < 1) {
            throw new Error('Quantity must be at least 1');
        }
        
        // Calculate pricing and coverage
        const unitPrice = parseFloat(cartConfig.variant.price);
        const totalPrice = (unitPrice * cartConfig.quantity).toFixed(2);
        const unit = cartConfig.category === 'wallpaper' ? 'rolls' : 'yards';
        const coverage = calculateCoverage(cartConfig.quantity, cartConfig.category);
        const unitLabel = unit.slice(0, -1); // 'roll' or 'yard'
        
        // Build comprehensive cart item
        const cartItem = {
            id: cartConfig.variantId,
            quantity: cartConfig.quantity,
            properties: {
                // ===== CORE PATTERN DATA =====
                '_pattern_id': cartConfig.pattern.id,
                '_pattern_name': cartConfig.pattern.patternName,
                '_pattern_collection': cartConfig.pattern.collection,
                
                // ===== COLOR CUSTOMIZATION =====
                '_custom_colors': extractColorNames(cartConfig.pattern.colors).join(','),
                '_color_count': cartConfig.pattern.colors.length.toString(),
                '_layer_count': (cartConfig.pattern.customizationData?.layers?.length || 0).toString(),
                
                // ===== MATERIAL & TEXTURE SELECTION =====
                '_material_category': cartConfig.category, // 'wallpaper' or 'fabric'
                '_texture_type': cartConfig.variant.name.toLowerCase(), // 'smooth', 'rough', 'textured'
                '_variant_sku': cartConfig.variant.sku,
                
                // ===== LENGTH & QUANTITY DATA =====
                '_length_amount': cartConfig.quantity.toString(),
                '_length_unit': unit,
                '_unit_price': unitPrice.toString(),
                '_total_price': totalPrice,
                '_coverage': coverage,
                '_price_per_unit': `$${unitPrice.toFixed(2)} per ${unitLabel}`,
                
                // ===== PRICING BREAKDOWN =====
                '_base_variant_price': cartConfig.variant.price.toString(),
                '_quantity_multiplier': cartConfig.quantity.toString(),
                '_final_line_total': totalPrice,
                
                // ===== TECHNICAL METADATA =====
                '_colorflex_version': 'v2.1',
                '_order_type': 'custom_pattern_with_length',
                '_configuration_date': new Date().toISOString(),
                '_customer_id': (window.ShopifyCustomer && window.ShopifyCustomer.id) || 'guest',
                '_configuration_flow': '4step', // pattern → material → texture → length
                
                // ===== CUSTOMER-VISIBLE PROPERTIES =====
                'Pattern': cartConfig.pattern.patternName,
                'Collection': cartConfig.pattern.collection.charAt(0).toUpperCase() + cartConfig.pattern.collection.slice(1),
                'Colors': extractColorNames(cartConfig.pattern.colors).join(', '),
                'Pattern ID': cartConfig.pattern.id,
                'Material': cartConfig.category === 'wallpaper' ? 'Wallpaper' : 'Fabric',
                'Texture': cartConfig.variant.name,
                'Length': `${cartConfig.quantity} ${unit}`,
                'Coverage': coverage,
                'Unit Price': `$${unitPrice.toFixed(2)}/${unitLabel}`,
                'Total Price': `$${totalPrice}`,
                'Customized': 'Yes',
                'Save Date': cartConfig.pattern.saveDate || new Date().toISOString().split('T')[0]
            }
        };
        
        // Add pattern preview if available (base64 encoded)
        if (cartConfig.pattern.patternPreview) {
            cartItem.properties['_pattern_preview'] = cartConfig.pattern.patternPreview;
        }
        
        // Add advanced customization data if available
        if (cartConfig.pattern.customizationData) {
            const customData = cartConfig.pattern.customizationData;
            if (customData.layerLabels && customData.layerLabels.length > 0) {
                cartItem.properties['_layer_labels'] = customData.layerLabels.join(',');
            }
            if (customData.designerColors && customData.designerColors.length > 0) {
                cartItem.properties['_designer_colors'] = customData.designerColors.join(',');
            }
        }
        
        console.log('🛒 Sending enhanced cart item to Shopify:', cartItem);
        
        // Add to cart using Shopify AJAX Cart API
        const response = await fetch('/cart/add.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(cartItem)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Shopify cart API error:', errorData);
            
            // Handle specific Shopify errors
            if (errorData.message && errorData.message.includes('sold out')) {
                throw new Error('This texture option is currently unavailable');
            } else if (errorData.message && errorData.message.includes('invalid')) {
                throw new Error('Product configuration error - please try again');
            } else {
                throw new Error(errorData.message || errorData.description || 'Failed to add item to cart');
            }
        }
        
        const result = await response.json();
        console.log('✅ Successfully added to cart with quantity:', result);
        
        // Show detailed success notification
        const successMessage = `✅ ${cartConfig.pattern.patternName} added to cart!\n${cartConfig.quantity} ${unit} of ${cartConfig.category} (${cartConfig.variant.name}) - $${totalPrice}`;
        if (typeof showSaveNotification === 'function') {
            showSaveNotification(successMessage);
        } else {
            console.log(successMessage);
            // Show browser notification as fallback
            showCartSuccessNotification(cartConfig, totalPrice, coverage);
        }
        
        // Update cart UI elements
        await updateCartUI();
        
        // Fire custom cart events for theme integration
        fireCartUpdateEvents(cartItem, result);
        
        return result;
        
    } catch (error) {
        console.error('❌ Enhanced cart addition failed:', error);
        
        // Show user-friendly error message
        const errorMessage = `❌ Failed to add ${cartConfig.pattern.patternName} to cart: ${error.message}`;
        if (typeof showSaveNotification === 'function') {
            showSaveNotification(errorMessage);
        } else {
            alert(errorMessage);
        }
        
        // Show fallback instructions
        showCartFallbackInstructions(cartConfig);
        
        throw error;
    }
}

// ===== HELPER FUNCTIONS =====

/**
 * Calculate coverage based on quantity and material type
 * @param {number} quantity - Selected quantity
 * @param {string} category - 'wallpaper' or 'fabric'
 * @returns {string} Coverage description
 */
function calculateCoverage(quantity, category) {
    if (category === 'wallpaper') {
        const sqft = quantity * 30; // Assume 30 sq ft per roll
        return `~${sqft} sq ft`;
    } else {
        return `${quantity} yards`;
    }
}

/**
 * Show detailed success notification
 */
function showCartSuccessNotification(cartConfig, totalPrice, coverage) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: #d4edda;
        border: 1px solid #c3e6cb;
        color: #155724;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-width: 350px;
        font-family: Arial, sans-serif;
        animation: slideInRight 0.3s ease-out;
    `;
    
    const unit = cartConfig.category === 'wallpaper' ? 'rolls' : 'yards';
    notification.innerHTML = `
        <h4 style="margin: 0 0 0.5rem 0;">✅ Added to Cart!</h4>
        <p style="margin: 0.25rem 0;"><strong>Pattern:</strong> ${cartConfig.pattern.patternName}</p>
        <p style="margin: 0.25rem 0;"><strong>Material:</strong> ${cartConfig.category} (${cartConfig.variant.name})</p>
        <p style="margin: 0.25rem 0;"><strong>Quantity:</strong> ${cartConfig.quantity} ${unit}</p>
        <p style="margin: 0.25rem 0;"><strong>Coverage:</strong> ${coverage}</p>
        <p style="margin: 0.25rem 0;"><strong>Total:</strong> $${totalPrice}</p>
        <button onclick="this.parentElement.remove()" style="margin-top: 0.5rem; background: #28a745; color: white; border: none; padding: 0.25rem 0.75rem; border-radius: 4px; cursor: pointer;">OK</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 8000);
}

/**
 * Update cart UI elements after successful addition
 */
async function updateCartUI() {
    try {
        // Update cart badge/counter (common theme implementations)
        if (window.theme && window.theme.cart && typeof window.theme.cart.getCart === 'function') {
            window.theme.cart.getCart();
        }
        
        // Update AJAX cart (if using AJAX cart drawer)
        if (typeof window.ajaxCart !== 'undefined' && window.ajaxCart.getCart) {
            window.ajaxCart.getCart();
        }
        
        // Refresh cart drawer (Dawn theme and similar)
        if (typeof window.cartDrawer !== 'undefined' && window.cartDrawer.renderContents) {
            window.cartDrawer.renderContents();
        }
        
        // Refresh mini cart (common in many themes)
        if (typeof window.miniCart !== 'undefined' && window.miniCart.refresh) {
            window.miniCart.refresh();
        }
        
        // Update cart count in DOM elements
        updateCartCountElements();
        
        console.log('✅ Cart UI updated');
        
    } catch (error) {
        console.warn('⚠️ Cart UI update failed (non-critical):', error);
    }
}

/**
 * Update cart count elements in DOM
 */
function updateCartCountElements() {
    // Get current cart count
    fetch('/cart.js')
        .then(response => response.json())
        .then(cart => {
            const count = cart.item_count;
            
            // Update common cart count selectors
            const countSelectors = [
                '.cart-count',
                '.cart-badge', 
                '.cart-item-count',
                '[data-cart-count]',
                '#cart-count'
            ];
            
            countSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    element.textContent = count;
                    if (count > 0) {
                        element.style.display = '';
                    }
                });
            });
        })
        .catch(error => {
            console.warn('⚠️ Could not update cart count:', error);
        });
}

/**
 * Fire custom cart events for theme integration
 */
function fireCartUpdateEvents(cartItem, cartResult) {
    // Standard cart update event
    const cartUpdateEvent = new CustomEvent('cart:updated', {
        detail: { 
            cartItem: cartItem,
            cartResult: cartResult,
            source: 'colorflex_enhanced'
        }
    });
    document.dispatchEvent(cartUpdateEvent);
    
    // ColorFlex-specific event
    const colorflexCartEvent = new CustomEvent('colorflex:cart_add', {
        detail: {
            pattern: cartItem.properties._pattern_name,
            material: cartItem.properties._material_category,
            texture: cartItem.properties._texture_type,
            quantity: cartItem.quantity,
            totalPrice: cartItem.properties._total_price
        }
    });
    document.dispatchEvent(colorflexCartEvent);
    
    console.log('🔔 Cart update events fired');
}

/**
 * Enhanced fallback instructions with length info
 */
function showCartFallbackInstructions(cartConfig) {
    const productName = cartConfig.category === 'wallpaper' ? 'Custom Wallpaper' : 'Custom Fabric';
    const unit = cartConfig.category === 'wallpaper' ? 'rolls' : 'yards';
    const totalPrice = (cartConfig.variant.price * cartConfig.quantity).toFixed(2);
    
    const instructions = `
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 1.5rem; border-radius: 4px; margin: 1rem 0; font-size: 0.9rem; max-width: 400px;">
            <strong>💡 Manual Cart Instructions:</strong><br><br>
            1. Go to the <strong>"${productName}"</strong> product page<br>
            2. Select <strong>"${cartConfig.variant.name}"</strong> texture variant<br>
            3. Set quantity to <strong>${cartConfig.quantity}</strong><br>
            4. Add to cart (Total: $${totalPrice})<br>
            5. In cart notes, add:<br>
            <em>"${cartConfig.pattern.patternName}" pattern with colors: ${extractColorNames(cartConfig.pattern.colors).join(', ')}"</em>
            <br><br>
            <strong>Order Details:</strong><br>
            • Pattern: ${cartConfig.pattern.patternName}<br>
            • Material: ${productName} (${cartConfig.variant.name})<br>
            • Quantity: ${cartConfig.quantity} ${unit}<br>
            • Coverage: ${calculateCoverage(cartConfig.quantity, cartConfig.category)}<br>
            • Colors: ${extractColorNames(cartConfig.pattern.colors).join(', ')}
        </div>
    `;
    
    if (typeof showSaveNotification === 'function') {
        showSaveNotification(instructions, 15000); // Show for 15 seconds
    } else {
        // Create temporary modal with instructions
        const modal = document.createElement('div');
        modal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 500px; margin: 1rem;">
                    ${instructions}
                    <button onclick="this.closest('div').remove()" style="background: #007bff; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; margin-top: 1rem;">Got it!</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal.firstElementChild);
    }
}

// ===== INTEGRATION WITH PRODUCTCONFIGURATIONFLOW =====

/**
 * Integration function for ProductConfigurationFlow
 * Call this from ProductConfigurationFlow.addToCartAPI()
 */
function integrateWithConfigurationFlow() {
    if (window.configFlow && window.configFlow.addToCartAPI) {
        // Override the addToCartAPI method
        window.configFlow.addToCartAPI = async function(cartItem) {
            const cartConfig = {
                variantId: cartItem.id,
                pattern: this.state.pattern,
                category: this.state.category,
                variant: this.state.variant,
                quantity: cartItem.quantity || this.state.quantity || 1
            };
            
            return await addPatternToCartEnhanced(cartConfig);
        }.bind(window.configFlow);
        
        console.log('✅ Enhanced cart integration connected to ProductConfigurationFlow');
    }
}

// ===== PRICING HELPER FUNCTIONS =====

/**
 * Calculate quantity-based pricing with potential discounts
 * @param {number} basePrice - Base price per unit
 * @param {number} quantity - Ordered quantity  
 * @param {string} category - 'wallpaper' or 'fabric'
 * @returns {Object} Pricing breakdown
 */
function calculatePricingBreakdown(basePrice, quantity, category) {
    let unitPrice = basePrice;
    let discountPercent = 0;
    let discountAmount = 0;
    
    // Apply quantity discounts
    if (quantity >= 10) {
        discountPercent = 15; // 15% discount for 10+ units
    } else if (quantity >= 5) {
        discountPercent = 10; // 10% discount for 5+ units  
    } else if (quantity >= 3) {
        discountPercent = 5;  // 5% discount for 3+ units
    }
    
    if (discountPercent > 0) {
        discountAmount = (basePrice * quantity * discountPercent / 100);
        unitPrice = basePrice * (1 - discountPercent / 100);
    }
    
    const subtotal = basePrice * quantity;
    const total = unitPrice * quantity;
    
    return {
        basePrice: basePrice,
        unitPrice: unitPrice,
        quantity: quantity,
        subtotal: subtotal,
        discountPercent: discountPercent,
        discountAmount: discountAmount,
        total: total,
        savings: subtotal - total,
        unit: category === 'wallpaper' ? 'rolls' : 'yards'
    };
}

/**
 * Format pricing for display
 * @param {Object} pricing - Pricing breakdown from calculatePricingBreakdown
 * @returns {string} Formatted pricing display
 */
function formatPricingDisplay(pricing) {
    let display = `${pricing.quantity} ${pricing.unit} × $${pricing.basePrice.toFixed(2)} = $${pricing.subtotal.toFixed(2)}`;
    
    if (pricing.discountPercent > 0) {
        display += `\nDiscount (${pricing.discountPercent}%): -$${pricing.discountAmount.toFixed(2)}`;
        display += `\nYou Save: $${pricing.savings.toFixed(2)}`;
        display += `\nTotal: $${pricing.total.toFixed(2)}`;
    }
    
    return display;
}

// ===== INITIALIZATION =====

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait for other scripts to load, then integrate
    setTimeout(integrateWithConfigurationFlow, 1000);
});

// Export functions for manual integration
window.addPatternToCartEnhanced = addPatternToCartEnhanced;
window.calculateCoverage = calculateCoverage;
window.calculatePricingBreakdown = calculatePricingBreakdown;
window.formatPricingDisplay = formatPricingDisplay;

console.log('✅ Enhanced cart integration with length/quantity support loaded');
console.log('🎯 Features: Dynamic pricing, coverage calculation, quantity discounts, comprehensive cart properties');