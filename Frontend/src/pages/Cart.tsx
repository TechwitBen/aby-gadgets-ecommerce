import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/services/products.service";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate("/checkout");
    } else {
      navigate("/login?redirect=%2Fcheckout");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-border" />

      {/* Back link */}
      <div className="container mx-auto px-4 py-5">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          Cart
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-16">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Link to="/products">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* ── Selected Items ─────────────────────────────────────── */}
            <div className="lg:col-span-2">
              <div className="bg-[#F3EEFF] rounded-2xl p-6">
                <h2 className="text-lg font-bold text-foreground mb-5">
                  Selected Items
                </h2>

                <div className="space-y-3">
                  {items.map((item) => (
                    // Key on variantId so two variants of the same product are distinct rows
                    <div
                      key={item.variantId}
                      className="bg-white rounded-xl p-4 flex gap-4 items-center"
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-lg bg-[#F5F5F5] flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        {/* Name + trash */}
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold text-foreground leading-tight">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => removeFromCart(item.variantId)}
                            className="text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-0.5"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Specs — color / storage / sku */}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {[item.color, item.storage, item.ram, item.sku && `SKU: ${item.sku}`]
                            .filter(Boolean)
                            .join(" • ")}
                        </p>

                        {/* Price · Qty · Subtotal */}
                        <div className="flex items-center gap-4 mt-3 flex-wrap">
                          <span className="text-xs text-muted-foreground">
                            Price{" "}
                            <span className="font-semibold text-foreground">
                              {formatPrice(item.price)}
                            </span>
                          </span>

                          {/* Quantity pill */}
                          <div className="flex items-center bg-[#F3EEFF] rounded-full px-1 py-0.5 gap-1">
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-primary/20 transition-colors text-foreground"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="text-xs font-semibold text-foreground w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-primary/20 transition-colors text-foreground"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          <span className="text-xs text-muted-foreground ml-auto">
                            Subtotal{" "}
                            <span className="font-bold text-foreground text-sm">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Order Summary ──────────────────────────────────────── */}
            <div className="lg:col-span-1">
              <div className="bg-[#F3EEFF] rounded-2xl p-6 sticky top-4">
                <h2 className="text-lg font-bold text-foreground mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-foreground">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-semibold text-foreground">Free</span>
                  </div>

                  <div className="border-t border-primary/20 pt-4 flex justify-between items-center">
                    <span className="font-bold text-foreground text-base">Total</span>
                    <span className="font-bold text-xl text-foreground">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-11"
                >
                  Continue To Checkout
                </Button>

                {!isAuthenticated && (
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    You'll be asked to sign in before checkout.
                  </p>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;