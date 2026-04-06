import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Copy, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/data/products";

// Shape of a single cart item (mirrors CartContext)
type OrderItem = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  storage?: string;
};

const Checkout = () => {
  const { subtotal, items, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // If we arrived via Buy Now, location.state.buyNowItem holds the single item.
  // Otherwise we fall back to the full cart.
  const buyNowItem: OrderItem | undefined = location.state?.buyNowItem;
  const isBuyNow = !!buyNowItem;

  // The items and total to actually display / process
  const orderItems: OrderItem[] = isBuyNow ? [buyNowItem] : items;
  const orderSubtotal: number = isBuyNow
    ? buyNowItem.price * buyNowItem.quantity
    : subtotal;

  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [copied, setCopied] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [infoConfirmed, setInfoConfirmed] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("0484087040");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckPaymentStatus = () => {
    if (!termsAccepted || !infoConfirmed) return;
    // Only clear the cart if this was a normal cart checkout (not Buy Now)
    if (!isBuyNow) clearCart();
    navigate("/order-success");
  };

  // Empty state: no cart items AND no buy-now item
  if (orderItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-white border-b border-border">
         
        </div>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground mb-4">Your cart is empty</p>
          <Link to="/products">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
       
      </div>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <Link
          to={isBuyNow ? `/products/${buyNowItem.id}` : "/cart"}
          className="flex items-center gap-2 text-sm text-foreground hover:text-primary font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {isBuyNow ? "Back to product" : "Cart"}
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
          {isBuyNow && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
              Buy Now
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Customer Details */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Customer Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-xs text-muted-foreground">
                    First Name <span className="text-red-500">Required</span>
                  </Label>
                  <Input id="firstName" placeholder="Gabriel" className="mt-1 border-primary/30 focus:border-primary" />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-xs text-muted-foreground">
                    Last Name <span className="text-red-500">Required</span>
                  </Label>
                  <Input id="lastName" placeholder="Ajijobi" className="mt-1 border-primary/30 focus:border-primary" />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-xs text-muted-foreground">Phone Number</Label>
                  <Input id="phone" placeholder="+234 9031372681" className="mt-1 border-primary/30 focus:border-primary" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-xs text-muted-foreground">Email Address</Label>
                  <Input id="email" type="email" placeholder="example@gmail.com" className="mt-1 border-primary/30 focus:border-primary" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">We'd use this to confirm delivery</p>
            </div>

            {/* Delivery Details */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Delivery Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="address" className="text-xs text-muted-foreground">
                    Delivery Address <span className="text-red-500">Required</span>
                  </Label>
                  <Input id="address" placeholder="Enter your address" className="mt-1 border-primary/30 focus:border-primary" />
                </div>
                <div>
                  <Label htmlFor="state" className="text-xs text-muted-foreground">
                    State/City <span className="text-red-500">Required</span>
                  </Label>
                  <Select>
                    <SelectTrigger className="mt-1 border-primary/30">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lagos">Lagos</SelectItem>
                      <SelectItem value="abuja">Abuja</SelectItem>
                      <SelectItem value="oyo">Oyo</SelectItem>
                      <SelectItem value="port-harcourt">Port Harcourt</SelectItem>
                      <SelectItem value="ibadan">Ibadan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <h3 className="font-medium text-foreground mb-3">Delivery Method</h3>
              <div className="space-y-2">
                {[
                  { value: "standard", label: "Standard Delivery", desc: "Delivered to your address." },
                  { value: "inspect", label: "Inspect Before You Buy", desc: "Inspect gadget before completing payment (Lagos only)." },
                  { value: "pickup", label: "Pick-up", desc: "Pick your item from our store." },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="delivery"
                      value={opt.value}
                      checked={deliveryMethod === opt.value}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-foreground text-sm">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Payment Method</h2>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { value: "bank", label: "Bank Transfer" },
                  { value: "card", label: "Card" },
                  { value: "pod", label: "Pay on Delivery" },
                ].map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value)}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all ${
                      paymentMethod === method.value
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === method.value ? "border-primary" : "border-muted-foreground"
                        }`}
                      >
                        {paymentMethod === method.value && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{method.label}</span>
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                ))}
              </div>

              {paymentMethod === "bank" && (
                <div className="bg-primary text-primary-foreground rounded-lg p-4 mb-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-primary-foreground/70">Bank Name:</span>
                      <span className="font-medium">GT Bank</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-primary-foreground/70">Account Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">0484087040</span>
                        <button
                          onClick={handleCopy}
                          className="text-accent hover:text-accent/80 flex items-center gap-1 text-xs"
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copied ? "Copied!" : "Copy"}</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-primary-foreground/70">Account Name:</span>
                      <span className="font-medium">Aby Gadgets Enterprise</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-2">Question</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 text-xs border border-border rounded bg-muted">Card</span>
                  <span className="px-3 py-1 text-xs border border-border rounded bg-muted">Pay on Delivery</span>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm">
                  I accept Aby Gadgets Terms & conditions.
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="confirm"
                  checked={infoConfirmed}
                  onCheckedChange={(checked) => setInfoConfirmed(checked as boolean)}
                />
                <Label htmlFor="confirm" className="text-sm">
                  I have read and confirmed that the information above is correct.
                </Label>
              </div>
            </div>

            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
              onClick={handleCheckPaymentStatus}
              disabled={!termsAccepted || !infoConfirmed}
            >
              Check Payment Status
            </Button>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-primary/5 rounded-2xl border-2 border-primary/20 p-6 sticky top-4">
              <h2 className="text-xl font-bold text-foreground mb-6">Order Summary</h2>

              {/* Item list */}
              <div className="space-y-3 mb-6">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                      {item.storage && (
                        <p className="text-xs text-muted-foreground">{item.storage}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-xs font-semibold text-foreground flex-shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-primary/20 pt-4 space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">{formatPrice(orderSubtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium text-foreground">Free</span>
                </div>
                <div className="border-t border-primary/20 pt-3 flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-xl text-foreground">{formatPrice(orderSubtotal)}</span>
                </div>
              </div>

              <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium">
                Confirm Payment
              </Button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Checkout;