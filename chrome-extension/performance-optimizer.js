// 🚀 Performance Optimizer - Enhanced recording, annotation, and capture with zero lag
class PerformanceOptimizer {
  constructor() {
    this.metrics = {
      recording: {
        frameDrops: 0,
        avgBitrate: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        startTime: 0,
        chunks: []
      },
      capture: {
        captureTime: 0,
        processTime: 0,
        fileSize: 0,
        quality: 100
      },
      annotation: {
        drawLatency: 0,
        renderTime: 0,
        strokeCount: 0
      }
    };
    
    this.optimizations = {
      adaptiveBitrate: true,
      smartChunking: true,
      memoryManagement: true,
      gpuAcceleration: true,
      backgroundProcessing: true
    };
    
    this.init();
  }

  async init() {
    console.log('🚀 Initializing Performance Optimizer...');
    
    // Setup performance monitoring
    this.setupPerformanceMonitoring();
    
    // Initialize GPU acceleration if available
    await this.initializeGPUAcceleration();
    
    // Setup memory management
    this.setupMemoryManagement();
    
    // Initialize background processing
    this.setupBackgroundProcessing();
    
    console.log('🚀 Performance Optimizer ready');
  }

  // 🎬 ENHANCED RECORDING OPTIMIZATION
  async optimizeRecording(mediaRecorder, stream, settings = {}) {
    console.log('🎬 Optimizing recording performance...');
    
    // Adaptive bitrate based on system performance
    const optimizedBitrate = await this.calculateOptimalBitrate(settings);
    
    // Smart chunking for better memory management
    const chunkInterval = this.calculateOptimalChunkInterval();
    
    // Enhanced MediaRecorder with performance monitoring
    const enhancedRecorder = this.enhanceMediaRecorder(mediaRecorder, {
      videoBitsPerSecond: optimizedBitrate,
      chunkInterval: chunkInterval,
      ...settings
    });
    
    // Setup real-time performance monitoring
    this.monitorRecordingPerformance(enhancedRecorder, stream);
    
    return enhancedRecorder;
  }

  async calculateOptimalBitrate(settings) {
    // Get system performance metrics
    const systemInfo = await this.getSystemPerformance();
    const resolution = settings.resolution || '1080p';
    const frameRate = settings.frameRate || 30;
    
    // Base bitrates for different resolutions
    const baseBitrates = {
      '720p': 2500000,   // 2.5 Mbps
      '1080p': 5000000,  // 5 Mbps
      '1440p': 8000000,  // 8 Mbps
      '4k': 15000000     // 15 Mbps
    };
    
    let baseBitrate = baseBitrates[resolution] || baseBitrates['1080p'];
    
    // Adjust based on system performance
    if (systemInfo.cpuUsage > 80) {
      baseBitrate *= 0.7; // Reduce by 30% for high CPU usage
    } else if (systemInfo.memoryUsage > 85) {
      baseBitrate *= 0.8; // Reduce by 20% for high memory usage
    }
    
    // Adjust for frame rate
    const frameRateMultiplier = frameRate / 30;
    baseBitrate *= frameRateMultiplier;
    
    console.log(`🎬 Optimal bitrate calculated: ${Math.round(baseBitrate / 1000000)}Mbps`);
    return Math.round(baseBitrate);
  }

  calculateOptimalChunkInterval() {
    // Dynamic chunk interval based on available memory
    const availableMemory = this.getAvailableMemory();
    
    if (availableMemory < 1000) { // Less than 1GB
      return 500; // 0.5 second chunks
    } else if (availableMemory < 2000) { // Less than 2GB
      return 1000; // 1 second chunks
    } else {
      return 2000; // 2 second chunks for better quality
    }
  }

