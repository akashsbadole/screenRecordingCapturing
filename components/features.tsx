"use client";

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { 
  Camera, 
  Video, 
  Printer, 
  Save, 
  Pencil, 
  Settings, 
  Share, 
  Keyboard 
} from 'lucide-react';

const features = [
  {
    title: "Screenshot Capture",
    description: "Capture any area of your screen with customizable selection tools.",
    icon: Camera,
  },
  {
    title: "Screen Recording",
    description: "Record your screen with audio for tutorials, presentations, and more.",
    icon: Video,
  },
  {
    title: "Print Screen",
    description: "Instantly capture and print your screen with just one click.",
    icon: Printer,
  },
  {
    title: "Media Library",
    description: "Access all your captures and recordings in one organized place.",
    icon: Save,
  },
  {
    title: "Annotation Tools",
    description: "Add text, highlights, arrows, and more to your screenshots.",
    icon: Pencil,
  },
  {
    title: "Custom Settings",
    description: "Configure quality, format, and capture options to fit your needs.",
    icon: Settings,
  },
  {
    title: "Share Options",
    description: "Instantly share your captures to cloud services or social media.",
    icon: Share,
  },
  {
    title: "Keyboard Shortcuts",
    description: "Work faster with customizable keyboard shortcuts for all functions.",
    icon: Keyboard,
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
    <section id="features" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tl from-primary/5 via-transparent to-secondary/5 -z-10" />
      
      <div className="container" ref={containerRef}>
        <motion.div 
          style={{ opacity, y }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-muted-foreground text-lg">
            Discover the comprehensive set of tools designed to make screen capture and recording effortless and efficient.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="group bg-card hover:bg-card/80 border rounded-xl p-6 transition-all duration-300 hover:shadow-md"
            >
              <div className="mb-4 p-3 rounded-lg bg-primary/10 text-primary w-fit">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}