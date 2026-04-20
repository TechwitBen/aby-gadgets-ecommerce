import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Instagram, Twitter, Linkedin, Youtube,
  Mail, Phone, MapPin, ArrowRight,
  Zap, Shield, Headphones, Award,
  CheckCircle2,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
const stats = [
  { value: "5+",   label: "Years in Business" },
  { value: "500+", label: "Premium Products"  },
  { value: "830+", label: "Verified Reviews"  },
  { value: "50K+", label: "Happy Customers"   },
];

const team = [
  { name: "Abiodun Lawal",  role: "Founder & CEO",      initials: "AL", gradient: "from-[#6426E1] to-violet-400", featured: true  },
  { name: "Fatima Bello",   role: "Head of Products",    initials: "FB", gradient: "from-blue-500 to-indigo-400",  featured: false },
  { name: "Chuka Eze",      role: "Tech Lead",           initials: "CE", gradient: "from-emerald-500 to-teal-400", featured: false },
  { name: "Ngozi Obi",      role: "Customer Success",    initials: "NO", gradient: "from-rose-500 to-pink-400",    featured: false },
  { name: "Samuel Adeyemi", role: "Logistics Manager",   initials: "SA", gradient: "from-amber-500 to-orange-400", featured: false },
  { name: "Kemi Adekunle",  role: "Marketing Director",  initials: "KA", gradient: "from-violet-600 to-purple-400",featured: false },
];

const values = [
  { icon: Shield,     title: "Genuine Products", body: "Every item is 100% authentic, sourced directly from verified manufacturers and authorised distributors." },
  { icon: Headphones, title: "Expert Support",   body: "Our in-house tech specialists help you pick the right device, troubleshoot issues, or process a return — no bots." },
  { icon: Award,      title: "Top Rated Store",  body: "Over 830 five-star reviews make us one of Nigeria's most consistently trusted electronics retailers." },
  { icon: Zap,        title: "Fast Delivery",    body: "Same-day delivery across Lagos and next-day nationwide. Your gadget ships the moment your payment clears." },
];

const footerLinks = {
  Links:     ["Home", "All Products", "Categories", "About Us"],
  Support:   ["Help Center", "Track Order", "Returns", "Warranty"],
  Community: ["Careers", "Blog", "Partners", "Investors", "Contact"],
};

