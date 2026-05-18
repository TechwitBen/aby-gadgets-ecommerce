import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Loader2,
  ChevronDown,
  MapPin,
  Store,
  UserCircle,
  CreditCard,
  Banknote,
} from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { useInView, fadeUp } from "@/hooks/useInView";
import { formatPrice } from "@/services/products.service";
import { orderService } from "@/services/order.service";
import { userService } from "@/services/user.service";
import {
  settingsService,
  type SiteSettings,
  type DeliveryConfig,
  type DeliveryZone,
} from "@/services/settings.service";
import OrderSuccessModal from "@/components/modals/Ordersuccessmodal";

type PaymentMethod = "online" | "pod";
type FulfillmentType = "delivery" | "pickup";

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

// ── Validation helpers ──────────────────────────────────────────────────────

const NIGERIAN_PHONE_RE = /^(?:(?:\+?234)|0)[789][01]\d{8}$/;

function isValidNigerianPhone(raw: string): boolean {
  const digits = raw.replace(/[\s\-().]/g, "");
  return NIGERIAN_PHONE_RE.test(digits);
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

function isValidNamePart(value: string): boolean {
  return /^[A-Za-zÀ-ÖØ-öø-ÿ''\-\s]{2,}$/.test(value.trim());
}

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  state?: string;
  zone?: string;
  terms?: string;
}

const nigerianStates = [
  "Lagos",
  "Abuja",
  "Oyo",
  "Port Harcourt",
  "Ibadan",
  "Kano",
  "Enugu",
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
];

