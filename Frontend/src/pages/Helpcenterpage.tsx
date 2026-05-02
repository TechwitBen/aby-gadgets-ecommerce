import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Package, CreditCard, Truck, RotateCcw,
  User, ChevronDown, ChevronRight, MessageCircle,
  Shield, MapPin, Phone, Mail, HelpCircle, ArrowLeft, X,
  Clock, Zap,
} from "lucide-react";

// ── FAQ Data ──────────────────────────────────────────────────────────────────
interface FAQ { q: string; a: string; tags: string[]; }
interface Category {
  key: string; label: string;
  icon: React.FC<{ className?: string }>;
  color: string; bg: string; border: string; accent: string;
  faqs: FAQ[];
}

const CATEGORIES: Category[] = [
  {
    key: "orders", label: "Orders", icon: Package,
    color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100", accent: "bg-blue-600",
    faqs: [
      { q: "How do I track my order?", a: "Once your order is confirmed and shipped, go to My Orders and tap Track Order next to your order. You'll see a real-time timeline showing your order's progress from processing all the way to delivery.", tags: ["track", "order", "shipping"] },
      { q: "Can I cancel my order?", a: "You can request a cancellation while your order is still in 'Pending' status. Once an order has been confirmed or shipped, cancellation is no longer available. Please contact us immediately if you need to cancel — we'll do our best to help.", tags: ["cancel", "order"] },
      { q: "How long does delivery take?", a: "Delivery typically takes 1–3 business days within Lagos and 2–5 business days for other states in Nigeria. Pickup orders are usually ready within 1 business day after order confirmation.", tags: ["delivery", "time", "shipping", "days"] },
      { q: "Can I change my delivery address after placing an order?", a: "Address changes are only possible before your order is shipped. Please contact us as soon as possible via our support channels if you need to update your address.", tags: ["address", "change", "delivery"] },
      { q: "What is the difference between delivery and pickup?", a: "Delivery means we ship your order directly to your address. Pickup lets you collect your order for free from our store — you'll receive a unique pickup code to show when collecting.", tags: ["delivery", "pickup", "difference"] },
    ],
  },
  {
    key: "payments", label: "Payments", icon: CreditCard,
    color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100", accent: "bg-emerald-600",
    faqs: [
      { q: "What payment methods do you accept?", a: "We accept online payments via Paystack (debit/credit cards, bank transfer, USSD) and Pay on Delivery (POD) for eligible orders. You can choose your preferred method at checkout.", tags: ["payment", "methods", "card", "transfer", "paystack"] },
      { q: "Is online payment secure?", a: "Yes. All online payments are processed through Paystack, a PCI-DSS compliant payment gateway. We never store your card details — all payment data is handled securely by Paystack.", tags: ["secure", "payment", "safe", "card"] },
      { q: "My payment failed — what should I do?", a: "If your payment fails, your order is still saved. Go to My Orders, find the order, and tap Complete Payment to retry. If the issue persists, try a different payment method or contact your bank.", tags: ["payment", "failed", "retry", "issue"] },
      { q: "When will I receive my refund?", a: "Refunds are processed within 24 hours of approval. The time to reflect in your account depends on your bank — typically 3–5 business days for card payments.", tags: ["refund", "money", "return"] },
      { q: "Do you offer Pay on Delivery?", a: "Yes! Pay on Delivery (POD) is available for eligible orders. You pay with cash when your order arrives or when you collect from our store. Note that POD availability may vary based on your location.", tags: ["pay on delivery", "POD", "cash"] },
    ],
  },
  {
    key: "delivery", label: "Delivery", icon: Truck,
    color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100", accent: "bg-amber-600",
    faqs: [
      { q: "What are your delivery zones?", a: "We currently deliver across Lagos (all major areas) and to other states in Nigeria. Delivery fees and timelines vary by zone — you can see exact fees when you enter your address at checkout.", tags: ["zone", "area", "delivery", "lagos"] },
      { q: "How much is the delivery fee?", a: "Delivery fees are calculated based on your location at checkout. Some zones qualify for free delivery. Pickup is always free — collect from our store at no extra cost.", tags: ["fee", "cost", "delivery", "free"] },
      { q: "How do I collect a pickup order?", a: "After your order is ready, you'll receive a pickup code (e.g., PKP-A23F). Come to our store during business hours and show this code. Our team will hand over your order.", tags: ["pickup", "collect", "code", "store"] },
      { q: "What are your store pickup hours?", a: "Our store is open Monday to Saturday, 9am–6pm. Pickup orders placed and confirmed before 3pm are usually ready the same day. Check your order notifications for specific readiness updates.", tags: ["hours", "pickup", "store", "time"] },
      { q: "What happens if I miss my delivery?", a: "Our delivery agent will attempt re-delivery the next business day. You'll receive a notification about the missed delivery. You can also contact us to arrange an alternative delivery time.", tags: ["missed", "delivery", "re-delivery"] },
    ],
  },
  {
    key: "returns", label: "Returns", icon: RotateCcw,
    color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-100", accent: "bg-rose-600",
    faqs: [
      { q: "What is your return policy?", a: "We accept returns within 7 days of delivery for items in their original condition. Items must be unused, undamaged, and in original packaging. Please contact us to initiate a return before sending anything back.", tags: ["return", "policy", "7 days"] },
      { q: "How do I initiate a return?", a: "Go to My Orders, find the delivered order, and contact us via the Help Center or support channels with your order number and reason for return. We'll guide you through the process.", tags: ["return", "how", "initiate"] },
      { q: "How long does a refund take?", a: "Once we receive and inspect the returned item (2–3 business days), your refund is processed within 24 hours. Funds typically appear in your account within 3–5 business days depending on your bank.", tags: ["refund", "time", "days", "money back"] },
      { q: "Can I exchange an item?", a: "Yes, we offer exchanges subject to stock availability. Please contact us within 7 days of delivery to arrange an exchange. Additional delivery fees may apply.", tags: ["exchange", "swap", "different"] },
    ],
  },
  {
    key: "account", label: "Account", icon: User,
    color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-100", accent: "bg-violet-600",
    faqs: [
      { q: "How do I update my profile information?", a: "Go to Settings from the menu and update your name, phone number, or profile photo from the Profile tab. Your updated details will be pre-filled automatically at checkout.", tags: ["profile", "update", "name", "settings"] },
      { q: "How do I change my password?", a: "In Settings, go to the Security tab. Enter your current password and your new password (minimum 8 characters). Click Change Password to save.", tags: ["password", "change", "security"] },
      { q: "I forgot my password — how do I reset it?", a: "On the login page, click 'Forgot Password' and enter your email address. We'll send you a reset link valid for 1 hour. Check your spam folder if you don't see the email.", tags: ["forgot", "password", "reset", "login"] },
      { q: "How do I manage my saved addresses?", a: "Go to Settings → Addresses. You can add, edit, or delete addresses and set a default address for faster checkout.", tags: ["address", "saved", "settings"] },
    ],
  },
];

