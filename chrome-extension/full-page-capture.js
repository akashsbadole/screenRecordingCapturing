class FullPageCapture {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.scrollPosition = 0;
    this.totalHeight = 0;
    this.viewportHeight = 0;
    this.captures = [];
    this.isCapturing = false;
    
    this.init();
  }

  init() {
    if (this.isCapturing) return;
    this.isCapturing = true;
    
    this.showProgress();
    this.startCapture();
  }

  showProgress() {
    // Create progress overlay
    this.progressOverlay = document.createElement('div');
    this.progressOverlay.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      min-width: 200px;
    `;
    
    this.progressOverlay.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="width: 20px; height: 20px; border: 2px solid #333; border-top: 2px solid #fff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <div>
          <div style="font-weight: bold; margin-bottom: 4px;">Capturing Full Page</div>
          <div id="captureProgress">Preparing...</div>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    
    document.body.appendChild(this.progressOverlay);
  }

  updateProgress(message) {
    const progressElement = document.getElementById('captureProgress');
    if (progressElement) {
      progressElement.textContent = message;
    }
  }

  async startCapture() {
    try {
      // Get page dimensions
      this.totalHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      
      this.viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      // Create canvas for final image
      this.canvas = document.createElement('canvas');
      this.canvas.width = viewportWidth;
      this.canvas.height = this.totalHeight;
      this.ctx = this.canvas.getContext('2d');
      
      // Save original scroll position
      const originalScrollY = window.scrollY;
      
      // Calculate number of captures needed
      const numCaptures = Math.ceil(this.totalHeight / this.viewportHeight);
      
      this.updateProgress(`Capturing ${numCaptures} sections...`);
      
      // Capture each section
      for (let i = 0; i < numCaptures; i++) {
        const scrollY = i * this.viewportHeight;
        
        // Scroll to position
        window.scrollTo(0, scrollY);
        
        // Wait for scroll and rendering
        await this.wait(300);
        
        this.updateProgress(`Section ${i + 1} of ${numCaptures}`);
        
        // Capture visible area
        const dataUrl = await this.captureVisibleArea();
        
        if (dataUrl) {
          await this.addToCanvas(dataUrl, scrollY);
        }
      }
      
      // Restore original scroll position
      window.scrollTo(0, originalScrollY);
      
      this.updateProgress('Finalizing image...');
      
      // Convert canvas to image and download
      await this.downloadImage();
      
      this.cleanup();
      
    } catch (error) {
      console.error('Error capturing full page:', error);
      this.updateProgress('Error occurred during capture');
      setTimeout(() => this.cleanup(), 2000);
    }
  }

  async captureVisibleArea() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: 'captureVisibleTab', format: 'png', quality: 100 },
        (response) => {
          if (response && response.dataUrl) {
            resolve(response.dataUrl);
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  async addToCanvas(dataUrl, yOffset) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Calculate the actual height to draw (might be less for the last section)
        const drawHeight = Math.min(
          this.viewportHeight,
          this.totalHeight - yOffset
        );
        
        this.ctx.drawImage(
          img,
          0, 0, img.width, drawHeight,  // Source rectangle
          0, yOffset, this.canvas.width, drawHeight  // Destination rectangle
        );
        
        resolve();
      };
      img.onerror = () => resolve();
      img.src = dataUrl;
    });
  }

  async downloadImage() {
    const dataUrl = this.canvas.toDataURL('image/png', 1.0);
    const filename = `fullpage-capture-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
    
    // Send to background script for download
    chrome.runtime.sendMessage({
      action: 'downloadImage',
      dataUrl: dataUrl,
      filename: filename
    });
  }

  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  cleanup() {
    if (this.progressOverlay && this.progressOverlay.parentNode) {
      this.progressOverlay.parentNode.removeChild(this.progressOverlay);
    }
    this.isCapturing = false;
  }
}

// Auto-start capture when script is injected
new FullPageCapture();
