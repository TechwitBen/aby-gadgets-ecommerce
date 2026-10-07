import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import productPhone from "@/assets/product-phone.png";
import productLaptop from "@/assets/product-laptop.png";
import productTablet from "@/assets/product-tablet.png";
import productGames from "@/assets/product-games.png";
import productAccessories from "@/assets/product-accessories.png";
import { useInView } from "@/hooks/useInView";

// `to` defaults to /categories. Point each one at a more specific route/filter
// when you have one, e.g. to: "/products?category=phones"
const categories: { name: string; image: string; to?: string }[] = [
  { name: "Phones",      image: productPhone },
  { name: "Laptops",     image: productLaptop },
  { name: "Tabs",        image: productTablet },
  { name: "Games",       image: productGames },
  { name: "Accessories", image: productAccessories },
];

const ProductCategories = () => {
  const { ref: headingRef, isInView: headingInView } = useInView();
  const { ref: gridRef,    isInView: gridInView }    = useInView();

  return (
    // Outer padding matches HeroSection so the left/right edges line up with the hero card
    <section className="w-full bg-background px-3 sm:px-5 lg:px-6 py-12 md:py-16">
      <div className="px-4 sm:px-6 lg:px-8">

        {/* Heading row */}
        <div
          ref={headingRef}
          className="mb-8 md:mb-10 flex items-center justify-between gap-4 transition-all duration-700 ease-out"
          style={{
            opacity: headingInView ? 1 : 0,
            transform: headingInView ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <h2 className="text-xl md:text-2xl lg:text-[28px] font-bold tracking-tight text-foreground">
            Shop By Category
          </h2>

          <Link
            to="/categories"
            className="inline-flex items-center gap-0.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-[#6426E1] transition-colors whitespace-nowrap"
          >
            View All Categories
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {/* Mobile: 3 per row, last row centered. sm and up: one even row of 5. */}
        <div
          ref={gridRef}
          className="flex flex-wrap justify-center gap-x-4 gap-y-6
                     sm:grid sm:grid-cols-5 sm:justify-normal sm:gap-x-5 lg:gap-x-6 sm:gap-y-8"
        >
          {categories.map((category, i) => (
            <Link
              key={category.name}
              to={category.to ?? "/categories"}
              aria-label={`Shop ${category.name}`}
              className="group flex flex-col items-center gap-3 md:gap-4
                         basis-[calc((100%_-_2rem)/3)] sm:basis-auto
                         transition-all duration-700 ease-out"
              style={{
                transitionDelay: `${i * 100}ms`,
                opacity: gridInView ? 1 : 0,
                transform: gridInView ? "translateY(0)" : "translateY(28px)",
              }}
            >
              <div
                className="mx-auto w-[85%] aspect-square rounded-2xl overflow-hidden
                           bg-gradient-to-br from-[#F1F4F8] to-[#E4EAF1]
                           transition-all duration-300
                           group-hover:-translate-y-1 group-hover:shadow-md"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <span className="text-xs sm:text-sm lg:text-[15px] font-semibold text-foreground text-center">
                {category.name}
              </span>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ProductCategories;