import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap } from "lucide-react";
import dealImage from "@/assets/service-financing.png"; // placeholder for now, adjust extension if needed

// ── Flash sale end time. Set this to the real end of your sale (Lagos time = +01:00). ──
const FLASH_SALE_ENDS_AT = "2026-10-12T23:59:59+01:00";

interface CategoryPromo {
  id: string;
  eyebrow: string;
  title: [string, string]; // two lines
  description: string;
  pill: string;
  to: string;
  image: string; // swap each card's image here later
  imageAlt: string;
  theme: "violet" | "light" | "deep";
}

// ── Content & images live here. Replace `image` per card later. ──
const promos: CategoryPromo[] = [
  {
    id: "smartphones",
    eyebrow: "Smartphones",
    title: ["Latest Phones.", "Better Deals."],
    description: "Get the newest models with massive discounts.",
    pill: "Up to 50% Off",
    to: "/products",
    image: dealImage,
    imageAlt: "Smartphones",
    theme: "violet",
  },
  {
    id: "laptops",
    eyebrow: "Laptops",
    title: ["Work Smarter.", "Go Further."],
    description: "Powerful laptops for work, study and play.",
    pill: "Up to 40% Off",
    to: "/products",
    image: dealImage,
    imageAlt: "Laptops",
    theme: "light",
  },
  {
    id: "accessories",
    eyebrow: "Accessories",
    title: ["Small Gadgets.", "Big Value."],
    description: "From chargers to earbuds, find your perfect add-ons.",
    pill: "Up to 50% Off",
    to: "/products",
    image: dealImage,
    imageAlt: "Accessories",
    theme: "deep",
  },
];

const promoThemes = {
  violet: {
    card: "bg-gradient-to-b from-[#8267EC] to-[#6B4DDF]",
    eyebrow: "text-white/75",
    title: "text-white",
    text: "text-white/80",
    pill: "bg-[#4A2BA8] text-white",
  },
  light: {
    card: "bg-gradient-to-b from-[#E8E0FD] to-[#CBBBF7]",
    eyebrow: "text-[#4A3F8F]",
    title: "text-[#150F2E]",
    text: "text-[#3B3555]",
    pill: "bg-[#3F2AA5] text-white",
  },
  deep: {
    card: "bg-gradient-to-b from-[#3E2192] to-[#2E1776]",
    eyebrow: "text-white/70",
    title: "text-white",
    text: "text-white/75",
    pill: "bg-[#5B3BE0] text-white",
  },
} as const;

// ── Countdown ────────────────────────────────────────────────────────────────
const getTimeLeft = (end: number) => {
  const s = Math.floor(Math.max(0, end - Date.now()) / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    mins: Math.floor((s % 3600) / 60),
    secs: s % 60,
  };
};

const useCountdown = (endsAt: string) => {
  const end = useMemo(() => new Date(endsAt).getTime(), [endsAt]);
  const [time, setTime] = useState(() => getTimeLeft(end));

  useEffect(() => {
    setTime(getTimeLeft(end));
    const id = setInterval(() => setTime(getTimeLeft(end)), 1000);
    return () => clearInterval(id);
  }, [end]);

  return time;
};

const pad = (n: number) => String(n).padStart(2, "0");

const TimerUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex h-[66px] w-[58px] flex-col items-center justify-center rounded-xl bg-[#E4DDFB] sm:h-[92px] sm:w-[88px] lg:h-[72px] lg:w-[64px] xl:h-[92px] xl:w-[88px] 2xl:h-[104px] 2xl:w-[100px]">
    <span className="text-2xl font-bold tabular-nums leading-none text-[#2A1A78] sm:text-4xl lg:text-2xl xl:text-4xl 2xl:text-[44px]">
      {pad(value)}
    </span>
    <span className="mt-1.5 text-[10px] text-[#4A3F8F] sm:text-xs lg:text-[10px] xl:text-xs 2xl:text-sm">
      {label}
    </span>
  </div>
);

