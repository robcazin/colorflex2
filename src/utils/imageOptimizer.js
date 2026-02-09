/**
 * Image Optimization for ColorFlex
 */
class ColorFlexImageOptimizer {
  constructor() {
    this.cache = new Map();
    this.preloadQueue = [];
    this.isPreloading = false;
  }
  
  /**
   * Optimize image URLs for Shopify CDN
   */
  optimizeImageUrl(url, options = {}) {
    if (!url || !url.includes('shopify')) return url;
    
    const {
      width = null,
      height = null,
      format = 'webp',
      quality = 80,
      crop = null
    } = options;
    
    let optimizedUrl = url;
    
    // Add Shopify image transformations
    const params = [];
    if (width) params.push(`width=${width}`);
    if (height) params.push(`height=${height}`);
    if (format && this.supportsWebP()) params.push(`format=${format}`);
    if (quality) params.push(`quality=${quality}`);
    if (crop) params.push(`crop=${crop}`);
    
    if (params.length > 0) {
      const separator = url.includes('?') ? '&' : '?';
      optimizedUrl = `${url}${separator}${params.join('&')}`;
    }
    
    return optimizedUrl;
  }
  
  /**
   * Check WebP support
   */
  supportsWebP() {
    if (this.webpSupport !== undefined) return this.webpSupport;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    this.webpSupport = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    
    return this.webpSupport;
  }
  
  /**
   * Preload critical images
   */
  preloadCriticalImages(imageUrls) {
    imageUrls.forEach(url => {
      if (!this.cache.has(url)) {
        this.preloadQueue.push(url);
      }
    });
    
    if (!this.isPreloading) {
      this.processPreloadQueue();
    }
  }
  
  async processPreloadQueue() {
    if (this.preloadQueue.length === 0) return;
    
    this.isPreloading = true;
    
    // Process 3 images at a time to avoid overwhelming the browser
    while (this.preloadQueue.length > 0) {
      const batch = this.preloadQueue.splice(0, 3);
      await Promise.all(
        batch.map(url => this.preloadImage(url))
      );
    }
    
    this.isPreloading = false;
  }
  
  preloadImage(url) {
    return new Promise((resolve) => {
      if (this.cache.has(url)) {
        resolve();
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        this.cache.set(url, img);
        resolve();
      };
      img.onerror = () => {
        console.warn(`Failed to preload image: ${url}`);
        resolve(); // Don't reject, just continue
      };
      img.src = this.optimizeImageUrl(url, { width: 400 });
    });
  }
}


export default ColorFlexImageOptimizer;
