class ScreenRecorderBackground {
    constructor() {
        this.recordingState = {
            isRecording: false,
            startTime: null,
            tabId: null,
            settings: null
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupContextMenus();
        this.setupKeyboardShortcuts();
    }

    setupEventListeners() {
        // Extension installation
        chrome.runtime.onInstalled.addListener(() => {
            console.log('Screen Recorder & Capture Pro extension installed');
            this.showWelcomeNotification();
        });

        // Message handling
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Will respond asynchronously
        });

        // Tab updates
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && this.recordingState.isRecording) {
                this.updateRecordingBadge();
            }
        });

        // Extension startup
        chrome.runtime.onStartup.addListener(() => {
            this.recordingState.isRecording = false;
            this.updateRecordingBadge();
        });
    }

    setupContextMenus() {
        chrome.contextMenus.create({
            id: 'screenRecorderMenu',
            title: 'Screen Recorder Pro',
            contexts: ['page']
        });

        chrome.contextMenus.create({
            id: 'startRecording',
            parentId: 'screenRecorderMenu',
            title: 'Start Recording',
            contexts: ['page']
        });

        chrome.contextMenus.create({
            id: 'captureScreen',
            parentId: 'screenRecorderMenu',
            title: 'Capture Full Screen',
            contexts: ['page']
        });

        chrome.contextMenus.create({
            id: 'captureArea',
            parentId: 'screenRecorderMenu',
            title: 'Capture Selected Area',
            contexts: ['page']
        });

        chrome.contextMenus.onClicked.addListener((info, tab) => {
            this.handleContextMenuClick(info, tab);
        });
    }

    setupKeyboardShortcuts() {
        chrome.commands.onCommand.addListener((command) => {
            this.handleKeyboardShortcut(command);
        });
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'recordingStarted':
                    await this.handleRecordingStarted(request, sender);
                    sendResponse({ success: true });
                    break;

                case 'recordingStopped':
                    await this.handleRecordingStopped();
                    sendResponse({ success: true });
                    break;

                case 'getRecordingStatus':
                    sendResponse({
                        isRecording: this.recordingState.isRecording,
                        startTime: this.recordingState.startTime
                    });
                    break;

                case 'captureVisibleTab':
                    await this.handleCaptureVisibleTab(request, sendResponse);
                    break;

                case 'requestDesktopCapture':
                    await this.handleDesktopCaptureRequest(sendResponse);
                    break;

                case 'saveCapture':
                    await this.handleSaveCapture(request, sendResponse);
                    break;

                default:
                    sendResponse({ error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ error: error.message });
        }
    }

    async handleRecordingStarted(request, sender) {
        this.recordingState.isRecording = true;
        this.recordingState.startTime = Date.now();
        this.recordingState.tabId = sender.tab?.id;
        this.recordingState.settings = request.settings;

        this.updateRecordingBadge();
        this.showNotification('Recording started', 'Recording has begun successfully');
    }

    async handleRecordingStopped() {
        this.recordingState.isRecording = false;
        this.recordingState.startTime = null;
        this.recordingState.tabId = null;
        this.recordingState.settings = null;

        this.updateRecordingBadge();
        this.showNotification('Recording stopped', 'Recording has been saved');
    }

    async handleCaptureVisibleTab(request, sendResponse) {
        try {
            const dataUrl = await new Promise((resolve) => {
                chrome.tabs.captureVisibleTab(null, { 
                    format: request.format || 'png',
                    quality: request.quality || 100
                }, resolve);
            });

            sendResponse({ dataUrl });
        } catch (error) {
            sendResponse({ error: error.message });
        }
    }

    async handleDesktopCaptureRequest(sendResponse) {
        try {
            const streamId = await new Promise((resolve) => {
                chrome.desktopCapture.chooseDesktopMedia(
                    ['screen', 'window', 'tab'], 
                    resolve
                );
            });

            sendResponse({ streamId });
        } catch (error) {
            sendResponse({ error: error.message });
        }
    }

    async handleSaveCapture(request, sendResponse) {
        try {
            const downloadId = await new Promise((resolve) => {
                chrome.downloads.download({
                    url: request.dataUrl,
                    filename: request.filename,
                    saveAs: request.saveAs || false
                }, resolve);
            });

            sendResponse({ downloadId });
        } catch (error) {
            sendResponse({ error: error.message });
        }
    }

    async handleContextMenuClick(info, tab) {
        switch (info.menuItemId) {
            case 'startRecording':
                await this.triggerRecording(tab);
                break;
            case 'captureScreen':
                await this.triggerScreenCapture(tab);
                break;
            case 'captureArea':
                await this.triggerAreaCapture(tab);
                break;
        }
    }

    async handleKeyboardShortcut(command) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        switch (command) {
            case 'start-recording':
                await this.triggerRecording(tab);
                break;
            case 'capture-screenshot':
                await this.triggerScreenCapture(tab);
                break;
            case 'capture-area':
                await this.triggerAreaCapture(tab);
                break;
        }
    }

    async triggerRecording(tab) {
        try {
            if (this.recordingState.isRecording) {
                // Stop recording
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => {
                        window.postMessage({ type: 'STOP_RECORDING' }, '*');
                    }
                });
            } else {
                // Start recording
                chrome.action.openPopup();
            }
        } catch (error) {
            console.error('Error triggering recording:', error);
        }
    }

    async triggerScreenCapture(tab) {
        try {
            const dataUrl = await new Promise((resolve) => {
                chrome.tabs.captureVisibleTab(null, { format: 'png' }, resolve);
            });

            if (dataUrl) {
                const filename = `screenshot-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
                
                chrome.downloads.download({
                    url: dataUrl,
                    filename: filename,
                    saveAs: true
                });

                this.showNotification('Screenshot captured', 'Screenshot saved successfully');
            }
        } catch (error) {
            console.error('Error capturing screen:', error);
            this.showNotification('Error', 'Failed to capture screenshot');
        }
    }

    async triggerAreaCapture(tab) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['area-selector.js']
            });
        } catch (error) {
            console.error('Error triggering area capture:', error);
        }
    }

    updateRecordingBadge() {
        if (this.recordingState.isRecording) {
            chrome.action.setBadgeText({ text: 'REC' });
            chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
            chrome.action.setTitle({ title: 'Recording in progress - Click to stop' });
        } else {
            chrome.action.setBadgeText({ text: '' });
            chrome.action.setTitle({ title: 'Screen Recorder & Capture Pro' });
        }
    }

    showNotification(title, message) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: title,
            message: message
        });
    }

    showWelcomeNotification() {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'Screen Recorder Pro Installed',
            message: 'Click the extension icon to start recording or capturing screenshots!'
        });
    }
}

// Initialize background script
new ScreenRecorderBackground();
