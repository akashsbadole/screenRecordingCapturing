class ScreenRecorderPopup {
  constructor() {
    this.isRecording = false;
    this.isPaused = false;
    this.recordingStartTime = null;
    this.recordingTimer = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];

    this.init();
  }

  init() {
    this.bindEvents();
    this.loadSettings();
    this.updateUI();
    this.checkRecordingStatus();
  }

  bindEvents() {
    // Main action buttons
    document
      .getElementById("startRecording")
      .addEventListener("click", () => this.startRecording());
    document
      .getElementById("captureScreen")
      .addEventListener("click", () => this.captureFullScreen());
    document
      .getElementById("captureArea")
      .addEventListener("click", () => this.captureArea());

    // Recording controls
    document
      .getElementById("pauseRecording")
      .addEventListener("click", () => this.pauseRecording());
    document
      .getElementById("stopRecording")
      .addEventListener("click", () => this.stopRecording());

    // Settings
    document
      .getElementById("toggleSettings")
      .addEventListener("click", () => this.toggleSettings());

    // Footer actions
    document
      .getElementById("openWebApp")
      .addEventListener("click", () => this.openWebApp());
    document
      .getElementById("viewHistory")
      .addEventListener("click", () => this.viewHistory());

    // Settings change handlers
    document
      .getElementById("videoQuality")
      .addEventListener("change", () => this.saveSettings());
    document
      .getElementById("frameRate")
      .addEventListener("change", () => this.saveSettings());
    document
      .getElementById("outputFormat")
      .addEventListener("change", () => this.saveSettings());
    document
      .getElementById("includeAudio")
      .addEventListener("change", () => this.saveSettings());
    document
      .getElementById("includeMicrophone")
      .addEventListener("change", () => this.saveSettings());
    document
      .getElementById("showCursor")
      .addEventListener("change", () => this.saveSettings());
  }

  async startRecording() {
    try {
      this.updateStatus("Starting recording...", "capturing");

      // Request screen capture
      const stream = await this.getScreenStream();
      if (!stream) {
        this.updateStatus("Recording cancelled", "ready");
        return;
      }

      // Setup media recorder
      this.setupMediaRecorder(stream);

      // Start recording
      this.mediaRecorder.start();
      this.isRecording = true;
      this.recordingStartTime = Date.now();

      // Update UI
      this.updateUI();
      this.startTimer();
      this.updateStatus("Recording...", "recording");

      // Notify background script
      chrome.runtime.sendMessage({
        action: "recordingStarted",
        settings: this.getSettings(),
      });
    } catch (error) {
      console.error("Error starting recording:", error);
      this.updateStatus("Error starting recording", "ready");
      this.showNotification(
        "Failed to start recording. Please try again.",
        "error"
      );
    }
  }

  async getScreenStream() {
    const settings = this.getSettings();

    // Get video constraints based on quality
    const videoConstraints = this.getVideoConstraints(
      settings.videoQuality,
      settings.frameRate
    );

    try {
      // Request desktop capture
      const streamId = await new Promise((resolve, reject) => {
        chrome.desktopCapture.chooseDesktopMedia(
          ["screen", "window", "tab"],
          (streamId) => {
            if (streamId) {
              resolve(streamId);
            } else {
              reject(new Error("User cancelled screen selection"));
            }
          }
        );
      });

      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          mandatory: {
            chromeMediaSource: "desktop",
            chromeMediaSourceId: streamId,
            ...videoConstraints,
          },
        },
        audio: settings.includeAudio,
      });

      // Add microphone if enabled
      if (settings.includeMicrophone) {
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const audioContext = new AudioContext();
        const destination = audioContext.createMediaStreamDestination();

        // Mix system audio and microphone
        if (stream.getAudioTracks().length > 0) {
          const systemAudio = audioContext.createMediaStreamSource(stream);
          systemAudio.connect(destination);
        }

        const micAudio = audioContext.createMediaStreamSource(micStream);
        micAudio.connect(destination);

        // Replace audio track
        stream.getAudioTracks().forEach((track) => stream.removeTrack(track));
        destination.stream
          .getAudioTracks()
          .forEach((track) => stream.addTrack(track));
      }

      return stream;
    } catch (error) {
      console.error("Error getting screen stream:", error);
      throw error;
    }
  }

  getVideoConstraints(quality, frameRate) {
    const constraints = {
      maxFrameRate: parseInt(frameRate),
    };

    switch (quality) {
      case "720p":
        constraints.maxWidth = 1280;
        constraints.maxHeight = 720;
        break;
      case "1080p":
        constraints.maxWidth = 1920;
        constraints.maxHeight = 1080;
        break;
      case "1440p":
        constraints.maxWidth = 2560;
        constraints.maxHeight = 1440;
        break;
      case "4k":
        constraints.maxWidth = 3840;
        constraints.maxHeight = 2160;
        break;
    }

    return constraints;
  }

  setupMediaRecorder(stream) {
    const settings = this.getSettings();
    const mimeType =
      settings.outputFormat === "mp4" ? "video/mp4" : "video/webm";

    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: mimeType,
      videoBitsPerSecond: this.getBitrate(settings.videoQuality),
    });

    this.recordedChunks = [];

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
        this.updateRecordingSize();
      }
    };

    this.mediaRecorder.onstop = () => {
      this.saveRecording();
    };

    this.mediaRecorder.onerror = (error) => {
      console.error("MediaRecorder error:", error);
      this.stopRecording();
    };
  }

  getBitrate(quality) {
    switch (quality) {
      case "720p":
        return 2500000; // 2.5 Mbps
      case "1080p":
        return 5000000; // 5 Mbps
      case "1440p":
        return 8000000; // 8 Mbps
      case "4k":
        return 15000000; // 15 Mbps
      default:
        return 5000000;
    }
  }

  pauseRecording() {
    if (this.mediaRecorder && this.isRecording && !this.isPaused) {
      this.mediaRecorder.pause();
      this.isPaused = true;
      this.updateStatus("Recording paused", "recording");
      this.updateUI();
    }
  }

  resumeRecording() {
    if (this.mediaRecorder && this.isRecording && this.isPaused) {
      this.mediaRecorder.resume();
      this.isPaused = false;
      this.updateStatus("Recording...", "recording");
      this.updateUI();
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.isPaused = false;

      // Stop all tracks
      this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());

      this.stopTimer();
      this.updateUI();
      this.updateStatus("Processing recording...", "capturing");

      chrome.runtime.sendMessage({ action: "recordingStopped" });
    }
  }

  async saveRecording() {
    try {
      const blob = new Blob(this.recordedChunks, {
        type:
          this.getSettings().outputFormat === "mp4"
            ? "video/mp4"
            : "video/webm",
      });

      const url = URL.createObjectURL(blob);
      const filename = `screen-recording-${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-")}.${this.getSettings().outputFormat}`;

      // Download the file
      chrome.downloads.download(
        {
          url: url,
          filename: filename,
          saveAs: true,
        },
        (downloadId) => {
          if (downloadId) {
            this.updateStatus("Recording saved successfully", "ready");
            this.showNotification("Recording saved successfully!", "success");
          } else {
            this.updateStatus("Error saving recording", "ready");
            this.showNotification("Error saving recording", "error");
          }
        }
      );
    } catch (error) {
      console.error("Error saving recording:", error);
      this.updateStatus("Error saving recording", "ready");
      this.showNotification("Error saving recording", "error");
    }
  }

  async captureFullScreen() {
    try {
      this.updateStatus("Capturing screen...", "capturing");

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
        if (dataUrl) {
          this.downloadImage(dataUrl, "screenshot");
          this.updateStatus("Screenshot captured", "ready");
          this.showNotification("Screenshot captured successfully!", "success");
        } else {
          this.updateStatus("Error capturing screenshot", "ready");
          this.showNotification("Error capturing screenshot", "error");
        }
      });
    } catch (error) {
      console.error("Error capturing screen:", error);
      this.updateStatus("Error capturing screenshot", "ready");
    }
  }

  async captureArea() {
    try {
      this.updateStatus("Select area to capture...", "capturing");

      // Close popup and inject area selector
      window.close();

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["area-selector.js"],
      });
    } catch (error) {
      console.error("Error starting area capture:", error);
      this.updateStatus("Error starting area capture", "ready");
    }
  }

  downloadImage(dataUrl, type) {
    const filename = `${type}-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, "-")}.png`;

    chrome.downloads.download({
      url: dataUrl,
      filename: filename,
      saveAs: true,
    });
  }

  startTimer() {
    this.recordingTimer = setInterval(() => {
      const elapsed = Date.now() - this.recordingStartTime;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);

      document.getElementById("recordingTimer").textContent = `${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }, 1000);
  }

  stopTimer() {
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
    }
  }

  updateRecordingSize() {
    const totalSize = this.recordedChunks.reduce(
      (size, chunk) => size + chunk.size,
      0
    );
    const sizeInMB = (totalSize / (1024 * 1024)).toFixed(1);
    document.getElementById("recordingSize").textContent = `${sizeInMB} MB`;
  }

  updateUI() {
    const quickActions = document.querySelector(".quick-actions");
    const recordingControls = document.getElementById("recordingControls");
    const pauseBtn = document.getElementById("pauseRecording");

    if (this.isRecording) {
      quickActions.style.display = "none";
      recordingControls.style.display = "block";

      if (this.isPaused) {
        pauseBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="5,3 19,12 5,21 5,3"/>
                    </svg>
                    Resume
                `;
        pauseBtn.onclick = () => this.resumeRecording();
      } else {
        pauseBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="6" y="4" width="4" height="16"/>
                        <rect x="14" y="4" width="4" height="16"/>
                    </svg>
                    Pause
                `;
        pauseBtn.onclick = () => this.pauseRecording();
      }
    } else {
      quickActions.style.display = "flex";
      recordingControls.style.display = "none";
    }
  }

  updateStatus(text, state = "ready") {
    const statusIndicator = document.getElementById("statusIndicator");
    const statusText = document.getElementById("statusText");

    statusText.textContent = text;
    statusIndicator.className = `status-indicator ${state}`;
  }

  showNotification(message, type = "info") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Screen Recorder Pro",
      message: message,
    });
  }

  toggleSettings() {
    const content = document.getElementById("settingsContent");
    const isVisible = content.style.display !== "none";
    content.style.display = isVisible ? "none" : "block";
  }

  getSettings() {
    return {
      videoQuality: document.getElementById("videoQuality").value,
      frameRate: document.getElementById("frameRate").value,
      outputFormat: document.getElementById("outputFormat").value,
      includeAudio: document.getElementById("includeAudio").checked,
      includeMicrophone: document.getElementById("includeMicrophone").checked,
      showCursor: document.getElementById("showCursor").checked,
      captureMode: this.captureMode || "fullscreen",
      enableAnnotations: this.enableAnnotations || false,
      recordingTimer: this.recordingTimer || false,
      cursorHighlight: this.cursorHighlight || true,
      autoZoom: this.autoZoom || false,
      watermark: this.watermark || false,
    };
  }

  saveSettings() {
    const settings = this.getSettings();
    chrome.storage.sync.set({ screenRecorderSettings: settings });
  }

  loadSettings() {
    chrome.storage.sync.get(["screenRecorderSettings"], (result) => {
      if (result.screenRecorderSettings) {
        const settings = result.screenRecorderSettings;

        document.getElementById("videoQuality").value =
          settings.videoQuality || "1080p";
        document.getElementById("frameRate").value = settings.frameRate || "60";
        document.getElementById("outputFormat").value =
          settings.outputFormat || "webm";
        document.getElementById("includeAudio").checked =
          settings.includeAudio !== false;
        document.getElementById("includeMicrophone").checked =
          settings.includeMicrophone || false;
        document.getElementById("showCursor").checked =
          settings.showCursor !== false;
      }
    });
  }

  checkRecordingStatus() {
    chrome.runtime.sendMessage({ action: "getRecordingStatus" }, (response) => {
      if (response && response.isRecording) {
        this.isRecording = true;
        this.recordingStartTime = response.startTime;
        this.updateUI();
        this.startTimer();
        this.updateStatus("Recording...", "recording");
      }
    });
  }

  openWebApp() {
    chrome.tabs.create({ url: "http://localhost:3000" });
  }

  viewHistory() {
    chrome.tabs.create({ url: chrome.runtime.getURL("history.html") });
  }
}

// Initialize popup when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ScreenRecorderPopup();
});
