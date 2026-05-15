import guidePhones from "@/assets/guide-phones.jpg";
import guideInspection from "@/assets/guide-inspection.jpg";
import { useInView } from "@/hooks/useInView";

const guides = [
  {
    image: guidePhones,
    tag: "Battery tips",
    title: "Tiny habits that matter",
    body: "Avoid letting your phone hit 0% daily — modern batteries prefer partial cycles. Sustained max volume also stresses speakers and earphones over time.",
  },
  {
    image: guideInspection,
    tag: "Before you buy",
    title: "Physical inspection checklist",
    body: "Check for body gaps near cameras and ports. Test touch responsiveness across the full display and look for dead pixels or light bleed at the edges.",
  },
];

const GuideCard = ({
  item,
  index,
}: {
  item: (typeof guides)[number];
  index: number;
}) => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden
                 transition-all duration-700 ease-out hover:shadow-md"
      style={{
        transitionDelay: `${index * 120}ms`,
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(24px)",
      }}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-40 md:w-52 h-44 sm:h-auto flex-shrink-0 overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
        <div className="flex-1 p-4 sm:p-5 md:p-6">
          <span className="inline-block bg-[#f0ebff] text-[#6426E1] text-[11px] font-semibold px-2.5 py-1 rounded-lg mb-2">
            {item.tag}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">{item.title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{item.body}</p>
        </div>
      </div>
    </div>
  );
};

const GadgetGuide = () => {
  const { ref: headerRef, isInView: headerInView } = useInView();

  return (
    <section className="py-10 sm:py-16 md:py-20 bg-[#F5F5F5]">
      <div className="container mx-auto px-4 sm:px-6">

        {/* Header */}
        <div
          ref={headerRef}
          className="flex items-center gap-3 mb-6 sm:mb-8 transition-all duration-700 ease-out"
          style={{
            opacity: headerInView ? 1 : 0,
            transform: headerInView ? "translateX(0)" : "translateX(-20px)",
          }}
        >
          <div className="w-10 h-10 rounded-2xl bg-[#f0ebff] flex items-center justify-center flex-shrink-0">
            <span className="text-[#6426E1] text-base">📖</span>
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground">
              The Aby Gadgets Guide
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
              Tips to get the most from your device
            </p>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-5 max-w-3xl mx-auto">
          {guides.map((item, i) => (
            <GuideCard key={item.title} item={item} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default GadgetGuide;