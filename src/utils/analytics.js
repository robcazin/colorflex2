// ==============================================
// SHOPIFY ANALYTICS INTEGRATION
// ==============================================

/**
 * ColorFlex Analytics for Shopify
 */
class ColorFlexAnalytics {
  constructor() {
    this.events = [];
    this.sessionId = this.generateSessionId();
  }
  
  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  /**
   * Track ColorFlex events
   */
  track(eventName, properties = {}) {
    const event = {
      event: eventName,
      properties: {
        ...properties,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    };
    
    this.events.push(event);
    
    // Send to Shopify Analytics
    this.sendToShopify(event);
    
    // Send to Google Analytics if available
    this.sendToGA(event);
    
    console.log('📊 ColorFlex Analytics:', event);
  }
  
  sendToShopify(event) {
    // Use Shopify's analytics if available
    if (typeof ShopifyAnalytics !== 'undefined') {
      ShopifyAnalytics.lib.track('ColorFlex ' + event.event, event.properties);
    }
  }
  
  sendToGA(event) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', event.event, {
        event_category: 'ColorFlex',
        event_label: event.properties.pattern || 'Unknown',
        value: event.properties.value || 0,
        custom_parameters: event.properties
      });
    }
    
    // Universal Analytics fallback
    if (typeof ga !== 'undefined') {
      ga('send', 'event', 'ColorFlex', event.event, event.properties.pattern);
    }
  }
  
  /**
   * Track user interactions
   */
  trackPatternSelection(pattern, collection) {
    this.track('pattern_selected', {
      pattern: pattern,
      collection: collection
    });
  }
  
  trackColorChange(layer, color, pattern) {
    this.track('color_changed', {
      layer: layer,
      color: color,
      pattern: pattern
    });
  }
  
  trackCustomizationComplete(customization) {
    this.track('customization_complete', {
      pattern: customization.pattern,
      collection: customization.collection,
      layers_count: customization.layers.length,
      colors: customization.layers.map(l => l.color).join(',')
    });
  }
  
  trackAddToCart(customization, productId) {
    this.track('add_to_cart', {
      ...customization,
      product_id: productId,
      value: 1 // Could be dynamic based on pricing
    });
  }
  
  trackPrintRequest(pattern) {
    this.track('print_requested', {
      pattern: pattern
    });
  }
  
  trackFurnitureMode(enabled, furnitureType) {
    this.track('furniture_mode', {
      enabled: enabled,
      furniture_type: furnitureType
    });
  }
}


export default ColorFlexAnalytics;
