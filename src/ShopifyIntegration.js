<!-- 
  Shopify Theme Integration Files
  ===============================
-->

<!-- 1. PRODUCT TEMPLATE (product.liquid or product-form.liquid) -->
{% comment %}
Add this to your product template where you want the Color-Flex customizer to appear
{% endcomment %}

{% if product.metafields.color_flex.enabled %}
<div class="color-flex-container" 
     data-product-id="{{ product.id }}"
     data-variant-id="{{ product.selected_or_first_available_variant.id }}"
     data-collection="{{ product.metafields.color_flex.collection_name }}"
     data-debug="{{ settings.color_flex_debug | default: false }}">
  
  <!-- ColorFlex will initialize here -->
  <div id="colorFlexCustomizer"></div>
  
  <!-- Loading state -->
  <div id="colorFlexLoading" class="color-flex-loading">
    <div class="loading-spinner"></div>
    <p>Loading Color-Flex customizer...</p>
  </div>
</div>

<!-- Load ColorFlex assets -->
{{ 'color-flex-core.js' | asset_url | script_tag }}
{{ 'color-flex-styles.css' | asset_url | stylesheet_tag }}

<script>
document.addEventListener('DOMContentLoaded', function() {
  // Initialize ColorFlex when DOM is ready
  const container = document.getElementById('colorFlexCustomizer');
  const loadingEl = document.getElementById('colorFlexLoading');
  
  if (container) {
    const options = {
      productId: '{{ product.id }}',
      variantId: '{{ product.selected_or_first_available_variant.id }}',
      collectionName: '{{ product.metafields.color_flex.collection_name }}',
      defaultPattern: '{{ product.metafields.color_flex.default_pattern }}',
      dataSource: 'metafields',
      apiEndpoint: '/apps/color-flex',
      debug: {{ settings.color_flex_debug | default: false }},
      enableFurniture: {{ product.metafields.color_flex.furniture_enabled | default: false }},
      enablePrint: true,
      redirectToCart: false
    };
    
    // Initialize ColorFlex
    const colorFlex = new ColorFlexCore(container, options);
    
    // Show loading until ready
    colorFlex.on('ready', function() {
      loadingEl.style.display = 'none';
      container.style.display = 'block';
    });
    
    // Handle cart integration
    colorFlex.on('addedToCart', function(event) {
      const { customization } = event.detail;
      
      // Show success message
      showNotification('Custom wallpaper added to cart!', 'success');
      
      // Update cart drawer if you have one
      if (typeof updateCartDrawer === 'function') {
        updateCartDrawer();
      }
      
      // Trigger cart update event for other scripts
      document.dispatchEvent(new CustomEvent('cart:updated', {
        detail: { customization }
      }));
    });
    
    // Handle errors
    colorFlex.on('error', function(event) {
      console.error('ColorFlex error:', event.detail.error);
      showNotification('Failed to load customizer. Please refresh the page.', 'error');
    });
    
    // Initialize
    colorFlex.init();
  }
});

// Utility function for notifications
function showNotification(message, type = 'info') {
  // Implement based on your theme's notification system
  // Example for popular themes:
  
  if (typeof window.theme !== 'undefined' && window.theme.showNotification) {
    // Dawn theme or similar
    window.theme.showNotification(message, type);
  } else if (typeof Shopify !== 'undefined' && Shopify.theme && Shopify.theme.showNotification) {
    // Other themes
    Shopify.theme.showNotification(message, type);
  } else {
    // Fallback
    alert(message);
  }
}
</script>

{% endif %}

<!-- 2. CART TEMPLATE (cart.liquid) -->
{% comment %}
Add this to display customization data in the cart
{% endcomment %}

