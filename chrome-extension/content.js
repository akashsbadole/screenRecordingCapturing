// Content script for Screen Recorder & Capture Extension

class ContentScriptManager {
    constructor() {
        this.isSelecting = false;
        this.selectionOverlay = null;
        this.recordingIndicator = null;
        this.startPoint = null;
        this.endPoint = null;
        
        this.setupMessageListener();
        this.createRecordingIndicator();
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true;
        });
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.action) {
                case 'startAreaSelection':
                    this.startAreaSelection();
                    sendResponse({ success: true });
                    break;

                case 'captureArea':
                    const result = await this.captureSelectedArea(message.area);
                    sendResponse({ success: true, data: result });
                    break;

                case 'showRecordingIndicator':
                    this.showRecordingIndicator();
                    sendResponse({ success: true });
                    break;

                case 'hideRecordingIndicator':
                    this.hideRecordingIndicator();
                    sendResponse({ success: true });
                    break;

                case 'startRecording':
                    // Trigger recording from keyboard shortcut
                    this.triggerRecording();
                    sendResponse({ success: true });
                    break;

                case 'captureScreen':
                    // Trigger screenshot from keyboard shortcut
                    this.triggerScreenshot();
                    sendResponse({ success: true });
                    break;

                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Content script error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    startAreaSelection() {
        if (this.isSelecting) return;

        this.isSelecting = true;
        this.createSelectionOverlay();
        this.bindSelectionEvents();
        
        // Show instructions
        this.showSelectionInstructions();
    }

    createSelectionOverlay() {
        // Remove existing overlay
        if (this.selectionOverlay) {
            this.selectionOverlay.remove();
        }

        // Create overlay container
        this.selectionOverlay = document.createElement('div');
        this.selectionOverlay.id = 'screen-capture-overlay';
        this.selectionOverlay.style.cssText = `
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
        this.selectionBox.style.cssText = `
            position: absolute;
            border: 2px dashed #3b82f6;
            background: rgba(59, 130, 246, 0.1);
            display: none;
            pointer-events: none;
        `;

        this.selectionOverlay.appendChild(this.selectionBox);
        document.body.appendChild(this.selectionOverlay);
    }

    bindSelectionEvents() {
        let isDrawing = false;

        this.selectionOverlay.addEventListener('mousedown', (e) => {
            isDrawing = true;
            this.startPoint = { x: e.clientX, y: e.clientY };
            this.selectionBox.style.display = 'block';
            this.updateSelectionBox(e.clientX, e.clientY);
        });

        this.selectionOverlay.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            this.updateSelectionBox(e.clientX, e.clientY);
        });

        this.selectionOverlay.addEventListener('mouseup', (e) => {
            if (!isDrawing) return;
            isDrawing = false;
            this.endPoint = { x: e.clientX, y: e.clientY };
            this.completeSelection();
        });

        // Cancel selection on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isSelecting) {
                this.cancelSelection();
            }
        });
    }

    updateSelectionBox(currentX, currentY) {
        if (!this.startPoint) return;

        const left = Math.min(this.startPoint.x, currentX);
        const top = Math.min(this.startPoint.y, currentY);
        const width = Math.abs(currentX - this.startPoint.x);
        const height = Math.abs(currentY - this.startPoint.y);

        this.selectionBox.style.left = left + 'px';
        this.selectionBox.style.top = top + 'px';
        this.selectionBox.style.width = width + 'px';
        this.selectionBox.style.height = height + 'px';
    }

    async completeSelection() {
        if (!this.startPoint || !this.endPoint) {
            this.cancelSelection();
            return;
        }

        const area = {
            x: Math.min(this.startPoint.x, this.endPoint.x),
            y: Math.min(this.startPoint.y, this.endPoint.y),
            width: Math.abs(this.endPoint.x - this.startPoint.x),
            height: Math.abs(this.endPoint.y - this.startPoint.y)
        };

        // Minimum selection size
        if (area.width < 10 || area.height < 10) {
            this.showNotification('Selection too small. Please select a larger area.', 'warning');
            this.cancelSelection();
            return;
        }

        this.cleanupSelection();
        await this.captureSelectedArea(area);
    }

    async captureSelectedArea(area) {
        try {
            // First capture the entire visible tab
            const response = await chrome.runtime.sendMessage({
                action: 'captureTab',
                options: { format: 'png', quality: 1.0 }
            });

            if (!response.success) {
                throw new Error('Failed to capture tab');
            }

            // Create canvas to crop the selected area
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            return new Promise((resolve, reject) => {
                img.onload = () => {
                    // Calculate device pixel ratio for high-DPI displays
                    const dpr = window.devicePixelRatio || 1;
                    
                    // Set canvas size to match selected area
                    canvas.width = area.width * dpr;
                    canvas.height = area.height * dpr;
                    
                    // Scale context for high-DPI
                    ctx.scale(dpr, dpr);
                    
                    // Draw the cropped area
                    ctx.drawImage(
                        img,
                        area.x * dpr, area.y * dpr, area.width * dpr, area.height * dpr,
                        0, 0, area.width, area.height
                    );

                    // Convert to data URL
                    const croppedDataUrl = canvas.toDataURL('image/png', 1.0);
                    
                    // Download the cropped image
                    this.downloadImage(croppedDataUrl, 'selected-area');
                    
                    this.showNotification('Area captured successfully!', 'success');
                    resolve(croppedDataUrl);
                };

                img.onerror = () => {
                    reject(new Error('Failed to load captured image'));
                };

                img.src = response.data;
            });

        } catch (error) {
            console.error('Error capturing selected area:', error);
            this.showNotification('Failed to capture selected area', 'error');
            throw error;
        }
    }

    downloadImage(dataUrl, type) {
        const filename = `screenshot-${type}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
        
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Save to extension storage
        chrome.runtime.sendMessage({
            action: 'saveCapture',
            data: {
                type: 'screenshot',
                filename: filename,
                url: dataUrl,
                timestamp: Date.now()
            }
        });
    }

    cancelSelection() {
        this.cleanupSelection();
        this.showNotification('Selection cancelled', 'info');
    }

    cleanupSelection() {
        this.isSelecting = false;
        this.startPoint = null;
        this.endPoint = null;
        
        if (this.selectionOverlay) {
            this.selectionOverlay.remove();
            this.selectionOverlay = null;
        }
    }

    showSelectionInstructions() {
        const instructions = document.createElement('div');
        instructions.style.cssText = `
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
            pointer-events: none;
        `;
        instructions.textContent = 'Click and drag to select an area. Press Escape to cancel.';
        
        document.body.appendChild(instructions);
        
        // Remove instructions after 3 seconds
        setTimeout(() => {
            if (instructions.parentNode) {
                instructions.remove();
            }
        }, 3000);
    }

    createRecordingIndicator() {
        this.recordingIndicator = document.createElement('div');
        this.recordingIndicator.id = 'recording-indicator';
        this.recordingIndicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 12px;
            font-weight: 600;
            z-index: 1000000;
            display: none;
            align-items: center;
            gap: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        `;

        const dot = document.createElement('div');
        dot.style.cssText = `
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
            animation: pulse 1s infinite;
        `;

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        `;
        document.head.appendChild(style);

        this.recordingIndicator.appendChild(dot);
        this.recordingIndicator.appendChild(document.createTextNode('Recording'));
        document.body.appendChild(this.recordingIndicator);
    }

    showRecordingIndicator() {
        if (this.recordingIndicator) {
            this.recordingIndicator.style.display = 'flex';
        }
    }

    hideRecordingIndicator() {
        if (this.recordingIndicator) {
            this.recordingIndicator.style.display = 'none';
        }
    }

    triggerRecording() {
        // This would typically open the extension popup or trigger recording
        chrome.runtime.sendMessage({ action: 'openPopup' });
    }

    triggerScreenshot() {
        // Capture visible tab immediately
        chrome.runtime.sendMessage({
            action: 'captureTab',
            options: { format: 'png', quality: 0.8 }
        }).then(response => {
            if (response.success) {
                this.downloadImage(response.data, 'quick-capture');
            }
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            z-index: 1000001;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
}

// Initialize content script
if (typeof window !== 'undefined' && !window.screenCaptureContentScript) {
    window.screenCaptureContentScript = new ContentScriptManager();
}
