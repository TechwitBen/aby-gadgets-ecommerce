import { useState, useEffect } from "react";
import { productService, type Product } from "@/services/products.service";
import { Link } from "react-router-dom";
import gadgetImage from "@/assets/product-phone.png";
import {
  ArrowRight,
  Shield,
  Headphones,
  Award,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Star,
  Package,
  Truck,
  RotateCcw,
  Smartphone,
  Laptop,
  Watch,
  Tablet,
  Monitor,
} from "lucide-react";
import { useInView } from "@/hooks/useInView";

// ── Data ──────────────────────────────────────────────────────────────────────

const stats = [
  { value: "5+", label: "Years Trusted", suffix: "" },
  { value: "500", label: "Premium Products", suffix: "+" },
  { value: "830", label: "5-Star Reviews", suffix: "+" },
  { value: "50", label: "Happy Customers", suffix: "K+" },
];

const values = [
  {
    icon: Shield,
    title: "100% Authentic",
    body: "Every device is sourced directly from verified manufacturers. No fakes, no risk — ever.",
  },
  {
    icon: Headphones,
    title: "Real Human Support",
    body: "Our in-house tech specialists are always a call away. No bots, no scripts — just real help.",
  },
  {
    icon: Zap,
    title: "Same-Day Delivery",
    body: "Lagos orders ship the moment payment clears. Nationwide next-day delivery guaranteed.",
  },
  {
    icon: Award,
    title: "Top Rated in NG",
    body: "830+ five-star reviews make us Nigeria's most consistently trusted gadget store.",
  },
];

const guarantees = [
  { icon: Package, label: "Secure Packaging" },
  { icon: RotateCcw, label: "Easy Returns" },
  { icon: Truck, label: "Fast Nationwide" },
  { icon: Shield, label: "Warranty Covered" },
];

