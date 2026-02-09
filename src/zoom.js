if (roomMockupDiv && !document.getElementById('clothingZoomControls')) {
    const zoomControls = document.createElement('div');
    zoomControls.id = 'clothingZoomControls';
    zoomControls.style.cssText = `
        position: absolute;
        bottom: 10px;
        left: 10px;
        display: flex;
        gap: 8px;
        z-index: 1000;
    `;

    // Utility for zoom control
    const createZoomButton = (label, title, direction) => {
        const button = document.createElement('button');
        button.innerHTML = label;
        button.title = title;
        button.style.cssText = `
            background: rgba(110, 110, 110, 0.9);
            color: #000000ff;
            border: 2px solid #d4af37;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: all 0.3s ease;
        `;

        let intervalId;

        const updateZoom = () => {
            const canvas = roomMockupDiv.querySelector('canvas');
            if (canvas) {
                let currentScale = parseFloat(canvas.dataset.zoomScale || '1.0');
                const step = 0.01;
                const minScale = 0.25;
                const maxScale = 1.0;

                if (direction === 'in') {
                    currentScale = Math.min(maxScale, currentScale + step);
                } else {
                    currentScale = Math.max(minScale, currentScale - step);
                }

                canvas.dataset.zoomScale = currentScale.toFixed(2);
                canvas.style.setProperty('transform', `scale(${currentScale})`, 'important');
                canvas.style.setProperty('transform-origin', 'center', 'important');
                console.log(`🔍 Zoom ${direction}: ${currentScale * 100}%`);
            }
        };

        // Hold-to-zoom behavior
        button.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            updateZoom();
            intervalId = setInterval(updateZoom, 50); // Smooth update every 50ms
        });

        ['mouseup', 'mouseleave'].forEach(event =>
            button.addEventListener(event, () => clearInterval(intervalId))
        );

        // Hover effect
        button.addEventListener('mouseenter', () => {
            button.style.background = 'rgba(220, 220, 220, 1)';
            button.style.transform = 'scale(1.05)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.background = 'rgba(110, 110, 110, 0.9)';
            button.style.transform = 'scale(1)';
        });

        return button;
    };

    const zoomOutBtn = createZoomButton('🔍-', 'Zoom Out (hold to scale down)', 'out');
    const zoomInBtn = createZoomButton('🔍+', 'Zoom In (hold to scale up)', 'in');

    zoomControls.appendChild(zoomOutBtn);
    zoomControls.appendChild(zoomInBtn);
    roomMockupDiv.appendChild(zoomControls);
    console.log('✅ Added zoom controls for clothing mockup');
}
