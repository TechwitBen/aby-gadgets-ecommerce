import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
];

const Testimonials = () => {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-lg font-semibold text-foreground mb-8">The Proof Is in Their Words</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-background border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
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
                  <span className="text-sm font-medium text-foreground">{testimonial.name}</span>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="text-accent">◉</span> {testimonial.location}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <div className="flex justify-center gap-4 mt-8">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-muted"
          >
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-muted"
          >
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
