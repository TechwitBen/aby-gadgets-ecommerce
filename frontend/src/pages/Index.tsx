import HeroSection from "@/components/HeroSection";
import ProductCategories from "@/components/ProductCategories";
import PromoBanners from "@/components/PromoBanners";
import PromoCarousel from "@/components/PromoCarousel";
import FeaturedProducts from "@/components/FeaturedProducts";
import SweetDeals from "@/components/SweetDeals";
import DealsSection from "@/components/DealsSection";
import ServicesSection from "@/components/ServiceSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import Testimonials from "@/components/Testimonials";

// Header, TrustBadges and Footer are provided by PublicLayout — do not import here.
const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <ProductCategories />
      <PromoBanners />
      
      <FeaturedProducts />
      <PromoCarousel />
      <SweetDeals />
     
      {/* <ServicesSection /> */}
      <WhyChooseUs />
       <DealsSection />
      <Testimonials />
    </div>
  );
};

export default Index;