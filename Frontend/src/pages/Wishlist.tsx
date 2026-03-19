import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Heart, ShoppingCart, Trash2, ArrowRight, Star, Package,
  Truck, Shield, ChevronLeft, Filter, X, Sparkles, CheckCircle, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustBadges from "@/components/TrustBadges";
import { useWishlist } from "@/contexts/WishlistContext";
import { formatPrice } from "@/data/products"; // reuse your existing formatter

const Wishlist = () => {
  const { wishlistProducts, removeFromWishlist, clearWishlist } = useWishlist();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently added";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const removeItem = (id: string) => {
    removeFromWishlist(id);
    setSelectedItems(prev => prev.filter(itemId => itemId !== id));
  };

  const removeSelectedItems = () => {
    selectedItems.forEach(id => removeFromWishlist(id));
    setSelectedItems([]);
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const selectAllItems = () => {
    if (selectedItems.length === wishlistProducts.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistProducts.map(item => item.id));
    }
  };

  const addToCart = (product: any) => {
    // Placeholder – integrate your cart logic here
    alert(`Added ${product.name} to cart`);
    // Optional: remove from wishlist after adding to cart?
    // removeFromWishlist(product.id);
  };

  const moveToCartSelected = () => {
    selectedItems.forEach(id => {
      const item = wishlistProducts.find(p => p.id === id);
      if (item) addToCart(item);
    });
    removeSelectedItems();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header title="My Wishlist" />

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
              <p className="text-gray-600">
                {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="gap-2"
                onClick={selectAllItems}
                disabled={wishlistProducts.length === 0}
              >
                {selectedItems.length === wishlistProducts.length ? "Deselect All" : "Select All"}
              </Button>
              {selectedItems.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={removeSelectedItems}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove Selected
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 gap-2"
                    onClick={moveToCartSelected}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart ({selectedItems.length})
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Wishlist Items */}
        {wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {wishlistProducts.map((item) => {
              const isSelected = selectedItems.includes(item.id);
              const inStock = item.inStock ?? true;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border-2 ${isSelected ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 hover:border-blue-300'} transition-all duration-300 overflow-hidden shadow-sm hover:shadow-lg`}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Selection Checkbox */}
                      <button
                        onClick={() => toggleSelectItem(item.id)}
                        className={`mt-1 w-5 h-5 rounded border-2 ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'} flex items-center justify-center transition-all duration-200`}
                      >
                        {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                      </button>

                      {/* Product Image */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="relative w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                            {!inStock && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">OUT OF STOCK</span>
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                    {item.brand}
                                  </span>
                                  {item.rating && (
                                    <div className="flex items-center gap-1">
                                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                      <span className="text-xs font-bold text-gray-900">{item.rating}</span>
                                      <span className="text-xs text-gray-500">({item.reviews})</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-xl font-bold text-blue-600">
                                    {formatPrice(item.price)}
                                  </div>
                                  {item.storage && item.storage.length > 0 && (
                                    <div className="text-xs text-gray-500">
                                      Storage: <span className="font-medium text-gray-700">{item.storage[0]}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-lg font-medium">
                                  {item.condition}
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <div className="text-xs text-gray-500">
                                  Added to wishlist
                                </div>
                                <div className="flex items-center gap-2">
                                  {inStock ? (
                                    <Button
                                      onClick={() => addToCart(item)}
                                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 h-auto"
                                    >
                                      <ShoppingCart className="h-3 w-3 mr-1" />
                                      Add to Cart
                                    </Button>
                                  ) : (
                                    <span className="text-xs text-red-500 font-medium px-3 py-1.5 bg-red-50 rounded-lg">
                                      Notify When Available
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl flex items-center justify-center">
              <Heart className="h-12 w-12 text-pink-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Save items you love for later. Click the heart icon on any product to add it here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Browse Products
                </Button>
              </Link>
              <Link to="/deals">
                <Button variant="outline" className="px-6 py-3">
                  <Truck className="h-4 w-4 mr-2" />
                  View Deals
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        {wishlistProducts.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Save on your wishlist items!</h3>
                <p className="text-gray-600">
                  Items in your wishlist are reserved for 30 days. Get notified when prices drop.
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Bell className="h-4 w-4" />
                Enable Price Alerts
              </Button>
            </div>
          </div>
        )}
      </div>

      <TrustBadges />
      <Footer />
    </div>
  );
};

export default Wishlist;