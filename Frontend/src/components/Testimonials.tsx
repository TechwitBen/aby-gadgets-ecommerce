import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const testimonials = [
  {
    quote: "I was honestly scared of buying a used phone online, but Aby Gadgets surprised me. They inspected the phone before selling it to me, gave me proof, and it's been working perfectly since. Real legit guys.",
    name: "Ada Chidim",
    location: "Abuja",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  },
  {
    quote: "Good gadgets, fair prices, and they actually care about the customer. It feels different from the usual market experience. Aby Gadgets has earned my trust.",
    name: "Mercy Ifeoma",
    location: "Enugu",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
  {
    quote: "I did a swap with my old laptop and added some cash. The whole process was smooth, no stress, no stories. Now I'm using a better laptop and it feels like new. Highly recommend Aby Gadgets.",
    name: "Yusuf Ahmed",
    location: "Lagos",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    quote: "Excellent service! The delivery was faster than expected and the phone was exactly as described. Will definitely buy again.",
    name: "Chinedu Okafor",
    location: "Port Harcourt",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  },
  {
    quote: "The payment plan option helped me get the laptop I needed for my studies. No hidden charges, everything was transparent.",
    name: "Fatima Bello",
    location: "Kano",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
  },
  {
    quote: "Best gadget store in Nigeria! Authentic products and amazing customer service. They even helped me set up my new phone.",
    name: "Emeka Nwosu",
    location: "Owerri",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face",
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3;

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + itemsPerPage >= testimonials.length ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - itemsPerPage : prevIndex - 1
    );
  };

  const visibleTestimonials = testimonials.slice(
    currentIndex, 
    currentIndex + itemsPerPage
  );

  return (
    <section className="py-12 md:py-20 bg-[#F5F5F5]">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-10 text-center">
          The Proof Is in Their Words
        </h2>
        
        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {visibleTestimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <span className="text-sm font-medium text-foreground block">{testimonial.name}</span>
                    <span className="text-xs text-muted-foreground">{testimonial.location}</span>
                  </div>
                </div>
                <div className="text-accent text-xl">"</div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation arrows and indicators */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full border-gray-300 hover:bg-gray-100"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </Button>
          
          {/* Dots indicator */}
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.ceil(testimonials.length / itemsPerPage) }).map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentIndex === index * itemsPerPage ? 'bg-foreground' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentIndex(index * itemsPerPage)}
              />
            ))}
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full border-gray-300 hover:bg-gray-100"
            onClick={nextSlide}
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </Button>
        </div>

        {/* Mobile indicators */}
        <div className="flex items-center justify-center gap-2 mt-6 md:hidden">
          {Array.from({ length: testimonials.length }).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                currentIndex === index ? 'bg-foreground' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;