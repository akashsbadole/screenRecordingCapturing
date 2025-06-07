class ScreenRecorderBackground {
  constructor() {
    console.log("ScreenRecorderBackground: Starting initialization...");

    try {
      this.recordingState = {
        isRecording: false,
        startTime: null,
        tabId: null,
        settings: null,
      };

      this.init();
      console.log(
        "ScreenRecorderBackground: Initialization completed successfully"
      );
    } catch (error) {
      console.error(
        "ScreenRecorderBackground: Critical initialization error:",
        error
      );
      // Try to continue with minimal functionality
      this.recordingState = {
        isRecording: false,
        startTime: null,
        tabId: null,
        settings: null,
      };
    }
  }

  init() {
    try {
      console.log("ScreenRecorderBackground: Setting up event listeners...");
      this.setupEventListeners();

      console.log("ScreenRecorderBackground: Setting up keyboard shortcuts...");
      this.setupKeyboardShortcuts();

      console.log("ScreenRecorderBackground: All setup completed");
    } catch (error) {
      console.error(
        "ScreenRecorderBackground: Error during initialization:",
        error
      );
    }
  }

  setupEventListeners() {
    try {
      // Extension installation
      chrome.runtime.onInstalled.addListener(() => {
        try {
          console.log("Screen Recorder & Capture Pro extension installed");
          this.showWelcomeNotification();
        } catch (error) {
          console.error("Error in onInstalled listener:", error);
        }
      });

      // Message handling
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        try {
          this.handleMessage(request, sender, sendResponse);
          return true; // Will respond asynchronously
        } catch (error) {
          console.error("Error in message listener:", error);
          sendResponse({ error: error.message });
          return false;
        }
      });

      // Tab updates
      chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        try {
          if (
            changeInfo.status === "complete" &&
            this.recordingState.isRecording
          ) {
            this.updateRecordingBadge();
          }
        } catch (error) {
          console.error("Error in tab update listener:", error);
        }
      });

      // Extension startup
      chrome.runtime.onStartup.addListener(() => {
        try {
          this.recordingState.isRecording = false;
          this.updateRecordingBadge();
        } catch (error) {
          console.error("Error in startup listener:", error);
        }
      });

      console.log("ScreenRecorderBackground: Event listeners setup completed");
    } catch (error) {
      console.error(
        "ScreenRecorderBackground: Critical error setting up event listeners:",
        error
      );
    }
  }

  // Context menus completely removed

  setupKeyboardShortcuts() {
    try {
      if (chrome.commands) {
        chrome.commands.onCommand.addListener((command) => {
          this.handleKeyboardShortcut(command);
        });
      } else {
        console.warn("Commands API not available");
      }
    } catch (error) {
      console.error("Error setting up keyboard shortcuts:", error);
    }
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case "recordingStarted":
          await this.handleRecordingStarted(request, sender);
          sendResponse({ success: true });
          break;

        case "recordingStopped":
          await this.handleRecordingStopped();
          sendResponse({ success: true });
          break;

        case "getRecordingStatus":
          sendResponse({
            isRecording: this.recordingState.isRecording,
            startTime: this.recordingState.startTime,
          });
          break;

        case "captureVisibleTab":
          await this.handleCaptureVisibleTab(request, sendResponse);
          break;

        case "requestDesktopCapture":
          await this.handleDesktopCaptureRequest(sendResponse);
          break;

        case "saveCapture":
          await this.handleSaveCapture(request, sendResponse);
          break;

        case "downloadImage":
          await this.handleDownloadImage(request, sendResponse);
          break;

        case "captureFullPage":
          await this.handleFullPageCapture(request, sendResponse);
          break;

        case "processClipboardImage":
          await this.handleClipboardImage(request, sendResponse);
          break;

        case "captureArea":
          await this.handleAreaCapture(request, sendResponse);
          break;

        case "downloadFullPageCapture":
          await this.handleFullPageDownload(request, sendResponse);
          break;

        case "showNotification":
          this.showNotification(request.title, request.message);
          sendResponse({ success: true });
          break;

        case "areaCaptureComplete":
          // Handle area capture completion notification
          if (request.success) {
            console.log("Area capture completed successfully");
          } else {
            console.error("Area capture failed:", request.error);
            this.showNotification(
              "Area capture failed",
              request.error || "Unknown error"
            );
          }
          sendResponse({ received: true });
          break;

        case "captureWindowWithStream":
          await this.handleWindowCaptureWithStream(request, sendResponse);
          break;

        case "windowCaptureComplete":
          // Handle window capture completion notification
          if (request.success) {
            console.log("Window capture completed successfully");
            this.showNotification(
              "Window captured successfully",
              "Screenshot saved"
            );
          } else {
            console.error("Window capture failed:", request.error);
            this.showNotification(
              "Window capture failed",
              request.error || "Unknown error"
            );
          }
          sendResponse({ received: true });
          break;

        default:
          sendResponse({ error: "Unknown action" });
      }
    } catch (error) {
      console.error("Error handling message:", error);
      sendResponse({ error: error.message });
    }
  }

  async handleRecordingStarted(request, sender) {
    this.recordingState.isRecording = true;
    this.recordingState.startTime = Date.now();
    this.recordingState.tabId = sender.tab?.id;
    this.recordingState.settings = request.settings;

    this.updateRecordingBadge();
    this.showNotification(
      "Recording started",
      "Recording has begun successfully"
    );
  }

  async handleRecordingStopped() {
    this.recordingState.isRecording = false;
    this.recordingState.startTime = null;
    this.recordingState.tabId = null;
    this.recordingState.settings = null;

    this.updateRecordingBadge();
    this.showNotification("Recording stopped", "Recording has been saved");
  }

  async handleCaptureVisibleTab(request, sendResponse) {
    try {
      const dataUrl = await new Promise((resolve) => {
        chrome.tabs.captureVisibleTab(
          null,
          {
            format: request.format || "png",
            quality: request.quality || 100,
          },
          resolve
        );
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
          ["screen", "window", "tab"],
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
        chrome.downloads.download(
          {
            url: request.dataUrl,
            filename: request.filename,
            saveAs: request.saveAs || false,
          },
          resolve
        );
      });

      sendResponse({ downloadId });
    } catch (error) {
      sendResponse({ error: error.message });
    }
  }

  // Context menu handler removed

  async handleKeyboardShortcut(command) {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    switch (command) {
      case "start-recording":
        await this.triggerRecording(tab);
        break;
      case "capture-screenshot":
        await this.triggerScreenCapture(tab);
        break;
      case "capture-area":
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
            window.postMessage({ type: "STOP_RECORDING" }, "*");
          },
        });
      } else {
        // Start recording
        chrome.action.openPopup();
      }
    } catch (error) {
      console.error("Error triggering recording:", error);
    }
  }

  async triggerScreenCapture(tab) {
    try {
      const dataUrl = await new Promise((resolve) => {
        chrome.tabs.captureVisibleTab(null, { format: "png" }, resolve);
      });

      if (dataUrl) {
        const filename = `screenshot-${new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/:/g, "-")}.png`;

        chrome.downloads.download({
          url: dataUrl,
          filename: filename,
          saveAs: true,
        });

        this.showNotification(
          "Screenshot captured",
          "Screenshot saved successfully"
        );
      }
    } catch (error) {
      console.error("Error capturing screen:", error);
      this.showNotification("Error", "Failed to capture screenshot");
    }
  }

  async triggerAreaCapture(tab) {
    try {
      // Area capture feature not yet implemented, use regular capture
      console.log("Area capture feature coming soon, using regular capture");
      await this.triggerScreenCapture(tab);
    } catch (error) {
      console.error("Error triggering area capture:", error);
    }
  }

  updateRecordingBadge() {
    if (this.recordingState.isRecording) {
      chrome.action.setBadgeText({ text: "REC" });
      chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });
      chrome.action.setTitle({
        title: "Recording in progress - Click to stop",
      });
    } else {
      chrome.action.setBadgeText({ text: "" });
      chrome.action.setTitle({ title: "Screen Recorder & Capture Pro" });
    }
  }

  showNotification(title, message) {
    try {
      if (chrome.notifications) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon48.png",
          title: title,
          message: message,
        });
      } else {
        console.log(`Notification: ${title} - ${message}`);
      }
    } catch (error) {
      console.error("Error showing notification:", error);
      console.log(`Notification: ${title} - ${message}`);
    }
  }

  showWelcomeNotification() {
    try {
      if (chrome.notifications) {
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icons/icon48.png",
          title: "Screen Recorder Pro Installed",
          message:
            "Click the extension icon to start recording or capturing screenshots!",
        });
      } else {
        console.log("Screen Recorder Pro extension installed successfully!");
      }
    } catch (error) {
      console.error("Error showing welcome notification:", error);
      console.log("Screen Recorder Pro extension installed successfully!");
    }
  }

  async handleDownloadImage(request, sendResponse) {
    try {
      const downloadId = await chrome.downloads.download({
        url: request.dataUrl,
        filename: request.filename,
        saveAs: false,
      });

      sendResponse({ success: true, downloadId });
    } catch (error) {
      console.error("Error downloading image:", error);
      sendResponse({ error: error.message });
    }
  }

  async handleFullPageCapture(request, sendResponse) {
    try {
      // Full page capture feature not yet implemented, use regular capture
      console.log(
        "Full page capture feature coming soon, using regular capture"
      );
      await this.handleCaptureVisibleTab(request, sendResponse);
    } catch (error) {
      console.error("Error starting full page capture:", error);
      sendResponse({ error: error.message });
    }
  }

  async handleClipboardImage(request, sendResponse) {
    try {
      const processedData = await this.processImageData(request.imageData);
      sendResponse({ success: true, data: processedData });
    } catch (error) {
      console.error("Error processing clipboard image:", error);
      sendResponse({ error: error.message });
    }
  }

  async processImageData(imageData) {
    return {
      originalSize: imageData.length,
      format: this.detectImageFormat(imageData),
      timestamp: Date.now(),
    };
  }

  detectImageFormat(imageData) {
    if (imageData.startsWith("data:image/png")) return "png";
    if (imageData.startsWith("data:image/jpeg")) return "jpeg";
    if (imageData.startsWith("data:image/webp")) return "webp";
    if (imageData.startsWith("data:image/gif")) return "gif";
    return "unknown";
  }

  async enhancedCaptureTab(tabId, options = {}) {
    try {
      const dataUrl = await chrome.tabs.captureVisibleTab(null, {
        format: options.format || "png",
        quality: options.quality || 100,
      });

      if (options.annotations) {
        return await this.applyAnnotations(dataUrl, options.annotations);
      }

      return dataUrl;
    } catch (error) {
      console.error("Error in enhanced capture:", error);
      throw error;
    }
  }

  async applyAnnotations(imageData, annotations) {
    // This would integrate with the annotation system
    return imageData;
  }

  async handleAreaCapture(request, sendResponse) {
    try {
      // Capture the visible tab first
      const dataUrl = await new Promise((resolve) => {
        chrome.tabs.captureVisibleTab(null, { format: "png" }, resolve);
      });

      if (dataUrl && request.area) {
        // Send the full screenshot and area coordinates to content script for processing
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        // Inject script to handle image cropping in the page context
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (fullImageData, areaCoords) => {
            // Create canvas to crop the selected area
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();

            img.onload = () => {
              const { left, top, width, height } = areaCoords;
              const devicePixelRatio = window.devicePixelRatio || 1;

              // Adjust for device pixel ratio
              const scaledLeft = left * devicePixelRatio;
              const scaledTop = top * devicePixelRatio;
              const scaledWidth = width * devicePixelRatio;
              const scaledHeight = height * devicePixelRatio;

              canvas.width = scaledWidth;
              canvas.height = scaledHeight;

              // Draw the cropped area
              ctx.drawImage(
                img,
                scaledLeft,
                scaledTop,
                scaledWidth,
                scaledHeight,
                0,
                0,
                scaledWidth,
                scaledHeight
              );

              const croppedDataUrl = canvas.toDataURL("image/png");

              // Download the cropped image
              const filename = `area-capture-${new Date()
                .toISOString()
                .slice(0, 19)
                .replace(/:/g, "-")}.png`;

              const link = document.createElement("a");
              link.download = filename;
              link.href = croppedDataUrl;
              link.click();

              // Send success message back
              chrome.runtime.sendMessage({
                action: "areaCaptureComplete",
                success: true,
              });
            };

            img.onerror = () => {
              chrome.runtime.sendMessage({
                action: "areaCaptureComplete",
                success: false,
                error: "Failed to process image",
              });
            };

            img.src = fullImageData;
          },
          args: [dataUrl, request.area],
        });

        this.showNotification("Area captured successfully", "Screenshot saved");
      }

      sendResponse({ success: true });
    } catch (error) {
      console.error("Error handling area capture:", error);
      sendResponse({ error: error.message });
      this.showNotification("Area capture failed", "Please try again");
    }
  }

  async handleWindowCaptureWithStream(request, sendResponse) {
    try {
      const { streamId } = request;

      if (!streamId) {
        sendResponse({ success: false, error: "No stream ID provided" });
        return;
      }

      // Get the current active tab to inject the capture script
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      // Inject script to handle window capture in page context
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: async (streamId) => {
          try {
            // Get media stream using the streamId
            const stream = await navigator.mediaDevices.getUserMedia({
              video: {
                mandatory: {
                  chromeMediaSource: "desktop",
                  chromeMediaSourceId: streamId,
                },
              },
            });

            console.log("Stream obtained, creating video element...");

            // Create video element to capture frame
            const video = document.createElement("video");
            video.srcObject = stream;
            video.muted = true;
            video.autoplay = true;

            // Add video to DOM temporarily (hidden)
            video.style.position = "fixed";
            video.style.top = "-9999px";
            video.style.left = "-9999px";
            video.style.width = "1px";
            video.style.height = "1px";
            video.style.opacity = "0";
            document.body.appendChild(video);

            // Wait for video to load and get proper dimensions
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error("Video load timeout after 15 seconds"));
              }, 15000);

              video.onloadedmetadata = () => {
                console.log(
                  "Video metadata loaded:",
                  video.videoWidth,
                  "x",
                  video.videoHeight,
                  "readyState:",
                  video.readyState
                );

                // Don't resolve immediately, wait for video to be ready to play
                if (video.readyState >= 2) {
                  // HAVE_CURRENT_DATA
                  clearTimeout(timeout);
                  resolve();
                } else {
                  video.oncanplay = () => {
                    clearTimeout(timeout);
                    console.log(
                      "Video can play, readyState:",
                      video.readyState
                    );
                    resolve();
                  };
                }
              };

              video.onerror = (e) => {
                clearTimeout(timeout);
                reject(
                  new Error(
                    "Video error: " + (e.message || "Unknown video error")
                  )
                );
              };

              // Start playing the video
              video.play().catch((e) => {
                console.warn("Video play warning:", e.message);
                // Don't reject immediately, some videos may still work
              });
            });

            // Wait additional time for video to stabilize and render frames
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Check video state before attempting to draw
            if (video.readyState < 2) {
              throw new Error(
                "Video not ready for capture, readyState: " + video.readyState
              );
            }

            if (video.videoWidth === 0 || video.videoHeight === 0) {
              throw new Error(
                "Video has invalid dimensions: " +
                  video.videoWidth +
                  "x" +
                  video.videoHeight
              );
            }

            // Create canvas and capture frame
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");

            console.log("Canvas created:", canvas.width, "x", canvas.height);

            if (canvas.width === 0 || canvas.height === 0) {
              throw new Error(
                "Invalid canvas dimensions: " +
                  canvas.width +
                  "x" +
                  canvas.height
              );
            }

            // Attempt to draw the video frame to canvas with error handling
            try {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              console.log("Video frame drawn to canvas successfully");
            } catch (drawError) {
              console.error("Error drawing video to canvas:", drawError);
              throw new Error(
                "Failed to draw video frame: " + drawError.message
              );
            }

            // Convert canvas to data URL
            let dataUrl;
            try {
              dataUrl = canvas.toDataURL("image/png");
              console.log(
                "Canvas converted to data URL, length:",
                dataUrl.length
              );
            } catch (toDataURLError) {
              console.error(
                "Error converting canvas to data URL:",
                toDataURLError
              );
              throw new Error(
                "Failed to convert image: " + toDataURLError.message
              );
            }

            if (!dataUrl || dataUrl.length < 100) {
              throw new Error("Generated image data is invalid or too small");
            }

            // Clean up video element
            document.body.removeChild(video);

            // Stop the stream
            stream.getTracks().forEach((track) => track.stop());

            console.log("Window capture successful, initiating download...");

            // Download the image
            const filename = `window-capture-${new Date()
              .toISOString()
              .slice(0, 19)
              .replace(/:/g, "-")}.png`;

            const link = document.createElement("a");
            link.download = filename;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Send success message back
            chrome.runtime.sendMessage({
              action: "windowCaptureComplete",
              success: true,
            });
          } catch (error) {
            console.error("Error in window capture:", error);
            chrome.runtime.sendMessage({
              action: "windowCaptureComplete",
              success: false,
              error: error.message,
            });
          }
        },
        args: [streamId],
      });

      this.showNotification(
        "Window capture initiated",
        "Processing window screenshot..."
      );
      sendResponse({ success: true });
    } catch (error) {
      console.error("Error handling window capture:", error);
      sendResponse({ success: false, error: error.message });
      this.showNotification("Window capture failed", "Please try again");
    }
  }

  async handleFullPageDownload(request, sendResponse) {
    try {
      const filename = `full-page-capture-${new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-")}.png`;

      const downloadId = await chrome.downloads.download({
        url: request.dataUrl,
        filename: filename,
        saveAs: true,
      });

      this.showNotification(
        "Full page captured",
        "Full page screenshot saved successfully"
      );
      sendResponse({ success: true, downloadId });
    } catch (error) {
      console.error("Error downloading full page capture:", error);
      sendResponse({ error: error.message });
    }
  }

  async saveToHistory(captureData) {
    try {
      const history = (await chrome.storage.local.get(["captureHistory"])) || {
        captureHistory: [],
      };
      const historyArray = history.captureHistory || [];

      historyArray.unshift({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        type: captureData.type,
        filename: captureData.filename,
        size: captureData.size,
        format: captureData.format,
        thumbnail: captureData.thumbnail,
      });

      if (historyArray.length > 50) {
        historyArray.splice(50);
      }

      await chrome.storage.local.set({ captureHistory: historyArray });
    } catch (error) {
      console.error("Error saving to history:", error);
    }
  }
}

// Initialize background script with comprehensive error handling
try {
  console.log("Starting ScreenRecorderBackground initialization...");
  new ScreenRecorderBackground();
  console.log("ScreenRecorderBackground initialized successfully");
} catch (error) {
  console.error(
    "CRITICAL: Failed to initialize ScreenRecorderBackground:",
    error
  );

  // Try to create a minimal fallback background script
  try {
    console.log("Attempting to create minimal fallback background script...");

    // Minimal event listeners to prevent complete failure
    chrome.runtime.onInstalled.addListener(() => {
      console.log("Extension installed (fallback mode)");
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("Message received in fallback mode:", request.action);
      sendResponse({ error: "Extension in fallback mode" });
    });

    console.log("Fallback background script created");
  } catch (fallbackError) {
    console.error(
      "CRITICAL: Even fallback initialization failed:",
      fallbackError
    );
  }
}
