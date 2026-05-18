import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useInView, fadeUp } from "@/hooks/useInView";
import { formatPrice } from "@/services/Products.service";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 🎬 Page entrance animation
  const { ref: contentRef, isInView: contentInView } = useInView({
    once: true,
    threshold: 0,
  });

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate("/checkout");
    } else {
      navigate("/login?redirect=%2Fcheckout");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28 sm:pb-8">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
            <h1 className="text-base sm:text-lg font-bold text-gray-900">
              Cart
              {items.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({items.length})
                </span>
              )}
            </h1>
            <div className="w-24 sm:w-32" />
          </div>
        </div>
      </div>

      {/* 🎬 Animated content */}
      <div
        ref={contentRef}
        className={`container mx-auto px-3 sm:px-4 py-4 sm:py-6 ${fadeUp(contentInView)}`}
      >
        {items.length === 0 ? (
          <div className="text-center py-16 sm:py-24">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShoppingBag className="w-9 h-9 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Add some gadgets and come back!
            </p>
            <Link to="/products">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8">
                Browse Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl sm:bg-[#F3EEFF] overflow-hidden sm:p-5">
                <h2 className="hidden sm:block text-base font-bold text-gray-900 mb-4 px-0">
                  Selected Items
                </h2>

                <div className="divide-y divide-gray-100 sm:divide-none sm:space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.variantId}
                      className="flex gap-3 sm:gap-4 items-center p-3 sm:bg-white sm:rounded-2xl sm:p-4"
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-50 sm:bg-[#F5F5F5] flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-100 sm:border-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2 flex-1">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => removeFromCart(item.variantId)}
                            className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 -mt-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Specs */}
                        <p className="text-xs text-gray-500 mb-2">
                          {[
                            item.color,
                            item.storage,
                            item.sku && `SKU: ${item.sku}`,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>

                        {/* Price + qty */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center bg-gray-100 sm:bg-[#F3EEFF] rounded-full h-8 px-1 gap-0.5">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.variantId,
                                  item.quantity - 1,
                                )
                              }
                              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/70 transition-colors text-gray-700"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-gray-900 w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.variantId,
                                  item.quantity + 1,
                                )
                              }
                              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/70 transition-colors text-gray-700"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-bold text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatPrice(item.price)} each
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop Order Summary — delivery fee removed; shown in checkout */}
            <div className="hidden sm:block lg:col-span-1">
              <div className="bg-[#F3EEFF] rounded-2xl p-5 sticky top-24">
                <h2 className="text-base font-bold text-gray-900 mb-5">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Subtotal ({items.reduce((s, i) => s + i.quantity, 0)}{" "}
                      items)
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  {/* Delivery fee is calculated at checkout based on selected zone/method */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 italic text-xs">
                      Delivery fee calculated at checkout
                    </span>
                  </div>
                  <div className="border-t border-primary/20 pt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Subtotal</span>
                    <span className="font-bold text-xl text-gray-900">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-11 text-sm"
                >
                  Continue To Checkout
                </Button>

                {!isAuthenticated && (
                  <p className="text-xs text-center text-gray-500 mt-3">
                    You'll be asked to sign in.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky checkout bar — no delivery fee shown */}
      {items.length > 0 && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs text-gray-500">
                {items.reduce((s, i) => s + i.quantity, 0)} items
              </span>
              <span className="text-xs text-gray-400 italic">
                + delivery at checkout
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-primary text-primary-foreground font-bold rounded-2xl h-12 text-sm flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
            >
              <span>Checkout</span>
              <span className="bg-white/20 rounded-lg px-2 py-0.5 text-sm font-bold">
                {formatPrice(subtotal)}
              </span>
            </button>
            {!isAuthenticated && (
              <p className="text-xs text-center text-gray-400 mt-2">
                You'll be asked to sign in.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;