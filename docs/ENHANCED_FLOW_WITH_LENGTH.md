# Enhanced Multi-Step Flow with Length Selection

## New 4-Step Flow Structure

### Step 1: Pattern Selection (Existing)
User selects saved pattern with colors

### Step 2: Material Category (Existing)
User chooses Wallpaper or Fabric

### Step 3: Texture Selection (Existing)  
User chooses Smooth, Rough, or Textured

### Step 4: Length/Quantity Selection (NEW)
User specifies how much they need:

**For Wallpaper:**
- 1 roll (covers ~30 sq ft)
- 2 rolls (covers ~60 sq ft)  
- 3 rolls (covers ~90 sq ft)
- 5 rolls (covers ~150 sq ft)
- Custom amount (input field)

**For Fabric:**
- 1 yard
- 2 yards
- 5 yards
- 10 yards
- Custom length (input field)

## Implementation Approach

### Option A: Shopify Quantity (Recommended)
Keep existing variants, use Shopify's quantity field:

```javascript
cartItem = {
  id: variantId,      // Same variant ID
  quantity: selectedQuantity, // 1, 2, 5, 10, etc.
  properties: {
    // All existing pattern data +
    '_length_amount': selectedQuantity,
    '_length_unit': 'rolls' // or 'yards'
    'Length': `${selectedQuantity} ${unit}`
  }
}
```

### Option B: New Variants (Complex)
Create separate variants for each length - would require 18+ variants per product.

## Enhanced Modal Flow

### Length Selection Modal (After Texture):

```html
<div class="config-modal">
  <h3>How much ${materialName} do you need?</h3>
  
  <div class="pattern-preview-section">
    <!-- Pattern preview + selected material/texture -->
  </div>
  
  <div class="length-options-grid">
    <!-- Wallpaper options -->
    <div class="length-card" data-quantity="1">
      <h4>1 Roll</h4>
      <p>Covers ~30 sq ft</p>
      <span class="price">$${basePrice * 1}</span>
    </div>
    
    <div class="length-card" data-quantity="2">
      <h4>2 Rolls</h4>
      <p>Covers ~60 sq ft</p>
      <span class="price">$${basePrice * 2}</span>
    </div>
    
    <!-- Custom input -->
    <div class="length-card custom-input">
      <h4>Custom Amount</h4>
      <input type="number" min="1" max="50" placeholder="Enter quantity">
      <span class="unit">rolls</span>
    </div>
  </div>
  
  <button class="add-to-cart-final">Add to Cart - $${totalPrice}</button>
</div>
```

## Updated State Management

```javascript
class ProductConfigurationFlow {
  constructor() {
    this.state = {
      pattern: null,
      category: null,    // 'wallpaper' or 'fabric'
      variant: null,     // texture variant
      quantity: 1,       // NEW: selected quantity
      step: 'pattern'    // pattern → category → texture → quantity → cart
    };
  }
  
  // New method for quantity selection
  selectQuantity(amount, unit) {
    this.state.quantity = amount;
    this.state.unit = unit; // 'rolls' or 'yards'
    this.addToCartWithQuantity();
  }
}
```

## Cart Integration Enhancement

```javascript
async function addPatternToCartEnhanced(cartConfig) {
  const cartItem = {
    id: cartConfig.variantId,
    quantity: cartConfig.quantity, // NEW: Use selected quantity
    properties: {
      // Existing pattern properties +
      '_length_amount': cartConfig.quantity.toString(),
      '_length_unit': cartConfig.category === 'wallpaper' ? 'rolls' : 'yards',
      '_total_coverage': calculateCoverage(cartConfig.quantity, cartConfig.category),
      
      // Customer-visible
      'Length': `${cartConfig.quantity} ${cartConfig.category === 'wallpaper' ? 'rolls' : 'yards'}`,
      'Coverage': calculateCoverage(cartConfig.quantity, cartConfig.category)
    }
  };
}

function calculateCoverage(quantity, category) {
  if (category === 'wallpaper') {
    return `~${quantity * 30} sq ft`;
  } else {
    return `${quantity} yards`;
  }
}
```

## Pricing Considerations

### Dynamic Pricing Display:
- Show per-unit price: "Textured Wallpaper - $52.00/roll"  
- Show total price: "3 rolls × $52.00 = $156.00"
- Update total as user changes quantity

### Quantity Discounts (Optional):
```javascript
function calculatePrice(basePrice, quantity) {
  if (quantity >= 5) return basePrice * quantity * 0.9; // 10% discount
  if (quantity >= 3) return basePrice * quantity * 0.95; // 5% discount
  return basePrice * quantity;
}
```

## Updated Test Implementation

Would you like me to:
1. **Update the test HTML** to include the length selection step?
2. **Show pricing calculations** for different quantities?
3. **Create the enhanced ProductConfigurationFlow** with quantity support?

This keeps the Shopify structure simple (6 variants total) while giving customers full control over quantity through the cart quantity field and properties.