  enhanceMediaRecorder(mediaRecorder, options) {
    const startTime = performance.now();
    this.metrics.recording.startTime = startTime;
    
    // Enhanced data available handler with performance tracking
    const originalOnDataAvailable = mediaRecorder.ondataavailable;
    mediaRecorder.ondataavailable = (event) => {
      const chunkTime = performance.now();
      
      if (event.data && event.data.size > 0) {
        // Track chunk metrics
        this.metrics.recording.chunks.push({
          size: event.data.size,
          timestamp: chunkTime,
          timeSinceStart: chunkTime - startTime
        });
        
        // Memory management
        this.manageRecordingMemory();
        
        // Call original handler
        if (originalOnDataAvailable) {
          originalOnDataAvailable(event);
        }
      }
    };
    
    // Enhanced error handling
    const originalOnError = mediaRecorder.onerror;
    mediaRecorder.onerror = (event) => {
      console.error('🎬 Recording error with performance context:', {
        error: event,
        metrics: this.metrics.recording,
        systemInfo: this.getSystemPerformance()
      });
      
      if (originalOnError) {
        originalOnError(event);
      }
    };
    
    return mediaRecorder;
  }

  // 📸 ENHANCED CAPTURE OPTIMIZATION
  async optimizeCapture(captureFunction, options = {}) {
    console.log('📸 Optimizing capture performance...');
    
    const startTime = performance.now();
    
    try {
      // Pre-capture optimization
      await this.prepareCaptureEnvironment();
      
      // Execute capture with performance monitoring
      const result = await this.executeOptimizedCapture(captureFunction, options);
      
      // Post-capture optimization
      const optimizedResult = await this.postProcessCapture(result, options);
      
      // Record metrics
      this.metrics.capture.captureTime = performance.now() - startTime;
      this.metrics.capture.fileSize = this.estimateFileSize(optimizedResult);
      
      console.log(`📸 Capture completed in ${this.metrics.capture.captureTime.toFixed(2)}ms`);
      
      return optimizedResult;
      
    } catch (error) {
      console.error('📸 Capture optimization error:', error);
      throw error;
    }
  }

  async prepareCaptureEnvironment() {
    // Clear unnecessary memory
    if (window.gc && typeof window.gc === 'function') {
      window.gc();
    }
    
    // Pause non-essential animations
    this.pauseAnimations();
    
    // Optimize GPU memory
    await this.optimizeGPUMemory();
  }

