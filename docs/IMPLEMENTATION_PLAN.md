# Multi-Step Configuration Implementation Plan

## Immediate Answers to Your Questions

### 1. **Variants vs Separate Products?**
**✅ RECOMMENDATION: Use Variants**
- Create 2 main products: "Custom Wallpaper", "Custom Fabric"
- Each product has multiple texture variants (Smooth, Rough, Textured)
- **Benefits**: Easier inventory, flexible pricing, scalable, better analytics

### 2. **How to Pass Pattern Data Through Flow?**
**✅ SOLUTION: Progressive State Management**
```javascript
// State object that persists through all steps
const configFlow = {
  pattern: { id, name, colors, preview },
  category: 'wallpaper', // or 'fabric' 
  variant: { id, name, price },
  step: 'texture' // pattern → category → texture → cart
};
```

### 3. **Different Pricing for Textures?**  
**✅ SOLUTION: Shopify Variant Pricing**
- Each texture = unique variant with its own price
- Example: Smooth ($45), Textured ($52), Rough ($38)
- Pricing shown progressively as user selects

### 4. **Store Intermediate State?**
**✅ SOLUTION: localStorage + Modal State**
- LocalStorage for session persistence 
- Modal state for active flow
- Full config passed to cart only at final step

## Technical Implementation

### Phase 1: Shopify Product Setup (1-2 hours)

#### Create Products in Shopify Admin:
```csv
Handle,Title,Type,Vendor,Tags,Variant SKU,Variant Price,Variant Weight
custom-wallpaper,"Custom Wallpaper",ColorFlex,Saffron Cottage,"colorflex,wallpaper,custom",CW-SMOOTH,45.00,1.0
,,,,,CW-ROUGH,48.00,1.0  
,,,,,CW-TEXTURED,52.00,1.0
custom-fabric,"Custom Fabric",ColorFlex,Saffron Cottage,"colorflex,fabric,custom",CF-SMOOTH,38.00,0.5
,,,,,CF-ROUGH,42.00,0.5
,,,,,CF-TEXTURED,46.00,0.5
```

#### Product Metafields:
```json
{
  "material_category": "wallpaper|fabric",
  "texture_types": "smooth,rough,textured",
  "colorflex_compatible": true,
  "custom_pattern_product": true
}
```

### Phase 2: Flow Management Code (4-6 hours)

#### Add to CFM.js:
```javascript
class ProductConfigurationFlow {
  constructor() {
    this.state = this.loadState() || {
      pattern: null,
      category: null,
      variant: null, 
      step: 'pattern'
    };
  }

  // Intercept existing "Add to Cart" click
  interceptAddToCart(patternData) {
    this.state.pattern = patternData;
    this.state.step = 'category';
    this.saveState();
    this.showMaterialModal();
  }

  showMaterialModal() {
    // Create and show category selection modal
    const modal = this.createMaterialModal();
    document.body.appendChild(modal);
  }

  selectMaterial(category) {
    this.state.category = category;
    this.state.step = 'texture'; 
    this.saveState();
    this.showTextureModal();
  }

  async showTextureModal() {
    // Fetch product variants from Shopify
    const productHandle = `custom-${this.state.category}`;
    const variants = await this.fetchProductVariants(productHandle);
    
    const modal = this.createTextureModal(variants);
    document.body.appendChild(modal);
  }

  selectTextureAndAddToCart(variantId) {
    this.state.variant = variantId;
    
    // Build complete cart item
    const cartItem = {
      id: variantId,
      quantity: 1,
      properties: {
        '_pattern_id': this.state.pattern.id,
        '_pattern_name': this.state.pattern.name,
        '_custom_colors': this.state.pattern.colors.join(','),
        '_pattern_preview': this.state.pattern.preview,
        '_material_category': this.state.category,
        '_colorflex_config': 'v2.0'
      }
    };
    
    // Add to cart using existing Shopify Cart API
    this.addToCart(cartItem);
    this.clearState();
  }
}
```

### Phase 3: Modal UI Components (3-4 hours)

