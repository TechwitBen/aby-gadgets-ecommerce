import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { formatPrice, type Product } from "@/services/products.service";
import { getTwoSpecs } from "@/utils/productUtils";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useInView } from "@/hooks/useInView";

interface ShowcaseProductCardProps {
  product: Product;
  badge?: string; // e.g. "New" or "Deal"
  index?: number; // used for the staggered entrance
}

const ShowcaseProductCard = ({
  product,
  badge,
  index = 0,
}: ShowcaseProductCardProps) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { ref, isInView } = useInView({ threshold: 0.05 });

  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = !product.inStock;
  const detailsPath = `/products/${product.slug}`;
  const meta = [product.brand, product.condition].filter(Boolean).join(" · ");
  const specLine = getTwoSpecs(product)
    .map((s) => s.value)
    .join(" · ");

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    toast({
      title: inWishlist ? "Removed from wishlist" : "Added to wishlist",
      description: `${product.name} ${inWishlist ? "removed from" : "saved to"} your wishlist`,
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  return (
    // Outer wrapper handles the entrance animation so its delay never affects hover effects
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        transitionDelay: `${index * 80}ms`,
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(24px)",
      }}
    >
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg">
        {/* Image */}
        <div className="relative">
          <Link
            to={detailsPath}
            className="block aspect-square bg-gray-50"
            aria-label={`View ${product.name}`}
          >
            <img
              src={product.image ?? ""}
              alt={product.name}
              className="h-full w-full object-contain p-4 sm:p-6 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          {(isOutOfStock || badge) && (
            <span
              className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white ${
                isOutOfStock ? "bg-gray-900" : "bg-[#6426E1]"
              }`}
            >
              {isOutOfStock ? "Sold out" : badge}
            </span>
          )}

          <button
            onClick={handleWishlist}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition hover:scale-110"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                inWishlist ? "fill-red-500 text-red-500" : "text-gray-500"
              }`}
            />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-3 sm:p-4">
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="truncate text-[11px] font-medium uppercase tracking-wide text-gray-500">
              {meta}
            </p>
            {product.rating > 0 && (
              <div className="flex shrink-0 items-center gap-0.5">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-[11px] font-semibold text-gray-900">
                  {product.rating}
                </span>
              </div>
            )}
          </div>

          <Link to={detailsPath}>
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 transition-colors hover:text-[#6426E1] sm:text-[15px]">
              {product.name}
            </h3>
          </Link>

          {specLine && (
            <p className="mt-1 truncate text-xs text-gray-500">{specLine}</p>
          )}

          {/* Price + add to cart, always visible (no hover overlay) */}
          <div className="mt-auto flex items-center justify-between gap-2 pt-3">
            <span className="text-base font-bold text-gray-900 sm:text-lg">
              {formatPrice(product.price)}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              aria-label={isOutOfStock ? "Sold out" : "Add to cart"}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#6426E1] text-white transition hover:bg-[#5220c4] active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </article>
    </div>
  );
};

export default ShowcaseProductCard;