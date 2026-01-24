import productPhone from "@/assets/product-phone.png";
import productLaptop from "@/assets/product-laptop.png";
import productTablet from "@/assets/product-tablet.png";
import productGames from "@/assets/product-games.png";
import productAccessories from "@/assets/product-accessories.png";

const categories = [
  { name: "Phones", image: productPhone },
  { name: "Laptops", image: productLaptop },
  { name: "Tabs", image: productTablet },
  { name: "Games", image: productGames },
  { name: "Accessories", image: productAccessories },
];

const ProductCategories = () => {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Our Products</h2>
          <p className="text-muted-foreground">
            Quality tech you can trust — verified, affordable, and ready for you.
          </p>
        </div>

        <div className="flex justify-between items-center gap-4 md:gap-8 overflow-x-auto pb-4">
          {categories.map((category) => (
            <div 
              key={category.name}
              className="flex flex-col items-center gap-4 min-w-[100px] cursor-pointer group"
            >
              <div className="w-24 h-24 md:w-28 md:h-28 bg-muted rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all group-hover:scale-105 overflow-hidden p-3">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-sm font-medium text-foreground">{category.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;