const Checkout = () => {
  const { subtotal, items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // 🎬 Page entrance animation
  const { ref: contentRef, isInView: contentInView } = useInView({
    once: true,
    threshold: 0,
  });

  const buyNowItem: OrderItem | undefined = location.state?.buyNowItem;
  const isBuyNow = !!buyNowItem;
  const orderItems = isBuyNow ? [buyNowItem] : items;
  const orderSubtotal = isBuyNow
    ? buyNowItem.price * buyNowItem.quantity
    : subtotal;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [infoConfirmed, setInfoConfirmed] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [profileLoading, setProfileLoading] = useState(true);
  const [hasProfileData, setHasProfileData] = useState(false);

  const [fulfillment, setFulfillment] = useState<FulfillmentType>("delivery");
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("online");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState("");
  const [createdOrderNumber, setCreatedOrderNumber] = useState("");
  const [createdPickupCode, setCreatedPickupCode] = useState<
    string | undefined
  >();
  const [paymentInitFailed, setPaymentInitFailed] = useState(false);

  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [deliveryConfig, setDeliveryConfig] = useState<DeliveryConfig | null>(
    null,
  );
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      settingsService.get().catch(() => null),
      settingsService.getDeliveryConfig().catch(() => null),
    ])
      .then(([site, delivery]) => {
        setSiteSettings(site);
        setDeliveryConfig(delivery);
        if (delivery) {
          if (delivery.enableDelivery) setFulfillment("delivery");
          else if (delivery.enablePickup) setFulfillment("pickup");
        }
        if (site?.onlinePayment) setPaymentMethod("online");
        else if (site?.payOnDelivery) setPaymentMethod("pod");
      })
      .finally(() => setSettingsLoading(false));
  }, []);

  useEffect(() => {
    if (!user) {
      setProfileLoading(false);
      return;
    }

    userService
      .getProfile()
      .then((profile) => {
        let filled = false;

        const fullName = profile.name?.trim() || profile.username?.trim() || "";
        if (fullName) {
          const parts = fullName.split(" ");
          setFirstName(parts[0] ?? "");
          setLastName(parts.slice(1).join(" ") ?? "");
          filled = true;
        }

        if (profile.phone?.trim()) {
          setPhone(profile.phone.trim());
          filled = true;
        }
        if (profile.email) {
          setEmail(profile.email);
          filled = true;
        }

        const defaultAddr =
          profile.addresses?.find((a) => a.isDefault) ?? profile.addresses?.[0];
        if (defaultAddr) {
          if (defaultAddr.street?.trim()) {
            setAddress(defaultAddr.street.trim());
            filled = true;
          }
          if (defaultAddr.state?.trim()) {
            setState(defaultAddr.state.trim());
            filled = true;
          }
        }

        setHasProfileData(filled);
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, [user]);

  useEffect(() => {
    if (fulfillment === "pickup") {
      setDeliveryFee(0);
      setSelectedZone(null);
    }
  }, [fulfillment]);

  const onlineEnabled =
    siteSettings === null ? true : siteSettings.onlinePayment;
  const podEnabled = siteSettings === null ? true : siteSettings.payOnDelivery;
  const pickupEnabled =
    deliveryConfig === null ? true : deliveryConfig.enablePickup;
  const deliveryEnabled =
    deliveryConfig === null ? true : deliveryConfig.enableDelivery;
  const zones: DeliveryZone[] = deliveryConfig?.zones ?? [];
  const grandTotal = orderSubtotal + deliveryFee;

  const paymentOptions = [
    onlineEnabled && {
      value: "online" as PaymentMethod,
      label: "Card / Transfer / USSD",
      Icon: CreditCard,
      subtitle: "Pay now via Paystack",
    },
    podEnabled && {
      value: "pod" as PaymentMethod,
      label: "Pay On Delivery",
      Icon: Banknote,
      subtitle: "Pay on arrival",
    },
  ].filter(Boolean) as {
    value: PaymentMethod;
    label: string;
    Icon: React.FC<{ className?: string }>;
    subtitle: string;
  }[];

  const handleZoneSelect = (cityName: string) => {
    const zone = zones.find((z) => z.city === cityName) ?? null;
    setSelectedZone(zone);
    setDeliveryFee(zone?.fee ?? 0);
    setFieldErrors((prev) => ({ ...prev, zone: undefined }));
  };

  const validateField = (field: keyof FieldErrors, value: string) => {
    let error: string | undefined;
    switch (field) {
      case "firstName":
        if (!value.trim()) error = "First name is required.";
        else if (!isValidNamePart(value))
          error = "First name contains invalid characters.";
        break;
      case "lastName":
        if (!value.trim()) error = "Last name is required.";
        else if (!isValidNamePart(value))
          error = "Last name contains invalid characters.";
        break;
      case "phone":
        if (value.trim() && !isValidNigerianPhone(value))
          error =
            "Enter a valid Nigerian number (e.g. 08012345678 or +2348012345678).";
        break;
      case "email":
        if (!value.trim()) error = "Email address is required.";
        else if (!isValidEmail(value)) error = "Enter a valid email address.";
        break;
      case "address":
        if (!value.trim()) error = "Street address is required.";
        else if (value.trim().length < 5)
          error = "Please enter a more complete address.";
        break;
      case "state":
        if (!value) error = "Please select your state.";
        break;
    }
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  };

  const runFullValidation = (): boolean => {
    const errors: FieldErrors = {};

    if (!firstName.trim()) errors.firstName = "First name is required.";
    else if (!isValidNamePart(firstName))
      errors.firstName = "First name contains invalid characters.";

    if (!lastName.trim()) errors.lastName = "Last name is required.";
    else if (!isValidNamePart(lastName))
      errors.lastName = "Last name contains invalid characters.";

    if (!email.trim()) errors.email = "Email address is required.";
    else if (!isValidEmail(email))
      errors.email = "Enter a valid email address.";

    if (phone.trim() && !isValidNigerianPhone(phone))
      errors.phone =
        "Enter a valid Nigerian number (e.g. 08012345678 or +2348012345678).";

    if (fulfillment === "delivery") {
      if (!address.trim()) errors.address = "Street address is required.";
      else if (address.trim().length < 5)
        errors.address = "Please enter a more complete address.";

      if (!state) errors.state = "Please select your state.";

      if (!selectedZone) errors.zone = "Please select your delivery zone.";
    }

    if (!termsAccepted || !infoConfirmed)
      errors.terms = "Please accept the terms and confirm your information.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  if (orderItems.length === 0 && !showSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground text-center">Your cart is empty</p>
        <Link to="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async () => {
    setSubmitError(null);

    if (!runFullValidation()) {
      const msg = "Please fix the highlighted errors before continuing.";
      setSubmitError(msg);
      toast({
        title: "Checkout Error",
        description: msg,
        variant: "destructive",
      });
      return;
    }

    if (orderItems.length === 0) {
      const msg = "No items in your order.";
      setSubmitError(msg);
      toast({
        title: "Checkout Error",
        description: msg,
        variant: "destructive",
      });
      return;
    }

    const invalidItems = orderItems.filter(
      (i) => !i.variantId || i.quantity < 1,
    );
    if (invalidItems.length > 0) {
      const msg =
        "Some items are missing required information. Please return to your cart.";
      setSubmitError(msg);
      toast({
        title: "Checkout Error",
        description: msg,
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "online" && !onlineEnabled) {
      const msg =
        "Online payment is currently unavailable. Please choose Pay on Delivery.";
      setSubmitError(msg);
      toast({
        title: "Checkout Error",
        description: msg,
        variant: "destructive",
      });
      return;
    }
    if (paymentMethod === "pod" && !podEnabled) {
      const msg =
        "Pay on Delivery is currently unavailable. Please choose online payment.";
      setSubmitError(msg);
      toast({
        title: "Checkout Error",
        description: msg,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await orderService.createOrder({
        orderItems: orderItems.map((item) => ({
          variant: item.variantId,
          quantity: item.quantity,
        })),
        fulfillment_type: fulfillment,
        shipping_fee: deliveryFee,
        delivery_city:
          fulfillment === "delivery" ? selectedZone?.city : undefined,
        pickup_location:
          fulfillment === "pickup"
            ? (deliveryConfig?.pickupAddress ?? "")
            : undefined,
        shipping_address: {
          full_name: `${firstName.trim()} ${lastName.trim()}`,
          phone: phone.trim(),
          street: fulfillment === "delivery" ? address.trim() : "",
          city:
            fulfillment === "delivery"
              ? (selectedZone?.city ?? state)
              : "Store Pickup",
          state: state || "Lagos",
          country: "Nigeria",
          postal_code: "",
        },
        paymentMethod: paymentMethod === "online" ? "paystack" : "pod",
      });

      setCreatedOrderId(order._id);
      setCreatedOrderNumber(order.order_number ?? "");
      setCreatedPickupCode(order.pickup_code);

      if (!isBuyNow) clearCart();

      setPaymentInitFailed(false);
      setShowSuccess(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Something went wrong. Please try again.";
      setSubmitError(msg);
      toast({
        title: "Checkout Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (settingsLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!pickupEnabled && !deliveryEnabled) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 px-4">
        <p className="text-gray-600 text-center font-medium">
          Checkout is temporarily unavailable. Please try again later.
        </p>
        <Link to="/cart">
          <Button variant="outline">Back to Cart</Button>
        </Link>
      </div>
    );
  }

  if (paymentOptions.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 px-4">
        <p className="text-gray-600 text-center font-medium">
          No payment methods are currently available. Please try again later.
        </p>
        <Link to="/cart">
          <Button variant="outline">Back to Cart</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
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
              {isBuyNow && (
                <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                  Buy Now
                </span>
              )}
            </h1>
            <div className="w-16" />
          </div>
        </div>
      </div>

      {/* 🎬 Animated content */}
      <div
        ref={contentRef}
        className={`container mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-32 sm:pb-16 ${fadeUp(contentInView)}`}
      >
        {/* Global error banner */}
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
              <span className="text-sm font-semibold text-gray-900">
                Order Summary
              </span>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                {orderItems.length} item{orderItems.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900">
                {formatPrice(grandTotal)}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${showOrderSummary ? "rotate-180" : ""}`}
              />
            </div>
          </button>
          {showOrderSummary && (
            <div className="px-4 pb-4 border-t border-gray-200">
              <div className="mt-3 space-y-3">
                {orderItems.map((item) => (
                  <div
                    key={item.variantId ?? item.id}
                    className="flex items-center gap-3"
                  >
                    <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {item.name}
                      </p>
                      {item.color && (
                        <p className="text-xs text-gray-500">{item.color}</p>
                      )}
                      {item.storage && (
                        <p className="text-xs text-gray-500">{item.storage}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-xs font-bold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-200 space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(orderSubtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Delivery</span>
                    <span
                      className={`font-semibold ${deliveryFee === 0 ? "text-green-600" : "text-gray-900"}`}
                    >
                      {deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-200">
                    <span>Total</span>
                    <span>{formatPrice(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left column — forms */}
          <div className="lg:col-span-2 space-y-5">
            {/* Customer Details */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm sm:text-base font-bold text-gray-900">
                  Customer Details
                </h2>
                {hasProfileData && (
                  <Link
                    to="/settings"
                    className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <UserCircle className="w-3.5 h-3.5" />
                    Edit in Settings
                  </Link>
                )}
              </div>
              {hasProfileData && (
                <div className="mb-4 flex items-start gap-2.5 px-3.5 py-3 bg-purple-50 border border-purple-100 rounded-xl">
                  <UserCircle className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-purple-700 leading-relaxed">
                    Details filled from your profile. Edit here for this order
                    only, or update permanently in{" "}
                    <Link
                      to="/settings"
                      className="font-bold underline underline-offset-2"
                    >
                      Settings
                    </Link>
                    .
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* First Name */}
                <div>
                  <Label
                    htmlFor="firstName"
                    className="text-xs font-semibold text-gray-600 block mb-1.5"
                  >
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Gabriel"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (fieldErrors.firstName)
                        validateField("firstName", e.target.value);
                    }}
                    onBlur={(e) => validateField("firstName", e.target.value)}
                    className={`h-10 text-sm rounded-xl ${fieldErrors.firstName ? "border-red-400 focus-visible:ring-red-400" : "border-gray-200"}`}
                  />
                  {fieldErrors.firstName && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldErrors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <Label
                    htmlFor="lastName"
                    className="text-xs font-semibold text-gray-600 block mb-1.5"
                  >
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (fieldErrors.lastName)
                        validateField("lastName", e.target.value);
                    }}
                    onBlur={(e) => validateField("lastName", e.target.value)}
                    className={`h-10 text-sm rounded-xl ${fieldErrors.lastName ? "border-red-400 focus-visible:ring-red-400" : "border-gray-200"}`}
                  />
                  {fieldErrors.lastName && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldErrors.lastName}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <Label
                    htmlFor="phone"
                    className="text-xs font-semibold text-gray-600 block mb-1.5"
                  >
                    Phone Number
                    <span className="ml-1 text-gray-400 font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="phone"
                    placeholder="08012345678"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (fieldErrors.phone)
                        validateField("phone", e.target.value);
                    }}
                    onBlur={(e) => validateField("phone", e.target.value)}
                    className={`h-10 text-sm rounded-xl ${fieldErrors.phone ? "border-red-400 focus-visible:ring-red-400" : "border-gray-200"}`}
                    type="tel"
                    inputMode="tel"
                  />
                  {fieldErrors.phone ? (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldErrors.phone}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">
                      Nigerian numbers only (e.g. 0801 234 5678)
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label
                    htmlFor="email"
                    className="text-xs font-semibold text-gray-600 block mb-1.5"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email)
                        validateField("email", e.target.value);
                    }}
                    onBlur={(e) => validateField("email", e.target.value)}
                    className={`h-10 text-sm rounded-xl ${fieldErrors.email ? "border-red-400 focus-visible:ring-red-400" : "border-gray-200"}`}
                  />
                  {fieldErrors.email && (
                    <p className="text-xs text-red-500 mt-1">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2.5">
                We'll use this to confirm your delivery
              </p>
            </section>

            {/* Fulfillment Method */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
              <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-4">
                How would you like to receive your order?
              </h2>
              <div
                className={`grid gap-3 mb-5 ${pickupEnabled && deliveryEnabled ? "grid-cols-2" : "grid-cols-1 max-w-xs"}`}
              >
                {deliveryEnabled && (
                  <button
                    onClick={() => setFulfillment("delivery")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      fulfillment === "delivery"
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <MapPin
                      className={`w-6 h-6 ${fulfillment === "delivery" ? "text-purple-600" : "text-gray-400"}`}
                    />
                    <span
                      className={`text-sm font-semibold ${fulfillment === "delivery" ? "text-purple-700" : "text-gray-700"}`}
                    >
                      Delivery
                    </span>
                    <span className="text-xs text-gray-400">
                      To your address
                    </span>
                  </button>
                )}
                {pickupEnabled && (
                  <button
                    onClick={() => setFulfillment("pickup")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      fulfillment === "pickup"
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <Store
                      className={`w-6 h-6 ${fulfillment === "pickup" ? "text-purple-600" : "text-gray-400"}`}
                    />
                    <span
                      className={`text-sm font-semibold ${fulfillment === "pickup" ? "text-purple-700" : "text-gray-700"}`}
                    >
                      Pickup
                    </span>
                    <span className="text-xs text-gray-400">
                      Collect at store — Free
                    </span>
                  </button>
                )}
              </div>

              {/* Delivery fields */}
              {fulfillment === "delivery" && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs font-semibold text-gray-600 block mb-1.5">
                      Delivery Zone / Area{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    {zones.length === 0 ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
                        No delivery zones are configured yet. Please contact us
                        or choose Pickup.
                      </div>
                    ) : (
                      <>
                        <Select
                          value={selectedZone?.city ?? ""}
                          onValueChange={handleZoneSelect}
                        >
                          <SelectTrigger
                            className={`h-10 text-sm rounded-xl ${fieldErrors.zone ? "border-red-400" : "border-gray-200"}`}
                          >
                            <SelectValue placeholder="Select your delivery area…" />
                          </SelectTrigger>
                          <SelectContent>
                            {zones.map((z) => (
                              <SelectItem key={z.city} value={z.city}>
                                {z.city}
                                {z.fee > 0 && (
                                  <span className="ml-2 text-xs text-gray-400">
                                    — ₦{z.fee.toLocaleString()}
                                  </span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldErrors.zone && (
                          <p className="text-xs text-red-500 mt-1">
                            {fieldErrors.zone}
                          </p>
                        )}
                        {selectedZone && !fieldErrors.zone && (
                          <p className="text-xs text-gray-500 mt-1.5">
                            Delivery fee for{" "}
                            <strong>{selectedZone.city}</strong>:{" "}
                            {selectedZone.fee === 0 ? (
                              <span className="text-green-600 font-semibold">
                                Free
                              </span>
                            ) : (
                              <span className="font-semibold text-gray-800">
                                ₦{selectedZone.fee.toLocaleString()}
                              </span>
                            )}
                          </p>
                        )}
                        {!selectedZone && !fieldErrors.zone && (
                          <p className="text-xs text-amber-600 mt-1.5">
                            Can't find your area? You can come to our store for
                            free pickup instead.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* Address */}
                    <div>
                      <Label
                        htmlFor="address"
                        className="text-xs font-semibold text-gray-600 block mb-1.5"
                      >
                        Street Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="address"
                        placeholder="e.g. 9 Adepele Street, Lekki"
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          if (fieldErrors.address)
                            validateField("address", e.target.value);
                        }}
                        onBlur={(e) => validateField("address", e.target.value)}
                        className={`h-10 text-sm rounded-xl ${fieldErrors.address ? "border-red-400 focus-visible:ring-red-400" : "border-gray-200"}`}
                      />
                      {fieldErrors.address && (
                        <p className="text-xs text-red-500 mt-1">
                          {fieldErrors.address}
                        </p>
                      )}
                    </div>

                    {/* State */}
                    <div>
                      <Label
                        htmlFor="state"
                        className="text-xs font-semibold text-gray-600 block mb-1.5"
                      >
                        State <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={state}
                        onValueChange={(v) => {
                          setState(v);
                          setFieldErrors((prev) => ({
                            ...prev,
                            state: undefined,
                          }));
                        }}
                      >
                        <SelectTrigger
                          className={`h-10 text-sm rounded-xl ${fieldErrors.state ? "border-red-400" : "border-gray-200"}`}
                        >
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {nigerianStates.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldErrors.state && (
                        <p className="text-xs text-red-500 mt-1">
                          {fieldErrors.state}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Pickup info */}
              {fulfillment === "pickup" && deliveryConfig && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Store size={15} className="text-green-600" />
                    <p className="text-sm font-bold text-green-800">
                      Pickup Information
                    </p>
                    <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      Free
                    </span>
                  </div>
                  {deliveryConfig.pickupAddress && (
                    <div>
                      <p className="text-xs text-green-600 font-semibold mb-0.5">
                        Location
                      </p>
                      <p className="text-sm text-green-800">
                        {deliveryConfig.pickupAddress}
                      </p>
                    </div>
                  )}
                  {deliveryConfig.pickupHours && (
                    <div>
                      <p className="text-xs text-green-600 font-semibold mb-0.5">
                        Hours
                      </p>
                      <p className="text-sm text-green-800">
                        {deliveryConfig.pickupHours}
                      </p>
                    </div>
                  )}
                  {deliveryConfig.pickupInstructions && (
                    <div>
                      <p className="text-xs text-green-600 font-semibold mb-0.5">
                        Instructions
                      </p>
                      <p className="text-sm text-green-800">
                        {deliveryConfig.pickupInstructions}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-green-700 bg-green-100 rounded-lg px-3 py-2">
                    A pickup code will be generated after you place your order.
                    Bring it when you collect.
                  </p>
                </div>
              )}
            </section>

            {/* Payment Method */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
              <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-4">
                Payment Method
              </h2>
              <div
                className={`grid gap-3 mb-4 ${paymentOptions.length === 1 ? "grid-cols-1 max-w-xs" : "grid-cols-2"}`}
              >
                {paymentOptions.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setPaymentMethod(m.value)}
                    className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl border-2 transition-all ${
                      paymentMethod === m.value
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <m.Icon
                      className={`w-6 h-6 ${paymentMethod === m.value ? "text-purple-600" : "text-gray-400"}`}
                    />
                    <span
                      className={`text-xs font-semibold text-center leading-tight ${paymentMethod === m.value ? "text-purple-700" : "text-gray-700"}`}
                    >
                      {m.label}
                    </span>
                    <span
                      className={`text-[10px] font-medium ${paymentMethod === m.value ? "text-purple-500" : "text-gray-400"}`}
                    >
                      {m.subtitle}
                    </span>
                  </button>
                ))}
              </div>
              {paymentMethod === "online" && (
                <div className="rounded-2xl p-4 text-center bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center mx-auto mb-2">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-bold text-gray-800 mb-1">
                    Secure Payment via Paystack
                  </p>
                  <p className="text-xs text-gray-500">
                    After placing your order you'll be prompted to pay via Card,
                    Bank Transfer, or USSD.
                  </p>
                  <p className="text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-green-500" />
                    Your card details are never stored.
                  </p>
                </div>
              )}
              {paymentMethod === "pod" && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-600">
                  Pay with cash when your order is{" "}
                  {fulfillment === "pickup"
                    ? "collected from our store"
                    : "delivered or after inspection"}
                  .
                </div>
              )}
            </section>

            {/* Terms */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-3.5">
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={termsAccepted}
                  onCheckedChange={(c) => {
                    setTermsAccepted(c as boolean);
                    if (fieldErrors.terms)
                      setFieldErrors((prev) => ({ ...prev, terms: undefined }));
                  }}
                  className="mt-0.5 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
                <span className="text-sm text-gray-700">
                  I accept Aby Gadgets{" "}
                  <span className="text-purple-600 underline cursor-pointer">
                    Terms & Conditions
                  </span>
                  .
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <Checkbox
                  checked={infoConfirmed}
                  onCheckedChange={(c) => {
                    setInfoConfirmed(c as boolean);
                    if (fieldErrors.terms)
                      setFieldErrors((prev) => ({ ...prev, terms: undefined }));
                  }}
                  className="mt-0.5 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
                <span className="text-sm text-gray-700">
                  I have confirmed the information above is correct.
                </span>
              </label>
              {fieldErrors.terms && (
                <p className="text-xs text-red-500">{fieldErrors.terms}</p>
              )}
            </section>
          </div>

          {/* Desktop Order Summary */}
          <div className="hidden sm:block lg:col-span-1">
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 sticky top-24">
              <h2 className="text-base font-bold text-gray-900 mb-5">
                Order Summary
              </h2>
              <div className="space-y-3 mb-5">
                {orderItems.map((item) => (
                  <div
                    key={item.variantId ?? item.id}
                    className="flex items-center gap-3"
                  >
                    <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {item.name}
                      </p>
                      {item.color && (
                        <p className="text-xs text-gray-500">{item.color}</p>
                      )}
                      {item.storage && (
                        <p className="text-xs text-gray-500">{item.storage}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
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
                  <span className="font-semibold">
                    {formatPrice(orderSubtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    {fulfillment === "pickup"
                      ? "Pickup"
                      : selectedZone
                        ? `Delivery (${selectedZone.city})`
                        : "Delivery"}
                  </span>
                  <span
                    className={`font-semibold ${deliveryFee === 0 ? "text-green-600" : "text-gray-900"}`}
                  >
                    {deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
                  </span>
                </div>
                {fulfillment === "delivery" && !selectedZone && (
                  <p className="text-xs text-amber-500 italic">
                    Select a zone to see delivery fee
                  </p>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-lg text-gray-900">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>
              <Button
                className="w-full h-11 font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {isSubmitting
                  ? "Processing…"
                  : paymentMethod === "online"
                    ? `Place Order — ${formatPrice(grandTotal)}`
                    : fulfillment === "pickup"
                      ? "Confirm Pickup Order"
                      : "Confirm Order"}
              </Button>
              {paymentMethod === "online" && (
                <p className="text-xs text-center text-gray-400 mt-2">
                  You'll be prompted to pay after placing your order.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky checkout bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl px-4 py-3 safe-area-bottom">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-400">Total</div>
            <div className="text-base font-bold text-gray-900">
              {formatPrice(grandTotal)}
            </div>
            {fulfillment === "delivery" && selectedZone && (
              <div className="text-[10px] text-gray-400 truncate">
                incl. ₦{deliveryFee.toLocaleString()} delivery to{" "}
                {selectedZone.city}
              </div>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-[2] flex items-center justify-center gap-2 h-12 rounded-2xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting
              ? "Processing…"
              : paymentMethod === "online"
                ? "Place Order"
                : fulfillment === "pickup"
                  ? "Confirm Pickup"
                  : "Confirm Order"}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      <OrderSuccessModal
        open={showSuccess}
        orderId={createdOrderId}
        orderNumber={createdOrderNumber}
        fulfillmentType={fulfillment}
        pickupCode={createdPickupCode}
        pickupAddress={deliveryConfig?.pickupAddress}
        pickupHours={deliveryConfig?.pickupHours}
        email={email || user?.email || ""}
        paymentInitFailed={paymentInitFailed}
        onClose={() => {
          setShowSuccess(false);
          navigate("/orders");
        }}
      />
    </div>
  );
};

export default Checkout;
