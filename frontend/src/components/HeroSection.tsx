import { Button } from "@/components/ui/button";
import heroPhoneImage from "@/assets/TrioPhones-removebg.png";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Truck, Lock } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full overflow-hidden bg-secondary">
      <div
        className="container mx-auto px-5 sm:px-6 md:px-8 lg:px-12
                   grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-8
                   pt-14 pb-14 sm:pt-16 sm:pb-16 md:pt-20 md:pb-20 lg:pt-24 lg:pb-24
                   min-h-[560px] sm:min-h-[620px] md:min-h-[680px]"
      >
        {/* ── Left — Copy ───────────────────────────────────────────── */}
        <div className="order-2 lg:order-1 animate-[fadeSlideUp_0.8s_ease-out_0.1s_both]">
          <h1
            className="font-bold leading-[1.08] mb-4 sm:mb-5 md:mb-6
                       text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem]
                       text-foreground"
          >
            Real Gadgets. Smooth Delivery. Zero Stress.
          </h1>

          <p
            className="text-muted-foreground mb-8 sm:mb-9 md:mb-10
                       text-base sm:text-lg md:text-xl
                       max-w-md md:max-w-lg leading-relaxed"
          >
            Serving students, professionals, and gadget lovers who want
            authentic gadgets and stress-free delivery — right to your door.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-8 sm:mb-10">
            <Button
              onClick={() => navigate("/products")}
              className="w-full sm:w-auto px-7 py-6
                         text-sm sm:text-base font-semibold rounded-xl
                         bg-primary hover:bg-primary-hover text-primary-foreground
                         shadow-sm transition-colors duration-200"
            >
              Shop Original Gadgets
            </Button>

            <Button
              onClick={() => navigate("/categories")}
              variant="ghost"
              className="w-full sm:w-auto px-7 py-6
                         text-sm sm:text-base font-semibold rounded-xl
                         border border-border text-foreground bg-background
                         hover:bg-secondary hover:text-foreground
                         transition-colors duration-200"
            >
              Browse Categories
            </Button>
          </div>

          {/* ── Trust row ───────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-6 text-sm">
            <div className="flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-4 w-4 text-success flex-shrink-0" />
              <span>
                <span className="font-semibold">500+</span>{" "}
                <span className="text-muted-foreground">gadgets delivered this year</span>
              </span>
            </div>

            <div className="hidden sm:block w-px h-4 bg-border self-center" />

            <div className="flex items-center gap-2 text-foreground">
              <Truck className="h-4 w-4 text-success flex-shrink-0" />
              <span>
                <span className="font-semibold">99.9%</span>{" "}
                <span className="text-muted-foreground">customer success rate</span>
              </span>
            </div>

            <div className="hidden sm:block w-px h-4 bg-border self-center" />

            <div className="flex items-center gap-2 text-foreground">
              <Lock className="h-4 w-4 text-success flex-shrink-0" />
              <span className="text-muted-foreground">
                Serving customers{" "}
                <span className="font-semibold text-foreground">across Nigeria</span>
              </span>
            </div>
          </div>
        </div>

        {/* ── Right — Product image ─────────────────────────────────── */}
        <div className="order-1 lg:order-2 relative flex items-center justify-center animate-[fadeSlideUp_0.8s_ease-out_0.3s_both]">
          {/* Decorative blob behind the product */}
          <div
            aria-hidden="true"
            className="absolute w-[70%] aspect-square rounded-full bg-primary/10 blur-3xl"
          />
          <img
            src={heroPhoneImage}
            alt="Latest smartphone available on GadgetPlug"
            className="relative z-10 w-[65%] sm:w-[55%] lg:w-[62%] max-w-sm
                       drop-shadow-2xl select-none pointer-events-none"
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;