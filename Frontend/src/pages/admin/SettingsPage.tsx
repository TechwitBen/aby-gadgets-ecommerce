import { useState } from "react";
import { SearchInput } from "@/components/ui/search-input";
import { Switch } from "@/components/ui/switch";

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    bankTransfer: true,
    payOnDelivery: false,
    card: true,
    enablePickup: true,
    enableDelivery: true,
  });

  const updateSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <SearchInput placeholder="Hinted search text" className="w-64" />
      </div>

      <div className="space-y-8">
        {/* Business Settings */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Business Settings</h2>
          <div className="space-y-4">
            <SettingRow label="Store Name" value="Aby Gadgets" />
            <SettingRow label="Business Email" value="Abygadgetsenterprise@gmail.com" />
            <SettingRow label="Business Phone number" value="09039122681" />
            <SettingRow label="Currency" value="Naira-(₦)" />
            <SettingRow label="Operating city" value="Lagos, Nigeria." />
            <SettingRow label="Store Address" value="9, Adepele Street, Merciful Plaza computer village ikeja." />
          </div>
        </section>

        {/* Payment Settings */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Payment Settings</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground">Bank Account Details</span>
              <div className="text-right space-y-1">
                <div className="flex justify-between gap-8">
                  <span className="text-muted-foreground">Bank name</span>
                  <span className="text-foreground">PalmPay</span>
                </div>
                <div className="flex justify-between gap-8">
                  <span className="text-muted-foreground">Account Name</span>
                  <span className="text-foreground">Egoh Abraham Inalegwu</span>
                </div>
                <div className="flex justify-between gap-8">
                  <span className="text-muted-foreground">Account Number</span>
                  <span className="text-foreground">33958873900</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-start">
              <span className="text-muted-foreground">Payment Permissions</span>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-8">
                  <span className="text-muted-foreground">Bank Transfer</span>
                  <Switch 
                    checked={settings.bankTransfer} 
                    onCheckedChange={() => updateSetting('bankTransfer')}
                  />
                </div>
                <div className="flex items-center justify-between gap-8">
                  <span className="text-muted-foreground">Pay on delivery</span>
                  <Switch 
                    checked={settings.payOnDelivery} 
                    onCheckedChange={() => updateSetting('payOnDelivery')}
                  />
                </div>
                <div className="flex items-center justify-between gap-8">
                  <span className="text-muted-foreground">Card</span>
                  <Switch 
                    checked={settings.card} 
                    onCheckedChange={() => updateSetting('card')}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Delivery Settings */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Delivery Settings</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Enable Pickup</span>
              <Switch 
                checked={settings.enablePickup} 
                onCheckedChange={() => updateSetting('enablePickup')}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Enable Delivery</span>
              <Switch 
                checked={settings.enableDelivery} 
                onCheckedChange={() => updateSetting('enableDelivery')}
              />
            </div>
            <SettingRow label="Delivery Fee" value="Free" />
            <SettingRow label="Cities enabled for pickup" value="Lagos" />
          </div>
        </section>
      </div>
    </div>
  );
};

const SettingRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-foreground text-right">{value}</span>
  </div>
);

export default SettingsPage;
