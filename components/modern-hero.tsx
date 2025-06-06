"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Camera,
  Monitor,
  Video,
  Download,
  Chrome,
  Star,
  Bookmark,
  Play,
  Users,
  Zap,
  Shield,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function ModernHero() {
  const [isVisible, setIsVisible] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
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
      if (typeof window !== "undefined" && "external" in window) {
        try {
          (window as any).external.AddFavorite(
            window.location.href,
            document.title
          );
        } catch (e) {
          alert("Press Ctrl+D (Cmd+D on Mac) to bookmark this page!");
        }
      }
    }
  };

  const scrollToTools = () => {
    document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" });
  };

  const downloadExtension = () => {
    window.open("/chrome-extension-guide.html", "_blank");
  };

  const startMeeting = () => {
    router.push("/meeting");
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 lg:pt-32">
      {/* Modern Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(156, 146, 172, 0.15) 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          {/* Top Badge and Bookmark */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <Badge
              variant="outline"
              className="px-6 py-3 text-sm font-medium border-blue-200 bg-white/50 backdrop-blur-sm text-blue-700 shadow-lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Professional Recording Tools
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className="gap-2 bg-white/50 backdrop-blur-sm hover:bg-white/70 border border-blue-200 shadow-lg"
            >
              <Bookmark
                className={`w-4 h-4 ${
                  isBookmarked
                    ? "fill-current text-yellow-500"
                    : "text-blue-600"
                }`}
              />
              <span className="text-blue-600 font-medium">
                {isBookmarked ? "Bookmarked" : "Bookmark"}
              </span>
            </Button>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-tight">
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
                Screen Recording
              </span>
              <span className="block text-slate-900 dark:text-white">
                & Capture Tool
              </span>
            </h1>
          </motion.div>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl sm:text-2xl lg:text-3xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed mb-12"
          >
            Professional screen recording, screenshot capture, and video
            meetings.
            <br className="hidden sm:block" />
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              Chrome extension included.
            </span>
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button
              size="lg"
              className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              onClick={scrollToTools}
            >
              <Play className="w-5 h-5 mr-2" />
              Try Web App
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="px-8 py-4 text-lg font-semibold bg-white/50 backdrop-blur-sm border-2 border-blue-200 hover:bg-white/70 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              onClick={downloadExtension}
            >
              <Chrome className="w-5 h-5 mr-2" />
              Get Extension
              <Download className="w-5 h-5 ml-2" />
            </Button>

            <Button
              size="lg"
              variant="secondary"
              className="px-8 py-4 text-lg font-semibold bg-slate-100 hover:bg-slate-200 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              onClick={startMeeting}
            >
              <Users className="w-5 h-5 mr-2" />
              Start Meeting
            </Button>
          </motion.div>

          {/* Feature Cards Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto"
          >
            {/* Screen Recording */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm hover:bg-white/90 hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Monitor className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-slate-900">
                  Screen Recording
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Advanced recording with annotations, zoom, highlights, and
                  real-time editing tools
                </p>
                <div className="mt-4 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-sm text-green-600 font-medium">
                    Priority Feature
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Screenshot Capture */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm hover:bg-white/90 hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-slate-900">
                  Screenshot Capture
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Capture full screen or selected areas instantly
                </p>
                <div className="mt-4 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-sm text-green-600 font-medium">
                    Priority Feature
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Video Meetings */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm hover:bg-white/90 hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Video className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-slate-900">
                  Video Meetings
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Zoom-like video calls with screen sharing
                </p>
                <div className="mt-4 flex items-center justify-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-2" />
                  <span className="text-sm text-yellow-600 font-medium">
                    Optional Feature
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Chrome Extension */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm hover:bg-white/90 hover:scale-105">
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Chrome className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-slate-900">
                  Chrome Extension
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Browser extension for quick access anywhere
                </p>
                <div className="mt-4 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="text-sm text-blue-600 font-medium">
                    Instant Access
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Smart Selection - Coming Soon */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-600 dark:hover:to-slate-700 hover:scale-105 relative overflow-hidden">
              <CardContent className="p-8 text-center relative">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-slate-900 dark:text-white">
                  Smart Selection
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  AI-powered element detection and smart area selection
                </p>
                <div className="mt-4 flex items-center justify-center">
                  <div className="w-4 h-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mr-2 animate-pulse" />
                  <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                    Coming Soon
                  </span>
                </div>
                {/* Coming Soon Badge */}
                <div className="absolute top-3 right-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  NEW
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-wrap items-center justify-center gap-8 mt-16 text-slate-600"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="font-medium">Privacy Focused</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Lightning Fast</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <span className="font-medium">Professional Quality</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
