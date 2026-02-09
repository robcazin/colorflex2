/**
 * DEBUG: Simple Chameleon Icon - Independent Version
 * This version works without dependencies to help diagnose script loading issues
 */

(function() {
    'use strict';

    console.log('🔧 DEBUG: Simple chameleon icon loaded');
    console.log('🔧 DEBUG: Current page:', window.location.pathname);
    console.log('🔧 DEBUG: UnifiedPatternModal available:', !!window.UnifiedPatternModal);

    function updateMenuIcon() {
        console.log('🔧 DEBUG: Updating menu icon...');

        // Remove existing icon
        const existingIcon = document.getElementById('debugColorflexMenuIcon');
        if (existingIcon) {
            existingIcon.remove();
        }

        // Get saved patterns
        const savedPatterns = JSON.parse(localStorage.getItem('colorflexSavedPatterns') || '[]');
        console.log('🔧 DEBUG: Found', savedPatterns.length, 'saved patterns');

        // Only show icon if patterns exist
        if (savedPatterns.length === 0) {
            console.log('🔧 DEBUG: No patterns found, hiding menu icon');
            return;
        }

        // Find header or navigation area
        const nav = document.querySelector('nav') ||
                   document.querySelector('header') ||
                   document.querySelector('.header') ||
                   document.querySelector('#header') ||
                   document.body;

        if (!nav) {
            console.log('🔧 DEBUG: No navigation area found');
            return;
        }

        // Create simple chameleon icon
        const menuIcon = document.createElement('div');
        menuIcon.id = 'debugColorflexMenuIcon';
        menuIcon.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: #d4af37;
            border-radius: 50%;
            cursor: pointer;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            border: 2px solid white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;

        menuIcon.innerHTML = `🦎<span style="font-size: 12px; background: red; color: white; border-radius: 10px; position: absolute; top: -5px; right: -5px; padding: 2px 6px;">${savedPatterns.length}</span>`;

        menuIcon.addEventListener('click', function() {
            console.log('🔧 DEBUG: Icon clicked - showing simple alert');
            alert(`DEBUG: Found ${savedPatterns.length} saved patterns!\n\nThis confirms the icon system is working.\n\nPatterns: ${savedPatterns.map(p => p.patternName).join(', ')}`);
        });

        nav.appendChild(menuIcon);
        console.log('🔧 DEBUG: Icon added to page');
    }

    // Initialize when DOM is ready
    function init() {
        console.log('🔧 DEBUG: Initializing debug menu icon...');
        updateMenuIcon();
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();