class EffectsProcessor {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.effects = {
      watermark: {
        enabled: false,
        text: 'Screen Recorder Pro',
        position: 'bottom-right',
        opacity: 0.7,
        fontSize: 16,
        color: '#ffffff',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      },
      cursorHighlight: {
        enabled: false,
        color: '#ff0000',
        size: 20,
        animation: 'pulse'
      },
      voiceover: {
        enabled: false,
        volume: 1.0,
        noiseReduction: true
      },
      blur: {
        radius: 10,
        quality: 'high'
      },
      pixelate: {
        size: 10
      }
    };
    
    this.init();
  }

  init() {
    this.createCanvas();
    this.loadSettings();
  }

  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['effectsSettings']);
      if (result.effectsSettings) {
        this.effects = { ...this.effects, ...result.effectsSettings };
      }
    } catch (error) {
      console.error('Error loading effects settings:', error);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set({ effectsSettings: this.effects });
    } catch (error) {
      console.error('Error saving effects settings:', error);
    }
  }

  // Watermark functionality
  addWatermark(imageData, options = {}) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        
        // Draw original image
        this.ctx.drawImage(img, 0, 0);
        
        // Apply watermark
        this.drawWatermark(options);
        
        resolve(this.canvas.toDataURL());
      };
      img.src = imageData;
    });
  }

  drawWatermark(options = {}) {
    const settings = { ...this.effects.watermark, ...options };
    
    if (!settings.enabled || !settings.text) return;

    this.ctx.save();
    
    // Set font and measure text
    this.ctx.font = `${settings.fontSize}px Arial`;
    const textMetrics = this.ctx.measureText(settings.text);
    const textWidth = textMetrics.width;
    const textHeight = settings.fontSize;
    
    // Calculate position
    const padding = 20;
    let x, y;
    
    switch (settings.position) {
      case 'top-left':
        x = padding;
        y = padding + textHeight;
        break;
      case 'top-right':
        x = this.canvas.width - textWidth - padding;
        y = padding + textHeight;
        break;
      case 'bottom-left':
        x = padding;
        y = this.canvas.height - padding;
        break;
      case 'bottom-right':
      default:
        x = this.canvas.width - textWidth - padding;
        y = this.canvas.height - padding;
        break;
      case 'center':
        x = (this.canvas.width - textWidth) / 2;
        y = (this.canvas.height + textHeight) / 2;
        break;
    }
    
    // Draw background
    if (settings.backgroundColor) {
      this.ctx.fillStyle = settings.backgroundColor;
      this.ctx.fillRect(x - 10, y - textHeight - 5, textWidth + 20, textHeight + 10);
    }
    
    // Draw text
    this.ctx.globalAlpha = settings.opacity;
    this.ctx.fillStyle = settings.color;
    this.ctx.fillText(settings.text, x, y);
    
    this.ctx.restore();
  }

  // Cursor highlighting
  addCursorHighlight(x, y, options = {}) {
    const settings = { ...this.effects.cursorHighlight, ...options };
    
    if (!settings.enabled) return;

    this.ctx.save();
    
    // Create highlight effect
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, settings.size);
    gradient.addColorStop(0, settings.color + '80'); // Semi-transparent center
    gradient.addColorStop(0.7, settings.color + '40');
    gradient.addColorStop(1, settings.color + '00'); // Transparent edge
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, settings.size, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Add click animation if specified
    if (settings.animation === 'pulse') {
      this.animateCursorPulse(x, y, settings);
    }
    
    this.ctx.restore();
  }

  animateCursorPulse(x, y, settings) {
    let scale = 1;
    const animate = () => {
      this.ctx.save();
      this.ctx.globalAlpha = 1 - scale;
      this.ctx.strokeStyle = settings.color;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(x, y, settings.size * scale, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
      
      scale += 0.1;
      if (scale < 2) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }

  // Blur effect
  applyBlur(imageData, area, options = {}) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0);
        
        // Apply blur to specific area
        const imageDataObj = this.ctx.getImageData(area.x, area.y, area.width, area.height);
        const blurredData = this.gaussianBlur(imageDataObj, options.radius || this.effects.blur.radius);
        this.ctx.putImageData(blurredData, area.x, area.y);
        
        resolve(this.canvas.toDataURL());
      };
      img.src = imageData;
    });
  }

  gaussianBlur(imageData, radius) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // Simple box blur approximation of Gaussian blur
    for (let i = 0; i < radius; i++) {
      this.boxBlur(data, width, height, (radius - i - 1) / radius);
    }
    
    return imageData;
  }

  boxBlur(data, width, height, alpha) {
    const newData = new Uint8ClampedArray(data);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        // Average surrounding pixels
        let r = 0, g = 0, b = 0, a = 0;
        let count = 0;
        
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nIdx = ((y + dy) * width + (x + dx)) * 4;
            r += data[nIdx];
            g += data[nIdx + 1];
            b += data[nIdx + 2];
            a += data[nIdx + 3];
            count++;
          }
        }
        
        newData[idx] = r / count;
        newData[idx + 1] = g / count;
        newData[idx + 2] = b / count;
        newData[idx + 3] = a / count;
      }
    }
    
    // Blend with original
    for (let i = 0; i < data.length; i++) {
      data[i] = data[i] * (1 - alpha) + newData[i] * alpha;
    }
  }

  // Pixelate effect
  applyPixelate(imageData, area, options = {}) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0);
        
        const pixelSize = options.size || this.effects.pixelate.size;
        
        // Get image data for the area
        const imageDataObj = this.ctx.getImageData(area.x, area.y, area.width, area.height);
        const data = imageDataObj.data;
        
        // Apply pixelation
        for (let y = 0; y < area.height; y += pixelSize) {
          for (let x = 0; x < area.width; x += pixelSize) {
            // Get average color of pixel block
            let r = 0, g = 0, b = 0, a = 0, count = 0;
            
            for (let dy = 0; dy < pixelSize && y + dy < area.height; dy++) {
              for (let dx = 0; dx < pixelSize && x + dx < area.width; dx++) {
                const idx = ((y + dy) * area.width + (x + dx)) * 4;
                r += data[idx];
                g += data[idx + 1];
                b += data[idx + 2];
                a += data[idx + 3];
                count++;
              }
            }
            
            r = Math.floor(r / count);
            g = Math.floor(g / count);
            b = Math.floor(b / count);
            a = Math.floor(a / count);
            
            // Apply average color to entire block
            for (let dy = 0; dy < pixelSize && y + dy < area.height; dy++) {
              for (let dx = 0; dx < pixelSize && x + dx < area.width; dx++) {
                const idx = ((y + dy) * area.width + (x + dx)) * 4;
                data[idx] = r;
                data[idx + 1] = g;
                data[idx + 2] = b;
                data[idx + 3] = a;
              }
            }
          }
        }
        
        this.ctx.putImageData(imageDataObj, area.x, area.y);
        resolve(this.canvas.toDataURL());
      };
      img.src = imageData;
    });
  }

  // Update effect settings
  updateWatermarkSettings(settings) {
    this.effects.watermark = { ...this.effects.watermark, ...settings };
    this.saveSettings();
  }

  updateCursorSettings(settings) {
    this.effects.cursorHighlight = { ...this.effects.cursorHighlight, ...settings };
    this.saveSettings();
  }

  updateVoiceoverSettings(settings) {
    this.effects.voiceover = { ...this.effects.voiceover, ...settings };
    this.saveSettings();
  }
}

// Global instance
window.effectsProcessor = new EffectsProcessor();
