import productPhone from "@/assets/product-phone.png";
import productLaptop from "@/assets/product-laptop.png";
import productTablet from "@/assets/product-tablet.png";
import productGames from "@/assets/product-games.png";
import productAccessories from "@/assets/product-accessories.png";
import { useInView } from "@/hooks/useInView";

const categories = [
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
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">

        {/* Heading */}
        <div
          ref={headingRef}
          className="mb-12 transition-all duration-700 ease-out"
          style={{
            opacity: headingInView ? 1 : 0,
            transform: headingInView ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Our Products</h2>
          <p className="text-muted-foreground">
            Quality tech you can trust — verified, affordable, and ready for you.
          </p>
        </div>

        {/* Category Icons */}
        <div ref={gridRef} className="grid grid-cols-5 gap-4 md:gap-8">
          {categories.map((category, i) => (
            <div
              key={category.name}
              className="flex flex-col items-center gap-3 md:gap-4 cursor-pointer group transition-all duration-700 ease-out"
              style={{
                transitionDelay: `${i * 100}ms`,
                opacity: gridInView ? 1 : 0,
                transform: gridInView ? "translateY(0)" : "translateY(28px)",
              }}
            >
              <div className="w-full aspect-square bg-muted rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105 overflow-hidden p-3">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <span className="text-xs sm:text-sm font-medium text-foreground text-center">{category.name}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ProductCategories;