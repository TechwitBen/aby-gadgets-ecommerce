import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/services/Products.service";
import { orderService } from "@/services/Order.service";
import { paymentService } from "@/services/Payment.service";
import OrderSuccessModal from "@/components/modals/Ordersuccessmodal";

// ─────────────────────────────────────────────────────────────────────────────

type PaymentMethod = "online" | "pod";

interface OrderItem {
  id: string;
  variantId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  storage?: string;
  color?: string;
}

const Checkout = () => {
  const { subtotal, items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Buy Now support
  const buyNowItem: OrderItem | undefined = location.state?.buyNowItem;
  const isBuyNow = !!buyNowItem;
  const orderItems: OrderItem[] = isBuyNow ? [buyNowItem] : items;
  const orderSubtotal = isBuyNow
    ? buyNowItem.price * buyNowItem.quantity
    : subtotal;

  // ── Form state ──────────────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("online");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [infoConfirmed, setInfoConfirmed] = useState(false);

  // ── Submit state ────────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");

  if (orderItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Your cart is empty</p>
        <Link to="/products">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!termsAccepted || !infoConfirmed) return;
    if (!firstName.trim() || !lastName.trim() || !address.trim() || !state) {
      setSubmitError("Please fill in all required fields.");
      return;
    }

     // ADD THIS CHECK:
  if (!email || !email.includes("@")) {
    setSubmitError("Please enter a valid email address.");
    return;
  }

   // ADD THIS CHECK:
  if (orderItems.length === 0) {
    setSubmitError("No items in order. Please go back and select products.");
    return;
  }

  // Validate all items have required fields:
  const invalidItems = orderItems.filter(
    (item) => !item.variantId || !item.quantity || item.quantity < 1
  );

  if (invalidItems.length > 0) {
    setSubmitError("Some items are missing required information.");
    return;
  }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // 1 — Create the order
      const order = await orderService.createOrder({
        orderItems: orderItems.map((item) => ({
          variant: item.variantId,
          quantity: item.quantity,
        })),
        shipping_address: {
          full_name: `${firstName.trim()} ${lastName.trim()}`,
          phone: phone.trim(),
          street: address.trim(),
          city: state,
          state: state,
          country: "Nigeria",
          postal_code: "",
        },
        paymentMethod: paymentMethod === "online" ? "paystack" : "pod",
      });

      setCreatedOrderId(order._id);

      

      if (paymentMethod === "pod") {
        // Show success modal immediately
        setShowSuccess(true);
     
      } else {
        // 2 — Initialize Paystack payment
        const { authorization_url } = await paymentService.initializePayment({
          orderId: order._id,
        });
        // 3 — Show brief success modal then redirect
        setShowSuccess(true);
        // Slight delay so the modal renders before redirect
        setTimeout(() => {
          // if (!isBuyNow) clearCart();
          window.location.href = authorization_url;
        }, 2500);
      }
    } catch (err: any) {
      setSubmitError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4 border-b border-gray-100">
        <Link
          to={isBuyNow ? `/products/${buyNowItem?.id}` : "/cart"}
          className="flex items-center gap-2 text-sm text-foreground hover:text-primary font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {isBuyNow ? "Back to product" : "Cart"}
        </Link>
      </div>

      <div className="container mx-auto px-4 py-6 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
          {isBuyNow && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
              Buy Now
            </span>
          )}
        </div>

        {/* Global error */}
        {submitError && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left column ────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Customer Details */}
            <section>
              <h2 className="text-base font-semibold text-foreground mb-4">
                Customer Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="firstName"
                    className="text-xs text-muted-foreground"
                  >
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Gabriel"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 h-9 text-sm border-gray-200 focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="lastName"
                    className="text-xs text-muted-foreground"
                  >
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Ajijobi"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 h-9 text-sm border-gray-200 focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="phone"
                    className="text-xs text-muted-foreground"
                  >
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+234 903 137 2681"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 h-9 text-sm border-gray-200 focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="email"
                    className="text-xs text-muted-foreground"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 h-9 text-sm border-gray-200 focus:border-primary"
                    required
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                We'd use this to confirm delivery
              </p>
            </section>

            {/* Delivery Details */}
            <section>
              <h2 className="text-base font-semibold text-foreground mb-4">
                Delivery Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <div>
                  <Label
                    htmlFor="address"
                    className="text-xs text-muted-foreground"
                  >
                    Delivery Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    placeholder="Enter your delivery address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1 h-9 text-sm border-gray-200 focus:border-primary"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="state"
                    className="text-xs text-muted-foreground"
                  >
                    State/City <span className="text-red-500">*</span>
                  </Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger className="mt-1 h-9 text-sm border-gray-200">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                  <SelectContent>
  {[
    "Lagos",
    "Abuja",
    "Oyo",
    "Port Harcourt",
    "Ibadan",
    "Kano",
    "Enugu",
    // ADD MISSING STATES:
    "Rivers",
    "Delta",
    "Edo",
    "Cross River",
    "Bayelsa",
    "Akwa Ibom",
    "Calabar",
    "Anambra",
    "Imo",
    "Abia",
    "Ebonyi",
    "Osun",
    "Ondo",
    "Ekiti",
    "Kwara",
    "Niger",
    "Nasarawa",
    "Plateau",
    "Kaduna",
    "Kebbi",
    "Zamfara",
    "Katsina",
    "Jigawa",
    "Yobe",
    "Borno",
    "Gombe",
    "Adamawa",
    "Taraba",
    "Sokoto",
  ].map((s) => (
    <SelectItem key={s} value={s}>
      {s}
    </SelectItem>
  ))}
</SelectContent>
                  </Select>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-foreground mb-3">
                Delivery Method
              </h3>
              <div className="space-y-3">
                {[
                  {
                    value: "standard",
                    label: "Standard Delivery",
                    desc: "Delivered within 48–72 hours",
                  },
                  {
                    value: "pickup",
                    label: "Pick-up",
                    desc: "Pick up from a nearby location.",
                  },
                  {
                    value: "inspect",
                    label: "Inspect Before You Buy",
                    desc: "Inspect gadget before payment (Lagos only).",
                  },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          deliveryMethod === opt.value
                            ? "border-primary bg-primary"
                            : "border-gray-300 group-hover:border-primary/50"
                        }`}
                        onClick={() => setDeliveryMethod(opt.value)}
                      >
                        {deliveryMethod === opt.value && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <div onClick={() => setDeliveryMethod(opt.value)}>
                      <p className="text-sm font-medium text-foreground leading-tight">
                        {opt.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {opt.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* Payment Method — simplified to two options */}
            <section>
              <h2 className="text-base font-semibold text-foreground mb-4">
                Payment Method
              </h2>

              <div className="flex gap-6 mb-4">
                {[
                  { value: "online", label: "Card / Bank Transfer / USSD" },
                  { value: "pod", label: "Pay On Delivery" },
                ].map((m) => (
                  <label
                    key={m.value}
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setPaymentMethod(m.value as PaymentMethod)}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                        paymentMethod === m.value
                          ? "border-primary"
                          : "border-gray-300"
                      }`}
                    >
                      {paymentMethod === m.value && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {m.label}
                    </span>
                  </label>
                ))}
              </div>

              {/* Online — Paystack secure message */}
              {paymentMethod === "online" && (
                <div
                  className="rounded-2xl p-5 flex flex-col items-center text-center gap-3"
                  style={{
                    background:
                      "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
                    border: "1px solid #c4b5fd",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: "#7c3aed" }}
                  >
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">
                      Secure Payment
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      You will be redirected to our secure payment partner to
                      pay via Card, Bank Transfer, or USSD.
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-green-500" />
                    We do not store your card details.
                  </p>
                </div>
              )}

              {/* Pay on Delivery */}
              {paymentMethod === "pod" && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-muted-foreground">
                  Pay with cash when your order is delivered to your doorstep or
                  after inspection.
                </div>
              )}
            </section>

            {/* Terms */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(c) => setTermsAccepted(c as boolean)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor="terms" className="text-sm">
                  I accept Aby Gadgets{" "}
                  <span className="text-primary underline cursor-pointer">
                    Terms &amp; conditions.
                  </span>
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="confirm"
                  checked={infoConfirmed}
                  onCheckedChange={(c) => setInfoConfirmed(c as boolean)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label htmlFor="confirm" className="text-sm">
                  I have read and confirmed that the information above is
                  correct.
                </Label>
              </div>
            </div>
          </div>

          {/* ── Order Summary ───────────────────────────────────────────────── */}
          <div>
            <div
              className="rounded-2xl border border-gray-200 p-5 sticky top-4"
              style={{ background: "#faf9ff" }}
            >
              <h2 className="text-base font-bold text-foreground mb-5">
                Order Summary
              </h2>

              <div className="space-y-3 mb-5">
                {orderItems.map((item) => (
                  <div
                    key={item.variantId ?? item.id}
                    className="flex items-center gap-3"
                  >
                    <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {item.name}
                      </p>
                      {item.color && (
                        <p className="text-xs text-muted-foreground">
                          {item.color}
                        </p>
                      )}
                      {item.storage && (
                        <p className="text-xs text-muted-foreground">
                          {item.storage}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-xs font-semibold text-foreground flex-shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">
                    {formatPrice(orderSubtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-lg text-foreground">
                    {formatPrice(orderSubtotal)}
                  </span>
                </div>
              </div>

              <Button
                className="w-full h-10 font-semibold rounded-lg flex items-center justify-center gap-2"
                style={{ background: "#7c3aed", color: "#fff" }}
                onClick={handleSubmit}
                disabled={!termsAccepted || !infoConfirmed || isSubmitting}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting
                  ? "Processing…"
                  : paymentMethod === "online"
                    ? `Pay ${formatPrice(orderSubtotal)}`
                    : "Confirm Order"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Success modal — shown for both pod and online (briefly before redirect) */}
      <OrderSuccessModal
        open={showSuccess}
        orderId={createdOrderId}
        email={email || user?.email || ""}
        onClose={() => {
          setShowSuccess(false);
           // Safe to clear cart for POD since no redirect
      if (!isBuyNow) clearCart();
          navigate("/orders");
        }}
      />
    </div>
  );
};

export default Checkout;
