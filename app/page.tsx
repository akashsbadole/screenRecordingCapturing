import { Hero } from '@/components/hero';
import { ToolsSection } from '@/components/tools-section';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <ToolsSection />
      </main>
      <Footer />
    </div>
  );
}