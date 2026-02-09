/**
 * PROTECTED PATTERN RENDERING MODULE
 * Version: 1.0.0
 * Created: 2025-09-27
 *
 * This module contains critical pattern rendering functions.
 * DO NOT MODIFY without proper testing and backup.
 *
 * BREAKING CHANGES HISTORY:
 * - 2025-09-27: Fixed aspect ratio calculation to use declared pattern dimensions
 * - 2025-09-27: Fixed pattern type detection for ColorFlex patterns
 */

const MODULE_VERSION = "1.0.0";
const CREATION_DATE = "2025-09-27";

/**
 * COMPLETE updatePreview function - EXTRACTED FROM CFM.js
 * This is the full working function with all fixes included
 */
export async function updatePreview(dependencies) {
    const { dom, appState, lookupColor, normalizePath, processImage, getLayerMappingForPreview, toInitialCaps } = dependencies;

    // 🔒 FUNCTION PROTECTION GUARD
    const FUNCTION_VERSION = "1.0.0-fixed-2025-09-27";
    console.log(`🔒 MODULAR updatePreview v${FUNCTION_VERSION} [${MODULE_VERSION}]`);

    // Validate critical inputs before proceeding
    if (!dom || !dom.preview) {
        console.error("🔒 PROTECTION: Missing DOM or preview element");
        return false;
    }

    if (!appState || !appState.currentPattern) {
        console.error("🔒 PROTECTION: Missing appState or currentPattern");
        return false;
    }

    console.log("🚨 updatePreview() FUNCTION CALLED!");
    console.log("🚨 Pattern name:", appState.currentPattern?.name);

    console.log("🔍 updatePreview PATTERN DEBUG:");
    console.log("  currentPattern name:", appState.currentPattern?.name);
    console.log("  currentPattern layers:", appState.currentPattern?.layers?.map(l => l.path?.split('/').pop()));
    console.log("  isFurnitureMode:", appState.furnitureMode);
    console.log("  selectedCollection name:", appState.selectedCollection?.name);

    if (!dom.preview) return console.error("preview not found in DOM");

    try {
        if (!dom.preview) return console.error("preview not found in DOM");
        if (!appState.currentPattern) return console.error("No current pattern selected");

        console.log("🔍 updatePreview START");

        // Get responsive canvas size from CSS custom properties
        const computedStyle = getComputedStyle(document.documentElement);
        const previewSizeValue = computedStyle.getPropertyValue('--preview-size');
        const canvasSize = parseInt((previewSizeValue && typeof previewSizeValue === 'string') ? previewSizeValue.replace('px', '') : '700') || 700;
        console.log("📱 Canvas size from CSS:", canvasSize);

        const previewCanvas = document.createElement("canvas");
        const previewCtx = previewCanvas.getContext("2d", { willReadFrequently: true });
        previewCanvas.width = canvasSize;
        previewCanvas.height = canvasSize;

        // Check if this is a furniture collection
        const isFurnitureCollection = appState.selectedCollection?.wallMask != null;
        const layerMapping = getLayerMappingForPreview(isFurnitureCollection);
        console.log("🔍 SOFA BASE DEBUG:");
        console.log("  Layer mapping:", layerMapping);
        console.log("  backgroundIndex:", layerMapping.backgroundIndex);
        console.log("  Current layers length:", appState.currentLayers.length);

        console.log("🔍 Layer mapping:", layerMapping);
        console.log("🔍 Current layers:", appState.currentLayers.map((l, i) => `${i}: ${l.label} = ${l.color}`));

        let patternToRender = appState.currentPattern;
        let usesBotanicalLayers = false;

        // For furniture collections, try to find the botanical pattern
        if (isFurnitureCollection) {
            console.log("🌿 Furniture mode detected - looking for original pattern");

            // Try multiple ways to get the original pattern
            let originalPattern = null;

            // Method 1: Check if furniture pattern stores original
            if (appState.currentPattern.originalPattern) {
                originalPattern = appState.currentPattern.originalPattern;
                console.log("✅ Found original pattern via .originalPattern");
            }

            // Method 2: Look up by name in botanicals collection
            if (!originalPattern) {
                const botanicalCollection = appState.collections.find(c => c.name === "botanicals");
                if (botanicalCollection) {
                    // Remove any furniture prefixes from the name to find botanical pattern
                    const currentPatternName = appState.currentPattern.name;
                    const cleanPatternName = (currentPatternName && typeof currentPatternName === 'string')
                        ? currentPatternName
                            .replace(/^.*\s+/, '') // Remove collection prefix
                            .replace(/\s+\w+\s+sofa$/i, '') // Remove furniture suffix
                        : '';

                    originalPattern = botanicalCollection.patterns.find(p =>
                        p && typeof p.name === 'string' && cleanPatternName && (
                            p.name.toLowerCase() === cleanPatternName.toLowerCase() ||
                            (currentPatternName && typeof currentPatternName === 'string' &&
                             p.name.toLowerCase() === currentPatternName.toLowerCase())
                        )
                    );

                    if (originalPattern) {
                        console.log("✅ Found original pattern by name lookup:", originalPattern.name);
                    }
                }
            }

            // Method 3: Use stored original collection
            if (!originalPattern && appState.originalCollection) {
                originalPattern = appState.originalCollection.patterns?.find(p =>
                    p.id === appState.currentPattern.id
                );

                if (originalPattern) {
                    console.log("✅ Found original pattern via originalCollection");
                }
            }

            if (originalPattern) {
                console.log("🌿 Using original pattern for preview:", originalPattern.name);
                console.log("  Original layers:", originalPattern.layers?.map(l => l.path.split('/').pop()));

                patternToRender = originalPattern;
                usesBotanicalLayers = true;
            } else {
                console.warn("⚠️ Could not find original pattern, using furniture pattern");
            }
        }

        // Get background color based on collection type
        let backgroundLayerIndex = layerMapping.backgroundIndex;
        let backgroundColor;

        if (isFurnitureCollection && usesBotanicalLayers) {
            // ✅ FIX: For furniture mode pattern preview, use the BG/Sofa Base color (index 1)
            // but this should be the same as the original background color
            backgroundColor = lookupColor(appState.currentLayers[1]?.color || "Snowbound");
            console.log(`🌿 Furniture mode pattern preview - using BG/Sofa Base color from input 1: ${backgroundColor}`);
        } else {
            // Standard mode or furniture room mockup
            const backgroundLayer = appState.currentLayers[backgroundLayerIndex];
            backgroundColor = lookupColor(backgroundLayer?.color || "Snowbound");
            console.log(`🎨 Standard background color from input ${backgroundLayerIndex}: ${backgroundColor}`);
        }
        console.log(`🎨 Background color from input ${backgroundLayerIndex}: ${backgroundColor}`);

        // Clear canvas to transparent
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

        // 🔍 DEBUG: Check what rendering path we're taking
        console.log("🔍 PATTERN RENDERING DEBUG:");
        console.log("  patternToRender name:", patternToRender.name);
        console.log("  patternToRender.tintWhite:", !!patternToRender.tintWhite);
        console.log("  patternToRender.baseComposite:", !!patternToRender.baseComposite);
        console.log("  patternToRender.layers:", patternToRender.layers);
        console.log("  patternToRender.layers?.length:", patternToRender.layers?.length);

        // Handle tint white patterns
        if (patternToRender.tintWhite && patternToRender.baseComposite) {
            console.log("🎨 Rendering tint white pattern");

            const baseImage = new Image();
            baseImage.crossOrigin = "Anonymous";
            baseImage.src = normalizePath(patternToRender.baseComposite);

            await new Promise((resolve, reject) => {
                baseImage.onload = () => {
                    const scaleMultiplier = appState.scaleMultiplier || 1;
                    const imgAspect = baseImage.width / baseImage.height;
                    const maxSize = canvasSize * scaleMultiplier;

                    let drawWidth, drawHeight, offsetX, offsetY;
                    if (imgAspect > 1) {
                        drawWidth = Math.min(maxSize, canvasSize);
                        drawHeight = drawWidth / imgAspect;
                    } else {
                        drawHeight = Math.min(maxSize, canvasSize);
                        drawWidth = drawHeight * imgAspect;
                    }

                    offsetX = (canvasSize - drawWidth) / 2;
                    offsetY = (canvasSize - drawHeight) / 2;

                    previewCtx.fillStyle = backgroundColor;
                    previewCtx.fillRect(offsetX, offsetY, drawWidth, drawHeight);
                    previewCtx.drawImage(baseImage, offsetX, offsetY, drawWidth, drawHeight);

                    // Apply tint to white areas
                    let imageData;
                    try {
                        imageData = previewCtx.getImageData(offsetX, offsetY, drawWidth, drawHeight);
                    } catch (e) {
                        console.warn("⚠️ Canvas tainted, skipping preview tinting:", e.message);
                        resolve();
                        return;
                    }
                    const data = imageData.data;
                    const wallColor = lookupColor(appState.currentLayers[0]?.color || "Snowbound");
                    const hex = wallColor.replace("#", "");
                    const rTint = parseInt(hex.substring(0, 2), 16);
                    const gTint = parseInt(hex.substring(2, 4), 16);
                    const bTint = parseInt(hex.substring(4, 6), 16);

                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i], g = data[i + 1], b = data[i + 2];
                        if (r > 240 && g > 240 && b > 240) {
                            data[i] = rTint;
                            data[i + 1] = gTint;
                            data[i + 2] = bTint;
                        }
                    }

                    previewCtx.putImageData(imageData, offsetX, offsetY);
                    resolve();
                };
                baseImage.onerror = reject;
            });

        } else if (patternToRender.layers?.length) {
            console.log("🎨 Rendering layered pattern");
            console.log("  Uses botanical layers:", usesBotanicalLayers);

            const firstLayer = patternToRender.layers.find(l => !l.isShadow);
            if (firstLayer) {
                const tempImg = new Image();
                tempImg.crossOrigin = "Anonymous";
                tempImg.src = normalizePath(firstLayer.path);

                await new Promise((resolve) => {
                    tempImg.onload = () => {
                        // 🔧 FIX: Use pattern's declared dimensions, not image file dimensions
                        const patternSize = patternToRender.size;
                        const patternAspect = (patternSize && patternSize.length >= 2) ?
                            patternSize[0] / patternSize[1] :
                            tempImg.width / tempImg.height; // Fallback to image dimensions

                        console.log(`🔧 ASPECT RATIO FIX: Using declared size ${patternSize} = aspect ${patternAspect.toFixed(3)}`);

                        const scaleMultiplier = appState.scaleMultiplier || 1;

                        let patternDisplayWidth, patternDisplayHeight;
                        const baseSize = canvasSize;

                        if (patternAspect > 1) {
                            patternDisplayWidth = Math.min(baseSize, canvasSize);
                            patternDisplayHeight = patternDisplayWidth / patternAspect;
                        } else {
                            patternDisplayHeight = Math.min(baseSize, canvasSize);
                            patternDisplayWidth = patternDisplayHeight * patternAspect;
                        }

                        const offsetX = (canvasSize - patternDisplayWidth) / 2;
                        const offsetY = (canvasSize - patternDisplayHeight) / 2;

                        previewCtx.fillStyle = backgroundColor;
                        previewCtx.fillRect(offsetX, offsetY, patternDisplayWidth, patternDisplayHeight);

                        console.log(`🎨 Pattern area: ${patternDisplayWidth.toFixed(0)}x${patternDisplayHeight.toFixed(0)}`);

                        resolve({ offsetX, offsetY, patternDisplayWidth, patternDisplayHeight, scaleMultiplier });
                    };
                    tempImg.onerror = () => resolve(null);
                }).then(async (patternBounds) => {
                    if (!patternBounds) return;

                    // Render each layer with correct color mapping
                    for (let layerIndex = 0; layerIndex < patternToRender.layers.length; layerIndex++) {
                        const layer = patternToRender.layers[layerIndex];
                        const isShadow = layer.isShadow === true;

                        let layerColor = null;
                        if (!isShadow) {
                            if (usesBotanicalLayers) {
                                // ✅ FIX: Map botanical layer to furniture input correctly
                                const furnitureInputIndex = layerMapping.patternStartIndex + layerIndex;
                                layerColor = lookupColor(appState.currentLayers[furnitureInputIndex]?.color || "Snowbound");

                                // ✅ DEBUG: Show the mapping
                                const inputLayer = appState.currentLayers[furnitureInputIndex];
                                console.log(`🌿 Botanical layer ${layerIndex} → furniture input ${furnitureInputIndex} (${inputLayer?.label}) → ${layerColor}`);

                            } else {
                                // Standard mapping
                                const inputIndex = layerMapping.patternStartIndex + layerIndex;
                                layerColor = lookupColor(appState.currentLayers[inputIndex]?.color || "Snowbound");
                                console.log(`🏠 Standard layer ${layerIndex} → input ${inputIndex} → ${layerColor}`);
                            }
                        }

                        await new Promise((resolve) => {
                            processImage(layer.path, (processedCanvas) => {
                                if (!(processedCanvas instanceof HTMLCanvasElement)) {
                                    return resolve();
                                }

                                // Fix for non-square patterns: calculate scale based on aspect ratio
                                const patternAspect = processedCanvas.width / processedCanvas.height;
                                const displayAspect = patternBounds.patternDisplayWidth / patternBounds.patternDisplayHeight;

                                let baseScale;
                                if (patternAspect > displayAspect) {
                                    // Pattern is wider than display area - scale to fit width
                                    baseScale = patternBounds.patternDisplayWidth / processedCanvas.width;
                                } else {
                                    // Pattern is taller than display area - scale to fit height
                                    baseScale = patternBounds.patternDisplayHeight / processedCanvas.height;
                                }

                                const finalScale = baseScale * patternBounds.scaleMultiplier;
                                const tileWidth = processedCanvas.width * finalScale;
                                const tileHeight = processedCanvas.height * finalScale;

                                const tilingType = patternToRender.tilingType || "";
                                const isHalfDrop = tilingType === "half-drop";

                                previewCtx.save();
                                previewCtx.beginPath();
                                previewCtx.rect(
                                    patternBounds.offsetX,
                                    patternBounds.offsetY,
                                    patternBounds.patternDisplayWidth,
                                    patternBounds.patternDisplayHeight
                                );
                                previewCtx.clip();

                                previewCtx.globalCompositeOperation = isShadow ? "multiply" : "source-over";
                                previewCtx.globalAlpha = isShadow ? 0.3 : 1.0;

                                const startX = patternBounds.offsetX;
                                const startY = patternBounds.offsetY;
                                const endX = patternBounds.offsetX + patternBounds.patternDisplayWidth + tileWidth;
                                const endY = patternBounds.offsetY + patternBounds.patternDisplayHeight + tileHeight;

                                for (let x = startX; x < endX; x += tileWidth) {
                                    const isOddColumn = Math.floor((x - startX) / tileWidth) % 2 !== 0;
                                    const yOffset = isHalfDrop && isOddColumn ? tileHeight / 2 : 0;

                                    for (let y = startY - tileHeight + yOffset; y < endY; y += tileHeight) {
                                        previewCtx.drawImage(processedCanvas, x, y, tileWidth, tileHeight);
                                    }
                                }

                                previewCtx.restore();
                                console.log(`✅ Rendered layer ${layerIndex} with color ${layerColor}`);
                                resolve();
                            }, layerColor, 2.2, isShadow, false, false);
                        });
                    }
                });
            }
        } else {
            // 🔍 DEBUG: No rendering path taken
            console.log("❌ NO RENDERING PATH TAKEN:");
            console.log("  - Not tintWhite pattern");
            console.log("  - Not layered pattern");
            console.log("  - Canvas will remain empty with background color");
        }

        // Update DOM
        dom.preview.innerHTML = "";
        dom.preview.appendChild(previewCanvas);
        dom.preview.style.width = `${canvasSize}px`;
        dom.preview.style.height = `${canvasSize}px`;
        dom.preview.style.backgroundColor = "rgba(17, 24, 39, 1)";

        if (patternToRender.name) {
            dom.patternName.textContent = toInitialCaps(appState.currentPattern.name); // Keep original name
        }

        console.log("✅ Pattern preview rendered");

    } catch (err) {
        console.error("updatePreview error:", err);
    }
}

