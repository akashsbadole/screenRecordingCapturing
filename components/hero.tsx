"use client";

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Camera, Monitor, Printer } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 -z-10" />
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 bg-grid-pattern -z-10" />
      
      <div className="container relative">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="space-y-2 mb-6"
          >
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary inline-block mb-2">
              Capture, Record, Print
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Capture Your Screen <br className="hidden md:block" />
              <span className="text-primary">With Precision</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mb-8"
          >
            A professional screen capture and recording tool with intuitive controls and powerful features to enhance your workflow.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button size="lg" className="gap-2 group">
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center gap-8 mt-16 text-muted-foreground"
          >
            <div className="flex flex-col items-center gap-2">
              <Camera className="h-8 w-8" />
              <span className="text-sm">Screenshot</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Monitor className="h-8 w-8" />
              <span className="text-sm">Screen Recording</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Printer className="h-8 w-8" />
              <span className="text-sm">Print Screen</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Hero image/demo */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="container mt-16"
      >
        <div className="relative mx-auto max-w-4xl rounded-xl overflow-hidden border shadow-xl">
          <div className="aspect-video bg-card p-2">
            <div className="w-full h-full rounded-lg bg-muted flex items-center justify-center">
              <div className="text-muted-foreground">App Preview</div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}