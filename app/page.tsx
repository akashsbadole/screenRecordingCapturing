import { ModernHero } from "@/components/modern-hero";
import { ToolsSection } from "@/components/tools-section";
import { ChromeExtensionDownload } from "@/components/chrome-extension-download";
import { Features } from "@/components/features";
import { SimpleFeaturesShowcase } from "@/components/simple-features-showcase";
import { ModernStats } from "@/components/modern-stats";
import { ModernTestimonials } from "@/components/modern-testimonials";
import { ModernFooter } from "@/components/modern-footer";
import { ModernHeader } from "@/components/modern-header";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <ModernHeader />
      <main className="relative">
        <ModernHero />
        <ToolsSection />
        <SimpleFeaturesShowcase />
        <ModernStats />
        <ModernTestimonials />
        <ChromeExtensionDownload />
        <Features />
        <ModernFooter />
      </main>
    </div>
  );
}
