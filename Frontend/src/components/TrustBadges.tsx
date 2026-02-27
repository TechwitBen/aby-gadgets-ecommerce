import { ShieldCheck, Truck, Clock } from "lucide-react";

const badges = [
  {
    icon: ShieldCheck,
    title: "Guaranteed Originality",
  },
  {
    icon: Truck,
    title: "Secure Delivery",
  },
  {
    icon: Clock,
    title: "Inspect Before You Buy",
  }
];

const TrustBadges = () => {
  return (
    <section className="py-12 bg-[hsl(200_60%_95%)]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {badges.map((badge) => (
            <div key={badge.title} className="flex flex-col items-center gap-4 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <badge.icon className="w-10 h-10 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground text-lg">{badge.title}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
