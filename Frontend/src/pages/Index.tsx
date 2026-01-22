import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ProductCategories from "@/components/ProductCategories";
import ServicesSection from "@/components/ServiceSection";
import GadgetGuide from "@/components/GadgetGuide";
import Testimonials from "@/components/Testimonials";
import WhyChooseUs from "@/components/WhyChooseUs";
import FAQ from "@/components/FAQ";
import TrustBadges from "@/components/TrustBadges";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header isLoggedIn={true} />
      <HeroSection />
      <ProductCategories />
      <ServicesSection />
      <GadgetGuide />
      <Testimonials />
      <WhyChooseUs />
      <FAQ />
      <TrustBadges />
      <Footer />
    </div>
  );
};

export default Index;