const reviews = [
  {
    name: "Tunde A.",
    rating: 5,
    text: "Fastest delivery I've ever experienced. iPhone arrived sealed and genuine. Aby Gadgets is 10/10.",
  },
  {
    name: "Chisom E.",
    rating: 5,
    text: "Bought a MacBook. Verified authentic, great price, and their support team helped me set it up. Unreal service.",
  },
  {
    name: "Fatima B.",
    rating: 5,
    text: "Ordered a Samsung Galaxy — arrived same day in Lagos. The packaging was immaculate. Will always shop here.",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

const AboutPage = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [categoryProducts, setCategoryProducts] = useState<
    Record<string, Product[]>
  >({});

  // ── Section refs ──────────────────────────────────────────────────────────
  const { ref: heroTextRef, isInView: heroTextInView } = useInView({
    threshold: 0,
  });
  const { ref: heroImgRef, isInView: heroImgInView } = useInView({
    threshold: 0,
  });
  const { ref: statsRef, isInView: statsInView } = useInView({
    threshold: 0.1,
  });
  const { ref: catHeadRef, isInView: catHeadInView } = useInView({
    threshold: 0.1,
  });
  const { ref: catGridRef, isInView: catGridInView } = useInView({
    threshold: 0.05,
  });
  const { ref: whyLeftRef, isInView: whyLeftInView } = useInView({
    threshold: 0.1,
  });
  const { ref: whyRightRef, isInView: whyRightInView } = useInView({
    threshold: 0.1,
  });
  const { ref: revHeadRef, isInView: revHeadInView } = useInView({
    threshold: 0.1,
  });
  const { ref: revGridRef, isInView: revGridInView } = useInView({
    threshold: 0.05,
  });
  const { ref: vmLeftRef, isInView: vmLeftInView } = useInView({
    threshold: 0.1,
  });
  const { ref: vmRightRef, isInView: vmRightInView } = useInView({
    threshold: 0.1,
  });

  useEffect(() => {
    const fetchByCategory = async () => {
      const [phones, laptops, tablets, watches] = await Promise.all([
        productService.getAll({ category: "phones", limit: 4 }),
        productService.getAll({ category: "laptops", limit: 4 }),
        productService.getAll({ category: "tablets", limit: 4 }),
        productService.getAll({ category: "watches", limit: 4 }),
      ]);
      setCategoryProducts({
        Smartphones: phones.products,
        Laptops: laptops.products,
        Tablets: tablets.products,
        Smartwatches: watches.products,
      });
    };
    fetchByCategory();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section className="pt-14 pb-20 sm:pt-16 sm:pb-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16">
          {/* Breadcrumb */}
          <p className="text-sm text-gray-400 mb-10 font-medium">
            [Home / <span style={{ color: "#6426E1" }}>About]</span>
          </p>

          {/* Two-column grid — bigger gap, better breathing room */}
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-24 items-center">
            {/* Left — text */}
            <div
              ref={heroTextRef}
              className="transition-all duration-700 ease-out"
              style={{
                opacity: heroTextInView ? 1 : 0,
                transform: heroTextInView
                  ? "translateX(0)"
                  : "translateX(-32px)",
              }}
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight mb-5">
                Premium tech &amp; real value.
                <br />
                Built with real care.
              </h1>
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed max-w-md">
                At Aby Gadgets we believe every Nigerian deserves access to
                world-class technology at honest prices. With a team dedicated
                to quality and transparency, we work hand-in-hand with our
                customers to bring the best gadgets to their hands — backed by
                service that actually cares.
              </p>
            </div>

            {/* Right — image with spinning badge */}
            <div
              ref={heroImgRef}
              className="relative transition-all duration-700 ease-out delay-150"
              style={{
                opacity: heroImgInView ? 1 : 0,
                transform: heroImgInView ? "translateX(0)" : "translateX(32px)",
              }}
            >
              <img
                src={gadgetImage}
                alt="Premium gadgets at Aby Gadgets"
                className="w-full rounded-2xl object-cover aspect-[4/3]"
              />

              {/* Spinning badge */}
              <div className="absolute -bottom-7 -left-7 w-[88px] h-[88px]">
                <div className="relative w-full h-full bg-white rounded-full border border-gray-100 shadow-lg flex items-center justify-center">
                  <svg
                    viewBox="0 0 88 88"
                    className="absolute inset-0 w-full h-full animate-spin"
                    style={{ animationDuration: "12s" }}
                  >
                    <defs>
                      <path
                        id="ring"
                        d="M 44,44 m -30,0 a 30,30 0 1,1 60,0 a 30,30 0 1,1 -60,0"
                      />
                    </defs>
                    <text
                      fontSize="8.5"
                      fontFamily="inherit"
                      fill="#6426E1"
                      fontWeight="500"
                      letterSpacing="2"
                    >
                      <textPath href="#ring">
                        Aby Gadgets * Trusted * Since 2019 *
                      </textPath>
                    </text>
                  </svg>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "#6426E1" }}
                  >
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ═══════════════════════════════════════════════════════ */}
      <section className="py-14 border-y border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="text-center transition-all duration-700 ease-out"
                style={{
                  transitionDelay: `${i * 100}ms`,
                  opacity: statsInView ? 1 : 0,
                  transform: statsInView ? "translateY(0)" : "translateY(20px)",
                }}
              >
                <p
                  className="text-5xl sm:text-6xl font-black tracking-tight"
                  style={{ color: "#6426E1" }}
                >
                  {s.value}
                  <span className="text-3xl">{s.suffix}</span>
                </p>
                <p className="text-sm text-gray-500 mt-2 font-medium">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ GADGET CATEGORIES ════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          {/* Header */}
          <div
            ref={catHeadRef}
            className="text-center mb-14 transition-all duration-700 ease-out"
            style={{
              opacity: catHeadInView ? 1 : 0,
              transform: catHeadInView ? "translateY(0)" : "translateY(20px)",
            }}
          >
            <p
              className="text-xs font-bold tracking-[0.2em] uppercase mb-4"
              style={{ color: "#6426E1" }}
            >
              What We Carry
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
              Every Gadget You Love
            </h2>
            <p className="text-gray-500 mt-4 max-w-md mx-auto text-sm sm:text-base">
              From the latest iPhones to high-performance laptops — all genuine,
              all ready to ship.
            </p>
          </div>

          {/* Grid */}
          <div
            ref={catGridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { name: "Smartphones", category: "phones" },
              { name: "Laptops", category: "laptops" },
              { name: "Tablets", category: "tablets" },
              { name: "Smartwatches", category: "watches" },
            ].map((g, i) => {
              const products = categoryProducts[g.name] ?? [];
              const count = products.length;
              return (
                <Link
                  to={`/products?category=${g.category}`}
                  key={g.name}
                  className="group block rounded-3xl overflow-hidden border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-500"
                  style={{
                    transitionDelay: `${i * 80}ms`,
                    opacity: catGridInView ? 1 : 0,
                    transform: catGridInView
                      ? "translateY(0)"
                      : "translateY(28px)",
                  }}
                >
                  <div className="grid grid-cols-2 gap-0.5 bg-gray-100 aspect-square overflow-hidden">
                    {products.length > 0
                      ? products.slice(0, 4).map((p, idx) => (
                          <div
                            key={p.id}
                            className={`bg-white overflow-hidden flex items-center justify-center p-3 ${
                              products.length === 1
                                ? "col-span-2 row-span-2"
                                : products.length === 2
                                  ? "row-span-2"
                                  : products.length === 3 && idx === 0
                                    ? "col-span-2"
                                    : ""
                            }`}
                          >
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        ))
                      : Array(4)
                          .fill(null)
                          .map((_, idx) => (
                            <div
                              key={idx}
                              className="bg-gray-200 animate-pulse aspect-square"
                            />
                          ))}
                  </div>
                  <div className="px-5 py-4 flex items-center justify-between bg-white">
                    <div>
                      <p className="text-gray-900 font-black text-base">
                        {g.name}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {count > 0 ? `${count}+ models in stock` : "Loading…"}
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 bg-gray-100 text-gray-600 group-hover:bg-[#6426E1] group-hover:text-white">
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ WHY CHOOSE US ════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left */}
            <div
              ref={whyLeftRef}
              className="transition-all duration-700 ease-out"
              style={{
                opacity: whyLeftInView ? 1 : 0,
                transform: whyLeftInView
                  ? "translateX(0)"
                  : "translateX(-28px)",
              }}
            >
              <p
                className="text-xs font-bold tracking-widest uppercase mb-5"
                style={{ color: "#6426E1" }}
              >
                Why Aby Gadgets
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-6">
                The Standard
                <br />
                Others Aim For
              </h2>
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed mb-8">
                We didn't just open a gadget store — we set a new bar for what
                buying tech in Nigeria should feel like. Transparent. Fast.
                Trustworthy.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: "#6426E1" }}
              >
                See Our Products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right — value cards */}
            <div
              ref={whyRightRef}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {values.map((v, i) => (
                <div
                  key={v.title}
                  className={`bg-white rounded-2xl p-6 border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-500 ${i === 0 ? "sm:col-span-2" : ""}`}
                  style={{
                    transitionDelay: `${i * 80}ms`,
                    opacity: whyRightInView ? 1 : 0,
                    transform: whyRightInView
                      ? "translateY(0)"
                      : "translateY(20px)",
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: "rgba(100,38,225,0.08)" }}
                  >
                    <v.icon className="w-5 h-5" style={{ color: "#6426E1" }} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {v.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ REVIEWS ══════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div
            ref={revHeadRef}
            className="text-center mb-12 transition-all duration-700 ease-out"
            style={{
              opacity: revHeadInView ? 1 : 0,
              transform: revHeadInView ? "translateY(0)" : "translateY(16px)",
            }}
          >
            <p
              className="text-xs font-bold tracking-widest uppercase mb-4"
              style={{ color: "#6426E1" }}
            >
              Customer Love
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900">
              What They're Saying
            </h2>
          </div>

          <div ref={revGridRef} className="grid sm:grid-cols-3 gap-6">
            {reviews.map((r, i) => (
              <div
                key={r.name}
                className="bg-gray-50 rounded-3xl p-7 border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-500 hover:-translate-y-1"
                style={{
                  transitionDelay: `${i * 100}ms`,
                  opacity: revGridInView ? 1 : 0,
                  transform: revGridInView
                    ? "translateY(0)"
                    : "translateY(24px)",
                }}
              >
                <div className="flex items-center gap-1 mb-5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-6">
                  "{r.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: "#6426E1" }}
                  >
                    {r.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{r.name}</p>
                    <p className="text-xs text-gray-400">Verified Buyer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ VISION & MISSION ═════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Vision */}
            <div
              ref={vmLeftRef}
              className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 transition-all duration-700 ease-out"
              style={{
                opacity: vmLeftInView ? 1 : 0,
                transform: vmLeftInView ? "translateX(0)" : "translateX(-28px)",
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl mb-6 flex items-center justify-center"
                style={{ backgroundColor: "rgba(100,38,225,0.08)" }}
              >
                <Zap className="w-6 h-6" style={{ color: "#6426E1" }} />
              </div>
              <p
                className="text-xs font-bold tracking-widest uppercase mb-3"
                style={{ color: "#6426E1" }}
              >
                Our Vision
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-5 leading-tight">
                Tech for Every
                <br />
                Nigerian Home
              </h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                We see a Nigeria where every student, professional, and family
                has access to the tools they need to learn faster, work smarter,
                and live better. Aby Gadgets is that bridge — from the world's
                best technology to your doorstep.
              </p>
            </div>

            {/* Mission */}
            <div
              ref={vmRightRef}
              className="rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden transition-all duration-700 ease-out delay-150"
              style={{
                background: "linear-gradient(140deg, #6426E1 0%, #2d0b99 100%)",
                opacity: vmRightInView ? 1 : 0,
                transform: vmRightInView ? "translateX(0)" : "translateX(28px)",
              }}
            >
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full border border-white/10" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full border border-white/10" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl mb-6 flex items-center justify-center bg-white/15">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs font-bold tracking-widest uppercase mb-3 text-purple-300">
                  Our Mission
                </p>
                <h3 className="text-2xl sm:text-3xl font-black mb-5 leading-tight">
                  Quality Tech,
                  <br />
                  Everywhere
                </h3>
                <p className="text-purple-200 leading-relaxed text-sm">
                  Deliver top-tier electronics with speed, transparency, and
                  exceptional after-sales service. We're redefining what
                  e-commerce feels like in Nigeria — one genuine gadget at a
                  time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
