class ScreenRecorderExtension {
    constructor() {
        this.isRecording = false;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.startTime = null;
        this.timerInterval = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadRecentCaptures();
    }

    initializeElements() {
        this.startRecordingBtn = document.getElementById('startRecording');
        this.stopRecordingBtn = document.getElementById('stopRecording');
        this.captureVisibleBtn = document.getElementById('captureVisible');
        this.captureAreaBtn = document.getElementById('captureArea');
        this.recordingStatus = document.getElementById('recordingStatus');
        this.recordingTime = document.getElementById('recordingTime');
        this.includeAudio = document.getElementById('includeAudio');
        this.includeSystemAudio = document.getElementById('includeSystemAudio');
        this.imageFormat = document.getElementById('imageFormat');
        this.imageQuality = document.getElementById('imageQuality');
        this.recentCaptures = document.getElementById('recentCaptures');
        this.openSettings = document.getElementById('openSettings');
    }

    bindEvents() {
        this.startRecordingBtn.addEventListener('click', () => this.startRecording());
        this.stopRecordingBtn.addEventListener('click', () => this.stopRecording());
        this.captureVisibleBtn.addEventListener('click', () => this.captureVisibleTab());
        this.captureAreaBtn.addEventListener('click', () => this.captureSelectedArea());
        this.openSettings.addEventListener('click', () => this.openSettings());
    }

    async startRecording() {
        try {
            // Request screen capture
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    mediaSource: 'screen',
                    frameRate: { ideal: 30 },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: this.includeSystemAudio.checked
            });

            // Add microphone audio if requested
            if (this.includeAudio.checked) {
                try {
                    const audioStream = await navigator.mediaDevices.getUserMedia({
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true
                        }
                    });
                    
                    // Combine streams
                    const combinedStream = new MediaStream([
                        ...stream.getVideoTracks(),
                        ...audioStream.getAudioTracks()
                    ]);
                    
                    this.setupRecording(combinedStream);
                } catch (audioError) {
                    console.warn('Microphone access denied, recording without audio:', audioError);
                    this.setupRecording(stream);
                }
            } else {
                this.setupRecording(stream);
            }

        } catch (error) {
            console.error('Error starting recording:', error);
            this.showNotification('Failed to start recording. Please try again.', 'error');
        }
    }

    setupRecording(stream) {
        this.recordedChunks = [];
        
        // Create MediaRecorder
        const options = {
            mimeType: 'video/webm;codecs=vp9,opus'
        };
        
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = 'video/webm;codecs=vp8,opus';
        }
        
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = 'video/webm';
        }

        this.mediaRecorder = new MediaRecorder(stream, options);

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.recordedChunks.push(event.data);
            }
        };

        this.mediaRecorder.onstop = () => {
            this.saveRecording();
            stream.getTracks().forEach(track => track.stop());
        };

        // Handle stream ending (user stops sharing)
        stream.getVideoTracks()[0].onended = () => {
            if (this.isRecording) {
                this.stopRecording();
            }
        };

        // Start recording
        this.mediaRecorder.start(1000); // Collect data every second
        this.isRecording = true;
        this.startTime = Date.now();
        
        this.updateUI();
        this.startTimer();
        this.showRecordingIndicator();
        
        this.showNotification('Recording started', 'success');
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.stopTimer();
            this.hideRecordingIndicator();
            this.updateUI();
            
            this.showNotification('Recording stopped', 'success');
        }
    }

    async saveRecording() {
        if (this.recordedChunks.length === 0) return;

        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const filename = `screen-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;

        // Download the file
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Save to recent captures
        this.saveToRecentCaptures({
            type: 'recording',
            filename: filename,
            url: url,
            timestamp: Date.now(),
            duration: this.getRecordingDuration()
        });

        URL.revokeObjectURL(url);
    }

    async captureVisibleTab() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
                format: this.imageFormat.value,
                quality: parseFloat(this.imageQuality.value)
            });

            this.saveScreenshot(dataUrl, 'visible-tab');
            this.showNotification('Screenshot captured', 'success');
            
        } catch (error) {
            console.error('Error capturing visible tab:', error);
            this.showNotification('Failed to capture screenshot', 'error');
        }
    }

    async captureSelectedArea() {
        try {
            // Inject content script for area selection
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });

            // Send message to content script to start area selection
            chrome.tabs.sendMessage(tab.id, { action: 'startAreaSelection' });
            
            // Close popup to allow area selection
            window.close();
            
        } catch (error) {
            console.error('Error starting area selection:', error);
            this.showNotification('Failed to start area selection', 'error');
        }
    }

    saveScreenshot(dataUrl, type) {
        const filename = `screenshot-${type}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${this.imageFormat.value}`;
        
        // Download the file
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Save to recent captures
        this.saveToRecentCaptures({
            type: 'screenshot',
            filename: filename,
            url: dataUrl,
            timestamp: Date.now(),
            format: this.imageFormat.value
        });
    }

    saveToRecentCaptures(capture) {
        chrome.storage.local.get(['recentCaptures'], (result) => {
            const captures = result.recentCaptures || [];
            captures.unshift(capture);
            
            // Keep only last 10 captures
            if (captures.length > 10) {
                captures.splice(10);
            }
            
            chrome.storage.local.set({ recentCaptures: captures }, () => {
                this.loadRecentCaptures();
            });
        });
    }

    loadRecentCaptures() {
        chrome.storage.local.get(['recentCaptures'], (result) => {
            const captures = result.recentCaptures || [];
            this.displayRecentCaptures(captures);
        });
    }

    displayRecentCaptures(captures) {
        if (captures.length === 0) {
            this.recentCaptures.innerHTML = '<p class="empty-state">No recent captures</p>';
            return;
        }

        this.recentCaptures.innerHTML = captures.map(capture => `
            <div class="capture-item" data-url="${capture.url}">
                <div class="capture-info">
                    <div class="capture-name">${capture.filename}</div>
                    <div class="capture-time">${this.formatTime(capture.timestamp)}</div>
                </div>
            </div>
        `).join('');

        // Add click handlers
        this.recentCaptures.querySelectorAll('.capture-item').forEach(item => {
            item.addEventListener('click', () => {
                const url = item.dataset.url;
                chrome.tabs.create({ url: url });
            });
        });
    }

    updateUI() {
        this.startRecordingBtn.disabled = this.isRecording;
        this.stopRecordingBtn.disabled = !this.isRecording;
        
        if (this.isRecording) {
            this.recordingStatus.querySelector('.status-text').textContent = 'Recording...';
            this.recordingStatus.classList.add('recording');
        } else {
            this.recordingStatus.querySelector('.status-text').textContent = 'Ready to record';
            this.recordingStatus.classList.remove('recording');
            this.recordingTime.textContent = '00:00';
        }
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            this.recordingTime.textContent = this.formatDuration(elapsed);
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    getRecordingDuration() {
        return this.startTime ? Date.now() - this.startTime : 0;
    }

    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    formatTime(timestamp) {
        return new Date(timestamp).toLocaleString();
    }

    showRecordingIndicator() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'showRecordingIndicator' });
        });
    }

    hideRecordingIndicator() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'hideRecordingIndicator' });
        });
    }

    showNotification(message, type = 'info') {
        // You can implement a notification system here
        console.log(`${type.toUpperCase()}: ${message}`);
    }

    openSettings() {
        chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
    }
}

// Initialize the extension when popup loads
document.addEventListener('DOMContentLoaded', () => {
    new ScreenRecorderExtension();
});
