// Minimal chameleon icon fix - works everywhere including ColorFlex page
console.log('🦎 Test chameleon fix loading...');

function createTestChameleonIcon() {
    console.log('🦎 createTestChameleonIcon() called');

    // Remove any existing icons first
    const existing = document.getElementById('testChameleonIcon');
    if (existing) existing.remove();

    // Check for saved patterns
    const patterns = JSON.parse(localStorage.getItem('colorflexSavedPatterns') || '[]');
    console.log('🦎 Found patterns:', patterns.length);

    if (patterns.length > 0) {
        console.log('🦎 Creating test chameleon icon');

        const icon = document.createElement('div');
        icon.id = 'testChameleonIcon';
        icon.innerHTML = `🦎 ${patterns.length}`;
        icon.style.cssText = `
            position: fixed !important;
            top: 80px !important;
            right: 20px !important;
            background: rgba(255, 0, 0, 0.8) !important;
            color: white !important;
            padding: 10px !important;
            border-radius: 50% !important;
            z-index: 99999 !important;
            font-size: 16px !important;
            cursor: pointer !important;
            border: 2px solid white !important;
        `;

        icon.onclick = function() {
            alert(`Test chameleon icon clicked! Found ${patterns.length} saved patterns.`);
        };

        document.body.appendChild(icon);
        console.log('🦎 Test chameleon icon added to body');
        return true;
    } else {
        console.log('🦎 No saved patterns, not creating icon');
        return false;
    }
}

// Try multiple times to ensure it works
setTimeout(createTestChameleonIcon, 100);
setTimeout(createTestChameleonIcon, 1000);
setTimeout(createTestChameleonIcon, 3000);

// Also expose globally for manual testing
window.createTestChameleonIcon = createTestChameleonIcon;

console.log('🦎 Test chameleon fix loaded - try calling window.createTestChameleonIcon() in console');