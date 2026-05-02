import guidePhones from "@/assets/guide-phones.jpg";
import guideInspection from "@/assets/guide-inspection.jpg";

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

const GadgetGuide = () => {
  return (
    <section className="py-10 sm:py-16 md:py-20 bg-[#F5F5F5]">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
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
          {guides.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden"
            >
              {/* Mobile: stacked. sm+: side by side */}
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-40 md:w-52 h-44 sm:h-auto flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-4 sm:p-5 md:p-6">
                  <span className="inline-block bg-[#f0ebff] text-[#6426E1] text-[11px] font-semibold px-2.5 py-1 rounded-lg mb-2">
                    {item.tag}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GadgetGuide;