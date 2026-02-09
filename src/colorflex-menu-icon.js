/**
 * ColorFlex Menu Icon - Standalone Script
 * Shows a chameleon icon in site navigation when users have saved patterns
 * This script should be loaded on all Shopify pages (via theme.liquid)
 * 
 * Now uses the Unified Pattern Modal System for consistent experience
 */

(function() {
    'use strict';
    
    console.log('🦎 ColorFlex Menu Icon script loaded');
    console.log('📍 Current page:', window.location.pathname);
    console.log('⏰ DOM ready state:', document.readyState);
    
    function showSavedPatternsModal() {
        // Use the unified modal system if available
        if (window.UnifiedPatternModal && window.UnifiedPatternModal.showSavedPatternsModal) {
            console.log('🎨 Using unified modal system');
            window.UnifiedPatternModal.showSavedPatternsModal();
            return;
        }
        
        // Fallback to simple modal if unified system not loaded
        console.log('⚠️ Unified modal not available, using fallback');
        showFallbackModal();
    }
    
    function showFallbackModal() {
        // Create simple modal as fallback
        const modal = document.createElement('div');
        modal.id = 'colorflexSavedPatternsModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 2rem;
            max-width: 90vw;
            max-height: 90vh;
            overflow-y: auto;
            transform: scale(0.8);
            transition: transform 0.3s ease;
        `;
        
        // Get patterns from localStorage
        const patterns = JSON.parse(localStorage.getItem('colorflexSavedPatterns') || '[]');
        
        modalContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb;">
                <h2 style="margin: 0; font-family: 'Island Moments', cursive; font-size: 2.5rem; color: #d4af37;">My ColorFlex Patterns</h2>
                <button id="closeModal" style="background: none; border: none; font-size: 2rem; cursor: pointer; color: #6b7280; padding: 0.5rem;">&times;</button>
            </div>
            
            <div style="text-align: center; padding: 2rem; color: #6b7280;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🎨</div>
                <h3 style="color: #1f2937; margin-bottom: 1rem;">Rich Pattern Modal Available</h3>
                <p style="margin-bottom: 1.5rem; line-height: 1.6;">
                    For the best experience with detailed pattern information, large thumbnails, color swatches, 
                    layer details, and full functionality including direct purchase options, visit the ColorFlex page.
                </p>
                <a href="/pages/colorflex" style="
                    display: inline-block;
                    background: #d4af37; 
                    color: white; 
                    padding: 1rem 2rem; 
                    border-radius: 8px; 
                    text-decoration: none; 
                    font-size: 1.1rem;
                    font-weight: bold;
                    transition: background 0.2s;
                    box-shadow: 0 4px 6px rgba(212, 175, 55, 0.3);
                " onmouseover="this.style.background='#b8941f'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='#d4af37'; this.style.transform='translateY(0)'">
                    Open ColorFlex (${patterns.length} pattern${patterns.length !== 1 ? 's' : ''})
                </a>
                ${patterns.length > 0 ? `
                    <p style="margin-top: 1rem; font-size: 0.9rem; color: #9ca3af;">
                        You have ${patterns.length} saved pattern${patterns.length !== 1 ? 's' : ''} waiting for you!
                    </p>
                ` : `
                    <p style="margin-top: 1rem; font-size: 0.9rem; color: #9ca3af;">
                        No patterns saved yet - start creating!
                    </p>
                `}
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Animate in
        setTimeout(() => {
            modal.style.opacity = '1';
            modalContent.style.transform = 'scale(1)';
        }, 10);
        
        // Close handlers
        const closeModal = () => {
            modal.style.opacity = '0';
            modalContent.style.transform = 'scale(0.8)';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        };
        
        modal.querySelector('#closeModal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
    
    function updateMenuIcon() {
        console.log('🔄 Updating menu icon...');
        
        // Remove existing icon
        const existingIcon = document.getElementById('colorflexMenuIcon');
        if (existingIcon) {
            existingIcon.remove();
        }
        
        // Get saved patterns
        const savedPatterns = JSON.parse(localStorage.getItem('colorflexSavedPatterns') || '[]');
        console.log('📊 Found', savedPatterns.length, 'saved patterns');
        
        // Only show icon if patterns exist
        if (savedPatterns.length === 0) {
            console.log('👻 No patterns found, hiding menu icon');
            return;
        }
        
        // Find navigation area
        const navSelectors = [
            'nav ul',
            '.header__nav ul', 
            '.site-nav ul',
            '[role="navigation"] ul',
            '.navigation ul',
            '.main-nav ul',
            '.nav ul'
        ];
        
        let nav = null;
        for (const selector of navSelectors) {
            nav = document.querySelector(selector);
            if (nav) {
                console.log('📍 Found navigation with selector:', selector);
                break;
            }
        }
        
        if (!nav) {
            console.log('⚠️ No suitable navigation found, trying body append');
            // Fallback: create floating icon
            createFloatingIcon(savedPatterns.length);
            return;
        }
        
        // Create menu item
        const menuItem = document.createElement('li');
        menuItem.id = 'colorflexMenuIcon';
        menuItem.style.cssText = `
            position: relative;
            display: inline-flex;
            align-items: center;
            margin-left: 1rem;
        `;
        
        // Create icon link
        const iconLink = document.createElement('a');
        iconLink.href = '#';
        iconLink.style.cssText = `
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #d4af37;
            text-decoration: none;
            padding: 0.5rem;
            border-radius: 6px;
            transition: all 0.3s ease;
            font-size: 1.2rem;
            font-weight: bold;
            background: rgba(212, 175, 55, 0.1);
            border: 1px solid rgba(212, 175, 55, 0.3);
        `;
        
        iconLink.innerHTML = `
            <img src="https://so-animation.com/colorflex/img/camelion-sm-black.jpg" style="width: 32px; height: 32px; border-radius: 50%;">
            <span style="
                background: #d4af37;
                color: white;
                border-radius: 50%;
                padding: 0.2rem 0.5rem;
                font-size: 0.8rem;
                min-width: 1.5rem;
                text-align: center;
                font-weight: bold;
            ">${savedPatterns.length}</span>
        `;
        
        iconLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🎨 Opening saved patterns from menu icon');
            showSavedPatternsModal();
        });
        
        iconLink.addEventListener('mouseenter', () => {
            iconLink.style.background = 'rgba(212, 175, 55, 0.2)';
            iconLink.style.transform = 'scale(1.05)';
        });
        
        iconLink.addEventListener('mouseleave', () => {
            iconLink.style.background = 'rgba(212, 175, 55, 0.1)';
            iconLink.style.transform = 'scale(1)';
        });
        
        menuItem.appendChild(iconLink);
        nav.appendChild(menuItem);
        
        console.log('✅ Menu icon created successfully');
    }
    
    function createFloatingIcon(count) {
        const floatingIcon = document.createElement('div');
        floatingIcon.id = 'colorflexMenuIcon';
        floatingIcon.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            background: rgba(212, 175, 55, 0.95);
            color: white;
            padding: 12px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;
        
        floatingIcon.innerHTML = `
            <img src="https://so-animation.com/colorflex/img/camelion-sm-black.jpg" style="width: 32px; height: 32px; border-radius: 50%;">
            <span style="
                background: white;
                color: #d4af37;
                border-radius: 50%;
                padding: 0.2rem 0.5rem;
                font-size: 0.8rem;
                min-width: 1.2rem;
                text-align: center;
                font-weight: bold;
            ">${count}</span>
        `;
        
        floatingIcon.addEventListener('click', () => {
            console.log('🎨 Opening saved patterns from floating icon');
            showSavedPatternsModal();
        });
        
        floatingIcon.addEventListener('mouseenter', () => {
            floatingIcon.style.transform = 'scale(1.1)';
            floatingIcon.style.background = '#b8941f';
        });
        
        floatingIcon.addEventListener('mouseleave', () => {
            floatingIcon.style.transform = 'scale(1)';
            floatingIcon.style.background = 'rgba(212, 175, 55, 0.95)';
        });
        
        document.body.appendChild(floatingIcon);
        console.log('✅ Floating icon created successfully');
    }
    
    // Initialize when DOM is ready
    function init() {
        console.log('🚀 Initializing ColorFlex menu icon...');
        updateMenuIcon();
        
        // Listen for pattern changes
        window.addEventListener('storage', function(e) {
            if (e.key === 'colorflexSavedPatterns') {
                console.log('📱 Patterns updated, refreshing icon');
                updateMenuIcon();
            }
        });
    }
    
    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Make updateMenuIcon available globally
    window.updateMenuIcon = updateMenuIcon;
    
})();