<div class="cart-items">
  {% for item in cart.items %}
    <div class="cart-item" data-key="{{ item.key }}">
      
      <!-- Standard product info -->
      <div class="cart-item-details">
        <h3>{{ item.product.title }}</h3>
        <p>{{ item.variant.title }}</p>
        <p>Price: {{ item.price | money }}</p>
        <p>Quantity: {{ item.quantity }}</p>
      </div>
      
      <!-- ColorFlex customization display -->
      {% if item.properties._color_customization %}
        <div class="color-flex-customization">
          <h4>🎨 Custom Colors:</h4>
          
          {% assign customization = item.properties._color_customization | parse_json %}
          
          <div class="customization-details">
            <p><strong>Collection:</strong> {{ customization.collection }}</p>
            <p><strong>Pattern:</strong> {{ customization.pattern }}</p>
            
            <div class="color-layers">
              <strong>Colors:</strong>
              <ul>
                {% for layer in customization.layers %}
                  <li>
                    <span class="color-swatch" style="background-color: {{ layer.hex }}"></span>
                    {{ layer.label }}: {{ layer.color }}
                  </li>
                {% endfor %}
              </ul>
            </div>
            
            {% if customization.previewUrl %}
              <div class="preview-image">
                <img src="{{ customization.previewUrl }}" 
                     alt="Custom {{ customization.pattern }} preview"
                     style="max-width: 200px;">
              </div>
            {% endif %}
          </div>
        </div>
      {% endif %}
      
      <!-- Other cart item properties -->
      {% for property in item.properties %}
        {% unless property.first contains '_' %}
          <p><strong>{{ property.first }}:</strong> {{ property.last }}</p>
        {% endunless %}
      {% endfor %}
      
    </div>
  {% endfor %}
</div>

<!-- 3. SETTINGS SCHEMA (config/settings_schema.json) -->
{% comment %}
Add this section to your theme's settings_schema.json
{% endcomment %}

{
  "name": "Color-Flex Settings",
  "settings": [
    {
      "type": "header",
      "content": "Color-Flex Customization"
    },
    {
      "type": "checkbox",
      "id": "color_flex_enabled",
      "label": "Enable Color-Flex",
      "default": true,
      "info": "Enable the Color-Flex customization system across your store"
    },
    {
      "type": "text",
      "id": "color_flex_api_endpoint",
      "label": "API Endpoint",
      "default": "/apps/color-flex",
      "info": "API endpoint for Color-Flex data (leave default for Shopify app)"
    },
    {
      "type": "checkbox",
      "id": "color_flex_debug",
      "label": "Debug Mode",
      "default": false,
      "info": "Enable debug logging (only use for development)"
    },
    {
      "type": "checkbox",
      "id": "color_flex_auto_redirect",
      "label": "Auto Redirect to Cart",
      "default": false,
      "info": "Automatically redirect to cart after adding custom item"
    },
    {
      "type": "select",
      "id": "color_flex_notification_style",
      "label": "Notification Style",
      "options": [
        { "value": "toast", "label": "Toast Notification" },
        { "value": "banner", "label": "Banner" },
        { "value": "modal", "label": "Modal" },
        { "value": "alert", "label": "Browser Alert" }
      ],
      "default": "toast"
    }
  ]
}

<!-- 4. SNIPPETS (snippets/color-flex-cart-item.liquid) -->
{% comment %}
Reusable snippet for displaying Color-Flex customization in cart/checkout
{% endcomment %}

{% assign customization_data = item.properties._color_customization %}
{% if customization_data %}
  {% assign customization = customization_data | parse_json %}
  
  <div class="color-flex-cart-display">
    <div class="customization-header">
      <span class="color-flex-icon">🎨</span>
      <span class="customization-title">Custom Wallpaper</span>
    </div>
    
    <div class="customization-summary">
      <div class="pattern-info">
        <strong>{{ customization.pattern }}</strong>
        <span class="collection-name">({{ customization.collection }})</span>
      </div>
      
      <div class="color-preview">
        {% for layer in customization.layers limit: 4 %}
          <span class="mini-swatch" 
                style="background-color: {{ layer.hex }}"
                title="{{ layer.label }}: {{ layer.color }}"></span>
        {% endfor %}
        {% if customization.layers.size > 4 %}
          <span class="more-colors">+{{ customization.layers.size | minus: 4 }}</span>
        {% endif %}
      </div>
    </div>
    
    <!-- Expandable details -->
    <details class="customization-details">
      <summary>View Color Details</summary>
      <div class="color-list">
        {% for layer in customization.layers %}
          <div class="color-item">
            <span class="color-swatch" style="background-color: {{ layer.hex }}"></span>
            <span class="color-info">
              <strong>{{ layer.label }}</strong><br>
              {{ layer.color }}
            </span>
          </div>
        {% endfor %}
      </div>
    </details>
  </div>
{% endif %}

<!-- 5. EMAIL TEMPLATES -->
{% comment %}
For order confirmation emails (templates/notification/order_confirmation.liquid)
{% endcomment %}

