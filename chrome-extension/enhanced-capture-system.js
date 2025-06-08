// 📸 Enhanced Capture System - Advanced screenshot capabilities with zero lag
class EnhancedCaptureSystem {
  constructor() {
    this.isActive = false;
    this.performanceOptimizer = null;
    this.captureHistory = [];
    this.currentCapture = null;
    
    // Capture modes
    this.modes = {
      instant: 'Instant capture',
      delayed: 'Delayed capture (3s)',
      area: 'Area selection',
      fullPage: 'Full page scroll',
      element: 'Element capture',
      batch: 'Batch capture'
    };
    
    // Format options
    this.formats = {
      png: { quality: 100, compression: false },
      jpeg: { quality: 95, compression: true },
      webp: { quality: 90, compression: true },
      pdf: { quality: 100, compression: false }
    };
    
    this.init();
  }

  async init() {
    console.log('📸 Initializing Enhanced Capture System...');
    
    // Initialize performance optimizer
    if (window.PerformanceOptimizer) {
      this.performanceOptimizer = new window.PerformanceOptimizer();
    }
    
    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
    
    // Load capture history
    await this.loadCaptureHistory();
  }

  // 📸 INSTANT CAPTURE - Zero lag screenshot
  async instantCapture(options = {}) {
    console.log('📸 Starting instant capture...');
    
    const startTime = performance.now();
    
    try {
      // Optimize for capture
      if (this.performanceOptimizer) {
        return await this.performanceOptimizer.optimizeCapture(
          () => this.executeInstantCapture(options),
          options
        );
      } else {
        return await this.executeInstantCapture(options);
      }
    } catch (error) {
      console.error('📸 Instant capture error:', error);
      throw error;
    }
  }

