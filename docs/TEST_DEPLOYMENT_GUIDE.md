# Multi-Step Configuration Test Deployment Guide

## 🚀 Quick Test Setup (30 minutes)

### Step 1: Create Test Products in Shopify Admin

1. **Go to Shopify Admin** → Products → Import
2. **Upload** `test-products-import.csv` 
3. **Map columns** (should auto-map correctly)
4. **Import** - This creates:
   - "Custom Wallpaper" with 3 texture variants
   - "Custom Fabric" with 3 texture variants

### Step 2: Set Product Prices

**After import, set prices for each variant:**

**Custom Wallpaper:**
- Smooth: $45.00
- Rough: $48.00  
- Textured: $52.00

**Custom Fabric:**
- Smooth: $38.00
- Rough: $42.00
- Textured: $46.00

### Step 3: Deploy Test Page

**Option A: Quick Test (Recommended)**
1. **Upload** `test-multi-step-flow.html` to your theme assets
2. **Access** via: `your-store.myshopify.com/assets/test-multi-step-flow.html`
3. **Test** the complete flow without any code changes

**Option B: Integration Test**
1. **Add test code** to your existing ColorFlex page (see integration section below)

## 🧪 Testing the Flow

### What to Test:
1. **Click** "Buy It!" on either test pattern
2. **Select Material**: Wallpaper or Fabric
3. **Select Texture**: Smooth, Rough, or Textured  
4. **Check Console**: Full cart data should be logged
5. **Verify Cart Properties**: All pattern data should transfer

### Expected Console Output:
```javascript
🎯 Starting configuration flow for pattern: Geometric Waves
🎯 Material selected: wallpaper
🎯 Texture selected, adding to cart: variant_003
🛒 CART ITEM DATA: {
  id: "variant_003",
  quantity: 1,
  properties: {
    '_pattern_id': 'geometric-waves-001',
    '_pattern_name': 'Geometric Waves',
    '_custom_colors': 'SW-7006,SW-6258,SW-0072',
    '_material_category': 'wallpaper',
    '_texture_type': 'textured',
    'Pattern': 'Geometric Waves',
    'Colors': 'SW-7006, SW-6258, SW-0072',
    'Material': 'Wallpaper',
    'Texture': 'Textured'
  }
}
```

## 🔗 Real Integration (After Testing)

### 1. Add ProductConfigurationFlow to CFM.js

Add this to your CFM.js after the existing functions:

```javascript
// Initialize configuration flow
if (typeof ProductConfigurationFlow === 'undefined') {
    // Inline simplified version for testing
    window.ProductConfigurationFlow = class {
        constructor() {
            this.state = { pattern: null, category: null, variant: null, step: 'pattern' };
        }
        
        interceptAddToCart(patternData) {
            console.log('🎯 Multi-step flow intercepted:', patternData);
            // Your multi-step modal logic here
            this.startConfigurationFlow(patternData);
        }
        
        startConfigurationFlow(patternData) {
            // Show material selection modal
            // (Use the modal code from test-multi-step-flow.html)
        }
    };
}

// Initialize the flow
window.configFlow = new ProductConfigurationFlow();
```

### 2. Modify "Buy It!" Button Event Handler

Find the "Buy It!" button event in CFM.js (around line 1075) and replace:

**BEFORE:**
```javascript
addToCartBtn.addEventListener('click', function() {
    addPatternToCart(pattern, 'wallpaper');
});
```

**AFTER:**
```javascript
addToCartBtn.addEventListener('click', function() {
    // Check if multi-step flow is enabled
    if (window.configFlow && typeof window.configFlow.interceptAddToCart === 'function') {
        // Start multi-step configuration
        window.configFlow.interceptAddToCart({
            id: pattern.id,
            patternName: pattern.patternName,
            collection: pattern.collection || 'unknown',
            colors: pattern.colors || [],
            patternPreview: pattern.patternPreview,
            saveDate: pattern.saveDate
        });
    } else {
        // Fallback to original behavior
        addPatternToCart(pattern, 'wallpaper');
    }
});
```

### 3. Add Cart Integration Function

Replace or enhance the existing `addPatternToCart` function:

```javascript
/**
 * Enhanced cart addition for multi-step flow
 */
async function addPatternToCartEnhanced(cartConfig) {
    try {
        const cartItem = {
            id: cartConfig.variantId,
            quantity: 1,
            properties: {
                // Pattern data
                '_pattern_id': cartConfig.pattern.id,
                '_pattern_name': cartConfig.pattern.patternName,
                '_custom_colors': cartConfig.pattern.colors.join(','),
                '_material_category': cartConfig.category,
                '_texture_type': cartConfig.variant.name,
                // Display properties
                'Pattern': cartConfig.pattern.patternName,
                'Material': cartConfig.category === 'wallpaper' ? 'Wallpaper' : 'Fabric',
                'Texture': cartConfig.variant.name,
                'Colors': cartConfig.pattern.colors.join(', ')
            }
        };

        // Add to cart using Shopify AJAX API
        const response = await fetch('/cart/add.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cartItem)
        });

        if (!response.ok) throw new Error('Cart addition failed');
        
        const result = await response.json();
        console.log('✅ Added to cart:', result);
        
        // Show success notification
        showSaveNotification(`✅ ${cartConfig.pattern.patternName} added to cart!`);
        
        return result;
    } catch (error) {
        console.error('❌ Cart error:', error);
        showSaveNotification(`❌ Failed to add to cart: ${error.message}`);
        throw error;
    }
}
```

## 📋 Test Checklist

- [ ] Test products imported to Shopify
- [ ] Product prices set correctly
- [ ] Test page accessible and functional
- [ ] Material selection modal appears
- [ ] Texture selection modal appears
- [ ] Cart data logged correctly in console
- [ ] All pattern properties transferred
- [ ] Back navigation works
- [ ] Error handling works (try invalid selections)
- [ ] Mobile responsive (test on phone)

## 🔧 Real Shopify Cart Integration

Once testing is successful, you can enable real cart additions by:

1. **Get actual variant IDs** from your Shopify products
2. **Replace mock data** with real Shopify Storefront API calls
3. **Enable real cart.add.js** calls instead of console logging
4. **Add cart refresh** functionality to update cart count/drawer

## 🚨 Important Notes

- **Test thoroughly** before deploying to live traffic
- **Console logging** shows all data being passed - verify it's complete
- **Cart properties** are limited to 255 characters per property
- **Variant IDs** must be real Shopify variant IDs for live cart additions
- **Mobile testing** is crucial - modals should work on all devices

This test setup lets you verify the complete multi-step flow without affecting your live ColorFlex system!