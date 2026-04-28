import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Package, CreditCard, Truck, RotateCcw,
  User, ChevronDown, ChevronRight, MessageCircle,
  Clock, Shield, MapPin, Phone, Mail, HelpCircle,
} from "lucide-react";

// ── FAQ Data ──────────────────────────────────────────────────────────────────
interface FAQ {
  q: string;
  a: string;
  tags: string[];
}

interface Category {
  key:   string;
  label: string;
  icon:  React.FC<{ className?: string }>;
  color: string;
  bg:    string;
  border:string;
  faqs:  FAQ[];
}

const CATEGORIES: Category[] = [
  {
    key: "orders",
    label: "Orders",
    icon: Package,
    color: "text-blue-700",
    bg:    "bg-blue-50",
    border:"border-blue-200",
    faqs: [
      {
        q: "How do I track my order?",
        a: "Once your order is confirmed and shipped, go to My Orders and tap Track Order next to your order. You'll see a real-time timeline showing your order's progress from processing all the way to delivery.",
        tags: ["track", "order", "shipping"],
      },
      {
        q: "Can I cancel my order?",
        a: "You can request a cancellation while your order is still in 'Pending' status. Once an order has been confirmed or shipped, cancellation is no longer available. Please contact us immediately if you need to cancel — we'll do our best to help.",
        tags: ["cancel", "order"],
      },
      {
        q: "How long does delivery take?",
        a: "Delivery typically takes 1–3 business days within Lagos and 2–5 business days for other states in Nigeria. Pickup orders are usually ready within 1 business day after order confirmation.",
        tags: ["delivery", "time", "shipping", "days"],
      },
      {
        q: "Can I change my delivery address after placing an order?",
        a: "Address changes are only possible before your order is shipped. Please contact us as soon as possible via our support channels if you need to update your address.",
        tags: ["address", "change", "delivery"],
      },
      {
        q: "What is the difference between delivery and pickup?",
        a: "Delivery means we ship your order directly to your address. Pickup lets you collect your order for free from our store — you'll receive a unique pickup code to show when collecting.",
        tags: ["delivery", "pickup", "difference"],
      },
    ],
  },
  {
    key: "payments",
    label: "Payments",
    icon: CreditCard,
    color: "text-emerald-700",
    bg:    "bg-emerald-50",
    border:"border-emerald-200",
    faqs: [
      {
        q: "What payment methods do you accept?",
        a: "We accept online payments via Paystack (debit/credit cards, bank transfer, USSD) and Pay on Delivery (POD) for eligible orders. You can choose your preferred method at checkout.",
        tags: ["payment", "methods", "card", "transfer", "paystack"],
      },
      {
        q: "Is online payment secure?",
        a: "Yes. All online payments are processed through Paystack, a PCI-DSS compliant payment gateway. We never store your card details — all payment data is handled securely by Paystack.",
        tags: ["secure", "payment", "safe", "card"],
      },
      {
        q: "My payment failed — what should I do?",
        a: "If your payment fails, your order is still saved. Go to My Orders, find the order, and tap Complete Payment to retry. If the issue persists, try a different payment method or contact your bank.",
        tags: ["payment", "failed", "retry", "issue"],
      },
      {
        q: "When will I receive my refund?",
        a: "Refunds are processed within 24 hours of approval. The time to reflect in your account depends on your bank — typically 3–5 business days for card payments.",
        tags: ["refund", "money", "return"],
      },
      {
        q: "Do you offer Pay on Delivery?",
        a: "Yes! Pay on Delivery (POD) is available for eligible orders. You pay with cash when your order arrives or when you collect from our store. Note that POD availability may vary based on your location.",
        tags: ["pay on delivery", "POD", "cash"],
      },
    ],
  },
  {
    key: "delivery",
    label: "Delivery",
    icon: Truck,
    color: "text-amber-700",
    bg:    "bg-amber-50",
    border:"border-amber-200",
    faqs: [
      {
        q: "What are your delivery zones?",
        a: "We currently deliver across Lagos (all major areas) and to other states in Nigeria. Delivery fees and timelines vary by zone — you can see exact fees when you enter your address at checkout.",
        tags: ["zone", "area", "delivery", "lagos"],
      },
      {
        q: "How much is the delivery fee?",
        a: "Delivery fees are calculated based on your location at checkout. Some zones qualify for free delivery. Pickup is always free — collect from our store at no extra cost.",
        tags: ["fee", "cost", "delivery", "free"],
      },
      {
        q: "How do I collect a pickup order?",
        a: "After your order is ready, you'll receive a pickup code (e.g., PKP-A23F). Come to our store during business hours and show this code. Our team will hand over your order.",
        tags: ["pickup", "collect", "code", "store"],
      },
      {
        q: "What are your store pickup hours?",
        a: "Our store is open Monday to Saturday, 9am–6pm. Pickup orders placed and confirmed before 3pm are usually ready the same day. Check your order notifications for specific readiness updates.",
        tags: ["hours", "pickup", "store", "time"],
      },
      {
        q: "What happens if I miss my delivery?",
        a: "Our delivery agent will attempt re-delivery the next business day. You'll receive a notification about the missed delivery. You can also contact us to arrange an alternative delivery time.",
        tags: ["missed", "delivery", "re-delivery"],
      },
    ],
  },
  {
    key: "returns",
    label: "Returns & Refunds",
    icon: RotateCcw,
    color: "text-rose-700",
    bg:    "bg-rose-50",
    border:"border-rose-200",
    faqs: [
      {
        q: "What is your return policy?",
        a: "We accept returns within 7 days of delivery for items in their original condition. Items must be unused, undamaged, and in original packaging. Please contact us to initiate a return before sending anything back.",
        tags: ["return", "policy", "7 days"],
      },
      {
        q: "How do I initiate a return?",
        a: "Go to My Orders, find the delivered order, and contact us via the Help Center or support channels with your order number and reason for return. We'll guide you through the process.",
        tags: ["return", "how", "initiate"],
      },
      {
        q: "How long does a refund take?",
        a: "Once we receive and inspect the returned item (2–3 business days), your refund is processed within 24 hours. Funds typically appear in your account within 3–5 business days depending on your bank.",
        tags: ["refund", "time", "days", "money back"],
      },
      {
        q: "Can I exchange an item instead of returning it?",
        a: "Yes, we offer exchanges subject to stock availability. Please contact us within 7 days of delivery to arrange an exchange. Additional delivery fees may apply.",
        tags: ["exchange", "swap", "different"],
      },
    ],
  },
  {
    key: "account",
    label: "Account",
    icon: User,
    color: "text-purple-700",
    bg:    "bg-purple-50",
    border:"border-purple-200",
    faqs: [
      {
        q: "How do I update my profile information?",
        a: "Go to Settings from the menu and update your name, phone number, or profile photo from the Profile tab. Your updated details will be pre-filled automatically at checkout.",
        tags: ["profile", "update", "name", "settings"],
      },
      {
        q: "How do I change my password?",
        a: "In Settings, go to the Security tab. Enter your current password and your new password (minimum 8 characters). Click Change Password to save.",
        tags: ["password", "change", "security"],
      },
      {
        q: "I forgot my password — how do I reset it?",
        a: "On the login page, click 'Forgot Password' and enter your email address. We'll send you a reset link valid for 1 hour. Check your spam folder if you don't see the email.",
        tags: ["forgot", "password", "reset", "login"],
      },
      {
        q: "How do I manage my saved addresses?",
        a: "Go to Settings → Address Book. You can add, edit, or delete addresses and set a default address for faster checkout.",
        tags: ["address", "saved", "settings"],
      },
    ],
  },
];

