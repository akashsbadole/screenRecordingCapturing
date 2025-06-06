// Background script for Screen Recorder & Capture Extension

class BackgroundService {
    constructor() {
        this.setupEventListeners();
        this.initializeExtension();
    }

    setupEventListeners() {
        // Handle extension installation
        chrome.runtime.onInstalled.addListener((details) => {
            this.handleInstallation(details);
        });

        // Handle messages from content scripts and popup
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open for async responses
        });

        // Handle tab updates
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            this.handleTabUpdate(tabId, changeInfo, tab);
        });

        // Handle keyboard shortcuts
        chrome.commands.onCommand.addListener((command) => {
            this.handleCommand(command);
        });
    }

    async initializeExtension() {
        // Set default settings
        const defaultSettings = {
            recordingQuality: 'high',
            includeAudio: true,
            includeSystemAudio: false,
            screenshotFormat: 'png',
            screenshotQuality: 0.8,
            autoSave: true,
            showNotifications: true,
            keyboardShortcuts: {
                startRecording: 'Ctrl+Shift+R',
                stopRecording: 'Ctrl+Shift+S',
                captureScreen: 'Ctrl+Shift+C'
            }
        };

        // Initialize settings if not exists
        chrome.storage.sync.get(['settings'], (result) => {
            if (!result.settings) {
                chrome.storage.sync.set({ settings: defaultSettings });
            }
        });

        // Initialize recent captures storage
        chrome.storage.local.get(['recentCaptures'], (result) => {
            if (!result.recentCaptures) {
                chrome.storage.local.set({ recentCaptures: [] });
            }
        });
    }

    handleInstallation(details) {
        if (details.reason === 'install') {
            // Show welcome page on first install
            chrome.tabs.create({
                url: chrome.runtime.getURL('welcome.html')
            });
        } else if (details.reason === 'update') {
            // Handle extension updates
            console.log('Extension updated to version', chrome.runtime.getManifest().version);
        }
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.action) {
                case 'startRecording':
                    await this.startRecording(message.options);
                    sendResponse({ success: true });
                    break;

                case 'stopRecording':
                    await this.stopRecording();
                    sendResponse({ success: true });
                    break;

                case 'captureTab':
                    const screenshot = await this.captureTab(sender.tab.id, message.options);
                    sendResponse({ success: true, data: screenshot });
                    break;

                case 'captureArea':
                    const areaCapture = await this.captureArea(message.area, sender.tab.id);
                    sendResponse({ success: true, data: areaCapture });
                    break;

                case 'saveCapture':
                    await this.saveCapture(message.data);
                    sendResponse({ success: true });
                    break;

                case 'getSettings':
                    const settings = await this.getSettings();
                    sendResponse({ success: true, data: settings });
                    break;

                case 'updateSettings':
                    await this.updateSettings(message.settings);
                    sendResponse({ success: true });
                    break;

                case 'getRecentCaptures':
                    const captures = await this.getRecentCaptures();
                    sendResponse({ success: true, data: captures });
                    break;

                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    handleTabUpdate(tabId, changeInfo, tab) {
        // Inject content script when tab is loaded
        if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            }).catch(() => {
                // Ignore errors for pages where content scripts can't be injected
            });
        }
    }

    async handleCommand(command) {
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        switch (command) {
            case 'start-recording':
                chrome.tabs.sendMessage(activeTab.id, { action: 'startRecording' });
                break;
            case 'stop-recording':
                chrome.tabs.sendMessage(activeTab.id, { action: 'stopRecording' });
                break;
            case 'capture-screen':
                chrome.tabs.sendMessage(activeTab.id, { action: 'captureScreen' });
                break;
        }
    }

    async startRecording(options = {}) {
        // This will be handled by the popup/content script
        // Background script mainly coordinates
        return { success: true };
    }

    async stopRecording() {
        // This will be handled by the popup/content script
        return { success: true };
    }

    async captureTab(tabId, options = {}) {
        try {
            const dataUrl = await chrome.tabs.captureVisibleTab(null, {
                format: options.format || 'png',
                quality: options.quality || 0.8
            });
            
            return dataUrl;
        } catch (error) {
            throw new Error(`Failed to capture tab: ${error.message}`);
        }
    }

    async captureArea(area, tabId) {
        // This requires coordination with content script
        // The actual area capture is done in the content script
        return { success: true };
    }

    async saveCapture(data) {
        const capture = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            type: data.type,
            filename: data.filename,
            url: data.url,
            size: data.size || 0
        };

        // Save to recent captures
        const result = await chrome.storage.local.get(['recentCaptures']);
        const captures = result.recentCaptures || [];
        captures.unshift(capture);

        // Keep only last 50 captures
        if (captures.length > 50) {
            captures.splice(50);
        }

        await chrome.storage.local.set({ recentCaptures: captures });
        
        // Show notification if enabled
        const settings = await this.getSettings();
        if (settings.showNotifications) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'Screen Recorder & Capture',
                message: `${data.type === 'recording' ? 'Recording' : 'Screenshot'} saved successfully`
            });
        }

        return capture;
    }

    async getSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['settings'], (result) => {
                resolve(result.settings || {});
            });
        });
    }

    async updateSettings(newSettings) {
        return new Promise((resolve) => {
            chrome.storage.sync.set({ settings: newSettings }, () => {
                resolve();
            });
        });
    }

    async getRecentCaptures() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['recentCaptures'], (result) => {
                resolve(result.recentCaptures || []);
            });
        });
    }

    // Utility methods
    generateFilename(type, format) {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        return `${type}-${timestamp}.${format}`;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize background service
new BackgroundService();
