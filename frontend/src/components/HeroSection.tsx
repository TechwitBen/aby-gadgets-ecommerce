import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import trioPhones from "@/assets/GadgetPlugHero-removebg-preview.png"; // adjust extension if needed

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full px-3 sm:px-5 lg:px-6 pt-3 pb-4">
      <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-[#2d1278] via-[#3b1c9b] to-[#4a24b3] lg:min-h-[480px] xl:min-h-[520px]">
        {/* Ambient glows behind the phones */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-[4%] top-1/2 -z-10 hidden lg:block h-[85%] aspect-square -translate-y-1/2 rounded-full bg-[#7c4dff]/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-[6%] -z-10 hidden lg:block h-24 w-[46%] rounded-full bg-[#8b5cf6]/30 blur-2xl"
        />

        <div className="relative flex flex-col lg:min-h-[inherit] lg:justify-center">
          {/* ── Left content ───────────────────────────────── */}
          <div className="px-6 pt-10 pb-6 sm:px-10 sm:pt-14 lg:px-14 lg:py-16 lg:max-w-[56%]">
            <h1 className="font-bold tracking-tight leading-[1.05] text-white text-[32px] sm:text-5xl xl:text-[64px] animate-[fadeSlideUp_0.8s_ease-out_0.2s_both]">
              <span className="block">Everything tech.</span>
              <span className="block">one plug.</span>
            </h1>

            <p className="mt-5 sm:mt-6 max-w-md text-sm sm:text-lg leading-relaxed text-white/90 animate-[fadeSlideUp_0.8s_ease-out_0.4s_both]">
              Discover new and quality preowned phones, gadgets and accessories,
              carefully checked and backed with warranty.
            </p>

            <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row gap-3 animate-[fadeSlideUp_0.8s_ease-out_0.6s_both]">
              <Button
                onClick={() => navigate("/products")}
                className="h-12 rounded-full bg-white px-6 text-sm sm:text-[15px] font-semibold text-gray-900 hover:bg-white/90 hover:scale-[1.03] transition-all duration-200"
              >
                Shop Smartphones
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                onClick={() => navigate("/categories")}
                variant="ghost"
                className="h-12 rounded-full border border-white/40 px-6 text-sm sm:text-[15px] font-semibold text-white hover:bg-white/10 hover:text-white transition-all duration-200"
              >
                Explore Gadgets
              </Button>
            </div>

            <ul className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/70 animate-[fadeSlideUp_0.8s_ease-out_0.8s_both]">
              <li>Latest devices</li>
              <li aria-hidden>•</li>
              <li>Genuine products</li>
              <li aria-hidden>•</li>
              <li>Reliable service</li>
            </ul>
          </div>

          {/* ── Product image ──────────────────────────────── */}
          {/* The file has transparent padding, so the box is taller than the banner (105%+)
              and the extra transparent area is clipped. That makes the phones themselves large. */}
          <img
            src={trioPhones}
            alt="Three smartphones on display"
            draggable={false}
            className="relative mx-auto mb-6 w-full max-w-[460px] object-contain drop-shadow-2xl sm:max-w-[560px]
                       lg:pointer-events-none lg:absolute lg:right-[3%] lg:top-1/2 lg:mx-0 lg:mb-0 lg:h-[105%] lg:w-auto lg:max-w-[50%] lg:-translate-y-1/2
                       xl:h-[110%] xl:max-w-[54%]"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;