  async executeInstantCapture(options) {
    // Use the most efficient capture method available
    if (chrome.tabs && chrome.tabs.captureVisibleTab) {
      return await this.captureVisibleTab(options);
    } else if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      return await this.captureWithDisplayMedia(options);
    } else {
      throw new Error('No capture method available');
    }
  }

  async captureVisibleTab(options) {
    return new Promise((resolve, reject) => {
      const captureOptions = {
        format: options.format || 'png',
        quality: options.quality || 100
      };
      
      chrome.tabs.captureVisibleTab(null, captureOptions, (dataUrl) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (dataUrl) {
          resolve(dataUrl);
        } else {
          reject(new Error('Failed to capture visible tab'));
        }
      });
    });
  }

  async captureWithDisplayMedia(options) {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        mediaSource: 'screen',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    });
    
    try {
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      return new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0);
          
          const format = options.format || 'png';
          const quality = options.quality || 0.95;
          
          const dataUrl = canvas.toDataURL(`image/${format}`, quality);
          resolve(dataUrl);
        };
        
        video.onerror = reject;
      });
    } finally {
      stream.getTracks().forEach(track => track.stop());
    }
  }

  // 📸 DELAYED CAPTURE - Capture after countdown
  async delayedCapture(delay = 3000, options = {}) {
    console.log(`📸 Starting delayed capture (${delay}ms)...`);
    
    // Show countdown
    await this.showCountdown(delay);
    
    // Execute capture
    return await this.instantCapture(options);
  }

  async showCountdown(delay) {
    const countdown = Math.ceil(delay / 1000);
    
    const countdownEl = document.createElement('div');
    countdownEl.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      font-size: 72px;
      font-weight: bold;
      padding: 40px;
      border-radius: 20px;
      z-index: 1000000;
      text-align: center;
      font-family: Arial, sans-serif;
      backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(countdownEl);
    
    for (let i = countdown; i > 0; i--) {
      countdownEl.textContent = i;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    countdownEl.textContent = '📸';
    await new Promise(resolve => setTimeout(resolve, 200));
    
    countdownEl.remove();
  }

  // 📸 AREA SELECTION CAPTURE - Select specific area
  async areaCapture(options = {}) {
    console.log('📸 Starting area selection capture...');
    
    return new Promise((resolve, reject) => {
      this.createAreaSelector(resolve, reject, options);
    });
  }

  createAreaSelector(resolve, reject, options) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
      z-index: 999999;
      cursor: crosshair;
    `;
    
    const selectionBox = document.createElement('div');
    selectionBox.style.cssText = `
      position: absolute;
      border: 2px dashed #fff;
      background: rgba(255, 255, 255, 0.1);
      display: none;
    `;
    
    overlay.appendChild(selectionBox);
    document.body.appendChild(overlay);
    
    let isSelecting = false;
    let startX, startY;
    
    overlay.addEventListener('mousedown', (e) => {
      isSelecting = true;
      startX = e.clientX;
      startY = e.clientY;
      
      selectionBox.style.left = startX + 'px';
      selectionBox.style.top = startY + 'px';
      selectionBox.style.width = '0px';
      selectionBox.style.height = '0px';
      selectionBox.style.display = 'block';
    });
    
    overlay.addEventListener('mousemove', (e) => {
      if (!isSelecting) return;
      
      const currentX = e.clientX;
      const currentY = e.clientY;
      
      const left = Math.min(startX, currentX);
      const top = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);
      
      selectionBox.style.left = left + 'px';
      selectionBox.style.top = top + 'px';
      selectionBox.style.width = width + 'px';
      selectionBox.style.height = height + 'px';
    });
    
    overlay.addEventListener('mouseup', async (e) => {
      if (!isSelecting) return;
      
      isSelecting = false;
      overlay.remove();
      
      const endX = e.clientX;
      const endY = e.clientY;
      
      const area = {
        x: Math.min(startX, endX),
        y: Math.min(startY, endY),
        width: Math.abs(endX - startX),
        height: Math.abs(endY - startY)
      };
      
      try {
        const result = await this.captureArea(area, options);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    
    // Cancel on escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', handleEscape);
        reject(new Error('Area selection cancelled'));
      }
    };
    
    document.addEventListener('keydown', handleEscape);
  }

  async captureArea(area, options) {
    // First capture the full screen
    const fullCapture = await this.instantCapture(options);
    
    // Then crop to the selected area
    return await this.cropImage(fullCapture, area, options);
  }

  async cropImage(dataUrl, area, options) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = area.width;
        canvas.height = area.height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);
        
        const format = options.format || 'png';
        const quality = options.quality || 0.95;
        
        const croppedDataUrl = canvas.toDataURL(`image/${format}`, quality);
        resolve(croppedDataUrl);
      };
      img.src = dataUrl;
    });
  }

  // 📸 ELEMENT CAPTURE - Capture specific DOM element
  async elementCapture(element, options = {}) {
    console.log('📸 Starting element capture...');
    
    if (!element) {
      throw new Error('No element specified for capture');
    }
    
    // Get element bounds
    const rect = element.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    const area = {
      x: rect.left + scrollX,
      y: rect.top + scrollY,
      width: rect.width,
      height: rect.height
    };
    
    // Highlight element briefly
    if (options.highlight !== false) {
      this.highlightElement(element);
    }
    
    // Capture the area
    return await this.captureArea(area, options);
  }

  highlightElement(element) {
    const originalOutline = element.style.outline;
    element.style.outline = '3px solid #ff0000';
    
    setTimeout(() => {
      element.style.outline = originalOutline;
    }, 500);
  }

  // 📸 BATCH CAPTURE - Multiple captures with different settings
  async batchCapture(captureConfigs) {
    console.log(`📸 Starting batch capture (${captureConfigs.length} captures)...`);
    
    const results = [];
    
    for (let i = 0; i < captureConfigs.length; i++) {
      const config = captureConfigs[i];
      
      try {
        let result;
        
        switch (config.mode) {
          case 'instant':
            result = await this.instantCapture(config.options);
            break;
          case 'delayed':
            result = await this.delayedCapture(config.delay || 3000, config.options);
            break;
          case 'area':
            result = await this.areaCapture(config.options);
            break;
          case 'element':
            result = await this.elementCapture(config.element, config.options);
            break;
          default:
            result = await this.instantCapture(config.options);
        }
        
        results.push({
          index: i,
          config: config,
          result: result,
          timestamp: Date.now()
        });
        
        // Brief pause between captures
        if (i < captureConfigs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
      } catch (error) {
        console.error(`📸 Batch capture ${i} failed:`, error);
        results.push({
          index: i,
          config: config,
          error: error.message,
          timestamp: Date.now()
        });
      }
    }
    
    return results;
  }

  // 📸 SMART CAPTURE - AI-powered capture suggestions
  async smartCapture(options = {}) {
    console.log('📸 Starting smart capture...');
    
    // Analyze page content
    const analysis = this.analyzePage();
    
    // Suggest optimal capture settings
    const suggestions = this.generateCaptureSuggestions(analysis);
    
    // Execute capture with optimized settings
    const optimizedOptions = { ...options, ...suggestions };
    
    return await this.instantCapture(optimizedOptions);
  }

  analyzePage() {
    const analysis = {
      hasImages: document.images.length > 0,
      hasVideo: document.querySelectorAll('video').length > 0,
      hasCanvas: document.querySelectorAll('canvas').length > 0,
      pageHeight: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
      viewportHeight: window.innerHeight,
      colorDepth: screen.colorDepth,
      devicePixelRatio: window.devicePixelRatio || 1
    };
    
    return analysis;
  }

  generateCaptureSuggestions(analysis) {
    const suggestions = {};
    
    // Suggest format based on content
    if (analysis.hasImages || analysis.hasCanvas) {
      suggestions.format = 'png'; // Better for images with transparency
    } else {
      suggestions.format = 'jpeg'; // Smaller file size for text/simple graphics
    }
    
    // Suggest quality based on device
    if (analysis.devicePixelRatio > 1) {
      suggestions.quality = 100; // High quality for high-DPI displays
    } else {
      suggestions.quality = 95; // Balanced quality for standard displays
    }
    
    // Suggest capture mode based on page height
    if (analysis.pageHeight > analysis.viewportHeight * 2) {
      suggestions.mode = 'fullPage'; // Suggest full page capture for long pages
    }
    
    return suggestions;
  }

  // 📸 CAPTURE MANAGEMENT
  async saveCapture(dataUrl, options = {}) {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const format = options.format || 'png';
    const filename = options.filename || `capture-${timestamp}.${format}`;
    
    // Create download link
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
    
    // Add to history
    const captureRecord = {
      filename,
      format,
      timestamp: Date.now(),
      size: this.estimateFileSize(dataUrl),
      url: window.location.href,
      options
    };
    
    this.captureHistory.unshift(captureRecord);
    
    // Limit history size
    if (this.captureHistory.length > 100) {
      this.captureHistory = this.captureHistory.slice(0, 100);
    }
    
    // Save to storage
    await this.saveCaptureHistory();
    
    return captureRecord;
  }

  async loadCaptureHistory() {
    try {
      const stored = localStorage.getItem('capture-history');
      this.captureHistory = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('📸 Error loading capture history:', error);
      this.captureHistory = [];
    }
  }

  async saveCaptureHistory() {
    try {
      localStorage.setItem('capture-history', JSON.stringify(this.captureHistory));
    } catch (error) {
      console.error('📸 Error saving capture history:', error);
    }
  }

  getCaptureHistory() {
    return [...this.captureHistory];
  }

  clearCaptureHistory() {
    this.captureHistory = [];
    localStorage.removeItem('capture-history');
  }

  // 📸 UTILITY METHODS
  estimateFileSize(dataUrl) {
    const base64Length = dataUrl.split(',')[1]?.length || 0;
    return Math.round(base64Length * 0.75); // Base64 is ~33% larger than binary
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+S - Instant capture
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        this.instantCapture().then(dataUrl => {
          this.saveCapture(dataUrl);
        }).catch(console.error);
      }
      
      // Ctrl+Shift+A - Area capture
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        this.areaCapture().then(dataUrl => {
          this.saveCapture(dataUrl);
        }).catch(console.error);
      }
      
      // Ctrl+Shift+D - Delayed capture
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.delayedCapture().then(dataUrl => {
          this.saveCapture(dataUrl);
        }).catch(console.error);
      }
    });
  }

  // 📸 PUBLIC API
  async capture(mode = 'instant', options = {}) {
    switch (mode) {
      case 'instant':
        return await this.instantCapture(options);
      case 'delayed':
        return await this.delayedCapture(options.delay, options);
      case 'area':
        return await this.areaCapture(options);
      case 'element':
        return await this.elementCapture(options.element, options);
      case 'batch':
        return await this.batchCapture(options.configs);
      case 'smart':
        return await this.smartCapture(options);
      default:
        throw new Error(`Unknown capture mode: ${mode}`);
    }
  }

  async captureAndSave(mode = 'instant', options = {}) {
    const dataUrl = await this.capture(mode, options);
    return await this.saveCapture(dataUrl, options);
  }

  getAvailableModes() {
    return { ...this.modes };
  }

  getAvailableFormats() {
    return { ...this.formats };
  }
}

// Make globally available
window.EnhancedCaptureSystem = EnhancedCaptureSystem;
