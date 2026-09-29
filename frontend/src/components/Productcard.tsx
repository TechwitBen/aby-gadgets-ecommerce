import { Link } from "react-router-dom";
import { ShoppingCart, Star, Heart, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Product, formatPrice } from "@/services/products.service";
import { getTypeIcon, getTypeColor, getTwoSpecs } from "@/utils/productUtils";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useInView } from "@/hooks/useInView";

export const SkeletonCard = () => (
  <div className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse">
    <div className="aspect-square bg-muted" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-muted rounded w-1/2" />
      <div className="h-3 bg-muted rounded w-3/4" />
      <div className="h-3 bg-muted rounded w-2/3" />
      <div className="h-7 bg-muted rounded mt-2" />
    </div>
  </div>
);

interface ProductCardProps {
  product: Product;
  /** true = "NEW" badge in destructive red, false = "DEAL" badge in accent blue */
  isNewArrival: boolean;
  index: number;
}

const ProductCard = ({ product, isNewArrival, index }: ProductCardProps) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const inWishlist = isInWishlist(product.id);
  const TypeIcon = getTypeIcon(product.type);
  const typeColor = getTypeColor(product.type);
  const specs = getTwoSpecs(product);
  const isOutOfStock = !product.inStock;
  const { ref, isInView } = useInView({ threshold: 0.05 });

  const handleAddToCart = () => {
    const variant =
      product.variants?.find((v) => v.is_active && v.stock > 0) ??
      product.variants?.[0];
    if (!variant) {
      toast({ title: "Error", description: "No variants available" });
      return;
    }
    addToCart({
      id: product.id,
      variantId: variant.id,
      name: product.name,
      price: variant.price,
      image: product.image,
      quantity: 1,
      storage: variant.storage ?? undefined,
      color: variant.color,
      sku: variant.sku,
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const alreadyIn = inWishlist;
    toggleWishlist(product.id);
    toast({
      title: alreadyIn ? "Removed from wishlist" : "Added to wishlist",
      description: `${product.name} ${alreadyIn ? "removed from" : "saved to"} your wishlist`,
    });
  };

  return (
    <div
      ref={ref}
      className="group relative bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-500 overflow-hidden isolate flex flex-col"
      style={{
        transitionDelay: `${index * 80}ms`,
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(28px)",
      }}
    >
      {/* Image */}
      <div className="relative aspect-square bg-secondary overflow-hidden">
        <img
          src={product.image ?? ""}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-contain p-3 sm:p-4 transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.type && (
            <div
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${typeColor}`}
            >
              <TypeIcon className="w-2.5 h-2.5" />
              <span className="hidden sm:inline">
                {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
              </span>
            </div>
          )}
          {product.section === "New Arrivals" && (
            <span className="text-destructive-foreground px-1.5 py-0.5 rounded-full text-[10px] font-bold w-fit bg-destructive">
              NEW
            </span>
          )}
          {product.condition === "UK Used" && (
            <span className="bg-amber-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold w-fit">
              UK USED
            </span>
          )}
          {product.condition === "Open Box" && (
            <span className="bg-purple-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold w-fit">
              OPEN BOX
            </span>
          )}
          {product.condition === "Refurbished" && (
            <span className="bg-success text-success-foreground px-1.5 py-0.5 rounded-full text-[10px] font-bold w-fit">
              REFURB
            </span>
          )}
          {!isOutOfStock && !product.section && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold w-fit ${
                isNewArrival
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {isNewArrival ? "NEW" : "DEAL"}
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-foreground/80 text-background px-1.5 py-0.5 rounded-full text-[10px] font-bold w-fit">
              SOLD OUT
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-card hover:scale-110 transition-all border border-border z-30"
        >
          <Heart
            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-colors duration-200 ${inWishlist ? "fill-destructive text-destructive" : "text-muted-foreground"}`}
          />
        </button>

        {/* Desktop hover overlay */}
        {!isOutOfStock && (
          <div className="hidden sm:flex absolute inset-0 bg-foreground/60 backdrop-blur-sm items-center justify-center z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
            <div className="flex flex-col gap-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <Button
                className="bg-card text-primary hover:bg-secondary px-4 py-2 rounded-xl font-semibold text-sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddToCart();
                }}
              >
                <ShoppingCart className="w-4 h-4 mr-2" /> Quick Add
              </Button>
              <Link
                to={`/products/${product.slug}`}
                className="bg-primary hover:bg-primary-hover text-primary-foreground px-4 py-2 rounded-xl font-semibold text-sm text-center transition-colors"
              >
                View Details
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-1 sm:mb-1.5">
          <div className="flex items-center gap-1">
            <span
              className={`text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full ${typeColor}`}
            >
              {product.brand}
            </span>
            {product.condition === "Brand New" && (
              <Check className="w-3 h-3 text-success hidden sm:block" />
            )}
          </div>
          {product.rating > 0 && (
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-[11px] font-bold text-foreground">
                {product.rating}
              </span>
            </div>
          )}
        </div>

        <Link to={`/products/${product.slug}`}>
          <h3 className="font-bold text-foreground text-xs sm:text-sm leading-snug line-clamp-2 mb-1.5 sm:mb-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {specs.length > 0 && (
          <div className="hidden sm:block space-y-1 mb-3">
            {specs.slice(0, 2).map((spec, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <spec.icon className="w-3 h-3 text-muted-foreground/70 flex-shrink-0" />
                <span className="truncate">{spec.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-border mb-2">
          <div className="text-sm sm:text-base font-bold text-primary">
            {formatPrice(product.price)}
          </div>
          <div className="hidden sm:block text-[10px] text-muted-foreground truncate max-w-[90px] text-right">
            {product.condition}
          </div>
        </div>

        {!isOutOfStock ? (
          <div className="flex gap-1.5 sm:hidden">
            {/* Mobile: icon-only cart button so it never wraps */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCart();
              }}
              aria-label="Add to cart"
              className="w-9 h-9 min-w-[36px] bg-primary hover:bg-primary-hover text-primary-foreground rounded-xl flex items-center justify-center active:scale-95 transition-all flex-shrink-0"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
            <Link
              to={`/products/${product.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl border border-border hover:border-primary hover:text-primary text-muted-foreground text-[11px] font-semibold transition-colors whitespace-nowrap"
            >
              <Eye className="w-3 h-3" /> View Details
            </Link>
          </div>
        ) : (
          <div className="py-2 text-center text-[11px] text-muted-foreground font-medium border border-border rounded-xl sm:hidden">
            Sold out
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;