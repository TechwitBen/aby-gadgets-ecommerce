import { useState, useEffect } from "react";
import { productService, type Product } from "@/services/Products.service";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Shield,
  Headphones,
  Award,
  Zap,
  CheckCircle2,
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

const gadgets = [
  {
    icon: Smartphone,
    name: "Smartphones",
    count: "200+ models",
    color: "from-violet-500 to-purple-600",
    delay: "0ms",
  },
  {
    icon: Laptop,
    name: "Laptops",
    count: "80+ models",
    color: "from-blue-500 to-indigo-600",
    delay: "100ms",
  },
  {
    icon: Tablet,
    name: "Tablets",
    count: "60+ models",
    color: "from-emerald-500 to-teal-600",
    delay: "200ms",
  },
  {
    icon: Watch,
    name: "Smartwatches",
    count: "50+ models",
    color: "from-rose-500 to-pink-600",
    delay: "300ms",
  },
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
      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-10"
            style={{
              background: "radial-gradient(circle, #6426E1, transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full opacity-8"
            style={{
              background: "radial-gradient(circle, #3d0fa3, transparent 70%)",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-200 bg-purple-50 mb-8">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                <span className="text-xs font-semibold text-purple-700 tracking-wide">
                  Nigeria's #1 Gadget Store
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.05] mb-8 tracking-tight">
                Premium Tech.
                <br />
                <span className="relative inline-block">
                  <span style={{ color: "#6426E1" }}>Real Value.</span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    height="6"
                    viewBox="0 0 200 6"
                  >
                    <path
                      d="M0 3 Q50 0 100 3 Q150 6 200 3"
                      stroke="#6426E1"
                      strokeWidth="2.5"
                      fill="none"
                      opacity="0.4"
                    />
                  </svg>
                </span>
              </h1>

              <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-lg">
                Aby Gadgets was built on one belief — every Nigerian deserves
                access to world-class technology at honest prices, with service
                that actually cares.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-white text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-purple-200"
                  style={{ backgroundColor: "#6426E1" }}
                >
                  Browse Gadgets <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-bold border-2 border-gray-100 text-gray-700 hover:border-purple-300 hover:text-purple-700 transition-colors"
                >
                  Talk to Us
                </Link>
              </div>

              {/* Mini guarantees */}
              <div className="flex flex-wrap gap-3 mt-10">
                {guarantees.map((g) => (
                  <div
                    key={g.label}
                    className="flex items-center gap-1.5 text-xs text-gray-500 font-medium"
                  >
                    <g.icon className="w-3.5 h-3.5 text-purple-500" />
                    {g.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — stacked cards */}
            <div className="relative">
              {/* Main card */}
              <div
                className="relative rounded-3xl overflow-hidden p-10 min-h-[460px] flex flex-col justify-between shadow-2xl shadow-purple-200"
                style={{
                  background:
                    "linear-gradient(140deg, #6426E1 0%, #2d0b99 100%)",
                }}
              >
                {/* Decorative rings */}
                <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border border-white/10" />
                <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full border border-white/10" />
                <div className="absolute top-1/2 right-10 w-20 h-20 rounded-full border border-white/15" />

                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-lg">
                    <span
                      className="font-black text-2xl"
                      style={{ color: "#6426E1" }}
                    >
                      AG
                    </span>
                  </div>
                  <p className="text-purple-300 text-sm mb-1">
                    Founded in Lagos, Nigeria · Since 2019
                  </p>
                  <h2 className="text-white text-4xl font-black">
                    Aby Gadgets
                  </h2>
                  <p className="text-purple-300 text-sm mt-1">
                    Your Trusted Tech Partner
                  </p>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-3 mt-8">
                  {[
                    { label: "Products", val: "500+" },
                    { label: "Customers", val: "50K+" },
                    { label: "Reviews", val: "830+" },
                    { label: "States", val: "36" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-2xl p-4 bg-white/10 border border-white/10 backdrop-blur-sm"
                    >
                      <p className="text-white text-2xl font-black">{s.val}</p>
                      <p className="text-purple-300 text-xs mt-0.5">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating trust badge */}
              <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl px-5 py-3.5 border border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Verified Store</p>
                  <p className="text-sm font-bold text-gray-900">
                    Trusted Since 2019
                  </p>
                </div>
              </div>

              {/* Floating review badge */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl px-4 py-3 border border-gray-100">
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="w-3 h-3 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-xs font-bold text-gray-900">4.9 / 5.0</p>
                <p className="text-[10px] text-gray-400">830+ reviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ════════════════════════════════════════════════════════ */}
      <section className="py-14 border-y border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
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
      {/* ══ GADGET CATEGORIES ════════════════════════════════════════════════ */}
      {/* ══ GADGET CATEGORIES ════════════════════════════════════════════════ */}
      {/* ══ GADGET CATEGORIES ════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="text-center mb-16">
            <p
              className="text-xs font-bold tracking-[0.2em] uppercase mb-4"
              style={{ color: "#6426E1" }}
            >
              What We Carry
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
              Every Gadget You Love
            </h2>
            <p className="text-gray-500 mt-4 max-w-md mx-auto text-base">
              From the latest iPhones to high-performance laptops — all genuine,
              all ready to ship.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Smartphones", category: "phones" },
              { name: "Laptops", category: "laptops" },
              { name: "Tablets", category: "tablets" },
              { name: "Smartwatches", category: "watches" },
            ].map((g) => {
              const products = categoryProducts[g.name] ?? [];
              const count = products.length;

              return (
                <Link
                  to={`/products?category=${g.category}`}
                  key={g.name}
                  className="group block rounded-3xl overflow-hidden border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300 bg-white"
                >
                  {/* Image grid – 2×2 with smarter spans */}
                  <div className="grid grid-cols-2 gap-0.5 bg-gray-100 aspect-square overflow-hidden">
                    {products.length > 0
                      ? products.slice(0, 4).map((p, i) => (
                          <div
                            key={p.id}
                            className={`bg-white overflow-hidden flex items-center justify-center p-3 ${
                              products.length === 1
                                ? "col-span-2 row-span-2"
                                : products.length === 2
                                  ? "row-span-2"
                                  : products.length === 3 && i === 0
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
                      : /* Skeleton while loading */
                        Array(4)
                          .fill(null)
                          .map((_, i) => (
                            <div
                              key={i}
                              className="bg-gray-200 animate-pulse aspect-square"
                            />
                          ))}
                  </div>

                  {/* Card footer – clean white background */}
                  <div className="px-5 py-4 flex items-center justify-between bg-white">
                    <div>
                      <p className="text-gray-900 font-black text-base">
                        {g.name}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {count > 0 ? `${count}+ models in stock` : "Loading…"}
                      </p>
                    </div>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300
                           bg-gray-100 text-gray-600 group-hover:bg-[#6426E1] group-hover:text-white"
                    >
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
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — heading */}
            <div>
              <p
                className="text-xs font-bold tracking-widest uppercase mb-5"
                style={{ color: "#6426E1" }}
              >
                Why Aby Gadgets
              </p>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight mb-6">
                The Standard
                <br />
                Others Aim For
              </h2>
              <p className="text-base text-gray-500 leading-relaxed mb-8">
                We didn't just open a gadget store — we set a new bar for what
                buying tech in Nigeria should feel like. Transparent. Fast.
                Trustworthy.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#6426E1" }}
              >
                See Our Products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right — value cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {values.map((v, i) => (
                <div
                  key={v.title}
                  className={`bg-white rounded-2xl p-6 border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-300 ${i === 0 ? "sm:col-span-2" : ""}`}
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
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="text-center mb-14">
            <p
              className="text-xs font-bold tracking-widest uppercase mb-4"
              style={{ color: "#6426E1" }}
            >
              Customer Love
            </p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900">
              What They're Saying
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <div
                key={r.name}
                className="bg-gray-50 rounded-3xl p-7 border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-300"
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
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="bg-white rounded-3xl p-10 border border-gray-100">
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
              <h3 className="text-3xl font-black text-gray-900 mb-5 leading-tight">
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

            <div
              className="rounded-3xl p-10 text-white relative overflow-hidden"
              style={{
                background: "linear-gradient(140deg, #6426E1 0%, #2d0b99 100%)",
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
                <h3 className="text-3xl font-black mb-5 leading-tight">
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

      {/* ══ NEWSLETTER CTA ═══════════════════════════════════════════════════ */}
      <section
        className="py-24 relative overflow-hidden"
        style={{
          background: "linear-gradient(140deg, #6426E1 0%, #2d0b99 100%)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full border border-white/10" />
          <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full border border-white/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/5" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-purple-300 mb-5">
                Exclusive Offer
              </p>
              <h2 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-5">
                10% off your
                <br />
                first order
              </h2>
              <p className="text-purple-200 text-base leading-relaxed">
                Subscribe and be the first to hear about new arrivals, flash
                sales, and exclusive deals.
              </p>
            </div>

            <div>
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-3 mb-4"
              >
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-5 py-4 rounded-2xl bg-white/10 text-white placeholder-purple-300 border border-white/20 focus:outline-none focus:border-white text-sm transition-colors"
                />
                <button
                  type="submit"
                  className="px-8 py-4 rounded-2xl font-black text-sm bg-white hover:bg-gray-100 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap justify-center"
                  style={{ color: "#6426E1" }}
                >
                  {subscribed ? (
                    "Subscribed ✓"
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
              <p className="text-purple-400 text-xs">
                No spam. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
