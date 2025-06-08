// 🎨 Advanced Annotation & Markup Tool - Real-time drawing with zero lag
class AnnotationMarkup {
  constructor(toolsManager) {
    this.toolsManager = toolsManager;
    this.isActive = false;
    this.isDrawing = false;
    this.overlay = null;
    this.canvas = null;
    this.ctx = null;
    this.toolbar = null;
    this.performanceOptimizer = null;
    
    // Drawing state
    this.currentTool = 'pen';
    this.currentColor = '#ff0000';
    this.currentSize = 3;
    this.currentOpacity = 1;
    this.drawingHistory = [];
    this.historyIndex = -1;
    
    // Performance tracking
    this.lastDrawTime = 0;
    this.drawQueue = [];
    this.isProcessingQueue = false;
    
    // Tools configuration
    this.tools = {
      pen: { cursor: 'crosshair', composite: 'source-over' },
      highlighter: { cursor: 'crosshair', composite: 'multiply' },
      eraser: { cursor: 'crosshair', composite: 'destination-out' },
      text: { cursor: 'text', composite: 'source-over' },
      arrow: { cursor: 'crosshair', composite: 'source-over' },
      rectangle: { cursor: 'crosshair', composite: 'source-over' },
      circle: { cursor: 'crosshair', composite: 'source-over' },
      blur: { cursor: 'crosshair', composite: 'source-over' }
    };
  }

  async init() {
    console.log('🎨 Initializing Advanced Annotation Tool...');
    
    // Initialize performance optimizer
    if (window.PerformanceOptimizer) {
      this.performanceOptimizer = new window.PerformanceOptimizer();
    }
  }

  async activate(options = {}) {
    if (this.isActive) return;
    
    console.log('🎨 Activating Advanced Annotation Tool...');
    this.isActive = true;
    
    // Create annotation overlay
    await this.createAnnotationOverlay();
    
    // Setup high-performance canvas
    this.setupHighPerformanceCanvas();
    
    // Create toolbar
    this.createToolbar();
    
    // Setup event handlers
    this.setupEventHandlers();
    
    // Initialize with performance optimization
    if (this.performanceOptimizer) {
      await this.performanceOptimizer.optimizeAnnotation(this);
    }
    
    this.showInterface();
  }

  async deactivate() {
    if (!this.isActive) return;
    
    console.log('🎨 Deactivating Advanced Annotation Tool...');
    this.isActive = false;
    
    // Save current work
    await this.saveAnnotations();
    
    // Remove overlay
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    
    // Clean up resources
    this.cleanup();
  }

  async bringToFront() {
    if (this.overlay) {
      this.overlay.style.zIndex = '999999';
    }
  }

  async createAnnotationOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'annotation-markup-overlay';
    this.overlay.innerHTML = `
      <div class="annotation-container">
        <div class="annotation-toolbar" id="annotationToolbar">
          <!-- Toolbar will be populated by createToolbar() -->
        </div>
        
        <div class="annotation-canvas-container">
          <canvas id="annotationCanvas" class="annotation-canvas"></canvas>
          <div class="annotation-controls">
            <button class="annotation-btn" id="undoBtn" title="Undo (Ctrl+Z)">↶</button>
            <button class="annotation-btn" id="redoBtn" title="Redo (Ctrl+Y)">↷</button>
            <button class="annotation-btn" id="clearBtn" title="Clear All">🗑️</button>
            <button class="annotation-btn" id="saveBtn" title="Save">💾</button>
            <button class="annotation-btn" id="closeBtn" title="Close">✕</button>
          </div>
        </div>
        
        <div class="annotation-status" id="annotationStatus">
          <span class="status-text">Ready to annotate</span>
          <span class="performance-indicator" id="performanceIndicator">⚡</span>
        </div>
      </div>
    `;

    // Add styles
    this.addStyles();
    
