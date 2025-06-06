import { ModernHeader } from "@/components/modern-header";
import { ModernHero } from "@/components/modern-hero";
import { ToolsSection } from "@/components/tools-section";
import { SimpleFeaturesShowcase } from "@/components/simple-features-showcase";
import { ChromeExtensionDownload } from "@/components/chrome-extension-download";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <ModernHeader />
      <main className="relative">
        <ModernHero />
        <ToolsSection />
        <SimpleFeaturesShowcase />
        <ChromeExtensionDownload />
        <Features />
        <Footer />
      </main>
    </div>
  );
}
