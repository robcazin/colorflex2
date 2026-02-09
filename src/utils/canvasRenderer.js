// ============================================
// 2. src/utils/canvasRenderer.js - Canvas Operations
// ============================================

/**
 * Canvas rendering utilities extracted from your CFM.js
 * Handles all the canvas drawing operations
 */
class CanvasRenderer {
  constructor() {
    this.imageCache = new Map();
    this.canvasPool = [];
  }

  /**
   * Your existing processImage function - adapted
   */
  async processImage(url, callback, layerColor = '#7f817e', gamma = 2.2, isShadow = false, isWallPanel = false, isWall = false) {
    console.log(`Processing image ${url} with color ${layerColor}`);
    
    try {
      const img = await this.loadImage(url);
      const canvas = this.getCanvasFromPool(img.width, img.height);
      const ctx = canvas.getContext('2d');

      // Your existing image processing logic
      if (isWall && (!url || url === "")) {
        ctx.fillStyle = layerColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        callback(canvas);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      if (layerColor && !isShadow) {
        const hex = layerColor.replace("#", "");
        const rLayer = parseInt(hex.substring(0, 2), 16);
        const gLayer = parseInt(hex.substring(2, 4), 16);
        const bLayer = parseInt(hex.substring(4, 6), 16);

        // Apply your existing color processing logic
        this.applyColorProcessing(data, rLayer, gLayer, bLayer, isShadow, isWallPanel);
      }

      ctx.putImageData(imageData, 0, 0);
      callback(canvas);

    } catch (error) {
      console.error('Error processing image:', error);
      callback(null);
    }
  }

  /**
   * Your existing color processing logic
   */
  applyColorProcessing(data, rLayer, gLayer, bLayer, isShadow, isWallPanel) {
    // Extract your existing color processing from CFM.js
    for (let i = 0; i < data.length; i += 4) {
      if (isShadow) {
        // Shadow processing
        const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const alpha = 1 - (luminance / 255);
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = Math.round(alpha * 255);
      } else {
        // Regular color processing - adapt your existing logic
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        
        if (brightness < 200) {
          data[i] = rLayer;
          data[i + 1] = gLayer;
          data[i + 2] = bLayer;
          data[i + 3] = 255;
        } else {
          data[i + 3] = 0;
        }
      }
    }
  }

  /**
   * Load image with caching
   */
  async loadImage(src) {
    if (this.imageCache.has(src)) {
      return this.imageCache.get(src);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      
      img.onload = () => {
        this.imageCache.set(src, img);
        resolve(img);
      };
      
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * Canvas pooling for performance
   */
  getCanvasFromPool(width, height) {
    const canvas = this.canvasPool.pop() || document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  /**
   * Return canvas to pool
   */
  returnCanvasToPool(canvas) {
    if (this.canvasPool.length < 10) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.canvasPool.push(canvas);
    }
  }

  /**
   * Your existing drawCenteredImage function
   */
  drawCenteredImage(ctx, img, canvasWidth, canvasHeight) {
    const aspect = img.width / img.height;
    let drawWidth = canvasWidth;
    let drawHeight = drawWidth / aspect;

    if (drawHeight > canvasHeight) {
      drawHeight = canvasHeight;
      drawWidth = drawHeight * aspect;
    }

    const offsetX = Math.round((canvasWidth - drawWidth) / 2);
    const offsetY = Math.round((canvasHeight - drawHeight) / 2);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }

  /**
   * Scale to fit helper
   */
  scaleToFit(img, targetWidth, targetHeight) {
    const aspectRatio = img.width / img.height;
    let drawWidth = targetWidth;
    let drawHeight = targetHeight;
    
    if (aspectRatio > targetWidth / targetHeight) {
      drawHeight = drawWidth / aspectRatio;
    } else {
      drawWidth = drawHeight * aspectRatio;
    }
    
    const x = (targetWidth - drawWidth) / 2;
    const y = (targetHeight - drawHeight) / 2;
    
    return { width: drawWidth, height: drawHeight, x, y };
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.imageCache.clear();
    this.canvasPool = [];
  }
}

export default CanvasRenderer;