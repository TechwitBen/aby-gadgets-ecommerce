// Wishlist.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Heart, ShoppingCart, Trash2, ArrowRight, Star, Package, 
  Truck, Shield, ChevronLeft, Filter, X, Sparkles, CheckCircle, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustBadges from "@/components/TrustBadges";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 1,
      name: "iPhone 16 Pro",
      price: 895996,
      brand: "Apple",
      image: "https://images.unsplash.com/photo-1592910147752-5b3a9a5e1f6e?w=400&h=400&fit=crop",
      image2: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
      storage: "256GB",
      condition: "New",
      inStock: true,
      rating: 4.8,
      reviews: 128,
      addedDate: "2024-01-10"
    },
    {
      id: 2,
      name: "MacBook Pro 16",
      price: 1899996,
      brand: "Apple",
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",
      image2: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
      storage: "1TB",
      condition: "New",
      inStock: true,
      rating: 4.9,
      reviews: 289,
      addedDate: "2024-01-08"
    },
    {
      id: 5,
      name: "Samsung Galaxy S24 Ultra",
      price: 989996,
      brand: "Samsung",
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop",
      image2: "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400&h=400&fit=crop",
      storage: "512GB",
      condition: "New",
      inStock: true,
      rating: 4.7,
      reviews: 189,
      addedDate: "2024-01-05"
    },
    {
      id: 8,
      name: "Google Pixel 8 Pro",
      price: 799996,
      brand: "Google",
      image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop",
      image2: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&h=400&fit=crop",
      storage: "128GB",
      condition: "New",
      inStock: false,
      rating: 4.6,
      reviews: 178,
      addedDate: "2024-01-03"
    }
  ]);

  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const formatPrice = (price: number) => {
    return `₱${price.toLocaleString('en-PH')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const removeItem = (id: number) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
    setSelectedItems(prev => prev.filter(itemId => itemId !== id));
  };

  const removeSelectedItems = () => {
    setWishlistItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
  };

  const toggleSelectItem = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const selectAllItems = () => {
    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistItems.map(item => item.id));
    }
  };

  const addToCart = (item: any) => {
    // Add to cart logic here
    alert(`Added ${item.name} to cart`);
  };

  const moveToCartSelected = () => {
    selectedItems.forEach(id => {
      const item = wishlistItems.find(item => item.id === id);
      if (item) {
        addToCart(item);
      }
    });
    // Remove selected items from wishlist after moving to cart
    setWishlistItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header title="My Wishlist" />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
              <p className="text-gray-600">
                Save items you love for later and get notified when prices drop
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={selectAllItems}
              >
                {selectedItems.length === wishlistItems.length ? "Deselect All" : "Select All"}
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

          {/* Stats */}
          {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl flex items-center justify-center">
                  <Heart className="h-6 w-6 text-pink-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{wishlistItems.length}</div>
                  <div className="text-sm text-gray-600">Total Items</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{wishlistItems.filter(item => item.inStock).length}</div>
                  <div className="text-sm text-gray-600">In Stock</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl flex items-center justify-center">
                  <Star className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">4.7</div>
                  <div className="text-sm text-gray-600">Avg Rating</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">30-Day</div>
                  <div className="text-sm text-gray-600">Warranty</div>
                </div>
              </div>
            </div>
          </div> */}
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {wishlistItems.map((item) => {
              const isSelected = selectedItems.includes(item.id);
              
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
                        {isSelected && (
                          <CheckCircle className="h-3 w-3 text-white" />
                        )}
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
                            {!item.inStock && (
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
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                    <span className="text-xs font-bold text-gray-900">{item.rating}</span>
                                    <span className="text-xs text-gray-500">({item.reviews})</span>
                                  </div>
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
                                  <div className="text-xs text-gray-500">
                                    Storage: <span className="font-medium text-gray-700">{item.storage}</span>
                                  </div>
                                </div>
                                <div className="text-xs px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-lg font-medium">
                                  {item.condition}
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <div className="text-xs text-gray-500">
                                  Added on {formatDate(item.addedDate)}
                                </div>
                                <div className="flex items-center gap-2">
                                  {item.inStock ? (
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
        {wishlistItems.length > 0 && (
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