const Colon = () => (
  <span aria-hidden className="pb-4 text-xl font-bold text-[#2A1A78] sm:pb-5 sm:text-3xl lg:text-xl xl:text-3xl">
    :
  </span>
);

// ── Left: flash sale card (content centered) ─────────────────────────────────
const FlashSaleCard = () => {
  const t = useCountdown(FLASH_SALE_ENDS_AT);

  return (
    <article className="flex flex-col items-center justify-center rounded-2xl bg-[#EEEAFD] px-5 py-10 text-center sm:px-8 sm:py-12 md:col-span-3 lg:col-span-1 lg:px-6 lg:py-10 xl:px-10">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4A2BD6] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white sm:text-sm">
        <Zap className="h-4 w-4 fill-white" aria-hidden />
        Flash Sale
      </span>

      <h2 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-4xl xl:text-5xl 2xl:text-[64px]">
        <span className="block text-[#150F2E]">Top Tech.</span>
        <span className="block text-[#4A2BD6]">Limited Time.</span>
      </h2>

      <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#3B3555] sm:max-w-md sm:text-base lg:text-sm xl:text-base 2xl:text-lg">
        Get up to 50% off on selected phones, laptops and accessories. Don’t
        miss out!
      </p>

      <div
        role="timer"
        aria-label={`Sale ends in ${t.days} days, ${t.hours} hours, ${t.mins} minutes`}
        className="mt-7 flex items-center justify-center gap-1.5 sm:gap-3 lg:gap-1.5 xl:gap-3"
      >
        <TimerUnit value={t.days} label="Days" />
        <Colon />
        <TimerUnit value={t.hours} label="Hours" />
        <Colon />
        <TimerUnit value={t.mins} label="Mins" />
        <Colon />
        <TimerUnit value={t.secs} label="Secs" />
      </div>

      <Link
        to="/products#sweet-deals"
        className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-[#4A2BD6] px-8 text-sm font-semibold text-white transition-colors hover:bg-[#3C21B8] sm:h-14 sm:text-base"
      >
        Shop Now
        <ArrowRight className="h-5 w-5" aria-hidden />
      </Link>
    </article>
  );
};

// ── Right: tall category cards (whole card is a link) ────────────────────────
const PromoCard = ({ promo }: { promo: CategoryPromo }) => {
  const t = promoThemes[promo.theme];
  return (
    <Link
      to={promo.to}
      aria-label={`${promo.eyebrow}: ${promo.pill}`}
      className={`group flex min-h-[440px] flex-col overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-1 ${t.card}`}
    >
      <div className="px-6 pt-7">
        <p className={`text-xs font-medium uppercase tracking-[0.18em] ${t.eyebrow}`}>
          {promo.eyebrow}
        </p>
        <h3 className={`mt-3 text-2xl font-bold leading-tight tracking-tight ${t.title}`}>
          <span className="block">{promo.title[0]}</span>
          <span className="block">{promo.title[1]}</span>
        </h3>
        <p className={`mt-3 text-sm leading-relaxed ${t.text}`}>
          {promo.description}
        </p>
        <span className={`mt-5 inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold ${t.pill}`}>
          {promo.pill}
        </span>
      </div>

      {/* Image fills the remaining space and sits on the bottom edge */}
      <div className="relative mt-4 min-h-[200px] flex-1">
        <img
          src={promo.image}
          alt={promo.imageAlt}
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain object-bottom transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    </Link>
  );
};

const DealsSection = () => (
  // Same outer/inner padding as Shop By Category so the edges line up
  <section className="w-full bg-background px-3 py-12 sm:px-5 md:py-16 lg:px-6">
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 lg:min-h-[560px] lg:grid-cols-[2.6fr_1fr_1fr_1fr] lg:gap-6 xl:min-h-[600px]">
        <FlashSaleCard />
        {promos.map((promo) => (
          <PromoCard key={promo.id} promo={promo} />
        ))}
      </div>
    </div>
  </section>
);

export default DealsSection;