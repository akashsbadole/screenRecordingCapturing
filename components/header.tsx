"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Menu, X } from 'lucide-react';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      isScrolled ? 'bg-background/80 backdrop-blur-md border-b' : 'bg-transparent'
    }`}>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl">ScreenFlow</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium transition-colors hover:text-primary">
              Features
            </Link>
            <Link href="#tools" className="text-sm font-medium transition-colors hover:text-primary">
              Tools
            </Link>
            <Link href="#download" className="text-sm font-medium transition-colors hover:text-primary">
              Download
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button className="hidden md:inline-flex">Get Started</Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 flex flex-col gap-4">
            <Link 
              href="#features" 
              className="text-sm font-medium py-2 transition-colors hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="#tools" 
              className="text-sm font-medium py-2 transition-colors hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Tools
            </Link>
            <Link 
              href="#download" 
              className="text-sm font-medium py-2 transition-colors hover:text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Download
            </Link>
            <Button className="w-full mt-2">Get Started</Button>
          </div>
        </div>
      )}
    </header>
  );
}