// ─────────────────────────────────────────────────────────────
const AboutPage = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ══════════════════════════════════════════════
          SECTION 1 — How It Started
      ══════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — text */}
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: "#6426E1" }}>
                How It Started
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] mb-8">
                Our Dream is<br />
                <span style={{ color: "#6426E1" }}>Premium Tech</span><br />
                For Everyone
              </h1>
              <p className="text-base text-gray-500 leading-relaxed mb-5 max-w-lg">
                Aby Gadgets was co-founded by Abiodun Lawal and Fatima Bello — two passionate
                tech enthusiasts who believed that cutting-edge gadgets shouldn't be a luxury.
                Their shared vision was to create Nigeria's most trusted destination for
                premium electronics.
              </p>
              <p className="text-base text-gray-500 leading-relaxed max-w-lg">
                With a handpicked catalogue of genuine devices, an expert team, and an
                unwavering commitment to customer care, they launched Aby Gadgets —
                connecting thousands of Nigerians to the technology they deserve.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white text-sm font-bold hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#6426E1" }}
                >
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-700 hover:border-[#6426E1] hover:text-[#6426E1] transition-colors"
                >
                  Get in Touch
                </Link>
              </div>
            </div>

            {/* Right — branded card */}
            <div className="relative">
              <div
                className="relative rounded-3xl overflow-hidden p-10 min-h-[420px] flex flex-col justify-between"
                style={{ background: "linear-gradient(135deg, #6426E1 0%, #3d0fa3 100%)" }}
              >
                <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full border border-white/10" />
                <div className="absolute -bottom-6 -left-6 w-36 h-36 rounded-full border border-white/10" />
                <div className="absolute top-1/2 right-8 w-16 h-16 rounded-full border border-white/15" />

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-lg">
                    <span className="font-black text-xl" style={{ color: "#6426E1" }}>AG</span>
                  </div>
                  <p className="text-purple-200 text-sm mb-2">Founded in Lagos, Nigeria</p>
                  <h2 className="text-white text-3xl font-extrabold">Aby Gadgets</h2>
                  <p className="text-purple-300 text-sm mt-1">Premium Tech Store</p>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-3 mt-8">
                  {[
                    { label: "Products",  val: "500+" },
                    { label: "Customers", val: "50K+" },
                    { label: "Reviews",   val: "830+" },
                    { label: "Cities",    val: "36"   },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl p-4 bg-white/10 border border-white/10">
                      <p className="text-white text-xl font-extrabold">{s.val}</p>
                      <p className="text-purple-300 text-xs mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating trust badge */}
              <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl px-5 py-3.5 border border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Since 2019</p>
                  <p className="text-sm font-bold text-gray-900">Trusted & Verified</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 2 — Stats
      ══════════════════════════════════════════════ */}
      <section className="py-14 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-4xl sm:text-5xl font-extrabold" style={{ color: "#6426E1" }}>
                  {s.value}
                </p>
                <p className="text-sm text-gray-500 mt-2">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      

      {/* ══════════════════════════════════════════════
          SECTION 4 — Why Choose Us
      ══════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">

          <div className="text-center max-w-xl mx-auto mb-16">
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "#6426E1" }}>
              Why Choose Us
            </p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
              The Aby Gadgets Difference
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-white rounded-2xl p-7 border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-300"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: "rgba(100,38,225,0.08)" }}
                >
                  <v.icon className="w-5 h-5" style={{ color: "#6426E1" }} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-3">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 5 — Vision & Mission
      ══════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-20">

            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: "#6426E1" }}>
                Our Vision
              </p>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                Empowering Lives<br />Through Technology
              </h2>
              <p className="text-base text-gray-500 leading-relaxed mb-5">
                Our unwavering vision is to make premium technology accessible and affordable
                for every Nigerian household. By curating a world-class product catalogue
                and maintaining honest pricing, we aim to inspire innovation, enable
                connectivity, and shape a smarter future for all.
              </p>
              <p className="text-base text-gray-500 leading-relaxed">
                We see a Nigeria where every student, professional, and family has access
                to the tools that help them learn faster, work smarter, and live better.
              </p>
            </div>

            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-5" style={{ color: "#6426E1" }}>
                Our Mission
              </p>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                Quality Tech,<br />Everywhere
              </h2>
              <p className="text-base text-gray-500 leading-relaxed mb-5">
                Our mission is to deliver top-tier electronics with speed, transparency, and
                exceptional after-sales service. By fostering a community of tech-savvy
                shoppers across Nigeria, we are redefining the e-commerce experience —
                one gadget at a time.
              </p>
              <p className="text-base text-gray-500 leading-relaxed">
                From Computer Village in Ikeja to your doorstep — we bridge the gap between
                the world's best technology and the people who need it most.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 6 — Newsletter CTA
      ══════════════════════════════════════════════ */}
      <section
        className="py-20 lg:py-24"
        style={{ background: "linear-gradient(135deg, #6426E1 0%, #3d0fa3 100%)" }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-purple-300 mb-4">
                Exclusive Offer
              </p>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
                Get 10% off your<br />first premium order
              </h2>
              <p className="text-base text-purple-200 leading-relaxed">
                Subscribe to our newsletter and be the first to hear about new arrivals,
                flash sales, and exclusive member-only deals.
              </p>
            </div>

            <div>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-5 py-4 rounded-xl bg-white/10 text-white placeholder-purple-300 border border-white/20 focus:outline-none focus:border-white text-sm transition-colors"
                />
                <button
                  type="submit"
                  className="px-8 py-4 rounded-xl font-bold text-sm bg-white hover:bg-gray-100 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap justify-center"
                  style={{ color: "#6426E1" }}
                >
                  {subscribed ? "Subscribed ✓" : <><span>Subscribe</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
              <p className="text-purple-300 text-xs mt-4">
                No spam. Unsubscribe at any time. Your data is safe with us.
              </p>
            </div>
          </div>
        </div>
      </section>

     
      
    </div>
  );
};

export default AboutPage;