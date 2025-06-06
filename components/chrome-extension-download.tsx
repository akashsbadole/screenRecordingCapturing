"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Download,
  Chrome,
  Monitor,
  Camera,
  Star,
  Shield,
  Zap,
  CheckCircle,
  ExternalLink,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ChromeExtensionDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      // For now, provide installation instructions instead of direct download
      toast({
        title: "Chrome Extension Available",
        description:
          "Follow the installation guide to set up the extension manually.",
      });

      // Open installation guide
      openInstallationGuide();
    } catch (error) {
      toast({
        title: "Installation Guide",
        description:
          "Please follow the manual installation steps in the guide.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const openInstallationGuide = () => {
    window.open("/chrome-extension-guide.html", "_blank");
  };

  return (
    <section className="py-24 bg-gradient-to-br from-white via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-6 px-6 py-3 text-sm font-medium border-blue-200 bg-white/50 backdrop-blur-sm text-blue-700 shadow-lg"
          >
            <Chrome className="w-4 h-4 mr-2" />
            Chrome Extension
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Download Our Chrome Extension
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
            Get instant access to screen recording and capture tools from any
            website.
            <br className="hidden sm:block" />
            No need to open a separate app.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Download Card */}
          <Card className="border-2 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full w-fit mx-auto mb-4">
                <Chrome className="h-12 w-12 text-white" />
              </div>
              <CardTitle className="text-2xl">
                Screen Recorder & Capture Extension
              </CardTitle>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-current text-yellow-500"
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  (Professional Quality)
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Features List */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>High-quality screen recording (up to 1080p)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Screenshot capture with area selection</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Audio recording (microphone + system)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Keyboard shortcuts for quick access</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Works on all websites</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Privacy-focused (no data collection)</span>
                </div>
              </div>

              {/* Download Button */}
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full gap-2 py-6 text-lg"
                size="lg"
              >
                <Download className="w-5 h-5" />
                {isDownloading ? "Opening Guide..." : "Get Extension"}
              </Button>

              {/* Installation Guide Button */}
              <Button
                variant="outline"
                onClick={openInstallationGuide}
                className="w-full gap-2"
              >
                <FileText className="w-4 h-4" />
                Installation Guide
                <ExternalLink className="w-4 h-4" />
              </Button>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-6 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4" />
                  <span>Fast</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4" />
                  <span>Reliable</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Showcase */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Why Choose Our Extension?</h3>

            <div className="space-y-4">
              <Card className="p-4 border-l-4 border-l-blue-500">
                <div className="flex items-start gap-3">
                  <Monitor className="w-6 h-6 text-blue-500 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">
                      Professional Screen Recording
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Record your screen in high quality with audio support.
                      Perfect for tutorials, presentations, and demonstrations.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-l-green-500">
                <div className="flex items-start gap-3">
                  <Camera className="w-6 h-6 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">
                      Smart Screenshot Capture
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Capture full pages or select specific areas with
                      precision. Multiple formats supported (PNG, JPEG, WebP).
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-l-purple-500">
                <div className="flex items-start gap-3">
                  <Zap className="w-6 h-6 text-purple-500 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Instant Access</h4>
                    <p className="text-sm text-muted-foreground">
                      Use keyboard shortcuts (Ctrl+Shift+R for recording,
                      Ctrl+Shift+C for screenshots) for lightning-fast access
                      from any website.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Installation Steps */}
            <Alert>
              <Chrome className="h-4 w-4" />
              <AlertDescription>
                <strong>Quick Installation:</strong> Download the extension, go
                to chrome://extensions/, enable Developer mode, and click "Load
                unpacked". Full guide included in download.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Browser Compatibility */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold mb-6">Browser Compatibility</h3>
          <div className="flex items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Chrome className="w-6 h-6" />
              <span>Chrome 88+</span>
            </div>
            <div className="flex items-center gap-2">
              <Chrome className="w-6 h-6" />
              <span>Edge 88+</span>
            </div>
            <div className="flex items-center gap-2">
              <Chrome className="w-6 h-6" />
              <span>Opera 74+</span>
            </div>
            <div className="flex items-center gap-2">
              <Chrome className="w-6 h-6" />
              <span>Brave 1.20+</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
