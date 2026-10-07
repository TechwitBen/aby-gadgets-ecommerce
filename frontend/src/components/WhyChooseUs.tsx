import { BadgeCheck, Headset, ShieldCheck, Truck, type LucideIcon } from "lucide-react";

interface Reason {
  icon: LucideIcon;
  title: string;
  description: string;
}

// ── Edit the content here ──
const reasons: Reason[] = [
  {
    icon: ShieldCheck,
    title: "Genuine Products",
    description:
      "Every device is authentic and carefully checked before it reaches you.",
  },
  {
    icon: BadgeCheck,
    title: "Backed by Warranty",
    description:
      "Shop with confidence. Your purchase comes with warranty cover.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description:
      "Express shipping across Nigeria, free on orders over ₦50,000.",
  },
  {
    icon: Headset,
    title: "Reliable Support",
    description:
      "Real people ready to help you before and after you buy.",
  },
];

const WhyChooseUs = () => (
  // Same outer/inner padding as Shop By Category so the edges line up
  <section className="w-full bg-[#F6F4FB] px-3 py-12 sm:px-5 md:py-16 lg:px-6">
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Heading */}
      <div className="mb-8 md:mb-10">
        <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl lg:text-[28px]">
          Why Choose Gadget Plug
        </h2>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Great gadgets, backed by service you can rely on
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
        {reasons.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-2xl border border-gray-200/80 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg lg:p-7"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6426E1]/10 text-[#6426E1]">
              <Icon className="h-6 w-6" aria-hidden />
            </div>
            <h3 className="mt-5 text-base font-semibold text-gray-900 sm:text-lg">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              {description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhyChooseUs;