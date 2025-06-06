class AreaSelector {
    constructor() {
        this.isSelecting = false;
        this.startX = 0;
        this.startY = 0;
        this.endX = 0;
        this.endY = 0;
        this.overlay = null;
        this.selectionBox = null;
        this.instructions = null;
        
        this.init();
    }

    init() {
        this.createOverlay();
        this.bindEvents();
        this.showInstructions();
    }

    createOverlay() {
        // Create main overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'screen-capture-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.3);
            z-index: 999999;
            cursor: crosshair;
            user-select: none;
        `;

        // Create selection box
        this.selectionBox = document.createElement('div');
        this.selectionBox.id = 'selection-box';
        this.selectionBox.style.cssText = `
            position: absolute;
            border: 2px solid #4285f4;
            background: rgba(66, 133, 244, 0.1);
            display: none;
            pointer-events: none;
        `;

        // Create instructions
        this.instructions = document.createElement('div');
        this.instructions.id = 'capture-instructions';
        this.instructions.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            z-index: 1000000;
            backdrop-filter: blur(10px);
        `;
        this.instructions.textContent = 'Click and drag to select area to capture. Press ESC to cancel.';

        // Add elements to page
        this.overlay.appendChild(this.selectionBox);
        document.body.appendChild(this.overlay);
        document.body.appendChild(this.instructions);
    }

    bindEvents() {
        // Mouse events
        this.overlay.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.overlay.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.overlay.addEventListener('mouseup', this.handleMouseUp.bind(this));

        // Keyboard events
        document.addEventListener('keydown', this.handleKeyDown.bind(this));

        // Prevent context menu
        this.overlay.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    handleMouseDown(e) {
        e.preventDefault();
        this.isSelecting = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.endX = e.clientX;
        this.endY = e.clientY;

        this.selectionBox.style.display = 'block';
        this.updateSelectionBox();
        this.updateInstructions('Release mouse to capture selected area');
    }

    handleMouseMove(e) {
        if (!this.isSelecting) return;

        e.preventDefault();
        this.endX = e.clientX;
        this.endY = e.clientY;
        this.updateSelectionBox();
    }

    handleMouseUp(e) {
        if (!this.isSelecting) return;

        e.preventDefault();
        this.isSelecting = false;

        const width = Math.abs(this.endX - this.startX);
        const height = Math.abs(this.endY - this.startY);

        // Minimum selection size
        if (width < 10 || height < 10) {
            this.updateInstructions('Selection too small. Try again or press ESC to cancel.');
            this.selectionBox.style.display = 'none';
            return;
        }

        this.captureSelectedArea();
    }

    handleKeyDown(e) {
        if (e.key === 'Escape') {
            this.cancel();
        }
    }

    updateSelectionBox() {
        const left = Math.min(this.startX, this.endX);
        const top = Math.min(this.startY, this.endY);
        const width = Math.abs(this.endX - this.startX);
        const height = Math.abs(this.endY - this.startY);

        this.selectionBox.style.left = left + 'px';
        this.selectionBox.style.top = top + 'px';
        this.selectionBox.style.width = width + 'px';
        this.selectionBox.style.height = height + 'px';
    }

    updateInstructions(text) {
        this.instructions.textContent = text;
    }

    showInstructions() {
        this.instructions.style.animation = 'fadeIn 0.3s ease-in-out';
    }

    async captureSelectedArea() {
        try {
            this.updateInstructions('Capturing selected area...');

            // Calculate selection bounds
            const left = Math.min(this.startX, this.endX);
            const top = Math.min(this.startY, this.endY);
            const width = Math.abs(this.endX - this.startX);
            const height = Math.abs(this.endY - this.startY);

            // Hide overlay temporarily for clean capture
            this.overlay.style.display = 'none';
            this.instructions.style.display = 'none';

            // Wait a moment for UI to update
            await new Promise(resolve => setTimeout(resolve, 100));

            // Capture the full screen first
            const response = await new Promise((resolve) => {
                chrome.runtime.sendMessage({
                    action: 'captureVisibleTab',
                    format: 'png',
                    quality: 100
                }, resolve);
            });

            if (response.error) {
                throw new Error(response.error);
            }

            // Create canvas to crop the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Calculate device pixel ratio for high-DPI displays
                const dpr = window.devicePixelRatio || 1;
                
                // Set canvas size to selection size
                canvas.width = width * dpr;
                canvas.height = height * dpr;
                
                // Scale context for high-DPI
                ctx.scale(dpr, dpr);
                
                // Draw the cropped portion
                ctx.drawImage(
                    img,
                    left * dpr, top * dpr, width * dpr, height * dpr,
                    0, 0, width, height
                );

                // Convert to blob and download
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const filename = `area-capture-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
                    
                    chrome.runtime.sendMessage({
                        action: 'saveCapture',
                        dataUrl: url,
                        filename: filename,
                        saveAs: true
                    }, (response) => {
                        if (response.error) {
                            console.error('Error saving capture:', response.error);
                            this.showError('Failed to save capture');
                        } else {
                            this.showSuccess('Area captured successfully!');
                        }
                        
                        // Clean up
                        URL.revokeObjectURL(url);
                        this.cleanup();
                    });
                }, 'image/png', 1.0);
            };

            img.onerror = () => {
                this.showError('Failed to process capture');
                this.cleanup();
            };

            img.src = response.dataUrl;

        } catch (error) {
            console.error('Error capturing area:', error);
            this.showError('Failed to capture area');
            this.cleanup();
        }
    }

    showSuccess(message) {
        this.showNotification(message, '#4caf50');
    }

    showError(message) {
        this.showNotification(message, '#f44336');
    }

    showNotification(message, color) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${color};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            z-index: 1000001;
            animation: slideIn 0.3s ease-in-out;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    cancel() {
        this.cleanup();
    }

    cleanup() {
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));

        // Remove elements
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
        if (this.instructions && this.instructions.parentNode) {
            this.instructions.parentNode.removeChild(this.instructions);
        }

        // Reset state
        this.isSelecting = false;
        this.overlay = null;
        this.selectionBox = null;
        this.instructions = null;
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    
    @keyframes slideIn {
        from { opacity: 0; transform: translateX(100%); }
        to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes slideOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100%); }
    }
`;
document.head.appendChild(style);

// Initialize area selector
new AreaSelector();