#### Material Selection Modal:
```javascript
createMaterialModal() {
  const materials = [
    {
      id: 'wallpaper',
      name: 'Wallpaper', 
      icon: '/assets/wallpaper-icon.jpg',
      description: 'Removable, various textures',
      priceFrom: '$45'
    },
    {
      id: 'fabric',
      name: 'Fabric',
      icon: '/assets/fabric-icon.jpg', 
      description: 'Upholstery, curtains, various weights',
      priceFrom: '$38'
    }
  ];

  return `
    <div class="config-modal-overlay">
      <div class="config-modal">
        <h3>Choose Material for: ${this.state.pattern.name}</h3>
        <div class="pattern-preview">
          <img src="${this.state.pattern.preview}" alt="Pattern preview">
        </div>
        <div class="material-grid">
          ${materials.map(material => `
            <div class="material-card" onclick="configFlow.selectMaterial('${material.id}')">
              <img src="${material.icon}" alt="${material.name}">
              <h4>${material.name}</h4>
              <p>${material.description}</p>
              <span class="price-from">From ${material.priceFrom}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
```

#### Texture Selection Modal:
```javascript
createTextureModal(variants) {
  return `
    <div class="config-modal-overlay">
      <div class="config-modal">
        <h3>Choose ${this.state.category} texture</h3>
        <div class="pattern-preview">
          <img src="${this.state.pattern.preview}" alt="Pattern preview">
          <p>${this.state.pattern.name}</p>
        </div>
        <div class="texture-grid">
          ${variants.map(variant => `
            <div class="texture-card" onclick="configFlow.selectTextureAndAddToCart(${variant.id})">
              <img src="${variant.featured_image?.url || '/assets/texture-default.jpg'}" alt="${variant.title}">
              <h4>${variant.title}</h4>
              <p>${variant.description || 'Premium quality finish'}</p>
              <span class="price">$${variant.price}</span>
            </div>
          `).join('')}
        </div>
        <button class="back-button" onclick="configFlow.goBack()">← Back to Materials</button>
      </div>
    </div>
  `;
}
```

### Phase 4: Integration Points (2-3 hours)

#### Modify Existing Add to Cart Function:
```javascript
// In existing CFM.js, modify addPatternToCart function
function addPatternToCart(patternData) {
  // Instead of immediate cart add, start configuration flow
  if (window.configFlow) {
    window.configFlow.interceptAddToCart(patternData);
  } else {
    // Fallback to direct cart add for backward compatibility  
    addToCartDirect(patternData);
  }
}
```

#### Initialize Flow:
```javascript
// Add to CFM.js initialization
document.addEventListener('DOMContentLoaded', function() {
  // Initialize existing ColorFlex...
  initializeColorFlex();
  
  // Initialize new configuration flow
  window.configFlow = new ProductConfigurationFlow();
});
```

## CSS Styling (1-2 hours)

```css
.config-modal-overlay {
  position: fixed;
  top: 0;
  left: 0; 
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.config-modal {
  background: white;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  border-radius: 8px;
  padding: 2rem;
}

.material-grid, .texture-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.material-card, .texture-card {
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.material-card:hover, .texture-card:hover {
  border-color: #d4af37;
  transform: translateY(-2px);
}

.pattern-preview {
  text-align: center;
  margin: 1rem 0;
}

.pattern-preview img {
  max-width: 150px;
  border-radius: 4px;
}
```

## Testing Strategy

### Test Scenarios:
1. **Full Flow**: Pattern → Wallpaper → Textured → Cart
2. **Back Navigation**: Texture → Back to Material → Forward  
3. **State Persistence**: Refresh page mid-flow, should resume
4. **Cart Properties**: Verify all pattern data reaches cart
5. **Price Display**: Correct pricing shown at each step
6. **Mobile Responsive**: All modals work on mobile

### Rollout Plan:
1. **Phase 1**: Internal testing with existing patterns
2. **Phase 2**: A/B test with 50% of traffic  
3. **Phase 3**: Full rollout with analytics tracking

## Timeline Summary
- **Shopify Setup**: 2 hours
- **Code Implementation**: 8 hours  
- **UI/CSS**: 2 hours
- **Testing**: 3 hours
- **Total**: ~15 hours / 2-3 days

This approach gives you the progressive disclosure UX you want while leveraging Shopify's native systems for inventory, pricing, and order management.