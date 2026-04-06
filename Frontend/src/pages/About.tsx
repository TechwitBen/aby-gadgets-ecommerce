import { useState } from "react";
import { Users, Award, Briefcase, Trophy, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

// Image URLs (gadget/tech themed)
const aboutHeroBanner = "https://images.unsplash.com/photo-1716681863832-8e1f4b2e0cc0?q=80&w=1228&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"; // tech gadgets collage
const aboutTeam1 = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; // team working with laptops
const aboutTeam2 = "https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"; // person holding tablet/tech

const stats = [
  { icon: Briefcase, value: "5+", label: "Years Of Experience" },
  { icon: Award, value: "200+", label: "Complete Orders" },
  { icon: Users, value: "50+", label: "Happy Customers" },
  { icon: Trophy, value: "10+", label: "Awards Won" },
];

const specialServices = [
  "Emergency Solutions Anytime",
  "Affordable Prices Always",
  "How to Improve Your Tech",
  "Reliable & Experienced Team",
];

const testimonials = [
  {
    name: "Abiodun T.",
    role: "Loyal Customer",
    text: "Aby Gadgets has been my go-to for all tech purchases. Their authenticity guarantee gives me peace of mind every time I buy from them.",
    rating: 5,
  },
  {
    name: "Chioma E.",
    role: "Business Owner",
    text: "I trust Aby Gadgets for all my business tech needs. Fast delivery, genuine products, and excellent customer support every time.",
    rating: 5,
  },
];

const About = () => {
  const [activeTab, setActiveTab] = useState<"mission" | "vision" | "goal">("mission");

  const tabContent = {
    mission: {
      title: "Our Company Mission",
      text1: "At Aby Gadgets, our mission is to provide Nigerians with access to authentic, high-quality gadgets at competitive prices. We believe everyone deserves genuine technology products backed by reliable customer service.",
      text2: "We are committed to building lasting relationships with our customers through transparency, trust, and an unwavering dedication to quality in every device we sell.",
    },
    vision: {
      title: "Our Company Vision",
      text1: "We envision becoming Nigeria's most trusted gadget retailer, known for authenticity, affordability, and exceptional customer experience across every touchpoint.",
      text2: "Our vision extends beyond sales — we aim to create a tech community where customers feel confident in their purchases and empowered by their devices.",
    },
    goal: {
      title: "Our Company Goal",
      text1: "Our goal is to expand our reach across Nigeria, making genuine gadgets accessible to everyone regardless of location. We aim to serve thousands of satisfied customers nationwide.",
      text2: "We continuously improve our services, from faster delivery to better financing options, ensuring that technology is never out of reach for anyone.",
    },
  };

  const current = tabContent[activeTab];

  return (
    <div className="min-h-screen bg-background">

    {/* Hero Banner - Refined */}
<section className="relative h-[280px] md:h-[340px] flex items-center justify-center overflow-hidden">
  <img
    src={aboutHeroBanner}
    alt="About Us Banner"
    className="absolute inset-0 w-full h-full object-cover"
  />
  {/* Dark overlay for better text readability */}
  <div className="absolute inset-0 bg-black/70" />
  {/* Gradient overlay: from primary to primary/70 gives depth */}
  <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/70" />
  <div className="relative z-10 text-center text-white px-4">
    <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">
      About Us
    </h1>
    <p className="text-sm text-white/80 flex items-center justify-center gap-2">
      <span className="hover:text-white transition-colors cursor-pointer">Home</span>
      <span className="text-white/60">•</span>
      <span className="text-white/90">About Us</span>
    </p>
  </div>
</section>

      {/* Company About Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 max-w-6xl mx-auto">
            {/* Images */}
            <div className="w-full md:w-[45%] relative">
              <div className="relative">
                <img
                  src={aboutTeam1}
                  alt="Our team"
                  className="rounded-2xl w-full h-[300px] object-cover shadow-lg"
                />
                <div className="absolute -bottom-6 -right-4 md:-right-8 bg-accent text-accent-foreground rounded-2xl px-5 py-4 shadow-xl">
                  <span className="text-3xl font-bold block">5+</span>
                  <span className="text-xs font-semibold uppercase tracking-wider">Years<br />Of Experience</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="w-full md:w-[55%]">
              <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-3">Company About</p>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight mb-1">
                One of the fastest way to get
              </h2>
              <h2 className="text-2xl md:text-3xl font-bold italic text-accent leading-tight mb-5">
                genuine gadgets
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Aby Gadgets is your trusted source for authentic phones, laptops, tablets, and accessories. 
                Based in Lagos, Nigeria, we cater to individuals and businesses of all sizes. Our objective is to 
                help customers access genuine technology products at the best prices.
              </p>

              <p className="font-bold text-foreground text-sm mb-3">Our Special Services:</p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {specialServices.map((service) => (
                  <div key={service} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                    <span className="text-xs text-muted-foreground">{service}</span>
                  </div>
                ))}
              </div>

              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full px-6 py-2.5 text-sm uppercase tracking-wide">
                Contact Us →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-accent py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-accent-foreground/30 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <span className="text-2xl md:text-3xl font-bold text-accent-foreground">{stat.value}</span>
                  <p className="text-xs text-accent-foreground/80">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission / Vision / Goal Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-3">About Mission</p>
            <div className="flex flex-col md:flex-row gap-10 md:gap-16">
              <div className="w-full md:w-[55%]">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight mb-1">
                  Our Main Goal to Satisfy
                </h2>
                <h2 className="text-2xl md:text-3xl font-bold italic text-foreground leading-tight mb-6">
                  local & Global Clients
                </h2>

                {/* Tabs */}
                <div className="flex gap-3 mb-6">
                  {(["mission", "vision", "goal"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wide transition-colors ${
                        activeTab === tab
                          ? "bg-accent text-accent-foreground"
                          : "border border-border text-muted-foreground hover:border-accent hover:text-accent"
                      }`}
                    >
                      Our {tab}
                    </button>
                  ))}
                </div>

                <h3 className="font-bold text-foreground mb-3">{current.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">{current.text1}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{current.text2}</p>
              </div>

              <div className="w-full md:w-[45%]">
                <img
                  src={aboutTeam2}
                  alt="Our workspace"
                  className="rounded-2xl w-full h-[320px] object-cover shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-accent font-semibold text-xs uppercase tracking-widest mb-2">Our Experiences</p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Trusted By Our Clients
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                  {t.text}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <span className="text-accent font-bold text-sm">{t.name[0]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
 
    </div>
  );
};

export default About;