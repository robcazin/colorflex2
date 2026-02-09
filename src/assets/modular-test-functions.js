/**
 * STANDALONE MODULAR TESTING FUNCTIONS
 * These functions can be loaded independently to test the modular system
 */

console.log("🔧 LOADING STANDALONE MODULAR TESTING FUNCTIONS...");

// Test the modular system - simple version for browser console
window.testModularSystem = async function() {
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
            if (!hasDOM) console.log("  Missing DOM: check if ColorFlex app is loaded");
            if (!hasState) console.log("  Missing State: try selecting a pattern first");
            if (!hasFunctions) console.log("  Missing Functions: check if ColorFlex core is loaded");
            return false;
        }

        console.log("✅ Basic modular system test completed");
        console.log("📋 Next: Try testModularSystem.quick('preview') or testModularSystem.quick('room')");
        return true;

    } catch (error) {
        console.error("❌ Modular system test failed:", error);
        return false;
    }
};

// Quick test for specific functions
window.testModularSystem.quick = async function(functionName = 'both') {
    console.log(`🏃 QUICK TEST: ${functionName}`);

    try {
        if (functionName === 'preview' || functionName === 'both') {
            console.log("Testing updatePreview...");
            if (typeof window.updatePreview === 'function') {
                await window.updatePreview();
                console.log("✅ updatePreview completed");
            } else {
                console.error("❌ updatePreview function not available");
                return false;
            }
        }

        if (functionName === 'room' || functionName === 'both') {
            console.log("Testing updateRoomMockup...");
            if (typeof window.updateRoomMockup === 'function') {
                await window.updateRoomMockup();
                console.log("✅ updateRoomMockup completed");
            } else {
                console.error("❌ updateRoomMockup function not available");
                return false;
            }
        }

        console.log("🎉 Quick test completed successfully");
        return true;

    } catch (error) {
        console.error("❌ Quick test failed:", error);
        return false;
    }
};

// Show current system info
window.testModularSystem.debug = function() {
    console.log("🔍 CURRENT SYSTEM DEBUG INFO:");

    console.log("📊 Application State:");
    console.log("  Current Pattern:", window.appState?.currentPattern?.name || "None");
    console.log("  Current Collection:", window.appState?.selectedCollection?.name || "None");
    console.log("  Current Layers:", window.appState?.currentLayers?.length || 0);

    console.log("🎛️ DOM Elements:");
    console.log("  preview:", !!window.dom?.preview);
    console.log("  roomMockup:", !!window.dom?.roomMockup);
    console.log("  patternName:", !!window.dom?.patternName);

    console.log("⚙️ Core Functions:");
    console.log("  updatePreview:", typeof window.updatePreview);
    console.log("  updateRoomMockup:", typeof window.updateRoomMockup);
    console.log("  lookupColor:", typeof window.lookupColor);
    console.log("  processImage:", typeof window.processImage);

    console.log("📦 Module System:");
    console.log("  ColorFlex object:", typeof window.ColorFlex, window.ColorFlex ? Object.keys(window.ColorFlex) : "N/A");

    // Check if we can access the modular core functions
    if (window.appState && window.appState.currentPattern) {
        console.log("🎯 Ready for testing! Try:");
        console.log("  testModularSystem.quick('preview')");
        console.log("  testModularSystem.quick('room')");
        console.log("  testModularSystem.quick('both')");
    } else {
        console.log("⚠️ Select a pattern first to enable full testing");
    }
};

// Alias for easier access
window.quickTestModular = window.testModularSystem.quick;
window.debugModularSystem = window.testModularSystem.debug;

console.log("✅ STANDALONE MODULAR TESTING FUNCTIONS LOADED");
console.log("📋 Available Commands:");
console.log("  testModularSystem() - Basic system validation");
console.log("  testModularSystem.quick('preview'|'room'|'both') - Quick function test");
console.log("  testModularSystem.debug() - Show detailed system info");
console.log("  quickTestModular('both') - Alias for quick test");
console.log("  debugModularSystem() - Alias for debug");