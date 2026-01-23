import { Button } from "@/components/ui/button";
import service1 from "@/assets/service-authentic.jpg";
import service2 from "@/assets/service-sale.jpg";
import service3 from "@/assets/service-trade.jpg";
import service4 from "@/assets/service-repair.jpg";
import service5 from "@/assets/service-financing.jpg";
import service6 from "@/assets/service-delivery.jpg";
import service7 from "@/assets/service-consultation.jpg";

const services = [
  {
    title: "Verified authentic products",
    description: "Every gadget you buy from AbyGadgets is 100% genuine. We partner directly with trusted distributors, and each product comes with a unique verification tag to confirm authenticity.",
    image: service1,
    buttonText: "SHOP VERIFIED DEVICES",
    align: "left"
  },
  {
    title: "Device Sale",
    description: "From smartphones to gaming consoles, we bring you top quality tech at unbeatable prices. Find the perfect device that matches your lifestyle and budget.",
    image: service2,
    buttonText: "SHOP NOW",
    align: "right"
  },
  {
    title: "Trade-In & Upgrade Program",
    description: "Upgrade smarter — not harder. Exchange your old device for new. Instant discounts. Get fair value for your trade and no hidden charges.",
    image: service3,
    buttonText: "LEARN MORE",
    align: "left"
  },
  {
    title: "Device Repair & Maintenance",
    description: "Cracked screen? Battery issues? Our certified technicians offer fast, reliable repairs using genuine parts, so your device runs like new again.",
    image: service4,
    buttonText: "BOOK A REPAIR",
    align: "right"
  },
  {
    title: "Gadget Financing & Installment Payments",
    description: "Own your dream gadget without breaking the bank. Pay in easy, flexible installments through our trusted partners.",
    image: service5,
    buttonText: "CHECK INSTALLMENT",
    align: "left"
  },
  {
    title: "Delivery & Pickup Service",
    description: "Get your order delivered anywhere in Nigeria or pick-up from any of our retail partner stores. Fast, safe, and cash every time.",
    image: service6,
    buttonText: "TRACK MY ORDER",
    align: "right"
  },
  {
    title: "Tech Consultation & Recommendations",
    description: "Not sure what to buy? Our experts will help you find the perfect device for your needs, budget, and style. Talk to us, we'll guide you.",
    image: service7,
    buttonText: "CHAT WITH US NOW",
    align: "left"
  },
];

const ServicesSection = () => {
  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-12">Services We Offer</h2>

        <div className="space-y-8">
          {services.map((service, index) => (
            <div 
              key={service.title}
              className={`relative flex flex-col ${service.align === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'} items-stretch overflow-hidden rounded-3xl bg-gradient-to-br from-purple-100/80 via-violet-50/60 to-indigo-100/40`}
            >
              {/* Image */}
              <div className="w-full md:w-[45%] relative">
                <div className={`h-56 md:h-72 overflow-hidden ${service.align === 'right' ? 'md:rounded-l-[80px]' : 'md:rounded-r-[80px]'}`}>
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="w-full md:w-[55%] p-8 md:p-12 flex flex-col justify-center">
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">
                  {service.title}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed text-sm md:text-base">
                  {service.description}
                </p>
                <div>
                  <Button className="bg-teal hover:bg-teal/90 text-white font-semibold px-6 py-2 rounded-md text-xs uppercase tracking-wide">
                    {service.buttonText}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
