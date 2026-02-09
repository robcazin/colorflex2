/**
 * Super Simple ColorFlex for Shopify
 * Just loads your existing working code + minimal cart integration
 */

// Import your existing working code - this will execute CFM.js and set up window.startApp
import './CFM.js';

// Styles are managed manually in dist/color-flex-core.min.css

// Simple Shopify cart integration
window.addToShopifyCart = function(customizationData) {
    return new Promise(function(resolve, reject) {
        try {
            // Get variant ID from page or pass it in
            var idElement = document.querySelector('[name="id"]');
            var dataElement = document.querySelector('[data-variant-id]');
            var variantId = (idElement && idElement.value) || 
                           (dataElement && dataElement.getAttribute('data-variant-id'));
        
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
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cartData)
            }).then(function(response) {
                if (response.ok) {
                    console.log('✅ Added to cart');
                    resolve(true);
                } else {
                    console.error('Failed to add to cart');
                    resolve(false);
                }
            }).catch(function(error) {
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
    addToCart: window.addToShopifyCart,
    // Add other functions you want to expose
};

// Expose testing functions after CFM.js loads
setTimeout(() => {
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
const testingFunctions = {
    testModularSystem: async function() {
        console.log("🚀 STARTING SIMPLE MODULAR SYSTEM TEST...");
        try {
            // Check if we have the basic dependencies needed
            const hasDOM = !!(window.dom && window.dom.preview && window.dom.roomMockup);
            const hasState = !!(window.appState && window.appState.currentPattern && window.appState.selectedCollection);
            const hasFunctions = !!(window.lookupColor && window.normalizePath && window.processImage);

            console.log("✅ Dependency Check:");
            console.log("  DOM elements:", hasDOM);
            console.log("  App state:", hasState);
            console.log("  Core functions:", hasFunctions);

            if (!hasDOM || !hasState || !hasFunctions) {
                console.warn("⚠️ Some dependencies missing - modular system may not work fully");
                return false;
            }

            console.log("✅ Basic modular system test completed");
            console.log("📋 Next: Try ColorFlex.quickTestModular('preview') or ColorFlex.quickTestModular('room')");
            return true;

        } catch (error) {
            console.error("❌ Modular system test failed:", error);
            return false;
        }
    },

    quickTestModular: async function(functionName = 'both') {
        console.log(`🏃 QUICK TEST: ${functionName}`);
        try {
            if (functionName === 'preview' || functionName === 'both') {
                console.log("Testing updatePreview...");
                await window.updatePreview();
                console.log("✅ updatePreview completed");
            }

            if (functionName === 'room' || functionName === 'both') {
                console.log("Testing updateRoomMockup...");
                await window.updateRoomMockup();
                console.log("✅ updateRoomMockup completed");
            }

            console.log("🎉 Quick test completed successfully");
            return true;

        } catch (error) {
            console.error("❌ Quick test failed:", error);
            return false;
        }
    },

    debugModularSystem: function() {
        console.log("🔍 CURRENT SYSTEM DEBUG INFO:");
        console.log("Current Pattern:", window.appState?.currentPattern?.name);
        console.log("Current Collection:", window.appState?.selectedCollection?.name);
        console.log("Current Layers:", window.appState?.currentLayers?.length);
        console.log("DOM Elements Available:", {
            preview: !!window.dom?.preview,
            roomMockup: !!window.dom?.roomMockup,
            patternName: !!window.dom?.patternName
        });
        console.log("Core Functions Available:", {
            updatePreview: typeof window.updatePreview,
            updateRoomMockup: typeof window.updateRoomMockup,
            lookupColor: typeof window.lookupColor,
            processImage: typeof window.processImage
        });
    }
};

// Make functions available both globally and through ColorFlex module
Object.assign(window, testingFunctions);

// Return the testing functions as part of the module export
export default testingFunctions;

// Initialize download button removal immediately when script loads
// This ensures it works on ANY page that loads this script, not just the ColorFlex app page
if (typeof window.initializeDownloadButtonRemoval === 'function') {
    console.log('🚀 Starting download button removal from index.js...');
    window.initializeDownloadButtonRemoval();
} else {
    console.log('⚠️ Download button removal function not available yet, will try after DOM ready');
    // Fallback - try again after a short delay to ensure CFM.js has loaded
    setTimeout(function() {
        if (typeof window.initializeDownloadButtonRemoval === 'function') {
            console.log('🚀 Starting download button removal (delayed)...');
            window.initializeDownloadButtonRemoval();
        } else {
            console.log('❌ Download button removal function still not available');
        }
    }, 500);
}