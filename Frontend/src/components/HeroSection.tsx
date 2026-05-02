import { Button } from "@/components/ui/button";
import heroBackground from "@/assets/heroBackgroundimage-black22.png";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full min-h-[580px] sm:min-h-[640px] md:min-h-[700px] lg:min-h-[760px] overflow-hidden">

      {/* ── Background Image ─────────────────────────────────────────── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      </div>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <div className="relative z-10 h-full px-4 sm:px-6 md:px-8 lg:px-12
                      pt-28 pb-28
                      sm:pt-32 sm:pb-28
                      md:pt-40 md:pb-32
                      lg:pt-48 lg:pb-36">

        <div className="max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl">
          <div className="text-white">

            {/* Heading */}
            <h1 className="font-bold leading-tight mb-4 sm:mb-5 md:mb-6
                           text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
              Real Gadgets. Smooth Delivery. Zero Stress.
            </h1>

            {/* Sub-text */}
            <p className="opacity-90 mb-7 sm:mb-8 md:mb-10
                          text-base sm:text-lg md:text-xl
                          max-w-xs sm:max-w-sm md:max-w-lg
                          leading-relaxed">
              Serving students, professionals, and gadget lovers who want
              authentic gadgets and stress-free delivery — right to your door.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-row flex-wrap gap-3">
              <Button
                onClick={() => navigate("/products")}
                className="btn-teal px-6 sm:px-8 py-5 sm:py-6
                           text-sm sm:text-base font-semibold rounded-xl
                           shadow-lg hover:scale-105 transition-transform duration-200"
              >
                Shop Original Gadgets
              </Button>

              <Button
                onClick={() => navigate("/categories")}
                variant="ghost"
                className="px-6 sm:px-8 py-5 sm:py-6
                           text-sm sm:text-base font-semibold rounded-xl
                           border border-white/30 text-white
                           hover:bg-white/10 hover:text-white
                           transition-all duration-200"
              >
                Browse Categories
              </Button>
            </div>

          </div>
        </div>
      </div>

      {/* ── Bottom Stats Bar ─────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0
                      bg-black/60 backdrop-blur-sm border-t border-white/10">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center
                          gap-2 sm:gap-0 text-white text-xs sm:text-sm">

            <div className="flex items-center gap-2">
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-teal-400/20
                               flex items-center justify-center
                               text-teal-400 text-[10px] sm:text-xs font-bold flex-shrink-0">
                ✓
              </span>
              <span className="text-white/80">
                <span className="font-semibold text-white">500+</span> gadgets delivered this year
              </span>
            </div>

            <div className="hidden sm:block w-px h-5 bg-white/20" />

            <div className="flex items-center gap-2">
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-teal-400/20
                               flex items-center justify-center
                               text-teal-400 text-[10px] sm:text-xs font-bold flex-shrink-0">
                ✓
              </span>
              <span className="text-white/80">
                <span className="font-semibold text-white">99.9%</span> customer success rate
              </span>
            </div>

            <div className="hidden sm:block w-px h-5 bg-white/20" />

            <div className="flex items-center gap-2">
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-teal-400/20
                               flex items-center justify-center
                               text-teal-400 text-[10px] sm:text-xs font-bold flex-shrink-0">
                ✓
              </span>
              <span className="text-white/80">
                Serving customers{" "}
                <span className="font-semibold text-white">across Nigeria</span>
              </span>
            </div>

          </div>
        </div>
      </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
    </section>
  );
};

export default HeroSection;