"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X, Video } from "lucide-react";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-navy-900/90 backdrop-blur-md border-b border-purple-600/30"
          : "bg-navy-900/50 backdrop-blur-sm"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
              <Video className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">ScreenFlow</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm font-medium text-white transition-colors hover:text-purple-400"
            >
              Features
            </Link>
            <Link
              href="#tools"
              className="text-sm font-medium text-white transition-colors hover:text-purple-400"
            >
              Tools
            </Link>
            <Link
              href="#download"
              className="text-sm font-medium text-white transition-colors hover:text-purple-400"
            >
              Download
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button className="hidden md:inline-flex bg-purple-600 text-white border-2 border-purple-600 hover:bg-navy-900 hover:border-purple-600 hover:text-white transition-all duration-300">
            Get Started
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-purple-600/20"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-purple-600/30 bg-navy-900/95">
          <div className="container py-4 flex flex-col gap-4">
            <Link
              href="#features"
              className="text-sm font-medium py-2 text-white transition-colors hover:text-purple-400"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#tools"
              className="text-sm font-medium py-2 text-white transition-colors hover:text-purple-400"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Tools
            </Link>
            <Link
              href="#download"
              className="text-sm font-medium py-2 text-white transition-colors hover:text-purple-400"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Download
            </Link>
            <Button className="w-full mt-2 bg-purple-600 text-white border-2 border-purple-600 hover:bg-navy-900 hover:border-purple-600 hover:text-white transition-all duration-300">
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