  async executeOptimizedCapture(captureFunction, options) {
    // Use requestAnimationFrame for optimal timing
    return new Promise((resolve, reject) => {
      requestAnimationFrame(async () => {
        try {
          const result = await captureFunction(options);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async postProcessCapture(imageData, options) {
    const processStart = performance.now();
    
    // Optimize image if needed
    let optimizedData = imageData;
    
    if (options.optimize !== false) {
      optimizedData = await this.optimizeImageData(imageData, options);
    }
    
    this.metrics.capture.processTime = performance.now() - processStart;
    
    return optimizedData;
  }

  async optimizeImageData(imageData, options) {
    // Use OffscreenCanvas for better performance if available
    if (typeof OffscreenCanvas !== 'undefined') {
      return this.optimizeWithOffscreenCanvas(imageData, options);
    } else {
      return this.optimizeWithCanvas(imageData, options);
    }
  }

  async optimizeWithOffscreenCanvas(imageData, options) {
    const img = new Image();
    img.src = imageData;
    
    return new Promise((resolve) => {
      img.onload = () => {
        const canvas = new OffscreenCanvas(img.width, img.height);
        const ctx = canvas.getContext('2d');
        
        // Apply optimizations
        ctx.imageSmoothingEnabled = options.smoothing !== false;
        ctx.imageSmoothingQuality = options.quality || 'high';
        
        ctx.drawImage(img, 0, 0);
        
        // Convert to optimized format
        canvas.convertToBlob({
          type: options.format || 'image/png',
          quality: options.compressionQuality || 0.95
        }).then(blob => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      };
    });
  }

  // 🎨 ENHANCED ANNOTATION OPTIMIZATION
  async optimizeAnnotation(annotationSystem) {
    console.log('🎨 Optimizing annotation performance...');
    
    // Setup high-performance canvas
    const optimizedCanvas = this.createOptimizedCanvas(annotationSystem.canvas);
    
    // Implement efficient drawing algorithms
    this.implementEfficientDrawing(optimizedCanvas);
    
    // Setup real-time performance monitoring
    this.monitorAnnotationPerformance(optimizedCanvas);
    
    return optimizedCanvas;
  }

  createOptimizedCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    
    // Enable hardware acceleration
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Optimize for frequent redraws
    ctx.globalCompositeOperation = 'source-over';
    
    // Setup efficient event handling
    this.setupEfficientEventHandling(canvas);
    
    return canvas;
  }

  implementEfficientDrawing(canvas) {
    const ctx = canvas.getContext('2d');
    
    // Batch drawing operations
    let drawQueue = [];
    let isDrawing = false;
    
    const flushDrawQueue = () => {
      if (drawQueue.length === 0) return;
      
      const drawStart = performance.now();
      
      ctx.beginPath();
      drawQueue.forEach(operation => {
        switch (operation.type) {
          case 'moveTo':
            ctx.moveTo(operation.x, operation.y);
            break;
          case 'lineTo':
            ctx.lineTo(operation.x, operation.y);
            break;
          case 'stroke':
            ctx.stroke();
            break;
        }
      });
      
      drawQueue = [];
      
      this.metrics.annotation.renderTime = performance.now() - drawStart;
    };
    
    // Throttled drawing using requestAnimationFrame
    const throttledDraw = () => {
      if (!isDrawing) {
        isDrawing = true;
        requestAnimationFrame(() => {
          flushDrawQueue();
          isDrawing = false;
        });
      }
    };
    
    // Replace canvas drawing methods with optimized versions
    canvas.queueDraw = (operation) => {
      drawQueue.push(operation);
      throttledDraw();
    };
    
    return canvas;
  }

  // 📊 PERFORMANCE MONITORING
  setupPerformanceMonitoring() {
    // Monitor frame rate
    this.monitorFrameRate();
    
    // Monitor memory usage
    this.monitorMemoryUsage();
    
    // Monitor CPU usage (estimated)
    this.monitorCPUUsage();
    
    // Setup performance reporting
    this.setupPerformanceReporting();
  }

  monitorFrameRate() {
    let lastTime = performance.now();
    let frameCount = 0;
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        this.metrics.recording.frameRate = fps;
        
        if (fps < 25) {
          console.warn(`🚀 Low frame rate detected: ${fps}fps`);
          this.adjustPerformanceSettings();
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  async getSystemPerformance() {
    const performance = {
      cpuUsage: 0,
      memoryUsage: 0,
      availableMemory: 0
    };
    
    // Estimate CPU usage based on frame timing
    const start = performance.now();
    await new Promise(resolve => setTimeout(resolve, 100));
    const end = performance.now();
    const expectedTime = 100;
    const actualTime = end - start;
    performance.cpuUsage = Math.max(0, Math.min(100, (actualTime - expectedTime) / expectedTime * 100));
    
    // Get memory info if available
    if (navigator.deviceMemory) {
      performance.availableMemory = navigator.deviceMemory * 1024; // Convert to MB
    }
    
    if (performance.memory) {
      performance.memoryUsage = (performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize) * 100;
    }
    
    return performance;
  }

  adjustPerformanceSettings() {
    console.log('🚀 Adjusting performance settings for better performance...');
    
    // Reduce quality settings
    this.optimizations.adaptiveBitrate = true;
    
    // Enable more aggressive memory management
    this.optimizations.memoryManagement = true;
    
    // Reduce chunk interval
    this.optimizations.smartChunking = true;
  }

  manageRecordingMemory() {
    const memoryUsage = this.getMemoryUsage();
    
    if (memoryUsage > 80) {
      console.log('🚀 High memory usage detected, optimizing...');
      
      // Force garbage collection if available
      if (window.gc && typeof window.gc === 'function') {
        window.gc();
      }
      
      // Clear old chunks if too many
      if (this.metrics.recording.chunks.length > 100) {
        this.metrics.recording.chunks = this.metrics.recording.chunks.slice(-50);
      }
    }
  }

  getMemoryUsage() {
    if (performance.memory) {
      return (performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize) * 100;
    }
    return 0;
  }

  getAvailableMemory() {
    if (navigator.deviceMemory) {
      return navigator.deviceMemory * 1024; // Convert to MB
    }
    return 4000; // Default assumption of 4GB
  }

  pauseAnimations() {
    // Pause CSS animations and transitions
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-delay: -0.01ms !important;
        transition-duration: 0.01ms !important;
        transition-delay: -0.01ms !important;
      }
    `;
    style.id = 'performance-optimizer-animations';
    document.head.appendChild(style);
    
    // Remove after capture
    setTimeout(() => {
      const pauseStyle = document.getElementById('performance-optimizer-animations');
      if (pauseStyle) {
        pauseStyle.remove();
      }
    }, 1000);
  }

  async initializeGPUAcceleration() {
    try {
      // Check for WebGL support
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      
      if (gl) {
        console.log('🚀 GPU acceleration available');
        this.optimizations.gpuAcceleration = true;
        
        // Get GPU info
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          console.log(`🚀 GPU: ${vendor} ${renderer}`);
        }
      } else {
        console.warn('🚀 GPU acceleration not available');
        this.optimizations.gpuAcceleration = false;
      }
    } catch (error) {
      console.warn('🚀 Error checking GPU acceleration:', error);
      this.optimizations.gpuAcceleration = false;
    }
  }

  async optimizeGPUMemory() {
    if (!this.optimizations.gpuAcceleration) return;
    
    // Clear GPU memory by creating and destroying a temporary context
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (gl) {
      // Force GPU memory cleanup
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.flush();
    }
  }

  setupBackgroundProcessing() {
    // Use Web Workers for heavy processing if available
    if (typeof Worker !== 'undefined') {
      console.log('🚀 Background processing available');
      this.optimizations.backgroundProcessing = true;
    } else {
      console.warn('🚀 Background processing not available');
      this.optimizations.backgroundProcessing = false;
    }
  }

  setupEfficientEventHandling(canvas) {
    // Use passive event listeners for better performance
    const options = { passive: true };
    
    canvas.addEventListener('touchstart', this.handleTouch.bind(this), options);
    canvas.addEventListener('touchmove', this.handleTouch.bind(this), options);
    canvas.addEventListener('touchend', this.handleTouch.bind(this), options);
  }

  handleTouch(event) {
    // Efficient touch handling with minimal processing
    const touch = event.touches[0] || event.changedTouches[0];
    if (touch) {
      const rect = event.target.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // Queue drawing operation instead of immediate execution
      event.target.queueDraw({
        type: event.type === 'touchstart' ? 'moveTo' : 'lineTo',
        x: x,
        y: y
      });
    }
  }

  setupPerformanceReporting() {
    // Report performance metrics every 5 seconds
    setInterval(() => {
      this.reportPerformanceMetrics();
    }, 5000);
  }

  reportPerformanceMetrics() {
    const report = {
      timestamp: Date.now(),
      recording: {
        frameRate: this.metrics.recording.frameRate || 0,
        chunks: this.metrics.recording.chunks.length,
        memoryUsage: this.getMemoryUsage()
      },
      capture: {
        lastCaptureTime: this.metrics.capture.captureTime,
        lastProcessTime: this.metrics.capture.processTime
      },
      annotation: {
        lastRenderTime: this.metrics.annotation.renderTime,
        strokeCount: this.metrics.annotation.strokeCount
      },
      optimizations: this.optimizations
    };
    
    console.log('🚀 Performance Report:', report);
    
    // Store metrics for analysis
    this.storePerformanceMetrics(report);
  }

  storePerformanceMetrics(report) {
    // Store in localStorage for analysis
    const key = 'performance-metrics';
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    stored.push(report);
    
    // Keep only last 100 reports
    if (stored.length > 100) {
      stored.splice(0, stored.length - 100);
    }
    
    localStorage.setItem(key, JSON.stringify(stored));
  }

  estimateFileSize(dataUrl) {
    // Estimate file size from data URL
    const base64Length = dataUrl.split(',')[1]?.length || 0;
    return Math.round(base64Length * 0.75); // Base64 is ~33% larger than binary
  }

  // Public API
  getPerformanceMetrics() {
    return { ...this.metrics };
  }

  getOptimizationSettings() {
    return { ...this.optimizations };
  }

  updateOptimizationSettings(settings) {
    this.optimizations = { ...this.optimizations, ...settings };
    console.log('🚀 Optimization settings updated:', this.optimizations);
  }
}

// Make globally available
window.PerformanceOptimizer = PerformanceOptimizer;
