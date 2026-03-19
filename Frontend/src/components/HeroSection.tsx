import { Button } from "@/components/ui/button";
import heroBackground from "@/assets/hero-background.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[600px] md:min-h-[700px] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 md:px-6 lg:px-8 py-24 md:py-32">
        <div className="max-w-2xl">
          {/* Left Content - Adjusted for closer edge alignment */}
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Real Gadgets. Smooth Delivery. Zero Stress.
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 max-w-lg">
              Serving students, professionals, and gadget lovers who want authentic gadgets and stress-free delivery
            </p>
            <Button className="btn-teal px-8 py-6 text-base font-semibold rounded-lg">
              SHOP ORIGINAL GADGETS
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Stats Bar - Full width with justify between */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/70">
        <div className="w-full px-4 md:px-8 lg:px-12 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 md:gap-0 text-white text-sm">
            <div className="flex items-center justify-center md:justify-start gap-2 w-full md:w-auto">
              <span className="text-accent">✓</span>
              <span>500+ gadgets delivered this year</span>
            </div>
            <div className="flex items-center justify-center md:justify-center gap-2 w-full md:w-auto">
              <span className="text-accent">✓</span>
              <span>99.9% success rate</span>
            </div>
            <div className="flex items-center justify-center md:justify-end gap-2 w-full md:w-auto">
              <span className="text-accent">✓</span>
              <span>Serving customers across Nigeria</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;