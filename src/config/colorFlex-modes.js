/**
 * ColorFlex Multi-Mode Configuration
 * Supports: Wallpaper/Fabric, Furniture, Clothing
 *
 * Created: November 11, 2025
 */

export const COLORFLEX_MODES = {
  WALLPAPER: {
    id: 'wallpaper',
    name: 'Wallpaper & Fabric',
    displayName: 'ColorFlex for Walls & Fabrics',

    // Materials available for purchase
    materials: [
      {
        name: 'Wallpaper',
        price: 89.99,
        unit: 'roll',
        description: 'Professional-grade removable wallpaper'
      },
      {
        name: 'Fabric',
        price: 79.99,
        unit: 'yard',
        minQuantity: 1,
        description: 'High-quality fabric for upholstery and decor'
      },
      {
        name: 'Removable Decal',
        price: 69.99,
        unit: 'sheet',
        description: 'Vinyl decal perfect for temporary decoration'
      }
    ],

    // Scale/repeat size settings
    scale: {
      min: 50,
      max: 400,
      default: 100,
      step: 50,
      labels: {
        50: '0.5X',
        100: 'Normal',
        200: '2X',
        300: '3X',
        400: '4X'
      }
    },

    // Mockup visualization settings
    mockups: {
      enabled: true,
      type: 'room',
      default: 'wallpaper-mockup-39-W60H45.png',
      basePath: '/data/mockups/',
      options: [
        {
          id: 'room1',
          name: 'Modern Living Room',
          image: 'wallpaper-mockup-39-W60H45.png',
          shadow: 'wallpaper-mockup-39-shadow-W60H45.jpg'
        }
      ]
    },

    // Collections data source
    collectionsPath: '/assets/collections.json',
    collectionsFilter: (c) => {
      // Exclude furniture and clothing collections
      return !c.name.includes('.fur-') && !c.name.includes('.clo-');
    },

    // UI customization
    ui: {
      primaryColor: '#d4af37',
      backgroundColor: '#1a202c',
      showScaleControl: true,
      showMockupSelector: true,
      showRoomMockup: true,
      patternPreviewSize: { width: 700, height: 700 },
      curatedColorsPosition: 'top',
      chameleonIcon: 'https://so-animation.com/colorflex/img/camelion-sm-r.jpg'
    },

    // Feature flags
    features: {
      colorLock: true,
      downloadProof: true,
      saveDesigns: true,
      shareDesign: true,
      printPattern: true
    }
  },

  FURNITURE: {
    id: 'furniture',
    name: 'Furniture Upholstery',
    displayName: 'ColorFlex for Furniture',

    materials: [
      {
        name: 'Decorator Linen',
        price: 29.99,
        unit: 'yard',
        minQuantity: 5,
        description: 'Mid-weight linen perfect for upholstery'
      },
      {
        name: 'Soft Velvet',
        price: 36.99,
        unit: 'yard',
        minQuantity: 5,
        description: 'Luxurious velvet with rich texture'
      },
      {
        name: 'Faux Suede',
        price: 32.99,
        unit: 'yard',
        minQuantity: 5,
        description: 'Durable suede-look fabric'
      },
      {
        name: 'Drapery Sheer',
        price: 24.99,
        unit: 'yard',
        minQuantity: 5,
        description: 'Lightweight sheer fabric'
      }
    ],

    scale: {
      min: 100,
      max: 200,
      default: 100,
      step: 25,
      labels: {
        100: 'Normal',
        125: '1.25X',
        150: '1.5X',
        175: '1.75X',
        200: '2X'
      }
    },

    mockups: {
      enabled: true,
      type: 'furniture',
      default: 'chair-mockup.jpg',
      basePath: '/data/mockups/furniture/',
      options: [
        {
          id: 'chair',
          name: 'Armchair',
          image: 'chair-mockup.jpg',
          mask: 'chair-mask.png'
        },
        {
          id: 'sofa',
          name: 'Sofa',
          image: 'sofa-mockup.jpg',
          mask: 'sofa-mask.png'
        }
      ],
      zoom: {
        enabled: true,
        minScale: 1.0,
        maxScale: 3.0,
        defaultScale: 0.7,
        zoomScale: 2.2
      }
    },

    collectionsPath: '/assets/collections.json',
    collectionsFilter: (c) => {
      // Include all collections for furniture (patterns work on furniture)
      // Or could filter to specific furniture collections
      return true;
    },

    ui: {
      primaryColor: '#8b4513', // Brown for furniture
      backgroundColor: '#1a202c',
      showScaleControl: true,
      showMockupSelector: true,
      showRoomMockup: false, // Use furniture mockups instead
      patternPreviewSize: { width: 600, height: 600 },
      curatedColorsPosition: 'top',
      chameleonIcon: 'https://so-animation.com/colorflex/img/camelion-sm-r.jpg'
    },

    features: {
      colorLock: true,
      downloadProof: true,
      saveDesigns: true,
      shareDesign: true,
      printPattern: true,
      zoomMockup: true // Furniture-specific
    }
  },

  CLOTHING: {
    id: 'clothing',
    name: 'Custom Clothing',
    displayName: 'ColorFlex for Apparel',

    materials: [
      {
        name: 'Cotton Poplin',
        price: 24.99,
        unit: 'yard',
        minQuantity: 2,
        description: 'Crisp, breathable cotton for shirts and dresses'
      },
      {
        name: 'Jersey Knit',
        price: 29.99,
        unit: 'yard',
        minQuantity: 2,
        description: 'Stretchy knit fabric for t-shirts and casual wear'
      },
      {
        name: 'Silk Charmeuse',
        price: 49.99,
        unit: 'yard',
        minQuantity: 2,
        description: 'Luxurious silk with beautiful drape'
      },
      {
        name: 'Performance Polyester',
        price: 19.99,
        unit: 'yard',
        minQuantity: 2,
        description: 'Moisture-wicking athletic fabric'
      }
    ],

    scale: {
      min: 25,
      max: 100,
      default: 50,
      step: 25,
      labels: {
        25: 'Small',
        50: 'Medium',
        75: 'Large',
        100: 'X-Large'
      }
    },

    mockups: {
      enabled: true,
      type: 'clothing',
      default: 'tshirt-front.jpg',
      basePath: '/data/mockups/clothing/',
      options: [
        {
          id: 'tshirt',
          name: 'T-Shirt',
          image: 'tshirt-front.jpg',
          mask: 'tshirt-mask.png',
          backImage: 'tshirt-back.jpg'
        },
        {
          id: 'dress',
          name: 'Dress',
          image: 'dress-front.jpg',
          mask: 'dress-mask.png',
          backImage: 'dress-back.jpg'
        },
        {
          id: 'hoodie',
          name: 'Hoodie',
          image: 'hoodie-front.jpg',
          mask: 'hoodie-mask.png',
          backImage: 'hoodie-back.jpg'
        }
      ],
      showFrontBack: true // Clothing-specific toggle
    },

    collectionsPath: '/assets/collections.json',
    collectionsFilter: (c) => {
      // Include clothing collections or all collections
      return c.name.includes('.clo-') || !c.name.includes('.fur-');
    },

    ui: {
      primaryColor: '#4a90e2', // Blue for clothing
      backgroundColor: '#1a202c',
      showScaleControl: true,
      showMockupSelector: true,
      showRoomMockup: false,
      patternPreviewSize: { width: 500, height: 700 },
      curatedColorsPosition: 'top',
      chameleonIcon: 'https://so-animation.com/colorflex/img/camelion-sm-r.jpg'
    },

    features: {
      colorLock: true,
      downloadProof: true,
      saveDesigns: true,
      shareDesign: true,
      printPattern: true,
      frontBackToggle: true // Clothing-specific
    }
  }
};

