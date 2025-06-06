"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote, Users, Briefcase, GraduationCap, Code } from "lucide-react";

export function ModernTestimonials() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      company: "TechCorp",
      avatar: "/api/placeholder/64/64",
      rating: 5,
      content: "This tool has revolutionized how we create product demos. The annotation features are incredibly intuitive and the recording quality is professional-grade.",
      category: "Product",
      icon: Briefcase,
      color: "from-blue-500 to-blue-600"
    },
    {
      name: "Marcus Rodriguez",
      role: "UX Designer",
      company: "DesignStudio",
      avatar: "/api/placeholder/64/64",
      rating: 5,
      content: "Perfect for creating user journey recordings and design presentations. The smart selection feature (coming soon) sounds amazing!",
      category: "Design",
      icon: Users,
      color: "from-purple-500 to-purple-600"
    },
    {
      name: "Dr. Emily Watson",
      role: "Professor",
      company: "Stanford University",
      avatar: "/api/placeholder/64/64",
      rating: 5,
      content: "Excellent for creating educational content. My students love the clear recordings and the ability to highlight important areas during lectures.",
      category: "Education",
      icon: GraduationCap,
      color: "from-green-500 to-green-600"
    },
    {
      name: "Alex Thompson",
      role: "Software Engineer",
      company: "DevCorp",
      avatar: "/api/placeholder/64/64",
      rating: 5,
      content: "As a developer, I need reliable screen recording for bug reports and code reviews. This tool delivers exactly what I need with zero hassle.",
      category: "Development",
      icon: Code,
      color: "from-orange-500 to-orange-600"
    },
    {
      name: "Lisa Park",
      role: "Marketing Director",
      company: "GrowthCo",
      avatar: "/api/placeholder/64/64",
      rating: 5,
      content: "The Chrome extension is a game-changer for creating quick marketing demos. Professional results in minutes, not hours.",
      category: "Marketing",
      icon: Users,
      color: "from-pink-500 to-pink-600"
    },
    {
      name: "James Wilson",
      role: "Training Manager",
      company: "LearnTech",
      avatar: "/api/placeholder/64/64",
      rating: 5,
      content: "We've replaced our expensive screen recording software with this tool. Better features, easier to use, and much more affordable.",
      category: "Training",
      icon: GraduationCap,
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  const stats = [
    { value: "4.9/5", label: "Average Rating" },
    { value: "500+", label: "Reviews" },
    { value: "50K+", label: "Happy Users" },
    { value: "99%", label: "Would Recommend" }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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
            <Star className="h-4 w-4 mr-2 fill-current" />
            Loved by Professionals
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            What Our Users Say
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Trusted by professionals across industries for creating high-quality screen recordings and captures.
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                {stat.value}
              </div>
              <div className="text-slate-600 dark:text-slate-300 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:scale-105 relative overflow-hidden">
                <CardContent className="p-8">
                  {/* Quote Icon */}
                  <div className="absolute top-4 right-4 opacity-10">
                    <Quote className="h-12 w-12 text-slate-400" />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  {/* Content */}
                  <blockquote className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6 relative z-10">
                    "{testimonial.content}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {testimonial.role}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-500">
                        {testimonial.company}
                      </div>
                    </div>
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${testimonial.color} shadow-lg`}>
                      <testimonial.icon className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  {/* Category Badge */}
                  <Badge 
                    variant="outline" 
                    className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm border-slate-200 text-slate-700"
                  >
                    {testimonial.category}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Join Thousands of Satisfied Users
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto">
              Experience the difference professional screen recording tools can make for your workflow.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Try It Free Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white border-2 border-blue-200 text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => window.open('/chrome-extension-guide.html', '_blank')}
              >
                Get Extension
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
