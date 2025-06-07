class GIFCreator {
  constructor() {
    this.frames = [];
    this.canvas = null;
    this.ctx = null;
    this.isRecording = false;
    this.frameRate = 10; // frames per second
    this.quality = 10; // 1-20, lower is better quality
    this.width = 800;
    this.height = 600;
    
    this.init();
  }

  init() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  // Start recording frames for GIF
  async startGIFRecording(options = {}) {
    const {
      frameRate = 10,
      quality = 10,
      maxDuration = 30, // seconds
      captureArea = null
    } = options;

    this.frameRate = frameRate;
    this.quality = quality;
    this.frames = [];
    this.isRecording = true;

    try {
      // Get screen capture stream
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen',
          width: { ideal: this.width },
          height: { ideal: this.height },
          frameRate: { ideal: frameRate }
        }
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Set up canvas for frame capture
      video.addEventListener('loadedmetadata', () => {
        this.canvas.width = video.videoWidth;
        this.canvas.height = video.videoHeight;
        this.width = video.videoWidth;
        this.height = video.videoHeight;
      });

      // Capture frames at specified interval
      const frameInterval = 1000 / frameRate;
      const maxFrames = maxDuration * frameRate;
      let frameCount = 0;

      const captureFrame = () => {
        if (!this.isRecording || frameCount >= maxFrames) {
          this.stopGIFRecording(stream);
          return;
        }

        // Draw video frame to canvas
        this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);
        
        // Capture frame data
        const frameData = this.canvas.toDataURL('image/png');
        this.frames.push({
          data: frameData,
          timestamp: Date.now(),
          delay: frameInterval
        });

        frameCount++;
        
        if (this.isRecording) {
          setTimeout(captureFrame, frameInterval);
        }
      };

      // Start capturing after video is ready
      video.addEventListener('playing', () => {
        setTimeout(captureFrame, frameInterval);
      });

      return {
        success: true,
        message: 'GIF recording started',
        expectedFrames: maxFrames
      };

    } catch (error) {
      console.error('Error starting GIF recording:', error);
      this.isRecording = false;
      throw error;
    }
  }

  // Stop recording and create GIF
  stopGIFRecording(stream) {
    this.isRecording = false;
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    return {
      success: true,
      frameCount: this.frames.length,
      message: 'GIF recording stopped'
    };
  }

  // Create GIF from captured frames
  async createGIF(options = {}) {
    const {
      filename = 'screen-recording',
      loop = true,
      optimize = true
    } = options;

    if (this.frames.length === 0) {
      throw new Error('No frames captured for GIF creation');
    }

    try {
      // This is a simplified GIF creation process
      // In a real implementation, you'd use a library like gif.js
      const gifData = await this.encodeGIF({
        frames: this.frames,
        width: this.width,
        height: this.height,
        quality: this.quality,
        loop: loop,
        optimize: optimize
      });

      // Download the GIF
      const blob = new Blob([gifData], { type: 'image/gif' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.gif`;
      link.click();
      
      URL.revokeObjectURL(url);

      return {
        success: true,
        filename: link.download,
        frameCount: this.frames.length,
        duration: this.frames.length / this.frameRate,
        size: blob.size
      };

    } catch (error) {
      console.error('Error creating GIF:', error);
      throw error;
    }
  }

  // Simplified GIF encoding (in real implementation, use gif.js or similar)
  async encodeGIF(options) {
    const { frames, width, height, quality, loop } = options;
    
    // This is a placeholder for actual GIF encoding
    // In a real implementation, you would:
    // 1. Use a GIF encoding library like gif.js
    // 2. Process each frame through the encoder
    // 3. Apply color quantization and optimization
    // 4. Return the encoded GIF binary data

    // For now, we'll create a simple animated data URL
    // This is not a real GIF, just a demonstration
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Draw first frame as static image
    if (frames.length > 0) {
      const img = new Image();
      await new Promise((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
          resolve();
        };
        img.src = frames[0].data;
      });
    }

    // Return canvas data as placeholder
    const dataUrl = canvas.toDataURL('image/png');
    const binaryString = atob(dataUrl.split(',')[1]);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
  }

  // Create GIF from video file
  async createGIFFromVideo(videoFile, options = {}) {
    const {
      startTime = 0,
      duration = 5,
      frameRate = 10,
      quality = 10,
      width = null,
      height = null
    } = options;

    try {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(videoFile);
      
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = reject;
      });

      // Set canvas dimensions
      const canvasWidth = width || video.videoWidth;
      const canvasHeight = height || video.videoHeight;
      
      this.canvas.width = canvasWidth;
      this.canvas.height = canvasHeight;

      // Extract frames from video
      const frames = [];
      const frameInterval = 1 / frameRate;
      const totalFrames = Math.floor(duration * frameRate);

      for (let i = 0; i < totalFrames; i++) {
        const currentTime = startTime + (i * frameInterval);
        video.currentTime = currentTime;
        
        await new Promise(resolve => {
          video.onseeked = resolve;
        });

        // Draw frame to canvas
        this.ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);
        const frameData = this.canvas.toDataURL('image/png');
        
        frames.push({
          data: frameData,
          timestamp: currentTime,
          delay: frameInterval * 1000
        });
      }

      // Clean up
      URL.revokeObjectURL(video.src);

      // Create GIF from frames
      this.frames = frames;
      return this.createGIF(options);

    } catch (error) {
      console.error('Error creating GIF from video:', error);
      throw error;
    }
  }

  // Create GIF from image sequence
  async createGIFFromImages(images, options = {}) {
    const {
      frameDelay = 500, // milliseconds
      loop = true,
      optimize = true
    } = options;

    try {
      const frames = [];
      
      for (let i = 0; i < images.length; i++) {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = images[i];
        });

        // Set canvas size to first image
        if (i === 0) {
          this.canvas.width = img.width;
          this.canvas.height = img.height;
          this.width = img.width;
          this.height = img.height;
        }

        // Draw image to canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
        
        frames.push({
          data: this.canvas.toDataURL('image/png'),
          timestamp: i * frameDelay,
          delay: frameDelay
        });
      }

      this.frames = frames;
      return this.createGIF({ ...options, loop, optimize });

    } catch (error) {
      console.error('Error creating GIF from images:', error);
      throw error;
    }
  }

  // Optimize GIF by reducing colors and size
  optimizeGIF(frames, options = {}) {
    const {
      maxColors = 256,
      dithering = false,
      transparency = false
    } = options;

    // This would implement color quantization and optimization
    // For now, return frames as-is
    return frames;
  }

  // Preview GIF frames
  previewFrames(container) {
    if (!container || this.frames.length === 0) return;

    container.innerHTML = '';
    
    const preview = document.createElement('div');
    preview.className = 'gif-preview';
    preview.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 8px;
      max-height: 300px;
      overflow-y: auto;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    `;

    this.frames.forEach((frame, index) => {
      const frameElement = document.createElement('div');
      frameElement.style.cssText = `
        text-align: center;
        padding: 8px;
        background: white;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      `;
      
      frameElement.innerHTML = `
        <img src="${frame.data}" style="width: 100%; height: auto; border-radius: 4px;">
        <div style="font-size: 12px; margin-top: 4px; color: #666;">Frame ${index + 1}</div>
      `;
      
      preview.appendChild(frameElement);
    });

    container.appendChild(preview);
  }

  // Get recording status
  getStatus() {
    return {
      isRecording: this.isRecording,
      frameCount: this.frames.length,
      duration: this.frames.length / this.frameRate,
      frameRate: this.frameRate,
      quality: this.quality
    };
  }

  // Clear captured frames
  clearFrames() {
    this.frames = [];
  }
}

// Global instance
window.gifCreator = new GIFCreator();
