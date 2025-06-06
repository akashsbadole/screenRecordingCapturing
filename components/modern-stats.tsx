"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Download, 
  Star, 
  Zap,
  Globe,
  Shield,
  Clock,
  TrendingUp
} from "lucide-react";

export function ModernStats() {
  const stats = [
    {
      icon: Users,
      value: "50K+",
      label: "Active Users",
      description: "Professionals using our tools daily",
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      trend: "+25%"
    },
    {
      icon: Download,
      value: "100K+",
      label: "Downloads",
      description: "Chrome extension installations",
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
      trend: "+40%"
    },
    {
      icon: Star,
      value: "4.9/5",
      label: "User Rating",
      description: "Average rating from reviews",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "from-yellow-50 to-yellow-100",
      trend: "★★★★★"
    },
    {
      icon: Zap,
      value: "99.9%",
      label: "Uptime",
      description: "Reliable service availability",
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
      trend: "24/7"
    }
  ];

  const features = [
    {
      icon: Globe,
      title: "Global Reach",
      description: "Used in 150+ countries worldwide",
      badge: "Worldwide"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data stays on your device",
      badge: "Secure"
    },
    {
      icon: Clock,
      title: "Instant Setup",
      description: "Start recording in under 30 seconds",
      badge: "Fast"
    },
    {
      icon: TrendingUp,
      title: "Growing Fast",
      description: "Join thousands of new users monthly",
      badge: "Popular"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge 
            variant="outline" 
            className="mb-4 px-4 py-2 bg-white/50 backdrop-blur-sm border-blue-200 text-blue-700"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Trusted by Professionals
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Numbers That Matter
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Join thousands of professionals who trust our platform for their screen recording and capture needs.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="relative overflow-hidden bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:scale-105">
                <CardContent className="p-8 text-center">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  {/* Icon */}
                  <div className={`relative z-10 bg-gradient-to-br ${stat.color} p-4 rounded-2xl w-fit mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Value */}
                  <div className="relative z-10 text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">
                    {stat.value}
                  </div>
                  
                  {/* Label */}
                  <div className="relative z-10 text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {stat.label}
                  </div>
                  
                  {/* Description */}
                  <div className="relative z-10 text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {stat.description}
                  </div>
                  
                  {/* Trend */}
                  <Badge 
                    variant="outline" 
                    className="relative z-10 bg-white/80 backdrop-blur-sm border-slate-200 text-slate-700"
                  >
                    {stat.trend}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-start gap-4 p-6 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-200 group"
            >
              <div className="flex-shrink-0 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform">
                <feature.icon className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <Badge 
                    variant="outline" 
                    className="text-xs px-2 py-0.5 bg-blue-50 border-blue-200 text-blue-700"
                  >
                    {feature.badge}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ready to Join Our Community?
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto">
              Start recording professional-quality content today. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Start Recording Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white border-2 border-blue-200 text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => window.open('/chrome-extension-guide.html', '_blank')}
              >
                Get Chrome Extension
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
