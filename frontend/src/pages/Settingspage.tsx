import { useState, useEffect } from "react";
import {
  User,
  Lock,
  MapPin,
  Bell,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit2,
  Check,
  Star,
  Loader2,
  AlertCircle,
  Home,
  Briefcase,
  Save,
} from "lucide-react";
import {
  userService,
  type UserProfile,
  type UserAddress,
} from "@/services/user.service";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useInView, fadeUp } from "@/hooks/useInView"; // ✅ added

// ── Brand colour ──────────────────────────────────────────────────────────────
const BRAND = "#6426E1";
const BRAND_LIGHT = "#F0EBFF";
const BRAND_HOVER = "#5420C7";
const BRAND_BORDER = "#D9CAFF";

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const ADDRESS_LABELS = ["Home", "Work", "School", "Other"];

export type AddressFormData = {
  _id?: string;
  label: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  isDefault: boolean;
};

type SettingsTab = "profile" | "security" | "addresses" | "notifications";

const TABS: {
  key: SettingsTab;
  label: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { key: "profile", label: "Profile", icon: User },
  { key: "security", label: "Security", icon: Lock },
  { key: "addresses", label: "Addresses", icon: MapPin },
  { key: "notifications", label: "Notifications", icon: Bell },
];

// ── Initials avatar ───────────────────────────────────────────────────────────
const getInitials = (
  name?: string,
  username?: string,
  email?: string,
): string => {
  const src = name?.trim() || username?.trim() || email?.trim() || "U";
  return src
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

// ── Toggle ────────────────────────────────────────────────────────────────────
const Toggle = ({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) => (
  <div className="flex items-start justify-between gap-4 py-4">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-800">{label}</p>
      {description && (
        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
          {description}
        </p>
      )}
    </div>
    <button
      onClick={() => onChange(!checked)}
      style={checked ? { backgroundColor: BRAND } : {}}
      className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 mt-0.5 ${
        checked ? "" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

// ── Address Modal ─────────────────────────────────────────────────────────────
const AddressModal = ({
  open,
  address,
  onClose,
  onSave,
}: {
  open: boolean;
  address: AddressFormData | null;
  onClose: () => void;
  onSave: (data: AddressFormData) => Promise<void>;
}) => {
  const [form, setForm] = useState<AddressFormData>({
    label: "Home",
    street: "",
    city: "",
    state: "Lagos",
    country: "Nigeria",
    postal_code: "",
    isDefault: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (address) {
      setForm({
        _id: address._id,
        label: address.label ?? "Home",
        street: address.street ?? "",
        city: address.city ?? "",
        state: address.state ?? "Lagos",
        country: address.country ?? "Nigeria",
        postal_code: address.postal_code ?? "",
        isDefault: address.isDefault ?? false,
      });
    } else {
      setForm({
        label: "Home",
        street: "",
        city: "",
        state: "Lagos",
        country: "Nigeria",
        postal_code: "",
        isDefault: false,
      });
    }
  }, [address, open]);

  if (!open) return null;

  const set =
    (key: keyof AddressFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-base">
            {address?._id ? "Edit Address" : "Add New Address"}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Delivery name & phone are taken from your profile
          </p>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Label chips */}
          <div>
            <Label className="text-xs font-semibold text-gray-600 mb-2 block">
              Address Label
            </Label>
            <div className="flex gap-2 flex-wrap">
              {ADDRESS_LABELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setForm((f) => ({ ...f, label: l }))}
                  style={
                    form.label === l
                      ? {
                          backgroundColor: BRAND,
                          borderColor: BRAND,
                          color: "#fff",
                        }
                      : {}
                  }
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    form.label === l
                      ? ""
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {l === "Work" ? (
                    <Briefcase className="w-3 h-3" />
                  ) : (
                    <Home className="w-3 h-3" />
                  )}
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Street Address *
            </Label>
            <Input
              value={form.street}
              onChange={set("street")}
              placeholder="e.g. 9, Adepele Street, Lekki"
              className="h-11 rounded-xl border-gray-200 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                City *
              </Label>
              <Input
                value={form.city}
                onChange={set("city")}
                placeholder="Lagos"
                className="h-11 rounded-xl border-gray-200 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                State *
              </Label>
              <select
                value={form.state}
                onChange={set("state")}
                className="w-full h-11 text-sm border border-gray-200 rounded-xl px-3 focus:outline-none bg-white"
              >
                {NIGERIAN_STATES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Postal Code{" "}
              <span className="text-gray-300 font-normal">(optional)</span>
            </Label>
            <Input
              value={form.postal_code}
              onChange={set("postal_code")}
              placeholder="100001"
              className="h-11 rounded-xl border-gray-200 text-sm"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer py-2 px-3 rounded-xl bg-gray-50 border border-gray-100">
            <button
              type="button"
              onClick={() =>
                setForm((f) => ({ ...f, isDefault: !f.isDefault }))
              }
              style={form.isDefault ? { backgroundColor: BRAND } : {}}
              className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${form.isDefault ? "" : "bg-gray-200"}`}
            >
              <span
                className={`block mt-0.5 ml-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  form.isDefault ? "translate-x-5" : ""
                }`}
              />
            </button>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                Set as default
              </p>
              <p className="text-xs text-gray-400">
                Used automatically at checkout
              </p>
            </div>
          </label>
        </div>

        <div className="px-5 pb-6 flex gap-3 border-t border-gray-100 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl h-11"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !form.street || !form.city}
            style={{ backgroundColor: BRAND }}
            className="flex-1 rounded-xl h-11 text-white hover:opacity-90 border-0"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-1.5" /> Save Address
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const UserSettingsPage = () => {
  const { toast } = useToast();

  // 🎬 Page entrance animation
  const { ref: pageRef, isInView: pageInView } = useInView({
    once: true,
    threshold: 0,
  });

  const [tab, setTab] = useState<SettingsTab>("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurr, setShowCurr] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [addrModal, setAddrModal] = useState<{
    open: boolean;
    address: AddressFormData | null;
  }>({
    open: false,
    address: null,
  });

  const [prefs, setPrefs] = useState({
    orderUpdates: true,
    emailNotifications: true,
    paymentAlerts: true,
  });
  const [prefSaving, setPrefSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      userService.getProfile(),
      userService.getNotificationPreferences(),
    ])
      .then(([prof, p]) => {
        setProfile(prof);
        setName(prof.name ?? prof.username ?? "");
        setPhone(prof.phone ?? "");
        setAddresses(prof.addresses ?? []);
        setPrefs(p);
      })
      .catch(() =>
        toast({ variant: "destructive", title: "Failed to load settings" }),
      )
      .finally(() => setLoading(false));
  }, []);

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const updated = await userService.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
      });
      setProfile(updated);
      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
    } catch {
      toast({ variant: "destructive", title: "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    setPwError(null);
    if (newPw !== confirmPw) {
      setPwError("Passwords do not match");
      return;
    }
    if (newPw.length < 8) {
      setPwError("Password must be at least 8 characters");
      return;
    }
    setPwSaving(true);
    try {
      await userService.changePassword({
        currentPassword: currentPw,
        newPassword: newPw,
      });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      toast({
        title: "Password changed",
        description: "Your password has been updated securely.",
      });
    } catch (err: any) {
      setPwError(err?.response?.data?.message ?? "Failed to change password");
    } finally {
      setPwSaving(false);
    }
  };

  const handleAddrSave = async (data: AddressFormData) => {
    try {
      const payload = {
        label: data.label,
        street: data.street,
        city: data.city,
        state: data.state,
        country: data.country,
        postal_code: data.postal_code,
        isDefault: data.isDefault,
      };
      const updated = data._id
        ? await userService.updateAddress(data._id, payload)
        : await userService.addAddress(payload as any);
      setAddresses(updated);
      toast({ title: data._id ? "Address updated" : "Address added" });
    } catch {
      toast({ variant: "destructive", title: "Failed to save address" });
    }
  };

  const handleDeleteAddr = async (id: string) => {
    try {
      setAddresses(await userService.deleteAddress(id));
      toast({ title: "Address removed" });
    } catch {
      toast({ variant: "destructive", title: "Failed to remove address" });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      setAddresses(await userService.setDefaultAddress(id));
    } catch {
      toast({ variant: "destructive", title: "Failed to set default" });
    }
  };

  const handlePrefChange = async (key: keyof typeof prefs, val: boolean) => {
    const next = { ...prefs, [key]: val };
    setPrefs(next);
    setPrefSaving(true);
    try {
      await userService.updateNotificationPreferences(next);
    } catch {
      setPrefs(prefs);
      toast({ variant: "destructive", title: "Failed to update preferences" });
    } finally {
      setPrefSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: BRAND }} />
      </div>
    );

  const initials = getInitials(
    profile?.name,
    profile?.username,
    profile?.email,
  );

  const pwStrength =
    newPw.length === 0
      ? 0
      : newPw.length < 6
        ? 1
        : newPw.length < 8
          ? 2
          : newPw.length < 12
            ? 3
            : 4;
  const pwStrengthLabel = ["", "Too weak", "Weak", "Good", "Strong"][
    pwStrength
  ];
  const pwStrengthColor = [
    "",
    "bg-red-400",
    "bg-amber-400",
    "bg-blue-400",
    "bg-emerald-400",
  ][pwStrength];

  return (
    <div
      ref={pageRef}
      className={`min-h-screen bg-gray-50 ${fadeUp(pageInView)}`}
    >
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 pt-6 pb-0">
          {/* User identity row */}
          <div className="flex items-center gap-4 pb-5">
            {/* Initials avatar — no photo */}
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0 shadow-md select-none"
              style={{
                background: `linear-gradient(135deg, ${BRAND} 0%, #8B5CF6 100%)`,
              }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                {profile?.name || profile?.username}
              </h1>
              <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
              <span
                className="mt-1.5 inline-block text-[10px] font-bold px-2.5 py-1 rounded-full capitalize"
                style={{ backgroundColor: BRAND_LIGHT, color: BRAND }}
              >
                {profile?.role}
              </span>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex overflow-x-auto no-scrollbar -mx-4 px-4 gap-0">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={
                  tab === key ? { borderBottomColor: BRAND, color: BRAND } : {}
                }
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
                  tab === key
                    ? "border-b-2"
                    : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* ── PROFILE TAB ── */}
        {tab === "profile" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-5 border-b border-gray-50">
              <h2 className="text-sm font-bold text-gray-900">
                Personal Information
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Your name and phone are used on all delivery orders
              </p>
            </div>

            <div className="px-5 sm:px-6 py-5 space-y-4">
              {/* Initials preview block */}
              <div
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{
                  backgroundColor: BRAND_LIGHT,
                  border: `1px solid ${BRAND_BORDER}`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0 select-none shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${BRAND} 0%, #8B5CF6 100%)`,
                  }}
                >
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: BRAND }}>
                    Your Avatar
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#7C55E8" }}>
                    Generated automatically from your name — no photo needed
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-gray-600 block mb-1.5">
                    Full Name
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="h-11 rounded-xl border-gray-200 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-600 block mb-1.5">
                    Username{" "}
                    <span className="text-gray-300 font-normal">
                      (read only)
                    </span>
                  </Label>
                  <Input
                    value={profile?.username ?? ""}
                    readOnly
                    className="h-11 rounded-xl border-gray-200 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-600 block mb-1.5">
                    Phone Number
                  </Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    type="tel"
                    className="h-11 rounded-xl border-gray-200 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-600 block mb-1.5">
                    Email Address{" "}
                    <span className="text-gray-300 font-normal">
                      (read only)
                    </span>
                  </Label>
                  <Input
                    value={profile?.email ?? ""}
                    readOnly
                    className="h-11 rounded-xl border-gray-200 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  Name & phone are auto-filled at checkout on all your addresses
                </p>
                <Button
                  onClick={handleProfileSave}
                  disabled={saving}
                  style={{ backgroundColor: BRAND }}
                  className="rounded-xl text-white px-6 h-10 text-sm font-semibold flex-shrink-0 hover:opacity-90 border-0"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── SECURITY TAB ── */}
        {tab === "security" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-5 border-b border-gray-50">
              <h2 className="text-sm font-bold text-gray-900">
                Change Password
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Use a strong password with at least 8 characters
              </p>
            </div>

            <div className="px-5 sm:px-6 py-5 space-y-4">
              {pwError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {pwError}
                </div>
              )}

              <div>
                <Label className="text-xs font-semibold text-gray-600 block mb-1.5">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    type={showCurr ? "text" : "password"}
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 rounded-xl border-gray-200 text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurr(!showCurr)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurr ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-600 block mb-1.5">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    type={showNew ? "text" : "password"}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="At least 8 characters"
                    className="h-11 rounded-xl border-gray-200 text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNew ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {newPw && (
                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i < pwStrength ? pwStrengthColor : "bg-gray-100"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {pwStrengthLabel} password
                    </p>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-xs font-semibold text-gray-600 block mb-1.5">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Re-enter new password"
                    className={`h-11 rounded-xl text-sm pr-10 ${
                      confirmPw && confirmPw !== newPw
                        ? "border-red-300"
                        : "border-gray-200"
                    }`}
                  />
                  {confirmPw && confirmPw === newPw && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  onClick={handlePasswordSave}
                  disabled={pwSaving || !currentPw || !newPw || !confirmPw}
                  style={{ backgroundColor: BRAND }}
                  className="rounded-xl text-white px-6 h-10 text-sm font-semibold hover:opacity-90 border-0"
                >
                  {pwSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Changing…
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── ADDRESSES TAB ── */}
        {tab === "addresses" && (
          <div className="space-y-4">
            <div
              className="flex items-start gap-3 px-4 py-3.5 rounded-2xl"
              style={{
                backgroundColor: BRAND_LIGHT,
                border: `1px solid ${BRAND_BORDER}`,
              }}
            >
              <AlertCircle
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={{ color: BRAND }}
              />
              <div>
                <p className="text-xs font-semibold" style={{ color: BRAND }}>
                  Delivery name & phone
                </p>
                <p
                  className="text-xs mt-0.5 leading-relaxed"
                  style={{ color: "#7C55E8" }}
                >
                  Orders are delivered to{" "}
                  <strong>{profile?.name || profile?.username}</strong>
                  {profile?.phone ? ` · ${profile.phone}` : ""}. To change
                  these, update your{" "}
                  <button
                    onClick={() => setTab("profile")}
                    className="underline font-semibold"
                  >
                    Profile
                  </button>
                  .
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  Address Book
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {addresses.length} saved address
                  {addresses.length !== 1 ? "es" : ""}
                </p>
              </div>
              <Button
                onClick={() => setAddrModal({ open: true, address: null })}
                style={{ backgroundColor: BRAND }}
                className="rounded-xl text-white text-xs h-9 px-3.5 font-semibold hover:opacity-90 border-0"
                size="sm"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Address
              </Button>
            </div>

            {addresses.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: BRAND_LIGHT }}
                >
                  <MapPin className="w-7 h-7" style={{ color: BRAND }} />
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-1">
                  No addresses saved
                </h3>
                <p className="text-xs text-gray-400 mb-5 max-w-xs mx-auto leading-relaxed">
                  Add delivery addresses for faster checkout.
                </p>
                <Button
                  onClick={() => setAddrModal({ open: true, address: null })}
                  style={{ backgroundColor: BRAND }}
                  className="rounded-xl text-white text-sm h-10 hover:opacity-90 border-0"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Add First Address
                </Button>
              </div>
            ) : (
              <div className="grid gap-3">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm transition-all"
                    style={
                      addr.isDefault
                        ? {
                            border: `1.5px solid ${BRAND}`,
                            boxShadow: `0 0 0 3px ${BRAND_LIGHT}`,
                          }
                        : { border: "1px solid #f3f4f6" }
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={
                            addr.isDefault
                              ? { backgroundColor: BRAND }
                              : { backgroundColor: "#f3f4f6" }
                          }
                        >
                          {addr.label === "Work" ? (
                            <Briefcase
                              className={`w-4 h-4 ${addr.isDefault ? "text-white" : "text-gray-500"}`}
                            />
                          ) : (
                            <Home
                              className={`w-4 h-4 ${addr.isDefault ? "text-white" : "text-gray-500"}`}
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <span className="text-sm font-bold text-gray-800">
                              {addr.label}
                            </span>
                            {addr.isDefault && (
                              <span
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                                style={{ backgroundColor: BRAND }}
                              >
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-700 font-medium">
                            {[addr.street, addr.city, addr.state]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                          {addr.postal_code && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {addr.postal_code}
                            </p>
                          )}
                          <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Delivers to: {profile?.name || profile?.username}
                            {profile?.phone ? ` · ${profile.phone}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefault(addr._id)}
                            title="Set as default"
                            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setAddrModal({
                              open: true,
                              address: {
                                _id: addr._id,
                                label: addr.label,
                                street: addr.street,
                                city: addr.city,
                                state: addr.state,
                                country: addr.country,
                                postal_code: addr.postal_code,
                                isDefault: addr.isDefault,
                              },
                            })
                          }
                          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddr(addr._id)}
                          className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── NOTIFICATIONS TAB ── */}
        {tab === "notifications" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-5 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  Notification Preferences
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Control which notifications you receive
                </p>
              </div>
              {prefSaving && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Loader2 className="w-3 h-3 animate-spin" /> Saving…
                </div>
              )}
            </div>

            <div className="px-5 sm:px-6 divide-y divide-gray-50">
              <Toggle
                checked={prefs.orderUpdates}
                onChange={(v) => handlePrefChange("orderUpdates", v)}
                label="Order Updates"
                description="Status changes: confirmed, shipped, out for delivery, delivered"
              />
              <Toggle
                checked={prefs.paymentAlerts}
                onChange={(v) => handlePrefChange("paymentAlerts", v)}
                label="Payment Alerts"
                description="Confirmations, failures, and refund updates"
              />
              <Toggle
                checked={prefs.emailNotifications}
                onChange={(v) => handlePrefChange("emailNotifications", v)}
                label="Email Notifications"
                description="Order confirmations and updates sent to your email"
              />
            </div>

            <div className="px-5 sm:px-6 py-4">
              <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>Security alerts</strong> (password changes, new
                  logins) are always enabled and cannot be turned off.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <AddressModal
        open={addrModal.open}
        address={addrModal.address}
        onClose={() => setAddrModal({ open: false, address: null })}
        onSave={handleAddrSave}
      />
    </div>
  );
};

export default UserSettingsPage;
