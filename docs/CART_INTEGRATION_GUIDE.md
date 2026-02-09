# Cart Integration: Intercepting "Buy It!" Button

## Current Flow (What Happens Now)
```
Saved Pattern Modal → "Buy It!" Button → addPatternToCart() → Direct Cart
```

## New Flow (What We Need)
```
Saved Pattern Modal → "Buy It!" Button → ProductConfigurationFlow.interceptAddToCart() → Material Modal → Texture Modal → Enhanced Cart
```

## Integration Point: Modify "Buy It!" Button Event Handler

### Current Code Location: CFM.js line ~1057-1081

**BEFORE (Current):**
```javascript
addToCartBtn.addEventListener('click', function() {
    // Current direct cart logic
    addPatternToCart(pattern, 'wallpaper'); // or whatever material
});
```

**AFTER (Enhanced Multi-Step):**
```javascript
addToCartBtn.addEventListener('click', function() {
    // Check if multi-step flow is enabled
    if (window.configFlow) {
        // Start multi-step configuration
        window.configFlow.interceptAddToCart({
            id: pattern.id,
            patternName: pattern.patternName,
            collection: pattern.collection,
            colors: pattern.colors,
            patternPreview: pattern.patternPreview,
            saveDate: pattern.saveDate
        });
        
        // Close the saved patterns modal since we're starting new flow
        closeSavedPatternsModal();
    } else {
        // Fallback to old direct cart method
        addPatternToCart(pattern, 'wallpaper');
    }
});
```

## Complete Enhanced Cart Function

Replace the existing `addPatternToCart()` and `addToShopifyCart()` functions with this enhanced version:

```javascript
/**
 * Enhanced cart addition with full pattern customization data
 * Called from ProductConfigurationFlow after material/texture selection
 * @param {Object} cartConfig - Complete configuration from multi-step flow
 */
async function addPatternToCartEnhanced(cartConfig) {
    try {
        console.log('🛒 Enhanced cart addition:', cartConfig);

        // Build complete cart item with all customization data
        const cartItem = {
            id: cartConfig.variantId, // Shopify variant ID from texture selection
            quantity: 1,
            properties: {
                // === PATTERN INFORMATION ===
                '_pattern_id': cartConfig.pattern.id,
                '_pattern_name': cartConfig.pattern.name,
                '_pattern_collection': cartConfig.pattern.collection,
                '_pattern_preview': cartConfig.pattern.preview, // Base64 thumbnail
                
                // === COLOR CUSTOMIZATION ===
                '_custom_colors': cartConfig.pattern.colors.join(','),
                '_color_count': cartConfig.pattern.colors.length.toString(),
                
                // === MATERIAL SELECTION ===
                '_material_category': cartConfig.category, // 'wallpaper' or 'fabric'
                '_texture_type': cartConfig.variant.name,   // 'Smooth', 'Rough', 'Textured'
                '_variant_sku': cartConfig.variant.sku,     // Product SKU
                
                // === ORDER PROCESSING METADATA ===
                '_colorflex_version': 'v2.0',
                '_order_type': 'custom_pattern_multi_step',
                '_configuration_date': new Date().toISOString(),
                '_customer_id': window.ShopifyCustomer?.id || 'guest',
                
                // === DISPLAY PROPERTIES (for cart/checkout display) ===
                'Pattern': cartConfig.pattern.name,
                'Collection': cartConfig.pattern.collection,
                'Colors': cartConfig.pattern.colors.join(', '),
                'Material': cartConfig.category === 'wallpaper' ? 'Wallpaper' : 'Fabric',
                'Texture': cartConfig.variant.name,
                'Customized': 'Yes'
            }
        };

        // Add to cart using Shopify AJAX Cart API
        const response = await fetch('/cart/add.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cartItem)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add to cart');
        }

        const result = await response.json();
        console.log('✅ Successfully added to cart:', result);

        // Show success notification
        showSaveNotification(`✅ ${cartConfig.pattern.name} added to cart!`);
        
        // Update cart UI (if theme has cart badge/counter)
        if (window.theme?.cart?.getCart) {
            window.theme.cart.getCart();
        }
        
        // Refresh cart drawer/widget if it exists
        if (typeof window.ajaxCart !== 'undefined') {
            window.ajaxCart.getCart();
        }

        return result;

    } catch (error) {
        console.error('❌ Enhanced cart addition failed:', error);
        
        // Show user-friendly error
        showSaveNotification(`❌ Failed to add to cart: ${error.message}`);
        
        // Optional: Show fallback instructions
        showCartFallbackInstructions(cartConfig);
        
        throw error;
    }
}

/**
 * Fallback instructions if cart API fails
 */
function showCartFallbackInstructions(cartConfig) {
    const instructions = `
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 1rem; border-radius: 4px; margin: 1rem 0;">
            <strong>Manual Cart Instructions:</strong><br>
            1. Go to "${cartConfig.category === 'wallpaper' ? 'Custom Wallpaper' : 'Custom Fabric'}" product<br>
            2. Select "${cartConfig.variant.name}" texture<br>
            3. Add note: "${cartConfig.pattern.name}" pattern with colors: ${cartConfig.pattern.colors.join(', ')}
        </div>
    `;
    
    showSaveNotification(instructions, 8000); // Show for 8 seconds
}
```

## Integration Steps

### 1. Initialize ProductConfigurationFlow
Add to CFM.js initialization (around line where ColorFlex starts):

```javascript
// Initialize configuration flow after ColorFlex is ready
if (typeof ProductConfigurationFlow !== 'undefined') {
    window.configFlow = new ProductConfigurationFlow();
    console.log('✅ Multi-step configuration flow initialized');
}
```

### 2. Modify Buy It! Button Event
Find the "Buy It!" button event listener (around line 1075) and replace with the intercepting version above.

### 3. Update ProductConfigurationFlow.js
In the `selectTextureAndAddToCart()` method, call the enhanced cart function:

```javascript
// In ProductConfigurationFlow.js, replace the addToCartAPI method:
async addToCartAPI(cartItem) {
    const cartConfig = {
        variantId: cartItem.id,
        pattern: this.state.pattern,
        category: this.state.category,
        variant: this.state.variant
    };
    
    return await addPatternToCartEnhanced(cartConfig);
}
```

## Cart Properties Structure

The enhanced system passes this complete data to Shopify:

### Hidden Properties (for order processing):
- `_pattern_id`, `_pattern_name`, `_pattern_collection`
- `_custom_colors`, `_color_count`  
- `_material_category`, `_texture_type`
- `_colorflex_version`, `_order_type`
- `_pattern_preview` (base64 thumbnail)

### Display Properties (visible in cart/checkout):
- `Pattern`: "Geometric Waves"
- `Collection`: "geometry" 
- `Colors`: "SW-7006, SW-6258, SW-0072"
- `Material`: "Wallpaper"
- `Texture`: "Textured"
- `Customized`: "Yes"

This gives you complete traceability from pattern customization through order fulfillment while maintaining a clean customer-facing display.