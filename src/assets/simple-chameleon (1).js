/**
 * Simple Chameleon Icon - Basic Version
 * Minimal script to test if script loading works at all
 */

(function() {
    console.log('🦎 Simple chameleon icon loaded!');

    // Don't run on ColorFlex page - let CFM.js handle it there
    const isOnColorFlexPage = window.location.pathname === '/pages/colorflex' ||
                             window.location.pathname.includes('/pages/colorflex');

    if (isOnColorFlexPage) {
        console.log('🦎 On ColorFlex page - letting CFM.js handle chameleon icon');
        return;
    }

// Only show icon if there are saved patterns
const savedPatterns = JSON.parse(localStorage.getItem('colorflexSavedPatterns') || '[]');

if (savedPatterns.length > 0) {
    console.log('🦎 Found', savedPatterns.length, 'saved patterns');

    // Remove any existing icons to prevent conflicts
    const existingSimple = document.getElementById('simpleChameleonIcon');
    const existingComplex = document.getElementById('colorflexMenuIcon');
    if (existingSimple) existingSimple.remove();
    if (existingComplex) existingComplex.remove();

    // Create simple floating icon
    const icon = document.createElement('div');
    icon.id = 'simpleChameleonIcon';
    icon.innerHTML = `🦎<span style="background:red;color:white;font-size:10px;border-radius:10px;padding:2px 4px;position:absolute;top:-5px;right:-5px;">${savedPatterns.length}</span>`;
    icon.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        font-size: 30px;
        cursor: pointer;
        z-index: 9999;
        background: rgba(255,255,255,0.9);
        padding: 10px;
        border-radius: 50%;
        border: 2px solid #d4af37;
    `;

    icon.onclick = function() {
        // Try to use the unified modal - wait for it to load if needed
        function tryShowModal(attempts = 0) {
            if (window.UnifiedPatternModal && window.UnifiedPatternModal.showSavedPatternsModal) {
                console.log('🎨 Using unified modal system');
                window.UnifiedPatternModal.showSavedPatternsModal();
            } else if (attempts < 10) {
                // Wait a bit for unified modal to load
                console.log(`⏳ Waiting for unified modal... attempt ${attempts + 1}`);
                setTimeout(() => tryShowModal(attempts + 1), 100);
            } else {
                // Fallback alert after waiting
                console.log('⚠️ Unified modal not available after waiting, using fallback');
                alert(`Found ${savedPatterns.length} saved patterns!\n\nThis confirms basic script loading works.\n\nPatterns: ${savedPatterns.map(p => p.patternName || 'Unnamed').join(', ')}`);
            }
        }
        tryShowModal();
    };

    document.body.appendChild(icon);
    console.log('🦎 Simple chameleon icon added to page');
} else {
    console.log('🦎 No saved patterns, not showing icon');
}
})(); // End of IIFE