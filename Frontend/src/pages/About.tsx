import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Instagram, Twitter, Linkedin, Youtube,
  Mail, Phone, MapPin, ArrowRight,
  Zap, Shield, Headphones, Award
} from "lucide-react";

// ── Team members ───────────────────────────────────────────────────────────────
const team = [
  {
    name: "Abiodun Lawal",
    role: "Founder & CEO",
    initials: "AL",
    color: "from-[#6426E1] to-purple-400",
    social: "linkedin",
    featured: true,
  },
  {
    name: "Fatima Bello",
    role: "Head of Products",
    initials: "FB",
    color: "from-blue-500 to-indigo-400",
    featured: false,
  },
  {
    name: "Chuka Eze",
    role: "Tech Lead",
    initials: "CE",
    color: "from-emerald-500 to-teal-400",
    featured: false,
  },
  {
    name: "Ngozi Obi",
    role: "Customer Success",
    initials: "NO",
    color: "from-rose-500 to-pink-400",
    featured: false,
  },
  {
    name: "Samuel Adeyemi",
    role: "Logistics Manager",
    initials: "SA",
    color: "from-amber-500 to-orange-400",
    featured: false,
  },
  {
    name: "Kemi Adekunle",
    role: "Marketing Director",
    initials: "KA",
    color: "from-violet-500 to-purple-400",
    featured: false,
  },
];

const stats = [
  { value: "5+",   label: "Years in Business" },
  { value: "500+", label: "Premium Products" },
  { value: "830+", label: "Verified Reviews" },
  { value: "50K",  label: "Happy Customers" },
];

const footerLinks = {
  Links:     ["Home", "Products", "Categories", "About Us"],
  Support:   ["Help Center", "Track Order", "Returns", "Warranty"],
  Community: ["Careers", "Blog", "Partners", "Investors", "Contact"],
};

