import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Loader2, ChevronDown } from "lucide-react";
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

const nigerianStates = [
  "Lagos","Abuja","Oyo","Port Harcourt","Ibadan","Kano","Enugu",
  "Rivers","Delta","Edo","Cross River","Bayelsa","Akwa Ibom","Calabar",
  "Anambra","Imo","Abia","Ebonyi","Osun","Ondo","Ekiti","Kwara","Niger",
  "Nasarawa","Plateau","Kaduna","Kebbi","Zamfara","Katsina","Jigawa","Yobe",
  "Borno","Gombe","Adamawa","Taraba","Sokoto",
];

const Checkout = () => {
  const { subtotal, items, clearCart } = useCart();
  const { user }                       = useAuth();
  const navigate                       = useNavigate();
  const location                       = useLocation();

  const buyNowItem: OrderItem | undefined = location.state?.buyNowItem;
  const isBuyNow     = !!buyNowItem;
  const orderItems   = isBuyNow ? [buyNowItem] : items;
  const orderSubtotal = isBuyNow ? buyNowItem.price * buyNowItem.quantity : subtotal;

  const [firstName,      setFirstName]      = useState("");
  const [lastName,       setLastName]       = useState("");
  const [phone,          setPhone]          = useState("");
  const [email,          setEmail]          = useState(user?.email ?? "");
  const [address,        setAddress]        = useState("");
  const [state,          setState]          = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod,  setPaymentMethod]  = useState<PaymentMethod>("online");
  const [termsAccepted,  setTermsAccepted]  = useState(false);
  const [infoConfirmed,  setInfoConfirmed]  = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [submitError,   setSubmitError]   = useState<string | null>(null);
  const [showSuccess,   setShowSuccess]   = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");

  if (orderItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground text-center">Your cart is empty</p>
        <Link to="/products">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!termsAccepted || !infoConfirmed) return;
    if (!firstName.trim() || !lastName.trim() || !address.trim() || !state) {
      setSubmitError("Please fill in all required fields.");
      return;
    }
    if (!email || !email.includes("@")) {
      setSubmitError("Please enter a valid email address.");
      return;
    }
    if (orderItems.length === 0) {
      setSubmitError("No items in order.");
      return;
    }
    const invalidItems = orderItems.filter((item) => !item.variantId || !item.quantity || item.quantity < 1);
    if (invalidItems.length > 0) {
      setSubmitError("Some items are missing required information.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
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
        setShowSuccess(true);
      } else {
        const { authorization_url } = await paymentService.initializePayment({ orderId: order._id });
        setShowSuccess(true);
        setTimeout(() => {
          window.location.href = authorization_url;
        }, 2500);
      }
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link
              to={isBuyNow ? `/products/${buyNowItem?.id}` : "/cart"}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              {isBuyNow ? "Back" : "Cart"}
            </Link>
            <h1 className="text-base sm:text-lg font-bold text-gray-900">
              Checkout
              {isBuyNow && <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">Buy Now</span>}
            </h1>
            <div className="w-16" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-32 sm:pb-16">
        {submitError && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            {submitError}
          </div>
        )}

        {/* Mobile Order Summary Accordion */}
        <div className="sm:hidden mb-5 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowOrderSummary(!showOrderSummary)}
            className="w-full flex items-center justify-between px-4 py-3.5"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">Order Summary</span>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                {orderItems.length} item{orderItems.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">{formatPrice(orderSubtotal)}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showOrderSummary ? "rotate-180" : ""}`} />
            </div>
          </button>
          {showOrderSummary && (
            <div className="px-4 pb-4 border-t border-gray-200">
              <div className="mt-3 space-y-3">
                {orderItems.map((item) => (
                  <div key={item.variantId ?? item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{item.name}</p>
                      {item.color && <p className="text-xs text-gray-500">{item.color}</p>}
                      {item.storage && <p className="text-xs text-gray-500">{item.storage}</p>}
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-xs font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-200 space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Subtotal</span><span className="font-semibold text-gray-900">{formatPrice(orderSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Delivery</span><span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-200">
                    <span>Total</span><span>{formatPrice(orderSubtotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Customer Details */}
            <section className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
              <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-4">
                Customer Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-xs font-semibold text-gray-600 block mb-1.5">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Gabriel"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-10 text-sm border-gray-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-xs font-semibold text-gray-600 block mb-1.5">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Ajijobi"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-10 text-sm border-gray-200 rounded-xl focus:border-purple-500"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-xs font-semibold text-gray-600 block mb-1.5">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+234 903 137 2681"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-10 text-sm border-gray-200 rounded-xl focus:border-purple-500"
                    type="tel"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-xs font-semibold text-gray-600 block mb-1.5">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 text-sm border-gray-200 rounded-xl focus:border-purple-500"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">We'll use this to confirm delivery</p>
            </section>

            {/* Delivery Details */}
            <section className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
              <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-4">Delivery Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-5">
                <div className=" sm:col-span-1">
                  <Label htmlFor="address" className="text-xs font-semibold text-gray-600 block mb-1.5">
                    Delivery Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    placeholder="Enter your delivery address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="h-10 text-sm border-gray-200 rounded-xl focus:border-purple-500"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-xs font-semibold text-gray-600 block mb-1.5">
                    State/City <span className="text-red-500">*</span>
                  </Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger className="h-10 text-sm border-gray-200 rounded-xl">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {nigerianStates.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <h3 className="text-xs font-bold text-gray-800 mb-3">Delivery Method</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                {[
                  { value: "standard", label: "Standard Delivery", desc: "48–72 hours", icon: "🚚" },
                  { value: "pickup",   label: "Pick-up",           desc: "Pick up nearby",  icon: "🏪" },
                  { value: "inspect",  label: "Inspect First",     desc: "Lagos only",   icon: "🔍" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDeliveryMethod(opt.value)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      deliveryMethod === opt.value
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span className="text-xl flex-shrink-0">{opt.icon}</span>
                    <div>
                      <p className={`text-sm font-semibold ${deliveryMethod === opt.value ? "text-purple-700" : "text-gray-900"}`}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Payment Method */}
            <section className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
              <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-4">Payment Method</h2>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { value: "online", label: "Card / Transfer / USSD", icon: "💳" },
                  { value: "pod",    label: "Pay On Delivery",         icon: "💵" },
                ].map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setPaymentMethod(m.value as PaymentMethod)}
                    className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all ${
                      paymentMethod === m.value
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <span className={`text-xs font-semibold text-center leading-tight ${
                      paymentMethod === m.value ? "text-purple-700" : "text-gray-700"
                    }`}>{m.label}</span>
                  </button>
                ))}
              </div>

              {paymentMethod === "online" && (
                <div className="rounded-2xl p-4 text-center" style={{ background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)", border: "1px solid #c4b5fd" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ background: "#7c3aed" }}>
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-bold text-gray-800 mb-1">Secure Payment via Paystack</p>
                  <p className="text-xs text-gray-600">You'll be redirected to pay via Card, Bank Transfer, or USSD.</p>
                  <p className="text-xs text-gray-500 mt-2 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-green-500" />
                    Your card details are never stored.
                  </p>
                </div>
              )}

              {paymentMethod === "pod" && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-600">
                  Pay with cash when your order is delivered or after inspection.
                </div>
              )}
            </section>

            {/* Terms */}
            <section className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={termsAccepted}
                  onCheckedChange={(c) => setTermsAccepted(c as boolean)}
                  className="mt-0.5 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
                <span className="text-sm text-gray-700">
                  I accept Aby Gadgets{" "}
                  <span className="text-purple-600 underline cursor-pointer">Terms & conditions.</span>
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={infoConfirmed}
                  onCheckedChange={(c) => setInfoConfirmed(c as boolean)}
                  className="mt-0.5 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
                <span className="text-sm text-gray-700">
                  I have confirmed the information above is correct.
                </span>
              </label>
            </section>
          </div>

          {/* Desktop Order Summary */}
          <div className="hidden sm:block lg:col-span-1">
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 sticky top-24">
              <h2 className="text-base font-bold text-gray-900 mb-5">Order Summary</h2>

              <div className="space-y-3 mb-5">
                {orderItems.map((item) => (
                  <div key={item.variantId ?? item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{item.name}</p>
                      {item.color   && <p className="text-xs text-gray-500">{item.color}</p>}
                      {item.storage && <p className="text-xs text-gray-500">{item.storage}</p>}
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-xs font-bold text-gray-900 flex-shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold">{formatPrice(orderSubtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-lg text-gray-900">{formatPrice(orderSubtotal)}</span>
                </div>
              </div>

              <Button
                className="w-full h-11 font-bold rounded-xl"
                style={{ background: "#7c3aed", color: "#fff" }}
                onClick={handleSubmit}
                disabled={!termsAccepted || !infoConfirmed || isSubmitting}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isSubmitting ? "Processing…" : paymentMethod === "online" ? `Pay ${formatPrice(orderSubtotal)}` : "Confirm Order"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky checkout bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-xs text-gray-500">Total</div>
            <div className="text-base font-bold text-gray-900">{formatPrice(orderSubtotal)}</div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!termsAccepted || !infoConfirmed || isSubmitting}
            className="flex-[2] flex items-center justify-center gap-2 h-12 rounded-2xl font-bold text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
            style={{ background: "#7c3aed" }}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? "Processing…" : paymentMethod === "online" ? `Pay ${formatPrice(orderSubtotal)}` : "Confirm Order"}
          </button>
        </div>
      </div>

      <OrderSuccessModal
        open={showSuccess}
        orderId={createdOrderId}
        email={email || user?.email || ""}
        onClose={() => {
          setShowSuccess(false);
          if (!isBuyNow) clearCart();
          navigate("/orders");
        }}
      />
    </div>
  );
};

export default Checkout;