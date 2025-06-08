"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { AnnotationToolbar } from "@/components/annotation-toolbar";
import { EnhancedAnnotationCanvas } from "@/components/enhanced-annotation-canvas";
import {
  Camera,
  Download,
  X,
  Monitor,
  Square,
  MousePointer,
  RectangleHorizontal as WindowIcon,
  Crop,
  Edit,
  Timer,
  Settings,
  Image as ImageIcon,
  Layers,
  Zap,
  Target,
  Maximize,
  Activity,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePerformanceMonitor } from "@/hooks/use-performance-monitor";

export function EnhancedScreenshotTool() {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureMode, setCaptureMode] = useState("fullscreen");
  const [saveFormat, setSaveFormat] = useState("png");
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [annotationTool, setAnnotationTool] = useState("pen");
  const [annotationColor, setAnnotationColor] = useState("#ff0000");
  const [annotationSize, setAnnotationSize] = useState(3);
  const [annotationOpacity, setAnnotationOpacity] = useState(1);
  const [delayCapture, setDelayCapture] = useState(false);
  const [captureDelay, setCaptureDelay] = useState(3);
  const [includeWatermark, setIncludeWatermark] = useState(false);
  const [quality, setQuality] = useState(100);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Enhanced features
  const [smartDetection, setSmartDetection] = useState(false);
  const [batchCapture, setBatchCapture] = useState(false);
  const [autoEnhance, setAutoEnhance] = useState(false);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  const [screenshotDimensions, setScreenshotDimensions] = useState({
    width: 0,
    height: 0,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const { toast } = useToast();

  // Performance monitoring
  const {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    performanceIssues,
    getOptimizationSuggestions,
  } = usePerformanceMonitor({
    fpsTarget: 60,
    memoryThreshold: 75,
    autoOptimize: true,
  });

  const captureModes = [
    {
      id: "fullscreen",
      icon: Monitor,
      label: "Full Screen",
      description: "Capture entire screen",
    },
    {
      id: "region",
      icon: Square,
      label: "Region",
      description: "Select custom area",
    },
    {
      id: "window",
      icon: WindowIcon,
      label: "Window",
      description: "Capture specific window",
    },
    {
      id: "element",
      icon: Target,
      label: "Element",
      description: "Smart element detection",
    },
  ];

  const saveFormats = [
    { value: "png", label: "PNG (Lossless)" },
    { value: "jpeg", label: "JPEG (Compressed)" },
    { value: "webp", label: "WebP (Modern)" },
    { value: "gif", label: "GIF (Animated)" },
  ];

  const handleCapture = useCallback(async () => {
    setIsCapturing(true);

    try {
      if (delayCapture && captureDelay > 0) {
        toast({
          title: `Capturing in ${captureDelay} seconds...`,
          description: "Get ready for the screenshot",
        });

        await new Promise((resolve) =>
          setTimeout(resolve, captureDelay * 1000)
        );
      }

      let stream: MediaStream;

      switch (captureMode) {
        case "fullscreen":
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: { displaySurface: "monitor" },
          });
          break;
        case "window":
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: { displaySurface: "window" },
          });
          break;
        case "region":
          // For region capture, we'll use a selection overlay
          await handleRegionCapture();
          return;
        case "element":
          // Smart element detection - coming soon
          toast({
            title: "Smart Element Detection",
            description: "This feature is coming soon!",
          });
          return;
        default:
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
          });
      }

      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      video.addEventListener("loadedmetadata", () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0);

          // Add watermark if enabled
          if (includeWatermark) {
            addWatermark(ctx, canvas.width, canvas.height);
          }

          const dataUrl = canvas.toDataURL(
            `image/${saveFormat}`,
            quality / 100
          );
          setScreenshot(dataUrl);

          toast({
            title: "Screenshot captured!",
            description: "Your screenshot is ready for editing and download",
          });
        }

        // Stop the stream
        stream.getTracks().forEach((track) => track.stop());
      });
    } catch (error) {
      console.error("Capture failed:", error);
      toast({
        title: "Capture failed",
        description: "Failed to capture screenshot. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
    }
  }, [
    captureMode,
    delayCapture,
    captureDelay,
    includeWatermark,
    saveFormat,
    quality,
    toast,
  ]);

  const handleRegionCapture = useCallback(async () => {
    // Create overlay for region selection
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.3);
      z-index: 9999;
      cursor: crosshair;
    `;

    const selectionBox = document.createElement("div");
    selectionBox.style.cssText = `
      position: absolute;
      border: 2px solid #4285f4;
      background: rgba(66, 133, 244, 0.1);
      display: none;
    `;

    overlay.appendChild(selectionBox);
    document.body.appendChild(overlay);

    let isSelecting = false;
    let startX = 0,
      startY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isSelecting = true;
      startX = e.clientX;
      startY = e.clientY;
      selectionBox.style.display = "block";
      selectionBox.style.left = startX + "px";
      selectionBox.style.top = startY + "px";
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isSelecting) return;

      const width = Math.abs(e.clientX - startX);
      const height = Math.abs(e.clientY - startY);
      const left = Math.min(e.clientX, startX);
      const top = Math.min(e.clientY, startY);

      selectionBox.style.left = left + "px";
      selectionBox.style.top = top + "px";
      selectionBox.style.width = width + "px";
      selectionBox.style.height = height + "px";
    };

    const handleMouseUp = async (e: MouseEvent) => {
      if (!isSelecting) return;

      const width = Math.abs(e.clientX - startX);
      const height = Math.abs(e.clientY - startY);

      if (width < 10 || height < 10) {
        toast({
          title: "Selection too small",
          description: "Please select a larger area",
          variant: "destructive",
        });
        document.body.removeChild(overlay);
        return;
      }

      // Capture the selected region
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

        const video = document.createElement("video");
        video.srcObject = stream;
        video.play();

        video.addEventListener("loadedmetadata", () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (ctx) {
            // Calculate the crop area
            const scaleX = video.videoWidth / window.innerWidth;
            const scaleY = video.videoHeight / window.innerHeight;

            const cropX = Math.min(startX, e.clientX) * scaleX;
            const cropY = Math.min(startY, e.clientY) * scaleY;
            const cropWidth = width * scaleX;
            const cropHeight = height * scaleY;

            canvas.width = cropWidth;
            canvas.height = cropHeight;

            ctx.drawImage(
              video,
              cropX,
              cropY,
              cropWidth,
              cropHeight,
              0,
              0,
              cropWidth,
              cropHeight
            );

            if (includeWatermark) {
              addWatermark(ctx, canvas.width, canvas.height);
            }

            const dataUrl = canvas.toDataURL(
              `image/${saveFormat}`,
              quality / 100
            );
            setScreenshot(dataUrl);

            toast({
              title: "Region captured!",
              description: "Your selected area has been captured",
            });
          }

          stream.getTracks().forEach((track) => track.stop());
        });
      } catch (error) {
        console.error("Region capture failed:", error);
        toast({
          title: "Capture failed",
          description: "Failed to capture selected region",
          variant: "destructive",
        });
      }

      document.body.removeChild(overlay);
    };

    overlay.addEventListener("mousedown", handleMouseDown);
    overlay.addEventListener("mousemove", handleMouseMove);
    overlay.addEventListener("mouseup", handleMouseUp);

    // ESC to cancel
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        document.body.removeChild(overlay);
        document.removeEventListener("keydown", handleKeyDown);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
  }, [includeWatermark, saveFormat, quality, toast]);

  const addWatermark = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px Arial";
    ctx.textAlign = "right";
    ctx.fillText("Screen Recorder Pro", width - 20, height - 20);
    ctx.restore();
  };

  const handleDownload = useCallback(() => {
    if (!screenshot) return;

    const link = document.createElement("a");
    link.href = screenshot;
    link.download = `screenshot-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, "-")}.${saveFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download started",
      description: "Your screenshot is being downloaded",
    });
  }, [screenshot, saveFormat, toast]);

  const clearScreenshot = useCallback(() => {
    setScreenshot(null);
    setShowAnnotations(false);
  }, []);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="capture" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="capture">Capture</TabsTrigger>
          <TabsTrigger value="edit">Edit & Annotate</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="capture" className="space-y-6">
          {/* Capture Mode Selection */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Capture Mode</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {captureModes.map((mode) => (
                  <Button
                    key={mode.id}
                    variant={captureMode === mode.id ? "default" : "outline"}
                    onClick={() => setCaptureMode(mode.id)}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <mode.icon className="h-6 w-6" />
                    <div className="text-center">
                      <div className="font-medium">{mode.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {mode.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Options */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Quick Options</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Advanced
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <Label>Delay Capture</Label>
                  <Switch
                    checked={delayCapture}
                    onCheckedChange={setDelayCapture}
                  />
                </div>

                {delayCapture && (
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    <Slider
                      value={[captureDelay]}
                      onValueChange={(value) => setCaptureDelay(value[0])}
                      max={10}
                      min={1}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm w-8">{captureDelay}s</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label>Watermark</Label>
                  <Switch
                    checked={includeWatermark}
                    onCheckedChange={setIncludeWatermark}
                  />
                </div>
              </div>

              {showAdvanced && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Save Format</Label>
                      <Select value={saveFormat} onValueChange={setSaveFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {saveFormats.map((format) => (
                            <SelectItem key={format.value} value={format.value}>
                              {format.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Quality: {quality}%</Label>
                      <Slider
                        value={[quality]}
                        onValueChange={(value) => setQuality(value[0])}
                        max={100}
                        min={10}
                        step={10}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {/* Enhanced Features */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                        <Label>Smart Detection</Label>
                      </div>
                      <Switch
                        checked={smartDetection}
                        onCheckedChange={setSmartDetection}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-blue-600" />
                        <Label>Batch Capture</Label>
                      </div>
                      <Switch
                        checked={batchCapture}
                        onCheckedChange={setBatchCapture}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wand2 className="h-4 w-4 text-green-600" />
                        <Label>Auto Enhance</Label>
                      </div>
                      <Switch
                        checked={autoEnhance}
                        onCheckedChange={setAutoEnhance}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-orange-600" />
                        <Label>Performance Monitor</Label>
                      </div>
                      <Switch
                        checked={showPerformanceMonitor}
                        onCheckedChange={setShowPerformanceMonitor}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Capture Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleCapture}
              disabled={isCapturing}
              className="px-8 py-4 text-lg"
            >
              {isCapturing ? (
                <>
                  <Zap className="h-5 w-5 mr-2 animate-pulse" />
                  Capturing...
                </>
              ) : (
                <>
                  <Camera className="h-5 w-5 mr-2" />
                  Capture Screenshot
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="edit" className="space-y-6">
          {screenshot ? (
            <div className="space-y-4">
              {/* Performance Monitor */}
              {showPerformanceMonitor && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <h4 className="font-medium text-sm">
                        Performance Monitor
                      </h4>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span>Render Time: </span>
                        <span
                          className={
                            metrics.renderTime < 16
                              ? "text-green-600"
                              : "text-yellow-600"
                          }
                        >
                          {metrics.renderTime.toFixed(1)}ms
                        </span>
                      </div>
                      <div>
                        <span>Memory: </span>
                        <span
                          className={
                            metrics.memoryUsage < 75
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {metrics.memoryUsage}%
                        </span>
                      </div>
                      <div>
                        <span>FPS: </span>
                        <span
                          className={
                            metrics.fps >= 50
                              ? "text-green-600"
                              : "text-yellow-600"
                          }
                        >
                          {metrics.fps}
                        </span>
                      </div>
                    </div>
                    {performanceIssues.length > 0 && (
                      <div className="mt-2 text-xs text-amber-600">
                        Issues: {performanceIssues.join(", ")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Enhanced Annotation Toolbar */}
              <AnnotationToolbar
                onToolChange={setAnnotationTool}
                onColorChange={setAnnotationColor}
                onSizeChange={setAnnotationSize}
                onOpacityChange={setAnnotationOpacity}
                activeTool={annotationTool}
                activeColor={annotationColor}
                activeSize={annotationSize}
                activeOpacity={annotationOpacity}
                onUndo={() => {}}
                onRedo={() => {}}
                onClear={() => {}}
                onSave={() => {}}
                onDownload={handleDownload}
                canUndo={false}
                canRedo={false}
              />

              {/* Screenshot with Annotation Canvas */}
              <Card>
                <CardContent className="p-4">
                  <div className="relative inline-block">
                    <img
                      ref={imageRef}
                      src={screenshot}
                      alt="Screenshot"
                      className="max-w-full h-auto border rounded-lg"
                      onLoad={(e) => {
                        const img = e.target as HTMLImageElement;
                        setScreenshotDimensions({
                          width: img.naturalWidth,
                          height: img.naturalHeight,
                        });
                        if (!isMonitoring) startMonitoring();
                      }}
                    />
                    {screenshotDimensions.width > 0 && (
                      <EnhancedAnnotationCanvas
                        width={screenshotDimensions.width}
                        height={screenshotDimensions.height}
                        tool={annotationTool}
                        color={annotationColor}
                        size={annotationSize}
                        opacity={annotationOpacity}
                        className="rounded-lg"
                      />
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setShowPerformanceMonitor(!showPerformanceMonitor)
                        }
                      >
                        <Activity className="h-4 w-4 mr-1" />
                        Monitor
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearScreenshot}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  No Screenshot Yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Capture a screenshot first to start editing and annotating
                </p>
                <Button
                  onClick={() =>
                    document.querySelector('[value="capture"]')?.click()
                  }
                >
                  Go to Capture
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Screenshot Settings
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Default Format</Label>
                    <Select value={saveFormat} onValueChange={setSaveFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {saveFormats.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Default Quality: {quality}%</Label>
                    <Slider
                      value={[quality]}
                      onValueChange={(value) => setQuality(value[0])}
                      max={100}
                      min={10}
                      step={10}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label>Auto-save to Downloads</Label>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Include Metadata</Label>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Show Capture Notification</Label>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Auto-open Editor</Label>
                    <Switch />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
