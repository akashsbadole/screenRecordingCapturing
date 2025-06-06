"use client";

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Download, X, BoxSelect as Select, Crop, Settings } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select as SelectUI } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useToast } from '@/hooks/use-toast';
import { processAndSaveImage, CompressionOptions } from '@/lib/storage';

const fileTypeOptions = [
  { value: 'image/jpeg', label: 'JPEG' },
  { value: 'image/png', label: 'PNG' },
  { value: 'image/webp', label: 'WebP' }
] as const;

export function ScreenshotTool() {
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [delay, setDelay] = useState(3);
  const [captureMode, setCaptureMode] = useState('fullpage');
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [compressionOptions, setCompressionOptions] = useState<CompressionOptions>({
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    fileType: 'image/jpeg',
    initialQuality: 0.8
  });
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const captureScreen = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        preferCurrentTab: true,
        video: {
          displaySurface: "monitor",
          frameRate: 60,
        }
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          video.play();
          resolve();
        };
      });

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Failed to get canvas context');

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL(compressionOptions.fileType);

      stream.getTracks().forEach(track => track.stop());
      video.remove();
      canvas.remove();

      setScreenshotData(imageData);
      
      toast({
        title: "Screenshot captured",
        description: "Your screenshot is ready to save",
      });
    } catch (error) {
      console.error('Screenshot error:', error);
      toast({
        title: "Capture failed",
        description: error instanceof Error ? error.message : "Failed to capture screenshot",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
      setCountdown(0);
    }
  }, [compressionOptions.fileType, toast]);

  const handleCapture = useCallback(async () => {
    if (isCapturing) return;
    
    setIsCapturing(true);
    
    if (delay > 0) {
      let currentCountdown = delay;
      setCountdown(currentCountdown);
      
      const countdownInterval = setInterval(() => {
        currentCountdown -= 1;
        setCountdown(currentCountdown);
        
        if (currentCountdown <= 0) {
          clearInterval(countdownInterval);
          captureScreen();
        }
      }, 1000);
    } else {
      captureScreen();
    }
  }, [delay, isCapturing, captureScreen]);

  const handleSave = useCallback(async () => {
    if (!screenshotData) return;
    
    try {
      await processAndSaveImage(screenshotData, compressionOptions);
      toast({
        title: "Save successful",
        description: "Screenshot saved to your downloads",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save screenshot",
        variant: "destructive",
      });
    }
  }, [screenshotData, compressionOptions, toast]);

  const clearScreenshot = useCallback(() => {
    if (screenshotData) {
      URL.revokeObjectURL(screenshotData);
    }
    setScreenshotData(null);
  }, [screenshotData]);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h3 className="text-xl font-semibold mb-4">Screenshot Options</h3>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Capture Mode</Label>
            <ToggleGroup type="single" value={captureMode} onValueChange={(value) => value && setCaptureMode(value)}>
              <ToggleGroupItem value="fullpage" aria-label="Toggle full page">
                <Select className="h-4 w-4 mr-2" />
                Full Screen
              </ToggleGroupItem>
              <ToggleGroupItem value="selection" aria-label="Toggle selection" disabled>
                <Crop className="h-4 w-4 mr-2" />
                Selection (Coming Soon)
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          <div className="space-y-4">
            <Label>Image Settings</Label>
            <div className="space-y-2">
              <Label className="text-sm">File Type</Label>
              <SelectUI
                value={compressionOptions.fileType}
                onValueChange={(value) => setCompressionOptions(prev => ({ ...prev, fileType: value as any }))}
              >
                {fileTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectUI>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm">Quality</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(compressionOptions.initialQuality! * 100)}%
                </span>
              </div>
              <Slider
                value={[compressionOptions.initialQuality! * 100]}
                onValueChange={(value) => setCompressionOptions(prev => ({ ...prev, initialQuality: value[0] / 100 }))}
                min={10}
                max={100}
                step={1}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm">Max Size (MB)</Label>
                <span className="text-sm text-muted-foreground">{compressionOptions.maxSizeMB} MB</span>
              </div>
              <Slider
                value={[compressionOptions.maxSizeMB]}
                onValueChange={(value) => setCompressionOptions(prev => ({ ...prev, maxSizeMB: value[0] }))}
                min={0.1}
                max={10}
                step={0.1}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Capture Delay (seconds)</Label>
              <span className="text-sm text-muted-foreground">{delay}s</span>
            </div>
            <Slider
              value={[delay]}
              onValueChange={(value) => setDelay(value[0])}
              min={0}
              max={10}
              step={1}
              disabled={isCapturing}
            />
          </div>
          
          <Button 
            onClick={handleCapture} 
            className="w-full mt-4"
            disabled={isCapturing}
          >
            {isCapturing ? (
              <span>Capturing in {countdown}...</span>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Take Screenshot
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Preview</h3>
        
        <div ref={previewRef}>
          {screenshotData ? (
            <div className="relative">
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute top-2 right-2 z-10 bg-background/80"
                onClick={clearScreenshot}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute top-2 right-12 z-10 bg-background/80"
                onClick={handleSave}
              >
                <Download className="h-4 w-4" />
              </Button>
              <img 
                src={screenshotData} 
                alt="Captured screenshot" 
                className="w-full h-auto rounded-lg border"
              />
            </div>
          ) : (
            <Card className="border border-dashed">
              <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px]">
                <div className="text-center space-y-4">
                  <div className="bg-primary/10 text-primary p-3 rounded-full inline-flex">
                    <Camera className="h-6 w-6" />
                  </div>
                  <h4 className="font-semibold">Screen Capture</h4>
                  <p className="text-sm text-muted-foreground">
                    Click "Take Screenshot" to capture your screen. Use the delay option to prepare your screen before capture.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}