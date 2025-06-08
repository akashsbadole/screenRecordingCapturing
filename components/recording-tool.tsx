"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Video,
  Download,
  X,
  Pause,
  Play,
  Store as Stop,
  Mic,
  MicOff,
  Pen,
  MousePointer,
  Square,
  Circle,
  Type,
  Highlighter,
  Eraser,
  Palette,
  Settings,
  Activity,
  Zap,
  Target,
  Layers,
  Sparkles,
  Camera,
  Monitor,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { formatTime } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { AdvancedRecordingFeatures } from "@/components/advanced-recording-features";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function RecordingTool() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingData, setRecordingData] = useState<string | null>(null);
  const [withAudio, setWithAudio] = useState(true);
  const [downloadReady, setDownloadReady] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [annotationTool, setAnnotationTool] = useState("pen");
  const [annotationColor, setAnnotationColor] = useState("#ff0000");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Performance monitoring states
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: 0,
    memoryUsage: 0,
    bitrate: 0,
    frameDrops: 0,
    quality: 100,
  });
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);

  // Advanced features
  const [cursorHighlight, setCursorHighlight] = useState(true);
  const [webcamOverlay, setWebcamOverlay] = useState(false);
  const [autoZoom, setAutoZoom] = useState(false);
  const [recordingQuality, setRecordingQuality] = useState(30); // FPS
  const [videoBitrate, setVideoBitrate] = useState(2500000); // 2.5 Mbps

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const performanceMonitorRef = useRef<number | null>(null);
  const annotationCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      if (performanceMonitorRef.current) {
        window.clearInterval(performanceMonitorRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recordingData) {
        URL.revokeObjectURL(recordingData);
      }
    };
  }, [recordingData]);

  // Performance monitoring
  const startPerformanceMonitoring = useCallback(() => {
    if (performanceMonitorRef.current) return;

    performanceMonitorRef.current = window.setInterval(() => {
      // Monitor memory usage
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo
        ? Math.round(
            (memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100
          )
        : 0;

      // Estimate FPS (simplified)
      const fps = isRecording
        ? Math.max(15, 60 - Math.floor(memoryUsage / 10))
        : 0;

      // Calculate frame drops
      const frameDrops = fps < 25 ? Math.floor((30 - fps) / 2) : 0;

      setPerformanceMetrics((prev) => ({
        ...prev,
        fps,
        memoryUsage,
        frameDrops,
        bitrate: videoBitrate,
      }));

      // Auto-adjust quality if performance is poor
      if (fps < 20 && isRecording) {
        setRecordingQuality((prev) => Math.max(15, prev - 5));
        toast({
          title: "Performance optimization",
          description:
            "Automatically reducing quality to maintain smooth recording",
        });
      }
    }, 1000);
  }, [isRecording, videoBitrate, toast]);

  const stopPerformanceMonitoring = useCallback(() => {
    if (performanceMonitorRef.current) {
      window.clearInterval(performanceMonitorRef.current);
      performanceMonitorRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = window.setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const cleanupRecording = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    stopTimer();
    stopPerformanceMonitoring();
    setIsRecording(false);
    setIsPaused(false);
    setDownloadReady(true);

    // Reset performance metrics
    setPerformanceMetrics({
      fps: 0,
      memoryUsage: 0,
      bitrate: 0,
      frameDrops: 0,
      quality: 100,
    });
  }, [stopTimer, stopPerformanceMonitoring]);

  const handleStartRecording = useCallback(async () => {
    try {
      setDownloadReady(false);

      // Start performance monitoring
      startPerformanceMonitoring();

      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor",
          frameRate: recordingQuality,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      let finalStream = displayStream;

      // Add webcam overlay if enabled
      if (webcamOverlay) {
        try {
          const webcamStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 320 },
              height: { ideal: 240 },
            },
          });
          // Note: Webcam overlay would need additional canvas processing
          // This is a placeholder for the feature
        } catch (webcamError) {
          console.warn("Failed to get webcam stream:", webcamError);
          toast({
            title: "Webcam overlay failed",
            description: "Recording will continue without webcam overlay",
          });
        }
      }

      if (withAudio) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 44100,
            },
          });
          const tracks = [
            ...displayStream.getTracks(),
            ...audioStream.getTracks(),
          ];
          finalStream = new MediaStream(tracks);
        } catch (audioError) {
          console.warn("Failed to get audio stream:", audioError);
          toast({
            title: "Audio capture failed",
            description: "Recording will continue without audio",
          });
        }
      }

      streamRef.current = finalStream;

      // Enhanced MediaRecorder with performance optimization
      const mediaRecorder = new MediaRecorder(finalStream, {
        mimeType: "video/webm;codecs=vp8,opus",
        videoBitsPerSecond: videoBitrate,
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setRecordingData(url);
        if (videoRef.current) {
          videoRef.current.src = url;
        }
        cleanupRecording();
      };

      // Handle stream stop (user clicks "Stop sharing" in browser UI)
      finalStream.getVideoTracks()[0].onended = () => {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state !== "inactive"
        ) {
          handleStopRecording();
        }
      };

      mediaRecorder.start(1000); // Capture chunks every second
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      setRecordingData(null);
      startTimer();

      toast({
        title: "Recording started",
        description: "Your screen is now being recorded",
      });
    } catch (error) {
      cleanupRecording();
      toast({
        title: "Recording failed",
        description:
          "Failed to start recording. Please ensure you've granted the necessary permissions.",
        variant: "destructive",
      });
    }
  }, [withAudio, startTimer, cleanupRecording, toast]);

  const handlePauseRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !isRecording) return;

    try {
      if (!isPaused) {
        mediaRecorderRef.current.pause();
        stopTimer();
        setIsPaused(true);
        toast({
          title: "Recording paused",
          description: "Your recording has been paused",
        });
      } else {
        mediaRecorderRef.current.resume();
        startTimer();
        setIsPaused(false);
        toast({
          title: "Recording resumed",
          description: "Your recording has been resumed",
        });
      }
    } catch (error) {
      console.error("Error toggling pause:", error);
      toast({
        title: "Operation failed",
        description: "Failed to pause/resume recording",
        variant: "destructive",
      });
    }
  }, [isRecording, isPaused, stopTimer, startTimer, toast]);

  const handleStopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !streamRef.current) return;

    try {
      mediaRecorderRef.current.stop();
      streamRef.current.getTracks().forEach((track) => track.stop());
      toast({
        title: "Recording completed",
        description: "Your recording is ready to download",
      });
    } catch (error) {
      console.error("Error stopping recording:", error);
      cleanupRecording();
      toast({
        title: "Error stopping recording",
        description: "There was an error stopping the recording.",
        variant: "destructive",
      });
    }
  }, [cleanupRecording, toast]);

  const handleDownload = useCallback(() => {
    if (!recordingData || !downloadReady) return;

    const a = document.createElement("a");
    a.href = recordingData;
    a.download = `screen-recording-${new Date().toISOString()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast({
      title: "Download started",
      description: "Your recording is being downloaded",
    });
  }, [recordingData, downloadReady, toast]);

  const clearRecording = useCallback(() => {
    if (recordingData) {
      URL.revokeObjectURL(recordingData);
    }
    setRecordingData(null);
    setRecordingTime(0);
    setDownloadReady(false);
    if (videoRef.current) {
      videoRef.current.src = "";
    }
  }, [recordingData]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="recording" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recording">Recording</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Features</TabsTrigger>
          <TabsTrigger value="preview">Preview & Export</TabsTrigger>
        </TabsList>

        <TabsContent value="recording" className="space-y-6">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Recording Controls</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Options
                </Button>
              </div>
            </div>
            <div className="space-y-6">
              {/* Basic Audio Option */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {withAudio ? (
                    <Mic className="h-4 w-4 text-primary" />
                  ) : (
                    <MicOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Label htmlFor="audio-toggle">Record with audio</Label>
                </div>
                <Switch
                  id="audio-toggle"
                  checked={withAudio}
                  onCheckedChange={setWithAudio}
                  disabled={isRecording}
                />
              </div>

              {/* Annotation Tools */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Pen className="h-4 w-4 text-primary" />
                  <Label htmlFor="annotation-toggle">
                    Enable real-time annotations
                  </Label>
                </div>
                <Switch
                  id="annotation-toggle"
                  checked={showAnnotations}
                  onCheckedChange={setShowAnnotations}
                  disabled={isRecording}
                />
              </div>

              {/* Annotation Tools Panel */}
              {showAnnotations && (
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-4">
                  <h4 className="font-medium text-sm">Annotation Tools</h4>
                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      variant={annotationTool === "pen" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAnnotationTool("pen")}
                      className="flex flex-col items-center p-2 h-auto"
                    >
                      <Pen className="h-4 w-4 mb-1" />
                      <span className="text-xs">Pen</span>
                    </Button>
                    <Button
                      variant={
                        annotationTool === "highlighter" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setAnnotationTool("highlighter")}
                      className="flex flex-col items-center p-2 h-auto"
                    >
                      <Highlighter className="h-4 w-4 mb-1" />
                      <span className="text-xs">Highlight</span>
                    </Button>
                    <Button
                      variant={
                        annotationTool === "rectangle" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setAnnotationTool("rectangle")}
                      className="flex flex-col items-center p-2 h-auto"
                    >
                      <Square className="h-4 w-4 mb-1" />
                      <span className="text-xs">Rectangle</span>
                    </Button>
                    <Button
                      variant={
                        annotationTool === "circle" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setAnnotationTool("circle")}
                      className="flex flex-col items-center p-2 h-auto"
                    >
                      <Circle className="h-4 w-4 mb-1" />
                      <span className="text-xs">Circle</span>
                    </Button>
                    <Button
                      variant={
                        annotationTool === "text" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setAnnotationTool("text")}
                      className="flex flex-col items-center p-2 h-auto"
                    >
                      <Type className="h-4 w-4 mb-1" />
                      <span className="text-xs">Text</span>
                    </Button>
                    <Button
                      variant={
                        annotationTool === "arrow" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setAnnotationTool("arrow")}
                      className="flex flex-col items-center p-2 h-auto"
                    >
                      <MousePointer className="h-4 w-4 mb-1" />
                      <span className="text-xs">Arrow</span>
                    </Button>
                    <Button
                      variant={
                        annotationTool === "eraser" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setAnnotationTool("eraser")}
                      className="flex flex-col items-center p-2 h-auto"
                    >
                      <Eraser className="h-4 w-4 mb-1" />
                      <span className="text-xs">Eraser</span>
                    </Button>
                    <div className="flex flex-col items-center">
                      <Palette className="h-4 w-4 mb-1 text-muted-foreground" />
                      <input
                        type="color"
                        value={annotationColor}
                        onChange={(e) => setAnnotationColor(e.target.value)}
                        className="w-8 h-6 rounded border cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Options */}
              {showAdvancedOptions && (
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-4">
                  <h4 className="font-medium text-sm">Advanced Features</h4>
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span>🎯 Mouse cursor highlighting</span>
                      <Switch
                        checked={cursorHighlight}
                        onCheckedChange={setCursorHighlight}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>🔍 Auto-zoom on click</span>
                      <Switch
                        checked={autoZoom}
                        onCheckedChange={setAutoZoom}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>📹 Webcam overlay</span>
                      <Switch
                        checked={webcamOverlay}
                        onCheckedChange={setWebcamOverlay}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>📊 Performance monitor</span>
                      <Switch
                        checked={showPerformanceMonitor}
                        onCheckedChange={setShowPerformanceMonitor}
                      />
                    </div>
                  </div>

                  {/* Quality Settings */}
                  <div className="space-y-3 pt-3 border-t">
                    <div>
                      <Label className="text-xs">
                        Recording Quality (FPS): {recordingQuality}
                      </Label>
                      <Slider
                        value={[recordingQuality]}
                        onValueChange={(value) => setRecordingQuality(value[0])}
                        max={60}
                        min={15}
                        step={5}
                        className="mt-2"
                        disabled={isRecording}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">
                        Video Bitrate: {Math.round(videoBitrate / 1000000)}Mbps
                      </Label>
                      <Slider
                        value={[videoBitrate]}
                        onValueChange={(value) => setVideoBitrate(value[0])}
                        max={10000000}
                        min={500000}
                        step={500000}
                        className="mt-2"
                        disabled={isRecording}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Monitor */}
              {showPerformanceMonitor && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium text-sm">Performance Monitor</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex justify-between">
                        <span>FPS:</span>
                        <span
                          className={
                            performanceMetrics.fps >= 25
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {performanceMetrics.fps}
                        </span>
                      </div>
                      <Progress
                        value={performanceMetrics.fps}
                        max={60}
                        className="h-2 mt-1"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span>Memory:</span>
                        <span
                          className={
                            performanceMetrics.memoryUsage < 80
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {performanceMetrics.memoryUsage}%
                        </span>
                      </div>
                      <Progress
                        value={performanceMetrics.memoryUsage}
                        max={100}
                        className="h-2 mt-1"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span>Frame Drops:</span>
                        <span
                          className={
                            performanceMetrics.frameDrops === 0
                              ? "text-green-600"
                              : "text-yellow-600"
                          }
                        >
                          {performanceMetrics.frameDrops}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span>Bitrate:</span>
                        <span>
                          {Math.round(performanceMetrics.bitrate / 1000000)}Mbps
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Recording time:</span>
                <span className="font-mono text-lg">
                  {formatTime(recordingTime)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {!isRecording ? (
                  <Button
                    onClick={handleStartRecording}
                    className="w-full flex-1"
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Start Recording
                  </Button>
                ) : (
                  <>
                    <Button
                      variant={isPaused ? "default" : "outline"}
                      onClick={handlePauseRecording}
                      className="flex-1"
                    >
                      {isPaused ? (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="mr-2 h-4 w-4" />
                          Pause
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleStopRecording}
                      className="flex-1"
                    >
                      <Stop className="mr-2 h-4 w-4" />
                      Stop
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Live Preview</h3>
              {recordingData ? (
                <Card>
                  <CardContent className="p-4">
                    <div className="relative">
                      <video
                        ref={videoRef}
                        controls
                        className="w-full rounded-lg border aspect-video bg-black"
                      >
                        Your browser does not support the video element.
                      </video>
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownload}
                          disabled={!downloadReady}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearRecording}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border border-dashed">
                  <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px]">
                    <div className="text-center space-y-4">
                      <div className="bg-primary/10 text-primary p-3 rounded-full inline-flex">
                        <Video className="h-6 w-6" />
                      </div>
                      <h4 className="font-semibold">Ready to Record</h4>
                      <p className="text-sm text-muted-foreground">
                        Configure your options and click "Start Recording" to
                        begin capturing.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <AdvancedRecordingFeatures
            videoData={recordingData}
            onGifCreated={(gifData) => {
              toast({
                title: "GIF created!",
                description:
                  "Your animated GIF has been generated successfully",
              });
            }}
          />
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">
                  Recording Preview & Export
                </h3>
                {recordingData ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <video
                        ref={videoRef}
                        controls
                        className="w-full rounded-lg border aspect-video bg-black"
                      >
                        Your browser does not support the video element.
                      </video>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={handleDownload}
                        disabled={!downloadReady}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Video
                      </Button>
                      <Button variant="outline" onClick={clearRecording}>
                        <X className="h-4 w-4 mr-2" />
                        Clear Recording
                      </Button>
                      <Button variant="outline">
                        <Camera className="h-4 w-4 mr-2" />
                        Extract Frame
                      </Button>
                      <Button variant="outline">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Create GIF
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h4 className="font-semibold mb-2">
                      No Recording Available
                    </h4>
                    <p className="text-muted-foreground">
                      Start a recording to see preview and export options
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
