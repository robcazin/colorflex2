(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["ColorFlex"] = factory();
	else
		root["ColorFlex"] = factory();
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/CFM.js"
/*!********************!*\
  !*** ./src/CFM.js ***!
  \********************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _config_colorFlex_modes_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./config/colorFlex-modes.js */ "./src/config/colorFlex-modes.js");
var _excluded=["thumbnail"],_excluded2=["thumbnail"];function _regeneratorValues(e){if(null!=e){var t=e["function"==typeof Symbol&&Symbol.iterator||"@@iterator"],r=0;if(t)return t.call(e);if("function"==typeof e.next)return e;if(!isNaN(e.length))return{next:function next(){return e&&r>=e.length&&(e=void 0),{value:e&&e[r++],done:!e};}};}throw new TypeError(_typeof(e)+" is not iterable");}function _createForOfIteratorHelper(r,e){var t="undefined"!=typeof Symbol&&r[Symbol.iterator]||r["@@iterator"];if(!t){if(Array.isArray(r)||(t=_unsupportedIterableToArray(r))||e&&r&&"number"==typeof r.length){t&&(r=t);var _n=0,F=function F(){};return{s:F,n:function n(){return _n>=r.length?{done:!0}:{done:!1,value:r[_n++]};},e:function e(r){throw r;},f:F};}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}var o,a=!0,u=!1;return{s:function s(){t=t.call(r);},n:function n(){var r=t.next();return a=r.done,r;},e:function e(r){u=!0,o=r;},f:function f(){try{a||null==t["return"]||t["return"]();}finally{if(u)throw o;}}};}function _typeof(o){"@babel/helpers - typeof";return _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(o){return typeof o;}:function(o){return o&&"function"==typeof Symbol&&o.constructor===Symbol&&o!==Symbol.prototype?"symbol":typeof o;},_typeof(o);}function _slicedToArray(r,e){return _arrayWithHoles(r)||_iterableToArrayLimit(r,e)||_unsupportedIterableToArray(r,e)||_nonIterableRest();}function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function _iterableToArrayLimit(r,l){var t=null==r?null:"undefined"!=typeof Symbol&&r[Symbol.iterator]||r["@@iterator"];if(null!=t){var e,n,i,u,a=[],f=!0,o=!1;try{if(i=(t=t.call(r)).next,0===l){if(Object(t)!==t)return;f=!1;}else for(;!(f=(e=i.call(t)).done)&&(a.push(e.value),a.length!==l);f=!0);}catch(r){o=!0,n=r;}finally{try{if(!f&&null!=t["return"]&&(u=t["return"](),Object(u)!==u))return;}finally{if(o)throw n;}}return a;}}function _arrayWithHoles(r){if(Array.isArray(r))return r;}function ownKeys(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);r&&(o=o.filter(function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable;})),t.push.apply(t,o);}return t;}function _objectSpread(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?ownKeys(Object(t),!0).forEach(function(r){_defineProperty(e,r,t[r]);}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):ownKeys(Object(t)).forEach(function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r));});}return e;}function _defineProperty(e,r,t){return(r=_toPropertyKey(r))in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e;}function _toPropertyKey(t){var i=_toPrimitive(t,"string");return"symbol"==_typeof(i)?i:i+"";}function _toPrimitive(t,r){if("object"!=_typeof(t)||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var i=e.call(t,r||"default");if("object"!=_typeof(i))return i;throw new TypeError("@@toPrimitive must return a primitive value.");}return("string"===r?String:Number)(t);}function _regenerator(){/*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */var e,t,r="function"==typeof Symbol?Symbol:{},n=r.iterator||"@@iterator",o=r.toStringTag||"@@toStringTag";function i(r,n,o,i){var c=n&&n.prototype instanceof Generator?n:Generator,u=Object.create(c.prototype);return _regeneratorDefine2(u,"_invoke",function(r,n,o){var i,c,u,f=0,p=o||[],y=!1,G={p:0,n:0,v:e,a:d,f:d.bind(e,4),d:function d(t,r){return i=t,c=0,u=e,G.n=r,a;}};function d(r,n){for(c=r,u=n,t=0;!y&&f&&!o&&t<p.length;t++){var o,i=p[t],d=G.p,l=i[2];r>3?(o=l===n)&&(u=i[(c=i[4])?5:(c=3,3)],i[4]=i[5]=e):i[0]<=d&&((o=r<2&&d<i[1])?(c=0,G.v=n,G.n=i[1]):d<l&&(o=r<3||i[0]>n||n>l)&&(i[4]=r,i[5]=n,G.n=l,c=0));}if(o||r>1)return a;throw y=!0,n;}return function(o,p,l){if(f>1)throw TypeError("Generator is already running");for(y&&1===p&&d(p,l),c=p,u=l;(t=c<2?e:u)||!y;){i||(c?c<3?(c>1&&(G.n=-1),d(c,u)):G.n=u:G.v=u);try{if(f=2,i){if(c||(o="next"),t=i[o]){if(!(t=t.call(i,u)))throw TypeError("iterator result is not an object");if(!t.done)return t;u=t.value,c<2&&(c=0);}else 1===c&&(t=i["return"])&&t.call(i),c<2&&(u=TypeError("The iterator does not provide a '"+o+"' method"),c=1);i=e;}else if((t=(y=G.n<0)?u:r.call(n,G))!==a)break;}catch(t){i=e,c=1,u=t;}finally{f=1;}}return{value:t,done:y};};}(r,o,i),!0),u;}var a={};function Generator(){}function GeneratorFunction(){}function GeneratorFunctionPrototype(){}t=Object.getPrototypeOf;var c=[][n]?t(t([][n]())):(_regeneratorDefine2(t={},n,function(){return this;}),t),u=GeneratorFunctionPrototype.prototype=Generator.prototype=Object.create(c);function f(e){return Object.setPrototypeOf?Object.setPrototypeOf(e,GeneratorFunctionPrototype):(e.__proto__=GeneratorFunctionPrototype,_regeneratorDefine2(e,o,"GeneratorFunction")),e.prototype=Object.create(u),e;}return GeneratorFunction.prototype=GeneratorFunctionPrototype,_regeneratorDefine2(u,"constructor",GeneratorFunctionPrototype),_regeneratorDefine2(GeneratorFunctionPrototype,"constructor",GeneratorFunction),GeneratorFunction.displayName="GeneratorFunction",_regeneratorDefine2(GeneratorFunctionPrototype,o,"GeneratorFunction"),_regeneratorDefine2(u),_regeneratorDefine2(u,o,"Generator"),_regeneratorDefine2(u,n,function(){return this;}),_regeneratorDefine2(u,"toString",function(){return"[object Generator]";}),(_regenerator=function _regenerator(){return{w:i,m:f};})();}function _regeneratorDefine2(e,r,n,t){var i=Object.defineProperty;try{i({},"",{});}catch(e){i=0;}_regeneratorDefine2=function _regeneratorDefine(e,r,n,t){function o(r,n){_regeneratorDefine2(e,r,function(e){return this._invoke(r,n,e);});}r?i?i(e,r,{value:n,enumerable:!t,configurable:!t,writable:!t}):e[r]=n:(o("next",0),o("throw",1),o("return",2));},_regeneratorDefine2(e,r,n,t);}function asyncGeneratorStep(n,t,e,r,o,a,c){try{var i=n[a](c),u=i.value;}catch(n){return void e(n);}i.done?t(u):Promise.resolve(u).then(r,o);}function _asyncToGenerator(n){return function(){var t=this,e=arguments;return new Promise(function(r,o){var a=n.apply(t,e);function _next(n){asyncGeneratorStep(a,r,o,_next,_throw,"next",n);}function _throw(n){asyncGeneratorStep(a,r,o,_next,_throw,"throw",n);}_next(void 0);});};}function _objectWithoutProperties(e,t){if(null==e)return{};var o,r,i=_objectWithoutPropertiesLoose(e,t);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);for(r=0;r<n.length;r++)o=n[r],-1===t.indexOf(o)&&{}.propertyIsEnumerable.call(e,o)&&(i[o]=e[o]);}return i;}function _objectWithoutPropertiesLoose(r,e){if(null==r)return{};var t={};for(var n in r)if({}.hasOwnProperty.call(r,n)){if(-1!==e.indexOf(n))continue;t[n]=r[n];}return t;}function _toConsumableArray(r){return _arrayWithoutHoles(r)||_iterableToArray(r)||_unsupportedIterableToArray(r)||_nonIterableSpread();}function _nonIterableSpread(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");}function _unsupportedIterableToArray(r,a){if(r){if("string"==typeof r)return _arrayLikeToArray(r,a);var t={}.toString.call(r).slice(8,-1);return"Object"===t&&r.constructor&&(t=r.constructor.name),"Map"===t||"Set"===t?Array.from(r):"Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?_arrayLikeToArray(r,a):void 0;}}function _iterableToArray(r){if("undefined"!=typeof Symbol&&null!=r[Symbol.iterator]||null!=r["@@iterator"])return Array.from(r);}function _arrayWithoutHoles(r){if(Array.isArray(r))return _arrayLikeToArray(r);}function _arrayLikeToArray(r,a){(null==a||a>r.length)&&(a=r.length);for(var e=0,n=Array(a);e<a;e++)n[e]=r[e];return n;}/**
 * ============================================================================
 * CFM.JS - COLORFLEX MAIN APPLICATION
 * ============================================================================
 *
 * Version: Build 999 (November 2025)
 * Total Lines: ~13,170
 *
 * This file contains the complete ColorFlex pattern customization system
 * for the Saffron Cottage Shopify store.
 *
 * ============================================================================
 * QUICK NAVIGATION - TABLE OF CONTENTS
 * ============================================================================
 *
 * SECTION 1: Configuration & Debug Flags .................... Lines 60-230
 *   - Mode detection imports, debug flags, app state object
 *   - Fabric tuning parameters
 *
 * SECTION 2: Customer Save System ........................... Lines 240-2850
 *   - capturePatternThumbnail() - Thumbnail generation
 *   - generatePatternId() - Unique ID creation
 *   - savePattern() - LocalStorage save logic
 *   - saveToShopifyMetafields() - Shopify customer save
 *   - cleanupOldCartThumbnails() - Storage management
 *   - showSavedPatternsModal() - My Designs modal UI
 *   - exportPattern() / importPattern() - JSON export/import
 *   - showMaterialSelectionModal() - Material picker UI
 *
 * SECTION 3: Pattern Loading & Preview ...................... Lines 2850-4300
 *   - previewSavedPattern() - Load saved pattern to preview
 *   - loadSavedPatternToUI() - Restore pattern state
 *   - validateDOMElements() - DOM element validation
 *
 * SECTION 4: Furniture Mode System .......................... Lines 4300-5400
 *   - initializeTryFurnitureFeature() - Furniture mode init
 *   - selectFurniture() - Furniture selection
 *   - switchToFurnitureMode() - Mode switching
 *   - resolveFurniturePatternPaths() - Path resolution
 *   - renderFabricMockup() - Furniture canvas rendering
 *
 * SECTION 5: Color Management System ........................ Lines 5400-6700
 *   - getCleanColorName() / formatColorWithSW() - Color formatting
 *   - hexToHSL() / hslToHex() - Color conversion
 *   - findClosestSWColor() - Sherwin-Williams lookup
 *   - populateCuratedColors() - Curated color palettes
 *   - Ticket system functions - Color ticket management
 *
 * SECTION 6: App Initialization ............................. Lines 6700-7600
 *   - initializeApp() - Main app startup (406 lines)
 *   - Collection loading and filtering
 *   - URL parameter processing
 *   - Event listener setup
 *
 * SECTION 7: Pattern Selection & Layer Building ............. Lines 7600-8700
 *   - handlePatternSelection() - Pattern click handler
 *   - applyColorsToLayerInputs() - Color application
 *   - buildLayerModel() - Layer data structure building
 *
 * SECTION 8: Core Rendering System .......................... Lines 8700-10500
 *   - loadImage() - Image loading and caching (700+ lines)
 *   - updatePreview() - Main canvas preview
 *   - updateRoomMockup() - Room scene rendering
 *
 * SECTION 9: Color Lock & Thumbnails ........................ Lines 10500-11300
 *   - toggleColorLock() - Color persistence
 *   - handleThumbnailClick() - Thumbnail interactions
 *   - capturePatternThumbnailBuiltIn() - Built-in thumbnail capture
 *
 * SECTION 10: Pattern Helpers & Fabric Mode ................. Lines 11300-12300
 *   - getPatternType() / getColorMapping() - Pattern utilities
 *   - addFabricTuningControls() - Fabric tuning UI
 *   - addTryFabricButton() - Fabric mode toggle
 *
 * SECTION 11: Pattern Proof Generation ...................... Lines 12300-13000
 *   - downloadPatternProof() - High-quality proof export
 *   - generatePatternProofWithInfo() - Proof with metadata
 *   - Material pricing functions
 *   ⚠️ IMPORTANT: Uses proofPath layers, not preview layers
 *
 * SECTION 12: Utilities & Global Exports .................... Lines 13000-13170
 *   - showNotification() - Toast notifications
 *   - generateShareableUrl() / copyShareableUrl() - Sharing
 *   - Global window.* exports for external access
 *
 * ============================================================================
 * CHANGELOG
 * ============================================================================
 * - Nov 21, 2025: Added Master TOC and section organization
 * - Nov 20, 2025: Fixed thumbnail tiling, proof DPI metadata
 * - Nov 19, 2025: Furniture path fix, CLI deployment integration
 * - Nov 11, 2025: Multi-mode support (wallpaper/furniture/clothing)
 * - Sept 27, 2025: Modular function extraction to src/core/
 * - Sept 14, 2025: Half-drop tiling fix
 *
 * ============================================================================
 */// *** CLAUDE HALF-DROP TEST BUILD 999 - SEPTEMBER 14, 2025 ***
// 🚨 DEBUG: Updated CFM.js with thumbnail capture - July 30, 2025 at 14:25
// 🎨 MULTI-MODE SUPPORT: Configuration-based system - November 11, 2025
// 🪑 FURNITURE PATH FIX: Strip -furX suffix for directory paths - November 19, 2025
// ============================================================================
// SECTION 1: CONFIGURATION & DEBUG FLAGS
// ============================================================================
// Import mode configuration
// Initialize configuration based on detected mode
var colorFlexConfig=(0,_config_colorFlex_modes_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentConfig)();var colorFlexMode=(0,_config_colorFlex_modes_js__WEBPACK_IMPORTED_MODULE_0__.detectMode)();console.log("\uD83C\uDFA8 ColorFlex Mode: ".concat(colorFlexMode),colorFlexConfig);// Make configuration available globally
if(typeof window!=='undefined'){window.colorFlexConfig=colorFlexConfig;window.colorFlexMode=colorFlexMode;}// 🎛️ DEBUG CONTROL FLAGS - Set to false to disable console logs by category
var DEBUG_FLAGS={ENABLED:false,// Master switch - set to false to disable ALL debug logs
COLORS:false,// Color lookups and mapping (🎨 logs)
PROOF:false,// Proof generation and downloads (🔧 📥 logs)
PRINT:false,// Print pattern function (🎨 PRINT PATTERN logs)
PATTERNS:false,// Pattern loading and selection
LAYERS:false,// Layer processing and rendering
CART:false,// Cart operations (🛒 logs)
SAVE:false,// Save pattern operations (💾 logs)
THUMBNAILS:false,// Thumbnail generation and storage (🖼️ logs)
GENERAL:false// General app flow (✅ ⚠️ ❌ logs)
};// Helper function for conditional logging
var debugLog=function debugLog(category){if(DEBUG_FLAGS.ENABLED&&DEBUG_FLAGS[category]){var _console;for(var _len=arguments.length,args=new Array(_len>1?_len-1:0),_key=1;_key<_len;_key++){args[_key-1]=arguments[_key];}(_console=console).log.apply(_console,args);}};// Quick access helpers for common log types
var logColor=function logColor(){for(var _len2=arguments.length,args=new Array(_len2),_key2=0;_key2<_len2;_key2++){args[_key2]=arguments[_key2];}return debugLog.apply(void 0,['COLORS'].concat(args));};var logProof=function logProof(){for(var _len3=arguments.length,args=new Array(_len3),_key3=0;_key3<_len3;_key3++){args[_key3]=arguments[_key3];}return debugLog.apply(void 0,['PROOF'].concat(args));};var logPrint=function logPrint(){for(var _len4=arguments.length,args=new Array(_len4),_key4=0;_key4<_len4;_key4++){args[_key4]=arguments[_key4];}return debugLog.apply(void 0,['PRINT'].concat(args));};var logPattern=function logPattern(){for(var _len5=arguments.length,args=new Array(_len5),_key5=0;_key5<_len5;_key5++){args[_key5]=arguments[_key5];}return debugLog.apply(void 0,['PATTERNS'].concat(args));};var logLayer=function logLayer(){for(var _len6=arguments.length,args=new Array(_len6),_key6=0;_key6<_len6;_key6++){args[_key6]=arguments[_key6];}return debugLog.apply(void 0,['LAYERS'].concat(args));};var logCart=function logCart(){for(var _len7=arguments.length,args=new Array(_len7),_key7=0;_key7<_len7;_key7++){args[_key7]=arguments[_key7];}return debugLog.apply(void 0,['CART'].concat(args));};var logSave=function logSave(){for(var _len8=arguments.length,args=new Array(_len8),_key8=0;_key8<_len8;_key8++){args[_key8]=arguments[_key8];}return debugLog.apply(void 0,['SAVE'].concat(args));};var logThumb=function logThumb(){for(var _len9=arguments.length,args=new Array(_len9),_key9=0;_key9<_len9;_key9++){args[_key9]=arguments[_key9];}return debugLog.apply(void 0,['THUMBNAILS'].concat(args));};var logGeneral=function logGeneral(){for(var _len0=arguments.length,args=new Array(_len0),_key0=0;_key0<_len0;_key0++){args[_key0]=arguments[_key0];}return debugLog.apply(void 0,['GENERAL'].concat(args));};// Always log critical startup messages
console.log('🚨 DEBUG: ColorFlex CFM.js loaded - Version with thumbnail capture!');console.log('*** CLAUDE HALF-DROP TEST BUILD 999 - CFM.JS LOADING ***');// ✅ BUILD TIMESTAMP - Injected at build time by webpack DefinePlugin
// Webpack replaces process.env.* with actual string values during build
// These will be literal strings in the final bundle (e.g., "2025-01-20T12:34:56.789Z")
var BUILD_TIMESTAMP="2026-02-06T21:48:35.132Z"||0;var BUILD_DATE="2/6/2026, 4:48:35 PM"||0;var BUILD_MODE="all"||0;console.log('📦 ========================================');console.log('📦 COLORFLEX BUILD INFORMATION');console.log('📦 ========================================');console.log('📦 Build Timestamp:',BUILD_TIMESTAMP);console.log('📦 Build Date:',BUILD_DATE);console.log('📦 Build Mode:',BUILD_MODE);console.log('📦 ========================================');// Store globally for easy access
window.COLORFLEX_BUILD_INFO={timestamp:BUILD_TIMESTAMP,date:BUILD_DATE,mode:BUILD_MODE};console.log('🎛️ Debug flags configured:',DEBUG_FLAGS);// Create a dimensions display element
// const dimensionsDisplay = document.createElement('div');
// dimensionsDisplay.id = 'dimensions-display';
// dimensionsDisplay.style.cssText = `
//     position: fixed;
//     top: 10px;
//     right: 10px;
//     background: rgba(0, 0, 0, 0.7);
//     color: white;
//     padding: 5px 10px;
//     font-size: 14px;
//     font-family: monospace;
//     z-index: 1000;
//     border-radius: 3px;
// `;
// document.body.appendChild(dimensionsDisplay);
// // Function to update dimensions in the UI
// const updateDimensionsDisplay = () => {
//     const width = window.innerWidth;
//     const height = window.innerHeight;
//     dimensionsDisplay.textContent = `${width} x ${height}px`;
// };
// updateDimensionsDisplay();
// window.addEventListener('resize', updateDimensionsDisplay);
// Wrap your key functions:
function traceWrapper(fn,name){return function(){console.group("\uD83E\uDDE0 ".concat(name));for(var _len1=arguments.length,args=new Array(_len1),_key1=0;_key1<_len1;_key1++){args[_key1]=arguments[_key1];}console.log('Arguments:',args);var result=fn.apply(this,args);console.log('Result:',result);console.groupEnd();return result;};}// Then guard against premature loading:
function guard(fn){return function(){if(!isAppReady){console.warn("\u23F3 Skipping ".concat(fn.name," \u2014 app not ready"));return;}for(var _len10=arguments.length,args=new Array(_len10),_key10=0;_key10<_len10;_key10++){args[_key10]=arguments[_key10];}return fn.apply(this,args);};}/**
 * Helper function to get scale label from config
 * Converts scale percentage to display label (e.g., 200 -> "2X")
 */function getScaleLabel(scaleValue){var config=window.colorFlexConfig||colorFlexConfig;if(!config||!config.scale||!config.scale.labels){// Fallback to default wallpaper labels
if(scaleValue===50)return'0.5X';if(scaleValue===100)return'Normal';if(scaleValue===200)return'2X';if(scaleValue===300)return'3X';if(scaleValue===400)return'4X';return"".concat(scaleValue,"%");}return config.scale.labels[scaleValue]||"".concat(scaleValue,"%");}/**
 * =============================================================================
 * IMAGE OPTIMIZATION SYSTEM
 * =============================================================================
 *
 * Performance optimization for image loading and caching.
 * Addresses UI slowdown from repeated network requests and simultaneous loads.
 *
 * FEATURES:
 * - Global image cache (Map-based, browser memory)
 * - Concurrent load limiting (max 6 simultaneous downloads)
 * - Lazy loading for thumbnails (Intersection Observer)
 * - Performance timing and metrics
 * - Preloading for adjacent patterns
 *
 * USAGE:
 * - Replace direct new Image() calls with loadImage(src)
 * - Thumbnails auto-lazy-load via Intersection Observer
 * - Cache persists for session (cleared on page reload)
 */// Global image cache - stores loaded Image objects by URL
var imageCache=new Map();var imageCacheStats={hits:0,misses:0,totalLoadTime:0,itemsLoaded:0};// Concurrent load limiting to prevent network congestion
var pendingImageLoads=new Set();var MAX_CONCURRENT_LOADS=6;/**
 * Queue for managing concurrent image loads
 * Prevents too many simultaneous network requests
 */var imageLoadQueue=[];/**
 * Process next image in load queue
 */function processImageQueue(){if(pendingImageLoads.size>=MAX_CONCURRENT_LOADS){return;// Already at max capacity
}if(imageLoadQueue.length===0){return;// No items in queue
}var nextLoad=imageLoadQueue.shift();if(nextLoad){nextLoad();// Execute the load function
}}/**
 * Get cache statistics for debugging
 */function getImageCacheStats(){var hitRate=imageCacheStats.itemsLoaded>0?(imageCacheStats.hits/imageCacheStats.itemsLoaded*100).toFixed(1):0;var avgLoadTime=imageCacheStats.itemsLoaded>0?(imageCacheStats.totalLoadTime/imageCacheStats.itemsLoaded).toFixed(0):0;return{cacheSize:imageCache.size,hits:imageCacheStats.hits,misses:imageCacheStats.misses,hitRate:"".concat(hitRate,"%"),averageLoadTime:"".concat(avgLoadTime,"ms"),pendingLoads:pendingImageLoads.size,queuedLoads:imageLoadQueue.length};}// Expose cache stats globally for debugging
window.getImageCacheStats=getImageCacheStats;/**
 * Clear image cache (useful for debugging or memory management)
 */function clearImageCache(){var size=imageCache.size;imageCache.clear();imageCacheStats.hits=0;imageCacheStats.misses=0;imageCacheStats.totalLoadTime=0;imageCacheStats.itemsLoaded=0;console.log("\uD83E\uDDF9 Image cache cleared (".concat(size," items removed)"));}window.clearImageCache=clearImageCache;/**
 * Preload images for better UX
 * Call with array of image URLs to load in background
 */function preloadImages(urls){if(!Array.isArray(urls))return;console.log("\uD83D\uDD04 Preloading ".concat(urls.length," images..."));urls.forEach(function(url){if(!imageCache.has(url)){// Use low-priority load (add to end of queue)
imageLoadQueue.push(function(){return loadImageInternal(url,false);});processImageQueue();}});}window.preloadImages=preloadImages;/**
 * Log cache performance stats periodically
 * Helps monitor image loading efficiency
 */function logCachePerformance(){var stats=getImageCacheStats();console.log("\n\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\u2551 \uD83D\uDCCA IMAGE CACHE PERFORMANCE STATS\n\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\u2551 Cache Size:        ".concat(stats.cacheSize," images\n\u2551 Cache Hits:        ").concat(stats.hits," (").concat(stats.hitRate," hit rate)\n\u2551 Cache Misses:      ").concat(stats.misses,"\n\u2551 Avg Load Time:     ").concat(stats.averageLoadTime,"\n\u2551 Pending Loads:     ").concat(stats.pendingLoads,"/").concat(MAX_CONCURRENT_LOADS,"\n\u2551 Queued Loads:      ").concat(stats.queuedLoads,"\n\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n    "));}// Log cache stats every 30 seconds for monitoring
setInterval(logCachePerformance,30000);// Log once after initial load (after 10 seconds)
setTimeout(logCachePerformance,10000);/**
 * =============================================================================
 * COLORFLEX MAIN APPLICATION (CFM.js)
 * =============================================================================
 * 
 * This is the core application file for the ColorFlex pattern customization system.
 * It handles pattern rendering, customer save functionality, and UI interactions.
 * 
 * KEY FEATURES:
 * - Advanced fabric rendering with multiple blend modes
 * - Real-time pattern color customization
 * - Customer pattern saving with Shopify integration
 * - Resolution-independent image processing
 * - Interactive UI components and modals
 * 
 * MAIN FUNCTION GROUPS:
 * 1. Configuration & Setup (lines ~60-120)
 * 2. Customer Save System (lines ~120-650) 
 * 3. Fabric Rendering Engine (lines ~650-1200)
 * 4. Pattern Processing (lines ~1200-2000)
 * 5. UI Components & Events (lines ~2000-end)
 * =============================================================================
 */// ---- Debug Logging Setup ----
var DEBUG_TRACE=false;// set to false to disable tracing
var USE_GUARD=false;// Optional: Remove later by commenting out or deleting these lines// Toggle flag for normalization (set to false for binary threshold, true for normalization)
var USE_NORMALIZATION=true;// Change to true to enable normalization
/**
 * =============================================================================
 * SECTION 1: CONFIGURATION & SETUP
 * =============================================================================
 *//**
 * Fabric composite tuning parameters
 * These control the visual appearance of fabric rendering
 * 
 * @type {Object}
 * @property {number} alphaStrength - Controls pattern opacity (0.0 - 2.0)
 * @property {number} baseTintStrength - Controls background color influence (0.0 - 2.0)
 * @property {number} patternContrast - Controls pattern contrast (0.0 - 3.0)
 * @property {number} shadowMultiplier - Controls shadow strength (0.0 - 2.0)  
 * @property {number} colorVibrance - Controls color saturation (0.0 - 2.0)
 * @property {string} blendMode - Blend mode selection: 'multiply', 'overlay', 'soft-light', 'auto'
 * @property {number} glossyStrength - Controls glossy layer opacity (0.0 - 2.0)
 */var fabricTuning={alphaStrength:1.0,// Controls pattern opacity (0.0 - 2.0)
baseTintStrength:1.0,// Controls how much background color affects fabric base (0.0 - 2.0)
patternContrast:1.0,// Controls pattern contrast (0.0 - 3.0)
shadowMultiplier:1.0,// Controls shadow interaction strength (0.0 - 2.0)
colorVibrance:1.2,// Controls color saturation (0.0 - 2.0)
blendMode:'auto',// Blend mode: 'multiply', 'overlay', 'soft-light', 'auto'
glossyStrength:1.0// Controls glossy layer opacity (0.0 - 2.0)
};// Control visibility of fabric tuning controls
var SHOW_FABRIC_CONTROLS=false;// Set to true to show controls, false to hide
// Debounce function for tuning controls
var fabricRenderTimeout;function debouncedFabricRender(){clearTimeout(fabricRenderTimeout);fabricRenderTimeout=setTimeout(function(){if(appState.isInFabricMode){renderFabricMockup();}},100);// 100ms debounce
}// App state - Made global for save functionality
window.appState={collections:[],colorsData:[],currentPattern:null,currentLayers:[],curatedColors:[],layerInputs:[],selectedCollection:null,cachedLayerPaths:[],lastSelectedLayer:null,currentScale:100,scaleMultiplier:1,// Initialize scale multiplier (1 = Normal/100%)
designer_colors:[],originalPattern:null,originalCoordinates:null,originalLayerInputs:null,originalCurrentLayers:null,lastSelectedColor:null,selectedFurniture:null,isInFabricMode:false,isInFurnitureMode:false,// Furniture upholstery mode
furnitureConfig:null,// Loaded from furniture-config.json
selectedFurnitureType:null,// e.g., 'sofa-capitol', 'sofa-kite'
colorsLocked:false// When true, preserves colors when switching patterns
};var BACKGROUND_INDEX=0;var FURNITURE_BASE_INDEX=1;var PATTERN_BASE_INDEX=2;var isAppReady=false;// Flag to track if the app is fully initialized
/**
 * =============================================================================
 * SECTION 2: CUSTOMER SAVE SYSTEM  
 * =============================================================================
 * 
 * This section handles saving customer patterns to Shopify metafields or localStorage.
 * It includes validation, API calls, notifications, and UI components.
 *//**
 * Main save function - saves current pattern to customer's list
 * 
 * FLOW:
 * 1. Validate pattern data (pattern, collection, layers)
 * 2. Try saving to Shopify customer metafields (if authenticated)
 * 3. Fall back to localStorage if Shopify unavailable
 * 4. Show user notification with result
 * 
 * @global
 * @function saveToMyList
 * @throws {Error} If pattern data is incomplete or save operation fails
 *//**
 * Captures the current pattern preview as a thumbnail image
 *
 * Creates a high-quality JPEG thumbnail (800x800px) of the currently
 * displayed pattern for use in the "My Designs" saved patterns list.
 * Automatically handles tiling based on the current scale setting to
 * accurately represent how the pattern will repeat when printed.
 *
 * Element Detection Strategy:
 * - Searches through 9 common selector patterns to find preview element
 * - Handles containers (divs) by searching for canvas/SVG children
 * - Falls back to background-image detection for div elements
 *
 * Tiling Algorithm (for scaled patterns):
 * - 1X (Normal): 1 tile fills thumbnail
 * - 2X: 4 tiles in 2×2 grid (smaller repeat)
 * - 3X: 9 tiles in 3×3 grid (smaller repeat)
 * - 4X: 16 tiles in 4×4 grid (smallest repeat)
 *
 * Tile calculation: tileSize = 800px / scale
 * - 2X: 800/2 = 400px tiles → 2×2 grid = 4 tiles
 * - 3X: 800/3 = 267px tiles → 3×3 grid = 9 tiles
 *
 * @returns {string|null} Base64-encoded JPEG data URL (quality: 0.7) or null if capture fails
 *
 * @example
 * // Capture current pattern at 1X scale
 * const thumbnail = capturePatternThumbnail();
 * // Returns: "data:image/jpeg;base64,/9j/4AAQSkZJRg..." (~50-100KB)
 *
 * @example
 * // Capture at 2X scale (shows 2×2 tiled grid)
 * appState.scaleMultiplier = 0.5; // 2X scale
 * const thumbnail = capturePatternThumbnail();
 * // Thumbnail shows 4 tiles in grid
 *
 * @throws {Error} Logs error to console but returns null instead of throwing
 *
 * ⚠️ IMPORTANT: Requires preview canvas to exist in DOM before calling
 *
 * 🔧 PERFORMANCE: High-quality JPEG with 0.7 compression balances
 * quality vs localStorage space (typically 50-100KB per thumbnail)
 *
 * 💾 STORAGE: Each thumbnail consumes ~50-100KB of localStorage quota
 *
 * @see savePattern - Uses this thumbnail in saved pattern data
 * @see appState.scaleMultiplier - Determines tiling density
 * @see appState.currentScale - Scale percentage for display (100, 200, 300, 400)
 */function capturePatternThumbnail(){try{// Try to find the pattern preview element - check common selectors
var selectors=['#preview',// Main ColorFlex preview container
'#pattern-preview','.pattern-preview','#colorflex-preview','.colorflex-preview','#pattern-display','.pattern-display','[id*="preview"]','[class*="preview"]'];var previewElement=null;console.log('🔍 Searching for pattern preview elements...');for(var _i=0,_selectors=selectors;_i<_selectors.length;_i++){var selector=_selectors[_i];previewElement=document.querySelector(selector);if(previewElement){console.log('📸 Found pattern preview element:',selector,previewElement);break;}else{console.log('❌ Not found:',selector);}}if(!previewElement){console.warn('⚠️ No pattern preview element found for thumbnail capture');// List all available elements for debugging
console.log('🔍 Available elements with "pattern" in ID/class:');document.querySelectorAll('[id*="pattern"], [class*="pattern"]').forEach(function(el){console.log('  -',el.tagName,el.id||el.className);});console.log('🔍 Available SVG elements:',document.querySelectorAll('svg').length);console.log('🔍 Available Canvas elements:',document.querySelectorAll('canvas').length);return null;}// If we found a container, look for the actual pattern inside it
var actualPatternElement=null;if(previewElement.tagName==='DIV'){// Look for canvas or SVG inside the container
actualPatternElement=previewElement.querySelector('canvas')||previewElement.querySelector('svg')||previewElement.querySelector('[data-pattern]');if(actualPatternElement){console.log('📸 Found actual pattern element inside container:',actualPatternElement.tagName);previewElement=actualPatternElement;}else{console.log('📸 No canvas/SVG found inside container, will use DIV with background');console.log('📸 Background image:',getComputedStyle(previewElement).backgroundImage);console.log('📸 Background size:',getComputedStyle(previewElement).backgroundSize);}}// Create a canvas to capture the element
var canvas=document.createElement('canvas');var _ctx=canvas.getContext('2d');// Set thumbnail size (optimized high resolution - 800x800 with JPEG compression)
canvas.width=800;canvas.height=800;// If it's already a canvas, render it with tiling based on current scale
if(previewElement.tagName==='CANVAS'){// Check if we have scale information to show proper tiling
var scale=appState.scaleMultiplier||1.0;var currentScale=appState.currentScale||100;console.log("\uD83D\uDCF8 Thumbnail capture - scaleMultiplier: ".concat(scale,", currentScale: ").concat(currentScale));if(scale!==1.0&&appState.currentPattern){// Generate tiled thumbnail to show scale
console.log("\uD83D\uDCF8 Generating tiled thumbnail at ".concat(scale,"x scale"));// Fill background color first
var bgColor=appState.currentLayers&&appState.currentLayers[0]?appState.currentLayers[0].color:'#ffffff';console.log("\uD83D\uDCF8 Background color: ".concat(bgColor));_ctx.fillStyle=bgColor;_ctx.fillRect(0,0,800,800);// Calculate tile size (scale affects how many tiles fit)
// scale = 2.0 means pattern appears smaller (tiles are half size)
var tileWidth=800/scale;var tileHeight=800/scale;console.log("\uD83D\uDCF8 Tile size: ".concat(tileWidth,"x").concat(tileHeight,", creating ").concat(Math.ceil(800/tileWidth),"x").concat(Math.ceil(800/tileHeight)," grid"));// Tile the pattern across the thumbnail
var tileCount=0;for(var x=0;x<800;x+=tileWidth){for(var y=0;y<800;y+=tileHeight){_ctx.drawImage(previewElement,x,y,tileWidth,tileHeight);tileCount++;}}console.log("\uD83D\uDCF8 Drew ".concat(tileCount," tiles on thumbnail"));}else{// No scaling, just copy the canvas directly
console.log("\uD83D\uDCF8 Scale is 1.0, copying canvas directly");_ctx.drawImage(previewElement,0,0,800,800);}}// If it's an SVG, we'll need a different approach due to async nature
else if(previewElement.tagName==='SVG'){// For now, create a placeholder - SVG capture requires async handling
_ctx.fillStyle='#e8f4fd';_ctx.fillRect(0,0,800,800);_ctx.fillStyle='#2c5aa0';_ctx.font='12px Arial';_ctx.textAlign='center';_ctx.fillText('SVG Pattern',100,90);_ctx.fillText('Preview',100,110);}// For other elements, create a simple representation
else{_ctx.fillStyle='#f0f0f0';_ctx.fillRect(0,0,800,800);_ctx.fillStyle='#333';_ctx.font='12px Arial';_ctx.textAlign='center';_ctx.fillText('Custom Pattern',100,90);_ctx.fillText('Preview',100,110);}// Convert to base64 data URL
var dataUrl=canvas.toDataURL('image/jpeg',0.7);console.log('📸 Captured pattern thumbnail (length:',dataUrl.length,')');return dataUrl;}catch(error){console.error('❌ Failed to capture pattern thumbnail:',error);return null;}}// 🎯 NORMALIZE COLOR TO SW FORMAT
// Converts color names to consistent "SW#### COLORNAME" format for cart display
/**
 * Normalizes color names to standardized Sherwin-Williams format
 *
 * Converts various color name formats into the canonical "SW####  NAME"
 * format used throughout the application. Handles edge cases like double
 * prefixes, missing SW numbers, and inconsistent capitalization.
 *
 * Format Standardization:
 * - Input: "sw7006 eider white" → Output: "SW7006 EIDER WHITE"
 * - Input: "eider white" → Output: "SW7006 EIDER WHITE" (via lookup)
 * - Input: "SC0001 Cottage Linen" → Output: "SC0001 COTTAGE LINEN"
 *
 * Algorithm:
 * 1. Strip double prefixes (defensive against bugs)
 * 2. If already in SW/SC format, normalize casing
 * 3. Otherwise, reverse lookup in colorsData by name
 * 4. Fallback to uppercase original name if no match
 *
 * @param {string} colorName - Color name in any format
 * @returns {string} Normalized color in "SW#### NAME" format
 *
 * @example
 * // Already in SW format
 * normalizeColorToSwFormat('sw7006 eider white')
 * // Returns: "SW7006 EIDER WHITE"
 *
 * @example
 * // Color name only (reverse lookup)
 * normalizeColorToSwFormat('eider white')
 * // Returns: "SW7006 EIDER WHITE"
 *
 * @example
 * // SC (Saffron Cottage) colors
 * normalizeColorToSwFormat('sc0001 cottage linen')
 * // Returns: "SC0001 COTTAGE LINEN"
 *
 * @see appState.colorsData - Source for reverse lookups
 * @see generatePatternId - Uses normalized colors for IDs
 */function normalizeColorToSwFormat(colorName){if(!colorName||typeof colorName!=='string'){return'Unknown Color';}// 🔧 DEFENSIVE: Strip any double SW/SC prefixes first
colorName=colorName.replace(/^(SW|SC)(sw|sc)(\d+)/i,'$1$3');// If already in SW format, return as-is
var swMatch=colorName.match(/\b(SW|SC)\s*(\d+)\s+(.+)/i);if(swMatch){var prefix=swMatch[1].toUpperCase();var number=swMatch[2];var name=swMatch[3].toUpperCase();return"".concat(prefix).concat(number," ").concat(name);}// Try to find SW number by reverse lookup
if(appState&&appState.colorsData){var cleanedColorName=colorName.toLowerCase().trim();var colorEntry=appState.colorsData.find(function(c){return c&&typeof c.color_name==='string'&&c.color_name.toLowerCase()===cleanedColorName;});if(colorEntry&&colorEntry.sw_number){var formattedName=colorName.toUpperCase();return"SW".concat(colorEntry.sw_number," ").concat(formattedName);}}// Return original name if no SW number found
return colorName.toUpperCase();}// Generate meaningful pattern ID based on pattern name and colors (matches ProductConfigurationFlow.js format)
// ✅ NOW INCLUDES SCALE: Returns format like "agnes-7069-0055-2x" or "agnes-7069-0055" (if normal scale)
/**
 * Generates a unique pattern ID from pattern name, colors, and scale
 *
 * Creates a URL-safe, human-readable ID that uniquely identifies a
 * pattern customization. The ID is used for localStorage keys, URL
 * parameters, and cart item tracking.
 *
 * ID Format: "{pattern-name}-{color1}-{color2}-{scale}"
 * - Pattern name: Sanitized, lowercase (e.g., "tudor-rose")
 * - Colors: SW/SC numbers only, duplicates removed (e.g., "7006-6258")
 * - Scale: Appended only if not 100% (e.g., "-2x" for 200%)
 *
 * Algorithm:
 * 1. Sanitize pattern name (lowercase, remove special chars)
 * 2. Extract SW/SC numbers from layer colors
 * 3. Remove duplicate color numbers
 * 4. Truncate if > 60 chars (prevents localStorage key overflow)
 * 5. Append scale suffix if not 100%
 *
 * @param {string} patternName - Pattern name from collections.json
 * @param {Array<Object>} layers - Array of layer objects with color property
 * @param {number} [currentScale=100] - Scale percentage (50, 100, 200, 300, 400)
 * @returns {string} Unique pattern ID
 *
 * @example
 * // Basic pattern with two colors at normal scale
 * generatePatternId('Tudor Rose', [
 *   { label: 'Background', color: 'SW7006 Eider White' },
 *   { label: 'Pattern', color: 'SW6258 Tricorn Black' }
 * ], 100)
 * // Returns: "tudorrose-7006-6258"
 *
 * @example
 * // Pattern at 2X scale
 * generatePatternId('Chippendale', [
 *   { label: 'Layer1', color: 'SW7069 Iron Ore' }
 * ], 200)
 * // Returns: "chippendale-7069-2x"
 *
 * @example
 * // Duplicate colors removed
 * generatePatternId('Cambridge', [
 *   { label: 'Layer1', color: 'SW7006' },
 *   { label: 'Layer2', color: 'SW7006' },  // Duplicate
 *   { label: 'Layer3', color: 'SW6258' }
 * ], 100)
 * // Returns: "cambridge-7006-6258" (not "cambridge-7006-7006-6258")
 *
 * @see savePattern - Uses this ID as localStorage key
 * @see generateShareableUrl - Includes ID in URL parameters
 */function generatePatternId(patternName,layers,currentScale){var _appState,_appState2;console.log('🔍 CFM generatePatternId called with:',{patternName:patternName,layers:layers.map(function(l){return{label:l.label,color:l.color};}),currentScale:currentScale});console.log('🗃️ Available colorsData entries:',((_appState=appState)===null||_appState===void 0||(_appState=_appState.colorsData)===null||_appState===void 0?void 0:_appState.length)||'none');// Start with pattern name (not collection name)
var id=patternName.toLowerCase().replace(/[^a-z0-9]/g,'');// Extract SW numbers from colors
var swNumbers=[];layers.forEach(function(layer,index){console.log("\uD83C\uDFA8 Processing layer ".concat(index,": \"").concat(layer.color,"\""));if(layer.color){// Look for SW/SC numbers in the color name
var swMatch=layer.color.match(/\b(SW|SC)\s*(\d+)\b/i);if(swMatch){var prefix=swMatch[1].toUpperCase();var number=swMatch[2];console.log("\u2705 Found SW/SC number in color name: ".concat(prefix).concat(number));// ✅ FIX: Treat SC and SW the same - just use the number
swNumbers.push(number);}else{console.log("\u274C No SW number found in \"".concat(layer.color,"\", trying reverse lookup..."));// If no SW/SC found, try to reverse-lookup from colorsData
if(appState&&appState.colorsData){var cleanedColorName=layer.color.toLowerCase().trim();console.log("\uD83D\uDD0D Looking up \"".concat(cleanedColorName,"\" in ").concat(appState.colorsData.length," colors"));var colorEntry=appState.colorsData.find(function(c){return c&&typeof c.color_name==='string'&&c.color_name.toLowerCase()===cleanedColorName;});console.log("\uD83D\uDD0D Lookup result:",colorEntry?{color_name:colorEntry.color_name,sw_number:colorEntry.sw_number}:'not found');if(colorEntry&&colorEntry.sw_number){var swNumber=colorEntry.sw_number;var _number=swNumber.substring(2);// Remove SW or SC prefix
// ✅ FIX: Treat SC and SW the same - just use the number
swNumbers.push(_number);}}}}});console.log('📋 Extracted SW numbers:',swNumbers);// ✅ FIX: Remove duplicate color numbers to keep IDs shorter
var uniqueSwNumbers=_toConsumableArray(new Set(swNumbers));console.log('📋 Unique SW numbers (duplicates removed):',uniqueSwNumbers);// Combine pattern name + unique sw numbers
if(uniqueSwNumbers.length>0){id+='-'+uniqueSwNumbers.join('-');}// ✅ FIX: Truncate BEFORE adding scale to preserve scale suffix
// Check if base ID (pattern name + colors) is too long
// Increased limit to 60 to accommodate longer pattern names with multiple colors
if(id.length>60){console.log("\u26A0\uFE0F ID too long (".concat(id.length," chars), truncating to preserve scale..."));// Keep pattern name + partial color list
var patternNamePart=patternName.toLowerCase().replace(/[^a-z0-9]/g,'');var timestamp=Date.now().toString().slice(-6);id=patternNamePart.substring(0,20)+'-'+timestamp;console.log("\u2702\uFE0F Truncated ID: ".concat(id));}// ✅ APPEND SCALE if not 100% (Normal) - AFTER truncation so it's preserved
var scale=currentScale||((_appState2=appState)===null||_appState2===void 0?void 0:_appState2.currentScale)||100;if(scale!==100){if(scale===50)id+='-0.5x';else if(scale===200)id+='-2x';else if(scale===300)id+='-3x';else if(scale===400)id+='-4x';else id+="-".concat(scale,"pct");// Fallback for custom percentages
console.log("\uD83D\uDCCF Appended scale to ID: ".concat(scale,"% \u2192 ").concat(id));}console.log('✅ CFM Final pattern ID with scale:',id);return id;// Return format like: agnes-7069-0055-2x or agnes-7069-0055 (normal scale)
}window.saveToMyList=function(){console.log('🎯 saveToMyList() function called!');try{var _state$selectedCollec,_state$selectedCollec2;// Use global appState reference
var state=window.appState;// Validate that we have the required data
if(!state.currentPattern||!state.currentPattern.name){showSaveNotification('❌ No pattern selected to save');return;}if(!state.selectedCollection||!((_state$selectedCollec=state.selectedCollection)!==null&&_state$selectedCollec!==void 0&&_state$selectedCollec.name)){showSaveNotification('❌ No collection selected');return;}if(!state.currentLayers||state.currentLayers.length===0){showSaveNotification('❌ No layers to save');return;}console.log('🔄 Starting pattern save process...');// Capture pattern thumbnail before saving
console.log('📸 About to capture thumbnail...');var thumbnailDataUrl=capturePatternThumbnail();console.log('📸 Thumbnail capture result:',thumbnailDataUrl?'Success':'Failed');// Capture current pattern state - match Liquid template structure
var currentState={collectionName:((_state$selectedCollec2=state.selectedCollection)===null||_state$selectedCollec2===void 0?void 0:_state$selectedCollec2.name)||'Unknown',patternName:state.currentPattern.name,colors:state.currentLayers.map(function(layer){return{label:layer.label,color:layer.color,// Store original SW-formatted color for pattern ID generation
swColor:layer.originalSwColor||layer.color};}),thumbnail:thumbnailDataUrl,// Store the captured thumbnail
timestamp:new Date().toISOString(),// ✅ Pass currentScale to generatePatternId so scale is included in the ID
id:generatePatternId(appState.currentPattern.name,appState.currentLayers,state.currentScale||100),// 🆕 SAVE SCALING: Include current scale and multiplier for restoration
currentScale:state.currentScale||100,scaleMultiplier:state.scaleMultiplier||1.0,// Also save pattern size if available (for standard patterns)
patternSize:state.currentPattern.size||null};console.log('💾💾💾 SAVING PATTERN TO LIST 💾💾💾');console.log('  Pattern name:',currentState.patternName);console.log('  Pattern ID:',currentState.id);console.log('  Current scale:',currentState.currentScale);console.log('  Scale in appState:',state.currentScale);console.log('  Full state:',currentState);// Try to save to Shopify customer metafields (if available)
var customerId=getCustomerId();var customerAccessToken=getCustomerAccessToken();if(customerId&&customerAccessToken){saveToShopifyMetafields(currentState).then(function(){console.log('✅ Saved to Shopify customer metafields');})["catch"](function(error){console.log('🔄 Shopify save failed, using localStorage fallback');saveToLocalStorageNoDuplicateCheck(currentState);// Use version without duplicate check
});}else{// Fall back to localStorage for development/testing
console.log('📱 Customer not authenticated, saving to localStorage');saveToLocalStorageNoDuplicateCheck(currentState);// Use version without duplicate check
}// Show success message
showSaveNotification('✅ Pattern saved to your list!');}catch(error){console.error('❌ Failed to save pattern:',error);showSaveNotification('❌ Failed to save pattern');}};/**
 * Saves pattern customization to Shopify customer metafields (cloud storage)
 *
 * Attempts to save pattern data to the customer's Shopify account via the
 * ColorFlex API endpoint. If the customer is authenticated, patterns are
 * stored in customer metafields, making them accessible across devices.
 * Falls back to localStorage if save fails.
 *
 * API Endpoint: POST /api/colorFlex/save-pattern
 * Authentication: X-Shopify-Customer-Access-Token header
 * Timeout: Browser default (typically 30-60 seconds)
 *
 * Data Flow:
 * 1. Validate customer authentication (ID + access token)
 * 2. POST pattern data to ColorFlex API endpoint
 * 3. On success: Resolve with API response
 * 4. On failure: Fallback to localStorage, reject with error
 *
 * Metafield Structure (Shopify):
 * - Namespace: "color_flex"
 * - Key: pattern.id (unique identifier)
 * - Value: JSON-stringified patternData object
 * - Type: json
 *
 * @async
 * @param {Object} patternData - Pattern customization data to save
 * @param {string} patternData.id - Unique pattern identifier
 * @param {string} patternData.patternName - Pattern name from collections.json
 * @param {string} patternData.collectionName - Collection name
 * @param {Array<Object>} patternData.colors - Layer colors with labels
 * @param {string} patternData.thumbnail - Base64 JPEG thumbnail data URL
 * @param {string} patternData.timestamp - ISO 8601 save timestamp
 * @param {number} [patternData.currentScale=100] - Scale percentage (50, 100, 200, 300, 400)
 * @param {number} [patternData.scaleMultiplier=1.0] - Scale multiplier (0.5, 1.0, 2.0, 3.0, 4.0)
 * @returns {Promise<Object>} Resolves with API response containing save confirmation
 *
 * @example
 * // Save authenticated customer's pattern to Shopify
 * const patternData = {
 *   id: 'tudor-rose-7006-6258-2x',
 *   patternName: 'Tudor Rose',
 *   collectionName: 'English Cottage',
 *   colors: [{label: 'Background', color: 'SW7006 Eider White'}],
 *   thumbnail: 'data:image/jpeg;base64,...',
 *   timestamp: '2025-11-30T12:00:00.000Z',
 *   currentScale: 200,
 *   scaleMultiplier: 0.5
 * };
 *
 * saveToShopifyMetafields(patternData)
 *   .then(result => console.log('Saved to cloud:', result))
 *   .catch(error => console.log('Fallback to localStorage'));
 *
 * @throws {Error} 'Customer not authenticated' if customerId or accessToken missing
 * @throws {Error} API error message if Shopify save fails
 *
 * ⚠️ IMPORTANT: Requires customer to be logged in to Shopify store
 *
 * 🔧 FALLBACK: Automatically saves to localStorage if Shopify save fails
 *
 * 🌐 CLOUD SYNC: Saved patterns accessible across devices when logged in
 *
 * @see saveToLocalStorageNoDuplicateCheck - Fallback storage method
 * @see getCustomerId - Retrieves customer ID from Shopify
 * @see getCustomerAccessToken - Retrieves authentication token
 */function saveToShopifyMetafields(patternData){return new Promise(function(resolve,reject){try{var customerId=getCustomerId();var customerAccessToken=getCustomerAccessToken();if(!customerId||!customerAccessToken){reject(new Error('Customer not authenticated'));return;}console.log('🔄 Saving to Shopify customer metafields...');fetch('/api/colorFlex/save-pattern',{method:'POST',headers:{'Content-Type':'application/json','X-Shopify-Customer-Access-Token':customerAccessToken},body:JSON.stringify({customerId:customerId,patternData:patternData})}).then(function(response){if(!response.ok){response.json().then(function(errorData){reject(new Error(errorData.message||'Failed to save to Shopify'));})["catch"](function(){reject(new Error('Failed to save to Shopify'));});return;}response.json().then(function(result){console.log('✅ Pattern saved to Shopify metafields:',result);resolve(result);})["catch"](function(error){reject(error);});})["catch"](function(error){console.error('❌ Shopify save failed:',error);// Fallback to localStorage
console.log('🔄 Falling back to localStorage...');saveToLocalStorageNoDuplicateCheck(patternData);reject(error);});}catch(error){console.error('❌ Shopify save failed:',error);// Fallback to localStorage
console.log('🔄 Falling back to localStorage...');saveToLocalStorageNoDuplicateCheck(patternData);reject(error);}});}// Clean up old cart thumbnails to prevent localStorage bloat
function cleanupOldCartThumbnails(){try{console.log('🧹 Starting cart thumbnail cleanup...');var cartThumbnails=[];var now=Date.now();var maxAge=24*60*60*1000;// 24 hours
var maxCount=10;// Keep only 10 most recent
// Find all cart thumbnail keys
for(var i=0;i<localStorage.length;i++){var key=localStorage.key(i);if(key&&key.startsWith('cart_thumbnail_')){try{var data=JSON.parse(localStorage.getItem(key));cartThumbnails.push({key:key,timestamp:data.timestamp||0,age:now-(data.timestamp||0),size:localStorage.getItem(key).length});}catch(e){// Invalid data, mark for deletion
cartThumbnails.push({key:key,timestamp:0,age:Infinity,size:0});}}}console.log("\uD83D\uDD0D Found ".concat(cartThumbnails.length," cart thumbnails"));// Sort by timestamp (newest first)
cartThumbnails.sort(function(a,b){return b.timestamp-a.timestamp;});var removedCount=0;var freedSpace=0;cartThumbnails.forEach(function(thumb,index){// Remove if older than 24 hours OR if beyond max count
if(thumb.age>maxAge||index>=maxCount){localStorage.removeItem(thumb.key);removedCount++;freedSpace+=thumb.size;console.log("\uD83D\uDDD1\uFE0F Removed old cart thumbnail: ".concat(thumb.key," (").concat(Math.round(thumb.age/3600000),"h old)"));}});if(removedCount>0){console.log("\u2705 Cleaned up ".concat(removedCount," cart thumbnails, freed ~").concat(Math.round(freedSpace/1024),"KB"));}else{console.log('✅ No cart thumbnails needed cleanup');}}catch(error){console.error('❌ Error during cart thumbnail cleanup:',error);}}// Save to localStorage as fallback (duplicate check already done in saveToMyList)
/**
 * Saves pattern to localStorage with multi-stage fallback for quota handling
 *
 * Implements sophisticated localStorage quota management with progressive
 * fallback strategies. Automatically compresses thumbnails, limits pattern
 * count, and gracefully degrades data quality to ensure save succeeds even
 * in low-storage scenarios.
 *
 * Multi-Stage Fallback Strategy:
 * 1. Standard save: 15 patterns with compressed thumbnails (~750KB-1.5MB)
 * 2. Emergency cleanup: 10 patterns with all thumbnails (~500KB-1MB)
 * 3. Selective compression: 10 patterns, thumbnails only for 4 most recent
 * 4. No thumbnails: 10 patterns without any thumbnails (~50-100KB)
 * 5. Aggressive cleanup: Remove all non-essential localStorage data
 * 6. Minimal save: Single pattern with essential data only (~5-10KB)
 *
 * Storage Optimization:
 * - Thumbnail compression: 800x800 JPEG at quality 0.7 (~50-100KB each)
 * - Pattern limit: 15 patterns maximum (auto-removes oldest)
 * - Cart cleanup: Removes cart thumbnails >24hrs old before save
 * - Emergency limit: Reduces to 10 patterns if quota exceeded
 *
 * @param {Object} patternData - Pattern data to save
 * @param {string} patternData.id - Unique pattern identifier
 * @param {string} patternData.patternName - Pattern name
 * @param {string} patternData.collectionName - Collection name
 * @param {Array<Object>} patternData.colors - Layer colors with labels
 * @param {string} [patternData.thumbnail] - Base64 JPEG thumbnail (optional but recommended)
 * @param {string} patternData.timestamp - ISO 8601 save timestamp
 * @param {number} [patternData.currentScale=100] - Scale percentage
 * @param {number} [patternData.scaleMultiplier=1.0] - Scale multiplier
 * @returns {void} No return value (throws on fatal error)
 *
 * @example
 * // Standard save with thumbnail
 * const patternData = {
 *   id: 'tudor-rose-7006-6258',
 *   patternName: 'Tudor Rose',
 *   collectionName: 'English Cottage',
 *   colors: [{label: 'Background', color: 'SW7006 Eider White'}],
 *   thumbnail: 'data:image/jpeg;base64,...', // ~100KB
 *   timestamp: '2025-11-30T12:00:00.000Z',
 *   currentScale: 100,
 *   scaleMultiplier: 1.0
 * };
 *
 * saveToLocalStorageNoDuplicateCheck(patternData);
 * // Saves successfully with compressed thumbnail
 *
 * @example
 * // Emergency save (quota exceeded)
 * // If localStorage quota exceeded, function automatically:
 * // 1. Reduces to 10 patterns
 * // 2. Removes old thumbnails
 * // 3. Saves essential data only
 * // Result: Pattern saved without thumbnail
 *
 * @throws {Error} 'Unable to save pattern due to localStorage constraints' if all fallback strategies fail
 *
 * ⚠️ IMPORTANT: Never removes current pattern's thumbnail in early fallback stages
 *
 * 🔧 PERFORMANCE: Calls cleanupOldCartThumbnails() before save to free space
 *
 * 💾 STORAGE LIMITS:
 * - localStorage quota: ~5-10MB per origin (browser-dependent)
 * - Target usage: ~1.5MB for 15 patterns with thumbnails
 * - Emergency mode: ~500KB for 10 patterns with selective thumbnails
 * - Minimal mode: ~50KB for 10 patterns without thumbnails
 *
 * @see cleanupOldCartThumbnails - Frees space before save
 * @see createCompressedThumbnail - Compresses thumbnails to ~50-100KB
 * @see aggressiveLocalStorageCleanup - Emergency cleanup strategy
 * @see updateSavedPatternsMenuIcon - Updates UI after save
 */function saveToLocalStorageNoDuplicateCheck(patternData){try{// 🧹 Clean up old cart thumbnails FIRST to free up space
cleanupOldCartThumbnails();// 🎯 FIX: Compress thumbnail before saving to prevent quota errors
if(patternData.thumbnail){var compressedThumbnail=createCompressedThumbnail(patternData.thumbnail);if(compressedThumbnail){console.log('🗜️ Using compressed thumbnail to save space');patternData.thumbnail=compressedThumbnail;}else{console.warn('⚠️ Thumbnail compression failed, keeping original thumbnail');// Keep the original thumbnail instead of deleting it
// Only delete if it's too large (>500KB)
if(patternData.thumbnail.length>500000){console.warn('⚠️ Original thumbnail too large (>500KB), removing it');delete patternData.thumbnail;}}}var existingPatterns=JSON.parse(localStorage.getItem('colorflexSavedPatterns')||'[]');existingPatterns.push(patternData);// 🎯 FIX: More aggressive pattern limit and cleanup
var limitedPatterns=existingPatterns.slice(-15);// Reduced from 20 to 15
try{localStorage.setItem('colorflexSavedPatterns',JSON.stringify(limitedPatterns));console.log('✅ Pattern saved to localStorage successfully');}catch(quotaError){console.warn('⚠️ localStorage quota exceeded, cleaning up and retrying...');// Emergency cleanup strategy: try to preserve thumbnails for most recent patterns
// Step 1: Try removing only old patterns and keep thumbnails for recent 10
var emergencyPatterns=existingPatterns.slice(-10);// Add current pattern to emergency list
emergencyPatterns.push(patternData);try{localStorage.setItem('colorflexSavedPatterns',JSON.stringify(emergencyPatterns));console.log('✅ Pattern saved with emergency cleanup (thumbnails preserved)');return;}catch(stillTooLarge){console.warn('⚠️ Still too large, removing thumbnails from older patterns...');// Step 2: Remove thumbnails only from older patterns, keep current pattern thumbnail
emergencyPatterns=emergencyPatterns.slice(0,-1).map(function(pattern,index){// Keep thumbnails for the 3 most recent patterns
if(index>=emergencyPatterns.length-4){return pattern;}else{var thumbnail=pattern.thumbnail,patternWithoutThumbnail=_objectWithoutProperties(pattern,_excluded);return patternWithoutThumbnail;}});// Add current pattern with thumbnail preserved
emergencyPatterns.push(patternData);try{localStorage.setItem('colorflexSavedPatterns',JSON.stringify(emergencyPatterns));console.log('✅ Pattern saved with selective thumbnail cleanup');}catch(finalFallback){console.warn('⚠️ Final fallback: removing current pattern thumbnail too');// Final fallback: Remove thumbnail from current pattern as well
var thumbnail=patternData.thumbnail,currentPatternNoThumb=_objectWithoutProperties(patternData,_excluded2);emergencyPatterns[emergencyPatterns.length-1]=currentPatternNoThumb;try{localStorage.setItem('colorflexSavedPatterns',JSON.stringify(emergencyPatterns));console.log('🔧 Emergency save successful (without thumbnails)');}catch(stillFailing){console.error('❌ Emergency save failed, trying aggressive localStorage cleanup...');// Super aggressive cleanup - remove everything except essential data
aggressiveLocalStorageCleanup();// Try one more time with just essential pattern data (no thumbnail)
try{var essentialPattern={id:patternData.id,patternName:patternData.patternName,collectionName:patternData.collectionName,colors:patternData.colors,currentScale:patternData.currentScale,scaleMultiplier:patternData.scaleMultiplier,saveDate:patternData.saveDate};var essentialPatterns=[essentialPattern];// Start fresh with just this pattern
localStorage.setItem('colorflexSavedPatterns',JSON.stringify(essentialPatterns));console.log('✅ Pattern saved with minimal data after aggressive cleanup');}catch(finalError){console.error('❌ All save attempts failed - localStorage severely limited');throw new Error('Unable to save pattern due to localStorage constraints');}}}}}// Update menu icon - call both systems for comprehensive coverage
updateSavedPatternsMenuIcon();// 🆕 CHAMELEON BUTTON: Also call global updateMenuIcon if available (from colorflex-menu-icon.js)
if(typeof window.updateMenuIcon==='function'){console.log('🦎 Updating global chameleon menu icon');window.updateMenuIcon();}}catch(error){console.error('❌ Failed to save pattern to localStorage:',error);throw error;// Re-throw to be handled by calling function
}}// Helper functions
function getShopifyMetafield(key){// In a real Shopify app, this would fetch from customer metafields
return JSON.parse(localStorage.getItem('colorflexSavedPatterns')||'[]');}function getCustomerId(){// Get from Shopify customer object or URL params
if(window.ShopifyCustomer&&window.ShopifyCustomer.id){return window.ShopifyCustomer.id;}// Check for Liquid template customer ID
if(typeof window.customer!=='undefined'&&window.customer.id){return window.customer.id;}// Fallback to localStorage for development
return localStorage.getItem('development_customer_id')||null;}function getCustomerAccessToken(){// Get from Shopify customer access token
if(window.ShopifyCustomer&&window.ShopifyCustomer.access_token){return window.ShopifyCustomer.access_token;}// Check for global customer access token
if(window.customerAccessToken){return window.customerAccessToken;}// Fallback for development
return localStorage.getItem('development_customer_token')||null;}function showSaveNotification(message){// Create notification element
var notification=document.createElement('div');notification.style.cssText="\n        position: fixed;\n        top: 20px;\n        right: 20px;\n        background: ".concat(message.includes('✅')?'#48bb78':'#f56565',";\n        color: white;\n        padding: 12px 20px;\n        border-radius: 8px;\n        font-family: 'Special Elite', monospace;\n        font-size: 14px;\n        font-weight: bold;\n        z-index: 10000;\n        box-shadow: 0 4px 12px rgba(0,0,0,0.3);\n        animation: slideIn 0.3s ease-out;\n    ");notification.textContent=message;// Add CSS animation
var style=document.createElement('style');style.textContent="\n        @keyframes slideIn {\n            from { transform: translateX(100%); opacity: 0; }\n            to { transform: translateX(0); opacity: 1; }\n        }\n    ";document.head.appendChild(style);document.body.appendChild(notification);// Remove after 3 seconds
setTimeout(function(){notification.remove();style.remove();},3000);}/**
 * =============================================================================
 * SECTION 3: UI COMPONENTS & INTERACTIONS
 * =============================================================================
 * 
 * This section handles UI elements, modals, notifications, and user interactions
 * for the pattern save system.
 *//**
 * Adds save and view buttons to the pattern preview area
 * 
 * This function locates the existing save button in the DOM and adds a 
 * "View Saved Patterns" button next to it with matching styling.
 * 
 * FLOW:
 * 1. Check if view button already exists (prevent duplicates)
 * 2. Find existing save button in DOM
 * 3. Create new view button with matching styles
 * 4. Add to same container as existing button
 * 5. Wire up click event handlers
 * 
 * @function addSaveButton
 */function addSaveButton(){console.log('🔍 addSaveButton() called');// Check if view button already exists
if(document.getElementById('viewSavedBtn')){console.log('✅ View button already exists');return;}// Find the existing save button
var existingSaveButton=document.getElementById('saveToListButton');if(!existingSaveButton){console.warn('❌ Existing save button not found');return;}console.log('✅ Existing save button found, adding view button next to it...');// Create standalone chameleon icon (matches floating chameleon style)
var viewSavedButton=document.createElement('div');viewSavedButton.id='viewSavedBtn';viewSavedButton.setAttribute('aria-label','My Designs');viewSavedButton.setAttribute('title','Browse your saved ColorFlex Designs');// Get pattern count for badge
var savedPatterns=JSON.parse(localStorage.getItem('colorflexSavedPatterns')||'[]');viewSavedButton.style.cssText="\n        position: relative;\n        display: inline-flex;\n        align-items: center;\n        justify-content: center;\n        cursor: pointer;\n        padding: 2px;\n        border-radius: 50%;\n        background: rgba(26, 32, 44, 0.9);\n        border: 2px solid rgb(212, 175, 55);\n        transition: all 0.3s ease;\n        z-index: 150;\n        pointer-events: auto;\n        width: 48px;\n        height: 48px;\n        overflow: visible;\n    ";viewSavedButton.innerHTML="\n        <img src=\"https://so-animation.com/colorflex/img/camelion-sm-black.jpg\" style=\"width: 100%; height: 100%; border-radius: 50%;\">\n        <span style=\"\n            background: #d4af37;\n            color: #1a202c;\n            font-size: 10px;\n            border-radius: 10px;\n            padding: 2px 4px;\n            position: absolute;\n            top: -8px;\n            right: -8px;\n            min-width: 24px;\n            text-align: center;\n            font-weight: bold;\n            line-height: 1;\n        \">".concat(savedPatterns.length,"</span>\n    ");// Add hover effects
viewSavedButton.addEventListener('mouseenter',function(){viewSavedButton.style.background='rgba(212, 175, 55, 0.2)';viewSavedButton.style.borderColor='rgba(212, 175, 55, 0.5)';viewSavedButton.style.transform='scale(1.05)';});viewSavedButton.addEventListener('mouseleave',function(){viewSavedButton.style.background='rgba(212, 175, 55, 0.1)';viewSavedButton.style.borderColor='rgba(212, 175, 55, 0.3)';viewSavedButton.style.transform='scale(1)';});// Add click handler for view saved patterns
viewSavedButton.addEventListener('click',showSavedPatternsModal);// Add the view button to the same container with negative margin to bring it closer
var buttonContainer=existingSaveButton.parentNode;if(buttonContainer){// Reset any absolute positioning
viewSavedButton.style.position='relative';viewSavedButton.style.marginLeft='2px';viewSavedButton.style.alignSelf='center';viewSavedButton.style.flexShrink='0';buttonContainer.appendChild(viewSavedButton);console.log('✅ View button added with negative margin for closer positioning');}else{console.warn('❌ Could not find button container');}console.log('🔍 Button IDs in DOM:',{existingSaveBtn:document.getElementById('saveToListButton')?'EXISTS':'NOT FOUND',newViewBtn:document.getElementById('viewSavedBtn')?'EXISTS':'NOT FOUND'});// IMPORTANT: Override the existing save button to use our thumbnail capture function
console.log('🔧 Binding our saveToMyList function to existing save button...');// Remove any existing click handlers and add our own
var newSaveButton=existingSaveButton.cloneNode(true);existingSaveButton.parentNode.replaceChild(newSaveButton,existingSaveButton);newSaveButton.addEventListener('click',function(e){e.preventDefault();console.log('💾 Save button clicked - calling our saveToMyList()');window.saveToMyList();});}/**
 * Displays the "My Designs" modal showing all saved patterns
 *
 * Shows a modal dialog containing all patterns saved to localStorage,
 * with options to preview, load, delete, or export each pattern.
 * Intelligently delegates to the unified modal system if available,
 * or falls back to the built-in CFM modal.
 *
 * Modal System Priority:
 * 1. Unified modal system (unified-pattern-modal.js) - preferred
 *    - Better styling and readability
 *    - Draggable, pinnable, with enhanced UI
 *    - Shared across ColorFlex app
 * 2. CFM fallback modal (createSavedPatternsModal) - fallback
 *    - Used if unified modal not loaded
 *    - Basic functionality with standard styling
 *
 * Modal Features (Unified System):
 * - Pattern cards with thumbnails
 * - Collection/pattern name display
 * - Color badges for each layer
 * - Scale indicator (1X, 2X, 3X, 4X)
 * - Save date timestamp
 * - Preview, Load, Delete, Export buttons
 * - Import pattern button in header
 * - Draggable positioning
 * - Pinnable (stays open during workflow)
 *
 * Data Source: localStorage key 'colorflexSavedPatterns'
 * Pattern Count: Displayed in modal title (e.g., "My Designs (12)")
 *
 * @returns {void} No return value (displays modal as side effect)
 *
 * @example
 * // Show saved patterns modal
 * showSavedPatternsModal();
 * // Modal appears with all saved patterns
 *
 * @example
 * // Typical user flow
 * // 1. User clicks "My Designs" button
 * // 2. showSavedPatternsModal() called
 * // 3. Modal displays with pattern cards
 * // 4. User clicks "Load" on a pattern
 * // 5. loadSavedPatternToUI() restores pattern to canvas
 *
 * @throws {Error} Logs error and shows notification if localStorage read fails
 *
 * ⚠️ IMPORTANT: Requires localStorage access (may fail in private browsing)
 *
 * 🎨 UI: Unified modal provides superior UX with drag, pin, and enhanced styling
 *
 * 💾 STORAGE: Reads from localStorage key 'colorflexSavedPatterns'
 *
 * @see window.UnifiedPatternModal - Preferred modal system
 * @see createSavedPatternsModal - Fallback modal creation
 * @see loadSavedPatternToUI - Loads selected pattern to canvas
 * @see deleteSavedPattern - Removes pattern from saved list
 */function showSavedPatternsModal(){try{console.log('🔍 Loading saved patterns...');// FORCE use of unified modal system - it should be loaded
if(window.UnifiedPatternModal&&window.UnifiedPatternModal.showSavedPatternsModal){console.log('🎨 Using unified modal system for better readability and styling');window.UnifiedPatternModal.showSavedPatternsModal();return;}console.log('⚠️ Unified modal not available, using CFM fallback modal - checking why...');console.log('UnifiedPatternModal exists:',!!window.UnifiedPatternModal);console.log('showSavedPatternsModal exists:',!!(window.UnifiedPatternModal&&window.UnifiedPatternModal.showSavedPatternsModal));// Fallback to local CFM modal if unified system not available
var savedPatterns=JSON.parse(localStorage.getItem('colorflexSavedPatterns')||'[]');console.log('📱 Loaded patterns from localStorage:',savedPatterns.length);createSavedPatternsModal(savedPatterns);}catch(error){console.error('❌ Error loading saved patterns:',error);showSaveNotification('❌ Failed to load saved patterns');}}// Create saved patterns modal
function createSavedPatternsModal(patterns){// Remove existing modal
var existingModal=document.getElementById('savedPatternsModal');if(existingModal){existingModal.remove();}// Create modal overlay
var modal=document.createElement('div');modal.id='savedPatternsModal';modal.isPinned=false;// Track pin state
modal.style.cssText="\n        position: fixed;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n        background: rgba(0,0,0,0.4);\n        z-index: 10000;\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        transition: background 0.3s ease;\n    ";// Create modal content - draggable and positioned on right
var modalContent=document.createElement('div');modalContent.id='cfmDraggableModal';modalContent.style.cssText="\n        background: #1a202c;\n        color: white;\n        padding: 0;\n        border-radius: 10px;\n        width: 400px;\n        max-height: 80vh;\n        font-family: 'Special Elite', monospace;\n        position: absolute;\n        right: 20px;\n        top: 20px;\n        box-shadow: 0 10px 30px rgba(0,0,0,0.5);\n        display: flex;\n        flex-direction: column;\n        border: 2px solid #4a5568;\n    ";// Modal header - draggable area
var header=document.createElement('div');header.style.cssText="\n        display: flex;\n        justify-content: space-between;\n        align-items: center;\n        padding: 20px 20px 10px 20px;\n        border-bottom: 1px solid #d4af37;\n        cursor: move;\n        user-select: none;\n        flex-shrink: 0;\n    ";var title=document.createElement('h2');title.textContent='📂 My Designs ('+patterns.length+') - ColorFlex Enhanced';title.style.margin='0';title.style.color='#efeeeaff';title.style.fontFamily="'Island Moments', italic";// Create button container for import, pin and close buttons
var buttonContainer=document.createElement('div');buttonContainer.style.cssText='display: flex; gap: 8px; align-items: center;';// Import button
var importBtn=document.createElement('button');importBtn.innerHTML='📥 Import';importBtn.title='Import a pattern file';importBtn.style.cssText="\n        background: transparent;\n        border: 1px solid #4299e1;\n        color: #4299e1;\n        font-size: 12px;\n        cursor: pointer;\n        padding: 6px 12px;\n        border-radius: 4px;\n        transition: all 0.3s ease;\n        font-family: 'Special Elite', monospace;\n        font-weight: bold;\n    ";importBtn.addEventListener('mouseenter',function(){importBtn.style.background='#4299e1';importBtn.style.color='white';});importBtn.addEventListener('mouseleave',function(){importBtn.style.background='transparent';importBtn.style.color='#4299e1';});importBtn.addEventListener('click',function(){importPattern();});// Pin/Lock button
var pinBtn=document.createElement('button');pinBtn.innerHTML='📍';// Pin icon
pinBtn.title='Pin modal (stay open while working)';pinBtn.style.cssText="\n        background: transparent;\n        border: 1px solid #d4af37;\n        color: #d4af37;\n        font-size: 16px;\n        cursor: pointer;\n        padding: 4px 8px;\n        border-radius: 4px;\n        transition: all 0.3s ease;\n    ";var closeBtn=document.createElement('button');closeBtn.textContent='×';closeBtn.style.cssText="\n        background: transparent;\n        border: 1px solid #4a5568;\n        color: white;\n        font-size: 24px;\n        cursor: pointer;\n        padding: 0;\n        width: 30px;\n        height: 30px;\n        border-radius: 50%;\n        background: #f56565;\n    ";closeBtn.addEventListener('click',function(){modal.remove();});// Pin button functionality
function togglePin(){modal.isPinned=!modal.isPinned;if(modal.isPinned){// Pinned state: very light background, allows all interactions
pinBtn.innerHTML='🔒';// Lock icon when pinned
pinBtn.title='Unpin modal (close when clicking outside)';pinBtn.style.color='#f56565';pinBtn.style.borderColor='#f56565';modal.style.background='rgba(0,0,0,0.1)';// Very light background
console.log('📍 CFM Modal pinned - background interactions enabled');}else{// Unpinned state: darker background, can close on backdrop click
pinBtn.innerHTML='📍';// Pin icon when unpinned
pinBtn.title='Pin modal (stay open while working)';pinBtn.style.color='#d4af37';pinBtn.style.borderColor='#d4af37';modal.style.background='rgba(0,0,0,0.4)';// Darker background
console.log('📌 CFM Modal unpinned - can close on backdrop click');}}pinBtn.addEventListener('click',togglePin);// Add buttons to container
buttonContainer.appendChild(importBtn);buttonContainer.appendChild(pinBtn);buttonContainer.appendChild(closeBtn);header.appendChild(title);header.appendChild(buttonContainer);modalContent.appendChild(header);// Create scrollable content area
var scrollableContent=document.createElement('div');scrollableContent.style.cssText="\n        flex: 1;\n        overflow-y: auto;\n        padding: 20px;\n        max-height: calc(80vh - 100px);\n    ";// Patterns list
if(patterns.length===0){var emptyMessage=document.createElement('div');emptyMessage.innerHTML="\n            <div style=\"text-align: center; padding: 40px; color: #a0aec0;\">\n                <div style=\"font-size: 48px; margin-bottom: 20px;\">\n                <img src=\"https://so-animation.com/colorflex/img/camelion-sm-black.jpg\" style=\"width: 100px; height: 100px; border-radius: 50%; margin-bottom: 20px;\">\n                <h3>No saved patterns yet</h3>\n                <div style=\"font-size: 24px; margin-bottom: 20px;\">\n                <p>Start customizing patterns and save your favorites!</p>\n                </div>\n            </div>\n        ";scrollableContent.appendChild(emptyMessage);}else{for(var i=0;i<patterns.length;i++){var patternDiv=createSavedPatternItem(patterns[i],i);scrollableContent.appendChild(patternDiv);}}// Add scrollable content to modal
modalContent.appendChild(scrollableContent);modal.appendChild(modalContent);document.body.appendChild(modal);// Make modal draggable by the header
var isDragging=false;var dragOffset={x:0,y:0};header.addEventListener('mousedown',function(e){if(e.target===pinBtn||e.target===closeBtn)return;// Don't drag when clicking buttons
isDragging=true;var rect=modalContent.getBoundingClientRect();dragOffset.x=e.clientX-rect.left;dragOffset.y=e.clientY-rect.top;modalContent.style.cursor='grabbing';e.preventDefault();});document.addEventListener('mousemove',function(e){if(!isDragging)return;var newX=e.clientX-dragOffset.x;var newY=e.clientY-dragOffset.y;// Keep modal within viewport bounds
var maxX=window.innerWidth-modalContent.offsetWidth;var maxY=window.innerHeight-modalContent.offsetHeight;modalContent.style.left=Math.max(0,Math.min(newX,maxX))+'px';modalContent.style.top=Math.max(0,Math.min(newY,maxY))+'px';modalContent.style.right='auto';// Override right positioning when dragging
});document.addEventListener('mouseup',function(){if(isDragging){isDragging=false;modalContent.style.cursor='move';}});// Close on overlay click - respect pin state
modal.addEventListener('click',function(e){if(e.target===modal&&!modal.isPinned){modal.remove();}});}// Create individual saved pattern item
function createSavedPatternItem(pattern,index){var item=document.createElement('div');item.style.cssText="\n        border: 1px solid #4a5568;\n        border-radius: 12px;\n        padding: 20px;\n        margin-bottom: 15px;\n        background: #2d3748;\n        transition: background 0.3s ease;\n        position: relative;\n        min-height: 400px;\n    ";// Hover effect
item.addEventListener('mouseenter',function(){item.style.background='#374151';});item.addEventListener('mouseleave',function(){item.style.background='#2d3748';});// ID Badge (centered line at top)
var idBadge=document.createElement('div');idBadge.style.cssText="\n        text-align: center;\n        color: #d4af37;\n        font-size: 11px !important;\n        font-family: 'Special Elite', monospace;\n        font-weight: bold;\n        margin-bottom: 16px;\n        word-break: break-all;\n        line-height: 1.3;\n    ";// Add scale to ID if not 100%
var idText="ID: ".concat(pattern.id);if(pattern.currentScale&&pattern.currentScale!==100){var scaleLabel=getScaleLabel(pattern.currentScale);idText+=" - ".concat(scaleLabel);}idBadge.textContent=idText;item.appendChild(idBadge);// Pattern Name (large, script font)
var patternName=document.createElement('div');patternName.style.cssText="\n        font-family: 'Island Moments', cursive;\n        font-size: 48px;\n        color: white;\n        margin-bottom: 8px;\n        line-height: 1.1;\n        text-align: center;\n    ";patternName.textContent=pattern.patternName;// Collection info section
var collectionInfo=document.createElement('div');collectionInfo.style.cssText='margin-bottom: 12px;';var collectionLabel=document.createElement('div');collectionLabel.style.cssText="\n        color: #a0aec0;\n        font-size: 14px;\n        font-family: 'Special Elite', monospace;\n        margin-bottom: 4px;\n        line-height: 1.3;\n    ";collectionLabel.innerHTML="\n        <span style=\"color: #e2e8f0; font-weight: bold; font-size: 14px;\">Collection:</span><br>\n        ".concat(pattern.collectionName?pattern.collectionName.charAt(0).toUpperCase()+pattern.collectionName.slice(1):'Unknown',"\n    ");// Metadata section (saved date, layers, scale) - Reduced to 75% size using absolute pixels
var metadata=document.createElement('div');metadata.style.cssText='display: flex; gap: 10px; margin-bottom: 12px; font-size: 11px !important;';var savedInfo=document.createElement('div');savedInfo.style.cssText='display: flex; align-items: center; gap: 3px; font-size: 11px !important;';savedInfo.innerHTML="\n        <span style=\"font-size: 12px !important;\">\uD83D\uDCC5</span>\n        <div style=\"color: #e2e8f0; font-family: 'Special Elite', monospace !important; font-size: 11px !important; line-height: 1.2;\">\n            <span style=\"font-size: 11px !important; font-weight: bold; line-height: 1.2;\">Saved:</span><br>\n            <span style=\"color: #a0aec0; font-size: 11px !important; line-height: 1.2;\">".concat(new Date(pattern.timestamp).toLocaleDateString(),"</span>\n        </div>\n    ");var layersInfo=document.createElement('div');layersInfo.style.cssText='display: flex; align-items: center; gap: 3px; font-size: 11px !important;';layersInfo.innerHTML="\n        <span style=\"font-size: 12px !important;\">\uD83C\uDFAF</span>\n        <div style=\"color: #e2e8f0; font-family: 'Special Elite', monospace !important; font-size: 11px !important; line-height: 1.2;\">\n            <span style=\"font-size: 11px !important; font-weight: bold; line-height: 1.2;\">Layers:</span><br>\n            <span style=\"color: #a0aec0; font-size: 11px !important; line-height: 1.2;\">".concat(pattern.colors?pattern.colors.length:0,"</span>\n        </div>\n    ");metadata.appendChild(savedInfo);metadata.appendChild(layersInfo);// Scale information
if(pattern.currentScale&&pattern.currentScale!==100){var scaleInfo=document.createElement('div');scaleInfo.style.cssText='display: flex; align-items: center; gap: 3px; font-size: 11px !important;';// Determine scale display text using config
var scaleText=getScaleLabel(pattern.currentScale);if(scaleText==='Normal')scaleText='NORMAL';// Uppercase for display
else if(!scaleText.endsWith('X')&&!scaleText.endsWith('%')){scaleText="".concat(scaleText," SCALE");}scaleInfo.innerHTML="\n            <span style=\"font-size: 12px !important;\">\uD83D\uDCCF</span>\n            <div style=\"color: #e2e8f0; font-family: 'Special Elite', monospace !important; font-size: 11px !important; line-height: 1.2;\">\n                <span style=\"font-size: 11px !important; font-weight: bold; line-height: 1.2;\">Repeat:</span><br>\n                <span style=\"color: #d4af37; font-weight: bold; font-size: 11px !important; line-height: 1.2;\">".concat(scaleText,"</span>\n            </div>\n        ");metadata.appendChild(scaleInfo);}// Layer Details section (restored with clean color names)
var layerDetails=document.createElement('div');layerDetails.style.cssText='margin-bottom: 16px;';var layerDetailsTitle=document.createElement('div');layerDetailsTitle.style.cssText="\n        color: #d4af37;\n        font-size: 14px;\n        font-family: 'Special Elite', monospace;\n        font-weight: bold;\n        margin-bottom: 8px;\n    ";layerDetailsTitle.textContent='Layer Details:';var layerDetailsList=document.createElement('div');layerDetailsList.style.cssText='font-size: 12px; color: #a0aec0; line-height: 1.4;';if(pattern.colors&&pattern.colors.length>0){pattern.colors.forEach(function(color){// Clean the color name: remove SW/SC numbers and properly capitalize
var cleanColorName=color.color.replace(/^(SW|SC)\d+\s*/i,'').trim();// Proper title case formatting
cleanColorName=cleanColorName.split(' ').map(function(word){return word.charAt(0).toUpperCase()+word.slice(1).toLowerCase();}).join(' ');var layerItem=document.createElement('div');layerItem.style.cssText='margin-bottom: 2px;';layerItem.innerHTML="\u2022 ".concat(color.label,": ").concat(cleanColorName);layerDetailsList.appendChild(layerItem);});}layerDetails.appendChild(layerDetailsTitle);layerDetails.appendChild(layerDetailsList);// Large Pattern Thumbnail
var thumbnailContainer=document.createElement('div');thumbnailContainer.style.cssText="\n        width: 100%;\n        height: 200px;\n        margin-bottom: 16px;\n        border-radius: 8px;\n        overflow: hidden;\n        border: 2px solid #d4af37;\n    ";if(pattern.thumbnail){var thumbnailImg=document.createElement('img');thumbnailImg.src=pattern.thumbnail;thumbnailImg.style.cssText="\n            width: 100%;\n            height: 100%;\n            object-fit: cover;\n        ";thumbnailImg.alt=pattern.patternName+' thumbnail';// Handle thumbnail load error
thumbnailImg.onerror=function(){// Create placeholder if image fails to load
var placeholder=document.createElement('div');placeholder.style.cssText="\n                width: 100%;\n                height: 100%;\n                background: #2d3748;\n                display: flex;\n                align-items: center;\n                justify-content: center;\n                color: #d4af37;\n                font-family: 'Special Elite', monospace;\n                font-size: 48px;\n            ";placeholder.textContent='🎨';thumbnailContainer.replaceChild(placeholder,thumbnailImg);};thumbnailContainer.appendChild(thumbnailImg);}else{// Create placeholder if no thumbnail
var placeholder=document.createElement('div');placeholder.style.cssText="\n            width: 100%;\n            height: 100%;\n            background: #2d3748;\n            background-image: url('https://so-animation.com/colorflex/img/camelion-sm-black.jpg');\n            background-size: cover;\n            background-position: center;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            color: #d4af37;\n            font-family: 'Special Elite', monospace;\n            font-size: 48px;\n        ";placeholder.textContent="";thumbnailContainer.appendChild(placeholder);}// Assemble the top section
var topSection=document.createElement('div');topSection.appendChild(patternName);topSection.appendChild(collectionInfo);topSection.appendChild(collectionLabel);topSection.appendChild(metadata);topSection.appendChild(layerDetails);// Assemble everything
var mainContent=document.createElement('div');mainContent.appendChild(topSection);mainContent.appendChild(thumbnailContainer);// Three-button layout at bottom
var buttons=document.createElement('div');buttons.style.cssText='display: flex; gap: 10px; margin-top: auto; padding-top: 16px;';// Load Pattern button (yellow border)
var loadBtn=document.createElement('button');loadBtn.textContent='🔄 Open in ColorFlex';loadBtn.style.cssText="\n        background: transparent;\n        color: #d4af37;\n        border: 2px solid #d4af37;\n        padding: 10px 16px;\n        border-radius: 6px;\n        cursor: pointer;\n        font-size: 12px;\n        font-family: 'Special Elite', monospace;\n        transition: all 0.3s ease;\n        font-weight: bold;\n        display: flex;\n        align-items: center;\n        gap: 0.25rem;\n    ";loadBtn.addEventListener('mouseenter',function(){loadBtn.style.background='#d4af37';loadBtn.style.color='#1a202c';});loadBtn.addEventListener('mouseleave',function(){loadBtn.style.background='transparent';loadBtn.style.color='#d4af37';});loadBtn.addEventListener('click',function(){loadSavedPatternToUI(pattern);});// Delete button (red border)
var deleteBtn=document.createElement('button');deleteBtn.textContent='🗑️ Delete';deleteBtn.style.cssText="\n        background: transparent;\n        color: #f56565;\n        border: 2px solid #f56565;\n        padding: 10px 16px;\n        border-radius: 6px;\n        cursor: pointer;\n        font-size: 12px;\n        font-family: 'Special Elite', monospace;\n        transition: all 0.3s ease;\n        font-weight: bold;\n        display: flex;\n        align-items: center;\n        gap: 0.25rem;\n    ";deleteBtn.addEventListener('mouseenter',function(){deleteBtn.style.background='#f56565';deleteBtn.style.color='white';});deleteBtn.addEventListener('mouseleave',function(){deleteBtn.style.background='transparent';deleteBtn.style.color='#f56565';});deleteBtn.addEventListener('click',function(){if(confirm('🗑️ Delete "'+pattern.patternName+'"?\n\nThis action cannot be undone.')){deleteSavedPattern(pattern.id);document.getElementById('savedPatternsModal').remove();showSavedPatternsModal();// Refresh modal
}});// Buy it! button (purple background)
var addToCartBtn=document.createElement('button');addToCartBtn.textContent='Buy it!';addToCartBtn.style.cssText="\n        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n        color: white;\n        border: none;\n        padding: 10px 20px;\n        border-radius: 6px;\n        cursor: pointer;\n        font-size: 30px;\n        font-family: 'Island Moments', cursive;\n        transition: all 0.3s ease;\n        font-weight: bold;\n        display: flex;\n        align-items: center;\n        gap: 0.25rem;\n        flex: 1;\n    ";addToCartBtn.addEventListener('mouseenter',function(){addToCartBtn.style.transform='translateY(-2px)';addToCartBtn.style.boxShadow='0 4px 8px rgba(102, 126, 234, 0.3)';});addToCartBtn.addEventListener('mouseleave',function(){addToCartBtn.style.transform='translateY(0)';addToCartBtn.style.boxShadow='none';});addToCartBtn.addEventListener('click',function(){showMaterialSelectionModal(pattern);});// Export button (blue border)
var exportBtn=document.createElement('button');exportBtn.textContent='💾 Export';exportBtn.title='Download this pattern as a file';exportBtn.style.cssText="\n        background: transparent;\n        color: #4299e1;\n        border: 2px solid #4299e1;\n        padding: 10px 16px;\n        border-radius: 6px;\n        cursor: pointer;\n        font-size: 12px;\n        font-family: 'Special Elite', monospace;\n        transition: all 0.3s ease;\n        font-weight: bold;\n        display: flex;\n        align-items: center;\n        gap: 0.25rem;\n    ";exportBtn.addEventListener('mouseenter',function(){exportBtn.style.background='#4299e1';exportBtn.style.color='white';});exportBtn.addEventListener('mouseleave',function(){exportBtn.style.background='transparent';exportBtn.style.color='#4299e1';});exportBtn.addEventListener('click',function(){exportPattern(pattern);});buttons.appendChild(loadBtn);buttons.appendChild(exportBtn);buttons.appendChild(deleteBtn);// Create separate container for Buy it! button at bottom
var downloadButtonContainer=document.createElement('div');downloadButtonContainer.style.cssText='margin-top: 16px; padding-top: 16px; border-top: 1px solid #4a5568;';downloadButtonContainer.appendChild(addToCartBtn);item.appendChild(mainContent);item.appendChild(buttons);item.appendChild(downloadButtonContainer);return item;}// Download proof for a saved pattern
function downloadSavedPatternProof(pattern){try{console.log('🔧 Download proof requested for saved pattern:',pattern.patternName);if(!pattern.colors||pattern.colors.length===0){alert('No colors found in saved pattern');return;}// Extract color strings from saved pattern color objects
var colorArray=pattern.colors.map(function(colorObj){return colorObj.color;});// Get scale from saved pattern (default to 100 if not present)
var patternScale=pattern.currentScale||100;console.log('🎨 Generating proof for:',pattern.patternName,'from collection:',pattern.collectionName,'with colors:',colorArray,'scale:',patternScale);// Use the same proof generation as product pages
// Pass scale to show correct tiling/repetition on 24" wide proof
window.generatePatternProof(pattern.patternName,pattern.collectionName,colorArray,patternScale// Scale affects tiling, not canvas size
).then(/*#__PURE__*/function(){var _ref=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(proofCanvas){var infoStripHeight,finalCanvas,finalCtx,baseFontSize,smallFontSize,leftMargin,yPosition,scaleDisplay,filename;return _regenerator().w(function(_context){while(1)switch(_context.n){case 0:console.log('✅ Pattern proof generation complete, adding info strip...');// Create a new canvas with extra height for info strip
infoStripHeight=200;finalCanvas=document.createElement('canvas');finalCtx=finalCanvas.getContext('2d');finalCanvas.width=proofCanvas.width;finalCanvas.height=proofCanvas.height+infoStripHeight;// Draw the pattern proof
finalCtx.drawImage(proofCanvas,0,0);// Draw info strip background
finalCtx.fillStyle='#ffffff';finalCtx.fillRect(0,proofCanvas.height,finalCanvas.width,infoStripHeight);// Add border line
finalCtx.strokeStyle='#d4af37';finalCtx.lineWidth=2;finalCtx.beginPath();finalCtx.moveTo(0,proofCanvas.height);finalCtx.lineTo(finalCanvas.width,proofCanvas.height);finalCtx.stroke();// Calculate font sizes based on canvas width
baseFontSize=Math.max(24,finalCanvas.width/80);smallFontSize=Math.max(18,finalCanvas.width/100);// Add text info
finalCtx.fillStyle='#1a202c';finalCtx.font="bold ".concat(baseFontSize,"px Arial");finalCtx.textAlign='left';leftMargin=30;yPosition=proofCanvas.height+30;// Pattern name
finalCtx.fillText("Pattern: ".concat(pattern.patternName),leftMargin,yPosition);yPosition+=baseFontSize+8;// Collection name
finalCtx.font="".concat(smallFontSize,"px Arial");finalCtx.fillText("Collection: ".concat(pattern.collectionName),leftMargin,yPosition);yPosition+=smallFontSize+8;// Scale information
if(patternScale!==100){scaleDisplay=patternScale===50?'0.5X':patternScale===200?'2X':patternScale===300?'3X':patternScale===400?'4X':"".concat(patternScale,"%");finalCtx.fillText("Scale: ".concat(scaleDisplay),leftMargin,yPosition);yPosition+=smallFontSize+8;}// Color information - display layer by layer
finalCtx.fillText("Colors:",leftMargin,yPosition);yPosition+=smallFontSize+6;pattern.colors.forEach(function(colorObj){finalCtx.fillText("  ".concat(colorObj.label,": ").concat(colorObj.color),leftMargin+20,yPosition);yPosition+=smallFontSize+4;});// Build filename with scale suffix if not 100%
filename="".concat(pattern.patternName,"_").concat(pattern.collectionName);if(patternScale!==100){if(patternScale===50)filename+='_0.5x';else if(patternScale===200)filename+='_2x';else if(patternScale===300)filename+='_3x';else if(patternScale===400)filename+='_4x';else filename+="_".concat(patternScale,"pct");}filename+='_proof.jpg';window.downloadPatternProof(finalCanvas,filename);case 1:return _context.a(2);}},_callee);}));return function(_x){return _ref.apply(this,arguments);};}())["catch"](function(error){console.error('❌ Error generating saved pattern proof:',error);alert('Error generating proof. Check console for details.');});}catch(error){console.error('❌ Error in downloadSavedPatternProof:',error);alert('Error downloading proof. Please try again.');}}// Delete a saved pattern
/**
 * Deletes a saved pattern from localStorage by pattern ID
 *
 * Removes a pattern from the user's saved patterns list and updates
 * the UI to reflect the change. Automatically updates menu icons to
 * show the new pattern count.
 *
 * Delete Process:
 * 1. Load all saved patterns from localStorage
 * 2. Filter out the pattern matching patternId
 * 3. Save updated array back to localStorage
 * 4. Update UI menu icons
 * 5. Show success notification
 *
 * @param {string} patternId - Unique pattern identifier to delete
 *
 * @example
 * // Delete a specific pattern
 * deleteSavedPattern('tudor-rose-7006-6258-2x');
 * // Pattern removed from localStorage
 * // UI updated to show new pattern count
 *
 * @example
 * // Typical flow from modal
 * // 1. User clicks delete button on pattern card
 * // 2. deleteSavedPattern(pattern.id) called
 * // 3. Pattern removed from list
 * // 4. Modal refreshed to show remaining patterns
 *
 * @throws {Error} Logs error and shows notification if delete fails
 *
 * ⚠️ IMPORTANT: Deletion is permanent - no undo functionality
 *
 * 🔄 UI UPDATE: Automatically calls updateSavedPatternsMenuIcon()
 * and window.updateMenuIcon() if available
 *
 * 💾 STORAGE: Modifies localStorage key 'colorflexSavedPatterns'
 *
 * @see showSavedPatternsModal - Displays patterns list
 * @see updateSavedPatternsMenuIcon - Updates menu icon badge
 */function deleteSavedPattern(patternId){try{// Delete from localStorage
var patterns=JSON.parse(localStorage.getItem('colorflexSavedPatterns')||'[]');var updatedPatterns=patterns.filter(function(p){return p.id!==patternId;});localStorage.setItem('colorflexSavedPatterns',JSON.stringify(updatedPatterns));console.log('✅ Pattern deleted from localStorage');// Update menu icon - call both systems for comprehensive coverage
updateSavedPatternsMenuIcon();// 🆕 CHAMELEON BUTTON: Also call global updateMenuIcon if available (from colorflex-menu-icon.js)
if(typeof window.updateMenuIcon==='function'){console.log('🦎 Updating global chameleon menu icon after deletion');window.updateMenuIcon();}showSaveNotification('✅ Pattern deleted successfully!');}catch(error){console.error('❌ Error deleting pattern:',error);showSaveNotification('❌ Failed to delete pattern');}}/**
 * Exports a saved pattern as a downloadable JSON file (.cfx.json)
 *
 * Creates a formatted JSON file containing all pattern data including
 * colors, collection, scale settings, and thumbnail image. The file can
 * be shared with others or imported back into ColorFlex to restore the
 * exact pattern customization.
 *
 * Export Process:
 * 1. Serialize pattern object to pretty-printed JSON (2-space indent)
 * 2. Create Blob with application/json MIME type
 * 3. Generate object URL for download
 * 4. Create temporary <a> element with download attribute
 * 5. Programmatically click link to trigger download
 * 6. Clean up object URL and DOM element
 *
 * File Naming Convention:
 * Format: "{pattern-name}_{collection-name}.cfx.json"
 * - Lowercase conversion
 * - Special characters replaced with hyphens
 * - Example: "tudor-rose_english-cottage.cfx.json"
 *
 * File Contents:
 * - Pattern ID (unique identifier)
 * - Pattern name and collection name
 * - Layer colors with labels
 * - Thumbnail (base64 JPEG, ~50-100KB)
 * - Scale settings (currentScale, scaleMultiplier)
 * - Save timestamp
 *
 * @param {Object} pattern - Complete pattern object to export
 * @param {string} pattern.id - Unique pattern identifier
 * @param {string} pattern.patternName - Pattern name
 * @param {string} pattern.collectionName - Collection name
 * @param {Array<Object>} pattern.colors - Layer colors with labels
 * @param {string} [pattern.thumbnail] - Base64 JPEG thumbnail
 * @param {number} [pattern.currentScale=100] - Scale percentage
 * @param {number} [pattern.scaleMultiplier=1.0] - Scale multiplier
 * @param {string} pattern.timestamp - ISO 8601 save timestamp
 * @returns {void} No return value (triggers file download as side effect)
 *
 * @example
 * // Export a saved pattern
 * const pattern = {
 *   id: 'tudor-rose-7006-6258-2x',
 *   patternName: 'Tudor Rose',
 *   collectionName: 'English Cottage',
 *   colors: [{label: 'Background', color: 'SW7006 Eider White'}],
 *   thumbnail: 'data:image/jpeg;base64,...',
 *   currentScale: 200,
 *   scaleMultiplier: 0.5,
 *   timestamp: '2025-11-30T12:00:00.000Z'
 * };
 *
 * exportPattern(pattern);
 * // Downloads: tudor-rose_english-cottage.cfx.json
 * // File size: ~100-150KB (with thumbnail)
 *
 * @example
 * // Typical user flow
 * // 1. User opens "My Designs" modal
 * // 2. Clicks "Export" button on a pattern card
 * // 3. exportPattern(pattern) called
 * // 4. Browser downloads .cfx.json file
 * // 5. User can share file or import it later
 *
 * @throws {Error} Logs error and shows notification if export fails
 *
 * 💾 FILE FORMAT: JSON with .cfx.json extension (ColorFlex export format)
 *
 * 🔄 IMPORT: Use importPattern() to restore exported patterns
 *
 * 📦 SHARING: Files can be shared via email, cloud storage, or chat
 *
 * @see importPattern - Imports .cfx.json files back into ColorFlex
 * @see showSavedPatternsModal - Modal with export buttons
 */function exportPattern(pattern){try{console.log('💾 Exporting pattern:',pattern.patternName);// Create JSON string with nice formatting
// Include thumbnail - it's used when importing to display in My Designs
var jsonString=JSON.stringify(pattern,null,2);// Create a Blob from the JSON string
var blob=new Blob([jsonString],{type:'application/json'});// Create download link
var url=URL.createObjectURL(blob);var link=document.createElement('a');link.href=url;// Generate filename: pattern-name_collection-name.cfx.json
var fileName="".concat(pattern.patternName,"_").concat(pattern.collectionName,".cfx.json").toLowerCase().replace(/[^a-z0-9_\-\.]/g,'-');link.download=fileName;// Trigger download
document.body.appendChild(link);link.click();document.body.removeChild(link);// Clean up the URL object
URL.revokeObjectURL(url);console.log('✅ Pattern exported successfully:',fileName);showSaveNotification('💾 Pattern exported: '+fileName);}catch(error){console.error('❌ Error exporting pattern:',error);showSaveNotification('❌ Failed to export pattern');}}/**
 * Imports a pattern from a .cfx.json or .json file via file picker
 *
 * Opens a file picker dialog allowing users to select a previously
 * exported pattern file. Validates the file contents, handles duplicate
 * IDs intelligently, and adds the pattern to the saved patterns list.
 *
 * Import Process:
 * 1. Create hidden file input element with .json/.cfx.json accept filter
 * 2. Open browser file picker dialog
 * 3. Read selected file using FileReader
 * 4. Parse JSON and validate required fields
 * 5. Check for duplicate pattern IDs
 * 6. Handle duplicates: replace existing or create new with unique ID
 * 7. Save to localStorage
 * 8. Refresh "My Designs" modal to show imported pattern
 *
 * Duplicate Handling:
 * - If pattern ID exists: Prompt user to replace or keep both
 * - Replace: Overwrites existing pattern with imported data
 * - Keep both: Appends "-imported-{timestamp}" to ID
 *
 * Validation Rules:
 * - File must be valid JSON
 * - Must contain: patternName, collectionName, colors
 * - If missing timestamp, adds current timestamp
 *
 * Accepted File Formats:
 * - .cfx.json (ColorFlex export format - preferred)
 * - .json (generic JSON format)
 *
 * @returns {void} No return value (triggers file picker as side effect)
 *
 * @example
 * // User clicks "Import" button in My Designs modal
 * importPattern();
 * // 1. File picker opens
 * // 2. User selects "tudor-rose_english-cottage.cfx.json"
 * // 3. Pattern validates and loads
 * // 4. Modal refreshes showing imported pattern
 *
 * @example
 * // Duplicate ID handling
 * // User imports pattern with ID "tudor-rose-7006-6258"
 * // ID already exists in saved patterns
 * // Prompt: "Replace existing?"
 * //   → Yes: Replaces with imported data
 * //   → No: Saves as "tudor-rose-7006-6258-imported-1638284400000"
 *
 * @throws {Error} 'Invalid pattern file: missing required fields' if validation fails
 * @throws {Error} Logs error and shows notification if file read or parse fails
 *
 * ⚠️ IMPORTANT: File must contain patternName, collectionName, and colors
 *
 * 🔄 DUPLICATES: Intelligently handles conflicts with user choice
 *
 * 💾 STORAGE: Adds to localStorage key 'colorflexSavedPatterns'
 *
 * 🎨 UI UPDATE: Automatically refreshes modal to show imported pattern
 *
 * @see exportPattern - Exports patterns to .cfx.json files
 * @see showSavedPatternsModal - Modal with import button
 * @see updateSavedPatternsMenuIcon - Updates menu icon badge
 */function importPattern(){try{console.log('📥 Opening file picker for pattern import...');// Create hidden file input
var fileInput=document.createElement('input');fileInput.type='file';fileInput.accept='.json,.cfx.json';fileInput.style.display='none';fileInput.addEventListener('change',function(event){var file=event.target.files[0];if(!file){console.log('No file selected');return;}console.log('📂 Selected file:',file.name);// Read the file
var reader=new FileReader();reader.onload=function(e){try{var _document$getElementB,_document$getElementB2;var data=JSON.parse(e.target.result);console.log('📥 Parsed import data:',data);// Load existing patterns
var existingPatterns=JSON.parse(localStorage.getItem('colorflexSavedPatterns')||'[]');var importedCount=0;var replacedCount=0;var skippedCount=0;// Check if this is an "Export All" file (multiple patterns)
var isMultiPatternFile=data.exportSource==='ColorFlex My Designs'&&Array.isArray(data.patterns);if(isMultiPatternFile){console.log("\uD83D\uDCE6 Detected multi-pattern file with ".concat(data.patternCount," patterns"));// Process each pattern in the array
var _loop=function _loop(){var patternData=data.patterns[i];// Validate pattern has required fields
if(!patternData.patternName||!patternData.collectionName||!patternData.colors){console.warn("\u26A0\uFE0F Skipping invalid pattern at index ".concat(i));skippedCount++;return 1;// continue
}// Add timestamp if not present
if(!patternData.timestamp){patternData.timestamp=new Date().toISOString();}// Check if pattern with same ID already exists
var existingIndex=existingPatterns.findIndex(function(p){return p.id===patternData.id;});if(existingIndex>=0){// Replace existing pattern
existingPatterns[existingIndex]=patternData;replacedCount++;console.log("\uD83D\uDD04 Replaced: ".concat(patternData.patternName));}else{// Add new pattern
existingPatterns.push(patternData);importedCount++;console.log("\u2795 Added: ".concat(patternData.patternName));}};for(var i=0;i<data.patterns.length;i++){if(_loop())continue;}// Save all patterns back to localStorage
localStorage.setItem('colorflexSavedPatterns',JSON.stringify(existingPatterns));// Show summary message
var summary=[];if(importedCount>0)summary.push("".concat(importedCount," new"));if(replacedCount>0)summary.push("".concat(replacedCount," replaced"));if(skippedCount>0)summary.push("".concat(skippedCount," skipped"));var message="\u2705 Imported ".concat(data.patternCount," patterns: ").concat(summary.join(', '));showSaveNotification(message);console.log(message);}else{// Single pattern file (legacy format)
console.log('📄 Detected single pattern file');var patternData=data;// Validate the pattern data has required fields
if(!patternData.patternName||!patternData.collectionName||!patternData.colors){throw new Error('Invalid pattern file: missing required fields');}// Add timestamp if not present
if(!patternData.timestamp){patternData.timestamp=new Date().toISOString();}// Check if pattern with same ID already exists
var existingIndex=existingPatterns.findIndex(function(p){return p.id===patternData.id;});if(existingIndex>=0){// Ask user if they want to replace
if(confirm("A pattern with ID \"".concat(patternData.id,"\" already exists.\n\nReplace it with the imported pattern?"))){existingPatterns[existingIndex]=patternData;console.log('🔄 Replaced existing pattern');}else{// Generate new ID for imported pattern
patternData.id=patternData.id+'-imported-'+Date.now();patternData.timestamp=new Date().toISOString();existingPatterns.push(patternData);console.log('➕ Added as new pattern with ID:',patternData.id);}}else{// Add new pattern
existingPatterns.push(patternData);console.log('➕ Added new pattern');}// Save back to localStorage
localStorage.setItem('colorflexSavedPatterns',JSON.stringify(existingPatterns));// Show success message
showSaveNotification('✅ Pattern imported: '+patternData.patternName);console.log('✅ Pattern imported successfully');}// Update menu icon
updateSavedPatternsMenuIcon();if(typeof window.updateMenuIcon==='function'){window.updateMenuIcon();}// Refresh the modal to show the new pattern(s)
(_document$getElementB=document.getElementById('savedPatternsModal'))===null||_document$getElementB===void 0||_document$getElementB.remove();(_document$getElementB2=document.getElementById('unifiedSavedPatternsModal'))===null||_document$getElementB2===void 0||_document$getElementB2.remove();if(typeof showSavedPatternsModal==='function'){showSavedPatternsModal();}}catch(parseError){console.error('❌ Error parsing pattern file:',parseError);showSaveNotification('❌ Invalid pattern file: '+parseError.message);}};reader.onerror=function(){console.error('❌ Error reading file');showSaveNotification('❌ Failed to read file');};reader.readAsText(file);});// Trigger file picker
document.body.appendChild(fileInput);fileInput.click();document.body.removeChild(fileInput);}catch(error){console.error('❌ Error importing pattern:',error);showSaveNotification('❌ Failed to import pattern');}}// Expose functions to window for external access
window.exportPattern=exportPattern;window.importPattern=importPattern;// Expose collection switching for collections modal
window.switchCollection=function(collectionName){var _appState$collections,_targetCollection$pat;console.log("\uD83D\uDD04 Switching to collection: ".concat(collectionName));// Find the collection in appState
var targetCollection=(_appState$collections=appState.collections)===null||_appState$collections===void 0?void 0:_appState$collections.find(function(c){return c.name===collectionName;});if(!targetCollection){console.error("Collection not found: ".concat(collectionName));return;}// ✅ FIX: In furniture simple mode, look for the .fur-1 variant to get furnitureConfig
var isFurnitureSimpleModeForConfig=window.COLORFLEX_SIMPLE_MODE===true&&window.COLORFLEX_MODE==='FURNITURE';if(isFurnitureSimpleModeForConfig&&appState.allCollections){// Try to find the furniture variant (e.g., cottage-sketch-book.fur-1)
var variantNames=["".concat(collectionName,".fur-1"),"".concat(collectionName,".fur"),"".concat(collectionName,"-fur-1"),"".concat(collectionName,"-fur")];var variantCollection=appState.allCollections.find(function(c){return c&&c.name&&variantNames.includes(c.name);});if(variantCollection&&variantCollection.furnitureConfig){console.log("\u2705 Found furniture variant \"".concat(variantCollection.name,"\" with furnitureConfig"));// Merge furnitureConfig from variant into base collection
if(!targetCollection.furnitureConfig){targetCollection.furnitureConfig=variantCollection.furnitureConfig;console.log("  \u2705 Merged furnitureConfig from variant into base collection");}// Also use variant's patterns if they exist (for multi-res support)
if(variantCollection.patterns&&variantCollection.patterns.length>0){targetCollection.patterns=variantCollection.patterns;console.log("  \u2705 Using variant's patterns (".concat(variantCollection.patterns.length," patterns)"));}}else{console.log("  \u2139\uFE0F No furniture variant found for \"".concat(collectionName,"\" (tried: ").concat(variantNames.join(', '),")"));}}if(!targetCollection.patterns||targetCollection.patterns.length===0){console.warn("Collection \"".concat(collectionName,"\" has no patterns"));return;}// ✅ Preserve furniture scale BEFORE switching collections (for furniture mode)
var isFurnitureMode=window.COLORFLEX_MODE==='FURNITURE'||window.location.pathname.includes('furniture');var preservedFurnitureScale=null;if(isFurnitureMode&&appState.selectedFurnitureScale){preservedFurnitureScale=appState.selectedFurnitureScale;console.log("\uD83E\uDE91 Preserving furniture scale: ".concat(preservedFurnitureScale," before collection switch"));}// Set the collection
appState.selectedCollection=targetCollection;// Reset scale to 1X (normal) when switching collections
appState.scaleMultiplier=1;appState.currentScale=100;// Reset clothing scale if this is a clothing collection
if(targetCollection.name.includes('-clo')){appState.selectedClothingScale="1.0";console.log('👗 Reset clothing scale to 1.0X for new collection');}else{console.log('🔄 Scale reset to 1X (Normal) for new collection');}// Update scale button UI to reflect reset
var scaleButtons=document.querySelectorAll('.scale-button');scaleButtons.forEach(function(btn,index){// Index 2 is the "Normal" (1X) button in the scale options
if(index===2){btn.style.background='#d4af37';btn.style.color='#1a202c';}else{btn.style.background='rgba(110, 110, 110, 0.2)';btn.style.color='#d4af37';}});// Set data attribute for collection-specific styling
document.body.setAttribute('data-current-collection',targetCollection.name);// Update collection header (match both .clo and -clo formats)
var collectionHeader=document.getElementById('collectionHeader');if(collectionHeader){if(targetCollection.name.includes('-clo')){var collectionBaseName=targetCollection.name.split('.')[0];collectionHeader.innerHTML="".concat(collectionBaseName.toUpperCase(),"<br>CLOTHING");}else{collectionHeader.textContent=targetCollection.name.toUpperCase();}}// Clear curated colors if switching to standard collection (no ColorFlex patterns)
var hasColorFlexPatterns=(_targetCollection$pat=targetCollection.patterns)===null||_targetCollection$pat===void 0?void 0:_targetCollection$pat.some(function(p){return p.colorFlex===true;});if(!hasColorFlexPatterns){console.log('🧹 Clearing curated colors for standard collection');var curatedColorsContainer=document.getElementById('curatedColorsContainer');if(curatedColorsContainer){curatedColorsContainer.innerHTML='';}appState.curatedColors=[];}// Populate thumbnails for new collection
populatePatternThumbnails(targetCollection.patterns);// ✅ FIX: Ensure container stays 800x600 in furniture simple mode after switching collections
var isFurnitureSimpleModeForSize=window.COLORFLEX_SIMPLE_MODE===true&&window.COLORFLEX_MODE==='FURNITURE';if(isFurnitureSimpleModeForSize&&dom.roomMockup){dom.roomMockup.style.setProperty('width','800px','important');dom.roomMockup.style.setProperty('height','600px','important');console.log("✅ Simple mode: Forced roomMockup to 800x600 after collection switch");// Also set it after a delay to override any code that runs later
setTimeout(function(){if(dom.roomMockup){dom.roomMockup.style.setProperty('width','800px','important');dom.roomMockup.style.setProperty('height','600px','important');console.log("✅ Simple mode: Forced roomMockup to 800x600 after collection switch (delayed)");}},100);}// ✅ Restore furniture scale after collection switch (if it was preserved)
if(isFurnitureMode&&preservedFurnitureScale){appState.selectedFurnitureScale=preservedFurnitureScale;console.log("\uD83E\uDE91 Restored furniture scale: ".concat(preservedFurnitureScale," after collection switch"));// Update scale display if it exists
var scaleDisplay=document.getElementById('furnitureScaleDisplay');if(scaleDisplay){scaleDisplay.textContent="".concat(preservedFurnitureScale,"X");}}// Load the first pattern in the collection
var firstPattern=targetCollection.patterns[0];if(firstPattern){loadPatternData(targetCollection,firstPattern.id||firstPattern.name);}console.log("\u2705 Switched to collection: ".concat(collectionName));};// Garment selector function
window.selectGarment=function(garmentType){console.log("\uD83D\uDC57 Selecting garment: ".concat(garmentType));// Update appState
appState.selectedGarment=garmentType;// Update button states
var buttons=document.querySelectorAll('.garment-button');buttons.forEach(function(btn){var btnGarment=btn.getAttribute('data-garment');if(btnGarment===garmentType){btn.style.background='#4a90e2';btn.style.color='white';}else{btn.style.background='#e2e8f0';btn.style.color='#2d3748';}});// Reload current pattern with new garment
if(appState.currentPattern&&appState.selectedCollection){loadPatternData(appState.selectedCollection,appState.currentPattern.slug||appState.currentPattern.name);}console.log("\u2705 Switched to ".concat(garmentType));};// Furniture selector function (similar to garment selector)
window.selectFurniture=function(furnitureType){console.log("\uD83E\uDE91 Selecting furniture: ".concat(furnitureType));// Update appState
appState.selectedFurnitureType=furnitureType;// Update button states
var buttons=document.querySelectorAll('.furniture-button');buttons.forEach(function(btn){var btnFurniture=btn.getAttribute('data-furniture');if(btnFurniture===furnitureType){btn.style.background='#8b4513';btn.style.color='white';}else{btn.style.background='#e2e8f0';btn.style.color='#2d3748';}});// Reload current pattern with new furniture
if(appState.currentPattern&&appState.selectedCollection){loadPatternData(appState.selectedCollection,appState.currentPattern.slug||appState.currentPattern.name);}console.log("\u2705 Switched to ".concat(furnitureType));};// Clothing scale increment/decrement functions
window.incrementClothingScale=function(){var availableScales=["0.5","1.0","1.25","1.5","2.0"];var currentScale=appState.selectedClothingScale||"1.0";var currentIndex=availableScales.indexOf(currentScale);if(currentIndex<availableScales.length-1){// Save zoom before scale change
var existingCanvas=document.querySelector('#roomMockup canvas');if(existingCanvas&&existingCanvas.dataset.zoomScale){appState.savedZoomScale=parseFloat(existingCanvas.dataset.zoomScale);console.log("\uD83D\uDD0D Zoom persistence: Saved zoom ".concat(appState.savedZoomScale*100,"% before scale increment"));}var newScale=availableScales[currentIndex+1];appState.selectedClothingScale=newScale;// Update display
var display=document.getElementById('currentScaleDisplay');if(display){display.textContent=newScale+'X';}console.log("\u2795 Incremented clothing scale to ".concat(newScale,"X"));// Reload current pattern with new scale
if(appState.currentPattern&&appState.selectedCollection){loadPatternData(appState.selectedCollection,appState.currentPattern.slug||appState.currentPattern.name);}}else{console.log('⚠️ Already at maximum scale (2.0X)');}};window.decrementClothingScale=function(){var availableScales=["0.5","1.0","1.25","1.5","2.0"];var currentScale=appState.selectedClothingScale||"1.0";var currentIndex=availableScales.indexOf(currentScale);if(currentIndex>0){// Save zoom before scale change
var existingCanvas=document.querySelector('#roomMockup canvas');if(existingCanvas&&existingCanvas.dataset.zoomScale){appState.savedZoomScale=parseFloat(existingCanvas.dataset.zoomScale);console.log("\uD83D\uDD0D Zoom persistence: Saved zoom ".concat(appState.savedZoomScale*100,"% before scale decrement"));}var newScale=availableScales[currentIndex-1];appState.selectedClothingScale=newScale;// Update display
var display=document.getElementById('currentScaleDisplay');if(display){display.textContent=newScale+'X';}console.log("\u2796 Decremented clothing scale to ".concat(newScale,"X"));// Reload current pattern with new scale
if(appState.currentPattern&&appState.selectedCollection){loadPatternData(appState.selectedCollection,appState.currentPattern.slug||appState.currentPattern.name);}}else{console.log('⚠️ Already at minimum scale (0.5X)');}};// Fabric Specifications Database (from Airtable data)
var FABRIC_SPECIFICATIONS={'SOFT VELVET':{pricePerYard:29.00,width:'58"',minimumYards:5,description:'Luxurious soft velvet with rich texture',material:'fabric'},'DECORATOR LINEN':{pricePerYard:29.00,width:'56"',minimumYards:5,description:'Premium decorator linen for upholstery',material:'fabric'},'DRAPERY SHEER':{pricePerYard:24.00,width:'56"',minimumYards:5,description:'Lightweight sheer fabric for window treatments',material:'fabric'},'LIGHTWEIGHT LINEN':{pricePerYard:26.00,width:'62"',minimumYards:5,description:'Versatile lightweight linen fabric',material:'fabric'},'FAUX SUEDE':{pricePerYard:36.00,width:'58"',minimumYards:5,description:'Premium faux suede with authentic texture',material:'fabric'},'DRAPERY LIGHT BLOCK':{pricePerYard:31.00,width:'56"',minimumYards:5,description:'Light-blocking drapery fabric',material:'fabric'},'WALLPAPER':{pricePerRoll:89.99,coverage:'56 sq ft',minimumRolls:1,description:'Professional-grade removable wallpaper',material:'wallpaper'}};/**
 * Displays material selection modal for pattern cart configuration
 *
 * Shows an interactive modal dialog allowing users to choose between
 * wallpaper and fabric materials before proceeding to the product
 * configuration page. Features accordion-style material categories,
 * detailed pricing, and material specifications with guided links.
 *
 * Modal Features:
 * - Accordion sections: Wallpaper (4 options) and Fabric (6 options)
 * - Material details: Price, dimensions, minimums, descriptions
 * - Link to full material specifications page
 * - Smart cart handling: Standard add vs cart item update
 * - Responsive design with hover effects
 * - Default selection: Prepasted Wallpaper
 *
 * Wallpaper Options (24" wide):
 * - Prepasted Wallpaper: $180/roll, 30' long, 2-week turnaround
 * - Peel & Stick: $320/roll, 27' long, removable
 * - Unpasted: $180/roll, 30' long, professional grade
 * - Grasscloth: Contact pricing, 27' long, natural material
 *
 * Fabric Options (5-yard minimum):
 * - Soft Velvet: $29/yard, 58" wide, luxurious texture
 * - Decorator Linen: $29/yard, 56" wide, upholstery grade
 * - Drapery Sheer: $24/yard, 56" wide, lightweight
 * - Lightweight Linen: $26/yard, 62" wide, versatile
 * - Faux Suede: $36/yard, 58" wide, premium texture
 * - Drapery Light Block: $31/yard, 56" wide, light blocking
 *
 * User Flow:
 * 1. User saves/creates pattern in ColorFlex
 * 2. Clicks "Proceed to Cart" button
 * 3. Modal displays with material options
 * 4. User selects material (wallpaper or fabric)
 * 5. Clicks "Proceed to Cart"
 * 6. Redirected to product page with pattern data
 *
 * Cart Update Flow (from cart edit):
 * 1. User clicks "Edit" on cart item
 * 2. ColorFlex loads with pattern
 * 3. User modifies colors/scale
 * 4. Modal shows "Update Cart Item" button
 * 5. Clicking updates existing cart item
 *
 * @param {Object} pattern - Pattern object to configure
 * @param {string} pattern.patternName - Pattern name
 * @param {string} pattern.collectionName - Collection name
 * @param {Array<Object>} pattern.colors - Layer colors
 * @param {number} [pattern.currentScale=100] - Scale percentage
 * @param {number} [pattern.scaleMultiplier=1.0] - Scale multiplier
 * @returns {void} No return value (displays modal as side effect)
 *
 * @example
 * // Show modal for new pattern
 * const pattern = {
 *   patternName: 'Tudor Rose',
 *   collectionName: 'English Cottage',
 *   colors: [{label: 'Background', color: 'SW7006 Eider White'}],
 *   currentScale: 100,
 *   scaleMultiplier: 1.0
 * };
 *
 * showMaterialSelectionModal(pattern);
 * // Modal displays with wallpaper/fabric options
 * // User selects material and proceeds to cart
 *
 * @example
 * // Cart update workflow
 * // URL: ?source=cart_edit
 * showMaterialSelectionModal(pattern);
 * // Modal button shows "Update Cart Item"
 * // Clicking updates existing cart item instead of adding new
 *
 * ⚠️ IMPORTANT: Material selection required before cart/product page
 *
 * 🎨 UI: Accordion design with collapse/expand for wallpaper and fabric
 *
 * 🔗 GUIDE: Links to /pages/materials-specifications for detailed info
 *
 * 💰 PRICING: All prices displayed, Contact pricing for grasscloth
 *
 * 🛒 CART MODES: Standard add vs cart item update based on URL source
 *
 * @see redirectToProductConfiguration - Handles redirect after selection
 * @see updateCartItemViaAPI - Updates existing cart items
 * @see getMaterialDisplayName - Gets user-friendly material names
 */function showMaterialSelectionModal(pattern){console.log('🎄 showMaterialSelectionModal called - promo section will be added');// Remove existing modal if present
var existingModal=document.getElementById('materialSelectionModal');if(existingModal){existingModal.remove();}// Create modal overlay
var modal=document.createElement('div');modal.id='materialSelectionModal';modal.style.cssText="\n        position: fixed;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n        background: rgba(0, 0, 0, 0.8);\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        z-index: 10000;\n        font-family: 'Special Elite', monospace;\n    ";// Create modal content
var modalContent=document.createElement('div');modalContent.style.cssText="\n        background: #1a202c;\n        color: #e2e8f0;\n        padding: 30px;\n        border-radius: 12px;\n        width: 90%;\n        max-width: 500px;\n        max-height: 80vh;\n        overflow-y: auto;\n        border: 2px solid #4a5568;\n        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);\n    ";// Modal header
var header=document.createElement('div');header.style.cssText='margin-bottom: 20px; text-align: center;';header.innerHTML="\n        <h3 style=\"margin: 0 0 10px 0; color: #d4af37; font-size: 18px;\">\uD83D\uDED2 Proceed to Cart</h3>\n        <p style=\"margin: 0; color: #a0aec0; font-size: 14px;\">\n            Choose material and configure options for: <strong style=\"color: #e2e8f0;\">".concat(pattern.patternName,"</strong><br>\n            <span style=\"font-size: 12px; color: #718096;\">You'll be able to select quantity, dimensions, and other options on the product page.</span>\n        </p>\n    ");// Material selection section with accordion
var materialSection=document.createElement('div');materialSection.style.cssText='margin-bottom: 25px;';var materialLabel=document.createElement('label');materialLabel.style.cssText='display: block; margin-bottom: 8px; color: #d4af37; font-weight: bold;';materialLabel.textContent='Select Material:';// 🎉 PROMO CODE SECTION
// var promoSection = document.createElement('div');
// promoSection.style.cssText = 'margin-bottom: 20px; padding: 16px; background: linear-gradient(135deg, #fff9e6 0%, #fff3cc 100%); border: 2px solid #d4af37; border-radius: 10px; box-shadow: 0 2px 8px rgba(212,175,55,0.2);';
// promoSection.innerHTML = `
//     <div style="text-align: center; margin-bottom: 12px;">
//         <div style="font-size: 20px; margin-bottom: 4px;">🎄✨</div>
//         <h4 style="margin: 0; color: #8b6914; font-size: 16px; font-weight: bold;">
//             Holiday Special: 25% Off Your First Roll!
//         </h4>
//     </div>
//     <div style="display: flex; gap: 8px; margin-bottom: 8px;">
//         <input
//             type="text"
//             id="cfm-promo-input"
//             placeholder="Enter code: FIRSTROLL25"
//             style="
//                 flex: 1;
//                 padding: 10px 12px;
//                 border: 2px solid #d4af37;
//                 border-radius: 6px;
//                 font-size: 14px;
//                 background: white;
//                 color: #333;
//                 font-family: 'Special Elite', monospace;
//             "
//         />
//         <button
//             id="cfm-promo-apply-btn"
//             style="
//                 padding: 10px 20px;
//                 background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
//                 color: white;
//                 border: none;
//                 border-radius: 6px;
//                 font-weight: bold;
//                 cursor: pointer;
//                 white-space: nowrap;
//                 font-size: 14px;
//                 font-family: 'Special Elite', monospace;
//                 transition: transform 0.2s;
//             "
//         >Apply</button>
//     </div>
//     <div id="cfm-promo-feedback" style="display: none; padding: 10px; border-radius: 6px; font-size: 13px; font-weight: 500; text-align: center; margin-top: 8px;"></div>
// `;
// Add helper link after promo section
var materialGuide=document.createElement('div');materialGuide.style.cssText='margin-bottom: 15px; padding: 8px 12px; background: #2d3748; border-left: 3px solid #d4af37; border-radius: 4px;';materialGuide.innerHTML="\n        <p style=\"margin: 0; color: #a0aec0; font-size: 12px; line-height: 1.4;\">\n            Need help choosing? <a href=\"/pages/materials-specifications\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color: #d4af37; text-decoration: underline;\">View full material specifications & installation guides</a>\n        </p>\n    ";// ✅ FIX: Prevent link click from bubbling up and closing modal
setTimeout(function(){var materialsLink=materialGuide.querySelector('a');if(materialsLink){materialsLink.addEventListener('click',function(e){e.stopPropagation();console.log('🔗 Opening materials page in new tab (modal will stay open)');});}// 🎫 PROMO CODE VALIDATION
// ✅ FIX: Promo section is commented out, so skip validation code
// Only run if promo elements actually exist in the DOM
var promoInput=document.getElementById('cfm-promo-input');var promoBtn=document.getElementById('cfm-promo-apply-btn');var promoFeedback=document.getElementById('cfm-promo-feedback');// Skip promo code validation if elements don't exist (promo section is commented out)
if(!promoInput||!promoBtn||!promoFeedback){console.log('🎄 Promo section not active - skipping promo code validation');return;// Exit early if promo elements don't exist
}console.log('🎄 Looking for promo elements:',{input:promoInput?'Found':'Missing',button:promoBtn?'Found':'Missing',feedback:promoFeedback?'Found':'Missing'});if(promoBtn&&promoInput&&promoFeedback){promoBtn.addEventListener('click',function(){var code=promoInput.value.trim().toUpperCase();console.log('🎫 Validating promo code:',code);// Check if already used
if(sessionStorage.getItem('cfm_promo_used')==='true'){promoFeedback.textContent='⚠️ Promo code already used this session';promoFeedback.style.display='block';promoFeedback.style.background='#fff3cd';promoFeedback.style.color='#856404';promoFeedback.style.border='1px solid #ffeaa7';return;}// Validate code
if(code==='FIRSTROLL25'){sessionStorage.setItem('cfm_promo_code',code);sessionStorage.setItem('cfm_promo_used','true');promoFeedback.textContent='✅ 25% discount applied! Proceed to cart to complete your order.';promoFeedback.style.display='block';promoFeedback.style.background='#d4edda';promoFeedback.style.color='#155724';promoFeedback.style.border='1px solid #c3e6cb';promoInput.disabled=true;promoInput.style.background='#e6f7ed';promoBtn.disabled=true;promoBtn.style.opacity='0.6';promoBtn.style.cursor='not-allowed';console.log('✅ Promo code applied successfully');}else if(code===''){promoFeedback.textContent='⚠️ Please enter a promo code';promoFeedback.style.display='block';promoFeedback.style.background='#fff3cd';promoFeedback.style.color='#856404';promoFeedback.style.border='1px solid #ffeaa7';}else{promoFeedback.textContent='❌ Invalid promo code';promoFeedback.style.display='block';promoFeedback.style.background='#f8d7da';promoFeedback.style.color='#721c24';promoFeedback.style.border='1px solid #f5c6cb';}});// Check if promo already applied
if(sessionStorage.getItem('cfm_promo_used')==='true'){promoInput.value=sessionStorage.getItem('cfm_promo_code')||'FIRSTROLL25';promoInput.disabled=true;promoInput.style.background='#e6f7ed';promoBtn.disabled=true;promoBtn.style.opacity='0.6';promoFeedback.textContent='✅ 25% discount applied!';promoFeedback.style.display='block';promoFeedback.style.background='#d4edda';promoFeedback.style.color='#155724';promoFeedback.style.border='1px solid #c3e6cb';}}},100);// Group materials by category
var wallpaperOptions=[{value:'wallpaper-prepasted',label:'Prepasted Wallpaper',price:'$180/roll',description:'Finest quality paper 24" wide x 30\' long • Custom-printed • 2-week turnaround'},{value:'wallpaper-peel-stick',label:'Peel & Stick Wallpaper',price:'$320/roll',description:'24" wide x 27\' long • Easily removable • Perfect for apartments'},{value:'wallpaper-unpasted',label:'Unpasted Wallpaper',price:'$180/roll',description:'Highest quality • 24" wide x 30\' long • NO ADHESIVE • Preferred by professionals'},{value:'wallpaper-grasscloth',label:'Grasscloth Wallpaper',price:'Contact for pricing',description:'Natural Grass Cloth • 24" wide x 27\' long • Quietly elevates any space'}];var fabricOptions=[{value:'fabric-soft-velvet',label:'Soft Velvet',price:'$29/yard',description:'Luxurious soft velvet with rich texture • 58" width • 5-yard minimum'},{value:'fabric-decorator-linen',label:'Decorator Linen',price:'$29/yard',description:'Premium decorator linen for upholstery • 56" width • 5-yard minimum'},{value:'fabric-drapery-sheer',label:'Drapery Sheer',price:'$24/yard',description:'Lightweight sheer fabric for window treatments • 56" width • 5-yard minimum'},{value:'fabric-lightweight-linen',label:'Lightweight Linen',price:'$26/yard',description:'Versatile lightweight linen fabric • 62" width • 5-yard minimum'},{value:'fabric-faux-suede',label:'Faux Suede',price:'$36/yard',description:'Premium faux suede with authentic texture • 58" width • 5-yard minimum'},{value:'fabric-drapery-light-block',label:'Drapery Light Block',price:'$31/yard',description:'Light-blocking drapery fabric • 56" width • 5-yard minimum'}];// Create accordion container
var accordionContainer=document.createElement('div');accordionContainer.style.cssText='display: flex; flex-direction: column; gap: 10px;';// Helper function to create accordion section
function createAccordionSection(title,icon,options,isOpen){var section=document.createElement('div');section.style.cssText='border: 2px solid #4a5568; border-radius: 8px; overflow: hidden;';// Accordion header
var header=document.createElement('div');header.style.cssText="\n            background: #2d3748;\n            padding: 15px;\n            cursor: pointer;\n            display: flex;\n            justify-content: space-between;\n            align-items: center;\n            transition: background 0.3s ease;\n        ";var headerText=document.createElement('span');headerText.style.cssText='color: #d4af37; font-weight: bold; font-size: 16px;';headerText.textContent=icon+' '+title;var arrow=document.createElement('span');arrow.style.cssText='color: #d4af37; transition: transform 0.3s ease;';arrow.textContent=isOpen?'▼':'▶';header.appendChild(headerText);header.appendChild(arrow);// Accordion content
var content=document.createElement('div');content.style.cssText="\n            max-height: ".concat(isOpen?'1000px':'0',";\n            overflow: hidden;\n            transition: max-height 0.3s ease;\n            background: #1a202c;\n        ");var optionsContainer=document.createElement('div');optionsContainer.style.cssText='padding: 10px; display: flex; flex-direction: column; gap: 8px;';// Add options
options.forEach(function(option,index){var optionDiv=document.createElement('div');optionDiv.style.cssText="\n                border: 1px solid #4a5568;\n                border-radius: 6px;\n                padding: 12px;\n                cursor: pointer;\n                transition: all 0.3s ease;\n                background: #2d3748;\n            ";var radio=document.createElement('input');radio.type='radio';radio.name='material';radio.value=option.value;radio.id='material_'+option.value;radio.style.cssText='margin-right: 10px;';// Default to first wallpaper option
if(title==='Wallpaper'&&index===0){radio.checked=true;}var label=document.createElement('label');label.htmlFor='material_'+option.value;label.style.cssText='cursor: pointer; display: flex; justify-content: space-between; align-items: center; width: 100%;';label.innerHTML="\n                <span style=\"font-weight: bold; color: #e2e8f0;\">".concat(option.label,"</span>\n                <span style=\"color: #d4af37; font-size: 14px;\">").concat(option.price,"</span>\n            ");optionDiv.appendChild(radio);optionDiv.appendChild(label);// Hover effects
optionDiv.addEventListener('mouseenter',function(){optionDiv.style.borderColor='#d4af37';optionDiv.style.background='#374151';});optionDiv.addEventListener('mouseleave',function(){if(!radio.checked){optionDiv.style.borderColor='#4a5568';optionDiv.style.background='#2d3748';}});// Click to select
optionDiv.addEventListener('click',function(e){if(e.target!==radio){radio.checked=true;}// Update all option styles
accordionContainer.querySelectorAll('input[type="radio"]').forEach(function(r){var container=r.closest('div[style*="border: 1px"]');if(container){if(r.checked){container.style.borderColor='#d4af37';container.style.background='#374151';}else{container.style.borderColor='#4a5568';container.style.background='#2d3748';}}});});optionsContainer.appendChild(optionDiv);});content.appendChild(optionsContainer);// Toggle accordion
header.addEventListener('click',function(){var isCurrentlyOpen=content.style.maxHeight!=='0px';if(isCurrentlyOpen){content.style.maxHeight='0';arrow.textContent='▶';}else{content.style.maxHeight='1000px';arrow.textContent='▼';}});header.addEventListener('mouseenter',function(){header.style.background='#374151';});header.addEventListener('mouseleave',function(){header.style.background='#2d3748';});section.appendChild(header);section.appendChild(content);return section;}// Create wallpaper and fabric sections (both collapsed by default)
var wallpaperSection=createAccordionSection('Wallpaper','🗂️',wallpaperOptions,false);var fabricSection=createAccordionSection('Fabric','🧵',fabricOptions,false);accordionContainer.appendChild(wallpaperSection);accordionContainer.appendChild(fabricSection);materialSection.appendChild(materialLabel);// ✅ FIX: promoSection is commented out, so don't try to append it
// materialSection.appendChild(promoSection);
materialSection.appendChild(materialGuide);materialSection.appendChild(accordionContainer);// Button section
var buttonSection=document.createElement('div');buttonSection.style.cssText='display: flex; gap: 12px; justify-content: flex-end; margin-top: 25px;';// Cancel button
var cancelBtn=document.createElement('button');cancelBtn.textContent='❌ Cancel';cancelBtn.style.cssText="\n        background: transparent;\n        color: #f56565;\n        border: 2px solid #f56565;\n        padding: 10px 16px;\n        border-radius: 6px;\n        cursor: pointer;\n        font-family: 'Special Elite', monospace;\n        font-weight: bold;\n        transition: all 0.3s ease;\n    ";cancelBtn.addEventListener('mouseenter',function(){cancelBtn.style.background='#f56565';cancelBtn.style.color='white';});cancelBtn.addEventListener('mouseleave',function(){cancelBtn.style.background='transparent';cancelBtn.style.color='#f56565';});cancelBtn.addEventListener('click',function(){modal.remove();});// Check if we came from cart editing
var urlParams=new URLSearchParams(window.location.search);var isFromCartEdit=urlParams.get('source')==='cart_edit'||urlParams.get('source')==='cart_restore';// Proceed to Cart button (replaces direct cart add)
var configureBtn=document.createElement('button');configureBtn.textContent=isFromCartEdit?'🔄 Update Cart Item':'🛒 Proceed to Cart';configureBtn.style.cssText="\n        background: linear-gradient(135deg, ".concat(isFromCartEdit?'#d4af37 0%, #b8941f 100%':'#667eea 0%, #764ba2 100%',");\n        color: white;\n        border: none;\n        padding: 10px 16px;\n        border-radius: 6px;\n        cursor: pointer;\n        font-family: 'Special Elite', monospace;\n        font-weight: bold;\n        transition: all 0.3s ease;\n    ");configureBtn.addEventListener('mouseenter',function(){configureBtn.style.transform='translateY(-2px)';configureBtn.style.boxShadow="0 4px 12px rgba(".concat(isFromCartEdit?'212, 175, 55':'102, 126, 234',", 0.4)");});configureBtn.addEventListener('mouseleave',function(){configureBtn.style.transform='translateY(0)';configureBtn.style.boxShadow='none';});configureBtn.addEventListener('click',/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(){var selectedMaterialInput,selectedMaterial,_window$appState,_window$appState2,cartPatternKey,cartSavedPattern,updatedItemData,cartUpdateResult,updatedPattern,thumbnailKey,thumbnailInfo,smallerThumbnail,_t;return _regenerator().w(function(_context2){while(1)switch(_context2.p=_context2.n){case 0:console.log('🛒 Proceed to Cart clicked');// Check if material is selected
selectedMaterialInput=accordionContainer.querySelector('input[name="material"]:checked');if(selectedMaterialInput){_context2.n=1;break;}alert('⚠️ Please select a material type first');return _context2.a(2);case 1:selectedMaterial=selectedMaterialInput.value;console.log('✅ Selected material:',selectedMaterial);if(!isFromCartEdit){_context2.n=9;break;}// Handle cart item update
console.log('🔄 Updating cart item with new pattern configuration...');_context2.p=2;// Show loading state
configureBtn.disabled=true;configureBtn.textContent='🔄 Updating...';// Get cart item data from localStorage (stored by cart restoration)
cartPatternKey="cart_saved_".concat(pattern.patternName,"_").concat(pattern.collectionName);cartSavedPattern=localStorage.getItem(cartPatternKey);if(cartSavedPattern){_context2.n=3;break;}throw new Error('Could not find original cart item data');case 3:// Build updated item data
updatedItemData={pattern:pattern.patternName,collectionName:pattern.collectionName,colors:pattern.colors||[],productType:selectedMaterial,productTypeName:getMaterialDisplayName(selectedMaterial),productPrice:getMaterialPrice(selectedMaterial),currentScale:pattern.currentScale||((_window$appState=window.appState)===null||_window$appState===void 0?void 0:_window$appState.currentScale)||100,scaleMultiplier:pattern.scaleMultiplier||((_window$appState2=window.appState)===null||_window$appState2===void 0?void 0:_window$appState2.scaleMultiplier)||1.0};// Update via Shopify cart API (simplified version)
_context2.n=4;return updateCartItemViaAPI(updatedItemData);case 4:cartUpdateResult=_context2.v;if(!cartUpdateResult.success){_context2.n=5;break;}// Update localStorage with new pattern
updatedPattern=_objectSpread(_objectSpread({},pattern),{},{source:'cart_update',timestamp:new Date().toISOString(),productType:selectedMaterial,currentScale:updatedItemData.currentScale,scaleMultiplier:updatedItemData.scaleMultiplier});// Store updated pattern
localStorage.setItem(cartPatternKey,JSON.stringify(updatedPattern));// Store thumbnail for cart display
if(pattern.thumbnail){thumbnailKey="cart_thumbnail_".concat(pattern.patternName,"_").concat(pattern.collectionName);thumbnailInfo={thumbnail:pattern.thumbnail,colors:pattern.colors,timestamp:new Date().toISOString(),source:'cart_update'};localStorage.setItem(thumbnailKey,JSON.stringify(thumbnailInfo));}// Show success message and redirect to cart
modal.remove();showSuccessNotification('✅ Cart item updated successfully! Redirecting to cart...');setTimeout(function(){window.location.href='/cart';},1500);_context2.n=6;break;case 5:throw new Error(cartUpdateResult.error||'Cart update failed');case 6:_context2.n=8;break;case 7:_context2.p=7;_t=_context2.v;console.error('❌ Error updating cart item:',_t);showErrorNotification('❌ Failed to update cart item. Please try again.');// Reset button
configureBtn.disabled=false;configureBtn.textContent='🔄 Update Cart Item';case 8:_context2.n=10;break;case 9:// Handle normal "Proceed to Cart" flow
console.log('🎯 Starting redirect flow for pattern:',pattern);// Store thumbnail in localStorage for the product page to use
if(pattern.thumbnail){try{// Clean up old saved patterns to free up space
cleanupLocalStorage();// Try to store the thumbnail
localStorage.setItem('colorflexCurrentThumbnail',pattern.thumbnail);console.log('🖼️ Stored thumbnail in localStorage for product page');}catch(quotaError){console.warn('⚠️ localStorage quota exceeded, trying with smaller thumbnail...');// Create a smaller, more compressed thumbnail as fallback
smallerThumbnail=createCompressedThumbnail(pattern.thumbnail);if(smallerThumbnail){try{localStorage.setItem('colorflexCurrentThumbnail',smallerThumbnail);console.log('🖼️ Stored compressed thumbnail in localStorage');}catch(stillTooLarge){console.error('❌ Even compressed thumbnail too large for localStorage');// Continue without thumbnail
}}}}try{console.log('📍 About to call redirectToProductConfiguration...');redirectToProductConfiguration(pattern,selectedMaterial);console.log('✅ redirectToProductConfiguration called successfully');modal.remove();}catch(error){console.error('❌ Error during redirect:',error);alert('Error redirecting to product page. Check console for details.');}case 10:return _context2.a(2);}},_callee2,null,[[2,7]]);})));buttonSection.appendChild(cancelBtn);buttonSection.appendChild(configureBtn);// Assemble modal
modalContent.appendChild(header);// ✅ FIX: promoSection is commented out, so don't try to append it
// modalContent.appendChild(promoSection);  // 🎄 ADD PROMO SECTION
modalContent.appendChild(materialGuide);// Add material guide link
modalContent.appendChild(materialSection);modalContent.appendChild(buttonSection);modal.appendChild(modalContent);// Close modal when clicking overlay
modal.addEventListener('click',function(e){if(e.target===modal){modal.remove();}});// Add to page
document.body.appendChild(modal);// Add escape key listener
function handleEscape(e){if(e.key==='Escape'){modal.remove();document.removeEventListener('keydown',handleEscape);}}document.addEventListener('keydown',handleEscape);}/**
 * Clean up localStorage to free up space for thumbnails
 */function cleanupLocalStorage(){try{// Clean up old saved patterns (keep only last 10)
// DON'T remove colorflexCurrentThumbnail or cart_thumbnail_* as they're needed for cart/product pages
var savedPatterns=JSON.parse(localStorage.getItem('colorflexSavedPatterns')||'[]');if(savedPatterns.length>10){// Sort by timestamp and keep only the most recent 10
savedPatterns.sort(function(a,b){return new Date(b.timestamp)-new Date(a.timestamp);});var recentPatterns=savedPatterns.slice(0,10);localStorage.setItem('colorflexSavedPatterns',JSON.stringify(recentPatterns));console.log("\uD83E\uDDF9 Cleaned up localStorage: kept ".concat(recentPatterns.length," most recent patterns"));}// Also clean up very old cart thumbnails (older than 30 days) to prevent infinite growth
var cartThumbnailKeys=Object.keys(localStorage).filter(function(key){return key.startsWith('cart_thumbnail_');});var thirtyDaysAgo=Date.now()-30*24*60*60*1000;cartThumbnailKeys.forEach(function(key){try{var data=JSON.parse(localStorage.getItem(key)||'{}');var timestamp=new Date(data.timestamp||0).getTime();if(timestamp<thirtyDaysAgo){localStorage.removeItem(key);console.log("\uD83E\uDDF9 Removed old cart thumbnail: ".concat(key));}}catch(error){// If we can't parse the thumbnail data, remove it
localStorage.removeItem(key);console.log("\uD83E\uDDF9 Removed malformed cart thumbnail: ".concat(key));}});}catch(error){console.warn('⚠️ Error during localStorage cleanup:',error);}}/**
 * Aggressive localStorage cleanup - removes non-essential data
 */function aggressiveLocalStorageCleanup(){try{console.log('🚨 Starting aggressive localStorage cleanup...');// Get storage usage before cleanup
var beforeSize=JSON.stringify(localStorage).length;// Keep essential items including cart thumbnails for long-term preservation
var essentialKeys=['colorflexSavedPatterns'];var essentialPrefixes=['cart_thumbnail_','colorflexCurrent'];// Protect cart thumbnails
var toRemove=[];var _loop2=function _loop2(){var key=localStorage.key(i);if(key&&!essentialKeys.includes(key)){// Check if key starts with any essential prefix
var isEssentialPrefix=essentialPrefixes.some(function(prefix){return key.startsWith(prefix);});if(!isEssentialPrefix){toRemove.push(key);}}};for(var i=0;i<localStorage.length;i++){_loop2();}// Remove non-essential items
toRemove.forEach(function(key){localStorage.removeItem(key);console.log("\uD83D\uDDD1\uFE0F Removed localStorage item: ".concat(key));});// Also clear saved patterns to start fresh (keep only thumbnails)
localStorage.removeItem('colorflexSavedPatterns');var afterSize=JSON.stringify(localStorage).length;console.log("\uD83E\uDDF9 Aggressive cleanup complete: ".concat(beforeSize," \u2192 ").concat(afterSize," bytes (").concat(Math.round((1-afterSize/beforeSize)*100),"% reduction)"));}catch(error){console.error('❌ Error during aggressive cleanup:',error);}}/**
 * Create a smaller, more compressed thumbnail for localStorage
 * @param {string} originalThumbnail - Base64 data URL of original thumbnail
 * @returns {string|null} Compressed thumbnail or null if failed
 */function createCompressedThumbnail(originalThumbnail){try{if(!originalThumbnail||!originalThumbnail.startsWith('data:image/')){console.log('🗜️ Invalid thumbnail format, skipping compression');return null;}// Create image and canvas for compression
var img=new Image();var canvas=document.createElement('canvas');var _ctx2=canvas.getContext('2d');// Set image source - for data URLs this loads synchronously
img.src=originalThumbnail;// Small delay to ensure image is fully loaded (even for data URLs)
// This is necessary for some browsers that don't load data URLs immediately
var maxWait=250;// 250ms max wait (increased from 50ms to prevent compression failures)
var startTime=Date.now();while(!img.complete&&Date.now()-startTime<maxWait){// Wait for image to load
}// Check if image loaded successfully
if(!img.complete&&img.naturalWidth===0){console.warn('🗜️ Image did not load in time, skipping compression');return null;}// Super aggressive compression - very small size and minimal quality
canvas.width=100;// Much smaller
canvas.height=100;// Much smaller
_ctx2.drawImage(img,0,0,100,100);// Maximum compression (10% quality)
var compressedDataUrl=canvas.toDataURL('image/jpeg',0.1);console.log('🗜️ Original size:',originalThumbnail.length,'Compressed size:',compressedDataUrl.length);// Return even if compression is modest - any reduction helps
if(compressedDataUrl.length<originalThumbnail.length*0.9){return compressedDataUrl;}console.log('🗜️ Compression did not reduce size significantly, returning null');return null;// Compression failed or not enough savings
}catch(error){console.error('❌ Failed to create compressed thumbnail:',error);return null;}}/**
 * Redirects to product configuration page with pattern and material data
 *
 * Initiates the ProductConfigurationFlow system to guide users through
 * the cart addition process. This function serves as the bridge between
 * the ColorFlex pattern customization interface and the Shopify cart
 * system, handling all necessary data transformation and storage.
 *
 * Flow Sequence:
 * 1. Validates ProductConfigurationFlow availability
 * 2. Retrieves material specifications (price, units, coverage)
 * 3. Builds cartItem object from pattern and material data
 * 4. Stores thumbnail in localStorage for product page display
 * 5. Initializes ProductConfigurationFlow if needed
 * 6. Calls interceptAddToCart() to start multi-step configuration
 * 7. Falls back to direct redirect if flow unavailable
 *
 * CartItem Structure Created:
 * - pattern: Complete pattern data (name, colors, scale, thumbnail)
 * - category: Material category ('wallpaper' or 'fabric')
 * - preferredMaterial: Selected material ID
 * - materialInfo: Specifications (price, unit, minimum, width, coverage)
 *
 * Material Data Retrieval:
 * - getFabricSpecByMaterialId(): Returns material specifications object
 * - getMaterialDisplayName(): Returns user-friendly material name
 * - getMaterialPrice(): Returns price per unit (roll or yard)
 *
 * LocalStorage Usage:
 * - Key: 'colorflexCurrentThumbnail'
 * - Value: Base64 JPEG thumbnail (800x800px, ~50-100KB)
 * - Purpose: Display pattern preview on product configuration page
 * - Cleanup: Should be removed after product page loads thumbnail
 *
 * Fallback Behavior:
 * - Triggers when ProductConfigurationFlow undefined or errors occur
 * - Uses fallbackDirectRedirect() for direct navigation to product page
 * - Redirects to /products/custom-wallpaper or /products/custom-fabric
 * - Passes pattern data via URL parameters
 * - Less robust than ProductConfigurationFlow but maintains functionality
 *
 * @param {Object} pattern - Saved pattern object from appState or localStorage
 * @param {string} pattern.name - Pattern name (e.g., "Tudor Rose")
 * @param {string} pattern.patternName - Alternative pattern name field
 * @param {string} pattern.collection - Collection name (e.g., "English Cottage")
 * @param {string} pattern.collectionName - Alternative collection field
 * @param {string} pattern.id - Pattern ID with SW numbers (e.g., "SW7006-SW6258-tudor-rose")
 * @param {Array<Object>} pattern.colors - Layer color assignments
 * @param {string} pattern.colors[].label - Layer label (e.g., "Background")
 * @param {string} pattern.colors[].color - SW color name (e.g., "SW7006 Eider White")
 * @param {string} pattern.thumbnail - Base64 JPEG thumbnail data
 * @param {number} [pattern.currentScale=100] - Scale percentage (50, 100, 200, 300, 400)
 * @param {number} [pattern.scaleMultiplier=1.0] - Scale multiplier (0.5, 1.0, 2.0, 3.0, 4.0)
 * @param {string} [pattern.patternSize] - Pattern size in inches (e.g., "24x24")
 * @param {string} [pattern.tilingType] - Tiling type (e.g., "half-drop", "standard")
 * @param {string} [pattern.timestamp] - Save timestamp ISO string
 * @param {string} material - Material ID (e.g., "wallpaper-prepasted", "fabric-decorator-linen")
 * @returns {void} No return value (redirects to product page or shows error notification)
 *
 * @example
 * // Normal flow with ProductConfigurationFlow
 * const pattern = {
 *   name: 'Tudor Rose',
 *   collection: 'English Cottage',
 *   id: 'SW7006-SW6258-tudor-rose',
 *   colors: [
 *     {label: 'Background', color: 'SW7006 Eider White'},
 *     {label: 'Accent', color: 'SW6258 Tricorn Black'}
 *   ],
 *   thumbnail: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
 *   currentScale: 200,
 *   scaleMultiplier: 2.0
 * };
 *
 * redirectToProductConfiguration(pattern, 'wallpaper-prepasted');
 * // Console: ⚙️ Starting ProductConfigurationFlow...
 * // Console: 🎯 Using ProductConfigurationFlow.interceptAddToCart()
 * // Result: ProductConfigurationFlow modal displays with pattern preview
 *
 * @example
 * // Fallback flow when ProductConfigurationFlow unavailable
 * window.ProductConfigurationFlow = undefined; // Simulate unavailable
 * redirectToProductConfiguration(pattern, 'fabric-decorator-linen');
 * // Console: ❌ ProductConfigurationFlow not found - falling back to direct redirect
 * // Console: 🔄 Using fallback direct redirect to Custom Wallpaper/Custom Fabric
 * // Result: Redirects to /products/custom-fabric?pattern_name=Tudor+Rose&...
 *
 * @example
 * // Error handling
 * const invalidPattern = {name: 'Test'}; // Missing required fields
 * redirectToProductConfiguration(invalidPattern, 'wallpaper-prepasted');
 * // Console: ❌ Error starting ProductConfigurationFlow: [error details]
 * // Notification: ❌ Error starting configuration
 * // Result: Falls back to direct redirect with available data
 *
 * ⚠️ IMPORTANT: Requires ProductConfigurationFlow.js loaded on page
 *
 * 🔧 FALLBACK: Uses direct redirect if ProductConfigurationFlow unavailable
 *
 * 💾 STORAGE: Stores thumbnail in localStorage for product page display
 *
 * 🎯 FLOW: ProductConfigurationFlow provides multi-step cart configuration
 *
 * 📦 CART ITEM: Preserves all pattern data for cart line item properties
 *
 * 🛒 MATERIALS: Supports all wallpaper and fabric material IDs
 *
 * @see showMaterialSelectionModal - Displays material selection before calling this
 * @see fallbackDirectRedirect - Fallback function for direct product redirect
 * @see getFabricSpecByMaterialId - Retrieves material specifications
 * @see getMaterialDisplayName - Gets user-friendly material names
 * @see getMaterialPrice - Gets material pricing information
 * @see window.ProductConfigurationFlow - External configuration flow system
 */function redirectToProductConfiguration(pattern,material){try{console.log('⚙️ Starting ProductConfigurationFlow for:',pattern.patternName,'Material:',material);// Show loading notification
showSaveNotification('🔄 Starting configuration flow...');// Check if ProductConfigurationFlow is available
if(typeof window.ProductConfigurationFlow==='undefined'){console.error('❌ ProductConfigurationFlow not found - falling back to direct redirect');return fallbackDirectRedirect(pattern,material);}// 🎄 CHECK FOR PROMO CODE IN SESSIONSTORAGE
var promoCode=sessionStorage.getItem('cfm_promo_code');var promoUsed=sessionStorage.getItem('cfm_promo_used')==='true';var hasPromo=false;console.log('🎫 Checking for promo code:',{promoCode:promoCode,promoUsed:promoUsed});if(promoCode&&promoUsed&&promoCode.toUpperCase()==='FIRSTROLL25'){hasPromo=true;console.log('🎉 PROMO: Found valid promo code in sessionStorage');showSaveNotification('🎉 25% discount will be applied!');}// Use ProductConfigurationFlow for proper multi-step flow
console.log('🎯 Using ProductConfigurationFlow.interceptAddToCart()');// Get material specifications for pricing
var materialSpec=getFabricSpecByMaterialId(material);var materialDisplayName=getMaterialDisplayName(material);var materialPrice=getMaterialPrice(material);// Use the exact saved pattern data structure (no reconstruction needed)
var cartItem={pattern:{// Use saved pattern field names exactly
name:pattern.name||pattern.patternName,// Saved patterns use 'name'
patternName:pattern.name||pattern.patternName,// Fallback for compatibility
collection:pattern.collection||pattern.collectionName||'',// Saved patterns use 'collection'
id:pattern.id,// Already correct format with SW numbers
colors:pattern.colors||[],// Already correct array format
thumbnail:pattern.thumbnail,// Already base64 image data
saveDate:pattern.timestamp||pattern.saveDate||new Date().toISOString(),patternSize:pattern.patternSize||'',tilingType:pattern.tilingType||'',// Include scaling data if available
currentScale:pattern.currentScale||100,scaleMultiplier:pattern.scaleMultiplier||1.0},category:material,// 'wallpaper' or 'fabric'
preferredMaterial:material,materialInfo:{materialId:material,displayName:materialDisplayName,price:materialPrice,unit:(materialSpec===null||materialSpec===void 0?void 0:materialSpec.material)==='fabric'?'yards':'rolls',minimum:(materialSpec===null||materialSpec===void 0?void 0:materialSpec.material)==='fabric'?materialSpec.minimumYards:(materialSpec===null||materialSpec===void 0?void 0:materialSpec.minimumRolls)||1,pricePerUnit:(materialSpec===null||materialSpec===void 0?void 0:materialSpec.pricePerYard)||(materialSpec===null||materialSpec===void 0?void 0:materialSpec.pricePerRoll)||89.99,width:(materialSpec===null||materialSpec===void 0?void 0:materialSpec.width)||'',coverage:(materialSpec===null||materialSpec===void 0?void 0:materialSpec.coverage)||'',description:(materialSpec===null||materialSpec===void 0?void 0:materialSpec.description)||''}};// Store thumbnail in localStorage for product page display
if(pattern.thumbnail){try{console.log('🖼️ Storing pattern thumbnail for product page display');localStorage.setItem('colorflexCurrentThumbnail',pattern.thumbnail);}catch(error){console.warn('⚠️ Failed to store thumbnail in localStorage:',error);}}// Initialize ProductConfigurationFlow if needed
if(!window.configFlow){console.log('🔧 Initializing ProductConfigurationFlow...');window.configFlow=new window.ProductConfigurationFlow();}// 🎄 APPLY PROMO CODE TO PRODUCTCONFIGURATIONFLOW STATE
if(hasPromo){console.log('🎉 PROMO: Setting promo code on ProductConfigurationFlow state');window.configFlow.state.promoCode=promoCode;window.configFlow.state.promoApplied=true;window.configFlow.state.promoUsed=true;console.log('✅ PROMO: State updated with FIRSTROLL25 discount');}// Start the configuration flow
console.log('🚀 Starting configuration flow with data:',cartItem);window.configFlow.interceptAddToCart(cartItem);}catch(error){console.error('❌ Error starting ProductConfigurationFlow:',error);showSaveNotification('❌ Error starting configuration');// Fallback: direct redirect to Custom Wallpaper/Custom Fabric
fallbackDirectRedirect(pattern,material);}}/**
 * Fallback function for direct redirect when ProductConfigurationFlow fails
 */function fallbackDirectRedirect(pattern,material){console.log('🔄 Using fallback direct redirect to Custom Wallpaper/Custom Fabric');console.log('📦 Pattern data received:',{name:pattern.name,patternName:pattern.patternName,collection:pattern.collection,collectionName:pattern.collectionName,id:pattern.id,colors:pattern.colors,currentScale:pattern.currentScale});console.log('🎨 Material:',material);// Store thumbnail in localStorage for product page display
if(pattern.thumbnail){try{console.log('🖼️ Storing pattern thumbnail for product page display (fallback)');localStorage.setItem('colorflexCurrentThumbnail',pattern.thumbnail);}catch(error){console.warn('⚠️ Failed to store thumbnail in localStorage:',error);}}// 🎄 CHECK FOR PROMO CODE
var promoCode=sessionStorage.getItem('cfm_promo_code');var promoUsed=sessionStorage.getItem('cfm_promo_used')==='true';var hasPromo=false;var promoDiscount=0;console.log('🎫 Checking promo code:',{promoCode:promoCode,promoUsed:promoUsed});if(promoCode&&promoUsed&&promoCode.toUpperCase()==='FIRSTROLL25'){hasPromo=true;promoDiscount=25;// 25% off
console.log('🎉 PROMO: Applying 25% discount to cart redirect');}// Determine product handle based on material (check if material starts with 'wallpaper-' or 'fabric-')
var productHandle=material.startsWith('wallpaper-')?'custom-wallpaper':'custom-fabric';console.log('🏷️ Product handle:',productHandle);// Build URL parameters using saved pattern structure
var params=new URLSearchParams({'pattern_name':pattern.name||pattern.patternName,// Saved patterns use 'name'
'collection':pattern.collection||pattern.collectionName||'',// Saved patterns use 'collection'
'pattern_id':pattern.id,// Already correct format with SW numbers
'custom_colors':pattern.colors?pattern.colors.map(function(c){return normalizeColorToSwFormat(c.color);}).join(','):'','scale':pattern.currentScale||100,// Include scale information
'source':'colorflex_saved_patterns','preferred_material':material,'save_date':pattern.timestamp||pattern.saveDate||new Date().toISOString()});// 🎄 USE SHOPIFY'S DISCOUNT URL TO AUTO-APPLY THE CODE
// This requires creating the discount code in Shopify Admin first:
// Admin → Discounts → Create "FIRSTROLL25" at 25% off
var finalUrl;if(hasPromo){var productUrl="/products/".concat(productHandle,"?").concat(params.toString());finalUrl="/discount/".concat(promoCode,"?redirect=").concat(encodeURIComponent(productUrl));console.log('🎉 PROMO: Auto-applying Shopify discount code:',promoCode);console.log('🎯 Discount URL:',finalUrl);}else{finalUrl="/products/".concat(productHandle,"?").concat(params.toString());console.log('🎯 Regular product URL:',finalUrl);}showSaveNotification(hasPromo?'🎉 25% discount applied! Redirecting...':'🔄 Redirecting to product page...');console.log('🚀 Executing redirect...');window.location.href=finalUrl;}/**
 * Try multiple product handles until one works
 * @param {Array} handles - Array of handles to try
 * @param {string} urlParams - URL parameters string
 * @param {Object} pattern - Pattern data
 * @param {string} material - Material type
 * @param {number} index - Current handle index
 */function tryProductHandles(handles,urlParams,pattern,material,index){if(index>=handles.length){console.warn('❌ No valid product page found for any handle');showSaveNotification('❌ Product page not found');showProductSearchInstructions(pattern,material);return;}var handle=handles[index];var testUrl='/products/'+handle+'.js';// Use .js endpoint to test if product exists
console.log("\uD83D\uDD0D Testing handle ".concat(index+1,"/").concat(handles.length,": ").concat(handle));fetch(testUrl).then(function(response){if(response.ok){// Product exists! Redirect to it
var fullUrl='/products/'+handle+'?'+urlParams;console.log('✅ Found product! Redirecting to:',fullUrl);showSaveNotification('✅ Product found! Opening...');window.location.href=fullUrl;}else{// Try next handle
console.log('❌ Handle not found:',handle);tryProductHandles(handles,urlParams,pattern,material,index+1);}})["catch"](function(error){console.log('❌ Error testing handle:',handle,error);// Try next handle
tryProductHandles(handles,urlParams,pattern,material,index+1);});}/**
 * Show manual product search instructions as fallback
 * @param {Object} pattern - Pattern data
 * @param {string} material - Material type
 */function showProductSearchInstructions(pattern,material){var productHandle=generateProductHandle(pattern,material);var searchTerm=pattern.patternName;var instructions="\n\uD83D\uDD0D To find this product manually:\n\n1. Search for: \"".concat(searchTerm,"\"\n2. Or try the direct link: /products/").concat(productHandle,"\n3. Select material: ").concat(material==='wallpaper'?'Wallpaper':'Fabric',"\n4. Configure your options:\n   \u2022 Quantity/Square footage\n   \u2022 Dimensions (if applicable)\n   \u2022 Special requests\n5. Add custom colors in notes:\n   ").concat(pattern.colors?pattern.colors.map(function(c){return c.color.replace(/^(SW|SC)\d+\s*/i,'').trim();}).join(', '):'Use ColorFlex custom colors',"\n\nPattern Details:\n\u2022 Collection: ").concat(pattern.collectionName||'N/A',"\n\u2022 Saved: ").concat(pattern.saveDate||'Recently',"\n\u2022 ColorFlex Design: Yes\n    ").trim();// Create a better modal for instructions
showProductInstructionsModal(instructions,productHandle,pattern);}/**
 * Show product instructions in a modal format
 * @param {string} instructions - Instructions text
 * @param {string} productHandle - Product handle
 * @param {Object} pattern - Pattern data
 */function showProductInstructionsModal(instructions,productHandle,pattern){// Remove existing modal if present
var existingModal=document.getElementById('productInstructionsModal');if(existingModal){existingModal.remove();}// Create modal
var modal=document.createElement('div');modal.id='productInstructionsModal';modal.style.cssText="\n        position: fixed;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n        background: rgba(0, 0, 0, 0.8);\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        z-index: 10000;\n        font-family: 'Special Elite', monospace;\n    ";var modalContent=document.createElement('div');modalContent.style.cssText="\n        background: #1a202c;\n        color: #e2e8f0;\n        padding: 30px;\n        border-radius: 12px;\n        width: 90%;\n        max-width: 600px;\n        max-height: 80vh;\n        overflow-y: auto;\n        border: 2px solid #f56565;\n    ";modalContent.innerHTML="\n        <h3 style=\"color: #f56565; margin-bottom: 20px;\">\uD83D\uDCDD Product Search Instructions</h3>\n        <pre style=\"white-space: pre-wrap; font-family: 'Special Elite', monospace; font-size: 12px; line-height: 1.4; color: #e2e8f0;\">".concat(instructions,"</pre>\n        <div style=\"margin-top: 25px; display: flex; gap: 12px; justify-content: flex-end;\">\n            <button onclick=\"this.closest('#productInstructionsModal').remove()\" style=\"\n                background: transparent;\n                color: #f56565;\n                border: 2px solid #f56565;\n                padding: 10px 16px;\n                border-radius: 6px;\n                cursor: pointer;\n                font-family: 'Special Elite', monospace;\n                font-weight: bold;\n            \">Close</button>\n            <button onclick=\"navigator.clipboard.writeText('").concat(productHandle,"'); this.style.background='#48bb78'; this.textContent='\u2705 Copied!'\" style=\"\n                background: #667eea;\n                color: white;\n                border: none;\n                padding: 10px 16px;\n                border-radius: 6px;\n                cursor: pointer;\n                font-family: 'Special Elite', monospace;\n                font-weight: bold;\n            \">\uD83D\uDCCB Copy Handle</button>\n        </div>\n    ");modal.appendChild(modalContent);document.body.appendChild(modal);// Close on overlay click
modal.addEventListener('click',function(e){if(e.target===modal){modal.remove();}});}/**
 * Adds custom pattern to Shopify cart with selected material specifications
 *
 * Creates a complete cart item with pattern customization data and adds it
 * to the Shopify cart using the AJAX Cart API. This function handles the
 * entire cart addition workflow including product handle generation, data
 * formatting, API communication, and user feedback notifications.
 *
 * Workflow:
 * 1. Generates Shopify product handle from pattern and material
 * 2. Formats scale value for user-friendly display (100 → "1X", 200 → "2X")
 * 3. Builds cart item with properties (pattern name, colors, material, scale)
 * 4. Shows loading notification during API call
 * 5. Adds item to cart via addToShopifyCart() AJAX API
 * 6. Updates cart badge count on success
 * 7. Shows success/error notifications
 * 8. Falls back to manual instructions if API fails
 *
 * Cart Item Properties Created:
 * - Pattern Name: Pattern name from collections.json
 * - Collection: Collection name (e.g., "English Cottage")
 * - Material: "Wallpaper" or "Fabric" (user-friendly display)
 * - Custom Colors: Color names without SW numbers (e.g., "Eider White, Tricorn Black")
 * - ColorFlex Design: "Yes" (identifies custom ColorFlex items)
 * - Save Date: Pattern save date or current date
 * - Pattern ID: Unique pattern ID with SW numbers
 * - Pattern Scale: Formatted scale (0.5X, 1X, 2X, 3X, 4X)
 *
 * Scale Formatting:
 * - 50% → "0.5X" (half size)
 * - 100% → "1X" (normal size)
 * - 200% → "2X" (double size)
 * - 300% → "3X" (triple size)
 * - 400% → "4X" (quadruple size)
 * - Other → "N%" (percentage display)
 *
 * Product Handle Generation:
 * Uses generateProductHandle() to create Shopify product handle from:
 * - Pattern name (kebab-case)
 * - Material type (wallpaper/fabric)
 * - Collection name
 *
 * Cart Badge Update:
 * Automatically updates cart icon badge count after successful addition
 * using updateCartBadge() function.
 *
 * Error Handling:
 * - API errors: Shows error notification and fallback instructions
 * - Missing data: Provides defaults (e.g., "Default" for colors)
 * - Network failures: Triggers manual cart instructions modal
 *
 * @param {Object} pattern - Saved pattern object with customization data
 * @param {string} pattern.patternName - Pattern name (e.g., "Tudor Rose")
 * @param {string} pattern.collectionName - Collection name (e.g., "English Cottage")
 * @param {string} pattern.id - Pattern ID with SW numbers (e.g., "SW7006-SW6258-tudor-rose")
 * @param {Array<Object>} pattern.colors - Layer color assignments
 * @param {string} pattern.colors[].color - SW color name (e.g., "SW7006 Eider White")
 * @param {string} [pattern.saveDate] - Save date (defaults to current date)
 * @param {string} material - Material ID (e.g., "wallpaper-prepasted", "fabric-decorator-linen")
 * @returns {void} No return value (async operation with callbacks)
 *
 * @example
 * // Add wallpaper pattern to cart
 * const pattern = {
 *   patternName: 'Tudor Rose',
 *   collectionName: 'English Cottage',
 *   id: 'SW7006-SW6258-tudor-rose',
 *   colors: [
 *     {label: 'Background', color: 'SW7006 Eider White'},
 *     {label: 'Accent', color: 'SW6258 Tricorn Black'}
 *   ],
 *   saveDate: '11/30/2025'
 * };
 *
 * addPatternToCart(pattern, 'wallpaper-prepasted');
 * // Console: 🛒 Adding pattern to cart: Tudor Rose Material: wallpaper-prepasted
 * // Notification: 🔄 Adding to cart...
 * // Console: ✅ Successfully added to cart: [response data]
 * // Notification: ✅ Tudor Rose (wallpaper-prepasted) added to cart!
 * // Result: Cart badge updates with new count
 *
 * @example
 * // Add fabric pattern with scale
 * appState.currentScale = 200; // 2X scale
 * const fabricPattern = {
 *   patternName: 'Chippendale',
 *   collectionName: 'English Cottage',
 *   id: 'SW7006-SC0001-chippendale-2X',
 *   colors: [
 *     {color: 'SW7006 Eider White'},
 *     {color: 'SC0001 Cottage Linen'}
 *   ]
 * };
 *
 * addPatternToCart(fabricPattern, 'fabric-decorator-linen');
 * // Cart item includes: Pattern Scale: "2X"
 *
 * @example
 * // Error handling - API failure
 * addPatternToCart(pattern, 'invalid-material');
 * // Console: ❌ Failed to add to cart: [error details]
 * // Notification: ❌ Failed to add to cart. Please try again.
 * // Result: Shows manual cart instructions modal
 *
 * ⚠️ IMPORTANT: Requires Shopify AJAX Cart API enabled on theme
 *
 * 🛒 CART: Uses Shopify /cart/add.js endpoint for item addition
 *
 * 🎨 FORMAT: Removes SW/SC prefixes from colors in cart display
 *
 * 📊 BADGE: Auto-updates cart badge count after successful addition
 *
 * 🔧 FALLBACK: Shows manual instructions if API fails
 *
 * 💾 PROPERTIES: All customization data stored as line item properties
 *
 * @see addToShopifyCart - Handles actual AJAX API call to Shopify
 * @see generateProductHandle - Creates Shopify product handle from pattern
 * @see updateCartBadge - Updates cart icon badge count
 * @see showSaveNotification - Displays status notifications to user
 * @see showManualCartInstructions - Fallback instructions modal
 */function addPatternToCart(pattern,material){try{// Format scale for user-friendly display
var formatScaleForCart=function formatScaleForCart(scaleValue){var scale=parseInt(scaleValue)||100;switch(scale){case 50:return'0.5X';case 100:return'1X';case 200:return'2X';case 300:return'3X';case 400:return'4X';default:return"".concat(scale,"%");}};// Create cart item data
console.log('🛒 Adding pattern to cart:',pattern.patternName,'Material:',material);// Generate Shopify product handle from pattern data
var productHandle=generateProductHandle(pattern,material);var cartItem={id:productHandle,// This will need to be the actual Shopify variant ID
quantity:1,properties:{'Pattern Name':pattern.patternName,'Collection':pattern.collectionName,'Material':material==='wallpaper'?'Wallpaper':'Fabric','Custom Colors':pattern.colors?pattern.colors.map(function(c){return c.color.replace(/^(SW|SC)\d+\s*/i,'').trim();}).join(', '):'Default','ColorFlex Design':'Yes','Save Date':pattern.saveDate||new Date().toLocaleDateString(),'Pattern ID':pattern.id,'Pattern Scale':formatScaleForCart(appState.currentScale||100)}};// Show loading state
showSaveNotification('🔄 Adding to cart...');// Add to Shopify cart using AJAX API
addToShopifyCart(cartItem,material).then(function(response){console.log('✅ Successfully added to cart:',response);showSaveNotification("\u2705 ".concat(pattern.patternName," (").concat(material,") added to cart!"));// Optional: Update cart UI elements if they exist
updateCartBadge();})["catch"](function(error){console.error('❌ Failed to add to cart:',error);showSaveNotification('❌ Failed to add to cart. Please try again.');// Fallback: Show manual instructions
showManualCartInstructions(pattern,material);});}catch(error){console.error('❌ Error in addPatternToCart:',error);showSaveNotification('❌ Error adding to cart');}}/**
 * Generate multiple possible Shopify product handles from pattern data
 * @param {Object} pattern - Pattern data
 * @param {string} material - Material type
 * @returns {Array} Array of possible product handles to try
 */function generateProductHandles(pattern,material){// Convert pattern name to handle format
var patternHandle=pattern.patternName.toLowerCase().replace(/[^a-z0-9\s-]/g,'')// Remove special characters
.replace(/\s+/g,'-')// Replace spaces with hyphens
.replace(/-+/g,'-')// Remove duplicate hyphens
.replace(/^-|-$/g,'');// Remove leading/trailing hyphens
var collectionHandle='';if(pattern.collectionName){collectionHandle=pattern.collectionName.toLowerCase().replace(/[^a-z0-9]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');}// Generate multiple possible handles to try
var possibleHandles=[];if(collectionHandle&&patternHandle){// Try base handle first (this matches your CSV format)
possibleHandles.push(collectionHandle+'-'+patternHandle);possibleHandles.push(patternHandle);// Then try with material suffixes
possibleHandles.push(collectionHandle+'-'+patternHandle+'-'+material);possibleHandles.push(patternHandle+'-'+material);possibleHandles.push(collectionHandle+'-'+patternHandle+'-wallpaper');possibleHandles.push(collectionHandle+'-'+patternHandle+'-fabric');// Try with different separators
possibleHandles.push(patternHandle+'-from-'+collectionHandle);possibleHandles.push(patternHandle+'-'+collectionHandle);}else if(patternHandle){possibleHandles.push(patternHandle);possibleHandles.push(patternHandle+'-'+material);possibleHandles.push(patternHandle+'-wallpaper');possibleHandles.push(patternHandle+'-fabric');}// Remove duplicates
return _toConsumableArray(new Set(possibleHandles));}/**
 * Legacy function for backward compatibility
 */function generateProductHandle(pattern,material){var handles=generateProductHandles(pattern,material);return handles[0]||'unknown-pattern';}/**
 * Add item to Shopify cart using AJAX API
 * @param {Object} cartItem - Cart item data
 * @param {string} material - Material type for error handling
 * @returns {Promise} Cart API response
 */function addToShopifyCart(cartItem,material){return new Promise(function(resolve,reject){// First, try to find the product by handle
var productHandle=cartItem.id;// In a real implementation, you'd need to:
// 1. Look up the product by handle using Storefront API
// 2. Get the variant ID for the specific material
// 3. Add the variant ID to cart using AJAX API
// For now, we'll simulate the cart addition
// This would be replaced with actual Shopify AJAX cart calls
// Simulate network delay
setTimeout(function(){// Check if we're in a Shopify environment
if(typeof window.Shopify!=='undefined'&&window.Shopify.routes){// Real Shopify environment - attempt actual cart add
tryRealShopifyCartAdd(cartItem,resolve,reject);}else{// Development/preview environment - simulate success
console.log('📝 Simulated cart addition (development mode)');resolve({product_handle:productHandle,material:material,message:'Cart addition simulated successfully'});}},500);});}/**
 * Attempt real Shopify cart addition
 * @param {Object} cartItem - Cart item data
 * @param {Function} resolve - Promise resolve
 * @param {Function} reject - Promise reject
 */function tryRealShopifyCartAdd(cartItem,resolve,reject){try{console.log('🔍 Looking up product for cart addition:',cartItem.id);// First, look up the product by handle to get the variant ID
lookupProductByHandle(cartItem.id).then(function(productData){if(!productData||!productData.variants||productData.variants.length===0){throw new Error('Product not found or has no variants');}// Find the best matching variant based on material type
var variant=findBestVariantForMaterial(productData.variants,cartItem.properties.Material);console.log('✅ Found variant:',variant.id,variant.title);// Add to cart using Shopify AJAX Cart API
return fetch('/cart/add.js',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({items:[{id:variant.id,quantity:cartItem.quantity,properties:cartItem.properties}]})});}).then(function(response){if(!response.ok){throw new Error('Cart add failed: '+response.status+' '+response.statusText);}return response.json();}).then(function(data){console.log('✅ Successfully added to Shopify cart:',data);resolve({success:true,cartData:data,message:'Successfully added to cart'});})["catch"](function(error){console.error('❌ Cart addition failed:',error);reject(error);});}catch(error){console.error('❌ Error in tryRealShopifyCartAdd:',error);reject(error);}}/**
 * Find the best matching variant for the selected material
 * @param {Array} variants - Product variants
 * @param {string} materialType - 'Wallpaper' or 'Fabric'
 * @returns {Object} Best matching variant
 */function findBestVariantForMaterial(variants,materialType){console.log('🔍 Finding variant for material:',materialType,'from',variants.length,'variants');if(!variants||variants.length===0){throw new Error('No variants available');}// If only one variant, return it
if(variants.length===1){return variants[0];}// Try to find variant that matches the material type
var materialKeywords=materialType.toLowerCase()==='wallpaper'?['wallpaper','wall paper','peel','stick','removable']:['fabric','cotton','textile','yard','material'];// First, try to find exact material match
var exactMatch=variants.find(function(variant){var title=(variant.title||'').toLowerCase();var option1=(variant.option1||'').toLowerCase();var option2=(variant.option2||'').toLowerCase();return materialKeywords.some(function(keyword){return title.includes(keyword)||option1.includes(keyword)||option2.includes(keyword);});});if(exactMatch&&exactMatch.available){console.log('✅ Found exact material match:',exactMatch.title);return exactMatch;}// If no exact match, try available variants first
var availableVariant=variants.find(function(variant){return variant.available;});if(availableVariant){console.log('✅ Using available variant:',availableVariant.title);return availableVariant;}// Last resort: return first variant
console.log('⚠️ Using first variant as fallback:',variants[0].title);return variants[0];}/**
 * Look up product by handle using Shopify's product JSON endpoint
 * @param {string} productHandle - Product handle
 * @returns {Promise} Product data
 */function lookupProductByHandle(productHandle){return new Promise(function(resolve,reject){console.log('🔍 Looking up product by handle:',productHandle);// Try to fetch product data from Shopify's product JSON endpoint
var productUrl='/products/'+productHandle+'.js';fetch(productUrl).then(function(response){if(!response.ok){// If exact handle doesn't work, try some variations
if(response.status===404){console.log('📝 Product not found, trying handle variations...');return tryProductHandleVariations(productHandle);}throw new Error('Product lookup failed: '+response.status);}return response.json();}).then(function(product){console.log('✅ Product found:',product.title,'Variants:',product.variants.length);resolve(product);})["catch"](function(error){console.error('❌ Product lookup failed:',error);reject(error);});});}/**
 * Try different variations of the product handle
 * @param {string} baseHandle - Original handle
 * @returns {Promise} Product data or rejection
 */function tryProductHandleVariations(baseHandle){return new Promise(function(resolve,reject){// Common handle variations to try
var variations=[baseHandle.replace('-wallpaper','').replace('-fabric',''),// Remove material suffix
baseHandle.replace(/^[^-]+-/,''),// Remove collection prefix
baseHandle.split('-').slice(0,-1).join('-'),// Remove last segment
baseHandle.replace(/-/g,'_'),// Replace hyphens with underscores
baseHandle.toLowerCase().replace(/[^a-z0-9-]/g,'')// Clean special characters
];console.log('🔄 Trying handle variations:',variations);// Try each variation
var _tryNext=function tryNext(index){if(index>=variations.length){reject(new Error('No product found for any handle variation'));return;}var handle=variations[index];if(!handle||handle===baseHandle){_tryNext(index+1);return;}console.log('🔍 Trying variation:',handle);fetch('/products/'+handle+'.js').then(function(response){if(response.ok){return response.json();}throw new Error('Not found');}).then(function(product){console.log('✅ Found product with variation:',handle,product.title);resolve(product);})["catch"](function(){_tryNext(index+1);});};_tryNext(0);});}/**
 * Show manual cart instructions as fallback
 * @param {Object} pattern - Pattern data
 * @param {string} material - Material type
 */function showManualCartInstructions(pattern,material){var instructions="\n        To manually add this pattern to your cart:\n        \n        1. Search for: \"".concat(pattern.patternName,"\"\n        2. Select material: ").concat(material==='wallpaper'?'Wallpaper':'Fabric',"\n        3. Add your custom colors in the notes: ").concat(pattern.colors?pattern.colors.map(function(c){return c.color.replace(/^(SW|SC)\d+\s*/i,'').trim();}).join(', '):'Default colors',"\n    ");alert('Manual Cart Instructions:\n'+instructions);}/**
 * Update cart badge/counter if it exists
 */function updateCartBadge(){// Fetch current cart data to get accurate count
fetch('/cart.js').then(function(response){if(response.ok){return response.json();}throw new Error('Cart fetch failed');}).then(function(cart){var itemCount=cart.item_count;console.log('🛒 Updated cart count:',itemCount);// Look for common cart badge selectors
var cartBadges=['#cart-count','.cart-count','.cart-counter','[data-cart-count]','.header-cart-count','[data-cart-item-count]','.cart-item-count'];cartBadges.forEach(function(selector){var badge=document.querySelector(selector);if(badge){console.log('📊 Updating cart badge:',selector,itemCount);// Update the count
if(badge.hasAttribute('data-cart-count')||badge.hasAttribute('data-cart-item-count')){badge.setAttribute('data-cart-count',itemCount);badge.setAttribute('data-cart-item-count',itemCount);}// Update text content
badge.textContent=itemCount;// Add visual feedback animation
badge.style.animation='pulse 0.5s ease-in-out';badge.style.transform='scale(1.2)';setTimeout(function(){badge.style.animation='';badge.style.transform='scale(1)';},500);// Show/hide badge based on count
if(itemCount>0){badge.style.display='';if(badge.classList){badge.classList.remove('hidden');badge.classList.add('visible');}}else{if(badge.classList&&badge.classList.contains('hide-when-empty')){badge.style.display='none';}}}});// Trigger custom cart update event for theme compatibility
var cartUpdateEvent=new CustomEvent('cart:updated',{detail:{cart:cart,itemCount:itemCount}});document.dispatchEvent(cartUpdateEvent);// Also try updating via Shopify's theme events if available
if(window.theme&&window.theme.cartCounter){window.theme.cartCounter.update(itemCount);}})["catch"](function(error){console.error('❌ Failed to update cart badge:',error);// Fallback: just add visual feedback without count update
var cartBadges=['#cart-count','.cart-count','.cart-counter'];cartBadges.forEach(function(selector){var badge=document.querySelector(selector);if(badge){badge.style.animation='pulse 0.5s ease-in-out';setTimeout(function(){badge.style.animation='';},500);}});});}// ============================================================================
// SECTION 3: PATTERN LOADING & PREVIEW
// ============================================================================
// Functions for loading saved patterns, previewing them, and restoring UI state.
// ============================================================================
// Preview a saved pattern by loading it into the main interface
function previewSavedPattern(pattern){try{console.log('👁️ Previewing saved pattern:',pattern.patternName);// 🆕 PERSISTENT MODAL: Only close modal if not in persistent mode
// Check if we have a persistent modal source (from unified modal or theme.liquid)
var modal=document.getElementById('savedPatternsModal');var unifiedModal=document.getElementById('unifiedSavedPatternsModal');var isPersistentContext=unifiedModal||modal&&modal.dataset&&modal.dataset.persistent;if(modal&&!isPersistentContext){console.log('🔄 Closing non-persistent modal');modal.remove();}else if(modal&&isPersistentContext){console.log('🔒 Keeping persistent modal open for continued browsing');}// Find the collection and pattern
var targetCollection=appState.collections.find(function(c){return c&&typeof c.name==='string'&&c.name.toLowerCase()===pattern.collectionName.toLowerCase();});if(!targetCollection){showSaveNotification('❌ Collection "'+pattern.collectionName+'" not found');return;}var targetPattern=targetCollection.patterns.find(function(p){return p&&typeof p.name==='string'&&p.name.toLowerCase()===pattern.patternName.toLowerCase();});if(!targetPattern){showSaveNotification('❌ Pattern "'+pattern.patternName+'" not found');return;}// Set the collection and pattern
appState.selectedCollection=targetCollection;appState.currentPattern=targetPattern;// Set data attribute for collection-specific styling
document.body.setAttribute('data-current-collection',targetCollection.name);// Update collection header
var collectionHeader=document.getElementById('collectionHeader');if(collectionHeader){// Check if this is a clothing collection
if(targetCollection.name.includes('-clo')){var collectionBaseName=targetCollection.name.split('.')[0];collectionHeader.innerHTML="".concat(collectionBaseName.toUpperCase(),"<br>CLOTHING");}else{collectionHeader.textContent=targetCollection.name.toUpperCase();}}// Populate layer inputs with saved colors
populateLayerInputs(targetPattern);// Apply saved colors to layers if they exist
if(pattern.colors&&pattern.colors.length>0){// Wait for layer inputs to be created, then apply colors
setTimeout(function(){pattern.colors.forEach(function(savedColor,index){if(appState.currentLayers[index]){appState.currentLayers[index].color=savedColor.color;// Update the visual input elements
var input=document.getElementById('layer-'+index);var circle=document.querySelector('#layer-'+index+' ~ .layer-circle');if(input){// Use clean color name without SW codes for input display
input.value=getCleanColorName(savedColor.color);}if(circle){console.log("\uD83C\uDFA8 Looking up color for circle: \"".concat(savedColor.color,"\""));var colorHex=lookupColor(savedColor.color);console.log("\uD83C\uDFA8 Color result: \"".concat(savedColor.color,"\" -> \"").concat(colorHex,"\""));circle.style.backgroundColor=colorHex;}}});// Update previews
updatePreview();// ✅ MODE CHECK: Use correct render function based on mode
var isFurnitureMode=window.COLORFLEX_MODE==='FURNITURE'||appState.isInFurnitureMode;var isClothingMode=window.COLORFLEX_MODE==='CLOTHING'||window.COLORFLEX_SIMPLE_MODE===true&&window.location.pathname.includes('clothing');if(isFurnitureMode){updateFurniturePreview();}else if(appState.isInFabricMode||isClothingMode){renderFabricMockup();}else{updateRoomMockup();}populateCoordinates();},300);}// Update pattern thumbnails for the new collection
populatePatternThumbnails(targetCollection.patterns);// Show success message
showSaveNotification('✅ Pattern "'+pattern.patternName+'" loaded successfully!');}catch(error){console.error('❌ Error previewing pattern:',error);showSaveNotification('❌ Failed to load pattern preview');}}// Load a saved pattern into the main UI with full functionality
/**
 * Loads a saved pattern into the ColorFlex UI with full state restoration
 *
 * Restores a previously saved pattern customization to the canvas by
 * switching collections, selecting the pattern, applying saved colors,
 * restoring scale settings, and updating all UI elements. This is the
 * primary function for loading patterns from the "My Designs" modal.
 *
 * Restoration Process (14 steps):
 * 1. Find target collection by name (case-insensitive)
 * 2. Find target pattern within collection (case-insensitive)
 * 3. Set appState.selectedCollection and appState.currentPattern
 * 4. Update collection header (handles clothing collections specially)
 * 5. Update pattern name display
 * 6. Populate layer inputs for the pattern
 * 7. Apply saved colors to each layer (300ms delay for DOM ready)
 * 8. Update layer input values and color circles
 * 9. Restore saved scale settings (currentScale, scaleMultiplier)
 * 10. Update scale UI (slider, display, highlight buttons)
 * 11. Update pattern preview and room mockup
 * 12. Populate pattern thumbnails for collection
 * 13. Update curated colors for new collection
 * 14. Highlight selected pattern thumbnail
 *
 * Modal Behavior:
 * - Persistent mode: Keeps modal open for browsing (dataset.persistent)
 * - Normal mode: Closes modal after loading pattern
 *
 * Clothing Collection Handling:
 * - Detects `-clo` suffix in collection name
 * - Displays as "BOMBAY<br>CLOTHING" format
 *
 * @param {Object} pattern - Saved pattern object to load
 * @param {string} pattern.patternName - Pattern name from collections.json
 * @param {string} pattern.collectionName - Collection name
 * @param {Array<Object>} pattern.colors - Saved layer colors
 * @param {string} pattern.colors[].color - Color in SW format (e.g., "SW7006 Eider White")
 * @param {number} [pattern.currentScale=100] - Scale percentage (50, 100, 200, 300, 400)
 * @param {number} [pattern.scaleMultiplier=1.0] - Scale multiplier (0.5, 1.0, 2.0, 3.0, 4.0)
 * @param {string} [pattern.source] - Source of pattern (for logging)
 * @returns {void} No return value (modifies UI as side effect)
 *
 * @example
 * // Load a saved pattern from My Designs modal
 * const savedPattern = {
 *   patternName: 'Tudor Rose',
 *   collectionName: 'English Cottage',
 *   colors: [
 *     {label: 'Background', color: 'SW7006 Eider White'},
 *     {label: 'Pattern', color: 'SW6258 Tricorn Black'}
 *   ],
 *   currentScale: 200,
 *   scaleMultiplier: 0.5
 * };
 *
 * loadSavedPatternToUI(savedPattern);
 * // UI updates: collection switches, pattern loads, colors apply, scale restores
 *
 * @example
 * // User workflow
 * // 1. User opens "My Designs" modal
 * // 2. Clicks "Load" button on pattern card
 * // 3. loadSavedPatternToUI(pattern) called
 * // 4. UI switches to pattern's collection
 * // 5. Pattern loads with saved colors and scale
 * // 6. Modal closes (or stays open if persistent)
 *
 * @throws {Error} Shows notification if collection or pattern not found
 * @throws {Error} Logs error and shows notification if load fails
 *
 * ⚠️ IMPORTANT: Pattern and collection must exist in collections.json
 *
 * 🔄 UI UPDATE: Comprehensive - switches collections, updates all displays
 *
 * 🎨 CURATED COLORS: Updates curated color circles for new collection
 *
 * 📏 SCALE RESTORATION: Fully restores scale settings with button highlighting
 *
 * ⏱️ TIMING: Uses setTimeout delays (100ms, 300ms, 500ms) for DOM readiness
 *
 * @see showSavedPatternsModal - Modal with load buttons
 * @see updatePreview - Updates pattern preview
 * @see updateRoomMockup - Updates room mockup
 * @see populateCuratedColors - Updates curated color circles
 */function loadSavedPatternToUI(pattern){try{console.log('🔄 Loading saved pattern into UI:',pattern.patternName);console.log('🔍 Pattern data received:',pattern);console.log('🎨 Source:',pattern.source||'unknown');// 🆕 PERSISTENT MODAL: Only close modal if not in persistent mode
// Check if we have a persistent modal source (from unified modal or theme.liquid)
var modal=document.getElementById('savedPatternsModal');var unifiedModal=document.getElementById('unifiedSavedPatternsModal');var isPersistentContext=unifiedModal||modal&&modal.dataset&&modal.dataset.persistent;if(modal&&!isPersistentContext){console.log('🔄 Closing non-persistent modal');modal.remove();}else if(modal&&isPersistentContext){console.log('🔒 Keeping persistent modal open for continued browsing');}// Find the collection and pattern
var targetCollection=appState.collections.find(function(c){return c&&typeof c.name==='string'&&c.name.toLowerCase()===pattern.collectionName.toLowerCase();});if(!targetCollection){showSaveNotification('❌ Collection "'+pattern.collectionName+'" not found');return;}var targetPattern=targetCollection.patterns.find(function(p){return p&&typeof p.name==='string'&&p.name.toLowerCase()===pattern.patternName.toLowerCase();});if(!targetPattern){showSaveNotification('❌ Pattern "'+pattern.patternName+'" not found');return;}// Set the collection and pattern
appState.selectedCollection=targetCollection;appState.currentPattern=targetPattern;// Set data attribute for collection-specific styling
document.body.setAttribute('data-current-collection',targetCollection.name);// Update collection header
var collectionHeader=document.getElementById('collectionHeader');if(collectionHeader){// Check if this is a clothing collection
if(targetCollection.name.includes('-clo')){var collectionBaseName=targetCollection.name.split('.')[0];collectionHeader.innerHTML="".concat(collectionBaseName.toUpperCase(),"<br>CLOTHING");}else{collectionHeader.textContent=targetCollection.name.toUpperCase();}}// Update pattern name display
var _patternNameElement=document.getElementById('patternName');if(_patternNameElement){_patternNameElement.innerHTML=targetPattern.name+formatPatternInfo(targetPattern);}// 🎨 SIMPLE MODE REDESIGN: Update pattern repeats display
var patternRepeatsElement=document.getElementById('patternRepeats');if(patternRepeatsElement){patternRepeatsElement.textContent='Pattern Repeats 24x24';}// Populate layer inputs with saved colors
populateLayerInputs(targetPattern);// Apply saved colors to layers if they exist (support both formats)
var colorsToApply=pattern.colors||(pattern.customColors?pattern.customColors.map(function(c){return{color:c};}):[]);if(colorsToApply&&colorsToApply.length>0){// Wait for layer inputs to be created, then apply colors
setTimeout(function(){colorsToApply.forEach(function(savedColor,index){if(appState.currentLayers[index]){// Handle both formats: {color: "SW1234"} or just "SW1234"
var colorValue=savedColor.color||savedColor;appState.currentLayers[index].color=colorValue;var colorHex=lookupColor(colorValue);// Update via appState.layerInputs (primary method)
if(appState.layerInputs[index]){var layerInput=appState.layerInputs[index];if(layerInput.input){layerInput.input.value=getCleanColorName(colorValue);}if(layerInput.circle){layerInput.circle.style.backgroundColor=colorHex;}}// Fallback to DOM selector approach
var input=document.getElementById('layer-'+index);if(input){input.value=getCleanColorName(colorValue);}// Try multiple circle selector approaches as fallback
var circleSelectors=["#layer-".concat(index," ~ .layer-circle"),"[data-layer-id=\"layer-".concat(index,"\"] .layer-circle"),".layer-circle[data-layer=\"".concat(index,"\"]")];for(var _i2=0,_circleSelectors=circleSelectors;_i2<_circleSelectors.length;_i2++){var selector=_circleSelectors[_i2];var circle=document.querySelector(selector);if(circle){circle.style.backgroundColor=colorHex;break;}}}});// 🆕 RESTORE SCALING: Apply saved scale settings if available
console.log('🔍 Scale restoration debug - pattern object:',{currentScale:pattern.currentScale,scaleMultiplier:pattern.scaleMultiplier,hasCurrentScale:pattern.currentScale!==undefined,hasScaleMultiplier:pattern.scaleMultiplier!==undefined});if(pattern.currentScale!==undefined){console.log('🔧 Restoring saved scale:',pattern.currentScale,'with multiplier:',pattern.scaleMultiplier);appState.currentScale=pattern.currentScale;// Update scale UI display if it exists
var scaleDisplay=document.getElementById('scaleDisplay');if(scaleDisplay){scaleDisplay.textContent=pattern.currentScale+'%';}// Update scale slider if it exists
var scaleSlider=document.getElementById('scaleSlider');if(scaleSlider){scaleSlider.value=pattern.currentScale;}}if(pattern.scaleMultiplier!==undefined){appState.scaleMultiplier=pattern.scaleMultiplier;console.log('✅ Scale multiplier restored:',pattern.scaleMultiplier);// 🎯 BUTTON HIGHLIGHTING: Call setPatternScale to highlight the correct button
// Add delay to ensure scale buttons are available in DOM
setTimeout(function(){if(typeof window.setPatternScale==='function'){console.log('🎯 Highlighting scale button for multiplier:',pattern.scaleMultiplier);window.setPatternScale(pattern.scaleMultiplier);}else{console.warn('⚠️ setPatternScale function not available');}},500);}// Update all previews and UI elements
updatePreview();// ✅ MODE CHECK: Use correct render function based on mode
var isFurnitureMode=window.COLORFLEX_MODE==='FURNITURE'||appState.isInFurnitureMode;var isClothingMode=window.COLORFLEX_MODE==='CLOTHING'||window.COLORFLEX_SIMPLE_MODE===true&&window.location.pathname.includes('clothing');if(isFurnitureMode){updateFurniturePreview();}else if(appState.isInFabricMode||isClothingMode){renderFabricMockup();}else{updateRoomMockup();}populateCoordinates();// Force a complete UI refresh
setTimeout(function(){updatePreview();},100);},300);}// Update pattern thumbnails for the new collection
populatePatternThumbnails(targetCollection.patterns);// 🎨 CRITICAL FIX: Update curated colors for the new collection
// When loading a saved pattern from a different collection, we need to update
// the curated color circles to match the new collection's colors
// ✅ Skip curated colors entirely in simple mode
var isSimpleMode=window.COLORFLEX_SIMPLE_MODE===true;if(!isSimpleMode){var newCuratedColors=targetCollection.curatedColors||[];if(newCuratedColors.length>0){console.log('🎨 Updating curated colors for collection:',targetCollection.name,'with',newCuratedColors.length,'colors');appState.curatedColors=newCuratedColors;populateCuratedColors(newCuratedColors);}else{console.log('📭 No curated colors found for collection:',targetCollection.name);}}else{console.log('🎨 Simple mode - skipping curated colors');appState.curatedColors=[];}// Update the selected thumbnail to highlight the loaded pattern
setTimeout(function(){var thumbnails=document.querySelectorAll('.pattern-thumbnail');thumbnails.forEach(function(thumb){thumb.classList.remove('selected');if(thumb.dataset.patternName===targetPattern.name){thumb.classList.add('selected');}});},500);// Show success message with enhanced feedback
showSaveNotification('✅ Pattern "'+pattern.patternName+'" loaded successfully!');console.log('✅ Pattern loaded - Collection:',targetCollection.name,'Pattern:',targetPattern.name);}catch(error){console.error('❌ Error loading pattern to UI:',error);showSaveNotification('❌ Failed to load pattern into UI');}}// Path normalization function to fix ./data/ vs data/ inconsistencies
function normalizePath(path){if(!path||typeof path!=='string')return path;// If it's already a full URL, return as-is
if(path.startsWith('http://')||path.startsWith('https://')){return path;}// Convert "./data/" to "data/" for consistency
if(path.startsWith('./data/')){path=path.substring(2);// Remove the "./"
}// For any other relative paths, ensure they don't start with "./"
if(path.startsWith('./')){path=path.substring(2);}// If it's a data/ path, convert to absolute URL
if(path.startsWith('data/')){return"https://so-animation.com/colorflex/".concat(path);}return path;}// Store furniture view settings globally for consistency
var furnitureViewSettings={scale:0.7,offsetX:0,offsetY:-120,// Zoom states
isZoomed:false,zoomScale:2,// 220% zoom when clicked
zoomX:0,// Where we're zoomed to
zoomY:0// Where we're zoomed to
};var DEFAULT_FURNITURE_SETTINGS={scale:0.7,offsetX:0,offsetY:-120};// Clothing-specific zoom settings (separate from furniture)
var CLOTHING_ZOOM_DEFAULTS={defaultScale:0.7,// 70% initial zoom for optimal clothing view
zoomScale:2.0,// 200% zoom when clicked
defaultPanX:0,// No horizontal pan by default
defaultPanY:0// No vertical pan by default
};/**
 * Add zoom controls to clothing mockup (minus, reset, plus buttons)
 * Called from both loadPatternData() and renderFabricMockup()
 */function addClothingZoomControls(roomMockupDiv){if(!roomMockupDiv){console.error("❌ roomMockupDiv not provided to addClothingZoomControls");return;}// Skip if controls already exist
if(document.getElementById('clothingZoomControls')){console.log("✅ Zoom controls already exist");return;}var zoomControls=document.createElement('div');zoomControls.id='clothingZoomControls';zoomControls.style.cssText="\n        position: absolute;\n        bottom: 15px;\n        left: 15px;\n        display: flex;\n        gap: 6px;\n        z-index: 1000;\n        background: rgba(26, 32, 44, 0.95);\n        padding: 8px 10px;\n        border-radius: 10px;\n        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);\n        backdrop-filter: blur(8px);\n        border: 1px solid rgba(74, 144, 226, 0.25);\n    ";// Utility for zoom control buttons (blue)
var createZoomButton=function createZoomButton(label,title,direction){var button=document.createElement('button');button.innerHTML=label;button.title=title;button.style.cssText="\n            background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);\n            color: white;\n            border: none;\n            padding: 8px 14px;\n            border-radius: 7px;\n            cursor: pointer;\n            font-size: 16px;\n            font-weight: 600;\n            font-family: system-ui, -apple-system, sans-serif;\n            transition: all 0.2s ease;\n            box-shadow: 0 2px 6px rgba(74, 144, 226, 0.25);\n            min-width: 42px;\n        ";var intervalId;var updateZoom=function updateZoom(){var canvas=roomMockupDiv.querySelector('canvas');if(canvas){var currentScale=parseFloat(canvas.dataset.zoomScale||CLOTHING_ZOOM_DEFAULTS.defaultScale.toString());var step=0.01;var minScale=0.25;var maxScale=2.0;if(direction==='in'){currentScale=Math.min(maxScale,currentScale+step);}else{currentScale=Math.max(minScale,currentScale-step);}canvas.dataset.zoomScale=currentScale.toFixed(2);appState.savedZoomScale=currentScale;// Save to appState for persistence
// Preserve current pan position when zooming
var panX=parseFloat(canvas.dataset.panX||'0');var panY=parseFloat(canvas.dataset.panY||'0');canvas.style.setProperty('transform',"scale(".concat(currentScale,") translate(").concat(panX,"px, ").concat(panY,"px)"),'important');canvas.style.setProperty('transform-origin','center','important');}};// Hold-to-zoom behavior
button.addEventListener('mousedown',function(e){e.stopPropagation();updateZoom();intervalId=setInterval(updateZoom,50);// Smooth update every 50ms
});['mouseup','mouseleave'].forEach(function(event){return button.addEventListener(event,function(){return clearInterval(intervalId);});});// Hover effect
button.addEventListener('mouseenter',function(){button.style.background='linear-gradient(135deg, #5ba3ff 0%, #4080d0 100%)';button.style.transform='translateY(-1px)';button.style.boxShadow='0 4px 12px rgba(74, 144, 226, 0.4)';});button.addEventListener('mouseleave',function(){button.style.background='linear-gradient(135deg, #4a90e2 0%, #357abd 100%)';button.style.transform='translateY(0)';button.style.boxShadow='0 2px 6px rgba(74, 144, 226, 0.25)';});return button;};var zoomOutBtn=createZoomButton('−','Zoom Out (hold to scale down)','out');var zoomInBtn=createZoomButton('+','Zoom In (hold to scale up)','in');// Create reset button (circle arrow with animation)
var resetBtn=document.createElement('button');resetBtn.innerHTML='↻';resetBtn.title='Reset zoom and pan';resetBtn.style.cssText="\n        background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);\n        color: white;\n        border: none;\n        padding: 8px 14px;\n        border-radius: 50%;\n        cursor: pointer;\n        font-size: 20px;\n        font-weight: 400;\n        font-family: system-ui, -apple-system, sans-serif;\n        transition: all 0.3s ease;\n        box-shadow: 0 2px 6px rgba(74, 144, 226, 0.25);\n        width: 42px;\n        height: 42px;\n        line-height: 1;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n    ";resetBtn.addEventListener('mouseenter',function(){resetBtn.style.background='linear-gradient(135deg, #5ba3ff 0%, #4080d0 100%)';resetBtn.style.transform='translateY(-1px)';resetBtn.style.boxShadow='0 4px 12px rgba(74, 144, 226, 0.4)';});resetBtn.addEventListener('mouseleave',function(){resetBtn.style.background='linear-gradient(135deg, #4a90e2 0%, #357abd 100%)';resetBtn.style.transform='translateY(0)';resetBtn.style.boxShadow='0 2px 6px rgba(74, 144, 226, 0.25)';});resetBtn.addEventListener('click',function(e){e.stopPropagation();var canvas=roomMockupDiv.querySelector('canvas');if(canvas){// Animate rotation on click
resetBtn.style.transition='transform 0.5s ease';resetBtn.style.transform='rotate(360deg)';setTimeout(function(){resetBtn.style.transform='';resetBtn.style.transition='all 0.3s ease';},500);// Reset to optimal clothing view defaults (70% scale, centered)
canvas.dataset.zoomScale=CLOTHING_ZOOM_DEFAULTS.defaultScale.toFixed(2);canvas.dataset.panX=CLOTHING_ZOOM_DEFAULTS.defaultPanX.toString();canvas.dataset.panY=CLOTHING_ZOOM_DEFAULTS.defaultPanY.toString();appState.savedZoomScale=CLOTHING_ZOOM_DEFAULTS.defaultScale;appState.savedPanX=CLOTHING_ZOOM_DEFAULTS.defaultPanX;appState.savedPanY=CLOTHING_ZOOM_DEFAULTS.defaultPanY;canvas.style.setProperty('transform',"scale(".concat(CLOTHING_ZOOM_DEFAULTS.defaultScale,")"),'important');console.log('🔄 Reset clothing zoom and pan to defaults (70%, 0, 0)');}});zoomControls.appendChild(zoomOutBtn);zoomControls.appendChild(resetBtn);zoomControls.appendChild(zoomInBtn);// Add pan functionality (click and drag)
var isPanning=false;var startX=0;var startY=0;var currentPanX=0;var currentPanY=0;roomMockupDiv.addEventListener('mousedown',function(e){var canvas=roomMockupDiv.querySelector('canvas');if(canvas&&e.target===canvas&&!e.target.closest('#clothingZoomControls')){isPanning=true;startX=e.clientX;startY=e.clientY;currentPanX=parseFloat(canvas.dataset.panX||'0');currentPanY=parseFloat(canvas.dataset.panY||'0');canvas.style.cursor='grabbing';e.preventDefault();}});document.addEventListener('mousemove',function(e){if(isPanning){var canvas=roomMockupDiv.querySelector('canvas');if(canvas){var deltaX=e.clientX-startX;var deltaY=e.clientY-startY;var newPanX=currentPanX+deltaX;var newPanY=currentPanY+deltaY;canvas.dataset.panX=newPanX.toString();canvas.dataset.panY=newPanY.toString();appState.savedPanX=newPanX;appState.savedPanY=newPanY;var scale=parseFloat(canvas.dataset.zoomScale||CLOTHING_ZOOM_DEFAULTS.defaultScale.toString());canvas.style.setProperty('transform',"scale(".concat(scale,") translate(").concat(newPanX,"px, ").concat(newPanY,"px)"),'important');}}});document.addEventListener('mouseup',function(){if(isPanning){var canvas=roomMockupDiv.querySelector('canvas');if(canvas){canvas.style.cursor='grab';}isPanning=false;}});// Set cursor to grab when hovering over canvas
roomMockupDiv.addEventListener('mouseover',function(e){var canvas=roomMockupDiv.querySelector('canvas');if(canvas&&e.target===canvas&&!isPanning){canvas.style.cursor='grab';}});// Add mouse wheel zoom (Magic Mouse and trackpad support)
roomMockupDiv.addEventListener('wheel',function(e){var canvas=roomMockupDiv.querySelector('canvas');if(canvas&&(e.target===canvas||e.target===roomMockupDiv)){e.preventDefault();// Get current zoom and pan
var currentScale=parseFloat(canvas.dataset.zoomScale||CLOTHING_ZOOM_DEFAULTS.defaultScale.toString());var panX=parseFloat(canvas.dataset.panX||'0');var panY=parseFloat(canvas.dataset.panY||'0');// Calculate new zoom level
var zoomIntensity=0.05;var delta=-Math.sign(e.deltaY);var minScale=0.25;var maxScale=2.0;var newScale=Math.min(maxScale,Math.max(minScale,currentScale+delta*zoomIntensity));if(newScale!==currentScale){// Get mouse position relative to canvas
var rect=canvas.getBoundingClientRect();var mouseX=e.clientX-rect.left-rect.width/2;var mouseY=e.clientY-rect.top-rect.height/2;// Adjust pan to zoom toward mouse cursor
var scaleDelta=newScale/currentScale-1;var newPanX=panX-mouseX*scaleDelta;var newPanY=panY-mouseY*scaleDelta;// Update zoom and pan
canvas.dataset.zoomScale=newScale.toFixed(2);canvas.dataset.panX=newPanX.toString();canvas.dataset.panY=newPanY.toString();appState.savedZoomScale=newScale;appState.savedPanX=newPanX;appState.savedPanY=newPanY;canvas.style.setProperty('transform',"scale(".concat(newScale,") translate(").concat(newPanX,"px, ").concat(newPanY,"px)"),'important');}}},{passive:false});roomMockupDiv.appendChild(zoomControls);console.log('✅ Added zoom controls (minus, reset, plus), pan (click & drag), and mouse wheel zoom for clothing mockup');}function addInteractiveZoom(){console.log("🔍 Adding interactive zoom to clothing preview");var roomMockup=document.getElementById('roomMockup');if(!roomMockup){console.error("❌ Room mockup container not found");return;}// ✅ Only enable zoom for clothing mode (NOT furniture-simple mode)
// Check for CLOTHING mode specifically, not just SIMPLE_MODE (which is also used for furniture-simple)
var isClothingMode=window.COLORFLEX_MODE==='CLOTHING'||window.COLORFLEX_SIMPLE_MODE===true&&window.COLORFLEX_MODE!=='FURNITURE';if(!isClothingMode){console.log("✅ Zoom disabled - not in clothing mode");return;// Exit early if not clothing mode
}// ✅ Add debouncing to prevent rapid clicks
var isZoomInProgress=false;var lastClickTime=0;var MIN_CLICK_INTERVAL=500;// Minimum 500ms between clicks
// Helper function to get current zoom state from canvas (CSS transform system)
function getClothingZoomState(){var canvas=roomMockup.querySelector('canvas');if(!canvas){return{scale:CLOTHING_ZOOM_DEFAULTS.defaultScale,panX:CLOTHING_ZOOM_DEFAULTS.defaultPanX,panY:CLOTHING_ZOOM_DEFAULTS.defaultPanY,isZoomed:false};}var scale=parseFloat(canvas.dataset.zoomScale||CLOTHING_ZOOM_DEFAULTS.defaultScale.toString());var panX=parseFloat(canvas.dataset.panX||CLOTHING_ZOOM_DEFAULTS.defaultPanX.toString());var panY=parseFloat(canvas.dataset.panY||CLOTHING_ZOOM_DEFAULTS.defaultPanY.toString());var isZoomed=scale>CLOTHING_ZOOM_DEFAULTS.defaultScale;// Consider zoomed if scale > default
return{scale:scale,panX:panX,panY:panY,isZoomed:isZoomed};}// Set initial cursor based on actual canvas zoom state
function updateClothingCursor(){var zoomState=getClothingZoomState();roomMockup.style.cursor=zoomState.isZoomed?'zoom-out':'zoom-in';console.log("\u2705 Set clothing cursor: ".concat(zoomState.isZoomed?'zoom-out':'zoom-in'," (scale: ").concat(zoomState.scale,")"));}// Update cursor initially
updateClothingCursor();// Also update cursor when canvas is added/updated (use MutationObserver)
var observer=new MutationObserver(function(){updateClothingCursor();});observer.observe(roomMockup,{childList:true,subtree:true});roomMockup.addEventListener('click',function(e){var currentTime=Date.now();// ✅ FIX: Prevent clicks on zoom controls from triggering zoom
if(e.target.closest('#clothingZoomControls')){console.log("🚫 Click on zoom controls - ignoring zoom handler");return;}// ✅ FIX: Only handle clicks on the canvas itself, not on other elements
var canvas=roomMockup.querySelector('canvas');if(!canvas){return;// No canvas, no zoom
}// Check if click is actually on the canvas
if(e.target!==canvas&&!canvas.contains(e.target)){console.log("🚫 Click not on canvas - ignoring");return;}// ✅ Debounce rapid clicks
if(currentTime-lastClickTime<MIN_CLICK_INTERVAL){console.log("🚫 Click ignored - too rapid");return;}// ✅ Prevent overlapping zoom operations
if(isZoomInProgress){console.log("🚫 Click ignored - zoom in progress");return;}lastClickTime=currentTime;isZoomInProgress=true;console.log("🖱️ Room mockup clicked (debounced)");// Double-check we're in clothing mode (NOT furniture-simple mode)
var isClothingMode=window.COLORFLEX_MODE==='CLOTHING'||window.COLORFLEX_SIMPLE_MODE===true&&window.COLORFLEX_MODE!=='FURNITURE';if(!isClothingMode){console.log("Not in clothing mode, ignoring click");isZoomInProgress=false;return;}// ✅ Fix: Only trigger zoom if clicking directly on canvas, not on child elements (like zoom controls)
var clickTarget=e.target;if(clickTarget!==canvas&&!canvas.contains(clickTarget)){console.log("🚫 Click ignored - not on canvas (clicked on:",clickTarget.tagName,")");isZoomInProgress=false;return;}// Get click position relative to roomMockup container
var rect=roomMockup.getBoundingClientRect();var x=e.clientX-rect.left;var y=e.clientY-rect.top;// Get actual canvas dimensions
var canvasWidth=canvas.width;var canvasHeight=canvas.height;console.log("\uD83D\uDCD0 Canvas dimensions: ".concat(canvasWidth,"x").concat(canvasHeight));// Get current zoom state from canvas (CSS transform system)
// Get current zoom state from canvas (CSS transform system)
var currentState=getClothingZoomState();var currentScale=currentState.scale;var currentPanX=currentState.panX;var currentPanY=currentState.panY;console.log("\uD83D\uDD0D Current zoom state - scale: ".concat(currentScale,", pan: (").concat(currentPanX,", ").concat(currentPanY,")"));// Use clothing zoom defaults
var DEFAULT_SCALE=CLOTHING_ZOOM_DEFAULTS.defaultScale;var ZOOM_SCALE=CLOTHING_ZOOM_DEFAULTS.zoomScale;if(currentState.isZoomed){// Zoom out to default
console.log("\uD83D\uDD0D Zooming out to default scale (".concat(CLOTHING_ZOOM_DEFAULTS.defaultScale,")"));// Reset to default scale and center position
canvas.dataset.zoomScale=CLOTHING_ZOOM_DEFAULTS.defaultScale.toFixed(2);canvas.dataset.panX=CLOTHING_ZOOM_DEFAULTS.defaultPanX.toString();canvas.dataset.panY=CLOTHING_ZOOM_DEFAULTS.defaultPanY.toString();appState.savedZoomScale=CLOTHING_ZOOM_DEFAULTS.defaultScale;appState.savedPanX=CLOTHING_ZOOM_DEFAULTS.defaultPanX;appState.savedPanY=CLOTHING_ZOOM_DEFAULTS.defaultPanY;canvas.style.setProperty('transform',"scale(".concat(CLOTHING_ZOOM_DEFAULTS.defaultScale,")"),'important');canvas.style.setProperty('transform-origin','center','important');roomMockup.style.cursor='zoom-in';console.log("\u2705 Clothing zoomed out to ".concat(CLOTHING_ZOOM_DEFAULTS.defaultScale*100,"%"));}else{// Zoom in to click point
console.log("\uD83D\uDD0D Zooming in to click point");// Calculate click position in canvas coordinates (accounting for current scale)
// The click position needs to be relative to the container center
var containerCenterX=rect.width/2;var containerCenterY=rect.height/2;// Calculate offset from center
var offsetX=x-containerCenterX;var offsetY=y-containerCenterY;// Calculate pan to center the clicked point
// When zooming from scale S1 to S2, we need to pan by: offset * (1 - S1/S2)
var scaleRatio=CLOTHING_ZOOM_DEFAULTS.defaultScale/CLOTHING_ZOOM_DEFAULTS.zoomScale;var newPanX=-offsetX*(1-scaleRatio)/CLOTHING_ZOOM_DEFAULTS.defaultScale;var newPanY=-offsetY*(1-scaleRatio)/CLOTHING_ZOOM_DEFAULTS.defaultScale;// Apply zoom
canvas.dataset.zoomScale=CLOTHING_ZOOM_DEFAULTS.zoomScale.toFixed(2);canvas.dataset.panX=newPanX.toFixed(2);canvas.dataset.panY=newPanY.toFixed(2);appState.savedZoomScale=CLOTHING_ZOOM_DEFAULTS.zoomScale;appState.savedPanX=newPanX;appState.savedPanY=newPanY;canvas.style.setProperty('transform',"scale(".concat(CLOTHING_ZOOM_DEFAULTS.zoomScale,") translate(").concat(newPanX,"px, ").concat(newPanY,"px)"),'important');canvas.style.setProperty('transform-origin','center','important');roomMockup.style.cursor='zoom-out';console.log("\u2705 Clothing zoomed in to ".concat(CLOTHING_ZOOM_DEFAULTS.zoomScale*100,"% at pan (").concat(newPanX.toFixed(2),", ").concat(newPanY.toFixed(2),")"));}// Update cursor
updateClothingCursor();// Mark operation as complete
isZoomInProgress=false;console.log("✅ Zoom operation completed (clothing)");// Mark operation as complete
isZoomInProgress=false;console.log("✅ Zoom operation completed (clothing)");});}// Also add this debug function to test zoom manually:
function testZoom(){console.log("🧪 Testing zoom functionality");console.log("Current furnitureViewSettings:",furnitureViewSettings);// Test zoom in
furnitureViewSettings.isZoomed=true;furnitureViewSettings.scale=2.2;furnitureViewSettings.offsetX=-100;furnitureViewSettings.offsetY=-50;console.log("Updated furnitureViewSettings:",furnitureViewSettings);// Trigger re-render
if(typeof updateFurniturePreview==='function'){console.log("Calling updateFurniturePreview...");updateFurniturePreview();}else{console.error("updateFurniturePreview function not found!");}}// DOM references
var dom={patternName:document.getElementById("patternName"),collectionHeader:document.getElementById("collectionHeader"),collectionThumbnails:document.getElementById("collectionThumbnails"),layerInputsContainer:document.getElementById("layerInputsContainer"),curatedColorsContainer:document.getElementById("curatedColorsContainer"),coordinatesContainer:document.getElementById("coordinatesContainer"),preview:document.getElementById("preview"),roomMockup:document.getElementById("roomMockup"),printButton:document.getElementById("printButton")// Assuming a button exists
};// Chameleon loader removed - December 3, 2025
// Validate DOM elements and report missing ones
function validateDOMElements(){console.log("🔍 DOM Validation:");Object.entries(dom).forEach(function(_ref3){var _ref4=_slicedToArray(_ref3,2),key=_ref4[0],element=_ref4[1];if(element){console.log("  \u2705 ".concat(key,": found"));}else{console.error("  \u274C ".concat(key,": NOT FOUND - missing element with id \"").concat(key,"\""));}});}// Watch changes to patternName
var patternNameElement=document.getElementById("patternName");Object.defineProperty(dom,'patternName',{get:function get(){return patternNameElement;},set:function set(value){console.log("Setting #patternName to:",value,"Caller:",new Error().stack.split('\n')[2].trim());patternNameElement.innerHTML=value;},configurable:true});// Debug function to check what's happening with collection names
window.debugCollectionName=function(){var _appState$selectedCol,_appState$currentPatt,_appState$selectedCol4,_appState$currentPatt2,_appState$originalCol4;console.log("\uD83D\uDD0D COLLECTION NAME DEBUG:");console.log("========================");console.log("Current collection name: \"".concat((_appState$selectedCol=appState.selectedCollection)===null||_appState$selectedCol===void 0?void 0:_appState$selectedCol.name,"\""));console.log("Current pattern name: \"".concat((_appState$currentPatt=appState.currentPattern)===null||_appState$currentPatt===void 0?void 0:_appState$currentPatt.name,"\""));console.log("Furniture mode: ".concat(appState.furnitureMode));if(appState.furnitureMode){var _appState$originalCol,_appState$originalCol2,_appState$selectedCol2;console.log("Original collection: \"".concat((_appState$originalCol=appState.originalCollection)===null||_appState$originalCol===void 0?void 0:_appState$originalCol.name,"\""));console.log("Original collection exists: ".concat(!!((_appState$originalCol2=appState.originalCollection)!==null&&_appState$originalCol2!==void 0&&_appState$originalCol2.fullCollection)));// Check if we can get the original collection name from the furniture collection
var originalFromFurniture=(_appState$selectedCol2=appState.selectedCollection)===null||_appState$selectedCol2===void 0?void 0:_appState$selectedCol2.originalCollectionName;console.log("Original collection from furniture collection: \"".concat(originalFromFurniture,"\""));}// Test what the path should be
if(appState.selectedCollection&&appState.currentPattern){var collectionNameForPaths;if(appState.furnitureMode){var _appState$originalCol3,_appState$selectedCol3;// Try multiple ways to get the original collection name
collectionNameForPaths=((_appState$originalCol3=appState.originalCollection)===null||_appState$originalCol3===void 0?void 0:_appState$originalCol3.name)||((_appState$selectedCol3=appState.selectedCollection)===null||_appState$selectedCol3===void 0?void 0:_appState$selectedCol3.originalCollectionName)||"UNKNOWN";}else{collectionNameForPaths=appState.selectedCollection.name;}var patternName=appState.currentPattern.name;var slug=createPatternSlug(patternName);console.log("Expected path structure:");console.log("  Collection for paths: \"".concat(collectionNameForPaths,"\""));console.log("  Pattern: \"".concat(patternName,"\""));console.log("  Slug: \"".concat(slug,"\""));console.log("  Should be: data/furniture/sofa-capitol/patterns/".concat(collectionNameForPaths,"/").concat(slug,"/"));if(collectionNameForPaths==="UNKNOWN"){console.error("\u274C Cannot determine original collection name!");console.error("   This is why paths are broken.");}}return{selectedCollection:(_appState$selectedCol4=appState.selectedCollection)===null||_appState$selectedCol4===void 0?void 0:_appState$selectedCol4.name,currentPattern:(_appState$currentPatt2=appState.currentPattern)===null||_appState$currentPatt2===void 0?void 0:_appState$currentPatt2.name,furnitureMode:appState.furnitureMode,originalCollection:(_appState$originalCol4=appState.originalCollection)===null||_appState$originalCol4===void 0?void 0:_appState$originalCol4.name};};window.getAppState=function(){var _appState$selectedCol5,_appState$currentPatt3,_appState$originalCol5,_appState$collections2;return{selectedCollection:(_appState$selectedCol5=appState.selectedCollection)===null||_appState$selectedCol5===void 0?void 0:_appState$selectedCol5.name,currentPattern:(_appState$currentPatt3=appState.currentPattern)===null||_appState$currentPatt3===void 0?void 0:_appState$currentPatt3.name,furnitureMode:appState.furnitureMode,originalCollection:(_appState$originalCol5=appState.originalCollection)===null||_appState$originalCol5===void 0?void 0:_appState$originalCol5.name,collections:(_appState$collections2=appState.collections)===null||_appState$collections2===void 0?void 0:_appState$collections2.map(function(c){return c.name;}),furnitureConfigLoaded:!!furnitureConfig};};window.fixOriginalCollection=function(originalCollectionName){var _appState$selectedCol6;console.log("\uD83D\uDD27 QUICK FIX: Setting original collection to \"".concat(originalCollectionName,"\""));if(!appState.originalCollection){appState.originalCollection={};}appState.originalCollection.name=originalCollectionName;// Also store it in the furniture collection for future reference
if(appState.selectedCollection){appState.selectedCollection.originalCollectionName=originalCollectionName;}console.log("\u2705 Fixed! Original collection name is now: \"".concat(appState.originalCollection.name,"\""));console.log("Run debugCollectionName() to verify the fix.");return{originalCollection:appState.originalCollection.name,furnitureCollection:(_appState$selectedCol6=appState.selectedCollection)===null||_appState$selectedCol6===void 0?void 0:_appState$selectedCol6.originalCollectionName};};// Status check accessible from console
window.checkStatus=function(){var _appState$selectedCol7,_appState$collections3,_appState$originalCol6;console.log("\uD83D\uDD0D FURNITURE IMPLEMENTATION STATUS CHECK:");console.log("======================================");// Check if furniture config is loaded
if(!furnitureConfig){console.log("\u274C furnitureConfig not loaded");return{error:"furnitureConfig not loaded"};}console.log("\u2705 furnitureConfig loaded: ".concat(Object.keys(furnitureConfig).length," furniture pieces"));// Check collections
if(!appState.collections||appState.collections.length===0){console.log("\u274C Collections not loaded");return{error:"Collections not loaded"};}console.log("\u2705 Collections loaded: ".concat(appState.collections.length," collections"));// Check current state
var currentCollection=(_appState$selectedCol7=appState.selectedCollection)===null||_appState$selectedCol7===void 0?void 0:_appState$selectedCol7.name;if(!currentCollection){console.log("\u274C No collection currently selected");return{error:"No collection selected"};}console.log("\u2705 Current collection: ".concat(currentCollection));// Check compatibility
var compatible=getCompatibleFurniture(currentCollection);console.log("\u2705 Compatible furniture: ".concat(compatible.length," pieces"));compatible.forEach(function(f){return console.log("   - ".concat(f.name));});// Check if Try Furniture button should be visible
var tryButton=document.getElementById('tryFurnitureBtn');var backButton=document.getElementById('backToPatternsBtn');if(appState.furnitureMode){console.log("\uD83E\uDE91 Currently in FURNITURE MODE");console.log("   Back button present: ".concat(!!backButton));}else{console.log("\uD83C\uDFA8 Currently in PATTERN MODE");console.log("   Try Furniture button present: ".concat(!!tryButton));if(!tryButton&&compatible.length>0){console.log("\u26A0\uFE0F  Try Furniture button should be visible but isn't!");}}return{furnitureConfigLoaded:!!furnitureConfig,collectionsLoaded:((_appState$collections3=appState.collections)===null||_appState$collections3===void 0?void 0:_appState$collections3.length)>0,currentCollection:currentCollection,compatibleFurniture:compatible.length,furnitureMode:appState.furnitureMode,tryButtonPresent:!!tryButton,backButtonPresent:!!backButton,originalCollection:(_appState$originalCol6=appState.originalCollection)===null||_appState$originalCol6===void 0?void 0:_appState$originalCol6.name};};function ensureButtonsAfterUpdate(){// Small delay to ensure DOM update is complete
setTimeout(function(){if(!appState.furnitureMode&&!document.getElementById('tryFurnitureBtn')){if(window.COLORFLEX_DEBUG){console.log("🔄 Re-adding Try Fabric button after room mockup update");}addTryFurnitureButton();}if(appState.furnitureMode&&!document.getElementById('backToPatternsBtn')){if(window.COLORFLEX_DEBUG){console.log("🔄 Re-adding Back to Patterns button after room mockup update");}addBackToPatternsButton();}},50);}// Test pattern slug generation
window.testSlug=function(patternName){var slug=createPatternSlug(patternName);console.log("Pattern: \"".concat(patternName,"\" \u2192 Slug: \"").concat(slug,"\""));return slug;};// Simple state viewer
window.viewState=function(){var _appState$selectedCol8,_appState$currentPatt4,_appState$originalCol7,_appState$selectedCol9;var state={selectedCollection:(_appState$selectedCol8=appState.selectedCollection)===null||_appState$selectedCol8===void 0?void 0:_appState$selectedCol8.name,currentPattern:(_appState$currentPatt4=appState.currentPattern)===null||_appState$currentPatt4===void 0?void 0:_appState$currentPatt4.name,furnitureMode:appState.furnitureMode,originalCollection:(_appState$originalCol7=appState.originalCollection)===null||_appState$originalCol7===void 0?void 0:_appState$originalCol7.name,patterns:(_appState$selectedCol9=appState.selectedCollection)===null||_appState$selectedCol9===void 0||(_appState$selectedCol9=_appState$selectedCol9.patterns)===null||_appState$selectedCol9===void 0?void 0:_appState$selectedCol9.length,furnitureConfig:Object.keys(furnitureConfig||{})};console.table(state);return state;};// Debug functions available in development mode only
if(window.location.hostname==='localhost'||window.location.hostname.includes('dev')){console.log("\n\uD83D\uDD27 DEBUG FUNCTIONS LOADED!\n=========================\n\nAvailable console commands:\n\u2022 debugCollectionName() - Debug collection name issues\n\u2022 fixOriginalCollection(\"botanicals\") - Quick fix for collection name\n\u2022 checkStatus() - Check implementation status  \n\u2022 viewState() - View current app state\n\u2022 testSlug(\"Pattern Name\") - Test slug conversion\n\u2022 getAppState() - Get simplified app state\n\nTry running: debugCollectionName()\n");}// Create pattern slug from pattern name
function createPatternSlug(patternName){if(!patternName||typeof patternName!=='string'){return'';}return patternName.toLowerCase().replace(/[^a-z0-9\s-]/g,'')// Remove special characters
.replace(/\s+/g,'-')// Replace spaces with hyphens
.replace(/-+/g,'-')// Remove multiple consecutive hyphens
.replace(/^-|-$/g,'')// Remove leading/trailing hyphens
.trim();}window.simpleDebug=function(){console.log("\uD83D\uDD0D SIMPLE DEBUG:");console.log("================");if(appState.furnitureMode){var _appState$selectedCol0,_appState$selectedCol1,_appState$currentPatt5,_appState$selectedCol10;console.log("In furniture mode: YES");console.log("Current collection: \"".concat((_appState$selectedCol0=appState.selectedCollection)===null||_appState$selectedCol0===void 0?void 0:_appState$selectedCol0.name,"\""));console.log("Stored original collection: \"".concat((_appState$selectedCol1=appState.selectedCollection)===null||_appState$selectedCol1===void 0?void 0:_appState$selectedCol1.originalCollectionName,"\""));console.log("Current pattern: \"".concat((_appState$currentPatt5=appState.currentPattern)===null||_appState$currentPatt5===void 0?void 0:_appState$currentPatt5.name,"\""));if((_appState$selectedCol10=appState.selectedCollection)!==null&&_appState$selectedCol10!==void 0&&_appState$selectedCol10.originalCollectionName){var _appState$currentPatt6;var slug=createPatternSlug(((_appState$currentPatt6=appState.currentPattern)===null||_appState$currentPatt6===void 0?void 0:_appState$currentPatt6.name)||"test");console.log("\u2705 Path should be: data/furniture/sofa-capitol/patterns/".concat(appState.selectedCollection.originalCollectionName,"/").concat(slug,"/"));}else{console.log("\u274C No original collection name stored!");}}else{var _appState$selectedCol11;console.log("In furniture mode: NO");console.log("Current collection: \"".concat((_appState$selectedCol11=appState.selectedCollection)===null||_appState$selectedCol11===void 0?void 0:_appState$selectedCol11.name,"\""));}};// Quick fix function:
window.quickFix=function(){var _appState$selectedCol12;if(appState.furnitureMode&&!((_appState$selectedCol12=appState.selectedCollection)!==null&&_appState$selectedCol12!==void 0&&_appState$selectedCol12.originalCollectionName)){var _appState$selectedCol13;// Try to guess the original collection from the furniture collection name
var furnitureCollectionName=(_appState$selectedCol13=appState.selectedCollection)===null||_appState$selectedCol13===void 0?void 0:_appState$selectedCol13.name;if(furnitureCollectionName&&furnitureCollectionName.includes("BOTANICAL")){appState.selectedCollection.originalCollectionName="botanicals";console.log("\uD83D\uDD27 Quick fix: Set original collection to \"botanicals\"");return true;}}return false;};window.fixPatternPaths=function(){if(appState.furnitureMode&&appState.currentPattern){var originalCollectionName=appState.selectedCollection.originalCollectionName;var _furnitureConfig=appState.selectedCollection.furnitureConfig;console.log("\uD83D\uDD27 Regenerating pattern paths:");console.log("   Collection: ".concat(originalCollectionName));console.log("   Pattern: ".concat(appState.currentPattern.name));// Re-create the furniture pattern with correct paths
var correctedPattern=createFurniturePattern(appState.currentPattern.originalPattern||appState.currentPattern,_furnitureConfig,originalCollectionName);// Update the current pattern
appState.currentPattern=correctedPattern;// Update in the collection too
var patternIndex=appState.selectedCollection.patterns.findIndex(function(p){return p.id===correctedPattern.id;});if(patternIndex!==-1){appState.selectedCollection.patterns[patternIndex]=correctedPattern;}console.log("\u2705 Pattern paths regenerated");return correctedPattern;}};// Cache for furniture compatibility checks to improve performance
var furnitureCompatibilityCache=new Map();var addFurnitureButtonDebounce=null;// ============================================================================
// SECTION 4: FURNITURE MODE SYSTEM
// ============================================================================
// Furniture mockup system: furniture selection, path resolution, rendering.
// Handles -furX collection variants and furniture-specific canvas rendering.
// ============================================================================
function getCompatibleFurniture(collectionName){// Check cache first to avoid repeated computations
if(furnitureCompatibilityCache.has(collectionName)){return furnitureCompatibilityCache.get(collectionName);}// Reduced logging for performance
if(window.COLORFLEX_DEBUG){console.log("\uD83E\uDE91 Checking furniture compatibility for collection: ".concat(collectionName));}if(!furnitureConfig){// Don't spam the console - only warn once per collection
if(!furnitureCompatibilityCache.has(collectionName+'_warned')){console.warn("Furniture config not loaded yet");furnitureCompatibilityCache.set(collectionName+'_warned',true);}return[];}var compatible=Object.entries(furnitureConfig).filter(function(_ref5){var _ref6=_slicedToArray(_ref5,2),furnitureId=_ref6[0],config=_ref6[1];var isCompatible=config.compatibleCollections&&config.compatibleCollections.includes(collectionName);return isCompatible;}).map(function(_ref7){var _ref8=_slicedToArray(_ref7,2),furnitureId=_ref8[0],config=_ref8[1];return{id:furnitureId,name:config.name,thumbnail:config.thumbnail,description:config.description||'',config:config};});// Cache the result for future use
furnitureCompatibilityCache.set(collectionName,compatible);if(window.COLORFLEX_DEBUG){console.log("Found ".concat(compatible.length," compatible furniture pieces"));}return compatible;}function addTryFurnitureButtonDebounced(){// Debounce to prevent excessive calls
if(addFurnitureButtonDebounce){clearTimeout(addFurnitureButtonDebounce);}addFurnitureButtonDebounce=setTimeout(function(){addTryFurnitureButtonInternal();},100);// 100ms delay
}// Legacy function name for backward compatibility
function addTryFurnitureButton(){addTryFurnitureButtonDebounced();}function addTryFurnitureButtonInternal(){var _appState$selectedCol14;// Performance optimization - avoid excessive logging unless in debug mode
if(window.COLORFLEX_DEBUG){console.log("🪑 Adding Try Fabric button");}// Remove existing button if present
var existingButton=document.getElementById('tryFurnitureBtn');if(existingButton){existingButton.remove();}// Check compatibility
var currentCollection=(_appState$selectedCol14=appState.selectedCollection)===null||_appState$selectedCol14===void 0?void 0:_appState$selectedCol14.name;if(!currentCollection){if(window.COLORFLEX_DEBUG){console.log("No current collection, skipping furniture button");}return;}// Skip for clothing collections - they auto-show mockup without button
if(currentCollection.includes('-clo')){if(window.COLORFLEX_DEBUG){console.log("Clothing collection - skipping Try Furniture button");}return;}var compatibleFurniture=getCompatibleFurniture(currentCollection);if(compatibleFurniture.length===0){if(window.COLORFLEX_DEBUG){console.log("No compatible furniture found for",currentCollection);}return;}// Create button
var button=document.createElement('button');button.id='tryFurnitureBtn';button.className='try-furniture-btn';button.innerHTML="\n        <span class=\"furniture-icon\">\uD83E\uDE91</span>\n        <span class=\"button-text\">Try Fabric (".concat(compatibleFurniture.length,")</span>\n    ");// Add styles
button.style.cssText="\n        position: absolute;\n        bottom: 10px;\n        right: 10px;\n        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n        color: white;\n        border: none;\n        padding: 12px 18px;\n        border-radius: 25px;\n        font-family: 'Special Elite', monospace;\n        font-size: 14px;\n        font-weight: bold;\n        cursor: pointer;\n        box-shadow: 0 4px 15px rgba(0,0,0,0.2);\n        transition: all 0.3s ease;\n        display: flex;\n        align-items: center;\n        gap: 8px;\n        z-index: 100;\n    ";// Add hover effects
button.addEventListener('mouseenter',function(){button.style.transform='translateY(-2px)';button.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)';});button.addEventListener('mouseleave',function(){button.style.transform='translateY(0)';button.style.boxShadow='0 4px 15px rgba(0,0,0,0.2)';});// Add click handler
button.addEventListener('click',function(){showFurnitureModal(compatibleFurniture);});// Find the room mockup container and add button
var roomMockup=document.getElementById('roomMockup');if(roomMockup){// Make sure the container is positioned relatively
if(getComputedStyle(roomMockup).position==='static'){roomMockup.style.position='relative';}roomMockup.appendChild(button);console.log("✅ Try Furniture button added to room mockup");}else{console.error("❌ Could not find room mockup container");}}// 3. showFurnitureModal function (also referenced but missing)
function showFurnitureModal(compatibleFurniture){console.log("🪑 Showing furniture modal with",compatibleFurniture.length,"options");// Remove existing modal
var existingModal=document.getElementById('furnitureModal');if(existingModal){existingModal.remove();}// Create modal overlay
var modalOverlay=document.createElement('div');modalOverlay.id='furnitureModal';modalOverlay.style.cssText="\n        position: fixed;\n        top: 0;\n        left: 0;\n        width: 100%;\n        height: 100%;\n        background: rgba(0, 0, 0, 0.7);\n        display: flex;\n        justify-content: center;\n        align-items: center;\n        z-index: 1000;\n        animation: fadeIn 0.3s ease;\n    ";// Create modal content
var modalContent=document.createElement('div');modalContent.style.cssText="\n        background: white;\n        border-radius: 15px;\n        padding: 30px;\n        max-width: 600px;\n        width: 90%;\n        max-height: 80%;\n        overflow-y: auto;\n        box-shadow: 0 20px 60px rgba(0,0,0,0.3);\n        animation: slideUp 0.3s ease;\n    ";// Modal header
var header=document.createElement('div');header.innerHTML="\n        <h2 style=\"margin: 0 0 20px 0; font-family: 'Special Elite', monospace; color: #333; text-align: center;\">\n            Choose Furniture for ".concat(toInitialCaps(appState.selectedCollection.name),"\n        </h2>\n    ");// Furniture grid
var furnitureGrid=document.createElement('div');furnitureGrid.style.cssText="\n        display: grid;\n        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n        gap: 20px;\n        margin-bottom: 20px;\n    ";// Add furniture options
compatibleFurniture.forEach(function(furniture){var furnitureCard=document.createElement('div');furnitureCard.style.cssText="\n            border: 2px solid #e0e0e0;\n            border-radius: 10px;\n            padding: 15px;\n            text-align: center;\n            cursor: pointer;\n            transition: all 0.3s ease;\n            background: white;\n        ";furnitureCard.innerHTML="\n            <img src=\"".concat(normalizePath(furniture.thumbnail),"\" alt=\"").concat(furniture.name,"\" \n                 style=\"width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;\"\n                 onerror=\"this.style.background='#f0f0f0'; this.style.display='flex'; this.style.alignItems='center'; this.style.justifyContent='center'; this.innerHTML='\uD83E\uDE91';\">\n            <h3 style=\"margin: 10px 0 5px 0; font-family: 'Special Elite', monospace; font-size: 16px;\">").concat(furniture.name,"</h3>\n            <p style=\"margin: 0; font-size: 12px; color: #666; line-height: 1.4;\">").concat(furniture.description,"</p>\n        ");// Hover effects
furnitureCard.addEventListener('mouseenter',function(){furnitureCard.style.borderColor='#667eea';furnitureCard.style.transform='translateY(-2px)';furnitureCard.style.boxShadow='0 8px 25px rgba(0,0,0,0.1)';});furnitureCard.addEventListener('mouseleave',function(){furnitureCard.style.borderColor='#e0e0e0';furnitureCard.style.transform='translateY(0)';furnitureCard.style.boxShadow='none';});// Click handler
furnitureCard.addEventListener('click',function(){selectFurnitureObject(furniture);modalOverlay.remove();});furnitureGrid.appendChild(furnitureCard);});// Cancel button
var cancelButton=document.createElement('button');cancelButton.textContent='Cancel';cancelButton.style.cssText="\n        background: #ccc;\n        color: #333;\n        border: none;\n        padding: 10px 20px;\n        border-radius: 5px;\n        cursor: pointer;\n        font-family: 'Special Elite', monospace;\n        display: block;\n        margin: 0 auto;\n    ";cancelButton.addEventListener('click',function(){modalOverlay.remove();});// Assemble modal
modalContent.appendChild(header);modalContent.appendChild(furnitureGrid);modalContent.appendChild(cancelButton);modalOverlay.appendChild(modalContent);// Close on overlay click
modalOverlay.addEventListener('click',function(e){if(e.target===modalOverlay){modalOverlay.remove();}});// Add CSS animations
var style=document.createElement('style');style.textContent="\n        @keyframes fadeIn {\n            from { opacity: 0; }\n            to { opacity: 1; }\n        }\n        @keyframes slideUp {\n            from { transform: translateY(50px); opacity: 0; }\n            to { transform: translateY(0); opacity: 1; }\n        }\n    ";document.head.appendChild(style);document.body.appendChild(modalOverlay);}// 4. selectFurniture function
function selectFurnitureObject(selectedFurniture){console.log("🪑 Selected furniture object:",selectedFurniture.name);console.log("🧵 Full furniture object:",selectedFurniture);// Store selected furniture in appState
appState.selectedFurniture=selectedFurniture;appState.isInFabricMode=selectedFurniture.name==="Fabric";// Direct check for fabric name
if(selectedFurniture.name==="Fabric"){console.log("🧵 ================================");console.log("🧵 FABRIC NAME DETECTED - CALLING FABRIC MOCKUP");console.log("🧵 ================================");renderFabricMockup();return;}// Switch to furniture mode for actual furniture
console.log("🪑 Regular furniture selected, switching to furniture mode");switchToFurnitureMode(selectedFurniture);}// 5. addBackToPatternsButton function
function addBackToPatternsButton(){var _appState$selectedCol15,_appState$selectedCol16;console.log("🔙 addBackToPatternsButton() called");// Don't show "Back to Patterns" button in clothing mode (it's only for furniture mode)
var isClothingMode=((_appState$selectedCol15=appState.selectedCollection)===null||_appState$selectedCol15===void 0||(_appState$selectedCol15=_appState$selectedCol15.name)===null||_appState$selectedCol15===void 0?void 0:_appState$selectedCol15.includes('-clo'))||((_appState$selectedCol16=appState.selectedCollection)===null||_appState$selectedCol16===void 0||(_appState$selectedCol16=_appState$selectedCol16.name)===null||_appState$selectedCol16===void 0?void 0:_appState$selectedCol16.includes('.clo-'));if(isClothingMode){console.log("👗 Skipping Back to Patterns button in clothing mode");return;}var existingButton=document.getElementById('backToPatternsBtn');if(existingButton){console.log("🗑️ Removing existing back button");existingButton.remove();}var button=document.createElement('button');button.id='backToPatternsBtn';button.innerHTML="\n        <span>\u2190 Back to Patterns</span>\n    ";button.style.cssText="\n        position: absolute;\n        bottom: 10px;\n        left: 10px;\n        background: linear-gradient(135deg, #ff7b7b 0%, #667eea 100%);\n        color: white;\n        border: none;\n        padding: 12px 18px;\n        border-radius: 25px;\n        font-family: 'Special Elite', monospace;\n        font-size: 14px;\n        font-weight: bold;\n        cursor: pointer;\n        box-shadow: 0 4px 15px rgba(0,0,0,0.2);\n        transition: all 0.3s ease;\n        z-index: 100;\n    ";console.log("🔗 Adding click event listener to back button");button.addEventListener('click',function(event){console.log("🔙 Back button clicked!");event.stopPropagation();// Prevent zoom handler from receiving this event
event.preventDefault();// Prevent any default behavior
// Check if we're in fabric mode or furniture mode
if(appState.isInFabricMode){console.log("🧵 Returning from fabric mode to patterns");returnToPatternsModeFromFabric();}else{console.log("🪑 Returning from furniture mode to patterns");returnToPatternsMode();}});var roomMockup=document.getElementById('roomMockup');if(roomMockup){var _document$getElementB3;roomMockup.appendChild(button);console.log("✅ Back button added to DOM");// Test if button is actually clickable
console.log("🧪 Button in DOM:",document.getElementById('backToPatternsBtn'));console.log("🧪 Button parent:",(_document$getElementB3=document.getElementById('backToPatternsBtn'))===null||_document$getElementB3===void 0?void 0:_document$getElementB3.parentElement);}else{console.error("❌ roomMockup not found!");}}// Function to return from fabric mode to patterns mode
function returnToPatternsModeFromFabric(){console.log("🧵 Returning from fabric mode to patterns");// Clear fabric mode state
appState.selectedFurniture=null;appState.isInFabricMode=false;// Remove back button
var backButton=document.getElementById('backToPatternsBtn');if(backButton){backButton.remove();}// Remove fabric tuning controls
removeFabricTuningControls();// Re-add try furniture button
addTryFurnitureButton();// Trigger room mockup update to show regular pattern view
if(appState.currentPattern){// ✅ MODE CHECK: Use correct render function based on mode
var isFurnitureMode=window.COLORFLEX_MODE==='FURNITURE'||appState.isInFurnitureMode;var isClothingMode=window.COLORFLEX_MODE==='CLOTHING'||window.COLORFLEX_SIMPLE_MODE===true&&window.location.pathname.includes('clothing');if(isFurnitureMode){updateFurniturePreview();}else if(isClothingMode){renderFabricMockup();}else{updateRoomMockup();}}console.log("✅ Returned from fabric mode to patterns mode");}// 6. initializeTryFurnitureFeature function
function initializeTryFurnitureFeature(){console.log("🪑 Initializing Try Furniture feature");// Add the button when a collection is loaded
if(appState.selectedCollection&&!appState.furnitureMode){addTryFurnitureButton();}}// Resolve furniture pattern paths using collection-based structure
function resolveFurniturePatternPaths(furnitureConfig,collectionName,patternName,originalPatternLayers){console.log("\uD83D\uDD0D Resolving furniture pattern paths:");console.log("   Collection: \"".concat(collectionName,"\""));console.log("   Pattern: \"".concat(patternName,"\""));// ✅ VALIDATION: Make sure we have a valid collection name
if(!collectionName||collectionName==="UNKNOWN"||collectionName===patternName){var _appState$selectedCol17;console.error("\u274C Invalid collection name: \"".concat(collectionName,"\""));console.error("   Pattern name: \"".concat(patternName,"\""));console.error("   These should be different!");// Try to get it from the current furniture collection
var fallbackCollectionName=(_appState$selectedCol17=appState.selectedCollection)===null||_appState$selectedCol17===void 0?void 0:_appState$selectedCol17.originalCollectionName;if(fallbackCollectionName){console.log("\uD83D\uDD27 Using fallback collection name: \"".concat(fallbackCollectionName,"\""));collectionName=fallbackCollectionName;}else{console.error("\u274C No fallback collection name available!");return[];}}var patternSlug=createPatternSlug(patternName);// Strip -fur suffix from collection name for furniture directory paths
// Directory structure uses base names (e.g., 'botanicals'), not suffixed names (e.g., 'botanicals-fur')
var baseCollectionName=collectionName.replace(/\-fur\d+$/,'');console.log("   Base collection name for path: \"".concat(baseCollectionName,"\""));// Replace template variables
var patternFolder=furnitureConfig.patternPathTemplate.replace('{collection}',baseCollectionName).replace('{patternSlug}',patternSlug);console.log("   Pattern slug: \"".concat(patternSlug,"\""));console.log("   \u2705 Final folder: \"".concat(patternFolder,"\""));// Map layers to furniture paths
var furniturePatternLayers=originalPatternLayers.map(function(layer,index){// Handle both path and file properties (different collection formats)
var layerPath=layer.path||layer.file;if(!layerPath){console.error("\u274C Layer ".concat(index," has no path or file property:"),layer);return null;}var originalFileName=layerPath.split('/').pop();var layerName=originalFileName.replace(/\.[^/.]+$/,'');var cleanLayerName=layerName.replace(/^[^_]*_/,'');// Remove everything before first underscore
var furnitureFileName="".concat(patternSlug,"_").concat(cleanLayerName,".png");var furniturePath="".concat(patternFolder).concat(furnitureFileName);return _objectSpread(_objectSpread({},layer),{},{path:furniturePath,originalPath:layerPath,furnitureFileName:furnitureFileName});}).filter(function(layer){return layer!==null;});return furniturePatternLayers;}function createFurniturePattern(originalPattern,furnitureConfig,collectionName){console.log("\uD83D\uDD04 Creating furniture pattern:");console.log("   Pattern: ".concat(originalPattern.name));console.log("   Collection: ".concat(collectionName));console.log("   Furniture: ".concat(furnitureConfig.name));// ✅ VERIFY: Make sure collectionName is correct
if(!collectionName||collectionName===originalPattern.name){console.error("\u274C COLLECTION NAME ERROR!");console.error("   Expected collection name like \"botanicals\"");console.error("   Got: \"".concat(collectionName,"\""));console.error("   Pattern name: \"".concat(originalPattern.name,"\""));console.error("   These should be different!");}var furniturePatternLayers=resolveFurniturePatternPaths(furnitureConfig,collectionName,// ← This should be "botanicals"
originalPattern.name,// ← This should be "Key Largo"
originalPattern.layers||[]);// ✅ CRITICAL FIX: Try to merge mockupLayers from variant collection (like folksie.fur-1)
// This ensures standard furniture page can use mockupLayers if they exist (like Folksie)
var mockupLayers=originalPattern.mockupLayers;// Start with original pattern's mockupLayers
if(!mockupLayers&&appState.allCollections){// Try to find furniture variant collection (e.g., folksie.fur-1, botanicals.fur-1)
var variantNames=[collectionName+'.fur-1',collectionName+'.fur',collectionName+'-fur-1',collectionName+'-fur'];console.log("\uD83D\uDD04 Looking for furniture variant collection to merge mockupLayers (trying: ".concat(variantNames.join(', '),")..."));var variantCollection=appState.allCollections.find(function(c){return c&&c.name&&variantNames.some(function(variantName){return c.name===variantName||c.name.toLowerCase()===variantName.toLowerCase();});});if(variantCollection){var _variantCollection$pa;console.log("\u2705 Found furniture variant collection \"".concat(variantCollection.name,"\""));// Find matching pattern in variant collection
var variantPattern=(_variantCollection$pa=variantCollection.patterns)===null||_variantCollection$pa===void 0?void 0:_variantCollection$pa.find(function(p){return p.slug===originalPattern.slug||p.id===originalPattern.id||p.name===originalPattern.name||p.name.toLowerCase()===originalPattern.name.toLowerCase();});if(variantPattern&&variantPattern.mockupLayers){console.log("\u2705 Found mockupLayers in variant collection, merging into furniture pattern");mockupLayers=variantPattern.mockupLayers;}else{console.log("  \u2139\uFE0F No mockupLayers found for pattern \"".concat(originalPattern.name,"\" in variant collection"));}}else{console.log("  \u2139\uFE0F No furniture variant collection found for \"".concat(collectionName,"\""));}}var furniturePattern=_objectSpread(_objectSpread({},originalPattern),{},{layers:furniturePatternLayers,mockupLayers:mockupLayers,// ✅ Include mockupLayers if found
isFurniture:true,furnitureConfig:furnitureConfig,originalPattern:originalPattern,collectionName:collectionName// Store collection name for reference
});console.log("\u2705 Created furniture pattern with ".concat(furniturePatternLayers.length," layers"));console.log("   mockupLayers: ".concat(mockupLayers?Array.isArray(mockupLayers)?"array (".concat(mockupLayers.length," items)"):'object':'none'));console.log("   Expected path pattern: data/furniture/.../patterns/".concat(collectionName,"/").concat(createPatternSlug(originalPattern.name),"/"));return furniturePattern;}// Updated switchToFurnitureMode function
function switchToFurnitureMode(furniture){console.log("🔄 Switching to furniture mode for:",furniture.name);// ✅ SIMPLE: Just grab the current collection name RIGHT NOW
var originalCollectionName=appState.selectedCollection.name;console.log("\uD83D\uDCDD Original collection name: \"".concat(originalCollectionName,"\""));// Store the ENTIRE original collection
appState.originalCollection=_objectSpread({},appState.selectedCollection);// Convert all patterns to furniture patterns using the CURRENT collection name
var furniturePatterns=appState.selectedCollection.patterns.map(function(pattern){return createFurniturePattern(pattern,furniture.config,originalCollectionName);});// Create virtual furniture collection
var furnitureCollection={name:"".concat(originalCollectionName.toUpperCase()," ").concat(furniture.name.toUpperCase()),patterns:furniturePatterns,curatedColors:appState.selectedCollection.curatedColors,coordinates:[],mockup:null,furnitureType:furniture.id,wallMask:furniture.config.wallMask||"default-wall-mask.png",// ← Ensure it's not null
// ✅ SIMPLE: Store the original collection name directly
originalCollectionName:originalCollectionName,furnitureConfig:furniture.config};// Update app state
appState.selectedCollection=furnitureCollection;appState.furnitureMode=true;console.log("\u2705 Switched to furniture mode. Paths will use: \"".concat(originalCollectionName,"\""));// Update UI
if(dom.collectionHeader){dom.collectionHeader.textContent=furnitureCollection.name;}// Remove try furniture button and add back button
var tryButton=document.getElementById('tryFurnitureBtn');if(tryButton)tryButton.remove();addBackToPatternsButton();// Trigger re-render
if(appState.currentPattern){var furniturePattern=furniturePatterns.find(function(p){return p.id===appState.currentPattern.id;});if(furniturePattern){loadPatternData(appState.selectedCollection,furniturePattern.id);}}}function returnToPatternsMode(){console.log("🔄 Returning to patterns mode");// Restore original collection
if(appState.originalCollection){console.log("🔄 Restoring original collection:",appState.originalCollection.name);appState.selectedCollection=appState.originalCollection;// Remove .fullCollection
appState.furnitureMode=false;appState.originalCollection=null;// Clear fabric mode state
appState.selectedFurniture=null;appState.isInFabricMode=false;// Update UI
if(dom.collectionHeader){dom.collectionHeader.textContent=toInitialCaps(appState.selectedCollection.name);}// Remove back button
var backButton=document.getElementById('backToPatternsBtn');if(backButton){backButton.remove();}// Re-add try furniture button
addTryFurnitureButton();// Trigger re-render in patterns mode
if(appState.currentPattern){// Find the original pattern (not the furniture version)
var originalPattern=appState.selectedCollection.patterns.find(function(p){return p.id===appState.currentPattern.id;});if(originalPattern){loadPatternData(appState.selectedCollection,originalPattern.id);}}console.log("✅ Returned to patterns mode");}else{console.error("❌ Cannot return to patterns mode - original collection not found");}}// Development helper: Generate expected folder structure
function generateFolderStructure(collectionName,furnitureId){var _appState$collections4,_furnitureConfig2;var collection=(_appState$collections4=appState.collections)===null||_appState$collections4===void 0?void 0:_appState$collections4.find(function(c){return c.name===collectionName;});var furniture=(_furnitureConfig2=furnitureConfig)===null||_furnitureConfig2===void 0?void 0:_furnitureConfig2[furnitureId];if(!collection||!furniture){console.error("❌ Collection or furniture not found");return;}console.log("\uD83D\uDCC1 FOLDER STRUCTURE for ".concat(furniture.name," + ").concat(collectionName,":"));console.log("\uD83D\uDCC1 Base path: data/furniture/".concat(furnitureId,"/patterns/").concat(collectionName,"/"));console.log("\uD83D\uDCC1 Folders needed:");var folders=[];collection.patterns.forEach(function(pattern){var slug=createPatternSlug(pattern.name);var folder="data/furniture/".concat(furnitureId,"/patterns/").concat(collectionName,"/").concat(slug,"/");folders.push({pattern:pattern.name,slug:slug,folder:folder});console.log("   ".concat(folder));});console.log("\uD83D\uDCCA Total folders needed: ".concat(folders.length));return folders;}// Development helper: Check what files are expected for a pattern
function getExpectedFiles(collectionName,patternName,furnitureId){var _appState$collections5,_furnitureConfig3;var collection=(_appState$collections5=appState.collections)===null||_appState$collections5===void 0?void 0:_appState$collections5.find(function(c){return c.name===collectionName;});var pattern=collection===null||collection===void 0?void 0:collection.patterns.find(function(p){return p.name===patternName;});var furniture=(_furnitureConfig3=furnitureConfig)===null||_furnitureConfig3===void 0?void 0:_furnitureConfig3[furnitureId];if(!pattern||!furniture){console.error("❌ Pattern or furniture not found");return;}var slug=createPatternSlug(patternName);var folder="https://so-animation.com/colorflex/data/furniture/".concat(furnitureId,"/patterns/").concat(collectionName,"/").concat(slug,"/");console.log("\uD83D\uDCCB EXPECTED FILES for ".concat(patternName," on ").concat(furniture.name,":"));console.log("\uD83D\uDCC1 Folder: ".concat(folder));console.log("\uD83D\uDCC4 Files needed:");var expectedFiles=[];if(pattern.layers){pattern.layers.forEach(function(layer,index){var originalFileName=layer.path.split('/').pop();var layerName=originalFileName.replace(/\.[^/.]+$/,'');var furnitureFileName="".concat(slug,"-").concat(layerName,".png");expectedFiles.push({original:originalFileName,furniture:furnitureFileName,fullPath:"".concat(folder).concat(furnitureFileName)});console.log("   ".concat(furnitureFileName));});}return{folder:folder,files:expectedFiles};}// 1. Console commands for planning your work
window.workflowHelpers={// See all expected folders for a furniture + collection combo
showFolders:function showFolders(furnitureId,collectionName){console.log("\uD83D\uDCC1 FOLDER STRUCTURE: ".concat(furnitureId," + ").concat(collectionName));return generateFolderStructure(collectionName,furnitureId);},// See expected files for a specific pattern
showFiles:function showFiles(collectionName,patternName,furnitureId){console.log("\uD83D\uDCC4 EXPECTED FILES: ".concat(patternName," on ").concat(furnitureId));return getExpectedFiles(collectionName,patternName,furnitureId);},// Get overview of all work needed
showPlan:function showPlan(){console.log("\uD83C\uDFA8 COMPLETE RENDERING PLAN");return generateRenderingPlan();},// Test pattern slug generation
testSlug:function testSlug(patternName){var slug=createPatternSlug(patternName);console.log("Pattern: \"".concat(patternName,"\" \u2192 Slug: \"").concat(slug,"\""));return slug;},// Check what's compatible
showCompatibility:function showCompatibility(){console.log("\uD83D\uDD17 FURNITURE COMPATIBILITY:");Object.entries(furnitureConfig||{}).forEach(function(_ref9){var _ref0=_slicedToArray(_ref9,2),furnitureId=_ref0[0],furniture=_ref0[1];console.log("".concat(furniture.name,": ").concat(furniture.compatibleCollections.join(', ')));});},// Generate folder creation script
generateFolderScript:function generateFolderScript(furnitureId){var _furnitureConfig4;var furniture=(_furnitureConfig4=furnitureConfig)===null||_furnitureConfig4===void 0?void 0:_furnitureConfig4[furnitureId];if(!furniture){console.error("\u274C Furniture ".concat(furnitureId," not found"));return;}console.log("\uD83D\uDCDC FOLDER CREATION SCRIPT for ".concat(furniture.name,":"));console.log("# Copy and paste these commands to create folders:\n");var script="# Furniture: ".concat(furniture.name,"\n");script+="mkdir -p data/furniture/".concat(furnitureId,"/patterns\n\n");furniture.compatibleCollections.forEach(function(collectionName){var _appState$collections6;var collection=(_appState$collections6=appState.collections)===null||_appState$collections6===void 0?void 0:_appState$collections6.find(function(c){return c.name===collectionName;});if(!collection)return;script+="# Collection: ".concat(collectionName,"\n");script+="mkdir -p data/furniture/".concat(furnitureId,"/patterns/").concat(collectionName,"\n");collection.patterns.forEach(function(pattern){var slug=createPatternSlug(pattern.name);script+="mkdir -p data/furniture/".concat(furnitureId,"/patterns/").concat(collectionName,"/").concat(slug,"\n");});script+="\n";});console.log(script);return script;}};// 2. Development status checker
function checkFurnitureImplementationStatus(){var _appState$selectedCol18,_appState$collections7;// Skip in clothing mode
if(window.COLORFLEX_MODE==='CLOTHING'){return;}console.log("\uD83D\uDD0D FURNITURE IMPLEMENTATION STATUS CHECK:");console.log("======================================");// Check if furniture config is loaded
if(!furnitureConfig){console.log("\u274C furnitureConfig not loaded");return;}console.log("\u2705 furnitureConfig loaded: ".concat(Object.keys(furnitureConfig).length," furniture pieces"));// Check collections
if(!appState.collections||appState.collections.length===0){console.log("\u274C Collections not loaded");return;}console.log("\u2705 Collections loaded: ".concat(appState.collections.length," collections"));// Check current state
var currentCollection=(_appState$selectedCol18=appState.selectedCollection)===null||_appState$selectedCol18===void 0?void 0:_appState$selectedCol18.name;if(!currentCollection){console.log("\u274C No collection currently selected");return;}console.log("\u2705 Current collection: ".concat(currentCollection));// Check compatibility
var compatible=getCompatibleFurniture(currentCollection);console.log("\u2705 Compatible furniture: ".concat(compatible.length," pieces"));compatible.forEach(function(f){return console.log("   - ".concat(f.name));});// Check if Try Furniture button should be visible
var tryButton=document.getElementById('tryFurnitureBtn');var backButton=document.getElementById('backToPatternsBtn');if(appState.furnitureMode){console.log("\uD83E\uDE91 Currently in FURNITURE MODE");console.log("   Back button present: ".concat(!!backButton));}else{console.log("\uD83C\uDFA8 Currently in PATTERN MODE");console.log("   Try Furniture button present: ".concat(!!tryButton));if(!tryButton&&compatible.length>0){console.log("\u26A0\uFE0F  Try Furniture button should be visible but isn't!");}}return{furnitureConfigLoaded:!!furnitureConfig,collectionsLoaded:((_appState$collections7=appState.collections)===null||_appState$collections7===void 0?void 0:_appState$collections7.length)>0,currentCollection:currentCollection,compatibleFurniture:compatible.length,furnitureMode:appState.furnitureMode,tryButtonPresent:!!tryButton,backButtonPresent:!!backButton};}// 3. Easy console commands
window.checkStatus=checkFurnitureImplementationStatus;// 4. Example usage guide
// Workflow helpers available in development mode only
if(window.location.hostname==='localhost'||window.location.hostname.includes('dev')){console.log("\n\uD83E\uDE91 FURNITURE WORKFLOW HELPERS LOADED!\n=====================================\n\nConsole Commands:\n\u2022 workflowHelpers.showPlan() - See complete rendering plan\n\u2022 workflowHelpers.showFolders('sofa-capitol', 'botanicals') - See folder structure\n\u2022 workflowHelpers.showFiles('botanicals', 'Key Largo', 'sofa-capitol') - See expected files\n\u2022 workflowHelpers.testSlug('Pattern Name Here') - Test slug conversion\n\u2022 workflowHelpers.showCompatibility() - See what's compatible with what\n\u2022 workflowHelpers.generateFolderScript('sofa-capitol') - Generate mkdir commands\n\u2022 checkStatus() - Check implementation status\n\nExample Workflow:\n1. workflowHelpers.showPlan() - See total work needed\n2. workflowHelpers.generateFolderScript('sofa-capitol') - Create folders\n3. Render patterns and save to generated folders\n4. Test with Try Furniture button!\n");}// 5. Integration check
document.addEventListener('DOMContentLoaded',function(){// Wait a bit for everything to load
// Only run furniture status check in furniture mode
if(window.COLORFLEX_MODE==='FURNITURE'){setTimeout(function(){console.log("\uD83D\uDD0D Running furniture integration check...");checkFurnitureImplementationStatus();},2000);}});// Load furniture config on app init
var furnitureConfig=null;function loadFurnitureConfig(){return _loadFurnitureConfig.apply(this,arguments);}// Switch furniture type (for furniture mode UI)
// furnitureType: 'Sofa-Capitol' or 'Sofa-Kite' (matches mockupLayers keys)
function _loadFurnitureConfig(){_loadFurnitureConfig=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee12(){var _window$ColorFlexAsse,response,furnitureConfigUrl,missingKeys,localResp,localConfig,_t14,_t15;return _regenerator().w(function(_context19){while(1)switch(_context19.p=_context19.n){case 0:_context19.p=0;console.log("🪑 Loading furniture configuration...");furnitureConfigUrl=((_window$ColorFlexAsse=window.ColorFlexAssets)===null||_window$ColorFlexAsse===void 0?void 0:_window$ColorFlexAsse.furnitureConfigUrl)||'/assets/furniture-config.json';_context19.n=1;return fetch(furnitureConfigUrl,{method:'GET',cache:'no-cache',headers:{'Content-Type':'application/json'}});case 1:response=_context19.v;if(!response.ok){_context19.n=9;break;}_context19.n=2;return response.json();case 2:furnitureConfig=_context19.v;_context19.p=3;missingKeys=[];if(!(!furnitureConfig.clothing||!furnitureConfig['clothing-pants'])){_context19.n=6;break;}_context19.n=4;return fetch('/assets/furniture-config.json',{method:'GET',cache:'no-cache'});case 4:localResp=_context19.v;if(!localResp.ok){_context19.n=6;break;}_context19.n=5;return localResp.json();case 5:localConfig=_context19.v;Object.keys(localConfig).forEach(function(key){if(!furnitureConfig[key]){furnitureConfig[key]=localConfig[key];missingKeys.push(key);}});if(missingKeys.length>0){console.log('🔁 Merged missing furnitureConfig keys from local asset:',missingKeys);}case 6:_context19.n=8;break;case 7:_context19.p=7;_t14=_context19.v;console.warn('⚠️ Failed to merge local furniture-config.json:',_t14);case 8:appState.furnitureConfig=furnitureConfig;console.log('✅ Furniture config loaded with',Object.keys(furnitureConfig).length,'types:',Object.keys(furnitureConfig));// Default to template-specified type or 'Sofa-Capitol' for furniture mode
if(!appState.selectedFurnitureType){appState.selectedFurnitureType=window.FURNITURE_DEFAULT_TYPE||'Sofa-Capitol';console.log("\uD83E\uDE91 Default furniture type: ".concat(appState.selectedFurnitureType));}return _context19.a(2,furnitureConfig);case 9:if(!(response.status===0||response.status===403)){_context19.n=10;break;}throw new Error('CORS Error: Cross-origin request blocked');case 10:console.error("❌ Furniture config response not ok:",response.status);case 11:_context19.n=13;break;case 12:_context19.p=12;_t15=_context19.v;if(_t15.name==='TypeError'&&_t15.message.includes('fetch')){console.error('❌ Network/CORS Error loading furniture config:',_t15);}else{console.error("❌ Error loading furniture config:",_t15);}console.warn("⚠️ Furniture mode will be unavailable");return _context19.a(2,null);case 13:return _context19.a(2);}},_callee12,null,[[3,7],[0,12]]);}));return _loadFurnitureConfig.apply(this,arguments);}function switchFurniture(_x2){return _switchFurniture.apply(this,arguments);}// Expose switchFurniture globally for furniture selector UI
function _switchFurniture(){_switchFurniture=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee13(furnitureType){var furnitureTypeToConfigKey,configKey;return _regenerator().w(function(_context20){while(1)switch(_context20.n){case 0:console.log('🪑 Switching furniture to:',furnitureType);if(appState.isInFurnitureMode){_context20.n=1;break;}console.warn('⚠️ Not in furniture mode');return _context20.a(2);case 1:// Map furniture type to config key
furnitureTypeToConfigKey={'Sofa-Capitol':'furniture','Sofa-Kite':'furniture-kite'};configKey=furnitureTypeToConfigKey[furnitureType]||'furniture';if(!(!appState.furnitureConfig||!appState.furnitureConfig[configKey])){_context20.n=2;break;}console.error('❌ Furniture config not found for:',furnitureType,'-> config key:',configKey);console.log('Available furniture configs:',Object.keys(appState.furnitureConfig||{}));return _context20.a(2);case 2:// Update selected furniture type (store the mockupLayers key, not config key)
appState.selectedFurnitureType=furnitureType;console.log('✅ Furniture type updated to:',furnitureType,'(config:',configKey,')');// Trigger re-render
if(!appState.currentPattern){_context20.n=3;break;}console.log('🔄 Re-rendering with new furniture...');_context20.n=3;return updatePreview();case 3:return _context20.a(2);}},_callee13);}));return _switchFurniture.apply(this,arguments);}window.switchFurniture=switchFurniture;dom._patternName=document.getElementById("patternName");// Initial assignment
// Fetch colors from colors.json
function loadColors(){return _loadColors.apply(this,arguments);}// ============================================================================
// SECTION 5: COLOR MANAGEMENT SYSTEM
// ============================================================================
// Color utilities: formatting, conversion, Sherwin-Williams lookup,
// curated palettes, and ticket system integration.
// ============================================================================
// Helper function to get clean color name without SW/SC codes for display
function _loadColors(){_loadColors=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee14(){var _window$ColorFlexAsse2,colorsUrl,response,data,_t16;return _regenerator().w(function(_context21){while(1)switch(_context21.p=_context21.n){case 0:_context21.p=0;if(!(window.ColorFlexData&&window.ColorFlexData.colors)){_context21.n=1;break;}console.log("🎯 Using embedded Sherwin-Williams colors");appState.colorsData=window.ColorFlexData.colors;console.log("✅ Colors loaded:",appState.colorsData.length);return _context21.a(2);case 1:// Load directly from Shopify assets
console.log("📁 Loading colors from Shopify assets");colorsUrl=((_window$ColorFlexAsse2=window.ColorFlexAssets)===null||_window$ColorFlexAsse2===void 0?void 0:_window$ColorFlexAsse2.colorsUrl)||"/assets/colors.json";_context21.n=2;return fetch(colorsUrl,{method:'GET',cache:'no-cache',headers:{'Content-Type':'application/json'}});case 2:response=_context21.v;if(response.ok){_context21.n=4;break;}if(!(response.status===0||response.status===403)){_context21.n=3;break;}throw new Error('CORS Error: Cross-origin request blocked');case 3:throw new Error("HTTP error: ".concat(response.status));case 4:_context21.n=5;return response.json();case 5:data=_context21.v;if(!(!Array.isArray(data)||data.length===0)){_context21.n=6;break;}throw new Error("Colors data is empty or invalid");case 6:appState.colorsData=data;console.log("✅ Colors loaded:",appState.colorsData.length);_context21.n=8;break;case 7:_context21.p=7;_t16=_context21.v;console.error("âŒ Error loading colors:",_t16);alert("Failed to load Sherwin-Williams colors.");case 8:return _context21.a(2);}},_callee14,null,[[0,7]]);}));return _loadColors.apply(this,arguments);}function getCleanColorName(colorName){if(!colorName||typeof colorName!=="string"){return colorName;}var cleaned=colorName.replace(/^(SW|SC)\d+\s*/i,"").trim();return toInitialCaps(cleaned);}// Helper function to format colors consistently with SW numbers for display
function formatColorWithSW(colorName){if(!colorName||typeof colorName!=='string'){return'Unknown Color';}// If it already has SW format, normalize it
var swMatch=colorName.match(/^(SW|SC)\s*(\d+)\s*(.+)$/i);if(swMatch){var prefix=swMatch[1].toUpperCase();var number=swMatch[2];var name=swMatch[3].trim();return"".concat(prefix).concat(number," ").concat(toInitialCaps(name));}// If no SW number, try to look it up in colorsData
if(appState&&appState.colorsData){var cleanName=colorName.toLowerCase().trim();var colorEntry=appState.colorsData.find(function(c){return c.color_name&&c.color_name.toLowerCase().trim()===cleanName||c.name&&c.name.toLowerCase().trim()===cleanName;});if(colorEntry&&colorEntry.sw_number){return"".concat(colorEntry.sw_number.toUpperCase()," ").concat(toInitialCaps(colorEntry.color_name||colorEntry.name));}}// Fallback: just format the name consistently
return toInitialCaps(colorName);}// Lookup color from colors.json data
var lookupColor=function lookupColor(colorName){console.log("\uD83D\uDD0D lookupColor called with: \"".concat(colorName,"\" (type: ").concat(_typeof(colorName),")"));if(!colorName||typeof colorName!=="string"){console.warn("\u274C Invalid colorName: ".concat(colorName,", defaulting to #FFFFFF"));return"#FFFFFF";}// Check if input is a hex color
if(/^#[0-9A-F]{6}$/i.test(colorName.trim())){console.log("\uD83C\uDFA8 Hex color detected: ".concat(colorName));return colorName.trim();}// Check if input is an SW/SC number (e.g., "SW0049" or "sw0049")
var swMatch=colorName.match(/^(SW|SC)(\d+)$/i);if(swMatch){var swNumber="sw".concat(swMatch[2]).toLowerCase();// Normalize to "sw0049"
console.log("\uD83D\uDD22 SW number detected: \"".concat(colorName,"\" -> normalized: \"").concat(swNumber,"\""));var _colorEntry=appState.colorsData.find(function(c){return c&&c.sw_number&&c.sw_number.toLowerCase()===swNumber;});if(_colorEntry){console.log("\u2705 Found by SW number: \"".concat(colorName,"\" -> #").concat(_colorEntry.hex));return"#".concat(_colorEntry.hex);}console.warn("\u274C SW number '".concat(colorName,"' not found in colorsData"));return"#FFFFFF";}// Otherwise, treat as color name
var cleanedColorName=colorName.replace(/^(SW|SC|SWs|SCs|Sw|Sc|swsw|SWsw|SCsc|SCcs|Swsc|swsc)\d+\s*/i,"").toLowerCase().trim();console.log("\uD83E\uDDF9 Cleaned color name: \"".concat(colorName,"\" -> \"").concat(cleanedColorName,"\""));console.log("\uD83D\uDD0D Searching in ".concat(appState.colorsData.length," colors for: \"").concat(cleanedColorName,"\""));var colorEntry=appState.colorsData.find(function(c){return c&&typeof c.color_name==='string'&&c.color_name.toLowerCase()===cleanedColorName;});if(!colorEntry){console.warn("\u274C Color '".concat(cleanedColorName,"' not found in colorsData, available colors sample:"),appState.colorsData.slice(0,5).map(function(c){return c.color_name;}));return"#FFFFFF";}console.log("\u2705 Found by name: \"".concat(colorName,"\" -> \"").concat(cleanedColorName,"\" -> #").concat(colorEntry.hex));return"#".concat(colorEntry.hex);};if(USE_GUARD&&DEBUG_TRACE){lookupColor=guard(traceWrapper(lookupColor,"lookupColor"));// Wrapped for debugging
}else if(USE_GUARD){lookupColor=guard(lookupColor,"lookupColor");// Wrapped for debugging
}// Add saved patterns indicator to main navigation
function addSavedPatternsMenuIcon(){// 🆕 SHOW EVERYWHERE: Remove restriction that excluded ColorFlex page
// Now chameleon button will appear on all pages including ColorFlex page for standard patterns
console.log('🦎 Adding chameleon menu icon on page:',window.location.pathname);var patterns=JSON.parse(localStorage.getItem('colorflexSavedPatterns')||'[]');var existingIcon=document.getElementById('colorflexMenuIcon');if(patterns.length>0&&!existingIcon){// Find the main navigation or header to add our icon to
var nav=document.querySelector('nav, header, .header, .navigation, .main-header, .site-header');if(nav){var menuIcon=document.createElement('div');menuIcon.id='colorflexMenuIcon';menuIcon.style.cssText="\n                position: relative;\n                display: inline-flex;\n                align-items: center;\n                cursor: pointer;\n                margin: 0 10px;\n                padding: 8px;\n                border-radius: 50%;\n                background: rgba(212, 175, 55, 0.1);\n                border: 2px solid rgba(212, 175, 55, 0.6);\n                transition: all 0.3s ease;\n                z-index: 1000;\n            ";menuIcon.innerHTML="\n                <img src=\"https://so-animation.com/colorflex/img/camelion-sm-black.jpg\" \n                     style=\"width: 24px; height: 24px; border-radius: 50%;\" \n                     alt=\"My ColorFlex Patterns\">\n                <span style=\"\n                    position: absolute;\n                    top: -5px;\n                    right: -5px;\n                    background: #d4af37;\n                    color: white;\n                    border-radius: 50%;\n                    width: 18px;\n                    height: 18px;\n                    font-size: 10px;\n                    font-weight: bold;\n                    display: flex;\n                    align-items: center;\n                    justify-content: center;\n                \">".concat(patterns.length,"</span>\n            ");menuIcon.addEventListener('click',function(){console.log('🎨 Opening saved patterns from menu icon');showSavedPatternsModal();});menuIcon.addEventListener('mouseenter',function(){menuIcon.style.background='rgba(212, 175, 55, 0.2)';menuIcon.style.transform='scale(1.1)';});menuIcon.addEventListener('mouseleave',function(){menuIcon.style.background='rgba(212, 175, 55, 0.1)';menuIcon.style.transform='scale(1)';});// Try to place it near existing user/account icons
var userIcon=nav.querySelector('[href*="account"], [href*="login"], .user-icon, .account-icon');if(userIcon&&userIcon.parentNode){userIcon.parentNode.insertBefore(menuIcon,userIcon);}else{// Fallback: add to the end of navigation
nav.appendChild(menuIcon);}console.log('✅ Added ColorFlex menu icon with',patterns.length,'saved patterns');}}else if(patterns.length===0&&existingIcon){// Remove icon if no patterns saved
existingIcon.remove();console.log('🗑️ Removed ColorFlex menu icon (no saved patterns)');}else if(existingIcon){// Update count if icon exists
var countSpan=existingIcon.querySelector('span');if(countSpan){countSpan.textContent=patterns.length;}}}// Update menu icon whenever patterns are saved/deleted
function updateSavedPatternsMenuIcon(){// First, update the chameleon icon next to the save button (on ColorFlex page)
var viewSavedBtn=document.getElementById('viewSavedBtn');if(viewSavedBtn){var savedPatterns=JSON.parse(localStorage.getItem('colorflexSavedPatterns')||'[]');var badge=viewSavedBtn.querySelector('span');if(badge){badge.textContent=savedPatterns.length;console.log('✅ Updated chameleon badge count to:',savedPatterns.length);}}// Then, update/add the menu icon in navigation (other pages)
setTimeout(addSavedPatternsMenuIcon,100);// Small delay to ensure DOM is ready
}// Initialize menu icon on page load
document.addEventListener('DOMContentLoaded',function(){// Add saved patterns menu icon if patterns exist
updateSavedPatternsMenuIcon();// Hamburger menu functionality
var hamburgerBtn=document.getElementById('hamburgerBtn');var sidebar=document.getElementById('leftSidebar');if(hamburgerBtn&&sidebar){hamburgerBtn.addEventListener('click',function(){hamburgerBtn.classList.toggle('active');sidebar.classList.toggle('open');});// Close sidebar when clicking outside on mobile
document.addEventListener('click',function(e){if(window.innerWidth<=1023&&!sidebar.contains(e.target)&&!hamburgerBtn.contains(e.target)&&sidebar.classList.contains('open')){hamburgerBtn.classList.remove('active');sidebar.classList.remove('open');}});}// Buy It Now button functionality
var buyItNowBtn=document.getElementById('buyItNowButton');if(buyItNowBtn){buyItNowBtn.addEventListener('click',/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(){var state,allSavedPatterns,justSavedPattern,savedPattern,_t2;return _regenerator().w(function(_context3){while(1)switch(_context3.p=_context3.n){case 0:console.log('🛒 Buy It Now clicked - starting auto-save and purchase flow...');_context3.p=1;state=window.appState;// Validate we have a pattern loaded
if(!(!state.currentPattern||!state.currentPattern.name)){_context3.n=2;break;}showSaveNotification('❌ No pattern selected');return _context3.a(2);case 2:console.log('🎨 Current pattern:',state.currentPattern.name);console.log('🔄 Step 1: Ensuring pattern is fully rendered...');// Force a canvas update to ensure we're capturing the current pattern
// Look for the render/update function
if(!(window.render&&typeof window.render==='function')){_context3.n=4;break;}console.log('🔄 Calling render() to update canvas...');_context3.n=3;return window.render();case 3:_context3.n=7;break;case 4:if(!(window.updateCanvas&&typeof window.updateCanvas==='function')){_context3.n=6;break;}console.log('🔄 Calling updateCanvas() to update canvas...');_context3.n=5;return window.updateCanvas();case 5:_context3.n=7;break;case 6:if(!(window.drawPattern&&typeof window.drawPattern==='function')){_context3.n=7;break;}console.log('🔄 Calling drawPattern() to update canvas...');_context3.n=7;return window.drawPattern();case 7:_context3.n=8;return new Promise(function(resolve){return setTimeout(resolve,800);});case 8:// First, save the pattern to My List (this captures the thumbnail)
console.log('💾 Step 2: Saving pattern with thumbnail...');_context3.n=9;return window.saveToMyList();case 9:_context3.n=10;return new Promise(function(resolve){return setTimeout(resolve,300);});case 10:// Get the JUST SAVED pattern from localStorage (includes fresh thumbnail)
allSavedPatterns=JSON.parse(localStorage.getItem('colorflexSavedPatterns')||'[]');justSavedPattern=allSavedPatterns[allSavedPatterns.length-1];// Get the last saved pattern
if(justSavedPattern){_context3.n=11;break;}console.error('❌ Failed to retrieve just-saved pattern');showSaveNotification('❌ Failed to load saved pattern');return _context3.a(2);case 11:console.log('📸 Retrieved just-saved pattern with thumbnail:',{name:justSavedPattern.patternName,hasThumbnail:!!justSavedPattern.thumbnail,thumbnailLength:justSavedPattern.thumbnail?justSavedPattern.thumbnail.length:0});// Use the just-saved pattern data (includes fresh thumbnail)
savedPattern=_objectSpread(_objectSpread({},justSavedPattern),{},{triggerPurchase:true});console.log('🛒 Step 3: Triggering material selection modal with fresh thumbnail...');// Trigger the material selection modal
if(window.showMaterialSelectionModal&&typeof window.showMaterialSelectionModal==='function'){window.showMaterialSelectionModal(savedPattern);}else{console.error('❌ Material selection modal not available');showSaveNotification('❌ Unable to start purchase flow');}_context3.n=13;break;case 12:_context3.p=12;_t2=_context3.v;console.error('❌ Error in Buy It Now flow:',_t2);showSaveNotification('❌ Failed to process purchase');case 13:return _context3.a(2);}},_callee3,null,[[1,12]]);})));console.log('✅ Buy It Now button initialized');}});// Check if a specific pattern has furniture renders
function checkFurnitureAvailability(_x3){return _checkFurnitureAvailability.apply(this,arguments);}// Call loadFurnitureConfig when your app initializes
function _checkFurnitureAvailability(){_checkFurnitureAvailability=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee15(patternName){var patternSlug,manifestUrl,response,manifest,_t17;return _regenerator().w(function(_context22){while(1)switch(_context22.p=_context22.n){case 0:if(!(!patternName||typeof patternName!=='string')){_context22.n=1;break;}console.warn('checkFurnitureAvailability: Invalid patternName provided');return _context22.a(2,{available:false});case 1:patternSlug=patternName.toLowerCase().replace(/ /g,'-');manifestUrl="data/furniture/sofa-capitol/patterns/".concat(patternSlug,"/manifest.json");_context22.p=2;_context22.n=3;return fetch(manifestUrl,{method:'GET',mode:'cors',cache:'no-cache',headers:{'Content-Type':'application/json'}});case 3:response=_context22.v;if(!response.ok){_context22.n=5;break;}_context22.n=4;return response.json();case 4:manifest=_context22.v;return _context22.a(2,{available:true,manifest:manifest,furnitureType:'sofa-capitol'});case 5:_context22.n=7;break;case 6:_context22.p=6;_t17=_context22.v;case 7:return _context22.a(2,{available:false});}},_callee15,null,[[2,6]]);}));return _checkFurnitureAvailability.apply(this,arguments);}loadFurnitureConfig();/**
 * =============================================================================
 * SECTION 4: FABRIC RENDERING ENGINE
 * =============================================================================
 * 
 * This section contains the core fabric and pattern rendering system including:
 * - Advanced fabric compositing with multiple blend modes
 * - Resolution-independent image scaling and processing  
 * - Furniture layer drawing and mockup generation
 * - Masked layer processing with alpha channels
 * - Real-time fabric parameter tuning and effects
 */// Utility Functions
/**
 * Helper function for scaling images while preserving aspect ratio
 * Calculates dimensions to fit an image within target bounds
 * 
 * @param {HTMLImageElement} img - Source image to scale
 * @param {number} targetWidth - Maximum width
 * @param {number} targetHeight - Maximum height
 * @returns {Object} Scaled dimensions and positioning {width, height, x, y}
 */// ✅ Helper function to get correct aspect ratio, accounting for rotated thumbnails
function getCorrectAspectRatio(img,pattern){var imageAspectRatio=img.width/img.height;if(!pattern||!pattern.size){console.log("🔍 No pattern size data, using image aspect ratio:",imageAspectRatio.toFixed(3));return imageAspectRatio;}var patternSize=pattern.size;var declaredAspectRatio=patternSize[0]/patternSize[1];var aspectRatioDifference=Math.abs(imageAspectRatio-declaredAspectRatio);var isRotated=aspectRatioDifference>0.1;// More than 10% difference suggests rotation
console.log("🔍 ASPECT RATIO CORRECTION:");console.log("  Pattern:",pattern.name);console.log("  📏 Image aspect ratio:",imageAspectRatio.toFixed(3));console.log("  📋 Declared aspect ratio:",declaredAspectRatio.toFixed(3));console.log("  🔄 Appears rotated:",isRotated?"❌ YES":"✅ NO");var correctAspectRatio=isRotated?declaredAspectRatio:imageAspectRatio;console.log("  🎯 Using aspect ratio:",correctAspectRatio.toFixed(3));return correctAspectRatio;}function scaleToFit(img,targetWidth,targetHeight){var aspectRatio=img.width/img.height;var drawWidth=targetWidth;var drawHeight=targetHeight;if(aspectRatio>targetWidth/targetHeight){drawHeight=drawWidth/aspectRatio;}else{drawWidth=drawHeight*aspectRatio;}var x=(targetWidth-drawWidth)/2;var y=(targetHeight-drawHeight)/2;return{width:drawWidth,height:drawHeight,x:x,y:y};}// ✅ Enhanced scaleToFit that uses correct aspect ratio for patterns
function scaleToFitWithCorrectAspectRatio(img,targetWidth,targetHeight,pattern){var correctAspectRatio=getCorrectAspectRatio(img,pattern);var drawWidth=targetWidth;var drawHeight=targetHeight;if(correctAspectRatio>targetWidth/targetHeight){drawHeight=drawWidth/correctAspectRatio;}else{drawWidth=drawHeight*correctAspectRatio;}var x=(targetWidth-drawWidth)/2;var y=(targetHeight-drawHeight)/2;return{width:drawWidth,height:drawHeight,x:x,y:y};}// Shared helper for loading and tinting a masked image
function drawMaskedLayer(_x4,_x5,_x6){return _drawMaskedLayer.apply(this,arguments);}function _drawMaskedLayer(){_drawMaskedLayer=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee16(imgPath,tintColor,label){var isWallPanel,originalUrl,img,offscreen,offCtx,imageData,_imageData,data,i,r,g,b,luminance,tintLayer,tintCtx,_t18;return _regenerator().w(function(_context23){while(1)switch(_context23.p=_context23.n){case 0:// Check if this is a wall panel image
isWallPanel=imgPath.includes('wall-panels');// Get the original, untinted grayscale image for alpha calculation
_context23.n=1;return new Promise(function(resolve){return processImage(imgPath,resolve,null,2.2,false,false,false);});case 1:originalUrl=_context23.v;_context23.n=2;return loadImage(originalUrl);case 2:img=_context23.v;// Draw the original image centered on an offscreen canvas
offscreen=document.createElement("canvas");offscreen.width=1080;offscreen.height=1080;offCtx=offscreen.getContext("2d");drawCenteredImage(offCtx,img,1080,1080);// Get pixel data
_context23.p=3;imageData=offCtx.getImageData(0,0,1080,1080);_context23.n=5;break;case 4:_context23.p=4;_t18=_context23.v;console.warn("⚠️ Canvas tainted, skipping masked layer processing:",_t18.message);return _context23.a(2);case 5:_imageData=imageData,data=_imageData.data;// Invert luminance for alpha: white (255) â†’ alpha 0, black (0) â†’ alpha 255
for(i=0;i<data.length;i+=4){r=data[i];g=data[i+1];b=data[i+2];luminance=0.299*r+0.587*g+0.114*b;data[i+3]=255-luminance;// INVERTED for correct alpha
}offCtx.putImageData(imageData,0,0);// Prepare the colored (tint) layer and mask it with the alpha
tintLayer=document.createElement("canvas");tintLayer.width=1080;tintLayer.height=1080;tintCtx=tintLayer.getContext("2d");tintCtx.fillStyle=tintColor;tintCtx.fillRect(0,0,1080,1080);tintCtx.globalCompositeOperation="destination-in";tintCtx.drawImage(offscreen,0,0);// Composite result onto main canvas
ctx.globalAlpha=1.0;ctx.globalCompositeOperation="source-over";ctx.drawImage(tintLayer,0,0);console.log("\u2705 [".concat(label,"] tint-mask drawn."));case 6:return _context23.a(2);}},_callee16,null,[[3,4]]);}));return _drawMaskedLayer.apply(this,arguments);}function applyNormalizationProcessing(data,rLayer,gLayer,bLayer){// IMPROVED normalization logic for better detail preservation
var minLuminance=255,maxLuminance=0;for(var i=0;i<data.length;i+=4){var luminance=0.299*data[i]+0.587*data[i+1]+0.114*data[i+2];minLuminance=Math.min(minLuminance,luminance);maxLuminance=Math.max(maxLuminance,luminance);}var range=maxLuminance-minLuminance||1;console.log("Min Luminance:",minLuminance,"Max Luminance:",maxLuminance);for(var _i3=0;_i3<data.length;_i3+=4){var _luminance=0.299*data[_i3]+0.587*data[_i3+1]+0.114*data[_i3+2];var normalized=(_luminance-minLuminance)/range;normalized=Math.max(0,Math.min(1,normalized));var alpha=1-normalized;if(alpha>0.8){alpha=1;}else if(alpha>0.5){alpha=0.8+(alpha-0.5)*0.67;}else if(alpha>0.2){alpha=alpha*1.6;}else{alpha=alpha*0.5;}alpha=Math.min(1,Math.max(0,alpha));if(alpha>0.05){data[_i3]=rLayer;data[_i3+1]=gLayer;data[_i3+2]=bLayer;}else{data[_i3]=0;data[_i3+1]=0;data[_i3+2]=0;}data[_i3+3]=Math.round(alpha*255);}}function resolveColor(raw){var color=!raw||typeof raw!=="string"?"Snowbound":raw.trim().toUpperCase();var resolved=lookupColor(color);if(!resolved)console.warn("\xE2\u0161 \xEF\xB8\x8F [resolveColor] Could not resolve color: '".concat(color,"', using Snowbound"));return resolved||lookupColor("Snowbound")||"#DDDDDD";}function drawCenteredImage(ctx,img,canvasWidth,canvasHeight){var aspect=img.width/img.height;var drawWidth=canvasWidth;var drawHeight=drawWidth/aspect;if(drawHeight>canvasHeight){drawHeight=canvasHeight;drawWidth=drawHeight*aspect;}var offsetX=Math.round((canvasWidth-drawWidth)/2);var offsetY=Math.round((canvasHeight-drawHeight)/2);ctx.drawImage(img,offsetX,offsetY,drawWidth,drawHeight);}function hexToHSL(hex){// Remove # if present
hex=hex.replace(/^#/,'');// Convert 3-digit to 6-digit hex
if(hex.length===3){hex=hex.split('').map(function(x){return x+x;}).join('');}if(hex.length!==6){console.error("âŒ Invalid HEX color:",hex);return null;}var r=parseInt(hex.substr(0,2),16)/255;var g=parseInt(hex.substr(2,2),16)/255;var b=parseInt(hex.substr(4,2),16)/255;var max=Math.max(r,g,b);var min=Math.min(r,g,b);var h,s,l=(max+min)/2;if(max===min){h=s=0;// achromatic
}else{var d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);switch(max){case r:h=(g-b)/d+(g<b?6:0);break;case g:h=(b-r)/d+2;break;case b:h=(r-g)/d+4;break;}h*=60;}return{h:Math.round(h),s:Math.round(s*100),l:Math.round(l*100)};}function hslToHex(h,s,l){s/=100;l/=100;var k=function k(n){return(n+h/30)%12;};var a=s*Math.min(l,1-l);var f=function f(n){return Math.round(255*(l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)))));};return"#".concat([f(0),f(8),f(4)].map(function(x){return x.toString(16).padStart(2,'0');}).join(''));}function clamp(value,min,max){return Math.min(max,Math.max(min,value));}function findClosestSWColor(targetHex){var bestMatch=null;var bestDistance=Infinity;var _iterator=_createForOfIteratorHelper(colorsData),_step;try{for(_iterator.s();!(_step=_iterator.n()).done;){var color=_step.value;var dist=colorDistance("#".concat(color.hex),targetHex);if(dist<bestDistance){bestDistance=dist;bestMatch=color;}}}catch(err){_iterator.e(err);}finally{_iterator.f();}return bestMatch;}function colorDistance(hex1,hex2){var rgb1=hexToRGB(hex1);var rgb2=hexToRGB(hex2);return Math.sqrt(Math.pow(rgb1.r-rgb2.r,2)+Math.pow(rgb1.g-rgb2.g,2)+Math.pow(rgb1.b-rgb2.b,2));}function hexToRGB(hex){hex=hex.replace(/^#/,"");if(hex.length===3)hex=hex.split('').map(function(c){return c+c;}).join('');var bigint=parseInt(hex,16);return{r:bigint>>16&255,g:bigint>>8&255,b:bigint&255};}/**
 * Find color in ticket by position offset
 *
 * @param {string} currentColorName - Current color name
 * @param {number} positionOffset - +1 for next in ticket, -1 for previous
 * @returns {Object|null} Color object or null if not found
 */function findColorInTicket(currentColorName,positionOffset){if(!appState.colorsData)return null;// Find current color in colors data
var cleanName=currentColorName.replace(/^(SW|SC)\d+\s*/i,"").trim().toLowerCase();var currentColor=appState.colorsData.find(function(c){var _c$color_name;return((_c$color_name=c.color_name)===null||_c$color_name===void 0?void 0:_c$color_name.toLowerCase())===cleanName;});if(!currentColor||!currentColor.locator_id){console.log("  \u26A0\uFE0F Color \"".concat(currentColorName,"\" not in a ticket"));return null;}// Parse locator_id: "178-C3" → ticket: 178, position: 3
var match=currentColor.locator_id.match(/^(\d+)-C(\d+)$/i);if(!match){console.log("  \u26A0\uFE0F Invalid locator_id format: ".concat(currentColor.locator_id));return null;}var ticketNumber=match[1];var currentPosition=parseInt(match[2]);var newPosition=currentPosition+positionOffset;// Tickets have positions C1-C7
if(newPosition<1||newPosition>7){console.log("  \u26A0\uFE0F Position ".concat(newPosition," out of range (1-7)"));return null;}// Find color at new position
var newLocatorId="".concat(ticketNumber,"-C").concat(newPosition);var newColor=appState.colorsData.find(function(c){var _c$locator_id;return((_c$locator_id=c.locator_id)===null||_c$locator_id===void 0?void 0:_c$locator_id.toUpperCase())===newLocatorId.toUpperCase();});if(newColor){console.log("  \uD83C\uDF9F\uFE0F Found in ticket ".concat(ticketNumber,": Position ").concat(currentPosition," \u2192 ").concat(newPosition));console.log("     ".concat(currentColor.color_name," \u2192 ").concat(newColor.color_name));}return newColor;}/**
 * Find nearest lighter or darker Sherwin-Williams color
 * Uses ticket-based navigation if available, falls back to HSL-based
 *
 * @param {string} currentColorName - Current color name (e.g., "Snowbound" or "SW7006")
 * @param {string} direction - "lighter" or "darker"
 * @returns {Object|null} Matching SW color object with {color_name, hex, sw_number} or null if not found
 *
 * @example
 * const darkerColor = findLighterDarkerSWColor("Snowbound", "darker");
 * // Returns: {color_name: "Silverpointe", hex: "c9cac8", sw_number: "SW7653"}
 */function findLighterDarkerSWColor(currentColorName,direction){console.log("\uD83C\uDFA8 Finding ".concat(direction," color for: ").concat(currentColorName));// TRY TICKET-BASED NAVIGATION FIRST
var positionOffset=direction==="darker"?+1:-1;// C1=lightest, C7=darkest
var ticketColor=findColorInTicket(currentColorName,positionOffset);if(ticketColor){console.log("  \u2705 Using ticket-based navigation");return ticketColor;}// FALLBACK TO HSL-BASED NAVIGATION
console.log("  \uD83D\uDD04 Falling back to HSL-based navigation");// Lookup current color to get hex value
var currentHex=lookupColor(currentColorName);if(!currentHex||currentHex==="#FFFFFF"){console.error("❌ Invalid current color:",currentColorName);return null;}// Convert to HSL
var currentHSL=hexToHSL(currentHex);if(!currentHSL){console.error("❌ Could not convert to HSL:",currentHex);return null;}console.log("  Current HSL: h=".concat(currentHSL.h,", s=").concat(currentHSL.s,", l=").concat(currentHSL.l));// Define lightness adjustment step (10% increments)
var lightnessStep=10;var targetLightness=direction==="lighter"?Math.min(100,currentHSL.l+lightnessStep):Math.max(0,currentHSL.l-lightnessStep);console.log("  Target lightness: ".concat(targetLightness," (").concat(direction," by ").concat(lightnessStep,")"));// Generate target hex with adjusted lightness
var targetHex=hslToHex(currentHSL.h,currentHSL.s,targetLightness);console.log("  Target hex: ".concat(targetHex));// Find closest SW color to target
// Ensure colorsData is available
var colorsDataArray=appState.colorsData;if(!colorsDataArray||!Array.isArray(colorsDataArray)){console.error("❌ appState.colorsData not available");return null;}// Filter SW colors by similar hue (within 15 degrees) and appropriate lightness direction
var candidateColors=colorsDataArray.filter(function(color){var colorHex="#".concat(color.hex);var colorHSL=hexToHSL(colorHex);if(!colorHSL)return false;// Check hue similarity (allow wrap-around at 0/360)
var hueDiff=Math.abs(colorHSL.h-currentHSL.h);var hueDistance=Math.min(hueDiff,360-hueDiff);var hueMatch=hueDistance<30;// Within 30 degrees of hue
// Check lightness direction
var lightnessMatch=direction==="lighter"?colorHSL.l>currentHSL.l:colorHSL.l<currentHSL.l;return hueMatch&&lightnessMatch;});console.log("  Found ".concat(candidateColors.length," candidate colors with similar hue"));// If no candidates with similar hue, fall back to all colors
if(candidateColors.length===0){console.log("  ⚠️ No candidates with similar hue, using all colors");candidateColors=colorsDataArray;}// Find closest color among candidates
var bestMatch=null;var bestDistance=Infinity;var _iterator2=_createForOfIteratorHelper(candidateColors),_step2;try{for(_iterator2.s();!(_step2=_iterator2.n()).done;){var color=_step2.value;var dist=colorDistance("#".concat(color.hex),targetHex);if(dist<bestDistance){bestDistance=dist;bestMatch=color;}}}catch(err){_iterator2.e(err);}finally{_iterator2.f();}if(bestMatch){console.log("  \u2705 Found ".concat(direction," color: ").concat(bestMatch.color_name," (").concat(bestMatch.sw_number,")"));console.log("     Distance: ".concat(bestDistance.toFixed(2)));}else{console.log("  \u274C No ".concat(direction," color found"));}return bestMatch;}// Reusable listener setup
var setupPrintListener=function setupPrintListener(){// Only set up print listeners on ColorFlex app pages
if(!isColorFlexAppPage()){console.log('🔧 Skipping print listener setup - not on ColorFlex app page');return;}var _tryAttachListener=function tryAttachListener(){var attempt=arguments.length>0&&arguments[0]!==undefined?arguments[0]:1;var maxAttempts=arguments.length>1&&arguments[1]!==undefined?arguments[1]:10;var printButton=document.getElementById("printButton");if(printButton){var newButton=printButton.cloneNode(true);printButton.parentNode.replaceChild(newButton,printButton);newButton.addEventListener("click",/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(){var result;return _regenerator().w(function(_context4){while(1)switch(_context4.n){case 0:console.log("Print preview triggered");_context4.n=1;return generatePrintPreview();case 1:result=_context4.v;if(!result){console.error("Print preview - Failed to generate output");}case 2:return _context4.a(2);}},_callee4);})));console.log("✅ Print listener attached");}else if(attempt<maxAttempts){// Silently retry - only log if debug mode
setTimeout(function(){return _tryAttachListener(attempt+1,maxAttempts);},500);}else{// Only log once at the end if print button never found
console.log("ℹ️ Print button not found - feature not available on this page");}};console.log("Print listener - Initial DOM state:",document.readyState);console.log("Print listener - Pattern preview wrapper:",document.getElementById("patternPreviewWrapper"));if(document.readyState==="complete"||document.readyState==="interactive"){_tryAttachListener();}else{document.addEventListener("DOMContentLoaded",function(){console.log("Print listener - DOMContentLoaded fired");_tryAttachListener();});}};var toInitialCaps=function toInitialCaps(str){if(!str||typeof str!=='string'){return'';}return str.toLowerCase().replace(/\.\w+$/,'')// Remove file extensions like .jpg, .png, etc.
.replace(/-\d+x\d+$|-variant$/i,'')// Remove suffixes like -24x24, -variant
.replace(/_/g,' ')// Replace underscores with spaces
.split(/[\s-]+/)// Split on spaces and hyphens
.map(function(word){return word.charAt(0).toUpperCase()+word.slice(1);}).join(" ");};var toTitleCase=function toTitleCase(str){if(!str||typeof str!=='string'){return'';}return str.toLowerCase().split(' ').map(function(word){return word.charAt(0).toUpperCase()+word.slice(1);}).join(' ');};var stripSWNumber=function stripSWNumber(colorName){return colorName.replace(/(SW|SC)\d+\s*/,'').trim();// Removes "SW" followed by digits and optional space
};var getContrastClass=function getContrastClass(hex){// console.trace("getContrastClass received:", hex);
if(typeof hex!=="string"||!hex.startsWith("#")||hex.length<7){console.warn("⚠️ Invalid hex value in getContrastClass:",hex);return"text-black";// or choose a safe default
}var r=parseInt(hex.slice(1,3),16);var g=parseInt(hex.slice(3,5),16);var b=parseInt(hex.slice(5,7),16);var brightness=(r*299+g*587+b*114)/1000;return brightness>128?"text-black":"text-white";};function drawFurnitureLayer(_x7,_x8){return _drawFurnitureLayer.apply(this,arguments);}// Create a color input UI element
function _drawFurnitureLayer(){_drawFurnitureLayer=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee17(ctx,imagePath){var options,_options$tintColor,tintColor,_options$isMask,isMask,_options$opacity,opacity,_options$blendMode,blendMode,_options$zoomState,zoomState,_options$highRes,highRes,width,height,renderScale,renderWidth,renderHeight,isSimpleModeRender,activeZoomState,scale,offsetX,offsetY,img,scaledWidth,scaledHeight,drawX,verticalOffset,drawY,tempCanvas,tempCtx,maskProcessCanvas,maskProcessCtx,maskImageData,maskData,outputImageData,outputData,hex,r,g,b,i,maskR,maskG,maskB,maskA,maskIntensity,alpha,isExtrasLayer,isPatternLayer,useLuminanceLogic,processCanvas,processCtx,imageData,data,_hex,rLayer,gLayer,bLayer,_i11,_r,_g,_b,brightness,_alpha,_processCanvas,_processCtx,_imageData2,_data,_hex2,rTint,gTint,bTint,_i12,originalAlpha,_r2,_g2,_b2,_brightness,shadeFactor,_args24=arguments,_t19,_t20,_t21,_t22;return _regenerator().w(function(_context24){while(1)switch(_context24.p=_context24.n){case 0:options=_args24.length>2&&_args24[2]!==undefined?_args24[2]:{};console.log("🔍 drawFurnitureLayer ENTRY:");console.log("  imagePath received:",imagePath);console.log("  Is sofa base?",imagePath===null||imagePath===void 0?void 0:imagePath.includes('sofa-capitol-base'));console.log("  Is ferns pattern?",imagePath===null||imagePath===void 0?void 0:imagePath.includes('ferns'));_options$tintColor=options.tintColor,tintColor=_options$tintColor===void 0?null:_options$tintColor,_options$isMask=options.isMask,isMask=_options$isMask===void 0?false:_options$isMask,_options$opacity=options.opacity,opacity=_options$opacity===void 0?1.0:_options$opacity,_options$blendMode=options.blendMode,blendMode=_options$blendMode===void 0?"source-over":_options$blendMode,_options$zoomState=options.zoomState,zoomState=_options$zoomState===void 0?null:_options$zoomState,_options$highRes=options.highRes,highRes=_options$highRes===void 0?false:_options$highRes;// Use canvas dimensions instead of hardcoded values
width=ctx.canvas.width;height=ctx.canvas.height;// ✅ Scale up for high resolution pattern rendering
renderScale=highRes?2:1;renderWidth=width*renderScale;renderHeight=height*renderScale;// ✅ Use passed zoom state if provided, otherwise fall back to global
// Simple mode: use scale 1.0 (no zoom reduction) for full-size rendering
isSimpleModeRender=window.COLORFLEX_SIMPLE_MODE===true;activeZoomState=zoomState||{scale:isSimpleModeRender?1.0:furnitureViewSettings.scale,offsetX:isSimpleModeRender?0:furnitureViewSettings.offsetX,offsetY:isSimpleModeRender?0:furnitureViewSettings.offsetY,isZoomed:false};scale=activeZoomState.scale,offsetX=activeZoomState.offsetX,offsetY=activeZoomState.offsetY;console.log("\uD83D\uDD0D drawFurnitureLayer DEBUG for: ".concat(imagePath.split('/').pop()));console.log("   \uD83D\uDCCA ZOOM STATE: scale=".concat(scale,", offset=(").concat(offsetX.toFixed(1),", ").concat(offsetY.toFixed(1),")"));console.log("   \uD83D\uDD12 Using ".concat(zoomState?'PASSED':'GLOBAL'," zoom state"));console.log("   Canvas size: ".concat(width,"x").concat(height));_context24.p=1;console.log("   \uD83D\uDD0D Attempting to load image: ".concat(imagePath));_context24.n=2;return loadImage(imagePath);case 2:img=_context24.v;if(img){_context24.n=3;break;}console.error("❌ Failed to load image:",imagePath);console.error("❌ Image object is null/undefined - check path and CORS");return _context24.a(2);case 3:console.log("   \u2705 Image loaded successfully: ".concat(img.naturalWidth,"x").concat(img.naturalHeight));console.log("   \uD83D\uDCCD Image source: ".concat(img.src));if(highRes)console.log("   \uD83D\uDD0D High-res rendering: ".concat(renderWidth,"x").concat(renderHeight));// ✅ CRITICAL: Check if image actually loaded (not broken)
if(!(img.naturalWidth===0||img.naturalHeight===0)){_context24.n=4;break;}console.error("❌ Image has zero dimensions - image failed to load properly!");console.error("❌ This will cause a solid rectangle instead of pattern!");return _context24.a(2);case 4:// ✅ REVERT: Use original scaling logic (was correct before)
scaledWidth=img.naturalWidth*scale;scaledHeight=img.naturalHeight*scale;// Center the image horizontally, but position vertically to show more of the bottom
// Adjust drawY to shift image up (negative offset) so bottom isn't cropped
drawX=renderWidth/2-scaledWidth/2+offsetX*renderScale;// ✅ FIX: Shift image up by 15% of canvas height to show more of bottom, less empty space at top
verticalOffset=isSimpleModeRender&&window.COLORFLEX_MODE==='FURNITURE'?-(renderHeight*0.15):0;drawY=renderHeight/2-scaledHeight/2+offsetY*renderScale+verticalOffset;console.log("   Draw position: (".concat(drawX.toFixed(1),", ").concat(drawY.toFixed(1),")"));// Create working canvas at render resolution
tempCanvas=document.createElement("canvas");tempCanvas.width=renderWidth;tempCanvas.height=renderHeight;tempCtx=tempCanvas.getContext("2d");// ✅ FIX: Enable image smoothing to prevent aliasing
tempCtx.imageSmoothingEnabled=true;tempCtx.imageSmoothingQuality="high";if(!(isMask&&tintColor)){_context24.n=8;break;}// ✅ CORRECTED WALL MASK LOGIC
console.log("   \uD83C\uDFAD Processing wall mask with color ".concat(tintColor));// ✅ FIX: Process mask on separate canvas to avoid misalignment from alpha channel processing
// Create a processing canvas exactly the size of the scaled image
maskProcessCanvas=document.createElement("canvas");maskProcessCanvas.width=Math.ceil(scaledWidth);maskProcessCanvas.height=Math.ceil(scaledHeight);maskProcessCtx=maskProcessCanvas.getContext("2d");// ✅ FIX: Enable image smoothing to prevent aliasing
maskProcessCtx.imageSmoothingEnabled=true;maskProcessCtx.imageSmoothingQuality="high";// Draw the scaled mask image at (0,0) on processing canvas
maskProcessCtx.drawImage(img,0,0,scaledWidth,scaledHeight);// Get the mask pixel data from processing canvas (only image area)
_context24.p=5;maskImageData=maskProcessCtx.getImageData(0,0,Math.ceil(scaledWidth),Math.ceil(scaledHeight));_context24.n=7;break;case 6:_context24.p=6;_t19=_context24.v;console.warn("⚠️ Canvas tainted, falling back to simple draw for mask processing:",_t19.message);tempCtx.drawImage(img,drawX,drawY,scaledWidth,scaledHeight);ctx.drawImage(tempCanvas,0,0);return _context24.a(2);case 7:maskData=maskImageData.data;// Create output canvas with the tint color (same size as image)
outputImageData=maskProcessCtx.createImageData(Math.ceil(scaledWidth),Math.ceil(scaledHeight));outputData=outputImageData.data;console.log("🎨 TINTING DEBUG:");console.log("  Image being tinted:",imagePath===null||imagePath===void 0?void 0:imagePath.split('/').pop());console.log("  tintColor parameter:",tintColor);console.log("  Is sofa base:",imagePath===null||imagePath===void 0?void 0:imagePath.includes('sofa-capitol-base'));// Parse tint color
hex=tintColor.replace("#","");r=parseInt(hex.substring(0,2),16);g=parseInt(hex.substring(2,4),16);b=parseInt(hex.substring(4,6),16);console.log("  Parsed RGB:",r,g,b);console.log("  Should be Cottage Linen RGB: 240, 240, 233");console.log("   \uD83C\uDFA8 Tint color RGB: (".concat(r,", ").concat(g,", ").concat(b,")"));// ✅ FIX: Apply mask with smooth alpha transition to prevent aliasing
// White areas in mask = wall color, black areas = transparent
for(i=0;i<maskData.length;i+=4){maskR=maskData[i];maskG=maskData[i+1];maskB=maskData[i+2];maskA=maskData[i+3];// Use actual alpha channel if present
// Calculate mask intensity (how white the pixel is)
// Use luminance formula for better grayscale conversion
maskIntensity=maskR*0.299+maskG*0.587+maskB*0.114;// ✅ FIX: Use smooth alpha transition instead of hard threshold to prevent aliasing
// Map mask intensity (0-255) to alpha (0-255) with smooth curve
// This creates smooth edges instead of jagged aliased edges
alpha=Math.round(maskIntensity/255*(maskA/255)*255);// Apply wall color with calculated alpha
outputData[i]=r;outputData[i+1]=g;outputData[i+2]=b;outputData[i+3]=alpha;// Smooth alpha based on mask intensity
}// Put the processed image data to the processing canvas
maskProcessCtx.putImageData(outputImageData,0,0);// Now composite the processed mask at the correct position on temp canvas
tempCtx.drawImage(maskProcessCanvas,drawX,drawY);console.log("   \u2705 Wall mask applied: white areas colored, black areas transparent");_context24.n=23;break;case 8:if(!tintColor){_context24.n=22;break;}// ✅ Use luminance-based logic for furniture bases and pattern layers
// Use EXTRAS logic for tintable extras (preserves PNG alpha)
// ✅ CRITICAL: Check both path string AND options flag
isExtrasLayer=(imagePath===null||imagePath===void 0?void 0:imagePath.includes('extras-tintable'))||options.isTintableExtras===true;// ✅ FIX: Include furniture collection paths (-fur suffix) and scale-1.0 pattern files
// Also check for explicit pattern layer flag
isPatternLayer=options.isPatternLayer===true;useLuminanceLogic=!isExtrasLayer&&(isPatternLayer||(imagePath===null||imagePath===void 0?void 0:imagePath.includes('sofa-capitol-base'))||(imagePath===null||imagePath===void 0?void 0:imagePath.includes('/furniture/'))||(imagePath===null||imagePath===void 0?void 0:imagePath.includes('patterns/'))||(imagePath===null||imagePath===void 0?void 0:imagePath.includes('_pattern_'))||(imagePath===null||imagePath===void 0?void 0:imagePath.includes('_layer-'))||(imagePath===null||imagePath===void 0?void 0:imagePath.includes('-fur/layers/'))||(imagePath===null||imagePath===void 0?void 0:imagePath.includes('_scale-'))||(imagePath===null||imagePath===void 0?void 0:imagePath.match(/collections\/.*-fur\/layers\//)));if(!useLuminanceLogic){_context24.n=12;break;}console.log("🎨 Using LUMINANCE-based logic for:",imagePath===null||imagePath===void 0?void 0:imagePath.split('/').pop());console.log("   📐 Image will be drawn at:","(".concat(drawX.toFixed(1),", ").concat(drawY.toFixed(1),")"),"size: ".concat(scaledWidth.toFixed(1),"x").concat(scaledHeight.toFixed(1)));// ✅ FIX: Process image on separate canvas to avoid misalignment from alpha channel processing
// Create a processing canvas exactly the size of the scaled image
processCanvas=document.createElement("canvas");processCanvas.width=Math.ceil(scaledWidth);processCanvas.height=Math.ceil(scaledHeight);processCtx=processCanvas.getContext("2d");// Draw image at (0,0) on processing canvas
processCtx.drawImage(img,0,0,scaledWidth,scaledHeight);console.log("   ✅ Image drawn to processing canvas, now processing luminance...");// Get image data from processing canvas (only the image area, not full canvas)
_context24.p=9;imageData=processCtx.getImageData(0,0,Math.ceil(scaledWidth),Math.ceil(scaledHeight));_context24.n=11;break;case 10:_context24.p=10;_t20=_context24.v;console.warn("⚠️ Canvas tainted, falling back to simple tinting for luminance processing:",_t20.message);// Fall back to simple tinting
tempCtx.fillStyle=tintColor;tempCtx.fillRect(drawX,drawY,scaledWidth,scaledHeight);tempCtx.globalCompositeOperation="destination-in";tempCtx.drawImage(img,drawX,drawY,scaledWidth,scaledHeight);tempCtx.globalCompositeOperation="source-over";ctx.drawImage(tempCanvas,0,0);return _context24.a(2);case 11:data=imageData.data;// Parse tint color
_hex=tintColor.replace("#","");rLayer=parseInt(_hex.substring(0,2),16);gLayer=parseInt(_hex.substring(2,4),16);bLayer=parseInt(_hex.substring(4,6),16);// ✅ USE LUMINANCE for both sofa base AND patterns
for(_i11=0;_i11<data.length;_i11+=4){_r=data[_i11];_g=data[_i11+1];_b=data[_i11+2];brightness=(_r+_g+_b)/3;if(brightness<=5){// Pure black - transparent
data[_i11+3]=0;}else{// Non-black pixels - tint based on brightness
_alpha=brightness/255;data[_i11]=rLayer;data[_i11+1]=gLayer;data[_i11+2]=bLayer;data[_i11+3]=Math.round(_alpha*255);}}// Put processed data back to processing canvas
processCtx.putImageData(imageData,0,0);// Now composite the processed image at the correct position on temp canvas
tempCtx.drawImage(processCanvas,drawX,drawY);_context24.n=21;break;case 12:if(!isExtrasLayer){_context24.n=20;break;}// ✅ EXTRAS LAYER: Tint ONLY within existing alpha channel
// Respects the PNG transparency - only colorizes visible pixels
console.log("🛋️ Using EXTRAS tinting logic for:",imagePath===null||imagePath===void 0?void 0:imagePath.split('/').pop());// ✅ FIX: Process image on separate canvas to avoid misalignment from alpha channel processing
// Create a processing canvas exactly the size of the scaled image
_processCanvas=document.createElement("canvas");_processCanvas.width=Math.ceil(scaledWidth);_processCanvas.height=Math.ceil(scaledHeight);_processCtx=_processCanvas.getContext("2d");// Draw image at (0,0) on processing canvas
_processCtx.drawImage(img,0,0,scaledWidth,scaledHeight);_context24.p=13;_imageData2=_processCtx.getImageData(0,0,Math.ceil(scaledWidth),Math.ceil(scaledHeight));_context24.n=15;break;case 14:_context24.p=14;_t21=_context24.v;console.warn("⚠️ Canvas tainted for extras, falling back to simple draw:",_t21.message);// Fall back to drawing directly at position
tempCtx.drawImage(img,drawX,drawY,scaledWidth,scaledHeight);ctx.drawImage(tempCanvas,0,0);return _context24.a(2);case 15:_data=_imageData2.data;// Parse tint color
_hex2=tintColor.replace("#","");rTint=parseInt(_hex2.substring(0,2),16);gTint=parseInt(_hex2.substring(2,4),16);bTint=parseInt(_hex2.substring(4,6),16);// Process each pixel - multiply UI color by pixel brightness, preserve alpha
// White pixels (255,255,255) → 100% UI color
// Black pixels (0,0,0) → black (0,0,0)
// Gray pixels → proportional shade of UI color
_i12=0;case 16:if(!(_i12<_data.length)){_context24.n=19;break;}originalAlpha=_data[_i12+3];// Skip fully transparent pixels
if(!(originalAlpha===0)){_context24.n=17;break;}return _context24.a(3,18);case 17:_r2=_data[_i12];_g2=_data[_i12+1];_b2=_data[_i12+2];// Calculate brightness/luminance of original pixel
_brightness=(_r2+_g2+_b2)/3;shadeFactor=_brightness/255;// 0.0 (black) to 1.0 (white)
// Multiply UI color by brightness factor
// White pixels (shadeFactor=1.0) become 100% UI color
// Black pixels (shadeFactor=0.0) stay black
// Preserves shading and highlights
_data[_i12]=Math.round(rTint*shadeFactor);_data[_i12+1]=Math.round(gTint*shadeFactor);_data[_i12+2]=Math.round(bTint*shadeFactor);// PRESERVE original alpha - don't modify data[i + 3]
case 18:_i12+=4;_context24.n=16;break;case 19:// Put processed data back to processing canvas
_processCtx.putImageData(_imageData2,0,0);// Now composite the processed image at the correct position on temp canvas
tempCtx.drawImage(_processCanvas,drawX,drawY);console.log("✅ Extras tinting applied (alpha-preserved) with color:",tintColor);_context24.n=21;break;case 20:// Keep original alpha-based logic for other elements (if any)
tempCtx.fillStyle=tintColor;tempCtx.fillRect(0,0,width,height);tempCtx.globalCompositeOperation="destination-in";tempCtx.drawImage(img,drawX,drawY,scaledWidth,scaledHeight);tempCtx.globalCompositeOperation="source-over";case 21:_context24.n=23;break;case 22:// Direct images - draw at calculated position and size
tempCtx.drawImage(img,drawX,drawY,scaledWidth,scaledHeight);console.log("   \u2705 Direct image drawn at (".concat(drawX.toFixed(1),", ").concat(drawY.toFixed(1),")"));case 23:// Draw to main canvas
ctx.save();ctx.globalAlpha=opacity;console.log("   \uD83C\uDFA8 Using ".concat(blendMode.toUpperCase()," blend for"),imagePath===null||imagePath===void 0?void 0:imagePath.split('/').pop());ctx.globalCompositeOperation=blendMode;if(highRes){// Scale down from high-res to normal resolution
ctx.drawImage(tempCanvas,0,0,renderWidth,renderHeight,0,0,width,height);console.log("   \u2705 High-res layer scaled down and composited");}else{ctx.drawImage(tempCanvas,0,0);}ctx.restore();console.log("   \u2705 Layer composited to main canvas");_context24.n=25;break;case 24:_context24.p=24;_t22=_context24.v;console.error("❌ Error in drawFurnitureLayer:",_t22);case 25:return _context24.a(2);}},_callee17,null,[[13,14],[9,10],[5,6],[1,24]]);}));return _drawFurnitureLayer.apply(this,arguments);}var createColorInput=function createColorInput(label,id,initialColor){var isBackground=arguments.length>3&&arguments[3]!==undefined?arguments[3]:false;console.log("Creating ".concat(label," input, ID: ").concat(id,", initialColor: ").concat(initialColor));var container=document.createElement("div");container.className="layer-input-container";var labelEl=document.createElement("div");labelEl.className="layer-label";labelEl.textContent=label||"Unknown Layer";// Create wrapper for color circle with +/- buttons
var colorControlsWrapper=document.createElement("div");colorControlsWrapper.style.cssText="\n        position: relative;\n        display: inline-block;\n    ";// Create darker button (left side, minus)
var darkerButton=document.createElement("button");darkerButton.className="lightness-adjust-btn";darkerButton.textContent="−";darkerButton.title="Find darker color";darkerButton.style.cssText="\n        position: absolute;\n        left: -16px;\n        top: 50%;\n        transform: translateY(-50%);\n        width: 20px;\n        height: 20px;\n        border-radius: 50%;\n        background: rgba(0, 0, 0, 0.7);\n        color: white;\n        border: 1px solid rgba(255, 255, 255, 0.3);\n        font-size: 16px;\n        font-weight: bold;\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        padding: 0;\n        line-height: 1;\n        z-index: 10;\n        opacity: 0;\n        pointer-events: none;\n        transition: all 0.2s ease;\n    ";// Create lighter button (right side, plus)
var lighterButton=document.createElement("button");lighterButton.className="lightness-adjust-btn";lighterButton.textContent="+";lighterButton.title="Find lighter color";lighterButton.style.cssText="\n        position: absolute;\n        right: -8px;\n        top: 50%;\n        transform: translateY(-50%);\n        width: 20px;\n        height: 20px;\n        border-radius: 50%;\n        background: rgba(255, 255, 255, 0.9);\n        color: black;\n        border: 1px solid rgba(0, 0, 0, 0.3);\n        font-size: 16px;\n        font-weight: bold;\n        cursor: pointer;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        padding: 0;\n        line-height: 1;\n        z-index: 10;\n        opacity: 0;\n        pointer-events: none;\n        transition: all 0.2s ease;\n    ";var colorCircle=document.createElement("div");colorCircle.className="circle-input";colorCircle.id="".concat(id,"Circle");var cleanInitialColor=(initialColor||"Snowbound").replace(/^(SW|SC)\d+\s*/i,"").trim();var colorValue=lookupColor(cleanInitialColor);console.log("Setting ".concat(label," circle background to: ").concat(colorValue));colorCircle.style.backgroundColor=colorValue;// Assemble color controls (darker button + circle + lighter button)
colorControlsWrapper.appendChild(darkerButton);colorControlsWrapper.appendChild(colorCircle);colorControlsWrapper.appendChild(lighterButton);// Show/hide buttons on hover
colorControlsWrapper.addEventListener("mouseenter",function(){darkerButton.style.opacity="1";darkerButton.style.pointerEvents="auto";lighterButton.style.opacity="1";lighterButton.style.pointerEvents="auto";});colorControlsWrapper.addEventListener("mouseleave",function(){darkerButton.style.opacity="0";darkerButton.style.pointerEvents="none";lighterButton.style.opacity="0";lighterButton.style.pointerEvents="none";});var input=document.createElement("input");input.type="text";input.className="layer-input";input.id=id;input.placeholder="Enter ".concat(label?label.toLowerCase():'layer'," color");input.value=getCleanColorName(cleanInitialColor);input.title="Enter color name (e.g., Snowbound) or SW number (e.g., SW7006)";console.log("Setting ".concat(label," input value to: ").concat(input.value));container.append(labelEl,colorControlsWrapper,input);// ✅ Track previous value to only update on actual changes
// Normalize initial value for comparison (case-insensitive, trimmed)
var previousValue=input.value.trim().toLowerCase();var updateColor=function updateColor(){var _appState$currentPatt7;var userInput=input.value.trim();var normalizedInput=userInput.toLowerCase();// ✅ FIX: Only update if value actually changed (case-insensitive comparison)
if(normalizedInput===previousValue){console.log("updateColor skipped for ".concat(label," - no change (value: ").concat(userInput,", previous: ").concat(previousValue,")"));return;}console.log("updateColor called for ".concat(label,", input value changed from \"").concat(previousValue,"\" to \"").concat(userInput,"\""));previousValue=normalizedInput;// Try to lookup the color (lookupColor handles SW/SC prefixes internally)
var hex=lookupColor(userInput);if(!userInput||hex==="#FFFFFF"){// Invalid input - restore to initial color
input.value=getCleanColorName(cleanInitialColor);colorCircle.style.backgroundColor=colorValue;previousValue=input.value.trim().toLowerCase();// Update normalized previous value
console.log("".concat(label," input restored to initial color: ").concat(colorValue));}else{// Valid color - keep user's input format (with or without SW prefix)
input.value=userInput;colorCircle.style.backgroundColor=hex;console.log("".concat(label," input updated to: ").concat(hex," (kept user format: ").concat(userInput,")"));// previousValue already updated above
}var layerIndex=appState.currentLayers.findIndex(function(layer){return layer.label===label;});if(layerIndex!==-1){appState.currentLayers[layerIndex].color=input.value;console.log("🎯 COLOR UPDATE DEBUG:");console.log("  Changed input: ".concat(label," (index ").concat(layerIndex,")"));console.log("  New value: ".concat(input.value));console.log("  Current layer structure after update:");appState.currentLayers.forEach(function(layer,i){console.log("    ".concat(i,": ").concat(layer.label," = \"").concat(layer.color,"\""));});console.log("Updated appState.currentLayers[".concat(layerIndex,"].color to: ").concat(input.value));}var isFurniturePattern=((_appState$currentPatt7=appState.currentPattern)===null||_appState$currentPatt7===void 0?void 0:_appState$currentPatt7.isFurniture)||false;// ✅ CRITICAL: Check mode and call appropriate render function
var isFurnitureMode=window.COLORFLEX_MODE==='FURNITURE'||appState.isInFurnitureMode;var isClothingMode=window.COLORFLEX_MODE==='CLOTHING'||window.COLORFLEX_SIMPLE_MODE===true&&window.COLORFLEX_MODE!=='FURNITURE';// Check if we're in fabric mode - render both fabric mockup and pattern preview
if(appState.isInFabricMode){console.log("🧵 Color changed in fabric mode - calling both renderFabricMockup() and updatePreview()");renderFabricMockup();updatePreview();// Also update the pattern preview on the left
}else if(isFurnitureMode){// ✅ FURNITURE MODE: Use updateFurniturePreview() (NOT updateRoomMockup or renderFabricMockup)
console.log("🪑 Color changed in furniture mode - calling updateFurniturePreview()");updatePreview();// Update pattern preview
if(typeof updateFurniturePreview==='function'){updateFurniturePreview();}else{console.error("❌ updateFurniturePreview not available!");}}else if(isClothingMode){// ✅ CLOTHING MODE: Use renderFabricMockup()
console.log("👗 Color changed in clothing mode - calling renderFabricMockup()");updatePreview();// Update pattern preview
renderFabricMockup();}else{// ✅ WALLPAPER MODE: Use updateRoomMockup()
console.log("🖼️ Color changed in wallpaper mode - calling updateRoomMockup()");updatePreview();updateRoomMockup();}populateCoordinates();};// Restore original event listeners
input.addEventListener("blur",updateColor);input.addEventListener("keydown",function(e){if(e.key==="Enter")updateColor();});// Restore original click handler
console.log("Attaching click handler to ".concat(label," color circle, ID: ").concat(colorCircle.id));colorCircle.addEventListener("click",function(){// Check if we're in coordinate mode (back button exists) - exit coordinate mode
var coordinateBackButton=document.getElementById('backToPatternLink');if(coordinateBackButton){console.log("\uD83D\uDD04 Color circle clicked in coordinate mode - triggering back to pattern then selecting layer");coordinateBackButton.click();// Trigger the coordinate back button
// Pass through the click after returning to pattern mode
setTimeout(function(){appState.lastSelectedLayer={input:input,circle:colorCircle,label:label,isBackground:isBackground};highlightActiveLayer(colorCircle);console.log("\u2705 Layer selected after returning from coordinate mode: ".concat(label));},50);return;}// In furniture mode, allow normal color changes - do NOT exit furniture mode
var furnitureBackButton=document.getElementById('backToPatternsBtn');if(furnitureBackButton){console.log("\uD83C\uDFA8 Color circle clicked in furniture mode - changing color while staying in furniture mode: ".concat(label));// Continue with normal color selection behavior below
}// Normal color circle behavior
appState.lastSelectedLayer={input:input,circle:colorCircle,label:label,isBackground:isBackground};highlightActiveLayer(colorCircle);console.log("Clicked ".concat(label," color circle"));});// Add hover effects for lightness adjustment buttons
var addButtonHoverEffects=function addButtonHoverEffects(button){button.addEventListener("mouseenter",function(){button.style.transform="translateY(-50%) scale(1.1)";button.style.boxShadow="0 2px 8px rgba(0, 0, 0, 0.3)";});button.addEventListener("mouseleave",function(){button.style.transform="translateY(-50%) scale(1)";button.style.boxShadow="none";});};addButtonHoverEffects(darkerButton);addButtonHoverEffects(lighterButton);// Darker button click handler
darkerButton.addEventListener("click",function(e){e.stopPropagation();// Prevent triggering color circle click
console.log("\uD83D\uDD3D Darker button clicked for ".concat(label));var currentColorName=input.value.trim();var newColor=findLighterDarkerSWColor(currentColorName,"darker");if(newColor){// Update input and color circle
input.value=newColor.color_name;var newHex="#".concat(newColor.hex);colorCircle.style.backgroundColor=newHex;// Update appState
var layerIndex=appState.currentLayers.findIndex(function(layer){return layer.label===label;});if(layerIndex!==-1){appState.currentLayers[layerIndex].color=newColor.color_name;console.log("\u2705 Updated ".concat(label," to darker color: ").concat(newColor.color_name));}// Re-render previews
// ✅ MODE CHECK: Use correct render function based on mode
var isFurnitureMode=window.COLORFLEX_MODE==='FURNITURE'||appState.isInFurnitureMode;var isClothingMode=window.COLORFLEX_MODE==='CLOTHING'||window.COLORFLEX_SIMPLE_MODE===true&&window.location.pathname.includes('clothing');if(isFurnitureMode){updateFurniturePreview();updatePreview();}else if(appState.isInFabricMode||isClothingMode){renderFabricMockup();updatePreview();}else{updatePreview();updateRoomMockup();}populateCoordinates();}else{console.log("\u26A0\uFE0F No darker color found for ".concat(currentColorName));}});// Lighter button click handler
lighterButton.addEventListener("click",function(e){e.stopPropagation();// Prevent triggering color circle click
console.log("\uD83D\uDD3C Lighter button clicked for ".concat(label));var currentColorName=input.value.trim();var newColor=findLighterDarkerSWColor(currentColorName,"lighter");if(newColor){// Update input and color circle
input.value=newColor.color_name;var newHex="#".concat(newColor.hex);colorCircle.style.backgroundColor=newHex;// Update appState
var layerIndex=appState.currentLayers.findIndex(function(layer){return layer.label===label;});if(layerIndex!==-1){appState.currentLayers[layerIndex].color=newColor.color_name;console.log("\u2705 Updated ".concat(label," to lighter color: ").concat(newColor.color_name));}// Re-render previews
// ✅ MODE CHECK: Use correct render function based on mode
var isFurnitureMode=window.COLORFLEX_MODE==='FURNITURE'||appState.isInFurnitureMode;var isClothingMode=window.COLORFLEX_MODE==='CLOTHING'||window.COLORFLEX_SIMPLE_MODE===true&&window.location.pathname.includes('clothing');if(isFurnitureMode){updateFurniturePreview();updatePreview();}else if(appState.isInFabricMode||isClothingMode){renderFabricMockup();updatePreview();}else{updatePreview();updateRoomMockup();}populateCoordinates();}else{console.log("\u26A0\uFE0F No lighter color found for ".concat(currentColorName));}});return{container:container,input:input,circle:colorCircle,label:label,isBackground:isBackground};};// Populate curated colors in header
function populateCuratedColors(colors){var _appState$currentPatt8,_appState$currentPatt9,_appState$currentPatt0;console.log("🎨 populateCuratedColors called with colors:",colors===null||colors===void 0?void 0:colors.length);console.log("🔍 curatedColorsContainer element:",dom.curatedColorsContainer);if(!dom.curatedColorsContainer){console.log("ℹ️ curatedColorsContainer not in DOM (expected for simple mode pages)");return;}// 🎨 SIMPLE MODE: Skip curated colors entirely if in simple mode
var isSimpleMode=window.COLORFLEX_SIMPLE_MODE===true;if(isSimpleMode){console.log("🎨 Simple mode detected - skipping curated colors");return;}// ⚠️ Don't show curated colors for standard patterns (no layers)
var isStandardPattern=!((_appState$currentPatt8=appState.currentPattern)!==null&&_appState$currentPatt8!==void 0&&_appState$currentPatt8.layers)||appState.currentPattern.layers.length===0;console.log("🔍 CURATED COLORS CHECK:");console.log("  Pattern:",(_appState$currentPatt9=appState.currentPattern)===null||_appState$currentPatt9===void 0?void 0:_appState$currentPatt9.name);console.log("  Has layers:",((_appState$currentPatt0=appState.currentPattern)===null||_appState$currentPatt0===void 0||(_appState$currentPatt0=_appState$currentPatt0.layers)===null||_appState$currentPatt0===void 0?void 0:_appState$currentPatt0.length)||0);console.log("  Is standard pattern:",isStandardPattern);if(isStandardPattern){console.log("⏭️ HIDING CURATED COLORS: This is a standard pattern (no layers)");dom.curatedColorsContainer.innerHTML="";console.log("✅ Curated colors container cleared");return;}console.log("✅ SHOWING CURATED COLORS: This is a ColorFlex pattern with",appState.currentPattern.layers.length,"layers");if(!colors||!colors.length){console.warn("⚠️ No curated colors provided, colors array:",colors);return;}console.log("✅ About to populate",colors.length,"curated colors");dom.curatedColorsContainer.innerHTML="";// 🎟️ Run The Ticket Button - Only show for ColorFlex patterns
if(true){var ticketCircle=document.createElement("div");ticketCircle.id="runTheTicketCircle";ticketCircle.className="curated-color-circle cursor-pointer border-2";ticketCircle.style.backgroundColor="black";var ticketLabel=document.createElement("span");ticketLabel.className="text-xs font-bold text-white text-center whitespace-pre-line font-special-elite";ticketLabel.textContent=appState.activeTicketNumber?"TICKET\n".concat(appState.activeTicketNumber):"RUN\nTHE\nTICKET";ticketCircle.appendChild(ticketLabel);ticketCircle.addEventListener("click",function(){var ticketNumber=prompt("🎟️ Enter the Sherwin-Williams Ticket Number:");if(ticketNumber)runStaticTicket(ticketNumber.trim());});dom.curatedColorsContainer.appendChild(ticketCircle);}// 🎨 Add curated color swatches
colors.forEach(function(label){var _found$sw_number;if(!Array.isArray(appState.colorsData)){console.error("❌ appState.colorsData is not available or not an array");return;}console.log("\uD83D\uDD0D Finding curated color for label: \"".concat(label,"\""));// Parse label to extract SW number and color name
// Expected format: "SW6248 Cherries Jubilee" or "SC0001 Cottage Linen"
var swMatch=label.match(/\b(SW|SC)(\d+)\b/i);var swNumber=swMatch?"".concat(swMatch[1].toUpperCase()).concat(swMatch[2]):null;// Extract color name (everything after SW/SC number)
var colorNamePart=swNumber?label.replace(/\b(SW|SC)\d+\s*/i,'').trim().toLowerCase():label.toLowerCase().trim();console.log("\uD83D\uDCCB Parsed: SW=".concat(swNumber,", ColorName=\"").concat(colorNamePart,"\""));// Find by SW number first (most reliable), then by exact color name match
var found=appState.colorsData.find(function(c){var _c$sw_number;if(!c)return false;// Match by SW number if available
if(swNumber&&((_c$sw_number=c.sw_number)===null||_c$sw_number===void 0?void 0:_c$sw_number.toUpperCase())===swNumber){return true;}// Match by exact color name (case-insensitive)
if(c.color_name&&c.color_name.toLowerCase()===colorNamePart){return true;}return false;});if(!found){console.error("\u274C No color found for curated label: \"".concat(label,"\""));return;}if(!found.hex){console.error("\u274C Missing hex for found color:",found);return;}var hex="#".concat(found.hex);console.log("\u2705 Curated color found: \"".concat(label,"\" -> ").concat(found.sw_number," ").concat(found.color_name," -> ").concat(hex));var circle=document.createElement("div");circle.className="curated-color-circle cursor-pointer";circle.style.backgroundColor=hex;circle.style.setProperty('background-color',hex,'important');var text=document.createElement("span");text.className="text-xs font-bold text-center ".concat(getContrastClass(hex));text.style.cssText='white-space: pre-line; display: block;';text.innerHTML="".concat((_found$sw_number=found.sw_number)===null||_found$sw_number===void 0?void 0:_found$sw_number.toUpperCase(),"<br>").concat(toInitialCaps(found.color_name));circle.appendChild(text);circle.addEventListener("click",function(){var selectedLayer=appState.lastSelectedLayer;if(!selectedLayer)return alert("Please select a layer first.");selectedLayer.input.value=getCleanColorName(found.color_name);selectedLayer.circle.style.backgroundColor=hex;var i=appState.currentLayers.findIndex(function(l){return l.label===selectedLayer.label;});if(i!==-1)appState.currentLayers[i].color=found.color_name;var j=appState.layerInputs.findIndex(function(li){return li.label===selectedLayer.label;});if(j!==-1){appState.layerInputs[j].input.value=getCleanColorName(found.color_name);appState.layerInputs[j].circle.style.backgroundColor=hex;}appState.lastSelectedColor={name:found.color_name,hex:hex};updateDisplays();});dom.curatedColorsContainer.appendChild(circle);});console.log("✅ Curated colors populated:",colors.length);}function getLayerMappingForPreview(isFurnitureCollection){if(isFurnitureCollection){return{type:'furniture',patternStartIndex:2,// Pattern layers start at index 2  
wallIndex:0,// Wall color = first input (index 0) - for wall mask
backgroundIndex:1// Sofa base = second input (index 1) - the background/base color
};}else{return{type:'standard',patternStartIndex:1,// Pattern layers start at index 1
backgroundIndex:0,// True background
wallIndex:null// No wall color
};}}function validateLayerMapping(){var isFurnitureCollection=false;// Removed furniture logic
var mapping=getLayerMappingForPreview(isFurnitureCollection);console.log("🔍 LAYER MAPPING VALIDATION (WITH WALL COLOR):");console.log("  Collection type:",isFurnitureCollection?"furniture":"standard");console.log("  Total inputs:",appState.currentLayers.length);console.log("  Pattern start index:",mapping.patternStartIndex);console.log("  Background/Sofa base index:",mapping.backgroundIndex);console.log("  Wall index:",mapping.wallIndex);console.log("  Layer assignments:");appState.currentLayers.forEach(function(layer,index){var usage="unused";if(index===mapping.wallIndex){usage="wall color (via mask)";}else if(index===mapping.backgroundIndex){if(isFurnitureCollection){usage="sofa base + pattern background";}else{usage="pattern background";}}else if(index>=mapping.patternStartIndex){usage="pattern layer ".concat(index-mapping.patternStartIndex);}console.log("    ".concat(index,": ").concat(layer.label," = \"").concat(layer.color,"\" (").concat(usage,")"));});// Show the mapping clearly
if(isFurnitureCollection){var _appState$currentLaye,_appState$currentLaye2,_appState$currentLaye3;console.log("🔄 FURNITURE COLLECTION MAPPING (WITH WALL MASK):");console.log("  Pattern Preview:");console.log("    Background \u2190 Input ".concat(mapping.backgroundIndex," (").concat((_appState$currentLaye=appState.currentLayers[mapping.backgroundIndex])===null||_appState$currentLaye===void 0?void 0:_appState$currentLaye.label,")"));for(var i=0;i<appState.currentLayers.length-mapping.patternStartIndex;i++){var inputIndex=mapping.patternStartIndex+i;if(appState.currentLayers[inputIndex]){console.log("    Pattern Layer ".concat(i," \u2190 Input ").concat(inputIndex," (").concat(appState.currentLayers[inputIndex].label,")"));}}console.log("  Furniture Mockup:");console.log("    Room Scene ← sofa-capitol.png");console.log("    Wall Areas \u2190 Input ".concat(mapping.wallIndex," (").concat((_appState$currentLaye2=appState.currentLayers[mapping.wallIndex])===null||_appState$currentLaye2===void 0?void 0:_appState$currentLaye2.label,") via wall mask"));console.log("    Sofa Base \u2190 Input ".concat(mapping.backgroundIndex," (").concat((_appState$currentLaye3=appState.currentLayers[mapping.backgroundIndex])===null||_appState$currentLaye3===void 0?void 0:_appState$currentLaye3.label,")"));for(var _i4=0;_i4<appState.currentLayers.length-mapping.patternStartIndex;_i4++){var _inputIndex=mapping.patternStartIndex+_i4;if(appState.currentLayers[_inputIndex]){console.log("    Pattern Layer ".concat(_i4," \u2190 Input ").concat(_inputIndex," (").concat(appState.currentLayers[_inputIndex].label,")"));}}}}function insertTicketIndicator(ticketNumber){var existing=document.getElementById("ticketIndicator");if(existing){existing.innerHTML="TICKET<br>".concat(ticketNumber);return;}var indicator=document.createElement("div");indicator.id="ticketIndicator";indicator.className="w-20 h-20 rounded-full flex items-center justify-center text-center text-xs font-bold text-gray-800";indicator.style.backgroundColor="#e5e7eb";// Tailwind gray-200
indicator.style.marginRight="8px";indicator.innerHTML="TICKET<br>".concat(ticketNumber);dom.curatedColorsContainer.prepend(indicator);}function promptTicketNumber(){var input=prompt("Enter Sherwin-Williams ticket number (e.g., 280):");var ticketNum=parseInt(input===null||input===void 0?void 0:input.trim());if(isNaN(ticketNum)){alert("Please enter a valid numeric ticket number.");return;}runStaticTicket(ticketNum);}function runTheTicket(baseColor){console.log("ðŸŽŸï¸ Running the Ticket for:",baseColor);if(!isAppReady){console.warn("⚠️ App is not ready yet. Ignoring runTheTicket call.");alert("Please wait while the app finishes loading.");return;}if(!baseColor||!baseColor.hex){console.warn("âŒ No base color provided to runTheTicket.");return;}if(!Array.isArray(appState.colorsData)||appState.colorsData.length===0){console.warn("X¸ Sherwin-Williams colors not loaded yet.");alert("Color data is still loading. Please try again shortly.");return;}var baseHSL=hexToHSL(baseColor.hex);if(!baseHSL){console.error("X Failed to convert base HEX to HSL.");return;}console.log("+ Base color HSL:",baseHSL);var swColors=appState.colorsData.filter(function(c){return c.hex&&c.name;}).map(function(c){return{name:c.name,hex:c.hex,hsl:hexToHSL(c.hex)};});console.log("** Total SW Colors to search:",swColors.length);var scored=swColors.map(function(c){var hueDiff=Math.abs(baseHSL.h-c.hsl.h);var satDiff=Math.abs(baseHSL.s-c.hsl.s);var lightDiff=Math.abs(baseHSL.l-c.hsl.l);return _objectSpread(_objectSpread({},c),{},{score:hueDiff+satDiff*0.5+lightDiff*0.8});}).sort(function(a,b){return a.score-b.score;}).slice(0,appState.currentLayers.length);console.log("ðŸŽ¯ Top Ticket matches:",scored);if(!Array.isArray(appState.layerInputs)||appState.layerInputs.length===0){console.warn("âŒ No layer inputs available. Cannot apply ticket.");return;}scored.forEach(function(ticketColor,idx){var inputSet=appState.layerInputs[idx];if(!inputSet||!inputSet.input||!inputSet.circle){console.warn("\xE2\x9D\u0152 Missing input or circle at index ".concat(idx));return;}var formatted=toInitialCaps(ticketColor.name);inputSet.input.value=formatted;inputSet.circle.style.backgroundColor=ticketColor.hex;appState.currentLayers[idx].color=formatted;console.log("\xF0\u0178\u017D\xAF Layer ".concat(idx+1," set to ").concat(formatted," (").concat(ticketColor.hex,")"));});insertTicketIndicator(ticketNumber);updateDisplays();console.log("✅ Ticket run complete.");}function runStaticTicket(ticketNumber){console.log("\xF0\u0178\u017D\xAB Static Ticket Requested: ".concat(ticketNumber));if(!Array.isArray(appState.colorsData)||appState.colorsData.length===0){alert("Color data not loaded yet.");return;}var ticketColors=[];var _loop3=function _loop3(){var locatorId="".concat(ticketNumber,"-C").concat(i);var color=appState.colorsData.find(function(c){var _c$locator_id2;return((_c$locator_id2=c.locator_id)===null||_c$locator_id2===void 0?void 0:_c$locator_id2.toUpperCase())===locatorId.toUpperCase();});if(color){var _color$sw_number;var displayName="".concat(((_color$sw_number=color.sw_number)===null||_color$sw_number===void 0?void 0:_color$sw_number.toUpperCase())||""," ").concat(toInitialCaps(color.color_name));ticketColors.push(displayName.trim());}};for(var i=1;i<=7;i++){_loop3();}if(ticketColors.length===0){alert("No colors found for ticket ".concat(ticketNumber));return;}appState.curatedColors=ticketColors;appState.activeTicketNumber=ticketNumber;// ðŸ†• Track it for label update
populateCuratedColors(ticketColors);console.log("\xF0\u0178\u017D\xAF Loaded ticket ".concat(ticketNumber," with ").concat(ticketColors.length," colors"));}// ============================================================================
// SECTION 6: APP INITIALIZATION
// ============================================================================
// Main initialization flow: DOM validation, data loading, collection setup,
// URL parameter processing, event listeners, and auto-load pattern restoration.
// This is the entry point when the ColorFlex page loads.
// ============================================================================
function initializeApp(){return _initializeApp.apply(this,arguments);}// Apply URL parameters for colors and scale
function _initializeApp(){_initializeApp=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee18(){var initTimestamp,_data$collections,_urlParams$get,_window$appState6,_window$appState7,_window$appState8,_window$appState9,_selectedCollection2,_urlParams$get2,_window$appState0,_initialPattern4,_initialPattern5,_appState$collections0,initializeInteractiveZoom,data,_window$ColorFlexAsse3,collectionsUrl,response,farmhouseCollection,_window$ColorFlexAsse4,mockupsUrl,mockupsResponse,mockupsData,urlParams,urlCollectionName,isDirectCollectionAccess,totalCollections,isClothingMode,isFurnitureMode,beforeBaseFilter,baseFilteredCount,beforeColorFlexFilter,colorFlexFilteredCount,_beforeColorFlexFilter,excludedCollections,_colorFlexFilteredCount,beforeFilterCount,filteredCount,isActuallyFurnitureMode,isActuallyClothingMode,beforeFinalCheck,excludedInFinalCheck,finalFiltered,_beforeFinalCheck,_finalFiltered,sampleNames,isActuallyFurnitureModeFinal,isActuallyClothingModeFinal,_beforeFinalCheck2,_excludedInFinalCheck,_finalFiltered2,autoLoadCollectionName,autoLoadPatternData,autoLoadJson,i,key,_localStorage$getItem,_data2,pattern,timestamp,age,pendingPurchaseJson,purchaseData,_timestamp,_age,modeDefaultCollection,collectionName,selectedCollection,baseName,_appState$collections8,_isFurnitureMode3,_isClothingMode2,firstColorFlexCollection,_appState$collections9,_isFurnitureMode4,_isClothingMode3,_selectedCollection,_firstColorFlexCollection,finalCollection,selectedCollectionName,isVariantCollection,baseNameCandidates,nameParts,_i13,candidate,baseCollection,_loop1,_i14,_baseNameCandidates,_isFurnitureMode5,isFurnitureSimpleMode,_baseName,variantNames,variantCollection,isSimpleMode,collectionBaseName,_collectionBaseName3,initialPattern,urlPatternName,autoLoadPatternName,targetPatternName,_initialPattern,_selectedCollection3,normalizedTargetPattern,_iterator3,_step3,_loop10,_initialPattern2,_initialPattern3,initialPatternId,_waitForAppAndAutoLoad,_pattern,_t23,_t24,_t25;return _regenerator().w(function(_context27){while(1)switch(_context27.p=_context27.n){case 0:initTimestamp=Date.now();console.log("🚀 Starting app...",initTimestamp);console.log("🔍 SessionStorage at app start:",sessionStorage.getItem('pendingDirectPatternLoad')?'EXISTS':'NULL');// 🧹 Clean up old cart thumbnails on app startup to prevent localStorage bloat
cleanupOldCartThumbnails();// Validate DOM elements first
validateDOMElements();// ✅ Step 1: Load Sherwin-Williams Colors
_context27.n=1;return loadColors();case 1:console.log("✅ Colors loaded:",appState.colorsData.length);_context27.p=2;initializeInteractiveZoom=function initializeInteractiveZoom(){// Set up interactive zoom when app is ready
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',addInteractiveZoom);}else{addInteractiveZoom();}};// Call this when collections are loaded
// ✅ Step 2: Load Collections
// Check if data is embedded in window object (Shopify mode)
if(!(window.ColorFlexData&&window.ColorFlexData.collections)){_context27.n=3;break;}console.log("🎯 Using embedded ColorFlex data");data={collections:window.ColorFlexData.collections};_context27.n=7;break;case 3:console.log("📁 Loading collections from Shopify assets");collectionsUrl=((_window$ColorFlexAsse3=window.ColorFlexAssets)===null||_window$ColorFlexAsse3===void 0?void 0:_window$ColorFlexAsse3.collectionsUrl)||"/assets/collections.json";_context27.n=4;return fetch(collectionsUrl,{method:'GET',cache:"no-store",headers:{'Content-Type':'application/json'}});case 4:response=_context27.v;if(response.ok){_context27.n=5;break;}throw new Error("Failed to fetch collections: ".concat(response.status));case 5:_context27.n=6;return response.json();case 6:data=_context27.v;case 7:// ADD THIS DEBUG:
console.log("🔍 Raw JSON collections loaded:",data.collections.length);farmhouseCollection=data.collections.find(function(c){return c&&typeof c.name==='string'&&c.name==="farmhouse";});console.log("🔍 Raw farmhouse collection:",farmhouseCollection);console.log("🔍 Raw farmhouse elements:",farmhouseCollection===null||farmhouseCollection===void 0?void 0:farmhouseCollection.elements);if((_data$collections=data.collections)!==null&&_data$collections!==void 0&&_data$collections.length){_context27.n=8;break;}console.error("X No collections found in collections.json");dom.collectionHeader.textContent="No Collections Available";dom.preview.innerHTML="<p>No collections available. Please run the data import script.</p>";return _context27.a(2);case 8:// ✅ Step 2.5: Load Mockups Data and merge with collections
console.log("📦 Loading centralized mockups data...");_context27.p=9;mockupsUrl=((_window$ColorFlexAsse4=window.ColorFlexAssets)===null||_window$ColorFlexAsse4===void 0?void 0:_window$ColorFlexAsse4.mockupsUrl)||"/assets/mockups.json";_context27.n=10;return fetch(mockupsUrl,{method:'GET',cache:"no-store",headers:{'Content-Type':'application/json'}});case 10:mockupsResponse=_context27.v;if(!mockupsResponse.ok){_context27.n=12;break;}_context27.n=11;return mockupsResponse.json();case 11:mockupsData=_context27.v;console.log("✅ Mockups data loaded:",Object.keys(mockupsData.mockups||{}).length,"mockups");// Store mockups globally for reference
window.ColorFlexMockups=mockupsData.mockups;// Merge mockup data into collections that reference mockupId
data.collections.forEach(function(collection){if(collection.mockupId&&mockupsData.mockups[collection.mockupId]){var _mockup$image,_mockup$image2;var mockup=mockupsData.mockups[collection.mockupId];// ✅ CRITICAL: Ensure mockup.image is a string, not an object
var mockupImagePath=typeof mockup.image==='string'?mockup.image:((_mockup$image=mockup.image)===null||_mockup$image===void 0?void 0:_mockup$image.path)||((_mockup$image2=mockup.image)===null||_mockup$image2===void 0?void 0:_mockup$image2.url)||mockup.path||'';if(!mockupImagePath){console.warn("\u26A0\uFE0F Mockup \"".concat(mockup.name,"\" has no valid image path (image: ").concat(_typeof(mockup.image),")"));}else{var _mockup$shadow,_mockup$shadow2;collection.mockup=mockupImagePath;collection.mockupShadow=typeof mockup.shadow==='string'?mockup.shadow:((_mockup$shadow=mockup.shadow)===null||_mockup$shadow===void 0?void 0:_mockup$shadow.path)||((_mockup$shadow2=mockup.shadow)===null||_mockup$shadow2===void 0?void 0:_mockup$shadow2.url)||'';collection.mockupWidthInches=mockup.widthInches;collection.mockupHeightInches=mockup.heightInches;console.log("  \uD83D\uDD17 Merged mockup \"".concat(mockup.name,"\" into collection \"").concat(collection.name,"\" (path: ").concat(mockupImagePath,")"));}}});_context27.n=13;break;case 12:console.warn("⚠️ Mockups.json not found, using mockup data from collections.json");case 13:_context27.n=15;break;case 14:_context27.p=14;_t23=_context27.v;console.warn("⚠️ Failed to load mockups.json:",_t23.message);console.warn("   Continuing with mockup data from collections.json");case 15:// Check if a specific collection is being requested via URL (e.g., from product page)
// Declare these BEFORE the collections loading block so they're available throughout
urlParams=new URLSearchParams(window.location.search);urlCollectionName=(_urlParams$get=urlParams.get("collection"))===null||_urlParams$get===void 0?void 0:_urlParams$get.trim();isDirectCollectionAccess=urlCollectionName&&urlCollectionName.includes('-clo');// ✅ Step 3: Save collections once
if(appState.collections.length){_context27.n=19;break;}// Filter out any invalid collections that might cause toLowerCase errors
appState.collections=data.collections.filter(function(c){return c&&_typeof(c)==='object'&&typeof c.name==='string';}).map(function(collection){// Also filter out invalid patterns within each collection
if(collection.patterns&&Array.isArray(collection.patterns)){collection.patterns=collection.patterns.filter(function(p){return p&&_typeof(p)==='object'&&(typeof p.name==='string'||typeof p.id==='string');});}return collection;});// Count collections before filtering
totalCollections=appState.collections.length;// ✅ NEW ARCHITECTURE: Always use base collections, branch by page mode
// No filtering - base collections work for all modes (furniture, clothing, wallpaper)
isClothingMode=window.COLORFLEX_MODE==='CLOTHING';// ✅ FALLBACK: Also check if furniture config exists or if we're on furniture page
isFurnitureMode=window.COLORFLEX_MODE==='FURNITURE'||window.location.pathname.includes('furniture')||document.querySelector('[data-furniture-mode]');// ✅ DEBUG: Log mode detection for wallpaper site protection
console.log("\uD83D\uDD0D MODE DETECTION: window.COLORFLEX_MODE = \"".concat(window.COLORFLEX_MODE,"\""));console.log("\uD83D\uDD0D MODE DETECTION: window.location.pathname = \"".concat(window.location.pathname,"\""));console.log("\uD83D\uDD0D MODE DETECTION: isClothingMode = ".concat(isClothingMode,", isFurnitureMode = ").concat(isFurnitureMode));console.log("\uD83D\uDD0D MODE DETECTION: Will use ".concat(isFurnitureMode?'FURNITURE':isClothingMode?'CLOTHING':'WALLPAPER'," mode filtering"));// Filter to only base collections (exclude .fur, .clo, .fur-1, .clo-1, -fur, -clo variants)
// ✅ Standard format: .fur (not .fur-1) - all furniture pieces go under .fur collection
beforeBaseFilter=appState.collections.length;appState.collections=appState.collections.filter(function(c){var name=c.name||'';var isFurniture=name.endsWith('.fur')||name.includes('.fur-')||name.includes('-fur');var isClothing=name.endsWith('.clo')||name.includes('.clo-')||name.includes('-clo');if(isFurniture||isClothing){console.log("\uD83D\uDEAB BASE FILTER: Excluding ".concat(name," (furniture: ").concat(isFurniture,", clothing: ").concat(isClothing,")"));return false;}return true;});baseFilteredCount=beforeBaseFilter-appState.collections.length;if(baseFilteredCount>0){console.log("\uD83D\uDD12 BASE FILTER: Removed ".concat(baseFilteredCount," furniture/clothing variant collections"));}// Store all collections (including furniture/clothing variants) for mockupLayers lookup
// Use data.collections (original unfiltered) before BASE FILTER removes variants
appState.allCollections=data.collections.filter(function(c){return c&&_typeof(c)==='object'&&typeof c.name==='string';});// Keep full list for lookup
// ✅ DEBUG: Log before filtering to verify mode detection
console.log("\uD83D\uDD0D PRE-FILTER: isClothingMode=".concat(isClothingMode,", isFurnitureMode=").concat(isFurnitureMode,", collections=").concat(appState.collections.length));if(isClothingMode){// ✅ CRITICAL: Filter to ONLY ColorFlex collections (must have colorFlex: true)
// Exclude non-ColorFlex collections like Abundance, Ancient Tiles, Pages, etc.
beforeColorFlexFilter=appState.collections.length;appState.collections=appState.collections.filter(function(c){var _c$patterns;// Must have at least one pattern with colorFlex: true
var hasColorFlexPatterns=(_c$patterns=c.patterns)===null||_c$patterns===void 0?void 0:_c$patterns.some(function(p){return p.colorFlex===true;});if(!hasColorFlexPatterns){console.log("\uD83D\uDEAB CLOTHING FILTER: Excluding ".concat(c.name," (not a ColorFlex collection)"));}return hasColorFlexPatterns;});colorFlexFilteredCount=beforeColorFlexFilter-appState.collections.length;console.log("\uD83D\uDC55 CLOTHING MODE: ".concat(appState.collections.length," ColorFlex collections (filtered out ").concat(colorFlexFilteredCount," non-ColorFlex collections)"));console.log("\uD83D\uDC55 CLOTHING MODE: Using base collections, will lookup clothing mockupLayers when needed");}// ✅ CRITICAL: Always filter non-ColorFlex collections in furniture mode (even if condition above didn't match)
if(!(isFurnitureMode||window.COLORFLEX_MODE==='FURNITURE'||window.location.pathname.includes('furniture'))){_context27.n=17;break;}// ✅ CRITICAL: Filter to ONLY ColorFlex collections
// For furniture mode, check for:
// 1. colorFlex: true on patterns (standard ColorFlex indicator)
// 2. mockupLayers on patterns (furniture-specific indicator - coverlets.fur, folksie.fur use this)
// 3. layers array on patterns (fallback for patterns that can be used)
console.log("\uD83E\uDE91\uD83E\uDE91\uD83E\uDE91 FURNITURE MODE FILTER BLOCK ENTERED \uD83E\uDE91\uD83E\uDE91\uD83E\uDE91");console.log("\uD83E\uDE91 FURNITURE MODE: Starting ColorFlex filter on ".concat(appState.collections.length," collections"));_beforeColorFlexFilter=appState.collections.length;excludedCollections=[];appState.collections=appState.collections.filter(function(c){var _c$patterns2,_c$patterns3,_c$patterns4;// ✅ FURNITURE MODE: Check multiple indicators for valid furniture collections
// 1. colorFlex: true (standard indicator)
// 2. mockupLayers (furniture-specific - coverlets.fur, folksie.fur have this)
// 3. layers array (fallback - patterns that can be used)
var hasColorFlexPatterns=(_c$patterns2=c.patterns)===null||_c$patterns2===void 0?void 0:_c$patterns2.some(function(p){return p.colorFlex===true;});var hasMockupLayers=(_c$patterns3=c.patterns)===null||_c$patterns3===void 0?void 0:_c$patterns3.some(function(p){return p.mockupLayers&&(Array.isArray(p.mockupLayers)||_typeof(p.mockupLayers)==='object'&&Object.keys(p.mockupLayers).length>0);});var hasLayers=(_c$patterns4=c.patterns)===null||_c$patterns4===void 0?void 0:_c$patterns4.some(function(p){return p.layers&&Array.isArray(p.layers)&&p.layers.length>0;});var isValidFurnitureCollection=hasColorFlexPatterns||hasMockupLayers||hasLayers;if(!isValidFurnitureCollection){excludedCollections.push(c.name);console.log("\uD83D\uDEAB FURNITURE FILTER: Excluding ".concat(c.name," (no colorFlex, mockupLayers, or layers)"));}else{console.log("\u2705 FURNITURE FILTER: Including ".concat(c.name," (colorFlex: ").concat(hasColorFlexPatterns,", mockupLayers: ").concat(hasMockupLayers,", layers: ").concat(hasLayers,")"));}return isValidFurnitureCollection;});_colorFlexFilteredCount=_beforeColorFlexFilter-appState.collections.length;console.log("\uD83E\uDE91 FURNITURE MODE: ".concat(appState.collections.length," ColorFlex collections (filtered out ").concat(_colorFlexFilteredCount," non-ColorFlex collections)"));if(excludedCollections.length>0){console.log("\uD83E\uDE91 FURNITURE MODE: Excluded collections: ".concat(excludedCollections.join(', ')));}// Enable furniture mode flag
appState.isInFurnitureMode=true;appState.selectedFurnitureType=window.FURNITURE_DEFAULT_TYPE||'Sofa-Capitol';console.log("\uD83E\uDE91 FURNITURE MODE: Using base collections, will lookup furniture mockupLayers when needed");console.log("\uD83E\uDE91 FURNITURE MODE: Enabled (isInFurnitureMode = true, selectedFurnitureType = '".concat(appState.selectedFurnitureType,"')"));// Load furniture config
_context27.n=16;return loadFurnitureConfig();case 16:_context27.n=18;break;case 17:// WALLPAPER MODE (default): Filter out clothing/furniture collections
// ✅ CRITICAL: Must exclude ALL furniture/clothing variants to protect CORE wallpaper site
if(!isDirectCollectionAccess){beforeFilterCount=appState.collections.length;appState.collections=appState.collections.filter(function(c){var name=c.name||'';// Exclude all furniture/clothing variants (both old and new formats)
var isFurniture=name.includes('-fur')||name.includes('.fur')||name.endsWith('.fur');var isClothing=name.includes('-clo')||name.includes('.clo')||name.endsWith('.clo');if(isFurniture||isClothing){console.log("\uD83D\uDEAB WALLPAPER FILTER: Excluding ".concat(name," (furniture: ").concat(isFurniture,", clothing: ").concat(isClothing,")"));return false;}return true;});filteredCount=beforeFilterCount-appState.collections.length;console.log("\u2705 WALLPAPER MODE: ".concat(appState.collections.length," collections (filtered out ").concat(filteredCount," furniture/clothing collections)"));if(filteredCount>0){console.log("\uD83D\uDD12 Filtered out ".concat(filteredCount," clothing/furniture collections (accessible via product pages only)"));}}else{console.log("\u2705 Collections loaded: ".concat(appState.collections.length," collections (including special collections via direct URL access)"));console.log("\uD83C\uDFAF Direct collection access: ".concat(urlCollectionName));}case 18:console.log("🔍 First collection structure:",appState.collections[0]);// ✅ FINAL SAFETY CHECK: Filter non-ColorFlex collections in furniture/clothing mode
// Also ensure no furniture/clothing collections in wallpaper mode
isActuallyFurnitureMode=isFurnitureMode||window.location.pathname.includes('furniture');isActuallyClothingMode=isClothingMode||window.location.pathname.includes('clothing');if(isActuallyFurnitureMode||isActuallyClothingMode){// ✅ CRITICAL: Final filter for non-ColorFlex collections in furniture/clothing mode
// This is the PRIMARY filter - runs regardless of earlier conditions
console.log("\uD83D\uDD0D FINAL CHECK: Running for ".concat(isActuallyFurnitureMode?'FURNITURE':'CLOTHING'," mode"));console.log("\uD83D\uDD0D FINAL CHECK: Before filtering: ".concat(appState.collections.length," collections"));beforeFinalCheck=appState.collections.length;excludedInFinalCheck=[];appState.collections=appState.collections.filter(function(c){if(isActuallyFurnitureMode){var _c$patterns5,_c$patterns6,_c$patterns7;// ✅ FURNITURE MODE: Check multiple indicators (same as main filter)
var hasColorFlexPatterns=(_c$patterns5=c.patterns)===null||_c$patterns5===void 0?void 0:_c$patterns5.some(function(p){return p.colorFlex===true;});var hasMockupLayers=(_c$patterns6=c.patterns)===null||_c$patterns6===void 0?void 0:_c$patterns6.some(function(p){return p.mockupLayers&&(Array.isArray(p.mockupLayers)||_typeof(p.mockupLayers)==='object'&&Object.keys(p.mockupLayers).length>0);});var hasLayers=(_c$patterns7=c.patterns)===null||_c$patterns7===void 0?void 0:_c$patterns7.some(function(p){return p.layers&&Array.isArray(p.layers)&&p.layers.length>0;});var isValid=hasColorFlexPatterns||hasMockupLayers||hasLayers;if(!isValid){excludedInFinalCheck.push(c.name);console.error("\u274C FINAL CHECK: Excluding ".concat(c.name," from furniture mode (no colorFlex, mockupLayers, or layers)"));}return isValid;}else{var _c$patterns8;// CLOTHING MODE: Only check colorFlex
var _hasColorFlexPatterns=(_c$patterns8=c.patterns)===null||_c$patterns8===void 0?void 0:_c$patterns8.some(function(p){return p.colorFlex===true;});if(!_hasColorFlexPatterns){excludedInFinalCheck.push(c.name);console.error("\u274C FINAL CHECK: Excluding ".concat(c.name," from clothing mode (not a ColorFlex collection)"));return false;}return true;}});finalFiltered=beforeFinalCheck-appState.collections.length;if(finalFiltered>0){console.error("\u274C FINAL CHECK: Removed ".concat(finalFiltered," non-ColorFlex collections from ").concat(isActuallyFurnitureMode?'furniture':'clothing'," mode!"));console.error("\u274C FINAL CHECK: Excluded: ".concat(excludedInFinalCheck.join(', ')));}else{console.log("\u2705 FINAL CHECK: All ".concat(appState.collections.length," collections are ColorFlex for ").concat(isActuallyFurnitureMode?'furniture':'clothing'," mode"));}console.log("\uD83D\uDD0D FINAL CHECK: After filtering: ".concat(appState.collections.length," collections"));// ✅ Also set furniture mode flags here (in case earlier block didn't run)
if(isActuallyFurnitureMode){appState.isInFurnitureMode=true;appState.selectedFurnitureType=appState.selectedFurnitureType||window.FURNITURE_DEFAULT_TYPE||'Sofa-Capitol';}}else{// Wallpaper mode: Filter out furniture/clothing variant collections
_beforeFinalCheck=appState.collections.length;appState.collections=appState.collections.filter(function(c){var name=c.name||'';var hasFurniture=name.includes('-fur')||name.includes('.fur')||name.endsWith('.fur');var hasClothing=name.includes('-clo')||name.includes('.clo')||name.endsWith('.clo');if(hasFurniture||hasClothing){console.error("\u274C FINAL CHECK FAILED: Found ".concat(name," in wallpaper mode! (furniture: ").concat(hasFurniture,", clothing: ").concat(hasClothing,")"));return false;}return true;});_finalFiltered=_beforeFinalCheck-appState.collections.length;if(_finalFiltered>0){console.error("\u274C FINAL CHECK: Removed ".concat(_finalFiltered," furniture/clothing collections that slipped through!"));}else{console.log("\u2705 FINAL CHECK: All ".concat(appState.collections.length," collections are safe for wallpaper mode"));}}// Expose collections data to window for collections modal
window.collectionsData=appState.collections;console.log("\uD83D\uDCE4 Exposed ".concat(appState.collections.length," collections to window.collectionsData"));// ✅ DEBUG: Log first few collection names to verify filtering
if(appState.collections.length>0){sampleNames=appState.collections.slice(0,5).map(function(c){return c.name;}).join(', ');console.log("\uD83D\uDCCB Sample collections exposed: ".concat(sampleNames).concat(appState.collections.length>5?'...':''));}case 19:// ✅ CRITICAL: FINAL SAFETY CHECK - Always runs AFTER collections are loaded
// Filter non-ColorFlex collections in furniture/clothing mode (runs even if earlier block didn't)
isActuallyFurnitureModeFinal=window.COLORFLEX_MODE==='FURNITURE'||window.location.pathname.includes('furniture')||appState.isInFurnitureMode;isActuallyClothingModeFinal=window.COLORFLEX_MODE==='CLOTHING'||window.location.pathname.includes('clothing');if((isActuallyFurnitureModeFinal||isActuallyClothingModeFinal)&&appState.collections&&appState.collections.length>0){console.log("\uD83D\uDD0D FINAL SAFETY CHECK: Running for ".concat(isActuallyFurnitureModeFinal?'FURNITURE':'CLOTHING'," mode"));_beforeFinalCheck2=appState.collections.length;_excludedInFinalCheck=[];appState.collections=appState.collections.filter(function(c){if(isActuallyFurnitureModeFinal){var _c$patterns9,_c$patterns0,_c$patterns1;// ✅ FURNITURE MODE: Check multiple indicators (same as main filter)
var hasColorFlexPatterns=(_c$patterns9=c.patterns)===null||_c$patterns9===void 0?void 0:_c$patterns9.some(function(p){return p.colorFlex===true;});var hasMockupLayers=(_c$patterns0=c.patterns)===null||_c$patterns0===void 0?void 0:_c$patterns0.some(function(p){return p.mockupLayers&&(Array.isArray(p.mockupLayers)||_typeof(p.mockupLayers)==='object'&&Object.keys(p.mockupLayers).length>0);});var hasLayers=(_c$patterns1=c.patterns)===null||_c$patterns1===void 0?void 0:_c$patterns1.some(function(p){return p.layers&&Array.isArray(p.layers)&&p.layers.length>0;});var isValid=hasColorFlexPatterns||hasMockupLayers||hasLayers;if(!isValid){_excludedInFinalCheck.push(c.name);console.error("\u274C FINAL SAFETY CHECK: Excluding ".concat(c.name," from furniture mode (no colorFlex, mockupLayers, or layers)"));}return isValid;}else{var _c$patterns10;// CLOTHING MODE: Only check colorFlex
var _hasColorFlexPatterns2=(_c$patterns10=c.patterns)===null||_c$patterns10===void 0?void 0:_c$patterns10.some(function(p){return p.colorFlex===true;});if(!_hasColorFlexPatterns2){_excludedInFinalCheck.push(c.name);console.error("\u274C FINAL SAFETY CHECK: Excluding ".concat(c.name," from clothing mode (not a ColorFlex collection)"));return false;}return true;}});_finalFiltered2=_beforeFinalCheck2-appState.collections.length;if(_finalFiltered2>0){console.error("\u274C FINAL SAFETY CHECK: Removed ".concat(_finalFiltered2," non-ColorFlex collections!"));console.error("\u274C FINAL SAFETY CHECK: Excluded: ".concat(_excludedInFinalCheck.join(', ')));// Update window.collectionsData with filtered collections
window.collectionsData=appState.collections;console.log("\uD83D\uDCE4 Updated window.collectionsData: ".concat(appState.collections.length," ColorFlex collections"));}else{console.log("\u2705 FINAL SAFETY CHECK: All ".concat(appState.collections.length," collections are ColorFlex"));}}// ✅ Step 4: Select collection via Shopify integration, URL param, sessionStorage, or fallback
// Note: urlCollectionName is already declared above for clothing filter logic
// Check for auto-load pattern data using localStorage (more reliable than sessionStorage)
autoLoadCollectionName=null;autoLoadPatternData=null;// Always check for auto-load pattern data in localStorage (more reliable)
autoLoadJson=localStorage.getItem('colorflexAutoLoad');console.log("🔍 DEBUG: Checking localStorage for colorflexAutoLoad");console.log("  Raw localStorage data:",autoLoadJson?"EXISTS":"NULL");console.log("  All localStorage keys:",Object.keys(localStorage));console.log("  Looking for any colorflex keys...");for(i=0;i<localStorage.length;i++){key=localStorage.key(i);if(key&&key.toLowerCase().includes('colorflex')){console.log("    Found: ".concat(key," = ").concat((_localStorage$getItem=localStorage.getItem(key))===null||_localStorage$getItem===void 0?void 0:_localStorage$getItem.substring(0,100),"..."));}}if(autoLoadJson){console.log("🎯 Auto-load pattern data found in localStorage");try{_data2=JSON.parse(autoLoadJson);pattern=_data2.pattern;timestamp=_data2.timestamp;// Check if data is recent (within 5 minutes)
age=Date.now()-timestamp;if(age<5*60*1000){autoLoadCollectionName=pattern.collectionName;autoLoadPatternData=_data2;console.log("🎯 Found valid auto-load pattern from localStorage:",pattern.patternName);console.log("  Collection:",autoLoadCollectionName);console.log("  Data age:",Math.round(age/1000),"seconds");}else{console.log("⏰ Auto-load data too old, ignoring");localStorage.removeItem('colorflexAutoLoad');}}catch(error){console.error("❌ Error parsing localStorage auto-load data:",error);localStorage.removeItem('colorflexAutoLoad');}}else{console.log("🔍 No auto-load pattern data found in localStorage");}// 🛒 Check for pending purchase pattern (from "Buy It" on non-ColorFlex pages)
pendingPurchaseJson=localStorage.getItem('pendingPurchasePattern');if(pendingPurchaseJson){console.log("🛒 Pending purchase pattern found");try{purchaseData=JSON.parse(pendingPurchaseJson);_timestamp=purchaseData.timestamp;_age=Date.now()-_timestamp;// Check if data is recent (within 2 minutes)
if(_age<2*60*1000){console.log("🛒 Processing pending purchase for:",purchaseData.patternName);autoLoadCollectionName=purchaseData.collectionName;autoLoadPatternData={pattern:purchaseData,timestamp:_timestamp};// Clear the pending purchase flag
localStorage.removeItem('pendingPurchasePattern');}else{console.log("⏰ Pending purchase data too old, ignoring");localStorage.removeItem('pendingPurchasePattern');}}catch(error){console.error("❌ Error parsing pending purchase data:",error);localStorage.removeItem('pendingPurchasePattern');}}console.log("🔍 COLLECTION SELECTION DEBUG:");console.log("  URL collection param:",urlCollectionName);console.log("  Auto-load collection:",autoLoadCollectionName);console.log("  Shopify target collection:",(_window$appState6=window.appState)===null||_window$appState6===void 0?void 0:_window$appState6.selectedCollection);console.log("  Shopify target pattern:",(_window$appState7=window.appState)===null||_window$appState7===void 0||(_window$appState7=_window$appState7.targetPattern)===null||_window$appState7===void 0?void 0:_window$appState7.name);console.log("  Available collections:",appState.collections.map(function(c){return c.name;}));console.log("  Total collections loaded:",appState.collections.length);// Priority 1: Use Shopify-detected collection (from product page integration)
// Priority 2: Use URL collection parameter
// Priority 3: Use auto-load collection (for saved pattern loading)
// Priority 4: Use mode-specific default (clothing or furniture page)
modeDefaultCollection=null;if(window.COLORFLEX_MODE==='CLOTHING'){modeDefaultCollection=window.CLOTHING_DEFAULT_COLLECTION||'bombay-clo';}else if(window.COLORFLEX_MODE==='FURNITURE'){modeDefaultCollection=window.FURNITURE_DEFAULT_COLLECTION||'botanicals-fur';}collectionName=((_window$appState8=window.appState)===null||_window$appState8===void 0||(_window$appState8=_window$appState8.selectedCollection)===null||_window$appState8===void 0?void 0:_window$appState8.name)||urlCollectionName||autoLoadCollectionName||modeDefaultCollection;console.log("🔍 COLLECTION MATCHING DEBUG:");console.log("  Requested collection name:",collectionName);console.log("  Available collection names:",appState.collections.map(function(c){return c.name;}));selectedCollection=appState.collections.find(function(c){return c&&typeof c.name==='string'&&collectionName&&typeof collectionName==='string'&&c.name.trim().toLowerCase()===collectionName.toLowerCase();});// ✅ If not found and collectionName has furniture/clothing variant suffix, try matching base name
if(!selectedCollection&&collectionName){// Extract base collection name by removing variant suffixes (.fur, .fur-1, -fur, .clo, -clo, etc.)
baseName=collectionName.replace(/\.fur(-\d+)?$/i,'')// Remove .fur or .fur-1
.replace(/\.clo(-\d+)?$/i,'')// Remove .clo or .clo-1
.replace(/-fur.*$/i,'')// Remove -fur and anything after
.replace(/-clo.*$/i,'');// Remove -clo and anything after
if(baseName!==collectionName){console.log("  \uD83D\uDD0D Trying base collection name: \"".concat(baseName,"\" (from \"").concat(collectionName,"\")"));selectedCollection=appState.collections.find(function(c){return c&&typeof c.name==='string'&&c.name.trim().toLowerCase()===baseName.toLowerCase();});if(selectedCollection){console.log("  \u2705 Found base collection: \"".concat(selectedCollection.name,"\""));}}}if(!selectedCollection&&collectionName){console.error("❌ COLLECTION LOOKUP FAILED!");console.error("  Requested:",collectionName);console.error("  Available:",appState.collections.map(function(c){return c.name;}));console.error("  First collection fallback:",(_appState$collections8=appState.collections[0])===null||_appState$collections8===void 0?void 0:_appState$collections8.name);// 🚨 CRITICAL FIX: Don't default to first collection if URL specified a collection
// Only use fallback if no collection was requested
// ✅ Also ensure fallback is a ColorFlex collection (for furniture/clothing modes)
if(!urlCollectionName){// ✅ Find first ColorFlex collection (if in furniture/clothing mode)
_isFurnitureMode3=window.COLORFLEX_MODE==='FURNITURE'||window.location.pathname.includes('furniture');_isClothingMode2=window.COLORFLEX_MODE==='CLOTHING'||window.location.pathname.includes('clothing');if(_isFurnitureMode3||_isClothingMode2){// Find first ColorFlex collection
firstColorFlexCollection=appState.collections.find(function(c){var _c$patterns11;return(_c$patterns11=c.patterns)===null||_c$patterns11===void 0?void 0:_c$patterns11.some(function(p){return p.colorFlex===true;});});if(firstColorFlexCollection){selectedCollection=firstColorFlexCollection;console.log("  Using first ColorFlex collection as fallback: ".concat(firstColorFlexCollection.name));}else{console.error("  \u274C No ColorFlex collections found! Using first collection: ".concat((_appState$collections9=appState.collections[0])===null||_appState$collections9===void 0?void 0:_appState$collections9.name));selectedCollection=appState.collections[0];}}else{selectedCollection=appState.collections[0];console.log("  Using first collection as fallback (no collection specified)");}}else{console.error("  REFUSING to use fallback - user specified:",urlCollectionName);// Try a more flexible match
selectedCollection=appState.collections.find(function(c){return c&&c.name&&c.name.toLowerCase().includes(collectionName.toLowerCase());});if(selectedCollection){console.log("  Found partial match:",selectedCollection.name);}else{console.error("  No matches found - using first ColorFlex collection as last resort");// ✅ Find first ColorFlex collection instead of just first collection
_isFurnitureMode4=window.COLORFLEX_MODE==='FURNITURE'||window.location.pathname.includes('furniture');_isClothingMode3=window.COLORFLEX_MODE==='CLOTHING'||window.location.pathname.includes('clothing');if(_isFurnitureMode4||_isClothingMode3){_firstColorFlexCollection=appState.collections.find(function(c){var _c$patterns12;return(_c$patterns12=c.patterns)===null||_c$patterns12===void 0?void 0:_c$patterns12.some(function(p){return p.colorFlex===true;});});selectedCollection=_firstColorFlexCollection||appState.collections[0];console.log("  Last resort: Using ".concat((_selectedCollection=selectedCollection)===null||_selectedCollection===void 0?void 0:_selectedCollection.name," (ColorFlex: ").concat(!!_firstColorFlexCollection,")"));}else{selectedCollection=appState.collections[0];}}}}console.log("  Selected collection source:",(_window$appState9=window.appState)!==null&&_window$appState9!==void 0&&_window$appState9.selectedCollection?"Shopify":"URL");console.log("  Final collection:",(_selectedCollection2=selectedCollection)===null||_selectedCollection2===void 0?void 0:_selectedCollection2.name);console.log("  Is fallback collection:",selectedCollection===appState.collections[0]?"YES":"NO");if(selectedCollection){_context27.n=20;break;}console.error("X No valid collection found.");return _context27.a(2);case 20:// ✅ Step 5: Set collection in appState
// ✅ NEW ARCHITECTURE: Always use base collections, branch by page mode
// If a variant collection was selected, find the base collection
finalCollection=selectedCollection;selectedCollectionName=selectedCollection.name;// Check if this is a variant (furniture/clothing) by checking if it's NOT in base collections
isVariantCollection=!appState.collections.some(function(c){return c.name===selectedCollectionName;});if(!(isVariantCollection&&appState.allCollections)){_context27.n=25;break;}// Try to find base collection using flexible matching
// Strategy: Remove common variant suffixes and try to match
// ✅ Standard format: .fur (not .fur-1) - all furniture pieces go under .fur collection
baseNameCandidates=[selectedCollectionName.replace(/\.(fur|clo)$/i,''),// Remove .fur, .clo (standard format)
selectedCollectionName.replace(/\.(fur|clo)-\d+$/i,''),// Remove .fur-1, .clo-1 (backwards compat)
selectedCollectionName.replace(/[-_](fur|clo).*$/i,''),// Remove -fur, -clo and anything after
selectedCollectionName.replace(/\.(fur|clo).*$/i,'')// Remove .fur, .clo and anything after (fallback)
];// Also try removing just the suffix part
nameParts=selectedCollectionName.split(/[-_.]/);if(nameParts.length>1){// Try all combinations up to the variant suffix
for(_i13=nameParts.length-1;_i13>0;_i13--){candidate=nameParts.slice(0,_i13).join('-');baseNameCandidates.push(candidate);}}// Find base collection using candidates
baseCollection=null;_loop1=/*#__PURE__*/_regenerator().m(function _loop1(){var candidate;return _regenerator().w(function(_context25){while(1)switch(_context25.n){case 0:candidate=_baseNameCandidates[_i14];baseCollection=appState.collections.find(function(c){return c.name===candidate||c.name.toLowerCase()===candidate.toLowerCase();});if(!baseCollection){_context25.n=1;break;}console.log("\uD83D\uDD04 Found base collection \"".concat(baseCollection.name,"\" from variant \"").concat(selectedCollectionName,"\" (matched: \"").concat(candidate,"\")"));return _context25.a(2,1);case 1:return _context25.a(2);}},_loop1);});_i14=0,_baseNameCandidates=baseNameCandidates;case 21:if(!(_i14<_baseNameCandidates.length)){_context27.n=24;break;}return _context27.d(_regeneratorValues(_loop1()),22);case 22:if(!_context27.v){_context27.n=23;break;}return _context27.a(3,24);case 23:_i14++;_context27.n=21;break;case 24:if(baseCollection){finalCollection=baseCollection;// Store variant collection reference for mockupLayers lookup
finalCollection._variantCollection=selectedCollection;// Determine variant type from current page mode (not filename)
_isFurnitureMode5=window.COLORFLEX_MODE==='FURNITURE'||appState.isInFurnitureMode;finalCollection._variantType=_isFurnitureMode5?'furniture':'clothing';console.log("  Variant type determined from page mode: ".concat(finalCollection._variantType," (not from filename)"));}else{console.warn("\u26A0\uFE0F Could not find base collection for variant \"".concat(selectedCollectionName,"\""));console.warn("  Tried candidates: ".concat(baseNameCandidates.join(', ')));console.warn("  Using variant as-is");}case 25:// ✅ FIX: In furniture simple mode, ensure furnitureConfig is available from variant
isFurnitureSimpleMode=window.COLORFLEX_SIMPLE_MODE===true&&window.COLORFLEX_MODE==='FURNITURE';if(isFurnitureSimpleMode&&appState.allCollections&&!finalCollection.furnitureConfig){_baseName=finalCollection.name;variantNames=["".concat(_baseName,".fur-1"),"".concat(_baseName,".fur"),"".concat(_baseName,"-fur-1"),"".concat(_baseName,"-fur")];variantCollection=appState.allCollections.find(function(c){return c&&c.name&&variantNames.includes(c.name);});if(variantCollection&&variantCollection.furnitureConfig){console.log("\u2705 Found furniture variant \"".concat(variantCollection.name,"\" with furnitureConfig for initial load"));finalCollection.furnitureConfig=variantCollection.furnitureConfig;console.log("  \u2705 Merged furnitureConfig from variant into base collection");}}appState.selectedCollection=finalCollection;appState.lockedCollection=true;// ✅ Skip curated colors entirely in simple mode
isSimpleMode=window.COLORFLEX_SIMPLE_MODE===true;if(!isSimpleMode){appState.curatedColors=selectedCollection.curatedColors||[];console.log("@ Selected Collection:",selectedCollection.name);console.log("@ Curated colors:",appState.curatedColors.length);}else{appState.curatedColors=[];console.log("@ Selected Collection:",selectedCollection.name);console.log("@ Simple mode - skipping curated colors");}// ✅ Step 6: Update UI header
if(dom.collectionHeader){// Check if this is a clothing collection (has -clo or .clo- suffix)
if(selectedCollection.name.includes('-clo')||selectedCollection.name.includes('.clo-')){// Extract collection name before suffix (e.g., "botanicals" from "botanicals.clo-1" or "botanicals-clo1")
collectionBaseName=selectedCollection.name.split(/[-.]clo/)[0];// Just show collection name without "CLOTHING" label
dom.collectionHeader.textContent=toInitialCaps(collectionBaseName);}else if(selectedCollection.name.includes('.fur')||selectedCollection.name.endsWith('.fur')){// Furniture collection: strip .fur suffix (e.g., "botanicals.fur" → "botanicals")
// ✅ Standard format: .fur (not .fur-1) - all furniture pieces go under .fur collection
_collectionBaseName3=selectedCollection.name.replace(/\.fur$/i,'');// Remove .fur (standard)
if(_collectionBaseName3===selectedCollection.name){_collectionBaseName3=selectedCollection.name.replace(/\.fur-\d+$/i,'');// Fallback: .fur-1 (backwards compat)
}dom.collectionHeader.textContent=toInitialCaps(_collectionBaseName3);}else{dom.collectionHeader.textContent=toInitialCaps(selectedCollection.name);}}// ✅ Step 7: Show curated color circles + ticket button (skip in simple mode)
if(!isSimpleMode){populateCuratedColors(appState.curatedColors);}// ✅ Step 8: Load target pattern or first pattern
// Priority 1: Check URL pattern parameter
// Priority 2: Check sessionStorage pattern (for saved pattern loading)
initialPattern=null;urlPatternName=(_urlParams$get2=urlParams.get("pattern"))===null||_urlParams$get2===void 0?void 0:_urlParams$get2.trim();// Check for auto-load pattern (reuse the same data we parsed earlier)  
autoLoadPatternName=null;if(autoLoadPatternData){autoLoadPatternName=autoLoadPatternData.pattern.patternName;console.log("🎯 Found pattern from auto-load data:",autoLoadPatternName);}// Use URL pattern name or auto-load pattern name
targetPatternName=urlPatternName||autoLoadPatternName;if(!targetPatternName){_context27.n=35;break;}console.log("🎯 Looking for target pattern:",targetPatternName,urlPatternName?"(from URL)":"(from auto-load)");// First try to find pattern in selected collection (with normalization)
normalizedTargetPattern=targetPatternName.toLowerCase().replace(/[\s-]+/g,'-');initialPattern=selectedCollection.patterns.find(function(p){return p&&_typeof(p)==='object'&&typeof p.name==='string'&&(p.name.toLowerCase().replace(/[\s-]+/g,'-')===normalizedTargetPattern||p.id===targetPatternName||p.name.toLowerCase()===targetPatternName.toLowerCase());})||selectedCollection.patterns.find(function(p){return p&&_typeof(p)==='object'&&typeof p.name==='string'&&(p.name.toLowerCase().includes(targetPatternName.toLowerCase())||targetPatternName.toLowerCase().includes(p.name.toLowerCase()));});// If pattern not found in selected collection, search all collections (DYNAMIC)
if(initialPattern){_context27.n=34;break;}console.log("🔍 Pattern not found in selected collection, searching all collections dynamically...");console.log("\uD83D\uDD0D Searching for pattern: \"".concat(targetPatternName,"\" across ").concat(appState.collections.length," collections"));_iterator3=_createForOfIteratorHelper(appState.collections);_context27.p=26;_loop10=/*#__PURE__*/_regenerator().m(function _loop10(){var _collection$patterns,_collection$patterns2;var collection,foundPattern,_collectionBaseName4;return _regenerator().w(function(_context26){while(1)switch(_context26.n){case 0:collection=_step3.value;console.log("  \uD83D\uDD0D Checking collection: \"".concat(collection.name,"\" (").concat(((_collection$patterns=collection.patterns)===null||_collection$patterns===void 0?void 0:_collection$patterns.length)||0," patterns)"));foundPattern=(_collection$patterns2=collection.patterns)===null||_collection$patterns2===void 0?void 0:_collection$patterns2.find(function(p){if(!p||_typeof(p)!=='object')return false;var patternName=(typeof p.name==='string'?p.name.toLowerCase().replace(/[\s-]+/g,'-'):'')||'';var patternId=(typeof p.id==='string'?p.id.toLowerCase().replace(/[\s-]+/g,'-'):'')||'';var searchName=targetPatternName.toLowerCase().replace(/[\s-]+/g,'-');console.log("    \uD83D\uDD0D Checking pattern: \"".concat(p.name,"\" -> normalized: \"").concat(patternName,"\" vs search: \"").concat(searchName,"\""));// Exact matches first (normalized)
if(patternName===searchName||patternId===searchName){console.log("    \u2705 EXACT MATCH FOUND: \"".concat(p.name,"\" in collection \"").concat(collection.name,"\""));return true;}// Partial matches
if(patternName.includes(searchName)||searchName.includes(patternName))return true;// Handle special cases for known patterns
if(searchName==='constantinople'&&patternName.includes('constantinople'))return true;if(searchName==='istanbul'&&patternName.includes('istanbul'))return true;return false;});if(!foundPattern){_context26.n=1;break;}console.log("\uD83C\uDFAF FOUND: Pattern \"".concat(targetPatternName,"\" \u2192 \"").concat(foundPattern.name,"\" in collection \"").concat(collection.name,"\""));console.log("\uD83D\uDD04 Switching from collection \"".concat(selectedCollection.name,"\" to \"").concat(collection.name,"\""));selectedCollection=collection;appState.selectedCollection=selectedCollection;appState.curatedColors=selectedCollection.curatedColors||[];initialPattern=foundPattern;// Update UI to reflect correct collection
if(dom.collectionHeader){// Check if this is a clothing collection
if(selectedCollection.name.includes('-clo')){_collectionBaseName4=selectedCollection.name.split('.')[0];dom.collectionHeader.innerHTML="".concat(_collectionBaseName4.toUpperCase(),"<br>CLOTHING");}else{dom.collectionHeader.textContent=toInitialCaps(selectedCollection.name);}}populateCuratedColors(appState.curatedColors);return _context26.a(2,1);case 1:return _context26.a(2);}},_loop10);});_iterator3.s();case 27:if((_step3=_iterator3.n()).done){_context27.n=30;break;}return _context27.d(_regeneratorValues(_loop10()),28);case 28:if(!_context27.v){_context27.n=29;break;}return _context27.a(3,30);case 29:_context27.n=27;break;case 30:_context27.n=32;break;case 31:_context27.p=31;_t24=_context27.v;_iterator3.e(_t24);case 32:_context27.p=32;_iterator3.f();return _context27.f(32);case 33:if(!initialPattern){console.warn("\u274C Pattern \"".concat(urlPatternName,"\" not found in any collection"));}case 34:console.log("🎯 Using URL pattern parameter:",urlPatternName,"→",(_initialPattern=initialPattern)===null||_initialPattern===void 0?void 0:_initialPattern.name,"in collection:",(_selectedCollection3=selectedCollection)===null||_selectedCollection3===void 0?void 0:_selectedCollection3.name);case 35:// Priority 2: Use Shopify-detected target pattern
if(!initialPattern&&(_window$appState0=window.appState)!==null&&_window$appState0!==void 0&&_window$appState0.targetPattern){initialPattern=selectedCollection.patterns.find(function(p){return p&&_typeof(p)==='object'&&(p.slug===window.appState.targetPattern.slug||p.id===window.appState.targetPattern.id||p.name===window.appState.targetPattern.name);});console.log("🎯 Using Shopify target pattern:",(_initialPattern2=initialPattern)===null||_initialPattern2===void 0?void 0:_initialPattern2.name);}// Priority 3: Use first pattern as fallback
if(!initialPattern){initialPattern=selectedCollection.patterns[0];console.log("📍 Using first pattern as fallback:",(_initialPattern3=initialPattern)===null||_initialPattern3===void 0?void 0:_initialPattern3.name);}// Use slug for clothing patterns, id for regular patterns
initialPatternId=((_initialPattern4=initialPattern)===null||_initialPattern4===void 0?void 0:_initialPattern4.slug)||((_initialPattern5=initialPattern)===null||_initialPattern5===void 0?void 0:_initialPattern5.id);if(initialPatternId){// Check if auto-load has already completed to prevent override
if(window.autoLoadPatternCompleted){console.log('🔒 Skipping initial pattern load - auto-load already completed for:',window.autoLoadedPatternName);}else{loadPatternData(selectedCollection,initialPatternId);// ✅ Fixed: pass collection
// Apply URL parameters for colors and scale after pattern loading
setTimeout(function(){applyURLParameters(urlParams);},500);// Don't clear localStorage here - let auto-load handle it
// The auto-load logic will clear localStorage after successful loading
if(autoLoadPatternName){console.log('🔄 Initial pattern loaded from auto-load data, auto-load will complete the process');}}}else{console.warn("âš ï¸ No patterns found for",selectedCollection.name);}// ✅ Step 9: Load thumbnails + setup print
populatePatternThumbnails(selectedCollection.patterns);setupPrintListener();isAppReady=true;console.log("✅ App is now fully ready.");// Check for auto-load pattern from saved patterns modal
if(autoLoadPatternData){console.log('🔍 Found pattern for auto-loading from saved patterns modal');try{// Wait for app to be fully ready before auto-loading
_waitForAppAndAutoLoad=function waitForAppAndAutoLoad(){var _appState$layerInputs5,_appState$currentLaye17;console.log('⏳ Checking if app is ready for auto-loading...');console.log('  layerInputs length:',(_appState$layerInputs5=appState.layerInputs)===null||_appState$layerInputs5===void 0?void 0:_appState$layerInputs5.length);console.log('  currentLayers length:',(_appState$currentLaye17=appState.currentLayers)===null||_appState$currentLaye17===void 0?void 0:_appState$currentLaye17.length);console.log('  currentPattern loaded:',!!appState.currentPattern);console.log('  loadSavedPatternToUI available:',!!window.loadSavedPatternToUI);// More robust readiness check - ensure we have UI and the function available
if(appState.layerInputs&&appState.layerInputs.length>0&&appState.currentLayers&&appState.currentLayers.length>0&&appState.currentPattern&&window.loadSavedPatternToUI){console.log('✅ App fully ready - auto-loading saved pattern');// Use the same method that works perfectly in ColorFlex page
loadSavedPatternToUI(_pattern);// Set flag to prevent other initialization from overriding this pattern
window.autoLoadPatternCompleted=true;window.autoLoadedPatternName=_pattern.patternName;// 🛒 If this pattern came from "Buy It" button, auto-trigger material modal
if(_pattern.triggerPurchase){console.log('🛒 Auto-triggering material selection modal for purchase');setTimeout(function(){if(window.showMaterialSelectionModal){showMaterialSelectionModal(_pattern);}else{console.error('❌ Material selection modal not available');}},500);// Small delay to ensure pattern is fully loaded
}// Clean up after successful loading
localStorage.removeItem('colorflexAutoLoad');console.log('🧹 Cleaned up auto-load data from localStorage');console.log('🔒 Set protection flag to prevent pattern override');}else{console.log('⏳ App not ready yet, waiting...');setTimeout(_waitForAppAndAutoLoad,300);}};// Start checking after app initialization is complete
// Use longer delay to ensure all other initialization completes first
_pattern=autoLoadPatternData.pattern;console.log('🎨 Auto-loading saved pattern using loadSavedPatternToUI:',_pattern.patternName);setTimeout(_waitForAppAndAutoLoad,2000);// Longer delay to prevent race conditions
}catch(error){console.error('❌ Error auto-loading pattern:',error);localStorage.removeItem('colorflexAutoLoad');}}initializeInteractiveZoom();// ← Add this line right here
initializeTryFurnitureFeature();console.log("Current state during app init:");console.log("  furnitureConfig loaded:",!!furnitureConfig);console.log("  appState.selectedCollection:",!!appState.selectedCollection);console.log("  appState.collections:",!!((_appState$collections0=appState.collections)!==null&&_appState$collections0!==void 0&&_appState$collections0.length));console.log("  DOM ready:",document.readyState);_context27.n=37;break;case 36:_context27.p=36;_t25=_context27.v;console.error("X Error loading collections:",_t25);dom.collectionHeader.textContent="Error Loading Collection";dom.preview.innerHTML="<p>Error loading data. Please try refreshing.</p>";case 37:return _context27.a(2);}},_callee18,null,[[26,31,32,33],[9,14],[2,36]]);}));return _initializeApp.apply(this,arguments);}function applyURLParameters(urlParams){console.log('🔗 Applying URL parameters...');// Apply custom colors from URL
var urlColors=urlParams.get('colors');if(urlColors){console.log('🎨 Applying colors from URL:',urlColors);try{var decodedColors=decodeURIComponent(urlColors);var colorList=decodedColors.split(',').map(function(color){return color.trim();});// Apply colors to current layers
if(appState.currentLayers&&colorList.length>0){colorList.forEach(function(colorName,index){if(appState.currentLayers[index]){appState.currentLayers[index].color=colorName;console.log("\uD83C\uDFA8 Applied color ".concat(index+1,": ").concat(colorName));}});// Update UI and preview
populateLayerInputs(appState.currentPattern);updatePreview();// ✅ MODE CHECK: Use correct render function based on mode
var isFurnitureMode=window.COLORFLEX_MODE==='FURNITURE'||appState.isInFurnitureMode;var isClothingMode=window.COLORFLEX_MODE==='CLOTHING'||window.COLORFLEX_SIMPLE_MODE===true&&window.location.pathname.includes('clothing');if(isFurnitureMode){updateFurniturePreview();}else if(appState.isInFabricMode||isClothingMode){renderFabricMockup();}else{updateRoomMockup();}}}catch(error){console.error('❌ Error applying URL colors:',error);}}// Apply pattern scale from URL
var urlScale=urlParams.get('scale');if(urlScale){console.log('📏 Applying scale from URL:',urlScale);try{var scaleValue=parseInt(urlScale);if(scaleValue&&scaleValue>0&&scaleValue<=400){appState.currentScale=scaleValue;// Update scale UI if it exists
var scaleButtons=document.querySelectorAll('[data-multiplier]');scaleButtons.forEach(function(button){var multiplier=parseFloat(button.dataset.multiplier);var calculatedScale=Math.round(100*multiplier);if(calculatedScale===scaleValue){// Remove active class from all buttons
scaleButtons.forEach(function(btn){return btn.classList.remove('scale-button-active');});// Add active class to matching button
button.classList.add('scale-button-active');}});// Update preview with new scale
updatePreview();updateRoomMockup();console.log("\uD83D\uDCCF Applied scale: ".concat(scaleValue,"%"));}}catch(error){console.error('❌ Error applying URL scale:',error);}}// Apply scaleMultiplier from URL
var urlScaleMultiplier=urlParams.get('scaleMultiplier');if(urlScaleMultiplier){console.log('📏 Applying scaleMultiplier from URL:',urlScaleMultiplier);try{var multiplierValue=parseFloat(urlScaleMultiplier);if(multiplierValue&&multiplierValue>0){appState.scaleMultiplier=multiplierValue;// Use setPatternScale to highlight the correct button
if(typeof window.setPatternScale==='function'){console.log('🎯 Highlighting scale button for URL multiplier:',multiplierValue);window.setPatternScale(multiplierValue);}else{console.warn('⚠️ setPatternScale function not available for URL parameter');}console.log("\uD83D\uDCCF Applied scaleMultiplier: ".concat(multiplierValue));}}catch(error){console.error('❌ Error applying URL scaleMultiplier:',error);}}// 🛒 Cart color restoration - handle saved patterns from cart links
var sourceParam=urlParams.get("source");var savedLayersParam=urlParams.get("saved_layers");var savedPatternId=urlParams.get("saved_pattern_id");if((savedLayersParam||urlColors)&&sourceParam==='cart_saved_pattern'){console.log('🎨 Restoring saved colors from cart URL parameters...');console.log('  Source:',sourceParam);console.log('  Saved pattern ID:',savedPatternId);// Delay color restoration to ensure UI is ready
setTimeout(function(){restoreCartColors(savedLayersParam,urlColors);},1000);}console.log('✅ URL parameters applied');}/**
 * Restore colors from cart link navigation
 */function restoreCartColors(savedLayersParam,urlColors){console.log('🎨 restoreCartColors called with:');console.log('  savedLayersParam:',savedLayersParam);console.log('  urlColors:',urlColors);try{var colorsToApply=[];// Try to parse saved layers first (more complete data)
if(savedLayersParam){var savedLayers=JSON.parse(savedLayersParam);console.log('  Parsed saved layers:',savedLayers);colorsToApply=savedLayers.map(function(layer){return{color:layer.color,label:layer.label||"Layer ".concat(layer.index+1)};});}else if(urlColors){// Fallback to URL colors
var colorArray=urlColors.split(',').map(function(c){return c.trim();});colorsToApply=colorArray.map(function(color,index){return{color:color,label:"Layer ".concat(index+1)};});}if(colorsToApply.length===0){console.log('⚠️ No colors to restore');return;}console.log("\uD83C\uDFA8 Applying ".concat(colorsToApply.length," colors from cart:"),colorsToApply);// Wait for layer inputs to be available
var _checkForInputs=function checkForInputs(){var layerInputs=document.querySelectorAll('.layer-input-container input[type="text"]');console.log("\uD83D\uDD0D Found ".concat(layerInputs.length," layer inputs"));if(layerInputs.length===0){console.log('⏳ Layer inputs not ready, retrying...');setTimeout(_checkForInputs,500);return;}// Apply colors to layer inputs
layerInputs.forEach(function(input,index){if(index<colorsToApply.length){var colorToApply=colorsToApply[index];console.log("\uD83C\uDFA8 Setting layer ".concat(index+1," to:"),colorToApply.color);input.value=colorToApply.color;// Trigger change event to update color processing
var changeEvent=new Event('change',{bubbles:true});input.dispatchEvent(changeEvent);// Also trigger input event for real-time updates
var inputEvent=new Event('input',{bubbles:true});input.dispatchEvent(inputEvent);}});// Update previews after a short delay
setTimeout(function(){console.log('🎨 Updating previews after cart color restoration');updatePreview();// ✅ MODE CHECK: Use correct render function based on mode
var isFurnitureMode=window.COLORFLEX_MODE==='FURNITURE'||appState.isInFurnitureMode;var isClothingMode=window.COLORFLEX_MODE==='CLOTHING'||window.COLORFLEX_SIMPLE_MODE===true&&window.location.pathname.includes('clothing');if(isFurnitureMode){updateFurniturePreview();}else if(appState.isInFabricMode||isClothingMode){renderFabricMockup();}else{updateRoomMockup();}},500);console.log('✅ Cart color restoration completed');};_checkForInputs();}catch(error){console.error('❌ Error restoring cart colors:',error);}}// Ensure appState has a default
appState._selectedCollection=null;// Check if we're on the ColorFlex app page
function isColorFlexAppPage(){return document.getElementById('colorflex-app')||window.location.pathname.includes('/colorflex');}// Run on initial load and refresh
window.addEventListener('load',function(){initializeApp()["catch"](function(error){return console.error("Initialization failed:",error);});});window.addEventListener('popstate',function(){initializeApp()["catch"](function(error){return console.error("Refresh initialization failed:",error);});});// Lazy loading observer for thumbnails
var thumbnailObserver=null;/**
 * Initialize Intersection Observer for lazy loading thumbnails
 */function initThumbnailLazyLoading(){if(thumbnailObserver)return;// Already initialized
thumbnailObserver=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){var img=entry.target;var dataSrc=img.dataset.src;if(dataSrc&&!img.src.includes(dataSrc)){console.log("\uD83D\uDC41\uFE0F Lazy loading thumbnail: ".concat(dataSrc.split('/').pop()));img.src=dataSrc;img.removeAttribute('data-src');thumbnailObserver.unobserve(img);}}});},{root:null,// Use viewport as root
rootMargin:'100px',// Start loading 100px before image enters viewport
threshold:0.01});console.log('👁️ Thumbnail lazy loading initialized');}// Populate pattern thumbnails in sidebar with lazy loading
function populatePatternThumbnails(patterns){console.log("populatePatternThumbnails called with patterns:",patterns);if(!dom.collectionThumbnails){console.error("collectionThumbnails not found in DOM");return;}if(!Array.isArray(patterns)){console.error("Patterns is not an array:",patterns);return;}var validPatterns=patterns.filter(function(p){return p&&_typeof(p)==='object'&&p.name;});if(!validPatterns.length){console.warn("No valid patterns to display");dom.collectionThumbnails.innerHTML="<p>No patterns available.</p>";return;}function cleanPatternName(str){if(!str||typeof str!=='string'){return'';}return str.toLowerCase().replace(/\.\w+$/,'').replace(/-\d+x\d+$|-variant$/i,'').replace(/^\d+[a-z]+-|-.*$/i,'').replace(/\s+/g,' ').trim().split(' ').map(function(word){return word.charAt(0).toUpperCase()+word.slice(1);}).join(" ");}// Initialize lazy loading observer
initThumbnailLazyLoading();dom.collectionThumbnails.innerHTML="";console.log("Cleared existing thumbnails");// 🎨 SIMPLE MODE: Force horizontal layout
var isSimpleMode=window.COLORFLEX_SIMPLE_MODE===true;console.log("🔍 DEBUG: window.COLORFLEX_SIMPLE_MODE =",window.COLORFLEX_SIMPLE_MODE,"| isSimpleMode =",isSimpleMode);if(isSimpleMode){console.log("🎨 Simple mode - applying horizontal thumbnail layout");dom.collectionThumbnails.style.display='flex';dom.collectionThumbnails.style.flexWrap='wrap';dom.collectionThumbnails.style.justifyContent='center';dom.collectionThumbnails.style.gap='0.75rem';dom.collectionThumbnails.style.padding='1rem 0';}else{console.log("❌ Simple mode NOT detected in populatePatternThumbnails");}validPatterns.forEach(function(pattern,index){console.log("Processing pattern:",pattern);pattern.displayName=cleanPatternName(pattern.name);var thumb=document.createElement("div");thumb.className="thumbnail cursor-pointer border-1 border-transparent";// Prioritize slug for clothing collections, fall back to id, then name-based ID
thumb.dataset.patternId=pattern.slug||pattern.id||(typeof pattern.name==='string'?pattern.name.toLowerCase().replace(/\s+/g,'-'):'unknown-pattern');thumb.style.width="120px";thumb.style.boxSizing="border-box";var img=document.createElement("img");// Lazy loading: Load first 3 thumbnails immediately, rest on scroll
var thumbnailUrl=normalizePath(pattern.thumbnail)||"https://so-animation.com/colorflex/data/collections/fallback.jpg";if(index<3){// Load first 3 immediately for instant display
img.src=thumbnailUrl;console.log("\u26A1 Eager loading thumbnail ".concat(index+1,": ").concat(thumbnailUrl.split('/').pop()));}else{// Lazy load the rest
img.dataset.src=thumbnailUrl;img.src='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"%3E%3Crect fill="%23e0e0e0" width="120" height="120"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="12" fill="%23999"%3ELoading...%3C/text%3E%3C/svg%3E';thumbnailObserver.observe(img);}img.alt=pattern.displayName;img.className="w-full h-auto";img.onerror=function(){console.warn("Failed to load thumbnail for ".concat(pattern.displayName,": ").concat(img.src));if(img.src!=="https://so-animation.com/colorflex/data/collections/fallback.jpg"){img.src="https://so-animation.com/colorflex/data/collections/fallback.jpg";img.onerror=function(){console.warn("Failed to load fallback for ".concat(pattern.displayName));var placeholder=document.createElement("div");placeholder.textContent=pattern.displayName||"Thumbnail Unavailable";placeholder.style.width="100%";placeholder.style.height="80px";placeholder.style.backgroundColor="#e0e0e0";placeholder.style.border="1px solid #ccc";placeholder.style.display="flex";placeholder.style.alignItems="center";placeholder.style.justifyContent="center";placeholder.style.fontSize="12px";placeholder.style.textAlign="center";placeholder.style.padding="5px";placeholder.style.boxSizing="border-box";thumb.replaceChild(placeholder,img);img.onerror=null;console.log("Replaced failed thumbnail for ".concat(pattern.displayName," with placeholder div"));};}else{var placeholder=document.createElement("div");placeholder.textContent=pattern.displayName||"Thumbnail Unavailable";placeholder.style.width="100%";placeholder.style.height="80px";placeholder.style.backgroundColor="#e0e0e0";placeholder.style.border="1px solid #ccc";placeholder.style.display="flex";placeholder.style.alignItems="center";placeholder.style.justifyContent="center";placeholder.style.fontSize="12px";placeholder.style.textAlign="center";placeholder.style.padding="5px";placeholder.style.boxSizing="border-box";thumb.replaceChild(placeholder,img);img.onerror=null;console.log("Replaced failed thumbnail for ".concat(pattern.displayName," with placeholder div"));}};thumb.appendChild(img);var label=document.createElement("p");label.textContent=pattern.displayName;label.className="text-center";thumb.appendChild(label);if(appState.currentPattern&&String(appState.currentPattern.id)===String(pattern.id)){thumb.classList.add("selected");console.log("Applied 'selected' class to ".concat(pattern.displayName));}thumb.addEventListener("click",function(e){console.log("Thumbnail clicked: ".concat(pattern.displayName,", ID: ").concat(thumb.dataset.patternId));handleThumbnailClick(thumb.dataset.patternId);document.querySelectorAll(".thumbnail").forEach(function(t){return t.classList.remove("selected");});thumb.classList.add("selected");});dom.collectionThumbnails.appendChild(thumb);});console.log("Pattern thumbnails populated:",validPatterns.length);// 🎨 SIMPLE MODE REDESIGN: Also populate sidebar if present
populatePatternSidebar(validPatterns);// 🎨 SIMPLE MODE: Force horizontal layout AFTER all thumbnails created
if(window.COLORFLEX_SIMPLE_MODE===true){console.log("🎨 SIMPLE MODE: Forcing horizontal thumbnail layout with aggressive styles");// Force container to horizontal flex
dom.collectionThumbnails.style.setProperty('display','flex','important');dom.collectionThumbnails.style.setProperty('flex-direction','row','important');dom.collectionThumbnails.style.setProperty('flex-wrap','wrap','important');dom.collectionThumbnails.style.setProperty('justify-content','center','important');dom.collectionThumbnails.style.setProperty('gap','1rem','important');dom.collectionThumbnails.style.setProperty('width','100%','important');dom.collectionThumbnails.style.setProperty('max-width','100%','important');dom.collectionThumbnails.style.setProperty('position','relative','important');dom.collectionThumbnails.style.setProperty('left','auto','important');dom.collectionThumbnails.style.setProperty('top','auto','important');// Force each thumbnail to inline-block
var thumbnails=dom.collectionThumbnails.querySelectorAll('.thumbnail');thumbnails.forEach(function(thumb){thumb.style.setProperty('display','inline-block','important');thumb.style.setProperty('float','none','important');thumb.style.setProperty('position','relative','important');});console.log("✅ Horizontal layout forced on",thumbnails.length,"thumbnails");}// Update collection header
// ✅ FIX: Support both standard furniture page format (h6 element) and simple mode format
var collectionHeader=dom.collectionHeader||document.getElementById('collectionHeader');if(collectionHeader){var _appState$selectedCol19;var collectionName=((_appState$selectedCol19=appState.selectedCollection)===null||_appState$selectedCol19===void 0?void 0:_appState$selectedCol19.name)||"Unknown";var displayName="";// Check if this is a clothing collection (match both -clo and .clo- patterns)
if(collectionName.includes('-clo')||collectionName.includes('.clo-')){var collectionBaseName=collectionName.split(/[-.]clo/)[0];displayName=toInitialCaps(collectionBaseName);console.log("Updated collectionHeader (clothing):",displayName);}else if(collectionName.includes('.fur')||collectionName.endsWith('.fur')){// Furniture collection: strip .fur suffix
// ✅ Standard format: .fur (not .fur-1) - all furniture pieces go under .fur collection
var _collectionBaseName=collectionName.replace(/\.fur$/i,'');// Remove .fur (standard)
if(_collectionBaseName===collectionName){_collectionBaseName=collectionName.replace(/\.fur-\d+$/i,'');// Fallback: .fur-1 (backwards compat)
}displayName=toInitialCaps(_collectionBaseName);console.log("Updated collectionHeader (furniture):",displayName);}else{displayName=toInitialCaps(collectionName);console.log("Updated collectionHeader:",displayName);}// ✅ FIX: Check if collectionHeader is an h6 (standard furniture page) or button/div (simple mode)
if(collectionHeader.tagName==='H6'){// Standard furniture page format: h6 element with uppercase text
collectionHeader.textContent=displayName.toUpperCase();}else{// Simple mode or other formats: use the display name as-is
collectionHeader.textContent=displayName;}}}// Populate coordinates thumbnails in #coordinatesContainer
var populateCoordinates=function populateCoordinates(){var _appState$selectedCol20;// ✅ Skip coordinates for fabric, clothing, and furniture modes
if(appState.isInFabricMode){return;}// ✅ Skip for clothing mode (check window.COLORFLEX_MODE since standard clothing uses base collections)
if(window.COLORFLEX_MODE==='CLOTHING'){return;}// ✅ Skip for furniture mode
if(window.COLORFLEX_MODE==='FURNITURE'){return;}if(!dom.coordinatesContainer){console.error("coordinatesContainer not found in DOM");return;}dom.coordinatesContainer.innerHTML="";var coordinates=((_appState$selectedCol20=appState.selectedCollection)===null||_appState$selectedCol20===void 0?void 0:_appState$selectedCol20.coordinates)||[];console.log("Collection coordinates data:",coordinates);if(!coordinates.length){var _appState$selectedCol21;console.log("No matching coordinates available for collection:",(_appState$selectedCol21=appState.selectedCollection)===null||_appState$selectedCol21===void 0?void 0:_appState$selectedCol21.name);return;}var numCoordinates=coordinates.length;var xStep=80;var yStep=60;// Get actual container dimensions
var containerWidth=dom.coordinatesContainer.offsetWidth||600;var containerHeight=dom.coordinatesContainer.offsetHeight||300;// Calculate total span and center the layout
var totalXSpan=(numCoordinates-1)*xStep;var totalYSpan=numCoordinates>1?yStep:0;var xStart=containerWidth/2-totalXSpan/2;var yStart=containerHeight/2-totalYSpan/2;coordinates.forEach(function(coord,index){var div=document.createElement("div");div.className="coordinate-item";var xOffset=xStart+index*xStep;var yOffset=yStart+(index%2===0?0:yStep);div.style.setProperty("--x-offset","".concat(xOffset,"px"));div.style.setProperty("--y-offset","".concat(yOffset,"px"));var img=document.createElement("img");var normalizedPath=normalizePath(coord.path);console.log("\uD83D\uDD0D Coordinate path: \"".concat(coord.path,"\" \u2192 normalized: \"").concat(normalizedPath,"\""));img.src=normalizedPath||"https://so-animation.com/colorflex/data/collections/default-coordinate.jpg";img.alt=coord.pattern||"Coordinate ".concat(index+1);img.className="coordinate-image";img.dataset.filename=coord.path||"fallback";img.onerror=function(){console.warn("Failed to load coordinate image: ".concat(img.src));var placeholder=document.createElement("div");placeholder.className="coordinate-placeholder";placeholder.textContent=coord.pattern||"Coordinate Unavailable";div.replaceChild(placeholder,img);};div.appendChild(img);dom.coordinatesContainer.appendChild(div);});console.log("Coordinates populated:",coordinates.length);setupCoordinateImageHandlers();};// SIMPLE MODE REDESIGN: Populate sidebar with vertical pattern thumbnails
function populatePatternSidebar(patterns){var sidebar=document.getElementById('patternThumbnailsSidebar');if(!sidebar)return;// Not on simple mode page
console.log("📋 Populating pattern sidebar with",patterns.length,"patterns");sidebar.innerHTML="";// Capture collection object for click handlers (loadPatternData needs the object, not just the name)
var collection=appState.selectedCollection;if(!collection){console.error("❌ Cannot populate sidebar: no collection selected");return;}patterns.forEach(function(pattern,index){var container=document.createElement("div");container.style.cssText="\n            margin-bottom: 0.75rem;\n            cursor: pointer;\n            transition: transform 0.2s;\n        ";var img=document.createElement("img");var thumbnailUrl=normalizePath(pattern.thumbnail)||"https://so-animation.com/colorflex/data/collections/fallback.jpg";img.src=thumbnailUrl;img.alt=pattern.name;img.style.cssText="\n            width: 100%;\n            height: auto;\n            border: 2px solid #4a5568;\n            border-radius: 4px;\n            display: block;\n            margin-bottom: 0.25rem;\n        ";img.onerror=function(){img.src="https://so-animation.com/colorflex/data/collections/fallback.jpg";};var label=document.createElement("div");label.textContent=pattern.name.split(/[-_]/).map(function(w){return w.charAt(0).toUpperCase()+w.slice(1);}).join(' ');label.style.cssText="\n            font-family: 'Special Elite', monospace;\n            font-size: 0.75rem;\n            color: #a0aec0;\n            text-align: center;\n        ";container.appendChild(img);container.appendChild(label);container.addEventListener('mouseenter',function(){img.style.borderColor='#d4af37';container.style.transform='scale(1.05)';});container.addEventListener('mouseleave',function(){img.style.borderColor='#4a5568';container.style.transform='scale(1)';});container.addEventListener('click',function(){loadPatternData(collection,pattern.slug||pattern.name);});sidebar.appendChild(container);});}// REMOVED: populateLayerThumbnails - now handled directly in populateLayerInputs for simple mode
// Populate the layer inputs UI
function populateLayerInputs(){var pattern=arguments.length>0&&arguments[0]!==undefined?arguments[0]:appState.currentPattern;try{var _pattern$layers2,_appState$selectedCol25,_appState$selectedCol26;if(!pattern){console.error("❌ No pattern provided or set in appState.");return;}// ⚡ PERFORMANCE: Early exit for standard patterns (no layers)
var isStandardPattern=!pattern.layers||pattern.layers.length===0;// 🎨 SIMPLE MODE: Render into layerThumbnailsContainer with thumbnail images
var thumbnailContainer=document.getElementById('layerThumbnailsContainer');var isSimpleMode=!!thumbnailContainer;if(isSimpleMode){var _appState$selectedCol22,_appState$selectedCol23;console.log("🎨 Simple mode detected - rendering into layerThumbnailsContainer");// Get default colors from designer colors or curated colors
var _designerColors=pattern.designer_colors||pattern.colors||[];var _curatedColors=((_appState$selectedCol22=appState.selectedCollection)===null||_appState$selectedCol22===void 0?void 0:_appState$selectedCol22.curatedColors)||[];var defaultColors=_designerColors.length>0?_designerColors:_curatedColors;console.log("🎨 SIMPLE MODE COLOR FALLBACK:");console.log("  pattern.designer_colors:",pattern.designer_colors);console.log("  pattern.colors:",pattern.colors);console.log("  designerColors (merged):",_designerColors);console.log("  curatedColors:",_curatedColors);console.log("  defaultColors (final):",defaultColors);console.log("  Using",defaultColors.length,"colors from",_designerColors.length>0?"pattern":"collection");// Initialize state and setup
handlePatternSelection(pattern.name,appState.colorsLocked);appState.layerInputs=[];appState.currentLayers=[];thumbnailContainer.innerHTML="";// Get all layers
var _allLayers=buildLayerModel(pattern,defaultColors,{isWallPanel:((_appState$selectedCol23=appState.selectedCollection)===null||_appState$selectedCol23===void 0?void 0:_appState$selectedCol23.name)==="wall-panels",tintWhite:appState.tintWhite||false});appState.currentLayers=_allLayers;var inputLayers=_allLayers.filter(function(layer){return!layer.isShadow;});// Create inputs with thumbnails instead of circles
var layerImageIndex=0;// Track index for accessing pattern.layers
inputLayers.forEach(function(layer,index){var container=document.createElement("div");container.className="layer-thumbnail-container";// Create thumbnail image or colored square
var visualElement;var isColoredSquare=layer.isBackground||layer.label.toLowerCase().includes('extra');if(isColoredSquare){// Colored square for wall/background/extras
visualElement=document.createElement("div");visualElement.className="layer-thumbnail-img";var cleanColor=getCleanColorName(layer.color);var hex=lookupColor(cleanColor)||lookupColor(layer.color)||"#FFFFFF";visualElement.style.backgroundColor=hex;visualElement.style.border="2px solid #4a5568";visualElement.style.width="100px";visualElement.style.height="100px";visualElement.style.display="block";console.log("\uD83C\uDFA8 Colored square for \"".concat(layer.label,"\": color=\"").concat(layer.color,"\", cleanColor=\"").concat(cleanColor,"\", hex=\"").concat(hex,"\""));}else{// Layer: thumbnail image
visualElement=document.createElement("img");visualElement.className="layer-thumbnail-img";var layerData=pattern.layers[layerImageIndex];var layerPath=typeof layerData==='string'?layerData:(layerData===null||layerData===void 0?void 0:layerData.path)||layerData;visualElement.src=normalizePath(layerPath);visualElement.alt=layer.label;visualElement.onerror=function(){visualElement.style.background='#1a202c';};layerImageIndex++;// Only increment for actual image layers
}// Label
var labelEl=document.createElement("div");labelEl.className="layer-label";labelEl.textContent=layer.label;// Input field
var input=document.createElement("input");input.type="text";input.className="layer-color-input";input.placeholder=layer.label;input.value=getCleanColorName(layer.color);// ✅ Track previous value to only update on actual changes
// Normalize initial value for comparison (case-insensitive, trimmed)
var previousValue=input.value.trim().toLowerCase();// Update function
var updateColor=function updateColor(){var userInput=input.value.trim();var normalizedInput=userInput.toLowerCase();// ✅ FIX: Only update if value actually changed (case-insensitive comparison)
if(normalizedInput===previousValue){console.log("updateColor skipped for ".concat(layer.label," - no change (value: ").concat(userInput,", previous: ").concat(previousValue,")"));return;}console.log("updateColor called for ".concat(layer.label,", input value changed from \"").concat(previousValue,"\" to \"").concat(userInput,"\""));previousValue=normalizedInput;var hex=lookupColor(userInput);if(!userInput||hex==="#FFFFFF"){input.value=getCleanColorName(layer.color);previousValue=input.value.trim().toLowerCase();// Update normalized previous value
if(isColoredSquare){var _cleanColor=getCleanColorName(layer.color);var fallbackHex=lookupColor(_cleanColor)||lookupColor(layer.color);visualElement.style.backgroundColor=fallbackHex;}}else{input.value=userInput;if(isColoredSquare){visualElement.style.backgroundColor=hex;}// previousValue already updated above
}// Update appState
var layerIndex=appState.currentLayers.findIndex(function(l){return l.label===layer.label;});if(layerIndex!==-1){appState.currentLayers[layerIndex].color=input.value;}// Update previews
// ✅ MODE CHECK: Use correct render function based on mode
var isFurnitureMode=window.COLORFLEX_MODE==='FURNITURE'||appState.isInFurnitureMode;var isClothingMode=window.COLORFLEX_MODE==='CLOTHING'||window.COLORFLEX_SIMPLE_MODE===true&&window.location.pathname.includes('clothing');if(isFurnitureMode){updateFurniturePreview();updatePreview();}else if(appState.isInFabricMode||isClothingMode){renderFabricMockup();updatePreview();}else{updatePreview();updateRoomMockup();}populateCoordinates();};input.addEventListener("blur",updateColor);input.addEventListener("keydown",function(e){if(e.key==="Enter")updateColor();});// Store in appState
appState.layerInputs.push({input:input,circle:visualElement,label:layer.label,isBackground:layer.isBackground,color:layer.color,hex:lookupColor(layer.color)||"#FFFFFF"});// Assemble
container.appendChild(visualElement);container.appendChild(labelEl);container.appendChild(input);thumbnailContainer.appendChild(container);});console.log("✅ Simple mode layer inputs created:",inputLayers.length,"layers");return;}if(isStandardPattern){var _pattern$layers;// Clear and hide layer controls
if(dom.layerInputsContainer){dom.layerInputsContainer.innerHTML="";dom.layerInputsContainer.style.display='block';}// Hide the "Color Layers" heading
var _colorLayersHeading=document.getElementById('colorLayersHeading');if(_colorLayersHeading){_colorLayersHeading.style.display='none';}// Hide the color lock button for standard patterns
console.log("🔍 COLOR LOCK BUTTON CHECK (Standard Pattern):");console.log("  Pattern:",pattern.name);console.log("  Has layers:",((_pattern$layers=pattern.layers)===null||_pattern$layers===void 0?void 0:_pattern$layers.length)||0);var _colorLockBtn=document.getElementById('colorLockBtn');console.log("  Button found:",!!_colorLockBtn);if(_colorLockBtn){_colorLockBtn.style.display='none';console.log('✅ HIDING COLOR LOCK BUTTON: Standard pattern has no layers to customize');console.log('  Button display style:',_colorLockBtn.style.display);}else{console.warn('⚠️ Color lock button not found in DOM');}// Show description for standard patterns
if(dom.layerInputsContainer){var _appState$selectedCol24;// Get collection description (first sentence)
var collectionDescription=((_appState$selectedCol24=appState.selectedCollection)===null||_appState$selectedCol24===void 0?void 0:_appState$selectedCol24.description)||'';// Change to single column for standard patterns
dom.layerInputsContainer.style.gridTemplateColumns='repeat(1, 1fr)';dom.layerInputsContainer.innerHTML="\n          <div style=\"\n            text-align: center;\n            padding: 30px 20px;\n            color: #d4af37;\n            font-family: 'IM Fell English', serif;\n            font-size: 1.1rem;\n            line-height: 1.8;\n            max-width: 800px;\n            margin: 0 auto;\n          \">\n            ".concat(collectionDescription?"".concat(collectionDescription,"<br><br>"):'',"\n            Each pattern repeat is 24x24 inches and can be scaled to suite your need.\n          </div>\n        ");dom.layerInputsContainer.style.display='block';}// Set up minimal state (but DON'T render yet - let loadPatternData render after scale restoration)
handlePatternSelection(pattern.name,appState.colorsLocked);// REMOVED: updatePreview() and updateRoomMockup() calls here
// These will be called by loadPatternData() after scale restoration
console.log('⏭️  Standard pattern: Skipping preview render (will render after scale restoration)');return;// Skip complex UI creation for ColorFlex patterns
}// Show layer inputs container and heading for patterns with layers
if(dom.layerInputsContainer){dom.layerInputsContainer.style.display='';}// Show "Color Layers" heading only for ColorFlex patterns (not standard patterns)
var colorLayersHeading=document.getElementById('colorLayersHeading');if(colorLayersHeading){var _isStandardPattern=!pattern.layers||pattern.layers.length===0;colorLayersHeading.style.display=_isStandardPattern?'none':'';console.log("\uD83D\uDCCB Color Layers heading: ".concat(_isStandardPattern?'hidden':'shown'," for pattern type"));}// Show the color lock button for ColorFlex patterns
console.log("🔍 COLOR LOCK BUTTON CHECK (ColorFlex Pattern):");console.log("  Pattern:",pattern.name);console.log("  Has layers:",((_pattern$layers2=pattern.layers)===null||_pattern$layers2===void 0?void 0:_pattern$layers2.length)||0);var colorLockBtn=document.getElementById('colorLockBtn');console.log("  Button found:",!!colorLockBtn);if(colorLockBtn){colorLockBtn.style.display='';console.log('✅ SHOWING COLOR LOCK BUTTON: ColorFlex pattern has',pattern.layers.length,'customizable layers');console.log('  Button display style:',colorLockBtn.style.display||'default (visible)');}else{console.warn('⚠️ Color lock button not found in DOM');}// ✅ Save color lock buffer BEFORE handlePatternSelection (if colors are locked)
var colorLockBuffer=null;if(appState.colorsLocked&&appState.layerInputs&&appState.layerInputs.length>0){colorLockBuffer=appState.layerInputs.map(function(layer){return layer.input.value;});console.log('🔒 Pre-selection: Saved color lock buffer:',colorLockBuffer);}// Call handlePatternSelection with color lock buffer
// This sets up appState.currentPattern and appState.currentLayers correctly
handlePatternSelection(pattern.name,appState.colorsLocked,colorLockBuffer);appState.layerInputs=[];appState.currentLayers=[];if(!dom.layerInputsContainer){console.error("❌ layerInputsContainer not found in DOM");console.log("🔍 Available DOM elements:",Object.keys(dom));return;}console.log("✅ layerInputsContainer found:",dom.layerInputsContainer);var designerColors=pattern.designer_colors||[];var curatedColors=((_appState$selectedCol25=appState.selectedCollection)===null||_appState$selectedCol25===void 0?void 0:_appState$selectedCol25.curatedColors)||[];// Use curated colors as fallback if no designer colors
var effectiveColors=designerColors.length>0?designerColors:curatedColors;console.log("🎨 COLOR FALLBACK DEBUG:");console.log("  - designerColors:",designerColors.length,designerColors);console.log("  - curatedColors:",curatedColors.length,curatedColors);console.log("  - effectiveColors:",effectiveColors.length,effectiveColors);// Get all layers (including shadows)
var allLayers=buildLayerModel(pattern,effectiveColors,{isWallPanel:((_appState$selectedCol26=appState.selectedCollection)===null||_appState$selectedCol26===void 0?void 0:_appState$selectedCol26.name)==="wall-panels",tintWhite:appState.tintWhite||false});// Store all layers in currentLayers
appState.currentLayers=allLayers;dom.layerInputsContainer.innerHTML="";if(isStandardPattern){// For standard patterns, hide the color controls container and don't create inputs
if(dom.layerInputsContainer){dom.layerInputsContainer.style.display='none';}appState.layerInputs=[];console.log("📋 Color controls hidden for standard pattern:",pattern.name);}else{// For ColorFlex patterns, show the color controls container and create inputs
if(dom.layerInputsContainer){dom.layerInputsContainer.style.display='';}// Create inputs ONLY for non-shadow layers
var _inputLayers=allLayers.filter(function(layer){return!layer.isShadow;});// Add inputs directly to container (no row wrappers)
_inputLayers.forEach(function(layer){var layerData=createColorInput(layer.label,layer.inputId,layer.color,layer.isBackground);appState.layerInputs.push({input:layerData.input,circle:layerData.circle,label:layerData.label,isBackground:layerData.isBackground,color:layer.color,hex:lookupColor(layer.color)||"#FFFFFF"});// Add directly to container - no row grouping needed!
dom.layerInputsContainer.appendChild(layerData.container);});console.log("✅ Populated layerInputs:",appState.layerInputs.map(function(l){return{label:l.label,value:l.input.value};}));console.log("✅ All layers (including shadows):",appState.currentLayers.map(function(l){return{label:l.label,isShadow:l.isShadow,path:l.path};}));}// End of ColorFlex pattern handling
// Add save button after pattern layers are populated
addSaveButton();}catch(e){console.error("❌ Error in populateLayerInputs:",e);}}if(USE_GUARD&&DEBUG_TRACE){populateLayerInputs=guard(traceWrapper(populateLayerInputs,"populateLayerInputs"));}else if(USE_GUARD){populateLayerInputs=guard(populateLayerInputs,"populateLayerInputs");}if(USE_GUARD&&DEBUG_TRACE){populateLayerInputs=guard(traceWrapper(populateLayerInputs,"populateLayerInputs"));}else if(USE_GUARD){populateLayerInputs=guard(populateLayerInputs,"populateLayerInputs");}// ============================================================================
// SECTION 7: PATTERN SELECTION & LAYER BUILDING
// ============================================================================
// Pattern click handling, layer model construction, color application.
// Includes scale persistence and color lock integration.
// ============================================================================
function handlePatternSelection(patternName){var _appState$selectedCol27,_appState$selectedCol28,_appState$currentLaye4;var preserveColors=arguments.length>1&&arguments[1]!==undefined?arguments[1]:false;var colorLockBuffer=arguments.length>2&&arguments[2]!==undefined?arguments[2]:null;// Check if colors are locked - if so, force preserveColors to true
if(appState.colorsLocked){preserveColors=true;console.log('🔒 Color lock enabled - preserving current color selections');if(colorLockBuffer){console.log('🔒 Using color lock buffer:',colorLockBuffer);}}console.log("handlePatternSelection: pattern=".concat(patternName,", lockedCollection=").concat(appState.lockedCollection,", currentCollection=").concat((_appState$selectedCol27=appState.selectedCollection)===null||_appState$selectedCol27===void 0?void 0:_appState$selectedCol27.name));var pattern=appState.selectedCollection.patterns.find(function(p){return p.name.toUpperCase()===patternName.toUpperCase();})||appState.selectedCollection.patterns[0];if(!pattern){console.error("Pattern ".concat(patternName," not found in selected collection"));return;}appState.currentPattern=pattern;// ⚡ PERFORMANCE: Early exit for standard patterns - skip all color/layer setup
var isStandardPattern=!pattern.layers||pattern.layers.length===0;if(isStandardPattern){// Standard patterns don't need layer management, just set minimal state
appState.currentLayers=[{imageUrl:null,color:"#FFFFFF",label:"Background",isShadow:false}];// Hide download proof button for standard patterns (no customization to proof)
toggleDownloadProofButton(false);return;// Exit early - no color/layer processing needed
}// Show download proof button for ColorFlex patterns (customizable)
toggleDownloadProofButton(true);var designerColors=appState.currentPattern.designer_colors||[];var curatedColors=appState.selectedCollection.curatedColors||[];var colorSource=designerColors.length>0?designerColors:curatedColors;// ✅ Use color lock buffer if provided (from loadPatternData), otherwise use old currentLayers
var savedColors=preserveColors&&colorLockBuffer?colorLockBuffer:preserveColors?appState.currentLayers.map(function(layer){return layer.color;}):[];appState.currentLayers=[];var colorIndex=0;// ✅ Make sure this is only declared once
var patternType=getPatternType(pattern,appState.selectedCollection);console.log("\uD83D\uDD0D Pattern type detected: ".concat(patternType," for pattern: ").concat(pattern.name," in collection: ").concat((_appState$selectedCol28=appState.selectedCollection)===null||_appState$selectedCol28===void 0?void 0:_appState$selectedCol28.name));var isWallPanel=patternType==="wall-panel";var isWall=pattern.isWall||isWallPanel;if(isWall){var wallColor=colorSource[colorIndex]||"#FFFFFF";appState.currentLayers.push({imageUrl:null,color:wallColor,label:"Wall Color",isShadow:false});colorIndex++;}var backgroundColor=colorSource[colorIndex]||"#FFFFFF";appState.currentLayers.push({imageUrl:null,color:backgroundColor,label:"Background",isShadow:false});console.log("DEBUG: currentLayers[0]?.color =",(_appState$currentLaye4=appState.currentLayers[0])===null||_appState$currentLaye4===void 0?void 0:_appState$currentLaye4.color);colorIndex++;if(!appState.currentPattern.tintWhite){var overlayLayers=pattern.layers||[];console.log("Processing ".concat(overlayLayers.length," overlay layers"));overlayLayers.forEach(function(layer,index){var layerPath=layer.path||"";var label=pattern.layerLabels[index]||"Layer ".concat(index+1);var isShadow=layer.isShadow===true;if(!isShadow){var layerColor=colorSource[colorIndex]||"#000000";appState.currentLayers.push({imageUrl:layerPath,color:layerColor,label:label,isShadow:false});console.log("Assigned color to ".concat(label,": ").concat(layerColor));colorIndex++;}});console.log("Final appState.currentLayers:",JSON.stringify(appState.currentLayers,null,2));}// Restore saved colors if preserving
if(preserveColors&&savedColors.length>0){appState.currentLayers.forEach(function(layer,index){if(savedColors[index]&&layer.color){layer.color=savedColors[index];}});console.log("🔄 Colors preserved from previous selection");}// ⚡ PERFORMANCE: Preload adjacent patterns for instant switching
preloadAdjacentPatterns(pattern);}/**
 * Preload images for adjacent patterns (prev/next in collection)
 * Makes pattern switching feel instant
 *
 * @param {object} currentPattern - Currently selected pattern
 */function preloadAdjacentPatterns(currentPattern){if(!appState.selectedCollection||!appState.selectedCollection.patterns){return;}var patterns=appState.selectedCollection.patterns;var currentIndex=patterns.findIndex(function(p){return p.name===currentPattern.name;});if(currentIndex===-1)return;var urlsToPreload=[];// Get previous pattern (or wrap to end)
var prevIndex=currentIndex>0?currentIndex-1:patterns.length-1;var prevPattern=patterns[prevIndex];// Get next pattern (or wrap to start)
var nextIndex=currentIndex<patterns.length-1?currentIndex+1:0;var nextPattern=patterns[nextIndex];// Collect all image URLs from adjacent patterns
[prevPattern,nextPattern].forEach(function(pattern){if(!pattern)return;// Add thumbnail
if(pattern.thumbnail){urlsToPreload.push(pattern.thumbnail);}// Add layer images (for ColorFlex patterns)
if(pattern.layers&&Array.isArray(pattern.layers)){pattern.layers.forEach(function(layer){var layerPath=typeof layer==='string'?layer:layer.path;if(layerPath){urlsToPreload.push(layerPath);}});}});if(urlsToPreload.length>0){console.log("\uD83D\uDD04 Preloading ".concat(urlsToPreload.length," images from adjacent patterns (").concat(prevPattern.name,", ").concat(nextPattern.name,")"));preloadImages(urlsToPreload);}}function applyColorsToLayerInputs(colors){var curatedColors=arguments.length>1&&arguments[1]!==undefined?arguments[1]:[];console.log("Applying colors to layer inputs:",colors,"Curated colors:",curatedColors,"Layer inputs length:",appState.layerInputs.length,"Current layers length:",appState.currentLayers.length);appState.layerInputs.forEach(function(layer,index){if(index>=appState.currentLayers.length){console.warn("Skipping input ".concat(layer.label," at index ").concat(index,": no corresponding currentLayer"));return;}var color=colors[index]||curatedColors[index]||(layer.isBackground?"#FFFFFF":"Snowbound");var cleanColor=color.replace(/^(SW|SC)\d+\s*/i,"").trim();var hex=lookupColor(color)||"#FFFFFF";layer.input.value=getCleanColorName(color);layer.circle.style.backgroundColor=hex;console.log("Applied ".concat(cleanColor," (").concat(hex,") to ").concat(layer.label," input (index ").concat(index,")"));appState.currentLayers[index].color=cleanColor;});console.log("Inputs after apply:",appState.layerInputs.map(function(l){return{id:l.input.id,label:l.label,value:l.input.value};}));updateDisplays();}// Highlight active layer
var highlightActiveLayer=function highlightActiveLayer(circle){console.log("🎯 highlightActiveLayer called for circle:",circle.id);document.querySelectorAll(".circle-input").forEach(function(c){c.style.outline="none";c.style.setProperty('outline','none','important');});circle.style.outline="6px solid rgb(244, 255, 219)";circle.style.setProperty('outline','6px solid rgb(244, 255, 219)','important');console.log("✅ Active layer highlighted:",circle.id,"outline:",circle.style.outline);};/**
 * =============================================================================
 * SECTION 5: PATTERN PROCESSING ENGINE
 * =============================================================================
 * 
 * This section handles the core image processing functionality including:
 * - Pattern layer color application and tinting
 * - Image normalization and gamma correction
 * - Shadow and transparency processing  
 * - Canvas-based pixel manipulation
 * - Real-time pattern rendering and updates
 *//**
 * Main image processing function - applies colors and effects to pattern layers
 * 
 * This is the core function that takes a pattern image and applies color tinting,
 * shadow effects, and other transformations to create the final rendered pattern.
 * 
 * PROCESSING PIPELINE:
 * 1. Normalize and load the image URL
 * 2. Apply color tinting based on layerColor parameter
 * 3. Handle special cases (shadows, walls, panels)
 * 4. Process pixels with normalization or binary thresholding
 * 5. Apply gamma correction and output to callback
 * 
 * @param {string} url - Image URL to process
 * @param {Function} callback - Callback function receiving processed canvas
 * @param {string} layerColor - Hex color to apply to the pattern (#7f817e default)
 * @param {number} gamma - Gamma correction value (2.2 default)
 * @param {boolean} isShadow - Whether this layer represents a shadow
 * @param {boolean} isWallPanel - Whether this is a wall panel layer  
 * @param {boolean} isWall - Whether this is a solid wall color
 */var processImage=function processImage(url,callback){var layerColor=arguments.length>2&&arguments[2]!==undefined?arguments[2]:'#7f817e';var gamma=arguments.length>3&&arguments[3]!==undefined?arguments[3]:2.2;var isShadow=arguments.length>4&&arguments[4]!==undefined?arguments[4]:false;var isWallPanel=arguments.length>5&&arguments[5]!==undefined?arguments[5]:false;var isWall=arguments.length>6&&arguments[6]!==undefined?arguments[6]:false;var normalizedUrl=normalizePath(url);var img=new Image();img.crossOrigin="anonymous";img.decoding="async";// ⚠️ CRITICAL FIX: Removed ?t=${Date.now()} timestamp to allow browser caching
// The timestamp was causing duplicate downloads of the same image (4x downloads!)
// Browser cache + imageCache system will handle cache management properly
img.src=normalizedUrl;img.onload=function(){var w=img.naturalWidth||img.width;var h=img.naturalHeight||img.height;var canvas=document.createElement("canvas");canvas.width=w;// tile-sized; no DPR scaling here
canvas.height=h;var ctx=canvas.getContext("2d",{willReadFrequently:true});ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";// Solid wall fast-path unchanged (keeps your behavior)
if(isWall&&(!url||url==="")){ctx.clearRect(0,0,w,h);callback(canvas);return;}ctx.drawImage(img,0,0,w,h);if(isShadow){// Shadow from luminance (gamma-correct-ish)
var _id;try{_id=ctx.getImageData(0,0,w,h);}catch(e){callback(canvas);return;}var _d=_id.data;for(var i=0;i<_d.length;i+=4){var sr=_d[i]/255,sg=_d[i+1]/255,sb=_d[i+2]/255;var lr=sr<=0.04045?sr/12.92:Math.pow((sr+0.055)/1.055,2.4);var lg=sg<=0.04045?sg/12.92:Math.pow((sg+0.055)/1.055,2.4);var lb=sb<=0.04045?sb/12.92:Math.pow((sb+0.055)/1.055,2.4);var Y=0.2126*lr+0.7152*lg+0.0722*lb;_d[i]=0;_d[i+1]=0;_d[i+2]=0;_d[i+3]=Math.round((1-Math.min(1,Y))*255);}ctx.putImageData(_id,0,0);callback(canvas);return;}if(!layerColor){callback(canvas);return;}// --- White->transparent soft mask, then recolor ---
// (This preserves anti-aliased edges and makes the tile repeat cleanly.)
var id;try{id=ctx.getImageData(0,0,w,h);}catch(e){callback(canvas);return;}var d=id.data;// thresholds in linear space: t0 ~ start fading whites; t1 ~ full ink
var t0=0.80;// near-white
var t1=0.30;// darker = fully opaque
var smoothstep=function smoothstep(x){return x<=0?0:x>=1?1:x*x*(3-2*x);};for(var _i5=0;_i5<d.length;_i5+=4){var _sr=d[_i5]/255,_sg=d[_i5+1]/255,_sb=d[_i5+2]/255;var _lr=_sr<=0.04045?_sr/12.92:Math.pow((_sr+0.055)/1.055,2.4);var _lg=_sg<=0.04045?_sg/12.92:Math.pow((_sg+0.055)/1.055,2.4);var _lb=_sb<=0.04045?_sb/12.92:Math.pow((_sb+0.055)/1.055,2.4);var L=0.2126*_lr+0.7152*_lg+0.0722*_lb;// mask: 0 at white (>=t0), 1 at ink (<=t1), smooth in-between
var x=(t0-L)/(t0-t1);var m=smoothstep(Math.max(0,Math.min(1,x)));d[_i5+3]=Math.round(255*m);// keep RGB; alpha becomes the mask
}ctx.putImageData(id,0,0);// Recolor using compositing over the new soft mask
ctx.globalCompositeOperation="source-in";ctx.fillStyle=layerColor;ctx.fillRect(0,0,w,h);ctx.globalCompositeOperation="source-over";callback(canvas);};img.onerror=function(){return console.error("Canvas image load failed: ".concat(url));};};// GUARD / TRACE WRAPPER
if(USE_GUARD&&DEBUG_TRACE){processImage=guard(traceWrapper(processImage,"processImage"));// Wrapped for debugging
}else if(USE_GUARD){processImage=guard(processImage,"processImage");// Wrapped for debugging
}// Load pattern data from JSON
function loadPatternData(_x9,_x0){return _loadPatternData.apply(this,arguments);}// GUARD / TRACE WRAPPER
function _loadPatternData(){_loadPatternData=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee19(collection,patternId){var pattern,_appState$currentPatt30,_appState$currentPatt31,_appState$currentPatt32,_appState$currentPatt33,_appState$selectedCol57,_appState$selectedCol58,_appState$currentPatt34,_appState$currentLaye18,_appState$currentLaye19,_collection$curatedCo,_appState$currentPatt35,_appState$selectedCol60,_appState$selectedCol61,_appState$selectedCol62,variantCollection,variantType,_isFurnitureMode6,_isClothingMode4,baseName,variantSuffix,variantSuffixHyphen,variantNames,_variantCollection$pa2,_variantCollection$pa3,variantPattern,clonedMockupLayers,isFurnitureSimpleMode,roomMockupDiv,isClothingCollection,_appState$selectedCol59,isSimpleMode,_roomMockupDiv,scaleControls,scaleDescription,allHeadings,coordinatesContainer,allH3s,_isSimpleMode2,_isFurnitureSimpleMode3,canvasElement,zoomControls,createZoomButton,zoomOutBtn,zoomInBtn,resetBtn,isPanning,startX,startY,currentPanX,currentPanY,backButton,savedZoomScale,existingCanvas,savedScaleMultiplier,savedColorBuffer,isFurnitureModeRestore,isClothingModeRestore,isFurniturePattern,isClothingMode,hasFurSuffix,isFurnitureMode,isFurnitureCollectionForRender,isFurnitureModeScale;return _regenerator().w(function(_context28){while(1)switch(_context28.n){case 0:console.log("loadPatternData: patternId=".concat(patternId));// Check slug, id, and name for backwards compatibility
pattern=collection.patterns.find(function(p){return p.slug===patternId||p.id===patternId||p.name===patternId;});if(!pattern){_context28.n=20;break;}console.log("\u2705 Found pattern \"".concat(pattern.name,"\" (ID: ").concat(pattern.id,") in collection \"").concat(collection.name,"\""));// ✅ NEW ARCHITECTURE: Look up mockupLayers from variant collection if available
// We're always using base collections now, but need mode-specific mockupLayers
variantCollection=collection._variantCollection;variantType=collection._variantType;// ✅ CRITICAL FIX FOR STANDARD FURNITURE MODE: If _variantCollection is not set,
// try to find the furniture variant collection from allCollections
if(!variantCollection&&appState.allCollections){_isFurnitureMode6=window.COLORFLEX_MODE==='FURNITURE'||appState.isInFurnitureMode;_isClothingMode4=window.COLORFLEX_MODE==='CLOTHING'||appState.isInClothingMode;if(_isFurnitureMode6||_isClothingMode4){// Try to find variant collection by appending .fur/.clo or -fur/-clo to base collection name
baseName=collection.name;variantSuffix=_isFurnitureMode6?'.fur':'.clo';variantSuffixHyphen=_isFurnitureMode6?'-fur':'-clo';// Try multiple naming formats
variantNames=[baseName+variantSuffix,// bombay.clo
baseName+variantSuffixHyphen,// bombay-clo
baseName+variantSuffix+'-1',// bombay.clo-1 (backwards compat)
baseName+variantSuffixHyphen+'-1'// bombay-clo-1 (backwards compat)
];console.log("\uD83D\uDD04 Looking for variant collection in allCollections (trying: ".concat(variantNames.join(', '),")..."));variantCollection=appState.allCollections.find(function(c){return c&&c.name&&variantNames.some(function(variantName){return c.name===variantName||c.name.toLowerCase()===variantName.toLowerCase();});});if(variantCollection){console.log("\u2705 Found variant collection \"".concat(variantCollection.name,"\" for base \"").concat(baseName,"\""));variantType=_isFurnitureMode6?'furniture':'clothing';}else{console.log("  \u2139\uFE0F No variant collection found for \"".concat(baseName,"\" (tried: ").concat(variantName,")"));}}}if(variantCollection&&appState.allCollections){console.log("\uD83D\uDD04 Looking up ".concat(variantType," mockupLayers from variant collection \"").concat(variantCollection.name,"\""));// Find matching pattern in variant collection
// ✅ DEBUG: Log what we're searching for
console.log("\uD83D\uDD0D Pattern matching DEBUG:");console.log("  Base pattern: name=\"".concat(pattern.name,"\", id=\"").concat(pattern.id,"\", slug=\"").concat(pattern.slug,"\""));console.log("  Variant collection \"".concat(variantCollection.name,"\" has ").concat(((_variantCollection$pa2=variantCollection.patterns)===null||_variantCollection$pa2===void 0?void 0:_variantCollection$pa2.length)||0," patterns"));variantPattern=(_variantCollection$pa3=variantCollection.patterns)===null||_variantCollection$pa3===void 0?void 0:_variantCollection$pa3.find(function(p){var matchBySlug=p.slug===pattern.slug;var matchById=p.id===pattern.id;var matchByName=p.name===pattern.name;var matchByNameLower=p.name.toLowerCase()===pattern.name.toLowerCase();if(matchBySlug||matchById||matchByName||matchByNameLower){console.log("  \u2705 MATCH FOUND: variant pattern \"".concat(p.name,"\" (id=\"").concat(p.id,"\", slug=\"").concat(p.slug,"\")"));console.log("     Match by slug: ".concat(matchBySlug,", by id: ").concat(matchById,", by name: ").concat(matchByName,", by nameLower: ").concat(matchByNameLower));return true;}return false;});if(variantPattern&&variantPattern.mockupLayers){console.log("\u2705 Found ".concat(variantType," mockupLayers for pattern \"").concat(pattern.name,"\""));console.log("  Variant pattern name: \"".concat(variantPattern.name,"\""));console.log("  Variant pattern id: \"".concat(variantPattern.id,"\""));console.log("  mockupLayers type: ".concat(_typeof(variantPattern.mockupLayers),", isArray: ").concat(Array.isArray(variantPattern.mockupLayers)));// ✅ CRITICAL FIX: Deep clone mockupLayers to prevent reference sharing
// If mockupLayers is an object (multi-res format), deep clone it
// If it's an array (standard format), clone the array
if(Array.isArray(variantPattern.mockupLayers)){clonedMockupLayers=JSON.parse(JSON.stringify(variantPattern.mockupLayers));}else if(_typeof(variantPattern.mockupLayers)==='object'){clonedMockupLayers=JSON.parse(JSON.stringify(variantPattern.mockupLayers));}else{clonedMockupLayers=variantPattern.mockupLayers;}console.log("  \u2705 Cloned mockupLayers to prevent reference sharing");// Merge: keep base pattern's layers, but use variant's mockupLayers (cloned)
pattern=_objectSpread(_objectSpread({},pattern),{},{// Keep base pattern properties (layers, layerLabels, etc.)
mockupLayers:clonedMockupLayers// Use cloned variant's mockupLayers
});}else{// ✅ CRITICAL FIX: If variant pattern not found, set mockupLayers to empty array
// This allows updateFurniturePreview() to construct paths dynamically
// Don't leave it undefined, as that can cause issues
console.log("  \u2139\uFE0F No ".concat(variantType," mockupLayers found for pattern \"").concat(pattern.name,"\" - will construct dynamically"));pattern=_objectSpread(_objectSpread({},pattern),{},{mockupLayers:[]// Empty array signals to construct paths dynamically
});}}else if((window.COLORFLEX_MODE==='FURNITURE'||appState.isInFurnitureMode)&&!pattern.mockupLayers){// ✅ FURNITURE MODE: If no variant collection found and no mockupLayers, set to empty array
// This ensures updateFurniturePreview() will construct paths dynamically
console.log("  \u2139\uFE0F Furniture mode: No variant collection or mockupLayers - will construct paths dynamically");pattern=_objectSpread(_objectSpread({},pattern),{},{mockupLayers:[]// Empty array signals to construct paths dynamically
});}appState.currentPattern=pattern;// ===== INSERT DEBUG LOGS HERE =====
console.log("🔍 SOURCE DATA DEBUG:");console.log("  Current pattern:",(_appState$currentPatt30=appState.currentPattern)===null||_appState$currentPatt30===void 0?void 0:_appState$currentPatt30.name);console.log("  Designer colors:",(_appState$currentPatt31=appState.currentPattern)===null||_appState$currentPatt31===void 0?void 0:_appState$currentPatt31.designer_colors);console.log("  Layer labels:",(_appState$currentPatt32=appState.currentPattern)===null||_appState$currentPatt32===void 0?void 0:_appState$currentPatt32.layerLabels);console.log("  Layers array:",(_appState$currentPatt33=appState.currentPattern)===null||_appState$currentPatt33===void 0||(_appState$currentPatt33=_appState$currentPatt33.layers)===null||_appState$currentPatt33===void 0?void 0:_appState$currentPatt33.map(function(l,i){var _l$path;return"".concat(i,": ").concat((_l$path=l.path)===null||_l$path===void 0?void 0:_l$path.split('/').pop());}));// ✅ FIX: Set container size for furniture simple mode BEFORE clothing check
// This ensures furniture collections get 800x600 even if they're not clothing collections
isFurnitureSimpleMode=window.COLORFLEX_SIMPLE_MODE===true&&window.COLORFLEX_MODE==='FURNITURE';roomMockupDiv=document.getElementById('roomMockup');if(isFurnitureSimpleMode&&roomMockupDiv){roomMockupDiv.style.removeProperty('--mockup-width');roomMockupDiv.style.setProperty('width','800px','important');roomMockupDiv.style.setProperty('height','600px','important');roomMockupDiv.style.setProperty('max-width','800px','important');roomMockupDiv.style.setProperty('min-width','800px','important');console.log('✅ Furniture simple mode: Set container to 800×600 in loadPatternData');}// Check if this is a clothing collection (needs fabric mode)
isClothingCollection=((_appState$selectedCol57=appState.selectedCollection)===null||_appState$selectedCol57===void 0||(_appState$selectedCol57=_appState$selectedCol57.name)===null||_appState$selectedCol57===void 0?void 0:_appState$selectedCol57.includes('-clo'))||((_appState$selectedCol58=appState.selectedCollection)===null||_appState$selectedCol58===void 0||(_appState$selectedCol58=_appState$selectedCol58.name)===null||_appState$selectedCol58===void 0?void 0:_appState$selectedCol58.includes('.clo-'));if(isClothingCollection){appState.isInFabricMode=true;console.log("\u2705 Auto-enabled fabric mode for clothing collection: ".concat((_appState$selectedCol59=appState.selectedCollection)===null||_appState$selectedCol59===void 0?void 0:_appState$selectedCol59.name));// ✅ SIMPLE MODE: Skip UI modifications - let template CSS handle it
isSimpleMode=window.COLORFLEX_SIMPLE_MODE===true;// Declare roomMockupDiv OUTSIDE the if/else so it's available for zoom controls below
_roomMockupDiv=document.getElementById('roomMockup');if(isSimpleMode){console.log('✅ Simple mode: Skipping roomMockup style overrides (template CSS handles styling)');}else{// Modify UI for clothing collections (non-simple mode only)
console.log("\uD83D\uDC57 Applying clothing collection UI modifications...");// SHOW scale controls for multi-scale clothing collections
scaleControls=document.getElementById('scaleControls');if(scaleControls){scaleControls.style.display='flex';// Use flex for horizontal layout
console.log('✅ Showing scale controls for multi-scale clothing');}// SHOW scale description text for clothing
scaleDescription=scaleControls===null||scaleControls===void 0?void 0:scaleControls.nextElementSibling;if(scaleDescription&&scaleDescription.tagName==='P'){scaleDescription.style.display='block';// Changed from 'none' to 'block'
console.log('✅ Showing scale description');}// Hide coordinates section - check ALL h3 elements
allHeadings=document.querySelectorAll('h3');allHeadings.forEach(function(heading){if(heading.textContent.includes('Matching Coordinates')){heading.style.display='none';console.log('✅ Hidden coordinates heading');}});coordinatesContainer=document.getElementById('coordinatesContainer');if(coordinatesContainer){coordinatesContainer.style.display='none';// Also hide the parent div that contains both heading and container
if(coordinatesContainer.parentElement){coordinatesContainer.parentElement.style.display='none';}console.log('✅ Hidden coordinates container and parent');}// No scaling for clothing - just set canvas size
// Removed clothingRenderScale - all layers drawn at canvas size for simplicity
// Change heading from "Room Mockup Preview" to "Clothing Mockup Preview"
allH3s=document.querySelectorAll('h3');allH3s.forEach(function(heading){if(heading.textContent.includes('Room Mockup')){heading.textContent='Clothing Mockup Preview';console.log('✅ Changed heading to "Clothing Mockup Preview"');}});// Create viewport window: canvas renders at full 4K, div crops to 600×700
// ✅ FIX: Don't override size in furniture simple mode - let CSS handle it
_isSimpleMode2=window.COLORFLEX_SIMPLE_MODE===true;_isFurnitureSimpleMode3=_isSimpleMode2&&window.COLORFLEX_MODE==='FURNITURE';// Use setProperty with !important to override inline styles from Liquid template
if(_roomMockupDiv){if(_isFurnitureSimpleMode3){// ✅ FIX: Furniture simple mode should stay 800x600 with visible overflow to show full couch
_roomMockupDiv.style.removeProperty('--mockup-width');_roomMockupDiv.style.setProperty('width','800px','important');_roomMockupDiv.style.setProperty('height','600px','important');_roomMockupDiv.style.setProperty('overflow','visible','important');// Show full couch
_roomMockupDiv.style.setProperty('max-width','800px','important');_roomMockupDiv.style.setProperty('min-width','800px','important');console.log('✅ Furniture simple mode: Set container to 800×600 with visible overflow');}else{_roomMockupDiv.style.setProperty('width','600px','important');_roomMockupDiv.style.setProperty('height','700px','important');_roomMockupDiv.style.setProperty('overflow','hidden','important');console.log('✅ Set viewport window: 600×700 with overflow:hidden (crops 4K canvas)');}_roomMockupDiv.style.setProperty('position','relative','important');_roomMockupDiv.style.setProperty('background-color','#1a202c','important');_roomMockupDiv.style.setProperty('display','flex','important');_roomMockupDiv.style.setProperty('align-items','center','important');_roomMockupDiv.style.setProperty('justify-content','center','important');// Ensure canvas itself has NO size constraints - renders at native 4K
canvasElement=_roomMockupDiv===null||_roomMockupDiv===void 0?void 0:_roomMockupDiv.querySelector('canvas');if(canvasElement){canvasElement.style.setProperty('width','auto','important');canvasElement.style.setProperty('height','auto','important');canvasElement.style.setProperty('max-width','none','important');canvasElement.style.setProperty('max-height','none','important');console.log('✅ Canvas will render at full 4K resolution (not scaled)');}}}// Add zoom controls for clothing mockup (works in both simple and non-simple mode)
if(_roomMockupDiv){addClothingZoomControls(_roomMockupDiv);}// Legacy code block - keeping for reference but now using addClothingZoomControls() function
if(false)// removed by dead control flow
{}// Remove "Back to Pattern" button for clothing mode
backButton=document.getElementById('backToPatternsBtn');if(backButton){backButton.remove();console.log('✅ Removed "Back to Pattern" button for clothing mode');}console.log('👗 Clothing collection UI modifications complete');}// ✅ Save current zoom level for clothing mockup (BEFORE pattern switch)
// Use clothing default (0.7) instead of 1.0 for initial zoom
savedZoomScale=CLOTHING_ZOOM_DEFAULTS.defaultScale;existingCanvas=document.querySelector('#roomMockup canvas');console.log("\uD83D\uDD0D Zoom persistence: Looking for existing canvas...",existingCanvas?'FOUND':'NOT FOUND');if(existingCanvas){console.log("\uD83D\uDD0D Zoom persistence: Canvas zoomScale dataset:",existingCanvas.dataset.zoomScale);}if(existingCanvas&&existingCanvas.dataset.zoomScale){savedZoomScale=parseFloat(existingCanvas.dataset.zoomScale);console.log("\uD83D\uDD0D Zoom persistence: \u2705 Saved zoom level: ".concat(savedZoomScale*100,"%"));}else{console.log("\uD83D\uDD0D Zoom persistence: Using default zoom (".concat(CLOTHING_ZOOM_DEFAULTS.defaultScale*100,"%)"));}// ✅ Save current scale (BEFORE populateLayerInputs rebuilds everything)
savedScaleMultiplier=appState.scaleMultiplier||1;console.log("\uD83D\uDD0D Scale persistence: Saved current scale multiplier: ".concat(savedScaleMultiplier));console.log("\uD83D\uDD0D Scale persistence: Current pattern being switched FROM: ".concat(((_appState$currentPatt34=appState.currentPattern)===null||_appState$currentPatt34===void 0?void 0:_appState$currentPatt34.name)||'none'));// ✅ Save current colors if lock is enabled (BEFORE populateLayerInputs rebuilds everything)
savedColorBuffer=null;if(appState.colorsLocked&&appState.layerInputs&&appState.layerInputs.length>0){savedColorBuffer=appState.layerInputs.map(function(layer){return layer.input.value;});console.log('🔒 Color lock: Saved color buffer:',savedColorBuffer);}// ✅ Build layer + input models once pattern is set
populateLayerInputs(pattern);// ✅ Restore saved colors if lock is enabled (AFTER populateLayerInputs builds new UI)
if(!(appState.colorsLocked&&savedColorBuffer&&savedColorBuffer.length>0)){_context28.n=7;break;}console.log('🔒 Color lock: Restoring colors from buffer to',appState.layerInputs.length,'layers');appState.layerInputs.forEach(function(layer,index){// Cycle through saved colors if new pattern has more layers
var colorIndex=index%savedColorBuffer.length;var savedColor=savedColorBuffer[colorIndex];// Update the input field
layer.input.value=savedColor;// Update the color circle
var hex=lookupColor(savedColor)||"#FFFFFF";layer.circle.style.backgroundColor=hex;// Update the currentLayers data
if(appState.currentLayers[index]){appState.currentLayers[index].color=savedColor;}console.log("  Restored layer ".concat(index," (").concat(layer.label,"): ").concat(savedColor," (cycling from buffer[").concat(colorIndex,"])"));});// Trigger preview update with new colors (check mode first)
updatePreview();// ✅ Check mode and call appropriate render function
isFurnitureModeRestore=window.COLORFLEX_MODE==='FURNITURE'||appState.isInFurnitureMode;isClothingModeRestore=window.COLORFLEX_MODE==='CLOTHING'||window.COLORFLEX_SIMPLE_MODE===true&&window.COLORFLEX_MODE!=='FURNITURE';if(!isFurnitureModeRestore){_context28.n=4;break;}console.log('🔒 Color lock restore: Calling updateFurniturePreview() for furniture mode');if(!(typeof updateFurniturePreview==='function')){_context28.n=2;break;}_context28.n=1;return updateFurniturePreview();case 1:_context28.n=3;break;case 2:console.error('❌ updateFurniturePreview not available!');case 3:_context28.n=7;break;case 4:if(!(appState.isInFabricMode||isClothingModeRestore)){_context28.n=6;break;}console.log('🔒 Color lock restore: Calling renderFabricMockup() for clothing/fabric mode');_context28.n=5;return renderFabricMockup();case 5:_context28.n=7;break;case 6:console.log('🔒 Color lock restore: Calling updateRoomMockup() for wallpaper mode');updateRoomMockup();case 7:// ✅ Restore saved scale (BEFORE final preview updates)
// This ensures the scale is set correctly before the main preview updates at the end
console.log("\uD83D\uDD0D Scale persistence: Restoring scale multiplier to ".concat(savedScaleMultiplier));appState.scaleMultiplier=savedScaleMultiplier;// Update currentScale for display consistency
if(savedScaleMultiplier===1){appState.currentScale=100;}else if(savedScaleMultiplier===0.5){appState.currentScale=200;}else if(savedScaleMultiplier===0.33){appState.currentScale=300;}else if(savedScaleMultiplier===0.25){appState.currentScale=400;}// Update scale button highlighting using setTimeout to ensure buttons exist
setTimeout(function(){var buttons=document.querySelectorAll("#scaleControls button");if(buttons.length===0){console.log('⚠️  Scale buttons not found yet - may be in clothing mode or hidden');return;}// Reset all buttons to inactive state
buttons.forEach(function(btn){btn.style.setProperty('background-color','#e2e8f0','important');btn.style.setProperty('color','#1a202c','important');btn.style.setProperty('font-weight','normal','important');});// Highlight the active scale button
var activeButtonIndex=-1;if(savedScaleMultiplier===1)activeButtonIndex=0;// Normal
else if(savedScaleMultiplier===0.5)activeButtonIndex=1;// 2X
else if(savedScaleMultiplier===0.33)activeButtonIndex=2;// 3X
else if(savedScaleMultiplier===0.25)activeButtonIndex=3;// 4X
if(activeButtonIndex>=0&&buttons[activeButtonIndex]){buttons[activeButtonIndex].style.setProperty('background-color','#d4af37','important');buttons[activeButtonIndex].style.setProperty('color','#1a202c','important');buttons[activeButtonIndex].style.setProperty('font-weight','bold','important');console.log("\uD83D\uDD0D Scale persistence: Highlighted button ".concat(activeButtonIndex," for scale ").concat(savedScaleMultiplier));}},50);// Small delay to ensure DOM is ready
// ===== DEBUG AFTER populateLayerInputs =====
console.log("🎛️ UI POPULATION DEBUG:");console.log("  currentLayers count:",(_appState$currentLaye18=appState.currentLayers)===null||_appState$currentLaye18===void 0?void 0:_appState$currentLaye18.length);console.log("  currentLayers content:");(_appState$currentLaye19=appState.currentLayers)===null||_appState$currentLaye19===void 0||_appState$currentLaye19.forEach(function(layer,index){console.log("    ".concat(index,": \"").concat(layer.label,"\" = \"").concat(layer.color,"\""));});// ===== DEBUG ACTUAL DOM INPUTS =====
setTimeout(function(){console.log("🔍 ACTUAL UI INPUTS:");var inputs=document.querySelectorAll('.layer-input');inputs.forEach(function(input,index){var _container$querySelec;var container=input.closest('.layer-input-container');var label=container===null||container===void 0||(_container$querySelec=container.querySelector('.layer-label'))===null||_container$querySelec===void 0?void 0:_container$querySelec.textContent;console.log("    UI Input ".concat(index,": \"").concat(label,"\" = \"").concat(input.value,"\""));});},100);// Small delay to ensure DOM is updated
console.log(">>> Updated appState.currentPattern:",JSON.stringify(pattern,null,2));appState.curatedColors=appState.selectedCollection.curatedColors||[];console.log(">>> Updated appState.curatedColors:",appState.curatedColors);if(!(!Array.isArray(appState.colorsData)||appState.colorsData.length===0)){_context28.n=8;break;}console.warn("🛑 Sherwin-Williams colors not loaded yet. Delaying populateCuratedColors.");return _context28.a(2);case 8:// ✅ Only call curated color population when everything is ready
if(appState.colorsData.length&&(_collection$curatedCo=collection.curatedColors)!==null&&_collection$curatedCo!==void 0&&_collection$curatedCo.length){appState.curatedColors=collection.curatedColors;populateCuratedColors(appState.curatedColors);}else{console.warn("X Not populating curated colors - missing data");}isFurniturePattern=((_appState$currentPatt35=appState.currentPattern)===null||_appState$currentPatt35===void 0?void 0:_appState$currentPatt35.isFurniture)||false;// Store savedZoomScale in appState so renderFabricMockup can access it
appState.savedZoomScale=savedZoomScale;console.log("\uD83D\uDD0D Scale persistence: About to render with scale: ".concat(appState.scaleMultiplier));updatePreview();// ✅ CLOTHING MODE DETECTION: Check both collection name AND window.COLORFLEX_MODE
// Standard clothing page uses base collections without -clo suffix, so we must check window.COLORFLEX_MODE
isClothingMode=window.COLORFLEX_MODE==='CLOTHING'||((_appState$selectedCol60=appState.selectedCollection)===null||_appState$selectedCol60===void 0||(_appState$selectedCol60=_appState$selectedCol60.name)===null||_appState$selectedCol60===void 0?void 0:_appState$selectedCol60.includes('-clo'))||((_appState$selectedCol61=appState.selectedCollection)===null||_appState$selectedCol61===void 0||(_appState$selectedCol61=_appState$selectedCol61.name)===null||_appState$selectedCol61===void 0?void 0:_appState$selectedCol61.includes('.clo-'));// ✅ FURNITURE DETECTION: Use same logic as updateRoomMockup() for consistency
// Check both .fur- in name AND furniture mode flags (some collections might not have .fur- suffix)
hasFurSuffix=(_appState$selectedCol62=appState.selectedCollection)===null||_appState$selectedCol62===void 0||(_appState$selectedCol62=_appState$selectedCol62.name)===null||_appState$selectedCol62===void 0?void 0:_appState$selectedCol62.includes('.fur-');isFurnitureMode=appState.isInFurnitureMode||window.COLORFLEX_MODE==='FURNITURE';isFurnitureCollectionForRender=hasFurSuffix||isFurnitureMode&&appState.furnitureConfig&&appState.selectedFurnitureType;// ✅ FURNITURE MODE: Use updateFurniturePreview() (NOT renderFabricMockup)
if(!isFurnitureCollectionForRender){_context28.n=12;break;}console.log("🪑 loadPatternData in furniture mode - calling updateFurniturePreview()");console.log("🪑 Furniture detection:",{hasFurSuffix:hasFurSuffix,isFurnitureMode:isFurnitureMode,hasConfig:!!appState.furnitureConfig,hasType:!!appState.selectedFurnitureType});if(!(typeof updateFurniturePreview==='function')){_context28.n=10;break;}_context28.n=9;return updateFurniturePreview();case 9:_context28.n=11;break;case 10:console.error("❌ updateFurniturePreview function not found!");case 11:_context28.n=19;break;case 12:if(!(appState.isInFabricMode||isClothingMode)){_context28.n=14;break;}// ✅ FABRIC/CLOTHING MODE: Use renderFabricMockup()
if(isClothingMode){console.log("👗 loadPatternData in clothing mode - calling renderFabricMockup() for avatar");}else{console.log("🧵 loadPatternData in fabric mode - calling renderFabricMockup()");}_context28.n=13;return renderFabricMockup();case 13:_context28.n=19;break;case 14:// ✅ Check mode and call appropriate render function
isFurnitureModeScale=window.COLORFLEX_MODE==='FURNITURE'||appState.isInFurnitureMode;if(!isFurnitureModeScale){_context28.n=18;break;}console.log("\uD83D\uDD0D Scale persistence: Calling updateFurniturePreview() with scale: ".concat(appState.scaleMultiplier));if(!(typeof updateFurniturePreview==='function')){_context28.n=16;break;}_context28.n=15;return updateFurniturePreview();case 15:_context28.n=17;break;case 16:console.error('❌ updateFurniturePreview not available!');case 17:_context28.n=19;break;case 18:console.log("\uD83D\uDD0D Scale persistence: Calling updateRoomMockup() with scale: ".concat(appState.scaleMultiplier));updateRoomMockup();case 19:// ✅ Only populate coordinates for wallpaper mode (skip clothing/furniture)
if(window.COLORFLEX_MODE!=='CLOTHING'&&window.COLORFLEX_MODE!=='FURNITURE'){populateCoordinates();}_context28.n=21;break;case 20:console.error(">>> Pattern not found:",patternId);case 21:return _context28.a(2);}},_callee19);}));return _loadPatternData.apply(this,arguments);}if(USE_GUARD&&DEBUG_TRACE){loadPatternData=guard(traceWrapper(loadPatternData,"loadPatternData"));// Wrapped for debugging
}else if(USE_GUARD){loadPatternData=guard(loadPatternData,"loadPatternData");// Wrapped for debugging
}// Pattern scaling
window.setPatternScale=/*#__PURE__*/function(){var _ref11=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(multiplier){var _appState$currentPatt1;var isFurniturePattern;return _regenerator().w(function(_context5){while(1)switch(_context5.n){case 0:console.log("\uD83D\uDD0D setPatternScale called with multiplier: ".concat(multiplier));console.log("\uD83D\uDD0D Previous scale multiplier: ".concat(appState.scaleMultiplier));appState.scaleMultiplier=multiplier;// 🎯 FIX: Update currentScale to reflect actual scale percentage
// Convert scaleMultiplier to percentage for consistent scale display
if(multiplier===1){appState.currentScale=100;// Normal = 100%
}else if(multiplier===0.5){appState.currentScale=200;// 2X = 200%
}else if(Math.abs(multiplier-1/3)<0.0001){appState.currentScale=300;// 3X = 300% (precise 1/3)
}else if(multiplier===0.25){appState.currentScale=400;// 4X = 400%
}else if(multiplier===2){appState.currentScale=50;// 0.5X = 50%
}else{// For any other values, calculate percentage
appState.currentScale=Math.round(100/multiplier);}console.log(">>> Scale updated - multiplier: ".concat(appState.scaleMultiplier,", currentScale: ").concat(appState.currentScale,"%"));// Highlight active button with setProperty to override inline !important styles
document.querySelectorAll('button[data-multiplier]').forEach(function(btn){var btnMultiplier=parseFloat(btn.dataset.multiplier);if(btnMultiplier===multiplier){// Active state - gold highlighting
btn.style.setProperty('background-color','#d4af37','important');btn.style.setProperty('color','#1a202c','important');btn.style.setProperty('font-weight','bold','important');console.log('🎯 Highlighted scale button:',btn.textContent,'with multiplier:',btnMultiplier);}else{// Inactive state - default styling
btn.style.setProperty('background-color','#e2e8f0','important');btn.style.setProperty('color','#1a202c','important');btn.style.setProperty('font-weight','normal','important');}});// Check if we're in fabric mode - if so, only render fabric mockup
if(!appState.isInFabricMode){_context5.n=2;break;}console.log("🧵 setPatternScale in fabric mode - calling renderFabricMockup()");_context5.n=1;return renderFabricMockup();case 1:_context5.n=3;break;case 2:// Update both pattern preview and room mockup for scale changes
updatePreview();updateRoomMockup();case 3:isFurniturePattern=((_appState$currentPatt1=appState.currentPattern)===null||_appState$currentPatt1===void 0?void 0:_appState$currentPatt1.isFurniture)||false;case 4:return _context5.a(2);}},_callee5);}));return function(_x1){return _ref11.apply(this,arguments);};}();// GUARD / TRACE WRAPPER
if(USE_GUARD&&DEBUG_TRACE){setPatternScale=guard(traceWrapper(setPatternScale,"setPatternScale"));// Wrapped for debugging
}else if(USE_GUARD){setPatternScale=guard(setPatternScale,"setPatternScale");// Wrapped for debugging
}// Initialize scale on page load
document.addEventListener('DOMContentLoaded',function(){appState.scaleMultiplier=1;// Default to Normal
setPatternScale(1);console.log('setPatternScale called with multiplier:',appState.scaleMultiplier);});// Ensure updatePreview is defined before updateDisplays uses it
// ============================================================================
// SECTION 8: CORE RENDERING SYSTEM
// ============================================================================
// Layer model building, image loading, canvas rendering (updatePreview,
// updateRoomMockup). This section handles all pattern visualization.
// ============================================================================
// buildLayerModel - Returns a flat array of layer objects for rendering
function buildLayerModel(pattern){var designerColors=arguments.length>1&&arguments[1]!==undefined?arguments[1]:[];var options=arguments.length>2&&arguments[2]!==undefined?arguments[2]:{};var _options$isWallPanel=options.isWallPanel,isWallPanel=_options$isWallPanel===void 0?false:_options$isWallPanel,_options$tintWhite=options.tintWhite,tintWhite=_options$tintWhite===void 0?false:_options$tintWhite;var patternLayers=pattern.layers||[];var layerLabels=pattern.layerLabels||[];console.log("🏗️ buildLayerModel LABEL FIX DEBUG:");console.log("  Pattern layers:",patternLayers.length);console.log("  Layer labels:",layerLabels);console.log("  Designer colors available:",designerColors.length);var colorIndex=0;var inputIndex=0;var allLayers=[];// Check if this is a furniture collection
// ✅ CRITICAL: Check both appState.isInFurnitureMode AND window.COLORFLEX_MODE for standard furniture page
console.log("🔍 FURNITURE DETECTION DEBUG:");console.log("  appState.isInFurnitureMode:",appState.isInFurnitureMode);console.log("  window.COLORFLEX_MODE:",window.COLORFLEX_MODE);console.log("  window.location.pathname:",window.location.pathname);console.log("  selectedFurnitureType:",appState.selectedFurnitureType);console.log("  furnitureConfig available:",appState.furnitureConfig?Object.keys(appState.furnitureConfig):'null');// ✅ FIX: Check multiple conditions to detect furniture mode
var isFurnitureMode=appState.isInFurnitureMode||window.COLORFLEX_MODE==='FURNITURE'||window.location.pathname.includes('furniture');// ✅ CRITICAL: Initialize selectedFurnitureType if not set (for standard furniture page)
if(isFurnitureMode&&!appState.selectedFurnitureType){appState.selectedFurnitureType=window.FURNITURE_DEFAULT_TYPE||'Sofa-Capitol';console.log("  \uD83D\uDD27 Initialized selectedFurnitureType to: ".concat(appState.selectedFurnitureType));}var isFurnitureCollection=isFurnitureMode&&appState.furnitureConfig&&appState.selectedFurnitureType;console.log("  isFurnitureMode result:",isFurnitureMode);console.log("  isFurnitureCollection result:",isFurnitureCollection);if(isFurnitureCollection){// Check if we're in simple furniture mode (extraordinary-color-furniture page)
var isSimpleFurnitureMode=window.COLORFLEX_SIMPLE_MODE===true&&window.COLORFLEX_MODE==='FURNITURE';// For simple furniture mode, get layer 1's color (first pattern layer)
// BG/Sofa Base will use designerColors[0], so layer 1 will use designerColors[1]
var defaultWallColor;if(isSimpleFurnitureMode){// Get the color that will be assigned to the first pattern layer (layer 1)
// After BG/Sofa Base takes designerColors[0], layer 1 gets designerColors[1]
var layer1Color=designerColors.length>1?designerColors[1]:designerColors[0]||"SW7006 Extra White";defaultWallColor=layer1Color;console.log("  \uD83C\uDFA8 Simple furniture mode: Using layer 1 color for wall: ".concat(defaultWallColor));}else{var _appState$selectedCol29,_appState$furnitureCo,_appState$selectedCol30;// Standard furniture mode: use config or default
var collectionFurnitureConfig=(_appState$selectedCol29=appState.selectedCollection)===null||_appState$selectedCol29===void 0?void 0:_appState$selectedCol29.furnitureConfig;var furnitureType=appState.selectedFurnitureType||'Sofa-Capitol';var furnitureConfigKey=furnitureType==='Sofa-Capitol'?'furniture':'furniture-kite';var furniturePieceConfig=(_appState$furnitureCo=appState.furnitureConfig)===null||_appState$furnitureCo===void 0?void 0:_appState$furnitureCo[furnitureConfigKey];// ✅ DEBUG: Log what we're finding
console.log("\uD83D\uDD0D DEBUG: Looking for defaultWallColor");console.log("  Collection name: ".concat((_appState$selectedCol30=appState.selectedCollection)===null||_appState$selectedCol30===void 0?void 0:_appState$selectedCol30.name));console.log("  Collection object keys:",appState.selectedCollection?Object.keys(appState.selectedCollection):'null');console.log("  Collection furnitureConfig:",collectionFurnitureConfig);console.log("  Furniture piece config (".concat(furnitureConfigKey,"):"),furniturePieceConfig);// Priority: collection.furnitureConfig.defaultWallColor > furniture piece config > default
defaultWallColor=(collectionFurnitureConfig===null||collectionFurnitureConfig===void 0?void 0:collectionFurnitureConfig.defaultWallColor)||(furniturePieceConfig===null||furniturePieceConfig===void 0?void 0:furniturePieceConfig.defaultWallColor)||"SW7006 Extra White";}console.log("  \u2705 Selected defaultWallColor: ".concat(defaultWallColor));allLayers.push({label:"Wall Color",color:defaultWallColor,path:null,isBackground:true,// ✅ Fixed: Wall Color should be a colored square, not image
isShadow:false,isWallPanel:false,inputId:"layer-".concat(inputIndex++)});console.log("  \u2705 Added Wall Color (default): ".concat(defaultWallColor));// Add sofa base layer  
allLayers.push({label:"BG/Sofa Base",color:designerColors[colorIndex++]||"Snowbound",path:null,isBackground:true,isShadow:false,isWallPanel:false,inputId:"layer-".concat(inputIndex++)});console.log("  \u2705 Added BG/Sofa Base (designer color ".concat(colorIndex-1,")"));}else{// Standard collection - just background
allLayers.push({label:"Background",color:designerColors[colorIndex++]||"Snowbound",path:null,isBackground:true,isShadow:false,isWallPanel:false,inputId:"layer-".concat(inputIndex++)});}// ✅ PATTERN LAYERS (shared by both furniture and standard)
console.log("  🎨 Processing pattern layers:");var patternLabelIndex=0;for(var i=0;i<patternLayers.length;i++){var layer=patternLayers[i];var isTrueShadow=layer.isShadow===true;if(!isTrueShadow){var originalLabel=layerLabels[patternLabelIndex]||"Pattern Layer ".concat(patternLabelIndex+1);var layerObj={label:originalLabel,color:designerColors[colorIndex++]||"Snowbound",path:layer.path||"",isBackground:false,isShadow:false,isWallPanel:false,tintWhite:tintWhite,inputId:"layer-".concat(inputIndex++),patternLayerIndex:i};allLayers.push(layerObj);console.log("    \u2705 Added pattern layer: \"".concat(originalLabel,"\" (designer color ").concat(colorIndex-1,")"));patternLabelIndex++;}else{// Shadow layers (no input needed)
var _layerObj={label:"Shadow ".concat(i+1),color:null,path:layer.path||"",isBackground:false,isShadow:true,isWallPanel:false,tintWhite:tintWhite,inputId:null,patternLayerIndex:i};allLayers.push(_layerObj);console.log("    \u2705 Added shadow layer: \"Shadow ".concat(i+1,"\" (no color index used)"));}}// ✅ ADD EXTRAS/PILLOWS INPUT AT THE END (furniture collections only)
if(isFurnitureCollection){// Check if we're in simple furniture mode (extraordinary-color-furniture page)
var _isSimpleFurnitureMode=window.COLORFLEX_SIMPLE_MODE===true&&window.COLORFLEX_MODE==='FURNITURE';var extrasColor;if(_isSimpleFurnitureMode){// For simple furniture mode, use layer 1's color (same as wall color)
// BG/Sofa Base uses designerColors[0], layer 1 uses designerColors[1]
extrasColor=designerColors.length>1?designerColors[1]:designerColors[0]||"SW7006 Extra White";console.log("  \uD83C\uDFA8 Simple furniture mode: Using layer 1 color for extras/pillows: ".concat(extrasColor));}else{// Standard furniture mode: use next available color
extrasColor=designerColors[colorIndex++]||"SW7006 Extra White";}allLayers.push({label:"Extras/Pillows",color:extrasColor,path:null,isBackground:false,isShadow:false,isWallPanel:false,isExtras:true,// Flag to identify this layer
inputId:"layer-".concat(inputIndex++)});console.log("  \u2705 Added Extras/Pillows layer with color: ".concat(extrasColor));}console.log("\uD83C\uDFD7\uFE0F Final layer model (used ".concat(colorIndex," designer colors):"));allLayers.forEach(function(layer,index){var type=layer.isBackground?'bg':layer.isShadow?'shadow':layer.isExtras?'extras':'layer';console.log("  ".concat(index,": ").concat(layer.label," (").concat(type,") = ").concat(layer.color||'no color'));});// VALIDATION: Check counts
var inputLayers=allLayers.filter(function(l){return!l.isShadow;});console.log("\u2705 Created ".concat(inputLayers.length," input layers, used ").concat(colorIndex," designer colors"));if(designerColors.length<colorIndex){console.warn("\u26A0\uFE0F Not enough designer colors: need ".concat(colorIndex,", have ").concat(designerColors.length));}// Add this at the very end of buildLayerModel(), just before the return statement
console.log("\uD83C\uDFD7\uFE0F FINAL LAYER MODEL DEBUG:");console.log("  Total layers created: ".concat(allLayers.length));console.log("  isFurnitureCollection was: ".concat(isFurnitureCollection));console.log("  Used ".concat(colorIndex," designer colors"));console.log("  Final layer structure:");allLayers.forEach(function(layer,index){var type=layer.isBackground?'bg':layer.isShadow?'shadow':'input';console.log("    ".concat(index,": \"").concat(layer.label,"\" (").concat(type,") = \"").concat(layer.color,"\" | inputId: ").concat(layer.inputId));});return allLayers;}// ✅ Wrap in an IIFE to avoid illegal top-level return
if(appState.currentPattern){(function(){try{var _appState$selectedCol31,_appState$selectedCol32;var pattern=appState.currentPattern;if(!pattern||!Array.isArray(pattern.layers)){console.error("❌ Invalid pattern or missing layers:",pattern);return;}var designerColors=pattern.designer_colors||[];var curatedColors=((_appState$selectedCol31=appState.selectedCollection)===null||_appState$selectedCol31===void 0?void 0:_appState$selectedCol31.curatedColors)||[];// Use curated colors as fallback if no designer colors
var effectiveColors=designerColors.length>0?designerColors:curatedColors;console.log("🎨 PATTERN LOAD COLOR FALLBACK:");console.log("  - Pattern:",pattern.name);console.log("  - designerColors:",designerColors.length,designerColors);console.log("  - curatedColors:",curatedColors.length,curatedColors);console.log("  - Using effectiveColors:",effectiveColors.length,effectiveColors);appState.currentLayers=buildLayerModel(pattern,effectiveColors,{isWallPanel:((_appState$selectedCol32=appState.selectedCollection)===null||_appState$selectedCol32===void 0?void 0:_appState$selectedCol32.name)==="wall-panels",tintWhite:appState.tintWhite||false});appState.layerInputs=appState.currentLayers.map(function(layer){var layerData=createColorInput(layer.label,layer.inputId,layer.color,layer.isBackground);return _objectSpread(_objectSpread({},layerData),{},{color:layer.color,hex:lookupColor(layer.color)||"#FFFFFF"});});}catch(e){console.error("❌ Error populating layer inputs:",e);}})();}// 2. updatePreview
var updatePreview=/*#__PURE__*/function(){var _ref12=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7(){var _appState$currentPatt10,_appState$currentPatt11,_appState$selectedCol33;var _appState$selectedCol34,_appState$selectedCol35,_patternToRender$laye,_appState$selectedCol36,_appState$selectedCol37,_appState$selectedCol38,_appState$currentLaye5,_patternToRender$laye2,computedStyle,previewSizeValue,canvasSize,previewWidth,patternToRender,isClothingCollection,isStandardPattern,_previewCanvas,_previewCtx,patternImg,_patternRepeatsElement,previewCanvas,previewCtx,hasFurSuffix,isFurnitureMode,isFurnitureCollection,layerMapping,usesBotanicalLayers,backgroundLayerIndex,backgroundColor,backgroundLayer,_backgroundLayer,hasLayers,_isStandardPattern2,baseImage,firstLayer,tempImg,firstLayerPath,patternRepeatsElement,_t3;return _regenerator().w(function(_context8){while(1)switch(_context8.p=_context8.n){case 0:console.log("🔍 updatePreview PATTERN DEBUG:");console.log("  currentPattern name:",(_appState$currentPatt10=appState.currentPattern)===null||_appState$currentPatt10===void 0?void 0:_appState$currentPatt10.name);console.log("  currentPattern layers:",(_appState$currentPatt11=appState.currentPattern)===null||_appState$currentPatt11===void 0||(_appState$currentPatt11=_appState$currentPatt11.layers)===null||_appState$currentPatt11===void 0?void 0:_appState$currentPatt11.map(function(l){var path=typeof l==='string'?l:l===null||l===void 0?void 0:l.path;return path===null||path===void 0?void 0:path.split('/').pop();}));console.log("  isFurnitureMode:",appState.furnitureMode);console.log("  selectedCollection name:",(_appState$selectedCol33=appState.selectedCollection)===null||_appState$selectedCol33===void 0?void 0:_appState$selectedCol33.name);if(dom.preview){_context8.n=1;break;}return _context8.a(2,console.error("preview not found in DOM"));case 1:_context8.p=1;if(dom.preview){_context8.n=2;break;}return _context8.a(2,console.error("preview not found in DOM"));case 2:if(appState.currentPattern){_context8.n=3;break;}console.log("⏳ No current pattern selected yet, skipping updatePreview");return _context8.a(2);case 3:// Loading indicator removed
// Get responsive canvas size from CSS custom properties (MOVED UP)
computedStyle=getComputedStyle(document.documentElement);previewSizeValue=computedStyle.getPropertyValue('--preview-size');canvasSize=parseInt(previewSizeValue&&typeof previewSizeValue==='string'?previewSizeValue.replace('px',''):'700')||700;// Override: If preview container has explicit width, use that
if(dom.preview){previewWidth=parseInt(getComputedStyle(dom.preview).width);if(previewWidth&&previewWidth!==canvasSize){console.log("\uD83D\uDCD0 Overriding canvas size from ".concat(canvasSize,"px to match container: ").concat(previewWidth,"px"));canvasSize=previewWidth;}}// ⚠️ CRITICAL: Define patternToRender FIRST before using it
patternToRender=appState.currentPattern;// ✅ CRITICAL FIX FOR CLO-2: Detect clothing collections
// CLO-2 patterns need special handling - they have layers but need to be TILED in preview
isClothingCollection=((_appState$selectedCol34=appState.selectedCollection)===null||_appState$selectedCol34===void 0||(_appState$selectedCol34=_appState$selectedCol34.name)===null||_appState$selectedCol34===void 0?void 0:_appState$selectedCol34.includes('-clo'))||((_appState$selectedCol35=appState.selectedCollection)===null||_appState$selectedCol35===void 0||(_appState$selectedCol35=_appState$selectedCol35.name)===null||_appState$selectedCol35===void 0?void 0:_appState$selectedCol35.includes('.clo-'));if(isClothingCollection&&((_patternToRender$laye=patternToRender.layers)===null||_patternToRender$laye===void 0?void 0:_patternToRender$laye.length)>0){console.log("\uD83D\uDC55 CLOTHING COLLECTION DETECTED: Pattern will use layers with custom colors (tiled in preview)");console.log("   Collection: ".concat(appState.selectedCollection.name));console.log("   Pattern has ".concat(patternToRender.layers.length," layers for color customization"));}// ✅ FIXED: Handle standard patterns by displaying thumbnail directly
// Standard patterns have NO layers or colorFlex is explicitly false
isStandardPattern=!patternToRender.layers||patternToRender.layers.length===0;if(!isStandardPattern){_context8.n=6;break;}console.log("📋 Rendering standard pattern with thumbnail:",appState.currentPattern.name);if(!appState.currentPattern.thumbnail){_context8.n=5;break;}// Use same canvas setup as regular ColorFlex patterns
_previewCanvas=document.createElement("canvas");_previewCtx=_previewCanvas.getContext("2d",{willReadFrequently:true});_previewCanvas.width=canvasSize;_previewCanvas.height=canvasSize;// Load thumbnail as pattern image
patternImg=new Image();patternImg.crossOrigin="Anonymous";patternImg.src=normalizePath(appState.currentPattern.thumbnail);_context8.n=4;return new Promise(function(resolve){patternImg.onload=function(){console.log("🔍 STANDARD PATTERN SIZING DEBUG:");console.log("  Pattern image:",patternImg.width+"x"+patternImg.height);console.log("  Canvas size:",canvasSize+"x"+canvasSize);console.log("  Scale factors:",appState.currentScale,appState.scaleMultiplier);// No background fill - let pattern tiles show naturally
// Scale pattern to fit canvas, then apply user scaling
// Fix: Use only scaleMultiplier since currentScale and scaleMultiplier are inverses
var scale=appState.scaleMultiplier||1;console.log("  Final scale multiplier:",scale);// Fit pattern to canvas (like CSS object-fit: contain)
var imgAspect=patternImg.width/patternImg.height;var canvasAspect=1;// Square canvas
var fitWidth,fitHeight;if(imgAspect>canvasAspect){// Image is wider than canvas - fit to width
fitWidth=canvasSize;fitHeight=canvasSize/imgAspect;}else{// Image is taller than canvas - fit to height  
fitHeight=canvasSize;fitWidth=canvasSize*imgAspect;}console.log("  Fit size (before scale):",fitWidth+"x"+fitHeight);// For standard patterns, scale the single pattern based on scale buttons
// ⚠️ CRITICAL: scaleMultiplier is inverted (0.5 = 2X, 0.33 = 3X)
// For TILING: divide by multiplier to make tiles smaller (more tiles)
// For SINGLE VIEW: keep at normal size (don't scale the single image)
console.log("  🎯 Scale debugging - currentScale:",appState.currentScale,"scaleMultiplier:",appState.scaleMultiplier);var multiplier=appState.scaleMultiplier||1;var isNormalScale=Math.abs(multiplier-1)<0.01;console.log("  🎯 Scale multiplier:",multiplier,"isNormal:",isNormalScale);// For single view: use normal fitted size
var scaledWidth=fitWidth;var scaledHeight=fitHeight;// ✅ FIX: Calculate tile size based on ACTUAL image aspect ratio (like ColorFlex patterns)
// Standard patterns should use image dimensions, not pattern.size metadata
// This matches how ColorFlex calculates: baseScale * imageWidth/Height * multiplier
var baseScale=fitHeight/patternImg.height;// Scale factor to fit image to canvas
var tileWidth=patternImg.width*baseScale*multiplier;var tileHeight=patternImg.height*baseScale*multiplier;console.log("  Image dimensions:",patternImg.width+"×"+patternImg.height+" pixels");console.log("  Base scale (fitHeight/imageHeight):",baseScale.toFixed(4));console.log("  Calculated tiles for 2X: H="+Math.floor(canvasSize/tileHeight)+", W="+Math.floor(canvasSize/tileWidth));console.log("  Fit size:",fitWidth+"x"+fitHeight);console.log("  Tile size (for tiling):",tileWidth+"x"+tileHeight);console.log("*** CLAUDE BUILD TEST 123 - STANDARD PATTERN TILING ***");console.log("  \uD83D\uDCD0 Canvas: ".concat(_previewCanvas.width,"x").concat(_previewCanvas.height));console.log("  \uD83C\uDFAF Scale: ".concat(multiplier,", isNormal: ").concat(isNormalScale));// Calculate centered display area (like ColorFlex patterns)
var displayX=(_previewCanvas.width-fitWidth)/2;var displayY=(_previewCanvas.height-fitHeight)/2;console.log("  \uD83D\uDCCF Display area: ".concat(fitWidth,"x").concat(fitHeight," at (").concat(displayX,", ").concat(displayY,")"));if(isNormalScale){// Normal scale: show single centered pattern at fit size
console.log("  📍 Normal scale - showing single centered pattern");_previewCtx.drawImage(patternImg,displayX,displayY,fitWidth,fitHeight);}else{// Scaled: tile the pattern using smaller tiles, clipped to display area
console.log("  🔄 Scaled mode - tiling pattern with clipping");console.log("  🔄 Using tile size:",tileWidth,"x",tileHeight);// ✅ FIX: Apply clipping to match ColorFlex pattern behavior
_previewCtx.save();_previewCtx.beginPath();_previewCtx.rect(displayX,displayY,fitWidth,fitHeight);_previewCtx.clip();// Check for half-drop tiling
var tilingType=appState.currentPattern.tilingType||"";var isHalfDrop=tilingType==="half-drop"||appState.currentPattern.name.toLowerCase().includes("hd");console.log("  \uD83D\uDD04 Half-drop: ".concat(isHalfDrop));// Tile within the clipped area
var startX=displayX;var startY=displayY;var endX=displayX+fitWidth+tileWidth;var endY=displayY+fitHeight+tileHeight;for(var x=startX;x<endX;x+=tileWidth){var isOddColumn=Math.floor((x-startX)/tileWidth)%2!==0;var yOffset=isHalfDrop&&isOddColumn?tileHeight/2:0;for(var y=startY-tileHeight+yOffset;y<endY;y+=tileHeight){_previewCtx.drawImage(patternImg,x,y,tileWidth,tileHeight);}}_previewCtx.restore();}console.log("✅ Standard pattern rendered");resolve();};patternImg.onerror=function(){console.error("❌ Failed to load standard pattern thumbnail");resolve();};});case 4:// Use same display setup as regular ColorFlex patterns
dom.preview.innerHTML='';dom.preview.appendChild(_previewCanvas);dom.preview.style.width="".concat(canvasSize,"px");dom.preview.style.height="".concat(canvasSize,"px");dom.preview.style.backgroundColor="rgba(17, 24, 39, 1)";if(appState.currentPattern.name&&dom.patternName){dom.patternName.innerHTML=appState.currentPattern.name+formatPatternInfo(appState.currentPattern);}// 🎨 SIMPLE MODE REDESIGN: Update pattern repeats display
_patternRepeatsElement=document.getElementById('patternRepeats');if(_patternRepeatsElement){_patternRepeatsElement.textContent='Pattern Repeats 24x24';}return _context8.a(2);case 5:console.warn("⚠️ Standard pattern has no thumbnail:",appState.currentPattern.name);case 6:// Canvas size already defined above
previewCanvas=document.createElement("canvas");previewCtx=previewCanvas.getContext("2d",{willReadFrequently:true});previewCanvas.width=canvasSize;previewCanvas.height=canvasSize;// Check if this is a furniture collection
// ✅ Use multiple detection methods for robustness
hasFurSuffix=((_appState$selectedCol36=appState.selectedCollection)===null||_appState$selectedCol36===void 0||(_appState$selectedCol36=_appState$selectedCol36.name)===null||_appState$selectedCol36===void 0?void 0:_appState$selectedCol36.includes('.fur'))||((_appState$selectedCol37=appState.selectedCollection)===null||_appState$selectedCol37===void 0||(_appState$selectedCol37=_appState$selectedCol37.name)===null||_appState$selectedCol37===void 0?void 0:_appState$selectedCol37.includes('-fur'));isFurnitureMode=appState.isInFurnitureMode||window.COLORFLEX_MODE==='FURNITURE'||window.location.pathname.includes('furniture');isFurnitureCollection=hasFurSuffix||isFurnitureMode&&appState.furnitureConfig&&appState.selectedFurnitureType;console.log("🔍 FURNITURE DETECTION IN PATTERN PREVIEW:");console.log("  hasFurSuffix:",hasFurSuffix,"(collection:",(_appState$selectedCol38=appState.selectedCollection)===null||_appState$selectedCol38===void 0?void 0:_appState$selectedCol38.name,")");console.log("  isFurnitureMode:",isFurnitureMode);console.log("  furnitureConfig exists:",!!appState.furnitureConfig);console.log("  selectedFurnitureType:",appState.selectedFurnitureType);console.log("  isFurnitureCollection result:",isFurnitureCollection);layerMapping=getLayerMappingForPreview(isFurnitureCollection);console.log("🔍 Layer mapping:",layerMapping);console.log("🔍 Current layers:",appState.currentLayers?appState.currentLayers.map(function(l,i){return l?"".concat(i,": ").concat(l.label," = ").concat(l.color):"".concat(i,": undefined");}):'No layers');usesBotanicalLayers=false;// Removed furniture collection logic - use current pattern directly
// Get background color based on collection type
// ✅ CRITICAL: Always use layerMapping.backgroundIndex - it's already set correctly by getLayerMappingForPreview()
backgroundLayerIndex=layerMapping.backgroundIndex;console.log("🔍 BACKGROUND COLOR SELECTION:");console.log("  layerMapping.backgroundIndex:",backgroundLayerIndex);console.log("  layerMapping.type:",layerMapping.type);console.log("  isFurnitureCollection:",isFurnitureCollection);console.log("  Available layers at backgroundIndex:",((_appState$currentLaye5=appState.currentLayers)===null||_appState$currentLaye5===void 0||(_appState$currentLaye5=_appState$currentLaye5[backgroundLayerIndex])===null||_appState$currentLaye5===void 0?void 0:_appState$currentLaye5.label)||"MISSING");// ✅ FIX: For furniture mode pattern preview, ALWAYS use the BG/Sofa Base color (index 1)
// Pattern preview should use Sofa Base, not Wall Color
if(isFurnitureCollection||layerMapping.type==='furniture'){// Use index 1 (Sofa Base) for furniture pattern preview background
backgroundLayer=appState.currentLayers[backgroundLayerIndex];backgroundColor=lookupColor((backgroundLayer===null||backgroundLayer===void 0?void 0:backgroundLayer.color)||"Snowbound");console.log("\uD83E\uDE91 Furniture mode pattern preview - using BG/Sofa Base color from input ".concat(backgroundLayerIndex," (").concat((backgroundLayer===null||backgroundLayer===void 0?void 0:backgroundLayer.label)||'MISSING',"): ").concat(backgroundColor));}else{// Standard mode (wallpaper/clothing)
_backgroundLayer=appState.currentLayers[backgroundLayerIndex];// Skip color lookup for standard patterns - use fixed dark background
// Check for both colorFlex flag and presence of layers (botanicals have layers but no colorFlex flag)
hasLayers=appState.currentPattern.layers&&appState.currentPattern.layers.length>0;_isStandardPattern2=!appState.currentPattern.colorFlex&&!hasLayers;if(_isStandardPattern2){backgroundColor="#434341";// Dark background for standard patterns
console.log("\uD83D\uDCCB Standard pattern using fixed dark background (no color lookup)");}else{backgroundColor=lookupColor((_backgroundLayer===null||_backgroundLayer===void 0?void 0:_backgroundLayer.color)||"Snowbound");console.log("\uD83C\uDFA8 ColorFlex pattern background color from input ".concat(backgroundLayerIndex,": ").concat(backgroundColor));}}console.log("\uD83C\uDFA8 Final background color from input ".concat(backgroundLayerIndex,": ").concat(backgroundColor));// Clear canvas to transparent
previewCtx.clearRect(0,0,previewCanvas.width,previewCanvas.height);// Handle tint white patterns
if(!(patternToRender.tintWhite&&patternToRender.baseComposite)){_context8.n=8;break;}console.log("🎨 Rendering tint white pattern");baseImage=new Image();baseImage.crossOrigin="Anonymous";baseImage.src=normalizePath(patternToRender.baseComposite);_context8.n=7;return new Promise(function(resolve,reject){baseImage.onload=function(){var _appState$currentLaye6;var scaleMultiplier=appState.scaleMultiplier||.5;var imgAspect=baseImage.width/baseImage.height;var maxSize=canvasSize*scaleMultiplier;var drawWidth,drawHeight,offsetX,offsetY;if(imgAspect>1){drawWidth=Math.min(maxSize,canvasSize);drawHeight=drawWidth/imgAspect;}else{drawHeight=Math.min(maxSize,canvasSize);drawWidth=drawHeight*imgAspect;}offsetX=(canvasSize-drawWidth)/2;offsetY=(canvasSize-drawHeight)/2;previewCtx.fillStyle=backgroundColor;previewCtx.fillRect(offsetX,offsetY,drawWidth,drawHeight);previewCtx.drawImage(baseImage,offsetX,offsetY,drawWidth,drawHeight);// Apply tint to white areas
var imageData;try{imageData=previewCtx.getImageData(offsetX,offsetY,drawWidth,drawHeight);}catch(e){console.warn("⚠️ Canvas tainted, skipping preview tinting:",e.message);resolve();return;}var data=imageData.data;var wallColor=lookupColor(((_appState$currentLaye6=appState.currentLayers[0])===null||_appState$currentLaye6===void 0?void 0:_appState$currentLaye6.color)||"Snowbound");var hex=wallColor.replace("#","");var rTint=parseInt(hex.substring(0,2),16);var gTint=parseInt(hex.substring(2,4),16);var bTint=parseInt(hex.substring(4,6),16);for(var i=0;i<data.length;i+=4){var r=data[i],g=data[i+1],b=data[i+2];if(r>240&&g>240&&b>240){data[i]=rTint;data[i+1]=gTint;data[i+2]=bTint;}}previewCtx.putImageData(imageData,offsetX,offsetY);resolve();};baseImage.onerror=reject;});case 7:_context8.n=9;break;case 8:if(!((_patternToRender$laye2=patternToRender.layers)!==null&&_patternToRender$laye2!==void 0&&_patternToRender$laye2.length)){_context8.n=9;break;}firstLayer=patternToRender.layers.find(function(l){return!l.isShadow;});if(!firstLayer){_context8.n=9;break;}tempImg=new Image();tempImg.crossOrigin="Anonymous";// Handle both string layers (botanicals) and object layers (other patterns)
firstLayerPath=typeof firstLayer==='string'?firstLayer:firstLayer.path||firstLayer;tempImg.src=normalizePath(firstLayerPath);_context8.n=9;return new Promise(function(resolve){tempImg.onload=function(){// ✅ FIX: Use declared pattern size for aspect ratio, not image dimensions
var patternAspect=getCorrectAspectRatio(tempImg,patternToRender);var scaleMultiplier=appState.scaleMultiplier||1;var patternDisplayWidth,patternDisplayHeight,offsetX,offsetY;var baseSize=canvasSize;// ✅ CRITICAL FIX FOR CLO-2: Tile across entire canvas for clothing collections
if(isClothingCollection){// Fill entire canvas - no centered rectangle
patternDisplayWidth=canvasSize;patternDisplayHeight=canvasSize;offsetX=0;offsetY=0;console.log("\uD83D\uDC55 CLO-2 tiling mode: Full canvas ".concat(canvasSize,"x").concat(canvasSize));}else{// Original behavior for regular patterns - centered rectangle
if(patternAspect>1){patternDisplayWidth=Math.min(baseSize,canvasSize);patternDisplayHeight=patternDisplayWidth/patternAspect;}else{patternDisplayHeight=Math.min(baseSize,canvasSize);patternDisplayWidth=patternDisplayHeight*patternAspect;}offsetX=(canvasSize-patternDisplayWidth)/2;offsetY=(canvasSize-patternDisplayHeight)/2;}previewCtx.fillStyle=backgroundColor;previewCtx.fillRect(offsetX,offsetY,patternDisplayWidth,patternDisplayHeight);console.log("\uD83C\uDFA8 Pattern area: ".concat(patternDisplayWidth.toFixed(0),"x").concat(patternDisplayHeight.toFixed(0)));resolve({offsetX:offsetX,offsetY:offsetY,patternDisplayWidth:patternDisplayWidth,patternDisplayHeight:patternDisplayHeight,scaleMultiplier:scaleMultiplier});};tempImg.onerror=function(){return resolve(null);};}).then(/*#__PURE__*/function(){var _ref13=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6(patternBounds){var _loop4,layerIndex;return _regenerator().w(function(_context7){while(1)switch(_context7.n){case 0:if(patternBounds){_context7.n=1;break;}return _context7.a(2);case 1:_loop4=/*#__PURE__*/_regenerator().m(function _loop4(layerIndex){var layer,isShadow,layerColor,_appState$currentLaye7,furnitureInputIndex,_appState$currentLaye8,inputLayer,_appState$currentLaye9,inputIndex;return _regenerator().w(function(_context6){while(1)switch(_context6.n){case 0:layer=patternToRender.layers[layerIndex];// Handle both string layers and object layers
isShadow=_typeof(layer)==='object'&&layer.isShadow===true;layerColor=null;if(!isShadow){// ✅ FIX: For furniture collections, pattern layers start at patternStartIndex (2)
// This applies to ALL furniture collections, not just botanical
if(isFurnitureCollection){furnitureInputIndex=layerMapping.patternStartIndex+layerIndex;// ✅ Bounds check
if(furnitureInputIndex>=(((_appState$currentLaye7=appState.currentLayers)===null||_appState$currentLaye7===void 0?void 0:_appState$currentLaye7.length)||0)){console.error("  \u274C Pattern preview: furnitureInputIndex ".concat(furnitureInputIndex," out of bounds for layer ").concat(layerIndex));layerColor=lookupColor("Snowbound");// Fallback
}else{layerColor=lookupColor(((_appState$currentLaye8=appState.currentLayers[furnitureInputIndex])===null||_appState$currentLaye8===void 0?void 0:_appState$currentLaye8.color)||"Snowbound");inputLayer=appState.currentLayers[furnitureInputIndex];console.log("\uD83E\uDE91 Furniture pattern preview layer ".concat(layerIndex," \u2192 input ").concat(furnitureInputIndex," (").concat(inputLayer===null||inputLayer===void 0?void 0:inputLayer.label,") \u2192 ").concat(layerColor));}}else{// Standard/wallpaper mapping - pattern layers start at index 1
inputIndex=layerMapping.patternStartIndex+layerIndex;layerColor=lookupColor(((_appState$currentLaye9=appState.currentLayers[inputIndex])===null||_appState$currentLaye9===void 0?void 0:_appState$currentLaye9.color)||"Snowbound");console.log("\uD83C\uDFE0 Standard layer ".concat(layerIndex," \u2192 input ").concat(inputIndex," \u2192 ").concat(layerColor));}}_context6.n=1;return new Promise(function(resolve){// Handle both string layers and object layers
var layerPath=typeof layer==='string'?layer:layer.path;processImage(layerPath,function(processedCanvas){if(!(processedCanvas instanceof HTMLCanvasElement)){return resolve();}// Fix for non-square patterns: calculate scale based on aspect ratio
var patternAspect=processedCanvas.width/processedCanvas.height;var displayAspect=patternBounds.patternDisplayWidth/patternBounds.patternDisplayHeight;var baseScale;if(patternAspect>displayAspect){// Pattern is wider than display area - scale to fit width
baseScale=patternBounds.patternDisplayWidth/processedCanvas.width;}else{// Pattern is taller than display area - scale to fit height  
baseScale=patternBounds.patternDisplayHeight/processedCanvas.height;}var finalScale=baseScale*patternBounds.scaleMultiplier;var tileWidth=processedCanvas.width*finalScale;var tileHeight=processedCanvas.height*finalScale;var tilingType=patternToRender.tilingType||"";var isHalfDrop=tilingType==="half-drop";previewCtx.save();previewCtx.beginPath();previewCtx.rect(patternBounds.offsetX,patternBounds.offsetY,patternBounds.patternDisplayWidth,patternBounds.patternDisplayHeight);previewCtx.clip();previewCtx.globalCompositeOperation=isShadow?"multiply":"source-over";previewCtx.globalAlpha=isShadow?0.3:1.0;var startX=patternBounds.offsetX;var startY=patternBounds.offsetY;var endX=patternBounds.offsetX+patternBounds.patternDisplayWidth+tileWidth;var endY=patternBounds.offsetY+patternBounds.patternDisplayHeight+tileHeight;for(var x=startX;x<endX;x+=tileWidth){var isOddColumn=Math.floor((x-startX)/tileWidth)%2!==0;var yOffset=isHalfDrop&&isOddColumn?tileHeight/2:0;for(var y=startY-tileHeight+yOffset;y<endY;y+=tileHeight){previewCtx.drawImage(processedCanvas,x,y,tileWidth,tileHeight);}}previewCtx.restore();console.log("\u2705 Rendered layer ".concat(layerIndex," with color ").concat(layerColor));resolve();},layerColor,2.2,isShadow,false,false);});case 1:return _context6.a(2);}},_loop4);});layerIndex=0;case 2:if(!(layerIndex<patternToRender.layers.length)){_context7.n=4;break;}return _context7.d(_regeneratorValues(_loop4(layerIndex)),3);case 3:layerIndex++;_context7.n=2;break;case 4:return _context7.a(2);}},_callee6);}));return function(_x10){return _ref13.apply(this,arguments);};}());case 9:// Update DOM
dom.preview.innerHTML="";dom.preview.appendChild(previewCanvas);// Allow container to size naturally based on canvas content
dom.preview.style.backgroundColor="rgba(17, 24, 39, 1)";if(patternToRender.name){dom.patternName.innerHTML=toInitialCaps(appState.currentPattern.name)+formatPatternInfo(appState.currentPattern);}// 🎨 SIMPLE MODE REDESIGN: Update pattern repeats display
patternRepeatsElement=document.getElementById('patternRepeats');if(patternRepeatsElement){patternRepeatsElement.textContent='Pattern Repeats 24x24';}console.log("✅ Pattern preview rendered");// Loading indicator removed
_context8.n=11;break;case 10:_context8.p=10;_t3=_context8.v;console.error("updatePreview error:",_t3);// Loading indicator removed
case 11:return _context8.a(2);}},_callee7,null,[[1,10]]);}));return function updatePreview(){return _ref12.apply(this,arguments);};}();// Helper: Format pattern size and tiling info as HTML
function formatPatternInfo(pattern){if(!pattern)return'';// Build the pattern repeat string: "24x24HD" or "24x24S"
var repeatStr='';if(pattern.size&&Array.isArray(pattern.size)&&pattern.size.length>=2){var width=pattern.size[0];var height=pattern.size[1];repeatStr="".concat(width,"x").concat(height);// Add tiling suffix
if(pattern.tilingType==='half-drop'){repeatStr+='HD';}else if(pattern.tilingType==='straight'){repeatStr+='S';}}if(repeatStr){return"<br><span style=\"font-size: 0.85em; color: rgba(255, 255, 255, 0.6); font-weight: normal;\">Pattern Repeat: ".concat(repeatStr,"</span>");}return'';}/**
 * Internal image loader with caching and queue management
 * @param {string} src - Image source URL
 * @param {boolean} highPriority - If true, adds to front of queue
 * @returns {Promise<HTMLImageElement>}
 */function loadImageInternal(src){var highPriority=arguments.length>1&&arguments[1]!==undefined?arguments[1]:true;return new Promise(function(resolve,reject){if(!src){console.error("❌ loadImage: No src provided");reject(new Error("No image source provided"));return;}// Normalize the path to fix ./data/ vs data/ inconsistencies
var normalizedSrc=normalizePath(src);// Check cache first
if(imageCache.has(normalizedSrc)){imageCacheStats.hits++;imageCacheStats.itemsLoaded++;console.log("\u2728 Cache HIT: ".concat(normalizedSrc.split('/').pop()," (").concat(imageCacheStats.hits," total hits)"));// Clone the cached image to prevent reference issues
var cachedImg=imageCache.get(normalizedSrc);resolve(cachedImg);return;}// Cache miss - need to load from network
imageCacheStats.misses++;imageCacheStats.itemsLoaded++;var startTime=performance.now();console.log("\uD83D\uDCE5 Cache MISS: Loading ".concat(normalizedSrc.split('/').pop()," (Queue: ").concat(imageLoadQueue.length,", Pending: ").concat(pendingImageLoads.size,"/").concat(MAX_CONCURRENT_LOADS,")"));var img=new Image();img.crossOrigin="Anonymous";// Track this load
pendingImageLoads.add(normalizedSrc);img.onload=function(){var loadTime=performance.now()-startTime;imageCacheStats.totalLoadTime+=loadTime;console.log("\u2705 Loaded: ".concat(normalizedSrc.split('/').pop()," in ").concat(loadTime.toFixed(0),"ms (").concat(img.naturalWidth,"x").concat(img.naturalHeight,")"));// Store in cache
imageCache.set(normalizedSrc,img);// Remove from pending and process next in queue
pendingImageLoads["delete"](normalizedSrc);processImageQueue();resolve(img);};img.onerror=function(error){console.error("\u274C Failed to load image: ".concat(normalizedSrc));console.error("❌ Error details:",error);// Remove from pending and process next
pendingImageLoads["delete"](normalizedSrc);processImageQueue();reject(new Error("Failed to load image: ".concat(normalizedSrc)));};img.src=normalizedSrc;});}/**
 * Public loadImage function with queue management
 * Automatically handles caching and concurrent load limiting
 *
 * @param {string} src - Image source URL
 * @param {boolean} highPriority - If true, loads immediately (default: true)
 * @returns {Promise<HTMLImageElement>}
 */function loadImage(src){var highPriority=arguments.length>1&&arguments[1]!==undefined?arguments[1]:true;return new Promise(function(resolve,reject){if(!src){reject(new Error("No image source provided"));return;}var normalizedSrc=normalizePath(src);// Check cache first - instant return
if(imageCache.has(normalizedSrc)){imageCacheStats.hits++;imageCacheStats.itemsLoaded++;resolve(imageCache.get(normalizedSrc));return;}// Not in cache - check if we can load immediately
if(pendingImageLoads.size<MAX_CONCURRENT_LOADS){// Can load immediately
loadImageInternal(normalizedSrc,highPriority).then(resolve)["catch"](reject);}else{// Queue is full - add to queue
var loadFn=function loadFn(){loadImageInternal(normalizedSrc,highPriority).then(resolve)["catch"](reject);};if(highPriority){// High priority - add to front of queue
imageLoadQueue.unshift(loadFn);}else{// Low priority - add to end of queue
imageLoadQueue.push(loadFn);}}});}//  room mockup
var updateRoomMockup=/*#__PURE__*/function(){var _ref14=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee9(){var _appState$selectedCol39,_appState$selectedCol40,_appState$selectedCol41,_appState$currentLaye0,_appState$currentLaye1,computeTileSizeFromInches,cssW,cssH,dpr,snap,mod,mockupWidthInches,mockupHeightInches,pxPerInRoom,canvas,_ctx3,isStandardPattern,isClothingCollection,isClothingMode,isFurnitureMode,isWallPanel,wallColor,backgroundColor,_appState$selectedCol42,roomImg,processOverlay,_t5;return _regenerator().w(function(_context10){while(1)switch(_context10.p=_context10.n){case 0:_context10.p=0;// Compute tile size (in CSS px) from declared pattern inches + user scale
computeTileSizeFromInches=function computeTileSizeFromInches(pattern){var userScale=arguments.length>1&&arguments[1]!==undefined?arguments[1]:1;var _ref15=pattern.size||[24,24],_ref16=_slicedToArray(_ref15,2),wIn=_ref16[0],hIn=_ref16[1];// fallback if size missing
return{tileW:snap(wIn*pxPerInRoom*userScale),tileH:snap(hIn*pxPerInRoom*userScale)};};if(!appState.isFurnitureCompositing){_context10.n=1;break;}console.log("🚫 updateRoomMockup blocked - furniture compositing in progress");return _context10.a(2);case 1:if(dom.roomMockup){_context10.n=2;break;}return _context10.a(2,console.error("roomMockup element not found in DOM"));case 2:if(!(!appState.selectedCollection||!appState.currentPattern)){_context10.n=3;break;}console.log("🔍 Skipping updateRoomMockup - no collection/pattern selected");return _context10.a(2);case 3:// Loading indicator removed
// --- Canvas setup (CSS px -> DPR backing) ---
cssW=600,cssH=450;dpr=window.devicePixelRatio||1;snap=function snap(v){return Math.round(v*dpr)/dpr;};// align to device grid
mod=function mod(a,b){return(a%b+b)%b;};// Calculate px per inch based on actual mockup dimensions from collection
// If mockup is 90 inches wide and canvas is 600px → 600/90 = 6.67 px/inch
// If mockup is 60 inches wide and canvas is 600px → 600/60 = 10 px/inch
mockupWidthInches=appState.selectedCollection.mockupWidthInches||90;// fallback to 90
mockupHeightInches=appState.selectedCollection.mockupHeightInches||60;// fallback to 60
pxPerInRoom=cssW/mockupWidthInches;console.log("\uD83D\uDCD0 Room mockup dimensions: ".concat(mockupWidthInches,"x").concat(mockupHeightInches," inches"));console.log("\uD83D\uDCD0 Canvas size: ".concat(cssW,"x").concat(cssH," px"));console.log("\uD83D\uDCD0 Calculated px per inch: ".concat(pxPerInRoom.toFixed(2)," px/in"));canvas=document.createElement("canvas");canvas.width=Math.round(cssW*dpr);canvas.height=Math.round(cssH*dpr);canvas.style.width=cssW+"px";canvas.style.height=cssH+"px";_ctx3=canvas.getContext("2d",{willReadFrequently:true});_ctx3.imageSmoothingEnabled=true;_ctx3.imageSmoothingQuality="high";_ctx3.setTransform(dpr,0,0,dpr,0,0);// draw in CSS px
isStandardPattern=!appState.currentPattern.layers||appState.currentPattern.layers.length===0;// ✅ CORE FUNCTION PROTECTION: updateRoomMockup() is WALLPAPER ONLY
// If clothing or furniture mode detected, exit early - routing happens in callers
isClothingCollection=((_appState$selectedCol39=appState.selectedCollection)===null||_appState$selectedCol39===void 0||(_appState$selectedCol39=_appState$selectedCol39.name)===null||_appState$selectedCol39===void 0?void 0:_appState$selectedCol39.includes('-clo'))||((_appState$selectedCol40=appState.selectedCollection)===null||_appState$selectedCol40===void 0||(_appState$selectedCol40=_appState$selectedCol40.name)===null||_appState$selectedCol40===void 0?void 0:_appState$selectedCol40.includes('.clo-'));isClothingMode=window.COLORFLEX_MODE==='CLOTHING';isFurnitureMode=window.COLORFLEX_MODE==='FURNITURE'||appState.isInFurnitureMode;if(!(isClothingCollection||isClothingMode)){_context10.n=4;break;}console.log("👗 updateRoomMockup() - Exiting early for clothing mode (core wallpaper function, routing handled by caller)");return _context10.a(2);case 4:if(!isFurnitureMode){_context10.n=5;break;}console.log("🪑 updateRoomMockup() - Exiting early for furniture mode (core wallpaper function, routing handled by caller)");return _context10.a(2);case 5:// ✅ Furniture mode check already handled above - this code should never run
// (Removed furniture handling - core function is wallpaper only)
isWallPanel=((_appState$selectedCol41=appState.selectedCollection)===null||_appState$selectedCol41===void 0?void 0:_appState$selectedCol41.name)==="wall-panels";wallColor=lookupColor(((_appState$currentLaye0=appState.currentLayers[0])===null||_appState$currentLaye0===void 0?void 0:_appState$currentLaye0.color)||"Snowbound");backgroundColor=isWallPanel?lookupColor(((_appState$currentLaye1=appState.currentLayers[1])===null||_appState$currentLaye1===void 0?void 0:_appState$currentLaye1.color)||"Snowbound"):wallColor;// ---------- STANDARD (thumbnail-only) ----------
if(!isStandardPattern){_context10.n=7;break;}if((_appState$selectedCol42=appState.selectedCollection)!==null&&_appState$selectedCol42!==void 0&&_appState$selectedCol42.mockup){_context10.n=6;break;}console.log("⏭️  Skipping standard pattern rendering (no mockup defined for collection)");return _context10.a(2);case 6:roomImg=new Image();roomImg.crossOrigin="Anonymous";roomImg.src=normalizePath(appState.selectedCollection.mockup);roomImg.onload=function(){// bg
_ctx3.fillStyle="#434341";_ctx3.fillRect(0,0,cssW,cssH);var patternImg=new Image();patternImg.crossOrigin="Anonymous";patternImg.src=normalizePath(appState.currentPattern.thumbnail);patternImg.onload=function(){var _appState$selectedCol43,_appState$selectedCol44,_appState$selectedCol45;// ✅ FIX: Use same default as ColorFlex patterns (1 = normal scale)
console.log("🔍 STANDARD PATTERN ROOM MOCKUP DEBUG:");console.log("  appState.scaleMultiplier:",appState.scaleMultiplier);console.log("  Default will use:",appState.scaleMultiplier||1);var _computeTileSizeFromI=computeTileSizeFromInches(appState.currentPattern,appState.scaleMultiplier||1),tileW=_computeTileSizeFromI.tileW,tileH=_computeTileSizeFromI.tileH;console.log("  Calculated tile size: tileW =",tileW,", tileH =",tileH);var isHalfDrop=(appState.currentPattern.tilingType||"")==="half-drop"||/hd/i.test(appState.currentPattern.name);var startX=0-mod(0,tileW)-tileW;var endX=cssW+tileW;var startY=0-tileH;var endY=cssH+tileH;var col=0;for(var X=startX;X<endX;X+=tileW,col++){var yOff=isHalfDrop&&col&1?tileH/2:0;for(var Y=startY+yOff;Y<endY;Y+=tileH){_ctx3.drawImage(patternImg,X,Y,tileW,tileH);}}var fit=scaleToFit(roomImg,cssW,cssH);// expects CSS px
_ctx3.drawImage(roomImg,fit.x,fit.y,fit.width,fit.height);// ----- Shadow overlay for standard patterns -----
console.log("🎨 STANDARD PATTERN: Checking for shadow overlay...");console.log("  Collection:",(_appState$selectedCol43=appState.selectedCollection)===null||_appState$selectedCol43===void 0?void 0:_appState$selectedCol43.name);console.log("  mockupShadow:",(_appState$selectedCol44=appState.selectedCollection)===null||_appState$selectedCol44===void 0?void 0:_appState$selectedCol44.mockupShadow);if((_appState$selectedCol45=appState.selectedCollection)!==null&&_appState$selectedCol45!==void 0&&_appState$selectedCol45.mockupShadow){console.log("✅ STANDARD PATTERN: Found mockupShadow, loading shadow overlay...");var shadowOverlay=new Image();shadowOverlay.crossOrigin="Anonymous";shadowOverlay.src=normalizePath(appState.selectedCollection.mockupShadow);shadowOverlay.onload=function(){console.log("✅ STANDARD PATTERN: Shadow overlay loaded successfully!");console.log("  Shadow image size:",shadowOverlay.width,"x",shadowOverlay.height);_ctx3.globalCompositeOperation="multiply";var shadowFit=scaleToFit(shadowOverlay,cssW,cssH);_ctx3.drawImage(shadowOverlay,shadowFit.x,shadowFit.y,shadowFit.width,shadowFit.height);_ctx3.globalCompositeOperation="source-over";console.log("✅ STANDARD PATTERN: Shadow overlay drawn with multiply blend mode");dom.roomMockup.innerHTML="";dom.roomMockup.appendChild(canvas);};shadowOverlay.onerror=function(){console.error("❌ STANDARD PATTERN: Shadow overlay failed to load:",shadowOverlay.src);dom.roomMockup.innerHTML="";dom.roomMockup.appendChild(canvas);};}else{console.log("⏭️ STANDARD PATTERN: No mockupShadow defined, skipping shadow overlay");dom.roomMockup.innerHTML="";dom.roomMockup.appendChild(canvas);}};};return _context10.a(2);case 7:// ---------- REGULAR / PANELS ----------
processOverlay=/*#__PURE__*/function(){var _ref17=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee8(){var _appState$currentPatt12,_appState$currentPatt16,_appState$currentPatt17,_appState$currentPatt18,_appState$selectedCol46,_appState$selectedCol50;var _appState$currentPatt13,_appState$currentPatt14,_appState$currentPatt15,panelWidthInches,panelHeightInches,baseScale,panelWidth,panelHeight,layout,_layout$split,_layout$split2,numPanelsStr,spacingStr,numPanels,spacing,totalWidth,startX,startY,panelCanvas,panelCtx,inputLayers,inputIdx,_loop5,i,p,px,patternCanvas,patternCtx,baseImage,_patternCanvas,_patternCtx,_inputLayers2,_inputIdx,_loop6,_i7,_appState$selectedCol47,_appState$selectedCol48,_appState$selectedCol49,mockupPath,mockupImage,shadowOverlay,dataUrl,_isSimpleMode,_isFurnitureMode,_isClothingMode,isFurnitureSimpleMode,mockupW,mockupH,img,isSimpleMode,_t4;return _regenerator().w(function(_context1){while(1)switch(_context1.p=_context1.n){case 0:// Paint wall base (CSS px)
_ctx3.fillStyle=wallColor;_ctx3.fillRect(0,0,cssW,cssH);// ----- WALL PANELS -----
if(!(isWallPanel&&(_appState$currentPatt12=appState.currentPattern)!==null&&_appState$currentPatt12!==void 0&&(_appState$currentPatt12=_appState$currentPatt12.layers)!==null&&_appState$currentPatt12!==void 0&&_appState$currentPatt12.length)){_context1.n=4;break;}panelWidthInches=((_appState$currentPatt13=appState.currentPattern.size)===null||_appState$currentPatt13===void 0?void 0:_appState$currentPatt13[0])||24;panelHeightInches=((_appState$currentPatt14=appState.currentPattern.size)===null||_appState$currentPatt14===void 0?void 0:_appState$currentPatt14[1])||36;// scale panels in CSS px space
baseScale=Math.min(cssW/100,cssH/80);panelWidth=panelWidthInches*baseScale*(appState.scaleMultiplier||1);panelHeight=panelHeightInches*baseScale*(appState.scaleMultiplier||1);layout=appState.currentPattern.layout||"3,20";_layout$split=layout.split(","),_layout$split2=_slicedToArray(_layout$split,2),numPanelsStr=_layout$split2[0],spacingStr=_layout$split2[1];numPanels=parseInt(numPanelsStr,10)||3;spacing=parseInt(spacingStr,10)||20;totalWidth=numPanels*panelWidth+(numPanels-1)*spacing;startX=(cssW-totalWidth)/2;startY=(cssH-panelHeight)/2-(((_appState$currentPatt15=appState.currentPattern)===null||_appState$currentPatt15===void 0?void 0:_appState$currentPatt15.verticalOffset)||50);// panel offscreen (DPR-aware)
panelCanvas=document.createElement("canvas");panelCanvas.width=Math.round(panelWidth*dpr);panelCanvas.height=Math.round(panelHeight*dpr);panelCtx=panelCanvas.getContext("2d",{willReadFrequently:true});panelCtx.imageSmoothingEnabled=true;panelCtx.imageSmoothingQuality="high";panelCtx.setTransform(dpr,0,0,dpr,0,0);// Build input color mapping (skip background)
inputLayers=appState.currentLayers.filter(function(l){return!l.isShadow;});inputIdx=0;_loop5=/*#__PURE__*/_regenerator().m(function _loop5(){var layer,isShadow,layerColor,input,tilingType,isHalfDrop;return _regenerator().w(function(_context9){while(1)switch(_context9.n){case 0:layer=appState.currentPattern.layers[i];isShadow=!!layer.isShadow;layerColor=null;if(!isShadow){input=inputLayers[inputIdx+1];// skip bg
layerColor=lookupColor((input===null||input===void 0?void 0:input.color)||"Snowbound");inputIdx++;}tilingType=appState.currentPattern.tilingType||"";isHalfDrop=tilingType==="half-drop";_context9.n=1;return new Promise(function(resolve){processImage(layer.path,function(processedCanvas){if(!(processedCanvas instanceof HTMLCanvasElement))return resolve();var scale=(appState.scaleMultiplier||.5)*0.1;var tileW=snap(processedCanvas.width*scale);var tileH=snap(processedCanvas.height*scale);panelCtx.globalCompositeOperation=isShadow?"multiply":"source-over";panelCtx.globalAlpha=isShadow?0.3:1.0;var rect={x:0,y:0,w:panelWidth,h:panelHeight};var sx=rect.x-mod(rect.x,tileW)-tileW;var ex=rect.x+rect.w+tileW;var sy=rect.y-tileH;var ey=rect.y+rect.h+tileH;var col=0;for(var X=sx;X<ex;X+=tileW,col++){var yOff=isHalfDrop&&col&1?tileH/2:0;for(var Y=sy+yOff;Y<ey;Y+=tileH){panelCtx.drawImage(processedCanvas,X,Y,tileW,tileH);}}resolve();},layerColor,2.2,isShadow,/*isWallPanel*/false,/*isWall*/false);});case 1:return _context9.a(2);}},_loop5);});i=0;case 1:if(!(i<appState.currentPattern.layers.length)){_context1.n=3;break;}return _context1.d(_regeneratorValues(_loop5()),2);case 2:i++;_context1.n=1;break;case 3:// draw panels to main canvas
for(p=0;p<numPanels;p++){px=startX+p*(panelWidth+spacing);_ctx3.fillStyle=backgroundColor;_ctx3.fillRect(px,startY,panelWidth,panelHeight);_ctx3.drawImage(panelCanvas,px,startY,panelWidth,panelHeight);}_context1.n=10;break;case 4:if(!((_appState$currentPatt16=appState.currentPattern)!==null&&_appState$currentPatt16!==void 0&&_appState$currentPatt16.tintWhite&&(_appState$currentPatt17=appState.currentPattern)!==null&&_appState$currentPatt17!==void 0&&_appState$currentPatt17.baseComposite)){_context1.n=6;break;}patternCanvas=document.createElement("canvas");patternCanvas.width=Math.round(cssW*dpr);patternCanvas.height=Math.round(cssH*dpr);patternCtx=patternCanvas.getContext("2d",{willReadFrequently:true});patternCtx.imageSmoothingEnabled=true;patternCtx.imageSmoothingQuality="high";patternCtx.setTransform(dpr,0,0,dpr,0,0);baseImage=new Image();baseImage.crossOrigin="Anonymous";baseImage.src=normalizePath(appState.currentPattern.baseComposite);_context1.n=5;return new Promise(function(resolve){baseImage.onload=function(){var _computeTileSizeFromI2=computeTileSizeFromInches(appState.currentPattern,appState.scaleMultiplier||1),tileW=_computeTileSizeFromI2.tileW,tileH=_computeTileSizeFromI2.tileH;var isHalfDrop=(appState.currentPattern.tilingType||"")==="half-drop";var sx=0-mod(0,tileW)-tileW,ex=cssW+tileW;var sy=0-tileH,ey=cssH+tileH;for(var col=0,X=sx;X<ex;X+=tileW,col++){var yOff=isHalfDrop&&col&1?tileH/2:0;for(var Y=sy+yOff;Y<ey;Y+=tileH){patternCtx.drawImage(baseImage,X,Y,tileW,tileH);}}// tint whites
var imageData;try{imageData=patternCtx.getImageData(0,0,patternCanvas.width,patternCanvas.height);}catch(e){console.warn("⚠️ Canvas tainted, skipping tint white:",e.message);_ctx3.drawImage(patternCanvas,0,0);return resolve();}var d=imageData.data;var hex=wallColor.replace("#","");var rT=parseInt(hex.slice(0,2),16);var gT=parseInt(hex.slice(2,4),16);var bT=parseInt(hex.slice(4,6),16);for(var _i6=0;_i6<d.length;_i6+=4){var r=d[_i6],g=d[_i6+1],b=d[_i6+2];if(r>240&&g>240&&b>240){d[_i6]=rT;d[_i6+1]=gT;d[_i6+2]=bT;}}patternCtx.putImageData(imageData,0,0);_ctx3.drawImage(patternCanvas,0,0);resolve();};baseImage.onerror=resolve;});case 5:_context1.n=10;break;case 6:if(!((_appState$currentPatt18=appState.currentPattern)!==null&&_appState$currentPatt18!==void 0&&(_appState$currentPatt18=_appState$currentPatt18.layers)!==null&&_appState$currentPatt18!==void 0&&_appState$currentPatt18.length)){_context1.n=10;break;}_patternCanvas=document.createElement("canvas");_patternCanvas.width=Math.round(cssW*dpr);_patternCanvas.height=Math.round(cssH*dpr);_patternCtx=_patternCanvas.getContext("2d",{willReadFrequently:true});_patternCtx.imageSmoothingEnabled=true;_patternCtx.imageSmoothingQuality="high";_patternCtx.setTransform(dpr,0,0,dpr,0,0);// map user colors (skip bg in input list)
_inputLayers2=appState.currentLayers.filter(function(l){return!l.isShadow;});_inputIdx=0;_loop6=/*#__PURE__*/_regenerator().m(function _loop6(){var layer,isShadow,layerColor,input,isHalfDrop;return _regenerator().w(function(_context0){while(1)switch(_context0.n){case 0:layer=appState.currentPattern.layers[_i7];isShadow=!!layer.isShadow;layerColor=null;if(!isShadow){input=_inputLayers2[_inputIdx+1];// skip bg
layerColor=lookupColor((input===null||input===void 0?void 0:input.color)||"Snowbound");_inputIdx++;}isHalfDrop=(appState.currentPattern.tilingType||"")==="half-drop";_context0.n=1;return new Promise(function(resolve){processImage(layer.path,function(processedCanvas){if(!(processedCanvas instanceof HTMLCanvasElement))return resolve();console.log("🔍 COLORFLEX PATTERN ROOM MOCKUP DEBUG:");console.log("  appState.scaleMultiplier:",appState.scaleMultiplier);console.log("  Default will use:",appState.scaleMultiplier||1);var _computeTileSizeFromI3=computeTileSizeFromInches(appState.currentPattern,appState.scaleMultiplier||1),tileW=_computeTileSizeFromI3.tileW,tileH=_computeTileSizeFromI3.tileH;console.log("  Calculated tile size: tileW =",tileW,", tileH =",tileH);_patternCtx.globalCompositeOperation=isShadow?"multiply":"source-over";_patternCtx.globalAlpha=isShadow?0.3:1.0;var sx=0-mod(0,tileW)-tileW,ex=cssW+tileW;var sy=0-tileH,ey=cssH+tileH;var col=0;for(var X=sx;X<ex;X+=tileW,col++){var yOff=isHalfDrop&&col&1?tileH/2:0;for(var Y=sy+yOff;Y<ey;Y+=tileH){_patternCtx.drawImage(processedCanvas,X,Y,tileW,tileH);}}resolve();},layerColor,2.2,isShadow,/*isWallPanel*/false,/*isWall*/false);});case 1:return _context0.a(2);}},_loop6);});_i7=0;case 7:if(!(_i7<appState.currentPattern.layers.length)){_context1.n=9;break;}return _context1.d(_regeneratorValues(_loop6()),8);case 8:_i7++;_context1.n=7;break;case 9:// ✅ FIX: Draw pattern canvas at CSS size to prevent double-DPR scaling
// patternCanvas is already DPR-scaled (cssW*dpr x cssH*dpr pixels)
// Main ctx also has DPR transform, so we must specify CSS dimensions
// This ensures ColorFlex patterns render at the same scale as Standard patterns
_ctx3.drawImage(_patternCanvas,0,0,cssW,cssH);case 10:if(!((_appState$selectedCol46=appState.selectedCollection)!==null&&_appState$selectedCol46!==void 0&&_appState$selectedCol46.mockup)){_context1.n=12;break;}// ✅ CRITICAL: Ensure mockup is a string path, not an object
mockupPath=typeof appState.selectedCollection.mockup==='string'?appState.selectedCollection.mockup:((_appState$selectedCol47=appState.selectedCollection.mockup)===null||_appState$selectedCol47===void 0?void 0:_appState$selectedCol47.path)||((_appState$selectedCol48=appState.selectedCollection.mockup)===null||_appState$selectedCol48===void 0?void 0:_appState$selectedCol48.url)||((_appState$selectedCol49=appState.selectedCollection.mockup)===null||_appState$selectedCol49===void 0?void 0:_appState$selectedCol49.image)||'';if(mockupPath){_context1.n=11;break;}console.warn("\u26A0\uFE0F Collection \"".concat(appState.selectedCollection.name,"\" has invalid mockup (type: ").concat(_typeof(appState.selectedCollection.mockup),")"));_context1.n=12;break;case 11:mockupImage=new Image();mockupImage.crossOrigin="Anonymous";mockupImage.src=normalizePath(mockupPath);_context1.n=12;return new Promise(function(resolve){mockupImage.onload=function(){var fit=scaleToFit(mockupImage,cssW,cssH);_ctx3.drawImage(mockupImage,fit.x,fit.y,fit.width,fit.height);resolve();};mockupImage.onerror=function(err){console.error("\u274C Failed to load mockup image: ".concat(mockupPath),err);resolve();};});case 12:if(!((_appState$selectedCol50=appState.selectedCollection)!==null&&_appState$selectedCol50!==void 0&&_appState$selectedCol50.mockupShadow)){_context1.n=13;break;}shadowOverlay=new Image();shadowOverlay.crossOrigin="Anonymous";shadowOverlay.src=normalizePath(appState.selectedCollection.mockupShadow);_context1.n=13;return new Promise(function(resolve){shadowOverlay.onload=function(){_ctx3.globalCompositeOperation="multiply";var fit=scaleToFit(shadowOverlay,cssW,cssH);_ctx3.drawImage(shadowOverlay,fit.x,fit.y,fit.width,fit.height);_ctx3.globalCompositeOperation="source-over";resolve();};shadowOverlay.onerror=resolve;});case 13:_context1.p=13;dataUrl=canvas.toDataURL("image/png");_context1.n=16;break;case 14:_context1.p=14;_t4=_context1.v;if(!(_t4.name==="SecurityError")){_context1.n=15;break;}dom.roomMockup.innerHTML="";canvas.style.cssText="width: 100%; height: 100%; object-fit: contain; border: 1px solid #333;";dom.roomMockup.appendChild(canvas);_isSimpleMode=window.COLORFLEX_SIMPLE_MODE===true;// Simple mode: let template CSS handle sizing, but ensure it stays 800x600
if(_isSimpleMode){// ✅ FIX: Force 800x600 in simple mode to prevent other code from changing it
dom.roomMockup.style.setProperty('width','800px','important');dom.roomMockup.style.setProperty('height','600px','important');console.log("✅ Simple mode: Forcing roomMockup to 800x600");}else{_isFurnitureMode=window.COLORFLEX_MODE==='FURNITURE';_isClothingMode=window.COLORFLEX_MODE==='CLOTHING';// ✅ FIX: Furniture simple mode should be 800x600, not 600x450
isFurnitureSimpleMode=_isSimpleMode&&_isFurnitureMode;mockupW=isFurnitureSimpleMode?'800px':_isFurnitureMode?'600px':_isClothingMode?'500px':'700px';mockupH=isFurnitureSimpleMode?'600px':_isFurnitureMode?'450px':_isClothingMode?'500px':'600px';dom.roomMockup.style.cssText="width: ".concat(mockupW,"; height: ").concat(mockupH,"; position: relative; background-color: #434341;");}ensureButtonsAfterUpdate();return _context1.a(2);case 15:throw _t4;case 16:img=document.createElement("img");img.src=dataUrl;img.style.cssText="width: 100%; height: 100%; object-fit: contain; border: 1px solid #333;";dom.roomMockup.innerHTML="";dom.roomMockup.appendChild(img);// ✅ CORE WALLPAPER FUNCTION: Only set wallpaper-specific styling
// Clothing and furniture modes should never reach this code (exited early above)
// Simple mode is handled by template CSS, standard wallpaper uses default sizing
isSimpleMode=window.COLORFLEX_SIMPLE_MODE===true;if(!isSimpleMode){// Standard wallpaper mode - use default wallpaper dimensions
dom.roomMockup.style.cssText="width: 700px; height: 600px; position: relative; background: #434341;";}ensureButtonsAfterUpdate();case 17:return _context1.a(2);}},_callee8,null,[[13,14]]);}));return function processOverlay(){return _ref17.apply(this,arguments);};}();_context10.n=8;return processOverlay()["catch"](function(err){return console.error("Error processing room mockup:",err);});case 8:_context10.n=10;break;case 9:_context10.p=9;_t5=_context10.v;console.error("Error in updateRoomMockup:",_t5);// Loading indicator removed
case 10:return _context10.a(2);}},_callee9,null,[[0,9]]);}));return function updateRoomMockup(){return _ref14.apply(this,arguments);};}();// GUARD / TRACE WRAPPER
if(USE_GUARD&&DEBUG_TRACE){updateRoomMockup=guard(traceWrapper(updateRoomMockup,"updateRoomMockup"));}else if(USE_GUARD){updateRoomMockup=guard(updateRoomMockup,"updateRoomMockup");}// ✅ Track previous furniture type to prevent unnecessary background reloads
var previousFurnitureType=null;var updateFurniturePreview=/*#__PURE__*/function(){var _ref18=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee0(){var isFurnitureSimpleMode,layerMapping,_appState$furnitureCo2,currentFurnitureType,oldFurnitureType,furnitureTypeChanged,isSimpleModeForZoom,frozenZoomState,preservedSettings,isSimpleMode,_isFurnitureSimpleMode,currentPattern,_appState$selectedCol51,collectionName,_currentPattern$mocku,firstKey,firstType,hasNestedMockupLayers,_selectedFurnitureType,furnitureTypeLayers,normalizedScale,scaleLayers,scaleWithZero,scaleWithoutZero,_scaleLayers$,fallbackLayers,sofaCapitol,scale1Layers,canvas,isFurnitureMode,_ctx4,collection,pattern,selectedFurnitureType,furnitureTypeToConfigKey,furnitureConfigKey,furniture,testPaths,_layerMapping,_appState$currentLaye10,_layersToRender,_layersToRender2,_appState$currentLaye15,shouldReloadBackgroundImage,mockupPath,backgroundIndex,backgroundLayer,sofaBaseColor,_shadowPath,layersToRender,furnitureType,selectedScale,_furnitureTypeLayers,_normalizedScale,_scaleLayers,_fallbackLayers,werePathsConstructed,_collection,collectionBaseName,_furnitureType,patternNameSlug,baseLayers,_patternNameSlug,patternNameShort,filteredLayers,i,_appState$currentLaye11,_appState$currentLaye12,_appState$currentLaye13,_layer$path,layer,furnitureInputIndex,_appState$currentLaye14,inputLayer,layerColor,_appState$furnitureCo3,_ctx4$canvas,_ctx4$canvas2,furnitureLayerPath,_furnitureType2,_furnitureConfigKey,_furniture,needsConversion,patternSlug,_collectionName,fileName,originalFileName,scaleMatch,extractedScale,layerMatch,layerNum,layerLabel,_layerMatch,_layerNum,_layerLabel,_collectionBaseName2,finalFileName,scaleToUse,baseFileName,_baseFileName,normalizedPath,shadowPath,extrasLayer,extrasColor,wallColor,dataUrl,img,forceSize,_isFurnitureMode2,isClothingMode,_isFurnitureSimpleMode2,mockupWidth,mockupHeight,_t6,_t7,_t8,_t9,_t0,_t1,_t10,_t11;return _regenerator().w(function(_context11){while(1)switch(_context11.p=_context11.n){case 0:// ✅ CRITICAL: Set container size FIRST before anything else (for furniture simple mode)
// This ensures ALL furniture collections get 800x600, not just Cottage Sketchbook
isFurnitureSimpleMode=window.COLORFLEX_SIMPLE_MODE===true&&window.COLORFLEX_MODE==='FURNITURE';if(isFurnitureSimpleMode&&dom.roomMockup){// ✅ AGGRESSIVE: Set width multiple times and remove any CSS variable references
dom.roomMockup.style.removeProperty('--mockup-width');dom.roomMockup.style.setProperty('width','800px','important');dom.roomMockup.style.setProperty('height','600px','important');dom.roomMockup.style.setProperty('overflow','visible','important');// Show full couch
dom.roomMockup.style.setProperty('max-width','800px','important');dom.roomMockup.style.setProperty('min-width','800px','important');console.log('✅ Furniture simple mode: Set container to 800×600 with visible overflow at START of updateFurniturePreview');// Also set it after a short delay to override any CSS that loads later
setTimeout(function(){if(dom.roomMockup){dom.roomMockup.style.setProperty('width','800px','important');dom.roomMockup.style.setProperty('height','600px','important');dom.roomMockup.style.setProperty('max-width','800px','important');dom.roomMockup.style.setProperty('min-width','800px','important');}},50);}// Add this at the start of updateFurniturePreview()
layerMapping=getLayerMappingForPreview(true);console.log("🔍 LAYER MAPPING DEBUG IN FURNITURE PREVIEW:");console.log("  wallIndex:",layerMapping.wallIndex);console.log("  backgroundIndex:",layerMapping.backgroundIndex);console.log("  patternStartIndex:",layerMapping.patternStartIndex);console.log("  Expected: wallIndex=0, backgroundIndex=1, patternStartIndex=2");_context11.p=1;console.log("🛋️ =========================");console.log("🛋️ Starting furniture preview");console.log("🛋️ =========================");// ✅ Check if furniture type changed - only reload background if it did
currentFurnitureType=appState.selectedFurnitureType||'Sofa-Capitol';oldFurnitureType=previousFurnitureType;// Save old value before updating
furnitureTypeChanged=previousFurnitureType!==null&&previousFurnitureType!==currentFurnitureType;// Update tracking variable AFTER checking
previousFurnitureType=currentFurnitureType;if(furnitureTypeChanged){console.log("\uD83D\uDD04 Furniture type changed from ".concat(oldFurnitureType," to ").concat(currentFurnitureType," - will reload background"));}else if(oldFurnitureType===null){console.log("\uD83D\uDD04 First render - will load background for ".concat(currentFurnitureType));}else{console.log("\u2705 Furniture type unchanged (".concat(currentFurnitureType,") - background will not reload"));}// ✅ FIX: In simple mode, use scale 1.0 for all layers to ensure proper sizing
isSimpleModeForZoom=window.COLORFLEX_SIMPLE_MODE===true;frozenZoomState={scale:isSimpleModeForZoom?1.0:furnitureViewSettings.scale,offsetX:isSimpleModeForZoom?0:furnitureViewSettings.offsetX,offsetY:isSimpleModeForZoom?0:furnitureViewSettings.offsetY,isZoomed:false,timestamp:Date.now()};console.log("🔒 FROZEN zoom state for all layers:",frozenZoomState);// 🔍 ADD THIS DEBUG LINE:
console.log("🔍 ENTRY POINT - Current furnitureViewSettings:",JSON.stringify(furnitureViewSettings,null,2));// ✅ PRESERVE ZOOM SETTINGS ONCE AT THE START
preservedSettings={scale:furnitureViewSettings.scale,offsetX:furnitureViewSettings.offsetX,offsetY:furnitureViewSettings.offsetY,isZoomed:furnitureViewSettings.isZoomed};console.log("🔒 Preserved zoom settings:",preservedSettings);// Basic validation
if(dom.roomMockup){_context11.n=2;break;}console.error("❌ roomMockup element not found in DOM");return _context11.a(2);case 2:if(appState.currentPattern){_context11.n=3;break;}console.error("❌ No current pattern selected");return _context11.a(2);case 3:if(furnitureConfig){_context11.n=4;break;}console.log("🔄 Loading furniture config...");_context11.n=4;return loadFurnitureConfig();case 4:if(furnitureConfig){_context11.n=5;break;}console.error("❌ furnitureConfig still not loaded after attempt");return _context11.a(2);case 5:// ===== MULTI-SCALE FURNITURE: Only for furniture-simple page =====
// ✅ CRITICAL: Only use multi-resolution in FURNITURE-SIMPLE MODE
// Standard furniture page (colorflex-furniture) uses single-scale array format
isSimpleMode=window.COLORFLEX_SIMPLE_MODE===true;// ✅ CRITICAL: Distinguish furniture-simple from clothing-simple
_isFurnitureSimpleMode=isSimpleMode&&(window.COLORFLEX_MODE==='FURNITURE'||window.location.pathname.includes('furniture'));currentPattern=appState.currentPattern;// ✅ ONLY process multi-res if in FURNITURE-SIMPLE MODE
// Standard furniture page (colorflex-furniture) uses single-scale array format (like Folksie)
if(_isFurnitureSimpleMode){// ✅ ENHANCED DEBUG LOGGING FOR FOLKSIE INVESTIGATION (ONLY IN SIMPLE MODE)
collectionName=((_appState$selectedCol51=appState.selectedCollection)===null||_appState$selectedCol51===void 0?void 0:_appState$selectedCol51.name)||'unknown';console.log("🔍 ========================================");console.log("🔍 MULTI-RES DEBUG - FURNITURE-SIMPLE MODE ONLY");console.log("🔍 ========================================");console.log("  Collection name:",collectionName);console.log("  Pattern name:",currentPattern===null||currentPattern===void 0?void 0:currentPattern.name);console.log("  isFurnitureSimpleMode:",_isFurnitureSimpleMode);console.log("  window.COLORFLEX_SIMPLE_MODE:",window.COLORFLEX_SIMPLE_MODE);console.log("  window.COLORFLEX_MODE:",window.COLORFLEX_MODE);console.log("  mockupLayers exists:",!!(currentPattern!==null&&currentPattern!==void 0&&currentPattern.mockupLayers));console.log("  mockupLayers type:",_typeof(currentPattern===null||currentPattern===void 0?void 0:currentPattern.mockupLayers));console.log("  mockupLayers is array:",Array.isArray(currentPattern===null||currentPattern===void 0?void 0:currentPattern.mockupLayers));// Show structure details
if(currentPattern!==null&&currentPattern!==void 0&&currentPattern.mockupLayers){if(Array.isArray(currentPattern.mockupLayers)){console.log("  📋 mockupLayers is ARRAY format (old format like Folksie)");console.log("  📋 Array length:",currentPattern.mockupLayers.length);if(currentPattern.mockupLayers.length>0){console.log("  📋 First layer sample:",{path:((_currentPattern$mocku=currentPattern.mockupLayers[0])===null||_currentPattern$mocku===void 0?void 0:_currentPattern$mocku.path)||'N/A',type:_typeof(currentPattern.mockupLayers[0])});}}else{console.log("  📋 mockupLayers is OBJECT format (new nested multi-res format)");console.log("  📋 Top-level keys:",Object.keys(currentPattern.mockupLayers));// Show first furniture type structure if available
firstKey=Object.keys(currentPattern.mockupLayers)[0];if(firstKey){firstType=currentPattern.mockupLayers[firstKey];if(_typeof(firstType)==='object'&&!Array.isArray(firstType)){console.log("  \uD83D\uDCCB First type \"".concat(firstKey,"\" has scales:"),Object.keys(firstType));}}}}else{console.log("  ⚠️ mockupLayers is MISSING or NULL");}console.log("  _originalMockupLayers exists:",!!(currentPattern!==null&&currentPattern!==void 0&&currentPattern._originalMockupLayers));if(currentPattern!==null&&currentPattern!==void 0&&currentPattern._originalMockupLayers){console.log("  _originalMockupLayers type:",_typeof(currentPattern._originalMockupLayers));console.log("  _originalMockupLayers is array:",Array.isArray(currentPattern._originalMockupLayers));if(!Array.isArray(currentPattern._originalMockupLayers)){console.log("  _originalMockupLayers keys:",Object.keys(currentPattern._originalMockupLayers));}}console.log("  ✅ IN FURNITURE-SIMPLE MODE - checking for multi-res structure");// ✅ FIX: Check both mockupLayers (if not yet flattened) OR _originalMockupLayers (if already flattened)
hasNestedMockupLayers=currentPattern._originalMockupLayers&&_typeof(currentPattern._originalMockupLayers)==='object'&&!Array.isArray(currentPattern._originalMockupLayers)||currentPattern.mockupLayers&&_typeof(currentPattern.mockupLayers)==='object'&&!Array.isArray(currentPattern.mockupLayers);console.log("  🔍 hasNestedMockupLayers:",hasNestedMockupLayers);console.log("  🔍 Detection breakdown:");console.log("    - _originalMockupLayers check:",!!currentPattern._originalMockupLayers&&_typeof(currentPattern._originalMockupLayers)==='object'&&!Array.isArray(currentPattern._originalMockupLayers));console.log("    - mockupLayers check:",!!currentPattern.mockupLayers&&_typeof(currentPattern.mockupLayers)==='object'&&!Array.isArray(currentPattern.mockupLayers));if(hasNestedMockupLayers){console.log("🪑 MULTI-SCALE FURNITURE (SIMPLE MODE): Flattening nested mockupLayers");// Initialize furniture scale and type if not set
if(!appState.selectedFurnitureScale){appState.selectedFurnitureScale=window.FURNITURE_DEFAULT_SCALE||"1.0";console.log("  \uD83D\uDD27 Initialized selectedFurnitureScale to: ".concat(appState.selectedFurnitureScale));}// ✅ FIX: Ensure selectedFurnitureScale is a string (not number) to match JSON keys
if(typeof appState.selectedFurnitureScale==='number'){appState.selectedFurnitureScale=appState.selectedFurnitureScale.toString();}// Remove "X" suffix if present
if(typeof appState.selectedFurnitureScale==='string'){appState.selectedFurnitureScale=appState.selectedFurnitureScale.replace(/X$/i,'');}if(!appState.selectedFurnitureType){appState.selectedFurnitureType=window.FURNITURE_DEFAULT_TYPE||"Sofa-Capitol";console.log("  \uD83D\uDD27 Initialized selectedFurnitureType to: ".concat(appState.selectedFurnitureType));}// ✅ CRITICAL FIX: Save original nested structure BEFORE it gets flattened
// Use _originalMockupLayers if it exists (already saved), otherwise save from mockupLayers
if(!currentPattern._originalMockupLayers){if(Array.isArray(currentPattern.mockupLayers)){// mockupLayers was already flattened, but we don't have the original
// This shouldn't happen for new format collections in simple mode
console.warn("⚠️ mockupLayers is already an array but _originalMockupLayers doesn't exist");console.warn("⚠️ This pattern may be using the old array format (like Folksie)");console.log("⚠️ NOT multi-scale furniture - using array format directly");console.log("  📍 PATH: Folksie-style array format detected - skipping multi-res processing");}else{// mockupLayers is still nested, save it NOW before any flattening
currentPattern._originalMockupLayers=JSON.parse(JSON.stringify(currentPattern.mockupLayers));// Deep copy
console.log("\uD83D\uDCBE Saved original nested mockupLayers structure");console.log("  Available types:",Object.keys(currentPattern._originalMockupLayers));}}else{console.log("\u2705 Using existing _originalMockupLayers structure");console.log("  Available types:",Object.keys(currentPattern._originalMockupLayers));}// ✅ Only proceed if we have _originalMockupLayers (nested structure)
if(currentPattern._originalMockupLayers){// Get the correct furniture type's layers
_selectedFurnitureType=appState.selectedFurnitureType;console.log("\uD83D\uDECB\uFE0F Selected furniture type: ".concat(_selectedFurnitureType));console.log("\uD83D\uDCCF Selected furniture scale: ".concat(appState.selectedFurnitureScale));furnitureTypeLayers=currentPattern._originalMockupLayers[_selectedFurnitureType];if(furnitureTypeLayers){console.log("  Available scales for ".concat(_selectedFurnitureType,":"),Object.keys(furnitureTypeLayers));// ✅ NORMALIZE SCALE: Remove "X" suffix and ensure string format to match JSON keys
normalizedScale=appState.selectedFurnitureScale;if(typeof normalizedScale==='number'){normalizedScale=normalizedScale.toString();}else if(typeof normalizedScale==='string'){// Remove "X" suffix if present (e.g., "1.5X" -> "1.5")
normalizedScale=normalizedScale.replace(/X$/i,'');}console.log("  \uD83D\uDD0D Normalized scale: \"".concat(normalizedScale,"\" (from: ").concat(appState.selectedFurnitureScale,")"));console.log("  \uD83D\uDD0D Available scale keys in JSON:",Object.keys(furnitureTypeLayers));console.log("  \uD83D\uDD0D Looking for scale: \"".concat(normalizedScale,"\""));// ✅ FIX: Try multiple scale formats to match JSON keys
// JSON might have "1.0", "1.5", "2.0" or "1", "1.5", "2"
scaleLayers=furnitureTypeLayers[normalizedScale];// If not found, try alternative formats
if(!scaleLayers){console.log("  \u26A0\uFE0F Scale \"".concat(normalizedScale,"\" not found, trying alternatives..."));// ✅ FIX: Handle 0.5 scale - it might be stored as "0.5" or "0.50" in JSON
if(normalizedScale==='0.5'){scaleLayers=furnitureTypeLayers['0.5']||furnitureTypeLayers['0.50'];if(scaleLayers){console.log("  \u2705 Found 0.5 scale (tried both \"0.5\" and \"0.50\")");}else{console.log("  \u274C 0.5 scale not found in JSON");}}// Try with ".0" suffix (e.g., "1" -> "1.0")
if(!scaleLayers&&!normalizedScale.includes('.')){scaleWithZero=normalizedScale+'.0';scaleLayers=furnitureTypeLayers[scaleWithZero];if(scaleLayers){console.log("  \u2705 Found scale with .0 suffix: \"".concat(scaleWithZero,"\""));}else{console.log("  \u274C Scale \"".concat(scaleWithZero,"\" also not found"));}}// Try without ".0" suffix (e.g., "1.0" -> "1")
if(!scaleLayers&&normalizedScale.endsWith('.0')){scaleWithoutZero=normalizedScale.replace(/\.0$/,'');scaleLayers=furnitureTypeLayers[scaleWithoutZero];if(scaleLayers){console.log("  \u2705 Found scale without .0 suffix: \"".concat(scaleWithoutZero,"\""));}else{console.log("  \u274C Scale \"".concat(scaleWithoutZero,"\" also not found"));}}}else{console.log("  \u2705 Found scale \"".concat(normalizedScale,"\" directly"));}if(scaleLayers&&scaleLayers.length>0){currentPattern.mockupLayers=scaleLayers;console.log("\uD83E\uDE91 \u2705 Using ".concat(scaleLayers.length," layer(s) for ").concat(_selectedFurnitureType," @ ").concat(normalizedScale,"X"));console.log("  \uD83D\uDCCD First layer path: ".concat(((_scaleLayers$=scaleLayers[0])===null||_scaleLayers$===void 0?void 0:_scaleLayers$.path)||scaleLayers[0]||'N/A'));console.log("  📍 PATH: Multi-res layers successfully applied");}else{console.error("\u274C No layers for scale: ".concat(normalizedScale," (normalized from: ").concat(appState.selectedFurnitureScale,")"));console.error("  Available scales in JSON:",Object.keys(furnitureTypeLayers));console.error("  📍 PATH: Multi-res FAILED - scale not found, falling back to 1.0");// ✅ FALLBACK: Try 1.0 scale if selected scale not found
fallbackLayers=furnitureTypeLayers["1.0"]||furnitureTypeLayers["1"];if(fallbackLayers&&fallbackLayers.length>0){currentPattern.mockupLayers=fallbackLayers;appState.selectedFurnitureScale="1.0";// Update to match what we're using
console.log("\uD83E\uDE91 \u26A0\uFE0F Using fallback 1.0X scale (".concat(fallbackLayers.length," layers)"));}else{console.error("  \u274C Even fallback 1.0 scale not found!");}}}else{console.error("\u274C No mockupLayers for furniture type: ".concat(_selectedFurnitureType));console.log("Available types:",Object.keys(currentPattern._originalMockupLayers));console.log("  📍 PATH: Multi-res FAILED - furniture type not found");}}else{console.log("  📍 PATH: No _originalMockupLayers - using existing mockupLayers array (Folksie-style)");}}else{console.log("⚠️ NOT multi-scale furniture (mockupLayers is array or missing) - using single-scale format");console.log("  📍 PATH: Single-scale array format (Folksie-style) - proceeding with existing mockupLayers");console.log("  \uD83D\uDCCD mockupLayers will be used as-is (".concat(Array.isArray(currentPattern===null||currentPattern===void 0?void 0:currentPattern.mockupLayers)?'array':'missing',")"));}// ✅ END MULTI-RES DEBUG (ONLY IN SIMPLE MODE)
console.log("🔍 ========================================");console.log("🔍 END MULTI-RES DEBUG (FURNITURE-SIMPLE ONLY)");console.log("🔍 ========================================");console.log("  Final mockupLayers type:",_typeof(currentPattern===null||currentPattern===void 0?void 0:currentPattern.mockupLayers));console.log("  Final mockupLayers is array:",Array.isArray(currentPattern===null||currentPattern===void 0?void 0:currentPattern.mockupLayers));if(Array.isArray(currentPattern===null||currentPattern===void 0?void 0:currentPattern.mockupLayers)){console.log("  Final mockupLayers length:",currentPattern.mockupLayers.length);}}else{// ✅ STANDARD FURNITURE MODE: Use single-scale array format (like Folksie)
// NO DEBUG LOGGING - Keep standard mode clean and separate from simple mode
// ✅ CRITICAL FIX: Convert multi-res format to array format for standard furniture page
if(!currentPattern.mockupLayers){console.warn("\u26A0\uFE0F Pattern \"".concat(currentPattern.name,"\" has no mockupLayers - will skip mockup rendering"));currentPattern.mockupLayers=[];}else if(!Array.isArray(currentPattern.mockupLayers)){console.warn("⚠️ Standard furniture mode expects array format, but mockupLayers is not an array");console.log("  🔄 Attempting to convert multi-res format to array format...");// Check if it's multi-res format (nested object)
if(_typeof(currentPattern.mockupLayers)==='object'){// Try to extract 1.0 scale from Sofa-Capitol
sofaCapitol=currentPattern.mockupLayers["Sofa-Capitol"];if(sofaCapitol&&sofaCapitol["1.0"]&&Array.isArray(sofaCapitol["1.0"])){// Convert to array of path strings (relative paths)
scale1Layers=sofaCapitol["1.0"];currentPattern.mockupLayers=scale1Layers.map(function(layer){// Convert absolute URL to relative path
if(layer&&layer.path&&layer.path.startsWith('https://')){var match=layer.path.match(/\/data\/.*$/);if(match){return'.'+match[0];}return layer.path;}// Handle if layer is already a string
return layer&&layer.path?layer.path:layer;});console.log("  \u2705 Converted multi-res to array format: ".concat(currentPattern.mockupLayers.length," layers"));}else{console.error("  ❌ Cannot convert: No 1.0 scale layers found for Sofa-Capitol");console.log("  Available keys in mockupLayers:",Object.keys(currentPattern.mockupLayers));if(sofaCapitol){console.log("  Available scales in Sofa-Capitol:",Object.keys(sofaCapitol));}// Set to empty array to prevent errors, but pattern will still be visible
currentPattern.mockupLayers=[];}}else{console.error("  ❌ Cannot convert: mockupLayers is not in expected format");currentPattern.mockupLayers=[];}}else{console.log("  \u2705 mockupLayers is array with ".concat(currentPattern.mockupLayers.length," layer(s)"));}}// Setup canvas
canvas=document.createElement("canvas");// Simple mode furniture: 800x600 (original spec - larger for better detail)
// Simple mode clothing: 700x700 (square for garments)
// Standard mode: 600x450
// ✅ isSimpleMode already declared at line 12764, reuse it
isFurnitureMode=window.COLORFLEX_MODE==='FURNITURE';// ✅ Keep canvas at 800x600 for furniture simple mode
canvas.width=isSimpleMode?isFurnitureMode?800:700:600;canvas.height=isSimpleMode?isFurnitureMode?600:700:450;console.log("\uD83D\uDDBC\uFE0F Canvas size: ".concat(canvas.width,"x").concat(canvas.height," (").concat(isSimpleMode?'SIMPLE':'STANDARD'," mode, ").concat(isFurnitureMode?'FURNITURE':'OTHER',")"));_ctx4=canvas.getContext("2d");// ✅ FIX: Enable image smoothing to prevent aliasing
_ctx4.imageSmoothingEnabled=true;_ctx4.imageSmoothingQuality="high";// Get collection and pattern data
collection=appState.selectedCollection;pattern=appState.currentPattern;selectedFurnitureType=appState.selectedFurnitureType||'Sofa-Capitol';// Map furniture type to config key (mockupLayers use 'Sofa-Capitol', config uses 'furniture')
furnitureTypeToConfigKey={'Sofa-Capitol':'furniture','Sofa-Kite':'furniture-kite'};furnitureConfigKey=furnitureTypeToConfigKey[selectedFurnitureType]||'furniture';furniture=(_appState$furnitureCo2=appState.furnitureConfig)===null||_appState$furnitureCo2===void 0?void 0:_appState$furnitureCo2[furnitureConfigKey];console.log("\uD83E\uDE91 Furniture type: ".concat(selectedFurnitureType," -> config key: ").concat(furnitureConfigKey));// Debug furniture config
console.log("🔍 FURNITURE CONFIG DEBUG:");console.log("  Collection name:",collection===null||collection===void 0?void 0:collection.name);console.log("  Furniture type:",selectedFurnitureType,"-> config key:",furnitureConfigKey);console.log("  Available furniture configs:",Object.keys(appState.furnitureConfig||{}));console.log("  Selected furniture config exists:",!!furniture);if(furniture){_context11.n=6;break;}console.error("❌ No furniture config found for:",furnitureConfigKey);console.log("Available configs:",Object.keys(appState.furnitureConfig||{}));return _context11.a(2);case 6:// Debug furniture paths
console.log("🔍 FURNITURE PATHS DEBUG:");console.log("  Mockup path:",furniture.mockup);console.log("  Wall mask path:",furniture.wallMask);console.log("  Base path:",furniture.base);console.log("  Extras path:",furniture.extras);// Test if files exist
testPaths=[{name:"mockup",path:furniture.mockup},{name:"wallMask",path:furniture.wallMask},{name:"base",path:furniture.base},{name:"extras",path:furniture.extras}];console.log("🔍 TESTING FILE EXISTENCE:");testPaths.forEach(function(_ref19){var name=_ref19.name,path=_ref19.path;if(path){var testImg=new Image();testImg.onload=function(){return console.log("\u2705 ".concat(name," file exists: ").concat(path));};testImg.onerror=function(){return console.log("\u274C ".concat(name," file MISSING: ").concat(path));};testImg.src=normalizePath(path);}else{console.log("\u26A0\uFE0F ".concat(name," path not defined in config"));}});// Get layer mapping for furniture collection
_layerMapping=getLayerMappingForPreview(true);// Always true for furniture
console.log("🔍 LAYER MAPPING DEBUG:");console.log("  Layer mapping:",_layerMapping);console.log("  Total current layers:",appState.currentLayers.length);// Debug current layer assignments
console.log("🔍 CURRENT LAYER ASSIGNMENTS:");appState.currentLayers.forEach(function(layer,index){var usage="unused";if(index===_layerMapping.wallIndex)usage="wall color";else if(index===_layerMapping.backgroundIndex)usage="sofa base color";else if(index>=_layerMapping.patternStartIndex)usage="pattern layer ".concat(index-_layerMapping.patternStartIndex);console.log("  ".concat(index,": ").concat(layer.label," = \"").concat(layer.color,"\" (").concat(usage,")"));});// Clear canvas with white background
_ctx4.fillStyle="transparent";_ctx4.fillRect(0,0,canvas.width,canvas.height);console.log("🧹 Canvas cleared with white background");_ctx4.clearRect(0,0,canvas.width,canvas.height);_ctx4.fillStyle="#F5F5F5";_ctx4.fillRect(0,0,canvas.width,canvas.height);// ❌ REMOVED: The problematic settings update that was resetting zoom
// NO LONGER UPDATING furnitureViewSettings here - using preserved settings
console.log("🔍 FURNITURE VIEW SETTINGS:");console.log("  Scale:",furnitureViewSettings.scale);console.log("  Offset X:",furnitureViewSettings.offsetX);console.log("  Offset Y:",furnitureViewSettings.offsetY);_context11.p=7;console.log("🏗️ =========================");console.log("🏗️ FURNITURE RENDERING SEQUENCE (WITH WALL MASK)");console.log("🏗️ =========================");// ✅ CRITICAL: Set flag to prevent other render functions from interfering
appState.isFurnitureCompositing=true;console.log("🔒 Furniture compositing flag set - preventing other renders from interfering");// ===== STEP 1: Draw room mockup base =====
// ✅ FIX: Always redraw background (it gets cleared above), but only reload image if furniture type changed
// Use oldFurnitureType (saved before update) to check if we need to reload the image
shouldReloadBackgroundImage=oldFurnitureType===null||oldFurnitureType!==currentFurnitureType;// ✅ CRITICAL: Always draw background layer (canvas was cleared), but only reload image if furniture type changed
// This ensures background is preserved when only wall color changes
if(shouldReloadBackgroundImage){console.log("1\uFE0F\u20E3 Drawing mockup base (room scene) - furniture type changed from ".concat(oldFurnitureType||'none'," to ").concat(currentFurnitureType,", reloading background image"));}else{console.log("1\uFE0F\u20E3 Drawing mockup base (room scene) - furniture type unchanged (".concat(currentFurnitureType,"), redrawing existing background"));}mockupPath=furniture.mockup;if(!mockupPath){_context11.n=9;break;}console.log("  Mockup path:",mockupPath);// ✅ FIX: Use same zoom state as other furniture layers for consistent scaling
_context11.n=8;return drawFurnitureLayer(_ctx4,mockupPath,{zoomState:frozenZoomState})["catch"](function(err){console.error("❌ Failed to load mockup:",err);_ctx4.fillStyle="#E5E7EB";_ctx4.fillRect(0,0,canvas.width,canvas.height);console.log("🔄 Drew fallback background due to mockup failure");});case 8:console.log("✅ Room mockup base drawn");_context11.n=10;break;case 9:console.error("❌ No mockup path in furniture config");_ctx4.fillStyle="#E5E7EB";_ctx4.fillRect(0,0,canvas.width,canvas.height);case 10:// ===== STEP 2: Draw sofa base =====
console.log("2️⃣ Drawing sofa base - USING MAPPING");// ✅ Use the layer mapping to get the correct background index
backgroundIndex=_layerMapping.backgroundIndex;backgroundLayer=appState.currentLayers[backgroundIndex];sofaBaseColor=resolveColor((backgroundLayer===null||backgroundLayer===void 0?void 0:backgroundLayer.color)||"#FAFAFA");// ✅ ENHANCED DEBUG - Let's catch the bug red-handed
console.log("🔍 SOFA BASE COLOR RESOLUTION DEBUG:");console.log("  backgroundIndex:",backgroundIndex);console.log("  backgroundLayer:",backgroundLayer);console.log("  backgroundLayer.label:",backgroundLayer===null||backgroundLayer===void 0?void 0:backgroundLayer.label);console.log("  backgroundLayer.color:",backgroundLayer===null||backgroundLayer===void 0?void 0:backgroundLayer.color);console.log("  sofaBaseColor resolved to:",sofaBaseColor);// ✅ ALSO CHECK: What does resolveColor actually return?
console.log("  resolveColor direct test:",resolveColor(backgroundLayer===null||backgroundLayer===void 0?void 0:backgroundLayer.color));console.log("  lookupColor direct test:",lookupColor(backgroundLayer===null||backgroundLayer===void 0?void 0:backgroundLayer.color));console.log("  Sofa base color from input ".concat(backgroundIndex," (").concat((_appState$currentLaye10=appState.currentLayers[backgroundIndex])===null||_appState$currentLaye10===void 0?void 0:_appState$currentLaye10.label,"): ").concat(sofaBaseColor));if(!furniture.base){_context11.n=16;break;}console.log("  🛋️ Sofa base path exists:",furniture.base);console.log("  🛋️ Calling drawFurnitureLayer for sofa base...");// ✅ ENSURE SOFA BASE COMPLETES BEFORE PATTERNS
console.log("🐛 ABOUT TO DRAW SOFA BASE:");console.log("  furniture.base path:",furniture.base);console.log("  Should be: data/furniture/sofa-capitol/sofa-capitol-base.png");console.log("  Tint color:",sofaBaseColor);_context11.p=11;_context11.n=12;return drawFurnitureLayer(_ctx4,furniture.base,{tintColor:sofaBaseColor,zoomState:frozenZoomState});case 12:console.log("  ✅ Sofa base step completed - CONFIRMED");_context11.n=14;break;case 13:_context11.p=13;_t6=_context11.v;console.error("  ❌ Sofa base failed:",_t6);case 14:// ✅ Then: Add shadow layer with multiply blend (no UI input needed)
_shadowPath=furniture.baseShadow||furniture.base.replace(/base.*\.png/,'base-shadow.png');console.log("  🌚 Adding sofa base shadow...");_context11.n=15;return drawFurnitureLayer(_ctx4,_shadowPath,{tintColor:null,// No tinting for shadow
zoomState:frozenZoomState,blendMode:"multiply",// Multiply blend for shadow
opacity:0.7// Adjust shadow intensity
});case 15:console.log("  ✅ Sofa base shadow completed");_context11.n=17;break;case 16:console.error("❌ No base path in furniture config");case 17:// ✅ ADD DELAY TO ENSURE SOFA BASE IS FULLY RENDERED
console.log("⏳ Waiting for sofa base to complete before patterns...");_context11.n=18;return new Promise(function(resolve){return setTimeout(resolve,50);});case 18:// ===== STEP 3: Draw pattern layers =====
console.log("3️⃣ Drawing pattern layers - ENHANCED DEBUG");// 🪑 FURNITURE MODE: Construct mockupLayers on-the-fly from base collection structure
// ✅ SIMPLIFIED APPROACH: Always construct furniture paths dynamically instead of maintaining nested JSON
layersToRender=null;furnitureType=appState.selectedFurnitureType||'Sofa-Capitol';selectedScale=appState.selectedFurnitureScale||'1.0';// ✅ FIRST: Check if we have pre-defined mockupLayers (for backwards compatibility)
if(currentPattern.mockupLayers&&_typeof(currentPattern.mockupLayers)==='object'&&!Array.isArray(currentPattern.mockupLayers)){console.log("  \uD83D\uDD0D mockupLayers is nested object (multi-res format) - extracting layers");_furnitureTypeLayers=currentPattern.mockupLayers[furnitureType];if(_furnitureTypeLayers&&_typeof(_furnitureTypeLayers)==='object'){// Normalize scale (remove "X" suffix, ensure string format)
_normalizedScale=selectedScale;if(typeof _normalizedScale==='number'){_normalizedScale=_normalizedScale.toString();}else if(typeof _normalizedScale==='string'){_normalizedScale=_normalizedScale.replace(/X$/i,'');}console.log("  \uD83D\uDD0D Looking for scale \"".concat(_normalizedScale,"\" in ").concat(furnitureType));_scaleLayers=_furnitureTypeLayers[_normalizedScale];if(_scaleLayers&&Array.isArray(_scaleLayers)){// Extract paths from layer objects (may have {path, label, index} or just be strings)
layersToRender=_scaleLayers.map(function(layer){if(typeof layer==='string'){return layer;}else if(layer&&layer.path){return layer.path;}return layer;});console.log("  \u2705 Extracted ".concat(layersToRender.length," layers from multi-res format (").concat(furnitureType," @ ").concat(_normalizedScale,"X)"));}else{console.warn("  \u26A0\uFE0F Scale \"".concat(_normalizedScale,"\" not found in ").concat(furnitureType,", trying 1.0"));// Fallback to 1.0 scale
_fallbackLayers=_furnitureTypeLayers['1.0'];if(_fallbackLayers&&Array.isArray(_fallbackLayers)){layersToRender=_fallbackLayers.map(function(layer){if(typeof layer==='string')return layer;if(layer&&layer.path)return layer.path;return layer;});console.log("  \u2705 Using fallback 1.0 scale: ".concat(layersToRender.length," layers"));}else{console.error("  \u274C No layers found for ".concat(furnitureType," at any scale"));console.log("  Available scales:",Object.keys(_furnitureTypeLayers));}}}else{console.warn("  \u26A0\uFE0F Furniture type \"".concat(furnitureType,"\" not found in mockupLayers"));console.log("  Available types:",Object.keys(currentPattern.mockupLayers));}}// ✅ SECOND: Handle array format (standard or mixed - needs filtering)
else if(currentPattern.mockupLayers&&Array.isArray(currentPattern.mockupLayers)){layersToRender=currentPattern.mockupLayers;console.log("  \uD83D\uDD0D mockupLayers is array format (".concat(layersToRender.length," items)"));}// ✅ THIRD: If mockupLayers is missing or empty, construct path from collection and furniture type
werePathsConstructed=false;if(!layersToRender||Array.isArray(layersToRender)&&layersToRender.length===0){console.warn("\u26A0\uFE0F Pattern \"".concat(currentPattern.name,"\" has no mockupLayers - constructing furniture path"));_collection=appState.selectedCollection;// ✅ CRITICAL: Normalize collection name - remove .fur, .fur-1, -fur suffixes to get base name
collectionBaseName=(_collection===null||_collection===void 0?void 0:_collection.name)||'unknown';if(collectionBaseName.includes('.fur')){collectionBaseName=collectionBaseName.replace(/\.fur(-\d+)?$/i,'');console.log("  \uD83D\uDD27 Normalized collection name: ".concat(_collection===null||_collection===void 0?void 0:_collection.name," \u2192 ").concat(collectionBaseName));}else if(collectionBaseName.includes('-fur')){collectionBaseName=collectionBaseName.replace(/-fur.*$/i,'');console.log("  \uD83D\uDD27 Normalized collection name: ".concat(_collection===null||_collection===void 0?void 0:_collection.name," \u2192 ").concat(collectionBaseName));}_furnitureType=appState.selectedFurnitureType||'Sofa-Capitol';// ✅ FIX: Use createPatternSlug to ensure correct slug generation (not currentPattern.slug which might be wrong)
patternNameSlug=createPatternSlug(currentPattern.name||currentPattern.slug||'unknown');baseLayers=currentPattern.layers||[];console.log("  \uD83D\uDD0D Construction details:");console.log("    Collection base name: ".concat(collectionBaseName));console.log("    Furniture type: ".concat(_furnitureType));console.log("    Pattern name slug: ".concat(patternNameSlug));console.log("    Base layers count: ".concat(baseLayers.length));// Construct furniture mockupLayers path: {collection-base-name}-fur/layers/{furniture-type}/{pattern-slug}_{label}_layer-{n}_scale-{scale}.png
// ✅ Standard format: -fur (not .fur-1) - all furniture pieces go under -fur collection
// ✅ FIX: Construct filename from pattern slug and layer labels, not from original filename (which might have wrong pattern name)
layersToRender=baseLayers.map(function(layer,index){// Get layer label from currentPattern.layerLabels array or layer.label property
var layerLabel=currentPattern.layerLabels&&currentPattern.layerLabels[index]?currentPattern.layerLabels[index].toLowerCase().replace(/\s+/g,'-'):layer.label?layer.label.toLowerCase().replace(/\s+/g,'-'):'layer';// Get the current furniture scale (defaults to "1.0" if not set)
var selectedScale=appState.selectedFurnitureScale||"1.0";// Ensure scale is a string and remove "X" suffix if present
var scaleString=typeof selectedScale==='string'?selectedScale.replace(/X$/i,''):selectedScale.toString();// ✅ FIX: Construct filename using pattern slug (not from original filename)
// Format: {patternSlug}_{label}_layer-{n}_scale-{scale}.png
var layerNum=index+1;var furnitureFileName="".concat(patternNameSlug,"_").concat(layerLabel,"_layer-").concat(layerNum,"_scale-").concat(scaleString,".png");var furniturePath="./data/collections/".concat(collectionBaseName,"-fur/layers/").concat(_furnitureType,"/").concat(furnitureFileName);// ✅ FIX: Normalize path to full URL immediately
var normalizedPath=normalizePath(furniturePath);console.log("  \uD83D\uDD27 Constructed furniture path: ".concat(normalizedPath," (pattern: ").concat(currentPattern.name,", slug: ").concat(patternNameSlug,", label: ").concat(layerLabel,", scale: ").concat(scaleString,")"));return normalizedPath;});werePathsConstructed=true;console.log("  \u2705 Constructed ".concat(layersToRender.length," furniture mockupLayers paths"));}// ✅ CRITICAL FIX: Filter mockupLayers array to only include layers for this specific pattern
// Some collections have all patterns' layers mixed in mockupLayers - we need to filter by pattern name
// ✅ SKIP FILTERING if we just constructed the paths (they're already correct)
if(!werePathsConstructed&&layersToRender&&Array.isArray(layersToRender)&&layersToRender.length>0){// ✅ FIX: Use currentPattern instead of undefined pattern variable
_patternNameSlug=createPatternSlug(currentPattern.name||currentPattern.slug||'unknown');patternNameShort=(currentPattern.name||'').toLowerCase().split(' ')[0];// e.g., "anneliese" from "Anneliese"
console.log("  \uD83D\uDD0D Filtering mockupLayers for pattern: ".concat(currentPattern.name," (slug: ").concat(_patternNameSlug,", short: ").concat(patternNameShort,")"));console.log("  \uD83D\uDCCB Original mockupLayers count: ".concat(layersToRender.length));// Filter to only include layers that match this pattern's name
filteredLayers=layersToRender.filter(function(layer){var layerPath=typeof layer==='string'?layer:layer.path||'';var fileName=layerPath.split('/').pop()||'';// ✅ CRITICAL: Check multiple matching strategies
// 1. Check if filename starts with pattern name (case-insensitive)
// 2. Check if filename includes pattern slug
// 3. Check if filename includes pattern name words
// 4. For furniture mockup layers, check for _pattern_ or _layer- in filename
var patternWords=patternNameShort.toLowerCase().split(/[\s-]+/);var slugWords=_patternNameSlug.toLowerCase().split(/[\s-]+/);var matchesPattern=fileName.toLowerCase().startsWith(patternNameShort.toLowerCase())||fileName.toLowerCase().includes(_patternNameSlug.toLowerCase())||patternWords.some(function(word){return word.length>2&&fileName.toLowerCase().includes(word);})||slugWords.some(function(word){return word.length>2&&fileName.toLowerCase().includes(word);})||(fileName.includes('_pattern_')||fileName.includes('_layer-'))&&(fileName.toLowerCase().includes(patternNameShort.toLowerCase().substring(0,4))||fileName.toLowerCase().includes(_patternNameSlug.toLowerCase().substring(0,4)));if(!matchesPattern){console.log("    \u274C Filtered out: ".concat(fileName));console.log("      Pattern name short: \"".concat(patternNameShort,"\""));console.log("      Pattern slug: \"".concat(_patternNameSlug,"\""));console.log("      Pattern words: ".concat(patternWords.join(', ')));}else{console.log("    \u2705 Matched: ".concat(fileName));}return matchesPattern;});if(filteredLayers.length>0){layersToRender=filteredLayers;console.log("  \u2705 Filtered to ".concat(filteredLayers.length," layers matching pattern name"));}else{console.error("  \u274C CRITICAL: No layers matched pattern name after filtering!");console.error("  \u274C This will cause NO PATTERNS to render on the sofa!");console.error("  \u274C Original layers count: ".concat(layersToRender.length));console.error("  \u274C Pattern: \"".concat(pattern.name,"\" (short: \"").concat(patternNameShort,"\", slug: \"").concat(_patternNameSlug,"\")"));console.error("  \u274C All layer filenames:",layersToRender.map(function(l){var path=typeof l==='string'?l:l.path||'';return path.split('/').pop();}).join(', '));console.warn("  \u26A0\uFE0F FALLBACK: Using all layers without filtering (may show wrong patterns)");// ✅ CRITICAL FIX: Don't filter if no matches - use all layers as fallback
// Keep original layersToRender - don't filter them out
console.log("  \u2705 Using all ".concat(layersToRender.length," layers as fallback (filter was too strict)"));}}else if(werePathsConstructed){console.log("  \u2705 Skipping filter - paths were just constructed, they're already correct");}// ✅ CRITICAL FIX: If layersToRender is still empty, try using pattern.layers as last resort
if(!layersToRender||Array.isArray(layersToRender)&&layersToRender.length===0){console.warn("  ⚠️ layersToRender is empty - trying pattern.layers as fallback");if(pattern.layers&&Array.isArray(pattern.layers)&&pattern.layers.length>0){console.log("  \u2705 Using pattern.layers as fallback (".concat(pattern.layers.length," layers)"));layersToRender=pattern.layers;}else{console.error("  ❌ CRITICAL: No pattern layers available at all!");console.error("  ❌ Pattern name:",pattern.name);console.error("  ❌ Pattern mockupLayers:",pattern.mockupLayers);console.error("  ❌ Pattern layers:",pattern.layers);}}console.log("  Total pattern layers to process: ".concat(((_layersToRender=layersToRender)===null||_layersToRender===void 0?void 0:_layersToRender.length)||0));console.log("  Using layer array: ".concat(pattern.mockupLayers?'mockupLayers (furniture)':'layers (wallpaper)'));console.log("  Pattern layer start index: ".concat(_layerMapping.patternStartIndex));console.log("  Available inputs: ".concat(appState.currentLayers.length));// Show all current inputs
console.log("  📋 ALL CURRENT INPUTS:");appState.currentLayers.forEach(function(layer,idx){console.log("    Input ".concat(idx,": ").concat(layer.label," = \"").concat(layer.color,"\""));});console.log("  🎨 PATTERN LAYER MAPPING:");console.log("  \uD83D\uDD0D Starting pattern layer rendering loop (".concat(((_layersToRender2=layersToRender)===null||_layersToRender2===void 0?void 0:_layersToRender2.length)||0," layers to process)"));if(!(!layersToRender||layersToRender.length===0)){_context11.n=19;break;}console.error("  ❌ CRITICAL: No pattern layers to render! layersToRender is empty!");console.error("  ❌ This means patterns will NOT appear on the sofa!");console.error("  ❌ Pattern name:",pattern.name);console.error("  ❌ Pattern mockupLayers:",pattern.mockupLayers);console.error("  ❌ Pattern layers:",pattern.layers);return _context11.a(2);case 19:console.log("  ✅ Pattern layers found, will render:",layersToRender.map(function(l){return typeof l==='string'?l:(l===null||l===void 0?void 0:l.path)||l;}).join(', '));case 20:i=0;case 21:if(!(i<layersToRender.length)){_context11.n=29;break;}console.log("  \uD83D\uDD04 Processing pattern layer ".concat(i+1,"/").concat(layersToRender.length));layer=typeof layersToRender[i]==='string'?{path:layersToRender[i]}:layersToRender[i];furnitureInputIndex=_layerMapping.patternStartIndex+i;// ✅ CRITICAL: Verify bounds and layer existence
console.log("  \uD83D\uDD0D LAYER MAPPING CHECK:");console.log("    Pattern layer index: ".concat(i));console.log("    patternStartIndex: ".concat(_layerMapping.patternStartIndex));console.log("    Calculated furnitureInputIndex: ".concat(furnitureInputIndex));console.log("    appState.currentLayers.length: ".concat(((_appState$currentLaye11=appState.currentLayers)===null||_appState$currentLaye11===void 0?void 0:_appState$currentLaye11.length)||0));console.log("    Available layers:",((_appState$currentLaye12=appState.currentLayers)===null||_appState$currentLaye12===void 0?void 0:_appState$currentLaye12.map(function(l,idx){return"".concat(idx,": ").concat((l===null||l===void 0?void 0:l.label)||'undefined');}).join(', '))||'none');if(!(furnitureInputIndex>=(((_appState$currentLaye13=appState.currentLayers)===null||_appState$currentLaye13===void 0?void 0:_appState$currentLaye13.length)||0))){_context11.n=22;break;}console.error("  \u274C CRITICAL: furnitureInputIndex ".concat(furnitureInputIndex," is out of bounds!"));console.error("  \u274C currentLayers only has ".concat(((_appState$currentLaye14=appState.currentLayers)===null||_appState$currentLaye14===void 0?void 0:_appState$currentLaye14.length)||0," elements"));console.error("  \u274C This pattern layer will be skipped!");return _context11.a(3,28);case 22:inputLayer=appState.currentLayers[furnitureInputIndex];layerColor=resolveColor((inputLayer===null||inputLayer===void 0?void 0:inputLayer.color)||"Snowbound");console.log("  \uD83D\uDCD0 Pattern layer ".concat(i,":"));console.log("    Layer path: ".concat((_layer$path=layer.path)===null||_layer$path===void 0?void 0:_layer$path.split('/').pop()));console.log("    Full layer path: ".concat(layer.path));console.log("    Maps to input ".concat(furnitureInputIndex,": ").concat((inputLayer===null||inputLayer===void 0?void 0:inputLayer.label)||'MISSING'," = \"").concat((inputLayer===null||inputLayer===void 0?void 0:inputLayer.color)||'MISSING',"\""));console.log("    Resolved color: ".concat(layerColor));console.log("    Input exists: ".concat(!!inputLayer));if(!(layerColor&&layer.path)){_context11.n=27;break;}_context11.p=23;// Convert layer path to match selected furniture type
furnitureLayerPath=layer.path;_furnitureType2=appState.selectedFurnitureType||'Sofa-Capitol';_furnitureConfigKey=_furnitureType2==='Sofa-Capitol'?'furniture':'furniture-kite';_furniture=(_appState$furnitureCo3=appState.furnitureConfig)===null||_appState$furnitureCo3===void 0?void 0:_appState$furnitureCo3[_furnitureConfigKey];// Debug logging
console.log("    \uD83D\uDD0D Path conversion check for layer ".concat(i,":"));console.log("      Full path: ".concat(layer.path));console.log("      Selected furniture: ".concat(_furnitureType2," (config key: ").concat(_furnitureConfigKey,")"));console.log("      Has mockupLayers: ".concat(!!currentPattern.mockupLayers));console.log("      Template: ".concat(_furniture===null||_furniture===void 0?void 0:_furniture.patternPathTemplate));// Check if we need to convert the path
needsConversion=!currentPattern.mockupLayers||// No mockupLayers (using wallpaper)
(_furniture===null||_furniture===void 0?void 0:_furniture.patternPathTemplate)&&layer.path.includes('/furniture/')&&!layer.path.includes(_furniture.patternPathTemplate.split('/')[2]);// Wrong furniture type
console.log("      Needs conversion: ".concat(needsConversion));if(needsConversion&&_furniture!==null&&_furniture!==void 0&&_furniture.patternPathTemplate){// Extract pattern and collection info
// ✅ FIX: Use createPatternSlug to ensure correct slug generation (not currentPattern.slug which might be wrong)
patternSlug=createPatternSlug(currentPattern.name||currentPattern.slug||'unknown');// ✅ Standard format: .fur (not .fur-1) - all furniture pieces go under .fur collection
_collectionName=collection.name.replace(/\.fur$/i,'');// Remove .fur (standard)
if(_collectionName===collection.name){_collectionName=collection.name.replace(/\.fur-\d+$/i,'');// Fallback: .fur-1 (backwards compat)
}// ✅ FIX: Extract filename and preserve the scale from the original path
fileName=layer.path.split('/').pop();originalFileName=fileName;// ✅ CRITICAL: Extract scale from original filename BEFORE removing it
// Match pattern: _scale-{number}.{optional decimal}.png
scaleMatch=originalFileName.match(/_scale-(\d+(?:\.\d+)?)(?=\.png$)/i);extractedScale=scaleMatch?scaleMatch[1]:appState.selectedFurnitureScale||"1.0";console.log("    \uD83D\uDD0D Extracted scale from filename: \"".concat(extractedScale,"\" (from: ").concat(originalFileName,")"));// Remove _scale-{scale} suffix (e.g., "_scale-1.0" or "_scale-2.0")
// Match pattern: _scale-{number}.{optional decimal}.png
fileName=fileName.replace(/_scale-\d+(\.\d+)?(?=\.png$)/i,'');console.log("    \uD83D\uDD0D Filename cleanup: \"".concat(originalFileName,"\" \u2192 \"").concat(fileName,"\""));// ✅ FIX: If filename doesn't match expected format, try to construct it properly
// Expected format: {patternSlug}_{label}_layer-{n}.png
// ✅ CRITICAL: Use currentPattern.layerLabels instead of extracting from filename (which might have wrong pattern name)
if(originalFileName.includes('_scale-')&&!fileName.includes(patternSlug)){// Extract layer number from original filename
layerMatch=originalFileName.match(/layer-(\d+)/);layerNum=layerMatch?layerMatch[1]:(i+1).toString();// ✅ FIX: Get layer label from currentPattern.layerLabels array (not from filename)
layerLabel=currentPattern.layerLabels&&currentPattern.layerLabels[i]?currentPattern.layerLabels[i].toLowerCase().replace(/\s+/g,'-'):currentPattern.layers&&currentPattern.layers[i]&&currentPattern.layers[i].label?currentPattern.layers[i].label.toLowerCase().replace(/\s+/g,'-'):'layer';// Construct proper filename: {patternSlug}_{label}_layer-{n}.png
fileName="".concat(patternSlug,"_").concat(layerLabel,"_layer-").concat(layerNum,".png");console.log("    \uD83D\uDD27 Reconstructed filename: ".concat(fileName," (pattern: ").concat(currentPattern.name,", slug: ").concat(patternSlug,", label: ").concat(layerLabel,", from: ").concat(originalFileName,")"));}else if(!fileName.includes(patternSlug)){// Filename doesn't include pattern slug, try to extract and reconstruct
_layerMatch=fileName.match(/layer-(\d+)/);_layerNum=_layerMatch?_layerMatch[1]:(i+1).toString();// ✅ FIX: Get layer label from currentPattern.layerLabels array (not from filename)
_layerLabel=currentPattern.layerLabels&&currentPattern.layerLabels[i]?currentPattern.layerLabels[i].toLowerCase().replace(/\s+/g,'-'):currentPattern.layers&&currentPattern.layers[i]&&currentPattern.layers[i].label?currentPattern.layers[i].label.toLowerCase().replace(/\s+/g,'-'):'layer';fileName="".concat(patternSlug,"_").concat(_layerLabel,"_layer-").concat(_layerNum,".png");console.log("    \uD83D\uDD27 Reconstructed filename (no pattern slug): ".concat(fileName," (pattern: ").concat(currentPattern.name,", slug: ").concat(patternSlug,", label: ").concat(_layerLabel,")"));}// ✅ FIX: Use new format instead of old furniture template
// New format: data/collections/{collection-base-name}-fur/layers/{furniture-type}/{pattern-name}_layer-{n}_scale-{scale}.png
// Normalize collection name to base (remove .fur, -fur suffixes)
_collectionBaseName2=_collectionName;if(_collectionBaseName2.includes('.fur')){_collectionBaseName2=_collectionBaseName2.replace(/\.fur(-\d+)?$/i,'');}else if(_collectionBaseName2.includes('-fur')){_collectionBaseName2=_collectionBaseName2.replace(/-fur.*$/i,'');}// ✅ FIX: Always ensure filename has correct _scale-{scale} suffix
// Use extracted scale (from original filename) or selectedFurnitureScale
finalFileName=fileName;scaleToUse=extractedScale||appState.selectedFurnitureScale||"1.0";if(!finalFileName.includes('_scale-')){// Filename doesn't have scale suffix, add it
baseFileName=finalFileName.replace(/\.[^.]+$/,'');// Remove extension
finalFileName="".concat(baseFileName,"_scale-").concat(scaleToUse,".png");console.log("    \uD83D\uDD27 Added scale \"".concat(scaleToUse,"\" to filename: ").concat(finalFileName));}else{// Filename already has scale suffix, but we need to ensure it's the correct scale
// Remove existing scale and replace with correct one
_baseFileName=finalFileName.replace(/_scale-\d+(\.\d+)?(?=\.png$)/i,'').replace(/\.png$/,'');finalFileName="".concat(_baseFileName,"_scale-").concat(scaleToUse,".png");console.log("    \uD83D\uDD27 Replaced scale in filename with \"".concat(scaleToUse,"\": ").concat(finalFileName));}// Build path using new format
furnitureLayerPath="https://so-animation.com/colorflex/data/collections/".concat(_collectionBaseName2,"-fur/layers/").concat(_furnitureType2,"/").concat(finalFileName);console.log("    \uD83D\uDD04 Converted path (new format): ".concat(layer.path," \u2192 ").concat(furnitureLayerPath));}// ✅ CRITICAL: Normalize path before passing to drawFurnitureLayer
// loadImage will also normalize, but let's do it here for clarity
normalizedPath=normalizePath(furnitureLayerPath);console.log("    \uD83C\uDFA8 About to draw pattern layer ".concat(i,":"));console.log("      Original path: ".concat(furnitureLayerPath));console.log("      Normalized path: ".concat(normalizedPath));console.log("      Using color: ".concat(layerColor));console.log("      Using zoom state: scale=".concat(frozenZoomState.scale,", offset=(").concat(frozenZoomState.offsetX,", ").concat(frozenZoomState.offsetY,")"));console.log("      Canvas context: ".concat(_ctx4?'available':'MISSING'));console.log("      Canvas size: ".concat(_ctx4===null||_ctx4===void 0||(_ctx4$canvas=_ctx4.canvas)===null||_ctx4$canvas===void 0?void 0:_ctx4$canvas.width,"x").concat(_ctx4===null||_ctx4===void 0||(_ctx4$canvas2=_ctx4.canvas)===null||_ctx4$canvas2===void 0?void 0:_ctx4$canvas2.height));_context11.n=24;return drawFurnitureLayer(_ctx4,normalizedPath,{tintColor:layerColor,zoomState:frozenZoomState,highRes:true,// ✅ Enable high-res for patterns
isPatternLayer:true// ✅ Explicitly mark as pattern layer to ensure luminance logic
});case 24:console.log("    \u2705 Pattern layer ".concat(i," rendered successfully in high resolution"));_context11.n=26;break;case 25:_context11.p=25;_t7=_context11.v;console.error("    \u274C FAILED to render pattern layer ".concat(i,":"),_t7);console.error("    \u274C Error message: ".concat(_t7.message));console.error("    \u274C Error stack: ".concat(_t7.stack));case 26:_context11.n=28;break;case 27:console.warn("    \u26A0\uFE0F Skipping pattern layer ".concat(i,": missing color (").concat(!layerColor,") or path (").concat(!layer.path,")"));if(!layerColor)console.warn("      - Layer color is missing/null");if(!layer.path)console.warn("      - Layer path is missing/null");case 28:i++;_context11.n=21;break;case 29:console.log("✅ Pattern layers step completed");// ===== STEP 3.5: Add sofa base shadow AFTER patterns =====
console.log("3️⃣.5 Adding sofa base shadow on top of patterns");shadowPath=furniture.baseShadow||furniture.base.replace(/base.*\.png/,'base-shadow.png');if(!(shadowPath&&furniture.base)){_context11.n=34;break;}console.log("  🌚 Drawing shadow on top of patterns...");_context11.p=30;_context11.n=31;return drawFurnitureLayer(_ctx4,shadowPath,{tintColor:null,// No tinting for shadow
zoomState:frozenZoomState,blendMode:"multiply",// Multiply blend for shadow effect
opacity:0.7// Adjust shadow intensity as needed
});case 31:console.log("  ✅ Shadow applied on top of patterns");_context11.n=33;break;case 32:_context11.p=32;_t8=_context11.v;console.log("  ⚠️ Shadow file not found, skipping:",shadowPath);case 33:_context11.n=35;break;case 34:console.log("  ⚠️ No shadow path defined, skipping shadow");case 35:// ===== STEP 4: Draw extras on top (split into tintable + fixed) =====
console.log("4️⃣ Drawing extras (pillows/throw + table)");// ✅ Find the Extras/Pillows color from currentLayers
extrasLayer=appState.currentLayers.find(function(l){return l.isExtras===true;});extrasColor=extrasLayer?resolveColor(extrasLayer.color||"SW7006 Extra White"):null;console.log("  Extras color:",extrasColor);// Check if furniture has separate extras files or combined
if(!(furniture.extrasTintable&&furniture.extrasFixed)){_context11.n=43;break;}// Capitol style - separate tintable and fixed extras
console.log("  Using split extras (tintable + fixed)");_context11.p=36;_context11.n=37;return drawFurnitureLayer(_ctx4,furniture.extrasTintable,{tintColor:extrasColor,zoomState:frozenZoomState,opacity:1.0,blendMode:"source-over",isTintableExtras:true});case 37:console.log("  ✅ Tintable extras (pillows/throw) drawn with color:",extrasColor);_context11.n=39;break;case 38:_context11.p=38;_t9=_context11.v;console.log("  ⚠️ Tintable extras not found:",_t9.message);case 39:_context11.p=39;_context11.n=40;return drawFurnitureLayer(_ctx4,furniture.extrasFixed,{tintColor:null,zoomState:frozenZoomState,opacity:1.0,blendMode:"source-over"});case 40:console.log("  ✅ Fixed extras (table/candles) drawn without tinting");_context11.n=42;break;case 41:_context11.p=41;_t0=_context11.v;console.log("  ⚠️ Fixed extras not found:",_t0.message);case 42:_context11.n=49;break;case 43:if(!furniture.extras){_context11.n=48;break;}// Kite style - combined extras file
console.log("  Using combined extras file");_context11.p=44;_context11.n=45;return drawFurnitureLayer(_ctx4,furniture.extras,{tintColor:null,// Combined file, no tinting
zoomState:frozenZoomState,opacity:1.0,blendMode:"source-over"});case 45:console.log("  ✅ Combined extras drawn");_context11.n=47;break;case 46:_context11.p=46;_t1=_context11.v;console.log("  ⚠️ Combined extras not found:",_t1.message);case 47:_context11.n=49;break;case 48:console.log("  ⚠️ No extras configuration found for this furniture");case 49:console.log("✅ Extras step completed");// ===== STEP 5: Apply wall mask over everything (final composite) =====
console.log("5️⃣ Applying wall color mask (screen blend over all layers)");wallColor=resolveColor(((_appState$currentLaye15=appState.currentLayers[_layerMapping.wallIndex])===null||_appState$currentLaye15===void 0?void 0:_appState$currentLaye15.color)||"Snowbound");console.log("  Wall color from input ".concat(_layerMapping.wallIndex,": ").concat(wallColor));if(!furniture.wallMask){_context11.n=51;break;}console.log("  Wall mask path:",furniture.wallMask);console.log("  Wall color to apply:",wallColor);console.log("  Applying as FINAL layer (wall mask logic: white areas = wall color, black areas = transparent)");// wallmode ✅ FIX: Use isMask flag to trigger wall mask logic (white areas = wall color, black areas = transparent)
_context11.n=50;return drawFurnitureLayer(_ctx4,furniture.wallMask,{tintColor:wallColor,isMask:true,// ✅ CRITICAL: This triggers the wall mask logic
blendMode:"screen",// ✅ FIX: Use source-over to properly respect alpha channel (not "normal" which doesn't exist)
opacity:1.0,// Full opacity for wall color
zoomState:frozenZoomState});case 50:console.log("✅ Wall color applied via mask as final composite layer");_context11.n=52;break;case 51:console.warn("⚠️ No wallMask path in furniture config");case 52:console.log("🎉 =========================");console.log("🎉 FURNITURE RENDERING COMPLETE (WITH WALL MASK)");console.log("🎉 =========================");// ===== STEP 6: Display result =====
console.log("6️⃣ Displaying result");dataUrl=canvas.toDataURL("image/png");img=document.createElement("img");img.src=dataUrl;// ✅ FIX: Ensure image fills container properly and shows full couch
// Remove max-height constraint and use object-fit: contain to show full image
// Adjust positioning to show more of the bottom (nudge view upward by adjusting container alignment)
img.style.cssText="max-width: 100%; width: auto; height: auto; object-fit: contain; display: block; margin: 0 auto;";// Clear and append to DOM
dom.roomMockup.innerHTML="";dom.roomMockup.appendChild(img);// Simple mode: let template CSS handle sizing, just clear background
if(isSimpleMode){dom.roomMockup.style.backgroundImage='none';// ✅ FIX: Ensure container stays 800x600 in simple mode (don't let other code override it)
// Set it immediately and with multiple timeouts to override any code that runs later
forceSize=function forceSize(){if(dom.roomMockup){dom.roomMockup.style.removeProperty('--mockup-width');dom.roomMockup.style.setProperty('width','800px','important');dom.roomMockup.style.setProperty('height','600px','important');dom.roomMockup.style.setProperty('overflow','visible','important');// Show full couch
dom.roomMockup.style.setProperty('max-width','800px','important');dom.roomMockup.style.setProperty('min-width','800px','important');}};forceSize();// Immediate
setTimeout(forceSize,50);setTimeout(forceSize,100);setTimeout(forceSize,200);setTimeout(forceSize,500);console.log("✅ Simple mode: Forced roomMockup to 800x600 with visible overflow (immediate + 4 delayed attempts)");}else{// Reset all styling including background from fabric mode
_isFurnitureMode2=window.COLORFLEX_MODE==='FURNITURE';isClothingMode=window.COLORFLEX_MODE==='CLOTHING';// ✅ FIX: Furniture simple mode should be 800x600, not 600x450
_isFurnitureSimpleMode2=isSimpleMode&&_isFurnitureMode2;mockupWidth=_isFurnitureSimpleMode2?'800px':_isFurnitureMode2?'600px':isClothingMode?'500px':'700px';mockupHeight=_isFurnitureSimpleMode2?'600px':_isFurnitureMode2?'450px':isClothingMode?'500px':'600px';dom.roomMockup.style.cssText="width: ".concat(mockupWidth,"; height: ").concat(mockupHeight,"; position: relative; background-image: none; background-color: var(--color-bg-medium);");}ensureButtonsAfterUpdate();console.log("✅ Furniture preview displayed in DOM");console.log("📊 Final canvas dimensions:",canvas.width,"x",canvas.height);console.log("📊 DataURL length:",dataUrl.length);// ✅ CRITICAL: Add delay before clearing flag to prevent race conditions
// This ensures the DOM update completes before allowing other renders
_context11.n=53;return new Promise(function(resolve){return setTimeout(resolve,100);});case 53:console.log("⏳ Delay completed - DOM should be stable now");_context11.n=55;break;case 54:_context11.p=54;_t10=_context11.v;console.error("❌ Error in furniture rendering sequence:",_t10);console.error("❌ Error stack:",_t10.stack);// Fallback: show error message in mockup area
dom.roomMockup.innerHTML="\n                <div style=\"\n                    width: 100%; \n                    height: 100%; \n                    display: flex; \n                    align-items: center; \n                    justify-content: center; \n                    background: #f3f4f6; \n                    color: #dc2626;\n                    font-family: monospace;\n                    text-align: center;\n                    padding: 20px;\n                \">\n                    <div>\n                        <div style=\"font-size: 24px; margin-bottom: 10px;\">\u26A0\uFE0F</div>\n                        <div>Furniture Preview Error</div>\n                        <div style=\"font-size: 12px; margin-top: 10px;\">Check console for details</div>\n                    </div>\n                </div>\n            ";case 55:// ✅ RESTORE PRESERVED SETTINGS AT THE END
Object.assign(furnitureViewSettings,preservedSettings);console.log("✅ Zoom settings restored after rendering:",furnitureViewSettings);// ✅ CRITICAL: Clear compositing flag AFTER everything is complete
appState.isFurnitureCompositing=false;console.log("🔓 Furniture compositing flag cleared - other renders can proceed");_context11.n=57;break;case 56:_context11.p=56;_t11=_context11.v;console.error("🔥 Critical error in updateFurniturePreview:",_t11);console.error("🔥 Error stack:",_t11.stack);// Ultimate fallback
if(dom.roomMockup){dom.roomMockup.innerHTML="\n                <div style=\"\n                    width: 100%; \n                    height: 100%; \n                    display: flex; \n                    align-items: center; \n                    justify-content: center; \n                    background: #fef2f2; \n                    color: #dc2626;\n                    font-family: monospace;\n                \">\n                    Critical furniture preview error - check console\n                </div>\n            ";}case 57:return _context11.a(2);}},_callee0,null,[[44,46],[39,41],[36,38],[30,32],[23,25],[11,13],[7,54],[1,56]]);}));return function updateFurniturePreview(){return _ref18.apply(this,arguments);};}();function parseCoordinateFilename(filename){console.log('Before click - Scroll Y:',window.scrollY);var parts=filename.split('/');var filePart=parts[5];// "BOMBAY-KITANELLI-VINE.jpg"
var collectionName='coordinates';var patternPart=filePart.replace(/^BOMBAY-/,'')// Remove "BOMBAY-"
.replace(/\.jpg$/i,'');// Remove ".jpg"
var patternName=patternPart.split('-').map(function(word){return word.charAt(0).toUpperCase()+word.slice(1).toLowerCase();}).join(' ');// No mapping needed to match JSON
var normalizedPatternName=patternName;console.log("Parsed filename: ".concat(filename," \xE2\u2020\u2019 collection: ").concat(collectionName,", pattern: ").concat(normalizedPatternName));return{collectionName:collectionName,patternName:normalizedPatternName};}function loadPatternFromLocalCollections(collectionName,patternName){try{if(!appState.collections||!appState.collections.length){console.error("appState.collections is empty or not initialized");return null;}var collection=appState.collections.find(function(c){return c&&typeof c.name==='string'&&c.name.toLowerCase()==="coordinates";});if(!collection){console.error("Coordinates collection not found in appState.collections");return null;}var pattern=collection.patterns.find(function(p){return p&&typeof p.name==='string'&&patternName&&typeof patternName==='string'&&p.name.toLowerCase()===patternName.toLowerCase();});if(!pattern){console.error("Pattern ".concat(patternName," not found in coordinates collection"));return null;}console.log("Loaded pattern: ".concat(pattern.name," from coordinates collection"));return{collection:collection,pattern:pattern};}catch(error){console.error("Error accessing collections: ".concat(error.message));return null;}}// ✅ FIX: Define handleCoordinateClick outside setupCoordinateImageHandlers
// This ensures stable function reference for removeEventListener to work correctly
function handleCoordinateClick(){return _handleCoordinateClick.apply(this,arguments);}// ✅ FIX: setupCoordinateImageHandlers now references stable handleCoordinateClick function
function _handleCoordinateClick(){_handleCoordinateClick=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee21(){var _appState$selectedCol64;var image,_appState$selectedCol63,filename,coordinate,primaryLayerIndex,layerPaths,coordImage,normalizedCoordPath;return _regenerator().w(function(_context30){while(1)switch(_context30.n){case 0:image=this;console.log('>>> handleCoordinateClick START <<<');// Only store original state if not already stored
if(!appState.originalPattern){appState.originalPattern=_objectSpread({},appState.currentPattern);appState.originalCoordinates=(_appState$selectedCol63=appState.selectedCollection)!==null&&_appState$selectedCol63!==void 0&&_appState$selectedCol63.coordinates?_toConsumableArray(appState.selectedCollection.coordinates):[];appState.originalLayerInputs=appState.layerInputs.map(function(layer,index){return{id:"layer-".concat(index),label:layer.label,inputValue:layer.input.value,hex:layer.circle.style.backgroundColor,isBackground:layer.isBackground};});appState.originalCurrentLayers=appState.currentLayers.map(function(layer){return _objectSpread({},layer);});console.log("Stored original state:",{pattern:appState.originalPattern.name,coordinates:appState.originalCoordinates,layerInputs:appState.originalLayerInputs,currentLayers:appState.originalCurrentLayers});}// Highlight selected image
document.querySelectorAll(".coordinate-image").forEach(function(img){return img.classList.remove("selected");});image.classList.add("selected");filename=image.dataset.filename;console.log("Coordinate image clicked: ".concat(filename));// Find the coordinate
coordinate=(_appState$selectedCol64=appState.selectedCollection)===null||_appState$selectedCol64===void 0||(_appState$selectedCol64=_appState$selectedCol64.coordinates)===null||_appState$selectedCol64===void 0?void 0:_appState$selectedCol64.find(function(coord){return coord.path===filename;});if(coordinate){_context30.n=1;break;}console.error("Coordinate not found for filename: ".concat(filename));if(dom.coordinatesContainer){dom.coordinatesContainer.innerHTML+="<p style='color: red;'>Error: Coordinate not found.</p>";}return _context30.a(2);case 1:console.log("Found coordinate:",coordinate);// Find the primary pattern layer index (non-background, non-shadow)
primaryLayerIndex=appState.currentLayers.findIndex(function(layer){var _layer$imageUrl;return layer.label!=="Background"&&!((_layer$imageUrl=layer.imageUrl)!==null&&_layer$imageUrl!==void 0&&_layer$imageUrl.toUpperCase().includes("ISSHADOW"));});if(!(primaryLayerIndex===-1)){_context30.n=2;break;}console.error("No primary pattern layer found in appState.currentLayers:",appState.currentLayers);return _context30.a(2);case 2:console.log("Primary layer index: ".concat(primaryLayerIndex));// Determine layers to use (handle both layerPath and layerPaths)
layerPaths=coordinate.layerPaths||(coordinate.layerPath?[coordinate.layerPath]:[]);if(!(layerPaths.length===0)){_context30.n=3;break;}console.error("No layers found for coordinate: ".concat(filename));return _context30.a(2);case 3:// Load the first coordinate image to get its dimensions
coordImage=new Image();normalizedCoordPath=normalizePath(layerPaths[0]);console.log("\uD83D\uDD0D Coordinate click path: \"".concat(layerPaths[0],"\" \u2192 normalized: \"").concat(normalizedCoordPath,"\""));coordImage.src=normalizedCoordPath;coordImage.onload=/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee20(){var maxDimension,naturalWidth,naturalHeight,scale,imageWidth,imageHeight,layers,layerLabels,currentColors,isFurnitureModeCoord,isClothingModeCoord,coordinatesContainer,backLink;return _regenerator().w(function(_context29){while(1)switch(_context29.n){case 0:// Limit coordinate image dimensions to prevent oversized canvases
maxDimension=400;naturalWidth=coordImage.naturalWidth;naturalHeight=coordImage.naturalHeight;scale=Math.min(maxDimension/naturalWidth,maxDimension/naturalHeight,1);imageWidth=Math.floor(naturalWidth*scale);imageHeight=Math.floor(naturalHeight*scale);console.log("\uD83D\uDCD0 Coordinate image sizing: natural(".concat(naturalWidth,"x").concat(naturalHeight,") \u2192 scaled(").concat(imageWidth,"x").concat(imageHeight,")"));// Create layers and labels for all coordinate layers
layers=layerPaths.map(function(path){return{path:path};});layerLabels=layerPaths.map(function(_,index){return index===0?"Flowers":"Layer ".concat(index+1);});// Update currentPattern with coordinate data
appState.currentPattern=_objectSpread(_objectSpread({},appState.currentPattern),{},{name:coordinate.filename.replace(/\.jpg$/,''),thumbnail:coordinate.path,size:[imageWidth/100,imageHeight/100],// Convert pixels to inches (assuming 100 DPI)
layers:layers,// All coordinate layers
layerLabels:layerLabels,tintWhite:false});console.log("Updated appState.currentPattern:",appState.currentPattern);// Update the primary pattern layer's imageUrl in currentLayers
appState.currentLayers=appState.currentLayers.map(function(layer,index){if(index===primaryLayerIndex){console.log("Updating layer at index ".concat(index," with layerPath: ").concat(layerPaths[0]));return _objectSpread(_objectSpread({},layer),{},{imageUrl:layerPaths[0]// Update primary layer
});}return layer;});// Preserve the original layer structure and colors
currentColors=appState.layerInputs.map(function(layer){return layer.input.value;});console.log("Preserving colors:",currentColors);// Restore layer inputs with preserved colors
appState.layerInputs=[];if(dom.layerInputsContainer)dom.layerInputsContainer.innerHTML="";appState.currentLayers.forEach(function(layer,index){var id="layer-".concat(index);var isBackground=layer.label==="Background";var initialColor=currentColors[index]||(isBackground?"#FFFFFF":"Snowbound");var layerData=createColorInput(layer.label,id,initialColor,isBackground);layerData.input.value=getCleanColorName(initialColor);layerData.circle.style.backgroundColor=lookupColor(initialColor)||"#FFFFFF";// ✅ ADD THIS LINE - append to DOM
dom.layerInputsContainer.appendChild(layerData.container);appState.layerInputs[index]=layerData;console.log("Set ".concat(layer.label," input to ").concat(layerData.input.value,", circle to ").concat(layerData.circle.style.backgroundColor,", id=").concat(id));});// Update UI
// updatePreview();
// const isFurniturePattern = appState.currentPattern?.isFurniture || false;
updatePreview();// ✅ Check mode and call appropriate render function
isFurnitureModeCoord=window.COLORFLEX_MODE==='FURNITURE'||appState.isInFurnitureMode;isClothingModeCoord=window.COLORFLEX_MODE==='CLOTHING'||window.COLORFLEX_SIMPLE_MODE===true&&window.COLORFLEX_MODE!=='FURNITURE';if(!isFurnitureModeCoord){_context29.n=4;break;}console.log("🪑 handleCoordinateClick in furniture mode - calling updateFurniturePreview()");if(!(typeof updateFurniturePreview==='function')){_context29.n=2;break;}_context29.n=1;return updateFurniturePreview();case 1:_context29.n=3;break;case 2:console.error('❌ updateFurniturePreview not available!');case 3:_context29.n=7;break;case 4:if(!(appState.isInFabricMode||isClothingModeCoord)){_context29.n=6;break;}console.log("🧵 handleCoordinateClick in fabric/clothing mode - calling renderFabricMockup()");_context29.n=5;return renderFabricMockup();case 5:_context29.n=7;break;case 6:updateRoomMockup();case 7:// Add "Back to Pattern" link
console.log("🔍 Adding Back to Pattern button...");coordinatesContainer=document.getElementById("coordinatesContainer");console.log("🔍 coordinatesContainer found:",!!coordinatesContainer);if(coordinatesContainer){backLink=document.getElementById("backToPatternLink");if(backLink){console.log("🔍 Removing existing back link");backLink.remove();}backLink=document.createElement("div");backLink.id="backToPatternLink";backLink.style.cssText="\n                        color: #f0e6d2 !important;\n                        font-family: 'Island Moments', cursive !important;\n                        font-size: 1.8rem !important;\n                        text-align: center !important;\n                        cursor: pointer !important;\n                        margin-top: 6rem !important;\n                        padding: 0.5rem !important;\n                        transition: color 0.2s !important;\n                        display: block !important;\n                        visibility: visible !important;\n                        opacity: 1 !important;\n                        z-index: 1000 !important;\n                        position: relative !important;\n                    ";backLink.textContent="  ← Back to Pattern ";backLink.addEventListener("mouseover",function(){backLink.style.color="#beac9f";});backLink.addEventListener("mouseout",function(){backLink.style.color="#f0e6d2";});coordinatesContainer.appendChild(backLink);backLink.addEventListener("click",restoreOriginalPattern);console.log("✅ Back to Pattern button added successfully");}else{console.error("❌ coordinatesContainer not found - cannot add back link");}case 8:return _context29.a(2);}},_callee20);}));coordImage.onerror=function(){console.error("Failed to load coordinate image: ".concat(layerPaths[0]||coordinate.layerPath));};case 4:return _context30.a(2);}},_callee21,this);}));return _handleCoordinateClick.apply(this,arguments);}function setupCoordinateImageHandlers(){var coordinateImages=document.querySelectorAll(".coordinate-image");console.log("\uD83D\uDD0D Found ".concat(coordinateImages.length," coordinate images to set up handlers"));coordinateImages.forEach(function(image){image.removeEventListener("click",handleCoordinateClick);image.addEventListener("click",handleCoordinateClick);console.log("\u2705 Attached click handler to coordinate: ".concat(image.dataset.filename));});}function restoreOriginalPattern(){return _restoreOriginalPattern.apply(this,arguments);}// Update displays with layer compositing
function _restoreOriginalPattern(){_restoreOriginalPattern=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee22(){var isFurnitureModeRestore,isClothingModeRestore,coordinatesSection,backLink,errorMessages,_t26;return _regenerator().w(function(_context31){while(1)switch(_context31.p=_context31.n){case 0:_context31.p=0;console.log('>>> restoreOriginalPattern START <<<');if(!(!appState.originalPattern||!appState.originalCurrentLayers||!appState.originalLayerInputs)){_context31.n=1;break;}console.warn("No original state to restore",{originalPattern:appState.originalPattern,originalCurrentLayers:appState.originalCurrentLayers,originalLayerInputs:appState.originalLayerInputs});return _context31.a(2);case 1:console.log("Restoring original pattern:",appState.originalPattern.name,"Original state:",{layerInputs:appState.originalLayerInputs,currentLayers:appState.originalCurrentLayers});// Restore appState to the original pattern
appState.currentPattern=_objectSpread({},appState.originalPattern);appState.currentLayers=appState.originalCurrentLayers.map(function(layer){return _objectSpread({},layer);});console.log("Restored appState: collection=",appState.selectedCollection.name,"pattern=",appState.currentPattern.name);// Restore layer inputs
appState.originalLayerInputs.forEach(function(layer,index){var id=layer.id||"layer-".concat(index);var layerData=createColorInput(layer.label,id,layer.inputValue,layer.isBackground);layerData.input.value=getCleanColorName(layer.inputValue);layerData.circle.style.backgroundColor=layer.hex;appState.layerInputs[index]=layerData;console.log("Restored ".concat(layer.label," input to ").concat(layer.inputValue,", circle to ").concat(layer.hex,", id=").concat(id));});console.log("After restore, layerInputs:",appState.layerInputs.map(function(l){return{id:l.input.id,label:l.label,value:l.input.value};}));// Update UI
updatePreview();// ✅ Check mode and call appropriate render function
isFurnitureModeRestore=window.COLORFLEX_MODE==='FURNITURE'||appState.isInFurnitureMode;isClothingModeRestore=window.COLORFLEX_MODE==='CLOTHING'||window.COLORFLEX_SIMPLE_MODE===true&&window.COLORFLEX_MODE!=='FURNITURE';if(!isFurnitureModeRestore){_context31.n=5;break;}console.log("🪑 restoreOriginalPattern in furniture mode - calling updateFurniturePreview()");if(!(typeof updateFurniturePreview==='function')){_context31.n=3;break;}_context31.n=2;return updateFurniturePreview();case 2:_context31.n=4;break;case 3:console.error('❌ updateFurniturePreview not available!');case 4:_context31.n=8;break;case 5:if(!(appState.isInFabricMode||isClothingModeRestore)){_context31.n=7;break;}console.log("🧵 restoreOriginalPattern in fabric/clothing mode - calling renderFabricMockup()");_context31.n=6;return renderFabricMockup();case 6:_context31.n=8;break;case 7:updateRoomMockup();case 8:populateCoordinates();// Remove Back to Pattern link and clean up
coordinatesSection=document.getElementById("coordinatesSection");backLink=document.getElementById("backToPatternLink");if(backLink){backLink.remove();console.log("Removed Back to Pattern link");}errorMessages=coordinatesSection.querySelectorAll("p[style*='color: red']");errorMessages.forEach(function(msg){return msg.remove();});console.log("Cleared error messages:",errorMessages.length);console.log('>>> restoreOriginalPattern END <<<');_context31.n=10;break;case 9:_context31.p=9;_t26=_context31.v;console.error("Error restoring original pattern:",_t26);case 10:return _context31.a(2);}},_callee22,null,[[0,9]]);}));return _restoreOriginalPattern.apply(this,arguments);}function updateDisplays(){return _updateDisplays.apply(this,arguments);}// ============================================================================
// SECTION 9: COLOR LOCK & THUMBNAILS
// ============================================================================
// Color lock toggle, thumbnail click handling, pattern thumbnail capture.
// Enables scale persistence and color preservation across pattern changes.
// ============================================================================
/**
 * Toggle color lock - when locked, pattern thumbnail clicks preserve current colors
 */function _updateDisplays(){_updateDisplays=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee23(){var isFurnitureModeUpdate,isClothingModeUpdate,_t27;return _regenerator().w(function(_context32){while(1)switch(_context32.p=_context32.n){case 0:_context32.p=0;console.log('updateDisplays called');// ✅ Always update pattern preview
updatePreview();// ✅ Check mode and call appropriate render function
isFurnitureModeUpdate=window.COLORFLEX_MODE==='FURNITURE'||appState.isInFurnitureMode;isClothingModeUpdate=window.COLORFLEX_MODE==='CLOTHING'||window.COLORFLEX_SIMPLE_MODE===true&&window.COLORFLEX_MODE!=='FURNITURE';if(!isFurnitureModeUpdate){_context32.n=4;break;}console.log("🪑 updateDisplays in furniture mode - calling updateFurniturePreview()");if(!(typeof updateFurniturePreview==='function')){_context32.n=2;break;}_context32.n=1;return updateFurniturePreview();case 1:_context32.n=3;break;case 2:console.error('❌ updateFurniturePreview not available!');case 3:_context32.n=7;break;case 4:if(!(appState.isInFabricMode||isClothingModeUpdate)){_context32.n=6;break;}console.log("🧵 updateDisplays in fabric/clothing mode - calling renderFabricMockup()");_context32.n=5;return renderFabricMockup();case 5:_context32.n=7;break;case 6:updateRoomMockup();case 7:// ✅ Only populate coordinates for wallpaper mode (skip clothing/furniture)
if(window.COLORFLEX_MODE!=='CLOTHING'&&window.COLORFLEX_MODE!=='FURNITURE'){populateCoordinates();}_context32.n=9;break;case 8:_context32.p=8;_t27=_context32.v;console.error('Error in updateDisplays:',_t27);case 9:return _context32.a(2);}},_callee23,null,[[0,8]]);}));return _updateDisplays.apply(this,arguments);}function toggleColorLock(){appState.colorsLocked=!appState.colorsLocked;var btn=document.getElementById('colorLockBtn');var icon=document.getElementById('colorLockIcon');var text=document.getElementById('colorLockText');if(!btn||!icon||!text){console.warn('Color lock button elements not found');return;}if(appState.colorsLocked){// Locked state
icon.textContent='🔒';text.textContent='Locked';btn.style.background='rgba(212, 175, 55, 0.3)';btn.style.borderColor='#ffd700';console.log('🔒 Color lock enabled - colors will be preserved when changing patterns');}else{// Unlocked state
icon.textContent='🔓';text.textContent='Unlocked';btn.style.background='rgba(110, 110, 110, 0.2)';btn.style.borderColor='#d4af37';console.log('🔓 Color lock disabled - patterns will load with default colors');}}// Expose to window for button onclick
window.toggleColorLock=toggleColorLock;/**
 * Toggle visibility of the download proof button based on pattern type
 * Standard patterns (no layers) don't need proof downloads since there's no customization
 * ColorFlex patterns (with layers) show proof button for custom color downloads
 *
 * @param {boolean} show - True to show button (ColorFlex patterns), false to hide (standard patterns)
 */function toggleDownloadProofButton(show){var proofContainer=document.getElementById('downloadProofContainer');if(!proofContainer){console.warn('⚠️ Download proof container not found');return;}if(show){proofContainer.style.display='inline-block';console.log('✅ Download proof button shown (ColorFlex pattern with layers)');}else{proofContainer.style.display='none';console.log('⏭️ Download proof button hidden (standard pattern, no customization)');}}// Expose to window for external access if needed
window.toggleDownloadProofButton=toggleDownloadProofButton;function handleThumbnailClick(patternId){console.log("handleThumbnailClick: patternId=".concat(patternId));if(!patternId){console.error("Invalid pattern ID:",patternId);return;}try{var _appState$selectedCol52;// Preserve current mockup
var originalMockup=((_appState$selectedCol52=appState.selectedCollection)===null||_appState$selectedCol52===void 0?void 0:_appState$selectedCol52.mockup)||"";console.log("Preserving mockup for thumbnail click:",originalMockup);loadPatternData(appState.selectedCollection,patternId);// Update thumbnails
document.querySelectorAll(".thumbnail").forEach(function(t){return t.classList.remove("selected");});var selectedThumb=document.querySelector(".thumbnail[data-pattern-id=\"".concat(patternId,"\"]"));if(selectedThumb){selectedThumb.classList.add("selected");console.log("Selected thumbnail: ".concat(patternId));}else{console.warn("Thumbnail not found for ID: ".concat(patternId));}}catch(error){console.error("Error handling thumbnail click:",error);}}// Generate print preview
var generatePrintPreview=function generatePrintPreview(){var _appState$currentPatt19,_appState$selectedCol53,_appState$layerInputs,_appState$selectedCol54;if(!appState.currentPattern){console.error("No current pattern selected for print preview");return null;}var isWall=((_appState$currentPatt19=appState.currentPattern)===null||_appState$currentPatt19===void 0?void 0:_appState$currentPatt19.isWall)||((_appState$selectedCol53=appState.selectedCollection)===null||_appState$selectedCol53===void 0?void 0:_appState$selectedCol53.name)==="wall-panels";var backgroundIndex=isWall?1:0;var backgroundInput=(_appState$layerInputs=appState.layerInputs[backgroundIndex])===null||_appState$layerInputs===void 0?void 0:_appState$layerInputs.input;if(!backgroundInput){console.error("Background input not found at index ".concat(backgroundIndex),appState.layerInputs);return null;}var backgroundColor=lookupColor(backgroundInput.value);console.log("Print preview - Background color:",backgroundColor,"isWall:",isWall);console.log("Print preview - Layer inputs:",appState.layerInputs.map(function(li,i){var _li$input;return{index:i,value:li===null||li===void 0||(_li$input=li.input)===null||_li$input===void 0?void 0:_li$input.value};}));// We'll set canvas size after loading first layer to match actual image dimensions
var printCanvas=document.createElement("canvas");var printCtx=printCanvas.getContext("2d",{willReadFrequently:true});var collectionName=toInitialCaps(((_appState$selectedCol54=appState.selectedCollection)===null||_appState$selectedCol54===void 0?void 0:_appState$selectedCol54.name)||"Unknown");var patternName=toInitialCaps(appState.currentPattern.name||"Pattern");var layerLabels=[];var processPrintPreview=/*#__PURE__*/function(){var _ref20=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee1(){var _appState$currentPatt20,_appState$currentPatt21,_appState$currentPatt22,_appState$currentPatt24,_appState$currentPatt25;var isTintWhite,canvasInitialized,shadowLayers,nonShadowLayers,nonShadowInputIndex,_loop7,_i8,_shadowLayers,_loop8,_i9,_nonShadowLayers,singleTileCanvas,singleTileCtx,effectiveScale,scaledWidth,scaledHeight,y,x,dataUrl,tilingMethod,scaleDisplay,textContent,previewWindow;return _regenerator().w(function(_context14){while(1)switch(_context14.n){case 0:isTintWhite=((_appState$currentPatt20=appState.currentPattern)===null||_appState$currentPatt20===void 0?void 0:_appState$currentPatt20.tintWhite)||false;console.log("Print preview - tintWhite flag: ".concat(isTintWhite));// Determine canvas size from first layer image (maximum resolution)
canvasInitialized=false;if(!(isTintWhite&&(_appState$currentPatt21=appState.currentPattern)!==null&&_appState$currentPatt21!==void 0&&_appState$currentPatt21.baseComposite)){_context14.n=1;break;}_context14.n=7;break;case 1:if(!((_appState$currentPatt22=appState.currentPattern)!==null&&_appState$currentPatt22!==void 0&&(_appState$currentPatt22=_appState$currentPatt22.layers)!==null&&_appState$currentPatt22!==void 0&&_appState$currentPatt22.length)){_context14.n=7;break;}layerLabels=appState.currentPattern.layers.map(function(l,i){var _appState$currentPatt23,_appState$layerInputs2;return{label:((_appState$currentPatt23=appState.currentPattern.layerLabels)===null||_appState$currentPatt23===void 0?void 0:_appState$currentPatt23[i])||"Layer ".concat(i+1),color:((_appState$layerInputs2=appState.layerInputs[i+(isWall?2:1)])===null||_appState$layerInputs2===void 0||(_appState$layerInputs2=_appState$layerInputs2.input)===null||_appState$layerInputs2===void 0?void 0:_appState$layerInputs2.value)||"Snowbound"};});// Add background color to the beginning of the color list
layerLabels.unshift({label:"Background",color:backgroundInput.value||"Snowbound"});// 🔍 COLOR MAPPING DEBUG - Log background color
console.log("\uD83C\uDFA8 PRINT PATTERN - Background:");console.log("  - Color name: \"".concat(backgroundInput.value,"\""));console.log("  - Color RGB:",backgroundColor);shadowLayers=[];nonShadowLayers=[];appState.currentPattern.layers.forEach(function(layer,index){// ⚠️ CRITICAL: Account for background at layerLabels[0]
// layerLabels = ["Background", "Layer 1", "Layer 2", ...]
// currentPattern.layers[0] should map to layerLabels[1], not [0]
var label=layerLabels[index+1].label;var isShadow=layer.isShadow===true;(isShadow?shadowLayers:nonShadowLayers).push({layer:layer,index:index,label:label});});// 🔍 COLOR MAPPING DEBUG - Summary of layer structure
console.log("\uD83C\uDFA8 PRINT PATTERN - Layer Structure:");console.log("  - Total layers: ".concat(appState.currentPattern.layers.length));console.log("  - Shadow layers: ".concat(shadowLayers.length),shadowLayers.map(function(l){return"".concat(l.index,":").concat(l.label);}));console.log("  - Non-shadow layers: ".concat(nonShadowLayers.length),nonShadowLayers.map(function(l){return"".concat(l.index,":").concat(l.label);}));console.log("  - layerLabels length: ".concat(layerLabels.length," (includes background at [0])"));console.log("  - appState.layerInputs length: ".concat(appState.layerInputs.length));nonShadowInputIndex=isWall?2:1;_loop7=/*#__PURE__*/_regenerator().m(function _loop7(){var _shadowLayers$_i,layer,index,label,layerPath;return _regenerator().w(function(_context12){while(1)switch(_context12.n){case 0:_shadowLayers$_i=_shadowLayers[_i8],layer=_shadowLayers$_i.layer,index=_shadowLayers$_i.index,label=_shadowLayers$_i.label;// ⚠️ CRITICAL: Use proofPath (high-res ~3600px) NOT path (preview ~1400px)
// proofPath: ./data/collections/{collection}/proof-layers/*.jpg (3600px)
// path: ./data/collections/{collection}/layers/*.jpg (1400px)
layerPath=layer.proofPath||layer.path||"";_context12.n=1;return new Promise(function(resolve){processImage(layerPath,function(processedUrl){var img=new Image();console.log("🧪 processedUrl type:",_typeof(processedUrl),processedUrl);if(processedUrl instanceof HTMLCanvasElement){img.src=processedUrl.toDataURL("image/png");}else{img.src=processedUrl;}img.onload=function(){// Initialize canvas from first image if not yet done
if(!canvasInitialized){var canvasWidth=img.naturalWidth||img.width;var canvasHeight=img.naturalHeight||img.height;printCanvas.width=canvasWidth;printCanvas.height=canvasHeight;console.log("\uD83D\uDD27 Print canvas at FULL resolution: ".concat(canvasWidth,"x").concat(canvasHeight));// Fill background
printCtx.fillStyle=backgroundColor;printCtx.fillRect(0,0,canvasWidth,canvasHeight);canvasInitialized=true;}printCtx.globalCompositeOperation="multiply";printCtx.globalAlpha=0.3;printCtx.drawImage(img,0,0,printCanvas.width,printCanvas.height);resolve();};img.onerror=function(){return resolve();};},null,2.2,true,isWall);});case 1:return _context12.a(2);}},_loop7);});_i8=0,_shadowLayers=shadowLayers;case 2:if(!(_i8<_shadowLayers.length)){_context14.n=4;break;}return _context14.d(_regeneratorValues(_loop7()),3);case 3:_i8++;_context14.n=2;break;case 4:_loop8=/*#__PURE__*/_regenerator().m(function _loop8(){var _layerInput$input,_layerInput$input2,_layerLabels;var _nonShadowLayers$_i,layer,index,label,layerPath,layerInput,layerColor;return _regenerator().w(function(_context13){while(1)switch(_context13.n){case 0:_nonShadowLayers$_i=_nonShadowLayers[_i9],layer=_nonShadowLayers$_i.layer,index=_nonShadowLayers$_i.index,label=_nonShadowLayers$_i.label;// ⚠️ CRITICAL: Use proofPath (high-res ~3600px) NOT path (preview ~1400px)
// proofPath: ./data/collections/{collection}/proof-layers/*.jpg (3600px)
// path: ./data/collections/{collection}/layers/*.jpg (1400px)
layerPath=layer.proofPath||layer.path||"";layerInput=appState.layerInputs[nonShadowInputIndex];layerColor=lookupColor((layerInput===null||layerInput===void 0||(_layerInput$input=layerInput.input)===null||_layerInput$input===void 0?void 0:_layerInput$input.value)||"Snowbound");// 🔍 COLOR MAPPING DEBUG - Investigating color mismatch issue
console.log("\uD83C\uDFA8 PRINT PATTERN - Non-shadow layer ".concat(index,":"));console.log("  - Label: \"".concat(label,"\""));console.log("  - Input index: ".concat(nonShadowInputIndex));console.log("  - layerInput exists:",!!layerInput);console.log("  - Color name from input: \"".concat(layerInput===null||layerInput===void 0||(_layerInput$input2=layerInput.input)===null||_layerInput$input2===void 0?void 0:_layerInput$input2.value,"\""));console.log("  - Color RGB lookup:",layerColor);console.log("  - Layer path:",layer.proofPath?'PROOF PATH (high-res)':'preview path (fallback)');console.log("  - Expected from layerLabels[".concat(index+1,"]:"),(_layerLabels=layerLabels[index+1])===null||_layerLabels===void 0?void 0:_layerLabels.color);_context13.n=1;return new Promise(function(resolve){processImage(layerPath,function(processedUrl){var img=new Image();console.log("🧪 processedUrl type:",_typeof(processedUrl),processedUrl);if(processedUrl instanceof HTMLCanvasElement){img.src=processedUrl.toDataURL("image/png");}else{img.src=processedUrl;}img.onload=function(){// Initialize canvas from first image if not yet done
if(!canvasInitialized){var canvasWidth=img.naturalWidth||img.width;var canvasHeight=img.naturalHeight||img.height;printCanvas.width=canvasWidth;printCanvas.height=canvasHeight;console.log("\uD83D\uDD27 Print canvas at FULL resolution: ".concat(canvasWidth,"x").concat(canvasHeight));// Fill background
printCtx.fillStyle=backgroundColor;printCtx.fillRect(0,0,canvasWidth,canvasHeight);canvasInitialized=true;}printCtx.globalCompositeOperation="source-over";printCtx.globalAlpha=1.0;printCtx.drawImage(img,0,0,printCanvas.width,printCanvas.height);nonShadowInputIndex++;resolve();};img.onerror=function(){return resolve();};},layerColor,2.2,false,isWall);});case 1:return _context13.a(2);}},_loop8);});_i9=0,_nonShadowLayers=nonShadowLayers;case 5:if(!(_i9<_nonShadowLayers.length)){_context14.n=7;break;}return _context14.d(_regeneratorValues(_loop8()),6);case 6:_i9++;_context14.n=5;break;case 7:// Apply tiling based on scale setting (same logic as proof downloads)
if(appState.currentScale&&appState.currentScale!==100){console.log("\uD83D\uDD27 Print preview: Applying scale ".concat(appState.currentScale,"% (tiling pattern)"));// Save the single-tile pattern
singleTileCanvas=document.createElement('canvas');singleTileCanvas.width=printCanvas.width;singleTileCanvas.height=printCanvas.height;singleTileCtx=singleTileCanvas.getContext('2d');singleTileCtx.drawImage(printCanvas,0,0);// Calculate effective scale (inverted: 2X = pattern appears smaller)
effectiveScale=appState.currentScale/100;// 200% = 2.0
scaledWidth=singleTileCanvas.width/effectiveScale;scaledHeight=singleTileCanvas.height/effectiveScale;console.log("  Single tile: ".concat(singleTileCanvas.width,"x").concat(singleTileCanvas.height));console.log("  Scaled tile: ".concat(scaledWidth,"x").concat(scaledHeight));console.log("  Tiles to fit: ~".concat(Math.ceil(printCanvas.width/scaledWidth),"x").concat(Math.ceil(printCanvas.height/scaledHeight)));// Clear the main canvas and redraw with tiling
printCtx.clearRect(0,0,printCanvas.width,printCanvas.height);// Fill background color first
printCtx.fillStyle=backgroundColor;printCtx.fillRect(0,0,printCanvas.width,printCanvas.height);// Tile the pattern across the canvas at scaled size
for(y=0;y<printCanvas.height;y+=scaledHeight){for(x=0;x<printCanvas.width;x+=scaledWidth){printCtx.drawImage(singleTileCanvas,x,y,scaledWidth,scaledHeight);}}console.log("\u2705 Print preview: Pattern tiled at ".concat(appState.currentScale,"% scale"));}else{console.log("\uD83D\uDD27 Print preview: No scaling (100% - single tile)");}dataUrl=printCanvas.toDataURL("image/png");console.log("Print preview - Generated data URL, length: ".concat(dataUrl.length));// Generate HTML content
// Determine tiling method and scale display
tilingMethod=((_appState$currentPatt24=appState.currentPattern)===null||_appState$currentPatt24===void 0?void 0:_appState$currentPatt24.tilingType)==='half-drop'?'Half-Drop':((_appState$currentPatt25=appState.currentPattern)===null||_appState$currentPatt25===void 0?void 0:_appState$currentPatt25.tilingType)==='brick'?'Brick':'Normal';scaleDisplay=appState.currentScale===50?'0.5X':appState.currentScale===200?'2X':appState.currentScale===300?'3X':appState.currentScale===400?'4X':'1X';textContent="\n            <img src=\"https://so-animation.com/colorflex/img/SC-header-mage.jpg\" alt=\"SC Logo\" class=\"sc-logo\">\n            <h2>".concat(collectionName,"</h2>\n            <h3>").concat(patternName,"</h3>\n            <p style=\"margin: 5px 0; font-size: 14px;\"><strong>Tiling: ").concat(tilingMethod," | Repeat: ").concat(scaleDisplay,"</strong></p>\n            <ul style=\"list-style: none; padding: 0;\">\n        ");layerLabels.forEach(function(_ref21,index){var label=_ref21.label,color=_ref21.color;// Use the actual user-selected color, not curated colors
textContent+="\n                <li>".concat(toInitialCaps(label)," | ").concat(color,"</li>\n            ");});textContent+="</ul>";// Open preview window
previewWindow=window.open('','_blank','width=800,height=1200');if(previewWindow){_context14.n=8;break;}console.error("Print preview - Failed to open preview window");return _context14.a(2,{canvas:printCanvas,dataUrl:dataUrl});case 8:previewWindow.document.write("\n            <html>\n                <head>\n                    <title>Print Preview</title>\n                    <link href=\"https://fonts.googleapis.com/css2?family=Special+Elite&display=swap\" rel=\"stylesheet\">\n                    <style>\n                        body {\n                            font-family: 'Special Elite', 'Times New Roman', serif !important;\n                            padding: 20px;\n                            margin: 0;\n                            display: flex;\n                            justify-content: center;\n                            align-items: flex-start;\n                            min-height: 100vh;\n                            background-color: #111827;\n                            color: #f0e6d2;\n                            overflow: auto;\n                        }\n                        .print-container {\n                            text-align: center;\n                            max-width: 600px;\n                            width: 100%;\n                            display: flex;\n                            flex-direction: column;\n                            align-items: center;\n                            background-color: #434341;\n                            padding: 20px;\n                            border-radius: 8px;\n                        }\n                        .sc-logo {\n                            width: 400px !important;\n                            height: auto;\n                            margin: 0 auto 20px;\n                            display: block;\n                        }\n                        h2 { font-size: 24px; margin: 10px 0; }\n                        h3 { font-size: 20px; margin: 5px 0; }\n                        ul { margin: 10px 0; }\n                        li { margin: 5px 0; font-size: 16px; }\n                        img { max-width: 100%; height: auto; margin: 20px auto; display: block; }\n                        .button-container { margin-top: 20px; }\n                        button {\n                            font-family: 'Special Elite', serif;\n                            padding: 10px 20px;\n                            margin: 0 10px;\n                            font-size: 16px;\n                            cursor: pointer;\n                            background-color: #f0e6d2;\n                            color: #111827;\n                            border: none;\n                            border-radius: 4px;\n                        }\n                        button:hover {\n                            background-color: #e0d6c2;\n                        }\n                    </style>\n                </head>\n                <body>\n                    <div class=\"print-container\">\n                        ".concat(textContent,"\n                        <img src=\"").concat(dataUrl,"\" alt=\"Pattern Preview\">\n                        <div class=\"button-container\">\n                            <button onclick=\"window.print();\">Print</button>\n                            <button onclick=\"download()\">Download</button>\n                            <button onclick=\"window.close();\">Close</button>\n                        </div>\n                    </div>\n                    <script>\n                        function download() {\n                            const link = document.createElement(\"a\");\n                            link.href = \"").concat(dataUrl,"\";\n                            link.download = \"").concat(patternName,"-print.png\";\n                            link.click();\n                        }\n                    </script>\n                </body>\n            </html>\n        "));previewWindow.document.close();console.log("Print preview - Preview window opened");return _context14.a(2,{canvas:printCanvas,dataUrl:dataUrl,layerLabels:layerLabels,collectionName:collectionName,patternName:patternName});}},_callee1);}));return function processPrintPreview(){return _ref20.apply(this,arguments);};}();return processPrintPreview()["catch"](function(error){console.error("Print preview error:",error);return null;});};// Start the app
var appInitializing=false;// Guard to prevent multiple simultaneous initializations
function startApp(){return _startApp.apply(this,arguments);}// Expose startApp to window so Shopify template can access it
function _startApp(){_startApp=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee24(){return _regenerator().w(function(_context33){while(1)switch(_context33.p=_context33.n){case 0:if(!appInitializing){_context33.n=1;break;}console.warn("⚠️ App initialization already in progress, skipping duplicate call");return _context33.a(2);case 1:if(!isAppReady){_context33.n=2;break;}console.warn("⚠️ App already initialized, skipping duplicate call");return _context33.a(2);case 2:appInitializing=true;_context33.p=3;_context33.n=4;return initializeApp();case 4:_context33.n=5;return loadFurnitureConfig();case 5:isAppReady=true;console.log("✅ App fully initialized and ready.");// Add chameleon icon next to save button
setTimeout(function(){addSaveButton();// This function adds the chameleon icon
},1000);// Wait for DOM to be ready
case 6:_context33.p=6;appInitializing=false;return _context33.f(6);case 7:return _context33.a(2);}},_callee24,null,[[3,,6,7]]);}));return _startApp.apply(this,arguments);}window.startApp=startApp;// THUMBNAIL CAPTURE SYSTEM
console.log('🎯 Thumbnail Capture System initializing...');console.log('🔍 Current DOM ready state:',document.readyState);console.log('🔍 Current timestamp:',Date.now());// Function to capture pattern thumbnail using the same method as print function
function capturePatternThumbnailBuiltIn(){var _appState$currentPatt26,_appState$currentPatt27;console.log('📸📸📸 THUMBNAIL CAPTURE START 📸📸📸');console.log('📸 Current pattern:',(_appState$currentPatt26=appState.currentPattern)===null||_appState$currentPatt26===void 0?void 0:_appState$currentPatt26.name);console.log('📸 Current pattern ID from layers:',generatePatternId((_appState$currentPatt27=appState.currentPattern)===null||_appState$currentPatt27===void 0?void 0:_appState$currentPatt27.name,appState.currentLayers,appState.currentScale));return new Promise(/*#__PURE__*/function(){var _ref22=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee10(resolve){var _appState$currentPatt28,_appState$selectedCol55,_appState$layerInputs3,_appState$currentLaye16,_appState$currentPatt29,isWall,backgroundIndex,backgroundInput,backgroundColor,thumbCanvas,thumbCtx,patternSize,patternWidthInches,patternHeightInches,aspectRatio,maxSize,canvasWidth,canvasHeight,currentScalePercent,scale,shadowLayers,nonShadowLayers,_loop9,_i0,_shadowLayers2,nonShadowInputIndex,_loop0,_i1,_nonShadowLayers2,dataUrl,_t12;return _regenerator().w(function(_context17){while(1)switch(_context17.p=_context17.n){case 0:if(appState.currentPattern){_context17.n=1;break;}console.warn('⚠️ No current pattern selected for thumbnail');resolve(null);return _context17.a(2);case 1:_context17.p=1;isWall=((_appState$currentPatt28=appState.currentPattern)===null||_appState$currentPatt28===void 0?void 0:_appState$currentPatt28.isWall)||((_appState$selectedCol55=appState.selectedCollection)===null||_appState$selectedCol55===void 0?void 0:_appState$selectedCol55.name)==="wall-panels";backgroundIndex=isWall?1:0;backgroundInput=(_appState$layerInputs3=appState.layerInputs[backgroundIndex])===null||_appState$layerInputs3===void 0?void 0:_appState$layerInputs3.input;if(backgroundInput){_context17.n=2;break;}console.warn('⚠️ Background input not found for thumbnail');console.log('⚠️ Available layerInputs:',appState.layerInputs);resolve(null);return _context17.a(2);case 2:backgroundColor=lookupColor(backgroundInput.value);console.log('📸 Thumbnail - Background color:',backgroundColor);console.log('📸 Thumbnail - Background input value:',backgroundInput.value);// Debug all layer inputs - THIS IS CRITICAL
console.log('📸 Thumbnail - All layer inputs at capture time:');appState.layerInputs.forEach(function(layerInput,index){if(layerInput&&layerInput.input){var colorValue=layerInput.input.value;var resolvedColor=lookupColor(colorValue);console.log("  Layer ".concat(index,": \"").concat(colorValue,"\" -> ").concat(resolvedColor));}});// Also log currentLayers for comparison
console.log('📸 Thumbnail - currentLayers at capture time:');(_appState$currentLaye16=appState.currentLayers)===null||_appState$currentLaye16===void 0||_appState$currentLaye16.forEach(function(layer,index){console.log("  Layer ".concat(index,":"),layer);});// 🎨 ASPECT RATIO FIX: Create canvas with pattern's actual proportions
thumbCanvas=document.createElement('canvas');thumbCtx=thumbCanvas.getContext('2d',{willReadFrequently:true});// Get pattern dimensions to preserve aspect ratio
patternSize=appState.currentPattern.size||[24,24];// Default to square if no size
patternWidthInches=patternSize[0];patternHeightInches=patternSize[1];aspectRatio=patternWidthInches/patternHeightInches;// Set canvas size to maintain aspect ratio (max 800px on longest side)
maxSize=800;if(aspectRatio>=1){// Wider or square - constrain width to maxSize
canvasWidth=maxSize;canvasHeight=Math.round(maxSize/aspectRatio);}else{// Taller - constrain height to maxSize
canvasHeight=maxSize;canvasWidth=Math.round(maxSize*aspectRatio);}thumbCanvas.width=canvasWidth;thumbCanvas.height=canvasHeight;console.log("\uD83D\uDCF8 Pattern dimensions: ".concat(patternWidthInches,"\"x").concat(patternHeightInches,"\" (").concat(aspectRatio.toFixed(2),":1)"));console.log("\uD83D\uDCF8 Canvas size: ".concat(canvasWidth,"x").concat(canvasHeight,"px (preserves aspect ratio)"));// Get scale for tiling - convert currentScale (100, 200, 300) to actual multiplier (1, 2, 3)
currentScalePercent=appState.currentScale||100;scale=currentScalePercent/100;// 200 → 2.0, 300 → 3.0, 100 → 1.0
console.log("\uD83D\uDCF8 Scale for tiling: ".concat(scale,"x (from currentScale: ").concat(currentScalePercent,"%)"));// Fill background
thumbCtx.fillStyle=backgroundColor;thumbCtx.fillRect(0,0,canvasWidth,canvasHeight);// Process layers like the print function does
if(!((_appState$currentPatt29=appState.currentPattern)!==null&&_appState$currentPatt29!==void 0&&(_appState$currentPatt29=_appState$currentPatt29.layers)!==null&&_appState$currentPatt29!==void 0&&_appState$currentPatt29.length)){_context17.n=8;break;}shadowLayers=[];nonShadowLayers=[];appState.currentPattern.layers.forEach(function(layer,index){var isShadow=layer.isShadow===true;(isShadow?shadowLayers:nonShadowLayers).push({layer:layer,index:index});});// Process shadow layers first
_loop9=/*#__PURE__*/_regenerator().m(function _loop9(){var _shadowLayers2$_i,layer,index;return _regenerator().w(function(_context15){while(1)switch(_context15.n){case 0:_shadowLayers2$_i=_shadowLayers2[_i0],layer=_shadowLayers2$_i.layer,index=_shadowLayers2$_i.index;_context15.n=1;return new Promise(function(layerResolve){processImage(layer.path||"",function(processedUrl){var img=new Image();if(processedUrl instanceof HTMLCanvasElement){img.src=processedUrl.toDataURL("image/png");}else{img.src=processedUrl;}img.onload=function(){thumbCtx.globalCompositeOperation="multiply";thumbCtx.globalAlpha=0.3;// Apply tiling based on scale (divide to make tiles smaller = more tiles)
if(scale!==1.0){var tileWidth=canvasWidth/scale;var tileHeight=canvasHeight/scale;for(var x=0;x<canvasWidth;x+=tileWidth){for(var y=0;y<canvasHeight;y+=tileHeight){thumbCtx.drawImage(img,x,y,tileWidth,tileHeight);}}}else{thumbCtx.drawImage(img,0,0,canvasWidth,canvasHeight);}thumbCtx.globalCompositeOperation="source-over";thumbCtx.globalAlpha=1.0;layerResolve();};img.onerror=function(){return layerResolve();};},null,2.2,true,isWall);});case 1:return _context15.a(2);}},_loop9);});_i0=0,_shadowLayers2=shadowLayers;case 3:if(!(_i0<_shadowLayers2.length)){_context17.n=5;break;}return _context17.d(_regeneratorValues(_loop9()),4);case 4:_i0++;_context17.n=3;break;case 5:// Process non-shadow layers
nonShadowInputIndex=isWall?2:1;_loop0=/*#__PURE__*/_regenerator().m(function _loop0(){var _appState$layerInputs4;var _nonShadowLayers2$_i,layer,index,layerInput,layerColor;return _regenerator().w(function(_context16){while(1)switch(_context16.n){case 0:_nonShadowLayers2$_i=_nonShadowLayers2[_i1],layer=_nonShadowLayers2$_i.layer,index=_nonShadowLayers2$_i.index;layerInput=(_appState$layerInputs4=appState.layerInputs[nonShadowInputIndex])===null||_appState$layerInputs4===void 0?void 0:_appState$layerInputs4.input;layerColor=layerInput?lookupColor(layerInput.value):"#ffffff";_context16.n=1;return new Promise(function(layerResolve){processImage(layer.path||"",function(processedUrl){var img=new Image();if(processedUrl instanceof HTMLCanvasElement){img.src=processedUrl.toDataURL("image/png");}else{img.src=processedUrl;}img.onload=function(){// Apply tiling based on scale (divide to make tiles smaller = more tiles)
if(scale!==1.0){var tileWidth=canvasWidth/scale;var tileHeight=canvasHeight/scale;for(var x=0;x<canvasWidth;x+=tileWidth){for(var y=0;y<canvasHeight;y+=tileHeight){thumbCtx.drawImage(img,x,y,tileWidth,tileHeight);}}}else{thumbCtx.drawImage(img,0,0,canvasWidth,canvasHeight);}layerResolve();};img.onerror=function(){return layerResolve();};},layerColor,2.2,false,isWall);});case 1:nonShadowInputIndex++;case 2:return _context16.a(2);}},_loop0);});_i1=0,_nonShadowLayers2=nonShadowLayers;case 6:if(!(_i1<_nonShadowLayers2.length)){_context17.n=8;break;}return _context17.d(_regeneratorValues(_loop0()),7);case 7:_i1++;_context17.n=6;break;case 8:dataUrl=thumbCanvas.toDataURL('image/jpeg',0.9);console.log('✅ Thumbnail captured successfully using print method');resolve(dataUrl);_context17.n=10;break;case 9:_context17.p=9;_t12=_context17.v;console.error('❌ Failed to capture thumbnail:',_t12);resolve(null);case 10:return _context17.a(2);}},_callee10,null,[[1,9]]);}));return function(_x11){return _ref22.apply(this,arguments);};}());}// Initialize thumbnail capture system by overriding the saveToMyList function
function initializeThumbnailCapture(){console.log('🎯 Initializing thumbnail capture by overriding saveToMyList function...');// Wait for the original saveToMyList function to be defined
var _waitForSaveFunction=function waitForSaveFunction(){if(window.saveToMyList&&typeof window.saveToMyList==='function'){console.log('✅ Found original saveToMyList function, overriding with thumbnail capture...');// Store reference to original function
var originalSaveToMyList=window.saveToMyList;// Override with our thumbnail-capturing version
window.saveToMyList=/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee11(){var _window$appState3,_window$appState4;var currentPatternName,currentScale,replaceExistingIndex,existingPatterns,currentPatternId,exactMatchIndex,_existingPatterns,deletedPattern,_window$appState5,_window$appState$laye,thumbnail,originalSetItem,localStorageCallCount,_t13;return _regenerator().w(function(_context18){while(1)switch(_context18.p=_context18.n){case 0:console.log('🎯 THUMBNAIL CAPTURE: saveToMyList called!');// 🔄 CHECK FOR EXACT DUPLICATE (same ID)
currentPatternName=(_window$appState3=window.appState)===null||_window$appState3===void 0||(_window$appState3=_window$appState3.currentPattern)===null||_window$appState3===void 0?void 0:_window$appState3.name;currentScale=((_window$appState4=window.appState)===null||_window$appState4===void 0?void 0:_window$appState4.currentScale)||100;replaceExistingIndex=-1;// Index to replace if exact duplicate found
console.log('🔍🔍🔍 SAVE DUPLICATE CHECK START 🔍🔍🔍');console.log('Current pattern name:',currentPatternName);console.log('Current scale:',currentScale);console.log('Current layers:',window.appState.currentLayers);if(currentPatternName){existingPatterns=JSON.parse(localStorage.getItem('colorflexSavedPatterns')||'[]');console.log('📋 Existing patterns count:',existingPatterns.length);existingPatterns.forEach(function(p,idx){console.log("  [".concat(idx,"] ").concat(p.patternName," - ID: ").concat(p.id," - Scale: ").concat(p.currentScale));});// ✅ FIX: Generate current pattern ID WITH scale to get accurate comparison
currentPatternId=generatePatternId(currentPatternName,window.appState.currentLayers,currentScale);console.log('🆔 Current pattern FULL ID (with scale):',currentPatternId);// Find patterns with the same FULL ID (name + colors + scale)
exactMatchIndex=existingPatterns.findIndex(function(p){return p.id===currentPatternId;});// ✅ SIMPLIFIED LOGIC:
// - If exact ID match exists (same name + colors + scale), silently replace to update
// - If different colors/scale, IDs are different so save as new variant
// - NO DIALOG - identical designs auto-update, variants auto-save
console.log('🔍 Exact ID match index:',exactMatchIndex);if(exactMatchIndex!==-1){// Exact match found - silently replace to update thumbnail
replaceExistingIndex=exactMatchIndex;console.log('✅ Exact duplicate found - will silently replace to update');console.log('   Existing pattern:',existingPatterns[exactMatchIndex]);}else{// No exact match - this is a new pattern or variant
console.log('✅ No exact ID match - saving as new pattern/variant');}}// If user wants to replace, delete the old version first
if(replaceExistingIndex!==-1){_existingPatterns=JSON.parse(localStorage.getItem('colorflexSavedPatterns')||'[]');deletedPattern=_existingPatterns[replaceExistingIndex];console.log('🗑️ Deleting old version before saving new one:',deletedPattern.id);_existingPatterns.splice(replaceExistingIndex,1);localStorage.setItem('colorflexSavedPatterns',JSON.stringify(_existingPatterns));}_context18.p=1;// Force preview update to ensure we capture current colors
console.log('🔄 Forcing preview refresh before thumbnail capture...');console.log('Current pattern name at save time:',(_window$appState5=window.appState)===null||_window$appState5===void 0||(_window$appState5=_window$appState5.currentPattern)===null||_window$appState5===void 0?void 0:_window$appState5.name);console.log('Current layer values:',(_window$appState$laye=window.appState.layerInputs)===null||_window$appState$laye===void 0?void 0:_window$appState$laye.map(function(l){var _l$input;return{label:l.label,value:(_l$input=l.input)===null||_l$input===void 0?void 0:_l$input.value};}));if(!(typeof updatePreview==='function')){_context18.n=3;break;}_context18.n=2;return updatePreview();case 2:console.log('✅ Preview refreshed with current colors');case 3:// Longer delay to ensure pattern is fully loaded and rendered
console.log('⏳ Waiting 800ms for pattern to fully render...');_context18.n=4;return new Promise(function(resolve){return setTimeout(resolve,800);});case 4:// Capture thumbnail with current state
console.log('📸 Starting thumbnail capture with CURRENT colors...');console.log('Pattern layers at capture time:',window.appState.currentLayers);_context18.n=5;return capturePatternThumbnailBuiltIn();case 5:thumbnail=_context18.v;console.log('📸 Thumbnail size:',thumbnail===null||thumbnail===void 0?void 0:thumbnail.length,'bytes');if(thumbnail){console.log('✅ Thumbnail captured successfully, adding to save...');// Override localStorage temporarily
originalSetItem=localStorage.setItem;localStorageCallCount=0;localStorage.setItem=function(key,value){if(key==='colorflexSavedPatterns'){localStorageCallCount++;console.log("\uD83C\uDFAF localStorage save call #".concat(localStorageCallCount," - adding thumbnail..."));try{var patterns=JSON.parse(value);// Find the last pattern (the one being saved)
var lastPattern=patterns[patterns.length-1];if(lastPattern){// Add thumbnail to pattern
lastPattern.thumbnail=thumbnail;console.log('✅ Thumbnail added to pattern:',lastPattern.patternName,'ID:',lastPattern.id);}value=JSON.stringify(patterns);}catch(error){console.error('❌ Error adding thumbnail:',error);}}return originalSetItem.call(this,key,value);};// Call the original save function
console.log('📝 Calling original saveToMyList function...');originalSaveToMyList.call(this);// Restore localStorage after delay
setTimeout(function(){localStorage.setItem=originalSetItem;console.log('🔄 localStorage setItem restored');},2000);}else{console.warn('⚠️ Thumbnail capture failed, saving without thumbnail');originalSaveToMyList.call(this);}_context18.n=7;break;case 6:_context18.p=6;_t13=_context18.v;console.error('❌ Error in thumbnail capture:',_t13);originalSaveToMyList.call(this);case 7:return _context18.a(2);}},_callee11,this,[[1,6]]);}));console.log('✅ Thumbnail capture system fully initialized by overriding saveToMyList!');}else{console.log('⏳ saveToMyList function not found yet, retrying...');setTimeout(_waitForSaveFunction,1000);}};// Start waiting for the save function
_waitForSaveFunction();}// Run immediately if DOM is already ready
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",function(){startApp();initializeThumbnailCapture();});}else{startApp();initializeThumbnailCapture();}// ============================================================================
// SECTION 10: PATTERN HELPERS & FABRIC MODE
// ============================================================================
// Pattern type detection, color mapping, fabric tuning controls,
// fabric mode toggle, and fabric-specific rendering functions.
// ============================================================================
function getPatternType(pattern,collection){var _collection$elements;if((collection===null||collection===void 0?void 0:collection.name)==="wall-panels")return"wall-panel";if(pattern!==null&&pattern!==void 0&&pattern.tintWhite)return"tint-white";if(collection!==null&&collection!==void 0&&(_collection$elements=collection.elements)!==null&&_collection$elements!==void 0&&_collection$elements.length)return"element-coloring";return"standard";}function getColorMapping(patternType,currentLayers,layerIndex){switch(patternType){case"wall-panel":return currentLayers[layerIndex+2];// Skip wall + background
case"standard":var inputLayers=currentLayers.filter(function(layer){return!layer.isShadow;});return inputLayers[layerIndex+1];// Skip background
case"element-coloring":// Future: element-specific color mapping
var inputLayersElement=currentLayers.filter(function(layer){return!layer.isShadow;});return inputLayersElement[layerIndex+1];default:return currentLayers[layerIndex+1];}}// Add fabric tuning controls
function addFabricTuningControls(){// Check if controls should be shown
if(!SHOW_FABRIC_CONTROLS){return;// Exit early if controls are disabled
}// Remove existing controls
var existingControls=document.getElementById('fabricTuningControls');if(existingControls){existingControls.remove();}// Create control panel
var controlPanel=document.createElement('div');controlPanel.id='fabricTuningControls';controlPanel.style.cssText="\n        position: fixed;\n        top: 20px;\n        right: 20px;\n        background: rgba(0, 0, 0, 0.9);\n        color: white;\n        padding: 15px;\n        border-radius: 8px;\n        border: 2px solid #d4af37;\n        z-index: 1000;\n        font-family: monospace;\n        font-size: 12px;\n        max-width: 300px;\n        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);\n    ";// Add title
var title=document.createElement('h3');title.textContent='🧵 Fabric Tuning';title.style.cssText='margin: 0 0 10px 0; color: #d4af37; font-size: 14px;';controlPanel.appendChild(title);// Create sliders for each parameter
var params=[{key:'alphaStrength',label:'Pattern Opacity',min:0,max:2,step:0.1},{key:'baseTintStrength',label:'Base Color Tint',min:0,max:2,step:0.1},{key:'patternContrast',label:'Pattern Contrast',min:0.1,max:3,step:0.1},{key:'shadowMultiplier',label:'Shadow Interaction',min:0,max:2,step:0.1},{key:'colorVibrance',label:'Color Vibrance',min:0,max:2,step:0.1},{key:'glossyStrength',label:'Glossy Finish',min:0,max:2,step:0.1}];// Add blend mode selector
var blendModeContainer=document.createElement('div');blendModeContainer.style.cssText='margin-bottom: 10px;';var blendModeLabel=document.createElement('label');blendModeLabel.textContent='Blend Mode';blendModeLabel.style.cssText='display: block; margin-bottom: 3px; font-weight: bold;';var blendModeSelect=document.createElement('select');blendModeSelect.style.cssText='width: 100%; padding: 2px; background: #333; color: white; border: 1px solid #555;';var blendModes=[{value:'auto',label:'Auto (Smart)'},{value:'multiply',label:'Multiply'},{value:'overlay',label:'Overlay'},{value:'soft-light',label:'Soft Light'},{value:'hard-light',label:'Hard Light'},{value:'screen',label:'Screen'}];blendModes.forEach(function(mode){var option=document.createElement('option');option.value=mode.value;option.textContent=mode.label;if(mode.value===fabricTuning.blendMode){option.selected=true;}blendModeSelect.appendChild(option);});blendModeSelect.addEventListener('change',function(e){fabricTuning.blendMode=e.target.value;debouncedFabricRender();});blendModeContainer.appendChild(blendModeLabel);blendModeContainer.appendChild(blendModeSelect);controlPanel.appendChild(blendModeContainer);params.forEach(function(param){var container=document.createElement('div');container.style.cssText='margin-bottom: 10px;';var label=document.createElement('label');label.textContent=param.label;label.style.cssText='display: block; margin-bottom: 3px; font-weight: bold;';var slider=document.createElement('input');slider.type='range';slider.min=param.min;slider.max=param.max;slider.step=param.step;slider.value=fabricTuning[param.key];slider.style.cssText='width: 100%; margin-bottom: 2px;';var valueDisplay=document.createElement('span');valueDisplay.textContent=fabricTuning[param.key].toFixed(1);valueDisplay.style.cssText='color: #d4af37; font-weight: bold;';// Update function
slider.addEventListener('input',function(e){var value=parseFloat(e.target.value);fabricTuning[param.key]=value;valueDisplay.textContent=value.toFixed(1);// Re-render fabric in real-time with debounce
debouncedFabricRender();});container.appendChild(label);container.appendChild(slider);container.appendChild(valueDisplay);controlPanel.appendChild(container);});// Add reset button
var resetBtn=document.createElement('button');resetBtn.textContent='Reset to Defaults';resetBtn.style.cssText="\n        background: #d4af37;\n        color: black;\n        border: none;\n        padding: 5px 10px;\n        border-radius: 4px;\n        cursor: pointer;\n        font-size: 11px;\n        font-weight: bold;\n        margin-top: 10px;\n        width: 100%;\n    ";resetBtn.addEventListener('click',function(){fabricTuning.alphaStrength=1.0;fabricTuning.baseTintStrength=1.0;fabricTuning.patternContrast=1.0;fabricTuning.shadowMultiplier=1.0;fabricTuning.colorVibrance=1.2;fabricTuning.blendMode='auto';fabricTuning.glossyStrength=1.0;// Update slider values
controlPanel.querySelectorAll('input[type="range"]').forEach(function(slider,index){slider.value=Object.values(fabricTuning)[index];});controlPanel.querySelectorAll('span').forEach(function(span,index){if(index<5){// Only update value displays
span.textContent=Object.values(fabricTuning)[index].toFixed(1);}});// Update blend mode selector
var blendModeSelect=controlPanel.querySelector('select');if(blendModeSelect){blendModeSelect.value=fabricTuning.blendMode;}// Re-render with debounce
debouncedFabricRender();});controlPanel.appendChild(resetBtn);// Add copy values button
var copyBtn=document.createElement('button');copyBtn.textContent='Copy Values to Console';copyBtn.style.cssText="\n        background: #4a5568;\n        color: white;\n        border: none;\n        padding: 5px 10px;\n        border-radius: 4px;\n        cursor: pointer;\n        font-size: 11px;\n        font-weight: bold;\n        margin-top: 5px;\n        width: 100%;\n    ";copyBtn.addEventListener('click',function(){console.log('🧵 Current fabric tuning values:');console.log('fabricTuning = {');Object.entries(fabricTuning).forEach(function(_ref24){var _ref25=_slicedToArray(_ref24,2),key=_ref25[0],value=_ref25[1];console.log("    ".concat(key,": ").concat(value,","));});console.log('};');});controlPanel.appendChild(copyBtn);// Add to document
document.body.appendChild(controlPanel);}// Function to remove fabric tuning controls
function removeFabricTuningControls(){var existingControls=document.getElementById('fabricTuningControls');if(existingControls){existingControls.remove();}}// Simple fabric mockup function
function renderFabricMockup(){return _renderFabricMockup.apply(this,arguments);}// Add Try Fabric button functionality
function _renderFabricMockup(){_renderFabricMockup=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee25(){var _appState$selectedCol65,_appState$selectedCol66,_appState$selectedCol67,_appState$selectedCol68,_appState$selectedCol69,_appState$selectedCol70,_appState$currentLaye20;var canvas,ctx,canvasWidth,canvasHeight,actualFurnitureConfig,isClothingCollection,isFurnitureCollection,isClothingModeFromCollection,isClothingModeFromWindow,isClothingMode,configKey,furnitureTypeToConfigKey,fabricConfig,pattern,hasNestedMockupLayers,isMultiScaleClothing,isSimpleClothingPage,selectedGarment,garmentLayers,scaleLayers,backgroundColor,mockupBg,fabricBase,tintedDressBase,fabricBaseWidth,fabricBaseHeight,isClothingModeBase,tintCtx,baseImageData,baseData,bgColorMatch,bgR,bgG,bgB,j,alpha,tintStrength,r,g,b,baseCanvas,baseCtx,_baseImageData,_baseData,_bgColorMatch,_bgR,_bgG,_bgB,_j,_r3,_g3,_b3,_alpha2,_tintStrength,patternSlug,_pattern2,CLOTHING_SHADOW_OPACITY,CLOTHING_GLOSS_OPACITY,_selectedGarment,layersToUse,baseName,variantNames,variantCollection,_variantCollection$pa4,variantPattern,scaleToUse,originalLayerCount,_loop11,_ret,i,shadowCanvas,shadowCtx,glossFileName,glossPath,glossImg,fabricGlossy,roomMockup,dataURL,_isSimpleClothingPage,existingZoomControls,existingCanvas,previewCanvases,containerWidth,containerHeight,canvasAspectRatio,containerAspectRatio,displayWidth,displayHeight,panX,panY,scale,_scale,existingButton,_t29,_t30,_t31;return _regenerator().w(function(_context35){while(1)switch(_context35.p=_context35.n){case 0:if(!appState.isFurnitureCompositing){_context35.n=1;break;}console.log("🚫 renderFabricMockup blocked - furniture compositing in progress");return _context35.a(2);case 1:console.log("🧵 ================================");console.log("🧵 FABRIC MOCKUP STARTING");console.log("🧵 ================================");// ✅ CRITICAL: Wait for furniture config to load if not ready yet
if(furnitureConfig){_context35.n=3;break;}console.log("⏳ Waiting for furniture config to load...");_context35.n=2;return loadFurnitureConfig();case 2:console.log("✅ Furniture config loaded, proceeding with mockup render");case 3:canvas=document.createElement("canvas");ctx=canvas.getContext("2d");// Will be dynamically sized based on first loaded image
canvasWidth=600;// Default fallback
canvasHeight=450;// Default fallback
// Get fabric config with error handling
console.log("🔍 Global furnitureConfig:",furnitureConfig);console.log("🔍 AppState furnitureConfig:",appState.furnitureConfig);console.log("🔍 Collection furnitureConfig:",(_appState$selectedCol65=appState.selectedCollection)===null||_appState$selectedCol65===void 0?void 0:_appState$selectedCol65.furnitureConfig);// Try to get furniture config from collection first, then appState, then global
actualFurnitureConfig=((_appState$selectedCol66=appState.selectedCollection)===null||_appState$selectedCol66===void 0?void 0:_appState$selectedCol66.furnitureConfig)||appState.furnitureConfig||furnitureConfig;console.log("🔍 Using furnitureConfig:",actualFurnitureConfig);// Check if this is a clothing or furniture collection
// Match both .clo- and -clo formats
isClothingCollection=((_appState$selectedCol67=appState.selectedCollection)===null||_appState$selectedCol67===void 0||(_appState$selectedCol67=_appState$selectedCol67.name)===null||_appState$selectedCol67===void 0?void 0:_appState$selectedCol67.includes('-clo'))||((_appState$selectedCol68=appState.selectedCollection)===null||_appState$selectedCol68===void 0||(_appState$selectedCol68=_appState$selectedCol68.name)===null||_appState$selectedCol68===void 0?void 0:_appState$selectedCol68.includes('.clo-'));isFurnitureCollection=(_appState$selectedCol69=appState.selectedCollection)===null||_appState$selectedCol69===void 0||(_appState$selectedCol69=_appState$selectedCol69.name)===null||_appState$selectedCol69===void 0?void 0:_appState$selectedCol69.includes('.fur-');// ✅ CRITICAL: Exit early if this is furniture - furniture should use updateFurniturePreview(), not renderFabricMockup()
if(!(isFurnitureCollection||appState.isInFurnitureMode||window.COLORFLEX_MODE==='FURNITURE')){_context35.n=4;break;}console.log("🪑 renderFabricMockup() called for furniture - this should use updateFurniturePreview() instead!");console.log("🪑 Exiting early to prevent furniture from getting clothing layers");return _context35.a(2);case 4:// ✅ Define isClothingMode at function level (used later in the function)
// ✅ FIX: Check window.COLORFLEX_MODE in addition to collection name (clothing pages use base collections without -clo suffix)
// ✅ Don't use window.COLORFLEX_SIMPLE_MODE as it's set for both clothing AND furniture simple modes
isClothingModeFromCollection=isClothingCollection&&!isFurnitureCollection;isClothingModeFromWindow=window.COLORFLEX_MODE==='CLOTHING';isClothingMode=isClothingModeFromCollection||isClothingModeFromWindow;// Configure image smoothing for high-quality rendering at all scales
// HIGH QUALITY SMOOTHING: With high-res source images, proper interpolation produces
// clean, sharp results without aliasing. Disabling smoothing causes pixelated edges.
ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";// Use high quality for best scaling results
console.log('🔧 Image smoothing enabled (high quality) for clean scaling');// Determine which config to use based on mode
configKey='fabric';if(isClothingMode){// CLOTHING MODE: Check selected garment (dress or pantsuit)
if(appState.selectedGarment==='pantsuit'){configKey='clothing-pants';}else{configKey='clothing';// Default to dress
}}else if(isFurnitureCollection){// FURNITURE MODE: Map furniture type to config key
// mockupLayers use 'Sofa-Capitol'/'Sofa-Kite', but config uses 'furniture'/'furniture-kite'
furnitureTypeToConfigKey={'Sofa-Capitol':'furniture','Sofa-Kite':'furniture-kite'};configKey=furnitureTypeToConfigKey[appState.selectedFurnitureType]||'furniture';console.log("\uD83E\uDE91 FURNITURE MODE: ".concat(appState.selectedFurnitureType," -> config: ").concat(configKey));}else{console.log("\uD83E\uDDF5 FABRIC MODE: Using fabric config: ".concat(configKey));}console.log("\uD83D\uDD0D Collection type: ".concat(configKey," (").concat((_appState$selectedCol70=appState.selectedCollection)===null||_appState$selectedCol70===void 0?void 0:_appState$selectedCol70.name,")"));fabricConfig=actualFurnitureConfig===null||actualFurnitureConfig===void 0?void 0:actualFurnitureConfig[configKey];if(fabricConfig){_context35.n=5;break;}console.error("\u274C ".concat(configKey," config not found in furnitureConfig!"));console.log("🔍 Available furniture config keys:",Object.keys(actualFurnitureConfig||{}));return _context35.a(2);case 5:console.log("\uD83D\uDD0D ".concat(configKey," config:"),fabricConfig);// ===== MOCKUP RENDERING (WALLPAPER/FABRIC/FURNITURE/CLOTHING) =====
console.log("🔧 Using mockup rendering with background/base/pattern compositing");// Check if this pattern has nested mockupLayers (new multi-scale clothing format)
pattern=appState.currentPattern;hasNestedMockupLayers=pattern.mockupLayers&&_typeof(pattern.mockupLayers)==='object'&&!Array.isArray(pattern.mockupLayers);// ===== MULTI-SCALE CLOTHING: Flatten nested mockupLayers for traditional pipeline =====
// Check for nested format OR previously saved original structure
isMultiScaleClothing=(hasNestedMockupLayers||pattern._originalMockupLayers)&&isClothingMode;if(!isMultiScaleClothing){_context35.n=8;break;}console.log("👗 MULTI-SCALE CLOTHING: Detected nested mockupLayers format");// ✅ ENFORCE SCALE 1.0 for standard clothing page (not simple mode)
isSimpleClothingPage=window.COLORFLEX_SIMPLE_MODE===true&&window.COLORFLEX_MODE==='CLOTHING';if(isSimpleClothingPage){// Simple clothing page: Use selected scale or default to 1.0
if(!appState.selectedClothingScale){appState.selectedClothingScale="1.0";}console.log("\uD83D\uDC57 Simple clothing page: Using scale ".concat(appState.selectedClothingScale," (all scales available)"));}else{// Standard clothing page: Enforce scale 1.0 only
appState.selectedClothingScale="1.0";console.log("\uD83D\uDC57 Standard clothing page: Enforcing scale 1.0 only");}// Initialize selected garment if not set (default to "dress")
if(!appState.selectedGarment){appState.selectedGarment="dress";}// Preserve original nested structure if not already saved
if(!pattern._originalMockupLayers){pattern._originalMockupLayers=_objectSpread({},pattern.mockupLayers);console.log("\uD83D\uDCBE Saved original nested mockupLayers structure");}// Get the correct scale's mockup layers from original structure
selectedGarment=appState.selectedGarment;console.log("\uD83D\uDC54 Selected garment: ".concat(selectedGarment));garmentLayers=pattern._originalMockupLayers[selectedGarment];if(garmentLayers){_context35.n=6;break;}console.error("\u274C No mockupLayers found for garment: ".concat(selectedGarment));console.log("Available garments:",Object.keys(pattern._originalMockupLayers));return _context35.a(2);case 6:scaleLayers=garmentLayers[appState.selectedClothingScale];if(!(!scaleLayers||scaleLayers.length===0)){_context35.n=7;break;}console.error("\u274C No layers found for scale: ".concat(appState.selectedClothingScale,"X"));console.log("Available scales for ".concat(selectedGarment,":"),Object.keys(garmentLayers));return _context35.a(2);case 7:console.log("\uD83D\uDC57 Using ".concat(scaleLayers.length," layer(s) for ").concat(selectedGarment," @ ").concat(appState.selectedClothingScale,"X scale"));// Flatten the nested structure: Replace pattern.mockupLayers with the scale-specific array
// This allows the traditional rendering pipeline to work with multi-scale data
pattern.mockupLayers=scaleLayers;console.log("\uD83D\uDC57 Flattened mockupLayers for traditional pipeline (".concat(scaleLayers.length," layers)"));case 8:// ===== TRADITIONAL RENDERING PATH (WORKS FOR ALL FORMATS) =====
// Get background color (first layer is Background)
console.log("🔍 Current layers:",appState.currentLayers);console.log("🔍 First layer:",appState.currentLayers[0]);backgroundColor=lookupColor(((_appState$currentLaye20=appState.currentLayers[0])===null||_appState$currentLaye20===void 0?void 0:_appState$currentLaye20.color)||"Snowbound");console.log("🎨 Background color:",backgroundColor);console.log("🔍 Base tint strength:",fabricTuning.baseTintStrength);_context35.p=9;// 1. Load and draw room mockup background
mockupBg=new Image();mockupBg.crossOrigin="anonymous";_context35.n=10;return new Promise(function(resolve,reject){mockupBg.onload=resolve;mockupBg.onerror=reject;mockupBg.src="https://so-animation.com/colorflex/".concat(fabricConfig.mockup);});case 10:// Set canvas size to NATIVE 4K image dimensions for full-resolution compositing
// Use naturalWidth/naturalHeight to get actual file dimensions, not display size
// const isClothingMode = appState.selectedCollection?.name?.includes('-clo') || appState.selectedCollection?.name?.includes('.clo-');
canvasWidth=mockupBg.naturalWidth||mockupBg.width;canvasHeight=mockupBg.naturalHeight||mockupBg.height;canvas.width=canvasWidth;canvas.height=canvasHeight;console.log("\uD83D\uDCD0 Canvas using NATIVE image dimensions: ".concat(canvasWidth,"x").concat(canvasHeight," (4K resolution)"));// Draw room background at full resolution
ctx.drawImage(mockupBg,0,0);// 2. Load fabric base for later use (includes dress-base for clothing)
fabricBase=null;tintedDressBase=null;// Separate variable for tinted dress-base in clothing mode
if(!fabricConfig.base){_context35.n=12;break;}fabricBase=new Image();fabricBase.crossOrigin="anonymous";_context35.n=11;return new Promise(function(resolve,reject){fabricBase.onload=resolve;fabricBase.onerror=reject;fabricBase.src="https://so-animation.com/colorflex/".concat(fabricConfig.base);});case 11:fabricBaseWidth=fabricBase.naturalWidth||fabricBase.width;fabricBaseHeight=fabricBase.naturalHeight||fabricBase.height;console.log("\uD83D\uDCD0 Fabric base loaded at NATIVE resolution: ".concat(fabricBaseWidth,"x").concat(fabricBaseHeight));// For clothing mode: Create tinted dress-base canvas at NATIVE 4K resolution
// ✅ Use window.COLORFLEX_MODE instead of collection name check (standard clothing uses base collections)
isClothingModeBase=window.COLORFLEX_MODE==='CLOTHING';if(isClothingModeBase){tintedDressBase=document.createElement("canvas");tintCtx=tintedDressBase.getContext("2d");tintedDressBase.width=fabricBaseWidth;tintedDressBase.height=fabricBaseHeight;// Configure image smoothing for tinted dress-base (high quality)
tintCtx.imageSmoothingEnabled=true;tintCtx.imageSmoothingQuality="high";// Draw dress-base at its native 4K size
tintCtx.drawImage(fabricBase,0,0,fabricBaseWidth,fabricBaseHeight);// Extract alpha channel and apply background color tint
baseImageData=tintCtx.getImageData(0,0,fabricBaseWidth,fabricBaseHeight);baseData=baseImageData.data;// Parse background color
bgColorMatch=backgroundColor.match(/^#([0-9a-f]{6})$/i);if(bgColorMatch){bgR=parseInt(bgColorMatch[1].substr(0,2),16);bgG=parseInt(bgColorMatch[1].substr(2,2),16);bgB=parseInt(bgColorMatch[1].substr(4,2),16);for(j=0;j<baseData.length;j+=4){alpha=baseData[j+3];if(alpha>0){tintStrength=fabricTuning.baseTintStrength;r=baseData[j];g=baseData[j+1];b=baseData[j+2];// Apply background color tint
baseData[j]=Math.floor(bgR*tintStrength+r*(1-tintStrength));baseData[j+1]=Math.floor(bgG*tintStrength+g*(1-tintStrength));baseData[j+2]=Math.floor(bgB*tintStrength+b*(1-tintStrength));}}tintCtx.putImageData(baseImageData,0,0);}console.log("✅ Created tinted dress-base for clothing mode");}_context35.n=13;break;case 12:console.log("⏭️  No base layer configured");case 13:// 3. Create base canvas for pattern layers or tinted fabric base
baseCanvas=null;baseCtx=null;if(fabricBase&&!tintedDressBase){// Fabric mode: Create tinted base using alpha channel
baseCanvas=document.createElement("canvas");baseCtx=baseCanvas.getContext("2d");baseCanvas.width=canvasWidth;baseCanvas.height=canvasHeight;// Draw fabric base to get alpha channel at full resolution
baseCtx.drawImage(fabricBase,0,0,canvasWidth,canvasHeight);// Extract alpha channel and apply background color tint
_baseImageData=baseCtx.getImageData(0,0,canvasWidth,canvasHeight);_baseData=_baseImageData.data;// Parse background color
_bgColorMatch=backgroundColor.match(/^#([0-9a-f]{6})$/i);if(_bgColorMatch){_bgR=parseInt(_bgColorMatch[1].substr(0,2),16);_bgG=parseInt(_bgColorMatch[1].substr(2,2),16);_bgB=parseInt(_bgColorMatch[1].substr(4,2),16);for(_j=0;_j<_baseData.length;_j+=4){_r3=_baseData[_j];_g3=_baseData[_j+1];_b3=_baseData[_j+2];_alpha2=_baseData[_j+3];if(_alpha2>0){_tintStrength=fabricTuning.baseTintStrength;// Apply background color tint
_baseData[_j]=Math.floor(_bgR*_tintStrength+_r3*(1-_tintStrength));_baseData[_j+1]=Math.floor(_bgG*_tintStrength+_g3*(1-_tintStrength));_baseData[_j+2]=Math.floor(_bgB*_tintStrength+_b3*(1-_tintStrength));// Keep original alpha channel
}}baseCtx.putImageData(_baseImageData,0,0);}console.log("✅ Created tinted base layer for fabric mode");}else{// Clothing mode: create pattern canvas to composite pattern layers
baseCanvas=document.createElement("canvas");baseCtx=baseCanvas.getContext("2d");baseCanvas.width=canvasWidth;baseCanvas.height=canvasHeight;// Configure image smoothing for pattern canvas in clothing mode
baseCtx.imageSmoothingEnabled=true;// High-quality scaling for clothing
baseCtx.imageSmoothingQuality="high";console.log("⏭️  Created pattern canvas for clothing mode (high-quality smoothing)");}// Load pattern layers using the fabric config from furniture-config.json
patternSlug=createPatternSlug(appState.currentPattern.name);_pattern2=appState.currentPattern;// ========================================
// CLOTHING MODE COMPOSITING CONTROLS
// Edit these values to adjust shadow and gloss intensity
// ========================================
CLOTHING_SHADOW_OPACITY=1.0;// Shadow strength: 0.0 (invisible) to 1.0 (full)
CLOTHING_GLOSS_OPACITY=0.25;// Gloss/highlight strength: 0.0 (no gloss) to 1.0 (full gloss)
// Typical range: 0.15-0.35 for realistic fabric highlights
// ===== MULTI-SCALE CLOTHING SUPPORT =====
// Initialize clothing scale if not set (default to 1.0X)
if(!appState.selectedClothingScale){appState.selectedClothingScale="1.0";}// Get selected garment from appState, default to "dress"
_selectedGarment=appState.selectedGarment||"dress";// ✅ CLOTHING MODE: Use mockupLayers directly from collections.json (multi-resolution)
// Both standard and simple clothing pages use multi-resolution from mockupLayers
// Structure: mockupLayers = { "dress": { "1.0": [...], "1.5": [...], "2.0": [...] }, "pantsuit": {...} }
console.log("\uD83D\uDD0D Checking mockupLayers for pattern: ".concat(_pattern2.name));console.log("\uD83D\uDD0D pattern.mockupLayers exists:",!!_pattern2.mockupLayers);console.log("\uD83D\uDD0D pattern.mockupLayers type:",_typeof(_pattern2.mockupLayers));console.log("\uD83D\uDD0D pattern.mockupLayers is array:",Array.isArray(_pattern2.mockupLayers));console.log("\uD83D\uDD0D selectedGarment:",_selectedGarment);console.log("\uD83D\uDD0D appState.selectedClothingScale:",appState.selectedClothingScale);// ✅ FALLBACK: If mockupLayers is missing, try to look it up from variant collection
if(!_pattern2.mockupLayers&&appState.allCollections&&appState.selectedCollection){baseName=appState.selectedCollection.name;variantNames=[baseName+'.clo',baseName+'-clo',baseName+'.clo-1',baseName+'-clo-1'];console.log("\uD83D\uDD04 mockupLayers missing, looking for variant collection (trying: ".concat(variantNames.join(', '),")..."));variantCollection=appState.allCollections.find(function(c){return c&&c.name&&variantNames.some(function(variantName){return c.name===variantName||c.name.toLowerCase()===variantName.toLowerCase();});});if(variantCollection){console.log("\u2705 Found variant collection \"".concat(variantCollection.name,"\""));variantPattern=(_variantCollection$pa4=variantCollection.patterns)===null||_variantCollection$pa4===void 0?void 0:_variantCollection$pa4.find(function(p){return p.slug===_pattern2.slug||p.id===_pattern2.id||p.name===_pattern2.name||p.name.toLowerCase()===_pattern2.name.toLowerCase();});if(variantPattern&&variantPattern.mockupLayers){console.log("\u2705 Found mockupLayers in variant collection, merging into pattern");_pattern2.mockupLayers=variantPattern.mockupLayers;// Update appState.currentPattern so it persists
appState.currentPattern.mockupLayers=variantPattern.mockupLayers;}}}if(_pattern2.mockupLayers&&_typeof(_pattern2.mockupLayers)==='object'&&!Array.isArray(_pattern2.mockupLayers)){// Get the selected scale (defaults to 1.0 if not set)
// Both standard and simple clothing use selectedClothingScale for multi-resolution
scaleToUse=appState.selectedClothingScale||"1.0";console.log("\uD83D\uDD0D Available garments in mockupLayers:",Object.keys(_pattern2.mockupLayers));if(_pattern2.mockupLayers[_selectedGarment]){console.log("\uD83D\uDD0D Available scales for ".concat(_selectedGarment,":"),Object.keys(_pattern2.mockupLayers[_selectedGarment]));}// Check if mockupLayers has the selected garment and scale
if(_pattern2.mockupLayers[_selectedGarment]&&_pattern2.mockupLayers[_selectedGarment][scaleToUse]){layersToUse=_pattern2.mockupLayers[_selectedGarment][scaleToUse];console.log("\uD83D\uDC57 Using mockupLayers: ".concat(_selectedGarment," @ ").concat(scaleToUse,"X (").concat(layersToUse.length," layers)"));}else{// Try to fall back to 1.0 if the selected scale doesn't exist
if(_pattern2.mockupLayers[_selectedGarment]&&_pattern2.mockupLayers[_selectedGarment]["1.0"]){layersToUse=_pattern2.mockupLayers[_selectedGarment]["1.0"];console.warn("\u26A0\uFE0F Scale ".concat(scaleToUse,"X not found, falling back to 1.0X for ").concat(_selectedGarment));console.log("\uD83D\uDC57 Using mockupLayers: ".concat(_selectedGarment," @ 1.0X (").concat(layersToUse.length," layers)"));}else{console.warn("\u26A0\uFE0F No mockupLayers found for ".concat(_selectedGarment," - falling back to pattern.layers"));console.warn("\u26A0\uFE0F Available garments:",Object.keys(_pattern2.mockupLayers));layersToUse=_pattern2.layers||[];}}}else if(Array.isArray(_pattern2.mockupLayers)){// OLD FORMAT: mockupLayers = [array] (backwards compatibility)
layersToUse=_pattern2.mockupLayers;console.log("\uD83D\uDC57 Using old-format mockupLayers array (".concat(layersToUse.length," layers)"));}else{// No mockupLayers - fall back to pattern.layers (pattern preview paths)
console.warn("\u26A0\uFE0F No mockupLayers found - falling back to pattern.layers (may not display correctly)");console.warn("\u26A0\uFE0F Pattern name: ".concat(_pattern2.name,", Pattern has layers:"),!!_pattern2.layers);layersToUse=_pattern2.layers||[];}// ✅ CRITICAL: Filter out shadow layers from layersToUse regardless of source
// Shadow layers should not be processed as pattern layers - they're handled separately
originalLayerCount=layersToUse.length;layersToUse=layersToUse.filter(function(layer,index){// Check for isShadow flag
var isShadowFlag=_typeof(layer)==='object'&&layer.isShadow===true;// Check for "ISSHADOW" in path/imageUrl (case-insensitive)
var layerPath='';if(typeof layer==='string'){layerPath=layer;}else if(layer.path){layerPath=layer.path;}else if(layer.imageUrl){layerPath=layer.imageUrl;}var isShadowPath=layerPath.toUpperCase().includes('ISSHADOW');var isShadow=isShadowFlag||isShadowPath;if(isShadow){console.log("  \uD83D\uDEAB Skipping shadow layer at index ".concat(index," (isShadow: ").concat(isShadowFlag,", path contains ISSHADOW: ").concat(isShadowPath,")"));}return!isShadow;});if(layersToUse.length<originalLayerCount){console.log("\uD83D\uDEAB Filtered out ".concat(originalLayerCount-layersToUse.length," shadow layer(s) from layersToUse"));}console.log("\uD83D\uDD0D Pattern layers available:",layersToUse);console.log("\uD83D\uDD0D Fabric config patternPathTemplate:",fabricConfig.patternPathTemplate);console.log("\uD83D\uDD0D baseCanvas exists:",!!baseCanvas);console.log("\uD83D\uDD0D baseCtx exists:",!!baseCtx);console.log("\uD83D\uDD0D isClothingMode:",isClothingMode);console.log("\uD83D\uDD0D tintedDressBase exists:",!!tintedDressBase);// Process pattern layers (skip Background layer at index 0)
if(layersToUse.length===0){console.warn('⚠️ No pattern layers to process! This will result in an empty baseCanvas.');}_loop11=/*#__PURE__*/_regenerator().m(function _loop11(){var layer,layerPath,_appState$currentLaye21,layerImg,layerNativeWidth,layerNativeHeight,tempCanvas,tempCtx,colorIndex,layerColor,colorMatch,colorR,colorG,colorB,vibrance,vibranceR,vibranceG,vibranceB,imageData,data,nonTransparentPixels,averageLuminance,_j2,_r4,_g4,_b4,_alpha3,patternLuminance,opacity,_t28;return _regenerator().w(function(_context34){while(1)switch(_context34.p=_context34.n){case 0:layer=layersToUse[i];console.log("\uD83D\uDD0D Pattern layer ".concat(i," object:"),layer);// Use layer path directly from collections.json (no transformation needed)
if(!(typeof layer==='string')){_context34.n=1;break;}layerPath=normalizePath(layer);_context34.n=4;break;case 1:if(!layer.path){_context34.n=2;break;}layerPath=normalizePath(layer.path);_context34.n=4;break;case 2:if(!layer.imageUrl){_context34.n=3;break;}layerPath=normalizePath(layer.imageUrl);_context34.n=4;break;case 3:console.warn("\u26A0\uFE0F Pattern layer ".concat(i," has no valid path"));return _context34.a(2,0);case 4:console.log("\uD83D\uDD0D Loading pattern layer ".concat(i,": ").concat(layerPath));_context34.p=5;layerImg=new Image();layerImg.crossOrigin="anonymous";_context34.n=6;return new Promise(function(resolve,reject){layerImg.onload=resolve;layerImg.onerror=reject;layerImg.src=layerPath;});case 6:layerNativeWidth=layerImg.naturalWidth||layerImg.width;layerNativeHeight=layerImg.naturalHeight||layerImg.height;console.log("\uD83D\uDCD0 Pattern layer ".concat(i," loaded at NATIVE resolution: ").concat(layerNativeWidth,"x").concat(layerNativeHeight));// Apply pattern to pattern composite (like pattern preview)
tempCanvas=document.createElement("canvas");tempCtx=tempCanvas.getContext("2d");tempCanvas.width=canvasWidth;tempCanvas.height=canvasHeight;// Configure image smoothing for temp canvas (high quality for all modes)
tempCtx.imageSmoothingEnabled=true;tempCtx.imageSmoothingQuality="high";// High-quality scaling prevents aliasing
// Draw the pattern image at canvas size (which is now 4K native resolution)
tempCtx.drawImage(layerImg,0,0,canvasWidth,canvasHeight);console.log("\u2705 Pattern layer ".concat(i," drawn at native 4K canvas size"));// Get the layer's color from appState (pattern layers start at index 1 after Background)
colorIndex=i+1;// Skip Background layer at index 0
layerColor=lookupColor(((_appState$currentLaye21=appState.currentLayers[colorIndex])===null||_appState$currentLaye21===void 0?void 0:_appState$currentLaye21.color)||"#FFFFFF");console.log("\uD83C\uDFA8 Using color ".concat(layerColor," for pattern layer ").concat(i," (color index ").concat(colorIndex,")"));// Parse pattern color (hex to RGB)
colorMatch=layerColor.match(/^#([0-9a-f]{6})$/i);if(colorMatch){_context34.n=7;break;}console.warn("\u26A0\uFE0F Invalid color format for layer ".concat(i,": ").concat(layerColor));return _context34.a(2,0);case 7:colorR=parseInt(colorMatch[1].substr(0,2),16);colorG=parseInt(colorMatch[1].substr(2,2),16);colorB=parseInt(colorMatch[1].substr(4,2),16);// Apply color vibrance adjustment
vibrance=fabricTuning.colorVibrance;vibranceR=Math.floor(127+(colorR-127)*vibrance);vibranceG=Math.floor(127+(colorG-127)*vibrance);vibranceB=Math.floor(127+(colorB-127)*vibrance);console.log("\uD83C\uDFA8 Pattern layer ".concat(i," RGB: ").concat(vibranceR,", ").concat(vibranceG,", ").concat(vibranceB));// Extract pattern luminance and apply color (like pattern preview)
imageData=tempCtx.getImageData(0,0,canvasWidth,canvasHeight);data=imageData.data;nonTransparentPixels=0;averageLuminance=0;// Apply pattern processing (similar to pattern preview)
for(_j2=0;_j2<data.length;_j2+=4){_r4=data[_j2];_g4=data[_j2+1];_b4=data[_j2+2];_alpha3=data[_j2+3];if(_alpha3>0){nonTransparentPixels++;// Calculate pattern luminance
patternLuminance=0.299*_r4+0.587*_g4+0.114*_b4;// Apply pattern contrast adjustment
patternLuminance=Math.pow(patternLuminance/255,1/fabricTuning.patternContrast)*255;averageLuminance+=patternLuminance;// Create colored pattern with luminance-based opacity
opacity=patternLuminance/255*fabricTuning.alphaStrength;data[_j2]=vibranceR;data[_j2+1]=vibranceG;data[_j2+2]=vibranceB;data[_j2+3]=Math.min(255,opacity*255);}else{data[_j2+3]=0;}}if(nonTransparentPixels>0){averageLuminance/=nonTransparentPixels;console.log("\uD83D\uDD0D Pattern layer ".concat(i,": ").concat(nonTransparentPixels," pixels, avg luminance: ").concat(averageLuminance.toFixed(2)));}else{console.warn("\u26A0\uFE0F Pattern layer ".concat(i,": No non-transparent pixels found"));}// Put the processed pattern back
tempCtx.putImageData(imageData,0,0);// Apply to base canvas using normal blending
baseCtx.globalCompositeOperation="source-over";baseCtx.drawImage(tempCanvas,0,0);console.log("\uD83D\uDD0D Applied pattern layer ".concat(i," to base canvas"));console.log("\u2705 Pattern layer ".concat(i," applied"));_context34.n=9;break;case 8:_context34.p=8;_t28=_context34.v;console.warn("\u26A0\uFE0F Pattern layer ".concat(i," failed:"),_t28);case 9:return _context34.a(2);}},_loop11,null,[[5,8]]);});i=0;case 14:if(!(i<layersToUse.length)){_context35.n=17;break;}return _context35.d(_regeneratorValues(_loop11()),15);case 15:_ret=_context35.v;if(!(_ret===0)){_context35.n=16;break;}return _context35.a(3,16);case 16:i++;_context35.n=14;break;case 17:// 4. Final compositing in correct order (isClothingMode already declared above)
console.log("\uD83E\uDDF5 Final compositing: ".concat(isClothingMode?'clothing':'fabric'," mode"));// SIMPLIFIED APPROACH: Draw all layers at canvas size (canvas is now 2x for clothing)
// Canvas is already sized correctly: 1100x1400 for clothing, 550x700 for fabric
// Layer 1: Mockup (dress mannequin or room background)
ctx.drawImage(mockupBg,0,0,canvasWidth,canvasHeight);console.log("\u2705 Mockup drawn at canvas size (".concat(canvasWidth,"x").concat(canvasHeight,")"));// Layer 2: Tinted base (clothing) or pattern layers (fabric without base)
if(tintedDressBase&&isClothingMode){// Clothing mode: Draw tinted dress-base BEFORE patterns
ctx.globalCompositeOperation="source-over";ctx.drawImage(tintedDressBase,0,0,canvasWidth,canvasHeight);console.log("\u2705 Tinted dress-base drawn at canvas size (".concat(canvasWidth,"x").concat(canvasHeight,")"));}// Layer 3: Pattern layers (always drawn at canvas size)
ctx.globalCompositeOperation="source-over";ctx.drawImage(baseCanvas,0,0,canvasWidth,canvasHeight);console.log("\u2705 Pattern layers composited at canvas size (".concat(canvasWidth,"x").concat(canvasHeight,")"));// Layer 3.5: For clothing mode, add shadow overlay constrained to dress-base alpha
if(isClothingMode&&tintedDressBase){// Create temporary canvas for shadow layer
shadowCanvas=document.createElement("canvas");shadowCtx=shadowCanvas.getContext("2d");shadowCanvas.width=canvasWidth;shadowCanvas.height=canvasHeight;// Configure image smoothing for shadow canvas (high quality)
shadowCtx.imageSmoothingEnabled=true;shadowCtx.imageSmoothingQuality="high";// Draw mockup base (which has shadows)
shadowCtx.drawImage(mockupBg,0,0,canvasWidth,canvasHeight);// Use destination-in to clip shadow to dress-base alpha channel
shadowCtx.globalCompositeOperation="destination-in";shadowCtx.drawImage(tintedDressBase,0,0,canvasWidth,canvasHeight);// Composite the masked shadow onto main canvas with multiply blend
ctx.globalCompositeOperation="multiply";ctx.globalAlpha=CLOTHING_SHADOW_OPACITY;ctx.drawImage(shadowCanvas,0,0,canvasWidth,canvasHeight);ctx.globalAlpha=1.0;// Reset alpha
ctx.globalCompositeOperation="source-over";// Reset
console.log("\u2705 Shadow overlay applied (opacity: ".concat(CLOTHING_SHADOW_OPACITY,", multiply blend)"));}// Layer 3.75: For clothing mode, add gloss layer over the pattern (screen blend at 25% opacity)
if(!isClothingMode){_context35.n=21;break;}_context35.p=18;// Gloss layers are in data/mockups/clothing/
// Map garment names: "dress" → "dress-gloss.png", "pantsuit" → "pants-suit-gloss.png"
glossFileName=_selectedGarment==='pantsuit'?'pants-suit-gloss.png':"".concat(_selectedGarment,"-gloss.png");glossPath="data/mockups/clothing/".concat(glossFileName);console.log("\uD83D\uDD0D Loading gloss layer from: ".concat(glossPath));glossImg=new Image();glossImg.crossOrigin="anonymous";_context35.n=19;return new Promise(function(resolve,reject){glossImg.onload=resolve;glossImg.onerror=reject;glossImg.src="https://so-animation.com/colorflex/".concat(glossPath);});case 19:console.log("\uD83D\uDCD0 Gloss layer loaded: ".concat(glossImg.width,"x").concat(glossImg.height));// Apply gloss layer with screen blend mode
ctx.globalCompositeOperation="screen";ctx.globalAlpha=CLOTHING_GLOSS_OPACITY;ctx.drawImage(glossImg,0,0,canvasWidth,canvasHeight);// Reset alpha and composite operation
ctx.globalAlpha=1.0;ctx.globalCompositeOperation="source-over";console.log("\u2705 Gloss layer applied (opacity: ".concat(CLOTHING_GLOSS_OPACITY,", screen blend)"));_context35.n=21;break;case 20:_context35.p=20;_t29=_context35.v;console.log("\u26A0\uFE0F Gloss layer not available for ".concat(_selectedGarment," @ ").concat(appState.selectedClothingScale,"X - continuing without gloss"));case 21:if(!(fabricBase&&!isClothingMode)){_context35.n=26;break;}// Fabric mode only: Multiply base for shadows
ctx.globalCompositeOperation="multiply";ctx.drawImage(fabricBase,0,0,canvasWidth,canvasHeight);// Layer 4: Glossy finish (screen blend for shine effect)
if(!(fabricTuning.glossyStrength>0)){_context35.n=25;break;}_context35.p=22;fabricGlossy=new Image();fabricGlossy.crossOrigin="anonymous";_context35.n=23;return new Promise(function(resolve,reject){fabricGlossy.onload=resolve;fabricGlossy.onerror=reject;// Use fabric-glossy.png from the same directory as fabric-base.png
var glossyPath=fabricConfig.base.replace('fabric-base.png','fabric-glossy.png');fabricGlossy.src="https://so-animation.com/colorflex/".concat(glossyPath);});case 23:console.log("\uD83D\uDCD0 Fabric glossy: ".concat(fabricGlossy.width,"x").concat(fabricGlossy.height));// Apply glossy layer with screen blend mode and tunable opacity
ctx.globalCompositeOperation="screen";ctx.globalAlpha=fabricTuning.glossyStrength;ctx.drawImage(fabricGlossy,0,0,canvasWidth,canvasHeight);// Reset alpha and composite operation
ctx.globalAlpha=1.0;ctx.globalCompositeOperation="source-over";console.log("✅ Glossy layer applied with screen blend");_context35.n=25;break;case 24:_context35.p=24;_t30=_context35.v;console.warn("⚠️ Glossy layer failed to load:",_t30);// Continue without glossy layer if it fails
case 25:// Reset composite operation
ctx.globalCompositeOperation="source-over";console.log("✅ All layers composited in correct order (fabric mode)");_context35.n=27;break;case 26:if(isClothingMode){console.log("✅ Clothing mode compositing complete (mockup + dress-base + patterns)");}else{console.log("✅ Fabric mode compositing complete (mockup + patterns only)");}case 27:// Update display - try both possible element references
roomMockup=document.getElementById('roomMockup');if(!roomMockup&&dom!==null&&dom!==void 0&&dom.roomMockup){roomMockup=dom.roomMockup;}console.log("🔍 roomMockup element found:",!!roomMockup);console.log("🔍 dom.roomMockup available:",!!(dom!==null&&dom!==void 0&&dom.roomMockup));if(!roomMockup){_context35.n=31;break;}dataURL=canvas.toDataURL();console.log("🔍 Canvas dataURL length:",dataURL.length);console.log("🔍 roomMockup element type:",roomMockup.tagName);// ✅ STANDARD CLOTHING PAGE: Set container dimensions and styling
// Only for standard clothing page (not simple mode)
_isSimpleClothingPage=window.COLORFLEX_SIMPLE_MODE===true&&window.COLORFLEX_MODE==='CLOTHING';if(isClothingMode&&!_isSimpleClothingPage){// Standard clothing page: 600×700 with dark blue background
roomMockup.style.setProperty('width','600px','important');roomMockup.style.setProperty('height','700px','important');roomMockup.style.setProperty('overflow','hidden','important');roomMockup.style.setProperty('position','relative','important');roomMockup.style.setProperty('background-color','#1a202c','important');roomMockup.style.setProperty('display','flex','important');roomMockup.style.setProperty('align-items','center','important');roomMockup.style.setProperty('justify-content','center','important');console.log('✅ Standard clothing page: Set container to 600×700 with dark blue background');}// Check if it's an img or div element
if(!(roomMockup.tagName==='IMG')){_context35.n=28;break;}roomMockup.src=dataURL;console.log("✅ Set fabric mockup as img src");_context35.n=30;break;case 28:if(!isClothingMode){_context35.n=29;break;}// CLOTHING MODE: Append actual canvas element (no background-image!)
// This preserves native 4K resolution with viewport cropping
console.log("👗 Clothing mode: appending canvas element directly");// Save zoom controls if they exist (we'll re-append after canvas)
// Save zoom controls if they exist (we'll re-append after canvas)
existingZoomControls=roomMockup.querySelector('#clothingZoomControls');// ✅ CRITICAL: Only remove canvas, NOT zoom controls
// Remove existing canvas if it exists, but preserve zoom controls
existingCanvas=roomMockup.querySelector('canvas');if(existingCanvas){// ✅ CRITICAL: Verify this is the clothing mockup canvas, not pattern preview
// Pattern preview should only be in dom.preview, not roomMockup
if(existingCanvas.parentElement===roomMockup){existingCanvas.remove();console.log('✅ Removed existing clothing mockup canvas from roomMockup');}else{console.warn('⚠️ Found canvas in unexpected location, not removing');}}// Don't use innerHTML = '' as it removes zoom controls too!
// ✅ CRITICAL: Also clear any pattern preview canvases that might have been incorrectly appended
previewCanvases=roomMockup.querySelectorAll('canvas');previewCanvases.forEach(function(canvas){if(canvas.parentElement===roomMockup&&canvas!==existingCanvas){console.warn('⚠️ Removing unexpected canvas from roomMockup (might be pattern preview)');canvas.remove();}});// Append the actual canvas element (not as background!)
canvas.style.display='block';// ✅ CRITICAL: Calculate aspect-ratio-preserving display dimensions
// Canvas is 3840x2160 (16:9), container is 600x700
// We need to fit the canvas within the container while maintaining aspect ratio
containerWidth=600;containerHeight=700;canvasAspectRatio=canvasWidth/canvasHeight;// 3840/2160 = 1.78 (16:9)
containerAspectRatio=containerWidth/containerHeight;// 600/700 = 0.857
if(canvasAspectRatio>containerAspectRatio){// Canvas is wider - fit by width
displayWidth=containerWidth;displayHeight=containerWidth/canvasAspectRatio;}else{// Canvas is taller - fit by height
displayHeight=containerHeight;displayWidth=containerHeight*canvasAspectRatio;}console.log("\uD83D\uDCD0 Canvas native: ".concat(canvasWidth,"x").concat(canvasHeight," (aspect: ").concat(canvasAspectRatio.toFixed(2),")"));console.log("\uD83D\uDCD0 Container: ".concat(containerWidth,"x").concat(containerHeight," (aspect: ").concat(containerAspectRatio.toFixed(2),")"));console.log("\uD83D\uDCD0 Display size: ".concat(displayWidth.toFixed(0),"x").concat(displayHeight.toFixed(0)," (maintains aspect ratio)"));// ✅ Set CSS dimensions with !important to prevent overrides
// Use setProperty to ensure !important is applied
canvas.style.setProperty('width',"".concat(displayWidth,"px"),'important');canvas.style.setProperty('height',"".concat(displayHeight,"px"),'important');canvas.style.setProperty('display','block','important');canvas.style.setProperty('margin','auto','important');canvas.style.setProperty('max-width','none','important');canvas.style.setProperty('max-height','none','important');// ✅ Store display dimensions in dataset for reference
canvas.dataset.displayWidth=displayWidth.toFixed(0);canvas.dataset.displayHeight=displayHeight.toFixed(0);// ✅ CRITICAL: Mark this canvas as the clothing mockup canvas (not pattern preview)
canvas.dataset.isClothingMockup='true';canvas.dataset.mockupType='clothing';// ✅ CRITICAL: Verify roomMockup is the correct element (not preview)
if(roomMockup.id!=='roomMockup'&&roomMockup!==dom.roomMockup){console.error('❌ CRITICAL: roomMockup element mismatch! Expected #roomMockup, got:',roomMockup.id||'unknown');}console.log('✅ Appending clothing mockup canvas to roomMockup (id:',roomMockup.id,')');roomMockup.appendChild(canvas);console.log('✅ Clothing mockup canvas appended. Canvas has',canvas.width,'x',canvas.height,'pixels');// ✅ Restore saved zoom level if it exists
console.log("\uD83D\uDD0D Zoom persistence: RESTORE - Checking appState.savedZoomScale:",appState.savedZoomScale);// ✅ Fix: Check if savedZoomScale exists (including 1.0) and is a valid number
if(appState.savedZoomScale!=null&&appState.savedZoomScale!==undefined&&!isNaN(appState.savedZoomScale)){canvas.dataset.zoomScale=appState.savedZoomScale.toFixed(2);canvas.style.setProperty('transform',"scale(".concat(appState.savedZoomScale,")"),'important');canvas.style.setProperty('transform-origin','center','important');console.log("\uD83D\uDD0D Zoom persistence: \u2705 RESTORED zoom level to ".concat(appState.savedZoomScale*100,"%"));}else{// Initialize zoom scale to 70% for optimal clothing view
canvas.dataset.zoomScale=CLOTHING_ZOOM_DEFAULTS.defaultScale.toFixed(2);canvas.style.setProperty('transform',"scale(".concat(CLOTHING_ZOOM_DEFAULTS.defaultScale,")"),'important');canvas.style.setProperty('transform-origin','center','important');appState.savedZoomScale=CLOTHING_ZOOM_DEFAULTS.defaultScale;console.log("\uD83D\uDD0D Zoom persistence: Initialized clothing zoom to ".concat(CLOTHING_ZOOM_DEFAULTS.defaultScale*100,"% (default)"));}// ✅ Restore saved pan position if it exists
if(appState.savedPanX||appState.savedPanY){panX=appState.savedPanX||CLOTHING_ZOOM_DEFAULTS.defaultPanX;panY=appState.savedPanY||CLOTHING_ZOOM_DEFAULTS.defaultPanY;canvas.dataset.panX=panX.toString();canvas.dataset.panY=panY.toString();scale=appState.savedZoomScale||CLOTHING_ZOOM_DEFAULTS.defaultScale;canvas.style.setProperty('transform',"scale(".concat(scale,") translate(").concat(panX,"px, ").concat(panY,"px)"),'important');canvas.style.setProperty('transform-origin','center','important');console.log("\uD83D\uDD0D Pan persistence: \u2705 RESTORED clothing pan position to (".concat(panX,", ").concat(panY,")"));}else{// Initialize pan position to center (no offset)
canvas.dataset.panX=CLOTHING_ZOOM_DEFAULTS.defaultPanX.toString();canvas.dataset.panY=CLOTHING_ZOOM_DEFAULTS.defaultPanY.toString();_scale=appState.savedZoomScale||CLOTHING_ZOOM_DEFAULTS.defaultScale;canvas.style.setProperty('transform',"scale(".concat(_scale,")"),'important');canvas.style.setProperty('transform-origin','center','important');console.log("\uD83D\uDD0D Pan persistence: Initialized clothing pan to (".concat(CLOTHING_ZOOM_DEFAULTS.defaultPanX,", ").concat(CLOTHING_ZOOM_DEFAULTS.defaultPanY,") (default)"));}// ✅ Create zoom controls if they don't exist
if(!existingZoomControls){addClothingZoomControls(roomMockup);}else if(!roomMockup.contains(existingZoomControls)){// Re-append if they exist but were removed
roomMockup.appendChild(existingZoomControls);console.log("✅ Re-appended zoom controls after canvas");}else{console.log("✅ Zoom controls already in place");}console.log("\u2705 Canvas appended - Display: ".concat(displayWidth.toFixed(0),"x").concat(displayHeight.toFixed(0),", Native: ").concat(canvasWidth,"x").concat(canvasHeight,", Scale: ").concat(appState.savedZoomScale||CLOTHING_ZOOM_DEFAULTS.defaultScale));return _context35.a(2);case 29:// FABRIC MODE: Use background-image approach
// It's a div - preserve back button but clear other content
console.log("🔍 Div innerHTML before:",roomMockup.innerHTML.substring(0,100));// Save existing back button if it exists
existingButton=roomMockup.querySelector('#backToPatternsBtn');// Clear the div content
roomMockup.innerHTML='';// Clear the CSS background color to make background image visible
roomMockup.style.backgroundColor='transparent';// Set background image
roomMockup.style.backgroundImage="url(".concat(dataURL,")");roomMockup.style.backgroundSize='contain';roomMockup.style.backgroundRepeat='no-repeat';roomMockup.style.backgroundPosition='center';// Restore the back button if it existed
if(existingButton){roomMockup.appendChild(existingButton);console.log("✅ Restored back button after clearing div");}console.log("✅ Set fabric mockup as div background and cleared other content");case 30:_context35.n=32;break;case 31:console.error("❌ No roomMockup element found!");case 32:// Add back button for fabric mode ONLY (not for clothing mode)
if(!isClothingMode&&!document.getElementById('backToPatternsBtn')){addBackToPatternsButton();console.log('✅ Added back button for fabric mode');}else if(isClothingMode){console.log('👗 Skipping back button for clothing mode');}// Add fabric tuning controls
addFabricTuningControls();_context35.n=34;break;case 33:_context35.p=33;_t31=_context35.v;console.error("❌ Fabric mockup error:",_t31);case 34:return _context35.a(2);}},_callee25,null,[[22,24],[18,20],[9,33]]);}));return _renderFabricMockup.apply(this,arguments);}function addTryFabricButton(){var _appState$selectedCol56;console.log("🧵 addTryFabricButton called");console.log("🧵 selectedCollection:",(_appState$selectedCol56=appState.selectedCollection)===null||_appState$selectedCol56===void 0?void 0:_appState$selectedCol56.name);// Check if we're in a compatible collection for fabric
if(!appState.selectedCollection||appState.selectedCollection.name!=="botanicals"){console.log("🧵 Not botanicals collection, skipping fabric button");return;}console.log("🧵 Creating Try Fabric button");var existingButton=document.getElementById('tryFabricBtn');if(existingButton){existingButton.remove();}var button=document.createElement('button');button.id='tryFabricBtn';button.textContent='Try Fabric';button.className='btn btn-primary';button.style.cssText="\n        margin-top: 10px;\n        padding: 8px 16px;\n        background-color: #007bff;\n        color: white;\n        border: none;\n        border-radius: 4px;\n        cursor: pointer;\n    ";button.addEventListener('click',function(){console.log("🧵 ================================");console.log("🧵 TRY FABRIC BUTTON CLICKED");console.log("🧵 ================================");renderFabricMockup();});// Add button to the appropriate location
var tryFurnitureBtn=document.getElementById('tryFurnitureBtn');if(tryFurnitureBtn){tryFurnitureBtn.parentNode.insertBefore(button,tryFurnitureBtn.nextSibling);}else{var controlsContainer=document.querySelector('.controls-container')||document.body;controlsContainer.appendChild(button);}}// Add this line at the bottom of your CFM.js file to expose the function globally:
window.addTryFurnitureButton=addTryFurnitureButton;window.getCompatibleFurniture=getCompatibleFurniture;window.showFurnitureModal=showFurnitureModal;window.selectFurniture=selectFurniture;window.renderFabricMockup=renderFabricMockup;window.addTryFabricButton=addTryFabricButton;// Debug function to manually test fabric
window.testFabric=function(){console.log("🧵 Manual fabric test called");renderFabricMockup();};// Simple red canvas test
window.testRedCanvas=function(){console.log("🔴 Testing red canvas display");var canvas=document.createElement("canvas");var ctx=canvas.getContext("2d");canvas.width=600;canvas.height=450;ctx.fillStyle="red";ctx.fillRect(0,0,600,450);ctx.fillStyle="white";ctx.font="48px Arial";ctx.fillText("FABRIC TEST",150,250);var roomMockup=document.getElementById('roomMockup')||(dom===null||dom===void 0?void 0:dom.roomMockup);if(roomMockup){roomMockup.src=canvas.toDataURL();console.log("🔴 Red canvas set to roomMockup");}else{console.error("❌ No roomMockup element found");}};// Simple fabric function that just fits a 3840x2160 image into 600x450
window.simpleFabricTest=function(){console.log("🧵 SIMPLE FABRIC TEST");var canvas=document.createElement("canvas");var ctx=canvas.getContext("2d");canvas.width=600;canvas.height=450;// Fill with a color first
ctx.fillStyle="#F0F0E9";ctx.fillRect(0,0,600,450);var img=new Image();img.crossOrigin="anonymous";img.onload=function(){console.log("Image loaded: ".concat(img.width,"x").concat(img.height));// Calculate scale to fit 3840x2160 into 600x450
var scaleX=600/img.width;var scaleY=450/img.height;var scale=Math.min(scaleX,scaleY);console.log("Scale: ".concat(scale," (").concat(scaleX,", ").concat(scaleY,")"));var w=img.width*scale;var h=img.height*scale;var x=(600-w)/2;var y=(450-h)/2;console.log("Drawing at: ".concat(x,", ").concat(y,", ").concat(w,"x").concat(h));ctx.drawImage(img,x,y,w,h);// Update display
var roomMockup=document.getElementById('roomMockup');if(roomMockup){roomMockup.src=canvas.toDataURL();console.log("✅ Simple fabric test complete");}};img.src="https://so-animation.com/colorflex/data/fabric/fabric-base.png";};// Enhanced color parsing function for proof generation
function parseColorEnhanced(_x12){return _parseColorEnhanced.apply(this,arguments);}// ============================================================================
// PATTERN PROOF GENERATION - CRITICAL DUAL-LAYER SYSTEM
// ============================================================================
//
// ⚠️ IMPORTANT: Patterns use TWO separate image sets with different resolutions:
//
// 1. PREVIEW LAYERS (for fast UI responsiveness):
//    - Path: layers[].path
//    - Location: ./data/collections/{collection}/layers/*.jpg
//    - Resolution: ~1400x1400px (optimized for display)
//    - Used by: updatePreview() function for canvas preview
//
// 2. PROOF LAYERS (for high-quality downloads):
//    - Path: layers[].proofPath
//    - Location: ./data/collections/{collection}/proof-layers/*.jpg
//    - Resolution: ~3600x3600px (full resolution for printing)
//    - Used by: generatePatternProof() function (THIS FUNCTION)
//
// ⚠️ CRITICAL: This function MUST use layer.proofPath for all image loading
// If you use layer.path, proofs will be blurry/pixelated upscaled images!
//
// ⚠️ COLOR MATCHING: The colorArray parameter MUST contain the exact colors
// that were selected by the user. The proof should match what's shown in preview.
//
// ============================================================================
// Pattern proof generation functions for product pages
function _parseColorEnhanced(){_parseColorEnhanced=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee26(colorStr){var hex,rgbMatch,cleanColor,response,_colorsData,_i15,_Object$entries,_Object$entries$_i,key,value,_t32;return _regenerator().w(function(_context36){while(1)switch(_context36.p=_context36.n){case 0:if(colorStr){_context36.n=1;break;}return _context36.a(2,null);case 1:console.log('🔍 Parsing color:',"\"".concat(colorStr,"\""));// Handle hex colors
if(!colorStr.startsWith('#')){_context36.n=3;break;}hex=colorStr.substring(1);if(!(hex.length===3)){_context36.n=2;break;}return _context36.a(2,{r:parseInt(hex[0]+hex[0],16),g:parseInt(hex[1]+hex[1],16),b:parseInt(hex[2]+hex[2],16)});case 2:if(!(hex.length===6)){_context36.n=3;break;}return _context36.a(2,{r:parseInt(hex.substring(0,2),16),g:parseInt(hex.substring(2,4),16),b:parseInt(hex.substring(4,6),16)});case 3:// Handle rgb() format
rgbMatch=colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);if(!rgbMatch){_context36.n=4;break;}return _context36.a(2,{r:parseInt(rgbMatch[1]),g:parseInt(rgbMatch[2]),b:parseInt(rgbMatch[3])});case 4:// Handle named colors with SW/SC codes
cleanColor=colorStr.toLowerCase().trim();// Load colors if not already loaded
if(window.colorFlexColors){_context36.n=9;break;}console.log('🔄 Loading colors from colors.json...');_context36.p=5;_context36.n=6;return fetch('/assets/colors.json');case 6:response=_context36.v;_context36.n=7;return response.json();case 7:_colorsData=_context36.v;window.colorFlexColors={};_colorsData.forEach(function(color){var baseName=color.color_name.toLowerCase().trim();var rgb={r:color.red,g:color.green,b:color.blue};// Add multiple variations for flexible matching
window.colorFlexColors[baseName]=rgb;if(color.sw_number){window.colorFlexColors[color.sw_number.toLowerCase()+' '+baseName]=rgb;window.colorFlexColors[color.sw_number.toLowerCase()]=rgb;}});console.log('✅ Loaded',Object.keys(window.colorFlexColors).length,'color variations');_context36.n=9;break;case 8:_context36.p=8;_t32=_context36.v;console.error('❌ Failed to load colors.json:',_t32);return _context36.a(2,null);case 9:if(!window.colorFlexColors[cleanColor]){_context36.n=10;break;}return _context36.a(2,window.colorFlexColors[cleanColor]);case 10:_i15=0,_Object$entries=Object.entries(window.colorFlexColors);case 11:if(!(_i15<_Object$entries.length)){_context36.n=13;break;}_Object$entries$_i=_slicedToArray(_Object$entries[_i15],2),key=_Object$entries$_i[0],value=_Object$entries$_i[1];if(!(key.includes(cleanColor)||cleanColor.includes(key))){_context36.n=12;break;}console.log("\u2705 Found partial match: \"".concat(cleanColor,"\" matched \"").concat(key,"\""));return _context36.a(2,value);case 12:_i15++;_context36.n=11;break;case 13:console.warn("\u274C Could not parse color: \"".concat(colorStr,"\""));return _context36.a(2,null);}},_callee26,null,[[5,8]]);}));return _parseColorEnhanced.apply(this,arguments);}function generatePatternProof(_x13,_x14,_x15){return _generatePatternProof.apply(this,arguments);}function _generatePatternProof(){_generatePatternProof=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee27(patternName,collectionName,colorArray){var userScale,_targetPattern$layers,_targetPattern$layers2,collectionsData,targetCollection,targetPattern,canvas,_ctx5,baseImage,firstLayer,tempImg,patternBounds,_loop12,layerIndex,_args38=arguments,_t33;return _regenerator().w(function(_context38){while(1)switch(_context38.p=_context38.n){case 0:userScale=_args38.length>3&&_args38[3]!==undefined?_args38[3]:null;console.log('🔧 generatePatternProof called with:',patternName,collectionName,colorArray,'scale:',userScale);_context38.p=1;// Access collections from appState
collectionsData=appState.collections;if(collectionsData){_context38.n=2;break;}throw new Error('Collections data not loaded');case 2:targetCollection=collectionsData.find(function(c){return c.name===collectionName;});if(targetCollection){_context38.n=3;break;}throw new Error("Collection \"".concat(collectionName,"\" not found"));case 3:targetPattern=targetCollection.patterns.find(function(p){return p.name.toLowerCase().trim()===patternName.toLowerCase().trim();});if(targetPattern){_context38.n=4;break;}throw new Error("Pattern \"".concat(patternName,"\" not found in collection \"").concat(collectionName,"\""));case 4:console.log('🔧 Found pattern:',targetPattern.name,'with',((_targetPattern$layers=targetPattern.layers)===null||_targetPattern$layers===void 0?void 0:_targetPattern$layers.length)||0,'layers');// Create canvas and context - size will be determined by pattern dimensions
canvas=document.createElement('canvas');_ctx5=canvas.getContext('2d');// Handle patterns exactly like updatePreview does
if(!(targetPattern.tintWhite&&targetPattern.baseComposite)){_context38.n=6;break;}console.log("🎨 Rendering tint white pattern for proof");baseImage=new Image();baseImage.crossOrigin="Anonymous";baseImage.src=normalizePath(targetPattern.baseComposite);_context38.n=5;return new Promise(function(resolve,reject){baseImage.onload=function(){// Use NATURAL dimensions (actual file size, not display size)
var canvasWidth=baseImage.naturalWidth||baseImage.width;var canvasHeight=baseImage.naturalHeight||baseImage.height;canvas.width=canvasWidth;canvas.height=canvasHeight;console.log("\uD83D\uDD27 Proof canvas at FULL resolution: ".concat(canvas.width,"x").concat(canvas.height," (natural: ").concat(baseImage.naturalWidth,"x").concat(baseImage.naturalHeight,")"));// Use first color as background
var backgroundColor=lookupColor(colorArray[0]||"Snowbound");_ctx5.fillStyle=backgroundColor;_ctx5.fillRect(0,0,canvas.width,canvas.height);_ctx5.drawImage(baseImage,0,0,canvas.width,canvas.height);resolve();};baseImage.onerror=reject;});case 5:_context38.n=10;break;case 6:if(!((_targetPattern$layers2=targetPattern.layers)!==null&&_targetPattern$layers2!==void 0&&_targetPattern$layers2.length)){_context38.n=10;break;}console.log("🎨 Rendering layered pattern for proof");firstLayer=targetPattern.layers.find(function(l){return!l.isShadow;});if(!firstLayer){_context38.n=10;break;}tempImg=new Image();tempImg.crossOrigin="Anonymous";// ⚠️ CRITICAL: Use proofPath (high-res ~3600px) NOT path (preview ~1400px)
// proofPath: ./data/collections/{collection}/proof-layers/*.jpg
// path: ./data/collections/{collection}/layers/*.jpg
tempImg.src=normalizePath(firstLayer.proofPath||firstLayer.path);_context38.n=7;return new Promise(function(resolve){tempImg.onload=function(){// ⚠️ CRITICAL: Canvas size represents 24" wide proof, NOT the layer image size
// The proof layer image (e.g., 3600px) represents ONE pattern repeat (typically 24" × 24")
// The canvas should ALWAYS be the same size as one pattern repeat
// Scale affects TILE SIZE within the canvas, not the canvas dimensions
var effectiveScale=userScale?userScale/100:1.0;var patternRepeatWidth=tempImg.naturalWidth||tempImg.width;var patternRepeatHeight=tempImg.naturalHeight||tempImg.height;// Canvas size = one pattern repeat size (always represents 24" × 24")
canvas.width=patternRepeatWidth;canvas.height=patternRepeatHeight;console.log("\uD83D\uDD27 Proof canvas: ".concat(canvas.width,"x").concat(canvas.height,"px (represents 24\"x24\" at ").concat(Math.round(canvas.width/24)," DPI)"));console.log("\uD83D\uDD27 Scale multiplier: ".concat(effectiveScale,"x (").concat(effectiveScale===1?'1 tile':Math.pow(effectiveScale,2).toFixed(1)+' tiles'," on canvas)"));// Set background color (use first color as background)
var backgroundColor=lookupColor(colorArray[0]||"Snowbound");_ctx5.fillStyle=backgroundColor;_ctx5.fillRect(0,0,canvas.width,canvas.height);// Pattern tiles at scaled size within fixed canvas
resolve({offsetX:0,offsetY:0,patternDisplayWidth:canvas.width,patternDisplayHeight:canvas.height,scaleMultiplier:effectiveScale});};tempImg.onerror=function(){return resolve(null);};});case 7:patternBounds=_context38.v;if(!patternBounds){_context38.n=10;break;}_loop12=/*#__PURE__*/_regenerator().m(function _loop12(layerIndex){var layer,isShadow,layerColor;return _regenerator().w(function(_context37){while(1)switch(_context37.n){case 0:layer=targetPattern.layers[layerIndex];isShadow=layer.isShadow===true;// Use colors from colorArray in order (skip first color since it's background)
layerColor=!isShadow?lookupColor(colorArray[layerIndex+1]||colorArray[layerIndex]||"Snowbound"):null;console.log("\uD83D\uDD27 Proof layer ".concat(layerIndex," with color:"),layerColor,'using',layer.proofPath?'PROOF PATH (high-res)':'preview path (fallback)');_context37.n=1;return new Promise(function(resolve){// Simplified proof generation - just composite the layers at full size
// ⚠️ CRITICAL: Use proofPath (high-res ~3600px) NOT path (preview ~1400px)
// This is the SECOND critical place where we load layer images for proofs
var layerImagePath=layer.proofPath||layer.path;processImage(layerImagePath,function(processedCanvas){if(!(processedCanvas instanceof HTMLCanvasElement)){return resolve();}// Apply scaling to show correct pattern size
_ctx5.globalCompositeOperation=isShadow?"multiply":"source-over";_ctx5.globalAlpha=isShadow?0.3:1.0;// Calculate scaled tile size based on user's scale setting
// userScale: 100 = 1x (normal), 200 = 2x (pattern appears smaller/more tiles), 50 = 0.5x (pattern appears larger/fewer tiles)
// INVERT the scale: 2x scale means pattern is HALF size (divide by 2)
var effectiveScale=patternBounds.scaleMultiplier||1.0;var scaledWidth=processedCanvas.width/effectiveScale;var scaledHeight=processedCanvas.height/effectiveScale;// Check for half-drop tiling
var tilingType=targetPattern.tilingType||"";var isHalfDrop=tilingType==="half-drop";console.log("\uD83D\uDD27 Proof tiling: ".concat(isHalfDrop?'HALF-DROP':'NORMAL'," (tilingType: \"").concat(tilingType,"\")"));// Tile the pattern across the canvas at the scaled size
var colIndex=0;for(var x=0;x<canvas.width;x+=scaledWidth,colIndex++){// Apply half-drop offset for odd columns
var yOffset=isHalfDrop&&colIndex%2===1?scaledHeight/2:0;// Start from -scaledHeight to cover edges, then add yOffset for half-drop
for(var y=-scaledHeight+yOffset;y<canvas.height+scaledHeight;y+=scaledHeight){_ctx5.drawImage(processedCanvas,x,y,scaledWidth,scaledHeight);}}_ctx5.globalAlpha=1.0;// Reset alpha
console.log("\u2705 Rendered proof layer ".concat(layerIndex," with color ").concat(layerColor," at scale ").concat(effectiveScale,"x (").concat(scaledWidth,"x").concat(scaledHeight,")"));resolve();},layerColor,2.2,isShadow,false,false);});case 1:return _context37.a(2);}},_loop12);});layerIndex=0;case 8:if(!(layerIndex<targetPattern.layers.length)){_context38.n=10;break;}return _context38.d(_regeneratorValues(_loop12(layerIndex)),9);case 9:layerIndex++;_context38.n=8;break;case 10:console.log('✅ Pattern proof generation complete');return _context38.a(2,canvas);case 11:_context38.p=11;_t33=_context38.v;console.error('❌ Error in generatePatternProof:',_t33);throw _t33;case 12:return _context38.a(2);}},_callee27,null,[[1,11]]);}));return _generatePatternProof.apply(this,arguments);}function downloadPatternProof(canvas,filename){console.log('📥 Downloading pattern proof:',filename);// Calculate DPI to ensure 24 inches wide at actual pixel dimensions
var targetWidthInches=24;var calculatedDPI=Math.round(canvas.width/targetWidthInches);console.log("\uD83D\uDCD0 Setting DPI metadata: ".concat(canvas.width,"px \xF7 ").concat(targetWidthInches,"\" = ").concat(calculatedDPI," DPI"));// Convert canvas to data URL
var dataURL=canvas.toDataURL('image/jpeg',0.95);// Insert DPI metadata into JPEG
var base64Data=dataURL.split(',')[1];var binaryData=atob(base64Data);var bytes=new Uint8Array(binaryData.length);for(var i=0;i<binaryData.length;i++){bytes[i]=binaryData.charCodeAt(i);}// Find JFIF header (FF E0) and modify DPI values
// JFIF structure: FF E0 [length] "JFIF" 0 [version] [units] [Xdensity] [Ydensity]
var modified=false;for(var _i10=0;_i10<bytes.length-20;_i10++){if(bytes[_i10]===0xFF&&bytes[_i10+1]===0xE0){// Check if this is JFIF marker
if(bytes[_i10+4]===0x4A&&bytes[_i10+5]===0x46&&bytes[_i10+6]===0x49&&bytes[_i10+7]===0x46){// Found JFIF header
// Set density unit to 1 (dots per inch)
bytes[_i10+11]=0x01;// Set X density (DPI) - 2 bytes, big-endian
bytes[_i10+12]=calculatedDPI>>8&0xFF;bytes[_i10+13]=calculatedDPI&0xFF;// Set Y density (DPI) - 2 bytes, big-endian
bytes[_i10+14]=calculatedDPI>>8&0xFF;bytes[_i10+15]=calculatedDPI&0xFF;console.log("\u2705 DPI metadata set to ".concat(calculatedDPI," DPI (ensures 24\" width in image editors)"));modified=true;break;}}}if(!modified){console.warn('⚠️ Could not find JFIF header to set DPI metadata');}// Create blob from modified bytes
var blob=new Blob([bytes],{type:'image/jpeg'});// Download the file
var url=URL.createObjectURL(blob);var link=document.createElement('a');link.href=url;link.download=filename;document.body.appendChild(link);link.click();document.body.removeChild(link);URL.revokeObjectURL(url);console.log('✅ Proof downloaded:',filename);}// Expose proof generation functions globally
window.generatePatternProof=generatePatternProof;window.downloadPatternProof=downloadPatternProof;/**
 * Generate pattern proof with customer info strip
 */function generatePatternProofWithInfo(_x16,_x17,_x18,_x19,_x20,_x21){return _generatePatternProofWithInfo.apply(this,arguments);}// Export to window
function _generatePatternProofWithInfo(){_generatePatternProofWithInfo=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee28(patternName,collectionName,colorArray,customerName,dimensions,tiling){var _appState$collections1,_targetCollection$pat2,_targetPattern$layers3,proofCanvas,baseFontSize,smallFontSize,topMargin,bottomMargin,customerLineHeight,textLineHeight,colorLineHeight,scaleLineCount,baseHeight,infoStripHeight,finalCanvas,finalCtx,leftMargin,yPosition,scaleDisplay,targetCollection,targetPattern,layerLabels,rightMargin,tilingType,_t34;return _regenerator().w(function(_context39){while(1)switch(_context39.p=_context39.n){case 0:console.log('🔧 generatePatternProofWithInfo called:',{patternName:patternName,collectionName:collectionName,colorArray:colorArray,customerName:customerName,dimensions:dimensions,tiling:tiling});_context39.p=1;_context39.n=2;return generatePatternProof(patternName,collectionName,colorArray,appState.currentScale);case 2:proofCanvas=_context39.v;// Create a new canvas with extra height for info strip
// Calculate required height based on actual content:
// - Top margin: 30px
// - Customer name: ~40px (font + spacing)
// - Pattern name: ~30px
// - Collection name: ~30px
// - "Colors:" header: ~30px
// - Each color line: ~28px (font + 4px spacing)
// - Bottom margin: ~20px
baseFontSize=Math.max(24,proofCanvas.width/80);smallFontSize=Math.max(18,proofCanvas.width/100);topMargin=50;// Increased from 30 for more breathing room
bottomMargin=30;// Also increased for visual balance
customerLineHeight=baseFontSize+8;textLineHeight=smallFontSize+6;colorLineHeight=smallFontSize+4;// Base height for header info (customer, pattern, collection, "Colors:")
// Add one extra line for scale if not 100%
scaleLineCount=appState.currentScale&&appState.currentScale!==100?1:0;baseHeight=topMargin+customerLineHeight+textLineHeight*(3+scaleLineCount)+bottomMargin;// Add height for each color line
infoStripHeight=baseHeight+colorArray.length*colorLineHeight;finalCanvas=document.createElement('canvas');finalCtx=finalCanvas.getContext('2d');finalCanvas.width=proofCanvas.width;finalCanvas.height=proofCanvas.height+infoStripHeight;// Draw the pattern proof
finalCtx.drawImage(proofCanvas,0,0);// Draw info strip background
finalCtx.fillStyle='#ffffff';finalCtx.fillRect(0,proofCanvas.height,finalCanvas.width,infoStripHeight);// Add border line
finalCtx.strokeStyle='#d4af37';finalCtx.lineWidth=2;finalCtx.beginPath();finalCtx.moveTo(0,proofCanvas.height);finalCtx.lineTo(finalCanvas.width,proofCanvas.height);finalCtx.stroke();// Font sizes already calculated above for height calculation
// const baseFontSize = Math.max(24, finalCanvas.width / 80);
// const smallFontSize = Math.max(18, finalCanvas.width / 100);
// Add text info
finalCtx.fillStyle='#1a202c';finalCtx.font="bold ".concat(baseFontSize,"px Arial");finalCtx.textAlign='left';leftMargin=30;yPosition=proofCanvas.height+topMargin;// Use the topMargin we calculated
// Customer name
finalCtx.fillText("Customer: ".concat(customerName),leftMargin,yPosition);yPosition+=baseFontSize+8;// Pattern info
finalCtx.font="".concat(smallFontSize,"px Arial");finalCtx.fillText("Pattern: ".concat(patternName),leftMargin,yPosition);yPosition+=smallFontSize+6;finalCtx.fillText("Collection: ".concat(collectionName),leftMargin,yPosition);yPosition+=smallFontSize+6;// Scale information (if not 100%)
if(appState.currentScale&&appState.currentScale!==100){scaleDisplay=appState.currentScale===50?'0.5X':appState.currentScale===200?'2X':appState.currentScale===300?'3X':appState.currentScale===400?'4X':"".concat(appState.currentScale,"%");finalCtx.fillText("Scale: ".concat(scaleDisplay),leftMargin,yPosition);yPosition+=smallFontSize+6;}// Get pattern data for labels and tiling info (needed by multiple sections below)
console.log('🔍 Looking up pattern:',{collectionName:collectionName,patternName:patternName});targetCollection=(_appState$collections1=appState.collections)===null||_appState$collections1===void 0?void 0:_appState$collections1.find(function(c){return c.name===collectionName;});console.log('🔍 Found collection:',targetCollection?targetCollection.name:'NOT FOUND');targetPattern=targetCollection===null||targetCollection===void 0||(_targetCollection$pat2=targetCollection.patterns)===null||_targetCollection$pat2===void 0?void 0:_targetCollection$pat2.find(function(p){return p.name.toLowerCase().trim()===patternName.toLowerCase().trim();});console.log('🔍 Found pattern:',targetPattern?targetPattern.name:'NOT FOUND','layers:',targetPattern===null||targetPattern===void 0||(_targetPattern$layers3=targetPattern.layers)===null||_targetPattern$layers3===void 0?void 0:_targetPattern$layers3.length);// Color information - detailed breakdown with layer labels
if(colorArray&&colorArray.length>0){finalCtx.fillText("Colors:",leftMargin,yPosition);yPosition+=smallFontSize+6;// Build layer labels array matching the pattern structure
layerLabels=[];if(targetPattern){// Add background label
layerLabels.push({label:'Background',color:colorArray[0]||'N/A'});// Add layer labels from pattern definition
if(targetPattern.layers&&targetPattern.layers.length>0){targetPattern.layers.forEach(function(layer,index){if(!layer.isShadow){var _targetPattern$layerL;var label=((_targetPattern$layerL=targetPattern.layerLabels)===null||_targetPattern$layerL===void 0?void 0:_targetPattern$layerL[index])||"Layer ".concat(index+1);var color=colorArray[layerLabels.length]||'N/A';layerLabels.push({label:label,color:color});}});}}else{// Fallback if pattern not found - use generic labels
colorArray.forEach(function(color,index){var label=index===0?'Background':"Layer ".concat(index);layerLabels.push({label:label,color:color});});}// Display each color with its layer label
console.log('🎨 Displaying layer labels on proof:',layerLabels);console.log('🎨 Starting yPosition:',yPosition,'smallFontSize:',smallFontSize);console.log('🎨 Canvas height:',finalCanvas.height,'Info strip height:',infoStripHeight);layerLabels.forEach(function(_ref27){var label=_ref27.label,color=_ref27.color;console.log("  Drawing: \"".concat(label,": ").concat(color,"\" at y=").concat(yPosition));finalCtx.fillText("  ".concat(label,": ").concat(color),leftMargin+20,yPosition);yPosition+=smallFontSize+4;});}// Right side info - show dimensions and tiling type
if(dimensions){finalCtx.textAlign='right';rightMargin=finalCanvas.width-30;yPosition=proofCanvas.height+topMargin;finalCtx.font="".concat(smallFontSize,"px Arial");finalCtx.fillText("Dimensions: ".concat(dimensions),rightMargin,yPosition);yPosition+=smallFontSize+6;// Add tiling type if half-drop
tilingType=(targetPattern===null||targetPattern===void 0?void 0:targetPattern.tilingType)||'';if(tilingType==='half-drop'){finalCtx.fillText("Tiling: Half-Drop",rightMargin,yPosition);yPosition+=smallFontSize+6;}}console.log('✅ Pattern proof with info generated');return _context39.a(2,finalCanvas);case 3:_context39.p=3;_t34=_context39.v;console.error('❌ Error in generatePatternProofWithInfo:',_t34);throw _t34;case 4:return _context39.a(2);}},_callee28,null,[[1,3]]);}));return _generatePatternProofWithInfo.apply(this,arguments);}window.generatePatternProofWithInfo=generatePatternProofWithInfo;/**
 * Download current pattern proof (standard - no customer info)
 * Called from ColorFlex page "Download Standard Proof" button
 */function downloadCurrentPatternProof(){try{console.log('🔧 Standard download proof requested from ColorFlex app');if(!appState.currentPattern){alert('Please select a pattern first');return;}if(!appState.selectedCollection){alert('Collection not loaded');return;}// Get current colors from layer inputs (need color NAMES, not just values)
var colorArray=[];// Build color array from layerInputs which have the actual color names
appState.layerInputs.forEach(function(layerInput,index){if(layerInput&&layerInput.input&&layerInput.input.value){colorArray.push(layerInput.input.value);}});if(colorArray.length===0){alert('No colors selected');return;}console.log('🎨 Generating standard proof for:',appState.currentPattern.name,'with colors:',colorArray,'scale:',appState.currentScale);// Use the same proof generation as product pages
// Pass scale to show correct tiling/repetition on 24" wide proof
generatePatternProof(appState.currentPattern.name,appState.selectedCollection.name,colorArray,appState.currentScale// Scale affects tiling, not canvas size
).then(function(canvas){console.log('✅ Pattern proof generation complete, downloading...');var filename="".concat(appState.currentPattern.name,"_").concat(appState.selectedCollection.name,"_proof.jpg");downloadPatternProof(canvas,filename);})["catch"](function(error){console.error('❌ Error generating proof:',error);alert('Error generating proof. Check console for details.');});}catch(error){console.error('❌ Error in downloadCurrentPatternProof:',error);alert('Error downloading proof. Please try again.');}}/**
 * Download current pattern proof with customer info
 * Called from ColorFlex page "Download Proof with Customer Info" button
 */function downloadCurrentPatternProofWithInfo(){try{console.log('🔧 Info strip download proof requested from ColorFlex app');if(!appState.currentPattern){alert('Please select a pattern first');return;}if(!appState.selectedCollection){alert('Collection not loaded');return;}// Get current colors from layer inputs (need color NAMES, not just values)
var colorArray=[];// Build color array from layerInputs which have the actual color names
appState.layerInputs.forEach(function(layerInput,index){if(layerInput&&layerInput.input&&layerInput.input.value){colorArray.push(layerInput.input.value);}});if(colorArray.length===0){alert('No colors selected');return;}console.log('🎨 Generating proof with info for:',appState.currentPattern.name,'with colors:',colorArray);// Get customer info
var customerName=window.ShopifyCustomer?"".concat(window.ShopifyCustomer.first_name," ").concat(window.ShopifyCustomer.last_name):'Guest Customer';// Get pattern dimensions and tiling from collections.json if available
var dimensions='';var tiling='';// Check for size array [width, height] (standard format in collections.json)
if(appState.currentPattern.size&&Array.isArray(appState.currentPattern.size)&&appState.currentPattern.size.length>=2){dimensions="".concat(appState.currentPattern.size[0],"\" \xD7 ").concat(appState.currentPattern.size[1],"\"");}else if(appState.currentPattern.width&&appState.currentPattern.height){dimensions="".concat(appState.currentPattern.width,"\" \xD7 ").concat(appState.currentPattern.height,"\"");}else if(appState.currentPattern.dimensions){dimensions=appState.currentPattern.dimensions;}if(appState.currentPattern.tiling){tiling=appState.currentPattern.tiling;}else if(appState.currentPattern.repeat){tiling=appState.currentPattern.repeat;}// Use the enhanced proof generation function
generatePatternProofWithInfo(appState.currentPattern.name,appState.selectedCollection.name,colorArray,customerName,dimensions,tiling).then(function(canvas){console.log('✅ Pattern proof with info generation complete, downloading...');var filename="".concat(appState.currentPattern.name,"_").concat(appState.selectedCollection.name,"_with_info.jpg");downloadPatternProof(canvas,filename);})["catch"](function(error){console.error('❌ Error generating proof with info:',error);alert('Error generating proof with info. Check console for details.');});}catch(error){console.error('❌ Error in downloadCurrentPatternProofWithInfo:',error);alert('Error downloading proof with info. Please try again.');}}// Export proof download functions to window so Liquid template can call them
window.downloadCurrentPatternProof=downloadCurrentPatternProof;window.downloadCurrentPatternProofWithInfo=downloadCurrentPatternProofWithInfo;/**
 * Helper functions for cart item updates
 */// Fabric pricing utility functions
function getFabricSpecByMaterialId(materialId){// Convert material ID to fabric spec key
if(materialId==='wallpaper'){return FABRIC_SPECIFICATIONS['WALLPAPER'];}var fabricMap={'fabric-soft-velvet':'SOFT VELVET','fabric-decorator-linen':'DECORATOR LINEN','fabric-drapery-sheer':'DRAPERY SHEER','fabric-lightweight-linen':'LIGHTWEIGHT LINEN','fabric-faux-suede':'FAUX SUEDE','fabric-drapery-light-block':'DRAPERY LIGHT BLOCK'};var fabricKey=fabricMap[materialId];return fabricKey?FABRIC_SPECIFICATIONS[fabricKey]:null;}function calculateMaterialPrice(materialId,quantity){var spec=getFabricSpecByMaterialId(materialId);if(!spec){return{error:'Unknown material type',total:0};}if(spec.material==='fabric'){var actualYards=Math.max(quantity,spec.minimumYards);return{materialType:'fabric',unit:'yards',requestedQuantity:quantity,actualQuantity:actualYards,pricePerUnit:spec.pricePerYard,minimumMet:quantity>=spec.minimumYards,total:actualYards*spec.pricePerYard,width:spec.width,description:spec.description};}else{// Wallpaper
var actualRolls=Math.max(quantity,spec.minimumRolls);return{materialType:'wallpaper',unit:'rolls',requestedQuantity:quantity,actualQuantity:actualRolls,pricePerUnit:spec.pricePerRoll,minimumMet:quantity>=spec.minimumRolls,total:actualRolls*spec.pricePerRoll,coverage:spec.coverage,description:spec.description};}}// Get display name for material types
function getMaterialDisplayName(materialId){var spec=getFabricSpecByMaterialId(materialId);if(spec){return materialId.includes('fabric-')?materialId.replace('fabric-','').replace(/-/g,' ').replace(/\b\w/g,function(l){return l.toUpperCase();})+' Fabric':'Wallpaper';}// Legacy fallback
var materials={'wallpaper-peel-stick':'Peel & Stick Wallpaper','wallpaper-traditional':'Traditional Wallpaper','wallpaper-textured':'Textured Wallpaper','fabric-cotton':'Cotton Fabric','fabric-linen':'Linen Fabric'};return materials[materialId]||materialId;}// Get pricing for material types
function getMaterialPrice(materialId){var spec=getFabricSpecByMaterialId(materialId);if(spec){return spec.material==='fabric'?"$".concat(spec.pricePerYard.toFixed(2),"/yard"):"$".concat(spec.pricePerRoll.toFixed(2),"/roll");}// Legacy fallback
var prices={'wallpaper-peel-stick':'$89.99','wallpaper-traditional':'$79.99','wallpaper-textured':'$99.99','fabric-cotton':'$69.99','fabric-linen':'$79.99'};return prices[materialId]||'$89.99';}// Update cart item via Shopify API
function updateCartItemViaAPI(_x22){return _updateCartItemViaAPI.apply(this,arguments);}// ============================================================================
// SECTION 12: UTILITIES & GLOBAL EXPORTS
// ============================================================================
// Notification functions, shareable URLs, and window.* global exports
// for external access from unified-pattern-modal.js and theme.liquid.
// ============================================================================
// Show success notification
function _updateCartItemViaAPI(){_updateCartItemViaAPI=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee29(itemData){var getScaleDisplayText,cartResponse,cartData,itemToUpdate,updatePayload,updateResponse,result,_t35;return _regenerator().w(function(_context40){while(1)switch(_context40.p=_context40.n){case 0:_context40.p=0;// Get scale display text
getScaleDisplayText=function getScaleDisplayText(currentScale){if(currentScale===50)return'0.5X';if(currentScale===100)return'1X';if(currentScale===200)return'2X';if(currentScale===300)return'3X';if(currentScale===400)return'4X';return'Normal';};// Build update payload
console.log('🛒 Attempting cart update via API:',itemData);// Get current cart to find the item to update
_context40.n=1;return fetch('/cart.js');case 1:cartResponse=_context40.v;if(cartResponse.ok){_context40.n=2;break;}throw new Error('Failed to fetch current cart');case 2:_context40.n=3;return cartResponse.json();case 3:cartData=_context40.v;console.log('📦 Current cart data:',cartData);// Find the ColorFlex item to update (by properties)
itemToUpdate=cartData.items.find(function(item){return item.properties&&(item.properties['Custom Pattern']===itemData.pattern||item.properties['ColorFlex Source']||item.title.toLowerCase().includes('custom wallpaper'));});if(itemToUpdate){_context40.n=4;break;}throw new Error('Could not find ColorFlex item in cart to update');case 4:console.log('🎯 Found item to update:',itemToUpdate);updatePayload={id:itemToUpdate.key,quantity:itemToUpdate.quantity,properties:{'Custom Pattern':itemData.pattern,'Pattern Collection':toTitleCase(itemData.collectionName),'Custom Colors':itemData.colors.map(function(c){return normalizeColorToSwFormat(c.color||c.name);}).join(', '),'ColorFlex Source':'Cart Update - ColorFlex Page','Product Type':itemData.productTypeName,'Pattern Scale':getScaleDisplayText(itemData.currentScale),'Thumbnail Key':"cart_thumbnail_".concat(itemData.pattern,"_").concat(itemData.collectionName)}};// Update the cart item
_context40.n=5;return fetch('/cart/change.js',{method:'POST',headers:{'Content-Type':'application/json','X-Requested-With':'XMLHttpRequest'},body:JSON.stringify(updatePayload)});case 5:updateResponse=_context40.v;if(updateResponse.ok){_context40.n=6;break;}throw new Error("Cart update failed: ".concat(updateResponse.status));case 6:_context40.n=7;return updateResponse.json();case 7:result=_context40.v;console.log('✅ Cart update successful:',result);return _context40.a(2,{success:true,result:result});case 8:_context40.p=8;_t35=_context40.v;console.error('❌ Cart update failed:',_t35);return _context40.a(2,{success:false,error:_t35.message});}},_callee29,null,[[0,8]]);}));return _updateCartItemViaAPI.apply(this,arguments);}function showSuccessNotification(message){showNotification(message,'success');}// Show error notification
function showErrorNotification(message){showNotification(message,'error');}// Generic notification function
function showNotification(message){var type=arguments.length>1&&arguments[1]!==undefined?arguments[1]:'info';var notification=document.createElement('div');var bgColor=type==='success'?'#22543d':type==='error'?'#742a2a':'#2d3748';var textColor=type==='success'?'#68d391':type==='error'?'#feb2b2':'#e2e8f0';var icon=type==='success'?'✅':type==='error'?'❌':'ℹ️';notification.style.cssText="\n        position: fixed;\n        top: 20px;\n        right: 20px;\n        background: ".concat(bgColor,";\n        color: ").concat(textColor,";\n        padding: 15px 20px;\n        border-radius: 8px;\n        border: 2px solid ").concat(textColor,";\n        font-family: 'Special Elite', monospace;\n        font-weight: bold;\n        z-index: 10002;\n        max-width: 400px;\n        word-wrap: break-word;\n        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);\n    ");notification.innerHTML="\n        <div style=\"display: flex; align-items: center; gap: 10px;\">\n            <span style=\"font-size: 18px;\">".concat(icon,"</span>\n            <span>").concat(message,"</span>\n            <button onclick=\"this.parentElement.parentElement.remove()\" style=\"\n                background: transparent;\n                border: none;\n                color: ").concat(textColor,";\n                font-size: 18px;\n                cursor: pointer;\n                margin-left: auto;\n            \">\xD7</button>\n        </div>\n    ");document.body.appendChild(notification);// Auto-remove after 5 seconds for non-success messages
if(type!=='success'){setTimeout(function(){if(notification.parentElement){notification.remove();}},5000);}}// Generate shareable URL from pattern data
function generateShareableUrl(pattern){var baseUrl=window.location.origin+'/pages/colorflex';var params=new URLSearchParams({collection:pattern.collectionName,pattern:pattern.patternName,colors:pattern.colors.map(function(c){return c.swColor||c.color;}).join(','),scale:pattern.currentScale||100,source:'shared_link'});var shareUrl="".concat(baseUrl,"?").concat(params.toString());console.log('🔗 Generated shareable URL:',shareUrl);return shareUrl;}// Copy shareable URL to clipboard
function copyShareableUrl(pattern){var url=generateShareableUrl(pattern);navigator.clipboard.writeText(url).then(function(){console.log('✅ URL copied to clipboard');showSaveNotification('🔗 Share link copied to clipboard!');})["catch"](function(err){console.error('❌ Failed to copy URL:',err);showSaveNotification('❌ Failed to copy link');});}/**
 * Set clothing scale and re-render mockup
 * @param {string} scale - Scale value ("1.0", "1.2", "1.5", "2.0")
 */function setClothingScale(scale){console.log("\uD83D\uDC57 Setting clothing scale to ".concat(scale,"X"));// ✅ Save current zoom level BEFORE re-rendering
var existingCanvas=document.querySelector('#roomMockup canvas');if(existingCanvas&&existingCanvas.dataset.zoomScale){appState.savedZoomScale=parseFloat(existingCanvas.dataset.zoomScale);console.log("  \uD83D\uDD0D Zoom persistence: Saved zoom level before scale change: ".concat(appState.savedZoomScale*100,"%"));}// Update appState
appState.selectedClothingScale=scale;// Update button UI - highlight selected, unhighlight others
var scaleButtons=document.querySelectorAll('[data-clothing-scale]');scaleButtons.forEach(function(btn){var btnScale=btn.getAttribute('data-clothing-scale');if(btnScale===scale){// Highlight selected button
btn.style.background='#4a90e2';btn.style.color='white';console.log("  \u2705 Highlighted ".concat(btnScale,"X button"));}else{// Unhighlight others
btn.style.background='#e2e8f0';btn.style.color='#000';}});// Re-render the clothing mockup with new scale
if(typeof renderFabricMockup==='function'){console.log("  \uD83D\uDD04 Re-rendering fabric mockup at ".concat(scale,"X"));renderFabricMockup();}else{console.warn('⚠️ renderFabricMockup not available');}}/**
 * Set clothing garment and re-render mockup
 * @param {string} garmentName - Garment name ("dress", "pantsuit")
 */function setGarment(garmentName){console.log("\uD83D\uDC54 Setting garment to ".concat(garmentName));// ✅ Save current zoom level BEFORE re-rendering
var existingCanvas=document.querySelector('#roomMockup canvas');if(existingCanvas&&existingCanvas.dataset.zoomScale){appState.savedZoomScale=parseFloat(existingCanvas.dataset.zoomScale);console.log("  \uD83D\uDD0D Zoom persistence: Saved zoom level before garment change: ".concat(appState.savedZoomScale*100,"%"));}// Update appState
appState.selectedGarment=garmentName;// Update button UI - highlight selected, unhighlight others
var garmentButtons=document.querySelectorAll('[data-garment]');garmentButtons.forEach(function(btn){var btnGarment=btn.getAttribute('data-garment');if(btnGarment===garmentName){// Highlight selected button (blue gradient)
btn.style.background='linear-gradient(135deg, #4a90e2 0%, #357abd 100%)';btn.style.color='white';btn.style.boxShadow='0 2px 6px rgba(74, 144, 226, 0.4)';console.log("  \u2705 Highlighted ".concat(btnGarment," button"));}else{// Unhighlight others (gray)
btn.style.background='linear-gradient(135deg, #64748b 0%, #475569 100%)';btn.style.color='white';btn.style.boxShadow='0 2px 4px rgba(0, 0, 0, 0.2)';}});// Re-render the clothing mockup with new garment
if(typeof renderFabricMockup==='function'){console.log("  \uD83D\uDD04 Re-rendering fabric mockup with ".concat(garmentName));renderFabricMockup();}else{console.warn('⚠️ renderFabricMockup not available');}}// Expose clothing scale function globally
window.setClothingScale=setClothingScale;// Expose garment selection function globally
window.setGarment=setGarment;/**
 * Set furniture scale and re-render mockup
 * @param {string} scale - Scale value ("1.0", "1.25", "1.5", "2.0")
 */function setFurnitureScale(_x23){return _setFurnitureScale.apply(this,arguments);}/**
 * Set furniture type and re-render mockup
 * @param {string} furnitureType - Furniture type ("Sofa-Capitol", "Sofa-Kite")
 */function _setFurnitureScale(){_setFurnitureScale=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee30(scale){var normalizedScale,scaleDisplay,scaleButtons;return _regenerator().w(function(_context41){while(1)switch(_context41.n){case 0:console.log("\uD83E\uDE91 Setting furniture scale to ".concat(scale,"X"));// ✅ NORMALIZE SCALE: Remove "X" suffix if present to match JSON key format
normalizedScale=scale;if(typeof normalizedScale==='string'){normalizedScale=normalizedScale.replace(/X$/i,'');}else if(typeof normalizedScale==='number'){normalizedScale=normalizedScale.toString();}// Update appState with normalized scale
appState.selectedFurnitureScale=normalizedScale;// Update scale display if it exists
scaleDisplay=document.getElementById('furnitureScaleDisplay');if(scaleDisplay){scaleDisplay.textContent="".concat(scale,"X");}// Update button UI - highlight selected, unhighlight others
scaleButtons=document.querySelectorAll('[data-furniture-scale]');scaleButtons.forEach(function(btn){var btnScale=btn.getAttribute('data-furniture-scale');if(btnScale===scale){// Highlight selected button (brown theme)
btn.style.background='#8b4513';btn.style.color='white';console.log("  \u2705 Highlighted ".concat(btnScale,"X button"));}else{// Unhighlight others
btn.style.background='#e2e8f0';btn.style.color='#2d3748';}});// ✅ FURNITURE MODE: Re-render using updateFurniturePreview() (NOT renderFabricMockup)
if(!(typeof updateFurniturePreview==='function')){_context41.n=2;break;}console.log("  \uD83D\uDD04 Re-rendering furniture preview at ".concat(scale,"X"));_context41.n=1;return updateFurniturePreview();case 1:_context41.n=3;break;case 2:console.warn('⚠️ updateFurniturePreview not available');case 3:return _context41.a(2);}},_callee30);}));return _setFurnitureScale.apply(this,arguments);}function setFurnitureType(_x24,_x25){return _setFurnitureType.apply(this,arguments);}// Expose furniture functions globally with event handling
function _setFurnitureType(){_setFurnitureType=_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee31(furnitureType,event){var furnitureButtons;return _regenerator().w(function(_context42){while(1)switch(_context42.n){case 0:// Prevent event propagation if event is provided
if(event){event.preventDefault();event.stopPropagation();}console.log("\uD83D\uDECB\uFE0F Setting furniture type to ".concat(furnitureType));// Update appState
appState.selectedFurnitureType=furnitureType;// Update button UI - highlight selected, unhighlight others
furnitureButtons=document.querySelectorAll('[data-furniture-type]');furnitureButtons.forEach(function(btn){var btnType=btn.getAttribute('data-furniture-type');if(btnType===furnitureType){// Highlight selected button (brown gradient)
btn.style.background='linear-gradient(135deg, #8b4513 0%, #a0612f 100%)';btn.style.color='white';btn.style.boxShadow='0 2px 6px rgba(139, 69, 19, 0.4)';console.log("  \u2705 Highlighted ".concat(btnType," button"));}else{// Unhighlight others (gray)
btn.style.background='linear-gradient(135deg, #64748b 0%, #475569 100%)';btn.style.color='white';btn.style.boxShadow='0 2px 4px rgba(0, 0, 0, 0.2)';}});// ✅ FURNITURE MODE: Re-render using updateFurniturePreview() (NOT renderFabricMockup)
if(!(typeof updateFurniturePreview==='function')){_context42.n=2;break;}console.log("  \uD83D\uDD04 Re-rendering furniture preview with ".concat(furnitureType));_context42.n=1;return updateFurniturePreview();case 1:_context42.n=3;break;case 2:console.warn('⚠️ updateFurniturePreview not available');case 3:return _context42.a(2);}},_callee31);}));return _setFurnitureType.apply(this,arguments);}window.setFurnitureScale=setFurnitureScale;window.setFurnitureType=function(furnitureType,event){return setFurnitureType(furnitureType,event);};// Helper functions for UI increment/decrement
window.incrementFurnitureScale=function(){var scales=['0.5','1.0','1.25','1.5','2.0'];// ✅ FIX: Normalize current scale to match array format
var currentScale=appState.selectedFurnitureScale||'1.0';if(typeof currentScale==='number'){currentScale=currentScale.toString();}// Remove "X" suffix and ensure ".0" format
currentScale=currentScale.replace(/X$/i,'');if(!currentScale.includes('.')){currentScale=currentScale+'.0';}var currentIndex=scales.indexOf(currentScale);console.log("\uD83E\uDE91 Increment: Current scale \"".concat(appState.selectedFurnitureScale,"\" normalized to \"").concat(currentScale,"\", index: ").concat(currentIndex));if(currentIndex<scales.length-1){setFurnitureScale(scales[currentIndex+1]);}else{console.log("  \u26A0\uFE0F Already at maximum scale: ".concat(scales[scales.length-1]));}};window.decrementFurnitureScale=function(){var scales=['0.5','1.0','1.25','1.5','2.0'];// ✅ FIX: Normalize current scale to match array format
var currentScale=appState.selectedFurnitureScale||'1.0';if(typeof currentScale==='number'){currentScale=currentScale.toString();}// Remove "X" suffix and ensure ".0" format
currentScale=currentScale.replace(/X$/i,'');if(!currentScale.includes('.')){currentScale=currentScale+'.0';}var currentIndex=scales.indexOf(currentScale);console.log("\uD83E\uDE91 Decrement: Current scale \"".concat(appState.selectedFurnitureScale,"\" normalized to \"").concat(currentScale,"\", index: ").concat(currentIndex));if(currentIndex>0){setFurnitureScale(scales[currentIndex-1]);}else{console.log("  \u26A0\uFE0F Already at minimum scale: ".concat(scales[0]));}};// Expose saved pattern functions globally for unified modal system
window.loadSavedPatternToUI=loadSavedPatternToUI;window.showMaterialSelectionModal=showMaterialSelectionModal;window.lookupColor=lookupColor;window.generateShareableUrl=generateShareableUrl;window.copyShareableUrl=copyShareableUrl;window.addBackToPatternsButton=addBackToPatternsButton;// 🎄 PROMO CODE DIAGNOSTIC FUNCTION
window.testPromoCode=function(){console.log('🔍 ===== PROMO CODE SYSTEM DIAGNOSTIC =====');console.log('📍 Current page:',window.location.pathname);console.log('');// Check sessionStorage
var promoCode=sessionStorage.getItem('cfm_promo_code');var promoUsed=sessionStorage.getItem('cfm_promo_used');console.log('💾 SessionStorage:');console.log('  cfm_promo_code:',promoCode||'(not set)');console.log('  cfm_promo_used:',promoUsed||'(not set)');console.log('');// Check if promo UI exists
var promoInput=document.getElementById('cfm-promo-input');var promoButton=document.getElementById('cfm-promo-apply-btn');var promoFeedback=document.getElementById('cfm-promo-feedback');console.log('🎨 Promo UI Elements:');console.log('  Input field:',promoInput?'✅ Found':'❌ Missing');console.log('  Apply button:',promoButton?'✅ Found':'❌ Missing');console.log('  Feedback area:',promoFeedback?'✅ Found':'❌ Missing');console.log('');// Check if functions exist
console.log('🔧 Functions:');console.log('  showMaterialSelectionModal:',typeof showMaterialSelectionModal!=='undefined'?'✅ Loaded':'❌ Missing');console.log('  fallbackDirectRedirect:',typeof fallbackDirectRedirect!=='undefined'?'✅ Loaded':'❌ Missing');console.log('');// Test promo code validation
console.log('🧪 Testing promo code validation:');var testCode='FIRSTROLL25';console.log('  Test code:',testCode);console.log('  Valid:',testCode==='FIRSTROLL25'?'✅ Yes':'❌ No');console.log('');console.log('📋 Instructions:');console.log('  1. Click "Select Your Material" to open modal');console.log('  2. Check if promo section appears at top');console.log('  3. Enter FIRSTROLL25 and click Apply');console.log('  4. Select material and click "Proceed to Cart"');console.log('  5. Watch for redirect logs in console');console.log('');console.log('🎄 To set promo code manually:');console.log('  sessionStorage.setItem("cfm_promo_code", "FIRSTROLL25")');console.log('  sessionStorage.setItem("cfm_promo_used", "true")');console.log('==========================================');};console.log('🎄 Promo diagnostic loaded! Run window.testPromoCode() to check system');window.initializeTryFurnitureFeature=initializeTryFurnitureFeature;

/***/ },

/***/ "./src/config/colorFlex-modes.js"
/*!***************************************!*\
  !*** ./src/config/colorFlex-modes.js ***!
  \***************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   COLORFLEX_MODES: () => (/* binding */ COLORFLEX_MODES),
/* harmony export */   detectMode: () => (/* binding */ detectMode),
/* harmony export */   getCurrentConfig: () => (/* binding */ getCurrentConfig),
/* harmony export */   getMaterials: () => (/* binding */ getMaterials),
/* harmony export */   getScaleOptions: () => (/* binding */ getScaleOptions),
/* harmony export */   isFeatureEnabled: () => (/* binding */ isFeatureEnabled)
/* harmony export */ });
/**
 * ColorFlex Multi-Mode Configuration
 * Supports: Wallpaper/Fabric, Furniture, Clothing
 *
 * Created: November 11, 2025
 */

var COLORFLEX_MODES = {
  WALLPAPER: {
    id: 'wallpaper',
    name: 'Wallpaper & Fabric',
    displayName: 'ColorFlex for Walls & Fabrics',
    // Materials available for purchase
    materials: [{
      name: 'Wallpaper',
      price: 89.99,
      unit: 'roll',
      description: 'Professional-grade removable wallpaper'
    }, {
      name: 'Fabric',
      price: 79.99,
      unit: 'yard',
      minQuantity: 1,
      description: 'High-quality fabric for upholstery and decor'
    }, {
      name: 'Removable Decal',
      price: 69.99,
      unit: 'sheet',
      description: 'Vinyl decal perfect for temporary decoration'
    }],
    // Scale/repeat size settings
    scale: {
      min: 50,
      max: 400,
      "default": 100,
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
      "default": 'wallpaper-mockup-39-W60H45.png',
      basePath: '/data/mockups/',
      options: [{
        id: 'room1',
        name: 'Modern Living Room',
        image: 'wallpaper-mockup-39-W60H45.png',
        shadow: 'wallpaper-mockup-39-shadow-W60H45.jpg'
      }]
    },
    // Collections data source
    collectionsPath: '/assets/collections.json',
    collectionsFilter: function collectionsFilter(c) {
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
      patternPreviewSize: {
        width: 700,
        height: 700
      },
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
    materials: [{
      name: 'Decorator Linen',
      price: 29.99,
      unit: 'yard',
      minQuantity: 5,
      description: 'Mid-weight linen perfect for upholstery'
    }, {
      name: 'Soft Velvet',
      price: 36.99,
      unit: 'yard',
      minQuantity: 5,
      description: 'Luxurious velvet with rich texture'
    }, {
      name: 'Faux Suede',
      price: 32.99,
      unit: 'yard',
      minQuantity: 5,
      description: 'Durable suede-look fabric'
    }, {
      name: 'Drapery Sheer',
      price: 24.99,
      unit: 'yard',
      minQuantity: 5,
      description: 'Lightweight sheer fabric'
    }],
    scale: {
      min: 100,
      max: 200,
      "default": 100,
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
      "default": 'chair-mockup.jpg',
      basePath: '/data/mockups/furniture/',
      options: [{
        id: 'chair',
        name: 'Armchair',
        image: 'chair-mockup.jpg',
        mask: 'chair-mask.png'
      }, {
        id: 'sofa',
        name: 'Sofa',
        image: 'sofa-mockup.jpg',
        mask: 'sofa-mask.png'
      }],
      zoom: {
        enabled: true,
        minScale: 1.0,
        maxScale: 3.0,
        defaultScale: 0.7,
        zoomScale: 2.2
      }
    },
    collectionsPath: '/assets/collections.json',
    collectionsFilter: function collectionsFilter(c) {
      // Include all collections for furniture (patterns work on furniture)
      // Or could filter to specific furniture collections
      return true;
    },
    ui: {
      primaryColor: '#8b4513',
      // Brown for furniture
      backgroundColor: '#1a202c',
      showScaleControl: true,
      showMockupSelector: true,
      showRoomMockup: false,
      // Use furniture mockups instead
      patternPreviewSize: {
        width: 600,
        height: 600
      },
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
    materials: [{
      name: 'Cotton Poplin',
      price: 24.99,
      unit: 'yard',
      minQuantity: 2,
      description: 'Crisp, breathable cotton for shirts and dresses'
    }, {
      name: 'Jersey Knit',
      price: 29.99,
      unit: 'yard',
      minQuantity: 2,
      description: 'Stretchy knit fabric for t-shirts and casual wear'
    }, {
      name: 'Silk Charmeuse',
      price: 49.99,
      unit: 'yard',
      minQuantity: 2,
      description: 'Luxurious silk with beautiful drape'
    }, {
      name: 'Performance Polyester',
      price: 19.99,
      unit: 'yard',
      minQuantity: 2,
      description: 'Moisture-wicking athletic fabric'
    }],
    scale: {
      min: 25,
      max: 100,
      "default": 50,
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
      "default": 'tshirt-front.jpg',
      basePath: '/data/mockups/clothing/',
      options: [{
        id: 'tshirt',
        name: 'T-Shirt',
        image: 'tshirt-front.jpg',
        mask: 'tshirt-mask.png',
        backImage: 'tshirt-back.jpg'
      }, {
        id: 'dress',
        name: 'Dress',
        image: 'dress-front.jpg',
        mask: 'dress-mask.png',
        backImage: 'dress-back.jpg'
      }, {
        id: 'hoodie',
        name: 'Hoodie',
        image: 'hoodie-front.jpg',
        mask: 'hoodie-mask.png',
        backImage: 'hoodie-back.jpg'
      }],
      showFrontBack: true // Clothing-specific toggle
    },
    collectionsPath: '/assets/collections.json',
    collectionsFilter: function collectionsFilter(c) {
      // Include clothing collections or all collections
      return c.name.includes('.clo-') || !c.name.includes('.fur-');
    },
    ui: {
      primaryColor: '#4a90e2',
      // Blue for clothing
      backgroundColor: '#1a202c',
      showScaleControl: true,
      showMockupSelector: true,
      showRoomMockup: false,
      patternPreviewSize: {
        width: 500,
        height: 700
      },
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
function detectMode() {
  // Check URL parameter first (?mode=furniture)
  var urlParams = new URLSearchParams(window.location.search);
  var modeParam = urlParams.get('mode');
  if (modeParam) {
    var upperMode = modeParam.toUpperCase();
    if (COLORFLEX_MODES[upperMode]) {
      console.log("\uD83C\uDFA8 Mode detected from URL parameter: ".concat(upperMode));
      return upperMode;
    }
  }

  // Check page path
  var pagePath = window.location.pathname;
  if (pagePath.includes('furniture') || pagePath.includes('colorflex-furniture')) {
    console.log('🪑 Mode detected from page path: FURNITURE');
    return 'FURNITURE';
  }
  if (pagePath.includes('clothing') || pagePath.includes('colorflex-clothing')) {
    console.log('👕 Mode detected from page path: CLOTHING');
    return 'CLOTHING';
  }

  // Check collection parameter (?collection=bombay.fur-1)
  var collectionParam = urlParams.get('collection');
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
function getCurrentConfig() {
  var mode = detectMode();
  var config = COLORFLEX_MODES[mode];
  console.log("\u2705 ColorFlex Config Loaded:", {
    mode: config.name,
    materials: config.materials.length,
    scaleRange: "".concat(config.scale.min, "% - ").concat(config.scale.max, "%"),
    mockupsEnabled: config.mockups.enabled,
    primaryColor: config.ui.primaryColor
  });
  return config;
}

/**
 * Check if a feature is enabled for current mode
 */
function isFeatureEnabled(featureName) {
  var config = getCurrentConfig();
  return config.features[featureName] === true;
}

/**
 * Get materials for current mode
 */
function getMaterials() {
  var config = getCurrentConfig();
  return config.materials;
}

/**
 * Get scale options for current mode
 */
function getScaleOptions() {
  var config = getCurrentConfig();
  var options = [];
  for (var scale = config.scale.min; scale <= config.scale.max; scale += config.scale.step) {
    options.push({
      value: scale,
      label: config.scale.labels[scale] || "".concat(scale, "%")
    });
  }
  return options;
}

// Export for global access
if (typeof window !== 'undefined') {
  window.ColorFlexModes = {
    detectMode: detectMode,
    getCurrentConfig: getCurrentConfig,
    isFeatureEnabled: isFeatureEnabled,
    getMaterials: getMaterials,
    getScaleOptions: getScaleOptions,
    MODES: COLORFLEX_MODES
  };
}

/***/ },

/***/ "./src/index.js"
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _CFM_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CFM.js */ "./src/CFM.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/**
 * Super Simple ColorFlex for Shopify
 * Just loads your existing working code + minimal cart integration
 */

// Import your existing working code - this will execute CFM.js and set up window.startApp


// Styles are managed manually in dist/color-flex-core.min.css

// Simple Shopify cart integration
window.addToShopifyCart = function (customizationData) {
  return new Promise(function (resolve, reject) {
    try {
      // Get variant ID from page or pass it in
      var idElement = document.querySelector('[name="id"]');
      var dataElement = document.querySelector('[data-variant-id]');
      var variantId = idElement && idElement.value || dataElement && dataElement.getAttribute('data-variant-id');
      if (!variantId) {
        console.error('No variant ID found');
        resolve(false);
        return;
      }

      // Prepare cart data
      var cartData = {
        id: variantId,
        quantity: 1,
        properties: {
          '_colorflex_customization': JSON.stringify(customizationData),
          'Pattern': customizationData.pattern || '',
          'Colors': customizationData.colors || ''
        }
      };

      // Add to Shopify cart
      fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cartData)
      }).then(function (response) {
        if (response.ok) {
          console.log('✅ Added to cart');
          resolve(true);
        } else {
          console.error('Failed to add to cart');
          resolve(false);
        }
      })["catch"](function (error) {
        console.error('Cart error:', error);
        resolve(false);
      });
    } catch (error) {
      console.error('Cart error:', error);
      resolve(false);
    }
  });
};

// Expose your existing globals (if needed)
window.ColorFlexSimple = {
  addToCart: window.addToShopifyCart
  // Add other functions you want to expose
};

// Expose testing functions after CFM.js loads
setTimeout(function () {
  if (typeof window.testModularSystem === 'function') {
    // Re-expose testing functions to ensure they're available
    window.testModularSystem = window.testModularSystem;
    window.quickTestModular = window.quickTestModular;
    window.debugModularSystem = window.debugModularSystem;
    console.log("🔧 TESTING FUNCTIONS AVAILABLE:");
    console.log("  testModularSystem()");
    console.log("  quickTestModular('preview'|'room'|'both')");
    console.log("  debugModularSystem()");
  } else {
    console.log("⚠️ Testing functions not loaded - they may be in module scope");
  }
}, 1000);
console.log('🎨 ColorFlex loaded - ready to use!');
console.log('*** BUILD DIAGNOSIS TEST 999 - WEBPACK IS WORKING ***');

// Export testing functions and make them globally available
var testingFunctions = {
  testModularSystem: function () {
    var _testModularSystem = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
      var hasDOM, hasState, hasFunctions, _t;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            console.log("🚀 STARTING SIMPLE MODULAR SYSTEM TEST...");
            _context.p = 1;
            // Check if we have the basic dependencies needed
            hasDOM = !!(window.dom && window.dom.preview && window.dom.roomMockup);
            hasState = !!(window.appState && window.appState.currentPattern && window.appState.selectedCollection);
            hasFunctions = !!(window.lookupColor && window.normalizePath && window.processImage);
            console.log("✅ Dependency Check:");
            console.log("  DOM elements:", hasDOM);
            console.log("  App state:", hasState);
            console.log("  Core functions:", hasFunctions);
            if (!(!hasDOM || !hasState || !hasFunctions)) {
              _context.n = 2;
              break;
            }
            console.warn("⚠️ Some dependencies missing - modular system may not work fully");
            return _context.a(2, false);
          case 2:
            console.log("✅ Basic modular system test completed");
            console.log("📋 Next: Try ColorFlex.quickTestModular('preview') or ColorFlex.quickTestModular('room')");
            return _context.a(2, true);
          case 3:
            _context.p = 3;
            _t = _context.v;
            console.error("❌ Modular system test failed:", _t);
            return _context.a(2, false);
        }
      }, _callee, null, [[1, 3]]);
    }));
    function testModularSystem() {
      return _testModularSystem.apply(this, arguments);
    }
    return testModularSystem;
  }(),
  quickTestModular: function () {
    var _quickTestModular = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
      var functionName,
        _args2 = arguments,
        _t2;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.p = _context2.n) {
          case 0:
            functionName = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : 'both';
            console.log("\uD83C\uDFC3 QUICK TEST: ".concat(functionName));
            _context2.p = 1;
            if (!(functionName === 'preview' || functionName === 'both')) {
              _context2.n = 3;
              break;
            }
            console.log("Testing updatePreview...");
            _context2.n = 2;
            return window.updatePreview();
          case 2:
            console.log("✅ updatePreview completed");
          case 3:
            if (!(functionName === 'room' || functionName === 'both')) {
              _context2.n = 5;
              break;
            }
            console.log("Testing updateRoomMockup...");
            _context2.n = 4;
            return window.updateRoomMockup();
          case 4:
            console.log("✅ updateRoomMockup completed");
          case 5:
            console.log("🎉 Quick test completed successfully");
            return _context2.a(2, true);
          case 6:
            _context2.p = 6;
            _t2 = _context2.v;
            console.error("❌ Quick test failed:", _t2);
            return _context2.a(2, false);
        }
      }, _callee2, null, [[1, 6]]);
    }));
    function quickTestModular() {
      return _quickTestModular.apply(this, arguments);
    }
    return quickTestModular;
  }(),
  debugModularSystem: function debugModularSystem() {
    var _window$appState, _window$appState2, _window$appState3, _window$dom, _window$dom2, _window$dom3;
    console.log("🔍 CURRENT SYSTEM DEBUG INFO:");
    console.log("Current Pattern:", (_window$appState = window.appState) === null || _window$appState === void 0 || (_window$appState = _window$appState.currentPattern) === null || _window$appState === void 0 ? void 0 : _window$appState.name);
    console.log("Current Collection:", (_window$appState2 = window.appState) === null || _window$appState2 === void 0 || (_window$appState2 = _window$appState2.selectedCollection) === null || _window$appState2 === void 0 ? void 0 : _window$appState2.name);
    console.log("Current Layers:", (_window$appState3 = window.appState) === null || _window$appState3 === void 0 || (_window$appState3 = _window$appState3.currentLayers) === null || _window$appState3 === void 0 ? void 0 : _window$appState3.length);
    console.log("DOM Elements Available:", {
      preview: !!((_window$dom = window.dom) !== null && _window$dom !== void 0 && _window$dom.preview),
      roomMockup: !!((_window$dom2 = window.dom) !== null && _window$dom2 !== void 0 && _window$dom2.roomMockup),
      patternName: !!((_window$dom3 = window.dom) !== null && _window$dom3 !== void 0 && _window$dom3.patternName)
    });
    console.log("Core Functions Available:", {
      updatePreview: _typeof(window.updatePreview),
      updateRoomMockup: _typeof(window.updateRoomMockup),
      lookupColor: _typeof(window.lookupColor),
      processImage: _typeof(window.processImage)
    });
  }
};

// Make functions available both globally and through ColorFlex module
Object.assign(window, testingFunctions);

// Return the testing functions as part of the module export
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (testingFunctions);

// Initialize download button removal immediately when script loads
// This ensures it works on ANY page that loads this script, not just the ColorFlex app page
if (typeof window.initializeDownloadButtonRemoval === 'function') {
  console.log('🚀 Starting download button removal from index.js...');
  window.initializeDownloadButtonRemoval();
} else {
  console.log('⚠️ Download button removal function not available yet, will try after DOM ready');
  // Fallback - try again after a short delay to ensure CFM.js has loaded
  setTimeout(function () {
    if (typeof window.initializeDownloadButtonRemoval === 'function') {
      console.log('🚀 Starting download button removal (delayed)...');
      window.initializeDownloadButtonRemoval();
    } else {
      console.log('❌ Download button removal function still not available');
    }
  }, 500);
}

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!***************************!*\
  !*** ./src/index.core.js ***!
  \***************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index.js */ "./src/index.js");
// Core entry (default): expose target and load main app
window.ColorFlexBuildTarget = 'core';

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=color-flex-core.js.map