// ── FAQ Item ──────────────────────────────────────────────────────────────────
const FAQItem = ({ faq, isOpen, onToggle }: { faq: FAQ; isOpen: boolean; onToggle: () => void }) => (
  <div className={`rounded-2xl border bg-white overflow-hidden transition-all duration-200 ${
    isOpen ? "border-gray-200 shadow-sm" : "border-gray-100 hover:border-gray-200"
  }`}>
    <button
      onClick={onToggle}
      className="w-full flex items-start justify-between gap-3 px-4 sm:px-5 py-4 text-left"
    >
      <span className={`text-sm font-semibold leading-snug flex-1 ${
        isOpen ? "text-gray-900" : "text-gray-700"
      }`}>
        {faq.q}
      </span>
      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all mt-0.5 ${
        isOpen ? "bg-gray-900 text-white rotate-180" : "bg-gray-100 text-gray-500"
      }`}>
        <ChevronDown className="w-3.5 h-3.5" />
      </div>
    </button>
    {isOpen && (
      <div className="px-4 sm:px-5 pb-4 border-t border-gray-50 bg-gray-50/50">
        <p className="text-sm text-gray-600 leading-relaxed pt-3">{faq.a}</p>
      </div>
    )}
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const HelpCenterPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    const results: { category: Category; faq: FAQ }[] = [];
    for (const cat of CATEGORIES) {
      for (const faq of cat.faqs) {
        if (faq.q.toLowerCase().includes(q) || faq.a.toLowerCase().includes(q) || faq.tags.some((t) => t.includes(q))) {
          results.push({ category: cat, faq });
        }
      }
    }
    return results;
  }, [search]);

  const displayedCategory = activeCategory ? CATEGORIES.find((c) => c.key === activeCategory) : null;
  const toggleFAQ = (key: string) => setOpenFAQ((prev) => (prev === key ? null : key));

  const popularFAQs = [
    CATEGORIES[0].faqs[0],
    CATEGORIES[1].faqs[0],
    CATEGORIES[0].faqs[2],
    CATEGORIES[2].faqs[2],
    CATEGORIES[3].faqs[0],
  ];

  return (
    <div className="min-h-screen bg-gray-50/60">
      {/* ── Page Header — clean white, not purple ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 pt-6 pb-6">
          {/* Title */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-gray-900 flex items-center justify-center shadow-sm flex-shrink-0">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">Help Center</h1>
              <p className="text-xs text-gray-400 mt-0.5">Find answers or get in touch with support</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setActiveCategory(null); setOpenFAQ(null); }}
              placeholder="Search — e.g. 'track order', 'refund', 'payment'"
              className="w-full pl-11 pr-10 py-3 sm:py-3.5 rounded-xl text-sm text-gray-900 bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/15 focus:bg-white focus:border-gray-300 transition-all placeholder:text-gray-400"
            />
            {search && (
              <button
                onClick={() => { setSearch(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-300 text-gray-600 hover:bg-gray-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick topic pills */}
          {!search && (
            <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-0.5">
              {["Track order", "Payment failed", "Return item", "Pickup code", "Change password"].map((q) => (
                <button
                  key={q}
                  onClick={() => { setSearch(q); setActiveCategory(null); setOpenFAQ(null); }}
                  className="flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* ── SEARCH RESULTS ── */}
        {searchResults !== null && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500 font-medium">
                {searchResults.length === 0
                  ? `No results for "${search}"`
                  : `${searchResults.length} result${searchResults.length !== 1 ? "s" : ""} for "${search}"`}
              </p>
              <button
                onClick={() => setSearch("")}
                className="text-xs text-gray-400 hover:text-gray-600 font-medium"
              >
                Clear
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
                <p className="text-4xl mb-3">🤔</p>
                <h3 className="font-bold text-gray-800 mb-2 text-sm">No results found</h3>
                <p className="text-xs text-gray-400 mb-5 max-w-xs mx-auto leading-relaxed">
                  Try different keywords, or browse the categories below.
                </p>
                <button onClick={() => setSearch("")}
                  className="text-sm font-semibold text-gray-700 underline-offset-2 hover:underline">
                  Browse all topics
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map(({ category, faq }) => {
                  const key = `search-${faq.q}`;
                  return (
                    <div key={key}>
                      <div className="flex items-center gap-1.5 px-1 mb-1.5">
                        <div className={`w-4 h-4 rounded flex items-center justify-center ${category.accent}`}>
                          <category.icon className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${category.color}`}>
                          {category.label}
                        </span>
                      </div>
                      <FAQItem faq={faq} isOpen={openFAQ === key} onToggle={() => toggleFAQ(key)} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── BROWSE CATEGORIES (default view) ── */}
        {!search && !activeCategory && (
          <>
            {/* Category grid */}
            <div>
              <h2 className="text-sm font-bold text-gray-900 mb-3">Browse by Topic</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => { setActiveCategory(cat.key); setOpenFAQ(null); }}
                    className={`flex flex-col items-start gap-3 p-4 sm:p-5 rounded-2xl border ${cat.bg} ${cat.border} hover:shadow-md transition-all group text-left`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`w-10 h-10 rounded-xl ${cat.accent} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                        <cat.icon className="w-5 h-5 text-white" />
                      </div>
                      <ChevronRight className={`w-4 h-4 ${cat.color} opacity-40 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all`} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${cat.color}`}>{cat.label}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{cat.faqs.length} articles</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular questions */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-gray-900">Popular Questions</h2>
              </div>
              <div className="space-y-2">
                {popularFAQs.map((faq) => {
                  const key = `pop-${faq.q}`;
                  return <FAQItem key={key} faq={faq} isOpen={openFAQ === key} onToggle={() => toggleFAQ(key)} />;
                })}
              </div>
            </div>

            {/* Contact cards */}
            <div>
              <h2 className="text-sm font-bold text-gray-900 mb-3">Still need help?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                {[
                  { icon: MessageCircle, title: "Live Chat", sub: "Mon–Sat · 9am–6pm", action: "Start Chat", color: "bg-blue-600" },
                  { icon: Mail, title: "Email Support", sub: "Reply within 24hrs", action: "support@abygadgets.com", color: "bg-violet-600" },
                  { icon: Phone, title: "Call Us", sub: "Mon–Sat · 9am–6pm", action: "+234 800 ABY TECH", color: "bg-emerald-600" },
                ].map(({ icon: Icon, title, sub, action, color }) => (
                  <div key={title} className="bg-white rounded-2xl border border-gray-100 p-4 flex sm:flex-col items-center sm:text-center gap-3 hover:shadow-md transition-shadow">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 sm:flex-none">
                      <p className="font-bold text-gray-800 text-sm">{title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                      <span className="mt-1.5 inline-block text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                        {action}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick nav links */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
                <h3 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Track my order", path: "/orders", icon: Truck },
                    { label: "View all orders", path: "/orders", icon: Package },
                    { label: "Update profile", path: "/settings", icon: User },
                    { label: "Notifications", path: "/notifications", icon: Clock },
                  ].map(({ label, path, icon: Icon }) => (
                    <button
                      key={label}
                      onClick={() => navigate(path)}
                      className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-gray-100 bg-gray-50/80 hover:bg-gray-100 hover:border-gray-200 transition-all text-left group"
                    >
                      <Icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 flex-shrink-0 transition-colors" />
                      <span className="text-xs font-semibold text-gray-700">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Trust badge */}
            <div className="flex items-start gap-3 px-4 py-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-700 leading-relaxed">
                <strong>Aby Gadgets</strong> is committed to your satisfaction. If you experience any issues, our support team will resolve them promptly.
              </p>
            </div>
          </>
        )}

        {/* ── CATEGORY DETAIL ── */}
        {!search && activeCategory && displayedCategory && (
          <div>
            {/* Back + header */}
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => { setActiveCategory(null); setOpenFAQ(null); }}
                className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-300 hover:text-gray-800 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className={`w-10 h-10 rounded-xl ${displayedCategory.accent} flex items-center justify-center`}>
                <displayedCategory.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">{displayedCategory.label}</h2>
                <p className="text-xs text-gray-400">{displayedCategory.faqs.length} articles</p>
              </div>
            </div>

            <div className="space-y-2">
              {displayedCategory.faqs.map((faq) => {
                const key = `cat-${faq.q}`;
                return (
                  <FAQItem key={key} faq={faq} isOpen={openFAQ === key} onToggle={() => toggleFAQ(key)} />
                );
              })}
            </div>

            {/* Still need help? — inline mini */}
            <div className="mt-6 p-4 bg-white rounded-2xl border border-gray-100 flex items-center gap-3 shadow-sm">
              <MessageCircle className="w-9 h-9 text-blue-600 flex-shrink-0 bg-blue-50 rounded-xl p-2" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">Didn't find your answer?</p>
                <p className="text-xs text-gray-400 mt-0.5">Our support team is available Mon–Sat, 9am–6pm</p>
              </div>
              <button
                onClick={() => setActiveCategory(null)}
                className="flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                Contact
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpCenterPage;