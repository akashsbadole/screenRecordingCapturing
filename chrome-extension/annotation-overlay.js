class AnnotationOverlay {
  constructor() {
    this.isActive = false;
    this.currentTool = "pen";
    this.currentColor = "#ff0000";
    this.currentSize = 3;
    this.currentOpacity = 1;
    this.isDrawing = false;
    this.annotations = [];
    this.undoStack = [];
    this.redoStack = [];
    this.stamps = [];
    this.shapes = [];

    this.overlay = null;
    this.canvas = null;
    this.ctx = null;
    this.toolbar = null;
    this.stampLibrary = null;

    // Advanced tools
    this.tools = {
      pen: { cursor: "crosshair", icon: "✏️" },
      highlighter: { cursor: "crosshair", icon: "🖍️" },
      text: { cursor: "text", icon: "📝" },
      rectangle: { cursor: "crosshair", icon: "⬜" },
      circle: { cursor: "crosshair", icon: "⭕" },
      arrow: { cursor: "crosshair", icon: "➡️" },
      line: { cursor: "crosshair", icon: "📏" },
      blur: { cursor: "crosshair", icon: "🌫️" },
      pixelate: { cursor: "crosshair", icon: "🔲" },
      stamp: { cursor: "pointer", icon: "🏷️" },
      eraser: { cursor: "grab", icon: "🧽" },
    };

    this.init();
  }

  init() {
    this.createOverlay();
    this.createToolbar();
    this.bindEvents();
  }

  createOverlay() {
    // Create main overlay
    this.overlay = document.createElement("div");
    this.overlay.id = "annotation-overlay";
    this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 999998;
            pointer-events: none;
            display: none;
        `;

    // Create canvas for annotations
    this.canvas = document.createElement("canvas");
    this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: auto;
            cursor: crosshair;
        `;

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext("2d");

    this.overlay.appendChild(this.canvas);
    document.body.appendChild(this.overlay);
  }

  createToolbar() {
    this.toolbar = document.createElement("div");
    this.toolbar.id = "annotation-toolbar";
    this.toolbar.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            z-index: 999999;
            display: none;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

    this.toolbar.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <!-- Drawing Tools -->
                <div style="display: flex; gap: 4px; background: #f1f5f9; border-radius: 8px; padding: 4px;">
                    <button data-tool="pen" class="tool-btn active" title="Pen">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        </svg>
                    </button>
                    <button data-tool="highlighter" class="tool-btn" title="Highlighter">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m9 11-6 6v3h3l6-6"/>
                            <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>
                        </svg>
                    </button>
                    <button data-tool="rectangle" class="tool-btn" title="Rectangle">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect width="18" height="18" x="3" y="3" rx="2"/>
                        </svg>
                    </button>
                    <button data-tool="circle" class="tool-btn" title="Circle">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                        </svg>
                    </button>
                    <button data-tool="arrow" class="tool-btn" title="Arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14m-7-7 7 7-7 7"/>
                        </svg>
                    </button>
                    <button data-tool="text" class="tool-btn" title="Text">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="4,7 4,4 20,4 20,7"/>
                            <line x1="9" y1="20" x2="15" y2="20"/>
                            <line x1="12" y1="4" x2="12" y2="20"/>
                        </svg>
                    </button>
                    <button data-tool="eraser" class="tool-btn" title="Eraser">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.5l9.6-9.6c1-1 2.5-1 3.5 0l5.2 5.2c1 1 1 2.5 0 3.5L13 21"/>
                            <path d="M22 21H7"/>
                        </svg>
                    </button>
                </div>

                <div style="width: 1px; height: 24px; background: #e2e8f0;"></div>

                <!-- Color Picker -->
                <div style="position: relative;">
                    <button id="color-picker" style="width: 32px; height: 24px; border-radius: 4px; border: 2px solid #e2e8f0; background: #ff0000; cursor: pointer;"></button>
                    <div id="color-palette" style="display: none; position: absolute; top: 30px; left: 0; background: white; border-radius: 8px; padding: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 1000000;">
                        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; margin-bottom: 8px;">
                            ${[
                              "#ff0000",
                              "#00ff00",
                              "#0000ff",
                              "#ffff00",
                              "#ff00ff",
                              "#00ffff",
                              "#000000",
                              "#ffffff",
                              "#808080",
                              "#800000",
                              "#008000",
                              "#000080",
                            ]
                              .map(
                                (color) =>
                                  `<button style="width: 20px; height: 20px; background: ${color}; border: 1px solid #ccc; border-radius: 2px; cursor: pointer;" data-color="${color}"></button>`
                              )
                              .join("")}
                        </div>
                        <input type="color" id="custom-color" value="#ff0000" style="width: 100%; height: 24px; border: none; border-radius: 4px; cursor: pointer;">
                    </div>
                </div>

                <!-- Size Control -->
                <div style="display: flex; align-items: center; gap: 4px;">
                    <span style="font-size: 12px; color: #64748b;">Size:</span>
                    <input type="range" id="size-slider" min="1" max="20" value="3" style="width: 60px;">
                    <span id="size-value" style="font-size: 12px; width: 16px; text-align: center;">3</span>
                </div>

                <div style="width: 1px; height: 24px; background: #e2e8f0;"></div>

                <!-- Action Buttons -->
                <div style="display: flex; gap: 4px;">
                    <button id="undo-btn" class="action-btn" title="Undo" disabled>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 7v6h6"/>
                            <path d="m21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
                        </svg>
                    </button>
                    <button id="redo-btn" class="action-btn" title="Redo" disabled>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 7v6h-6"/>
                            <path d="m3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>
                        </svg>
                    </button>
                    <button id="clear-btn" class="action-btn" title="Clear All">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                    </button>
                </div>

                <div style="width: 1px; height: 24px; background: #e2e8f0;"></div>

                <!-- Close Button -->
                <button id="close-annotations" class="action-btn" title="Close Annotations" style="background: #ef4444; color: white;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6 6 18"/>
                        <path d="m6 6 12 12"/>
                    </svg>
                </button>
            </div>
        `;

    // Add styles
    const style = document.createElement("style");
    style.textContent = `
            .tool-btn, .action-btn {
                width: 32px;
                height: 24px;
                border: none;
                border-radius: 4px;
                background: transparent;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }
            .tool-btn:hover, .action-btn:hover {
                background: #e2e8f0;
            }
            .tool-btn.active {
                background: #3b82f6;
                color: white;
            }
            .action-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `;
    document.head.appendChild(style);
    document.body.appendChild(this.toolbar);
  }

  bindEvents() {
    // Tool selection
    this.toolbar.addEventListener("click", (e) => {
      const toolBtn = e.target.closest("[data-tool]");
      if (toolBtn) {
        this.setTool(toolBtn.dataset.tool);
        this.updateToolButtons();
      }
    });

    // Color picker
    const colorPicker = this.toolbar.querySelector("#color-picker");
    const colorPalette = this.toolbar.querySelector("#color-palette");

    colorPicker.addEventListener("click", () => {
      colorPalette.style.display =
        colorPalette.style.display === "none" ? "block" : "none";
    });

    colorPalette.addEventListener("click", (e) => {
      const colorBtn = e.target.closest("[data-color]");
      if (colorBtn) {
        this.setColor(colorBtn.dataset.color);
        colorPalette.style.display = "none";
      }
    });

    const customColor = this.toolbar.querySelector("#custom-color");
    customColor.addEventListener("change", (e) => {
      this.setColor(e.target.value);
      colorPalette.style.display = "none";
    });

    // Size control
    const sizeSlider = this.toolbar.querySelector("#size-slider");
    const sizeValue = this.toolbar.querySelector("#size-value");

    sizeSlider.addEventListener("input", (e) => {
      this.currentSize = parseInt(e.target.value);
      sizeValue.textContent = this.currentSize;
    });

    // Action buttons
    this.toolbar
      .querySelector("#undo-btn")
      .addEventListener("click", () => this.undo());
    this.toolbar
      .querySelector("#redo-btn")
      .addEventListener("click", () => this.redo());
    this.toolbar
      .querySelector("#clear-btn")
      .addEventListener("click", () => this.clear());
    this.toolbar
      .querySelector("#close-annotations")
      .addEventListener("click", () => this.hide());

    // Canvas drawing events
    this.canvas.addEventListener("mousedown", (e) => this.startDrawing(e));
    this.canvas.addEventListener("mousemove", (e) => this.draw(e));
    this.canvas.addEventListener("mouseup", () => this.stopDrawing());
    this.canvas.addEventListener("mouseout", () => this.stopDrawing());

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (!this.isActive) return;

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "z":
            e.preventDefault();
            if (e.shiftKey) {
              this.redo();
            } else {
              this.undo();
            }
            break;
          case "y":
            e.preventDefault();
            this.redo();
            break;
        }
      }

      if (e.key === "Escape") {
        this.hide();
      }
    });

    // Close color palette when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !e.target.closest("#color-picker") &&
        !e.target.closest("#color-palette")
      ) {
        const colorPalette = this.toolbar.querySelector("#color-palette");
        if (colorPalette) {
          colorPalette.style.display = "none";
        }
      }
    });
  }

  show() {
    this.isActive = true;
    this.overlay.style.display = "block";
    this.toolbar.style.display = "block";

    // Resize canvas to current window size
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    // Redraw existing annotations
    this.redrawAnnotations();
  }

  hide() {
    this.isActive = false;
    this.overlay.style.display = "none";
    this.toolbar.style.display = "none";

    // Notify that annotations are closed
    window.postMessage({ type: "ANNOTATIONS_CLOSED" }, "*");
  }

  setTool(tool) {
    this.currentTool = tool;
    this.canvas.style.cursor = tool === "eraser" ? "grab" : "crosshair";
  }

  setColor(color) {
    this.currentColor = color;
    const colorPicker = this.toolbar.querySelector("#color-picker");
    colorPicker.style.background = color;
  }

  updateToolButtons() {
    const toolBtns = this.toolbar.querySelectorAll("[data-tool]");
    toolBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tool === this.currentTool);
    });
  }

  startDrawing(e) {
    this.isDrawing = true;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.currentPath = {
      tool: this.currentTool,
      color: this.currentColor,
      size: this.currentSize,
      opacity: this.currentOpacity,
      points: [{ x, y }],
    };

    if (this.currentTool === "text") {
      this.addText(x, y);
    }
  }

  draw(e) {
    if (!this.isDrawing || this.currentTool === "text") return;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.currentPath.points.push({ x, y });
    this.drawPath(this.currentPath);
  }

  stopDrawing() {
    if (!this.isDrawing) return;

    this.isDrawing = false;
    if (this.currentPath && this.currentPath.points.length > 0) {
      this.annotations.push(this.currentPath);
      this.undoStack.push([...this.annotations]);
      this.redoStack = [];
      this.updateActionButtons();
    }
  }

  drawPath(path) {
    this.ctx.save();
    this.ctx.globalAlpha = path.opacity;
    this.ctx.strokeStyle = path.color;
    this.ctx.lineWidth = path.size;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    if (path.tool === "highlighter") {
      this.ctx.globalCompositeOperation = "multiply";
      this.ctx.globalAlpha = 0.3;
    } else if (path.tool === "eraser") {
      this.ctx.globalCompositeOperation = "destination-out";
    }

    this.ctx.beginPath();
    if (path.points.length > 1) {
      this.ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        this.ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  addText(x, y) {
    const text = prompt("Enter text:");
    if (text) {
      this.ctx.save();
      this.ctx.font = `${this.currentSize * 4}px Arial`;
      this.ctx.fillStyle = this.currentColor;
      this.ctx.fillText(text, x, y);
      this.ctx.restore();

      this.annotations.push({
        tool: "text",
        color: this.currentColor,
        size: this.currentSize,
        text: text,
        x: x,
        y: y,
      });

      this.undoStack.push([...this.annotations]);
      this.redoStack = [];
      this.updateActionButtons();
    }
    this.isDrawing = false;
  }

  redrawAnnotations() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.annotations.forEach((annotation) => {
      if (annotation.tool === "text") {
        this.ctx.save();
        this.ctx.font = `${annotation.size * 4}px Arial`;
        this.ctx.fillStyle = annotation.color;
        this.ctx.fillText(annotation.text, annotation.x, annotation.y);
        this.ctx.restore();
      } else {
        this.drawPath(annotation);
      }
    });
  }

  undo() {
    if (this.undoStack.length > 1) {
      this.redoStack.push(this.undoStack.pop());
      this.annotations = [...this.undoStack[this.undoStack.length - 1]];
      this.redrawAnnotations();
      this.updateActionButtons();
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      const state = this.redoStack.pop();
      this.undoStack.push(state);
      this.annotations = [...state];
      this.redrawAnnotations();
      this.updateActionButtons();
    }
  }

  clear() {
    if (confirm("Clear all annotations?")) {
      this.annotations = [];
      this.undoStack = [[]];
      this.redoStack = [];
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.updateActionButtons();
    }
  }

  updateActionButtons() {
    const undoBtn = this.toolbar.querySelector("#undo-btn");
    const redoBtn = this.toolbar.querySelector("#redo-btn");

    undoBtn.disabled = this.undoStack.length <= 1;
    redoBtn.disabled = this.redoStack.length === 0;
  }

  // Export annotations as image data
  exportAnnotations() {
    return this.canvas.toDataURL("image/png");
  }

  // Import annotations from image data
  importAnnotations(imageData) {
    const img = new Image();
    img.onload = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(img, 0, 0);
    };
    img.src = imageData;
  }
}

// Initialize annotation overlay
let annotationOverlay = null;

// Listen for messages from popup
window.addEventListener("message", (event) => {
  if (event.data.type === "TOGGLE_ANNOTATIONS") {
    if (!annotationOverlay) {
      annotationOverlay = new AnnotationOverlay();
    }

    if (annotationOverlay.isActive) {
      annotationOverlay.hide();
    } else {
      annotationOverlay.show();
    }
  }
});

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = AnnotationOverlay;
}
