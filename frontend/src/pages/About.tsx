import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BadgePercent,
  CheckCircle2,
  ChevronRight,
  Headphones,
  Package,
  RotateCcw,
  ShieldCheck,
  Star,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks/useInView";
// Adjust this path/name to match your existing testimonial component
import Testimonials from "@/components/Testimonials";
import heroImage from "@/assets/heroBackgroundimage-gadget.jpeg";

// ── Data ──────────────────────────────────────────────────────────────────────

const checklist = [
  "100% genuine, sealed gadgets from verified suppliers",
  "Same-day delivery in Lagos, next-day nationwide",
  "Warranty cover and easy returns on every order",
];

const reasons: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: ShieldCheck,
    title: "100% Authentic Gadgets",
    body: "Every device is sourced from verified manufacturers and distributors. No fakes, no refurbished surprises.",
  },
  {
    icon: Award,
    title: "Warranty Covered",
    body: "Your purchase is protected. If something is wrong, we handle the warranty claim for you.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    body: "Lagos orders ship the moment payment clears, with next-day delivery across Nigeria.",
  },
  {
    icon: Headphones,
    title: "Real Human Support",
    body: "Talk to our in-house tech specialists any time. No bots and no scripts, just real help.",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    body: "Changed your mind or got a faulty unit? Return it within 30 days without the runaround.",
  },
  {
    icon: BadgePercent,
    title: "Honest Prices",
    body: "Fair, transparent pricing with regular deals, so you never overpay for the gadgets you want.",
  },
];

const stats: { icon: LucideIcon; value: string; label: string }[] = [
  { icon: Award, value: "5+", label: "Years Trusted" },
  { icon: Package, value: "500+", label: "Premium Products" },
  { icon: Users, value: "50K+", label: "Happy Customers" },
  { icon: Star, value: "830+", label: "Five-Star Reviews" },
];

// ── Small helper: fade/slide in when scrolled into view ──────────────────────

const Reveal = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(20px)",
      }}
    >
      {children}
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const AboutPage = () => (
  <div className="min-h-screen overflow-x-hidden bg-white">
    {/* ══ PAGE BANNER ═════════════════════════════════════════════════════ */}
    <section className="relative isolate overflow-hidden">
      <img
        src={heroImage}
        alt=""
        aria-hidden
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#14072e]/95 via-[#14072e]/80 to-[#14072e]/40" />

      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          About Us
        </h1>
        <nav
          aria-label="Breadcrumb"
          className="mt-4 flex items-center gap-1.5 text-sm text-white/70"
        >
          <Link to="/" className="transition-colors hover:text-white">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          <span className="text-white">About Us</span>
        </nav>
      </div>
    </section>

    {/* ══ INTRO ═══════════════════════════════════════════════════════════ */}
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 sm:px-10 lg:grid-cols-2 lg:gap-20 lg:px-16">
        <Reveal>
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -left-4 -top-4 h-full w-full rounded-3xl bg-[#6426E1]/10" />
            <img
              src={heroImage}
              alt="GadgetPlug team and products"
              className="relative aspect-[4/5] w-full rounded-3xl object-cover"
            />
            <div className="absolute -bottom-5 -right-3 rounded-2xl bg-white px-5 py-4 shadow-xl sm:-right-6">
              <p className="text-3xl font-bold text-[#6426E1]">5+</p>
              <p className="text-xs font-medium text-gray-500">
                Years of trusted service
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <p className="mb-3 text-sm font-semibold text-[#6426E1]">
            About GadgetPlug
          </p>
          <h2 className="mb-5 text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl">
            Your Plug for Genuine Gadgets You Can Trust
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-gray-500 sm:text-base">
            GadgetPlug exists because buying tech in Nigeria should not feel
            like a gamble. We bring the latest phones, laptops, tablets and
            wearables straight to your door, all verified, all backed by a
            warranty.
          </p>
          <p className="mb-6 text-sm leading-relaxed text-gray-500 sm:text-base">
            Our team works closely with every customer, from picking the right
            device to after-sales support, so you always get honest advice and
            fair prices.
          </p>

          <ul className="mb-8 space-y-3">
            {checklist.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 text-sm text-gray-700 sm:text-base"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#6426E1]" />
                {item}
              </li>
            ))}
          </ul>

          <Link to="/products">
            <Button className="rounded-full bg-[#6426E1] px-7 py-5 text-sm font-semibold text-white hover:bg-[#5420c4]">
              Shop Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </Reveal>
      </div>
    </section>

    {/* ══ WHY CHOOSE US ═══════════════════════════════════════════════════ */}
    <section className="border-t border-gray-100 bg-gray-50 py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Why Choose Us
          </h2>
          <p className="text-sm text-gray-500 sm:text-base">
            Everything we do is built around one goal: making sure the gadget
            you pay for is the gadget you get, delivered fast and fully
            supported.
          </p>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r, i) => (
            <Reveal key={r.title} delay={(i % 3) * 90}>
              <div className="h-full rounded-2xl border border-gray-100 bg-white p-7 transition-shadow duration-300 hover:shadow-lg">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#6426E1]/10">
                  <r.icon className="h-6 w-6 text-[#6426E1]" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-gray-900">
                  {r.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  {r.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* ══ TESTIMONIALS (existing component) ═══════════════════════════════ */}
    <Testimonials />

    {/* ══ STATS ═══════════════════════════════════════════════════════════ */}
    <section className="pb-16 pt-4 sm:pb-20 lg:pb-24">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-6 sm:px-10 lg:grid-cols-4 lg:gap-6 lg:px-16">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 80}>
            <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#6426E1]/10">
                <s.icon className="h-6 w-6 text-[#6426E1]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  {s.value}
                </p>
                <p className="text-xs text-gray-500 sm:text-sm">{s.label}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  </div>
);

export default AboutPage;