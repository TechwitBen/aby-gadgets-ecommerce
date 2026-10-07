import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { formatPrice, type Product } from "@/services/products.service";
import { getTwoSpecs } from "@/utils/productUtils";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useInView } from "@/hooks/useInView";

interface Props {
  product: Product;
  badge?: string;
  index?: number;
}

const ShowcaseProductListItem = ({ product, badge, index = 0 }: Props) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { ref, isInView } = useInView({ threshold: 0.05 });

  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = !product.inStock;
  const detailsPath = `/products/${product.slug}`;
  const meta = [product.brand, product.condition].filter(Boolean).join(" · ");
  const specLine = getTwoSpecs(product).map((s) => s.value).join(" · ");

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
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        transitionDelay: `${index * 60}ms`,
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(16px)",
      }}
    >
      <article className="group flex gap-3 rounded-2xl border border-gray-200/80 bg-white p-3 transition-all duration-300 hover:border-gray-300 hover:shadow-lg sm:gap-5 sm:p-4">
        {/* Image */}
        <Link
          to={detailsPath}
          aria-label={`View ${product.name}`}
          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-50 sm:h-32 sm:w-32"
        >
          <img
            src={product.image ?? ""}
            alt={product.name}
            className="h-full w-full object-contain p-2 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
          />
          {(isOutOfStock || badge) && (
            <span
              className={`absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white ${
                isOutOfStock ? "bg-gray-900" : "bg-[#6426E1]"
              }`}
            >
              {isOutOfStock ? "Sold out" : badge}
            </span>
          )}
        </Link>

        {/* Details */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-2">
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
            <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-gray-900 transition-colors hover:text-[#6426E1] sm:text-base">
              {product.name}
            </h3>
          </Link>

          {specLine && (
            <p className="mt-1 truncate text-xs text-gray-500">{specLine}</p>
          )}

          <div className="mt-auto flex items-center justify-between gap-2 pt-3">
            <span className="text-base font-bold text-gray-900 sm:text-lg">
              {formatPrice(product.price)}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleWishlist}
                aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white transition hover:border-gray-300"
              >
                <Heart
                  className={`h-4 w-4 transition-colors ${
                    inWishlist ? "fill-red-500 text-red-500" : "text-gray-500"
                  }`}
                />
              </button>
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                aria-label={isOutOfStock ? "Sold out" : "Add to cart"}
                className="flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#6426E1] px-3 text-sm font-semibold text-white transition hover:bg-[#5220c4] active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 sm:px-4"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {isOutOfStock ? "Sold out" : "Add to Cart"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default ShowcaseProductListItem;