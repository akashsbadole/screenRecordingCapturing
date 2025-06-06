"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Video, Printer, Info, AlertTriangle } from "lucide-react";
import { ScreenshotTool } from "@/components/screenshot-tool";
import { RecordingTool } from "@/components/recording-tool";
import { PrintScreenTool } from "@/components/print-screen-tool";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState, useEffect } from "react";

export function ToolsSection() {
  const [browserSupport, setBrowserSupport] = useState({
    screenshot: false,
    recording: false,
    mediaDevices: false,
    secureContext: false
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Check if we're in a secure context (HTTPS or localhost)
      const isSecureContext = window.isSecureContext;
      
      // Check browser support for required APIs
      const hasMediaDevices = 'mediaDevices' in navigator;
      const hasGetDisplayMedia = hasMediaDevices && 'getDisplayMedia' in navigator.mediaDevices;
      const hasMediaRecorder = 'MediaRecorder' in window;

      setBrowserSupport({
        screenshot: hasGetDisplayMedia,
        recording: hasMediaRecorder && hasGetDisplayMedia,
        mediaDevices: hasMediaDevices,
        secureContext: isSecureContext
      });

      if (!isSecureContext) {
        setError('This feature requires a secure connection (HTTPS)');
      } else if (!hasMediaDevices) {
        setError('Your browser doesn\'t support screen capture features');
      }
    } catch (e) {
      setError('Failed to initialize screen capture features');
      console.error('Browser support check failed:', e);
    }
  }, []);

  if (error) {
    return (
      <section id="tools" className="py-20 bg-muted/30">
        <div className="container max-w-4xl">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}. Please use a modern browser like Chrome, Firefox, or Edge with HTTPS enabled.
            </AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }

  if (!browserSupport.secureContext || !browserSupport.mediaDevices) {
    return (
      <section id="tools" className="py-20 bg-muted/30">
        <div className="container max-w-4xl">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Screen capture features are not available. Please ensure you're using HTTPS and a supported browser.
            </AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }

  return (
    <section id="tools" className="py-20 bg-muted/30">
      <div className="container max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Screen Capture Tools</h2>
          <p className="text-muted-foreground">
            Capture, record, and share your screen with our professional tools.
          </p>
        </div>

        <Tabs defaultValue="screenshot" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger 
              value="screenshot" 
              className="flex items-center gap-2"
              disabled={!browserSupport.screenshot}
            >
              <Camera className="h-4 w-4" />
              <span>Screenshot</span>
            </TabsTrigger>
            <TabsTrigger 
              value="recording" 
              className="flex items-center gap-2"
              disabled={!browserSupport.recording}
            >
              <Video className="h-4 w-4" />
              <span>Recording</span>
            </TabsTrigger>
            <TabsTrigger 
              value="printscreen" 
              className="flex items-center gap-2"
              disabled={!browserSupport.screenshot}
            >
              <Printer className="h-4 w-4" />
              <span>Print Screen</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="screenshot">
            <ScreenshotTool />
          </TabsContent>
          
          <TabsContent value="recording">
            <RecordingTool />
          </TabsContent>
          
          <TabsContent value="printscreen">
            <PrintScreenTool />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}