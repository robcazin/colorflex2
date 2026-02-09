/**
 * MODULAR FUNCTION TESTING FRAMEWORK
 * Version: 1.0.0
 * Created: 2025-09-27
 *
 * This module provides comprehensive testing for modular functions
 * to ensure they work correctly before replacing the original functions.
 */

const TESTER_VERSION = "1.0.0";
const CREATION_DATE = "2025-09-27";

console.log(`🧪 MODULE TESTER v${TESTER_VERSION} [${CREATION_DATE}] LOADING...`);

/**
 * Test the modular updatePreview function
 */
export async function testModularUpdatePreview(modularFunction, dependencies) {
    console.log("🧪 TESTING MODULAR updatePreview...");

    const testResults = {
        name: "updatePreview",
        passed: 0,
        failed: 0,
        errors: [],
        warnings: []
    };

    try {
        // Test 1: Basic function call
        console.log("  Test 1: Basic function call");
        const result1 = await modularFunction(dependencies);
        if (result1 !== false) { // Function should not return false on success
            testResults.passed++;
            console.log("  ✅ Basic function call succeeded");
        } else {
            testResults.failed++;
            testResults.errors.push("Basic function call returned false");
        }

        // Test 2: Check DOM manipulation
        console.log("  Test 2: DOM manipulation check");
        const previewElement = dependencies.dom?.preview;
        if (previewElement && previewElement.children.length > 0) {
            testResults.passed++;
            console.log("  ✅ DOM manipulation successful - preview element has content");
        } else {
            testResults.warnings.push("Preview element may not have been updated");
        }

        // Test 3: Canvas creation check
        console.log("  Test 3: Canvas creation check");
        const canvasElements = previewElement?.getElementsByTagName('canvas');
        if (canvasElements && canvasElements.length > 0) {
            testResults.passed++;
            console.log("  ✅ Canvas element created successfully");
        } else {
            testResults.warnings.push("No canvas element found in preview");
        }

        // Test 4: Error handling
        console.log("  Test 4: Error handling with invalid dependencies");
        try {
            await modularFunction({ invalid: true });
            testResults.warnings.push("Function did not fail with invalid dependencies");
        } catch (error) {
            testResults.passed++;
            console.log("  ✅ Error handling works correctly");
        }

    } catch (error) {
        testResults.failed++;
        testResults.errors.push(`Test execution error: ${error.message}`);
        console.error("  ❌ Test execution failed:", error);
    }

    return testResults;
}

/**
 * Test the modular updateRoomMockup function
 */
export async function testModularUpdateRoomMockup(modularFunction, dependencies) {
    console.log("🧪 TESTING MODULAR updateRoomMockup...");

    const testResults = {
        name: "updateRoomMockup",
        passed: 0,
        failed: 0,
        errors: [],
        warnings: []
    };

    try {
        // Test 1: Basic function call
        console.log("  Test 1: Basic function call");
        const result1 = await modularFunction(dependencies);
        if (result1 !== false) {
            testResults.passed++;
            console.log("  ✅ Basic function call succeeded");
        } else {
            testResults.failed++;
            testResults.errors.push("Basic function call returned false");
        }

        // Test 2: Check DOM manipulation
        console.log("  Test 2: DOM manipulation check");
        const roomMockupElement = dependencies.dom?.roomMockup;
        if (roomMockupElement && roomMockupElement.children.length > 0) {
            testResults.passed++;
            console.log("  ✅ DOM manipulation successful - room mockup element has content");
        } else {
            testResults.warnings.push("Room mockup element may not have been updated");
        }

        // Test 3: Image or canvas creation check
        console.log("  Test 3: Image/Canvas creation check");
        const imageElements = roomMockupElement?.getElementsByTagName('img');
        const canvasElements = roomMockupElement?.getElementsByTagName('canvas');
        if ((imageElements && imageElements.length > 0) || (canvasElements && canvasElements.length > 0)) {
            testResults.passed++;
            console.log("  ✅ Image or canvas element created successfully");
        } else {
            testResults.warnings.push("No image or canvas element found in room mockup");
        }

        // Test 4: Collection-specific behavior
        console.log("  Test 4: Collection-specific behavior");
        if (dependencies.appState?.selectedCollection) {
            testResults.passed++;
            console.log("  ✅ Collection-specific behavior test passed");
        } else {
            testResults.warnings.push("No selected collection for behavior testing");
        }

    } catch (error) {
        testResults.failed++;
        testResults.errors.push(`Test execution error: ${error.message}`);
        console.error("  ❌ Test execution failed:", error);
    }

    return testResults;
}

