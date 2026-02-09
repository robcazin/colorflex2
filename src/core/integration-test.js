/**
 * MODULAR SYSTEM INTEGRATION TEST
 * Version: 1.0.0
 * Created: 2025-09-27
 *
 * This script provides a simple way to test the modular system from CFM.js
 * It can be called directly from the browser console or integrated into the main application.
 */

import CoreModules from './index.js';
import ModuleTester from './module-tester.js';

const INTEGRATION_VERSION = "1.0.0";

/**
 * Simple integration test that can be called from browser console
 */
window.testModularSystem = async function() {
    console.log("🚀 STARTING MODULAR SYSTEM INTEGRATION TEST...");

    try {
        // Step 1: Initialize the modular system
        console.log("Step 1: Initializing modular system...");
        const modularSystem = CoreModules.initializeModularSystem();

        if (!modularSystem.success) {
            console.error("❌ INTEGRATION TEST FAILED: Modular system initialization failed");
            console.error("Error:", modularSystem.error);
            return false;
        }

        console.log("✅ Modular system initialized successfully");

        // Step 2: Test basic functionality
        console.log("Step 2: Testing basic functionality...");

        // Test updatePreview
        try {
            console.log("  Testing modular updatePreview...");
            await modularSystem.updatePreview();
            console.log("  ✅ Modular updatePreview executed successfully");
        } catch (error) {
            console.error("  ❌ Modular updatePreview failed:", error);
            return false;
        }

        // Test updateRoomMockup
        try {
            console.log("  Testing modular updateRoomMockup...");
            await modularSystem.updateRoomMockup();
            console.log("  ✅ Modular updateRoomMockup executed successfully");
        } catch (error) {
            console.error("  ❌ Modular updateRoomMockup failed:", error);
            return false;
        }

        // Step 3: Run comprehensive test suite if available
        if (typeof ModuleTester.runComprehensiveTestSuite === 'function') {
            console.log("Step 3: Running comprehensive test suite...");

            const originalFunctions = {
                updatePreview: window.updatePreview,
                updateRoomMockup: window.updateRoomMockup
            };

            const testResults = await ModuleTester.runComprehensiveTestSuite(
                modularSystem,
                originalFunctions
            );

            if (testResults.summary.status === 'PASSED') {
                console.log("✅ COMPREHENSIVE TESTS PASSED");
            } else {
                console.log("⚠️ SOME COMPREHENSIVE TESTS FAILED - See detailed results");
                console.log("Test Results:", testResults);
            }
        }

        console.log("🎉 MODULAR SYSTEM INTEGRATION TEST COMPLETED SUCCESSFULLY");
        return true;

    } catch (error) {
        console.error("❌ INTEGRATION TEST FAILED:", error);
        return false;
    }
};

/**
 * Quick test function for specific scenarios
 */
window.quickTestModular = async function(functionName = 'both') {
    console.log(`🏃 QUICK TEST: ${functionName}`);

    try {
        const modularSystem = CoreModules.initializeModularSystem();

        if (!modularSystem.success) {
            console.error("❌ Quick test failed: Could not initialize modular system");
            return false;
        }

        if (functionName === 'preview' || functionName === 'both') {
            console.log("Testing updatePreview...");
            await modularSystem.updatePreview();
            console.log("✅ updatePreview completed");
        }

        if (functionName === 'room' || functionName === 'both') {
            console.log("Testing updateRoomMockup...");
            await modularSystem.updateRoomMockup();
            console.log("✅ updateRoomMockup completed");
        }

        console.log("🎉 Quick test completed successfully");
        return true;

    } catch (error) {
        console.error("❌ Quick test failed:", error);
        return false;
    }
};

/**
 * Switch to modular functions (replace original functions)
 */
window.switchToModularFunctions = function() {
    console.log("🔄 SWITCHING TO MODULAR FUNCTIONS...");

    try {
        const modularSystem = CoreModules.initializeModularSystem();

        if (!modularSystem.success) {
            console.error("❌ Cannot switch: Modular system initialization failed");
            return false;
        }

        // Store originals as backup
        window._originalUpdatePreview = window.updatePreview;
        window._originalUpdateRoomMockup = window.updateRoomMockup;

        // Replace with modular functions
        window.updatePreview = async () => {
            console.log("🔧 USING MODULAR updatePreview");
            return await modularSystem.updatePreview();
        };

        window.updateRoomMockup = async () => {
            console.log("🔧 USING MODULAR updateRoomMockup");
            return await modularSystem.updateRoomMockup();
        };

        console.log("✅ SWITCHED TO MODULAR FUNCTIONS");
        console.log("   Original functions backed up as _originalUpdatePreview and _originalUpdateRoomMockup");
        console.log("   Call restoreOriginalFunctions() to revert");

        return true;

    } catch (error) {
        console.error("❌ Failed to switch to modular functions:", error);
        return false;
    }
};

/**
 * Restore original functions
 */
window.restoreOriginalFunctions = function() {
    console.log("🔄 RESTORING ORIGINAL FUNCTIONS...");

    if (window._originalUpdatePreview) {
        window.updatePreview = window._originalUpdatePreview;
        delete window._originalUpdatePreview;
        console.log("✅ Restored original updatePreview");
    }

    if (window._originalUpdateRoomMockup) {
        window.updateRoomMockup = window._originalUpdateRoomMockup;
        delete window._originalUpdateRoomMockup;
        console.log("✅ Restored original updateRoomMockup");
    }

    console.log("✅ ORIGINAL FUNCTIONS RESTORED");
};

/**
 * Debug function to inspect modular system state
 */
window.debugModularSystem = function() {
    console.log("🔍 MODULAR SYSTEM DEBUG INFO:");

    try {
        const coreInfo = CoreModules.getCoreModulesInfo();
        console.log("Core Modules Info:", coreInfo);

        const modularSystem = CoreModules.initializeModularSystem();
        if (modularSystem.success) {
            console.log("Dependencies:", Object.keys(modularSystem.dependencies));
            console.log("Available Functions:", ['updatePreview', 'updateRoomMockup']);
        } else {
            console.log("❌ Modular system not initialized:", modularSystem.error);
        }

    } catch (error) {
        console.error("❌ Debug failed:", error);
    }
};

// Auto-initialize when this module loads
console.log(`🔧 INTEGRATION TEST v${INTEGRATION_VERSION} LOADED`);
console.log("Available commands:");
console.log("  testModularSystem() - Run complete integration test");
console.log("  quickTestModular('preview'|'room'|'both') - Quick function test");
console.log("  switchToModularFunctions() - Replace original functions with modular ones");
console.log("  restoreOriginalFunctions() - Restore original functions");
console.log("  debugModularSystem() - Show debug information");

export default {
    testModularSystem: window.testModularSystem,
    quickTestModular: window.quickTestModular,
    switchToModularFunctions: window.switchToModularFunctions,
    restoreOriginalFunctions: window.restoreOriginalFunctions,
    debugModularSystem: window.debugModularSystem,
    version: INTEGRATION_VERSION
};