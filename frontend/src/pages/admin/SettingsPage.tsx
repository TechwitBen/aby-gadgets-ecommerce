import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  settingsService,
  type SiteSettings,
  type DeliveryZone,
} from "@/services/settings.service";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Plus, Trash2, Pencil, Check, X } from "lucide-react";

// ── Reusable editable field ───────────────────────────────────────────────────
const Field = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      {label}
    </label>
    <input
      type={type}
      value={value}
      placeholder={placeholder ?? label}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
    />
  </div>
);

const TextArea = ({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
      {label}
    </label>
    <textarea
      value={value}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
    />
  </div>
);

// ── Delivery Zone row ─────────────────────────────────────────────────────────
const ZoneRow = ({
  zone,
  onFeeChange,
  onDelete,
}: {
  zone: DeliveryZone;
  onFeeChange: (fee: number) => void;
  onDelete: () => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(zone.fee));

  const commit = () => {
    const num = Number(draft.replace(/[^0-9]/g, ""));
    onFeeChange(isNaN(num) ? 0 : num);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-3 py-2 border-b border-border last:border-0">
      <span className="flex-1 text-sm text-foreground">{zone.city}</span>

      {editing ? (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">₦</span>
          <input
            autoFocus
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ""))}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setDraft(String(zone.fee));
                setEditing(false);
              }
            }}
            className="w-28 rounded-md border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={commit}
            className="text-green-600 hover:text-green-700 transition-colors"
          >
            <Check size={14} />
          </button>
          <button
            onClick={() => {
              setDraft(String(zone.fee));
              setEditing(false);
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground w-24 text-right">
            {zone.fee === 0 ? (
              <span className="text-muted-foreground italic">Not set</span>
            ) : (
              `₦${zone.fee.toLocaleString()}`
            )}
          </span>
          <button
            onClick={() => setEditing(true)}
            className="p-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <Pencil size={13} />
          </button>
        </div>
      )}

      <button
        onClick={onDelete}
        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const SettingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && user.role !== "admin") navigate("/admin", { replace: true });
  }, [user, navigate]);

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // New zone inputs
  const [newCity, setNewCity] = useState("");
  const [newFee, setNewFee] = useState("");

  useEffect(() => {
    if (user?.role !== "admin") return;
    settingsService
      .get()
      .then(setSettings)
      .catch(() =>
        toast({ variant: "destructive", title: "Failed to load settings." }),
      )
      .finally(() => setIsLoading(false));
  }, [user]);

  const update = <K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K],
  ) => setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));

  const updateZoneFee = (idx: number, fee: number) => {
    if (!settings) return;
    const zones = [...settings.deliveryZones];
    zones[idx] = { ...zones[idx], fee };
    update("deliveryZones", zones);
  };

  const deleteZone = (idx: number) => {
    if (!settings) return;
    update(
      "deliveryZones",
      settings.deliveryZones.filter((_, i) => i !== idx),
    );
  };

  const addZone = () => {
    if (!settings || !newCity.trim()) return;
    const fee = Number(newFee.replace(/[^0-9]/g, "")) || 0;
    update("deliveryZones", [
      ...settings.deliveryZones,
      { city: newCity.trim(), fee },
    ]);
    setNewCity("");
    setNewFee("");
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const saved = await settingsService.update(settings);
      setSettings(saved);
      toast({
        title: "Settings Saved",
        description: "Changes have been applied.",
      });
    } catch {
      toast({ variant: "destructive", title: "Failed to save settings." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings)
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <Button onClick={handleSave} disabled={isSaving} className="gap-1.5">
          {isSaving ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Save size={15} />
          )}
          {isSaving ? "Saving…" : "Save Settings"}
        </Button>
      </div>

      <div className="space-y-10">
        {/* ── Business Settings ─────────────────────────────────────────────── */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border">
            Business Settings
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Store Name"
              value={settings.storeName}
              onChange={(v) => update("storeName", v)}
            />
            <Field
              label="Business Email"
              value={settings.businessEmail}
              onChange={(v) => update("businessEmail", v)}
              type="email"
            />
            <Field
              label="Business Phone"
              value={settings.businessPhone}
              onChange={(v) => update("businessPhone", v)}
              type="tel"
            />
            <Field
              label="Currency"
              value={settings.currency}
              onChange={(v) => update("currency", v)}
            />
            <Field
              label="Operating City"
              value={settings.operatingCity}
              onChange={(v) => update("operatingCity", v)}
            />
          </div>
          <div className="mt-4">
            <TextArea
              label="Store Address"
              value={settings.storeAddress}
              onChange={(v) => update("storeAddress", v)}
            />
          </div>
        </section>

        {/* ── Payment Settings ──────────────────────────────────────────────── */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border">
            Payment Settings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Field
              label="Bank Name"
              value={settings.bankName}
              onChange={(v) => update("bankName", v)}
            />
            <Field
              label="Account Name"
              value={settings.accountName}
              onChange={(v) => update("accountName", v)}
            />
            <Field
              label="Account Number"
              value={settings.accountNumber}
              onChange={(v) => update("accountNumber", v)}
            />
          </div>

          <div className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Payment Methods
            </p>
            {(
              [
                ["Online Payment (Paystack)", "onlinePayment"],
                ["Pay On Delivery", "payOnDelivery"],
              ] as [string, keyof SiteSettings][]
            ).map(([label, key]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{label}</span>
                <Switch
                  checked={settings[key] as boolean}
                  onCheckedChange={(v) => update(key, v)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── Delivery Settings ─────────────────────────────────────────────── */}
        <section>
          <h2 className="text-base font-semibold text-foreground mb-4 pb-2 border-b border-border">
            Delivery & Pickup Settings
          </h2>

          {/* Toggles */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground font-medium">
                  Enable Pickup
                </p>
                <p className="text-xs text-muted-foreground">
                  Customers can collect from your store
                </p>
              </div>
              <Switch
                checked={settings.enablePickup}
                onCheckedChange={(v) => update("enablePickup", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground font-medium">
                  Enable Delivery
                </p>
                <p className="text-xs text-muted-foreground">
                  Customers can receive at their address
                </p>
              </div>
              <Switch
                checked={settings.enableDelivery}
                onCheckedChange={(v) => update("enableDelivery", v)}
              />
            </div>
          </div>

          {/* Pickup Info (shown to customer at checkout + track order) */}
          {settings.enablePickup && (
            <div className="bg-secondary/40 rounded-xl p-4 mb-6 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Pickup Info (shown to customer)
              </p>
              <TextArea
                label="Pickup Address"
                value={settings.pickupAddress}
                onChange={(v) => update("pickupAddress", v)}
                rows={2}
              />
              <Field
                label="Pickup Hours"
                value={settings.pickupHours}
                onChange={(v) => update("pickupHours", v)}
              />
              <TextArea
                label="Pickup Instructions"
                value={settings.pickupInstructions}
                onChange={(v) => update("pickupInstructions", v)}
                rows={2}
              />
            </div>
          )}

          {/* Delivery Zones Table */}
          {settings.enableDelivery && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Delivery Zones
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Set the delivery fee for each area. Set ₦0 to temporarily
                    disable a zone.
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {settings.deliveryZones.length} zones
                </span>
              </div>

              <div className="bg-card rounded-xl border border-border p-3 mb-4 max-h-96 overflow-y-auto">
                {settings.deliveryZones.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic text-center py-6">
                    No delivery zones yet. Add one below.
                  </p>
                ) : (
                  settings.deliveryZones.map((zone, idx) => (
                    <ZoneRow
                      key={`${zone.city}-${idx}`}
                      zone={zone}
                      onFeeChange={(fee) => updateZoneFee(idx, fee)}
                      onDelete={() => deleteZone(idx)}
                    />
                  ))
                )}
              </div>

              {/* Add new zone */}
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground block mb-1">
                    City / Area Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lekki Phase 1"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addZone();
                    }}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="w-32">
                  <label className="text-xs text-muted-foreground block mb-1">
                    Delivery Fee (₦)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2000"
                    value={newFee}
                    onChange={(e) =>
                      setNewFee(e.target.value.replace(/[^0-9]/g, ""))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addZone();
                    }}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addZone}
                  disabled={!newCity.trim()}
                  className="gap-1 mb-0.5"
                >
                  <Plus size={14} /> Add
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                💡 Tip: Click the pencil icon next to any zone to edit its fee.
                Changes only take effect after you hit{" "}
                <strong>Save Settings</strong>.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Footer save button */}
      <div className="mt-10 pt-6 border-t border-border flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="gap-1.5">
          {isSaving ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Save size={15} />
          )}
          {isSaving ? "Saving…" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;