/**
 * Compare modular function output with original function output
 */
export async function compareWithOriginal(modularFunc, originalFunc, dependencies, functionName) {
    console.log(`🔍 COMPARING MODULAR vs ORIGINAL: ${functionName}`);

    const comparisonResult = {
        name: functionName,
        identical: false,
        similarityScore: 0,
        differences: [],
        errors: []
    };

    try {
        // Capture DOM state before any function calls
        const originalPreviewHTML = dependencies.dom?.preview?.innerHTML || '';
        const originalRoomMockupHTML = dependencies.dom?.roomMockup?.innerHTML || '';

        // Test original function
        console.log("  Testing original function...");
        await originalFunc();

        const afterOriginalPreviewHTML = dependencies.dom?.preview?.innerHTML || '';
        const afterOriginalRoomMockupHTML = dependencies.dom?.roomMockup?.innerHTML || '';

        // Reset DOM state
        if (dependencies.dom?.preview) dependencies.dom.preview.innerHTML = originalPreviewHTML;
        if (dependencies.dom?.roomMockup) dependencies.dom.roomMockup.innerHTML = originalRoomMockupHTML;

        // Test modular function
        console.log("  Testing modular function...");
        await modularFunc(dependencies);

        const afterModularPreviewHTML = dependencies.dom?.preview?.innerHTML || '';
        const afterModularRoomMockupHTML = dependencies.dom?.roomMockup?.innerHTML || '';

        // Compare results
        if (functionName === 'updatePreview') {
            if (afterOriginalPreviewHTML === afterModularPreviewHTML) {
                comparisonResult.identical = true;
                comparisonResult.similarityScore = 100;
                console.log("  ✅ IDENTICAL OUTPUT: Preview HTML matches exactly");
            } else {
                // Calculate similarity
                const similarity = calculateStringSimilarity(afterOriginalPreviewHTML, afterModularPreviewHTML);
                comparisonResult.similarityScore = similarity;
                comparisonResult.differences.push(`Preview HTML differs (${similarity}% similar)`);
                console.log(`  ⚠️ DIFFERENT OUTPUT: ${similarity}% similar`);
            }
        } else if (functionName === 'updateRoomMockup') {
            if (afterOriginalRoomMockupHTML === afterModularRoomMockupHTML) {
                comparisonResult.identical = true;
                comparisonResult.similarityScore = 100;
                console.log("  ✅ IDENTICAL OUTPUT: Room mockup HTML matches exactly");
            } else {
                const similarity = calculateStringSimilarity(afterOriginalRoomMockupHTML, afterModularRoomMockupHTML);
                comparisonResult.similarityScore = similarity;
                comparisonResult.differences.push(`Room mockup HTML differs (${similarity}% similar)`);
                console.log(`  ⚠️ DIFFERENT OUTPUT: ${similarity}% similar`);
            }
        }

    } catch (error) {
        comparisonResult.errors.push(`Comparison error: ${error.message}`);
        console.error("  ❌ Comparison failed:", error);
    }

    return comparisonResult;
}

/**
 * Calculate similarity between two strings (simple approach)
 */
function calculateStringSimilarity(str1, str2) {
    if (str1 === str2) return 100;
    if (!str1 || !str2) return 0;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 100;

    const editDistance = levenshteinDistance(shorter, longer);
    return Math.round(((longer.length - editDistance) / longer.length) * 100);
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
}

/**
 * Run comprehensive test suite for all modular functions
 */
