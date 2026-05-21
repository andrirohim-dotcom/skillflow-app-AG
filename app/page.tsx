import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import TensionSection from "@/components/landing/TensionSection";
import ProductShowcase from "@/components/landing/ProductShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import FeatureOutcomes from "@/components/landing/FeatureOutcomes";
import ProofStats from "@/components/landing/ProofStats";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="bg-[#09080d] text-text min-h-screen relative overflow-hidden">
      {/* Dynamic ambient glowing spots */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <TensionSection />
        <ProductShowcase />
        <HowItWorks />
        <FeatureOutcomes />
        <ProofStats />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
