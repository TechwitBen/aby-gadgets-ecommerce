import { Button } from "@/components/ui/button";
import service1 from "@/assets/service-authentic.jpg";
import service2 from "@/assets/service-sale.jpg";
import service3 from "@/assets/service-trade.jpg";
import service4 from "@/assets/service-repair.png";
import service5 from "@/assets/service-financing.png";
import service6 from "@/assets/service-delivery.png";
import service7 from "@/assets/service-consultation.png";
import { useInView } from "@/hooks/useInView";

const services3 = [
  { title: "Verified authentic products",              description: "Every gadget you buy from AbyGadgets is 100% genuine. We partner directly with trusted distributors, and each product comes with a unique verification tag to confirm authenticity.", image: service1, buttonText: "SHOP VERIFIED DEVICES", align: "left"  },
  { title: "Device Sale",                              description: "From smartphones to gaming consoles, we bring you top quality tech at unbeatable prices. Find the perfect device that matches your lifestyle and budget.",                            image: service2, buttonText: "SHOP NOW",              align: "right" },
  { title: "Trade-In & Upgrade Program",              description: "Upgrade smarter — not harder. Exchange your old device for new. Instant discounts. Get fair value for your trade and no hidden charges.",                                              image: service3, buttonText: "LEARN MORE",            align: "left"  },
  { title: "Device Repair & Maintenance",             description: "Cracked screen? Battery issues? Our certified technicians offer fast, reliable repairs using genuine parts, so your device runs like new again.",                                       image: service4, buttonText: "BOOK A REPAIR",         align: "right" },
  { title: "Gadget Financing & Installment Payments", description: "Own your dream gadget without breaking the bank. Pay in easy, flexible installments through our trusted partners.",                                                                    image: service5, buttonText: "CHECK INSTALLMENT",    align: "left"  },
  { title: "Delivery & Pickup Service",               description: "Get your order delivered anywhere in Nigeria or pick-up from any of our retail partner stores. Fast, safe, and cash every time.",                                                       image: service6, buttonText: "TRACK MY ORDER",       align: "right" },
  { title: "Tech Consultation & Recommendations",     description: "Not sure what to buy? Our experts will help you find the perfect device for your needs, budget, and style. Talk to us, we'll guide you.",                                              image: service7, buttonText: "CHAT WITH US NOW",     align: "left"  },
];

// Per-card hook wrapper
const ServiceCard = ({
  service,
  index,
}: {
  service: (typeof services3)[number];
  index: number;
}) => {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  const isRight = service.align === "right";

  return (
    <div
      ref={ref}
      className={`relative flex flex-col ${
        isRight ? "md:flex-row-reverse" : "md:flex-row"
      } items-stretch overflow-hidden rounded-2xl sm:rounded-3xl transition-all duration-700 ease-out`}
      style={{
        backgroundColor: "hsl(150 30% 92%)",
        opacity: isInView ? 1 : 0,
        transform: isInView
          ? "translateX(0)"
          : isRight
          ? "translateX(48px)"
          : "translateX(-48px)",
      }}
    >
      {/* Image */}
      <div className="w-full md:w-[45%] flex-shrink-0">
        <div
          className={`h-44 sm:h-56 md:h-72 overflow-hidden ${
            isRight
              ? "md:rounded-l-[60px] lg:rounded-l-[80px]"
              : "md:rounded-r-[60px] lg:rounded-r-[80px]"
          }`}
        >
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      </div>

      {/* Content */}
      <div className="w-full md:w-[55%] p-5 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-3">
          {service.title}
        </h3>
        <p className="text-muted-foreground mb-5 leading-relaxed text-sm md:text-base">
          {service.description}
        </p>
        <div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-white font-semibold px-5 sm:px-6 py-2 rounded-xl text-xs uppercase tracking-wide transition-transform duration-200 hover:scale-105 active:scale-95">
            {service.buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

const ServicesSection = () => {
  const { ref: titleRef, isInView: titleInView } = useInView();

  return (
    <section className="mb-16 sm:mb-20 md:mb-[100px] bg-background">
      <div className="container mx-auto px-4 sm:px-6">

        <h2
          ref={titleRef}
          className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-8 sm:mb-12 transition-all duration-700 ease-out"
          style={{
            opacity: titleInView ? 1 : 0,
            transform: titleInView ? "translateY(0)" : "translateY(16px)",
          }}
        >
          Services We Offer
        </h2>

        <div className="space-y-4 sm:space-y-8">
          {services3.map((service, index) => (
            <ServiceCard key={service.title} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;