// ── Component ──────────────────────────────────────────────────────────────────
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
    <div className="min-h-screen bg-white font-sans">

      {/* ══════════════════════════════════════════════════════
          TOP SECTION — 2 columns
      ══════════════════════════════════════════════════════ */}
      <section className="grid lg:grid-cols-2 min-h-[560px]">

        {/* Left — Origin story */}
        <div className="bg-white px-8 sm:px-12 lg:px-16 py-14 flex flex-col justify-between">
          <div>
            {/* Label */}
            <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "#6426E1" }}>
              How It Started
            </p>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
              Our Dream is<br />
              <span style={{ color: "#6426E1" }}>Premium Tech</span><br />
              For Everyone
            </h1>

            {/* Body */}
            <p className="text-sm text-gray-500 leading-relaxed max-w-md mb-8">
              Aby Gadgets was founded by Abiodun Lawal and Fatima Bello — two tech enthusiasts
              who believed that cutting-edge gadgets shouldn't be a luxury. Their shared vision
              was to create Nigeria's most trusted electronics destination. With a handpicked
              catalogue of premium devices, an expert team, and a passion for genuine customer
              care, they launched Aby Gadgets — connecting thousands of Nigerians to the tech
              they deserve.
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl p-4 border border-gray-100 bg-gray-50 hover:border-purple-200 transition-colors"
                >
                  <p className="text-2xl font-black text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image strip */}
          <div className="mt-10 rounded-2xl overflow-hidden relative h-44 bg-gradient-to-br from-[#6426E1] to-purple-900 flex items-center justify-center shadow-xl">
            {/* Decorative tech circles */}
            <div className="absolute -top-6 -left-6 w-28 h-28 rounded-full bg-white/5 border border-white/10" />
            <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-white/5 border border-white/10" />
            <div className="absolute top-4 right-12 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-yellow-300" />
            </div>
            <div className="text-center">
              <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Our Store</p>
              <p className="text-white font-black text-3xl">Aby Gadgets</p>
              <p className="text-purple-200 text-sm mt-1">Premium Tech Store · Lagos</p>
            </div>
          </div>
        </div>

        {/* Right — Meet the Team */}
        <div className="bg-gray-50 px-8 sm:px-12 lg:px-16 py-14">
          <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#6426E1" }}>
            Meet the Team
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-8">
            Meet Our Dedicated<br />Team of Tech Experts
          </h2>

          {/* Team grid — 3 columns × 2 rows */}
          <div className="grid grid-cols-3 gap-3">
            {team.map((member) => (
              <div
                key={member.name}
                className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${member.color} aspect-square flex flex-col items-center justify-end pb-3 shadow-md hover:scale-105 transition-transform duration-200 cursor-pointer`}
              >
                {/* Avatar initials */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white/30 font-black text-5xl">{member.initials}</span>
                </div>

                {/* Name card overlay (featured only) */}
                {member.featured && (
                  <div className="relative z-10 bg-white rounded-xl px-3 py-2 shadow-lg flex items-center gap-2">
                    <div>
                      <p className="text-xs font-bold text-gray-900 leading-tight">{member.name}</p>
                      <p className="text-[10px] text-gray-500">{member.role}</p>
                    </div>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "#6426E1" }}>
                      <Linkedin className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}

                {/* Subtle name at bottom for non-featured */}
                {!member.featured && (
                  <div className="relative z-10 text-center">
                    <p className="text-white text-[11px] font-semibold leading-tight drop-shadow">{member.name}</p>
                    <p className="text-white/70 text-[9px]">{member.role}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Values strip */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              { icon: Shield,     label: "Genuine Products",    desc: "100% authentic, verified gadgets" },
              { icon: Headphones, label: "Expert Support",      desc: "Real humans, real answers" },
              { icon: Award,      label: "Top Rated",           desc: "830+ five-star reviews" },
              { icon: Zap,        label: "Fast Delivery",       desc: "Same-day Lagos delivery" },
            ].map((v) => (
              <div key={v.label} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-purple-200 transition-colors">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(100,38,225,0.10)" }}>
                  <v.icon className="w-4 h-4" style={{ color: "#6426E1" }} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{v.label}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          BOTTOM SECTION — 2 columns
      ══════════════════════════════════════════════════════ */}
      <section className="grid lg:grid-cols-2">

        {/* Left — Vision & Mission */}
        <div className="bg-white px-8 sm:px-12 lg:px-16 py-14 flex flex-col gap-12">
          {/* Our Vision */}
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#6426E1" }}>
              Our Vision
            </p>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
              Empowering Lives<br />Through Technology
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-md">
              Our unwavering vision is to make premium technology accessible and affordable for every
              Nigerian household. By curating a world-class product catalogue and maintaining
              honest pricing, we aim to inspire innovation, enable connectivity, and shape a
              smarter future for all.
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 w-full" />

          {/* Our Mission */}
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#6426E1" }}>
              Our Mission
            </p>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
              Quality Tech,<br />Everywhere
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-md">
              Our mission is to deliver top-tier electronics with speed, transparency, and
              exceptional after-sales service. By fostering a community of tech-savvy shoppers
              across Nigeria, we are redefining the e-commerce experience — one gadget at a time.
            </p>
          </div>
        </div>

        {/* Right — Newsletter CTA + Footer */}
        <div className="flex flex-col">

          {/* CTA block */}
          <div className="bg-[#0E0B2E] px-8 sm:px-12 lg:px-16 py-14 flex-1 flex flex-col justify-center">
            <p className="text-xs font-bold tracking-widest uppercase text-purple-300 mb-4">
              Exclusive Offer
            </p>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-3">
              Get 10% off your<br />first order with us
            </h3>
            <p className="text-sm text-gray-400 mb-8">
              Subscribe to our newsletter and be first to hear about new arrivals,
              flash sales, and exclusive member deals.
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-500 border border-white/20 focus:outline-none focus:border-purple-400 text-sm transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl font-bold text-white text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
                style={{ backgroundColor: "#6426E1" }}
              >
                {subscribed ? "Subscribed!" : "Subscribe"}
                {!subscribed && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>

          {/* Footer */}
          <footer className="bg-[#070516] px-8 sm:px-12 lg:px-16 py-10">
            <div className="grid grid-cols-2 sm:grid-cols-[1.5fr_1fr_1fr_1fr] gap-8 mb-8">

              {/* Brand */}
              <div className="col-span-2 sm:col-span-1">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#6426E1] flex items-center justify-center">
                    <span className="text-white font-black text-sm">AG</span>
                  </div>
                  <span className="text-white font-bold text-base">Aby Gadgets</span>
                </div>
                <div className="space-y-2 text-xs text-gray-500">
                  <p className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-600" />
                    14 Computer Village, Ikeja, Lagos
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0 text-gray-600" />
                    +234 801 234 5678
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 flex-shrink-0 text-gray-600" />
                    hello@abygadgets.com
                  </p>
                </div>
              </div>

              {/* Link columns */}
              {Object.entries(footerLinks).map(([heading, links]) => (
                <div key={heading}>
                  <p className="text-white text-xs font-bold mb-3">{heading}</p>
                  <ul className="space-y-2">
                    {links.map((l) => (
                      <li key={l}>
                        <Link to="/" className="text-gray-500 text-xs hover:text-purple-400 transition-colors">
                          {l}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom bar */}
            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-gray-600 text-xs">
                © 2025 Aby Gadgets. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                {[
                  { icon: Instagram, href: "#" },
                  { icon: Youtube,   href: "#" },
                  { icon: Twitter,   href: "#" },
                  { icon: Linkedin,  href: "#" },
                ].map(({ icon: Icon, href }) => (
                  <a
                    key={href}
                    href={href}
                    className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-gray-500 hover:text-purple-400 hover:border-purple-500 transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-4">
                {["Terms of Use", "Privacy Policy", "Cookies"].map((t) => (
                  <Link key={t} to="/" className="text-gray-600 text-xs hover:text-gray-400 transition-colors">
                    {t}
                  </Link>
                ))}
              </div>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;