    // Append to body
    document.body.appendChild(this.overlay);
  }

  setupHighPerformanceCanvas() {
    this.canvas = document.getElementById('annotationCanvas');
    this.ctx = this.canvas.getContext('2d', {
      alpha: true,
      desynchronized: true, // Enable low-latency rendering
      willReadFrequently: false // Optimize for writing
    });
    
    // Set canvas size to full viewport
    this.resizeCanvas();
    
    // Setup high-performance rendering
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    // Enable hardware acceleration hints
    this.ctx.globalCompositeOperation = 'source-over';
    
    // Setup resize observer
    this.setupResizeObserver();
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Set actual size in memory (scaled for high DPI)
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    
    // Scale the canvas back down using CSS
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    
    // Scale the drawing context so everything draws at the correct size
    this.ctx.scale(dpr, dpr);
  }

  createToolbar() {
    const toolbar = document.getElementById('annotationToolbar');
    toolbar.innerHTML = `
      <div class="tool-group">
        <button class="tool-btn active" data-tool="pen" title="Pen">🖊️</button>
        <button class="tool-btn" data-tool="highlighter" title="Highlighter">🖍️</button>
        <button class="tool-btn" data-tool="eraser" title="Eraser">🧽</button>
        <button class="tool-btn" data-tool="text" title="Text">📝</button>
      </div>
      
      <div class="tool-group">
        <button class="tool-btn" data-tool="arrow" title="Arrow">➡️</button>
        <button class="tool-btn" data-tool="rectangle" title="Rectangle">⬜</button>
        <button class="tool-btn" data-tool="circle" title="Circle">⭕</button>
        <button class="tool-btn" data-tool="blur" title="Blur">🌫️</button>
      </div>
      
      <div class="tool-group">
        <label class="tool-label">Color:</label>
        <input type="color" id="colorPicker" value="#ff0000" class="color-picker">
        <div class="color-presets">
          <div class="color-preset" data-color="#ff0000" style="background: #ff0000"></div>
          <div class="color-preset" data-color="#00ff00" style="background: #00ff00"></div>
          <div class="color-preset" data-color="#0000ff" style="background: #0000ff"></div>
          <div class="color-preset" data-color="#ffff00" style="background: #ffff00"></div>
          <div class="color-preset" data-color="#ff00ff" style="background: #ff00ff"></div>
          <div class="color-preset" data-color="#00ffff" style="background: #00ffff"></div>
        </div>
      </div>
      
      <div class="tool-group">
        <label class="tool-label">Size:</label>
        <input type="range" id="sizePicker" min="1" max="50" value="3" class="size-picker">
        <span id="sizeValue" class="size-value">3px</span>
      </div>
      
      <div class="tool-group">
        <label class="tool-label">Opacity:</label>
        <input type="range" id="opacityPicker" min="0.1" max="1" step="0.1" value="1" class="opacity-picker">
        <span id="opacityValue" class="opacity-value">100%</span>
      </div>
    `;
  }

  setupEventHandlers() {
    // Tool selection
    this.overlay.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectTool(e.target.dataset.tool);
      });
    });

    // Color picker
    const colorPicker = this.overlay.querySelector('#colorPicker');
    colorPicker.addEventListener('change', (e) => {
      this.currentColor = e.target.value;
    });

    // Color presets
    this.overlay.querySelectorAll('.color-preset').forEach(preset => {
      preset.addEventListener('click', (e) => {
        this.currentColor = e.target.dataset.color;
        colorPicker.value = this.currentColor;
      });
    });

    // Size picker
    const sizePicker = this.overlay.querySelector('#sizePicker');
    const sizeValue = this.overlay.querySelector('#sizeValue');
    sizePicker.addEventListener('input', (e) => {
      this.currentSize = parseInt(e.target.value);
      sizeValue.textContent = `${this.currentSize}px`;
    });

    // Opacity picker
    const opacityPicker = this.overlay.querySelector('#opacityPicker');
    const opacityValue = this.overlay.querySelector('#opacityValue');
    opacityPicker.addEventListener('input', (e) => {
      this.currentOpacity = parseFloat(e.target.value);
      opacityValue.textContent = `${Math.round(this.currentOpacity * 100)}%`;
    });

    // Canvas drawing events
    this.setupCanvasEvents();

    // Control buttons
    this.setupControlButtons();

    // Keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  setupCanvasEvents() {
    let isDrawing = false;
    let startX, startY;
    let lastX, lastY;

    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      const rect = this.canvas.getBoundingClientRect();
      startX = lastX = e.clientX - rect.left;
      startY = lastY = e.clientY - rect.top;
      
      this.startDrawing(startX, startY);
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (!isDrawing) return;
      
      const rect = this.canvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      
      this.continueDrawing(lastX, lastY, currentX, currentY);
      
      lastX = currentX;
      lastY = currentY;
    });

    this.canvas.addEventListener('mouseup', () => {
      if (isDrawing) {
        isDrawing = false;
        this.finishDrawing();
      }
    });

    // Touch events for mobile
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      startX = lastX = touch.clientX - rect.left;
      startY = lastY = touch.clientY - rect.top;
      
      isDrawing = true;
      this.startDrawing(startX, startY);
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!isDrawing) return;
      
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const currentX = touch.clientX - rect.left;
      const currentY = touch.clientY - rect.top;
      
      this.continueDrawing(lastX, lastY, currentX, currentY);
      
      lastX = currentX;
      lastY = currentY;
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (isDrawing) {
        isDrawing = false;
        this.finishDrawing();
      }
    }, { passive: false });
  }

  startDrawing(x, y) {
    this.saveState(); // Save for undo
    
    this.ctx.globalCompositeOperation = this.tools[this.currentTool].composite;
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.currentSize;
    this.ctx.globalAlpha = this.currentOpacity;
    
    if (this.currentTool === 'highlighter') {
      this.ctx.globalAlpha = 0.3;
    }
    
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    
    this.isDrawing = true;
    this.lastDrawTime = performance.now();
  }

  continueDrawing(lastX, lastY, currentX, currentY) {
    if (!this.isDrawing) return;
    
    const now = performance.now();
    const deltaTime = now - this.lastDrawTime;
    
    // Throttle drawing for performance (max 60fps)
    if (deltaTime < 16.67) {
      this.queueDrawOperation(lastX, lastY, currentX, currentY);
      return;
    }
    
    this.executeDrawing(lastX, lastY, currentX, currentY);
    this.lastDrawTime = now;
  }

  queueDrawOperation(lastX, lastY, currentX, currentY) {
    this.drawQueue.push({ lastX, lastY, currentX, currentY });
    
    if (!this.isProcessingQueue) {
      this.processDrawQueue();
    }
  }

  processDrawQueue() {
    this.isProcessingQueue = true;
    
    requestAnimationFrame(() => {
      while (this.drawQueue.length > 0) {
        const operation = this.drawQueue.shift();
        this.executeDrawing(operation.lastX, operation.lastY, operation.currentX, operation.currentY);
      }
      this.isProcessingQueue = false;
    });
  }

  executeDrawing(lastX, lastY, currentX, currentY) {
    switch (this.currentTool) {
      case 'pen':
      case 'highlighter':
      case 'eraser':
        this.drawLine(lastX, lastY, currentX, currentY);
        break;
      case 'text':
        // Text tool handled differently
        break;
      default:
        this.drawShape(lastX, lastY, currentX, currentY);
    }
  }

  drawLine(lastX, lastY, currentX, currentY) {
    this.ctx.lineTo(currentX, currentY);
    this.ctx.stroke();
  }

  drawShape(startX, startY, currentX, currentY) {
    // For shapes, we'll implement preview drawing
    // This is a simplified version - full implementation would include preview
    switch (this.currentTool) {
      case 'rectangle':
        this.ctx.strokeRect(startX, startY, currentX - startX, currentY - startY);
        break;
      case 'circle':
        const radius = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
        this.ctx.beginPath();
        this.ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
        break;
      case 'arrow':
        this.drawArrow(startX, startY, currentX, currentY);
        break;
    }
  }

  drawArrow(startX, startY, endX, endY) {
    const headLength = 20;
    const angle = Math.atan2(endY - startY, endX - startX);
    
    // Draw line
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();
    
    // Draw arrowhead
    this.ctx.beginPath();
    this.ctx.moveTo(endX, endY);
    this.ctx.lineTo(endX - headLength * Math.cos(angle - Math.PI / 6), endY - headLength * Math.sin(angle - Math.PI / 6));
    this.ctx.moveTo(endX, endY);
    this.ctx.lineTo(endX - headLength * Math.cos(angle + Math.PI / 6), endY - headLength * Math.sin(angle + Math.PI / 6));
    this.ctx.stroke();
  }

  finishDrawing() {
    this.isDrawing = false;
    this.ctx.closePath();
    
    // Process any remaining queued operations
    if (this.drawQueue.length > 0) {
      this.processDrawQueue();
    }
    
    this.updatePerformanceIndicator();
  }

  selectTool(tool) {
    if (!this.tools[tool]) return;
    
    this.currentTool = tool;
    this.canvas.style.cursor = this.tools[tool].cursor;
    
    // Update UI
    this.overlay.querySelectorAll('.tool-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    });
    
    this.updateStatus(`${tool.charAt(0).toUpperCase() + tool.slice(1)} tool selected`);
  }

  saveState() {
    // Save current canvas state for undo
    this.historyIndex++;
    this.drawingHistory = this.drawingHistory.slice(0, this.historyIndex);
    this.drawingHistory.push(this.canvas.toDataURL());
    
    // Limit history size
    if (this.drawingHistory.length > 50) {
      this.drawingHistory.shift();
      this.historyIndex--;
    }
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.restoreState(this.drawingHistory[this.historyIndex]);
    }
  }

  redo() {
    if (this.historyIndex < this.drawingHistory.length - 1) {
      this.historyIndex++;
      this.restoreState(this.drawingHistory[this.historyIndex]);
    }
  }

  restoreState(dataUrl) {
    const img = new Image();
    img.onload = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.saveState();
    this.updateStatus('Canvas cleared');
  }

  async saveAnnotations() {
    const dataUrl = this.canvas.toDataURL('image/png');
    const filename = `annotation-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
    
    // Create download link
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
    
    // Save to extension storage
    await this.toolsManager.setToolData('annotation-markup', 'last-annotation', {
      filename,
      dataUrl,
      timestamp: Date.now()
    });
    
    this.updateStatus('Annotations saved');
  }

  setupControlButtons() {
    this.overlay.querySelector('#undoBtn').addEventListener('click', () => this.undo());
    this.overlay.querySelector('#redoBtn').addEventListener('click', () => this.redo());
    this.overlay.querySelector('#clearBtn').addEventListener('click', () => this.clear());
    this.overlay.querySelector('#saveBtn').addEventListener('click', () => this.saveAnnotations());
    this.overlay.querySelector('#closeBtn').addEventListener('click', () => this.deactivate());
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (!this.isActive) return;
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              this.redo();
            } else {
              this.undo();
            }
            break;
          case 'y':
            e.preventDefault();
            this.redo();
            break;
          case 's':
            e.preventDefault();
            this.saveAnnotations();
            break;
        }
      }
      
      // Tool shortcuts
      const toolKeys = {
        'p': 'pen',
        'h': 'highlighter',
        'e': 'eraser',
        't': 'text',
        'a': 'arrow',
        'r': 'rectangle',
        'c': 'circle'
      };
      
      if (toolKeys[e.key]) {
        this.selectTool(toolKeys[e.key]);
      }
    });
  }

  setupResizeObserver() {
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        this.resizeCanvas();
      });
      resizeObserver.observe(document.body);
    } else {
      window.addEventListener('resize', () => {
        this.resizeCanvas();
      });
    }
  }

  updateStatus(message) {
    const statusEl = this.overlay.querySelector('.status-text');
    if (statusEl) {
      statusEl.textContent = message;
    }
  }

  updatePerformanceIndicator() {
    const indicator = this.overlay.querySelector('#performanceIndicator');
    if (!indicator) return;
    
    const fps = this.calculateFPS();
    
    if (fps > 50) {
      indicator.textContent = '⚡'; // Excellent
      indicator.style.color = '#00ff00';
    } else if (fps > 30) {
      indicator.textContent = '🔥'; // Good
      indicator.style.color = '#ffff00';
    } else {
      indicator.textContent = '🐌'; // Needs optimization
      indicator.style.color = '#ff0000';
    }
  }

  calculateFPS() {
    // Simple FPS calculation based on draw operations
    const now = performance.now();
    const timeDiff = now - this.lastDrawTime;
    return timeDiff > 0 ? 1000 / timeDiff : 60;
  }

  addStyles() {
    if (document.getElementById('annotation-markup-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'annotation-markup-styles';
    styles.textContent = `
      #annotation-markup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 999998;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        pointer-events: none;
      }

      .annotation-container {
        width: 100%;
        height: 100%;
        position: relative;
      }

      .annotation-toolbar {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 12px;
        padding: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        display: flex;
        gap: 16px;
        align-items: center;
        z-index: 1000000;
        pointer-events: auto;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }

      .tool-group {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 0 8px;
        border-right: 1px solid rgba(0, 0, 0, 0.1);
      }

      .tool-group:last-child {
        border-right: none;
      }

      .tool-btn {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        padding: 8px;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.2s ease;
        min-width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .tool-btn:hover {
        background: #f5f5f5;
        border-color: #667eea;
        transform: translateY(-1px);
      }

      .tool-btn.active {
        background: #667eea;
        color: white;
        border-color: #667eea;
      }

      .tool-label {
        font-size: 12px;
        font-weight: 500;
        color: #666;
        margin-right: 4px;
      }

      .color-picker {
        width: 36px;
        height: 36px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
      }

      .color-presets {
        display: flex;
        gap: 4px;
        margin-left: 8px;
      }

      .color-preset {
        width: 20px;
        height: 20px;
        border-radius: 4px;
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
      }

      .size-picker,
      .opacity-picker {
        width: 80px;
      }

      .size-value,
      .opacity-value {
        font-size: 11px;
        color: #666;
        min-width: 30px;
        text-align: center;
      }

      .annotation-canvas {
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: auto;
        cursor: crosshair;
      }

      .annotation-controls {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 12px;
        padding: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        display: flex;
        gap: 8px;
        pointer-events: auto;
        border: 1px solid rgba(0, 0, 0, 0.1);
      }

      .annotation-btn {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        padding: 8px 12px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
      }

      .annotation-btn:hover {
        background: #f5f5f5;
        border-color: #667eea;
        transform: translateY(-1px);
      }

      .annotation-status {
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        pointer-events: auto;
      }

      .performance-indicator {
        font-size: 16px;
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .annotation-toolbar,
        .annotation-controls {
          background: rgba(30, 30, 30, 0.95);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .tool-btn,
        .annotation-btn {
          background: rgba(50, 50, 50, 0.8);
          border-color: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .tool-btn:hover,
        .annotation-btn:hover {
          background: rgba(70, 70, 70, 0.8);
        }

        .tool-label,
        .size-value,
        .opacity-value {
          color: #ccc;
        }
      }
    `;
    
    document.head.appendChild(styles);
  }

  showInterface() {
    // Interface is shown when overlay is created
    this.updateStatus('Annotation tool ready - Select a tool and start drawing');
  }

  cleanup() {
    // Clean up resources
    this.drawQueue = [];
    this.drawingHistory = [];
    this.historyIndex = -1;
    
    if (this.canvas) {
      this.canvas = null;
      this.ctx = null;
    }
  }

  showSuccess(message) {
    this.toolsManager.ui.showSuccess(message);
  }

  showError(message) {
    this.toolsManager.ui.showError(message);
  }
}

// Make class globally available
window.AnnotationMarkup = AnnotationMarkup;