/**
 * COMPLETE updateRoomMockup function - EXTRACTED FROM CFM.js
 * This is the full working function with all fixes included
 */
export async function updateRoomMockup(dependencies) {
    const {
        dom,
        appState,
        lookupColor,
        normalizePath,
        processImage,
        scaleToFit,
        ensureButtonsAfterUpdate,
        updateFurniturePreview,
        USE_GUARD,
        DEBUG_TRACE
    } = dependencies;

    // 🔒 FUNCTION PROTECTION GUARD
    const FUNCTION_VERSION = "1.0.0-fixed-2025-09-27";
    console.log(`🔒 MODULAR updateRoomMockup v${FUNCTION_VERSION} [${MODULE_VERSION}]`);

    // Validate critical inputs before proceeding
    if (!validateRenderingInputs(dom, appState)) {
        console.error("🔒 PROTECTION: Invalid inputs for updateRoomMockup");
        return false;
    }

    try {
        if (!dom.roomMockup) {
            console.error("roomMockup element not found in DOM");
            return;
        }

        if (!appState.selectedCollection || !appState.currentPattern) {
            console.log("🔍 Skipping updateRoomMockup - no collection/pattern selected");
            return;
        }

        // Check if this is a furniture collection
        const isFurnitureCollection = appState.selectedCollection.wallMask != null;

        if (isFurnitureCollection) {
            console.log("🪑 Rendering furniture preview");
            updateFurniturePreview();
            return;
        }

        const isWallPanel = appState.selectedCollection?.name === "wall-panels";

        // 🔍 ADD THIS DEBUG HERE:
        console.log("🔍 CURRENT LAYERS MAPPING (Room Mockup):");
        appState.currentLayers.forEach((layer, index) => {
            console.log(`  ${index}: ${layer.label} = ${layer.color} (isShadow: ${layer.isShadow})`);
        });

        // 🔍 DEBUG: Check what path we're taking
        console.log("🔍 DEBUG START updateRoomMockup");
        console.log("🔍 isWallPanel:", isWallPanel);
        console.log("🔍 selectedCollection name:", appState.selectedCollection?.name);
        console.log("🔍 currentPattern.isWallPanel:", appState.currentPattern?.isWallPanel);
        console.log("🔍 currentPattern has layers:", !!appState.currentPattern?.layers?.length);
        console.log("🔍 currentPattern has tintWhite:", !!appState.currentPattern?.tintWhite);

        // Get colors from correct layer indices
        const wallColor = isWallPanel ?
            lookupColor(appState.currentLayers[0]?.color || "Snowbound") :
            lookupColor(appState.currentLayers[0]?.color || "Snowbound");
        const backgroundColor = isWallPanel ?
            lookupColor(appState.currentLayers[1]?.color || "Snowbound") :
            lookupColor(appState.currentLayers[0]?.color || "Snowbound");

        console.log(">>> Wall color:", wallColor, "Background color:", backgroundColor);

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 600;
        canvas.height = 450;
        console.log(`🎨 Room mockup canvas created: ${canvas.width}x${canvas.height}`);

        const processOverlay = async () => {
            console.log("🔍 processOverlay() START");
            // Fill wall color
            ctx.fillStyle = wallColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            console.log("🔍 Wall color filled");

            if (isWallPanel && appState.currentPattern?.layers?.length) {
                console.log("🔍 TAKING PATH: Wall panel processing");

                // Handle wall panel rendering
                const panelWidthInches = appState.currentPattern.size[0] || 24;
                const panelHeightInches = appState.currentPattern.size[1] || 36;
                const scale = Math.min(canvas.width / 100, canvas.height / 80) * (appState.scaleMultiplier || 1);

                const panelWidth = panelWidthInches * scale;
                const panelHeight = panelHeightInches * scale;

                const layout = appState.currentPattern.layout || "3,20";
                const [numPanelsStr, spacingStr] = layout.split(",");
                const numPanels = parseInt(numPanelsStr, 10) || 3;
                const spacing = parseInt(spacingStr, 10) || 20;

                const totalWidth = (numPanels * panelWidth) + ((numPanels - 1) * spacing);
                const startX = (canvas.width - totalWidth) / 2;
                const startY = (canvas.height - panelHeight) / 2 - (appState.currentPattern?.verticalOffset || 50);

                // Create panel canvas
                const panelCanvas = document.createElement("canvas");
                panelCanvas.width = panelWidth;
                panelCanvas.height = panelHeight;
                const panelCtx = panelCanvas.getContext("2d");

                // Process panel layers - find input layers only
                let currentLayerIndex = 0;
                const inputLayers = appState.currentLayers.filter(layer => !layer.isShadow);
                let inputLayerIndex = 0;

                for (let i = 0; i < appState.currentPattern.layers.length; i++) {
                    const layer = appState.currentPattern.layers[i];
                    const isShadow = layer.isShadow === true;

                    let layerColor = null;
                    if (!isShadow) {
                        const inputLayer = inputLayers[inputLayerIndex + 1]; // Skip background
                        layerColor = lookupColor(inputLayer?.color || "Snowbound");
                        inputLayerIndex++;
                        console.log(`🎨 Regular layer ${i}: using color ${layerColor} from inputLayer[${inputLayerIndex}]`);
                    } else {
                        console.log(`🌑 Shadow layer ${i}: path=${layer.path}`);
                    }

                    const tilingType = appState.currentPattern.tilingType || "";
                    const isHalfDrop = tilingType === "half-drop";
                    console.log(`🔄 ROOM MOCKUP Tiling type: ${tilingType}, Half-drop: ${isHalfDrop}`);

                    await new Promise((resolve) => {
                        console.log(`🧪 Calling processImage for layer ${i}:`, {
                            path: layer.path,
                            color: layerColor,
                            isShadow,
                        });

                        processImage(layer.path, (processedCanvas) => {
                            console.log(`🎯 processImage callback fired for layer ${i}`, processedCanvas);

                            if (processedCanvas instanceof HTMLCanvasElement) {
                                const scale = (appState.currentScale / 100 || 1) * (appState.scaleMultiplier || 1);
                                const tileWidth = processedCanvas.width * scale;
                                const tileHeight = processedCanvas.height * scale;

                                patternCtx.globalCompositeOperation = isShadow ? "multiply" : "source-over";
                                patternCtx.globalAlpha = isShadow ? 0.3 : 1.0;

                                for (let x = -tileWidth; x < canvas.width + tileWidth; x += tileWidth) {
                                    const isOddColumn = Math.floor((x + tileWidth) / tileWidth) % 2 !== 0;
                                    const yOffset = isHalfDrop && isOddColumn ? tileHeight / 2 : 0;
                                    for (let y = -tileHeight + yOffset; y < canvas.height + tileHeight; y += tileHeight) {
                                        patternCtx.drawImage(processedCanvas, x, y, tileWidth, tileHeight);
                                    }
                                }
                                console.log(`✅ Regular layer ${i} rendered with color ${layerColor}`);
                            } else {
                                console.warn(`⚠️ processImage returned non-canvas for layer ${i}`);
                            }

                            resolve();
                        }, layerColor, 2.2, isShadow, false, false);
                    });
                }

                console.log("✅ All layers looped and processed, drawing patternCanvas to main ctx");
                ctx.drawImage(patternCanvas, 0, 0);
                console.log("🖼️ Pattern canvas rendered to main canvas");

                // Draw panels
                for (let i = 0; i < numPanels; i++) {
                    const x = startX + (i * (panelWidth + spacing));
                    ctx.fillStyle = backgroundColor;
                    ctx.fillRect(x, startY, panelWidth, panelHeight);
                    ctx.drawImage(panelCanvas, x, startY, panelWidth, panelHeight);
                }
            } else {
                console.log("🔍 TAKING PATH: Regular pattern processing");
                console.log("🔍 appState.currentPattern:", appState.currentPattern);
                console.log("🔍 appState.currentPattern.layers:", appState.currentPattern?.layers);

                // Handle regular pattern rendering
                const patternCanvas = document.createElement("canvas");
                patternCanvas.width = canvas.width;
                patternCanvas.height = canvas.height;
                const patternCtx = patternCanvas.getContext("2d");

                if (appState.currentPattern?.tintWhite && appState.currentPattern?.baseComposite) {
                    console.log("🔍 TAKING SUBPATH: Tint white");

                    // Handle tint white in room mockup
                    const baseImage = new Image();
                    baseImage.crossOrigin = "Anonymous";
                    baseImage.src = normalizePath(appState.currentPattern.baseComposite);

                    await new Promise((resolve) => {
                        baseImage.onload = () => {
                            const scale = (appState.currentScale / 100 || 1) * (appState.scaleMultiplier || 1);
                            const tileWidth = baseImage.width * scale;
                            const tileHeight = baseImage.height * scale;

                            // Tile pattern
                            for (let x = -tileWidth; x < canvas.width + tileWidth; x += tileWidth) {
                                for (let y = -tileHeight; y < canvas.height + tileHeight; y += tileHeight) {
                                    patternCtx.drawImage(baseImage, x, y, tileWidth, tileHeight);
                                }
                            }

                            // Apply tint (with CORS protection)
                            let imageData;
                            try {
                                imageData = patternCtx.getImageData(0, 0, canvas.width, canvas.height);
                            } catch (e) {
                                console.warn("⚠️ Canvas tainted, skipping tint white effect:", e.message);
                                ctx.drawImage(patternCanvas, 0, 0);
                                return;
                            }
                            const data = imageData.data;
                            const hex = wallColor.replace("#", "");
                            const rTint = parseInt(hex.substring(0, 2), 16);
                            const gTint = parseInt(hex.substring(2, 4), 16);
                            const bTint = parseInt(hex.substring(4, 6), 16);

                            for (let i = 0; i < data.length; i += 4) {
                                const r = data[i], g = data[i + 1], b = data[i + 2];
                                if (r > 240 && g > 240 && b > 240) {
                                    data[i] = rTint;
                                    data[i + 1] = gTint;
                                    data[i + 2] = bTint;
                                }
                            }

                            patternCtx.putImageData(imageData, 0, 0);
                            ctx.drawImage(patternCanvas, 0, 0);
                            resolve();
                        };
                        baseImage.onerror = resolve;
                    });

                } else if (appState.currentPattern?.layers?.length && !isWallPanel) {
                    console.log("🔍 TAKING SUBPATH: Regular layers");

                    // Handle regular layered patterns - FIXED indexing
                    let currentLayerIndex = 0; // Start from first non-shadow layer

                    const inputLayers = appState.currentLayers.filter(layer => !layer.isShadow);
                    let inputLayerIndex = 0;

                    for (let i = 0; i < appState.currentPattern.layers.length; i++) {
                        const layer = appState.currentPattern.layers[i];
                        const isShadow = layer.isShadow === true;

                        let layerColor = null;
                        if (!isShadow) {
                            const inputLayer = inputLayers[inputLayerIndex + 1]; // Skip background
                            layerColor = lookupColor(inputLayer?.color || "Snowbound");
                            inputLayerIndex++; // Increment here
                        }

                        // Check for half-drop tiling (declare once, outside)
                        const tilingType = appState.currentPattern.tilingType || "";
                        const isHalfDrop = tilingType === "half-drop";
                        console.log(`🔄 ROOM MOCKUP Tiling type: ${tilingType}, Half-drop: ${isHalfDrop}`);

                        await new Promise((resolve) => {
                            processImage(layer.path, (processedCanvas) => {
                                if (processedCanvas instanceof HTMLCanvasElement) {
                                    // 🔧 FIX: Use pattern's declared dimensions for room mockup too
                                    const patternSize = appState.currentPattern.size;
                                    const patternAspect = (patternSize && patternSize.length >= 2) ?
                                        patternSize[0] / patternSize[1] :
                                        processedCanvas.width / processedCanvas.height;

                                    console.log(`🔧 ROOM MOCKUP ASPECT FIX: Using declared size ${patternSize} = aspect ${patternAspect.toFixed(3)}`);

                                    const scale = (appState.currentScale / 100 || 1) * (appState.scaleMultiplier || 1);

                                    // Calculate tile size based on declared pattern dimensions
                                    const basePatternWidth = patternSize && patternSize[0] ? patternSize[0] * 10 : processedCanvas.width;
                                    const basePatternHeight = patternSize && patternSize[1] ? patternSize[1] * 10 : processedCanvas.height;

                                    const tileWidth = basePatternWidth * scale;
                                    const tileHeight = basePatternHeight * scale;

                                    patternCtx.globalCompositeOperation = isShadow ? "multiply" : "source-over";
                                    patternCtx.globalAlpha = isShadow ? 0.3 : 1.0;

                                    for (let x = -tileWidth; x < canvas.width + tileWidth; x += tileWidth) {
                                        const isOddColumn = Math.floor((x + tileWidth) / tileWidth) % 2 !== 0;
                                        const yOffset = isHalfDrop && isOddColumn ? tileHeight / 2 : 0;
                                        console.log(`🔄 Column at x=${x}, isOdd=${isOddColumn}, yOffset=${yOffset}`);

                                        for (let y = -tileHeight + yOffset; y < canvas.height + tileHeight; y += tileHeight) {
                                            patternCtx.drawImage(processedCanvas, x, y, tileWidth, tileHeight);
                                        }
                                    }
                                    console.log(`✅ Regular layer ${i} rendered with color ${layerColor}`);
                                }
                                resolve();
                            }, layerColor, 2.2, isShadow, false, false);
                        });
                    }

                    ctx.drawImage(patternCanvas, 0, 0);
                    console.log("🔍 Pattern canvas drawn to main canvas");
                }
            }
            console.log("🔍 Finished pattern processing, moving to collection mockup check");

            console.log("🔍 Full selectedCollection:", Object.keys(appState.selectedCollection));
            console.log("🔍 selectedCollection object:", appState.selectedCollection);
            console.log("🔍 selectedCollection.mockup:", appState.selectedCollection?.mockup);
            console.log("🔍 selectedCollection.mockupShadow:", appState.selectedCollection?.mockupShadow);

            // Apply mockup overlay if exists
            if (appState.selectedCollection?.mockup) {
                const originalPath = appState.selectedCollection.mockup;
                const normalizedPath = normalizePath(originalPath);
                console.log(`🏠 Loading collection mockup:`);
                console.log(`  Original: ${originalPath}`);
                console.log(`  Normalized: ${normalizedPath}`);
                const mockupImage = new Image();
                mockupImage.crossOrigin = "Anonymous";
                mockupImage.src = normalizedPath;

                await new Promise((resolve) => {
                    mockupImage.onload = () => {
                        console.log(`✅ Collection mockup loaded: ${mockupImage.width}x${mockupImage.height}`);
                        const fit = scaleToFit(mockupImage, canvas.width, canvas.height);
                        ctx.drawImage(mockupImage, fit.x, fit.y, fit.width, fit.height);
                        console.log(`📐 Mockup drawn at: ${fit.x}, ${fit.y}, ${fit.width}x${fit.height}`);

                        console.log("🔍 selectedCollection:", appState.selectedCollection?.name);
                        console.log("🔍 selectedCollection.elements:", appState.selectedCollection?.elements);
                        resolve();
                    };
                    mockupImage.onerror = (e) => {
                        console.error(`❌ Failed to load collection mockup: ${normalizedPath}`, e);
                        console.error(`❌ Actual URL that failed: ${mockupImage.src}`);
                        resolve();
                    };
                });
            }

            // Apply shadow overlay if exists
            if (appState.selectedCollection?.mockupShadow) {
                const shadowOriginalPath = appState.selectedCollection.mockupShadow;
                const shadowNormalizedPath = normalizePath(shadowOriginalPath);
                console.log(`🌫️ Loading collection shadow:`);
                console.log(`  Original: ${shadowOriginalPath}`);
                console.log(`  Normalized: ${shadowNormalizedPath}`);
                const shadowOverlay = new Image();
                shadowOverlay.crossOrigin = "Anonymous";
                shadowOverlay.src = shadowNormalizedPath;

                await new Promise((resolve) => {
                    shadowOverlay.onload = () => {
                        console.log(`✅ Collection shadow loaded: ${shadowOverlay.width}x${shadowOverlay.height}`);
                        ctx.globalCompositeOperation = "multiply";
                        const fit = scaleToFit(shadowOverlay, canvas.width, canvas.height);
                        ctx.drawImage(shadowOverlay, fit.x, fit.y, fit.width, fit.height);
                        console.log(`🌫️ Shadow drawn at: ${fit.x}, ${fit.y}, ${fit.width}x${fit.height}`);
                        ctx.globalCompositeOperation = "source-over";
                        resolve();
                    };
                    shadowOverlay.onerror = (e) => {
                        console.error(`❌ Failed to load shadow overlay: ${shadowNormalizedPath}`, e);
                        console.error(`❌ Actual shadow URL that failed: ${shadowOverlay.src}`);
                        resolve();
                    };
                });
            } else {
                console.warn("⚠️ No mockup found for collection:", appState.selectedCollection?.name);
                console.log("🔍 Available collection properties:", Object.keys(appState.selectedCollection || {}));
            }

            // Render final canvas with CORS error handling
            let dataUrl;
            try {
                dataUrl = canvas.toDataURL("image/png");
                console.log("✅ Room mockup canvas exported successfully");
            } catch (e) {
                if (e.name === 'SecurityError') {
                    console.log("🛡️ Room mockup CORS error - using canvas directly in DOM");
                    // Instead of using dataURL, append the canvas directly
                    canvas.style.cssText = "width: 100%; height: 100%; object-fit: contain; border: 1px solid #333;";
                    dom.roomMockup.innerHTML = "";
                    dom.roomMockup.appendChild(canvas);
                    console.log("✅ Room mockup canvas appended directly to DOM");
                    ensureButtonsAfterUpdate();
                    // Reset all styling including background from fabric mode
                    dom.roomMockup.style.cssText = "width: 600px; height: 450px; position: relative; background-image: none; background-color: #434341;";
                    return; // Exit early, don't create img element
                }
                throw e; // Re-throw non-CORS errors

                try {
                    const pixel = ctx.getImageData(10, 10, 1, 1).data;
                    console.log("🎯 Sampled pixel at (10,10):", pixel);
                } catch (e) {
                    console.warn("⚠️ Pixel read failed:", e);
                }
            }

            const img = document.createElement("img");
            img.src = dataUrl;
            img.style.cssText = "width: 100%; height: 100%; object-fit: contain; border: 1px solid #333;";

            img.onload = () => {
                console.log("✅ Room mockup image loaded successfully");
            };
            img.onerror = (e) => {
                console.error("❌ Room mockup image failed to load:", e);
            };

            dom.roomMockup.innerHTML = "";
            dom.roomMockup.appendChild(img);
            console.log("✅ Room mockup image appended to DOM");
            ensureButtonsAfterUpdate();
            dom.roomMockup.style.cssText = "width: 600px; height: 450px; position: relative; background: #434341;";
        };

        await processOverlay().catch(error => {
            console.error("Error processing room mockup:", error);
        });

        console.log("✅ Room mockup rendered");

    } catch (e) {
        console.error('Error in updateRoomMockup:', e);
    }
}

