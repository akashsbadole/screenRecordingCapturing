"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  Zap,
  Image as ImageIcon,
  Video,
  Download,
  Settings,
  Sparkles,
  Layers,
  Target,
  MousePointer,
  Eye,
  Crop,
  RotateCcw,
  Palette,
  Wand2,
  Activity,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePerformanceMonitor } from "@/hooks/use-performance-monitor";

interface GifCreationProps {
  videoData?: string | null;
  onGifCreated?: (gifData: string) => void;
}

export function AdvancedRecordingFeatures({
  videoData,
  onGifCreated,
}: GifCreationProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [gifSettings, setGifSettings] = useState({
    fps: 10,
    quality: 80,
    scale: 1,
    startTime: 0,
    duration: 5,
    loop: true,
  });

  // Advanced features
  const [cursorEffects, setCursorEffects] = useState({
    highlight: true,
    clickAnimation: true,
    trail: false,
    customCursor: false,
  });

  const [visualEffects, setVisualEffects] = useState({
    zoom: false,
    blur: false,
    watermark: false,
    borders: false,
    shadows: true,
  });

  const [autoFeatures, setAutoFeatures] = useState({
    smartCrop: false,
    noiseReduction: false,
    colorCorrection: false,
    stabilization: false,
  });

  const { toast } = useToast();
  const {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    performanceIssues,
  } = usePerformanceMonitor();

  // GIF creation function (simplified - would need actual GIF encoding library)
  const createGif = useCallback(async () => {
    if (!videoData) {
      toast({
        title: "No video data",
        description: "Please record a video first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    startMonitoring();

    try {
      // Simulate GIF creation process
      for (let i = 0; i <= 100; i += 10) {
        setProcessingProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // In a real implementation, you would:
      // 1. Extract frames from video
      // 2. Apply effects and filters
      // 3. Encode as GIF
      // 4. Return the GIF data

      const mockGifData = "data:image/gif;base64,mock-gif-data";
      onGifCreated?.(mockGifData);

      toast({
        title: "GIF created successfully!",
        description: "Your animated GIF is ready for download",
      });
    } catch (error) {
      toast({
        title: "GIF creation failed",
        description: "There was an error creating the GIF",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
      stopMonitoring();
    }
  }, [videoData, onGifCreated, toast, startMonitoring, stopMonitoring]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="gif" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="gif">GIF Creator</TabsTrigger>
          <TabsTrigger value="effects">Visual Effects</TabsTrigger>
          <TabsTrigger value="cursor">Cursor Effects</TabsTrigger>
          <TabsTrigger value="auto">Auto Features</TabsTrigger>
        </TabsList>

        <TabsContent value="gif" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                GIF Creation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Frame Rate: {gifSettings.fps} FPS</Label>
                  <Slider
                    value={[gifSettings.fps]}
                    onValueChange={(value) =>
                      setGifSettings((prev) => ({ ...prev, fps: value[0] }))
                    }
                    max={30}
                    min={5}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Quality: {gifSettings.quality}%</Label>
                  <Slider
                    value={[gifSettings.quality]}
                    onValueChange={(value) =>
                      setGifSettings((prev) => ({ ...prev, quality: value[0] }))
                    }
                    max={100}
                    min={10}
                    step={10}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Scale: {Math.round(gifSettings.scale * 100)}%</Label>
                  <Slider
                    value={[gifSettings.scale]}
                    onValueChange={(value) =>
                      setGifSettings((prev) => ({ ...prev, scale: value[0] }))
                    }
                    max={1}
                    min={0.25}
                    step={0.25}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Duration: {gifSettings.duration}s</Label>
                  <Slider
                    value={[gifSettings.duration]}
                    onValueChange={(value) =>
                      setGifSettings((prev) => ({
                        ...prev,
                        duration: value[0],
                      }))
                    }
                    max={30}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Creating GIF...</span>
                    <span>{processingProgress}%</span>
                  </div>
                  <Progress value={processingProgress} className="w-full" />
                </div>
              )}

              <Button
                onClick={createGif}
                disabled={!videoData || isProcessing}
                className="w-full"
              >
                <Zap className="h-4 w-4 mr-2" />
                {isProcessing ? "Creating GIF..." : "Create Animated GIF"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="effects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Visual Effects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>Auto-zoom on click</Label>
                  <Switch
                    checked={visualEffects.zoom}
                    onCheckedChange={(checked) =>
                      setVisualEffects((prev) => ({ ...prev, zoom: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Background blur</Label>
                  <Switch
                    checked={visualEffects.blur}
                    onCheckedChange={(checked) =>
                      setVisualEffects((prev) => ({ ...prev, blur: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Watermark</Label>
                  <Switch
                    checked={visualEffects.watermark}
                    onCheckedChange={(checked) =>
                      setVisualEffects((prev) => ({
                        ...prev,
                        watermark: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Drop shadows</Label>
                  <Switch
                    checked={visualEffects.shadows}
                    onCheckedChange={(checked) =>
                      setVisualEffects((prev) => ({
                        ...prev,
                        shadows: checked,
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cursor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointer className="h-5 w-5" />
                Cursor Effects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>Cursor highlighting</Label>
                  <Switch
                    checked={cursorEffects.highlight}
                    onCheckedChange={(checked) =>
                      setCursorEffects((prev) => ({
                        ...prev,
                        highlight: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Click animations</Label>
                  <Switch
                    checked={cursorEffects.clickAnimation}
                    onCheckedChange={(checked) =>
                      setCursorEffects((prev) => ({
                        ...prev,
                        clickAnimation: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Cursor trail</Label>
                  <Switch
                    checked={cursorEffects.trail}
                    onCheckedChange={(checked) =>
                      setCursorEffects((prev) => ({ ...prev, trail: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Custom cursor</Label>
                  <Switch
                    checked={cursorEffects.customCursor}
                    onCheckedChange={(checked) =>
                      setCursorEffects((prev) => ({
                        ...prev,
                        customCursor: checked,
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auto" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Auto Enhancement Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>Smart crop</Label>
                  <Switch
                    checked={autoFeatures.smartCrop}
                    onCheckedChange={(checked) =>
                      setAutoFeatures((prev) => ({
                        ...prev,
                        smartCrop: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Noise reduction</Label>
                  <Switch
                    checked={autoFeatures.noiseReduction}
                    onCheckedChange={(checked) =>
                      setAutoFeatures((prev) => ({
                        ...prev,
                        noiseReduction: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Color correction</Label>
                  <Switch
                    checked={autoFeatures.colorCorrection}
                    onCheckedChange={(checked) =>
                      setAutoFeatures((prev) => ({
                        ...prev,
                        colorCorrection: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Video stabilization</Label>
                  <Switch
                    checked={autoFeatures.stabilization}
                    onCheckedChange={(checked) =>
                      setAutoFeatures((prev) => ({
                        ...prev,
                        stabilization: checked,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Performance Monitor */}
              {isMonitoring && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">
                      Processing Performance
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Memory: {metrics.memoryUsage}%</div>
                    <div>Render: {metrics.renderTime.toFixed(1)}ms</div>
                  </div>
                  {performanceIssues.length > 0 && (
                    <div className="mt-1 text-xs text-amber-600">
                      {performanceIssues.join(", ")}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
