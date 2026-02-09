/**
 * Main ColorFlex initialization for Shopify themes
 */
class ColorFlexLazyLoader {
  constructor() {
    this.isLoaded = false;
  }
  
  loadColorFlex(callback) {
    // Simple implementation for now
    this.isLoaded = true;
    return callback();
  }
}

(function() {
  'use strict';
  
  // Initialize lazy loader
  // const lazyLoader = new ColorFlexLazyLoader();
  
  // Initialize image optimizer
  // const imageOptimizer = new ColorFlexImageOptimizer();
  // window.colorFlexImageOptimizer = imageOptimizer;
  
  // Initialize analytics
  // const analytics = new ColorFlexAnalytics();
  // window.colorFlexAnalytics = analytics;
  
  // Expose utilities globally
  // window.ColorFlexLazyLoader = ColorFlexLazyLoader;
  // window.ColorFlexImageOptimizer = ColorFlexImageOptimizer;
  // window.ColorFlexAnalytics = ColorFlexAnalytics;
  
  // Theme integration helpers
  window.ColorFlexHelpers = {
    
    /**
     * Initialize ColorFlex on any element
     */
    init: function(selector, options = {}) {
      const container = document.querySelector(selector);
      if (!container) {
        console.error('ColorFlex container not found:', selector);
        return null;
      }
      
      return lazyLoader.loadColorFlex(() => {
        const colorFlex = new ColorFlexCore(container, options);
        colorFlex.init();
        return colorFlex;
      });
    },
    
    /**
     * Preload images for better performance
     */
    preloadImages: function(imageUrls) {
      imageOptimizer.preloadCriticalImages(imageUrls);
    },
    
    /**
     * Track custom events
     */
    track: function(eventName, properties) {
      analytics.track(eventName, properties);
    },
    
    /**
     * Get optimized image URL
     */
    optimizeImage: function(url, options) {
      return imageOptimizer.optimizeImageUrl(url, options);
    },
    
    /**
     * Check if ColorFlex is loaded
     */
    isLoaded: function() {
      return lazyLoader.isLoaded;
    }
  };
  
  console.log('🎨 ColorFlex for Shopify initialized');
  
})();


export default ColorFlexLazyLoader;
