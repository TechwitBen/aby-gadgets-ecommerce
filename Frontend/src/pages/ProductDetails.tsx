import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Heart, Star, Minus, Plus, ChevronLeft, ChevronRight,
  ShieldCheck, Truck, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getProductById, products, formatPrice } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useToast } from "@/hooks/use-toast";

const ProductDetails = () => {
  const { id } = useParams();
  const product = getProductById(id || "");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { toast } = useToast();

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">Product not found</p>
        <Link to="/products">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      quantity,
      storage: product.storage?.[0],
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
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

  // Gallery: use main image + second image if available
  const galleryImages = [
    product.image,
    product.image2 || product.image,
    product.image,
    product.image2 || product.image,
  ];

  // Key highlights: use product.features (fallback to static text)
  const keyHighlights = product.features?.length
    ? product.features
    : [
        "Pro-level camera performance with triple 12MP lenses that capture sharp photos, clean night shots, and smooth 4K videos.",
        "Large, fluid display experience on a 6.7-inch Super Retina XDR screen with ProMotion for bright visuals and seamless scrolling",
        "Powerful and durable build, powered by Apple's A15 Bionic chip and reinforced with a premium stainless-steel frame",
        "UK used, fully tested and verified, carefully inspected to ensure full functionality, original components, and reliable battery performance.",
        "Built for everyday and heavy use, making it ideal for multitasking, gaming, content creation, and all-day productivity.",
      ];

  // Similar products: same category, exclude current, max 5
  const similarProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 5);

  // Reviews (static – can be moved to product data later)
  const reviews = [
    {
      id: 1,
      name: "Daniel A.",
      rating: 5,
      date: "12/09/2025",
      comment:
        "I was honestly scared at first, but the phone came exactly as described. Battery health was correct, no issues at all. Very neat and smooth. AbyGadgets really delivered.",
    },
    {
      id: 2,
      name: "Blessing O.",
      rating: 5,
      date: "30/12/2025",
      comment:
        "Camera quality is mad. Phone looks almost new and delivery was fast. I also liked that I could inspect before finalizing payment. Definitely buying again.",
    },
    {
      id: 3,
      name: "Ibrahim S.",
      rating: 4,
      date: "17/10/2025",
      comment:
        "Phone performance is solid and battery lasts well. Slight sign of use but nothing serious. Overall very good value for the price.",
    },
    {
      id: 4,
      name: "Esther K.",
      rating: 5,
      date: "9/06/2025",
      comment:
        "Everything was smooth from order to delivery. The phone is original, no replaced parts, and works perfectly. Customer support was also helpful.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header – no wrapper div, variant="default" for purple→white scroll effect */}
      <Header variant="default" />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-3">
        <Link
          to="/products"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Products</span>
        </Link>
      </div>

      {/* Main Product Section */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16">
          {/* Left Column - Images */}
          <div className="relative">
            {/* Main Image Container */}
            <div className="relative aspect-square bg-white rounded-lg border border-gray-200 mb-4 overflow-hidden">
              <img
                src={galleryImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain p-12 md:p-16 lg:p-20"
              />

              {/* Navigation Arrows */}
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setSelectedImage((prev) => Math.max(0, prev - 1))}
                disabled={selectedImage === 0}
              >
                <ChevronLeft className="w-4 h-4 text-gray-700" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shadow-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() =>
                  setSelectedImage((prev) => Math.min(galleryImages.length - 1, prev + 1))
                }
                disabled={selectedImage === galleryImages.length - 1}
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Thumbnail Gallery - 4 thumbnails */}
            <div className="flex justify-center gap-2">
              {galleryImages.slice(0, 4).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-md overflow-hidden border transition-all duration-200 bg-white ${
                    selectedImage === i
                      ? "border-purple-600 border-2"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-contain p-1"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="pt-2">
            {/* Product Title */}
            <h1 className="text-2xl md:text-3xl font-normal text-gray-900 mb-2">
              {product.name}
            </h1>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {product.description ||
                "(UK Used), 256GB, 89% battery health, very neat condition, all parts original and fully functional."}
            </p>

            {/* Trust Badges */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Verified Authentic
                </span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Safe Delivery
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-8">
              <div className="text-sm text-gray-600 mb-1">Price:</div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-8">
              <div className="text-sm text-gray-600 mb-2">Quantity:</div>
              <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-50 transition-colors text-gray-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-medium text-gray-900 min-w-[2.5rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-gray-50 transition-colors text-gray-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <Button
                variant="outline"
                className="flex-1 h-11 border border-purple-600 text-purple-600 hover:bg-purple-50 hover:text-purple-700 font-medium text-sm rounded-lg"
                onClick={handleAddToCart}
              >
                ADD TO CART
              </Button>
              <Button
                className="flex-1 h-11 bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm rounded-lg"
                onClick={() => {
                  toast({
                    title: "Coming soon",
                    description: "Buy Now functionality will be available shortly.",
                  });
                }}
              >
                BUY NOW
              </Button>
            </div>

            {/* Small Note */}
            <p className="text-xs text-gray-500">
              Free inspection available before payment
            </p>
          </div>
        </div>

        {/* Key Highlights Section */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-8">Key Highlights</h2>
          <ul className="space-y-6">
            {keyHighlights.map((highlight, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                </div>
                <p className="text-base text-gray-700 leading-relaxed">{highlight}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 pt-12 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-8">Reviews</h2>
          <div className="space-y-0">
            {reviews.map((review, index) => (
              <div key={review.id} className="border-b border-gray-200 last:border-b-0">
                <div className="py-6">
                  <h4 className="font-bold text-gray-900 mb-2">{review.name}</h4>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">{review.date}</span>
                    <div className="flex items-center">
                      {Array.from({ length: Math.floor(review.rating) }).map((_, i) => (
                        <Star
                          key={`full-${i}`}
                          className="w-5 h-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                      {review.rating % 1 !== 0 && (
                        <div className="relative">
                          <Star className="w-5 h-5 fill-gray-300 text-gray-300" />
                          <Star
                            className="w-5 h-5 fill-yellow-400 text-yellow-400 absolute top-0 left-0 overflow-hidden"
                            style={{ width: `${(review.rating % 1) * 100}%` }}
                          />
                        </div>
                      )}
                      {Array.from({ length: 5 - Math.ceil(review.rating) }).map((_, i) => (
                        <Star
                          key={`empty-${i}`}
                          className="w-5 h-5 fill-gray-300 text-gray-300"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {review.comment}
                  </p>
                </div>
                {index < reviews.length - 1 && <div className="h-px bg-gray-200"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <div className="mt-16 pt-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="text-xl font-semibold text-gray-900">
                Discover similar item
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Page</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full border border-gray-300 hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium px-2 min-w-[1.5rem] text-center">
                  1
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full border border-gray-300 hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {similarProducts.map((p) => {
                const inWishlistSimilar = isInWishlist(p.id);
                return (
                  <Link key={p.id} to={`/products/${p.id}`} className="group block">
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 hover:shadow-sm transition-shadow duration-200">
                      <div className="relative aspect-square mb-3 bg-white rounded-md overflow-hidden">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(p.id);
                            toast({
                              title: inWishlistSimilar
                                ? "Removed from wishlist"
                                : "Added to wishlist",
                              description: `${p.name} has been ${
                                inWishlistSimilar ? "removed from" : "added to"
                              } your wishlist.`,
                            });
                          }}
                          className="absolute top-2 right-2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center shadow-sm border border-gray-200 hover:bg-white hover:shadow-md transition-all"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              inWishlistSimilar
                                ? "fill-pink-500 text-pink-500"
                                : "text-gray-600"
                            }`}
                          />
                        </button>
                      </div>
                      <h3 className="text-xs font-medium text-gray-900 truncate mb-1">
                        {p.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        {formatPrice(p.price)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Trust Badges Section */}
        <div className="mt-16 pt-12 border-t-2 border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="text-center">
              <ShieldCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">
                Guaranteed Originality
              </h3>
              <p className="text-sm text-gray-600">100% authentic products</p>
            </div>
            <div className="text-center">
              <Truck className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Secure Delivery</h3>
              <p className="text-sm text-gray-600">Safe and insured shipping</p>
            </div>
            <div className="text-center">
              <Eye className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">
                Inspect Before You Buy
              </h3>
              <p className="text-sm text-gray-600">Verify condition before payment</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetails;