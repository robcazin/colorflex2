/**
 * Pattern to Collection Mapping Fix
 * This utility ensures correct collection mapping for URL generation
 */

const PATTERN_TO_COLLECTION_MAP = {
  // Bombay collection patterns
  "etawah": "bombay",
  "diamond harbour": "bombay", 
  "morena": "bombay",
  "darjeeling": "bombay",
  "arcot": "bombay",
  
  // Botanicals collection patterns
  "flowering fern": "botanicals",
  "tall lilly plant": "botanicals", 
  "shadow dance": "botanicals",
  "key largo": "botanicals",
  "dutch stripe": "botanicals",
  
  // Additional collections for completeness
  "pink tulip large": "abundance",
  "cornflower blue large": "abundance",
  "white tulips on light colors large": "abundance",
  "blubirds large": "abundance",
  "regal reds large": "abundance",
  
  "piqua 1852": "coverlets",
  "charleston bay": "coverlets",
  "oxford": "coverlets", 
  "rosemount": "coverlets",
  "franklin": "coverlets",
  
  "keswick": "english-cottage",
  "lyme regis": "english-cottage",
  "maidstone": "english-cottage",
  "yarmouth": "english-cottage",
  "penzance": "english-cottage",
  "crowborough": "english-cottage",
  
  "florencia": "traditions",
  "agnes": "traditions",
  "madeline": "traditions", 
  "rosemary": "traditions",
  "esperanza": "traditions",
  
  "chicken scratch": "farmhouse",
  "farm toile": "farmhouse",
  "root vegetables paper scraps": "farmhouse",
  "color": "farmhouse",
  "chicken farmers": "farmhouse",
  "root vegetables": "farmhouse",
  "lancaster tole": "farmhouse",
  
  "riparian": "geometry",
  "fluvial": "geometry",
  "meander": "geometry",
  "allurium": "geometry", 
  "thalweg": "geometry",
  "oxbow": "geometry",
  "rapids": "geometry",
  
  "palmyra": "silk-road",
  "byzantine": "silk-road",
  "kathmandu": "silk-road",
  "constantinople": "silk-road",
  "multan": "silk-road",
  "izmir": "silk-road",
  
  "baton rouge": "new-orleans",
  "concordia": "new-orleans", 
  "acadia": "new-orleans",
  "caldwell": "new-orleans",
  "cameron": "new-orleans",
  
  "flame tree": "folksie",
  "folk vine": "folksie",
  "cherie cherie": "folksie",
  "my cherie amour": "folksie",
  
  "gingham small": "coordinates",
  "wycoff tweed": "coordinates",
  "dakota plaid": "coordinates",
  "baythorn small": "coordinates",
  "theodore large": "coordinates",
  "trenton ticking": "coordinates",
  "zane linen": "coordinates",
  "trenton ticking small": "coordinates",
  "baythorn large": "coordinates",
  "ashbourne": "coordinates",
  "xena tweed": "coordinates",
  "dottie": "coordinates",
  "northwich": "coordinates",
  "garden path": "coordinates",
  "pennington": "coordinates",
  "utica ticking": "coordinates",
  "gingham large": "coordinates",
  "tresselwood": "coordinates"
};

/**
 * Get the correct collection name for a pattern
 * @param {string} patternName - The name of the pattern
 * @returns {string|null} - The correct collection name or null if not found
 */
function getCorrectCollectionForPattern(patternName) {
  if (!patternName) return null;
  
  const key = patternName.toLowerCase().trim();
  const collection = PATTERN_TO_COLLECTION_MAP[key];
  
  if (!collection) {
    console.warn(`⚠️ Pattern "${patternName}" not found in mapping. Please check the pattern name.`);
    return null;
  }
  
  return collection;
}

/**
 * Build a correct ColorFlex URL with the right collection parameter
 * @param {string} patternName - The pattern name
 * @param {Object} options - Additional URL parameters
 * @returns {string} - The correctly formatted URL
 */
function buildColorFlexURL(patternName, options = {}) {
  const collection = getCorrectCollectionForPattern(patternName);
  
  if (!collection) {
    console.error(`❌ Cannot build URL for pattern "${patternName}" - collection not found`);
    return null;
  }
  
  const baseUrl = options.baseUrl || '/pages/colorflex';
  const params = new URLSearchParams();
  
  // Add collection and pattern
  params.set('collection', collection);
  params.set('pattern', patternName);
  
  // Add any additional parameters
  Object.entries(options.params || {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      params.set(key, value);
    }
  });
  
  const url = `${baseUrl}?${params.toString()}`;
  
  console.log(`✅ Built URL for "${patternName}": ${url}`);
  return url;
}

/**
 * Validate that a pattern is correctly mapped to its expected collection
 * @param {string} patternName - The pattern name
 * @param {string} expectedCollection - The collection name you expect
 * @returns {Object} - Validation result
 */
function validatePatternMapping(patternName, expectedCollection) {
  const actualCollection = getCorrectCollectionForPattern(patternName);
  
  return {
    pattern: patternName,
    expected: expectedCollection,
    actual: actualCollection,
    isCorrect: actualCollection === expectedCollection,
    found: !!actualCollection
  };
}

/**
 * Fix incorrect URL parameters by replacing wrong collection with correct one
 * @param {string} url - The URL to fix
 * @returns {string} - The corrected URL
 */
function fixColorFlexURL(url) {
  try {
    const urlObj = new URL(url, window.location.origin);
    const params = urlObj.searchParams;
    
    const patternName = params.get('pattern');
    const currentCollection = params.get('collection');
    
    if (!patternName) {
      console.warn('⚠️ No pattern parameter found in URL');
      return url;
    }
    
    const correctCollection = getCorrectCollectionForPattern(patternName);
    
    if (!correctCollection) {
      console.warn(`⚠️ No collection mapping found for pattern "${patternName}"`);
      return url;
    }
    
    if (currentCollection !== correctCollection) {
      console.log(`🔧 Fixing URL: "${patternName}" should use collection "${correctCollection}" not "${currentCollection}"`);
      params.set('collection', correctCollection);
      urlObj.search = params.toString();
      return urlObj.toString();
    }
    
    return url;
  } catch (error) {
    console.error('❌ Error fixing URL:', error);
    return url;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PATTERN_TO_COLLECTION_MAP,
    getCorrectCollectionForPattern,
    buildColorFlexURL,
    validatePatternMapping,
    fixColorFlexURL
  };
} else {
  // Browser environment
  window.PatternMappingFix = {
    PATTERN_TO_COLLECTION_MAP,
    getCorrectCollectionForPattern,
    buildColorFlexURL, 
    validatePatternMapping,
    fixColorFlexURL
  };
}

// Example usage and testing
if (typeof window !== 'undefined') {
  console.log('🧪 Testing Pattern Mapping Fix:');
  
  // Test the specific issue
  const etawahTest = validatePatternMapping('Etawah', 'bombay');
  console.log('Etawah validation:', etawahTest);
  
  // Test building URLs
  const etawahURL = buildColorFlexURL('Etawah');
  console.log('Etawah URL:', etawahURL);
  
  // Test fixing incorrect URL
  const incorrectURL = '/pages/colorflex?collection=botanicals&pattern=Etawah';
  const fixedURL = fixColorFlexURL(incorrectURL);
  console.log('Fixed URL:', fixedURL);
}