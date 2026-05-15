import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import newsletterBg from "@/assets/newsletter-bg.jpg";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useInView } from "@/hooks/useInView";

const benefits5 = [
  "Every gadget inspected & verified before sale.",
  "Fair stress free device swaps.",
  "Reliable delivery for gifting orders.",
  "Customer first service with honesty and support.",
];

const WhyChooseUs = () => {
  const [email5, setEmail5] = useState("");
  const { ref: leftRef,  isInView: leftInView  } = useInView({ threshold: 0.1 });
  const { ref: rightRef, isInView: rightInView } = useInView({ threshold: 0.1 });

  return (
    <section className="py-10 sm:py-16 md:py-20" style={{ backgroundColor: "#F5F5F5" }}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch">

          {/* Why Choose */}
          <div
            ref={leftRef}
            className="bg-white border-2 border-primary rounded-2xl p-6 sm:p-8 md:p-10 flex flex-col justify-between
                       transition-all duration-700 ease-out"
            style={{
              opacity: leftInView ? 1 : 0,
              transform: leftInView ? "translateX(0)" : "translateX(-32px)",
            }}
          >
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-6 sm:mb-8">
                Why Choose Aby Gadgets?
              </h2>
              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {benefits5.map((benefit, i) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-3 transition-all duration-500 ease-out"
                    style={{
                      transitionDelay: `${leftInView ? i * 80 + 200 : 0}ms`,
                      opacity: leftInView ? 1 : 0,
                      transform: leftInView ? "translateX(0)" : "translateX(-12px)",
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm sm:text-base">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 sm:px-8 py-5 sm:py-6 rounded-full w-full sm:w-fit text-sm sm:text-base transition-transform duration-200 hover:scale-105 active:scale-95">
              SHOP NOW
            </Button>
          </div>

          {/* Newsletter */}
          <div
            ref={rightRef}
            className="rounded-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden flex flex-col justify-center min-h-[280px] sm:min-h-[320px]
                       transition-all duration-700 ease-out"
            style={{
              backgroundImage: `url(${newsletterBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: rightInView ? 1 : 0,
              transform: rightInView ? "translateX(0)" : "translateX(32px)",
            }}
          >
            <div className="absolute inset-0 bg-black/55" />
            <div className="relative z-10 text-white">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">
                Get 20% Off Your Next Delivery
              </h3>
              <p className="text-white/75 text-xs sm:text-sm mb-5 sm:mb-6 max-w-sm leading-relaxed">
                Subscribe for exclusive deals, gadget tips, and early access to new arrivals.
              </p>
              <div className="flex flex-col xs:flex-row gap-2.5 sm:gap-3">
                <Input
                  placeholder="you@example.com"
                  value={email5}
                  onChange={(e) => setEmail5(e.target.value)}
                  className="bg-white/90 text-foreground placeholder:text-muted-foreground border-0 h-11 sm:h-12 flex-1 rounded-xl text-sm"
                />
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-5 sm:px-6 h-11 sm:h-12 whitespace-nowrap text-xs sm:text-sm rounded-xl transition-transform duration-200 hover:scale-105 active:scale-95">
                  SUBSCRIBE & SAVE
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;