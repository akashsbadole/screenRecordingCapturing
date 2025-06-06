"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Camera,
  Video,
  Printer,
  Info,
  AlertTriangle,
  Users,
  Sparkles,
} from "lucide-react";
import { EnhancedScreenshotTool } from "@/components/enhanced-screenshot-tool";
import { RecordingTool } from "@/components/recording-tool";
import { PrintScreenTool } from "@/components/print-screen-tool";
import { VideoCallTool } from "@/components/video-call-tool";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState, useEffect } from "react";

export function ToolsSection() {
  const [browserSupport, setBrowserSupport] = useState({
    screenshot: false,
    recording: false,
    mediaDevices: false,
    secureContext: false,
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Check if we're in a secure context (HTTPS or localhost)
      const isSecureContext = window.isSecureContext;

      // Check browser support for required APIs
      const hasMediaDevices = "mediaDevices" in navigator;
      const hasGetDisplayMedia =
        hasMediaDevices && "getDisplayMedia" in navigator.mediaDevices;
      const hasMediaRecorder = "MediaRecorder" in window;

      setBrowserSupport({
        screenshot: hasGetDisplayMedia,
        recording: hasMediaRecorder && hasGetDisplayMedia,
        mediaDevices: hasMediaDevices,
        secureContext: isSecureContext,
      });

      if (!isSecureContext) {
        setError("This feature requires a secure connection (HTTPS)");
      } else if (!hasMediaDevices) {
        setError("Your browser doesn't support screen capture features");
      }
    } catch (e) {
      setError("Failed to initialize screen capture features");
      console.error("Browser support check failed:", e);
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
              {error}. Please use a modern browser like Chrome, Firefox, or Edge
              with HTTPS enabled.
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
              Screen capture features are not available. Please ensure you're
              using HTTPS and a supported browser.
            </AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }

  return (
    <section
      id="tools"
      className="py-24 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800"
    >
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Professional Recording & Capture Tools
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            High-quality screen recording, instant screenshots, and optional
            video meetings. Try our tools directly in your browser or download
            the Chrome extension.
          </p>
        </div>

        <Tabs defaultValue="recording" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-12 bg-white/50 backdrop-blur-sm border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 p-2 rounded-2xl shadow-lg">
            <TabsTrigger
              value="recording"
              className="flex items-center gap-2"
              disabled={!browserSupport.recording}
            >
              <Video className="h-4 w-4" />
              <span>Advanced Recording</span>
            </TabsTrigger>
            <TabsTrigger
              value="screenshot"
              className="flex items-center gap-2"
              disabled={!browserSupport.screenshot}
            >
              <Camera className="h-4 w-4" />
              <span>Screenshot</span>
            </TabsTrigger>
            <TabsTrigger
              value="printscreen"
              className="flex items-center gap-2"
              disabled={!browserSupport.screenshot}
            >
              <Printer className="h-4 w-4" />
              <span>Print Screen</span>
            </TabsTrigger>
            <TabsTrigger
              value="videocall"
              className="flex items-center gap-2"
              disabled={!browserSupport.mediaDevices}
            >
              <Users className="h-4 w-4" />
              <span>Video Meeting</span>
            </TabsTrigger>

            <TabsTrigger
              value="selection"
              className="flex items-center gap-2 relative"
              disabled={true}
            >
              <Sparkles className="h-4 w-4" />
              <span>Smart Selection</span>
              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs px-1 py-0.5 rounded-full font-semibold">
                Soon
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recording">
            <RecordingTool />
          </TabsContent>

          <TabsContent value="screenshot">
            <EnhancedScreenshotTool />
          </TabsContent>

          <TabsContent value="printscreen">
            <PrintScreenTool />
          </TabsContent>

          <TabsContent value="videocall">
            <VideoCallTool />
          </TabsContent>

          <TabsContent value="selection">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8 text-center">
              <div className="max-w-2xl mx-auto">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl w-fit mx-auto mb-6 shadow-lg">
                  <Sparkles className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Smart Selection - Coming Soon
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                  Revolutionary AI-powered element detection that automatically
                  identifies and selects UI components, text blocks, images, and
                  interactive elements with pixel-perfect precision.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl">
                    <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                      🎯 Smart Detection
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Automatically detect buttons, forms, images, and text
                      blocks
                    </p>
                  </div>
                  <div className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl">
                    <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">
                      ⚡ One-Click Selection
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Select complex elements with a single click
                    </p>
                  </div>
                  <div className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl">
                    <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
                      🔍 Precision Capture
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Pixel-perfect boundaries with automatic padding
                    </p>
                  </div>
                  <div className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-xl">
                    <h4 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">
                      🎨 Context Aware
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Understands page layout and element relationships
                    </p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
                    🚀 Be the first to know when Smart Selection launches! This
                    feature will revolutionize how you capture content.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
