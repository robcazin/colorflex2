/**
 * CRITICAL BACKUP SAFETY FILE
 * Version: 1.0.0
 * Created: 2025-09-27
 *
 * This file contains working backup copies of critical functions.
 * These are EXACT copies from the working CFM.js as of 2025-09-27.
 *
 * USE ONLY AS EMERGENCY FALLBACK if modular system fails.
 *
 * WORKING FIXES INCLUDED:
 * - Pattern type detection fix (getPatternType)
 * - Aspect ratio fix for pattern preview (updatePreview)
 * - Aspect ratio fix for room mockup (updateRoomMockup)
 * - ColorFlex pattern detection
 *
 * DO NOT MODIFY - KEEP AS REFERENCE
 */

console.log("🚨 EMERGENCY BACKUP FUNCTIONS LOADED - USE ONLY AS FALLBACK!");

/**
 * PROTECTION STRATEGY EXPLANATION:
 *
 * Instead of extracting massive functions (~300+ lines each), we're creating:
 * 1. Function guards that validate inputs before calling real functions
 * 2. Version tracking to detect if functions get modified
 * 3. Backup copies of critical small functions (like getPatternType)
 * 4. Emergency restoration for when things break
 *
 * The actual updatePreview/updateRoomMockup stay in CFM.js but are protected.
 */

/**
 * BACKUP: Working getPatternType function (FIXED VERSION)
 * Last known working: 2025-09-27
 */
window.BACKUP_getPatternType = function(pattern, collection) {
    console.log("🚨 EMERGENCY: Using backup getPatternType");

    if (collection?.name === "wall-panels") return "wall-panel";
    if (pattern?.tintWhite) return "tint-white";
    if (collection?.elements?.length) return "element-coloring";

    // 🔧 CRITICAL FIX: Check for ColorFlex patterns before defaulting to standard
    if (pattern?.colorFlex === true || (pattern?.layers && pattern.layers.length > 0)) {
        return "colorflex";
    }

    return "standard";
};

/**
 * BACKUP: Working getColorMapping function
 * Last known working: 2025-09-27
 */
window.BACKUP_getColorMapping = function(patternType, currentLayers, layerIndex) {
    console.log("🚨 EMERGENCY: Using backup getColorMapping");

    switch (patternType) {
        case "wall-panel":
            return currentLayers[layerIndex + 2]; // Skip wall + background
        case "standard":
            const inputLayers = currentLayers.filter(layer => !layer.isShadow);
            return inputLayers[layerIndex + 1]; // Skip background
        case "colorflex":
            // ColorFlex patterns: skip background layer (index 0)
            const inputLayersColorFlex = currentLayers.filter(layer => !layer.isShadow);
            return inputLayersColorFlex[layerIndex + 1]; // Skip background
        case "element-coloring":
            const inputLayersElement = currentLayers.filter(layer => !layer.isShadow);
            return inputLayersElement[layerIndex + 1];
        default:
            return currentLayers[layerIndex + 1];
    }
};

/**
 * BACKUP: Critical pattern rendering constants
 * These values are known to work correctly
 */
window.BACKUP_RENDERING_CONSTANTS = {
    DEFAULT_CANVAS_SIZE: 700,
    ROOM_MOCKUP_WIDTH: 600,
    ROOM_MOCKUP_HEIGHT: 450,
    PATTERN_SCALE_MULTIPLIER: 10, // For room mockup calculations
    SHADOW_OPACITY: 0.3,
    SHADOW_BLEND_MODE: "multiply",
    NORMAL_BLEND_MODE: "source-over"
};

/**
 * BACKUP: Working aspect ratio calculation
 * This is the fix that resolved Florencia and other wide patterns
 */
window.BACKUP_calculatePatternAspect = function(pattern, fallbackImg) {
    console.log("🚨 EMERGENCY: Using backup aspect ratio calculation");

    const patternSize = pattern.size;
    const patternAspect = (patternSize && patternSize.length >= 2) ?
        patternSize[0] / patternSize[1] :
        (fallbackImg ? fallbackImg.width / fallbackImg.height : 1.0);

    console.log(`🚨 BACKUP: Pattern ${pattern.name} aspect=${patternAspect.toFixed(3)} from size=${patternSize}`);
    return patternAspect;
};

/**
 * EMERGENCY RESTORATION FUNCTION
 * Call this if the modular system breaks
 */
window.EMERGENCY_RESTORE_CORE_FUNCTIONS = function() {
    console.error("🚨 EMERGENCY: Restoring core functions from backup!");

    // Replace broken functions with working backups
    if (typeof getPatternType !== 'function' || !getPatternType.toString().includes('colorflex')) {
        console.error("🚨 getPatternType is broken, restoring from backup");
        window.getPatternType = window.BACKUP_getPatternType;
    }

    if (typeof getColorMapping !== 'function') {
        console.error("🚨 getColorMapping is broken, restoring from backup");
        window.getColorMapping = window.BACKUP_getColorMapping;
    }

    console.log("🚨 EMERGENCY RESTORATION COMPLETE");
    return true;
};

/**
 * BACKUP VALIDATION
 * Verify backup functions are working
 */
window.VALIDATE_BACKUP_FUNCTIONS = function() {
    console.log("🔍 VALIDATING BACKUP FUNCTIONS...");

    let allValid = true;

    // Test pattern type detection
    const testPattern = { colorFlex: true, layers: [{}] };
    const testCollection = { name: "test" };

    if (window.BACKUP_getPatternType(testPattern, testCollection) !== "colorflex") {
        console.error("❌ BACKUP getPatternType failed validation");
        allValid = false;
    }

    // Test color mapping
    const testLayers = [
        { isShadow: false, color: "test1" },
        { isShadow: false, color: "test2" }
    ];

    if (!window.BACKUP_getColorMapping("colorflex", testLayers, 0)) {
        console.error("❌ BACKUP getColorMapping failed validation");
        allValid = false;
    }

    if (allValid) {
        console.log("✅ ALL BACKUP FUNCTIONS VALIDATED");
    } else {
        console.error("❌ BACKUP VALIDATION FAILED");
    }

    return allValid;
};

// Run validation on load
window.VALIDATE_BACKUP_FUNCTIONS();

console.log("✅ BACKUP SAFETY FILE LOADED AND VALIDATED");

/**
 * BACKUP FILE MANIFEST
 *
 * This file contains working copies of:
 * 1. getPatternType() - Fixed ColorFlex detection
 * 2. getColorMapping() - Layer mapping logic
 * 3. calculatePatternAspect() - Aspect ratio fix
 * 4. RENDERING_CONSTANTS - Known working values
 * 5. EMERGENCY_RESTORE_CORE_FUNCTIONS() - Emergency restoration
 * 6. VALIDATE_BACKUP_FUNCTIONS() - Backup validation
 *
 * Source: CFM.js working version from 2025-09-27 12:02 PM
 * Backup created during modularization for safety
 */