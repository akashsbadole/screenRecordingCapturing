"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Camera,
  Video,
  Printer,
  Save,
  Pencil,
  Settings,
  Share,
  Keyboard,
} from "lucide-react";

const features = [
  {
    title: "Video Conferencing",
    description:
      "Host or join video meetings with multiple participants, just like Zoom or Google Meet.",
    icon: Video,
  },
  {
    title: "Screen Sharing",
    description:
      "Share your screen during video calls with crystal clear quality.",
    icon: Share,
  },
  {
    title: "Screenshot Capture",
    description:
      "Capture any area of your screen with customizable selection tools.",
    icon: Camera,
  },
  {
    title: "Screen Recording",
    description:
      "Record your screen with audio for tutorials, presentations, and more.",
    icon: Video,
  },
  {
    title: "Print Screen",
    description: "Instantly capture and print your screen with just one click.",
    icon: Printer,
  },
  {
    title: "Media Library",
    description:
      "Access all your captures and recordings in one organized place.",
    icon: Save,
  },
  {
    title: "Annotation Tools",
    description: "Add text, highlights, arrows, and more to your screenshots.",
    icon: Pencil,
  },
  {
    title: "Custom Settings",
    description:
      "Configure quality, format, and capture options to fit your needs.",
    icon: Settings,
  },
];

export function Features() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [60, 0, 0, 60]);

  return (
    <section
      id="features"
      className="py-24 relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
    >
      <div className="absolute inset-0 bg-gradient-to-tl from-blue-50/50 via-transparent to-purple-50/50 -z-10" />

      <div
        className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        ref={containerRef}
      >
        <motion.div
          style={{ opacity, y }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed">
            Discover the comprehensive set of tools designed to make screen
            capture and recording effortless and efficient.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="group bg-white/70 backdrop-blur-sm hover:bg-white/90 border-0 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white w-fit shadow-lg group-hover:scale-110 transition-transform">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
