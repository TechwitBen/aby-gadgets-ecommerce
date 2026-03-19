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
import FeaturedProducts from "@/components/FeaturedProducts";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header  />
     
      <HeroSection />
      <ProductCategories />
       <FeaturedProducts/>
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
