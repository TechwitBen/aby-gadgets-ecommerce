import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Star,
  Sparkles,
  CheckCircle,
  Bell,
  Grid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/services/products.service";
import { useInView, fadeUp } from "@/hooks/useInView"; // ✅ added

const Wishlist = () => {
  const { wishlistProducts, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // 🎬 Page entrance animation
  const { ref: contentRef, isInView: contentInView } = useInView({
    once: true,
    threshold: 0,
  });

  const removeItem = (id: string) => {
    removeFromWishlist(id);
    setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
  };

  const removeSelectedItems = () => {
    selectedItems.forEach((id) => removeFromWishlist(id));
    setSelectedItems([]);
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  const selectAllItems = () => {
    if (selectedItems.length === wishlistProducts.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistProducts.map((item) => item.id));
    }
  };

  const handleAddToCart = (product: (typeof wishlistProducts)[number]) => {
    const variant = product.variants?.[0];
    addToCart({
      id: product.id,
      variantId: variant._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      storage: product.storage ?? undefined,
    });
    toast({
      title: "Added to cart",
      description: `${product.name} added to your cart.`,
    });
  };

  const moveToCartSelected = () => {
    selectedItems.forEach((id) => {
      const item = wishlistProducts.find((p) => p.id === id);
      if (item) handleAddToCart(item);
    });
    removeSelectedItems();
  };

  // ── Grid Card ──────────────────────────────────────────────────────────────
  const GridCard = ({ item }: { item: (typeof wishlistProducts)[0] }) => {
    const isSelected = selectedItems.includes(item.id);
    const inStock = item.inStock ?? true;

    return (
      <div
        className={`relative bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
          isSelected
            ? "border-blue-500 shadow-lg"
            : "border-gray-200 hover:border-blue-300 hover:shadow-md"
        }`}
      >
        {/* Selection indicator */}
        <button
          onClick={() => toggleSelectItem(item.id)}
          className={`absolute top-2.5 left-2.5 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            isSelected
              ? "bg-blue-600 border-blue-600"
              : "bg-white/90 border-gray-300"
          }`}
        >
          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
        </button>

        {/* Remove button */}
        <button
          onClick={() => removeItem(item.id)}
          className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Image */}
        <Link
          to={`/products/${item.id}`}
          className="block relative aspect-square bg-gray-50"
        >
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-contain p-4"
          />
          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-xl">
              <span className="text-white text-xs font-bold bg-gray-800 px-2 py-1 rounded-full">
                SOLD OUT
              </span>
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="p-3">
          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {item.brand}
          </span>
          <Link to={`/products/${item.id}`}>
            <h3 className="font-semibold text-gray-900 text-sm mt-1.5 line-clamp-2 leading-snug hover:text-blue-600 transition-colors">
              {item.name}
            </h3>
          </Link>
          {item.rating !== undefined && item.rating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs text-gray-600">{item.rating}</span>
            </div>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="text-base font-bold text-blue-600">
              {formatPrice(item.price)}
            </span>
            <span className="text-xs text-gray-500">{item.condition}</span>
          </div>
          {inStock ? (
            <button
              onClick={() => handleAddToCart(item)}
              className="mt-2.5 w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
            >
              <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
            </button>
          ) : (
            <div className="mt-2.5 w-full py-2 bg-gray-100 text-gray-500 text-xs font-semibold rounded-xl text-center">
              Out of Stock
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── List Row ───────────────────────────────────────────────────────────────
  const ListRow = ({ item }: { item: (typeof wishlistProducts)[0] }) => {
    const isSelected = selectedItems.includes(item.id);
    const inStock = item.inStock ?? true;

    return (
      <div
        className={`bg-white rounded-2xl border-2 transition-all p-3 sm:p-4 ${
          isSelected
            ? "border-blue-500 bg-blue-50/30"
            : "border-gray-200 hover:border-blue-300 hover:shadow-md"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Selection checkbox */}
          <button
            onClick={() => toggleSelectItem(item.id)}
            className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300"
            }`}
          >
            {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
          </button>

          {/* Image */}
          <Link
            to={`/products/${item.id}`}
            className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-contain p-2"
            />
            {!inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-xs font-bold">OUT</span>
              </div>
            )}
          </Link>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <Link to={`/products/${item.id}`}>
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug hover:text-blue-600 transition-colors">
                {item.name}
              </h3>
            </Link>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-gray-500">{item.brand}</span>
              {item.rating !== undefined && item.rating > 0 && (
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs text-gray-500">{item.rating}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-2 gap-2">
              <span className="text-base font-bold text-blue-600">
                {formatPrice(item.price)}
              </span>
              <div className="flex items-center gap-2">
                {inStock ? (
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl active:scale-95 transition-transform"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Add to Cart</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                ) : (
                  <span className="text-xs text-red-500 font-medium px-2 py-1 bg-red-50 rounded-lg">
                    Out of Stock
                  </span>
                )}
                <button
                  onClick={() => removeItem(item.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-red-500 text-red-500" />
                Wishlist
                <span className="text-sm font-normal text-gray-500">
                  ({wishlistProducts.length})
                </span>
              </h1>
            </div>
            {wishlistProducts.length > 0 && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* View mode toggle */}
                <div className="flex items-center gap-0.5 bg-gray-100 rounded-xl p-1">
                  {(["list", "grid"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`p-1.5 rounded-lg transition-colors ${viewMode === mode ? "bg-white shadow-sm text-blue-600" : "text-gray-400"}`}
                    >
                      {mode === "grid" ? (
                        <Grid className="w-4 h-4" />
                      ) : (
                        <List className="w-4 h-4" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🎬 Animated content */}
      <div
        ref={contentRef}
        className={`container mx-auto px-3 sm:px-4 py-4 sm:py-6 ${fadeUp(contentInView)}`}
      >
        {/* Bulk action bar */}
        {wishlistProducts.length > 0 && (
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 flex-wrap">
            <button
              onClick={selectAllItems}
              className="text-xs sm:text-sm font-medium text-gray-700 px-3 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {selectedItems.length === wishlistProducts.length
                ? "Deselect All"
                : "Select All"}
            </button>
            {selectedItems.length > 0 && (
              <>
                <button
                  onClick={removeSelectedItems}
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-red-600 px-3 py-2 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove ({selectedItems.length})
                </button>
                <button
                  onClick={moveToCartSelected}
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Add to Cart ({selectedItems.length})
                </button>
              </>
            )}
          </div>
        )}

        {/* Items */}
        {wishlistProducts.length > 0 ? (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {wishlistProducts.map((item) => (
                  <GridCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {wishlistProducts.map((item) => (
                  <ListRow key={item.id} item={item} />
                ))}
              </div>
            )}

            {/* Bottom promo */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">
                    Save on your wishlist items!
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Get notified when prices drop on items you love.
                  </p>
                </div>
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl whitespace-nowrap transition-colors">
                  <Bell className="w-4 h-4" />
                  Enable Alerts
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-16 sm:py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-5 bg-gradient-to-br from-pink-50 to-red-50 rounded-3xl flex items-center justify-center">
              <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-red-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-500 text-sm sm:text-base mb-8 max-w-xs mx-auto">
              Tap the heart icon on any product to save it here.
            </p>
            <Link to="/products">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-colors text-sm sm:text-base">
                <Sparkles className="w-4 h-4" />
                Browse Products
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
