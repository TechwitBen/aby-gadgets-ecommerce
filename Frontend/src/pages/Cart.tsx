import { Link } from "react-router-dom";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustBadges from "@/components/TrustBadges";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/data/products";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();

  return (
    <div className="min-h-screen bg-background">
      {/* Header with white background */}
      <div className="bg-white border-b border-border">
        <Header />
      </div>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <Link to="/products" className="flex items-center gap-2 text-sm text-foreground hover:text-primary font-medium">
          <ArrowLeft className="w-4 h-4" />
          Cart
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-12">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-primary/5 rounded-2xl border-2 border-primary/20 p-6">
                <h2 className="text-xl font-bold text-foreground mb-6">Selected Items</h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl p-4 border border-primary/10">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-muted/30 rounded-lg overflow-hidden shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-foreground text-sm">{item.name}</h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {item.storage && `${item.storage}`}
                                {item.color && `•${item.color}`}
                                •Fully tested.
                              </p>
                            </div>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-muted-foreground">
                                Price <span className="font-medium text-foreground">{formatPrice(item.price)}</span>
                              </span>
                              <div className="flex items-center border border-border rounded-full overflow-hidden">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-6 h-6 flex items-center justify-center hover:bg-muted transition-colors text-xs"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2 text-xs font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-6 h-6 flex items-center justify-center hover:bg-muted transition-colors text-xs"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">Subtotal</span>
                              <span className="font-bold text-foreground text-sm">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-primary/5 rounded-2xl border-2 border-primary/20 p-6 sticky top-4">
                <h2 className="text-xl font-bold text-foreground mb-6">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-medium text-foreground">Free</span>
                  </div>
                  <div className="border-t border-primary/20 pt-4 flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-bold text-xl text-foreground">{formatPrice(subtotal)}</span>
                  </div>
                </div>
                <Link to="/checkout">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                    Continue To Checkout
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <TrustBadges />
      <Footer />
    </div>
  );
};

export default Cart;
