import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  fileType?: 'image/jpeg' | 'image/png' | 'image/webp';
  initialQuality?: number;
}

const defaultCompressionOptions: CompressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  fileType: 'image/jpeg',
  initialQuality: 0.8
};

export async function compressImage(
  file: File | Blob,
  options: Partial<CompressionOptions> = {}
): Promise<File> {
  const compressionOptions = { ...defaultCompressionOptions, ...options };
  return await imageCompression(file, compressionOptions);
}

export async function compressVideo(blob: Blob): Promise<Blob> {
  // Create a video element to get the duration
  const video = document.createElement('video');
  video.src = URL.createObjectURL(blob);
  
  await new Promise((resolve) => {
    video.onloadedmetadata = resolve;
  });
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const duration = video.duration;
  const fps = 30;
  
  // Set canvas size to 720p
  canvas.width = 1280;
  canvas.height = 720;
  
  // Create a MediaRecorder with lower bitrate
  const stream = canvas.captureStream(fps);
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'video/webm;codecs=vp8,opus',
    videoBitsPerSecond: 2500000 // 2.5 Mbps
  });
  
  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
  
  mediaRecorder.start(1000);
  
  // Process the video frames
  let currentTime = 0;
  const timeSlice = 1000 / fps;
  
  while (currentTime < duration) {
    video.currentTime = currentTime;
    await new Promise(resolve => setTimeout(resolve, timeSlice));
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    currentTime += timeSlice / 1000;
  }
  
  mediaRecorder.stop();
  
  return new Promise((resolve) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(blob);
    };
  });
}

export function saveToFileSystem(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function dataURLtoFile(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
}

export async function processAndSaveImage(
  dataUrl: string,
  options: Partial<CompressionOptions> = {}
): Promise<void> {
  try {
    const file = await dataURLtoFile(dataUrl, 'screenshot.png');
    const compressedFile = await compressImage(file, options);
    saveToFileSystem(compressedFile, `screenshot-${Date.now()}.${options.fileType?.split('/')[1] || 'jpg'}`);
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}

export async function processAndSaveVideo(blob: Blob): Promise<void> {
  try {
    const compressedBlob = await compressVideo(blob);
    saveToFileSystem(compressedBlob, `recording-${Date.now()}.webm`);
  } catch (error) {
    console.error('Error processing video:', error);
    throw error;
  }
}