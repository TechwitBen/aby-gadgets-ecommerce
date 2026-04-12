import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Heart, Star, Minus, Plus, ChevronLeft, ChevronRight,
  ShieldCheck, Truck, Loader2, CheckCircle2, AlertCircle, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  productService, formatPrice, type Product, type Variant,
} from "@/services/Products.service";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useToast } from "@/hooks/use-toast";

// ── Stock badge ───────────────────────────────────────────────────────────────
const StockBadge = ({ stock }: { stock: number }) => {
  if (stock === 0)
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600">
        <XCircle className="w-4 h-4" /> Out of stock
      </span>
    );
  if (stock <= 5)
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600">
        <AlertCircle className="w-4 h-4" /> Low stock — only {stock} left
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
      <CheckCircle2 className="w-4 h-4" /> In stock
    </span>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const ProductDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate  = useNavigate();

  const { addToCart }                   = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { toast }                       = useToast();

  // ── Fetch product ──────────────────────────────────────────────────────────
  const [product,    setProduct]    = useState<Product | null>(null);
  const [isLoading,  setIsLoading]  = useState(true);
  const [fetchError, setFetchError] = useState(false);
  // Similar products (same category)
  const [similar, setSimilar] = useState<Product[]>([]);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    setFetchError(false);

    productService
      .getBySlug(slug)
      .then(async (data) => {
        setProduct(data);
        // Pick first available variant
        const first = data.variants.find((v) => v.is_active && v.stock > 0) ?? data.variants[0];
        if (first) setSelectedVariant(first);

        // Fetch similar
        const res = await productService.getAll({ category: data.category, limit: 6 });
        setSimilar(res.products.filter((p) => p.id !== data.id).slice(0, 5));
      })
      .catch(() => setFetchError(true))
      .finally(() => setIsLoading(false));
  }, [slug]);

  // ── Variant selection ──────────────────────────────────────────────────────
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedImage,   setSelectedImage]   = useState(0);
  const [quantity,        setQuantity]        = useState(1);

  const activeVariants = product?.variants.filter((v) => v.is_active) ?? [];

  // Unique colors and storages from active variants
  const colors   = [...new Set(activeVariants.map((v) => v.color).filter(Boolean))] as string[];
  const storages = [...new Set(activeVariants.map((v) => v.storage).filter(Boolean))] as string[];

  // Currently selected color / storage
  const selectedColor   = selectedVariant?.color   ?? null;
  const selectedStorage = selectedVariant?.storage ?? null;

  const selectByColorStorage = (color: string | null, storage: string | null) => {
    const match = activeVariants.find(
      (v) =>
        (color   === null || v.color   === color) &&
        (storage === null || v.storage === storage)
    );
    if (match) setSelectedVariant(match);
  };

  const handleColorSelect = (color: string) => {
    selectByColorStorage(color, selectedStorage);
  };

  const handleStorageSelect = (storage: string) => {
    selectByColorStorage(selectedColor, storage);
  };

  // ── Derived from selected variant ─────────────────────────────────────────
  const displayPrice = selectedVariant?.price ?? product?.price ?? 0;
  const stockCount   = selectedVariant?.stock ?? 0;
  const canAddToCart = stockCount > 0;

  // ── Loading / error ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (fetchError || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">Product not found.</p>
        <Link to="/products">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);

  const galleryImages = [
    product.image,
    product.image2 || product.image,
    product.image,
    product.image2 || product.image,
  ].filter(Boolean) as string[];

  const keyHighlights = product.features?.filter(Boolean).length
    ? product.features!
    : [
        "Pro-level camera performance with triple 12MP lenses for sharp photos, clean night shots, and smooth 4K video.",
        "Large fluid display with ProMotion for bright visuals and seamless scrolling.",
        "Powered by the latest chip for all-day performance and multitasking.",
        "Fully tested and verified — original components and reliable battery performance.",
        "Built for everyday and heavy use: gaming, content creation, and productivity.",
      ];

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart({
      id:      product.id,
      name:    product.name,
      price:   selectedVariant.price,
      image:   product.image,
      quantity,
      storage: selectedVariant.storage ?? undefined,
      // Extra variant info for order display
      color:   selectedVariant.color,
      sku:     selectedVariant.sku,
      variantId: selectedVariant.id,
    });
    toast({ title: "Added to cart", description: `${product.name} has been added to your cart.` });
  };

  const handleBuyNow = () => {
    if (!selectedVariant) return;
    navigate("/checkout", {
      state: {
        buyNowItem: {
          id:      product.id,
          name:    product.name,
          price:   selectedVariant.price,
          image:   product.image,
          quantity,
          storage: selectedVariant.storage ?? undefined,
          color:   selectedVariant.color,
          sku:     selectedVariant.sku,
          variantId: selectedVariant.id,
        },
      },
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    toast({
      title: inWishlist ? "Removed from wishlist" : "Added to wishlist",
      description: `${product.name} has been ${inWishlist ? "removed from" : "added to"} your wishlist.`,
    });
  };

  const staticReviews = [
    { id: 1, name: "Daniel A.",  rating: 5, date: "12/09/2025", comment: "I was honestly scared at first, but the phone came exactly as described. Battery health was correct, no issues at all. Very neat and smooth. AbyGadgets really delivered." },
    { id: 2, name: "Blessing O.", rating: 5, date: "30/12/2025", comment: "Camera quality is mad. Phone looks almost new and delivery was fast. I also liked that I could inspect before finalizing payment. Definitely buying again." },
    { id: 3, name: "Ibrahim S.",  rating: 4, date: "17/10/2025", comment: "Phone performance is solid and battery lasts well. Slight sign of use but nothing serious. Overall very good value for the price." },
    { id: 4, name: "Esther K.",   rating: 5, date: "9/06/2025",  comment: "Everything was smooth from order to delivery. The phone is original, no replaced parts, and works perfectly. Customer support was also helpful." },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-3">
        <Link to="/products"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Products</span>
        </Link>
      </div>

      {/* Main Product Section */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16">

          {/* Left — Images */}
          <div className="relative">
            <div className="relative aspect-square bg-white rounded-lg border border-gray-200 mb-4 overflow-hidden">
              <img src={galleryImages[selectedImage]} alt={product.name}
                className="w-full h-full object-contain p-12 md:p-16 lg:p-20" />
              <button onClick={() => setSelectedImage((p) => Math.max(0, p - 1))}
                disabled={selectedImage === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-300 hover:bg-gray-50 disabled:opacity-40">
                <ChevronLeft className="w-4 h-4 text-gray-700" />
              </button>
              <button onClick={() => setSelectedImage((p) => Math.min(galleryImages.length - 1, p + 1))}
                disabled={selectedImage === galleryImages.length - 1}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shadow-md hover:bg-purple-700 disabled:opacity-40">
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="flex justify-center gap-2">
              {galleryImages.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-md overflow-hidden border transition-all bg-white ${
                    selectedImage === i ? "border-purple-600 border-2" : "border-gray-300 hover:border-gray-400"
                  }`}>
                  <img src={img} alt="" className="w-full h-full object-contain p-1" />
                </button>
              ))}
            </div>
          </div>

          {/* Right — Product Info */}
          <div className="pt-2">
            <h1 className="text-2xl md:text-3xl font-normal text-gray-900 mb-2">{product.name}</h1>

            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {product.description || "(UK Used), fully tested and verified, carefully inspected to ensure full functionality."}
            </p>

            {/* Trust Badges */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Verified Authentic</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Safe Delivery</span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-1">Price</div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900">
                {formatPrice(displayPrice)}
              </div>
              {selectedVariant?.compare_at_price && selectedVariant.compare_at_price > displayPrice && (
                <div className="text-sm text-gray-400 line-through mt-1">
                  {formatPrice(selectedVariant.compare_at_price)}
                </div>
              )}
            </div>

            {/* Variant Selectors */}
            {activeVariants.length > 0 && (
              <div className="mb-6 space-y-5">

                {/* Color */}
                {colors.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Color</div>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <button key={color} onClick={() => handleColorSelect(color)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                            selectedColor === color
                              ? "border-purple-600 bg-purple-50 text-purple-700"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                          }`}>
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Storage */}
                {storages.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Storage</div>
                    <div className="flex flex-wrap gap-2">
                      {storages.map((s) => (
                        <button key={s} onClick={() => handleStorageSelect(s)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                            selectedStorage === s
                              ? "border-purple-600 bg-purple-50 text-purple-700"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                          }`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected summary + stock badge */}
                {selectedVariant && (
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-sm text-gray-500">
                      Selected:{" "}
                      <span className="font-medium text-gray-800">
                        {[selectedVariant.color, selectedVariant.storage, selectedVariant.ram]
                          .filter(Boolean)
                          .join(" / ")}
                      </span>
                    </span>
                    <StockBadge stock={stockCount} />
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <div className="text-sm text-gray-600 mb-2">Quantity</div>
              <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-50 transition-colors text-gray-700">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-medium text-gray-900 min-w-[2.5rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(stockCount, quantity + 1))}
                  disabled={quantity >= stockCount}
                  className="px-3 py-2 hover:bg-gray-50 transition-colors text-gray-700 disabled:opacity-40">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <Button variant="outline"
                className="flex-1 h-11 border border-purple-600 text-purple-600 hover:bg-purple-50 hover:text-purple-700 font-medium text-sm rounded-lg"
                disabled={!canAddToCart}
                onClick={handleAddToCart}>
                ADD TO CART
              </Button>
              <Button className="flex-1 h-11 bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm rounded-lg"
                disabled={!canAddToCart}
                onClick={handleBuyNow}>
                BUY NOW
              </Button>
            </div>

            {/* Wishlist */}
            <button onClick={handleToggleWishlist}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors mt-2">
              <Heart className={`w-4 h-4 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
              {inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            </button>

            <p className="text-xs text-gray-500 mt-3">Free inspection available before payment</p>
          </div>
        </div>

        {/* Key Highlights */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-8">Key Highlights</h2>
          <ul className="space-y-6">
            {keyHighlights.map((highlight, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-900 rounded-full" />
                </div>
                <p className="text-base text-gray-700 leading-relaxed">{highlight}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Reviews */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-8">Reviews</h2>
          <div className="space-y-0">
            {staticReviews.map((review, index) => (
              <div key={review.id} className="border-b border-gray-200 last:border-b-0">
                <div className="py-6">
                  <h4 className="font-bold text-gray-900 mb-2">{review.name}</h4>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">{review.date}</span>
                    <div className="flex items-center">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                      {Array.from({ length: 5 - review.rating }).map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-gray-300 text-gray-300" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                </div>
                {index < staticReviews.length - 1 && <div className="h-px bg-gray-200" />}
              </div>
            ))}
          </div>
        </div>

        {/* Similar Products */}
        {similar.length > 0 && (
          <div className="mt-16 pt-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="text-xl font-semibold text-gray-900">Discover similar items</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {similar.map((p) => {
                const inWishlistSimilar = isInWishlist(p.id);
                return (
                  <Link key={p.id} to={`/products/${p.slug}`} className="group block">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:shadow-sm transition-shadow">
                      <div className="relative aspect-square mb-3 bg-white rounded-md overflow-hidden">
                        <img src={p.image} alt={p.name}
                          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300" />
                        <button onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(p.id);
                          }}
                          className="absolute top-2 right-2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center shadow-sm border border-gray-200 hover:bg-white hover:shadow-md transition-all">
                          <Heart className={`w-3.5 h-3.5 ${inWishlistSimilar ? "fill-pink-500 text-pink-500" : "text-gray-600"}`} />
                        </button>
                      </div>
                      <h3 className="text-xs font-medium text-gray-900 truncate mb-1">{p.name}</h3>
                      <p className="text-xs text-gray-500 font-medium">{formatPrice(p.price)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;