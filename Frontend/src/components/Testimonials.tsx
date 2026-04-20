import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
 
const testimonials4 = [
  { quote: "I was honestly scared of buying a used phone online, but Aby Gadgets surprised me. They inspected the phone before selling it to me, gave me proof, and it's been working perfectly since. Real legit guys.", name: "Ada Chidim",    location: "Abuja",         avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" },
  { quote: "Good gadgets, fair prices, and they actually care about the customer. It feels different from the usual market experience. Aby Gadgets has earned my trust.",                                                 name: "Mercy Ifeoma",   location: "Enugu",         avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" },
  { quote: "I did a swap with my old laptop and added some cash. The whole process was smooth, no stress, no stories. Now I'm using a better laptop and it feels like new. Highly recommend Aby Gadgets.",             name: "Yusuf Ahmed",    location: "Lagos",         avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" },
  { quote: "Excellent service! The delivery was faster than expected and the phone was exactly as described. Will definitely buy again.",                                                                                name: "Chinedu Okafor", location: "Port Harcourt", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face" },
  { quote: "The payment plan option helped me get the laptop I needed for my studies. No hidden charges, everything was transparent.",                                                                                   name: "Fatima Bello",   location: "Kano",          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face" },
  { quote: "Best gadget store in Nigeria! Authentic products and amazing customer service. They even helped me set up my new phone.",                                                                                   name: "Emeka Nwosu",    location: "Owerri",        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face" },
];
 
const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
 
  // Responsive items per page
  const [itemsPerPage, setItemsPerPage] = useState(3);
  // We'll just use CSS to hide extras on mobile
 
  const totalSlides = Math.ceil(testimonials4.length / 3);
 
  const nextSlide = () => setCurrentIndex((p) => (p + 1) % totalSlides);
  const prevSlide = () => setCurrentIndex((p) => (p - 1 + totalSlides) % totalSlides);
 
  const visibleTestimonials = testimonials4.slice(currentIndex * 3, currentIndex * 3 + 3);
 
  return (
    <section className="py-10 sm:py-16 md:py-20 bg-[#F5F5F5]">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-8 sm:mb-10 text-center">
          The Proof Is in Their Words
        </h2>
 
        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 mb-8">
          {visibleTestimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="text-primary/40 text-3xl font-serif leading-none mb-3">"</div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                {testimonial.quote}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div>
                    <span className="text-sm font-semibold text-foreground block">{testimonial.name}</span>
                    <span className="text-xs text-muted-foreground">{testimonial.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
 
        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="icon" className="rounded-full border-gray-300 hover:bg-gray-100 w-9 h-9 sm:w-10 sm:h-10" onClick={prevSlide}>
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </Button>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`rounded-full transition-all ${currentIndex === index ? "w-5 h-2.5 bg-foreground" : "w-2.5 h-2.5 bg-gray-300"}`}
              />
            ))}
          </div>
          <Button variant="outline" size="icon" className="rounded-full border-gray-300 hover:bg-gray-100 w-9 h-9 sm:w-10 sm:h-10" onClick={nextSlide}>
            <ChevronRight className="h-4 w-4 text-foreground" />
          </Button>
        </div>
      </div>
    </section>
  );
};
 
export default Testimonials;