// ── Expandable FAQ Item ───────────────────────────────────────────────────────
const FAQItem = ({ faq, isOpen, onToggle }: { faq: FAQ; isOpen: boolean; onToggle: () => void }) => (
  <div className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
    isOpen ? "border-[#6426E1]/30 shadow-sm" : "border-gray-100 hover:border-gray-200"
  }`}>
    <button
      onClick={onToggle}
      className="w-full flex items-start justify-between gap-3 px-5 py-4 text-left bg-white"
    >
      <span className={`text-sm font-semibold leading-snug flex-1 ${isOpen ? "text-[#6426E1]" : "text-gray-800"}`}>
        {faq.q}
      </span>
      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors mt-0.5 ${
        isOpen ? "bg-[#6426E1] text-white" : "bg-gray-100 text-gray-500"
      }`}>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </div>
    </button>
    {isOpen && (
      <div className="px-5 pb-5 bg-purple-50/50 border-t border-purple-100/50">
        <p className="text-sm text-gray-600 leading-relaxed pt-3">{faq.a}</p>
      </div>
    )}
  </div>
);

// ── Contact Card ──────────────────────────────────────────────────────────────
const ContactCard = ({ icon: Icon, title, subtitle, action, color }: {
  icon:     React.FC<{ className?: string }>;
  title:    string;
  subtitle: string;
  action:   string;
  color:    string;
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="font-bold text-gray-800 text-sm">{title}</p>
      <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
    </div>
    <span className="text-xs font-semibold text-[#6426E1] bg-purple-50 px-3 py-1.5 rounded-lg">
      {action}
    </span>
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const HelpCenterPage = () => {
  const navigate                        = useNavigate();
  const [search,  setSearch]            = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openFAQ, setOpenFAQ]           = useState<string | null>(null);

  // Search across all FAQs
  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    const results: { category: Category; faq: FAQ }[] = [];
    for (const cat of CATEGORIES) {
      for (const faq of cat.faqs) {
        if (
          faq.q.toLowerCase().includes(q) ||
          faq.a.toLowerCase().includes(q) ||
          faq.tags.some((t) => t.includes(q))
        ) {
          results.push({ category: cat, faq });
        }
      }
    }
    return results;
  }, [search]);

  const displayedCategory = activeCategory
    ? CATEGORIES.find((c) => c.key === activeCategory)
    : null;

  const toggleFAQ = (key: string) => setOpenFAQ((prev) => (prev === key ? null : key));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #6426E1 0%, #4f1dbf 50%, #3b14a0 100%)" }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />

        <div className="relative max-w-3xl mx-auto px-4 py-12 sm:py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white/90 text-xs font-semibold mb-5 backdrop-blur-sm">
            <HelpCircle className="w-3.5 h-3.5" />
            Help Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
            How can we help you?
          </h1>
          <p className="text-purple-200 text-sm mb-8">
            Find answers to common questions or get in touch with our support team
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setActiveCategory(null); }}
              placeholder="Search for answers… e.g. 'track order', 'refund'"
              className="w-full pl-12 pr-5 py-4 rounded-2xl text-sm text-gray-900 bg-white shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder:text-gray-400"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

        {/* ── SEARCH RESULTS ── */}
        {searchResults !== null && (
          <div>
            <p className="text-sm text-gray-500 mb-4 font-medium">
              {searchResults.length === 0
                ? `No results for "${search}"`
                : `${searchResults.length} result${searchResults.length !== 1 ? "s" : ""} for "${search}"`}
            </p>
            {searchResults.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <p className="text-4xl mb-3">🤔</p>
                <h3 className="font-bold text-gray-800 mb-2">No results found</h3>
                <p className="text-sm text-gray-400 mb-5">Try different keywords, or browse the categories below.</p>
                <button onClick={() => setSearch("")}
                  className="text-sm font-semibold text-[#6426E1] underline-offset-2 hover:underline">
                  Clear search
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map(({ category, faq }) => {
                  const key = `search-${faq.q}`;
                  return (
                    <div key={key}>
                      <div className="flex items-center gap-2 px-1 mb-1">
                        <category.icon className={`w-3.5 h-3.5 ${category.color}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${category.color}`}>
                          {category.label}
                        </span>
                      </div>
                      <FAQItem
                        faq={faq}
                        isOpen={openFAQ === key}
                        onToggle={() => toggleFAQ(key)}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── CATEGORY GRID (when not searching) ── */}
        {!search && !activeCategory && (
          <>
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Browse by Topic</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => { setActiveCategory(cat.key); setOpenFAQ(null); }}
                    className={`flex flex-col items-center gap-3 p-5 rounded-2xl border ${cat.bg} ${cat.border} hover:shadow-md transition-all group text-center`}
                  >
                    <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                      <cat.icon className={`w-6 h-6 ${cat.color}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${cat.color}`}>{cat.label}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{cat.faqs.length} articles</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${cat.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Popular questions */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Popular Questions</h2>
              <div className="space-y-2">
                {[
                  CATEGORIES[0].faqs[0], // track order
                  CATEGORIES[1].faqs[0], // payment methods
                  CATEGORIES[0].faqs[2], // delivery time
                  CATEGORIES[2].faqs[2], // pickup
                  CATEGORIES[2].faqs[1], // delivery fee
                  CATEGORIES[3].faqs[0], // return policy
                ].map((faq) => {
                  const key = `pop-${faq.q}`;
                  return (
                    <FAQItem
                      key={key}
                      faq={faq}
                      isOpen={openFAQ === key}
                      onToggle={() => toggleFAQ(key)}
                    />
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── CATEGORY DETAIL ── */}
        {!search && activeCategory && displayedCategory && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => { setActiveCategory(null); setOpenFAQ(null); }}
                className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-colors"
              >
                ←
              </button>
              <div className={`w-10 h-10 rounded-xl ${displayedCategory.bg} flex items-center justify-center`}>
                <displayedCategory.icon className={`w-5 h-5 ${displayedCategory.color}`} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{displayedCategory.label}</h2>
                <p className="text-xs text-gray-400">{displayedCategory.faqs.length} articles</p>
              </div>
            </div>

            <div className="space-y-2">
              {displayedCategory.faqs.map((faq) => {
                const key = `cat-${faq.q}`;
                return (
                  <FAQItem
                    key={key}
                    faq={faq}
                    isOpen={openFAQ === key}
                    onToggle={() => toggleFAQ(key)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* ── Still need help? ── */}
        {!search && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Still need help?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <ContactCard
                icon={MessageCircle}
                title="Chat with Us"
                subtitle="Available Mon – Sat, 9am–6pm"
                action="Start Chat"
                color="bg-blue-50 text-blue-600"
              />
              <ContactCard
                icon={Mail}
                title="Email Support"
                subtitle="We reply within 24 hours"
                action="support@abygadgets.com"
                color="bg-purple-50 text-purple-600"
              />
              <ContactCard
                icon={Phone}
                title="Call Us"
                subtitle="Mon – Sat, 9am–6pm"
                action="+234 800 ABY TECH"
                color="bg-emerald-50 text-emerald-600"
              />
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Track my order",    path: "/orders",   icon: Truck   },
                  { label: "View all orders",   path: "/orders",   icon: Package },
                  { label: "Update my profile", path: "/settings", icon: User    },
                  { label: "Notifications",     path: "/notifications", icon: Clock },
                ].map(({ label, path, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => navigate(path)}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-purple-50 hover:border-purple-200 transition-all text-left group"
                  >
                    <Icon className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors flex-shrink-0" />
                    <span className="text-xs font-semibold text-gray-700 group-hover:text-purple-700 transition-colors">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
          <Shield className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 leading-relaxed">
            Aby Gadgets is committed to your satisfaction. If you experience any issues, our support team will resolve them promptly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;