{% for item in order.line_items %}
  <tr class="order-list__item">
    <td class="order-list__item__cell">
      <table>
        <td>
          {{ item.title }}
          {% if item.variant.title != 'Default Title' %}
            <span class="order-list__item-variant">{{ item.variant.title }}</span>
          {% endif %}
          
          <!-- Color-Flex customization in email -->
          {% if item.properties._color_customization %}
            {% assign customization = item.properties._color_customization | parse_json %}
            <div class="color-flex-email-summary">
              <p><strong>🎨 Custom Colors:</strong></p>
              <p>Pattern: {{ customization.pattern }} ({{ customization.collection }})</p>
              <div style="margin-top: 8px;">
                {% for layer in customization.layers %}
                  <div style="margin-bottom: 4px;">
                    <span style="display: inline-block; width: 16px; height: 16px; background-color: {{ layer.hex }}; border: 1px solid #ccc; vertical-align: middle; margin-right: 8px;"></span>
                    <span>{{ layer.label }}: {{ layer.color }}</span>
                  </div>
                {% endfor %}
              </div>
            </div>
          {% endif %}
        </td>
        <td class="order-list__price-cell">
          {{ item.quantity }} × {{ item.price | money }}
        </td>
      </table>
    </td>
  </tr>
{% endfor %}

<!-- 6. AJAX CART INTEGRATION (snippets/ajax-cart-integration.liquid) -->
<script>
// Enhanced cart functionality for Color-Flex
class ColorFlexCartIntegration {
  constructor() {
    this.init();
  }
  
  init() {
    // Listen for cart updates
    document.addEventListener('cart:updated', this.handleCartUpdate.bind(this));
    
    // Enhance existing cart drawer/popup
    this.enhanceCartDisplay();
  }
  
  handleCartUpdate(event) {
    const { customization } = event.detail || {};
    
    if (customization) {
      // Update cart count
      this.updateCartCount();
      
      // Show success message with preview
      this.showCustomizationPreview(customization);
      
      // Update any cart drawers
      this.refreshCartDrawer();
    }
  }
  
  showCustomizationPreview(customization) {
    const preview = document.createElement('div');
    preview.className = 'color-flex-success-preview';
    preview.innerHTML = `
      <div class="success-content">
        <h4>✅ Custom wallpaper added to cart!</h4>
        <div class="preview-summary">
          <strong>${customization.pattern}</strong>
          <div class="color-swatches">
            ${customization.layers.slice(0, 4).map(layer => 
              `<span style="background-color: ${layer.hex}" title="${layer.label}: ${layer.color}"></span>`
            ).join('')}
          </div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()">Close</button>
      </div>
    `;
    
    document.body.appendChild(preview);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (preview.parentElement) {
        preview.remove();
      }
    }, 5000);
  }
  
  updateCartCount() {
    // Update cart counter in header
    fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(el => {
          el.textContent = cart.item_count;
        });
      });
  }
  
  refreshCartDrawer() {
    // Trigger cart drawer refresh if it exists
    if (typeof refreshCartDrawer === 'function') {
      refreshCartDrawer();
    }
    
    // Or dispatch event for other cart systems
    document.dispatchEvent(new CustomEvent('cart:refresh'));
  }
  
  enhanceCartDisplay() {
    // Add Color-Flex styling to existing cart items
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
          this.processNewCartItems(mutation.addedNodes);
        }
      });
    });
    
    // Watch for cart drawer updates
    const cartContainer = document.querySelector('[data-cart-drawer], [data-cart-popup], .cart-drawer');
    if (cartContainer) {
      observer.observe(cartContainer, { childList: true, subtree: true });
    }
  }
  
  processNewCartItems(nodes) {
    nodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const customItems = node.querySelectorAll('[data-color-flex-item]');
        customItems.forEach(item => {
          this.enhanceCartItem(item);
        });
      }
    });
  }
  
  enhanceCartItem(item) {
    // Add visual enhancements to Color-Flex cart items
    item.classList.add('color-flex-enhanced');
    
    // Add hover effects for color swatches
    const swatches = item.querySelectorAll('.color-swatch, .mini-swatch');
    swatches.forEach(swatch => {
      swatch.addEventListener('mouseenter', function() {
        const tooltip = this.getAttribute('title');
        if (tooltip) {
          this.setAttribute('data-tooltip', tooltip);
        }
      });
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ColorFlexCartIntegration();
});
</script>