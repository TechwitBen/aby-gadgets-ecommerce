import { Button } from "@/components/ui/button";
import heroBackground from "@/assets/heroBackgroundimage-black22.png";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[600px] md:min-h-[700px] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      </div>

      {/* Main Content — pt-36/pt-44 clears the overlapping transparent header */}
      <div className="relative z-10 px-4 md:px-6 lg:px-8 pt-36 pb-24 md:pt-44 md:pb-32">
        <div className="max-w-2xl">
          <div className="text-white">
            {/* Eyebrow tag */}
            <span className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-white/15 border border-white/25 text-white/90">
              🇳🇬 Trusted across Nigeria
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Real Gadgets.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400">
                Smooth Delivery.
              </span>{" "}
              Zero Stress.
            </h1>

            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-lg leading-relaxed">
              Serving students, professionals, and gadget lovers who want
              authentic gadgets and stress-free delivery — right to your door.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => navigate("/products")}
                className="btn-teal px-8 py-6 text-base font-semibold rounded-xl shadow-lg hover:scale-105 transition-transform duration-200"
              >
                Shop Original Gadgets
              </Button>
              <Button
                onClick={() => navigate("/categories")}
                variant="ghost"
                className="px-8 py-6 text-base font-semibold rounded-xl border border-white/30 text-white hover:bg-white/10 hover:text-white transition-all duration-200"
              >
                Browse Categories
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm border-t border-white/10">
        <div className="w-full px-4 md:px-8 lg:px-12 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0 text-white text-sm">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-400/20 flex items-center justify-center text-teal-400 text-xs font-bold flex-shrink-0">
                ✓
              </span>
              <span className="text-white/80">
                <span className="font-semibold text-white">500+</span> gadgets delivered this year
              </span>
            </div>

            <div className="hidden md:block w-px h-6 bg-white/20" />

            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-400/20 flex items-center justify-center text-teal-400 text-xs font-bold flex-shrink-0">
                ✓
              </span>
              <span className="text-white/80">
                <span className="font-semibold text-white">99.9%</span> customer success rate
              </span>
            </div>

            <div className="hidden md:block w-px h-6 bg-white/20" />

            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-400/20 flex items-center justify-center text-teal-400 text-xs font-bold flex-shrink-0">
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