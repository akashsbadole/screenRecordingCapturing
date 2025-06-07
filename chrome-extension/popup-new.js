class ScreenRecorderPopup {
  constructor() {
    this.isRecording = false;
    this.isPaused = false;
    this.recordingStartTime = null;
    this.recordingTimer = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.currentMode = "recording";
    this.imageEditor = null;

    // Feature modules
    this.annotationOverlay = null;
    this.effectsProcessor = null;
    this.gifCreator = null;
    this.featuresLoaded = false;

    this.init();
  }

  async init() {
    this.bindEvents();
    this.loadSettings();

    // 🔄 RESTORE STATE: Load recording state from storage
    await this.restoreRecordingState();

    this.updateUI();
    this.checkRecordingStatus();

    // Set up state preservation when popup closes
    this.setupStatePreservation();

    // Temporarily disable feature module loading to ensure basic functionality works
    // this.loadFeatureModules();
    console.log("Screen Recorder popup initialized successfully");
  }

  async loadFeatureModules() {
    try {
      // Load annotation overlay
      await this.loadScript("annotation-overlay.js");
      this.annotationOverlay = window.annotationOverlay;

      // Load effects processor
      await this.loadScript("effects-processor.js");
      this.effectsProcessor = window.effectsProcessor;

      // Load GIF creator
      await this.loadScript("gif-creator.js");
      this.gifCreator = window.gifCreator;

      this.featuresLoaded = true;
      console.log("All feature modules loaded successfully");

      // Enable advanced features in UI
      this.enableAdvancedFeatures();
    } catch (error) {
      console.error("Error loading feature modules:", error);
      this.showNotification(
        "Some advanced features may not be available",
        "warning"
      );
    }
  }

  enableAdvancedFeatures() {
    // Enable annotation buttons
    const annotationBtn = document.getElementById("recordWithAnnotations");
    if (annotationBtn) {
      annotationBtn.disabled = false;
      annotationBtn.style.opacity = "1";
    }

    // Enable watermark checkbox
    const watermarkCheckbox = document.getElementById("enableWatermark");
    if (watermarkCheckbox) {
      watermarkCheckbox.disabled = false;
    }

    // Enable voiceover checkbox
    const voiceoverCheckbox = document.getElementById("enableVoiceover");
    if (voiceoverCheckbox) {
      voiceoverCheckbox.disabled = false;
    }

    // Enable GIF export option
    const gifOption = document.querySelector('option[value="gif"]');
    if (gifOption) {
      gifOption.disabled = false;
    }

    console.log("Advanced features enabled in UI");
  }

  // Helper method to check if we can inject scripts into a URL
  canInjectScript(url) {
    if (!url) return false;

    // List of restricted URL patterns
    const restrictedPatterns = [
      "chrome://",
      "chrome-extension://",
      "moz-extension://",
      "edge://",
      "about:",
      "file://",
      "data:",
      "javascript:",
      "chrome-search://",
      "chrome-devtools://",
      "view-source:",
    ];

    // Check if URL starts with any restricted pattern
    return !restrictedPatterns.some((pattern) => url.startsWith(pattern));
  }

  bindEvents() {
    // Mode tabs
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.switchMode(btn.dataset.mode));
    });

    // Recording mode buttons
    document
      .getElementById("startRecording")
      ?.addEventListener("click", () => this.startRecording());
    document
      .getElementById("recordCamera")
      ?.addEventListener("click", () => this.recordCamera());
    document
      .getElementById("testCamera")
      ?.addEventListener("click", () => this.testCamera());
    document
      .getElementById("recordWithAnnotations")
      ?.addEventListener("click", () => this.recordWithAnnotations());

    // Capture mode buttons
    document
      .getElementById("captureScreen")
      ?.addEventListener("click", () => this.captureFullScreen());
    document
      .getElementById("captureArea")
      ?.addEventListener("click", () => this.captureArea());
    document
      .getElementById("captureFullPage")
      ?.addEventListener("click", () => this.captureFullPage());
    document
      .getElementById("captureDelayed")
      ?.addEventListener("click", () => this.captureDelayed());
    document
      .getElementById("captureWindow")
      ?.addEventListener("click", () => this.captureWindow());

    // Editor mode buttons - Temporarily Disabled
    /*
    document
      .getElementById("openImageEditor")
      ?.addEventListener("click", () => this.openImageEditor());
    document
      .getElementById("pasteFromClipboard")
      ?.addEventListener("click", () => this.pasteFromClipboard());

    // File upload
    const fileInput = document.getElementById("imageFileInput");
    const uploadArea = document.getElementById("fileUploadArea");

    if (fileInput && uploadArea) {
      uploadArea.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", (e) => this.handleFileUpload(e));

      // Drag and drop
      uploadArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploadArea.classList.add("dragover");
      });

      uploadArea.addEventListener("dragleave", () => {
        uploadArea.classList.remove("dragover");
      });

      uploadArea.addEventListener("drop", (e) => {
        e.preventDefault();
        uploadArea.classList.remove("dragover");
        this.handleFileDrop(e);
      });
    }
    */

    // Recording controls
    document
      .getElementById("pauseRecording")
      ?.addEventListener("click", () => this.pauseRecording());
    document
      .getElementById("stopRecording")
      ?.addEventListener("click", () => this.stopRecording());

    // Settings
    document
      .getElementById("toggleSettings")
      ?.addEventListener("click", () => this.toggleSettings());

    // Footer actions
    document
      .getElementById("openWebApp")
      ?.addEventListener("click", () => this.openWebApp());
    document
      .getElementById("viewHistory")
      ?.addEventListener("click", () => this.viewHistory());

    // Settings change handlers - with null checks
    const videoQuality = document.getElementById("videoQuality");
    if (videoQuality) {
      videoQuality.addEventListener("change", () => this.saveSettings());
    }

    const frameRate = document.getElementById("frameRate");
    if (frameRate) {
      frameRate.addEventListener("change", () => this.saveSettings());
    }

    const outputFormat = document.getElementById("outputFormat");
    if (outputFormat) {
      outputFormat.addEventListener("change", () => this.saveSettings());
    }

    const includeAudio = document.getElementById("includeAudio");
    if (includeAudio) {
      includeAudio.addEventListener("change", () => this.saveSettings());
    }

    const includeMicrophone = document.getElementById("includeMicrophone");
    if (includeMicrophone) {
      includeMicrophone.addEventListener("change", () => this.saveSettings());
    }

    const showCursor = document.getElementById("showCursor");
    if (showCursor) {
      showCursor.addEventListener("change", () => this.saveSettings());
    }
  }

  async startRecording() {
    console.log("🎬 SAFE MODE: Starting minimal screen recording...");

    try {
      // Immediate status update
      this.updateStatus("Requesting screen access...", "capturing");

      // Minimal screen capture request
      console.log("🎬 Step 1: Requesting desktop capture...");
      const streamId = await new Promise((resolve, reject) => {
        try {
          chrome.desktopCapture.chooseDesktopMedia(
            ["screen", "window", "tab"],
            (streamId) => {
              if (streamId) {
                console.log("🎬 Desktop capture granted, streamId:", streamId);
                resolve(streamId);
              } else {
                console.log("🎬 Desktop capture cancelled by user");
                reject(new Error("User cancelled screen selection"));
              }
            }
          );
        } catch (error) {
          console.error("🎬 Desktop capture API error:", error);
          reject(error);
        }
      });

      // Get basic media stream
      console.log("🎬 Step 2: Creating media stream...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          mandatory: {
            chromeMediaSource: "desktop",
            chromeMediaSourceId: streamId,
            maxWidth: 1920,
            maxHeight: 1080,
            maxFrameRate: 30,
          },
        },
        audio: false, // Disable audio initially to prevent crashes
      });

      console.log("🎬 Step 3: Media stream created successfully");
      this.updateStatus("Setting up recorder...", "capturing");

      // Create minimal MediaRecorder
      console.log("🎬 Step 4: Creating MediaRecorder...");

      // Use the most compatible format
      let mimeType = "video/webm";
      if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
        mimeType = "video/webm;codecs=vp8";
      }

      console.log("🎬 Using MIME type:", mimeType);

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        videoBitsPerSecond: 2500000, // 2.5 Mbps - safe bitrate
      });

      this.recordedChunks = [];

      // Set up enhanced event handlers
      this.mediaRecorder.ondataavailable = (event) => {
        console.log("🎬 Data available, size:", event.data.size);
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
          console.log("🎬 Total chunks collected:", this.recordedChunks.length);

          // Update recording size display
          const totalSize = this.recordedChunks.reduce(
            (size, chunk) => size + chunk.size,
            0
          );
          console.log("🎬 Total recording size so far:", totalSize, "bytes");
        } else {
          console.warn("🎬 Received empty data chunk");
        }
      };

      this.mediaRecorder.onstop = () => {
        console.log("🎬 Recording stopped, processing data...");
        console.log("🎬 Final chunk count:", this.recordedChunks.length);

        // Add a small delay to ensure all data is collected
        setTimeout(() => {
          this.saveRecordingMinimal();
        }, 100);
      };

      this.mediaRecorder.onstart = () => {
        console.log("🎬 MediaRecorder started successfully");
        this.showNotification("Recording started successfully!", "success");
      };

      this.mediaRecorder.onpause = () => {
        console.log("⏸️ MediaRecorder paused");
      };

      this.mediaRecorder.onresume = () => {
        console.log("▶️ MediaRecorder resumed");
      };

      this.mediaRecorder.onerror = (error) => {
        console.error("🎬 MediaRecorder error:", error);
        this.updateStatus("Recording error", "ready");
        this.showNotification(
          "Recording error occurred: " + error.message,
          "error"
        );

        // Clean up on error
        this.isRecording = false;
        this.isPaused = false;
        this.clearRecordingState();
        this.updateUI();
      };

      // Start recording
      console.log("🎬 Step 5: Starting recording...");
      this.mediaRecorder.start(1000); // Record in 1-second chunks

      this.isRecording = true;
      this.recordingStartTime = Date.now();

      // 💾 SAVE STATE: Persist recording state
      await this.saveRecordingState();

      // Update UI
      this.updateStatus("Recording...", "recording");
      this.updateUI();
      this.startTimer();

      console.log("🎬 Recording started successfully!");
      this.showNotification(
        "Recording started! State will be preserved if you close the popup.",
        "success"
      );
    } catch (error) {
      console.error("🎬 CRITICAL ERROR in startRecording:", error);
      this.updateStatus("Recording failed", "ready");
      this.showNotification("Recording failed: " + error.message, "error");

      // Clean up any streams
      if (typeof stream !== "undefined" && stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
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

      // Add microphone if enabled (with error handling)
      if (settings.includeMicrophone) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });

          // Simple approach: just add microphone track
          // Avoid complex AudioContext mixing that can cause crashes
          micStream.getAudioTracks().forEach((track) => {
            stream.addTrack(track);
          });

          console.log("Microphone added to recording stream");
        } catch (micError) {
          console.warn("Could not add microphone:", micError);
          // Continue without microphone rather than crashing
        }
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
    try {
      const settings = this.getSettings();

      // Check supported MIME types to prevent crashes
      let mimeType = "video/webm"; // Default fallback

      if (settings.outputFormat === "mp4") {
        if (MediaRecorder.isTypeSupported("video/mp4")) {
          mimeType = "video/mp4";
        } else if (MediaRecorder.isTypeSupported("video/webm;codecs=h264")) {
          mimeType = "video/webm;codecs=h264";
        } else {
          console.warn("MP4 not supported, using WebM");
        }
      } else {
        if (MediaRecorder.isTypeSupported("video/webm")) {
          mimeType = "video/webm";
        } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
          mimeType = "video/webm;codecs=vp8";
        }
      }

      console.log("Using MIME type:", mimeType);

      // Create MediaRecorder with safe options
      const options = {
        mimeType: mimeType,
      };

      // Only add bitrate if supported
      try {
        options.videoBitsPerSecond = this.getBitrate(settings.videoQuality);
      } catch (bitrateError) {
        console.warn("Bitrate setting not supported:", bitrateError);
      }

      this.mediaRecorder = new MediaRecorder(stream, options);
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
        this.updateStatus("Recording error occurred", "ready");
        this.showNotification("Recording error: " + error.message, "error");
        this.stopRecording();
      };

      console.log("MediaRecorder setup successful");
    } catch (error) {
      console.error("Error setting up MediaRecorder:", error);
      throw new Error("Failed to setup recording: " + error.message);
    }
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
    console.log("⏸️ Attempting to pause recording...");

    try {
      if (!this.mediaRecorder) {
        console.log(
          "⏸️ Pause not available - recording was started in previous popup session"
        );
        this.showNotification(
          "Pause not available for this recording.\n\n" +
            "The recording is still active and can be stopped to save your video. " +
            "Pause/resume controls are only available within the same popup session.",
          "info"
        );
        return;
      }

      if (!this.isRecording) {
        console.error("⏸️ Not currently recording");
        this.showNotification("Cannot pause - not recording", "error");
        return;
      }

      if (this.isPaused) {
        console.error("⏸️ Already paused");
        this.showNotification("Recording is already paused", "info");
        return;
      }

      console.log("⏸️ Pausing MediaRecorder...");
      this.mediaRecorder.pause();
      this.isPaused = true;

      // Save state with pause status
      this.saveRecordingState();

      this.updateStatus("Recording paused", "recording");
      this.updateUI();

      console.log("⏸️ Recording paused successfully");
      this.showNotification("Recording paused", "info");
    } catch (error) {
      console.error("⏸️ Error pausing recording:", error);
      this.showNotification(
        "Error pausing recording: " + error.message,
        "error"
      );
    }
  }

  resumeRecording() {
    console.log("▶️ Attempting to resume recording...");

    try {
      if (!this.mediaRecorder) {
        console.log(
          "▶️ Resume not available - recording was started in previous popup session"
        );
        this.showNotification(
          "Resume not available for this recording.\n\n" +
            "The recording is still active and can be stopped to save your video. " +
            "Pause/resume controls are only available within the same popup session.",
          "info"
        );
        return;
      }

      if (!this.isRecording) {
        console.error("▶️ Not currently recording");
        this.showNotification("Cannot resume - not recording", "error");
        return;
      }

      if (!this.isPaused) {
        console.error("▶️ Not paused");
        this.showNotification("Recording is not paused", "info");
        return;
      }

      console.log("▶️ Resuming MediaRecorder...");
      this.mediaRecorder.resume();
      this.isPaused = false;

      // Save state with resume status
      this.saveRecordingState();

      this.updateStatus("Recording...", "recording");
      this.updateUI();

      console.log("▶️ Recording resumed successfully");
      this.showNotification("Recording resumed", "info");
    } catch (error) {
      console.error("▶️ Error resuming recording:", error);
      this.showNotification(
        "Error resuming recording: " + error.message,
        "error"
      );
    }
  }

  stopRecording() {
    console.log("🎬 SAFE MODE: Stopping recording...");

    try {
      if (this.mediaRecorder && this.isRecording) {
        console.log("🎬 Stopping MediaRecorder...");
        this.mediaRecorder.stop();

        this.isRecording = false;
        this.isPaused = false;

        // 🗑️ CLEAR STATE: Remove recording state from storage
        this.clearRecordingState();

        // Stop all tracks
        if (this.mediaRecorder.stream) {
          console.log("🎬 Stopping stream tracks...");
          this.mediaRecorder.stream
            .getTracks()
            .forEach((track) => track.stop());
        }

        this.stopTimer();
        this.updateUI();
        this.updateStatus("Processing recording...", "capturing");

        // Notify background script
        try {
          chrome.runtime.sendMessage({ action: "recordingStopped" });
        } catch (messageError) {
          console.warn("🎬 Could not notify background script:", messageError);
        }

        console.log("🎬 Recording stopped successfully");
      } else if (this.isRecording && !this.mediaRecorder) {
        // Handle case where recording state exists but MediaRecorder is not available
        console.log("🎬 Clearing recording state from previous popup session");
        this.isRecording = false;
        this.isPaused = false;
        this.clearRecordingState();
        this.stopTimer();
        this.updateUI();
        this.updateStatus("Ready to record", "ready");
        this.showNotification(
          "Recording session ended.\n\n" +
            "Your recording from the previous session has been cleared. " +
            "You can start a new recording anytime.",
          "success"
        );
      } else {
        console.log("🎬 No active recording to stop");
        this.updateStatus("No active recording", "ready");
        this.showNotification("No active recording to stop", "info");
      }
    } catch (error) {
      console.error("🎬 Error stopping recording:", error);
      this.updateStatus("Error stopping recording", "ready");
      this.showNotification(
        "Error stopping recording: " + error.message,
        "error"
      );
    }
  }

  saveRecordingMinimal() {
    console.log("🎬 SAFE MODE: Saving recording...");
    console.log("🎬 Current chunks array:", this.recordedChunks);

    try {
      // Enhanced validation
      if (!this.recordedChunks) {
        console.error("🎬 recordedChunks is null/undefined");
        this.updateStatus("No recording data", "ready");
        this.showNotification(
          "Recording failed - no data array found. Please try recording again.",
          "error"
        );
        return;
      }

      if (!Array.isArray(this.recordedChunks)) {
        console.error(
          "🎬 recordedChunks is not an array:",
          typeof this.recordedChunks
        );
        this.updateStatus("Invalid recording data", "ready");
        this.showNotification(
          "Recording failed - invalid data format. Please try recording again.",
          "error"
        );
        return;
      }

      if (this.recordedChunks.length === 0) {
        console.error("🎬 No recorded chunks to save");
        this.updateStatus("No recording data", "ready");
        this.showNotification(
          "No recording data to save - Recording may not have started properly. Check console for details.",
          "error"
        );
        return;
      }

      console.log(
        "🎬 Creating blob from",
        this.recordedChunks.length,
        "chunks"
      );

      // Log each chunk for debugging
      this.recordedChunks.forEach((chunk, index) => {
        console.log(
          `🎬 Chunk ${index}: size=${chunk.size}, type=${chunk.type}`
        );
      });

      // Calculate total size
      const totalSize = this.recordedChunks.reduce(
        (size, chunk) => size + (chunk.size || 0),
        0
      );
      console.log("🎬 Total recording size:", totalSize, "bytes");

      if (totalSize === 0) {
        console.error("🎬 Recording chunks are empty - no data captured");
        this.updateStatus("Recording data is empty", "ready");
        this.showNotification(
          "Recording failed - no data captured. This may be due to:\n" +
            "1. Recording was too short\n" +
            "2. Screen capture permission issues\n" +
            "3. Browser compatibility problems\n\n" +
            "Try recording for at least 3-5 seconds.",
          "error"
        );
        return;
      }

      // Create blob with explicit type
      const blob = new Blob(this.recordedChunks, {
        type: "video/webm",
      });

      console.log("🎬 Blob created successfully");
      console.log("🎬 Blob size:", blob.size, "bytes");
      console.log("🎬 Blob type:", blob.type);

      if (blob.size === 0) {
        console.error("🎬 Created blob is empty despite having chunks");
        this.updateStatus("Recording blob is empty", "ready");
        this.showNotification(
          "Recording failed - empty video file created. This may indicate:\n" +
            "1. Incompatible video format\n" +
            "2. Browser encoding issues\n" +
            "3. Corrupted recording data\n\n" +
            "Try using a different browser or recording settings.",
          "error"
        );
        return;
      }

      // Create download URL
      const url = URL.createObjectURL(blob);
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      const filename = `screen-recording-${timestamp}.webm`;

      console.log("🎬 Initiating download...");
      console.log("🎬 Filename:", filename);
      console.log(
        "🎬 File size:",
        (blob.size / (1024 * 1024)).toFixed(2),
        "MB"
      );

      // Enhanced download with comprehensive error handling
      chrome.downloads.download(
        {
          url: url,
          filename: filename,
          saveAs: true,
        },
        (downloadId) => {
          // Check for Chrome runtime errors
          if (chrome.runtime.lastError) {
            console.error(
              "🎬 Chrome downloads API error:",
              chrome.runtime.lastError
            );
            this.updateStatus("Download permission error", "ready");
            this.showNotification(
              `Download failed: ${chrome.runtime.lastError.message}\n\n` +
                "Possible solutions:\n" +
                "1. Check if downloads are allowed for this extension\n" +
                "2. Ensure you have write permissions to the download folder\n" +
                "3. Try a different download location\n" +
                "4. Check available disk space",
              "error"
            );
            URL.revokeObjectURL(url);
            return;
          }

          // Check if download was initiated
          if (downloadId) {
            console.log("🎬 Download initiated successfully, ID:", downloadId);
            this.updateStatus("Recording saved successfully", "ready");
            this.showNotification(
              `✅ Recording saved successfully!\n\n` +
                `File: ${filename}\n` +
                `Size: ${(blob.size / (1024 * 1024)).toFixed(1)} MB\n` +
                `Chunks: ${this.recordedChunks.length}`,
              "success"
            );

            // 📋 SAVE TO HISTORY: Add recording to capture history
            this.saveToHistory({
              type: "recording",
              filename: filename,
              size: blob.size,
              downloadId: downloadId,
              timestamp: Date.now(),
              duration: this.getRecordingDuration(),
              chunks: this.recordedChunks.length,
            });
          } else {
            console.error("🎬 Download failed - no download ID returned");
            this.updateStatus("Download failed", "ready");
            this.showNotification(
              "Download failed - no download ID returned.\n\n" +
                "This may indicate:\n" +
                "1. Browser download restrictions\n" +
                "2. Extension permission issues\n" +
                "3. System download folder problems\n\n" +
                "Check browser download settings and try again.",
              "error"
            );
          }

          // Clean up object URL
          URL.revokeObjectURL(url);
        }
      );
    } catch (error) {
      console.error("🎬 Critical error saving recording:", error);
      console.error("🎬 Error stack:", error.stack);
      this.updateStatus("Error saving recording", "ready");
      this.showNotification(
        `Critical error saving recording: ${error.message}\n\n` +
          "Please try:\n" +
          "1. Recording again with shorter duration\n" +
          "2. Using different quality settings\n" +
          "3. Restarting the browser\n" +
          "4. Checking console for detailed error information",
        "error"
      );
    }
  }

  async saveRecording() {
    // Fallback to minimal save
    this.saveRecordingMinimal();
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

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      // Check if we can inject scripts into this tab
      if (!this.canInjectScript(tab.url)) {
        this.updateStatus("Cannot capture this page", "ready");
        this.showNotification(
          "Cannot capture area on this page. Try full screen capture instead.",
          "error"
        );
        return;
      }

      // Close popup first
      window.close();

      // Inject area selection overlay
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Create area selection overlay
          const overlay = document.createElement("div");
          overlay.id = "screen-capture-overlay";
          overlay.style.cssText = `
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

          const instructions = document.createElement("div");
          instructions.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 1000000;
          `;
          instructions.textContent =
            "Click and drag to select area to capture. Press ESC to cancel.";

          const selectionBox = document.createElement("div");
          selectionBox.style.cssText = `
            position: fixed;
            border: 2px dashed #fff;
            background: rgba(255, 255, 255, 0.1);
            display: none;
            z-index: 1000000;
            pointer-events: none;
          `;

          document.body.appendChild(overlay);
          document.body.appendChild(instructions);
          document.body.appendChild(selectionBox);

          let isSelecting = false;
          let startX, startY;

          overlay.addEventListener("mousedown", (e) => {
            isSelecting = true;
            startX = e.clientX;
            startY = e.clientY;
            selectionBox.style.display = "block";
            selectionBox.style.left = startX + "px";
            selectionBox.style.top = startY + "px";
            selectionBox.style.width = "0px";
            selectionBox.style.height = "0px";
          });

          overlay.addEventListener("mousemove", (e) => {
            if (!isSelecting) return;

            const currentX = e.clientX;
            const currentY = e.clientY;
            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);
            const left = Math.min(startX, currentX);
            const top = Math.min(startY, currentY);

            selectionBox.style.left = left + "px";
            selectionBox.style.top = top + "px";
            selectionBox.style.width = width + "px";
            selectionBox.style.height = height + "px";
          });

          overlay.addEventListener("mouseup", (e) => {
            if (!isSelecting) return;
            isSelecting = false;

            const currentX = e.clientX;
            const currentY = e.clientY;
            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);
            const left = Math.min(startX, currentX);
            const top = Math.min(startY, currentY);

            // Clean up overlay
            document.body.removeChild(overlay);
            document.body.removeChild(instructions);
            document.body.removeChild(selectionBox);

            // Capture the selected area
            if (width > 10 && height > 10) {
              chrome.runtime.sendMessage({
                action: "captureArea",
                area: { left, top, width, height },
              });
            }
          });

          // ESC to cancel
          document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
              document.body.removeChild(overlay);
              document.body.removeChild(instructions);
              document.body.removeChild(selectionBox);
            }
          });
        },
      });
    } catch (error) {
      console.error("Error starting area capture:", error);
      this.updateStatus("Error starting area capture", "ready");
      this.showNotification(
        "Area capture failed. Try full screen capture instead.",
        "error"
      );
    }
  }

  downloadImage(dataUrl, type) {
    const filename = `${type}-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, "-")}.png`;

    chrome.downloads.download(
      {
        url: dataUrl,
        filename: filename,
        saveAs: true,
      },
      (downloadId) => {
        if (chrome.runtime.lastError) {
          console.error("📸 Download error:", chrome.runtime.lastError);
          this.showNotification(
            "Error downloading screenshot: " + chrome.runtime.lastError.message,
            "error"
          );
        } else if (downloadId) {
          console.log("📸 Screenshot download started, ID:", downloadId);

          // 📋 SAVE TO HISTORY: Add screenshot to capture history
          this.saveToHistory({
            type: "screenshot",
            filename: filename,
            size: this.estimateImageSize(dataUrl),
            downloadId: downloadId,
            timestamp: Date.now(),
            captureType: type,
          });
        }
      }
    );
  }

  estimateImageSize(dataUrl) {
    // Rough estimate of image size from data URL
    const base64Length = dataUrl.split(",")[1]?.length || 0;
    return Math.round(base64Length * 0.75); // Base64 is ~33% larger than binary
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

  showCameraPermissionHelp() {
    // Create a detailed help popup
    const helpDiv = document.createElement("div");
    helpDiv.id = "camera-permission-help";
    helpDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #fff;
      color: #333;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 400px;
      font-family: Arial, sans-serif;
      border: 2px solid #f44336;
    `;

    helpDiv.innerHTML = `
      <h3 style="margin: 0 0 15px 0; color: #f44336;">📹 Camera Permission Required</h3>
      <p style="margin: 10px 0;"><strong>The extension needs camera access to record with camera.</strong></p>

      <h4 style="margin: 15px 0 10px 0; color: #333;">How to Grant Permission:</h4>
      <ol style="margin: 10px 0; padding-left: 20px;">
        <li>Look for a <strong>camera icon 📹</strong> in your browser's address bar</li>
        <li>Click the camera icon and select <strong>"Always allow"</strong></li>
        <li>If no icon appears, go to <strong>Chrome Settings > Privacy > Camera</strong></li>
        <li>Add this extension to the <strong>"Allowed"</strong> list</li>
        <li>Refresh and try again</li>
      </ol>

      <div style="text-align: center; margin-top: 15px;">
        <button onclick="document.body.removeChild(document.getElementById('camera-permission-help'))"
                style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
          Got It
        </button>
        <button onclick="window.open('chrome://settings/content/camera', '_blank')"
                style="background: #2196F3; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-left: 10px;">
          Open Camera Settings
        </button>
      </div>
    `;

    document.body.appendChild(helpDiv);

    // Auto-remove after 15 seconds
    setTimeout(() => {
      if (document.getElementById("camera-permission-help")) {
        document.body.removeChild(helpDiv);
      }
    }, 15000);
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

  async restoreRecordingState() {
    console.log("🔄 Restoring recording state from storage...");

    try {
      // Get state from Chrome storage
      const result = await chrome.storage.local.get([
        "isRecording",
        "isPaused",
        "recordingStartTime",
        "recordingDuration",
      ]);

      if (result.isRecording) {
        console.log("🔄 Found active recording state, restoring...");
        this.isRecording = result.isRecording;
        this.isPaused = result.isPaused || false;
        this.recordingStartTime = result.recordingStartTime;

        // Calculate current duration
        if (this.recordingStartTime) {
          const elapsed = Date.now() - this.recordingStartTime;
          console.log(
            "🔄 Recording has been active for:",
            Math.floor(elapsed / 1000),
            "seconds"
          );
        }

        // ⚠️ IMPORTANT: MediaRecorder cannot be restored across popup sessions
        // This is expected behavior - log as info rather than warning
        console.log(
          "🔄 Recording state restored from previous session - MediaRecorder will be recreated if needed"
        );

        // Update status to show recording is active
        this.updateStatus("Recording in progress...", "recording");

        // Restart timer if recording is active
        if (this.isRecording && !this.isPaused) {
          this.startTimer();
        }

        console.log("🔄 Recording state restored successfully");
      } else {
        console.log("🔄 No active recording found");
      }
    } catch (error) {
      console.error("🔄 Error restoring recording state:", error);
    }
  }

  async saveRecordingState() {
    console.log("💾 Saving recording state to storage...");

    try {
      await chrome.storage.local.set({
        isRecording: this.isRecording,
        isPaused: this.isPaused,
        recordingStartTime: this.recordingStartTime,
        recordingDuration: this.getRecordingDuration(),
      });

      console.log("💾 Recording state saved successfully");
    } catch (error) {
      console.error("💾 Error saving recording state:", error);
    }
  }

  async clearRecordingState() {
    console.log("🗑️ Clearing recording state from storage...");

    try {
      await chrome.storage.local.remove([
        "isRecording",
        "isPaused",
        "recordingStartTime",
        "recordingDuration",
      ]);

      console.log("🗑️ Recording state cleared successfully");
    } catch (error) {
      console.error("🗑️ Error clearing recording state:", error);
    }
  }

  setupStatePreservation() {
    console.log("🔄 Setting up state preservation...");

    // Save state when popup is about to close
    window.addEventListener("beforeunload", () => {
      if (this.isRecording) {
        this.saveRecordingState();
      }
    });

    // Save state periodically during recording
    setInterval(() => {
      if (this.isRecording) {
        this.saveRecordingState();
      }
    }, 5000); // Save every 5 seconds

    console.log("🔄 State preservation setup complete");
  }

  getRecordingDuration() {
    if (!this.recordingStartTime) return 0;
    return Date.now() - this.recordingStartTime;
  }

  async saveToHistory(item) {
    console.log("📋 Saving to capture history:", item);

    try {
      // Get existing history
      const result = await chrome.storage.local.get(["captureHistory"]);
      const history = result.captureHistory || [];

      // Add unique ID
      item.id = Date.now() + Math.random().toString(36).substr(2, 9);

      // Add to beginning of history (most recent first)
      history.unshift(item);

      // Keep only last 100 items to prevent storage bloat
      if (history.length > 100) {
        history.splice(100);
      }

      // Save back to storage
      await chrome.storage.local.set({ captureHistory: history });

      console.log(
        "📋 Item saved to history successfully, total items:",
        history.length
      );
    } catch (error) {
      console.error("📋 Error saving to history:", error);
    }
  }

  // Mode switching
  switchMode(mode) {
    this.currentMode = mode;

    // Update tab buttons
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === mode);
    });

    // Update mode content
    document.querySelectorAll(".mode-content").forEach((content) => {
      content.classList.toggle("active", content.id === mode + "Mode");
    });

    // Update settings title and content
    const settingsTitle = document.getElementById("settingsTitle");
    const settingsSections = document.querySelectorAll(".settings-section");

    settingsSections.forEach((section) => section.classList.remove("active"));

    switch (mode) {
      case "recording":
        settingsTitle.textContent = "Recording Settings";
        document.getElementById("recordingSettings")?.classList.add("active");
        break;
      case "capture":
        settingsTitle.textContent = "Capture Settings";
        document.getElementById("captureSettings")?.classList.add("active");
        break;
      // Editor mode temporarily disabled
      /*
      case "editor":
        settingsTitle.textContent = "Editor Settings";
        document.getElementById("editorSettings")?.classList.add("active");
        break;
      */
    }
  }

  // Enhanced recording methods
  async recordCamera() {
    try {
      this.updateStatus("Starting camera recording...", "capturing");

      let stream;
      let constraints;

      // Try multiple constraint levels with progressive fallback
      const constraintLevels = [
        // Level 1: High quality
        {
          video: {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 30, max: 30 },
          },
          audio: this.getSettings().includeMicrophone,
        },
        // Level 2: Medium quality
        {
          video: {
            width: { ideal: 640, max: 1280 },
            height: { ideal: 480, max: 720 },
            frameRate: { ideal: 30, max: 30 },
          },
          audio: this.getSettings().includeMicrophone,
        },
        // Level 3: Basic quality
        {
          video: {
            width: 640,
            height: 480,
            frameRate: 30,
          },
          audio: this.getSettings().includeMicrophone,
        },
        // Level 4: Minimal constraints
        {
          video: true,
          audio: this.getSettings().includeMicrophone,
        },
        // Level 5: Video only (no audio)
        {
          video: true,
          audio: false,
        },
      ];

      let lastError;
      for (let i = 0; i < constraintLevels.length; i++) {
        constraints = constraintLevels[i];
        try {
          console.log(`Trying camera constraints level ${i + 1}:`, constraints);
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log(
            `Camera access successful with level ${i + 1} constraints`
          );
          break;
        } catch (error) {
          lastError = error;
          console.warn(
            `Camera constraints level ${i + 1} failed:`,
            error.name,
            error.message
          );

          // If this is the last attempt, throw the error
          if (i === constraintLevels.length - 1) {
            throw error;
          }
        }
      }

      if (!stream) {
        throw lastError || new Error("Failed to get camera stream");
      }

      // Log successful stream info
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      if (videoTrack) {
        const settings = videoTrack.getSettings();
        console.log("Camera stream settings:", settings);
        this.showNotification(
          `Camera ready: ${settings.width}x${settings.height}`,
          "success"
        );
      }

      this.setupMediaRecorder(stream);
      this.mediaRecorder.start();
      this.isRecording = true;
      this.recordingStartTime = Date.now();

      this.updateUI();
      this.startTimer();
      this.updateStatus("Recording camera...", "recording");

      chrome.runtime.sendMessage({
        action: "recordingStarted",
        settings: { ...this.getSettings(), recordingType: "camera" },
      });
    } catch (error) {
      console.error("Error starting camera recording:", error);
      this.updateStatus("Error accessing camera", "ready");

      let errorMessage = "Failed to access camera. ";
      let troubleshooting = "";

      switch (error.name) {
        case "NotAllowedError":
          errorMessage += "Camera permission denied.";
          troubleshooting =
            "Please click the camera icon in your browser's address bar and allow camera access, then try again.";
          break;
        case "NotFoundError":
          errorMessage += "No camera device found.";
          troubleshooting =
            "Please connect a camera to your computer and refresh the page.";
          break;
        case "NotReadableError":
          errorMessage += "Camera is busy or hardware error.";
          troubleshooting =
            "Please close other applications using the camera (like Zoom, Skype, etc.) and try again.";
          break;
        case "OverconstrainedError":
          errorMessage += "Camera doesn't support the requested settings.";
          troubleshooting =
            "Your camera may not support the video quality settings. This shouldn't happen with our fallback system.";
          break;
        case "SecurityError":
          errorMessage += "Camera access blocked by security policy.";
          troubleshooting =
            "Please check your browser's camera permissions in Settings > Privacy and Security > Site Settings > Camera.";
          break;
        case "AbortError":
          errorMessage += "Camera access was interrupted.";
          troubleshooting =
            "Please try again. If the problem persists, restart your browser.";
          break;
        case "TypeError":
          errorMessage += "Browser doesn't support camera access.";
          troubleshooting =
            "Please use a modern browser like Chrome, Firefox, or Edge.";
          break;
        default:
          errorMessage += `Unexpected error (${error.name || "Unknown"}).`;
          troubleshooting = `Error details: ${
            error.message || "No additional details"
          }. Please check camera permissions and try again.`;
      }

      // Show detailed error message
      this.showNotification(`${errorMessage} ${troubleshooting}`, "error");

      // Also log detailed error for debugging
      console.error("Detailed camera error:", {
        name: error.name,
        message: error.message,
        constraint: error.constraint,
        stack: error.stack,
      });
    }
  }

  async testCamera() {
    try {
      this.updateStatus("Testing camera access...", "capturing");

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser");
      }

      // Check available devices first
      let devices;
      try {
        devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        console.log("Available video devices:", videoDevices.length);

        if (videoDevices.length === 0) {
          throw new Error("No camera devices found");
        }
      } catch (deviceError) {
        console.warn("Could not enumerate devices:", deviceError);
        // Continue anyway, getUserMedia might still work
      }

      // Simple camera test with basic constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      // Get camera info
      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      const capabilities = videoTrack.getCapabilities();

      // Stop the stream immediately
      stream.getTracks().forEach((track) => track.stop());

      // Show success message with camera details
      const cameraInfo = `Camera test successful!
Device: ${videoTrack.label || "Unknown Camera"}
Resolution: ${settings.width}x${settings.height}
Frame Rate: ${settings.frameRate}fps`;

      this.updateStatus("Camera test completed", "ready");
      this.showNotification(cameraInfo, "success");

      console.log("Camera test results:", {
        label: videoTrack.label,
        settings: settings,
        capabilities: capabilities,
      });
    } catch (error) {
      console.error("Camera test failed:", error);
      this.updateStatus("Camera test failed", "ready");

      let errorMessage = "Camera test failed. ";
      let solution = "";

      switch (error.name) {
        case "NotAllowedError":
          errorMessage += "Permission denied.";
          solution =
            "CAMERA PERMISSION DENIED - Follow these steps:\n\n" +
            "1. Look for a camera icon in your browser's address bar and click it\n" +
            "2. Select 'Always allow' for camera access\n" +
            "3. If no icon appears, go to Chrome Settings > Privacy and Security > Site Settings > Camera\n" +
            "4. Add this extension to the 'Allowed' list\n" +
            "5. Refresh this page and try again\n\n" +
            "Alternative: Try right-clicking in the browser address bar area to see permission options.";
          break;
        case "NotFoundError":
          errorMessage += "No camera found.";
          solution =
            "Please connect a camera to your computer and try again. Check if your camera is working in other applications.";
          break;
        case "NotReadableError":
          errorMessage += "Camera is busy or hardware error.";
          solution =
            "Please close other applications using the camera (Zoom, Skype, Teams, etc.) and try again. You may also need to restart your browser.";
          break;
        case "SecurityError":
          errorMessage += "Camera access blocked by security policy.";
          solution =
            "Please check your browser's camera permissions in Settings > Privacy and Security > Site Settings > Camera.";
          break;
        case "AbortError":
          errorMessage += "Camera access was interrupted.";
          solution =
            "Please try again. If the problem persists, restart your browser.";
          break;
        default:
          if (error.message.includes("not supported")) {
            errorMessage += "Camera API not supported.";
            solution =
              "Please use a modern browser like Chrome, Firefox, or Edge with camera support.";
          } else if (error.message.includes("No camera devices")) {
            errorMessage += "No camera devices detected.";
            solution =
              "Please connect a camera to your computer and ensure it's working properly.";
          } else {
            errorMessage += `Error: ${error.name || "Unknown"}`;
            solution = `Error details: ${error.message}. Please check your camera connection and browser permissions.`;
          }
      }

      this.showNotification(`${errorMessage} ${solution}`, "error");

      // Show additional help for permission issues
      if (error.name === "NotAllowedError") {
        // Show immediate help
        this.showCameraPermissionHelp();

        // Show follow-up help
        setTimeout(() => {
          this.showNotification(
            "CAMERA PERMISSION REQUIRED: This extension needs camera access to record with camera. Please grant permission in your browser settings.",
            "info"
          );
        }, 2000);

        // Show detailed help
        setTimeout(() => {
          this.showNotification(
            "HELP: Look for a camera icon 📹 in your browser's address bar (next to the URL) and click it to grant camera permission.",
            "info"
          );
        }, 5000);
      }
    }
  }

  async recordWithAnnotations() {
    try {
      this.updateStatus("Starting recording with annotations...", "capturing");

      // Start normal recording first
      await this.startRecording();

      // For now, just show a notification that annotations are coming soon
      this.showNotification(
        "Recording started! Annotation features coming soon.",
        "info"
      );

      // Close popup
      window.close();
    } catch (error) {
      console.error("Error starting recording with annotations:", error);
      this.updateStatus("Error starting annotated recording", "ready");
      this.showNotification(
        "Failed to start recording: " + error.message,
        "error"
      );
    }
  }

  // Enhanced capture methods
  async captureFullPage() {
    try {
      this.updateStatus("Capturing full page...", "capturing");

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      // Check if we can inject scripts into this tab
      if (!this.canInjectScript(tab.url)) {
        this.updateStatus("Cannot capture this page", "ready");
        this.showNotification(
          "Cannot capture full page on this page. Try regular screenshot instead.",
          "error"
        );
        return;
      }

      // Close popup first
      window.close();

      // Inject full page capture script
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: async () => {
          // Show progress indicator
          const progressDiv = document.createElement("div");
          progressDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            z-index: 999999;
            font-size: 14px;
          `;
          progressDiv.textContent = "Capturing full page...";
          document.body.appendChild(progressDiv);

          try {
            // Get original scroll position
            const originalScrollX = window.scrollX;
            const originalScrollY = window.scrollY;

            // Get page dimensions
            const body = document.body;
            const html = document.documentElement;
            const pageWidth = Math.max(
              body.scrollWidth,
              body.offsetWidth,
              html.clientWidth,
              html.scrollWidth,
              html.offsetWidth
            );
            const pageHeight = Math.max(
              body.scrollHeight,
              body.offsetHeight,
              html.clientHeight,
              html.scrollHeight,
              html.offsetHeight
            );

            // Get viewport dimensions
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Calculate number of screenshots needed
            const cols = Math.ceil(pageWidth / viewportWidth);
            const rows = Math.ceil(pageHeight / viewportHeight);

            progressDiv.textContent = `Capturing ${rows * cols} sections...`;

            // Create canvas for final image
            const canvas = document.createElement("canvas");
            canvas.width = pageWidth;
            canvas.height = pageHeight;
            const ctx = canvas.getContext("2d");

            let capturedSections = 0;
            const totalSections = rows * cols;

            // Capture each section
            for (let row = 0; row < rows; row++) {
              for (let col = 0; col < cols; col++) {
                const x = col * viewportWidth;
                const y = row * viewportHeight;

                // Scroll to position
                window.scrollTo(x, y);

                // Wait for scroll to complete
                await new Promise((resolve) => setTimeout(resolve, 100));

                // Capture this section
                try {
                  const response = await chrome.runtime.sendMessage({
                    action: "captureVisibleTab",
                  });

                  if (response && response.dataUrl) {
                    // Create image and draw to canvas
                    const img = new Image();
                    await new Promise((resolve, reject) => {
                      img.onload = () => {
                        ctx.drawImage(img, x, y);
                        resolve();
                      };
                      img.onerror = reject;
                      img.src = response.dataUrl;
                    });
                  }
                } catch (error) {
                  console.error("Error capturing section:", error);
                }

                capturedSections++;
                progressDiv.textContent = `Captured ${capturedSections}/${totalSections} sections...`;
              }
            }

            // Restore original scroll position
            window.scrollTo(originalScrollX, originalScrollY);

            // Convert canvas to data URL
            const fullPageDataUrl = canvas.toDataURL("image/png");

            // Send to background for download
            chrome.runtime.sendMessage({
              action: "downloadFullPageCapture",
              dataUrl: fullPageDataUrl,
            });

            progressDiv.textContent = "Full page capture complete!";
            setTimeout(() => {
              document.body.removeChild(progressDiv);
            }, 2000);
          } catch (error) {
            console.error("Full page capture error:", error);
            progressDiv.textContent = "Full page capture failed!";
            progressDiv.style.background = "rgba(255, 0, 0, 0.8)";
            setTimeout(() => {
              document.body.removeChild(progressDiv);
            }, 3000);
          }
        },
      });
    } catch (error) {
      console.error("Error capturing full page:", error);
      this.updateStatus("Error capturing full page", "ready");
      this.showNotification(
        "Full page capture failed. Try regular screenshot instead.",
        "error"
      );
    }
  }

  async captureDelayed() {
    const delay = parseInt(this.getSettings().captureDelay || 3);

    try {
      this.updateStatus(`Capturing in ${delay} seconds...`, "capturing");

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      // Try to use overlay countdown if possible, otherwise use simple delay
      if (this.canInjectScript(tab.url)) {
        // Use overlay countdown for regular web pages
        window.close();

        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (delaySeconds) => {
            let countdown = delaySeconds;
            const overlay = document.createElement("div");
            overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            font-size: 72px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            font-family: Arial, sans-serif;
            flex-direction: column;
          `;

            const countdownText = document.createElement("div");
            countdownText.textContent = countdown;

            const instructionText = document.createElement("div");
            instructionText.style.fontSize = "24px";
            instructionText.style.marginTop = "20px";
            instructionText.textContent = "Get ready for screenshot...";

            overlay.appendChild(countdownText);
            overlay.appendChild(instructionText);
            document.body.appendChild(overlay);

            const timer = setInterval(() => {
              countdown--;
              countdownText.textContent = countdown;

              if (countdown <= 0) {
                clearInterval(timer);
                document.body.removeChild(overlay);

                // Trigger capture after overlay is removed
                setTimeout(async () => {
                  try {
                    const response = await chrome.runtime.sendMessage({
                      action: "captureVisibleTab",
                      format: "png",
                      quality: 100,
                    });

                    if (response && response.dataUrl) {
                      // Download the captured image
                      const filename = `delayed-capture-${new Date()
                        .toISOString()
                        .slice(0, 19)
                        .replace(/:/g, "-")}.png`;
                      const link = document.createElement("a");
                      link.download = filename;
                      link.href = response.dataUrl;
                      link.click();

                      // Show success notification
                      const notification = document.createElement("div");
                      notification.style.cssText = `
                      position: fixed;
                      top: 20px;
                      right: 20px;
                      background: rgba(76, 175, 80, 0.9);
                      color: white;
                      padding: 15px;
                      border-radius: 5px;
                      font-family: Arial, sans-serif;
                      z-index: 999999;
                      font-size: 14px;
                    `;
                      notification.textContent =
                        "Screenshot captured successfully!";
                      document.body.appendChild(notification);

                      setTimeout(() => {
                        document.body.removeChild(notification);
                      }, 3000);
                    }
                  } catch (error) {
                    console.error("Error capturing delayed screenshot:", error);
                  }
                }, 200);
              }
            }, 1000);
          },
          args: [delay],
        });
      } else {
        // Fallback: Simple delay without overlay for restricted pages
        this.showNotification(
          `Screenshot will be taken in ${delay} seconds...`,
          "info"
        );
        window.close();

        setTimeout(async () => {
          try {
            const response = await chrome.runtime.sendMessage({
              action: "captureVisibleTab",
              format: "png",
              quality: 100,
            });

            if (response && response.dataUrl) {
              // Download the captured image
              const filename = `delayed-capture-${new Date()
                .toISOString()
                .slice(0, 19)
                .replace(/:/g, "-")}.png`;
              const link = document.createElement("a");
              link.download = filename;
              link.href = response.dataUrl;
              link.click();
            }
          } catch (error) {
            console.error("Error capturing delayed screenshot:", error);
          }
        }, delay * 1000);
      }
    } catch (error) {
      console.error("Error starting delayed capture:", error);
      this.updateStatus("Error starting delayed capture", "ready");
    }
  }

  async captureWindow() {
    try {
      this.updateStatus("Select window to capture...", "capturing");

      // Use desktop capture API to let user select window
      const streamId = await new Promise((resolve, reject) => {
        chrome.desktopCapture.chooseDesktopMedia(["window"], (streamId) => {
          if (streamId) {
            resolve(streamId);
          } else {
            reject(new Error("User cancelled window selection"));
          }
        });
      });

      if (!streamId) {
        this.updateStatus("Window selection cancelled", "ready");
        return;
      }

      // Send the streamId to background script for processing
      chrome.runtime.sendMessage(
        {
          action: "captureWindowWithStream",
          streamId: streamId,
        },
        (response) => {
          if (response && response.success) {
            this.updateStatus("Window captured successfully", "ready");
            this.showNotification("Window captured successfully!", "success");
          } else {
            this.updateStatus("Error capturing window", "ready");
            this.showNotification(
              "Failed to capture window: " +
                (response?.error || "Unknown error"),
              "error"
            );
          }
        }
      );

      // Close popup after initiating capture
      window.close();
    } catch (error) {
      console.error("Error capturing window:", error);
      this.updateStatus("Error capturing window", "ready");
      this.showNotification(
        "Failed to capture window: " + error.message,
        "error"
      );
    }
  }

  // Editor methods - Temporarily Disabled
  /*
  openImageEditor() {
    if (!this.imageEditor) {
      // Load image editor script
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL("image-editor.js");
      script.onload = () => {
        this.imageEditor = window.imageEditor;
        this.imageEditor.openImage(null); // Open empty editor
      };
      document.head.appendChild(script);

      // Load editor CSS
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = chrome.runtime.getURL("editor.css");
      document.head.appendChild(link);
    } else {
      this.imageEditor.openImage(null);
    }

    window.close();
  }

  async pasteFromClipboard() {
    try {
      const clipboardItems = await navigator.clipboard.read();

      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith("image/")) {
            const blob = await clipboardItem.getType(type);
            this.openImageInEditor(blob);
            return;
          }
        }
      }

      this.showNotification("No image found in clipboard", "error");
    } catch (error) {
      console.error("Error reading clipboard:", error);
      this.showNotification(
        "Failed to read clipboard. Please check permissions.",
        "error"
      );
    }
  }

  handleFileUpload(event) {
    const files = event.target.files;
    if (files.length > 0) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          this.openImageInEditor(file);
        }
      });
    }
  }

  handleFileDrop(event) {
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          this.openImageInEditor(file);
        }
      });
    }
  }

  openImageInEditor(imageData) {
    if (!this.imageEditor) {
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL("image-editor.js");
      script.onload = () => {
        this.imageEditor = window.imageEditor;
        this.imageEditor.openImage(imageData);
      };
      document.head.appendChild(script);

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = chrome.runtime.getURL("editor.css");
      document.head.appendChild(link);
    } else {
      this.imageEditor.openImage(imageData);
    }

    window.close();
  }
  */

  // Helper methods
  downloadImage(dataUrl, filename) {
    const link = document.createElement("a");
    link.download = `${filename}-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, "-")}.png`;
    link.href = dataUrl;
    link.click();
  }

  async convertToFormat(dataUrl, format, quality = 0.95) {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        let outputFormat = "image/png";
        if (format === "jpeg" || format === "jpg") {
          outputFormat = "image/jpeg";
        } else if (format === "webp") {
          outputFormat = "image/webp";
        }

        resolve(canvas.toDataURL(outputFormat, quality));
      };

      img.src = dataUrl;
    });
  }

  async createGifFromFrames(frames, options = {}) {
    try {
      // Use loaded GIF creator or load it
      let gifCreator = this.gifCreator;
      if (!gifCreator) {
        await this.loadScript("gif-creator.js");
        gifCreator = window.gifCreator;
      }

      if (gifCreator && frames.length > 0) {
        // Convert frames to the format expected by GIF creator
        const imageFrames = frames.map((frame) => frame.data || frame);

        return await gifCreator.createGIFFromImages(imageFrames, {
          frameDelay: options.frameDelay || 500,
          loop: options.loop !== false,
          optimize: options.optimize !== false,
          filename: options.filename || "screen-recording",
        });
      }
    } catch (error) {
      console.error("Error creating GIF:", error);
      this.showNotification("Failed to create GIF: " + error.message, "error");
    }

    // Fallback: return the first frame as static image
    return frames[0] || null;
  }

  async addWatermarkToImage(dataUrl) {
    const settings = this.getSettings();
    if (!settings.enableWatermark) return dataUrl;

    try {
      // Use loaded effects processor or load it
      let effectsProcessor = this.effectsProcessor;
      if (!effectsProcessor) {
        await this.loadScript("effects-processor.js");
        effectsProcessor = window.effectsProcessor;
      }

      if (effectsProcessor) {
        return await effectsProcessor.addWatermark(dataUrl, {
          text: settings.watermarkText || "Screen Recorder Pro",
          enabled: true,
          position: settings.watermarkPosition || "bottom-right",
          opacity: settings.watermarkOpacity || 0.7,
          fontSize: settings.watermarkSize || 16,
          color: settings.watermarkColor || "#ffffff",
        });
      }
    } catch (error) {
      console.error("Error adding watermark:", error);
    }

    return dataUrl;
  }

  async loadScript(scriptName) {
    return new Promise((resolve, reject) => {
      try {
        const script = document.createElement("script");
        script.src = chrome.runtime.getURL(scriptName);
        script.onload = () => {
          console.log(`Script loaded successfully: ${scriptName}`);
          resolve();
        };
        script.onerror = (error) => {
          console.warn(`Script failed to load: ${scriptName}`, error);
          // Don't reject, just resolve to continue execution
          resolve();
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error(`Error loading script ${scriptName}:`, error);
        resolve(); // Don't reject to avoid breaking the app
      }
    });
  }

  // Enhanced settings management
  getSettings() {
    const settings = {
      videoQuality: document.getElementById("videoQuality")?.value || "1080p",
      frameRate: parseInt(document.getElementById("frameRate")?.value || "60"),
      outputFormat: document.getElementById("outputFormat")?.value || "webm",
      includeAudio: document.getElementById("includeAudio")?.checked || false,
      includeMicrophone:
        document.getElementById("includeMicrophone")?.checked || false,
      showCursor: document.getElementById("showCursor")?.checked || true,
      highlightCursor:
        document.getElementById("highlightCursor")?.checked || false,
      enableAnnotations:
        document.getElementById("enableAnnotations")?.checked || false,
      enableWatermark:
        document.getElementById("enableWatermark")?.checked || false,
      watermarkText:
        document.getElementById("watermarkText")?.value ||
        "Screen Recorder Pro",
      enableVoiceover:
        document.getElementById("enableVoiceover")?.checked || false,
      recordingTimer: parseInt(
        document.getElementById("recordingTimer")?.value || "0"
      ),
      imageFormat: document.getElementById("imageFormat")?.value || "png",
      imageQuality: parseInt(
        document.getElementById("imageQuality")?.value || "95"
      ),
      captureDelay: parseInt(
        document.getElementById("captureDelay")?.value || "3"
      ),
      includeScrollbars:
        document.getElementById("includeScrollbars")?.checked || false,
      autoSave: document.getElementById("autoSave")?.checked || true,
      // Editor settings temporarily disabled
      /*
      defaultTool: document.getElementById("defaultTool")?.value || "pen",
      penColor: document.getElementById("penColor")?.value || "#ff0000",
      penSize: parseInt(document.getElementById("penSize")?.value || "3"),
      enableGrid: document.getElementById("enableGrid")?.checked || false,
      enableSnap: document.getElementById("enableSnap")?.checked || false,
      */
    };

    return settings;
  }

  async saveSettings() {
    const settings = this.getSettings();
    try {
      await chrome.storage.sync.set({ userSettings: settings });
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(["userSettings"]);
      const settings = result.userSettings || {};

      // Apply settings to UI
      Object.keys(settings).forEach((key) => {
        const element = document.getElementById(key);
        if (element) {
          if (element.type === "checkbox") {
            element.checked = settings[key];
          } else {
            element.value = settings[key];
          }
        }
      });
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }

  openWebApp() {
    try {
      console.log("🌐 Opening web app...");

      // Create a comprehensive web app page
      const webAppUrl = chrome.runtime.getURL("web-app.html");

      // Open in new tab
      chrome.tabs.create(
        {
          url: webAppUrl,
          active: true,
        },
        (tab) => {
          if (chrome.runtime.lastError) {
            console.error("Error opening web app:", chrome.runtime.lastError);
            this.showNotification(
              "Error opening web app: " + chrome.runtime.lastError.message,
              "error"
            );
          } else {
            console.log("🌐 Web app opened successfully in tab:", tab.id);
            this.showNotification("Web app opened in new tab!", "success");

            // Close popup after opening web app
            window.close();
          }
        }
      );
    } catch (error) {
      console.error("Error opening web app:", error);
      this.showNotification("Error opening web app: " + error.message, "error");
    }
  }

  viewHistory() {
    try {
      console.log("📋 Opening capture history...");

      // Open the existing history page
      const historyUrl = chrome.runtime.getURL("history.html");

      // Open in new tab
      chrome.tabs.create(
        {
          url: historyUrl,
          active: true,
        },
        (tab) => {
          if (chrome.runtime.lastError) {
            console.error("Error opening history:", chrome.runtime.lastError);
            this.showNotification(
              "Error opening history: " + chrome.runtime.lastError.message,
              "error"
            );
          } else {
            console.log("📋 History opened successfully in tab:", tab.id);
            this.showNotification(
              "Capture history opened in new tab!",
              "success"
            );

            // Close popup after opening history
            window.close();
          }
        }
      );
    } catch (error) {
      console.error("Error viewing history:", error);
      this.showNotification("Error opening history: " + error.message, "error");
    }
  }
}

// Initialize popup when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ScreenRecorderPopup();
});
