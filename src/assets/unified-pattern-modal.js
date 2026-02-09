/**
 * Unified Pattern Modal System
 *
 * Rich modal functionality extracted from CFM.js and made available globally
 * for consistent pattern display across ColorFlex and non-ColorFlex pages.
 *
 * Features:
 * - Rich visual design with dark theme
 * - Detailed metadata (save date, layer count, pattern ID)
 * - Full layer details with color codes
 * - Large thumbnail preview with error handling
 * - Three-button actions: Load, Delete, Buy it!
 * - Import/Export All: Import single patterns or export all designs to JSON
 */

(function() {
    'use strict';
    
    console.log('🎨 Unified Pattern Modal System loaded');

    // Ensure required fonts are loaded globally
    function loadRequiredFonts() {
        // Check if fonts are already loaded
        const existingIslandMoments = document.querySelector('link[href*="Island+Moments"]');
        const existingSpecialElite = document.querySelector('link[href*="Special+Elite"]');

        if (!existingIslandMoments) {
            const islandMomentsLink = document.createElement('link');
            islandMomentsLink.href = 'https://fonts.googleapis.com/css2?family=Island+Moments:wght@400&display=swap';
            islandMomentsLink.rel = 'stylesheet';
            document.head.appendChild(islandMomentsLink);
            console.log('📝 Loaded Island Moments font');
        }

        if (!existingSpecialElite) {
            const specialEliteLink = document.createElement('link');
            specialEliteLink.href = 'https://fonts.googleapis.com/css2?family=Special+Elite&display=swap';
            specialEliteLink.rel = 'stylesheet';
            document.head.appendChild(specialEliteLink);
            console.log('📝 Loaded Special Elite font');
        }
    }

    // Load fonts immediately
    loadRequiredFonts();

    // Color lookup function for modal - uses main lookupColor if available
    function lookupColorForModal(colorName) {
        if (!colorName) return '#e2e8f0';

        // 🎯 FIX: Try to use the main lookupColor function from CFM.js first
        if (typeof window.lookupColor === 'function') {
            const mainColorResult = window.lookupColor(colorName);
            if (mainColorResult && mainColorResult !== '#FFFFFF') {
                return mainColorResult;
            }
        }

        // Fallback: Clean the color name and use basic color map
        let cleanName = colorName.replace(/^(SW|SC)\d+\s*/i, '').trim().toLowerCase();
        cleanName = cleanName.split(/\s+(tint|shade|deep|light|dark)\s*/)[0];

        // Basic color mapping as fallback
        const colorMap = {
            'snowbound': '#f7f7f5',
            'quietude': '#8f9779',
            'naval': '#2c4251',
            'grizzle gray': '#7d8471',
            'grizzle grey': '#7d8471',
            'cityscape': '#535353',
            'tin lizzie': '#1b1b1b',
            'sawdust': '#deb887',
            'ecru': '#c2b280',
            'cottage linen': '#f4f1e8',
            'mediterranean': '#006a6b',
            'shamrock': '#009639',
            'easy green': '#7cb342',
            'topiary': '#4a6741',
            'greenery': '#88b04b',
            'jay blue': '#4682b4',
            'blue plate': '#1e3a8a',
            'major blue': '#1d4ed8',
            'flyway': '#0ea5e9',
            'sky fall': '#7dd3fc',
            'bluebell': '#6366f1',
            'minor blue': '#3b82f6',
            'cottage coal': '#2d3748',
            'concord grape': '#663399',
            'plummy': '#8B4B8C',
            'wood violet': '#8B5A96',
            'berry cream': '#DDA0DD',
            'obi lilac': '#B19CD9',
            'enchant': '#C8A2C8',
            'lite lavender': '#E6E6FA',
            'bracing blue': '#4682b4',
            'sleepy hollow': '#7cb342',
            'peristyle brass': '#b8860b',
            'underseas': '#4682b4',
            'iron ore': '#535353',
            'roycroft pewter': '#666666',
            'morris room grey': '#8a8a8a',
            'distance': '#c7c7c7'
        };

        return colorMap[cleanName] || '#e2e8f0';
    }
    
    // Make functions available globally
    window.UnifiedPatternModal = {
        showSavedPatternsModal: showSavedPatternsModal,
        createSavedPatternsModal: createSavedPatternsModal,
        createSavedPatternItem: createSavedPatternItem
    };

    console.log('🎨 UnifiedPatternModal exported to window:', !!window.UnifiedPatternModal);
    
    /**
     * Show saved patterns modal - main entry point
     */
    function showSavedPatternsModal() {
        try {
            console.log('🔍 Loading saved patterns...');
            
            // Get saved patterns from localStorage
            var savedPatterns = JSON.parse(localStorage.getItem('colorflexSavedPatterns') || '[]');
            console.log('📱 Loaded patterns from localStorage:', savedPatterns.length);
            
            createSavedPatternsModal(savedPatterns);
            
        } catch (error) {
            console.error('❌ Error loading saved patterns:', error);
            showNotification('❌ Failed to load saved patterns', 'error');
        }
    }
    
    /**
     * Create the main saved patterns modal
     */
    function createSavedPatternsModal(patterns) {
        // Remove existing modal
        var existingModal = document.getElementById('unifiedSavedPatternsModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal overlay
        var modal = document.createElement('div');
        modal.id = 'unifiedSavedPatternsModal';
        modal.isPinned = false; // Track pin state
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.4);
            z-index: 10000;
            transition: background 0.3s ease;
        `;
        
        // Create modal content - positioned on right side, draggable
        var modalContent = document.createElement('div');
        modalContent.id = 'draggableModalContent';
        modalContent.style.cssText = `
            background: #1a202c;
            color: white;
            padding: 0;
            border-radius: 10px;
            width: 400px;
            max-height: 80vh;
            font-family: 'Special Elite', monospace;
            border: 2px solid #4a5568;
            position: absolute;
            right: 20px;
            top: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            display: flex;
            flex-direction: column;
        `;
        
        // Modal header - draggable area (vertical layout with centered title)
        var header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px 20px 15px 20px;
            border-bottom: 1px solid #d4af37;
            cursor: move;
            user-select: none;
            flex-shrink: 0;
            gap: 12px;
        `;

        // Title container - centered
        var titleContainer = document.createElement('div');
        titleContainer.style.cssText = 'text-align: center; width: 100%;';

        var title = document.createElement('h2');
        const isOnColorFlexPage = window.location.pathname === '/pages/colorflex' ||
                                window.location.pathname.includes('/pages/colorflex');

        // Simple title without persistent mode text
        title.textContent = '📂 My Designs (' + patterns.length + ')';

        title.style.margin = '0';
        title.style.color = '#efeeeaff';
        title.style.fontFamily = "'Island Moments', italic";

        // Simple title container
        titleContainer.appendChild(title);

        // Create button container for import, export all, refresh, pin and close buttons
        var buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display: flex; gap: 8px; align-items: center; justify-content: center;';

        // Import button
        var importBtn = document.createElement('button');
        importBtn.innerHTML = '📥 Import';
        importBtn.title = 'Import a pattern file';
        importBtn.style.cssText = `
            background: transparent;
            border: 1px solid #4299e1;
            color: #4299e1;
            font-size: 12px;
            cursor: pointer;
            padding: 6px 12px;
            border-radius: 4px;
            transition: all 0.3s ease;
            font-family: 'Special Elite', monospace;
            font-weight: bold;
        `;
        importBtn.addEventListener('mouseenter', function() {
            importBtn.style.background = '#4299e1';
            importBtn.style.color = 'white';
        });
        importBtn.addEventListener('mouseleave', function() {
            importBtn.style.background = 'transparent';
            importBtn.style.color = '#4299e1';
        });
        importBtn.addEventListener('click', function() {
            if (window.importPattern && typeof window.importPattern === 'function') {
                window.importPattern();
            } else {
                console.error('❌ importPattern function not available');
                showNotification('❌ Import function not available', 'error');
            }
        });

        // Export All button
        var exportAllBtn = document.createElement('button');
        exportAllBtn.innerHTML = '📤 Export All';
        exportAllBtn.title = 'Export all saved patterns to JSON file';
        exportAllBtn.style.cssText = `
            background: transparent;
            border: 1px solid #d4af37;
            color: #d4af37;
            font-size: 12px;
            cursor: pointer;
            padding: 6px 12px;
            border-radius: 4px;
            transition: all 0.3s ease;
            font-family: 'Special Elite', monospace;
            font-weight: bold;
        `;
        exportAllBtn.addEventListener('mouseenter', function() {
            exportAllBtn.style.background = '#d4af37';
            exportAllBtn.style.color = '#1a202c';
        });
        exportAllBtn.addEventListener('mouseleave', function() {
            exportAllBtn.style.background = 'transparent';
            exportAllBtn.style.color = '#d4af37';
        });
        exportAllBtn.addEventListener('click', function() {
            try {
                // Get all saved patterns from localStorage
                var savedPatternsJSON = localStorage.getItem('colorflexSavedPatterns');

                if (!savedPatternsJSON) {
                    console.log('⚠️ No saved patterns to export');
                    if (window.showNotification && typeof window.showNotification === 'function') {
                        window.showNotification('⚠️ No saved patterns to export', 'warning');
                    } else {
                        alert('No saved patterns to export');
                    }
                    return;
                }

                var savedPatterns = JSON.parse(savedPatternsJSON);

                if (!Array.isArray(savedPatterns) || savedPatterns.length === 0) {
                    console.log('⚠️ No saved patterns to export');
                    if (window.showNotification && typeof window.showNotification === 'function') {
                        window.showNotification('⚠️ No saved patterns to export', 'warning');
                    } else {
                        alert('No saved patterns to export');
                    }
                    return;
                }

                // Create export data with metadata
                var exportData = {
                    exportDate: new Date().toISOString(),
                    exportSource: 'ColorFlex My Designs',
                    patternCount: savedPatterns.length,
                    patterns: savedPatterns
                };

                // Create JSON blob
                var jsonStr = JSON.stringify(exportData, null, 2);
                var blob = new Blob([jsonStr], { type: 'application/json' });

                // Create download link
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;

                // Generate filename with timestamp
                var timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
                a.download = 'colorflex-all-designs-' + timestamp + '.json';

                // Trigger download
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                console.log('✅ Exported ' + savedPatterns.length + ' patterns');
                if (window.showNotification && typeof window.showNotification === 'function') {
                    window.showNotification('✅ Exported ' + savedPatterns.length + ' patterns', 'success');
                } else {
                    alert('Exported ' + savedPatterns.length + ' patterns successfully!');
                }

            } catch (error) {
                console.error('❌ Export failed:', error);
                if (window.showNotification && typeof window.showNotification === 'function') {
                    window.showNotification('❌ Export failed: ' + error.message, 'error');
                } else {
                    alert('Export failed: ' + error.message);
                }
            }
        });

        // Refresh button - for updating the modal when patterns change
        var refreshBtn = document.createElement('button');
        refreshBtn.innerHTML = '🔄'; // Refresh icon
        refreshBtn.title = 'Refresh saved patterns list';
        refreshBtn.style.cssText = `
            background: transparent;
            border: 1px solid #4299e1;
            color: #4299e1;
            font-size: 16px;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            transition: all 0.3s ease;
        `;

        refreshBtn.addEventListener('mouseenter', function() {
            refreshBtn.style.background = 'rgba(66, 153, 225, 0.2)';
        });

        refreshBtn.addEventListener('mouseleave', function() {
            refreshBtn.style.background = 'transparent';
        });

        // Pin/Lock button
        var pinBtn = document.createElement('button');
        pinBtn.innerHTML = '📍'; // Pin icon
        pinBtn.title = 'Pin modal (stay open while working)';
        pinBtn.style.cssText = `
            background: transparent;
            border: 1px solid #d4af37;
            color: #d4af37;
            font-size: 16px;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            transition: all 0.3s ease;
        `;

        var closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `
            background: transparent;
            border: 1px solid #4a5568;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: #f56565;
        `;
        // 🆕 PERSISTENT MODAL: Only allow closing on non-ColorFlex pages
        closeBtn.addEventListener('click', function() {
            // X button always closes modal immediately on all pages
            modal.remove();
        });

        // Pin button functionality
        function togglePin() {
            modal.isPinned = !modal.isPinned;
            if (modal.isPinned) {
                // Pinned state: NO background overlay - full interaction with UI
                pinBtn.innerHTML = '🔒'; // Lock icon when pinned
                pinBtn.title = 'Unpin modal (close when clicking outside)';
                pinBtn.style.color = '#f56565';
                pinBtn.style.borderColor = '#f56565';
                modal.style.background = 'none'; // NO background - allows all interactions
                modal.style.pointerEvents = 'none'; // Modal overlay doesn't block clicks
                modalContent.style.pointerEvents = 'auto'; // But modal content still works
                console.log('📍 Modal pinned - full UI interaction enabled');
            } else {
                // Unpinned state: darker background, can close on backdrop click
                pinBtn.innerHTML = '📍'; // Pin icon when unpinned
                pinBtn.title = 'Pin modal (stay open while working)';
                pinBtn.style.color = '#d4af37';
                pinBtn.style.borderColor = '#d4af37';
                modal.style.background = 'rgba(0,0,0,0.4)'; // Darker background
                modal.style.pointerEvents = 'auto'; // Restore normal click behavior
                modalContent.style.pointerEvents = 'auto'; // Ensure modal content works
                console.log('📌 Modal unpinned - can close on backdrop click');
            }
        }

        pinBtn.addEventListener('click', togglePin);

        // Refresh button functionality
        refreshBtn.addEventListener('click', function() {
            console.log('🔄 Refreshing saved patterns modal...');

            // Add visual feedback
            var originalIcon = refreshBtn.innerHTML;
            refreshBtn.innerHTML = '⏳';
            refreshBtn.style.transform = 'rotate(360deg)';

            // Get the current modal position to preserve it
            var currentStyle = modalContent.style.cssText;
            var currentPinState = modal.isPinned;

            // Close current modal and reopen refreshed one
            setTimeout(function() {
                modal.remove();

                // Reopen modal with fresh data
                setTimeout(function() {
                    showSavedPatternsModal();

                    // If it was pinned, make the new modal pinned too
                    if (currentPinState) {
                        setTimeout(function() {
                            var newModal = document.getElementById('unifiedSavedPatternsModal');
                            if (newModal) {
                                var newPinBtn = newModal.querySelector('button[title*="Pin modal"]');
                                if (newPinBtn) {
                                    newPinBtn.click(); // Toggle to pinned state
                                }
                            }
                        }, 100);
                    }
                }, 100);
            }, 300); // Brief delay to show the loading state
        });

        // Add buttons to container
        buttonContainer.appendChild(importBtn);
        buttonContainer.appendChild(exportAllBtn);
        buttonContainer.appendChild(refreshBtn);
        buttonContainer.appendChild(pinBtn);
        buttonContainer.appendChild(closeBtn);

        header.appendChild(titleContainer);
        header.appendChild(buttonContainer);
        modalContent.appendChild(header);

        // Create scrollable patterns container
        var patternsContainer = document.createElement('div');
        patternsContainer.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            max-height: calc(80vh - 100px);
        `;

        // Patterns list
        if (patterns.length === 0) {
            var emptyMessage = document.createElement('div');
            emptyMessage.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #a0aec0;">
                    <div style="font-size: 48px; margin-bottom: 20px;">
                    <img src="https://so-animation.com/colorflex/img/camelion-sm-r.jpg" style="width: 100px; height: 100px; border-radius: 50%; margin-bottom: 20px;">
                    <h3>No saved patterns yet</h3>
                    <div style="font-size: 24px; margin-bottom: 20px;">
                    <p>Start customizing patterns and save your favorites!</p>
                    </div>
                </div>
            `;
            patternsContainer.appendChild(emptyMessage);
        } else {
            for (var i = 0; i < patterns.length; i++) {
                var patternDiv = createSavedPatternItem(patterns[i], i);
                patternsContainer.appendChild(patternDiv);
            }
        }

        // Add scrollable patterns container to modal
        modalContent.appendChild(patternsContainer);
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Make modal draggable by the header
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };

        header.addEventListener('mousedown', function(e) {
            // Don't drag when clicking any buttons
            if (e.target === importBtn || e.target === exportAllBtn ||
                e.target === refreshBtn || e.target === pinBtn || e.target === closeBtn) {
                return;
            }
            isDragging = true;
            const rect = modalContent.getBoundingClientRect();
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;
            modalContent.style.cursor = 'grabbing';
            e.preventDefault();
        });

        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            const newX = e.clientX - dragOffset.x;
            const newY = e.clientY - dragOffset.y;

            // Keep modal within viewport bounds
            const maxX = window.innerWidth - modalContent.offsetWidth;
            const maxY = window.innerHeight - modalContent.offsetHeight;

            modalContent.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
            modalContent.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';
            modalContent.style.right = 'auto'; // Override right positioning when dragging
        });

        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                modalContent.style.cursor = 'move';
            }
        });

        // 🆕 PINNED MODAL: Smart overlay click behavior - respect pin state
        modal.addEventListener('click', function(e) {
            if (e.target === modal && !modal.isPinned) {
                // Consistent close behavior on all pages - click outside to close
                modal.remove();
                console.log('🔒 Modal closed by clicking outside (not pinned)');
            }
        });
    }
    
    /**
     * Create individual saved pattern item with full rich functionality
     */
    function createSavedPatternItem(pattern, index) {
        var item = document.createElement('div');
        item.style.cssText = `
            border: 1px solid #4a5568;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            background: #2d3748;
            transition: background 0.3s ease;
            position: relative;
            min-height: 400px;
        `;
        
        // Hover effect
        item.addEventListener('mouseenter', function() {
            item.style.background = '#374151';
        });
        item.addEventListener('mouseleave', function() {
            item.style.background = '#2d3748';
        });
        
        // Pattern Name (large, script font)
        var patternName = document.createElement('div');
        patternName.style.cssText = `
            font-family: 'Island Moments', cursive;
            font-size: 48px;
            color: white;
            margin-bottom: 8px;
            line-height: 1.1;
        `;
        patternName.textContent = pattern.patternName;
        
        // Collection info section
        var collectionInfo = document.createElement('div');
        collectionInfo.style.cssText = 'margin-bottom: 12px;';
        
        var collectionLabel = document.createElement('div');
        collectionLabel.style.cssText = `
            color: #a0aec0;
            font-size: 14px;
            font-family: 'Special Elite', monospace;
            margin-bottom: 4px;
        `;
        collectionLabel.innerHTML = `
            <span style="color: #e2e8f0; font-weight: bold; font-size: 14px;">Collection:</span><br>
            ${pattern.collectionName ? pattern.collectionName.charAt(0).toUpperCase() + pattern.collectionName.slice(1) : 'Unknown'}
        `;

        // Metadata section (saved date, layers) - more compact
        var metadata = document.createElement('div');
        metadata.style.cssText = 'display: flex; gap: 12px; margin-bottom: 12px; font-size: 11px !important;';

        var savedInfo = document.createElement('div');
        savedInfo.style.cssText = 'display: flex; align-items: center; gap: 6px; font-size: 11px !important;';
        savedInfo.innerHTML = `
            <span style="font-size: 12px !important;">📅</span>
            <div style="color: #e2e8f0; font-family: 'Special Elite', monospace !important; font-size: 11px !important; line-height: 1.2;">
                <span style="font-size: 11px !important; font-weight: bold; line-height: 1.2;">Saved:</span><br>
                <span style="color: #a0aec0; font-size: 11px !important; line-height: 1.2;">${new Date(pattern.timestamp).toLocaleDateString()}</span>
            </div>
        `;

        var layersInfo = document.createElement('div');
        layersInfo.style.cssText = 'display: flex; align-items: center; gap: 6px; font-size: 11px !important;';
        layersInfo.innerHTML = `
            <span style="font-size: 12px !important;">🎯</span>
            <div style="color: #e2e8f0; font-family: 'Special Elite', monospace !important; font-size: 11px !important; line-height: 1.2;">
                <span style="font-size: 11px !important; font-weight: bold; line-height: 1.2;">Layers:</span><br>
                <span style="color: #a0aec0; font-size: 11px !important; line-height: 1.2;">${pattern.colors ? pattern.colors.length : 0}</span>
            </div>
        `;
        
        metadata.appendChild(savedInfo);
        metadata.appendChild(layersInfo);

        // Scale information
        if (pattern.currentScale && pattern.currentScale !== 100) {
            var scaleInfo = document.createElement('div');
            scaleInfo.style.cssText = 'display: flex; align-items: center; gap: 6px; font-size: 11px !important;';

            // Determine scale display text
            let scaleText = 'NORMAL';
            if (pattern.currentScale === 50) scaleText = '0.5X';
            else if (pattern.currentScale === 200) scaleText = '2X';
            else if (pattern.currentScale === 300) scaleText = '3X';
            else if (pattern.currentScale === 400) scaleText = '4X';
            else if (pattern.currentScale !== 100) scaleText = `${pattern.currentScale}%`;

            scaleInfo.innerHTML = `
                <span style="font-size: 12px !important;">📏</span>
                <div style="color: #e2e8f0; font-family: 'Special Elite', monospace !important; font-size: 11px !important; line-height: 1.2;">
                    <span style="font-size: 11px !important; font-weight: bold; line-height: 1.2;">Repeat:</span><br>
                    <span style="color: #d4af37; font-weight: bold; font-size: 11px !important; line-height: 1.2;">${scaleText}</span>
                </div>
            `;
            metadata.appendChild(scaleInfo);
        }

        // Layer Details section - more compact
        var layerDetails = document.createElement('div');
        layerDetails.style.cssText = 'margin-bottom: 12px;';
        
        var layerDetailsTitle = document.createElement('div');
        layerDetailsTitle.style.cssText = `
            color: #d4af37;
            font-size: 14px;
            font-family: 'Special Elite', monospace;
            font-weight: bold;
            margin-bottom: 8px;
        `;
        layerDetailsTitle.textContent = 'Layer Details:';
        
        var layerDetailsList = document.createElement('div');
        layerDetailsList.style.cssText = 'font-size: 13px; color: #e2e8f0; line-height: 1.6; font-family: "Special Elite", monospace;';
        
        if (pattern.colors && pattern.colors.length > 0) {
            // Create color circles container
            var colorCirclesContainer = document.createElement('div');
            colorCirclesContainer.style.cssText = `
                display: flex;
                justify-content: center;
                gap: 8px;
                flex-wrap: wrap;
                margin-bottom: 12px;
                padding: 8px;
                background: rgba(212, 175, 55, 0.05);
                border-radius: 6px;
                border: 1px solid rgba(212, 175, 55, 0.2);
            `;

            pattern.colors.forEach(function(color) {
                // Create color circle
                var circle = document.createElement('div');
                var colorHex = lookupColorForModal(color.color);

                circle.style.cssText = `
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border: 2px solid #d4af37;
                    background: ${colorHex};
                    flex-shrink: 0;
                    cursor: help;
                    transition: transform 0.2s ease;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                `;

                // Ensure consistent color display with clean names (no SW numbers)
                var displayColor = color.color;

                // Remove SW numbers if present and format consistently
                displayColor = displayColor.replace(/^(SW|SC)\d+\s*/i, '').trim();
                // Proper title case formatting (same as CFM.js)
                displayColor = displayColor.split(' ').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(' ');

                circle.title = `${color.label}: ${displayColor}`;

                // Add hover effect
                circle.addEventListener('mouseenter', function() {
                    this.style.transform = 'scale(1.2)';
                    this.style.border = '3px solid #d4af37';
                });

                circle.addEventListener('mouseleave', function() {
                    this.style.transform = 'scale(1)';
                    this.style.border = '2px solid #d4af37';
                });

                colorCirclesContainer.appendChild(circle);

                // Also create text detail for accessibility
                var layerItem = document.createElement('div');
                layerItem.style.cssText = `
                    margin-bottom: 4px;
                    padding: 3px 6px;
                    background: rgba(212, 175, 55, 0.08);
                    border-radius: 3px;
                    font-size: 11px;
                `;

                layerItem.innerHTML = `<strong style="color: #d4af37;">${color.label}:</strong> <span style="color: #cbd5e0;">${displayColor}</span>`;
                layerDetailsList.appendChild(layerItem);
            });

            // Add circles before the text details
            layerDetailsList.insertBefore(colorCirclesContainer, layerDetailsList.firstChild);
        }
        
        layerDetails.appendChild(layerDetailsTitle);
        layerDetails.appendChild(layerDetailsList);
        
        // Large Pattern Thumbnail - Natural aspect ratio
        var thumbnailContainer = document.createElement('div');
        thumbnailContainer.style.cssText = `
            width: fit-content;
            max-width: 300px;
            margin: 0 auto 12px auto;
            border-radius: 8px;
            overflow: hidden;
            border: 2px solid #d4af37;
        `;
        
        if (pattern.thumbnail) {
            console.log(`🖼️ Loading thumbnail for ${pattern.patternName}: ${pattern.thumbnail}`);

            var thumbnailImg = document.createElement('img');

            // Set up event handlers BEFORE setting src
            thumbnailImg.onload = function() {
                var imageAspectRatio = this.naturalWidth / this.naturalHeight;
                console.log(`📐 ${pattern.patternName}: ${this.naturalWidth}x${this.naturalHeight}, image aspect ratio: ${imageAspectRatio.toFixed(2)}`);

                // Simple aspect ratio correction using pattern size data
                if (window.appState && window.appState.collections) {
                    var patternData = null;
                    // Find pattern in collections
                    for (var collectionName in window.appState.collections) {
                        var collection = window.appState.collections[collectionName];
                        if (collection.patterns) {
                            patternData = collection.patterns.find(p => p.name === pattern.patternName);
                            if (patternData) break;
                        }
                    }

                    if (patternData && patternData.size) {
                        // Simple calculation: width/height from declared size
                        var correctAspectRatio = patternData.size[0] / patternData.size[1];

                        console.log(`🔍 ASPECT RATIO CORRECTION for ${pattern.patternName}:`);
                        console.log(`  📏 Image aspect ratio: ${imageAspectRatio.toFixed(3)}`);
                        console.log(`  📋 Declared size: ${patternData.size[0]}" x ${patternData.size[1]}"`);
                        console.log(`  🎯 Using correct aspect ratio: ${correctAspectRatio.toFixed(3)}`);

                        // Apply the correct aspect ratio
                        this.style.width = '300px';
                        this.style.height = (300 / correctAspectRatio) + 'px';
                    }
                }
            };

            thumbnailImg.onerror = function() {
                console.log(`❌ Failed to load thumbnail for ${pattern.patternName}: ${pattern.thumbnail}`);
            };

            thumbnailImg.style.cssText = `
                max-width: 300px;
                width: auto;
                height: auto;
                display: block;
                cursor: pointer;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            `;
            thumbnailImg.alt = pattern.patternName + ' thumbnail';

            // 🆕 UX FIX: Make thumbnail clickable to load pattern (same as Load button)
            thumbnailImg.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent event bubbling
                console.log('🖼️ Thumbnail clicked for pattern:', pattern.patternName);
                // Trigger the same load functionality as the Load button
                loadBtn.click();
            });

            // Add hover effects
            thumbnailImg.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.02)';
                this.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.5)';
            });

            thumbnailImg.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = 'none';
            });

            // Set src AFTER setting up event handlers
            thumbnailImg.src = pattern.thumbnail;

            thumbnailContainer.appendChild(thumbnailImg);
        } else {
            // Create placeholder if no thumbnail
            var placeholder = document.createElement('div');
            placeholder.style.cssText = `
                width: 100%;
                height: 100%;
                background: #2d3748;
                background-image: url('https://so-animation.com/colorflex/img/camelion-sm.jpg');
                background-size: cover;
                background-position: center;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #d4af37;
                font-family: 'Special Elite', monospace;
                font-size: 48px;
            `;
            placeholder.textContent = "";
            thumbnailContainer.appendChild(placeholder);
        }
        
        // ID Badge (centered line at top) - include scale
        var idBadge = document.createElement('div');
        idBadge.style.cssText = `
            text-align: center;
            color: #d4af37;
            font-size: 11px !important;
            font-family: 'Special Elite', monospace;
            font-weight: bold;
            margin-bottom: 16px;
            word-break: break-all;
            line-height: 1.3;
        `;

        // ✅ Pattern ID now includes scale (generated in CFM.js), so just display it
        idBadge.textContent = `ID: ${pattern.id}`;
        
        // Button container at bottom - separate rows for better layout
        var buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 16px;
        `;

        // Top row for Load and Delete buttons
        var topButtons = document.createElement('div');
        topButtons.style.cssText = `
            display: flex;
            gap: 12px;
            justify-content: space-between;
        `;
        
        // Load Pattern button (primary action) - gold outline
        var loadBtn = document.createElement('button');
        loadBtn.style.cssText = `
            background: transparent;
            color: #d4af37;
            border: 2px solid #d4af37;
            padding: 12px 20px;
            border-radius: 6px;
            font-family: 'Special Elite', monospace;
            font-weight: bold;
            font-size: 14px;
            cursor: pointer;
            flex: 1;
            transition: all 0.3s ease;
        `;
        loadBtn.textContent = '🎨 Edit Design';
        
        loadBtn.addEventListener('mouseenter', function() {
            loadBtn.style.background = '#d4af37';
            loadBtn.style.color = '#1a202c';
            loadBtn.style.transform = 'scale(1.02)';
        });
        loadBtn.addEventListener('mouseleave', function() {
            loadBtn.style.background = 'transparent';
            loadBtn.style.color = '#d4af37';
            loadBtn.style.transform = 'scale(1)';
        });
        
        loadBtn.addEventListener('click', function() {
            // Check if we're on ColorFlex page or need to navigate
            if (window.location.pathname.includes('colorflex')) {
                // 🆕 PERSISTENT MODAL: We're on ColorFlex page, load pattern directly and keep modal open
                if (window.loadSavedPatternToUI) {
                    console.log('🎨 Loading saved pattern using CFM.js function:', pattern.patternName);
                    
                    // Show loading feedback on button
                    const originalText = loadBtn.textContent;
                    loadBtn.textContent = '🔄 Loading...';
                    loadBtn.style.background = '#b8941f';
                    
                    try {
                        window.loadSavedPatternToUI(pattern);
                        console.log('✅ Pattern loaded successfully, modal stays open for persistent browsing');
                        
                        // Brief success feedback  
                        loadBtn.textContent = '✅ Loaded!';
                        setTimeout(() => {
                            loadBtn.textContent = originalText;
                            loadBtn.style.background = '#d4af37';
                        }, 1500);
                        
                        showNotification('🎨 Pattern loaded successfully! Modal stays open for browsing.', 'success');
                        
                        // 🔑 PERSISTENT: Do NOT remove modal - let user continue browsing
                        // document.getElementById('unifiedSavedPatternsModal').remove(); ← REMOVED for persistence
                        
                    } catch (error) {
                        console.error('❌ Error loading pattern:', error);
                        loadBtn.textContent = '❌ Error';
                        setTimeout(() => {
                            loadBtn.textContent = originalText;
                            loadBtn.style.background = '#d4af37';
                        }, 1500);
                        showNotification('❌ Error loading pattern', 'error');
                    }
                } else {
                    console.warn('⚠️ CFM.js loadSavedPatternToUI not available, pattern may not load correctly');
                    showNotification('⚠️ Pattern loading function not available', 'warning');
                }
            } else {
                // We're on a different page - navigate to ColorFlex and use direct loading approach
                const collectionName = pattern.collectionName || 'unknown';
                const patternName = pattern.patternName;
                
                console.log('🔍 UNIFIED MODAL: Cross-page pattern loading - Name:', patternName, 'Collection:', collectionName);
                
                // Validate the data before navigation
                if (!patternName || !collectionName || collectionName === 'unknown' || collectionName === 'Unknown') {
                    console.error('❌ Invalid pattern data for navigation', { patternName, collectionName });
                    showNotification('❌ Pattern data incomplete - cannot navigate', 'error');
                    return;
                }
                
                // Store the complete pattern data for direct loading on ColorFlex page
                sessionStorage.setItem('pendingDirectPatternLoad', JSON.stringify(pattern));
                console.log('💾 Stored pattern for direct loading:', pattern.patternName);
                
                // Navigate to ColorFlex page (without pattern URL params to avoid conflicts)
                const colorFlexUrl = '/pages/colorflex?source=saved_patterns_direct';
                console.log('🔗 Navigating to ColorFlex for direct pattern loading');
                
                window.location.href = colorFlexUrl;
            }
        });

        // Export button (blue border)
        var exportBtn = document.createElement('button');
        exportBtn.style.cssText = `
            background: transparent;
            color: #4299e1;
            border: 2px solid #4299e1;
            padding: 12px 20px;
            border-radius: 6px;
            font-family: 'Special Elite', monospace;
            font-weight: bold;
            font-size: 14px;
            cursor: pointer;
            flex: 1;
            transition: all 0.3s ease;
        `;
        exportBtn.textContent = '💾 Export';
        exportBtn.title = 'Download this pattern as a file';

        exportBtn.addEventListener('mouseenter', function() {
            exportBtn.style.background = '#4299e1';
            exportBtn.style.color = 'white';
            exportBtn.style.transform = 'scale(1.02)';
        });
        exportBtn.addEventListener('mouseleave', function() {
            exportBtn.style.background = 'transparent';
            exportBtn.style.color = '#4299e1';
            exportBtn.style.transform = 'scale(1)';
        });

        exportBtn.addEventListener('click', function() {
            if (window.exportPattern && typeof window.exportPattern === 'function') {
                window.exportPattern(pattern);
            } else {
                console.error('❌ exportPattern function not available');
                showNotification('❌ Export function not available', 'error');
            }
        });

        // Delete button (destructive action) - red outline
        var deleteBtn = document.createElement('button');
        deleteBtn.style.cssText = `
            background: transparent;
            color: #f56565;
            border: 2px solid #f56565;
            padding: 12px 20px;
            border-radius: 6px;
            font-family: 'Special Elite', monospace;
            font-weight: bold;
            font-size: 14px;
            cursor: pointer;
            flex: 1;
            transition: all 0.3s ease;
        `;
        deleteBtn.textContent = '🗑️ Delete';
        
        deleteBtn.addEventListener('mouseenter', function() {
            deleteBtn.style.background = '#f56565';
            deleteBtn.style.color = 'white';
            deleteBtn.style.transform = 'scale(1.02)';
        });
        deleteBtn.addEventListener('mouseleave', function() {
            deleteBtn.style.background = 'transparent';
            deleteBtn.style.color = '#f56565';
            deleteBtn.style.transform = 'scale(1)';
        });
        
        deleteBtn.addEventListener('click', function() {
            if (confirm('🗑️ Delete "' + pattern.patternName + '"?\n\nThis action cannot be undone.')) {
                deleteSavedPattern(pattern.id);
                document.getElementById('unifiedSavedPatternsModal').remove();
                showSavedPatternsModal(); // Refresh modal
            }
        });

        // Buy It! button (secondary action - available on all pages)
        const isOnColorFlexPage = window.location.pathname === '/pages/colorflex' ||
                                window.location.pathname.includes('/pages/colorflex');

        // Always create Buy button (works on all pages with fallback logic)
        var buyBtn = document.createElement('button');
        buyBtn.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 6px;
            font-family: 'Special Elite', monospace;
            font-weight: bold;
            font-size: 14px;
            cursor: pointer;
            flex: 1;
            transition: all 0.3s ease;
        `;
        buyBtn.textContent = '🛒 Buy It!';
        
        buyBtn.addEventListener('mouseenter', function() {
            buyBtn.style.background = 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)';
            buyBtn.style.transform = 'scale(1.02)';
        });
        buyBtn.addEventListener('mouseleave', function() {
            buyBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            buyBtn.style.transform = 'scale(1)';
        });
        
        buyBtn.addEventListener('click', function() {
            try {
                console.log('🛒 Buy It clicked for pattern:', pattern.patternName);
                console.log('🛒 Current page:', window.location.pathname);
                console.log('🛒 Material modal available:', !!window.showMaterialSelectionModal);

                // Check if we're on ColorFlex page - use material selection modal directly
                if (window.showMaterialSelectionModal && typeof window.showMaterialSelectionModal === 'function') {
                    console.log('🛒 Using material selection modal (on ColorFlex page)');
                    window.showMaterialSelectionModal(pattern);
                    document.getElementById('unifiedSavedPatternsModal').remove();
                } else {
                    // On other pages - must route through ColorFlex to generate thumbnail and process pattern data
                    console.log('🛒 Routing to ColorFlex for pattern processing before purchase');

                    // Store pattern in localStorage with special flag to trigger material modal
                    localStorage.setItem('pendingPurchasePattern', JSON.stringify({
                        ...pattern,
                        triggerPurchase: true,
                        timestamp: Date.now()
                    }));

                    // Navigate to ColorFlex page with purchase intent flag
                    const colorFlexUrl = '/pages/colorflex?source=buy_from_saved&pattern_id=' + encodeURIComponent(pattern.id);
                    console.log('🛒 Navigating to:', colorFlexUrl);
                    window.location.href = colorFlexUrl;
                }
            } catch (error) {
                console.error('🛒 Error in Buy It button:', error);
                // Fallback: route through ColorFlex anyway
                window.location.href = '/pages/colorflex?source=buy_from_saved';
            }
        });

        // Add Load, Export, and Delete to top row
        topButtons.appendChild(loadBtn);
        topButtons.appendChild(exportBtn);
        topButtons.appendChild(deleteBtn);

        // Add top row to main container
        buttonContainer.appendChild(topButtons);

        // Always add Buy It button (works on all pages)
        buttonContainer.appendChild(buyBtn);
        
        // Assemble the item - ID badge first to prevent overlap
        item.appendChild(idBadge);

        var topSection = document.createElement('div');
        topSection.appendChild(patternName);
        topSection.appendChild(collectionInfo);
        topSection.appendChild(collectionLabel);
        topSection.appendChild(metadata);
        topSection.appendChild(layerDetails);

        item.appendChild(topSection);
        item.appendChild(thumbnailContainer);
        item.appendChild(buttonContainer);
        
        return item;
    }
    
    /**
     * Delete a saved pattern by ID
     */
    function deleteSavedPattern(patternId) {
        try {
            var savedPatterns = JSON.parse(localStorage.getItem('colorflexSavedPatterns') || '[]');
            var filteredPatterns = savedPatterns.filter(function(p) { return p.id !== patternId; });
            localStorage.setItem('colorflexSavedPatterns', JSON.stringify(filteredPatterns));
            
            // Update menu icon if it exists
            if (window.updateMenuIcon) {
                window.updateMenuIcon();
            }
            
            showNotification('🗑️ Pattern deleted successfully', 'success');
            
        } catch (error) {
            console.error('❌ Error deleting pattern:', error);
            showNotification('❌ Failed to delete pattern', 'error');
        }
    }
    
    /**
     * Simple notification system
     */
    function showNotification(message, type = 'info') {
        var notification = document.createElement('div');
        var bgColor = type === 'error' ? '#f56565' : type === 'success' ? '#48bb78' : type === 'warning' ? '#ed8936' : '#4299e1';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            font-family: 'Special Elite', monospace;
            font-size: 14px;
            z-index: 10001;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
})();