class ImageEditor {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.originalImage = null;
    this.currentTool = 'pen';
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.annotations = [];
    this.history = [];
    this.historyStep = -1;
    
    this.tools = {
      pen: { color: '#ff0000', size: 3 },
      highlighter: { color: '#ffff00', size: 10, opacity: 0.5 },
      text: { color: '#000000', size: 16, font: 'Arial' },
      rectangle: { color: '#ff0000', size: 2, fill: false },
      circle: { color: '#ff0000', size: 2, fill: false },
      arrow: { color: '#ff0000', size: 2 },
      blur: { radius: 10 },
      crop: {}
    };
    
    this.init();
  }

  init() {
    this.createEditor();
    this.bindEvents();
  }

  createEditor() {
    // Create editor overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'image-editor-overlay';
    this.overlay.innerHTML = `
      <div class="image-editor-container">
        <div class="editor-header">
          <h3>Image Editor</h3>
          <div class="editor-actions">
            <button id="saveImage" class="btn btn-primary">Save</button>
            <button id="closeEditor" class="btn btn-secondary">Close</button>
          </div>
        </div>
        
        <div class="editor-toolbar">
          <div class="tool-group">
            <button class="tool-btn active" data-tool="pen" title="Pen">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                <path d="M2 2l7.586 7.586"/>
                <circle cx="11" cy="11" r="2"/>
              </svg>
            </button>
            <button class="tool-btn" data-tool="highlighter" title="Highlighter">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 9h6v6h-6z"/>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <path d="M7 13v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
            <button class="tool-btn" data-tool="text" title="Text">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="4,7 4,4 20,4 20,7"/>
                <line x1="9" y1="20" x2="15" y2="20"/>
                <line x1="12" y1="4" x2="12" y2="20"/>
              </svg>
            </button>
            <button class="tool-btn" data-tool="rectangle" title="Rectangle">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              </svg>
            </button>
            <button class="tool-btn" data-tool="circle" title="Circle">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
              </svg>
            </button>
            <button class="tool-btn" data-tool="arrow" title="Arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12,5 19,12 12,19"/>
              </svg>
            </button>
            <button class="tool-btn" data-tool="blur" title="Blur">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
              </svg>
            </button>
            <button class="tool-btn" data-tool="crop" title="Crop">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"/>
                <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"/>
              </svg>
            </button>
          </div>
          
          <div class="tool-options">
            <div class="option-group">
              <label>Color:</label>
              <input type="color" id="toolColor" value="#ff0000">
            </div>
            <div class="option-group">
              <label>Size:</label>
              <input type="range" id="toolSize" min="1" max="50" value="3">
              <span id="sizeValue">3</span>
            </div>
            <div class="option-group">
              <button id="undoBtn" title="Undo">↶</button>
              <button id="redoBtn" title="Redo">↷</button>
            </div>
          </div>
        </div>
        
        <div class="editor-canvas-container">
          <canvas id="editorCanvas"></canvas>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.overlay);
    
    this.canvas = document.getElementById('editorCanvas');
    this.ctx = this.canvas.getContext('2d');
  }

  bindEvents() {
    // Tool selection
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTool = btn.dataset.tool;
      });
    });

    // Canvas events
    this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    this.canvas.addEventListener('mousemove', this.draw.bind(this));
    this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
    this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));

    // Tool options
    document.getElementById('toolColor').addEventListener('change', (e) => {
      this.tools[this.currentTool].color = e.target.value;
    });

    document.getElementById('toolSize').addEventListener('input', (e) => {
      this.tools[this.currentTool].size = parseInt(e.target.value);
      document.getElementById('sizeValue').textContent = e.target.value;
    });

    // Action buttons
    document.getElementById('saveImage').addEventListener('click', this.saveImage.bind(this));
    document.getElementById('closeEditor').addEventListener('click', this.closeEditor.bind(this));
    document.getElementById('undoBtn').addEventListener('click', this.undo.bind(this));
    document.getElementById('redoBtn').addEventListener('click', this.redo.bind(this));
  }

  openImage(imageData) {
    this.overlay.style.display = 'flex';
    
    const img = new Image();
    img.onload = () => {
      this.originalImage = img;
      this.canvas.width = img.width;
      this.canvas.height = img.height;
      this.ctx.drawImage(img, 0, 0);
      this.saveState();
    };
    
    if (typeof imageData === 'string') {
      img.src = imageData;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(imageData);
    }
  }

  startDrawing(e) {
    this.isDrawing = true;
    const rect = this.canvas.getBoundingClientRect();
    this.lastX = e.clientX - rect.left;
    this.lastY = e.clientY - rect.top;
    
    if (this.currentTool === 'text') {
      this.addText(this.lastX, this.lastY);
    }
  }

  draw(e) {
    if (!this.isDrawing) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    
    switch (this.currentTool) {
      case 'pen':
        this.drawLine(this.lastX, this.lastY, currentX, currentY);
        break;
      case 'highlighter':
        this.drawHighlight(this.lastX, this.lastY, currentX, currentY);
        break;
      case 'blur':
        this.applyBlur(currentX, currentY);
        break;
    }
    
    this.lastX = currentX;
    this.lastY = currentY;
  }

  stopDrawing() {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.saveState();
    }
  }

  drawLine(x1, y1, x2, y2) {
    const tool = this.tools.pen;
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.strokeStyle = tool.color;
    this.ctx.lineWidth = tool.size;
    this.ctx.globalAlpha = 1;
    
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  drawHighlight(x1, y1, x2, y2) {
    const tool = this.tools.highlighter;
    this.ctx.globalCompositeOperation = 'multiply';
    this.ctx.strokeStyle = tool.color;
    this.ctx.lineWidth = tool.size;
    this.ctx.globalAlpha = tool.opacity;
    
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
    
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.globalAlpha = 1;
  }

  applyBlur(x, y) {
    const tool = this.tools.blur;
    const imageData = this.ctx.getImageData(x - tool.radius, y - tool.radius, tool.radius * 2, tool.radius * 2);
    
    // Simple blur effect (you can implement more sophisticated algorithms)
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = data[i + 1] = data[i + 2] = avg;
    }
    
    this.ctx.putImageData(imageData, x - tool.radius, y - tool.radius);
  }

  addText(x, y) {
    const text = prompt('Enter text:');
    if (text) {
      const tool = this.tools.text;
      this.ctx.font = `${tool.size}px ${tool.font}`;
      this.ctx.fillStyle = tool.color;
      this.ctx.fillText(text, x, y);
      this.saveState();
    }
  }

  saveState() {
    this.historyStep++;
    if (this.historyStep < this.history.length) {
      this.history.length = this.historyStep;
    }
    this.history.push(this.canvas.toDataURL());
  }

  undo() {
    if (this.historyStep > 0) {
      this.historyStep--;
      this.restoreState();
    }
  }

  redo() {
    if (this.historyStep < this.history.length - 1) {
      this.historyStep++;
      this.restoreState();
    }
  }

  restoreState() {
    const img = new Image();
    img.onload = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(img, 0, 0);
    };
    img.src = this.history[this.historyStep];
  }

  saveImage() {
    const dataURL = this.canvas.toDataURL('image/png');
    const filename = `edited-image-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
    
    chrome.downloads.download({
      url: dataURL,
      filename: filename,
      saveAs: true
    });
  }

  closeEditor() {
    this.overlay.style.display = 'none';
    document.body.removeChild(this.overlay);
  }
}

// Global instance
window.imageEditor = new ImageEditor();
