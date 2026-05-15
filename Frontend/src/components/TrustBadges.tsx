import { ShieldCheck, Truck, Clock } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const badges6 = [
  { icon: ShieldCheck, title: "Guaranteed Originality", desc: "Every device verified before sale." },
  { icon: Truck,       title: "Secure Delivery",        desc: "Safe & tracked nationwide delivery." },
  { icon: Clock,       title: "Inspect Before You Buy", desc: "See it, test it, then pay." },
];

const TrustBadges = () => {
  const { ref, isInView } = useInView();

  return (
    <section className="py-8 sm:py-12" style={{ background: "hsl(200 60% 95%)" }}>
      <div className="container mx-auto px-4 sm:px-6">
        <div ref={ref} className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {badges6.map((badge, i) => (
            <div
              key={badge.title}
              className="flex flex-col items-center gap-3 text-center transition-all duration-700 ease-out"
              style={{
                transitionDelay: `${i * 120}ms`,
                opacity: isInView ? 1 : 0,
                transform: isInView ? "translateY(0)" : "translateY(24px)",
              }}
            >
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-primary/10 rounded-full flex items-center justify-center
                           transition-transform duration-300 hover:scale-110"
              >
                <badge.icon className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-xs sm:text-sm md:text-base leading-tight">{badge.title}</h4>
                <p className="text-muted-foreground text-xs mt-0.5 hidden sm:block">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;