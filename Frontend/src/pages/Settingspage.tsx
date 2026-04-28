import { useState, useEffect } from "react";
import {
  User, Lock, MapPin, Bell, Eye, EyeOff,
  Plus, Trash2, Edit2, Check, Star, Loader2, AlertCircle,
  Home, Briefcase, Save,
} from "lucide-react";
import { userService, type UserProfile, type UserAddress } from "@/services/user.service";
import { useToast } from "@/hooks/use-toast";
import { Input }  from "@/components/ui/input";
import { Label }  from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// ── Nigerian states list ──────────────────────────────────────────────────────
const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara",
];

const ADDRESS_LABELS = ["Home", "Work", "School", "Other"];

type SettingsTab = "profile" | "security" | "addresses" | "notifications";

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS: { key: SettingsTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { key: "profile",       label: "Profile",          icon: User    },
  { key: "security",      label: "Security",          icon: Lock    },
  { key: "addresses",     label: "Address Book",      icon: MapPin  },
  { key: "notifications", label: "Notifications",     icon: Bell    },
];

// ── Toggle component ──────────────────────────────────────────────────────────
const Toggle = ({
  checked, onChange, label, description,
}: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) => (
  <div className="flex items-start justify-between gap-4 py-4">
    <div>
      <p className="text-sm font-semibold text-gray-800">{label}</p>
      {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
        checked ? "bg-[#6426E1]" : "bg-gray-200"
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
        checked ? "translate-x-5" : "translate-x-0"
      }`} />
    </button>
  </div>
);

// ── Address Form Modal ────────────────────────────────────────────────────────
const AddressModal = ({
  open, address, onClose, onSave,
}: {
  open: boolean;
  address: Partial<UserAddress> | null;
  onClose: () => void;
  onSave: (data: Partial<UserAddress>) => Promise<void>;
}) => {
  const [form, setForm] = useState<Partial<UserAddress>>({
    label: "Home", full_name: "", phone: "", street: "", city: "",
    state: "Lagos", country: "Nigeria", postal_code: "", isDefault: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (address) setForm(address);
    else setForm({ label: "Home", full_name: "", phone: "", street: "", city: "", state: "Lagos", country: "Nigeria", postal_code: "", isDefault: false });
  }, [address, open]);

  if (!open) return null;

  const set = (key: keyof UserAddress) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(form); onClose(); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{address?._id ? "Edit Address" : "Add New Address"}</h3>
        </div>
        <div className="px-5 py-4 space-y-4">
          {/* Label */}
          <div>
            <Label className="text-xs font-semibold text-gray-600 mb-2 block">Label</Label>
            <div className="flex gap-2 flex-wrap">
              {ADDRESS_LABELS.map((l) => (
                <button key={l} onClick={() => setForm((f) => ({ ...f, label: l }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    form.label === l ? "bg-[#6426E1] text-white border-[#6426E1]" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">Full Name</Label>
              <Input value={form.full_name ?? ""} onChange={set("full_name")} placeholder="John Doe" className="h-10 text-sm rounded-xl border-gray-200" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">Phone</Label>
              <Input value={form.phone ?? ""} onChange={set("phone")} placeholder="+234..." className="h-10 text-sm rounded-xl border-gray-200" type="tel" />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">Street Address</Label>
            <Input value={form.street ?? ""} onChange={set("street")} placeholder="123 Main Street, Lekki" className="h-10 text-sm rounded-xl border-gray-200" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">City</Label>
              <Input value={form.city ?? ""} onChange={set("city")} placeholder="Lagos" className="h-10 text-sm rounded-xl border-gray-200" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">State</Label>
              <select
                value={form.state ?? "Lagos"}
                onChange={set("state")}
                className="w-full h-10 text-sm border border-gray-200 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
              >
                {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Default toggle */}
          <label className="flex items-center gap-3 cursor-pointer py-2">
            <div onClick={() => setForm((f) => ({ ...f, isDefault: !f.isDefault }))}
              className={`w-11 h-6 rounded-full transition-colors ${form.isDefault ? "bg-[#6426E1]" : "bg-gray-200"}`}>
              <span className={`block mt-0.5 ml-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isDefault ? "translate-x-5" : ""}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">Set as default address</span>
          </label>
        </div>
        <div className="px-5 pb-5 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">Cancel</Button>
          <Button onClick={handleSave} disabled={saving}
            className="flex-1 rounded-xl bg-[#6426E1] hover:bg-purple-700">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1.5" /> Save Address</>}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const UserSettingsPage = () => {
  const { toast } = useToast();

  const [tab,     setTab]     = useState<SettingsTab>("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [name,  setName]  = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  // Password form
  const [currentPw,  setCurrentPw]  = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");
  const [showCurr,   setShowCurr]   = useState(false);
  const [showNew,    setShowNew]    = useState(false);
  const [pwSaving,   setPwSaving]   = useState(false);
  const [pwError,    setPwError]    = useState<string | null>(null);

  // Addresses
  const [addresses,     setAddresses]     = useState<UserAddress[]>([]);
  const [addrModal,     setAddrModal]     = useState<{ open: boolean; address: Partial<UserAddress> | null }>({ open: false, address: null });

  // Notification prefs
  const [prefs, setPrefs] = useState({ orderUpdates: true, emailNotifications: true, paymentAlerts: true });
  const [prefSaving, setPrefSaving] = useState(false);

  // Load on mount
  useEffect(() => {
    Promise.all([
      userService.getProfile(),
      userService.getNotificationPreferences(),
    ]).then(([prof, p]) => {
      setProfile(prof);
      setName(prof.name ?? prof.username ?? "");
      setPhone(prof.phone ?? "");
      setAddresses(prof.addresses ?? []);
      setPrefs(p);
    }).catch(() => {
      toast({ variant: "destructive", title: "Failed to load settings" });
    }).finally(() => setLoading(false));
  }, []);

  // ── Profile save ────────────────────────────────────────────────────────────
  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const updated = await userService.updateProfile({ name: name.trim(), phone: phone.trim() });
      setProfile(updated);
      toast({ title: "Profile updated ✓", description: "Your changes have been saved." });
    } catch {
      toast({ variant: "destructive", title: "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  // ── Password change ─────────────────────────────────────────────────────────
  const handlePasswordSave = async () => {
    setPwError(null);
    if (newPw !== confirmPw) { setPwError("Passwords do not match"); return; }
    if (newPw.length < 8)   { setPwError("Password must be at least 8 characters"); return; }
    setPwSaving(true);
    try {
      await userService.changePassword({ currentPassword: currentPw, newPassword: newPw });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      toast({ title: "Password changed ✓", description: "Your password has been updated securely." });
    } catch (err: any) {
      setPwError(err?.response?.data?.message ?? "Failed to change password");
    } finally {
      setPwSaving(false);
    }
  };

  // ── Address ops ─────────────────────────────────────────────────────────────
  const handleAddrSave = async (data: Partial<UserAddress>) => {
    try {
      let updated: UserAddress[];
      if (addrModal.address?._id) {
        updated = await userService.updateAddress(addrModal.address._id, data);
      } else {
        updated = await userService.addAddress(data as Omit<UserAddress, "_id">);
      }
      setAddresses(updated);
      toast({ title: addrModal.address?._id ? "Address updated ✓" : "Address added ✓" });
    } catch {
      toast({ variant: "destructive", title: "Failed to save address" });
    }
  };

  const handleDeleteAddr = async (id: string) => {
    try {
      const updated = await userService.deleteAddress(id);
      setAddresses(updated);
      toast({ title: "Address removed" });
    } catch {
      toast({ variant: "destructive", title: "Failed to remove address" });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const updated = await userService.setDefaultAddress(id);
      setAddresses(updated);
    } catch {
      toast({ variant: "destructive", title: "Failed to set default" });
    }
  };

  // ── Notification pref save ──────────────────────────────────────────────────
  const handlePrefChange = async (key: keyof typeof prefs, val: boolean) => {
    const next = { ...prefs, [key]: val };
    setPrefs(next);
    setPrefSaving(true);
    try {
      await userService.updateNotificationPreferences(next);
    } catch {
      setPrefs(prefs); // revert
      toast({ variant: "destructive", title: "Failed to update preferences" });
    } finally {
      setPrefSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#6426E1]" />
    </div>
  );

  const initials = profile?.name
    ? profile.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : (profile?.username ?? "U").substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #6426E1 0%, #4f1dbf 100%)" }}
      >
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />
        <div className="relative max-w-3xl mx-auto px-4 pt-8 pb-10">
          <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

          {/* Profile mini card */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                {profile?.profilePhoto
                  ? <img src={profile.profilePhoto} alt="" className="w-full h-full object-cover" />
                  : initials}
              </div>
            </div>
            <div>
              <p className="font-bold text-white text-lg">{profile?.name || profile?.username}</p>
              <p className="text-purple-200 text-xs">{profile?.email}</p>
              <span className="mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white capitalize">
                {profile?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm -mt-4">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex overflow-x-auto no-scrollbar">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                  tab === key
                    ? "border-[#6426E1] text-[#6426E1]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* ── PROFILE TAB ── */}
        {tab === "profile" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-5">
            <div>
              <h2 className="text-base font-bold text-gray-900">Personal Information</h2>
              <p className="text-xs text-gray-400 mt-0.5">Update your display name and contact details</p>
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
                  Username <span className="text-gray-300 font-normal">(read only)</span>
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
                  Email Address <span className="text-gray-300 font-normal">(read only)</span>
                </Label>
                <Input
                  value={profile?.email ?? ""}
                  readOnly
                  className="h-11 rounded-xl border-gray-200 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                onClick={handleProfileSave}
                disabled={saving}
                className="rounded-xl bg-[#6426E1] hover:bg-purple-700 px-6"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                Your updated name will be pre-filled at checkout automatically.
              </p>
            </div>
          </div>
        )}

        {/* ── SECURITY TAB ── */}
        {tab === "security" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-5">
            <div>
              <h2 className="text-base font-bold text-gray-900">Change Password</h2>
              <p className="text-xs text-gray-400 mt-0.5">Use a strong password with at least 8 characters</p>
            </div>

            {pwError && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {pwError}
              </div>
            )}

            <div className="space-y-4">
              {/* Current password */}
              <div>
                <Label className="text-xs font-semibold text-gray-600 block mb-1.5">Current Password</Label>
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
                    {showCurr ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <Label className="text-xs font-semibold text-gray-600 block mb-1.5">New Password</Label>
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
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength bar */}
                {newPw && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                          i < (newPw.length < 6 ? 1 : newPw.length < 8 ? 2 : newPw.length < 12 ? 3 : 4)
                            ? (newPw.length < 6 ? "bg-red-400" : newPw.length < 8 ? "bg-amber-400" : newPw.length < 12 ? "bg-blue-400" : "bg-emerald-400")
                            : "bg-gray-100"
                        }`} />
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400">
                      {newPw.length < 6 ? "Too weak" : newPw.length < 8 ? "Weak" : newPw.length < 12 ? "Good" : "Strong"} password
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <Label className="text-xs font-semibold text-gray-600 block mb-1.5">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Re-enter new password"
                    className={`h-11 rounded-xl text-sm pr-10 ${
                      confirmPw && confirmPw !== newPw ? "border-red-300" : "border-gray-200"
                    }`}
                  />
                  {confirmPw && confirmPw === newPw && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handlePasswordSave}
                disabled={pwSaving || !currentPw || !newPw || !confirmPw}
                className="rounded-xl bg-[#6426E1] hover:bg-purple-700 px-6"
              >
                {pwSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Changing…</> : <><Lock className="w-4 h-4 mr-2" />Change Password</>}
              </Button>
            </div>
          </div>
        )}

        {/* ── ADDRESSES TAB ── */}
        {tab === "addresses" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Address Book</h2>
                <p className="text-xs text-gray-400 mt-0.5">Manage your saved delivery addresses</p>
              </div>
              <Button
                onClick={() => setAddrModal({ open: true, address: null })}
                className="rounded-xl bg-[#6426E1] hover:bg-purple-700 text-sm"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Add Address
              </Button>
            </div>

            {addresses.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">No addresses saved</h3>
                <p className="text-xs text-gray-400 mb-5">Add your delivery addresses for faster checkout.</p>
                <Button onClick={() => setAddrModal({ open: true, address: null })}
                  className="rounded-xl bg-[#6426E1] hover:bg-purple-700" size="sm">
                  <Plus className="w-4 h-4 mr-1.5" /> Add First Address
                </Button>
              </div>
            ) : (
              <div className="grid gap-3">
                {addresses.map((addr) => (
                  <div key={addr._id}
                    className={`bg-white rounded-2xl border p-4 shadow-sm transition-all ${
                      addr.isDefault ? "border-purple-300 ring-1 ring-purple-200" : "border-gray-100"
                    }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          addr.isDefault ? "bg-purple-100" : "bg-gray-100"
                        }`}>
                          {addr.label === "Work"
                            ? <Briefcase className={`w-4 h-4 ${addr.isDefault ? "text-purple-600" : "text-gray-500"}`} />
                            : <Home className={`w-4 h-4 ${addr.isDefault ? "text-purple-600" : "text-gray-500"}`} />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-gray-800">{addr.label}</span>
                            {addr.isDefault && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5 font-medium">{addr.full_name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {[addr.street, addr.city, addr.state].filter(Boolean).join(", ")}
                          </p>
                          {addr.phone && <p className="text-xs text-gray-400">{addr.phone}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {!addr.isDefault && (
                          <button onClick={() => handleSetDefault(addr._id)}
                            title="Set as default"
                            className="w-8 h-8 rounded-lg hover:bg-purple-50 flex items-center justify-center text-gray-400 hover:text-purple-600 transition-colors">
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => setAddrModal({ open: true, address: addr })}
                          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteAddr(addr._id)}
                          className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <div className="mb-5">
              <h2 className="text-base font-bold text-gray-900">Notification Preferences</h2>
              <p className="text-xs text-gray-400 mt-0.5">Control which notifications you receive</p>
              {prefSaving && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-purple-600">
                  <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                </div>
              )}
            </div>

            <div className="divide-y divide-gray-100">
              <Toggle
                checked={prefs.orderUpdates}
                onChange={(v) => handlePrefChange("orderUpdates", v)}
                label="Order Updates"
                description="Get notified when your order status changes (confirmed, shipped, delivered, etc.)"
              />
              <Toggle
                checked={prefs.paymentAlerts}
                onChange={(v) => handlePrefChange("paymentAlerts", v)}
                label="Payment Alerts"
                description="Receive notifications for payment confirmations, failures, and refunds"
              />
              <Toggle
                checked={prefs.emailNotifications}
                onChange={(v) => handlePrefChange("emailNotifications", v)}
                label="Email Notifications"
                description="Receive order confirmation and update emails to your registered email address"
              />
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 bg-blue-50 rounded-xl px-4 py-3">
              <p className="text-xs text-blue-700 leading-relaxed">
                <strong>Note:</strong> Account notifications (password changes, new logins) are always enabled for your security and cannot be turned off.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Address Modal */}
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