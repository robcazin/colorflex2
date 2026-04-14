# Multi-Step Product Configuration Flow

> Status note (April 2026): This document is architecture/reference material.
> Production line-item previews currently use hosted URLs (Shopify Files), not inline base64 preview strings.

## Architecture Overview

### Flow Design
```
Saved Pattern → Material Category → Texture Selection → Cart
      ↓               ↓                 ↓              ↓
"Geometric       [Wallpaper]      [Textured]      Add with
 Waves"             or           Variant ID       full config
SW-7006          [Fabric]        + pricing        as cart
SW-6258                                          properties
```

### Technical Implementation

#### Step 1: Pattern Selection (Current)
```javascript
// User selects from saved patterns
const savedPattern = {
  id: 'geometric-waves-001',
  name: 'Geometric Waves',
  collection: 'geometry',
  colors: ['SW-7006', 'SW-6258', 'SW-0072'],
  patternPreview: 'https://cdn.shopify.com/.../colorflex-preview.jpg'
};
```

#### Step 2: Material Category Selection
```javascript
// New modal after pattern selection
const materialFlow = {
  pattern: savedPattern,
  step: 'category', // category → texture → cart
  categories: [
    { 
      id: 'wallpaper', 
      name: 'Wallpaper',
      productHandle: 'custom-wallpaper',
      description: 'Perfect for walls, removable, various textures'
    },
    { 
      id: 'fabric', 
      name: 'Fabric',
      productHandle: 'custom-fabric', 
      description: 'Upholstery, curtains, various weights'
    }
  ]
};
```

#### Step 3: Texture/Variant Selection
```javascript
// After category selection, show variants
const textureSelection = {
  pattern: savedPattern,
  category: 'wallpaper', // or 'fabric'
  productHandle: 'custom-wallpaper',
  step: 'texture',
  variants: [
    {
      id: 'variant_1234',
      name: 'Smooth',
      price: '$45.00',
      description: 'Smooth matte finish, easy application',
      sku: 'CW-SMOOTH'
    },
    {
      id: 'variant_5678', 
      name: 'Textured',
      price: '$52.00',
      description: 'Raised texture, premium feel',
      sku: 'CW-TEXTURED'
    }
  ]
};
```

#### Step 4: Cart Integration
```javascript
// Final add to cart with complete configuration
const cartItem = {
  id: 'variant_5678', // Shopify variant ID
  quantity: 1,
  properties: {
    // Pattern customization data
    '_pattern_id': 'geometric-waves-001',
    '_pattern_name': 'Geometric Waves',
    '_pattern_collection': 'geometry',
    '_custom_colors': 'SW-7006,SW-6258,SW-0072',
    '_pattern_preview': 'https://cdn.shopify.com/.../colorflex-preview.jpg',
    
    // Material selection
    '_material_category': 'wallpaper',
    '_texture_type': 'textured',
    
    // Metadata for order processing
    '_colorflex_config': 'v2.0',
    '_order_type': 'custom_pattern'
  }
};
```

## State Management Strategy

### Progressive State Storage
```javascript
class ConfigurationFlow {
  constructor() {
    this.state = {
      pattern: null,
      category: null, 
      variant: null,
      step: 'pattern' // pattern → category → texture → cart
    };
  }
  
  // Persist state through localStorage for session continuity
  saveState() {
    localStorage.setItem('colorflex_config_flow', JSON.stringify(this.state));
  }
  
  // Handle back/forward navigation
  navigateStep(direction) {
    const steps = ['pattern', 'category', 'texture', 'cart'];
    // Handle step transitions with validation
  }
}
```

## UI/UX Flow Design

### Modal Progression
1. **Pattern Selection** (Existing)
   - User clicks "Add to Cart" from saved patterns
   - Instead of immediate cart add, opens material selection

2. **Material Category Modal**
   ```html
   <div class="material-selection-modal">
     <h3>Choose Material for: {pattern.name}</h3>
     <div class="pattern-preview">{preview}</div>
     <div class="material-options">
       <div class="material-card wallpaper">
         <img src="wallpaper-icon.jpg">
         <h4>Wallpaper</h4>
         <p>Removable, various textures</p>
         <span class="price-from">From $45</span>
       </div>
       <div class="material-card fabric">
         <img src="fabric-icon.jpg">  
         <h4>Fabric</h4>
         <p>Upholstery, curtains, various weights</p>
         <span class="price-from">From $38</span>
       </div>
     </div>
   </div>
   ```

3. **Texture Selection Modal**
   ```html
   <div class="texture-selection-modal">
     <h3>Choose Texture: {category}</h3>
     <div class="pattern-preview">{preview}</div>
     <div class="texture-options">
       <div class="texture-card" data-variant-id="1234">
         <img src="smooth-texture.jpg">
         <h4>Smooth</h4>
         <p>Matte finish, easy application</p>
         <span class="price">$45.00</span>
       </div>
       <!-- More texture options -->
     </div>
     <button class="add-to-cart-final">Add to Cart - $45.00</button>
   </div>
   ```

## Implementation Steps

### Phase 1: Product Setup
1. Create 2 main Shopify products: "Custom Wallpaper", "Custom Fabric"
2. Add variants for each texture type with appropriate pricing
3. Set up metafields for variant-specific specifications

### Phase 2: Flow Implementation  
1. Modify existing "Add to Cart" button to open material selection
2. Create material selection modal with category cards
3. Create texture selection modal with variant options
4. Update cart integration to handle complete configuration

### Phase 3: Data Flow
1. Extend existing pattern data structure for material compatibility
2. Add state management for multi-step flow
3. Update cart properties to include material selections
4. Enhance order processing to handle new configuration data

## Benefits of This Approach

### For Users
- **Progressive Disclosure** - Not overwhelmed with all options at once
- **Clear Pricing** - See price implications of each choice
- **Visual Continuity** - Pattern preview carries through entire flow
- **Easy Comparison** - Side-by-side texture/pricing comparison

### For Business  
- **Flexible Pricing** - Different prices for different textures
- **Easy Expansion** - Add new textures as variants
- **Clear Analytics** - Track conversion at each step
- **Inventory Control** - Manage stock per texture type

### For Development
- **Shopify Native** - Uses standard variant system
- **Backward Compatible** - Doesn't break existing pattern system  
- **Scalable** - Easy to add categories/textures
- **Maintainable** - Clear separation of concerns