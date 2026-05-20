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
    <div className="bg-light-bg dark:bg-dark-bg text-text-primary transition-colors">
      <Navbar />
      <main>
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