/**
 * Input validation for rendering functions
 */
function validateRenderingInputs(dom, appState) {
    if (!dom) {
        console.error("🔒 VALIDATION: Missing DOM object");
        return false;
    }

    if (!dom.preview) {
        console.error("🔒 VALIDATION: Missing preview element in DOM");
        return false;
    }

    if (!appState) {
        console.error("🔒 VALIDATION: Missing appState object");
        return false;
    }

    if (!appState.currentPattern) {
        console.error("🔒 VALIDATION: Missing currentPattern in appState");
        return false;
    }

    if (!appState.selectedCollection) {
        console.error("🔒 VALIDATION: Missing selectedCollection in appState");
        return false;
    }

    return true;
}

/**
 * Get module information
 */
export function getModuleInfo() {
    return {
        name: "pattern-rendering",
        version: MODULE_VERSION,
        createdDate: CREATION_DATE,
        functions: ["updatePreview", "updateRoomMockup"],
        status: "protected",
        dependencies: [
            "dom", "appState", "lookupColor", "normalizePath", "processImage",
            "getLayerMappingForPreview", "toInitialCaps", "scaleToFit",
            "ensureButtonsAfterUpdate", "updateFurniturePreview", "USE_GUARD", "DEBUG_TRACE"
        ]
    };
}

export default {
    updatePreview,
    updateRoomMockup,
    getModuleInfo,
    version: MODULE_VERSION
};