import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Star,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  productService,
  formatPrice,
  type Product,
  type Variant,
} from "@/services/Products.service";
import { reviewService, type Review } from "@/services/Review.service";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useInView, fadeUp } from "@/hooks/useInView"; // ✅ added

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
        <AlertCircle className="w-4 h-4" /> Only {stock} left
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
      <CheckCircle2 className="w-4 h-4" /> In stock
    </span>
  );
};

const StarDisplay = ({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) => {
  const cls = size === "lg" ? "w-6 h-6" : size === "md" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${cls} ${s <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
        />
      ))}
    </div>
  );
};

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

const ProductDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { toast } = useToast();
  const { user } = useAuth();

  // 🎬 Page entrance animation
  const { ref: pageRef, isInView: pageInView } = useInView({
    once: true,
    threshold: 0,
  });

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchReviews = useCallback(async (productId: string) => {
    setReviewsLoading(true);
    try {
      const data = await reviewService.getByProduct(productId);
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setTotalReviews(data.totalReviews);
    } catch {
      /* silent */
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    setFetchError(false);
    setSimilar([]);

    productService
      .getBySlug(slug)
      .then(async (data) => {
        setProduct(data);
        fetchReviews(data.id);

        const inStockVariant = data.variants.find(
          (v) => v.is_active && v.stock > 0,
        );
        const defaultVariant =
          inStockVariant ||
          data.variants.find((v) => v.is_active) ||
          data.variants[0];
        if (defaultVariant) setSelectedVariant(defaultVariant);
        setVariantOverrideImage(null);

        setSimilarLoading(true);
        try {
          let res = await productService.getAll({
            category: data.category,
            limit: 10,
          });
          let candidates = res.products.filter((p) => p.id !== data.id);
          if (candidates.length < 2 && data.type) {
            res = await productService.getAll({
              productType: data.type,
              limit: 10,
            });
            candidates = res.products.filter((p) => p.id !== data.id);
          }
          if (candidates.length < 2) {
            res = await productService.getAll({ sortBy: "newest", limit: 10 });
            candidates = res.products.filter((p) => p.id !== data.id);
          }
          setSimilar(candidates.slice(0, 5));
        } catch {
          /* silent */
        } finally {
          setSimilarLoading(false);
        }
      })
      .catch(() => {
        setFetchError(true);
        toast({
          title: "Error",
          description: "Failed to load product details.",
          variant: "destructive",
        }); // ✅ toast on fetch error
      })
      .finally(() => setIsLoading(false));
  }, [slug, fetchReviews]);

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [variantOverrideImage, setVariantOverrideImage] = useState<
    string | null
  >(null);

  const activeVariants = product?.variants.filter((v) => v.is_active) ?? [];
  const colors = [
    ...new Set(activeVariants.map((v) => v.color).filter(Boolean)),
  ] as string[];
  const storages = [
    ...new Set(activeVariants.map((v) => v.storage).filter(Boolean)),
  ] as string[];

  const selectedColor = selectedVariant?.color ?? null;
  const selectedStorage = selectedVariant?.storage ?? null;

  const selectByColorStorage = (
    color: string | null,
    storage: string | null,
  ) => {
    // Try exact match first
    let match = activeVariants.find(
      (v) =>
        (color === null || v.color === color) &&
        (storage === null || v.storage === storage),
    );
    // Fall back: match just the changed dimension
    if (!match && color !== null) {
      match = activeVariants.find((v) => v.color === color);
    }
    if (!match && storage !== null) {
      match = activeVariants.find((v) => v.storage === storage);
    }
    if (match) setSelectedVariant(match);
  };

  const handleColorSelect = (color: string) => {
    selectByColorStorage(color, selectedStorage);

    // If the matched variant has its own image, show it
    const match = activeVariants.find((v) => v.color === color) as any;
    if (match?.image) {
      // Insert variant image at front of gallery temporarily
      setVariantOverrideImage(match.image);
    } else {
      setVariantOverrideImage(null);
    }
  };
  const handleStorageSelect = (storage: string) =>
    selectByColorStorage(selectedColor, storage);

  const displayPrice = selectedVariant?.price ?? product?.price ?? 0;
  const stockCount = selectedVariant?.stock ?? 0;
  const canAddToCart = stockCount > 0;

  const userReview = reviews.find((r) => r.user._id === (user as any)?._id);

  const handleSubmitReview = async () => {
    if (!newRating) {
      setSubmitError("Please select a star rating.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await reviewService.create({
        productId: product!.id,
        rating: newRating,
        comment: newComment.trim() || undefined,
      });
      setNewRating(0);
      setNewComment("");
      await fetchReviews(product!.id);
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback.",
      });
    } catch (err: any) {
      setSubmitError(err.message ?? "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await reviewService.remove(reviewId);
      await fetchReviews(product!.id);
      toast({ title: "Review deleted." });
    } catch (err: any) {
      toast({
        title: "Could not delete review",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (fetchError || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">Product not found.</p>
        <Link to="/products">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);

  // ── Gallery: use the full images array (up to 4), fall back for legacy data ──
  const rawGallery = (
    product.images?.length > 0
      ? product.images
      : ([product.image, product.image2].filter(Boolean) as string[])
  ).filter(Boolean) as string[];

  // Show up to 4 images; deduplicate consecutive identical URLs
  const galleryImages = variantOverrideImage
    ? [
        variantOverrideImage,
        ...rawGallery.filter((img) => img !== variantOverrideImage).slice(0, 3),
      ]
    : rawGallery
        .slice(0, 4)
        .filter((img, idx, arr) => idx === 0 || img !== arr[idx - 1]);

  // Clamp selected index in case product changed
  const safeSelectedImage = Math.min(selectedImage, galleryImages.length - 1);

  const keyHighlights = product.features?.filter(Boolean).length
    ? product.features!
    : [
        "Pro-level camera performance with triple 12MP lenses for sharp photos and smooth 4K video.",
        "Large fluid display with ProMotion for bright visuals and seamless scrolling.",
        "Powered by the latest chip for all-day performance and multitasking.",
        "Fully tested and verified — original components and reliable battery.",
        "Built for everyday and heavy use: gaming, content creation, productivity.",
      ];

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast({ title: "Error", description: "Please select a variant first" });
      return;
    }
    if (selectedVariant.stock <= 0) {
      toast({
        title: "Out of Stock",
        description: "This variant is currently unavailable",
      });
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: selectedVariant.price,
      image: product.image,
      quantity,
      storage: selectedVariant.storage ?? undefined,
      color: selectedVariant.color,
      sku: selectedVariant.sku,
      variantId: selectedVariant.id,
    });
    toast({
      title: "Added to cart",
      description: `${product.name} added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    if (!selectedVariant) {
      toast({ title: "Error", description: "Please select a variant first" });
      return;
    }
    if (selectedVariant.stock <= 0) {
      toast({ title: "Out of Stock" });
      return;
    }
    navigate("/checkout", {
      state: {
        buyNowItem: {
          id: product.id,
          name: product.name,
          price: selectedVariant.price,
          image: product.image,
          quantity,
          storage: selectedVariant.storage ?? undefined,
          color: selectedVariant.color,
          sku: selectedVariant.sku,
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
      description: `${product.name} ${inWishlist ? "removed from" : "added to"} your wishlist.`,
    });
  };

  return (
    <div className="min-h-screen bg-white pb-24 sm:pb-0">
      {/* Breadcrumb */}
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Products</span>
        </Link>
      </div>

      {/* 🎬 Animated main content */}
      <div
        ref={pageRef}
        className={`container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-8 ${fadeUp(pageInView)}`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 xl:gap-14">
          {/* Left — Gallery */}
          <div className="relative">
            {/* Main image */}
            <div className="relative aspect-square bg-white rounded-2xl border border-gray-200 mb-3 overflow-hidden">
              <img
                src={galleryImages[safeSelectedImage]}
                alt={product.name}
                className="w-full h-full object-contain p-8 sm:p-12 md:p-14"
              />
              {/* Mobile wishlist overlay */}
              <div className="absolute top-3 right-3 flex flex-col gap-2 sm:hidden">
                <button
                  onClick={handleToggleWishlist}
                  className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md border border-gray-200"
                >
                  <Heart
                    className={`w-4 h-4 ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-600"}`}
                  />
                </button>
              </div>

              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((p) => Math.max(0, p - 1))}
                    disabled={safeSelectedImage === 0}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage((p) =>
                        Math.min(galleryImages.length - 1, p + 1),
                      )
                    }
                    disabled={safeSelectedImage === galleryImages.length - 1}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shadow-md hover:bg-purple-700 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails — only shown when there are 2+ images */}
            {galleryImages.length > 1 && (
              <div className="flex justify-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all bg-white flex-shrink-0 ${
                      safeSelectedImage === i
                        ? "border-purple-600"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`View ${i + 1}`}
                      className="w-full h-full object-contain p-1.5"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — Product Info */}
          <div className="pt-1">
            <h1 className="text-lg sm:text-xl md:text-2xl font-normal text-gray-900 mb-2 leading-snug">
              {product.name}
            </h1>

            {totalReviews > 0 && (
              <a
                href="#reviews"
                className="inline-flex items-center gap-2 mb-3 group"
              >
                <StarDisplay rating={averageRating} size="sm" />
                <span className="text-sm font-semibold text-gray-800">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
                </span>
              </a>
            )}

            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {product.description ||
                "(UK Used), fully tested and verified, carefully inspected to ensure full functionality."}
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-green-800">
                  Verified Authentic
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5">
                <Truck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span className="text-xs font-semibold text-blue-800">
                  Safe Delivery
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-0.5">Price</div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                {formatPrice(displayPrice)}
              </div>
              {selectedVariant?.compare_at_price &&
                selectedVariant.compare_at_price > displayPrice && (
                  <div className="text-sm text-gray-400 line-through mt-0.5">
                    {formatPrice(selectedVariant.compare_at_price)}
                  </div>
                )}
            </div>

            {/* Variant Selectors */}
            {activeVariants.length > 0 && (
              <div className="mb-4 space-y-3">
                {colors.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-2">
                      Color:{" "}
                      <span className="text-gray-900 font-bold">
                        {selectedColor}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => {
                        const hasStock = activeVariants.some(
                          (v) => v.color === color && v.stock > 0,
                        );
                        return (
                          <button
                            key={color}
                            onClick={() => handleColorSelect(color)}
                            disabled={!hasStock}
                            className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                              selectedColor === color
                                ? "border-purple-600 bg-purple-50 text-purple-700"
                                : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                            } ${!hasStock ? "opacity-40 cursor-not-allowed" : ""}`}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {storages.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-2">
                      Storage
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {storages.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStorageSelect(s)}
                          className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                            selectedStorage === s
                              ? "border-purple-600 bg-purple-50 text-purple-700"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedVariant && (
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-gray-500">
                      <span className="font-medium text-gray-800">
                        {[
                          selectedVariant.color,
                          selectedVariant.storage,
                          selectedVariant.ram,
                        ]
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
            <div className="mb-5">
              <div className="text-xs font-semibold text-gray-600 mb-2">
                Quantity
              </div>
              <div className="flex items-center border border-gray-200 rounded-xl w-fit overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 hover:bg-gray-50 transition-colors text-gray-700 flex items-center justify-center"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-gray-900 text-sm">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(stockCount, quantity + 1))
                  }
                  disabled={quantity >= stockCount}
                  className="w-10 h-10 hover:bg-gray-50 transition-colors text-gray-700 disabled:opacity-40 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Desktop action buttons */}
            <div className="hidden sm:flex flex-col sm:flex-row gap-3 mb-3">
              <Button
                variant="outline"
                className="flex-1 h-11 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold rounded-xl"
                disabled={!canAddToCart}
                onClick={handleAddToCart}
              >
                ADD TO CART
              </Button>
              <Button
                className="flex-1 h-11 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl"
                disabled={!canAddToCart}
                onClick={handleBuyNow}
              >
                BUY NOW
              </Button>
            </div>

            <button
              onClick={handleToggleWishlist}
              className="hidden sm:flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${inWishlist ? "fill-red-500 text-red-500" : ""}`}
              />
              {inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            </button>
            <p className="hidden sm:block text-xs text-gray-400 mt-2">
              Free inspection available before payment
            </p>
          </div>
        </div>

        {/* Key Highlights */}
        <div className="mt-10 pt-8 border-t border-gray-100">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-5">
            Key Highlights
          </h2>
          <ul className="space-y-3">
            {keyHighlights.map((highlight, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1.5">
                  <div className="w-2 h-2 bg-gray-900 rounded-full" />
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {highlight}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Reviews */}
        <div
          id="reviews"
          className="mt-10 pt-8 border-t border-gray-100 scroll-mt-20"
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-5">
            Reviews
          </h2>

          {totalReviews > 0 && (
            <div className="flex items-center gap-4 sm:gap-5 mb-6 bg-gray-50 rounded-2xl border border-gray-100 px-4 sm:px-6 py-4">
              <div className="text-4xl sm:text-5xl font-bold text-gray-900 leading-none">
                {averageRating.toFixed(1)}
              </div>
              <div>
                <StarDisplay rating={averageRating} size="md" />
                <p className="text-xs text-gray-500 mt-1">
                  Based on {totalReviews}{" "}
                  {totalReviews === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>
          )}

          {!user ? (
            <div className="bg-gray-50 rounded-2xl border border-gray-100 px-5 py-7 mb-6 text-center">
              <Star className="w-7 h-7 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-700 font-semibold mb-1 text-sm">
                Have this product?
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Sign in to share your experience.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
              >
                Sign in to write a review →
              </Link>
            </div>
          ) : userReview ? (
            <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 mb-6">
              <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <p className="text-sm text-purple-700 font-medium">
                You've already submitted a review.
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl border border-gray-100 px-4 sm:px-6 py-6 mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4">
                Write a Review
              </h3>
              <div className="mb-4">
                <p className="text-xs text-gray-600 mb-2">Your rating *</p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewRating(s)}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none transition-transform hover:scale-110 p-0.5"
                    >
                      <Star
                        className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors cursor-pointer ${s <= (hoverRating || newRating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
                      />
                    </button>
                  ))}
                  {(hoverRating || newRating) > 0 && (
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {RATING_LABELS[hoverRating || newRating]}
                    </span>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <p className="text-xs text-gray-600 mb-2">
                  Your review (optional)
                </p>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your experience…"
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none bg-white placeholder-gray-400"
                />
              </div>
              {submitError && (
                <p className="text-xs text-red-500 mb-3">{submitError}</p>
              )}
              <Button
                onClick={handleSubmitReview}
                disabled={isSubmitting || !newRating}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                size="sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                    Submitting…
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </div>
          )}

          {reviewsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : reviews.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {reviews.map((review) => {
                const canDelete =
                  user &&
                  (String((user as any)._id) === review.user._id ||
                    (user as any).role === "admin");
                return (
                  <div key={review._id} className="py-5">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-gray-900 text-sm">
                          {review.user.name || review.user.username}
                        </h4>
                        {review.verified_purchase && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <StarDisplay rating={review.rating} size="sm" />
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString(
                          "en-GB",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
              <Star className="w-7 h-7 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                No reviews yet. Be the first!
              </p>
            </div>
          )}
        </div>

        {/* Similar Products */}
        <div className="mt-10 pt-8 border-t border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base sm:text-xl font-bold text-gray-900">
              Similar items
            </h2>
            <Link
              to="/products"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View all →
            </Link>
          </div>

          {similarLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-100 rounded-xl aspect-square mb-2" />
                  <div className="h-2.5 bg-gray-100 rounded mb-1.5 w-3/4" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {!similarLoading && similar.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {similar.map((p) => {
                const inWishlistSimilar = isInWishlist(p.id);
                return (
                  <Link
                    key={p.id}
                    to={`/products/${p.slug}`}
                    className="group block"
                  >
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all">
                      <div className="relative aspect-square mb-2 bg-white rounded-lg overflow-hidden">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(p.id);
                          }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-sm border border-gray-200"
                        >
                          <Heart
                            className={`w-3 h-3 ${inWishlistSimilar ? "fill-pink-500 text-pink-500" : "text-gray-400"}`}
                          />
                        </button>
                      </div>
                      <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 mb-1 leading-snug">
                        {p.name}
                      </h3>
                      <p className="text-xs font-bold text-purple-600">
                        {formatPrice(p.price)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl">
        <div className="px-4 py-3 safe-area-pb">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              <div className="text-lg font-bold text-gray-900">
                {formatPrice(displayPrice)}
              </div>
              <div className="text-xs text-gray-500">
                <StockBadge stock={stockCount} />
              </div>
            </div>
            <div className="flex gap-2 flex-1 ml-2">
              <button
                onClick={handleToggleWishlist}
                className={`w-11 h-11 flex-shrink-0 rounded-xl border-2 flex items-center justify-center transition-all ${inWishlist ? "border-red-200 bg-red-50" : "border-gray-200 bg-white"}`}
              >
                <Heart
                  className={`w-5 h-5 ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-500"}`}
                />
              </button>
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="flex-1 h-11 border-2 border-purple-600 text-purple-700 bg-purple-50 font-bold text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!canAddToCart}
                className="flex-1 h-11 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;