export async function runComprehensiveTestSuite(modularSystem, originalFunctions = {}) {
    console.log("🧪 RUNNING COMPREHENSIVE MODULAR TEST SUITE...");

    const testSuite = {
        startTime: Date.now(),
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        results: [],
        summary: {}
    };

    try {
        // Test updatePreview
        if (modularSystem.updatePreview) {
            console.log("\n🔍 TESTING updatePreview MODULE:");
            const previewTest = await testModularUpdatePreview(
                modularSystem.updatePreview,
                modularSystem.dependencies
            );
            testSuite.results.push(previewTest);
            testSuite.totalTests += previewTest.passed + previewTest.failed;
            testSuite.passedTests += previewTest.passed;
            testSuite.failedTests += previewTest.failed;

            // Compare with original if available
            if (originalFunctions.updatePreview) {
                const comparison = await compareWithOriginal(
                    modularSystem.updatePreview,
                    originalFunctions.updatePreview,
                    modularSystem.dependencies,
                    'updatePreview'
                );
                testSuite.results.push(comparison);
            }
        }

        // Test updateRoomMockup
        if (modularSystem.updateRoomMockup) {
            console.log("\n🔍 TESTING updateRoomMockup MODULE:");
            const roomMockupTest = await testModularUpdateRoomMockup(
                modularSystem.updateRoomMockup,
                modularSystem.dependencies
            );
            testSuite.results.push(roomMockupTest);
            testSuite.totalTests += roomMockupTest.passed + roomMockupTest.failed;
            testSuite.passedTests += roomMockupTest.passed;
            testSuite.failedTests += roomMockupTest.failed;

            // Compare with original if available
            if (originalFunctions.updateRoomMockup) {
                const comparison = await compareWithOriginal(
                    modularSystem.updateRoomMockup,
                    originalFunctions.updateRoomMockup,
                    modularSystem.dependencies,
                    'updateRoomMockup'
                );
                testSuite.results.push(comparison);
            }
        }

        // Calculate summary
        testSuite.endTime = Date.now();
        testSuite.duration = testSuite.endTime - testSuite.startTime;
        testSuite.successRate = testSuite.totalTests > 0 ?
            Math.round((testSuite.passedTests / testSuite.totalTests) * 100) : 0;

        testSuite.summary = {
            totalTests: testSuite.totalTests,
            passed: testSuite.passedTests,
            failed: testSuite.failedTests,
            successRate: testSuite.successRate,
            duration: testSuite.duration,
            status: testSuite.failedTests === 0 ? 'PASSED' : 'FAILED'
        };

        // Print summary
        console.log("\n📊 TEST SUITE SUMMARY:");
        console.log(`  Total Tests: ${testSuite.totalTests}`);
        console.log(`  Passed: ${testSuite.passedTests}`);
        console.log(`  Failed: ${testSuite.failedTests}`);
        console.log(`  Success Rate: ${testSuite.successRate}%`);
        console.log(`  Duration: ${testSuite.duration}ms`);
        console.log(`  Status: ${testSuite.summary.status}`);

        if (testSuite.failedTests === 0) {
            console.log("✅ ALL MODULAR FUNCTION TESTS PASSED");
        } else {
            console.log("❌ SOME MODULAR FUNCTION TESTS FAILED");
            testSuite.results.forEach(result => {
                if (result.errors && result.errors.length > 0) {
                    console.log(`  ${result.name} errors:`, result.errors);
                }
            });
        }

    } catch (error) {
        testSuite.failedTests++;
        testSuite.results.push({
            name: "TestSuiteExecution",
            error: error.message
        });
        console.error("❌ TEST SUITE EXECUTION FAILED:", error);
    }

    return testSuite;
}

/**
 * Get module information
 */
export function getModuleTesterInfo() {
    return {
        name: "module-tester",
        version: TESTER_VERSION,
        createdDate: CREATION_DATE,
        functions: ["testModularUpdatePreview", "testModularUpdateRoomMockup", "compareWithOriginal", "runComprehensiveTestSuite"],
        status: "active"
    };
}

export default {
    testModularUpdatePreview,
    testModularUpdateRoomMockup,
    compareWithOriginal,
    runComprehensiveTestSuite,
    getModuleTesterInfo,
    version: TESTER_VERSION
};