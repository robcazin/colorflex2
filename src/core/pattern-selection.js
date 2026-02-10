/**
 * PROTECTED PATTERN SELECTION MODULE
 * Version: 1.0.0
 * Created: 2025-09-27
 *
 * This module contains critical pattern selection and type detection functions.
 * DO NOT MODIFY without proper testing and backup.
 *
 * BREAKING CHANGES HISTORY:
 * - 2025-09-27: Fixed getPatternType to properly detect ColorFlex patterns
 * - 2025-09-27: Added validation for pattern selection inputs
 */

const MODULE_VERSION = "1.0.0";
const CREATION_DATE = "2025-09-27";

/**
 * Protected pattern type detection
 * CRITICAL: This function determines rendering path
 */
export function getPatternType(pattern, collection) {
    console.log(`🔒 PROTECTED getPatternType v${MODULE_VERSION} [${CREATION_DATE}]`);

    // Input validation
    if (!pattern) {
        console.error("🔒 VALIDATION: Missing pattern object");
        return "standard"; // Safe fallback
    }

    // Protected logic - DO NOT CHANGE ORDER
    if (collection?.name === "wall-panels") {
        console.log("🔒 PROTECTED: Detected wall-panel pattern");
        return "wall-panel";
    }

    if (pattern?.tintWhite) {
        console.log("🔒 PROTECTED: Detected tint-white pattern");
        return "tint-white";
    }

    if (collection?.elements?.length) {
        console.log("🔒 PROTECTED: Detected element-coloring pattern");
        return "element-coloring";
    }

    // 🔧 CRITICAL: Only treat as ColorFlex when explicitly flagged (colorFlex === true).
    // Patterns with layers but no flag (e.g. Farmhouse "Folkart Floral On Black") are standard
    // and must not go through color compositing.
    if (pattern?.colorFlex === true && pattern?.layers && pattern.layers.length > 0) {
        console.log("🔒 PROTECTED: Detected colorflex pattern (explicit colorFlex: true)");
        return "colorflex";
    }

    console.log("🔒 PROTECTED: Defaulting to standard pattern");
    return "standard";
}

/**
 * Protected pattern selection handler
 */
export function handlePatternSelection(patternName, selectedCollection, preserveColors = false) {
    console.log(`🔒 PROTECTED handlePatternSelection v${MODULE_VERSION} [${CREATION_DATE}]`);
    console.log(`🔒 Pattern requested: ${patternName}`);

    // Input validation
    if (!patternName || typeof patternName !== 'string') {
        console.error("🔒 VALIDATION: Invalid pattern name");
        return null;
    }

    if (!selectedCollection || !selectedCollection.patterns) {
        console.error("🔒 VALIDATION: Invalid selected collection");
        return null;
    }

    try {
        // Find pattern with case-insensitive matching
        const pattern = selectedCollection.patterns.find(
            p => p && p.name && p.name.toUpperCase() === patternName.toUpperCase()
        );

        if (!pattern) {
            console.warn(`🔒 PROTECTED: Pattern ${patternName} not found in collection ${selectedCollection.name}`);
            return selectedCollection.patterns[0] || null; // Safe fallback
        }

        console.log(`🔒 PROTECTED: Pattern found: ${pattern.name}`);
        return pattern;

    } catch (error) {
        console.error("🔒 PROTECTED handlePatternSelection error:", error);
        return null;
    }
}

/**
 * Protected color mapping for different pattern types
 */
export function getColorMapping(patternType, currentLayers, layerIndex) {
    console.log(`🔒 PROTECTED getColorMapping v${MODULE_VERSION} for type: ${patternType}`);

    // Input validation
    if (!currentLayers || !Array.isArray(currentLayers)) {
        console.error("🔒 VALIDATION: Invalid currentLayers array");
        return null;
    }

    if (typeof layerIndex !== 'number' || layerIndex < 0) {
        console.error("🔒 VALIDATION: Invalid layer index");
        return null;
    }

    try {
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
                console.warn(`🔒 PROTECTED: Unknown pattern type ${patternType}, using default mapping`);
                return currentLayers[layerIndex + 1];
        }
    } catch (error) {
        console.error("🔒 PROTECTED getColorMapping error:", error);
        return null;
    }
}

/**
 * Get module information
 */
export function getModuleInfo() {
    return {
        name: "pattern-selection",
        version: MODULE_VERSION,
        createdDate: CREATION_DATE,
        functions: ["getPatternType", "handlePatternSelection", "getColorMapping"],
        status: "protected"
    };
}

export default {
    getPatternType,
    handlePatternSelection,
    getColorMapping,
    getModuleInfo,
    version: MODULE_VERSION
};