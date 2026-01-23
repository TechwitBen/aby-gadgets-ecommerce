import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import newsletterBg from "@/assets/newsletter-bg.jpg";

const benefits = [
  "Every gadget inspected & verified before sale.",
  "Fair stress free device swaps.",
  "Reliable delivery for gifting orders.",
  "Customer first service with honesty and support."
];

const WhyChooseUs = () => {
  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* Left - Why Choose */}
          <div className="bg-background border-2 border-primary rounded-2xl p-8 md:p-10 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
                Why Choose Aby Gadgets?
              </h2>
              <ul className="space-y-4 mb-8">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0"></span>
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 rounded-full w-fit">
              SHOP NOW
            </Button>
          </div>

          {/* Right - Newsletter with background image */}
          <div 
            className="rounded-2xl p-8 md:p-10 relative overflow-hidden flex flex-col justify-center min-h-[320px]"
            style={{
              backgroundImage: `url(${newsletterBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/50"></div>
            
            <div className="relative z-10 text-white">
              <h3 className="text-2xl md:text-3xl font-bold mb-3">
                Get 20% Off Your Next Delivery
              </h3>
              <p className="text-white/80 text-sm mb-6 max-w-md">
                Subscribe to our newsletter for exclusive deals, gadget tips, and early access to new arrivals.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input 
                  placeholder="Enter your email. you@example.com" 
                  className="bg-white/90 text-foreground placeholder:text-muted-foreground border-0 h-12 flex-1"
                />
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 h-12 whitespace-nowrap">
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
