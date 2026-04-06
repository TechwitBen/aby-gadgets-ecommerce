import guidePhones from "@/assets/guide-phones.jpg";
import guideInspection from "@/assets/guide-inspection.jpg";

const GadgetGuide = () => {
  return (
    <section className="py-12 md:py-20 bg-[#F5F5F5]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">The Aby Gadgets Guide</h2>
        </div>

        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Tiny habits section */}
          <div className="bg-background rounded-2xl p-4 md:p-6 shadow-sm border border-border">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-56 h-48 rounded-xl overflow-hidden flex-shrink-0">
                <img 
                  src={guidePhones} 
                  alt="Phone charging" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">Tiny habits that matter</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Letting your phone battery go entirely flat: occasional full discharge is okay, but habitually letting batteries hit 0% regularly shortens their lifespan. Modern batteries are optimized for partial charge cycles.
                  <br /><br />
                  Using the highest volume damages speakers: playing at extreme volumes consistently can damage small phone speakers or earphones (and definitely damages hearing). Sudden loud bursts or sustained clipping can mechanically or thermally stress speaker drivers. Keep volume reasonable and use quality audio files. Evidence from audio specialists and user experience suggests volume can damage speakers over time.
                </p>
              </div>
            </div>
          </div>

          {/* Physical inspection section */}
          <div className="bg-background rounded-2xl p-4 md:p-6 shadow-sm border border-border">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-56 h-48 rounded-xl overflow-hidden flex-shrink-0">
                <img 
                  src={guideInspection} 
                  alt="Phone inspection" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">
                  Physical inspection checklist (what to look for with your eyes)
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Body gaps / misaligned seams: uneven gaps near cameras, screen edges, or charging ports can indicate a refurbished or tampered device. 
                  <br /><br />
                  Screen quality: Look for dead pixels, discoloration, or screen burn-in. Test touch responsiveness across the entire display. Check for light bleed around edges when viewing dark content.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GadgetGuide;