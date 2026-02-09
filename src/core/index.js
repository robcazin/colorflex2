/**
 * PROTECTED CORE MODULES INDEX
 * Version: 1.0.0
 * Created: 2025-09-27
 *
 * This is the main entry point for protected core functions.
 * All core functions are exported through this module with version tracking.
 *
 * CRITICAL: If any module fails to load, fallback to backup functions.
 */

const CORE_VERSION = "1.0.0";
const CORE_CREATION_DATE = "2025-09-27";

console.log(`🔒 CORE MODULES v${CORE_VERSION} [${CORE_CREATION_DATE}] LOADING...`);

// Import protected modules
import * as PatternRendering from './pattern-rendering.js';
import * as PatternSelection from './pattern-selection.js';
import * as DependencyMapper from './dependency-mapper.js';

/**
 * Core module registry with version tracking
 */
const CORE_MODULES = {
    patternRendering: PatternRendering,
    patternSelection: PatternSelection,
    dependencyMapper: DependencyMapper
};

/**
 * Get information about all core modules
 */
export function getCoreModulesInfo() {
    const moduleInfo = {};

    try {
        Object.keys(CORE_MODULES).forEach(moduleName => {
            const module = CORE_MODULES[moduleName];
            if (module.getModuleInfo) {
                moduleInfo[moduleName] = module.getModuleInfo();
            }
        });
    } catch (error) {
        console.error("🔒 CORE: Error getting module info:", error);
    }

    return {
        coreVersion: CORE_VERSION,
        createdDate: CORE_CREATION_DATE,
        modules: moduleInfo
    };
}

/**
 * Validate that all core modules are loaded correctly
 */
export function validateCoreModules() {
    console.log("🔒 CORE: Validating module integrity...");

    const requiredFunctions = {
        patternRendering: ['updatePreview', 'updateRoomMockup'],
        patternSelection: ['getPatternType', 'handlePatternSelection', 'getColorMapping'],
        dependencyMapper: ['createRenderingDependencies', 'testDependencies']
    };

    let allValid = true;

    Object.keys(requiredFunctions).forEach(moduleName => {
        const module = CORE_MODULES[moduleName];
        const requiredFuncs = requiredFunctions[moduleName];

        requiredFuncs.forEach(funcName => {
            if (!module[funcName] || typeof module[funcName] !== 'function') {
                console.error(`🔒 CORE VALIDATION FAILED: ${moduleName}.${funcName} missing or invalid`);
                allValid = false;
            }
        });
    });

    if (allValid) {
        console.log("✅ CORE: All modules validated successfully");
    } else {
        console.error("❌ CORE: Module validation failed - fallback may be required");
    }

    return allValid;
}

// Export all protected functions
export const {
    updatePreview,
    updateRoomMockup
} = PatternRendering;

export const {
    getPatternType,
    handlePatternSelection,
    getColorMapping
} = PatternSelection;

export const {
    createRenderingDependencies,
    testDependencies
} = DependencyMapper;

// Validate modules on import
validateCoreModules();

console.log(`✅ CORE MODULES v${CORE_VERSION} LOADED SUCCESSFULLY`);

/**
 * Initialize and test the modular system with dependency injection
 */
export function initializeModularSystem() {
    console.log("🚀 INITIALIZING MODULAR CORE SYSTEM...");

    // Create dependencies
    const dependencies = createRenderingDependencies();

    if (!dependencies) {
        console.error("❌ MODULAR SYSTEM INITIALIZATION FAILED: Dependencies unavailable");
        return { success: false, error: "Dependencies unavailable" };
    }

    // Test dependencies
    const testResult = testDependencies(dependencies);

    if (!testResult) {
        console.error("❌ MODULAR SYSTEM INITIALIZATION FAILED: Dependency tests failed");
        return { success: false, error: "Dependency tests failed" };
    }

    console.log("✅ MODULAR CORE SYSTEM INITIALIZED SUCCESSFULLY");
    return {
        success: true,
        dependencies,
        updatePreview: (deps = dependencies) => PatternRendering.updatePreview(deps),
        updateRoomMockup: (deps = dependencies) => PatternRendering.updateRoomMockup(deps)
    };
}

export default {
    // Pattern Rendering
    updatePreview,
    updateRoomMockup,

    // Pattern Selection
    getPatternType,
    handlePatternSelection,
    getColorMapping,

    // Dependency Management
    createRenderingDependencies,
    testDependencies,

    // Module Management
    getCoreModulesInfo,
    validateCoreModules,
    initializeModularSystem,

    version: CORE_VERSION
};