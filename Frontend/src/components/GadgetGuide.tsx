import guidePhones     from "@/assets/guide-phones.jpg";
import guideInspection from "@/assets/guide-inspection.jpg";
 
const GadgetGuide = () => {
  return (
    <section className="py-10 sm:py-16 md:py-20 bg-[#F5F5F5]">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">The Aby Gadgets Guide</h2>
          <p className="text-muted-foreground text-sm mt-1.5 max-w-md mx-auto">
            Tips to help you get the most from your device.
          </p>
        </div>
 
        <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
          {[
            {
              image: guidePhones,
              alt: "Phone charging",
              title: "Tiny habits that matter",
              body: "Letting your phone battery go entirely flat: occasional full discharge is okay, but habitually letting batteries hit 0% regularly shortens their lifespan. Modern batteries are optimized for partial charge cycles.\n\nUsing the highest volume damages speakers: playing at extreme volumes consistently can damage small phone speakers or earphones (and definitely damages hearing). Sudden loud bursts or sustained clipping can mechanically or thermally stress speaker drivers.",
            },
            {
              image: guideInspection,
              alt: "Phone inspection",
              title: "Physical inspection checklist",
              body: "Body gaps / misaligned seams: uneven gaps near cameras, screen edges, or charging ports can indicate a refurbished or tampered device.\n\nScreen quality: Look for dead pixels, discoloration, or screen burn-in. Test touch responsiveness across the entire display. Check for light bleed around edges when viewing dark content.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-background rounded-2xl overflow-hidden shadow-sm border border-border">
              <div className="flex flex-col sm:flex-row gap-0 sm:gap-5 items-stretch">
                {/* Image */}
                <div className="w-full sm:w-44 md:w-56 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Content */}
                <div className="flex-1 p-4 sm:p-5 md:p-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-foreground mb-2.5">{item.title}</h3>
                  {item.body.split("\n\n").map((para, i) => (
                    <p key={i} className={`text-muted-foreground text-sm leading-relaxed ${i > 0 ? "mt-3" : ""}`}>
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
 
export default GadgetGuide ;