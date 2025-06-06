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
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { formatTime } from "@/lib/utils";

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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recordingData) {
        URL.revokeObjectURL(recordingData);
      }
    };
  }, [recordingData]);

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
    setIsRecording(false);
    setIsPaused(false);
    setDownloadReady(true);
  }, [stopTimer]);

  const handleStartRecording = useCallback(async () => {
    try {
      setDownloadReady(false);
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor",
          frameRate: 30,
        },
      });

      let finalStream = displayStream;

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
      const mediaRecorder = new MediaRecorder(finalStream, {
        mimeType: "video/webm;codecs=vp8,opus",
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
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Advanced Recording</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Options
          </Button>
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
                  variant={annotationTool === "circle" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAnnotationTool("circle")}
                  className="flex flex-col items-center p-2 h-auto"
                >
                  <Circle className="h-4 w-4 mb-1" />
                  <span className="text-xs">Circle</span>
                </Button>
                <Button
                  variant={annotationTool === "text" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAnnotationTool("text")}
                  className="flex flex-col items-center p-2 h-auto"
                >
                  <Type className="h-4 w-4 mb-1" />
                  <span className="text-xs">Text</span>
                </Button>
                <Button
                  variant={annotationTool === "arrow" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAnnotationTool("arrow")}
                  className="flex flex-col items-center p-2 h-auto"
                >
                  <MousePointer className="h-4 w-4 mb-1" />
                  <span className="text-xs">Arrow</span>
                </Button>
                <Button
                  variant={annotationTool === "eraser" ? "default" : "outline"}
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
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span>🔍 Auto-zoom on click</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span>⏱️ Countdown timer</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span>📊 Performance overlay</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span>🎨 Background blur</span>
                  <Switch />
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
              <Button onClick={handleStartRecording} className="w-full flex-1">
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
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Preview</h3>

        {recordingData ? (
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-background/80"
              onClick={clearRecording}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-12 z-10 bg-background/80"
              onClick={handleDownload}
              disabled={!downloadReady}
            >
              <Download className="h-4 w-4" />
            </Button>
            <video
              ref={videoRef}
              controls
              className="w-full rounded-lg border aspect-video bg-black"
            >
              Your browser does not support the video element.
            </video>
          </div>
        ) : (
          <Card className="border border-dashed">
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px]">
              <div className="text-center space-y-4">
                <div className="bg-primary/10 text-primary p-3 rounded-full inline-flex">
                  <Video className="h-6 w-6" />
                </div>
                <h4 className="font-semibold">Ready to Record</h4>
                <p className="text-sm text-muted-foreground">
                  Configure your options and click "Start Recording" to begin
                  capturing.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
