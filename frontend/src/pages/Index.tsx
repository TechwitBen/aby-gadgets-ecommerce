import HeroSection from "@/components/HeroSection";
import ProductCategories from "@/components/ProductCategories";
import ServicesSection from "@/components/ServiceSection";
import GadgetGuide from "@/components/GadgetGuide";
import Testimonials from "@/components/Testimonials";
import WhyChooseUs from "@/components/WhyChooseUs";
import FAQ from "@/components/FAQ";
import FeaturedProducts from "@/components/FeaturedProducts";

// Header, TrustBadges and Footer are provided by PublicLayout — do not import here.
const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Negative margin pulls hero up under the sticky header (h-14 = 56px / sm:h-16 = 64px) */}
      <div className="-mt-14 sm:-mt-16">
        <HeroSection />
      </div>
      <ProductCategories />
      <FeaturedProducts />
      <ServicesSection />
      {/* <GadgetGuide />
      <Testimonials />
      <WhyChooseUs />
      <FAQ /> */}
    </div>
  );
};

export default Index;

