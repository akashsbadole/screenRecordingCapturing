"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Camera,
  Monitor,
  Printer,
  Video,
  Download,
  Chrome,
  Star,
  Bookmark,
  Play,
  Users,
  Zap,
  Shield,
  Globe,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
    // Check if already bookmarked
    const bookmarked = localStorage.getItem("screenRecorderBookmarked");
    setIsBookmarked(bookmarked === "true");
  }, []);

  const handleBookmark = () => {
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);
    localStorage.setItem(
      "screenRecorderBookmarked",
      newBookmarkState.toString()
    );

    if (newBookmarkState) {
      // Add to browser bookmarks if possible
      if (typeof window !== "undefined" && "external" in window) {
        try {
          (window as any).external.AddFavorite(
            window.location.href,
            document.title
          );
        } catch (e) {
          // Fallback for modern browsers
          alert("Press Ctrl+D (Cmd+D on Mac) to bookmark this page!");
        }
      }
    }
  };

  const downloadChromeExtension = () => {
    // Create a zip file download link for the Chrome extension
    const link = document.createElement("a");
    link.href = "/chrome-extension.zip"; // You'll need to create this zip file
    link.download = "screen-recorder-chrome-extension.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startVideoMeeting = () => {
    router.push("/meeting");
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 -z-10" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5 -z-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-3xl opacity-10 -z-10" />

      <div className="container relative">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="space-y-6 mb-8"
          >
            {/* Badge */}
            <div className="flex items-center justify-center gap-2">
              <Badge
                variant="secondary"
                className="px-4 py-2 text-sm font-medium"
              >
                <Zap className="w-4 h-4 mr-2" />
                Professional Recording Tools
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className="gap-2"
              >
                <Bookmark
                  className={`w-4 h-4 ${
                    isBookmarked ? "fill-current text-yellow-500" : ""
                  }`}
                />
                {isBookmarked ? "Bookmarked" : "Bookmark"}
              </Button>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Screen Recording
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                & Capture Tool
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Professional screen recording, screenshot capture, and video
              meetings.
              <span className="font-semibold text-primary">
                {" "}
                Chrome extension included.
              </span>
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <Button
              size="lg"
              className="gap-2 group px-8 py-6 text-lg"
              onClick={() => router.push("#tools")}
            >
              <Play className="h-5 w-5" />
              Try Web App
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="gap-2 px-8 py-6 text-lg"
              onClick={downloadChromeExtension}
            >
              <Chrome className="h-5 w-5" />
              Download Extension
              <Download className="h-5 w-5" />
            </Button>

            <Button
              size="lg"
              variant="secondary"
              className="gap-2 px-8 py-6 text-lg"
              onClick={startVideoMeeting}
            >
              <Users className="h-5 w-5" />
              Start Meeting
            </Button>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {/* Screen Recording Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Monitor className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Screen Recording</h3>
                <p className="text-sm text-muted-foreground">
                  High-quality video recording with audio support
                </p>
              </CardContent>
            </Card>

            {/* Screenshot Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-green-200">
              <CardContent className="p-6 text-center">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Camera className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  Screenshot Capture
                </h3>
                <p className="text-sm text-muted-foreground">
                  Capture full screen or selected areas instantly
                </p>
              </CardContent>
            </Card>

            {/* Video Meetings Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-200">
              <CardContent className="p-6 text-center">
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Video className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Video Meetings</h3>
                <p className="text-sm text-muted-foreground">
                  Zoom-like video calls with screen sharing
                </p>
              </CardContent>
            </Card>

            {/* Chrome Extension Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-orange-200">
              <CardContent className="p-6 text-center">
                <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Chrome className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Chrome Extension</h3>
                <p className="text-sm text-muted-foreground">
                  Browser extension for quick access anywhere
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">Privacy Focused</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <span className="text-sm font-medium">Works Offline</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-current text-yellow-500" />
              <span className="text-sm font-medium">Professional Quality</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Interactive Demo Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="container mt-20"
      >
        <div className="relative mx-auto max-w-6xl">
          <Card className="overflow-hidden border-2 shadow-2xl">
            <CardContent className="p-0">
              <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center relative">
                {/* Mock Browser Window */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>

                {/* Demo Content */}
                <div className="text-center space-y-4">
                  <div className="bg-primary/10 text-primary p-4 rounded-full inline-flex">
                    <Monitor className="h-12 w-12" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Live Demo</h3>
                    <p className="text-muted-foreground">
                      Try the tools below to see them in action
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push("#tools")}
                    className="gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Start Demo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </section>
  );
}
