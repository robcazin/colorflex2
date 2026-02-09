/**
 * DEPENDENCY MAPPER MODULE
 * Version: 1.0.0
 * Created: 2025-09-27
 *
 * This module maps and validates all dependencies required by protected core functions.
 * It ensures that all necessary functions and objects are available before calling modular functions.
 */

const MAPPER_VERSION = "1.0.0";
const CREATION_DATE = "2025-09-27";

console.log(`🔗 DEPENDENCY MAPPER v${MAPPER_VERSION} [${CREATION_DATE}] LOADING...`);

/**
 * Create dependency injection object for pattern rendering functions
 * This function ensures all dependencies are available and properly mapped
 */
export function createRenderingDependencies(globalScope = window) {
    console.log("🔗 DEPENDENCY MAPPER: Creating rendering dependencies...");

    const dependencies = {};
    const missingDependencies = [];

    // Define all required dependencies with their sources
    const dependencyMap = {
        // DOM Elements
        dom: { source: 'globalScope.dom', required: true },

        // Application State
        appState: { source: 'globalScope.appState', required: true },

        // Core Utility Functions
        lookupColor: { source: 'globalScope.lookupColor', required: true },
        normalizePath: { source: 'globalScope.normalizePath', required: true },
        processImage: { source: 'globalScope.processImage', required: true },
        toInitialCaps: { source: 'globalScope.toInitialCaps', required: true },
        scaleToFit: { source: 'globalScope.scaleToFit', required: true },

        // Pattern-specific Functions
        getLayerMappingForPreview: { source: 'globalScope.getLayerMappingForPreview', required: true },

        // DOM Management Functions
        ensureButtonsAfterUpdate: { source: 'globalScope.ensureButtonsAfterUpdate', required: true },

        // Furniture Rendering
        updateFurniturePreview: { source: 'globalScope.updateFurniturePreview', required: true },

        // Configuration Flags
        USE_GUARD: { source: 'globalScope.USE_GUARD', required: false, default: false },
        DEBUG_TRACE: { source: 'globalScope.DEBUG_TRACE', required: false, default: false }
    };

    // Map each dependency
    Object.keys(dependencyMap).forEach(depName => {
        const config = dependencyMap[depName];
        const sourceValue = eval(config.source);

        if (sourceValue !== undefined) {
            dependencies[depName] = sourceValue;
            console.log(`✅ DEPENDENCY MAPPED: ${depName} from ${config.source}`);
        } else if (config.required) {
            missingDependencies.push(depName);
            console.error(`❌ MISSING REQUIRED DEPENDENCY: ${depName} from ${config.source}`);
        } else {
            // Use default value for optional dependencies
            dependencies[depName] = config.default;
            console.log(`⚠️ OPTIONAL DEPENDENCY MISSING: ${depName}, using default: ${config.default}`);
        }
    });

    // Validate critical dependencies
    const validationResult = validateDependencies(dependencies, missingDependencies);

    if (!validationResult.isValid) {
        console.error("❌ DEPENDENCY VALIDATION FAILED:");
        validationResult.errors.forEach(error => console.error(`  - ${error}`));
        return null;
    }

    console.log("✅ ALL DEPENDENCIES MAPPED AND VALIDATED");
    return dependencies;
}

/**
 * Validate that all required dependencies are present and functional
 */
function validateDependencies(dependencies, missingDependencies) {
    const validationResult = {
        isValid: true,
        errors: []
    };

    // Check for missing required dependencies
    if (missingDependencies.length > 0) {
        validationResult.isValid = false;
        validationResult.errors.push(`Missing required dependencies: ${missingDependencies.join(', ')}`);
    }

    // Check DOM structure
    if (dependencies.dom) {
        const requiredDOMElements = ['preview', 'roomMockup', 'patternName'];
        requiredDOMElements.forEach(elementName => {
            if (!dependencies.dom[elementName]) {
                validationResult.isValid = false;
                validationResult.errors.push(`Missing DOM element: dom.${elementName}`);
            }
        });
    }

    // Check appState structure
    if (dependencies.appState) {
        const requiredStateProps = ['currentPattern', 'selectedCollection', 'currentLayers'];
        requiredStateProps.forEach(propName => {
            if (dependencies.appState[propName] === undefined) {
                validationResult.isValid = false;
                validationResult.errors.push(`Missing appState property: appState.${propName}`);
            }
        });
    }

    // Check function types
    const functionDeps = ['lookupColor', 'normalizePath', 'processImage', 'toInitialCaps', 'scaleToFit', 'getLayerMappingForPreview', 'ensureButtonsAfterUpdate', 'updateFurniturePreview'];
    functionDeps.forEach(funcName => {
        if (dependencies[funcName] && typeof dependencies[funcName] !== 'function') {
            validationResult.isValid = false;
            validationResult.errors.push(`Dependency ${funcName} is not a function (type: ${typeof dependencies[funcName]})`);
        }
    });

    return validationResult;
}

