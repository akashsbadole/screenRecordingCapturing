"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Monitor, 
  Camera, 
  Square, 
  Window as WindowIcon,
  Pen,
  Highlighter,
  Type,
  Eraser,
  Undo,
  Redo,
  Palette,
  Star,
  Heart,
  Triangle,
  ArrowRight,
  Crop,
  RotateCcw,
  Blur,
  Droplets,
  Timer,
  Mic,
  MicOff,
  MousePointer,
  Zap,
  Eye,
  Volume2,
  Settings,
  Download,
  Save,
  Layers,
  Target,
  Sparkles
} from "lucide-react";

export function AdvancedFeaturesShowcase() {
  const captureFeatures = [
    {
      category: "Screen Capture",
      icon: Monitor,
      color: "from-blue-500 to-blue-600",
      features: [
        { icon: Monitor, name: "Fullscreen Capture", description: "Capture entire screen in high quality" },
        { icon: Square, name: "Region Capture", description: "Select custom areas with precision" },
        { icon: WindowIcon, name: "Window Capture", description: "Capture specific application windows" },
        { icon: Target, name: "Smart Element Detection", description: "AI-powered element selection", badge: "Coming Soon" }
      ]
    },
    {
      category: "Recording Features",
      icon: Camera,
      color: "from-red-500 to-red-600",
      features: [
        { icon: Monitor, name: "Fullscreen Recording", description: "Record entire screen with audio" },
        { icon: Square, name: "Region Recording", description: "Record selected areas only" },
        { icon: WindowIcon, name: "Window Recording", description: "Record specific application windows" },
        { icon: Timer, name: "Recording Timer", description: "Set automated recording duration" },
        { icon: Volume2, name: "Audio Options", description: "System audio, microphone, or both" },
        { icon: MousePointer, name: "Cursor Highlighting", description: "Highlight mouse cursor in recordings" }
      ]
    }
  ];

  const annotationFeatures = [
    {
      category: "Drawing Tools",
      icon: Pen,
      color: "from-green-500 to-green-600",
      features: [
        { icon: Pen, name: "Pen Tool", description: "Freehand drawing with customizable size" },
        { icon: Highlighter, name: "Highlighter", description: "Highlight important areas" },
        { icon: Square, name: "Shapes", description: "Rectangles, circles, triangles" },
        { icon: ArrowRight, name: "Arrows", description: "Point to specific elements" },
        { icon: Type, name: "Text Annotations", description: "Add text notes and comments" },
        { icon: Eraser, name: "Eraser Tool", description: "Remove unwanted annotations" }
      ]
    },
    {
      category: "Advanced Annotations",
      icon: Palette,
      color: "from-purple-500 to-purple-600",
      features: [
        { icon: Palette, name: "Color Picker", description: "18 preset colors + custom picker" },
        { icon: Star, name: "Stamps", description: "Pre-made stamps and symbols" },
        { icon: Blur, name: "Blur Tool", description: "Blur sensitive information" },
        { icon: Droplets, name: "Watermarking", description: "Add custom watermarks" },
        { icon: Undo, name: "Undo/Redo", description: "Full history with keyboard shortcuts" },
        { icon: Layers, name: "Layer Support", description: "Multiple annotation layers" }
      ]
    }
  ];

  const advancedFeatures = [
    {
      category: "Professional Tools",
      icon: Settings,
      color: "from-indigo-500 to-indigo-600",
      features: [
        { icon: Crop, name: "Crop & Resize", description: "Professional image editing" },
        { icon: RotateCcw, name: "Rotate & Flip", description: "Transform captured content" },
        { icon: Eye, name: "Privacy Mode", description: "Auto-blur sensitive content" },
        { icon: Zap, name: "Batch Processing", description: "Process multiple captures" },
        { icon: Download, name: "Multiple Formats", description: "PNG, JPEG, WebP, GIF support" },
        { icon: Save, name: "Cloud Sync", description: "Save to cloud storage", badge: "Pro" }
      ]
    },
    {
      category: "Smart Features",
      icon: Sparkles,
      color: "from-yellow-500 to-orange-500",
      features: [
        { icon: Target, name: "Smart Selection", description: "AI-powered element detection", badge: "Coming Soon" },
        { icon: Zap, name: "Auto-enhance", description: "Automatic quality improvements" },
        { icon: Eye, name: "OCR Text Recognition", description: "Extract text from images", badge: "Pro" },
        { icon: Layers, name: "Template Library", description: "Pre-designed annotation templates" },
        { icon: MousePointer, name: "Gesture Recognition", description: "Control with hand gestures", badge: "Beta" },
        { icon: Mic, name: "Voice Commands", description: "Voice-controlled annotations", badge: "Beta" }
      ]
    }
  ];

  const allFeatures = [...captureFeatures, ...annotationFeatures, ...advancedFeatures];

  return (
    <section className="py-24 bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Complete Feature Suite
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Professional-grade screen capture, recording, and annotation tools with advanced AI-powered features.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {allFeatures.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-8">
                  {/* Category Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${category.color} shadow-lg`}>
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {category.category}
                    </h3>
                  </div>

                  {/* Features List */}
                  <div className="space-y-4">
                    {category.features.map((feature, featureIndex) => (
                      <motion.div
                        key={feature.name}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: (categoryIndex * 0.1) + (featureIndex * 0.05) }}
                        viewport={{ once: true }}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex-shrink-0 p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                          <feature.icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900 dark:text-white">
                              {feature.name}
                            </h4>
                            {feature.badge && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs px-2 py-0.5 ${
                                  feature.badge === 'Coming Soon' 
                                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700' 
                                    : feature.badge === 'Pro'
                                    ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
                                    : 'border-green-200 bg-green-50 text-green-700'
                                }`}
                              >
                                {feature.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Feature Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">25+</div>
            <div className="text-slate-600 dark:text-slate-300">Capture Features</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">15+</div>
            <div className="text-slate-600 dark:text-slate-300">Annotation Tools</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">10+</div>
            <div className="text-slate-600 dark:text-slate-300">Export Formats</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">5+</div>
            <div className="text-slate-600 dark:text-slate-300">AI Features</div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ready to Experience Professional Screen Capture?
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto">
              Get started with our comprehensive suite of tools. No installation required - works directly in your browser with our Chrome extension.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Try Web App Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white border-2 border-blue-200 text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => window.open('/chrome-extension-guide.html', '_blank')}
              >
                Download Extension
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