/**
 * Detect which mode ColorFlex should run in
 * Priority: URL param > page path > collection param > default
 */
export function detectMode() {
  // Check URL parameter first (?mode=furniture)
  const urlParams = new URLSearchParams(window.location.search);
  const modeParam = urlParams.get('mode');
  if (modeParam) {
    const upperMode = modeParam.toUpperCase();
    if (COLORFLEX_MODES[upperMode]) {
      console.log(`🎨 Mode detected from URL parameter: ${upperMode}`);
      return upperMode;
    }
  }

  // Check page path
  const pagePath = window.location.pathname;
  if (pagePath.includes('furniture') || pagePath.includes('colorflex-furniture')) {
    console.log('🪑 Mode detected from page path: FURNITURE');
    return 'FURNITURE';
  }
  if (pagePath.includes('clothing') || pagePath.includes('colorflex-clothing')) {
    console.log('👕 Mode detected from page path: CLOTHING');
    return 'CLOTHING';
  }

  // Check collection parameter (?collection=bombay.fur-1)
  const collectionParam = urlParams.get('collection');
  if (collectionParam) {
    if (collectionParam.includes('.fur-')) {
      console.log('🪑 Mode detected from collection param: FURNITURE');
      return 'FURNITURE';
    }
    if (collectionParam.includes('.clo-')) {
      console.log('👕 Mode detected from collection param: CLOTHING');
      return 'CLOTHING';
    }
  }

  // Default to wallpaper
  console.log('🏠 Mode defaulted to: WALLPAPER');
  return 'WALLPAPER';
}

/**
 * Get the configuration for the current mode
 */
export function getCurrentConfig() {
  const mode = detectMode();
  const config = COLORFLEX_MODES[mode];

  console.log(`✅ ColorFlex Config Loaded:`, {
    mode: config.name,
    materials: config.materials.length,
    scaleRange: `${config.scale.min}% - ${config.scale.max}%`,
    mockupsEnabled: config.mockups.enabled,
    primaryColor: config.ui.primaryColor
  });

  return config;
}

/**
 * Check if a feature is enabled for current mode
 */
export function isFeatureEnabled(featureName) {
  const config = getCurrentConfig();
  return config.features[featureName] === true;
}

/**
 * Get materials for current mode
 */
export function getMaterials() {
  const config = getCurrentConfig();
  return config.materials;
}

/**
 * Get scale options for current mode
 */
export function getScaleOptions() {
  const config = getCurrentConfig();
  const options = [];

  for (let scale = config.scale.min; scale <= config.scale.max; scale += config.scale.step) {
    options.push({
      value: scale,
      label: config.scale.labels[scale] || `${scale}%`
    });
  }

  return options;
}

// Export for global access
if (typeof window !== 'undefined') {
  window.ColorFlexModes = {
    detectMode,
    getCurrentConfig,
    isFeatureEnabled,
    getMaterials,
    getScaleOptions,
    MODES: COLORFLEX_MODES
  };
}
