import Hero from "@/components/home/Hero";
import WhyHireko from "@/components/home/WhyHireko";
import ComparisonCategories from "@/components/home/ComparisonCategories";
import CompareCTA from "@/components/home/CompareCTA";
import ChatWidget from "@/components/compare/ChatWidget";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function ComparePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <ChatWidget />
        <WhyHireko />
        <ComparisonCategories />
        <CompareCTA />
      </main>
      <Footer />
    </div>
  );
}