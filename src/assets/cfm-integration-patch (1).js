/**
 * CFM.js Integration Patch for Enhanced Multi-Step Flow
 * 
 * This patch modifies the existing showMaterialSelectionModal function in CFM.js
 * to use our ProductConfigurationFlow instead of redirecting to Shopify product pages.
 * 
 * INTEGRATION INSTRUCTIONS:
 * 1. Ensure ProductConfigurationFlow.js is loaded before CFM.js
 * 2. Apply this patch after CFM.js is loaded
 * 3. This will replace the existing material selection flow with our 4-step flow
 */

(function() {
    'use strict';

    console.log('🔄 Applying CFM.js integration patch for multi-step flow...');

    // Ensure our dependencies are available
    if (typeof ProductConfigurationFlow === 'undefined') {
        console.error('❌ ProductConfigurationFlow not found! Please ensure ProductConfigurationFlow.js is loaded first.');
        return;
    }

    // Initialize our configuration flow instance
    window.configFlow = window.configFlow || new ProductConfigurationFlow();

    /**
     * Enhanced showMaterialSelectionModal that integrates with our 4-step flow
     * This replaces the existing function in CFM.js
     */
    function showMaterialSelectionModalEnhanced(pattern) {
        console.log('🎯 Enhanced material selection modal starting for:', pattern.patternName);
        
        // Convert CFM pattern format to our ProductConfigurationFlow format
        const enhancedPattern = {
            id: pattern.id || ('pattern-' + Date.now()),
            patternName: pattern.patternName,
            collection: pattern.collectionName || pattern.collection || 'custom',
            colors: pattern.colors ? pattern.colors.map(c => ({
                layer: c.layer || c.name || 'Layer',
                color: c.color || c.value || c,
                name: c.name || c.color || c
            })) : [],
            patternPreview: pattern.thumbnail || pattern.patternPreview || null,
            saveDate: pattern.saveDate || new Date().toISOString().split('T')[0],
            // CFM-specific data
            patternSize: pattern.patternSize || '',
            tilingType: pattern.tilingType || '',
            originalPattern: pattern // Keep reference to original
        };

        // Close any existing saved patterns modal
        const savedPatternsModal = document.querySelector('[id*="savedPatternsModal"], .saved-patterns-modal, .modal-overlay');
        if (savedPatternsModal) {
            console.log('🔄 Closing saved patterns modal...');
            savedPatternsModal.remove();
        }

        // Start our enhanced 4-step flow
        console.log('🚀 Starting ProductConfigurationFlow with pattern:', enhancedPattern);
        window.configFlow.interceptAddToCart(enhancedPattern);
    }

    /**
     * Enhanced redirect function that integrates with our flow
     * This replaces the existing redirectToProductConfiguration function
     */
    function redirectToProductConfigurationEnhanced(pattern, material) {
        console.log('🔄 Enhanced redirect intercepted - using multi-step flow instead');
        
        // Instead of redirecting to Shopify, continue with our texture selection
        if (window.configFlow && typeof window.configFlow.selectMaterial === 'function') {
            console.log('✅ Continuing with texture selection for:', material);
            window.configFlow.state.category = material;
            window.configFlow.selectMaterial(material);
        } else {
            console.error('❌ ConfigFlow not available, falling back to original redirect');
            // Fall back to original behavior if our flow isn't available
            const originalRedirect = window.originalRedirectToProductConfiguration;
            if (originalRedirect) {
                originalRedirect(pattern, material);
            }
        }
    }

    /**
     * Apply the integration patch
     */
    function applyIntegrationPatch() {
        // Store original functions as backups
        if (window.showMaterialSelectionModal && !window.originalShowMaterialSelectionModal) {
            window.originalShowMaterialSelectionModal = window.showMaterialSelectionModal;
            console.log('✅ Backed up original showMaterialSelectionModal');
        }

        if (window.redirectToProductConfiguration && !window.originalRedirectToProductConfiguration) {
            window.originalRedirectToProductConfiguration = window.redirectToProductConfiguration;
            console.log('✅ Backed up original redirectToProductConfiguration');
        }

        // Replace with our enhanced versions
        window.showMaterialSelectionModal = showMaterialSelectionModalEnhanced;
        window.redirectToProductConfiguration = redirectToProductConfigurationEnhanced;

        console.log('✅ CFM.js integration patch applied successfully!');
        console.log('🎯 Buy It buttons will now use 4-step flow: Pattern → Material → Texture → Length → Cart');
    }

    /**
     * Restore original functions (for debugging/testing)
     */
    window.restoreOriginalCFMFunctions = function() {
        if (window.originalShowMaterialSelectionModal) {
            window.showMaterialSelectionModal = window.originalShowMaterialSelectionModal;
            console.log('✅ Restored original showMaterialSelectionModal');
        }

        if (window.originalRedirectToProductConfiguration) {
            window.redirectToProductConfiguration = window.originalRedirectToProductConfiguration;
            console.log('✅ Restored original redirectToProductConfiguration');
        }

        console.log('🔄 Original CFM.js functions restored');
    };

    // Apply the patch immediately if CFM functions are available
    if (typeof window.showMaterialSelectionModal === 'function') {
        applyIntegrationPatch();
    } else {
        // Wait for CFM.js to load
        console.log('⏳ Waiting for CFM.js to load...');
        
        const checkForCFM = setInterval(function() {
            if (typeof window.showMaterialSelectionModal === 'function') {
                clearInterval(checkForCFM);
                console.log('✅ CFM.js detected, applying patch...');
                applyIntegrationPatch();
            }
        }, 100);

        // Stop checking after 10 seconds
        setTimeout(function() {
            clearInterval(checkForCFM);
            if (typeof window.showMaterialSelectionModal !== 'function') {
                console.error('❌ CFM.js not found after 10 seconds. Integration patch not applied.');
            }
        }, 10000);
    }

    /**
     * Helper function to extract pattern data from various DOM contexts
     * This works with the existing "Buy It!" buttons in different parts of the app
     */
    function extractPatternFromContext(element) {
        try {
            // Method 1: Check for pattern data in element or parent data attributes
            let current = element;
            while (current && current !== document.body) {
                if (current.dataset && current.dataset.patternData) {
                    return JSON.parse(current.dataset.patternData);
                }
                if (current.dataset && current.dataset.pattern) {
                    return JSON.parse(current.dataset.pattern);
                }
                current = current.parentElement;
            }

            // Method 2: Look for global pattern state
            if (window.currentPattern || window.selectedPattern) {
                const pattern = window.currentPattern || window.selectedPattern;
                return {
                    id: pattern.id || ('pattern-' + Date.now()),
                    patternName: pattern.name || pattern.patternName || 'Current Pattern',
                    collection: pattern.collection || 'unknown',
                    colors: pattern.colors || pattern.layerColors || [],
                    patternPreview: pattern.preview || pattern.thumbnail || null,
                    saveDate: new Date().toISOString().split('T')[0]
                };
            }

            console.warn('⚠️ Could not extract pattern data from context');
            return null;

        } catch (error) {
            console.error('❌ Error extracting pattern from context:', error);
            return null;
        }
    }

    // Export helper functions for manual integration
    window.CFMIntegrationPatch = {
        applyPatch: applyIntegrationPatch,
        restoreOriginal: window.restoreOriginalCFMFunctions,
        extractPattern: extractPatternFromContext,
        showEnhancedModal: showMaterialSelectionModalEnhanced
    };

    console.log('✅ CFM Integration Patch loaded and ready');

})();

// Auto-apply integration when both CFM.js and ProductConfigurationFlow are available
if (typeof window.showMaterialSelectionModal === 'function' && typeof ProductConfigurationFlow !== 'undefined') {
    console.log('🚀 Auto-applying CFM integration patch...');
}