/**
 * Create a safe dependency injection wrapper
 * This ensures that if any dependency becomes unavailable, the function fails gracefully
 */
export function createSafeDependencyWrapper(dependencies) {
    return new Proxy(dependencies, {
        get(target, prop) {
            if (prop in target) {
                return target[prop];
            } else {
                console.error(`🔗 DEPENDENCY ERROR: Attempted to access missing dependency: ${prop}`);
                throw new Error(`Missing dependency: ${prop}`);
            }
        }
    });
}

/**
 * Test all dependencies to ensure they work correctly
 */
export function testDependencies(dependencies) {
    console.log("🧪 TESTING ALL DEPENDENCIES...");

    const testResults = {
        passed: 0,
        failed: 0,
        errors: []
    };

    try {
        // Test lookupColor
        if (dependencies.lookupColor) {
            const testColor = dependencies.lookupColor("Snowbound");
            if (testColor && typeof testColor === 'string' && testColor.startsWith('#')) {
                testResults.passed++;
                console.log("✅ lookupColor test passed");
            } else {
                testResults.failed++;
                testResults.errors.push("lookupColor did not return valid hex color");
            }
        }

        // Test normalizePath
        if (dependencies.normalizePath) {
            const testPath = dependencies.normalizePath("./data/test.jpg");
            if (testPath && typeof testPath === 'string') {
                testResults.passed++;
                console.log("✅ normalizePath test passed");
            } else {
                testResults.failed++;
                testResults.errors.push("normalizePath did not return valid string");
            }
        }

        // Test toInitialCaps
        if (dependencies.toInitialCaps) {
            const testCaps = dependencies.toInitialCaps("test pattern");
            if (testCaps === "Test Pattern") {
                testResults.passed++;
                console.log("✅ toInitialCaps test passed");
            } else {
                testResults.failed++;
                testResults.errors.push("toInitialCaps did not format correctly");
            }
        }

        // Test DOM elements exist
        if (dependencies.dom) {
            const requiredElements = ['preview', 'roomMockup'];
            requiredElements.forEach(elementName => {
                if (dependencies.dom[elementName]) {
                    testResults.passed++;
                    console.log(`✅ DOM element ${elementName} test passed`);
                } else {
                    testResults.failed++;
                    testResults.errors.push(`DOM element ${elementName} missing`);
                }
            });
        }

        // Test appState structure
        if (dependencies.appState) {
            const requiredProps = ['currentPattern', 'selectedCollection'];
            requiredProps.forEach(propName => {
                if (dependencies.appState[propName] !== undefined) {
                    testResults.passed++;
                    console.log(`✅ appState.${propName} test passed`);
                } else {
                    testResults.failed++;
                    testResults.errors.push(`appState.${propName} missing`);
                }
            });
        }

    } catch (error) {
        testResults.failed++;
        testResults.errors.push(`Dependency test error: ${error.message}`);
    }

    console.log(`🧪 DEPENDENCY TESTS COMPLETE: ${testResults.passed} passed, ${testResults.failed} failed`);

    if (testResults.failed > 0) {
        console.error("❌ DEPENDENCY TEST FAILURES:");
        testResults.errors.forEach(error => console.error(`  - ${error}`));
        return false;
    }

    console.log("✅ ALL DEPENDENCY TESTS PASSED");
    return true;
}

/**
 * Get detailed information about dependency mapping
 */
export function getDependencyMapperInfo() {
    return {
        name: "dependency-mapper",
        version: MAPPER_VERSION,
        createdDate: CREATION_DATE,
        functions: ["createRenderingDependencies", "validateDependencies", "createSafeDependencyWrapper", "testDependencies"],
        status: "active"
    };
}

export default {
    createRenderingDependencies,
    createSafeDependencyWrapper,
    testDependencies,
    getDependencyMapperInfo,
    version: MAPPER_VERSION
};